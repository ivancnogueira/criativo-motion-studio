// Categoria: Ciência e espaço
// Kit de movimento — laboratório, física, biologia e astronomia: do átomo à galáxia.
// O que fica no chão (microscópio, telescópio, tubos, frasco, rover, pêndulo) tem a base em y = 0;
// o resto (astros, átomo, ímã, lousa, bússola) flutua centrado na origem.
// base.js já tem foguete, ovni, estrelas e sol. A convenção das peças está em ./_comum.js.
import { clamp, lerp, semear, rng, E, circP, retP, retArredP, rotP, misturarCor, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
const RAD = Math.PI / 180;
// pontos de um arco de elipse entre dois ângulos em graus (0 = direita, 90 = baixo)
function elipseP(cx, cy, rx, ry, a0, a1, n = 24) { return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * RAD; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); }
// faixa de um anel elíptico entre dois ângulos; `esp` é a espessura medida no eixo maior
const anelP = (rx, ry, esp, a0, a1, n = 24) => [...elipseP(0, 0, rx, ry, a0, a1, n), ...elipseP(0, 0, rx - esp, (rx - esp) * ry / rx, a1, a0, n)];
// faixa de arco de círculo (centro, raio do meio, espessura)
const arcoGrossoP = (cx, cy, r, esp, a0, a1, n = 14) => [...arcoP(cx, cy, r + esp / 2, a0, a1, n), ...arcoP(cx, cy, r - esp / 2, a1, a0, n)];
// vidro de laboratório: corpo translúcido e contorno que aparece em qualquer estilo
function vidro(p, pts, lw) { p.alfa(.35, () => p.forma(pts, "claro", { prof: 0, liso: true })); p.linha(pts, sobreFundo(p), lw, { fechar: true }); }
// brilho de quatro pontas que acende e apaga (f = 0..1)
const brilho4 = (p, x, y, r, f, cor) => p.em({ x, y, s: Math.sin(clamp(f) * Math.PI) + .001, r: f * 1.5 }, () => p.forma(estrelaP(0, 0, r, r * .32, 4), cor, { prof: 0, liso: true }));
// cor de giz e de texto sobre um corpo escuro: claro nos estilos claros, tinta nos escuros (onde "claro" é escuro)
const giz = p => p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro";
const escuroEstilo = p => p.estilo === "traco" || p.estilo === "vidro" || p.estilo === "pixel";

/* ---------------------------------------------------------------- átomos, moléculas e vida */

/** Átomo com núcleo vibrando e três elétrons correndo nas órbitas. Opções: larg, cor, t. Chaves: átomo, física, química, energia nuclear, partícula, ciência, inovação, tecnologia */
export function atomo(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .47, ry = w * .16, giro = tt * .25;
  const orb = [0, 60, 120].map((g, i) => ({ a: g * RAD + giro, th: tt * (2.2 + i * .35) + i * 2.1, cor: ["c3", "c2", "c4"][i] }));
  const pos = o => { const x = Math.cos(o.th) * R, y = Math.sin(o.th) * ry; return [x * Math.cos(o.a) - y * Math.sin(o.a), x * Math.sin(o.a) + y * Math.cos(o.a), Math.sin(o.th)]; };
  for (const o of orb) p.linha(rotP(elipseP(0, 0, R, ry, 0, 360, 40), 0, 0, o.a), sobreFundo(p), w * .022, { fechar: true });
  const eletron = o => { const [x, y] = pos(o); p.circulo(x, y, w * .055, o.cor, { prof: 1, liso: true }); };
  for (const o of orb) if (pos(o)[2] < 0) eletron(o);
  [[0, 0], [.075, -.045], [-.07, -.04], [.02, .08], [-.055, .065], [.075, .05], [-.005, -.09]].forEach(([x, y], i) => {
    const j = Math.sin(tt * 9 + i * 1.7) * w * .006;
    p.circulo(x * w + j, y * w - j, w * .064, i % 2 ? "c2" : cor, { prof: 1, liso: true });
  });
  for (const o of orb) if (pos(o)[2] >= 0) eletron(o);
}

/** Molécula de bolas e varetas girando no espaço. Opções: larg, cor, t. Chaves: molécula, química, composto, ligação, fórmula, estrutura, laboratório, conexão */
export function molecula(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ay = tt * .9, ax = .35 + Math.sin(tt * .6) * .2;
  const at = [[-.17, 0, 0, .13, cor], [.17, 0, 0, .13, cor], [-.38, -.2, 0, .085, "c3"], [-.36, .16, .18, .085, "c3"], [-.3, .13, -.24, .085, "c2"], [.38, .2, 0, .085, "c3"], [.35, -.17, .2, .085, "c4"], [.3, -.1, -.26, .085, "c3"]];
  const lig = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]];
  const proj = at.map(([x, y, z, r, c], id) => {
    const X = x * Math.cos(ay) + z * Math.sin(ay), Z0 = -x * Math.sin(ay) + z * Math.cos(ay);
    const Y = y * Math.cos(ax) - Z0 * Math.sin(ax), Z = y * Math.sin(ax) + Z0 * Math.cos(ax);
    return { x: X * w, y: Y * w, z: Z, r: r * w * (1 + Z * .5), c, id };
  });
  for (const [a, b] of lig) p.capsula([proj[a].x, proj[a].y], [proj[b].x, proj[b].y], w * .045, sobreFundo(p));
  [...proj].sort((a, b) => a.z - b.z).forEach(q => {
    p.circulo(q.x, q.y, q.r, q.c, { prof: 1, semente: q.id + 3 });
    p.circulo(q.x - q.r * .35, q.y - q.r * .35, q.r * .3, maisClaro(p, q.c, .5), { prof: 0, liso: true });
  });
}

/** Dupla hélice de DNA girando, com os pares de bases ligando as fitas. Opções: alt, cor, cor2, t. Chaves: DNA, genética, gene, hereditariedade, biologia, essência, identidade, origem */
export function dna(p, { alt = 380, cor = "c1", cor2 = "c2", t = 0 } = {}) {
  const h = alt, A = h * .2, tt = p.ritmo(t), fase = tt * 1.6, n = 40, voltas = 1.6 * TAU;
  const pt = (i, s) => { const a = fase + i / n * voltas + s * Math.PI; return [Math.sin(a) * A, -h / 2 + h * i / n, Math.cos(a)]; };
  const trechos = (s, frente) => { const out = []; let run = null; for (let i = 0; i < n; i++) { const a = pt(i, s), b = pt(i + 1, s); if ((a[2] + b[2] >= 0) === frente) { if (!run) { run = [[a[0], a[1]]]; out.push(run); } run.push([b[0], b[1]]); } else run = null; } return out; };
  const fita = (s, frente) => { for (const r of trechos(s, frente)) p.linha(r, frente ? (s ? cor2 : cor) : escuro(p, s ? cor2 : cor, .3), h * .055); };
  fita(0, false); fita(1, false);
  for (let j = 0; j < 14; j++) {
    const i = (j + .5) * n / 14, a = pt(i, 0), b = pt(i, 1), m = [(a[0] + b[0]) / 2, a[1]], par = j % 2 ? ["c3", "c4"] : ["c4", "c3"];
    if (Math.abs(a[0] - b[0]) < h * .03) continue;
    p.linha([[a[0], a[1]], m], par[0], h * .036); p.linha([m, [b[0], b[1]]], par[1], h * .036);
  }
  fita(0, true); fita(1, true);
}

/** Célula com a membrana ondulando, núcleo e organelas à deriva. Opções: larg, cor, t. Chaves: célula, biologia, vida, organismo, microscópico, saúde, base, unidade */
export function celula(p, { larg = 340, cor = "c3", t = 0 } = {}) {
  const w = larg, R = w * .46, tt = p.ritmo(t);
  const mem = s => Array.from({ length: 44 }, (_, i) => { const a = i / 44 * TAU, q = R * s * (1 + .045 * Math.sin(3 * a + tt * 1.3) + .03 * Math.sin(5 * a - tt * 1.7)); return [Math.cos(a) * q, Math.sin(a) * q * .84]; });
  p.forma(mem(1), cor, { prof: 2 });
  p.forma(mem(.9), maisClaro(p, cor, .3), { prof: 0, liso: true });
  const er = escuro(p, cor, .3);
  for (let i = 0; i < 2; i++) p.linha(arcoP(-w * .08, -w * .03, w * (.24 + i * .06), 150 + i * 10, 260 - i * 15, 10).map(([x, y], j) => [x, y + Math.sin(j + tt * 2) * w * .008]), er, w * .018);
  for (let i = 0; i < 3; i++) p.linha(arcoP(w * .2, w * .16, w * (.08 + i * .04), 200, 290, 6), "c4", w * .024);
  const dx = Math.sin(tt * .7) * w * .015, dy = Math.cos(tt * .5) * w * .01;
  p.circulo(-w * .08 + dx, -w * .03 + dy, w * .17, "c1", { prof: 1 });
  p.circulo(-w * .05 + dx, -w * .06 + dy, w * .06, escuro(p, "c1", .3), { prof: 0, liso: true });
  [[w * .22, -w * .14, .5], [-w * .26, w * .17, -.4], [w * .05, w * .25, .15]].forEach(([x, y, a], i) => {
    p.em({ x: x + Math.sin(tt + i * 2) * w * .02, y: y + Math.cos(tt * .8 + i) * w * .015, r: a + Math.sin(tt * .6 + i) * .3 }, () => {
      p.capsula([-w * .075, 0], [w * .075, 0], w * .08, "c2", { prof: 1 });
      p.linha([[-w * .05, 0], [-w * .03, -w * .02], [-w * .01, w * .02], [w * .01, -w * .02], [w * .03, w * .02], [w * .05, 0]], escuro(p, "c2", .3), w * .012);
    });
  });
  p.circulo(w * .27 + Math.sin(tt * .9) * w * .02, w * .03, w * .045, "claro", { prof: 0, liso: true });
  for (const s of semear(9, 21)) { const a = s.u * TAU, q = R * (.5 + s.v * .3); p.circulo(Math.cos(a + tt * .1) * q, Math.sin(a + tt * .1) * q * .8, w * .017, "tinta", { prof: 0, liso: true }); }
}

/* ---------------------------------------------------------------- laboratório */

/** Microscópio com o tubo subindo e descendo no foco e a luz acesa sob a lâmina. Opções: larg, cor, t. Chaves: microscópio, laboratório, pesquisa, análise, detalhe, investigar, examinar, biologia */
export function microscopio(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), foco = Math.sin(tt * 1.4) * w * .025;
  const ux = -.306, uy = -.952, ob = [-w * .06 + ux * foco, -w * .6 + uy * foco], at = s => [ob[0] + ux * w * s, ob[1] + uy * w * s];
  const tubo = escuro(p, cor, .12), anel = "c4";
  p.alfa(.35 + .15 * Math.sin(tt * 3), () => p.forma([[-w * .09, -w * .2], [-w * .03, -w * .2], [w * .02, -w * .5], [-w * .14, -w * .5]], "c2", { prof: 0, liso: true }));
  p.forma(retArredP(-w * .4, -w * .12, w * .8, w * .12, w * .05), cor, { prof: 2 });
  p.forma(retP(w * .13, -w * .46, w * .16, w * .36), cor, { prof: 1 });
  p.circulo(-w * .06, -w * .17, w * .055, "c2", { prof: 1, liso: true });
  p.forma(arcoGrossoP(-w * .06, -w * .56, w * .28, w * .13, 15, -106), cor, { prof: 2 });
  p.forma(retArredP(-w * .36, -w * .5, w * .62, w * .06, w * .015), anel, { prof: 1 });
  p.forma(retP(-w * .19, -w * .535, w * .26, w * .04), "claro", { prof: 0, liso: true });
  p.circulo(-w * .06, -w * .555, w * .022, "c2", { prof: 0, liso: true });
  p.capsula(at(-.06), at(.06), w * .1, anel, { prof: 1 });
  p.capsula(at(.03), at(.54), w * .16, tubo, { prof: 1 });
  p.capsula(at(.26), at(.32), w * .2, anel, { prof: 0 });
  p.capsula(at(.52), at(.64), w * .2, anel, { prof: 1 });
  p.em({ x: w * .21, y: -w * .32, r: foco / w * 40 }, () => {
    p.circulo(0, 0, w * .085, "c2", { prof: 1, liso: true });
    p.circulo(0, 0, w * .04, maisClaro(p, "c2", .45), { prof: 0, liso: true });
    p.linha([[0, -w * .04], [0, -w * .085]], "tinta", w * .022);
  });
  brilho4(p, -w * .06, -w * .6, w * .06, (tt * .6) % 1, "c2");
}

/** Telescópio no tripé varrendo o céu, com uma estrela piscando na mira. Opções: larg, cor, t. Chaves: telescópio, astronomia, observar, visão, futuro, longo prazo, explorar, descoberta */
export function telescopio(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ang = -.55 + Math.sin(tt * .7) * .12, my = -w * .6;
  for (const x of [-w * .34, w * .06, w * .34]) p.capsula([0, my + w * .04], [x, 0], w * .045, sobreFundo(p));
  p.circulo(0, my + w * .04, w * .055, "c4", { prof: 1, liso: true });
  p.em({ x: 0, y: my, r: ang }, () => {
    p.capsula([-w * .4, w * .02], [-w * .52, w * .06], w * .06, "c4", { prof: 1 });
    for (const x of [-w * .06, w * .12]) p.forma(retP(x, -w * .15, w * .03, w * .06), "c4", { prof: 0, liso: true });
    p.capsula([-w * .12, -w * .15], [w * .18, -w * .15], w * .055, "c4", { prof: 1 });
    p.forma([[-w * .42, -w * .07], [w * .42, -w * .1], [w * .42, w * .1], [-w * .42, w * .07]], cor, { prof: 2 });
    p.forma(retP(-w * .05, -w * .095, w * .07, w * .19), escuro(p, cor, .25), { prof: 0, liso: true });
    p.forma(retArredP(w * .4, -w * .125, w * .12, w * .25, w * .02), escuro(p, cor, .15), { prof: 1 });
    p.elipse(w * .52, 0, w * .03, w * .1, "claro", { prof: 0, liso: true });
  });
  const f = (tt * .55) % 1, d = w * .78; brilho4(p, Math.cos(ang) * d, my + Math.sin(ang) * d, w * .07, f, "c2");
}

/** Estante com tubos de ensaio: o líquido ondula e as bolhas sobem. Opções: alt, cor, k (0..1 nível do tubo do meio), t. Chaves: tubo de ensaio, laboratório, experimento, química, teste, amostra, pesquisa, hipótese */
export function tuboDeEnsaio(p, { alt = 320, cor = "c3", k = .6, t = 0 } = {}) {
  const h = alt, w = h * .92, tt = p.ritmo(t), tw = h * .17, yb = -h * .14 - tw / 2;
  const tuboP = x => [[x - tw / 2, -h], ...arcoP(x, yb, tw / 2, 180, 0, 10), [x + tw / 2, -h]];
  for (const x of [-w * .47, w * .47]) p.forma(retP(x - h * .025, -h * .62, h * .05, h * .56), "c4", { prof: 1 });
  p.forma(retArredP(-w * .5, -h * .08, w, h * .08, h * .02), "c4", { prof: 2 });
  [[-h * .3, "c1", .45, 1], [0, cor, clamp(k), 0], [h * .3, "c2", .7, 2]].forEach(([x, c, nivel, i]) => {
    const tp = tuboP(x), topo = lerp(yb + tw / 2, -h * .86, nivel);
    p.alfa(.35, () => p.forma(tp, "claro", { prof: 0, liso: true }));
    if (nivel > .02) p.recortar(tp, () => {
      p.forma([...Array.from({ length: 7 }, (_, j) => [x - tw / 2 + tw * j / 6, topo + Math.sin(tt * 4 + j * 1.3 + i) * h * .008]), [x + tw, h * .1], [x - tw, h * .1]], c, { prof: 0, liso: true });
      for (const s of semear(3, 40 + i)) { const f = (tt * (.4 + s.w * .3) + s.u) % 1, y = lerp(yb + tw * .3, topo, f); p.circulo(x + (s.v - .5) * tw * .4 + Math.sin(f * 9) * tw * .06, y, tw * (.12 + s.q * .06), maisClaro(p, c, .45), { prof: 0, liso: true }); }
    });
    p.linha(tp, sobreFundo(p), h * .018, { fechar: true });
    p.capsula([x - tw * .62, -h], [x + tw * .62, -h], tw * .2, sobreFundo(p));
  });
  p.forma(retArredP(-w * .5, -h * .62, w, h * .09, h * .02), "c4", { prof: 2 });
}

/** Frasco de laboratório com o líquido fervendo e bolhas escapando pela boca. Opções: larg, cor, t. Chaves: frasco, química, reação, experimento, poção, fórmula, borbulhar, transformação */
export function frascoBorbulhando(p, { larg = 280, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), nx = w * .12, h = w * 1.05;
  const fr = [[-nx, -h], [-nx, -h * .6], [-w * .45, -w * .06], ...arcoP(-w * .39, -w * .06, w * .06, 180, 90, 4), ...arcoP(w * .39, -w * .06, w * .06, 90, 0, 4), [nx, -h * .6], [nx, -h]];
  p.alfa(.35, () => p.forma(fr, "claro", { prof: 0, liso: true }));
  const topo = -h * .34;
  p.recortar(fr, () => {
    p.forma([...Array.from({ length: 9 }, (_, j) => [-w * .5 + w * j / 8, topo + Math.sin(tt * 5 + j * 1.4) * w * .014]), [w * .5, w * .1], [-w * .5, w * .1]], cor, { prof: 0, liso: true });
    for (const s of semear(7, 13)) { const f = (tt * (.5 + s.w * .4) + s.u) % 1, y = lerp(-w * .04, topo, f); p.circulo((s.v - .5) * w * .6 * (1 - f * .5), y, w * (.025 + s.q * .02), maisClaro(p, cor, .45), { prof: 0, liso: true }); }
    for (let i = 0; i < 3; i++) { const f = (tt * .8 + i / 3) % 1; p.circulo(Math.sin(i * 2 + f * 6) * nx * .4, lerp(topo, -h, f), w * .028, maisClaro(p, cor, .3), { prof: 0, liso: true }); }
  });
  p.linha(fr, sobreFundo(p), w * .02, { fechar: true });
  for (let i = 0; i < 3; i++) p.linha([[w * .14, -w * (.16 + i * .1)], [w * .24, -w * (.16 + i * .1)]], sobreFundo(p), w * .016);
  p.capsula([-nx * 1.4, -h], [nx * 1.4, -h], w * .045, sobreFundo(p));
  for (let i = 0; i < 5; i++) {
    const f = (tt * .55 + i / 5) % 1;
    p.alfa(1 - f * f, () => p.circulo(Math.sin(f * 5 + i * 1.3) * w * .1, -h - w * .05 - f * h * .45, w * (.035 + .05 * f), cor, { prof: 0, liso: true }));
  }
}

/** Lousa com fórmulas sendo escritas a giz, letra por letra. Opções: larg, cor, moldura, t. Chaves: lousa, quadro-negro, fórmula, matemática, aula, escola, explicar, ensino */
export function lousaDeFormulas(p, { larg = 400, cor = "c3", moldura = "c4", t = 0 } = {}) {
  // no pixel a fonte sai menor (62%): compensa para as fórmulas continuarem legíveis
  const w = larg, h = w * .62, tt = p.ritmo(t), m = w * .04, tam = w * (p.estilo === "pixel" ? .1 : .074), g = giz(p);
  p.forma(retArredP(-w / 2, -h / 2, w, h, w * .02), moldura, { prof: 2 });
  p.forma(retP(-w / 2 + m, -h / 2 + m, w - m * 2, h - m * 2), escuro(p, cor, .45), { prof: 0 });
  p.forma(retArredP(-w * .44, h / 2 - w * .015, w * .88, w * .04, w * .01), moldura, { prof: 1 });
  p.forma(retArredP(w * .22, h / 2 - w * .055, w * .12, w * .045, w * .008), "c1", { prof: 1 });
  const L = ["E = mc²", "a² + b² = c²", "F = m · a"], tot = L.reduce((s, l) => s + l.length, 0) + 6;
  const f = (tt % 8) / 6, n = Math.floor(clamp(f) * tot);
  let resto = n, giz0 = null;
  L.forEach((l, i) => {
    if (resto <= 0) return; const s = l.slice(0, resto); resto -= l.length + 2;
    const x = -w * .4 + (i === 2 ? w * .05 : 0), y = -h * .27 + i * h * .2;
    p.texto(s, x, y, { tam, cor: g, peso: 700, alinhar: "left" });
    giz0 = [x + p.medir(s, { tam, peso: 700 }), y];
  });
  const kc = clamp(n - tot + 6, 0, 6) / 6;
  const ox = w * .2, oy = h * .3, gw = w * .2, gh = h * .3;
  p.linha([[ox, oy - gh], [ox, oy], [ox + gw, oy]], g, w * .012);
  if (kc > 0) { const pts = Array.from({ length: Math.max(2, Math.round(kc * 12)) }, (_, j) => { const u = j / 11; return [ox + u * gw * .95, oy - gh * .9 * u * u]; }); p.linha(pts, "c2", w * .016); giz0 = pts[pts.length - 1]; }
  if (giz0 && f < 1.02) p.em({ x: giz0[0] + w * .02, y: giz0[1] + tam * .2 + Math.sin(tt * 30) * w * .004, r: -.6 }, () => p.capsula([0, 0], [w * .07, 0], w * .025, "claro", { prof: 1 }));
  else p.capsula([-w * .2, h / 2 - w * .02], [-w * .12, h / 2 - w * .02], w * .022, "claro", { prof: 0 });
}

/* ---------------------------------------------------------------- física */

/** Ímã de ferradura puxando partículas, com as linhas de campo pulsando. Opções: larg, cor, t. Chaves: ímã, atração, magnetismo, atrair clientes, imã, força, puxar, engajamento */
export function ima(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .3, r = w * .13, cy = -w * .22, L = w * .27, pc = (R + r) / 2;
  const boca = cy + L;
  // ondas de atração: arcos que vêm de fora e se fecham nos polos
  // no pixel a transparência vira a cor de sombra: lá a onda aparece inteira ou some
  for (let i = 0; i < 3; i++) { const f = (tt * .7 + i / 3) % 1, a = Math.sin(f * Math.PI); p.alfa(p.estilo === "pixel" ? (a > .3 ? 1 : 0) : a * .85, () => p.linha(arcoP(0, boca, pc + (1 - f) * w * .34, 25, 155, 16), "c2", w * .022)); }
  // pedacinhos de metal sendo puxados, acelerando até grudar
  for (const s of semear(6, 77)) {
    const f = (tt * .45 + s.u) % 1, lado = s.i % 2 ? 1 : -1, ini = [lado * w * (.12 + s.v * .34), boca + w * (.32 + s.w * .14)], fim = [lado * pc + (s.q - .5) * w * .08, boca + w * .045];
    const k = E.entra(clamp(f / .75)), x = lerp(ini[0], fim[0], k), y = lerp(ini[1], fim[1], k), tam = w * (.04 + s.q * .02);
    p.alfa(clamp(f * 6) * clamp((1 - f) * 8), () => p.em({ x, y, r: (1 - k) * (s.w * 6 + tt * 2) }, () => p.forma(retArredP(-tam / 2, -tam / 2, tam, tam, tam * .2), s.i % 3 ? sobreFundo(p) : "c4", { prof: 0, liso: true })));
  }
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .01, r: Math.sin(tt * 1.3) * .05 }, () => {
    p.forma([[-R, cy + L], ...arcoP(0, cy, R, 180, 360, 18), [R, cy + L], [r, cy + L], ...arcoP(0, cy, r, 360, 180, 12), [-r, cy + L]], cor, { prof: 2 });
    for (const sx of [-1, 1]) p.forma(retP(sx > 0 ? r : -R, cy + L - w * .1, R - r, w * .1), "claro", { prof: 0 });
  });
}

/** Pêndulo balançando no suporte, com o rastro do movimento. Opções: larg, cor, t. Chaves: pêndulo, física, oscilação, ritmo, equilíbrio, hipnose, tempo, vai e vem */
export function pendulo(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = 0, py = -w * 1.03, Lc = w * .78, th = s => .5 * Math.sin(s * 2.2);
  p.forma(retArredP(-w * .42, -w * .07, w * .84, w * .07, w * .02), cor, { prof: 2 });
  for (const x of [-w * .36, w * .31]) p.forma(retP(x, -w * 1.06, w * .05, w * 1.0), escuro(p, cor, .12), { prof: 1 });
  p.forma(retArredP(-w * .4, -w * 1.1, w * .8, w * .07, w * .02), cor, { prof: 2 });
  p.alfa(.45, () => p.linha(arcoP(px, py, Lc, 90 - 30, 90 + 30, 14), sobreFundo(p), w * .012, { tracejado: [w * .03, w * .03] }));
  const bola = (a, al) => { const x = px + Math.sin(a) * Lc, y = py + Math.cos(a) * Lc; p.alfa(al, () => p.circulo(x, y, w * .1, "c2", { prof: al > .9 ? 2 : 0, liso: true })); return [x, y]; };
  for (let j = 3; j >= 1; j--) bola(th(tt - j * .07), .22 / j);
  const a = th(tt), b = [px + Math.sin(a) * Lc, py + Math.cos(a) * Lc];
  p.linha([[px, py], b], sobreFundo(p), w * .014);
  bola(a, 1);
  p.circulo(b[0] - w * .035, b[1] - w * .035, w * .028, maisClaro(p, "c2", .5), { prof: 0, liso: true });
  p.circulo(px, py, w * .025, "c4", { prof: 0, liso: true });
}

/** Prisma de vidro abrindo um raio de luz no leque do arco-íris. Opções: larg, cor, k (0..1 abre o leque), t. Chaves: prisma, luz, arco-íris, diversidade, espectro, refração, óptica, transformação */
export function prisma(p, { larg = 380, cor = "c3", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = E.sai(clamp(k)), tri = [[0, -w * .24], [w * .22, w * .15], [-w * .22, w * .15]];
  const ent = [-w * .11, -w * .045], sai = [w * .132, -w * .006], ini = [-w * .5, w * .06];
  const ARCO = ["#E8453C", "#F59A2F", "#F5D33F", "#4CB86A", "#3D7FE0", "#8B5CD6"];
  if (kk > .02) {
    const a0 = 4 + Math.sin(tt * 1.1) * 2, da = 6 + Math.sin(tt * 1.3) * .8;
    ARCO.forEach((c, i) => {
      const L = w * .4 * kk * (.94 + .06 * Math.sin(tt * 4 + i)), a1 = (a0 + i * da) * RAD, a2 = (a0 + (i + 1) * da) * RAD;
      p.forma([sai, [sai[0] + Math.cos(a1) * L, sai[1] + Math.sin(a1) * L], [sai[0] + Math.cos(a2) * L, sai[1] + Math.sin(a2) * L]], c, { prof: 0, liso: true });
    });
  }
  p.linha([ini, ent], sobreFundo(p), w * .03);
  p.linha([ini, ent], p.estilo === "flat" || p.estilo === "papel" ? "claro" : "c4", w * .014, { tracejado: [w * .04, w * .05], desloc: tt * w * .3 });
  p.alfa(.5, () => p.forma(tri, cor, { prof: 2 }));
  p.alfa(.6, () => p.linha([ent, sai], sobreFundo(p), w * .02));
  p.linha(tri, sobreFundo(p), w * .018, { fechar: true });
  p.alfa(.5, () => p.linha([[w * .02, -w * .19], [w * .05, w * .13]], maisClaro(p, cor, .6), w * .016));
}

/** Bússola com a agulha tremendo até achar o norte. Opções: larg, cor, t. Chaves: bússola, direção, norte, rumo, orientação, propósito, estratégia, navegação */
export function bussola(p, { larg = 260, cor = "c4", t = 0 } = {}) {
  const R = larg * .44, tt = p.ritmo(t), caixa = .3 * Math.sin(tt * .7), f = tt % 4.5, ag = .9 * Math.exp(-f * 1.1) * Math.cos(f * 4.2) + .04 * Math.sin(tt * 3);
  p.em({ x: 0, y: 0, r: caixa }, () => {
    p.forma(circP(0, -R * 1.1, R * .16), cor, { prof: 1, furos: [circP(0, -R * 1.1, R * .08).reverse()] });
    p.circulo(0, 0, R, cor, { prof: 2 });
    p.circulo(0, 0, R * .82, "claro", { prof: 0 });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, q = i % 4 ? .7 : .62; p.linha([[Math.cos(a) * R * q, Math.sin(a) * R * q], [Math.cos(a) * R * .77, Math.sin(a) * R * .77]], "tinta", R * (i % 4 ? .025 : .04)); }
    p.texto("N", 0, -R * .46, { tam: R * .28, cor: "c1", peso: 800 });
    for (const [s, x, y] of [["S", 0, R * .48], ["L", R * .47, 0], ["O", -R * .47, 0]]) p.texto(s, x, y, { tam: R * .2, cor: "tinta", peso: 700 });
    p.em({ x: 0, y: 0, r: ag - caixa }, () => {
      p.forma([[0, -R * .66], [R * .13, 0], [-R * .13, 0]], "c1", { prof: 1, liso: true });
      p.forma([[0, R * .66], [R * .13, 0], [-R * .13, 0]], "tinta", { prof: 1, liso: true });
    });
    p.circulo(0, 0, R * .08, "c4", { prof: 0, liso: true });
  });
}

/* ---------------------------------------------------------------- espaço */

/** Planeta com anéis inclinados, faixas e uma lua dando a volta. Opções: larg, cor, t. Chaves: planeta, Saturno, anéis, espaço, universo, astronomia, outro mundo, exploração */
export function planetaComAneis(p, { larg = 360, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .24, rx = w * .5, ry = w * .13, la = tt * .8, lua = [Math.cos(la) * w * .58, Math.sin(la) * w * .17];
  const luaP = () => p.circulo(lua[0], lua[1], w * .045, "c3", { prof: 1, liso: true });
  p.em({ x: 0, y: Math.sin(tt * 1.1) * w * .015, r: -.32 + Math.sin(tt * .5) * .06 }, () => {
    if (lua[1] < 0) luaP();
    p.forma(anelP(rx, ry, w * .1, 180, 360), "c4", { prof: 1, liso: true });
    p.forma(anelP(rx * .78, ry * .78, w * .05, 180, 360), maisClaro(p, "c4", .3), { prof: 0, liso: true });
    const disco = circP(0, 0, R, 40);
    p.forma(disco, cor, { prof: 2 });
    p.recortar(disco, () => {
      for (const [y, e, c] of [[-.5, .14, escuro(p, cor, .15)], [-.08, .2, maisClaro(p, cor, .25)], [.42, .16, escuro(p, cor, .15)]]) p.forma(retP(-R, R * (y - e / 2), R * 2, R * e), c, { prof: 0, liso: true });
      const sx = (((tt * .25) % 1) * 2.6 - 1.3) * R; p.elipse(sx, R * .2, R * .2, R * .1, escuro(p, cor, .3), { prof: 0, liso: true });
    });
    p.forma(anelP(rx, ry, w * .1, 0, 180), "c4", { prof: 1, liso: true });
    p.forma(anelP(rx * .78, ry * .78, w * .05, 0, 180), maisClaro(p, "c4", .3), { prof: 0, liso: true });
    if (lua[1] >= 0) luaP();
  });
}

// contornos aproximados dos continentes em [longitude, latitude] (graus)
const CONTINENTES = [
  [[-160, 65], [-125, 72], [-80, 70], [-58, 50], [-78, 30], [-97, 18], [-84, 9], [-108, 24], [-125, 42], [-150, 58]],
  [[-80, 10], [-60, 9], [-35, -6], [-40, -23], [-66, -55], [-73, -40], [-81, -6]],
  [[-17, 34], [-8, 44], [-10, 58], [25, 70], [42, 45], [34, 31], [51, 12], [40, -14], [20, -35], [12, -16], [8, 4], [-16, 12]],
  [[42, 45], [60, 72], [140, 72], [170, 64], [140, 42], [120, 22], [105, 9], [80, 8], [58, 25], [46, 35]],
  [[114, -21], [135, -12], [153, -26], [145, -39], [116, -34]],
  [[-55, 60], [-25, 70], [-40, 82], [-65, 78]],
];
/** Globo terrestre girando, com continentes deslizando e nuvens passando. Opções: r, cor, cor2, t. Chaves: Terra, planeta, mundo, global, internacional, meio ambiente, globalização, sustentabilidade */
export function terra(p, { r = 150, cor = null, cor2 = "c3", t = 0 } = {}) {
  const tt = p.ritmo(t), gira = 5 + tt * 18, oceano = cor || (p.estilo === "papel" ? "c4" : "c1");
  const proj = (lo, la, g) => { const d = clamp(lo - g, -90, 90) * RAD, L = la * RAD; return [r * Math.cos(L) * Math.sin(d), -r * Math.sin(L)]; };
  const wrap = a => ((a % 360) + 540) % 360 - 180;
  p.em({ x: 0, y: 0, r: -.35 }, () => {
    const disco = circP(0, 0, r, 48);
    p.forma(disco, oceano, { prof: 2 });
    p.recortar(disco, () => {
      CONTINENTES.forEach((c, i) => {
        const lc = c.reduce((s, q) => s + q[0], 0) / c.length, off = wrap(lc - gira) - (lc - gira);
        const den = []; c.forEach((a, j) => { const b = c[(j + 1) % c.length]; for (let s = 0; s < 3; s++) den.push([lerp(a[0], b[0], s / 3) + off, lerp(a[1], b[1], s / 3)]); });
        if (!den.some(([lo]) => Math.abs(lo - gira) < 88)) return;
        p.forma(den.map(([lo, la]) => proj(lo, la, gira)), cor2, { prof: 0, semente: 50 + i });
      });
      [[20, -30, 50], [-15, 80, 36], [48, 170, 40]].forEach(([la, lo0, comp], i) => {
        const g = tt * 36, lo = wrap(lo0 - g) + g;
        if (Math.abs(lo - g) > 80) return;
        p.alfa(.8, () => p.linha(Array.from({ length: 9 }, (_, j) => proj(lo + comp * (j / 8 - .5), la + Math.sin(j * 1.3 + i) * 3, g)), giz(p), r * .075));
      });
      if (!escuroEstilo(p)) p.alfa(.16, () => p.forma(circP(0, 0, r * 1.02, 40), "#000000", { prof: 0, liso: true, furos: [circP(-r * .28, -r * .22, r * 1.06, 40).reverse()] }));
    });
  });
}

/** Sistema solar: o Sol brilhando no centro e os planetas correndo nas órbitas. Opções: larg, t. Chaves: sistema solar, planetas, órbita, Sol, universo, espaço, ecossistema, centro */
export function sistemaSolar(p, { larg = 420, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), inc = .38;
  const pl = [[.17, .03, "c4", 1.5], [.25, .038, "c2", 1.1], [.335, .044, "c1", .8], [.42, .034, "c3", .6], [.5, .05, "c4", .42, true]];
  for (const [a] of pl) p.alfa(.5, () => p.linha(elipseP(0, 0, a * w, a * w * inc, 0, 360, 48), sobreFundo(p), w * .01, { fechar: true }));
  const pos = pl.map(([a, r, c, v, anel], i) => { const th = tt * v + i * 1.9, s = 1 + Math.sin(th) * .15; return { x: Math.cos(th) * a * w, y: Math.sin(th) * a * w * inc, r: r * w * s, c, anel, tras: Math.sin(th) < 0 }; });
  const planeta = q => { if (q.anel) p.linha(elipseP(q.x, q.y, q.r * 1.9, q.r * .55, 0, 360, 24), "c2", w * .012, { fechar: true }); p.circulo(q.x, q.y, q.r, q.c, { prof: 1, liso: true }); };
  pos.filter(q => q.tras).forEach(planeta);
  p.forma(estrelaP(0, 0, w * .15, w * .11, 12, tt * .3), "c4", { prof: 0, liso: true });
  p.circulo(0, 0, w * .1 * (1 + .03 * Math.sin(tt * 3)), "c2", { prof: 2 });
  p.circulo(-w * .03, -w * .03, w * .035, maisClaro(p, "c2", .45), { prof: 0, liso: true });
  pos.filter(q => !q.tras).forEach(planeta);
}

/** Galáxia espiral girando devagar, com estrelas piscando nos braços. Opções: larg, cor, t. Chaves: galáxia, universo, Via Láctea, cosmos, infinito, imensidão, espaço, escala */
export function galaxia(p, { larg = 380, cor = "c3", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), rot = -tt * .35, c = Math.cos(rot), s = Math.sin(rot), sy = .62, th0 = 1, tmax = 7;
  const tr = ([x, y]) => [x * c - y * s, (x * s + y * c) * sy];
  const centro = (th, fase) => { const q = R * .106 * Math.exp(.32 * th); return [Math.cos(th + fase) * q, Math.sin(th + fase) * q]; };
  // braço em faixa: começa largo junto ao núcleo (que o cobre) e afina até a ponta
  const braco = (fase, esp, cr, fim = tmax) => {
    const esq = [], dir = [];
    for (let i = 0; i <= 30; i++) { const u = i / 30, th = th0 + (fim - th0) * u, a = centro(th, fase), b = centro(th + .05, fase), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, m = R * esp * (1 - u * .72) / 2; esq.push(tr([a[0] + nx * m, a[1] + ny * m])); dir.push(tr([a[0] - nx * m, a[1] - ny * m])); }
    p.forma([...esq, ...dir.reverse()], cr, { prof: 0, semente: Math.round(fase * 10) + 3 });
  };
  p.em({ x: 0, y: 0, r: -.3 }, () => {
    p.alfa(.22, () => p.elipse(0, 0, R * .78, R * .78 * sy, cor, { prof: 0, liso: true }));
    for (const f of [0, Math.PI]) braco(f, .3, cor);
    for (const f of [0, Math.PI]) braco(f, .1, maisClaro(p, cor, .4), tmax - 1);
    p.alfa(.5, () => p.elipse(0, 0, R * .4, R * .4 * sy, maisClaro(p, "c2", .3), { prof: 0, liso: true }));
    p.elipse(0, 0, R * .28, R * .28 * sy, "c2", { prof: 1 });
    p.elipse(0, 0, R * .13, R * .13 * sy, maisClaro(p, "c2", .55), { prof: 0, liso: true });
    for (const st of semear(12, 31)) { const th = th0 + st.u * (tmax - th0), a = centro(th, st.i % 2 ? Math.PI : 0), q = tr([a[0] + (st.v - .5) * R * .3, a[1] + (st.w - .5) * R * .3]); brilho4(p, q[0], q[1], R * (.05 + st.q * .04), (tt * .5 + st.q) % 1, st.i % 3 ? "c4" : sobreFundo(p)); }
  });
}

/** Cometa riscando o céu com a cauda tremulando e faíscas ficando para trás. Opções: larg, cor, t. Chaves: cometa, estrela cadente, desejo, velocidade, passagem, raro, surpresa, espaço */
export function cometa(p, { larg = 380, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), hx = w * .34, hr = w * .075;
  // meia-largura da cauda: nasce da largura da cabeça, abre para trás e fecha arredondada na ponta
  const meia = (u, ab) => (hr * 1.05 + (ab - hr) * Math.pow(u, .7)) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 3)));
  const cauda = (len, ab, n, cr, al) => {
    const cima = [], baixo = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, m = meia(u, ab), on = Math.sin(tt * 5 - u * 6 + n) * w * .02 * u + u * u * w * .04; cima.push([hx - u * len, -m + on]); baixo.push([hx - u * len, m * .8 + on]); }
    p.alfa(al, () => p.forma([...cima, ...baixo.reverse()], cr, { prof: 0, liso: true }));
  };
  p.em({ x: Math.sin(tt * .9) * w * .03, y: Math.cos(tt * .7) * w * .02, r: -.42 }, () => {
    cauda(w * .9, w * .2, 0, cor, .45);
    cauda(w * .72, w * .14, 1.2, cor, .9);
    cauda(w * .5, w * .09, 2.4, "c2", .95);
    for (let i = 0; i < 6; i++) { const f = (tt * .6 + i / 6) % 1, lado = i % 2 ? 1 : -1, x = hx - w * .12 - f * w * .7, y = lado * (meia(f * .8, w * .2) * 1.25 + w * .02); brilho4(p, x, y, w * .035, f, i % 3 ? sobreFundo(p) : "c4"); }
    p.alfa(.35 + .1 * Math.sin(tt * 6), () => p.circulo(hx, 0, hr * 1.55, maisClaro(p, "c2", .4), { prof: 0, liso: true }));
    p.circulo(hx, 0, hr * (1 + .05 * Math.sin(tt * 7)), "c2", { prof: 2 });
    p.circulo(hx + hr * .15, -hr * .15, hr * .55, maisClaro(p, "c2", .6), { prof: 0, liso: true });
  });
}

/** Asteroides girando e flutuando, cheios de crateras. Opções: larg, cor, t. Chaves: asteroide, meteoro, rocha espacial, obstáculo, ameaça, impacto, perigo, espaço */
export function asteroides(p, { larg = 380, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  [[-.16, -.04, .19, .45], [.23, -.2, .12, -.8], [.22, .17, .09, 1.1], [-.34, .24, .065, -1.4], [.4, .02, .055, 1.7]].forEach(([x, y, r, v], i) => {
    const R = r * w, rnd = rng(i * 7 + 11), pts = Array.from({ length: 11 }, (_, j) => { const a = j / 11 * TAU, q = R * (.78 + rnd() * .3); return [Math.cos(a) * q, Math.sin(a) * q]; });
    const cx = x * w + Math.sin(tt * .5 + i) * w * .025, cy = y * w + Math.cos(tt * .6 + i * 2) * w * .02;
    if (r > .1) p.alfa(.4, () => { for (const d of [-.5, .1, .5]) p.linha([[cx - R * 1.1, cy + d * R], [cx - R * (1.5 + Math.abs(d)), cy + d * R]], sobreFundo(p), w * .014); });
    p.em({ x: cx, y: cy, r: tt * v }, () => {
      p.forma(pts, i % 2 ? escuro(p, cor, .1) : cor, { prof: 2, semente: i + 5 });
      if (r > .07) for (const [a, b, c] of [[-.3, -.25, .26], [.35, .15, .2], [-.1, .4, .15]]) p.circulo(a * R, b * R, c * R, escuro(p, cor, .25), { prof: 0, liso: true });
    });
  });
}

/** Buraco negro engolindo luz, com o disco de matéria girando em volta. Opções: larg, cor, t. Chaves: buraco negro, espaço, gravidade, mistério, vício, sugar, perder tempo, abismo */
export function buracoNegro(p, { larg = 380, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rh = w * .16, rx = w * .5, ry = w * .12, brilho = maisClaro(p, cor, .45);
  const tracos = (a0, a1) => [[.86, .5, 1], [.66, -.7, .8]].forEach(([s, v, l]) => p.linha(elipseP(0, 0, rx * s, ry * s, a0, a1, 28), brilho, w * .014, { tracejado: [w * .07 * l, w * .06], desloc: tt * w * v }));
  p.em({ x: 0, y: 0, r: -.12 }, () => {
    p.forma(anelP(rx, ry, w * .26, 180, 360), cor, { prof: 0, liso: true });
    p.forma(anelP(rx * .72, ry * .72, w * .12, 180, 360), "c4", { prof: 0, liso: true });
    tracos(180, 360);
    p.forma(arcoGrossoP(0, 0, rh * 1.3, rh * .32, 180, 360, 20), cor, { prof: 0, liso: true });
    p.forma(arcoGrossoP(0, 0, rh * 1.3, rh * .12, 180, 360, 20), "c4", { prof: 0, liso: true });
    p.circulo(0, 0, rh, "#000000", { prof: 0, liso: true });
    p.linha(circP(0, 0, rh * 1.04, 36), brilho, w * .014, { fechar: true });
    p.forma(anelP(rx, ry, w * .26, 0, 180), cor, { prof: 1, liso: true });
    p.forma(anelP(rx * .72, ry * .72, w * .12, 0, 180), "c4", { prof: 0, liso: true });
    tracos(0, 180);
    for (let i = 0; i < 4; i++) { const f = (tt * .3 + i / 4) % 1, a = f * 3 * TAU + i * 1.6, q = rx * 1.1 * (1 - f); p.alfa(1 - f, () => p.circulo(Math.cos(a) * q, Math.sin(a) * q * ry / rx, w * .022, "c4", { prof: 0, liso: true })); }
  });
}

/** Estação espacial flutuando, com os painéis solares girando e a luz piscando. Opções: larg, cor, t. Chaves: estação espacial, órbita, satélite, astronauta, espaço, tecnologia, ciência, missão */
export function estacaoEspacial(p, { larg = 420, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), gir = .45 + .55 * Math.abs(Math.cos(tt * .8)), tr = sobreFundo(p);
  p.em({ x: 0, y: Math.sin(tt * .9) * w * .02, r: Math.sin(tt * .4) * .08 - .1 }, () => {
    for (const x of [-w * .41, -w * .25, w * .25, w * .41]) p.capsula([x, -w * .3 * gir], [x, w * .3 * gir], w * .02, tr);
    p.capsula([-w * .47, 0], [w * .47, 0], w * .045, tr);
    for (const x of [-w * .41, -w * .25, w * .25, w * .41]) p.em({ x, y: 0, sy: gir }, () => {
      for (const sy of [-1, 1]) {
        const y0 = sy < 0 ? -w * .33 : w * .05, ph = w * .28;
        p.forma(retP(-w * .065, y0, w * .13, ph), cor, { prof: 1 });
        p.linha([[0, y0], [0, y0 + ph], [-w * .065, y0 + ph * .66], [w * .065, y0 + ph * .66], [w * .065, y0 + ph * .33], [-w * .065, y0 + ph * .33]], escuro(p, cor, .3), w * .012);
      }
    });
    p.capsula([0, -w * .19], [0, w * .19], w * .09, "c4", { prof: 2 });
    p.capsula([-w * .15, 0], [w * .15, 0], w * .11, "claro", { prof: 2 });
    p.circulo(0, 0, w * .075, "c4", { prof: 1 });
    p.forma(retP(-w * .055, w * .22, w * .11, w * .06), "claro", { prof: 1 });
    p.forma([[-w * .03, -w * .23], [w * .03, -w * .23], [w * .045, -w * .29], [-w * .045, -w * .29]], "claro", { prof: 1 });
    if (Math.sin(tt * 5) > 0) p.circulo(0, -w * .31, w * .022, "c2", { prof: 0, liso: true });
  });
}

/** Rover de exploração rodando em outro planeta, com a cabeça olhando em volta. Opções: larg, cor, t. Chaves: rover, Marte, exploração, robô, missão, pioneiro, descoberta, avançar */
export function rover(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rr = w * .075, roda = sobreFundo(p), xs = [-w * .36, -w * .02, w * .34], bob = Math.sin(tt * 6) * w * .008;
  for (let i = 0; i < 3; i++) { const f = (tt * .9 + i / 3) % 1; p.alfa((1 - f) * .4, () => p.circulo(xs[0] - rr - f * w * .16, -rr * .6 - f * w * .06, w * (.025 + f * .04), roda, { prof: 0, liso: true })); }
  p.linha([[xs[0], -rr], [-w * .18, -w * .28 + bob], [xs[1], -rr]], roda, w * .03);
  p.linha([[-w * .18, -w * .28 + bob], [w * .12, -w * .28 + bob], [xs[2], -rr]], roda, w * .03);
  p.em({ x: 0, y: bob }, () => {
    p.linha([[w * .3, -w * .36], [w * .46, -w * .3], [w * .45, -w * .2]], roda, w * .03);
    p.circulo(w * .45, -w * .19, w * .025, "c2", { prof: 0, liso: true });
    p.capsula([-w * .24, -w * .48], [-w * .24, -w * .8], w * .05, roda);
    p.forma(retArredP(-w * .33, -w * .45, w * .66, w * .17, w * .03), cor, { prof: 2 });
    p.forma(retP(-w * .38, -w * .5, w * .76, w * .05), "c1", { prof: 1 });
    p.linha([[w * .28, -w * .5], [w * .31, -w * .78]], roda, w * .016);
    if (Math.sin(tt * 4) > 0) p.circulo(w * .31, -w * .79, w * .022, "c2", { prof: 0, liso: true });
    p.em({ x: w * .14, y: -w * .58, r: -.5 + Math.sin(tt * 1.5) * .2 }, () => p.forma(arcoP(0, -w * .04, w * .08, 0, 180, 10), "c2", { prof: 1, liso: true }));
    p.capsula([w * .14, -w * .5], [w * .14, -w * .6], w * .025, roda);
    const pan = Math.sin(tt * .8);
    p.em({ x: -w * .24, y: -w * .86, r: pan * .12 }, () => {
      p.forma(retArredP(-w * .12, -w * .065, w * .24, w * .13, w * .025), cor, { prof: 1 });
      for (const ex of [-w * .05, w * .05]) p.circulo(ex + pan * w * .02, 0, w * .03, "tinta", { prof: 0, liso: true });
    });
  });
  for (const x of xs) {
    p.circulo(x, -rr, rr, roda, { prof: 1, liso: true });
    p.circulo(x, -rr, rr * .5, cor, { prof: 0, liso: true });
    const a = tt * 4; p.linha([[x - Math.cos(a) * rr * .45, -rr - Math.sin(a) * rr * .45], [x + Math.cos(a) * rr * .45, -rr + Math.sin(a) * rr * .45]], "tinta", w * .018);
  }
}

/** Eclipse: a Lua passa na frente do Sol e a coroa brilha na totalidade. Opções: r, cor, k (0..1 a Lua atravessa; 0,5 é o eclipse total), t. Chaves: eclipse, Sol, Lua, sombra, raro, alinhamento, momento único, ofuscar */
export function eclipse(p, { r = 130, cor = "c2", k = .5, t = 0 } = {}) {
  const tt = p.ritmo(t), kk = clamp(k), mx = (kk - .5) * r * 2.6, my = (kk - .5) * r * .4, tot = clamp(1 - Math.hypot(mx, my) / (r * .9));
  p.alfa(.45 + .45 * tot, () => p.forma(estrelaP(0, 0, r * (1.3 + .28 * tot), r * 1.04, 16, tt * .15), "c4", { prof: 0, liso: true }));
  p.alfa(.35 + .4 * tot, () => p.forma(estrelaP(0, 0, r * (1.18 + .2 * tot), r * 1.02, 11, -tt * .22), maisClaro(p, "c4", .3), { prof: 0, liso: true }));
  p.circulo(0, 0, r, cor, { prof: 1 });
  const px = p.estilo === "pixel", lua = p.estilo === "vidro" ? "fundo" : px ? "sombra" : "tinta";
  // no pixel a "tinta" some no fundo: a Lua é cinza-azulada, com coroa clara onde cobre o Sol e contorno de 1 pixel
  if (px) p.recortar(circP(0, 0, r * 1.06), () => p.circulo(mx, my, r * 1.07, maisClaro(p, "c4", .55), { prof: 0, liso: true }));
  p.circulo(mx, my, r * .98, lua, { prof: 0, liso: true });
  if (px) p.linha(arcoP(mx, my, r * .98, 0, 360, 48), maisClaro(p, "sombra", .4), r * .02, { fechar: true });
  if (p.estilo === "vidro") p.circulo(mx, my, r * .98, lua, { prof: 0, liso: true });
  if (tot > .1) {
    const a = tt * .9; brilho4(p, mx + Math.cos(a) * r, my + Math.sin(a) * r, r * .28 * tot, .5, maisClaro(p, "c4", .5));
    [[-1.7, -1.2], [1.6, -1.4], [1.8, 1.1], [-1.5, 1.5]].forEach(([x, y], i) => brilho4(p, x * r, y * r, r * .1, ((tt * .6 + i * .27) % 1) * tot + (1 - tot) * 0, "c4"));
  }
}

/** Constelação com estrelas piscando e ligadas por linhas que se traçam. Opções: larg, cor, cor2, k (0..1 traça as linhas), t. Chaves: constelação, estrelas, conexão, céu noturno, destino, padrão, rede, guia */
export function constelacao(p, { larg = 380, cor = "c4", cor2 = "c3", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k);
  const S = [[-.44, .14], [-.23, .03], [-.03, .07], [.18, .14], [.2, -.12], [.44, -.2], [.46, .07]].map(([x, y]) => [x * w, y * w]);
  const seq = [0, 1, 2, 3, 6, 5, 4, 3], segs = seq.length - 1, feitos = kk * segs;
  for (let i = 0; i < segs; i++) {
    const f = clamp(feitos - i); if (f <= 0) break;
    const a = S[seq[i]], b = S[seq[i + 1]];
    p.linha([a, [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]], cor2, w * .018);
  }
  for (const s of semear(7, 61)) brilho4(p, (s.u - .5) * w * .95, (s.v - .5) * w * .6, w * .025, (tt * .5 + s.w) % 1, cor);
  S.forEach(([x, y], i) => {
    const R = w * (i % 3 ? .042 : .056), s = 1 + .18 * Math.sin(tt * 3 + i * 1.9);
    p.em({ x, y, s, r: Math.sin(tt + i) * .2 }, () => { p.forma(estrelaP(0, 0, R, R * .4, 4), cor, { prof: 2, liso: true }); p.circulo(0, 0, R * .35, maisClaro(p, cor, .5), { prof: 0, liso: true }); });
  });
}
