// Kit de movimento — elenco diverso: personagens prontos de várias idades, gêneros, tons de pele, cabelos e corpos.
// Cada um é uma configuração do personagem articulado (kit/pecas/base.js), então anda, atua e reage como ele.
//
// uso: pessoa(p, "idosaGrisalha", { pose: atuar(L, roteiro), virado: -1, t })
//      escolherElenco({ n: 5, idade: "adulto", semente: 3 }) → ids variados para compor uma cena com gente diferente
// Veja todos na aba Personagens de npm run kit, ou liste com npm run pecas -- --elenco.
// É referência: misture as opções à vontade (personagem(p, { ...PERSONAGENS.x.opcoes, chapeu: "bone" })).
import { personagem, CHAPEUS, ROSTOS, TRAJES } from "./pecas/base.js";
import { cadeirante } from "./pecas/pessoas.js";
import { personagem3d } from "./3d.js";
import { CICLOS, pose as resolverPose, rng } from "./movimento.js";
import { misturarCor } from "./pinceis.js";
import { arcoP, circP } from "./pecas/_comum.js";

/* ---------------------------------------------------------------- acessórios que o elenco acrescenta */
const L = { prof: 0, liso: true };
/** Hijab: lenço que cobre cabelo e pescoço e deixa o rosto à mostra. */
function hijab(p, r, cor) {
  p.forma([...arcoP(0, -r * .02, r * 1.2, 292, 112, 18), [r * .1, r * 1.55], [r * .55, r * 1.12], [r * .14, r * .78], [r * .02, r * .1], [r * .08, -r * .62]], cor, { prof: 1 });
  p.linha(arcoP(0, -r * .02, r * 1.02, 300, 200, 8), misturarCor(p.cor(cor).startsWith("#") ? p.cor(cor) : "#888888", "#000000", .18), Math.max(3, r * .08));
}
hijab.cobre = true;
/** Turbante: faixas enroladas no alto da cabeça. */
function turbante(p, r, cor) {
  p.forma([...arcoP(-r * .05, -r * .2, r * 1.14, 170, 370, 16), [r * .9, -r * .1], [-r * 1.05, -r * .02]], cor, { prof: 1 });
  for (const [a0, a1, y] of [[195, 345, -.42], [200, 330, -.78]]) p.linha(arcoP(-r * .05, -r * .2 + y * r * .2, r * .98, a0, a1, 8), "tinta", Math.max(2, r * .06));
  p.circulo(r * .55, -r * .78, r * .16, "c2", L);
}
turbante.cobre = true;
/** Sardas no nariz e nas bochechas. */
function sardas(p, r) { for (const [x, y] of [[.12, .2], [.24, .26], [.36, .2], [.62, .22], [.74, .28], [.86, .2]]) p.circulo(x * r, y * r, Math.max(2.4, r * .045), "#B5652E", L); }
/** Rugas nos olhos e marcas de expressão. */
function rugas(p, r) { const w = Math.max(2, r * .045); p.linha([[-r * .02, -r * .08], [-r * .12, -r * .16]], "tinta", w); p.linha([[-r * .02, r * .06], [-r * .12, r * .12]], "tinta", w); p.linha(arcoP(r * .46, r * .3, r * .32, 110, 160, 5), "tinta", w); }
/** Brincos de argola. */
function brincos(p, r, { t = 0 } = {}) { const b = Math.sin(t * 3) * r * .03; p.linha(circP(-r * .08 + b, r * .42, r * .13, 12), "c2", Math.max(3, r * .07), { fechar: true }); }
/** Barriga de gestante na frente do tronco. */
function gestante(p, e, H) { const m = [(e.ombro[0] + e.quadril[0]) / 2 + H * .06, e.quadril[1] - H * .1]; p.elipse(m[0], m[1], H * .085, H * .095, "c1", { prof: 1 }); }
Object.assign(CHAPEUS, { hijab, turbante });
Object.assign(ROSTOS, { sardas, rugas, brincos });
Object.assign(TRAJES, { gestante });

/* ---------------------------------------------------------------- cabelo, idade */
/** Cores de cabelo naturais, ajustadas para aparecer sobre fundos escuros. */
export const CABELOS = {
  preto: ["#2A211D", "#5B5463"], castanho: ["#6B4528", "#9A6A44"], loiro: ["#D8B46A", "#E2C27E"], ruivo: ["#B5532C", "#C8673E"],
  grisalho: ["#9C9993", "#B5B2AC"], branco: ["#E4E1DA", "#E4E1DA"], azul: ["c1", "c1"], rosa: ["c2", "c2"], verde: ["c3", "c3"],
};
const corCabelo = (p, nome) => (CABELOS[nome] || [nome, nome])[p.fundoEscuro ? 1 : 0];
/** Altura e tamanho da cabeça de cada faixa de idade (o adulto tem altura 300). */
export const IDADES = { crianca: { altura: 190, cabecao: 1.7 }, adolescente: { altura: 252, cabecao: 1.45 }, adulto: { altura: 300, cabecao: 1.3 }, idoso: { altura: 288, cabecao: 1.3 } };

/* ---------------------------------------------------------------- o elenco */
const P = (nome, idade, genero, pele, cabelo, opcoes = {}, extra = {}) => ({ nome, idade, genero, pele: "pele" + pele, cabelo, opcoes, ...extra });
/** Personagens prontos. idade: crianca, adolescente, adulto, idoso · genero: feminino, masculino, neutro ·
    opcoes: as do personagem · bengala, cadeira (cadeira de rodas), curvado. */
export const PERSONAGENS = {
  // crianças
  meninaCacheada: P("Menina de cabelo cacheado e vestido", "crianca", "feminino", 5, "preto", { penteado: "cacheado", roupa: "c2", calca: "c2", noTronco: "vestido" }),
  meninoBone: P("Menino de boné", "crianca", "masculino", 1, "castanho", { chapeu: "bone", corChapeu: "c1", roupa: "c3", calca: "c4" }),
  meninaTrancas: P("Menina de tranças e saia", "crianca", "feminino", 3, "preto", { penteado: "trancas", roupa: "c4", calca: "c1", noTronco: "saia" }),
  meninoSardas: P("Menino ruivo de óculos e sardas", "crianca", "masculino", 4, "ruivo", { roupa: "c1", calca: "c3", rosto: ["oculos", "sardas"] }),
  meninaFranja: P("Menina de franja", "crianca", "feminino", 0, "preto", { penteado: "franja", roupa: "c3", calca: "c2" }),
  meninoAfro: P("Menino de black power", "crianca", "masculino", 3, "preto", { penteado: "afro", roupa: "c2", calca: "c1" }),
  meninaRabo: P("Menina de rabo de cavalo", "crianca", "feminino", 2, "castanho", { penteado: "rabo", roupa: "c1", calca: "c4" }),
  criancaCadeirante: P("Criança em cadeira de rodas", "crianca", "neutro", 2, "castanho", { penteado: "curto", roupa: "c3", calca: "c4" }, { cadeira: true }),
  // adolescentes
  garotaFones: P("Garota de cabelo comprido com fones", "adolescente", "feminino", 2, "preto", { penteado: "longo", chapeu: "fones", corChapeu: "c1", roupa: "c4", calca: "tinta" }),
  garotoMoicano: P("Garoto loiro de moicano", "adolescente", "masculino", 4, "loiro", { penteado: "moicano", roupa: "tinta", calca: "c1" }),
  garotoMochila: P("Garoto de mochila", "adolescente", "masculino", 5, "preto", { roupa: "c2", calca: "c4", nasCostas: "mochila" }),
  garotoTopete: P("Garoto de topete", "adolescente", "masculino", 0, "preto", { penteado: "topete", roupa: "c3", calca: "tinta" }),
  garotaHijab: P("Garota de hijab", "adolescente", "feminino", 1, "preto", { chapeu: "hijab", corChapeu: "c3", roupa: "c1", calca: "c4" }),
  garotaOculos: P("Garota de cabelo cacheado e óculos", "adolescente", "feminino", 3, "castanho", { penteado: "cacheado", rosto: "oculos", roupa: "c2", calca: "c3" }),
  jovemNaoBinarie: P("Jovem não binárie de cabelo colorido", "adolescente", "neutro", 4, "rosa", { penteado: "chanel", roupa: "c3", calca: "tinta", rosto: "brincos" }),
  garotaTrancas: P("Garota de tranças com brincos", "adolescente", "feminino", 5, "preto", { penteado: "trancas", roupa: "c1", calca: "c3", rosto: "brincos" }),
  // adultos
  mulherAfro: P("Mulher negra de black power", "adulto", "feminino", 5, "preto", { penteado: "afro", roupa: "c1", calca: "tinta", rosto: "brincos" }),
  homemBarba: P("Homem de barba", "adulto", "masculino", 2, "preto", { roupa: "c3", calca: "c4", rosto: "barba" }),
  mulherHijab: P("Mulher de hijab e saia", "adulto", "feminino", 1, "preto", { chapeu: "hijab", corChapeu: "c4", roupa: "c1", calca: "c1", noTronco: "saia" }),
  homemTurbante: P("Homem de turbante e barba", "adulto", "masculino", 2, "preto", { chapeu: "turbante", corChapeu: "c2", roupa: "claro", calca: "c4", rosto: "barba" }),
  mulherChanel: P("Mulher de cabelo chanel", "adulto", "feminino", 0, "preto", { penteado: "chanel", roupa: "c4", calca: "tinta" }),
  homemCareca: P("Homem careca de cavanhaque", "adulto", "masculino", 3, "preto", { penteado: "careca", roupa: "c2", calca: "tinta", rosto: "cavanhaque" }),
  mulherRuiva: P("Mulher ruiva de sardas", "adulto", "feminino", 4, "ruivo", { penteado: "longo", roupa: "c3", calca: "c4", rosto: "sardas" }),
  homemRabo: P("Homem de rabo de cavalo", "adulto", "masculino", 1, "castanho", { penteado: "rabo", roupa: "c4", calca: "c3", rosto: "bigode" }),
  mulherTrancas: P("Mulher de tranças", "adulto", "feminino", 3, "preto", { penteado: "trancas", roupa: "c2", calca: "c1" }),
  homemCabeloLongo: P("Homem de cabelo comprido", "adulto", "masculino", 2, "preto", { penteado: "longo", roupa: "c1", calca: "c4" }),
  mulherCadeirante: P("Mulher em cadeira de rodas", "adulto", "feminino", 2, "castanho", { penteado: "chanel", roupa: "c1", calca: "c4" }, { cadeira: true }),
  homemGravata: P("Homem loiro de óculos e gravata", "adulto", "masculino", 4, "loiro", { penteado: "topete", roupa: "claro", calca: "tinta", rosto: "oculos", noTronco: "gravata" }),
  mulherGestante: P("Mulher grávida", "adulto", "feminino", 0, "castanho", { penteado: "coque", roupa: "c1", calca: "c4", noTronco: "gestante" }),
  pessoaNaoBinaria: P("Pessoa não binária de moicano verde", "adulto", "neutro", 1, "verde", { penteado: "moicano", roupa: "tinta", calca: "c2", rosto: "brincos" }),
  homemAfro: P("Homem negro de black power e bigode", "adulto", "masculino", 5, "preto", { penteado: "afro", roupa: "c4", calca: "tinta", rosto: "bigode" }),
  mulherCoque: P("Mulher de coque e óculos", "adulto", "feminino", 2, "preto", { penteado: "coque", roupa: "c3", calca: "tinta", rosto: "oculos" }),
  criadoraConteudo: P("Criadora de conteúdo com fones e brincos", "adulto", "feminino", 3, "castanho", { penteado: "rabo", chapeu: "fones", corChapeu: "c2", roupa: "c1", calca: "tinta", rosto: "brincos" }),
  podcaster: P("Podcaster de barba e fones", "adulto", "masculino", 1, "preto", { chapeu: "fones", corChapeu: "c1", roupa: "c4", calca: "tinta", rosto: "barba" }),
  desenvolvedor: P("Desenvolvedor de óculos e moletom", "adulto", "masculino", 0, "castanho", { penteado: "topete", roupa: "c3", calca: "tinta", rosto: "oculos" }),
  entregador: P("Entregador de capacete e mochila", "adulto", "masculino", 4, "preto", { chapeu: "capacete", corChapeu: "c2", roupa: "c1", calca: "c4", nasCostas: "mochila" }),
  apresentadora: P("Apresentadora executiva de blazer", "adulto", "feminino", 5, "preto", { penteado: "chanel", roupa: "c4", calca: "tinta", noTronco: "terno", rosto: "brincos" }),
  roboAssistente: P("Robô assistente de IA", "adulto", "neutro", 0, "azul", { roupa: "c1", calca: "c4" }, { robo: true }),
  // idosos
  idosaGrisalha: P("Senhora grisalha de óculos e bengala", "idoso", "feminino", 4, "grisalho", { penteado: "coque", roupa: "c2", calca: "c4", rosto: ["oculos", "rugas"], noTronco: "saia" }, { bengala: true, curvado: true }),
  idosoBengala: P("Senhor calvo de bigode e bengala", "idoso", "masculino", 3, "branco", { penteado: "calvo", roupa: "c4", calca: "tinta", rosto: ["bigode", "rugas"] }, { bengala: true, curvado: true }),
  idosaNegra: P("Senhora negra de cabelo branco cacheado", "idoso", "feminino", 5, "branco", { penteado: "cacheado", roupa: "c1", calca: "c3", rosto: ["brincos", "rugas"] }),
  idosoBoina: P("Senhor de boina e barba grisalha", "idoso", "masculino", 1, "grisalho", { chapeu: "boina", corChapeu: "c3", roupa: "c2", calca: "c4", rosto: ["barba", "rugas"] }, { curvado: true }),
  idosaLenco: P("Senhora de lenço", "idoso", "feminino", 2, "grisalho", { chapeu: "hijab", corChapeu: "c2", roupa: "c4", calca: "c4", rosto: "rugas", noTronco: "saia" }, { bengala: true }),
  idosoOculos: P("Senhor careca de óculos", "idoso", "masculino", 0, "branco", { penteado: "careca", roupa: "c3", calca: "tinta", rosto: ["oculos", "rugas"] }),
  idosaCadeirante: P("Senhora em cadeira de rodas", "idoso", "feminino", 4, "branco", { penteado: "chanel", roupa: "c2", calca: "c4", rosto: ["oculos", "rugas"] }, { cadeira: true }),
  idosoChapeu: P("Senhor de chapéu de palha", "idoso", "masculino", 2, "grisalho", { chapeu: "chapeuPalha", corChapeu: "c2", roupa: "claro", calca: "c4", rosto: ["bigode", "rugas"] }, { bengala: true, curvado: true }),
};
/** Faixas e gêneros, para filtrar. */
export const FAIXAS = ["crianca", "adolescente", "adulto", "idoso"], GENEROS = ["feminino", "masculino", "neutro"];

/** Desenha um personagem do elenco. Opções: pose, virado, t, semente, escala (multiplica a altura da idade), modo3d,
    e qualquer opção do personagem para sobrescrever (roupa, expressao, naMao...). Devolve o esqueleto. */
export function pessoa(p, id, { pose, virado = 1, t = 0, semente = 0, escala = 1, modo3d = false, ...resto } = {}) {
  const x = PERSONAGENS[id]; if (!x) throw new Error(`personagem "${id}" não existe. Opções: ${Object.keys(PERSONAGENS).join(", ")}`);
  const { altura, cabecao } = IDADES[x.idade], o = { cabecao, pele: x.pele, ...x.opcoes, cabelo: corCabelo(p, x.cabelo), ...resto, altura: altura * escala, virado, t, semente };
  if (x.cadeira) return cadeirante(p, { ...o, pose });
  let ps = pose ?? CICLOS.respirar(t + semente);
  if (x.curvado) { const q = resolverPose(ps); ps = { ...q, tronco: q.tronco + 8, cabeca: q.cabeca + 5 }; }
  if (x.robo || modo3d || p.estilo === "3d") {
    return personagem3d(p, { ...o, pose: ps, robo: !!x.robo, yaw: virado < 0 ? Math.PI - 0.42 : 0.42 });
  }
  const e = personagem(p, { ...o, pose: ps });
  if (x.bengala && e.maoF[1] > -o.altura * .58) p.em({ x: 0, y: 0, sx: virado }, () => { const [mx, my] = e.maoF, pe = [mx + o.altura * .05, 0]; p.capsula([mx, my], pe, Math.max(5, o.altura * .022), "c4"); p.linha(arcoP(mx - o.altura * .03, my, o.altura * .03, 180, 360, 6), "c4", Math.max(5, o.altura * .022)); });
  return e;
}

/** Escolhe `n` personagens variados (mistura idades, gêneros e tons de pele). Filtros: idade, genero, semCadeira. */
export function escolherElenco({ n = 4, idade = null, genero = null, semCadeira = false, semente = 1 } = {}) {
  let ids = Object.keys(PERSONAGENS).filter(id => { const x = PERSONAGENS[id]; return (!idade || [].concat(idade).includes(x.idade)) && (!genero || [].concat(genero).includes(x.genero)) && !(semCadeira && x.cadeira); });
  const r = rng(semente); ids = ids.map(id => [r(), id]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const escolhidos = [], tons = new Set();
  for (const id of ids) if (escolhidos.length < n && !tons.has(PERSONAGENS[id].pele)) { escolhidos.push(id); tons.add(PERSONAGENS[id].pele); }
  for (const id of ids) if (escolhidos.length < n && !escolhidos.includes(id)) escolhidos.push(id);
  return escolhidos;
}
