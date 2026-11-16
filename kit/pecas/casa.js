// Categoria: Casa e objetos
// Kit de movimento — móveis, eletrodomésticos e objetos do dia a dia, cada um com a sua vida própria.
// O que fica no chão tem a base em y = 0; o que fica na parede ou na mão é centrado na origem. Convenção em ./_comum.js.
import { clamp, lerp, rng, semear, ruido, E, circP, retP, retArredP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, misturarCor, TAU, ciclo } from "./_comum.js";

// matiz (0..360) e saturação de uma cor hex
function matiz(h) {
  const n = parseInt(h.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
  const H = !d ? 0 : mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [H * 60, mx ? d / mx : 0];
}
// cor de água ou de ar frio, escolhida por matiz: o slot mais azul ou ciano da paleta (sem repetir `evitar`, a cor do corpo).
// Sem nenhum azul na paleta: "claro" no pixel, "tinta" no traco e no vidro, "claro" com contorno (ver aguaContorno) no papel e no flat.
function corFria(p, evitar) {
  let melhor = null, nota = 1e9;
  for (const s of ["c1", "c3", "c4", "c2"]) { if (s === evitar) continue; const h = p.cor(s); if (!/^#[0-9a-f]{6}$/i.test(h)) continue; const [H, S] = matiz(h); if (H < 160 || H > 250 || S < .15) continue; const d = Math.abs(H - 205); if (d < nota) { nota = d; melhor = s; } }
  return melhor || (p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro");
}
// só quando a água caiu em "claro" num fundo claro: ganha contorno para não sumir
const aguaContorno = (p, cor) => cor === "claro" && (p.estilo === "papel" || p.estilo === "flat");

// gota d'água com a ponta para cima
const gotaP = (x, y, r) => [[x, y - r * 1.9], ...arcoP(x, y, r, -35, 215, 8)];
// chama pontuda que tremula, com a base em (x, y)
function chamaP(x, y, lg, al, tt, s = 0) {
  const d = ruido(tt * 5, s) * lg * .3, a = al * (.88 + .12 * Math.sin(tt * 11 + s * 2));
  return [[x - lg * .5, y - a * .24], [x - lg * .4, y - a * .52], [x - lg * .14 + d * .5, y - a * .8], [x + d, y - a], [x + lg * .2 + d * .4, y - a * .7], [x + lg * .46, y - a * .44], [x + lg * .46, y - a * .2], [x + lg * .28, y - a * .04], [x, y], [x - lg * .3, y - a * .05]];
}
// folha em forma de lente, de pé, com a base em (0, 0)
const folhaP = (comp, meia, n = 9) => { const o = []; for (let i = 0; i <= n; i++) { const th = i / n * Math.PI; o.push([meia * Math.sin(th) ** 1.5, -comp * (.5 - .5 * Math.cos(th))]); } for (let i = n - 1; i > 0; i--) { const th = i / n * Math.PI; o.push([-meia * Math.sin(th) ** 1.5, -comp * (.5 - .5 * Math.cos(th))]); } return o; };
// fio de vapor ou de ar que ondula subindo
const fioP = (x, y0, y1, amp, fase, n = 7) => Array.from({ length: n + 1 }, (_, i) => [x + Math.sin(i / n * 5 + fase) * amp * (.4 + i / n), lerp(y0, y1, i / n)]);

/** Sofá de dois lugares: os assentos afundam e a almofada quica. Opções: larg, cor, almofada, t. Chaves: sofá, sala, descanso, conforto, estofado, lar, relaxar, zona de conforto */
export function sofa(p, { larg = 400, cor = "c1", almofada = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .55) % 1, q = Math.exp(-f * 1.6) * Math.cos(f * 15), pe = escuro(p, cor, .45);
  const salto = Math.abs(Math.sin(f * Math.PI * 2.5)) * Math.exp(-f * 1.4) * w * .12, resp = Math.sin(tt * 2.6);
  for (const x of [-w * .4, w * .4]) p.forma(retP(x - w * .035, -w * .07, w * .07, w * .07), pe, { prof: 0, liso: true });
  p.em({ x: 0, y: 0, sy: 1 + resp * .015 }, () => p.forma(retArredP(-w * .4, -w * .54, w * .8, w * .4, w * .09), escuro(p, cor, .16), { prof: 2 }));
  for (const s of [-1, 1]) p.em({ x: s * w * .185, y: -w * .07, sy: 1 + .045 * Math.sin(tt * 2.6 + s * 1.3) - q * .12 * s }, () => p.forma(retArredP(-w * .18, -w * .2, w * .36, w * .2, w * .05), cor, { prof: 1 }));
  for (const s of [-1, 1]) p.forma(retArredP(s > 0 ? w * .36 : -w * .5, -w * .38, w * .14, w * .32, w * .065), cor, { prof: 1 });
  p.em({ x: -w * .19 + Math.sin(f * TAU) * w * .03, y: -w * .34 - salto, r: -.22 + q * .45 }, () => p.forma(retArredP(-w * .09, -w * .09, w * .18, w * .18, w * .04), almofada, { prof: 1 }));
}
/** Cama de perfil: a coberta sobe e desce como quem respira e os Z de sono flutuam. Opções: larg, cor, madeira, t. Chaves: cama, dormir, sono, descanso, quarto, noite, cansaço, sonho */
export function cama(p, { larg = 420, cor = "c4", madeira = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), resp = .5 + .5 * Math.sin(tt * 2.2);
  p.forma(retArredP(-w * .5, -w * .5, w * .09, w * .5, w * .03), madeira, { prof: 2 });
  p.forma(retArredP(w * .41, -w * .3, w * .09, w * .3, w * .03), madeira, { prof: 2 });
  p.forma(retP(-w * .43, -w * .15, w * .86, w * .07), escuro(p, madeira, .25), { prof: 0 });
  p.forma(retArredP(-w * .42, -w * .29, w * .84, w * .15, w * .04), escuro(p, "claro", .12), { prof: 1 });
  p.forma(retArredP(-w * .4, -w * .37, w * .24, w * .11, w * .05), "claro", { prof: 1 });
  const cob = [[-w * .12, -w * .14], [-w * .12, -w * .3]]; for (let i = 0; i <= 8; i++) { const u = i / 8; cob.push([lerp(-w * .1, w * .41, u), -w * .31 - Math.sin(u * Math.PI) ** .7 * w * (.05 + .035 * resp)]); } cob.push([w * .41, -w * .14]);
  p.forma(cob, cor, { prof: 1 });
  p.forma(retP(-w * .12, -w * .32, w * .07, w * .18), maisClaro(p, cor, .4), { prof: 0, liso: true });
  for (let i = 0; i < 3; i++) { const z = (tt * .4 + i / 3) % 1; p.alfa(Math.sin(z * Math.PI), () => p.texto("Z", -w * .28 + z * w * .16 + Math.sin(z * 9) * w * .02, -w * .46 - z * w * .28, { tam: w * (.07 + .07 * z), cor: sobreFundo(p) })); }
}
/** Mesa de jantar com uma caneca fumegando em cima. Opções: larg, cor, t. Chaves: mesa, jantar, refeição, reunião, negociação, café, cozinha, família */
export function mesa(p, { larg = 360, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .25);
  for (const s of [-1, 1]) p.forma([[s * w * .43, -w * .52], [s * w * .35, -w * .52], [s * w * .38, 0], [s * w * .45, 0]], esc, { prof: 1 });
  p.forma(retP(-w * .39, -w * .52, w * .78, w * .06), esc, { prof: 0, liso: true });
  p.forma(retArredP(-w / 2, -w * .59, w, w * .08, w * .025), cor, { prof: 2 });
  const cx = w * .1, y = -w * .59;
  p.linha(arcoP(cx + w * .07, y - w * .08, w * .045, -80, 80, 6), "c1", w * .03);
  p.forma(retArredP(cx - w * .07, y - w * .15, w * .14, w * .15, w * .02), "c1", { prof: 1 });
  for (let i = 0; i < 2; i++) { const f = (tt * .55 + i * .5) % 1; p.alfa(Math.sin(f * Math.PI), () => p.linha(fioP(cx - w * .03 + i * w * .06, y - w * .18 - f * w * .08, y - w * .32 - f * w * .08, w * .018, tt * 4 + i * 2), sobreFundo(p), w * .02)); }
  p.forma(retArredP(-w * .36, y - w * .025, w * .24, w * .025, w * .01), "claro", { prof: 0, liso: true });
}
/** Cadeira de madeira que balança de um pé para o outro. Opções: larg, cor, t. Chaves: cadeira, assento, sentar, vaga, cargo, lugar, espera, móvel */
export function cadeira(p, { larg = 220, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = Math.sin(tt * 3) * .07, px = r > 0 ? w * .46 : -w * .46, esc = escuro(p, cor, .28);
  p.em({ x: px, y: 0, r }, () => p.em({ x: -px, y: 0 }, () => {
    for (const s of [-1, 1]) p.forma(retP(s * w * .3 - w * .04, -w * .7, w * .08, w * .64), esc, { prof: 0 });
    for (const s of [-1, 1]) p.forma(retArredP(s * w * .36 - w * .05, -w * 1.56, w * .1, w * .86, w * .03), cor, { prof: 1 });
    p.forma(retArredP(-w * .42, -w * 1.6, w * .84, w * .2, w * .05), cor, { prof: 1 });
    p.forma(retP(-w * .34, -w * 1.2, w * .68, w * .1), esc, { prof: 0 });
    p.forma([[-w * .38, -w * .8], [w * .38, -w * .8], [w * .5, -w * .64], [-w * .5, -w * .64]], cor, { prof: 1 });
    p.forma(retArredP(-w * .5, -w * .64, w, w * .1, w * .02), esc, { prof: 1 });
    for (const s of [-1, 1]) p.forma(retArredP(s * w * .43 - w * .05, -w * .56, w * .1, w * .56, w * .02), cor, { prof: 1 });
  }));
}
/** Estante com três prateleiras de livros: um livro sobe como quem é puxado e os encostados balançam. Opções: larg, cor, semente, t. Chaves: estante, livros, biblioteca, conhecimento, estudo, acervo, prateleira, organização */
export function estante(p, { larg = 300, cor = "c2", semente = 0, t = 0 } = {}) {
  const w = larg, h = w * 1.3, tt = p.ritmo(t), b = w * .06, nh = (h - b * 4) / 3, r = rng(semente + 11), cores = ["c1", "c3", "c4", "claro"].filter(c => c !== cor);
  const vez = ((Math.floor(tt / 1.4) % 3) + 3) % 3, fp = ((tt % 1.4) + 1.4) % 1.4 / 1.4, puxa = Math.sin(fp * Math.PI) ** .7;
  let livroPuxado = null;
  p.forma(retP(-w / 2, -h, w, h), cor, { prof: 2 });
  for (let i = 0; i < 3; i++) {
    const yb = -b - i * (nh + b), fim = w / 2 - b; let x = -w / 2 + b + w * .015, j = 0;
    p.forma(retP(-w / 2 + b, yb - nh, w - b * 2, nh), escuro(p, cor, .4), { prof: 0, liso: true });
    while (x < fim - w * .3) {
      const bw = w * (.075 + r() * .045), bh = nh * (.6 + r() * .3), cr = cores[(j + i) % cores.length];
      if (i === vez && j === 1 + i) { p.forma(retP(x, yb - bh, bw, bh), escuro(p, cor, .55), { prof: 0, liso: true }); livroPuxado = { x, yb, bw, bh, cr }; }
      else p.forma(retP(x, yb - bh, bw, bh), cr, { prof: 0, liso: true });
      x += bw + w * .008; j++;
    }
    const bh = nh * .78, bw = w * .09;
    p.em({ x: x + bh * .3, y: yb, r: -.28 + Math.sin(tt * 2.4 + i * 2) * .12 }, () => p.forma(retP(0, -bh, bw, bh), cores[(j + i + 1) % cores.length], { prof: 0, liso: true }));
  }
  // o livro puxado sai da fileira: sobe além da prateleira, inclina e cresce um pouco, como se viesse para a frente
  if (livroPuxado) { const { x, yb, bw, bh, cr } = livroPuxado; p.em({ x: x + bw / 2 + puxa * w * .04, y: yb - puxa * (nh - bh + nh * .35), r: puxa * .22, s: 1 + puxa * .12 }, () => p.forma(retP(-bw / 2, -bh, bw, bh), cr, { prof: puxa > .1 ? 1 : 0, liso: true })); }
}
/** Geladeira com freezer: a porta abre mostrando as prateleiras e o ar frio escorre para fora. Opções: larg, cor, k (0 fechada, 1 escancarada), t. Chaves: geladeira, refrigerador, cozinha, comida, mercado, frio, conservar, despensa */
export function geladeira(p, { larg = 220, cor = "c4", k = .7, t = 0 } = {}) {
  const w = larg, h = w * 1.9, tt = p.ritmo(t), kk = clamp(k), a = E.entraSai(kk) * 2.2, c = Math.cos(a), s = Math.sin(a), fz = h * .3, yT = -h + fz + w * .03, yB = -w * .05;
  for (const x of [-w * .36, w * .36]) p.forma(retP(x - w * .06, -w * .05, w * .12, w * .05), escuro(p, cor, .45), { prof: 0, liso: true });
  p.em({ x: Math.sin(tt * 31) * w * .004, y: 0 }, () => {
    p.forma(retArredP(-w / 2, -h, w, h - w * .03, w * .06), escuro(p, cor, .18), { prof: 2 });
    if (kk > .02) {
      p.forma(retP(-w * .43, yT + w * .03, w * .86, yB - yT - w * .06), "claro", { prof: 0, liso: true });
      for (const y of [yT + (yB - yT) * .36, yT + (yB - yT) * .68]) p.forma(retP(-w * .43, y, w * .86, w * .03), escuro(p, "claro", .25), { prof: 0, liso: true });
      const y1 = yT + (yB - yT) * .36, y2 = yT + (yB - yT) * .68, y3 = yB - w * .03;
      p.forma(retArredP(-w * .34, y1 - w * .26, w * .13, w * .26, w * .03), "c3", { prof: 0, liso: true }); p.forma(retP(-w * .3, y1 - w * .33, w * .05, w * .08), "c3", { prof: 0, liso: true });
      p.forma(retP(-w * .08, y1 - w * .18, w * .22, w * .18), "c2", { prof: 0, liso: true });
      p.circulo(-w * .22, y2 - w * .08, w * .08, "c1", { prof: 0, liso: true }); p.circulo(-w * .04, y2 - w * .08, w * .08, "c2", { prof: 0, liso: true });
      p.forma(retArredP(-w * .36, y3 - w * .15, w * .5, w * .15, w * .03), "c3", { prof: 0, liso: true });
    }
    const xf = w / 2 - w * c, dy = s * w * .13;
    p.forma([[w / 2, yT], [xf, yT + dy], [xf, yB + dy], [w / 2, yB]], c > 0 ? cor : escuro(p, cor, .1), { prof: 1 });
    if (c > .25) p.capsula([lerp(w / 2, xf, .84), yT + h * .07 + dy * .84], [lerp(w / 2, xf, .84), yT + h * .26 + dy * .84], w * .05, "tinta");
    p.forma(retArredP(-w / 2, -h, w, fz, w * .06), cor, { prof: 1 });
    p.capsula([-w * .36, -h + fz * .38], [-w * .36, -h + fz * .8], w * .05, "tinta");
    p.circulo(w * .34, -h + fz * .28, w * .04, Math.sin(tt * 5) > 0 ? "c2" : "tinta", { prof: 0, liso: true });
  });
  if (kk > .15) for (let i = 0; i < 4; i++) { const f = (tt * .35 + i / 4) % 1; p.alfa(Math.sin(f * Math.PI) * .55 * kk, () => p.elipse(-w * .34 + i * w * .19 + Math.sin(tt * 2 + i) * w * .03, -h * .2 + f * h * .2, w * (.1 + .08 * f), w * .05, maisClaro(p, "c4", .6), { prof: 0, liso: true })); }
}
/** Fogão com forno: a chama da boca tremula, a tampa da panela pula e o vapor sobe. Opções: larg, cor, t. Chaves: fogão, cozinhar, cozinha, panela, receita, comida, forno, gás */
export function fogao(p, { larg = 300, cor = "c4", t = 0 } = {}) {
  const w = larg, h = w * 1.02, tt = p.ritmo(t), pula = Math.max(0, Math.sin(tt * 9)) * w * .02;
  for (const x of [-w * .38, w * .38]) p.forma(retP(x - w * .05, -w * .05, w * .1, w * .05), escuro(p, cor, .5), { prof: 0, liso: true });
  for (let i = 0; i < 3; i++) p.forma(chamaP(w * .14 + i * w * .1, -h - w * .015, w * .09, w * (.13 + (i === 1 ? .04 : 0)), tt, i), i === 1 ? "c2" : "c1", { prof: 0, liso: true, semente: i + 1 });
  p.forma(retArredP(-w / 2, -h, w, h - w * .04, w * .03), cor, { prof: 2 });
  p.forma(retP(-w / 2, -h, w, w * .2), escuro(p, cor, .25), { prof: 0, liso: true });
  for (let i = 0; i < 4; i++) { const x = -w * .33 + i * w * .22, a = i === 3 ? Math.sin(tt * 2) * .8 + 1 : .3 * i; p.circulo(x, -h + w * .1, w * .05, "claro", { prof: 0, liso: true }); p.linha([[x, -h + w * .1], [x + Math.sin(a) * w * .045, -h + w * .1 - Math.cos(a) * w * .045]], "tinta", w * .02); }
  p.forma(retArredP(-w * .42, -h + w * .27, w * .84, w * .62, w * .03), escuro(p, cor, .1), { prof: 1 });
  p.forma(retArredP(-w * .32, -h + w * .43, w * .64, w * .36, w * .03), "tinta", { prof: 0, liso: true });
  p.alfa(.5 + .3 * Math.sin(tt * 3), () => p.forma(retArredP(-w * .28, -h + w * .47, w * .56, w * .28, w * .02), "c2", { prof: 0, liso: true }));
  p.capsula([-w * .32, -h + w * .35], [w * .32, -h + w * .35], w * .04, "claro");
  const px = -w * .2, py = -h;
  p.capsula([px + w * .16, py - w * .12], [px + w * .34, py - w * .12], w * .04, "tinta");
  p.forma(retArredP(px - w * .18, py - w * .17, w * .36, w * .17, w * .03), "c3", { prof: 1 });
  p.em({ x: px, y: py - w * .17 - pula, r: Math.sin(tt * 9) * .04 }, () => { p.forma(retArredP(-w * .2, -w * .04, w * .4, w * .045, w * .02), escuro(p, "c3", .2), { prof: 0, liso: true }); p.circulo(0, -w * .06, w * .03, "tinta", { prof: 0, liso: true }); });
  for (let i = 0; i < 2; i++) { const f = (tt * .6 + i * .5) % 1; p.alfa(Math.sin(f * Math.PI), () => p.linha(fioP(px - w * .06 + i * w * .12, py - w * .26 - f * w * .08, py - w * .4 - f * w * .08, w * .02, tt * 4 + i * 2), sobreFundo(p), w * .022)); }
}
/** Micro-ondas ligado: o prato gira com a comida, a luz pulsa e o visor conta os segundos. Opções: larg, cor, t. Chaves: micro-ondas, esquentar, comida pronta, rápido, cozinha, praticidade, tempo, marmita */
export function microondas(p, { larg = 360, cor = "c4", t = 0 } = {}) {
  const w = larg, h = w * .6, tt = p.ritmo(t), jan = retArredP(-w * .44, -h + w * .07, w * .6, h - w * .16, w * .03), seg = 29 - Math.floor(tt) % 30;
  for (const x of [-w * .38, w * .38]) p.forma(retP(x - w * .05, -w * .03, w * .1, w * .03), escuro(p, cor, .5), { prof: 0, liso: true });
  p.forma(retArredP(-w / 2, -h, w, h - w * .02, w * .05), cor, { prof: 2 });
  p.forma(jan, "tinta", { prof: 0, liso: true });
  p.alfa(.4 + .2 * Math.sin(tt * 4), () => p.forma(retArredP(-w * .41, -h + w * .1, w * .54, h - w * .22, w * .02), "c2", { prof: 0, liso: true }));
  p.recortar(jan, () => {
    const cx = -w * .14, cy = -w * .15, a = tt * 1.8, x = cx + Math.cos(a) * w * .1, s = 1 + .14 * Math.sin(a);
    p.elipse(cx, cy, w * .22, w * .04, "claro", { prof: 0, liso: true });
    p.em({ x, y: cy - w * .005 + Math.sin(a) * w * .012, s }, () => { p.forma([[-w * .08, -w * .1], [w * .08, -w * .1], [w * .055, 0], [-w * .055, 0]], "c1", { prof: 0, liso: true }); p.elipse(0, -w * .1, w * .08, w * .02, "c3", { prof: 0, liso: true }); });
  });
  p.capsula([w * .185, -h + w * .1], [w * .185, -w * .12], w * .028, escuro(p, cor, .4));
  p.forma(retArredP(w * .235, -h + w * .08, w * .22, w * .11, w * .02), "tinta", { prof: 0, liso: true });
  p.texto("0:" + String(seg).padStart(2, "0"), w * .345, -h + w * .138, { tam: w * .068, cor: p.estilo === "vidro" ? "fundo" : "c3" });
  for (let i = 0; i < 4; i++) p.circulo(w * .29 + (i % 2) * w * .11, -h + w * .27 + Math.floor(i / 2) * w * .09, w * .032, "claro", { prof: 0, liso: true });
  p.forma(retArredP(w * .25, -w * .14, w * .19, w * .07, w * .03), Math.sin(tt * 6) > 0 ? "c3" : "c1", { prof: 0, liso: true });
}
/** Máquina de lavar de porta redonda: o tambor gira as roupas na água e a máquina treme. Opções: larg, cor, t. Chaves: máquina de lavar, lavar roupa, lavanderia, limpeza, ciclo, tarefa doméstica, rotina, sabão */
export function maquinaDeLavar(p, { larg = 280, cor = "c3", t = 0 } = {}) {
  const w = larg, h = w * 1.2, tt = p.ritmo(t), cy = -h * .43, R = w * .29, vidro = circP(0, cy, R, 28), a = tt * 4;
  for (const x of [-w * .36, w * .36]) p.forma(retP(x - w * .06, -w * .04, w * .12, w * .04), escuro(p, cor, .5), { prof: 0, liso: true });
  p.em({ x: Math.sin(tt * 28) * w * .008, y: 0, r: Math.sin(tt * 19) * .006 }, () => {
    p.forma(retArredP(-w / 2, -h, w, h - w * .03, w * .05), cor, { prof: 2 });
    p.forma(retP(-w / 2, -h + w * .01, w, w * .2), escuro(p, cor, .2), { prof: 0, liso: true });
    p.forma(retArredP(-w * .42, -h + w * .055, w * .34, w * .11, w * .02), "tinta", { prof: 0, liso: true });
    for (let i = 0; i < 3; i++) p.forma(retP(-w * .38 + i * w * .1, -h + w * .09, w * .06, w * .04), Math.floor(tt * 3) % 3 === i ? "c2" : "c4", { prof: 0, liso: true });
    p.circulo(w * .3, -h + w * .11, w * .065, "claro", { prof: 0, liso: true });
    p.linha([[w * .3, -h + w * .11], [w * .3 + Math.cos(tt * 1.2) * w * .06, -h + w * .11 + Math.sin(tt * 1.2) * w * .06]], "tinta", w * .022);
    p.circulo(0, cy, w * .38, "claro", { prof: 1 });
    p.forma(vidro, "tinta", { prof: 0, liso: true });
    p.recortar(vidro, () => {
      const agua = [[-R, cy + R], [-R, cy + R * .1]]; for (let i = 0; i <= 8; i++) agua.push([-R + i * R / 4, cy + R * .1 + Math.sin(i * 1.3 + tt * 7) * R * .1]); agua.push([R, cy + R]);
      p.forma(agua, "c4", { prof: 0, liso: true });
      ["c1", "c2", "claro"].forEach((cr, i) => { const b = a + i * TAU / 3; p.em({ x: Math.cos(b) * R * .48, y: cy + Math.sin(b) * R * .48, r: b * 1.5 }, () => p.forma(retArredP(-R * .3, -R * .22, R * .6, R * .44, R * .16), cr, { prof: 0, liso: true })); });
    });
    p.linha(arcoP(0, cy, R * .78, 200, 255, 6), maisClaro(p, "c4", .7), w * .025);
  });
}
/** Abajur de mesa aceso: a luz pulsa embaixo da cúpula e a cordinha balança. Opções: alt, cor, pe, t. Chaves: abajur, luminária, luz, leitura, aconchego, noite, quarto, iluminar */
export function abajur(p, { alt = 380, cor = "c1", pe = "c4", t = 0 } = {}) {
  const h = alt, w = h * .6, tt = p.ritmo(t), luz = .3 + .08 * Math.sin(tt * 3) + .05 * ruido(tt * 6, 3), bal = Math.sin(tt * 2.6) * .32;
  const cone = [[-w * .36, -h * .6], [w * .36, -h * .6], [w * .62, -h * .03], [-w * .62, -h * .03]];
  if (p.estilo === "pixel" && /^#[0-9a-f]{6}$/i.test(p.cor("fundo")) && /^#[0-9a-f]{6}$/i.test(p.cor("claro"))) {
    // no pixel a transparência não sobrevive à paleta: o cone vira dois tons sólidos entre o fundo e a luz, e pulsa trocando de tom
    let quente = p.cor("claro");
    for (const s of ["c4", "c2", "c3", "c1"]) { if (s === cor) continue; const hx = p.cor(s); if (!/^#[0-9a-f]{6}$/i.test(hx)) continue; const [H, S] = matiz(hx); if (H >= 25 && H <= 65 && S > .3) { quente = misturarCor(p.cor("claro"), hx, .55); break; } }
    const nv = Math.round(clamp((luz - .22) / .16) * 2), luzP = misturarCor(p.cor("fundo"), quente, .28 + nv * .06);
    p.forma(cone, luzP, { prof: 0, liso: true });
    p.forma([[-w * .3, -h * .6], [w * .3, -h * .6], [w * .4, -h * .2], [-w * .4, -h * .2]], misturarCor(p.cor("fundo"), quente, .46 + nv * .07), { prof: 0, liso: true });
  } else p.alfa(luz, () => p.forma(cone, "c2", { prof: 0, liso: true }));
  p.forma(retArredP(-w * .3, -h * .065, w * .6, h * .065, h * .03), pe, { prof: 1 });
  p.forma(retP(-w * .04, -h * .64, w * .08, h * .58), pe, { prof: 0 });
  p.elipse(0, -h * .2, w * .16, h * .13, pe, { prof: 1 });
  const cx = w * .22, cy = -h * .6, L = h * .17, fx = cx + Math.sin(bal) * L, fy = cy + Math.cos(bal) * L;
  p.linha([[cx, cy], [fx, fy]], sobreFundo(p), h * .012); p.circulo(fx, fy, h * .026, "c2", { prof: 0, liso: true });
  p.forma([[-w * .27, -h], [w * .27, -h], [w * .5, -h * .6], [-w * .5, -h * .6]], cor, { prof: 2 });
  p.forma([[-w * .44, -h * .7], [w * .44, -h * .7], [w * .5, -h * .6], [-w * .5, -h * .6]], escuro(p, cor, .2), { prof: 0, liso: true });
}
/** Porta que abre deixando a luz passar e fica rangendo de leve. Opções: larg, cor, k (0 fechada, 1 aberta), t. Chaves: porta, entrada, saída, oportunidade, acesso, abrir, convite, passagem, novo começo */
export function porta(p, { larg = 220, cor = "c1", k = .6, t = 0 } = {}) {
  const w = larg, h = w * 1.85, tt = p.ritmo(t), kk = clamp(clamp(k) + Math.sin(tt * 1.7) * .07 * Math.min(1, clamp(k) * 4 + .3)), a = kk * 1.3, c = Math.max(.06, Math.cos(a)), dy = Math.sin(a) * w * .16;
  const pt = (u, v) => [-w / 2 + u * w * c, lerp(-h + dy * u, -dy * u, v)], quad = (u0, u1, v0, v1) => [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)];
  p.forma(retP(-w * .58, -h - w * .08, w * 1.16, h + w * .08), escuro(p, cor, .4), { prof: 1, furos: [retP(-w / 2, -h, w, h).reverse()] });
  p.forma(retP(-w / 2, -h, w, h), "c2", { prof: 0, liso: true });
  if (kk > .05) for (let i = 0; i < 3; i++) { const f = (tt * .5 + i / 3) % 1; p.alfa(Math.sin(f * Math.PI) * .7, () => p.forma(estrelaP(w * (.1 + i * .13), -h * (.25 + .5 * ((i * .37 + f * .3) % 1)), w * .07, w * .022, 4), "claro", { prof: 0, liso: true })); }
  p.forma(quad(0, 1, 0, 1), cor, { prof: 2 });
  p.forma(quad(.16, .84, .07, .44), escuro(p, cor, .16), { prof: 0, liso: true });
  p.forma(quad(.16, .84, .56, .93), escuro(p, cor, .16), { prof: 0, liso: true });
  const m = pt(.86, .52); p.circulo(m[0], m[1], w * .05, "tinta", { prof: 0, liso: true });
}
/** Janela com cortinas que balançam ao vento, sol e nuvem passando lá fora. Opções: larg, cor (cortina), moldura, t. Chaves: janela, vista, vento, cortina, manhã, lá fora, horizonte, oportunidade, ar fresco */
export function janela(p, { larg = 300, cor = "c1", moldura = "claro", t = 0 } = {}) {
  const w = larg, h = w * 1.1, tt = p.ritmo(t), vao = retP(-w * .42, -h * .42, w * .84, h * .84);
  p.forma(vao, "c4", { prof: 0, liso: true });
  p.recortar(vao, () => {
    p.circulo(w * .12, -h * .18, w * .11 * (1 + .06 * Math.sin(tt * 3)), "c2", { prof: 0, liso: true });
    const x = ((tt * w * .1 + w * .5) % (w * 1.5)) - w * .75;
    for (const [dx, dy, r] of [[-w * .1, 0, w * .07], [0, -w * .04, w * .09], [w * .11, 0, w * .07]]) p.circulo(x + dx, h * .08 + dy, r, "claro", { prof: 0, liso: true });
    p.forma([[-w * .42, h * .42], [-w * .42, h * .3], [-w * .2, h * .22], [w * .05, h * .3], [w * .25, h * .24], [w * .42, h * .32], [w * .42, h * .42]], "c3", { prof: 0, liso: true });
  });
  p.forma(retArredP(-w / 2, -h / 2, w, h, w * .03), moldura, { prof: 2, furos: [vao.slice().reverse()] });
  p.forma(retP(-w * .025, -h * .42, w * .05, h * .84), moldura, { prof: 0, liso: true });
  p.forma(retP(-w * .42, -w * .025, w * .84, w * .05), moldura, { prof: 0, liso: true });
  p.forma(retArredP(-w * .58, h / 2 - w * .02, w * 1.16, w * .08, w * .02), escuro(p, moldura, .15), { prof: 1 });
  for (const s of [-1, 1]) {
    const o = [[s * w * .64, -h * .56], [s * w * .27, -h * .56]];
    for (let i = 1; i <= 6; i++) { const v = i / 6; o.push([s * w * (.27 + .06 * v) + Math.sin(tt * 2.2 + v * 4 + s) * w * .05 * v, lerp(-h * .56, h * .46, v)]); }
    const xi = o[o.length - 1][0]; for (let i = 1; i <= 4; i++) o.push([lerp(xi, s * w * .64, i / 4), h * .46 + (i % 2 ? w * .035 : 0)]);
    p.forma(o, cor, { prof: 1, semente: s + 3 });
    p.linha([[s * w * .47, -h * .5], [s * w * .47 + Math.sin(tt * 2.2 + 3 + s) * w * .02, h * .4]], escuro(p, cor, .22), w * .02);
  }
  p.capsula([-w * .68, -h * .57], [w * .68, -h * .57], w * .04, escuro(p, cor, .4));
}
/** Vaso com planta de folhas grandes que balançam. Opções: alt, cor (vaso), folha, t. Chaves: planta, vaso, crescimento, natureza, cuidado, verde, decoração, vida, cultivar */
export function vasoDePlanta(p, { alt = 360, cor = "c1", folha = "c3", t = 0 } = {}) {
  const h = alt, w = h * .5, tt = p.ritmo(t), fs = [[-1.05, .44], [1.05, .44], [-.55, .56], [.55, .56], [0, .64]];
  fs.forEach(([ang, L], i) => p.em({ x: ang * w * .1, y: -h * .36, r: ang + Math.sin(tt * 1.8 + i * 1.3) * .07 * (1 + Math.abs(ang)) }, () => {
    p.linha([[0, 0], [0, -h * L * .45]], escuro(p, folha, .3), h * .022);
    p.em({ x: 0, y: -h * L * .3 }, () => p.forma(folhaP(h * L * .7, h * L * .22), i % 2 ? folha : escuro(p, folha, .14), { prof: 1, semente: i + 2 }));
    p.linha([[0, -h * L * .36], [0, -h * L * .86]], escuro(p, folha, .35), h * .014);
  }));
  p.forma([[-w * .42, -h * .36], [w * .42, -h * .36], [w * .3, 0], [-w * .3, 0]], cor, { prof: 2 });
  p.forma(retArredP(-w * .48, -h * .42, w * .96, h * .09, h * .02), maisClaro(p, cor, .18), { prof: 1 });
}
/** Quadro de paisagem pendurado num prego, balançando de leve, com o sol pulsando na tela. Opções: larg, cor (moldura), t. Chaves: quadro, pintura, arte, moldura, decoração, parede, lembrança, galeria */
export function quadro(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, h = w * .78, tt = p.ritmo(t), fio = w * .18, py = -(fio + h) / 2, tela = retP(-w * .41, fio + w * .09, w * .82, h - w * .18);
  p.em({ x: 0, y: py, r: Math.sin(tt * 1.7) * .075 }, () => {
    p.linha([[-w * .3, fio + w * .02], [0, 0], [w * .3, fio + w * .02]], sobreFundo(p), w * .014);
    p.forma(retP(-w / 2, fio, w, h), cor, { prof: 2 });
    p.forma(tela, "c4", { prof: 0, liso: true });
    p.recortar(tela, () => {
      p.circulo(w * .16, fio + h * .36, w * .09 * (1 + .1 * Math.sin(tt * 3)), "c2", { prof: 0, liso: true });
      p.forma([[-w * .41, fio + h], [-w * .41, fio + h * .66], [-w * .16, fio + h * .34], [w * .08, fio + h * .7], [w * .08, fio + h]], "c3", { prof: 0, liso: true });
      p.forma([[-w * .08, fio + h], [w * .2, fio + h * .52], [w * .41, fio + h * .74], [w * .41, fio + h]], escuro(p, "c3", .25), { prof: 0, liso: true });
    });
  });
  p.circulo(0, py, w * .03, sobreFundo(p), { prof: 0, liso: true });
}
/** Espelho oval de penteadeira com o reflexo deslizando pelo vidro e um brilho piscando. Opções: alt, cor, t. Chaves: espelho, reflexo, autoimagem, vaidade, autoconhecimento, aparência, se olhar, identidade */
export function espelho(p, { alt = 360, cor = "c2", t = 0 } = {}) {
  const h = alt, w = h * .62, tt = p.ritmo(t), cy = -h * .56, vid = circP(0, cy, w * .39, 32, h * .345), f = .5 + .5 * Math.sin(tt * 1.4), b = maisClaro(p, "c4", .6);
  p.forma(retArredP(-w * .34, -h * .06, w * .68, h * .06, h * .03), cor, { prof: 1 });
  p.forma([[-w * .07, -h * .05], [-w * .05, -h * .16], [w * .05, -h * .16], [w * .07, -h * .05]], escuro(p, cor, .2), { prof: 0 });
  p.elipse(0, cy, w * .5, h * .43, cor, { prof: 2 });
  p.forma(vid, "c4", { prof: 0, liso: true });
  p.recortar(vid, () => { const x = lerp(-w * .02, w * .36, f); for (const [dx, lg] of [[0, w * .16], [w * .24, w * .08]]) p.forma([[x + dx, cy - h * .4], [x + dx + lg, cy - h * .4], [x + dx + lg - w * .35, cy + h * .4], [x + dx - w * .35, cy + h * .4]], b, { prof: 0, liso: true }); });
  const s = Math.abs(Math.sin(tt * 2.2));
  p.em({ x: w * .3, y: cy - h * .3, s: .35 + s * .75, r: tt * .8 }, () => p.forma(estrelaP(0, 0, w * .17, w * .05, 4), sobreFundo(p), { prof: 0, liso: true }));
}
/** Chuveiro ligado, com os jatos de água caindo e as gotas respingando. Opções: larg, cor, agua, t. Chaves: chuveiro, banho, água, higiene, ducha, limpeza, refrescar, banheiro */
export function chuveiro(p, { larg = 300, cor = "c1", agua = null, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ag = agua || corFria(p, cor), ct = aguaContorno(p, ag), px = p.estilo === "pixel";
  p.em({ x: w * .05, y: 0 }, () => {
    for (let i = 0; i < 5; i++) {
      const x0 = -w * .08 + i * w * .09, x1 = x0 + (i - 2) * w * .07, o = { tracejado: px ? [w * .14, w * .08] : [w * .1, w * .07], desloc: tt * w * 1.3 + i * w * .05 };
      if (ct) p.linha([[x0, -w * .1], [x1, w * .46]], "tinta", w * .05, o);
      p.linha([[x0, -w * .1], [x1, w * .46]], ag, px ? w * .04 : w * .03, o);
    }
    for (let i = 0; i < 4; i++) { const f = (tt * 1.3 + i * .27) % 1, x = -w * .2 + i * w * .16; p.alfa(1 - f, () => { const g = gotaP(x + (i - 1.5) * f * w * .06, w * .46 - Math.sin(f * Math.PI) * w * .1, w * .028); p.forma(g, ag, { prof: 0, liso: true }); if (ct) p.linha(g, "tinta", w * .008, { fechar: true }); }); }
    p.linha([[-w * .5, -w * .42], [-w * .05, -w * .42], ...arcoP(-w * .05, -w * .29, w * .13, -90, 0, 6), [w * .08, -w * .24]], cor, w * .065);
    p.forma(retArredP(-w * .56, -w * .5, w * .08, w * .17, w * .02), escuro(p, cor, .3), { prof: 1 });
    p.forma([[w * .02, -w * .27], [w * .14, -w * .27], [w * .3, -w * .15], [-w * .14, -w * .15]], cor, { prof: 2 });
    p.forma(retArredP(-w * .17, -w * .16, w * .5, w * .06, w * .025), escuro(p, cor, .25), { prof: 1 });
  });
}
/** Torneira aberta: o fio de água cai, respinga na poça e o registro gira. Opções: larg, cor, agua, k (0 só pinga, 1 jorra), t. Chaves: torneira, água, desperdício, vazamento, conta de água, economia, gotejar, fonte */
export function torneira(p, { larg = 300, cor = "c1", agua = null, k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), bx = w * .15, y0 = -w * .02, y1 = w * .42, ag = agua || corFria(p, cor), ct = aguaContorno(p, ag);
  const pinta = pts => { p.forma(pts, ag, { prof: 0, liso: true }); if (ct) p.linha(pts, "tinta", w * .008, { fechar: true }); };
  p.em({ x: w * .06, y: -w * .04 }, () => {
    if (kk > .2) {
      const e = [], d = []; for (let i = 0; i <= 8; i++) { const v = i / 8, y = lerp(y0, y1, v), lg = w * .045 * kk * (1 + .22 * Math.sin(v * 9 - tt * 10)); e.push([bx - lg, y]); d.unshift([bx + lg, y]); }
      pinta([...e, ...d]);
      for (let i = 0; i < 3; i++) { const f = (tt * 1.5 + i / 3) % 1, s = i - 1; p.alfa(1 - f, () => pinta(gotaP(bx + s * w * .05 + s * f * w * .1, y1 - Math.sin(f * Math.PI) * w * .1, w * .026))); }
    } else { const f = (tt * .9) % 1; pinta(gotaP(bx, y0 + w * .05 + f * f * (y1 - y0 - w * .06), w * .04 * (.6 + .4 * Math.min(1, f * 4)))); }
    pinta(circP(bx, y1 + w * .03, w * (.17 + .02 * Math.sin(tt * 6)), 0, w * .035));
    p.forma(retArredP(-w * .44, w * .2, w * .3, w * .07, w * .02), escuro(p, cor, .3), { prof: 1 });
    p.forma([[-w * .37, w * .22], [-w * .37, -w * .1], ...arcoP(-w * .25, -w * .1, w * .12, 180, 270, 6), ...arcoP(bx - w * .05, -w * .1, w * .12, 270, 360, 6), [bx + w * .07, -w * .03], [bx - w * .07, -w * .03], [bx - w * .07, -w * .09], [-w * .21, -w * .09], [-w * .21, w * .22]], cor, { prof: 2 });
    p.forma(retArredP(bx - w * .09, -w * .04, w * .18, w * .055, w * .02), escuro(p, cor, .3), { prof: 0, liso: true });
    p.forma(retP(-w * .32, -w * .3, w * .06, w * .09), escuro(p, cor, .3), { prof: 0, liso: true });
    p.em({ x: -w * .29, y: -w * .32, r: Math.sin(tt * 2) * .3 }, () => { p.capsula([-w * .14, 0], [w * .14, 0], w * .065, "c2", { prof: 1 }); p.circulo(0, 0, w * .05, escuro(p, cor, .3), { prof: 0, liso: true }); });
  });
}
/** Ventilador de coluna com as pás girando e o vento saindo de lado. Opções: alt, cor, vel, t. Chaves: ventilador, vento, calor, verão, refrescar, ar, circular, espalhar */
export function ventilador(p, { alt = 380, cor = "c1", vel = 1, t = 0 } = {}) {
  const h = alt, R = h * .3, tt = p.ritmo(t), cy = -h * .69, a = tt * 9 * vel, esc = escuro(p, cor, .3);
  p.forma(retArredP(-h * .2, -h * .055, h * .4, h * .055, h * .025), cor, { prof: 1 });
  p.forma(retP(-h * .025, -h * .46, h * .05, h * .42), esc, { prof: 0 });
  p.em({ x: Math.sin(tt * 1.1) * h * .012, y: 0 }, () => {
    p.circulo(0, cy, R, "claro", { prof: 2 });
    for (let i = 0; i < 3; i++) p.em({ x: 0, y: cy, r: a + i * TAU / 3 }, () => p.forma([[0, 0], [R * .34, -R * .22], [R * .44, -R * .66], [R * .14, -R * .86], [-R * .14, -R * .56]], cor, { prof: 0, liso: true }));
    p.linha(circP(0, cy, R, 36), esc, h * .022, { fechar: true });
    p.circulo(0, cy, R * .2, esc, { prof: 0, liso: true });
  });
  for (let i = 0; i < 3; i++) { const f = (tt * 1.2 + i / 3) % 1, x = R * 1.12 + f * R * .5, y = cy + (i - 1) * R * .55; p.alfa(Math.sin(f * Math.PI), () => p.linha(Array.from({ length: 7 }, (_, j) => [x + j * R * .08, y + Math.sin(j * 1.1 + tt * 6 + i) * R * .06]), sobreFundo(p), h * .016)); }
}
/** Ar-condicionado de parede soprando ar frio em ondas, com a aleta abrindo e flocos caindo. Opções: larg, cor, t. Chaves: ar-condicionado, frio, climatização, calor, conforto, temperatura, escritório, conta de luz */
export function arCondicionado(p, { larg = 380, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ab = .5 + .5 * Math.sin(tt * 1.6), y0 = -w * .08, ar = corFria(p, cor), ct = aguaContorno(p, ar), px = p.estilo === "pixel";
  // ondas de ar: linhas onduladas que saem da saída e se abrem em leque para baixo e para os lados; no pixel, num tom claro
  const arL = px ? maisClaro(p, ar, .55) : ar, onda = (i, v) => { const x0 = -w * .27 + i * w * .18, x1 = x0 * 1.7, ang = Math.atan2(w * .44, x1 - x0), a = Math.sin(v * 9 - tt * 6 + i) * w * .028 * (.3 + v); return [lerp(x0, x1, v) + Math.sin(ang) * a, lerp(y0, w * .36, v) - Math.cos(ang) * a]; };
  for (let i = 0; i < 4; i++) {
    const fio = Array.from({ length: (px ? 8 : 14) + 1 }, (_, j) => onda(i, j / (px ? 8 : 14)));
    if (ct) p.linha(fio, "tinta", w * .042);
    p.linha(fio, arL, px ? w * .03 : w * .024);
  }
  for (let i = 0; i < 3; i++) {
    const f = (tt * .3 + i / 3) % 1, v = .15 + f * .8, [xa, ya] = onda(i, v), [xb, yb] = onda(i + 1, v), x = (xa + xb) / 2, y = (ya + yb) / 2, r = px ? w * .045 : w * .035;
    p.alfa(px ? (f < .85 ? 1 : 0) : Math.sin(f * Math.PI), () => { const n = px ? 2 : 3; for (let j = 0; j < n; j++) { const b = px ? j * Math.PI / 2 : j * Math.PI / 3 + f * 3; p.linha([[x - Math.cos(b) * r, y - Math.sin(b) * r], [x + Math.cos(b) * r, y + Math.sin(b) * r]], sobreFundo(p), px ? w * .03 : w * .016); } });
  }
  p.forma(retArredP(-w / 2, -w * .42, w, w * .32, w * .06), cor, { prof: 2 });
  for (const y of [-w * .36, -w * .31]) p.linha([[-w * .4, y], [w * .12, y]], escuro(p, cor, .3), w * .014);
  p.forma(retArredP(-w * .43, -w * .2, w * .86, w * .06, w * .02), "tinta", { prof: 0, liso: true });
  p.forma([[-w * .43, -w * .15], [w * .43, -w * .15], [w * .41, -w * .15 + ab * w * .06 + w * .02], [-w * .41, -w * .15 + ab * w * .06 + w * .02]], escuro(p, cor, .18), { prof: 1 });
  p.texto("18°", w * .31, -w * .325, { tam: w * .075, cor: "c3" });
}
/** Livro aberto com as páginas virando sozinhas e o marcador balançando. Opções: larg, cor (capa), t. Chaves: livro, leitura, estudo, conhecimento, história, aprender, página, capítulo, educação */
export function livro(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), pw = w * .46, ph = w * .6, y0 = -ph / 2, y1 = ph / 2, f = ciclo(tt, 1, .5), a = E.entraSai(f) * Math.PI, c = Math.cos(a), s = Math.sin(a), pg = escuro(p, "claro", .1);
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .012, r: Math.sin(tt * 1.3) * .025 }, () => {
    p.forma([[w * .01, y1], [w * .06, y1], [w * .06 + Math.sin(tt * 3) * w * .02, y1 + w * .15], [w * .035 + Math.sin(tt * 3) * w * .02, y1 + w * .12], [w * .01 + Math.sin(tt * 3) * w * .02, y1 + w * .15]], "c2", { prof: 0, liso: true });
    p.forma([[-w / 2, y0 + w * .03], [0, y0 + w * .07], [w / 2, y0 + w * .03], [w / 2, y1 + w * .03], [0, y1 + w * .07], [-w / 2, y1 + w * .03]], cor, { prof: 2 });
    for (const d of [-1, 1]) {
      p.forma([[d * pw, y0], [d * pw * .5, y0 - w * .02], [0, y0 + w * .035], [0, y1 + w * .035], [d * pw * .5, y1 - w * .02], [d * pw, y1]], d < 0 ? "claro" : pg, { prof: 1 });
      for (let i = 0; i < 5; i++) { const y = y0 + ph * (.2 + i * .15); p.linha([[d * w * .08, y], [d * w * (i === 4 ? .26 : .39), y]], "tinta", w * .018); }
    }
    if (f > 0 && f < 1) p.forma([[0, y0 + w * .035], [pw * c * .5, y0 - w * .02 - s * w * .1], [pw * c, y0 - s * w * .16], [pw * c, y1 - s * w * .16], [pw * c * .5, y1 - w * .02 - s * w * .1], [0, y1 + w * .035]], "claro", { prof: 1 });
    p.linha([[0, y0 + w * .035], [0, y1 + w * .035]], escuro(p, "claro", .4), w * .014);
  });
}
/** Mochila escolar que quica, com os puxadores dos zíperes balançando. Opções: larg, cor, t. Chaves: mochila, escola, viagem, estudante, bagagem, volta às aulas, aventura, carregar */
export function mochila(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), q = Math.abs(Math.sin(tt * 3)), esc = escuro(p, cor, .3), bal = Math.sin(tt * 6) * .5;
  p.em({ x: 0, y: -q * w * .06, sy: 1 + (1 - q) * .04 - .02 }, () => {
    for (const s of [-1, 1]) p.forma(retArredP(s > 0 ? w * .4 : -w * .54, -w * .9, w * .14, w * .66, w * .07), esc, { prof: 1 });
    p.forma([...arcoP(0, -w * 1.1, w * .15, 180, 360, 10), ...arcoP(0, -w * 1.1, w * .085, 360, 180, 10)], esc, { prof: 0 });
    p.forma([...arcoP(0, -w * .68, w * .46, 180, 360, 16), [w * .46, -w * .1], ...arcoP(w * .36, -w * .1, w * .1, 0, 90, 4), ...arcoP(-w * .36, -w * .1, w * .1, 90, 180, 4)], cor, { prof: 2 });
    p.linha(arcoP(0, -w * .68, w * .35, 205, 335, 12), "tinta", w * .022);
    const zx = Math.cos(335 * Math.PI / 180) * w * .35, zy = -w * .68 + Math.sin(335 * Math.PI / 180) * w * .35;
    p.capsula([zx, zy], [zx + Math.sin(bal) * w * .09, zy + Math.cos(bal) * w * .09], w * .04, "c2");
    p.forma(retArredP(-w * .32, -w * .5, w * .64, w * .4, w * .09), escuro(p, cor, .16), { prof: 1 });
    p.linha([[-w * .24, -w * .39], [w * .24, -w * .39]], "tinta", w * .022);
    p.capsula([w * .2, -w * .39], [w * .2 - Math.sin(bal * .8) * w * .09, -w * .39 + Math.cos(bal * .8) * w * .09], w * .04, "c2");
    p.forma(retArredP(-w * .1, -w * .26, w * .2, w * .1, w * .03), "claro", { prof: 0, liso: true });
  });
}
/** Guarda-chuva aberto balançando enquanto a chuva cai e escorre por ele. Opções: larg, cor, t. Chaves: guarda-chuva, chuva, proteção, seguro, cobertura, precaução, tempestade, abrigo, imprevisto */
export function guardaChuva(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, R = w / 2, tt = p.ritmo(t), cy = -w * .06, bal = Math.sin(tt * 1.5) * .07, copa = arcoP(0, cy, R, 180, 360, 18);
  for (let j = 0; j < 4; j++) copa.push(...arcoP(R - (2 * j + 1) * R / 4, cy, R / 4, 0, -180, 6).slice(1));
  // chuva no tom de água da paleta (como no chuveiro e na torneira): traços curtos e inclinados; no pixel, num tom claro
  const px = p.estilo === "pixel", ag0 = corFria(p, cor), ag = px ? maisClaro(p, ag0, .3) : ag0, ct = aguaContorno(p, ag0), gl = px ? w * .045 : w * .06, gota = (pts, lw) => { if (ct) p.linha(pts, "tinta", lw + w * .012); p.linha(pts, ag, lw); };
  for (const g of semear(11, 21)) {
    const x = (g.u - .5) * w * 1.25, f = (tt * (.9 + g.w * .5) + g.v) % 1, fim = Math.abs(x) < R * .96 ? cy - Math.sqrt(R * R - x * x) - w * .03 : w * .48, y = lerp(-w * .68, fim, f);
    if (f < .88) { const y2 = Math.min(fim, y + gl); gota([[x, y], [x - (y2 - y) * .35, y2]], px ? w * .035 : w * .02); }
    else if (Math.abs(x) < R * .96) { const e = (f - .88) / .12; p.alfa(1 - e, () => { for (const s of [-1, 1]) gota([[x, fim], [x + s * w * .04 * (e + .3), fim - w * .04 * (e + .3)]], px ? w * .03 : w * .016); }); }
  }
  p.em({ x: 0, y: w * .44, r: bal }, () => p.em({ x: 0, y: -w * .44 }, () => {
    p.linha([[0, cy - R - w * .06], [0, w * .42], ...arcoP(w * .06, w * .42, w * .06, 180, 0, 8)], sobreFundo(p), w * .03);
    p.forma(copa, cor, { prof: 2 });
    for (const x of [-R / 2, 0, R / 2]) p.linha([[0, cy - R], [x * .55, cy - R * .62], [x, cy]], escuro(p, cor, .28), w * .014);
    p.circulo(0, cy - R, w * .03, escuro(p, cor, .28), { prof: 0, liso: true });
  }));
}
/** Vela de cera acesa: a chama tremula, o halo pulsa e uma gota de cera escorre. Opções: alt, cor, pires, t. Chaves: vela, chama, luz, esperança, fé, memória, falta de luz, romance, tempo acabando */
export function vela(p, { alt = 300, cor = "c1", pires = "c4", t = 0 } = {}) {
  const h = alt, w = h * .3, tt = p.ritmo(t), topo = -h * .66, f = ciclo(tt, 2.4, .6), cera = maisClaro(p, cor, .35), inc = ruido(tt * 3, 5) * w * .12;
  // no pixel a transparência não sobrevive à paleta: o halo vira um disco cheio num tom quente e escuro, que pulsa de tamanho
  if (p.estilo === "pixel" && /^#[0-9a-f]{6}$/i.test(p.cor("fundo")) && /^#[0-9a-f]{6}$/i.test(p.cor("c2"))) p.circulo(0, -h * .8, h * (.19 + (Math.sin(tt * 5) > 0 ? .025 : 0)), misturarCor(p.cor("fundo"), p.cor("c2"), .32), { prof: 0, liso: true });
  else p.alfa(.2 + .07 * Math.sin(tt * 5), () => p.circulo(0, -h * .8, h * .23 * (1 + .07 * ruido(tt * 7, 2)), "c2", { prof: 0, liso: true }));
  p.forma(retArredP(-w * .95, -h * .06, w * 1.9, h * .06, h * .03), pires, { prof: 1 });
  p.forma(retArredP(-w / 2, topo, w, h * .62, w * .1), cor, { prof: 2 });
  p.forma([[-w / 2, topo + w * .06], [-w * .44, topo], [w * .44, topo], [w / 2, topo + w * .06], [w / 2, topo + h * .1], [w * .34, topo + h * .15], [w * .2, topo + h * .08], [w * .04, topo + h * .2], [-w * .12, topo + h * .09], [-w * .32, topo + h * .13], [-w / 2, topo + h * .07]], cera, { prof: 0, liso: true });
  p.alfa(1 - clamp((f - .8) * 5), () => p.forma(gotaP(w * .3, lerp(topo + h * .16, -h * .12, f), w * .1), cera, { prof: 0, liso: true }));
  p.linha([[0, topo], [inc * .2, topo - h * .06]], "tinta", w * .07);
  p.forma(chamaP(inc * .3, topo - h * .035, w * .6, h * .3, tt, 1), "c2", { prof: 1, liso: true });
  p.forma(chamaP(inc * .3, topo - h * .045, w * .28, h * .15, tt, 1), maisClaro(p, "c2", .6), { prof: 0, liso: true });
}
/** Martelo batendo num prego que afunda na tábua a cada golpe, com faíscas no impacto. Opções: larg, cor, cabo, t. Chaves: martelo, construir, obra, conserto, reforma, bater, insistir, ferramenta, trabalho duro */
export function martelo(p, { larg = 300, cor = "c1", cabo = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), u = tt * 1.1, f = ((u % 1) + 1) % 1, n = ((Math.floor(u) % 4) + 4) % 4, fundo = n * w * .03, nx = w * .26;
  // a face de bater fica em (fa, fb) no desenho do martelo; no golpe ela encosta exatamente na cabeça do prego
  const fa = w * .62, fb = w * .17, px = nx - fa, py = -w * .44, topo = -w * .08 - w * .15 + fundo, alvo = topo - w * .03;
  const R = Math.hypot(fa, fb), bate = Math.asin(clamp((alvo - py) / R, -1, 1)) - Math.atan2(fb, fa), ergue = -.6;
  const ang = f < .3 ? bate : f < .76 ? lerp(bate, ergue, E.entraSai((f - .3) / .46)) : lerp(ergue, bate, E.entra((f - .76) / .24));
  p.forma(retP(-w * .5, -w * .08, w, w * .08), "c4", { prof: 1 });
  const ty = topo;
  p.forma(retP(nx - w * .018, ty, w * .036, -w * .08 - ty + w * .01), sobreFundo(p), { prof: 0, liso: true });
  p.forma(retP(nx - w * .055, ty - w * .03, w * .11, w * .035), sobreFundo(p), { prof: 0, liso: true });
  if (f < .2) p.alfa(1 - f / .2, () => { for (let i = 0; i < 5; i++) { const b = -Math.PI * (.08 + i * .21), r0 = w * (.1 + f * .2), r1 = r0 + w * .08; p.linha([[nx + Math.cos(b) * r0, ty + Math.sin(b) * r0 * .7], [nx + Math.cos(b) * r1, ty + Math.sin(b) * r1 * .7]], "c2", w * .022); } });
  p.em({ x: px, y: py, r: ang }, () => {
    p.forma(retArredP(-w * .12, -w * .04, w * .72, w * .08, w * .035), cabo, { prof: 1 });
    // cabeça perpendicular ao cabo: bloco com a face reta embaixo (lado do prego) e a unha curta e curva em cima, voltada para o cabo
    const esc = escuro(p, cor, .22), Wp = ([x, y]) => [x * w, y * w];
    p.forma([[.7, -.07], [.7, -.12], [.67, -.19], [.6, -.25], [.52, -.27], [.57, -.21], [.6, -.15], [.61, -.07]].map(Wp), esc, { prof: 1, semente: 7 });
    p.forma(retArredP(w * .54, -w * .09, w * .17, w * .21, w * .015), cor, { prof: 2, semente: 8 });
    p.forma(retP(w * .525, w * .115, w * .2, w * .055), esc, { prof: 0, liso: true });
  });
}
/** Vassoura de palha varrendo de um lado para o outro e levantando poeira. Opções: alt, cor (cabo), palha, t. Chaves: vassoura, varrer, limpeza, faxina, arrumar, organizar, limpar a bagunça, recomeço */
export function vassoura(p, { alt = 400, cor = "c1", palha = "c2", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), fase = Math.sin(tt * 3), bx = -h * .16 + fase * h * .13, r = .34 + Math.sin(tt * 3 - .7) * .1, C = h * .98, dir = Math.cos(tt * 3) > 0 ? 1 : -1;
  // poeira: nuvenzinhas claras no chão, à frente das cerdas, só enquanto a vassoura está em movimento (somem na virada)
  const vel = Math.abs(Math.cos(tt * 3)), hx = /^#[0-9a-f]{6}$/i, po = p.estilo === "pixel" ? "claro" : p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : hx.test(p.cor("fundo")) && hx.test(p.cor("tinta")) ? misturarCor(p.cor("fundo"), p.cor("tinta"), .3) : "claro";
  const nuvem = (x, y, r) => [[x - r, y], ...arcoP(x - r * .5, y, r * .5, 180, 290, 5), ...arcoP(x + r * .05, y - r * .25, r * .55, 215, 330, 5), ...arcoP(x + r * .55, y, r * .45, 250, 360, 5)];
  if (vel > .35) for (let i = 0; i < 3; i++) { const f = (tt * 1.4 + i / 3) % 1; p.alfa(clamp((vel - .35) * 3) * (1 - f) * (p.estilo === "pixel" ? 1 : .8), () => p.forma(nuvem(bx + dir * h * (.24 + f * .12 + i * .03), -h * f * .03, h * (.05 + f * .03)), po, { prof: 0, liso: true, semente: 20 + i })); }
  p.em({ x: bx + Math.sin(r) * C, y: -Math.cos(r) * C, r }, () => {
    p.forma(retArredP(-h * .022, 0, h * .044, h * .7, h * .02), cor, { prof: 1 });
    p.forma([[-h * .08, h * .7], [h * .08, h * .7], [h * .2, C - h * .02], [h * .14, C], [0, C - h * .015], [-h * .14, C], [-h * .2, C - h * .02]], palha, { prof: 2 });
    for (const s of [-1, 0, 1]) p.linha([[s * h * .035, h * .78], [s * h * .1, C - h * .03]], escuro(p, palha, .3), h * .014);
    p.forma(retArredP(-h * .095, h * .68, h * .19, h * .07, h * .02), escuro(p, cor, .25), { prof: 1 });
  });
}
/** Despertador de duas campainhas que toca tremendo em rajadas, com o martelinho batendo. Opções: larg, cor, t. Chaves: despertador, alarme, acordar, hora, prazo, atraso, urgência, rotina, manhã */
export function despertador(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .55) % 1, toca = f < .6, R = w * .4, cy = -w * .5, esc = escuro(p, cor, .3), min = tt * .9;
  if (toca) for (const s of [-1, 1]) for (let j = 0; j < 2; j++) { const e = (tt * 3 + j * .5) % 1; p.alfa(1 - e, () => p.linha(arcoP(s * w * .3, -w * .86, w * (.2 + e * .14 + j * .02), s > 0 ? -65 : 190, s > 0 ? -10 : 245, 6), "c2", w * .025)); }
  p.em({ x: toca ? Math.sin(tt * 52) * w * .014 : 0, y: 0, r: toca ? Math.sin(tt * 45) * .05 : Math.sin(tt * 2) * .01 }, () => {
    for (const s of [-1, 1]) p.capsula([s * w * .2, -w * .2], [s * w * .34, -w * .02], w * .07, esc);
    const hx = toca ? Math.sin(tt * 40) * w * .1 : 0;
    p.linha([[0, -w * .88], [hx, -w * 1.0]], esc, w * .03); p.circulo(hx, -w * 1.01, w * .045, esc, { prof: 0, liso: true });
    for (const s of [-1, 1]) p.em({ x: s * w * .25, y: -w * .83, r: s * .6 }, () => p.forma(arcoP(0, 0, w * .16, 180, 360, 10), "c2", { prof: 1 }));
    p.circulo(0, cy, R, cor, { prof: 2 });
    p.circulo(0, cy, w * .31, "claro", { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2; p.linha([[Math.cos(b) * w * .23, cy + Math.sin(b) * w * .23], [Math.cos(b) * w * .28, cy + Math.sin(b) * w * .28]], "tinta", w * .025); }
    p.linha([[0, cy], [Math.cos(2.3) * w * .13, cy + Math.sin(2.3) * w * .13]], "tinta", w * .035);
    p.linha([[0, cy], [Math.sin(min) * w * .21, cy - Math.cos(min) * w * .21]], "tinta", w * .025);
    p.circulo(0, cy, w * .035, "c2", { prof: 0, liso: true });
  });
}
