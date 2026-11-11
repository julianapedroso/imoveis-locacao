// Configuração geral e lista de sites. Para adicionar uma imobiliária, é só incluir um item aqui.
export const MAX_PRICE = 1800;

// linkPattern: regex (texto) que identifica o link da página de DETALHE de um imóvel.
// requireCity: true quando a busca do site não filtra a cidade com confiança (o filtro é refeito aqui).
const DEFAULT_PATTERN = '/(imovel|imoveis|locacao|aluguel)/[^?#]+';

export const SITES = [
  { name: 'Wanor França', requireCity: true, linkPattern: '/imovel/',
    url: 'https://www.wanorimoveis.com.br/imoveis/para-alugar/casa?preco-de-locacao=0~1800&ordenar=menor-valor' },
  { name: 'Imobiliária 3A', requireCity: true, linkPattern: '/imovel/',
    url: 'https://www.imobiliaria3a.com/imoveis/para-alugar/casa?preco-de-locacao=0~1800&ordenar=menor-valor' },
  { name: 'Vale Mais', requireCity: true, linkPattern: '/imovel/',
    url: 'https://valemaisimoveis.com.br/busca?finalidade=Aluguel&cidade=Guaratinguet%C3%A1&order=menor-preco&tipo=Casa' },
  { name: 'Ferri Loriggio', requireCity: true,
    url: 'https://ferriloriggio.com.br/locacao?tipo%5B%5D=Casa&cidade=Guaratingueta&ordenar=menor_valor' },
  { name: 'Oliveira Alves', requireCity: true,
    url: 'https://imobiliariaoliveiraalves.com/imoveis-para-locacao.php?cidade=GUARATINGUETA&tipo%5B0%5D=CASA&valor_maximo=1800' },
  { name: 'Rony', requireCity: true,
    url: 'https://www.rony.com.br/aluguel/casa--casa/guaratingueta/todos-os-bairros/0-quartos/0-suite-ou-mais/0-vaga-ou-mais/0-banheiro-ou-mais/sem-portaria-24horas/sem-area-lazer/sem-dce/sem-mobilia/sem-area-privativa/sem-area-servico/sem-box-despejo/sem-circuito-tv/?valorminimo=0&valormaximo=1.800,00&pagina=1' },
  { name: 'Domos', requireCity: true,
    url: 'https://www.imobiliariadomos.com.br/imoveis/para-alugar/casa/sao-paulo-guaratingueta-sp?precolocacao=0--1800&muncep_id=3838&search_name=Guaratinguet%C3%A1&localidade=SP&order=menor_preco' },
].map(s => ({ linkPattern: DEFAULT_PATTERN, ...s }));
