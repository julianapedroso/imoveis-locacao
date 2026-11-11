import assert from 'node:assert';
import { parseCard } from './parse.js';
const t = (text) => parseCard({ href: 'https://x.com/imovel/a?q=1', text, img: null });

// Kenlo (Wanor): venda + aluguel
let r = t('Pedregulho - Guaratinguetá - SP\nCasa\n119.97 m²\n2 Quartos\n1 Banheiro\n1 Vaga\nVenda R$ 1.350.000\nAluguel R$ 1.500/mês');
assert.equal(r.price, 1500); assert.equal(r.quartos, '2'); assert.equal(r.area, '119.97'); assert.equal(r.vagas, '1');
assert.equal(t('Centro - Guaratinguetá - SP\n1 Quarto\nAluguel R$ 950/mês').price, 950);
// Vale Mais (Loft): venda e aluguel colados
r = t('Vila Paraíba, Guaratinguetá - SP\nR$ 2.200.000,00R$ 10.000,00 / mês\n3 Dormitórios');
assert.equal(r.price, 10000); assert.equal(r.quartos, '3');
assert.equal(t('Campinho\nR$ 1.400,00 / mês').price, 1400);
assert.equal(t('sem preço'), null);

// IPTU / condomínio NÃO podem virar o preço (problema do Domos)
r = t('Casa Centro\nAluguel R$ 1.200\nCondomínio R$ 100\nIPTU R$ 50');
assert.equal(r.price, 1200); assert.equal(r.condominio, 100); assert.equal(r.iptu, 50);
r = t('Casa Centro\nIPTU R$ 80\nR$ 1.500');            assert.equal(r.price, 1500);
r = t('Casa Centro\nR$ 1.500\nIPTU R$ 80');            assert.equal(r.price, 1500);
// Se houver "valor total", ele tem prioridade
r = t('Casa\nAluguel R$ 1.200\nIPTU R$ 50\nValor total R$ 1.350'); assert.equal(r.price, 1350);
r = t('Casa\nTotal R$ 1.350\nAluguel R$ 1.200');         assert.equal(r.price, 1350);
console.log('parse OK');
