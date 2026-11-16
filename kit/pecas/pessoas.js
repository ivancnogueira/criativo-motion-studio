// Categoria: Pessoas e profissões
// Kit de movimento — elenco: profissões, realeza, bebê, cadeirante, multidão e família, todos sobre o `personagem` de base.
// Este arquivo também preenche os registros do personagem (PENTEADOS, CHAPEUS, ROSTOS, TRAJES, COSTAS) e acrescenta um
// TIPO por profissão: personagem(p, { ...TIPOS.medico, pose, t }) veste qualquer pose com a roupa do médico.
// Cada peça devolve o esqueleto (as juntas) para prender outras coisas. Sem `pose`, a pessoa faz a atuação da profissão
// em laço; com `pose`, usa a pose pedida (nome, objeto ou resultado de CICLOS/atuar). A convenção está em ./_comum.js.
import { clamp, lerp, E, semear, circP, retP, retArredP, rotP, arcoP, estrelaP, escuro, sobreFundo, TAU, ciclo, misturarCor } from "./_comum.js";
import { personagem, TIPOS, PENTEADOS, CHAPEUS, ROSTOS, TRAJES, COSTAS } from "./base.js";
import { CICLOS, POSES, atuar } from "../movimento.js";

const RAD = Math.PI / 180, D = { prof: 0 }, L = { prof: 0, liso: true };
const mais = (a, b) => [].concat(a ?? [], b ?? []);
const meio = (a, b, k = .5) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
/** Desenha no mesmo lado para onde o personagem olha (espelha junto com `virado`). */
const lado = (p, virado, fn) => p.em({ x: 0, y: 0, sx: virado }, fn);
/** Eixo do tronco: T(a, b) dá um ponto com a = 0 no quadril e 1 no ombro, b = -1 nas costas e +1 no peito. */
function eixo(e, H) {
  const [qx, qy] = e.quadril, [ox, oy] = e.ombro, c = Math.hypot(ox - qx, oy - qy) || 1, ux = (ox - qx) / c, uy = (oy - qy) / c, W = H * .0875;
  return (a, b) => [qx + ux * c * a - uy * W * b, qy + uy * c * a + ux * W * b];
}
/** Direção do antebraço da frente (para onde a mão aponta). */
const dirMao = e => [Math.sin(e.angMaoF), Math.cos(e.angMaoF)];
/** Ângulos [raiz, dobra] do braço para a mão chegar a (dx à frente, dy abaixo) do ombro. */
function alcancar(dx, dy, H) {
  const a = .155 * H, b = .15 * H, d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, a + b - 1e-3), c = Math.acos(clamp((d * d - a * a - b * b) / (2 * a * b), -1, 1));
  return [(Math.atan2(dx, dy) - Math.atan2(b * Math.sin(c), a + b * Math.cos(c))) / RAD, c / RAD];
}
const maoPor = (p, pt, H, pele) => p.circulo(pt[0], pt[1], H * .04, pele, L);
/** Cabelo escuro que aparece em todo estilo: no pixel, "tinta" some no fundo, então vira um grafite que se destaca dele. */
const cabeloEscuro = p => p.estilo === "pixel" ? misturarCor(p.cor("sombra"), p.cor("claro"), .2) : "tinta";
/** Cabelo e barba grisalhos (cinza-claro) em qualquer estilo. */
const grisalho = p => p.estilo === "traco" || p.estilo === "vidro" ? misturarCor(p.cor("tinta"), p.cor("fundo"), .18) : misturarCor(p.cor("claro"), p.cor("tinta"), .3);
/** Traje espacial branco ou cinza-claro: no flat e no papel o branco puro sumiria no fundo claro. */
const trajeEspacial = p => p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : p.estilo === "pixel" ? "claro" : misturarCor(p.cor("claro"), p.cor("tinta"), .17);

/* ================================================================ PENTEADOS (p, r, cor) */
const calota = (p, r, cor, a0 = 168, a1 = 345, k = 1.07) => p.forma(arcoP(-r * .04, -r * .06, r * k, a0, a1), cor, D);
const afro = (p, r, cor) => calota(p, r, cor, 178, 328, 1.1);
afro.atras = (p, r, cor) => p.circulo(-r * .28, -r * .42, r * 1.42, cor, { prof: 1 });
const rabo = (p, r, cor) => { calota(p, r, cor); p.circulo(-r * 1.0, -r * .52, r * .2, "c2", L); };
rabo.atras = (p, r, cor) => p.forma([[-r * .8, -r * .8], [-r * 1.5, -r * .78], [-r * 1.9, -r * .15], [-r * 1.8, r * .8], [-r * 1.45, r * 1.1], [-r * 1.38, r * .2], [-r * 1.1, -r * .25], [-r * .75, -r * .3]], cor, D);
const moicano = (p, r, cor) => { const pts = []; for (let i = 0; i <= 8; i++) { const a = (200 + i * 16) * RAD, q = r * (i % 2 ? 1.66 : 1.24); pts.push([Math.cos(a) * q, Math.sin(a) * q]); } p.forma(pts.concat(arcoP(0, 0, r * .93, 328, 200, 8)), cor, D); };
const cacheado = (p, r, cor) => { calota(p, r, cor, 175, 340, 1.04); for (let i = 0; i < 6; i++) { const a = (172 + i * 33) * RAD; p.circulo(Math.cos(a) * r * 1.0 - r * .04, Math.sin(a) * r * 1.0 - r * .08, r * .4, cor, { prof: 0, semente: 40 + i }); } };
const trancas = (p, r, cor) => { calota(p, r, cor); p.capsula([-r * .55, r * .2], [-r * .42, r * 1.55], r * .34, cor); p.circulo(-r * .42, r * 1.6, r * .2, "c2", L); };
trancas.atras = (p, r, cor) => { p.capsula([-r * .95, -r * .2], [-r * 1.2, r * 1.5], r * .36, cor); p.circulo(-r * 1.2, r * 1.56, r * .2, "c2", L); };
const franja = (p, r, cor) => { calota(p, r, cor); p.forma([[-r * .3, -r * 1.02], [r * .7, -r * .88], [r * 1.04, -r * .42], [r * .98, -r * .2], [r * .5, -r * .3], [r * .05, -r * .22], [-r * .3, -r * .34]], cor, D); };
franja.atras = (p, r, cor) => p.forma(arcoP(0, r * .2, r * 1.16, 150, 330).concat([[r * .2, -r * .9]]), cor, D);
// a mecha lateral fica do lado da nuca, com a linha do cabelo curva: não forma um quadro (viseira) sobre a testa e a bochecha
const chanel = (p, r, cor) => p.forma([...arcoP(-r * .04, -r * .06, r * 1.07, 140, 338, 16), [r * .72, -r * .32], [r * .5, -r * .5], [r * .3, -r * .34], [r * .08, -r * .52], [-r * .18, -r * .34], [-r * .4, -r * .08], [-r * .5, r * .3], [-r * .62, r * .62]], cor, D);
chanel.atras = (p, r, cor) => p.forma([...arcoP(0, -r * .1, r * 1.14, 280, 180, 8), [-r * 1.18, r * .8], [-r * .3, r * .86], [-r * .2, 0]], cor, D);
const topete = (p, r, cor) => { calota(p, r, cor); p.forma(rotP(circP(r * .42, -r * 1.04, r * .66, 16, r * .4), r * .42, -r * 1.04, -.22), cor, D); };
const fiapo = (p, r, cor) => { p.capsula([r * .02, -r * .92], [r * .1, -r * 1.22], r * .14, cor); p.capsula([r * .1, -r * 1.22], [r * .3, -r * 1.3], r * .14, cor); };
const calvo = (p, r, cor) => p.forma([...arcoP(-r * .04, -r * .06, r * 1.07, 168, 262), [-r * .3, -r * .5], [-r * .5, r * .05]], cor, D);
Object.assign(PENTEADOS, { afro, rabo, moicano, cacheado, trancas, franja, chanel, topete, fiapo, calvo });

/* ================================================================ CHAPÉUS (p, r, cor, { t }) */
const brilhinho = (p, x, y, r, t, fase = 0) => { const f = (t * .9 + fase) % 1; p.em({ x, y, s: Math.sin(f * Math.PI) + .001, r: f * 1.6 }, () => p.forma(estrelaP(0, 0, r, r * .3, 4), sobreFundo(p), L)); };
function cartola(p, r, cor) {
  p.forma(retArredP(-r * .8, -r * 2.05, r * 1.6, r * 1.4, r * .08), cor, { prof: 1 });
  p.forma(retP(-r * .8, -r * 1.02, r * 1.6, r * .28), "c2", L);
  p.forma(retArredP(-r * 1.4, -r * .8, r * 2.8, r * .24, r * .12), cor, D);
}
function coroa(p, r, cor, { t = 0 } = {}) {
  const w = r * .98, y0 = -r * .6;
  p.forma([[-w, y0], [-w * 1.14, -r * 1.6], [-w * .55, -r * 1.16], [0, -r * 1.78], [w * .55, -r * 1.16], [w * 1.14, -r * 1.6], [w, y0]], cor, { prof: 1 });
  p.forma(retP(-w, y0 - r * .24, w * 2, r * .24), escuro(p, cor, .18), L);
  for (const [x, y] of [[-w * 1.14, -r * 1.6], [0, -r * 1.78], [w * 1.14, -r * 1.6]]) p.circulo(x, y, r * .15, "c1", L);
  brilhinho(p, w * .7, -r * 1.9, r * .34, t);
}
function chapeuCozinheiro(p, r, cor) {
  for (const [x, y, q, s] of [[-r * .62, -r * 1.72, r * .52, 3], [r * .62, -r * 1.72, r * .52, 4], [0, -r * 1.95, r * .62, 5]]) p.circulo(x, y, q, cor, { prof: 1, semente: s });
  p.forma(retP(-r * .86, -r * 1.7, r * 1.72, r * 1.05), cor, D);
  p.linha([[-r * .86, -r * .9], [r * .86, -r * .9]], escuro(p, cor, .25), Math.max(2, r * .07));
}
function capaceteBombeiro(p, r, cor) {
  p.forma([...arcoP(0, -r * .22, r * 1.1, 180, 360), [r * 1.5, -r * .2], [r * 1.45, -r * .03], [-r * 1.2, -r * .03], [-r * 1.95, r * .32], [-r * 2.02, r * .12]], cor, { prof: 1 });
  p.forma(arcoP(0, -r * .22, r * 1.3, 212, 332).concat(arcoP(0, -r * .22, r * 1.06, 332, 212)), "c2", D);
  p.forma([[r * .3, -r * .92], [r * .82, -r * .92], [r * .82, -r * .5], [r * .56, -r * .3], [r * .3, -r * .5]], "c2", L);
}
const quepe = (faixa, enfeite) => (p, r, cor) => {
  p.forma([[-r * 1.05, -r * .5], [r * 1.05, -r * .5], [r * 1.28, -r * 1.22], [-r * 1.2, -r * 1.34]], cor, { prof: 1 });
  p.forma(retP(-r * 1.05, -r * .74, r * 2.1, r * .26), faixa || escuro(p, cor, .4), L);
  p.forma([[r * .5, -r * .52], [r * 1.7, -r * .4], [r * 1.6, -r * .24], [r * .5, -r * .32]], escuro(p, cor, .4), D);
  if (enfeite === "asas") p.forma([[-r * .25, -r * 1.05], [r * .35, -r * .88], [r * .95, -r * 1.05], [r * .35, -r * .98]].map(([x, y]) => [x, y + r * .05]), "c2", L);
  else p.forma(estrelaP(r * .35, -r * .98, r * .2, r * .09, 5), "c2", L);
};
function capelo(p, r, cor, { t = 0 } = {}) {
  const bal = Math.sin(t * 2.4) * r * .16;
  p.forma(arcoP(0, -r * .32, r * 1.06, 180, 360), cor, D);
  p.forma([[-r * 1.6, -r * 1.3], [r * .15, -r * 1.68], [r * 1.65, -r * 1.3], [-r * .1, -r * .96]], cor, { prof: 1 });
  p.linha([[r * .02, -r * 1.32], [r * 1.25, -r * 1.24], [r * 1.25 + bal, -r * .55]], "c2", Math.max(2.5, r * .08));
  p.circulo(r * 1.25 + bal, -r * .5, r * .15, "c2", L); p.circulo(r * .02, -r * 1.32, r * .12, "c2", L);
}
// capacete: anel claro com o visor de vidro escuro na frente do rosto e o reflexo correndo nele
function capaceteAstronauta(p, r, cor, { t = 0 } = {}) {
  const R = r * 1.42, cy = -r * .08, vezes = p.estilo === "vidro" ? 2 : 1, vid = p.estilo === "traco" ? "c1" : escuro(p, p.estilo === "papel" ? "c4" : "c1", .45);
  const visor = retArredP(-r * .22, -r * .66, r * 1.42, r * 1.16, r * .5), x = r * (.62 + .18 * Math.sin(t * 1.4));
  for (let i = 0; i < vezes; i++) p.forma(circP(0, cy, R), cor, { prof: 1 });
  p.forma(retArredP(-r * .95, r * 1.16, r * 1.9, r * .36, r * .16), "c4", D);
  p.circulo(-r * 1.3, cy, r * .24, "c4", L);
  p.forma(retArredP(-r * .3, -r * .74, r * 1.58, r * 1.32, r * .58), escuro(p, cor, .16), L);
  for (let i = 0; i < vezes; i++) p.forma(visor, vid, L);
  p.alfa(.85, () => { p.linha(arcoP(r * .55, -r * .02, r * .48, 236, 296, 6).map(([a, b]) => [a + x - r * .62, b]), "#FFFFFF", Math.max(3, r * .12)); p.circulo(x + r * .3, -r * .44, Math.max(2, r * .07), "#FFFFFF", L); });
}
capaceteAstronauta.cobre = true;
// chapéu de palha com a aba erguida: deixa à mostra a faixa dos olhos entre a aba e a barba
function chapeuPalha(p, r, cor) {
  p.em({ x: 0, y: -r * .2, r: -.08 }, () => {
    p.elipse(0, -r * .62, r * 1.9, r * .24, cor, { prof: 1 });
    p.forma(arcoP(0, -r * .66, r * .84, 180, 360), cor, D);
    p.linha([[-r * .82, -r * .74], [r * .82, -r * .74]], "c1", Math.max(3, r * .12));
  });
}
function boina(p, r, cor) {
  p.forma(rotP(circP(-r * .18, -r * .98, r * 1.3, 20, r * .5), -r * .18, -r * .98, .12), cor, { prof: 1 });
  p.forma(retP(-r * .9, -r * .78, r * 1.82, r * .2), escuro(p, cor, .3), L);
  p.capsula([-r * .2, -r * 1.42], [-r * .14, -r * 1.62], r * .14, cor);
}
function chapeuCowboy(p, r, cor) {
  p.forma([[-r * .86, -r * .6], [-r * .76, -r * 1.5], [-r * .3, -r * 1.58], [0, -r * 1.36], [r * .3, -r * 1.58], [r * .76, -r * 1.5], [r * .86, -r * .6]], cor, D);
  p.forma(retP(-r * .86, -r * .86, r * 1.72, r * .2), "c1", L);
  p.forma([[-r * 2.05, -r * .9], [-r * 1.3, -r * .66], [r * 1.3, -r * .66], [r * 2.05, -r * .9], [r * 1.5, -r * .44], [0, -r * .38], [-r * 1.5, -r * .44]], cor, { prof: 1 });
}
function toucaCirurgica(p, r, cor) {
  p.forma(arcoP(-r * .1, -r * .12, r * 1.13, 162, 350), cor, D);
  p.forma([[-r * 1.05, -r * .1], [-r * 1.5, -r * .22], [-r * 1.4, r * .2]], cor, D);
}
toucaCirurgica.cobre = true;
function tiara(p, r, cor, { t = 0 } = {}) {
  p.forma(arcoP(0, 0, r * 1.2, 222, 318, 10).concat(arcoP(0, 0, r * 1.0, 318, 222, 10)), cor, D);
  p.forma([[-r * .34, -r * 1.1], [0, -r * 1.62], [r * .34, -r * 1.1]], cor, D);
  p.circulo(0, -r * 1.2, r * .13, "c1", L);
  brilhinho(p, r * .5, -r * 1.6, r * .3, t, .4);
}
function toucaEnfermeira(p, r, cor) {
  p.forma([[-r * .82, -r * .68], [r * .86, -r * .68], [r * 1.02, -r * 1.42], [-r * .98, -r * 1.42]], cor, { prof: 1 });
  p.forma(retP(-r * .1, -r * 1.3, r * .22, r * .52), "c1", L); p.forma(retP(-r * .25, -r * 1.15, r * .52, r * .22), "c1", L);
}
function capuzMergulho(p, r, cor) { p.forma(circP(0, 0, r * 1.14), cor, { prof: 0, furos: [circP(r * .3, r * .04, r * .76).reverse()] }); }
capuzMergulho.cobre = true;
function fones(p, r, cor) {
  p.linha([[-r * .32, r * .0], [-r * .4, -r * .62], [-r * .22, -r * 1.1]], cor, Math.max(4, r * .17));
  p.forma(circP(-r * .34, r * .06, r * .34, 16, r * .46), cor, D);
  p.linha([[-r * .3, r * .4], [r * .1, r * .78], [r * .44, r * .72]], cor, Math.max(2.5, r * .08));
}
function faixa(p, r, cor, { t = 0 } = {}) {
  const b = Math.sin(t * 9) * r * .12;
  p.forma([[-r * 1.0, -r * .42], [-r * 1.7, -r * .62 + b], [-r * 1.62, -r * .26 + b]], cor, D);
  p.forma([[-r * 1.0, -r * .34], [-r * 1.6, -r * .1 - b], [-r * 1.45, r * .16 - b]], cor, D);
  p.forma([[-r * 1.05, -r * .52], [r * .98, -r * .64], [r * 1.02, -r * .34], [-r * 1.07, -r * .22]], cor, D);
}
Object.assign(CHAPEUS, { cartola, coroa, chapeuCozinheiro, capaceteBombeiro, quepePolicial: quepe(null, "estrela"), quepePiloto: quepe("c2", "asas"), capelo, capaceteAstronauta, chapeuPalha, boina, chapeuCowboy, toucaCirurgica, tiara, toucaEnfermeira, capuzMergulho, fones, faixa });

/* ================================================================ ROSTOS (p, r, { pele, cabelo, t }) */
const fino = r => Math.max(2.5, r * .08);
function oculos(p, r, { cor = "tinta" } = {}) {
  for (const x of [r * .2, r * .68]) p.linha(circP(x, -r * .02, r * .22, 14), cor, fino(r), { fechar: true });
  p.linha([[-r * .02, -r * .08], [-r * .78, -r * .14]], cor, fino(r));
}
function oculosEscuros(p, r) {
  p.forma(retArredP(-r * .04, -r * .22, r * .46, r * .38, r * .12), "tinta", L); p.forma(retArredP(r * .5, -r * .22, r * .46, r * .38, r * .12), "tinta", L);
  p.linha([[-r * .02, -r * .12], [-r * .78, -r * .16]], "tinta", fino(r)); p.linha([[r * .4, -r * .14], [r * .52, -r * .14]], "tinta", fino(r));
}
function barba(p, r, { pele = "pele0", cabelo = "tinta" } = {}) {
  p.forma([...arcoP(0, 0, r * 1.07, 6, 174, 14), [-r * .82, -r * .12], [-r * .55, r * .28], [r * .1, r * .36], [r * .5, r * .26], [r * .92, r * .28]], cabelo, D);
  p.linha(arcoP(r * .5, r * .42, r * .17, 20, 160, 5), pele, fino(r));
}
const bigode = (p, r, { cabelo = "tinta" } = {}) => p.forma([[r * .12, r * .44], [r * .28, r * .26], [r * .5, r * .2], [r * .82, r * .26], [r * .98, r * .44], [r * .66, r * .4], [r * .5, r * .36], [r * .34, r * .42]], cabelo, L);
function mascara(p, r) {
  p.linha([[r * .08, r * .22], [-r * .72, -r * .02]], "claro", fino(r)); p.linha([[r * .12, r * .74], [-r * .66, r * .3]], "claro", fino(r));
  p.forma([[r * .02, r * .1], [r * .98, r * .1], [r * .96, r * .7], [r * .5, r * .96], [r * .08, r * .82]], "claro", D);
  p.linha([[r * .12, r * .38], [r * .9, r * .36]], "c4", fino(r)); p.linha([[r * .14, r * .6], [r * .86, r * .58]], "c4", fino(r));
}
const cavanhaque = (p, r, { cabelo = "tinta" } = {}) => p.forma([[r * .22, r * .64], [r * .74, r * .62], [r * .66, r * 1.1], [r * .44, r * 1.22], [r * .3, r * 1.0]], cabelo, L);
function mascaraMergulho(p, r) {
  p.linha([[r * .05, -r * .05], [-r * .95, -r * .12]], "c2", Math.max(3, r * .12));
  p.forma(retArredP(-r * .02, -r * .42, r * 1.1, r * .74, r * .22), "c2", D);
  p.alfa(.45, () => p.forma(retArredP(r * .1, -r * .3, r * .86, r * .5, r * .16), "claro", L));
  p.linha([[r * .62, r * .54], [r * .2, r * .78], [-r * .52, r * .36], [-r * .62, -r * 1.55]], "c2", Math.max(4, r * .17));
  p.capsula([-r * .62, -r * 1.5], [-r * .62, -r * 1.78], r * .28, "c1");
}
function chupeta(p, r) { p.circulo(r * .6, r * .48, r * .22, "c2", L); p.linha(circP(r * .92, r * .5, r * .15, 10), "c2", fino(r), { fechar: true }); }
Object.assign(ROSTOS, { oculos, oculosEscuros, barba, bigode, mascara, cavanhaque, mascaraMergulho, chupeta });

/* ================================================================ TRAJES (p, e, H) — por cima do tronco */
const gravata = (cor = "c2") => (p, e, H) => { const T = eixo(e, H); p.forma([T(1.2, .18), T(1.2, .56), T(1.02, .46), T(.34, .62), T(.14, .38), T(.34, .14), T(1.02, .28)], cor, L); };
const terno = (cor = "c2") => (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(1.27, -.05), T(1.27, .8), T(.4, .38)], "claro", L);
  gravata(cor)(p, e, H);
  p.linha([T(1.27, -.05), T(.4, .38), T(1.2, .86)], "tinta", Math.max(2, H * .009));
};
const borboleta = (cor = "c1") => (p, e, H) => { const T = eixo(e, H); p.forma([T(1.3, .1), T(1.18, .45), T(1.3, .8), T(1.04, .8), T(1.18, .45), T(1.04, .1)], cor, L); };
const estetoscopio = alvo => (p, e, H) => {
  const T = eixo(e, H), w = Math.max(3, H * .013), b = T(.62, .3);
  p.linha([T(1.24, -.5), T(.84, -.2), b, T(.84, .74), T(1.24, .8)], "c1", w);
  if (alvo) { const a = alvo(e), m = meio(b, a); p.linha([b, [m[0], m[1] + H * .05], a], "c1", w); }
  else { const a = T(.26, .36); p.linha([b, a], "c1", w); p.circulo(a[0], a[1], H * .032, "c4", L); }
};
const avental = (cor = "claro", manchas = false) => (p, e, H) => {
  const T = eixo(e, H);
  p.linha([T(1.02, .4), T(1.3, .2)], cor, Math.max(3, H * .014));
  p.forma([T(1.02, .0), T(1.02, .82), T(.55, 1.04), T(-1.0, 1.08), T(-1.0, -.6), T(.5, -.6), T(.56, .0)], cor, D);
  p.linha([T(.5, -.6), T(.46, -1.0)], cor, Math.max(3, H * .014));
  if (manchas) for (const [a, b, c, s] of [[.7, .5, "c1", .034], [.2, .1, "c2", .04], [-.4, .55, "c3", .036], [-.7, -.2, "c1", .028]]) { const [x, y] = T(a, b); p.circulo(x, y, H * s, c, L); }
  else p.linha([T(.05, -.2), T(.05, .6), T(-.3, .6), T(-.3, -.2)], escuro(p, cor, .25), Math.max(2, H * .009));
};
const colete = (cor = "c2", listra = "claro") => (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(1.28, -.72), T(1.28, .1), T(.72, .42), T(1.28, .8), T(1.0, 1.02), T(-.08, 1.02), T(-.08, -1.02), T(1.0, -1.02)], cor, D);
  if (listra) { p.forma([T(.5, -1.02), T(.5, 1.02), T(.3, 1.02), T(.3, -1.02)], listra, L); p.forma([T(.12, -1.02), T(.12, 1.02), T(-.04, 1.02), T(-.04, -1.02)], listra, L); }
};
const cracha = (p, e, H) => {
  const T = eixo(e, H);
  p.linha([T(1.25, .1), T(.62, .46), T(1.25, .82)], "c1", Math.max(2.5, H * .01));
  p.forma([T(.64, .18), T(.64, .74), T(.2, .74), T(.2, .18)], "claro", D);
  const [x, y] = T(.48, .46); p.circulo(x, y, H * .02, "c4", L);
};
const jaleco = (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(.3, -1.03), T(.3, 1.03), T(-1.08, 1.12), T(-1.08, -1.02)], "claro", D);
  p.forma([T(1.28, .1), T(1.28, .8), T(.62, .46)], "c4", L);
  p.linha([T(.62, .46), T(-1.08, .52)], escuro(p, "claro", .3), Math.max(2, H * .009));
  p.linha([T(-.35, -.75), T(-.35, -.05)], escuro(p, "claro", .3), Math.max(2, H * .009));
};
const cinto = (p, e, H) => { const T = eixo(e, H); p.forma([T(.1, -1.02), T(.1, 1.02), T(-.1, 1.02), T(-.1, -1.02)], "tinta", L); p.forma([T(.16, .3), T(.16, .72), T(-.16, .72), T(-.16, .3)], "c2", L); };
const toga = (cor = "c1", gola = "claro") => (p, e, H) => {
  const T = eixo(e, H), [qx] = e.quadril, y0 = -H * .05;
  p.forma([T(1.3, -.92), T(1.3, .92), T(.6, 1.12), [qx + H * .2, y0], [qx - H * .2, y0], T(.6, -1.12)], cor, { prof: 1 });
  if (gola) p.forma([T(1.3, .05), T(1.3, .85), T(.8, .8), T(.7, .45), T(.8, .1)], gola, D);
};
const vestido = (cor = "c4", bal = 0) => (p, e, H) => {
  const T = eixo(e, H), [qx] = e.quadril, y0 = -H * .03, d = bal * H;
  p.forma([T(.3, -1.02), T(.3, 1.02), T(.12, .86), [qx + H * .2 + d * .5, -H * .25], [qx + H * .36 + d, y0], [qx - H * .36 + d, y0], [qx - H * .2 + d * .5, -H * .25], T(.12, -.86)], cor, { prof: 1 });
  p.forma([T(.3, -1.02), T(.3, 1.02), T(.1, .95), T(.1, -.95)], "c2", L);
  p.linha([[qx - H * .33 + d, y0 - H * .03], [qx + H * .33 + d, y0 - H * .03]], "c2", Math.max(4, H * .02));
};
const saia = (cor = "c1") => (p, e, H) => { const T = eixo(e, H), [qx, qy] = e.quadril; p.forma([T(.16, -1.02), T(.16, 1.02), [qx + H * .16, qy + H * .25], [qx - H * .16, qy + H * .25]], cor, D); };
const shorts = (cor = "c1") => (p, e, H) => {
  p.capsula(e.quadril, meio(e.quadril, e.joelhoT, .62), H * .096, escuro(p, cor, .22));
  p.capsula(e.quadril, meio(e.quadril, e.joelhoF, .62), H * .1, cor);
  const T = eixo(e, H); p.capsula(T(-.02, -.55), T(-.02, .55), H * .1, cor);
};
const macacao = (cor = "c4") => (p, e, H) => {
  const T = eixo(e, H), w = Math.max(4, H * .022);
  p.linha([T(.92, .0), T(1.32, -.2)], cor, w); p.linha([T(.92, .8), T(1.32, .55)], cor, w);
  p.forma([T(.95, -.1), T(.95, .9), T(.3, 1.03), T(-.32, 1.03), T(-.32, -1.03), T(.3, -1.03), T(.4, -.1)], cor, D);
  p.forma([T(.7, .15), T(.7, .7), T(.38, .7), T(.38, .15)], escuro(p, cor, .2), L);
};
const listras = (cor = "claro") => (p, e, H) => {
  const T = eixo(e, H);
  for (const a of [.78, .18]) p.forma([T(a, -1.02), T(a, 1.02), T(a - .2, 1.02), T(a - .2, -1.02)], cor, L);
  p.linha([T(1.28, .5), T(-.25, .5)], "tinta", Math.max(2, H * .009));
};
const distintivo = (p, e, H) => { const [x, y] = eixo(e, H)(.86, .42); p.forma(estrelaP(x, y, H * .046, H * .02, 5), "c2", L); };
// par de asas de piloto no peito: duas asas abertas com o escudo no meio
const asasPeito = (p, e, H) => {
  const T = eixo(e, H), m = T(.84, .2), u = [T(1, 0)[0] - T(0, 0)[0], T(1, 0)[1] - T(0, 0)[1]], c = Math.hypot(u[0], u[1]) || 1, ux = u[0] / c, uy = u[1] / c, vx = -uy, vy = ux;
  const P = (a, b) => [m[0] + vx * a * H + ux * b * H, m[1] + vy * a * H + uy * b * H];
  for (const s of [-1, 1]) p.forma([P(s * .012, .01), P(s * .068, .026), P(s * .06, .008), P(s * .045, -.006), P(s * .012, -.01)], "c2", L);
  p.forma(circP(m[0], m[1], H * .016), "c2", L);
};
const painelEspacial = (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(.95, .05), T(.95, .98), T(.35, .98), T(.35, .05)], "c1", D);
  [["c2", .78], ["c3", .52]].forEach(([c, a]) => { const [x, y] = T(a, .52); p.circulo(x, y, H * .026, c, L); });
  p.forma([T(.12, -1.02), T(.12, 1.02), T(-.06, 1.02), T(-.06, -1.02)], "c2", L);
};
const dolma = (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(1.3, -.3), T(1.3, .95), T(.92, .5)], "c1", L);
  for (const a of [.62, .22]) for (const b of [.2, .7]) { const [x, y] = T(a, b); p.circulo(x, y, H * .017, "tinta", L); }
};
const golaArminho = (p, e, H) => {
  const T = eixo(e, H);
  p.capsula(T(1.16, -1.05), T(1.16, 1.05), H * .1, "claro");
  for (const b of [-.6, 0, .6]) { const [x, y] = T(1.16, b); p.circulo(x, y, H * .016, "tinta", L); }
};
const numeroPeito = (p, e, H) => { const T = eixo(e, H); p.forma([T(.92, -.1), T(.92, .92), T(.3, .92), T(.3, -.1)], "claro", D); p.capsula(T(.8, .42), T(.42, .42), H * .026, "tinta"); };
const cruz = (p, e, H) => { const T = eixo(e, H); p.forma([T(.98, .3), T(.98, .62), T(.42, .62), T(.42, .3)], "c1", L); p.forma([T(.82, .05), T(.82, .87), T(.58, .87), T(.58, .05)], "c1", L); };
Object.assign(TRAJES, { gravata: gravata(), terno: terno(), borboleta: borboleta(), estetoscopio: estetoscopio(), avental: avental(), aventalPintor: avental("claro", true), colete: colete(), cracha, jaleco, cinto, toga: toga(), vestido: vestido(), saia: saia(), shorts: shorts(), fralda: shorts("claro"), macacao: macacao(), listras: listras(), distintivo, asasPeito, painelEspacial, dolma, golaArminho, numeroPeito, cruz });

/* ================================================================ COSTAS (p, e, H) — atrás do corpo */
const mochila = (cor = "c3") => (p, e, H) => {
  const T = eixo(e, H);
  p.forma([T(1.15, -.7), T(1.12, -2.0), T(.9, -2.4), T(.1, -2.4), T(-.1, -2.0), T(-.06, -.7)], cor, { prof: 1 });
  p.forma([T(.5, -1.6), T(.5, -2.4), T(.04, -2.4), T(.04, -1.6)], escuro(p, cor, .22), L);
};
const capa = (cor = "c1", onda = 0) => (p, e, H) => {
  const T = eixo(e, H), o = onda;
  p.forma([T(1.3, .4), T(1.32, -1.0), T(.6, -1.9 - o * .3), T(-.6, -2.5 - o), T(-1.5, -2.9 - o * 1.6), T(-1.56, -1.3 - o * .6), T(-.4, -.9)], cor, { prof: 1 });
};
const cilindroDeAr = (cor = "c2") => (p, e, H) => {
  const T = eixo(e, H);
  p.linha([T(1.4, -1.8), T(1.75, -.9), T(1.62, .4)], "c4", Math.max(3, H * .016));
  p.capsula(T(1.05, -1.8), T(1.42, -1.8), H * .045, "c4");
  p.forma(capsulaDe(T(.12, -1.8), T(1.02, -1.8), H * .115), cor, { prof: 1 });
  p.capsula(T(.5, -2.5), T(.7, -2.5), H * .03, escuro(p, cor, .3));
};
const asas = (cor = "claro", bate = 0) => (p, e, H) => {
  const T = eixo(e, H), o = bate;
  p.forma([T(1.1, -.6), T(1.95 + o, -2.2), T(1.6 + o, -3.7), T(1.0 + o * .5, -3.1), T(.7, -3.4), T(.4, -2.7), T(.05, -2.8), T(.22, -1.6), T(.35, -.8)], cor, { prof: 1 });
};
const mochilaEspacial = (cor = "claro") => (p, e, H) => {
  const T = eixo(e, H);
  p.linha([T(1.3, -1.7), T(1.75, -1.9)], "c4", Math.max(3, H * .014));
  p.forma([T(1.34, -.8), T(1.34, -2.1), T(.0, -2.1), T(.0, -.8)], cor, { prof: 1 });
  p.forma([T(1.0, -1.5), T(1.0, -2.1), T(.75, -2.1), T(.75, -1.5)], "c1", L);
};
function capsulaDe(a, b, w) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = w / 2, o = []; for (let i = 0; i <= 7; i++) { const q = ang + Math.PI / 2 + i / 7 * Math.PI; o.push([a[0] + Math.cos(q) * r, a[1] + Math.sin(q) * r]); } for (let i = 0; i <= 7; i++) { const q = ang - Math.PI / 2 + i / 7 * Math.PI; o.push([b[0] + Math.cos(q) * r, b[1] + Math.sin(q) * r]); } return o; }
Object.assign(COSTAS, { mochila: mochila(), capa: capa(), cilindroDeAr: cilindroDeAr(), asas: asas(), mochilaEspacial: mochilaEspacial() });

/* ================================================================ TIPOS — um elenco por profissão */
Object.assign(TIPOS, {
  medico: { pele: "pele3", roupa: "claro", calca: "c4", sapato: "tinta", rosto: "oculos", noTronco: ["jaleco", "estetoscopio"], expressao: "feliz", semente: 1 },
  enfermeira: { pele: "pele1", roupa: "c3", calca: "c3", sapato: "claro", penteado: "coque", chapeu: "toucaEnfermeira", corChapeu: "claro", noTronco: ["cruz"], expressao: "feliz", semente: 2 },
  policial: { pele: "pele2", roupa: "c1", calca: "c1", chapeu: "quepePolicial", corChapeu: "c1", rosto: "bigode", noTronco: ["cinto", "distintivo"], semente: 3 },
  bombeiro: { pele: "pele0", roupa: "c2", calca: "c2", chapeu: "capaceteBombeiro", corChapeu: "c1", noTronco: ["listras"], semente: 4 },
  professora: { pele: "pele5", roupa: "c2", calca: "c4", penteado: "afro", rosto: "oculos", noTronco: ["saia"], expressao: "feliz", semente: 5 },
  cozinheiro: { pele: "pele4", roupa: "claro", calca: "c4", chapeu: "chapeuCozinheiro", corChapeu: "claro", rosto: "bigode", noTronco: ["dolma"], expressao: "feliz", semente: 6 },
  agricultor: { pele: "pele2", roupa: "c1", calca: "c4", chapeu: "chapeuPalha", corChapeu: "c2", rosto: "barba", noTronco: ["macacao"], semente: 7 },
  astronauta: { pele: "c4", roupa: "claro", calca: "claro", sapato: "claro", chapeu: "capaceteAstronauta", corChapeu: "claro", noTronco: ["painelEspacial"], nasCostas: ["mochilaEspacial"], expressao: "feliz", semente: 8 },
  juiz: { pele: "pele5", roupa: "c1", calca: "c1", cabelo: "claro", penteado: "calvo", rosto: "oculos", noTronco: ["toga"], semente: 9 },
  pilotoAviao: { pele: "pele3", roupa: "claro", calca: "c1", penteado: "rabo", chapeu: "quepePiloto", corChapeu: "c1", rosto: "oculosEscuros", noTronco: [gravata("c1"), "asasPeito"], expressao: "feliz", semente: 10 },
  garcom: { pele: "pele1", roupa: "claro", calca: "c1", penteado: "topete", noTronco: [colete("c1", null), "borboleta"], expressao: "feliz", semente: 11 },
  estudante: { pele: "pele2", roupa: "c2", calca: "c1", penteado: "trancas", nasCostas: ["mochila"], expressao: "feliz", semente: 12 },
  formando: { pele: "pele3", roupa: "c1", calca: "c1", penteado: "longo", chapeu: "capelo", corChapeu: "c1", noTronco: [toga("c1", "c2")], expressao: "feliz", semente: 13 },
  atleta: { pele: "pele5", roupa: "c2", calca: "pele5", sapato: "c3", penteado: "curto", chapeu: "faixa", corChapeu: "c1", noTronco: ["shorts", "numeroPeito"], semente: 14 },
  pintor: { pele: "pele0", roupa: "c4", calca: "c1", chapeu: "boina", corChapeu: "c1", rosto: ["bigode", "cavanhaque"], noTronco: ["aventalPintor"], expressao: "feliz", semente: 15 },
  engenheira: { pele: "pele3", roupa: "c4", calca: "c1", penteado: "rabo", chapeu: "capacete", corChapeu: "c2", noTronco: [colete("c2", "claro")], expressao: "feliz", semente: 16 },
  programador: { pele: "pele4", roupa: "c3", calca: "c1", penteado: "cacheado", chapeu: "fones", corChapeu: "c2", rosto: "oculos", semente: 17 },
  empresario: { pele: "pele2", roupa: "c1", calca: "c1", penteado: "topete", noTronco: ["terno"], expressao: "feliz", semente: 18 },
  mergulhador: { pele: "pele1", roupa: "c1", calca: "c1", sapato: "c2", chapeu: "capuzMergulho", corChapeu: "c1", rosto: "mascaraMergulho", nasCostas: ["cilindroDeAr"], semente: 19 },
  rei: { pele: "pele0", roupa: "c1", calca: "c1", chapeu: "coroa", corChapeu: "c2", rosto: "barba", noTronco: [toga("c1", null), "golaArminho"], nasCostas: [capa("c3")], semente: 20 },
  rainha: { pele: "pele3", roupa: "c4", calca: "c4", penteado: "longo", chapeu: "coroa", corChapeu: "c2", noTronco: ["vestido"], expressao: "feliz", semente: 21 },
  bebe: { pele: "pele1", roupa: "c4", calca: "pele1", sapato: "pele1", cabelo: "pele5", penteado: "fiapo", rosto: "chupeta", noTronco: ["fralda"], cabecao: 1.9, altura: 170, semente: 22 },
  cadeirante: { pele: "pele2", roupa: "c2", calca: "c1", penteado: "chanel", expressao: "feliz", semente: 23 },
  anjo: { pele: "pele4", roupa: "claro", calca: "claro", penteado: "cacheado", cabelo: "c2", noTronco: [toga("claro", null)], nasCostas: ["asas"], expressao: "feliz", semente: 24 },
});

/* ================================================================ PROFISSÕES */
/** Médico de jaleco e óculos que ausculta: o estetoscópio vai e volta e pulsa. Opções: pose, virado, altura, t. Chaves: médico, doutor, saúde, consulta, hospital, diagnóstico, cuidado, estetoscópio */
export function medico(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.medico, ...resto }, ato = pose === undefined;
  const ps = pose ?? { tronco: 4, cabeca: 5 + 2 * Math.sin(tt * 1.3), bracoF: [62 + 9 * Math.sin(tt * 1.6), 40 + 10 * Math.sin(tt * 3.2)], bracoT: [-8 - 3 * Math.sin(tt * 1.6), 14] };
  if (ato && !resto.noTronco) o.noTronco = ["jaleco", estetoscopio(e => e.maoF)];
  const e = personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => { q.circulo(H * .05, 0, H * .045, "c4", L); q.circulo(H * .05, 0, H * .022, "claro", L); }) });
  if (ato) lado(p, virado, () => { const d = dirMao(e), f = (tt * 1.1) % 1, x = e.maoF[0] + d[0] * H * .05, y = e.maoF[1] + d[1] * H * .05; p.alfa(1 - f, () => p.linha(circP(x, y, H * (.05 + f * .09), 18), "c1", Math.max(3, H * .014), { fechar: true })); });
  return e;
}
/** Enfermeira de touca com cruz que ergue a seringa e faz o líquido espirrar. Opções: pose, virado, altura, t. Chaves: enfermeira, vacina, injeção, seringa, saúde, hospital, cuidado, imunização */
export function enfermeira(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.enfermeira, ...resto }, bate = Math.max(0, Math.sin(tt * 5)) ** 4;
  const ps = pose ?? { tronco: 2, cabeca: -8 + 2 * Math.sin(tt * 1.2), bracoF: [108 + 4 * Math.sin(tt * 1.5), 58 - bate * 8], bracoT: [-30, 100] };
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => {
    q.linha([[H * .25, 0], [H * .36, 0]], sobreFundo(q), Math.max(2.5, H * .012));
    q.capsula([-H * .1, 0], [H * .04, 0], H * .024, "c4"); q.capsula([-H * .1, -H * .045], [-H * .1, H * .045], H * .026, "c4");
    q.forma(retArredP(H * .03, -H * .038, H * .23, H * .076, H * .014), "claro", D); q.forma(retP(H * .1, -H * .038, H * .15, H * .076), "c2", L);
    for (let i = 0; i < 3; i++) { const f = (tt * 1.3 + i / 3) % 1; q.circulo(H * (.37 + f * .13), (i - 1) * f * H * .07, H * (.02 - f * .01), "c4", L); }
  }) });
}
/** Policial de quepe e distintivo que manda parar com a mão e bate continência. Opções: pose, virado, altura, t. Chaves: policial, polícia, segurança, lei, ordem, guarda, proteção, fiscalização, pare */
export function policial(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.policial, ...resto }, tl = ((tt % 4) + 4) % 4;
  const pare = () => ({ tronco: 2, bracoF: [88 + 4 * Math.sin(tt * 7), 8], bracoT: [-34, 106], pernaF: [8, 0], pernaT: [-8, 0] });
  const ps = pose ?? atuar(tl, [{ ate: 2.2, acao: pare }, { ate: 3.7, acao: () => ({ ...POSES.continencia, cabeca: Math.sin(tt * 2) * 2 }) }, { acao: pare }]);
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => q.forma(retArredP(H * .0, -H * .06, H * .085, H * .105, H * .03), o.pele, L)) });
}
/** Bombeiro de capacete que segura a mangueira e lança um jato de água. Opções: pose, virado, altura, t. Chaves: bombeiro, incêndio, resgate, emergência, mangueira, água, salvar, apagar o fogo */
export function bombeiro(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.bombeiro, ...resto }, s = Math.sin(tt * 2.2);
  const ps = pose ?? { tronco: 7 + s, cabeca: -2, bracoF: [60 + 5 * s, 34], bracoT: [44 + 5 * s, 52], pernaF: [24, 12], pernaT: [-24, 4] };
  o.nasCostas = mais(o.nasCostas, (q, e) => q.linha([e.maoF, [e.quadril[0] - H * .04, e.quadril[1] + H * .06], [-H * .26, -H * .03], [-H * .5, -H * .03 + Math.sin(tt * 5) * H * .012]], "c3", Math.max(5, H * .034)));
  const e = personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => { q.capsula([-H * .03, 0], [H * .1, 0], H * .05, "c4"); q.forma([[H * .09, -H * .034], [H * .16, -H * .022], [H * .16, H * .022], [H * .09, H * .034]], "c1", L); }) });
  if (!resto.naMao) lado(p, virado, () => {
    const d = dirMao(e), x0 = e.maoF[0] + d[0] * H * .16, y0 = e.maoF[1] + d[1] * H * .16, C = H * .62;
    const pt = (k, lat) => { const w = H * (.012 + k * .05) * lat, g = k * k * H * .3 + Math.sin(tt * 9 - k * 7) * H * .012 * k; return [x0 + d[0] * C * k + d[1] * w, y0 + d[1] * C * k + g - d[0] * w]; };
    const cima = [], baixo = []; for (let i = 0; i <= 8; i++) { cima.push(pt(i / 8, -1)); baixo.unshift(pt(i / 8, 1)); }
    p.forma(cima.concat(baixo), "c4", L);
    for (let i = 0; i < 5; i++) { const f = (tt * 1.6 + i / 5) % 1, a = pt(1, (i - 2) * .7); p.circulo(a[0] + f * H * (.1 + i * .02), a[1] + f * f * H * .2 + f * H * .04 * (i - 2), H * (.028 - f * .014), "c4", L); }
  });
  return e;
}
/** Professora de óculos que aponta o quadro com a vareta enquanto a lição se escreve. Opções: pose, virado, altura, cenario (false tira o quadro), t. Chaves: professora, professor, aula, ensino, escola, educação, quadro, explicar, lição */
export function professora(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  // no pixel a armação escura sobre a pele escura vira uma faixa preta: lá ela fica clara, e os olhos aparecem
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.professora, cabelo: cabeloEscuro(p), ...(p.estilo === "pixel" ? { rosto: (q, r) => oculos(q, r, { cor: "claro" }) } : {}), ...resto };
  if (cenario) lado(p, virado, () => {
    const x = H * .44, y = -H * 1.02, w = H * .8, h = H * .56, k = ciclo(tt, 2.6, 1.2), lw = Math.max(6, H * .03);
    for (const dx of [.14, .86]) p.capsula([x + w * dx, y + h], [x + w * (dx + (dx < .5 ? -.08 : .08)), 0], H * .03, "c4");
    p.forma(retArredP(x - H * .025, y - H * .025, w + H * .05, h + H * .05, H * .02), "c2", { prof: 2 });
    p.forma(retP(x, y, w, h), "c3", L);
    const linhas = [[.12, .2, .6], [.12, .4, .76], [.12, .6, .46]];
    linhas.forEach(([a, b, c], i) => { const kk = clamp(k * 3 - i); if (kk > .02) p.linha([[x + w * a, y + h * b], [x + w * (a + c * kk), y + h * b]], "claro", lw); });
    if (k > .9) p.linha([[x + w * .66, y + h * .74], [x + w * .74, y + h * .84], [x + w * .88, y + h * .6]], "c2", lw);
    p.forma(retP(x + w * .1, y + h, w * .3, H * .025), "claro", L);
  });
  const ps = pose ?? { tronco: 3, cabeca: -4 + 3 * Math.sin(tt * 1.4), bracoF: [98 + 12 * Math.sin(tt * 1.4), 6 + 5 * Math.sin(tt * 2.8)], bracoT: [-32, 104] };
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => { q.capsula([0, 0], [H * .3, 0], Math.max(4, H * .02), "c1"); q.circulo(H * .3, 0, H * .022, "c1", L); }) });
}
/** Cozinheiro de chapéu alto que joga a panqueca para o alto e apara na frigideira. Opções: pose, virado, altura, t. Chaves: cozinheiro, chef, cozinha, receita, comida, restaurante, preparar, gastronomia */
export function cozinheiro(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.cozinheiro, ...resto }, f = (tt * .85) % 1, golpe = Math.sin(clamp(f * 4) * Math.PI);
  const ps = pose ?? { tronco: 2, cabeca: -6 * Math.sin(f * Math.PI), bracoF: [50 + golpe * 8, 46 + golpe * 16], bracoT: [-32, 104] };
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => {
    q.capsula([0, 0], [H * .14, 0], H * .03, "c1");
    q.forma([[H * .12, -H * .03], [H * .4, -H * .03], [H * .37, H * .035], [H * .15, H * .035]], "c4", { prof: 1 });
    q.em({ x: H * .26, y: -H * .05 - Math.sin(f * Math.PI) * H * .32, r: f * TAU }, () => q.forma(circP(0, 0, H * .09, 14, H * .026), "c2", L));
    for (let i = 0; i < 2; i++) { const g = (tt * .7 + i * .5) % 1; q.alfa(.7 * (1 - g), () => q.linha([[H * (.2 + i * .12), -H * (.06 + g * .14)], [H * (.2 + i * .12) + Math.sin(g * 6 + i) * H * .03, -H * (.11 + g * .14)]], sobreFundo(q), Math.max(3, H * .012))); }
  }) });
}
/** Agricultor de chapéu de palha que capina com a enxada entre brotos que balançam. Opções: pose, virado, altura, cenario (false tira os brotos), t. Chaves: agricultor, lavrador, campo, roça, plantar, colheita, agronegócio, cultivo, enxada */
export function agricultor(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.agricultor, cabelo: cabeloEscuro(p), ...resto }, f = (tt * .9) % 1, s = f < .3 ? E.entra(f / .3) : 1 - E.entraSai((f - .3) / .7);
  const ps = pose ?? { tronco: 8 + 12 * s, cabeca: 6, bracoF: [78 - 34 * s, 16], bracoT: [58 - 30 * s, 34], pernaF: [18, 10], pernaT: [-16, 2] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  lado(p, virado, () => {
    if (!resto.naMao) {
      const dx = e.maoF[0] - e.maoT[0], dy = e.maoF[1] - e.maoT[1], c = Math.hypot(dx, dy) || 1, d = [dx / c, dy / c], a = [e.maoT[0] - d[0] * H * .14, e.maoT[1] - d[1] * H * .14], b = [e.maoF[0] + d[0] * H * .36, e.maoF[1] + d[1] * H * .36];
      p.capsula(a, b, H * .026, "c2");
      p.forma([[b[0] + d[0] * H * .02, b[1] + d[1] * H * .02], [b[0] - d[0] * H * .03, b[1] - d[1] * H * .03], [b[0] - d[0] * H * .03 - d[1] * H * .13, b[1] - d[1] * H * .03 + d[0] * H * .13], [b[0] + d[0] * H * .02 - d[1] * H * .15, b[1] + d[1] * H * .02 + d[0] * H * .15]], "c4", D);
      maoPor(p, e.maoF, H, o.pele); maoPor(p, e.maoT, H, o.pele);
    }
    if (cenario) for (let i = 0; i < 2; i++) { const x = H * (.62 + i * .24), b = Math.sin(tt * 2.4 + i * 1.7) * H * .02, h = H * (.13 + i * .04); p.linha([[x, 0], [x + b, -h]], "c3", Math.max(4, H * .018)); p.forma(rotP(circP(x + b + H * .045, -h, H * .055, 10, H * .026), x + b, -h, -.5), "c3", L); p.forma(rotP(circP(x + b - H * .045, -h * .8, H * .055, 10, H * .026), x + b, -h * .8, .5), "c3", L); }
  });
  return e;
}
/** Astronauta de capacete e mochila que flutua sem peso e acena, com estrelas piscando. Opções: pose, virado, altura, cenario (false tira as estrelas), t. Chaves: astronauta, espaço, missão, exploração, futuro, gravidade zero, cosmonauta, descoberta */
export function astronauta(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), traje = trajeEspacial(p), s = Math.sin(tt * 1.2), c = Math.cos(tt * 1.2);
  const o = { ...TIPOS.astronauta, roupa: traje, calca: traje, corChapeu: traje, sapato: escuro(p, traje, .3), nasCostas: [mochilaEspacial(escuro(p, traje, .14))], ...resto };
  // o aceno fica ao lado do capacete: a mão sobe à frente, longe do visor, sem cruzar o rosto
  const ps = pose ?? { y: -.1 + .035 * s, tronco: -4 + 4 * c, cabeca: 3 * s, bracoF: [88 + 3 * Math.sin(tt * 1.3), 62 + 12 * Math.sin(tt * 2.6)], bracoT: [-34 + 10 * c, 24], pernaF: [16 + 10 * s, 26 + 10 * c], pernaT: [-14 - 10 * s, 30 - 10 * c] };
  if (cenario) for (const [x, y, i] of [[-.42, -1.0, 0], [.46, -.62, 1], [-.36, -.3, 2]]) p.em({ x: x * H * virado, y: y * H, s: .55 + .45 * Math.sin(tt * 3 + i * 2.1), r: tt * .5 + i }, () => p.forma(estrelaP(0, 0, H * .05, H * .018, 4), "c4", L));
  return personagem(p, { ...o, pose: ps, virado, altura, t });
}
/** Juiz de toga que bate o martelo na tribuna, com o estalo do veredito. Opções: pose, virado, altura, cenario (false tira a tribuna), t. Chaves: juiz, justiça, tribunal, sentença, lei, julgamento, veredito, martelo, decisão */
export function juiz(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.juiz, ...resto }, f = (tt * .8) % 1, ang = f < .22 ? lerp(124, 62, E.entra(f / .22)) : lerp(62, 124, E.entraSai((f - .22) / .78));
  const ps = pose ?? { tronco: 3, cabeca: 4, bracoF: [ang, 30], bracoT: [-6, 14] };
  if (cenario) lado(p, virado, () => {
    p.forma(retP(H * .24, -H * .5, H * .5, H * .5), "c4", { prof: 2 });
    p.forma(retP(H * .3, -H * .4, H * .38, H * .3), escuro(p, "c4", .2), L);
    p.forma(retArredP(H * .2, -H * .53, H * .58, H * .06, H * .015), "c2", D);
    p.forma(retArredP(H * .36, -H * .585, H * .16, H * .055, H * .012), "c1", D);
  });
  const e = personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => { q.capsula([0, 0], [H * .15, 0], H * .026, "c2"); q.forma(retArredP(H * .12, -H * .07, H * .075, H * .14, H * .016), "c2", { prof: 1 }); }) });
  if (pose === undefined && f > .22 && f < .5) lado(p, virado, () => { const d = dirMao(e), x = e.maoF[0] + d[0] * H * .16, y = e.maoF[1] + d[1] * H * .16 + H * .05, g = (f - .22) / .28; for (let i = 0; i < 5; i++) { const a = (-150 + i * 30) * RAD; p.alfa(1 - g, () => p.linha([[x + Math.cos(a) * H * (.1 + g * .05), y + Math.sin(a) * H * (.07 + g * .05)], [x + Math.cos(a) * H * (.15 + g * .08), y + Math.sin(a) * H * (.11 + g * .08)]], "c2", Math.max(3, H * .014))); } });
  return e;
}
const aviaozinho = (p, w, cor) => {
  p.forma([[-w * .42, -w * .05], [-w * .56, -w * .3], [-w * .4, -w * .3], [-w * .22, -w * .08]], cor, D);
  p.forma([...arcoP(w * .34, 0, w * .11, -90, 90, 6), [-w * .44, w * .09], [-w * .52, -w * .08]], cor, { prof: 1 });
  p.forma([[w * .08, w * .02], [-w * .2, w * .3], [-w * .34, w * .3], [-w * .14, w * .02]], escuro(p, cor, .25), D);
  p.forma([[w * .2, -w * .08], [w * .34, -w * .06], [w * .28, -w * .0], [w * .18, -w * .0]], "claro", L);
};
/** Piloto de quepe, asas no peito e gravata que bate continência enquanto o avião passa voando acima dele. Opções: pose, virado, altura, cenario (false tira o avião), t. Chaves: piloto, aviação, avião, comandante, voo, viagem, decolar, aeroporto */
export function pilotoAviao(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.pilotoAviao, ...resto }, s = Math.sin(tt * 1.5);
  // o avião voa alto, atrás e acima do quepe: nunca passa na frente do rosto
  if (cenario) lado(p, virado, () => {
    const x = H * (.32 + .06 * Math.sin(tt * .9)), y = -H * (1.2 + .03 * Math.sin(tt * 1.8));
    p.em({ x, y, r: -.12 + Math.cos(tt * 1.8) * .06 }, () => {
      for (let i = 0; i < 2; i++) { const f = (tt * 1.5 + i / 2) % 1, yy = (i ? 1 : -1) * H * .03; p.alfa(1 - f, () => p.linha([[-H * (.14 + f * .06), yy], [-H * (.2 + f * .06), yy]], sobreFundo(p), Math.max(3, H * .012))); }
      aviaozinho(p, H * .3, "c2");
    });
  });
  // continência com o braço de trás: a mão vai à aba do quepe por trás da cabeça, e o rosto fica livre
  const ps = pose ?? { ...POSES.continencia, cabeca: -3 + 2 * s, bracoT: [104, 150], bracoF: [-4, 10] };
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao });
}
/** Garçom de colete e gravata borboleta que anda equilibrando a bandeja com a cloche. Opções: pose, virado, altura, t. Chaves: garçom, restaurante, servir, atendimento, bandeja, pedido, bar, hospitalidade */
export function garcom(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.garcom, ...resto }, and = CICLOS.andar(tt, { vel: 1.2, amp: .8 }), b = Math.sin(tt * 1.2 * TAU * 2) * 3;
  const ps = pose ?? { ...and, tronco: 3, bracoF: [65 + b, 100 - b], bracoT: [28, 78] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao });
  if (pose === undefined) lado(p, virado, () => { const m = meio(e.cotoveloT, e.maoT, .6), bal = Math.sin(tt * 1.2 * TAU) * H * .01; p.forma([[m[0] - H * .045, m[1] - H * .035], [m[0] + H * .045, m[1] - H * .035], [m[0] + H * .045 + bal, m[1] + H * .15], [m[0] - H * .045 + bal, m[1] + H * .15]], "claro", { prof: 1 }); });
  if (!resto.naMao) lado(p, virado, () => {
    // bandeja reta na palma, com a cloche e o vapor subindo
    const inc = Math.sin(tt * 1.2 * TAU * 2) * .04;
    p.em({ x: e.maoF[0], y: e.maoF[1] - H * .03, r: inc }, () => {
      p.forma(arcoP(H * .15, -H * .02, H * .11, 180, 360, 12), "c4", { prof: 1 });
      p.circulo(H * .15, -H * .145, H * .024, "c4", L);
      p.capsula([-H * .01, 0], [H * .31, 0], H * .03, "c2");
      for (let i = 0; i < 2; i++) { const g = (tt * .8 + i * .5) % 1, x = H * (.1 + i * .1); p.alfa(.8 * (1 - g), () => p.linha([[x, -H * (.17 + g * .1)], [x + Math.sin(g * 6 + i) * H * .025, -H * (.22 + g * .1)]], sobreFundo(p), Math.max(3, H * .012))); }
    });
    maoPor(p, e.maoF, H, o.pele);
  });
  return e;
}
/** Estudante de tranças e mochila que anda lendo o livro aberto. Opções: pose, virado, altura, t. Chaves: estudante, aluno, escola, estudar, aprender, faculdade, livro, educação, conhecimento */
export function estudante(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.estudante, ...resto }, and = CICLOS.andar(tt, { vel: 1.2, amp: .85 });
  // o livro fica na altura do peito, à frente do corpo, e a cabeça se inclina para ele: rosto inteiro à vista
  const ps = pose ?? { ...and, tronco: 3, cabeca: 16 + 2 * Math.sin(tt * 1.1), bracoF: alcancar(H * .2, H * .2 + H * .006 * Math.sin(tt * 2.4), H) };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  if (!resto.naMao) lado(p, virado, () => {
    const x = e.maoF[0] + H * .02, y = e.maoF[1] - H * .02, vira = (tt * .5) % 1;
    p.em({ x, y, r: -.12 }, () => {
      p.forma([[-H * .13, -H * .1], [0, -H * .04], [H * .13, -H * .1], [H * .13, H * .02], [0, H * .07], [-H * .13, H * .02]], "c1", { prof: 1 });
      p.forma([[-H * .115, -H * .115], [0, -H * .055], [0, H * .045], [-H * .115, -H * .005]], "claro", D);
      p.forma([[H * .115, -H * .115], [0, -H * .055], [0, H * .045], [H * .115, -H * .005]], "claro", D);
      if (vira < .5) { const a = lerp(1, -1, vira * 2); p.forma([[0, -H * .055], [H * .115 * a, -H * .115 - H * .05 * (1 - a * a)], [H * .115 * a, -H * .005 - H * .05 * (1 - a * a)], [0, H * .045]], "claro", D); }
    });
    maoPor(p, e.maoF, H, o.pele);
  });
  return e;
}
/** Atleta de faixa na cabeça e número no peito correndo, com riscos de velocidade. Opções: pose, virado, altura, t. Chaves: atleta, corrida, corredor, esporte, treino, maratona, desempenho, superação, velocidade */
export function atleta(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.atleta, ...resto };
  if (resto.pele && !resto.calca) o.calca = resto.pele;
  if (pose === undefined) for (let i = 0; i < 3; i++) { const f = (tt * 1.7 + i * .37) % 1, y = -H * (.3 + i * .22); p.alfa(1 - f, () => p.linha([[-virado * H * (.3 + f * .3), y], [-virado * H * (.48 + f * .3), y]], sobreFundo(p), Math.max(4, H * .016))); }
  return personagem(p, { ...o, pose: pose ?? CICLOS.correr(tt, { vel: 1.5 }), virado, altura, t });
}
/** Pintor de boina e avental manchado que pinta a tela no cavalete, pincelada por pincelada. Opções: pose, virado, altura, cenario (false tira o cavalete), t. Chaves: pintor, artista, arte, pintura, quadro, criatividade, tela, pincel, criar */
export function pintor(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.pintor, ...resto };
  if (cenario) lado(p, virado, () => {
    const x = H * .46, y = -H * .98, w = H * .56, h = H * .5, k = ciclo(tt, 3.2, 1.2), tela = retP(x, y, w, h);
    p.capsula([x + w * .5, y - H * .04], [x + w * .95, 0], H * .028, "c4"); p.capsula([x + w * .3, y + h], [x + w * .12, 0], H * .028, "c4"); p.capsula([x + w * .7, y + h], [x + w * .78, 0], H * .028, "c4");
    p.forma(retP(x - H * .03, y + h, w + H * .06, H * .035), "c4", D);
    p.forma(tela, "claro", { prof: 2 });
    p.recortar(tela, () => {
      const k1 = clamp(k * 3), k2 = clamp(k * 3 - 1), k3 = clamp(k * 3 - 2);
      if (k1 > .02) p.forma([[x, y + h], [x, y + h * (1 - .34 * k1)], [x + w * .3, y + h * (1 - .52 * k1)], [x + w * .62, y + h * (1 - .3 * k1)], [x + w, y + h * (1 - .46 * k1)], [x + w, y + h]], "c3", L);
      if (k2 > .02) p.circulo(x + w * .7, y + h * .28, H * .07 * k2, "c2", L);
      if (k3 > .02) p.linha([[x + w * .1, y + h * .2], [x + w * (.1 + .36 * k3), y + h * .2]], "c1", Math.max(5, H * .024));
    });
    p.linha(tela, "c4", Math.max(3, H * .012), { fechar: true });
  });
  const ps = pose ?? { tronco: 3, cabeca: -3, bracoF: [84 + 9 * Math.sin(tt * 3), 14 + 12 * Math.cos(tt * 3)], bracoT: [24, 82] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (q => { q.capsula([-H * .02, 0], [H * .15, 0], H * .02, "c2"); q.capsula([H * .15, 0], [H * .2, 0], H * .034, "c1"); }) });
  if (pose === undefined) lado(p, virado, () => {
    const x = e.maoT[0] + H * .035, y = e.maoT[1] - H * .01;
    p.forma(circP(x, y, H * .1, 16, H * .075), "claro", { prof: 1, furos: [circP(x - H * .045, y + H * .015, H * .02, 8).reverse()] });
    [["c1", .02, -.035], ["c2", .06, .005], ["c3", .01, .035]].forEach(([c, dx, dy]) => p.circulo(x + H * dx, y + H * dy, H * .02, c, L));
  });
  return e;
}
/** Engenheira de capacete e colete refletivo que confere a planta enquanto o projeto se traça. Opções: pose, virado, altura, t. Chaves: engenheira, engenheiro, obra, construção, projeto, planta, planejamento, infraestrutura, arquiteta */
export function engenheira(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.engenheira, ...resto }, olha = E.entraSai(clamp(Math.sin(tt * 1.3) * 1.6 + .5));
  const ps = pose ?? { tronco: 3, cabeca: lerp(10, -16, olha), bracoF: [64 + 3 * Math.sin(tt * 2), 46], bracoT: [50, 58 - 3 * Math.sin(tt * 2)] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  if (!resto.naMao) lado(p, virado, () => {
    const x = e.maoF[0] + H * .06, y = e.maoF[1] - H * .03, w = H * .38, h = H * .26, k = ciclo(tt, 2.4, 1), lw = Math.max(3, H * .012);
    p.em({ x, y, r: -.12 + Math.sin(tt * 2) * .03 }, () => {
      p.forma(retP(-w / 2, -h / 2, w, h), "c1", { prof: 1 });
      p.capsula([-w / 2, -h / 2], [-w / 2, h / 2], H * .035, "c1"); p.capsula([w / 2, -h / 2], [w / 2, h / 2], H * .035, "c1");
      const casa = [[-w * .32, h * .3], [-w * .32, -h * .05], [-w * .1, -h * .3], [w * .12, -h * .05], [w * .12, h * .3], [w * .34, h * .3], [w * .34, h * .0]], n = Math.max(2, Math.round(k * casa.length));
      p.linha(casa.slice(0, n), "claro", lw);
    });
    maoPor(p, e.maoF, H, o.pele);
  });
  return e;
}
/** Programador de fones e óculos sentado digitando, com o código surgindo na tela. Opções: pose, virado, altura, cenario (false tira mesa, cadeira e tela), t. Chaves: programador, desenvolvedor, código, tecnologia, software, computador, digitar, home office, TI */
export function programador(p, { pose, virado = 1, altura = 300, t = 0, cenario = true, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.programador, ...resto };
  if (cenario) lado(p, virado, () => {
    p.capsula([-H * .05, -H * .15], [-H * .05, -H * .02], H * .035, "c4"); p.capsula([-H * .2, -H * .015], [H * .1, -H * .015], H * .035, "c4");
    p.capsula([-H * .2, -H * .2], [-H * .24, -H * .56], H * .05, "c4");
    p.forma(retArredP(-H * .2, -H * .19, H * .36, H * .055, H * .02), "c4", D);
  });
  const e = personagem(p, { ...o, pose: pose ?? CICLOS.digitar(tt), virado, altura, t });
  if (cenario) lado(p, virado, () => {
    const ym = -H * .455, x = H * .44, w = H * .44, h = H * .3, y = ym - H * .05 - h;
    p.capsula([H * .8, ym], [H * .8, 0], H * .04, "c2");
    p.forma(retArredP(H * .17, ym, H * .76, H * .04, H * .012), "c2", { prof: 1 });
    p.forma(retP(H * .22, ym - H * .028, H * .26, H * .028), "c4", D);
    p.capsula([x + w / 2, ym], [x + w / 2, y + h], H * .04, "c4");
    p.forma(retArredP(x, y, w, h, H * .02), "c1", { prof: 2 });
    p.forma(retP(x + H * .025, y + H * .025, w - H * .05, h - H * .05), "claro", L);
    for (let i = 0; i < 4; i++) { const k = clamp(((tt * 2.2) % 6) - i), x0 = x + H * (.05 + (i % 2) * .04), yy = y + H * (.065 + i * .055), c = H * (.14 + ((i * 37) % 30) / 220) * k; if (c > 1) p.linha([[x0, yy], [x0 + c, yy]], ["c1", "c3", "c2", "c1"][i], Math.max(4, H * .018)); }
  });
  return e;
}
/** Empresário de terno e gravata que caminha decidido balançando a maleta. Opções: pose, virado, altura, t. Chaves: empresário, executivo, negócios, chefe, empresa, carreira, reunião, investidor, trabalho */
export function empresario(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.empresario, ...resto };
  // maleta: alça em arco por cima e fecho escuro pequeno, sem barra no meio (não vira cruz de primeiros socorros)
  return personagem(p, { ...o, pose: pose ?? { ...CICLOS.andar(tt, { vel: 1.4 }), tronco: 3 }, virado, altura, t, naMao: resto.naMao ?? (q => {
    q.linha(arcoP(H * .06, 0, H * .05, 95, 265, 8), "tinta", Math.max(3, H * .016));
    q.forma(retArredP(H * .05, -H * .13, H * .19, H * .26, H * .02), "c4", { prof: 1 });
    q.linha([[H * .09, -H * .13], [H * .09, H * .13]], escuro(q, "c4", .22), Math.max(2, H * .008));
    q.forma(retP(H * .075, -H * .045, H * .03, H * .025), "tinta", L); q.forma(retP(H * .075, H * .02, H * .03, H * .025), "tinta", L);
  }) });
}
/** Mergulhador de máscara, snorkel e cilindro que nada batendo as nadadeiras e solta bolhas. Opções: pose, virado, altura, t. Chaves: mergulhador, mergulho, fundo do mar, oceano, explorar, profundidade, submarino, imersão */
export function mergulhador(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.mergulhador, ...resto }, s = Math.sin(tt * 5), b = Math.sin(tt * 1.3);
  const ps = pose ?? { y: -.34 + .03 * b, tronco: 78 + 3 * b, cabeca: -62, bracoF: [24 + 6 * b, 12], bracoT: [-150, -12 - 6 * b], pernaF: [-84 + 20 * s, -14 + 10 * s], pernaT: [-84 - 20 * s, -14 - 10 * s] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  lado(p, virado, () => {
    for (const [pe, a, cor] of [[e.peT, e.angPeT, escuro(p, "c2", .22)], [e.peF, e.angPeF, "c2"]]) { const d = [Math.sin(a), Math.cos(a)]; p.forma([[pe[0] - d[1] * H * .03, pe[1] + d[0] * H * .03], [pe[0] + d[1] * H * .03, pe[1] - d[0] * H * .03], [pe[0] + d[0] * H * .2 + d[1] * H * .075, pe[1] + d[1] * H * .2 - d[0] * H * .075], [pe[0] + d[0] * H * .2 - d[1] * H * .075, pe[1] + d[1] * H * .2 + d[0] * H * .075]], cor, D); }
    for (let i = 0; i < 4; i++) { const f = (tt * .6 + i / 4) % 1; p.alfa(1 - f * f, () => p.linha(circP(e.cabeca[0] - H * .06 + Math.sin(f * 9 + i * 2) * H * .03 - f * H * .1, e.cabeca[1] - H * (.22 + f * .34), H * (.016 + f * .024), 10), "c4", Math.max(3, H * .012), { fechar: true })); }
  });
  return e;
}
/** Rei de coroa, barba e capa que bate o cetro no chão, com a joia brilhando. Opções: pose, virado, altura, t. Chaves: rei, monarca, realeza, poder, coroa, líder, autoridade, reino, majestade */
export function rei(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.rei, cabelo: grisalho(p), ...resto }, f = (tt * .7) % 1, sobe = Math.sin(clamp(f * 2.5) * Math.PI);
  if (!resto.nasCostas) o.nasCostas = [capa("c3", Math.sin(tt * 2) * .18)];
  const ps = pose ?? { tronco: -2, cabeca: -4 + 2 * Math.sin(tt * 1.4), bracoF: [58 + sobe * 6, 62 + sobe * 16], bracoT: [-10, 16] };
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  if (!resto.naMao) lado(p, virado, () => {
    const x = e.maoF[0] + H * .01, y1 = e.maoF[1] + H * .46, y0 = e.maoF[1] - H * .34;
    p.capsula([x, Math.min(y1, 0)], [x, y0], H * .03, "c2");
    p.forma(estrelaP(x, y0 - H * .03, H * .085, H * .05, 4, 0), "c2", { prof: 1 });
    p.circulo(x, y0 - H * .03, H * .034, "c1", L);
    brilhinho(p, x + H * .09, y0 - H * .1, H * .05, tt, .2);
    maoPor(p, e.maoF, H, o.pele);
  });
  return e;
}
/** Rainha de coroa e vestido rodado que acena com a mão, a saia balançando. Opções: pose, virado, altura, t. Chaves: rainha, monarca, realeza, coroa, majestade, princesa, elegância, poder, liderança feminina */
export function rainha(p, { pose, virado = 1, altura = 300, t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.rainha, ...resto };
  if (!resto.noTronco) o.noTronco = [vestido(o.roupa, Math.sin(tt * 1.6) * .02)];
  const ps = pose ?? { tronco: Math.sin(tt * 1.6) * 1.5, cabeca: 3 * Math.sin(tt * 1.6), bracoF: [126, 44 + 16 * Math.sin(tt * 5)], bracoT: [10, 60] };
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao });
}
/** Bebê de chupeta e fralda que engatinha; com `sentado`, fica sentado balançando o chocalho. Opções: pose, virado, altura, sentado, t. Chaves: bebê, neném, criança, filho, nascimento, começo, infância, engatinhar, primeiros passos */
export function bebe(p, { pose, virado = 1, altura = 170, t = 0, sentado = false, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.bebe, ...resto }, s = Math.sin(tt * 4.4);
  if (resto.pele) { o.calca = resto.calca ?? resto.pele; o.sapato = resto.sapato ?? resto.pele; }
  // no traco, a cabeça grande do bebê fica só no contorno luminoso: o miolo volta à cor do fundo antes de olhos, tufo e chupeta
  if (p.estilo === "traco" && !resto.penteado) { const pente = PENTEADOS[o.penteado]; o.penteado = (g, r, cor) => { g.forma(circP(0, 0, r - 3.5, 32), "fundo", L); g.linha(circP(0, 0, r, 32), o.pele, 3.5, { fechar: true }); pente(g, r, cor); }; }
  const q = 30 - 18 * s, q2 = 30 + 18 * s;
  const ps = pose ?? (sentado
    ? { tronco: -4 + 3 * Math.sin(tt * 2), cabeca: 4 * Math.sin(tt * 2), pernaF: [82, 10], pernaT: [70, 16], bracoF: [100 + 30 * Math.sin(tt * 6), 50], bracoT: [30, 40] }
    : { tronco: 70, cabeca: -60 + 4 * Math.sin(tt * 2.2), y: -.012 * Math.abs(s), bracoF: [-60 + 22 * s, 30 - 10 * s], bracoT: [-60 - 22 * s, 30 + 10 * s], pernaF: [q, q + 90], pernaT: [q2, q2 + 90] });
  return personagem(p, { ...o, pose: ps, virado, altura, t, naMao: resto.naMao ?? (sentado ? (g => { g.capsula([0, 0], [H * .12, 0], H * .03, "c1"); g.circulo(H * .16, 0, H * .065, "c2", { prof: 1, liso: true }); }) : null) });
}
/** Pessoa em cadeira de rodas que impulsiona os aros, com as rodas girando. Opções: pose, virado, altura, cor (da cadeira), t. Chaves: cadeirante, cadeira de rodas, acessibilidade, inclusão, deficiência, mobilidade, PCD, autonomia */
export function cadeirante(p, { pose, virado = 1, altura = 300, cor = "c4", t = 0, ...resto } = {}) {
  const H = altura, tt = p.ritmo(t), o = { ...TIPOS.cadeirante, cabelo: cabeloEscuro(p), ...resto }, f = tt * 2.4, s = Math.sin(f), R = H * .21, cx = -H * .04, cy = -R, gira = tt * 2.6;
  const base = { tronco: 4 + 3 * s, cabeca: -2, y: -.07, pernaF: [84, 78], pernaT: [80, 76], bracoF: [2 + 24 * s, 44 - 12 * s], bracoT: [-2 + 24 * s, 48 - 12 * s] };
  const ps = pose === undefined ? base : { ...base, ...(typeof pose === "string" ? POSES[pose] : pose), y: -.07, pernaF: base.pernaF, pernaT: base.pernaT };
  lado(p, virado, () => {
    p.capsula([-H * .15, -H * .27], [-H * .19, -H * .66], H * .04, cor); p.capsula([-H * .19, -H * .66], [-H * .29, -H * .66], H * .04, cor);
    p.forma(retArredP(-H * .17, -H * .265, H * .4, H * .05, H * .02), cor, D);
  });
  const e = personagem(p, { ...o, pose: ps, virado, altura, t });
  lado(p, virado, () => {
    p.linha([[H * .2, -H * .24], [H * .29, -H * .05], [H * .4, -H * .045]], cor, Math.max(5, H * .03));
    p.circulo(H * .2, -H * .05, H * .05, cor, D); p.circulo(H * .2, -H * .05, H * .02, "claro", L);
    p.forma(circP(cx, cy, R, 28), cor, { prof: 1, furos: [circP(cx, cy, R * .8, 24).reverse()] });
    for (let i = 0; i < 3; i++) { const a = gira + i * Math.PI / 3; p.linha([[cx - Math.cos(a) * R * .82, cy - Math.sin(a) * R * .82], [cx + Math.cos(a) * R * .82, cy + Math.sin(a) * R * .82]], cor, Math.max(3, H * .013)); }
    p.circulo(cx, cy, R * .2, "c2", L);
  });
  return e;
}

/* ================================================================ GRUPOS */
const ELENCO = [
  { pele: "pele3", roupa: "c2", calca: "c1", penteado: "afro" }, { pele: "pele0", roupa: "c1", calca: "c4", chapeu: "bone", corChapeu: "c2" },
  { pele: "pele5", roupa: "c3", calca: "c1", penteado: "trancas" }, { pele: "pele1", roupa: "c4", calca: "c3", penteado: "topete", rosto: "oculos" },
  { pele: "pele2", roupa: "c1", calca: "c2", penteado: "rabo" }, { pele: "pele4", roupa: "c2", calca: "c3", penteado: "moicano", cabelo: "c1" },
];
// uma fileira só, com alturas alternadas e espaço entre as pessoas: os braços erguidos não passam sobre a cabeça vizinha
/** Multidão de pessoas de vários tons de pele acenando e pulando, cada uma no seu tempo. Opções: larg, n (quantas pessoas), semente, t. Chaves: multidão, público, pessoas, povo, plateia, sociedade, comunidade, torcida, clientes */
export function multidao(p, { larg = 420, n = 6, semente = 3, t = 0 } = {}) {
  // no pixel, figura pequena vira palito: lá a multidão tem no máximo 4 pessoas, maiores e de cabeça grande
  const px = p.estilo === "pixel", tt = p.ritmo(t), N = Math.max(1, Math.min(px ? 4 : 99, Math.round(n))), S = semear(N + 2, semente), vao = N > 1 ? larg * .86 / (N - 1) : larg;
  const A = Math.min(larg * (px ? .56 : .42), vao / (px ? .44 : .48)), cab = cabeloEscuro(p), sai = [];
  for (let i = 0; i < N; i++) {
    const g = S[i], x = (N > 1 ? i / (N - 1) - .5 : 0) * larg * .86, tl = tt + g.u * 3, tipo = ELENCO[(i + semente) % ELENCO.length];
    // braços em V (comemora) ou aceno de lado: a mão fica fora do rosto, que segue à vista
    const s = Math.abs(Math.sin(tl * (1.4 + g.v * .8) * Math.PI)), a = Math.sin(tl * (1.6 + g.v) * TAU);
    const ps = (i + semente) % 2
      ? { tronco: 0, cabeca: -4, bracoF: [118, 36 + 9 * a], bracoT: [-14, 18], y: 0 }
      : { tronco: 0, cabeca: -8, y: -.08 * s, bracoF: [116 + 8 * s, 30], bracoT: [-116 - 8 * s, -30], pernaF: [6, 18 * (1 - s)], pernaT: [-6, 18 * (1 - s)] };
    p.em({ x, y: 0 }, () => sai.push(personagem(p, { cabelo: cab, ...tipo, pose: ps, altura: A * (i % 2 ? .84 + g.w * .06 : .96 + g.w * .06), virado: x > 0 ? -1 : 1, expressao: "feliz", t, semente: 30 + i, ...(px ? { cabecao: 1.6 } : {}) })));
  }
  return sai;
}
/** Família de mãos dadas: pai e mãe com a criança pulando no meio e a filha mais velha acenando. Opções: larg, t. Chaves: família, pais, filhos, lar, união, mãe, pai, casa, proteção */
export function familia(p, { larg = 420, t = 0 } = {}) {
  const tt = p.ritmo(t), A = larg * .66, C = A * .62, x0 = -A * .2, pulo = Math.abs(Math.sin(tt * 3)) * .08, sai = [], cabelo = cabeloEscuro(p);
  let c = null;
  p.em({ x: x0, y: 0 }, () => { c = personagem(p, { cabelo, pele: "pele2", roupa: "c2", calca: "c3", penteado: "cacheado", cabecao: 1.7, altura: C, expressao: "feliz", t, semente: 41, pose: { y: -pulo, bracoF: [112, 0], bracoT: [-112, 0], pernaF: [10, 30 * (1 - pulo * 12)], pernaT: [-10, 30 * (1 - pulo * 12)], cabeca: Math.sin(tt * 3) * 4 } }); });
  const d = A * .414, om = A * .705;
  const adulto = (lado, tipo, mao) => p.em({ x: x0 + lado * -d, y: 0 }, () => sai.push(personagem(p, { cabelo, ...tipo, altura: A, virado: lado, expressao: "feliz", t, pose: { bracoF: alcancar(d - Math.abs(mao[0]), om + mao[1], A), bracoT: lado > 0 ? [150, 30 + Math.sin(tt * 6) * 26] : [-8, 14], cabeca: Math.sin(tt * 1.5 + lado) * 3, tronco: 1 } })));
  adulto(1, { pele: "pele3", roupa: "c1", calca: "c4", penteado: "topete", rosto: "barba", semente: 42 }, c.maoT);
  adulto(-1, { pele: "pele1", roupa: "c3", calca: "c1", penteado: "franja", noTronco: [saia("c1")], semente: 43 }, c.maoF);
  p.em({ x: x0 + d + A * .36, y: 0 }, () => sai.push(personagem(p, { cabelo, pele: "pele2", roupa: "c4", calca: "c1", penteado: "rabo", altura: A * .8, cabecao: 1.45, expressao: "feliz", t, semente: 44, pose: CICLOS.acenar(tt + .4, { vel: 1.8 }) })));
  sai.push(c);
  return sai;
}
