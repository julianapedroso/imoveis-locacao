import { chromium } from 'playwright';
import fs from 'node:fs';
import { SITES, MAX_PRICE } from './sites.js';
import { parseCard } from './parse.js';
import { caption, send, sendListing } from './notify.js';

const STATE_FILE = 'seen.json';
const MAX_SEND = 30;
const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
state.seen ||= {}; state.counts ||= {};

// ---------- roda DENTRO do navegador ----------
function extractCards(patternSrc) {
  const re = new RegExp(patternSrc, 'i');
  const key = (x) => x.href.split('#')[0];
  const isDetail = (x) => { try { return re.test(new URL(x.href, location.href).pathname); } catch { return false; } };
  const out = new Map();
  for (const a of [...document.querySelectorAll('a[href]')].filter(isDetail)) {
    if (out.has(key(a))) continue;
    let el = a, card = null;
    for (let i = 0; i < 8 && el && el !== document.body; i++) {
      if (el !== a) {
        const distinct = new Set([...el.querySelectorAll('a[href]')].filter(isDetail).map(key));
        if (distinct.size > 1) break;
      }
      if (el.querySelector('img') && /R\$/.test(el.innerText || '')) { card = el; break; }
      el = el.parentElement;
    }
    if (!card) continue;
    const srcs = [...card.querySelectorAll('img')].flatMap((im) => [im.currentSrc, im.getAttribute('data-src'),
      im.getAttribute('data-lazy-src'), (im.getAttribute('srcset') || '').split(' ')[0], im.src]).filter((s) => s && !s.startsWith('data:'));
    out.set(key(a), { href: key(a), text: card.innerText || '', img: srcs[0] || null });
  }
  return [...out.values()];
}

function extractGallery() {
  const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
  const urls = [];
  const og = document.querySelector('meta[property="og:image"]')?.content;
  if (og) urls.push(og);
  for (const im of document.images) {
    const last = (im.getAttribute('srcset') || '').split(',').pop().trim().split(' ')[0];   // maior variante do srcset
    const src = [last, im.currentSrc, im.getAttribute('data-src'), im.src].find((s) => s && !s.startsWith('data:'));
    const w = im.naturalWidth || im.width || 0;
    if (!src || /logo|icon|sprite|avatar|whatsapp|selo|banner|favicon/i.test(src + ' ' + (im.alt || ''))) continue;
    if (w && w < 250) continue;
    urls.push(src);
  }
  const desc = (document.querySelector('meta[property="og:description"]')?.content ||
                document.querySelector('meta[name="description"]')?.content || '').trim();
  return { urls: [...new Set(urls.map(abs).filter(Boolean))], desc };
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
    window.scrollTo(0, 0);
  });
}

// ---------- fotos: baixa com o navegador (cookies + referer) para não depender de link externo ----------
async function download(ctx, url, referer) {
  try {
    const r = await ctx.request.get(url, { headers: { Referer: referer }, timeout: 20000 });
    if (!r.ok()) return null;
    const type = (r.headers()['content-type'] || '').split(';')[0];
    if (!type.startsWith('image/')) return null;
    const body = await r.body();
    return body.length > 3000 && body.length < 9e6 ? { body, type } : null;
  } catch { return null; }
}

async function enrich(ctx, it) {
  let urls = [], desc = '';
  const page = await ctx.newPage();
  try {
    await page.goto(it.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);
    await autoScroll(page);
    ({ urls, desc } = await page.evaluate(extractGallery));
  } catch (e) { console.error(`  detalhe falhou (${it.url}): ${e.message.split('\n')[0]}`); }
  finally { await page.close(); }
  if (!urls.length && it.img) urls = [it.img];
  const imgs = [];
  for (const u of urls) {
    if (imgs.length >= 4) break;
    const im = await download(ctx, u, it.url);
    if (im) imgs.push(im);
  }
  if (!imgs.length) console.error(`  sem fotos utilizáveis: ${it.url} (candidatas: ${urls.length})`);
  return { imgs, desc };
}

// ---------- fluxo principal ----------
const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'pt-BR', userAgent:
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' });
const novos = [], avisos = [];

for (const site of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);
    await autoScroll(page);
    const raw = await page.evaluate(extractCards, site.linkPattern);
    if (process.env.DEBUG_TEXT) raw.slice(0, 3).forEach((r) => console.log(`--- ${site.name} ---\n${r.text}\n`));
    let items = raw.map(parseCard).filter(Boolean).filter((i) => i.price <= MAX_PRICE);
    if (site.requireCity) items = items.filter((i) => /guaratinguet/i.test(i.text));

    console.log(`${site.name}: ${raw.length} cards, ${items.length} dentro dos filtros`);
    if (raw.length === 0) {
      fs.mkdirSync('debug', { recursive: true });
      fs.writeFileSync(`debug/${site.name.replace(/\W+/g, '_')}.html`, await page.content());
      if ((state.counts[site.name] || 0) > 0) avisos.push(`⚠️ O coletor "${site.name}" não encontrou nada hoje (o site pode ter mudado).`);
    }
    state.counts[site.name] = raw.length;

    for (const it of items) {
      const prev = state.seen[it.id];
      if (!prev) novos.push({ it, site: site.name });
      else if (prev.price !== it.price) novos.push({ it, site: site.name, oldPrice: prev.price });
      state.seen[it.id] = { price: it.price, title: it.title, site: site.name, firstSeen: prev?.firstSeen || new Date().toISOString() };
    }
  } catch (e) {
    console.error(`${site.name}: erro -> ${e.message}`);
    avisos.push(`⚠️ Erro ao consultar "${site.name}": ${e.message.split('\n')[0]}`);
  } finally { await page.close(); }
}

if (novos.length) await send(`🏡 <b>${novos.length} imóvel(is) novo(s) ou com preço alterado</b> em Guaratinguetá (até R$ ${MAX_PRICE.toLocaleString('pt-BR')})`);
for (const n of novos.slice(0, MAX_SEND)) {
  const { imgs, desc } = await enrich(ctx, n.it);
  await sendListing(caption(n.it, n.site, n.oldPrice, desc), imgs, n.it.url);
}
if (novos.length > MAX_SEND) await send(`… e mais ${novos.length - MAX_SEND} imóveis. Eles aparecem completos amanhã se você apagar o limite no código.`);
for (const a of avisos) await send(a);

if (!novos.length) await send('😴 Nada novo hoje...');

await browser.close();
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
