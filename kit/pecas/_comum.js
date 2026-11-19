// Kit de movimento — o que toda categoria de peças usa. Importe daqui, e só daqui, nos arquivos de kit/pecas/.
//
// CONVENÇÃO DE UMA PEÇA
//   /** O que é e o que se move. Opções: larg, cor, k (0..1 abre), t. Chaves: palavra, outra palavra, sinônimo */
//   export function nome(p, { larg = 300, cor = "c1", k = 1, t = 0 } = {}) { ... }
// - Uma linha de comentário logo acima, nesse formato: é dela e da assinatura que sai kit/indice.json.
// - Desenhada em torno da origem: o que fica no chão tem a base em y = 0 e sobe (y negativo), centrado em x = 0;
//   o que flutua (ícone, efeito, astro) fica centrado na origem. Quem usa posiciona com p.em({ x, y, s, r }, ...).
// - Só as primitivas do pincel: p.forma, p.circulo, p.elipse, p.retangulo, p.capsula, p.linha, p.seta, p.texto,
//   p.em, p.alfa, p.recortar, p.tracar (e p.medir, p.ritmo, p.estilo para consultar). Nunca o contexto do canvas.
// - Cores por papel: c1 (dominante), c2 (destaque), c3 e c4 (apoio), tinta, claro, fundo, sombra, pele0..pele5.
//   Branco ou preto de verdade (olho, dente, pupila): hex. "claro" é a cor de cartão e papel (escura em traco e
//   vidro) e "tinta" é a de contorno (some no fundo do pixel): detalhe em cima de um corpo colorido usa "tinta";
//   traço solto sobre o fundo usa uma cor c1..c4 ou sobreFundo(p).
// - Movimento próprio com `t` (segundos): use const tt = p.ritmo(t) para respeitar a cadência do estilo.
//   Progresso que quem usa controla (abrir, encher, crescer) chama-se sempre `k`, de 0 a 1.
// - Sem Math.random nem Date: use rng, semear e ruido, para o mesmo t dar sempre o mesmo quadro.
export { clamp, lerp, prog, rng, semear, ruido, E, mola } from "../movimento.js";
export { circP, retP, retArredP, rotP, capsulaP, misturarCor } from "../pinceis.js";
import { misturarCor } from "../pinceis.js";
import { clamp } from "../movimento.js";

export const TAU = Math.PI * 2;
const HEX = /^#[0-9a-f]{6}$/i;
/** Tom mais escuro de uma cor (papel ou hex), para o lado de trás ou a sombra de uma peça. */
export const escuro = (p, cor, k = .2) => { const h = p.cor(cor); return HEX.test(h) ? misturarCor(h, p.cor("tinta") === h ? "#000000" : (p.tintaClara ? p.cor("fundo") : "#000000"), k) : h; };
/** Tom mais claro de uma cor (papel ou hex), para brilho e destaque. */
export const maisClaro = (p, cor, k = .25) => { const h = p.cor(cor); return HEX.test(h) ? misturarCor(h, "#FFFFFF", k) : h; };
/** Cor que aparece sobre o fundo em qualquer estilo, para traços e brilhos soltos (no pixel/toon, "tinta" some no fundo). */
export const sobreFundo = p => (p.estilo === "pixel" || p.estilo === "toon") ? "claro" : "tinta";
/** Pontos de um arco de círculo entre dois ângulos em graus (0 = direita, 90 = baixo). */
export function arcoP(cx, cy, r, a0, a1, n = 0) { n = n || Math.max(8, Math.round(Math.abs(a1 - a0) / 12)); return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); }
/** Pontos de uma estrela de n pontas (R raio de fora, r raio de dentro). */
export function estrelaP(cx, cy, R, r, n = 5, rot = -Math.PI / 2) { return Array.from({ length: n * 2 }, (_, i) => { const a = rot + i * Math.PI / n, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, cy + Math.sin(a) * q]; }); }
/** Pontos de um polígono regular de n lados. */
export const poligonoP = (cx, cy, r, n = 6, rot = -Math.PI / 2) => Array.from({ length: n }, (_, i) => [cx + Math.cos(rot + i / n * TAU) * r, cy + Math.sin(rot + i / n * TAU) * r]);
/** Progresso 0..1 que sobe em `sobe` segundos, espera `espera` e recomeça: para peças que se repetem sozinhas. */
export const ciclo = (t, sobe = 2, espera = 1) => clamp((((t % (sobe + espera)) + sobe + espera) % (sobe + espera)) / sobe);
/** Vai e volta suave entre 0 e 1 (`vel` idas e voltas por segundo). */
export const vaiVem = (t, vel = 1) => .5 - .5 * Math.cos(t * vel * TAU);
