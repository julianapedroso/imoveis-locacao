const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const money = (v) => 'R$ ' + v.toLocaleString('pt-BR');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

export function caption(it, site, oldPrice, desc) {
  const dados = [
    it.quartos && `🛏 ${it.quartos} quarto(s)`,
    it.suites && `suíte: ${it.suites}`,
    it.banheiros && `🚿 ${it.banheiros}`,
    it.vagas && `🚗 ${it.vagas} vaga(s)`,
    it.area && `📐 ${it.area} m²`,
  ].filter(Boolean).join(' · ');
  const extras = [it.condominio && `cond. ${money(it.condominio)}`, it.iptu && `IPTU ${money(it.iptu)}`].filter(Boolean).join(' · ');
  const preco = oldPrice
    ? `🔻 <b>${money(it.price)}/mês</b> (antes ${money(oldPrice)})`
    : `💰 <b>${money(it.price)}/mês</b>`;
  const d = desc && desc.length > 40 ? `📝 ${esc(desc.replace(/\s+/g, ' ').slice(0, 230))}${desc.length > 230 ? '…' : ''}` : '';
  return [
    `${oldPrice ? '📉 PREÇO ALTERADO' : '🆕 NOVO'} · ${esc(site)}`,
    `🏠 ${esc(it.title)}`, preco, extras && `   (${extras})`, dados, d, `🔗 ${it.url}`,
  ].filter(Boolean).join('\n').slice(0, 1024);
}

const cfg = () => ({ token: process.env.TELEGRAM_TOKEN, chat: process.env.TELEGRAM_CHAT_ID });
const call = (token, method, body) => fetch(`https://api.telegram.org/bot${token}/${method}`, {
  method: 'POST', ...(body instanceof FormData ? { body } : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
}).then((r) => r.json()).catch((e) => ({ ok: false, description: e.message }));

// Mensagem de texto simples (resumo e avisos).
export async function send(text) {
  const { token, chat } = cfg();
  if (!token || !chat) return console.log('\n' + text.replace(/<[^>]+>/g, ''));
  const r = await call(token, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML' });
  if (!r.ok) console.error('Falha no Telegram:', r.description);
  await sleep(1100);
}

// Anúncio com fotos. As fotos são ENVIADAS como arquivo (baixadas pelo navegador),
// então funcionam mesmo quando o site bloqueia acesso externo às imagens.
// imgs = [{ body: Buffer, type: 'image/jpeg' }]
export async function sendListing(text, imgs, url) {
  const { token, chat } = cfg();
  if (!token || !chat) return console.log('\n' + text.replace(/<[^>]+>/g, '') + `\n[${imgs.length} foto(s) baixada(s)]`);
  imgs = imgs.slice(0, 4);
  const blob = (im, i) => [new Blob([im.body], { type: im.type }), `foto${i}.${EXT[im.type] || 'jpg'}`];
  let res = { ok: false };

  if (imgs.length >= 2) {
    const f = new FormData();
    f.append('chat_id', chat);
    f.append('media', JSON.stringify(imgs.map((_, i) => ({ type: 'photo', media: `attach://p${i}`, ...(i === 0 ? { caption: text, parse_mode: 'HTML' } : {}) }))));
    imgs.forEach((im, i) => f.append(`p${i}`, ...blob(im, i)));
    res = await call(token, 'sendMediaGroup', f);
  } else if (imgs.length === 1) {
    const f = new FormData();
    f.append('chat_id', chat); f.append('caption', text); f.append('parse_mode', 'HTML');
    f.append('reply_markup', JSON.stringify({ inline_keyboard: [[{ text: '🔗 Abrir anúncio', url }]] }));
    f.append('photo', ...blob(imgs[0], 0));
    res = await call(token, 'sendPhoto', f);
  }
  if (!res.ok) {                                   // sem foto: manda texto com pré-visualização do link
    if (imgs.length) console.error('Foto não aceita pelo Telegram:', res.description);
    res = await call(token, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML' });
    if (!res.ok) console.error('Falha no Telegram:', res.description);
  }
  await sleep(1500);
}
