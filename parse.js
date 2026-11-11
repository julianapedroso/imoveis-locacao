// Transforma o texto bruto de um "card" de imóvel em dados estruturados.
const brl = (s) => Number(s.replace(/\./g, '').replace(',', '.'));
const num = (re, t) => { const m = t.match(re); return m ? m[1] : null; };

// Descobre a que se refere um valor olhando o texto que vem logo ANTES dele ("IPTU R$ 50", "Aluguel R$ 1.200"...).
function classify(label) {
  if (/total|pacote/i.test(label)) return 'total';
  if (/iptu/i.test(label)) return 'iptu';
  if (/condom[ií]nio|cond\./i.test(label)) return 'cond';
  if (/taxa|seguro|inc[eê]ndio/i.test(label)) return 'taxa';
  if (/venda|compra/i.test(label)) return 'venda';
  if (/aluguel|loca[cç][aã]o/i.test(label)) return 'aluguel';
  return 'outro';
}

export function parseCard({ href, text, img }) {
  const clean = text.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ');
  const found = [...clean.matchAll(/R\$\s*([\d.]+(?:,\d{2})?)/g)];
  if (!found.length) return null;

  let prevEnd = 0;
  const prices = found.map((m) => {
    const idx = m.index, end = idx + m[0].length;
    const kind = classify(clean.slice(Math.max(prevEnd, idx - 22), idx));
    prevEnd = end;
    return { v: brl(m[1]), idx, end, kind };
  });

  // Candidatos ao valor mensal: tudo que NÃO é IPTU, condomínio, taxa ou venda.
  const cand = prices.filter((p) => !['iptu', 'cond', 'taxa', 'venda'].includes(p.kind));
  const pool = cand.length ? cand : prices;
  const rent =
    pool.find((p) => p.kind === 'total') ||                                              // valor total, se houver
    pool.find((p) => /^\s*\/\s*m[eê]s/i.test(clean.slice(p.end, p.end + 12))) ||        // "…/mês"
    pool.find((p) => p.kind === 'aluguel') ||
    pool.reduce((a, b) => (b.v > a.v ? b : a));                                          // sem rótulo: o maior

  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    id: href.split('?')[0].replace(/\/$/, ''),
    url: href,
    price: rent.v,
    condominio: prices.find((p) => p.kind === 'cond')?.v || null,
    iptu: prices.find((p) => p.kind === 'iptu')?.v || null,
    title: lines[0] || 'Imóvel',
    quartos: num(/(\d+)\s*(?:quartos?|dormit[óo]rios?)/i, clean),
    suites: num(/(\d+)\s*su[ií]tes?/i, clean),
    banheiros: num(/(\d+)\s*banheiros?/i, clean),
    vagas: num(/(\d+)\s*vagas?/i, clean),
    area: num(/(\d+(?:[.,]\d+)?)\s*m²/i, clean),
    img,
    text: clean,
  };
}
