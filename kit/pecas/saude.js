// Categoria: Saúde e corpo
// Kit de movimento — medicina, hospital e órgãos estilizados: instrumentos, remédios, exames e partes do corpo.
// O que fica no chão (frasco, maca, cadeira de rodas, soro) tem a base em y = 0; o resto é centrado na origem.
// A convenção das peças está em ./_comum.js.
import { clamp, lerp, E, circP, retP, retArredP, rotP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU, vaiVem } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
// curva fechada e macia que passa pelos pontos de controle
const cr = (a, b, c, d, u) => .5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
const suave = (pts, n = 6) => {
  const o = [], L = pts.length;
  for (let i = 0; i < L; i++) { const a = pts[(i + L - 1) % L], b = pts[i], c = pts[(i + 1) % L], d = pts[(i + 2) % L]; for (let j = 0; j < n; j++) o.push([cr(a[0], b[0], c[0], d[0], j / n), cr(a[1], b[1], c[1], d[1], j / n)]); }
  return o;
};
// curva aberta e macia que passa pelos pontos (para sulcos e dobras)
const curva = (pts, n = 5) => {
  const o = [], L = pts.length;
  for (let i = 0; i < L - 1; i++) { const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(L - 1, i + 2)]; for (let j = 0; j < n; j++) o.push([cr(a[0], b[0], c[0], d[0], j / n), cr(a[1], b[1], c[1], d[1], j / n)]); }
  o.push(pts[L - 1]); return o;
};
// vermelho de sangue de cada pincel: a cor primária do estilo é azul ou ciano e faria a gota parecer de água
const SANGUE = { papel: "#B23A2C", flat: "#E5403A", pixel: "#D8373C", traco: "#FF5468", vidro: "#F2263F" };
// pontos dados em fração da largura
const emLarg = (pts, w, dx = 0, dy = 0) => pts.map(([x, y]) => [(x + dx) * w, (y + dy) * w]);
// corpo branco ou de cartão: no flat ganha um contorno fino para não sumir no fundo claro
const branco = (p, pts, cor, esp, o) => { p.forma(pts, cor, o); if (p.estilo === "flat") p.linha(pts, sobreFundo(p), esp, { fechar: true }); };
// ponto a uma fração do caminho de uma linha quebrada
const noCaminho = (pts, f) => { const u = clamp(f) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), q = u - i; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; };
// batida de coração: dois picos curtos por ciclo
const batida = f => Math.exp(-f * 9) + .6 * Math.exp(-Math.abs(f - .22) * 22);

/** Seringa inclinada com líquido, êmbolo que avança e gota pingando da agulha. Opções: larg, cor, k (0..1 empurra o êmbolo), t. Chaves: seringa, injeção, vacina, agulha, dose, imunização, aplicação, prevenção */
export function seringa(p, { larg = 370, cor = "c3", k = .3, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), h = w * .15, x0 = -w * .2, x1 = w * .24, xe = lerp(x0 + w * .04, x1 - w * .04, kk), f = (tt * .7) % 1;
  p.em({ x: 0, y: 0, r: -.62 + Math.sin(tt * 2) * .05 }, () => {
    p.linha([[x1 + w * .05, 0], [w * .5, 0]], sobreFundo(p), w * .028);
    p.forma([[x1, -h * .3], [x1 + w * .08, -h * .14], [x1 + w * .08, h * .14], [x1, h * .3]], "c4", { prof: 0, liso: true });
    p.forma(retP(xe - w * .27, -h * .15, w * .27, h * .3), "c4", { prof: 0, liso: true });
    p.forma(retArredP(xe - w * .31, -h * .52, w * .05, h * 1.04, w * .02), "c4", { prof: 1, liso: true });
    branco(p, retArredP(x0, -h / 2, x1 - x0, h, h * .14), "claro", w * .012, { prof: 2 });
    if (x1 - xe > w * .03) p.forma(retP(xe, -h * .36, x1 - xe - w * .012, h * .72), cor, { prof: 0, liso: true });
    p.forma(retP(xe - w * .035, -h * .42, w * .04, h * .84), "tinta", { prof: 0, liso: true });
    for (let i = 1; i < 6; i++) { const x = x0 + (x1 - x0) * i / 6; p.linha([[x, -h * .5], [x, -h * (i % 2 ? .12 : .24)]], "tinta", w * .012); }
    p.forma(retArredP(x0 - w * .03, -h * .82, w * .045, h * 1.64, w * .02), "c4", { prof: 1, liso: true });
    const g = f < .5 ? f * 2 : 1, cai = f < .5 ? 0 : (f - .5) * 2;
    p.alfa(1 - cai, () => p.circulo(w * .52 - cai * w * .1, cai * cai * w * .16, w * .032 * g + .01, cor, { prof: 0, liso: true }));
  });
}
/** Cápsula de duas cores e comprimidos que flutuam e giram devagar. Opções: larg, cor, cor2, t. Chaves: pílula, remédio, comprimido, cápsula, medicamento, tratamento, vitamina, solução rápida */
export function pilulas(p, { larg = 300, cor = "c1", cor2 = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  const capsula2 = (L, r, c) => {
    p.forma([...arcoP(-L / 2 + r, 0, r, 90, 270, 10), [0, -r], [0, r]], c, { prof: 2, liso: true });
    p.forma([...arcoP(L / 2 - r, 0, r, -90, 90, 10), [0, r], [0, -r]], "claro", { prof: 2, liso: true });
    if (p.estilo === "flat") p.linha([[0, -r], ...arcoP(L / 2 - r, 0, r, -90, 90, 10), [0, r]], sobreFundo(p), w * .012);
    p.linha([[-L * .34, -r * .45], [-L * .12, -r * .45]], "claro", r * .22);
  };
  p.em({ x: -w * .06, y: -w * .12 + Math.sin(tt * 2.2) * w * .03, r: -.6 + Math.sin(tt * 1.4) * .12 }, () => capsula2(w * .66, w * .12, cor));
  p.em({ x: w * .26, y: w * .22 + Math.sin(tt * 2.2 + 2) * w * .03, r: Math.sin(tt * 1.1 + 1) * .5 }, () => {
    p.circulo(0, 0, w * .15, cor2, { prof: 2 });
    p.linha([[-w * .1, 0], [w * .1, 0]], "tinta", w * .022);
  });
  p.em({ x: -w * .27, y: w * .27 + Math.sin(tt * 2.2 + 4) * w * .03, r: .5 + Math.sin(tt * 1.7 + 2) * .2 }, () => capsula2(w * .3, w * .065, "c3"));
}
/** Frasco de remédio com rótulo de cruz que balança enquanto a tampa gira. Opções: larg, cor, t. Chaves: frasco, remédio, medicamento, farmácia, receita, xarope, tratamento, dose diária */
export function frascoDeRemedio(p, { larg = 220, cor = "c2", t = 0 } = {}) {
  const w = larg, h = w * 1.5, tt = p.ritmo(t), s = 1 + .05 * Math.sin(tt * 5);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 2.4) * .07 }, () => {
    p.forma(retArredP(-w / 2, -h * .8, w, h * .8, w * .13), cor, { prof: 2 });
    p.forma(retP(-w * .3, -h * .86, w * .6, h * .08), escuro(p, cor, .25), { prof: 0, liso: true });
    branco(p, retArredP(-w * .37, -h, w * .74, h * .16, w * .05), "claro", w * .015, { prof: 1 });
    for (let i = 0; i < 5; i++) { const x = -w * .37 + (((i / 5 + tt * .25) % 1 + 1) % 1) * w * .74; if (x > -w * .33 && x < w * .33) p.linha([[x, -h * .97], [x, -h * .87]], "tinta", w * .022); }
    p.forma(retArredP(-w * .39, -h * .62, w * .78, h * .42, w * .04), "claro", { prof: 0, liso: true });
    p.em({ x: 0, y: -h * .45, s }, () => { p.forma(retP(-w * .17, -w * .055, w * .34, w * .11), "c1", { prof: 0, liso: true }); p.forma(retP(-w * .055, -w * .17, w * .11, w * .34), "c1", { prof: 0, liso: true }); });
    p.linha([[-w * .24, -h * .27], [w * .24, -h * .27]], "tinta", w * .03);
  });
}
/** Estetoscópio que balança, com o auscultador pulsando em ondas. Opções: larg, cor, t. Chaves: estetoscópio, médico, consulta, exame, ausculta, diagnóstico, escutar, check-up */
export function estetoscopio(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * 1.2) % 1, ax = w * .34, ay = -w * .02;
  p.em({ x: -w * .16, y: w * .08, r: Math.sin(tt * 1.5) * .04 }, () => {
    for (const d of [-1, 1]) {
      p.linha(emLarg([[.18 * d, -.47], [.2 * d, -.36], [.15 * d, -.2], [.06 * d, -.08], [0, -.02]], w), "c4", w * .032);
      p.circulo(.18 * d * w, -w * .48, w * .04, sobreFundo(p), { prof: 0, liso: true });
    }
    p.linha([[0, -w * .04], [0, w * .2], ...arcoP(w * .17, w * .2, w * .17, 180, 0, 14), [ax, ay]], cor, w * .048);
    p.alfa(1 - f, () => p.linha(circP(ax, ay, w * (.13 + f * .1), 28), cor, w * .022, { fechar: true }));
    p.circulo(ax, ay, w * .125 * (1 + .05 * batida(f)), "c4", { prof: 2 });
    p.circulo(ax, ay, w * .075, "claro", { prof: 0, liso: true });
  });
}
/** Cruz médica dentro de um disco que bate como coração, com um anel se abrindo. Opções: larg, cor, t. Chaves: cruz, saúde, hospital, pronto-socorro, farmácia, primeiros socorros, emergência, cuidado */
export function cruzMedica(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const R = larg * .4, tt = p.ritmo(t), f = (tt * 1.1) % 1, s = 1 + .08 * batida(f), b = R * .2;
  p.alfa(1 - f, () => p.linha(circP(0, 0, R * (1 + f * .25), 36), cor, R * .07, { fechar: true }));
  p.em({ x: 0, y: 0, s }, () => {
    p.circulo(0, 0, R, cor, { prof: 2 });
    p.forma([[-b, -R * .62], [b, -R * .62], [b, -b], [R * .62, -b], [R * .62, b], [b, b], [b, R * .62], [-b, R * .62], [-b, b], [-R * .62, b], [-R * .62, -b], [-b, -b]], "claro", { prof: 0, liso: true });
  });
}
/** Curativo adesivo inclinado que balança, com brilhos piscando. Opções: larg, cor, t. Chaves: curativo, band-aid, machucado, ferida, esparadrapo, conserto, remendo, solução provisória */
export function curativo(p, { larg = 320, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.em({ x: 0, y: Math.sin(tt * 2.5) * w * .02, r: -.5 + Math.sin(tt * 2) * .1 }, () => {
    p.forma(retArredP(-w * .47, -w * .14, w * .94, w * .28, w * .14), cor, { prof: 2 });
    p.forma(retArredP(-w * .15, -w * .14, w * .3, w * .28, w * .02), maisClaro(p, cor, .55), { prof: 0, liso: true });
    p.linha([[-w * .15, -w * .14], [-w * .15, w * .14]], "tinta", w * .014); p.linha([[w * .15, -w * .14], [w * .15, w * .14]], "tinta", w * .014);
    for (const d of [-1, 1]) for (const [x, y] of [[.25, -.05], [.35, -.05], [.25, .05], [.35, .05]]) p.circulo(d * x * w, y * w, w * .024, "tinta", { prof: 0, liso: true });
  });
  for (let i = 0; i < 2; i++) { const f = (tt * .8 + i / 2) % 1; p.em({ x: [-w * .22, w * .26][i], y: [-w * .34, w * .3][i], s: Math.sin(f * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, w * .08, w * .025, 4), sobreFundo(p), { prof: 0, liso: true })); }
}
/** Linha de eletrocardiograma que corre da esquerda para a direita com um ponto luminoso na frente. Opções: larg, cor, vel, t. Chaves: batimentos, eletrocardiograma, pulso, frequência cardíaca, sinal vital, vida, monitor, ritmo */
export function batimentos(p, { larg = 400, cor = "c1", vel = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), A = w * .3, N = 100, cab = ((tt * .45 * vel) % 1 + 1) % 1, nc = Math.floor(cab * N);
  const onda = [[0, 0], [.12, 0], [.18, -.1], [.24, 0], [.32, 0], [.36, .14], [.42, -1], [.48, .4], [.54, 0], [.64, 0], [.72, -.2], [.8, 0], [1.001, 0]];
  const y = u => { u = (u + .0001) % 1; for (let i = 1; i < onda.length; i++) if (u <= onda[i][0]) { const a = onda[i - 1], b = onda[i]; return lerp(a[1], b[1], (u - a[0]) / (b[0] - a[0])); } return 0; };
  const pt = i => [-w / 2 + w * i / N, y(i / N * 2) * A + A * .3];
  const antes = Array.from({ length: nc + 1 }, (_, i) => pt(i)), depois = Array.from({ length: Math.max(0, N - nc - 9) }, (_, i) => pt(nc + 10 + i));
  if (depois.length > 1) p.alfa(.35, () => p.linha(depois, cor, w * .04));
  if (antes.length > 1) p.linha(antes, cor, w * .042);
  const c = pt(nc), pul = (tt * 3) % 1;
  p.alfa(1 - pul, () => p.linha(circP(c[0], c[1], w * (.03 + pul * .05), 18), "c2", w * .016, { fechar: true }));
  p.circulo(c[0], c[1], w * .036, "c2", { prof: 0, liso: true });
}
/** Par de pulmões com traqueia que inflam e desinflam respirando. Opções: larg, cor, cor2, t. Chaves: pulmões, respiração, respirar, ar, fôlego, oxigênio, fumar, alívio */
export function pulmoes(p, { larg = 320, cor = "c1", cor2 = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), resp = Math.sin(tt * 2.2), s = 1 + .07 * resp;
  const lobo = [[-.05, -.2], [-.15, -.33], [-.29, -.22], [-.41, .04], [-.45, .28], [-.32, .4], [-.13, .33], [-.05, .2], [-.08, 0]];
  p.em({ x: 0, y: w * .03 }, () => {
    p.capsula([0, -w * .47], [0, -w * .2], w * .085, cor2, { prof: 1 });
    for (const d of [-1, 1]) p.capsula([0, -w * .2], [d * w * .12, -w * .1], w * .065, cor2);
    for (let i = 0; i < 3; i++) p.linha([[-w * .04, -w * (.42 - i * .07)], [w * .04, -w * (.42 - i * .07)]], "tinta", w * .018);
    for (const d of [-1, 1]) {
      const m = ([x, y]) => [-d * (x + .06) * w, (y + .15) * w];
      p.em({ x: d * w * .06, y: -w * .15, s }, () => {
        p.forma(suave(lobo.map(m)), cor, { prof: 2, semente: d + 5 });
        p.linha([[-.07, -.08], [-.2, .05], [-.27, .2]].map(m), "tinta", w * .024);
        p.linha([[-.2, .05], [-.31, .0]].map(m), "tinta", w * .02);
        p.linha([[-.15, 0], [-.14, .2]].map(m), "tinta", w * .02);
      });
    }
  });
}
/** Cérebro de perfil que pulsa, com faíscas de atividade acendendo em sequência. Opções: larg, cor, t. Chaves: cérebro, mente, pensar, inteligência, memória, neurônio, raciocínio, ideia, foco */
export function cerebro(p, { larg = 320, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), N = 72;
  const massa = Array.from({ length: N }, (_, i) => { const a = i / N * TAU, sn = Math.sin(a), q = 1 + .055 * Math.cos(a * 9 + .6); return [Math.cos(a) * w * .45 * q - w * .02, (sn > 0 ? sn * w * .24 : sn * w * .34) * q - w * .06]; });
  p.em({ x: 0, y: 0, s: 1 + .025 * Math.sin(tt * 4) }, () => {
    p.capsula([w * .05, w * .21], [w * .08, w * .4], w * .09, escuro(p, cor, .35), { prof: 1 });
    p.elipse(w * .26, w * .2, w * .16, w * .1, escuro(p, cor, .2), { prof: 1 });
    p.linha(arcoP(w * .26, w * .2, w * .09, 200, 340, 6), "tinta", w * .018);
    p.forma(massa, cor, { prof: 2, liso: true });
    // sulcos: o central (do topo até o meio), a fissura lateral e dobras em "minhoca" espalhadas, sem simetria
    const px = p.estilo === "pixel", lw = px ? w * .045 : w * .024, sulco = px ? escuro(p, cor, .55) : "tinta";
    const sulcos = [
      [[.06, -.42], [.02, -.34], [.06, -.26], [.0, -.18], [.03, -.1]],
      [[-.33, .06], [-.2, .0], [-.06, -.02], [.06, -.07], [.16, -.06]],
      [[-.4, -.1], [-.31, -.17], [-.33, -.25], [-.24, -.3]],
      [[-.22, -.2], [-.13, -.24], [-.15, -.33], [-.07, -.38]],
      [[-.18, -.1], [-.09, -.13]],
      [[.13, -.37], [.18, -.28], [.28, -.3], [.31, -.21]],
      [[.12, -.18], [.22, -.15], [.3, -.1], [.39, -.13]],
      [[-.24, .12], [-.1, .09], [.04, .12], [.14, .07]],
    ];
    p.recortar(massa, () => { for (const s of sulcos) p.linha(curva(emLarg(s, w), 4), sulco, lw); });
    const luz = p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro";
    [[-.27, -.12], [.22, -.23], [-.1, -.3], [.3, .0]].forEach(([x, y], i) => {
      const f = (tt * .9 + i / 4) % 1, s = Math.sin(f * 2 * Math.PI);
      if (f < .5) p.em({ x: x * w, y: y * w, s: s + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, w * .055, w * .016, 4), luz, { prof: 0, liso: true }));
    });
  });
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .55, pis = Math.sin(tt * 6 + i * 2) > 0 ? 1 : .35, r0 = w * .46, r1 = w * .53; p.alfa(pis, () => p.linha([[Math.cos(a) * r0, Math.sin(a) * r0 * .9 - w * .04], [Math.cos(a) * r1, Math.sin(a) * r1 * .9 - w * .04]], sobreFundo(p), w * .022)); }
}
/** Dente molar sorridente que quica, pisca e ganha um brilho de limpeza. Opções: larg, t. Chaves: dente, dentista, sorriso, odontologia, cárie, higiene bucal, escovar, limpeza */
export function dente(p, { larg = 240, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), pisca = (tt * .4) % 1 > .93, f = (tt * .8) % 1;
  const forma = suave(emLarg([[-.3, -.38], [-.15, -.45], [0, -.38], [.15, -.45], [.3, -.38], [.37, -.16], [.31, .06], [.26, .3], [.18, .45], [.1, .3], [0, .1], [-.1, .3], [-.18, .45], [-.26, .3], [-.31, .06], [-.37, -.16]], w), 5);
  p.em({ x: 0, y: -Math.abs(Math.sin(tt * 2.6)) * w * .05, r: Math.sin(tt * 2.6) * .06 }, () => {
    branco(p, forma, "#FFFFFF", w * .018, { prof: 2, liso: true });
    for (const d of [-1, 1]) pisca ? p.linha([[d * w * .12 - w * .04, -w * .16], [d * w * .12 + w * .04, -w * .16]], "tinta", w * .025) : p.circulo(d * w * .12, -w * .16, w * .038, "tinta", { prof: 0, liso: true });
    p.linha(arcoP(0, -w * .1, w * .1, 25, 155, 8), "tinta", w * .028);
  });
  p.em({ x: w * .36, y: -w * .36, s: Math.sin(f * Math.PI) + .001, r: f * 1.5 }, () => p.forma(estrelaP(0, 0, w * .12, w * .035, 4), "c2", { prof: 0, liso: true }));
}
/** Olho aberto que olha em volta e pisca de tempos em tempos. Opções: larg, cor, t. Chaves: olho, visão, ver, olhar, atenção, observar, vigilância, de olho, foco */
export function olho(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .35) % 1, ab = f > .88 ? Math.abs(Math.cos((f - .88) / .12 * Math.PI)) : 1, a = w * .48, N = 16;
  const arco = (alt, sinal) => Array.from({ length: N + 1 }, (_, i) => [-a + 2 * a * i / N, sinal * alt * Math.pow(Math.sin(Math.PI * i / N), .8)]);
  const cima = arco(w * .27 * ab, -1), contorno = [...cima, ...arco(w * .2 * ab, 1).reverse().slice(1, -1)];
  if (ab < .16) {
    p.linha(arco(w * .06, 1), sobreFundo(p), w * .035);
    for (let i = -1; i < 2; i++) p.linha([[i * w * .16, w * .07], [i * w * .2, w * .15]], sobreFundo(p), w * .028);
    return;
  }
  branco(p, contorno, "#FFFFFF", w * .018, { prof: 2, liso: true });
  p.recortar(contorno, () => {
    const x = Math.sin(tt * .9) * w * .13, y = Math.cos(tt * 1.3) * w * .03;
    p.circulo(x, y, w * .17, cor, { prof: 0, liso: true });
    p.circulo(x, y, w * .085, "#0B0F14", { prof: 0, liso: true });
    p.circulo(x + w * .06, y - w * .07, w * .035, "#FFFFFF", { prof: 0, liso: true });
  });
  p.linha(cima, sobreFundo(p), w * .035);
  for (let i = -1; i < 2; i++) { const q = cima[N / 2 + i * 4]; p.linha([q, [q[0] + i * w * .05, q[1] - w * .09]], sobreFundo(p), w * .028); }
}
/** Osso de pontas arredondadas que gira de um lado para o outro. Opções: larg, cor, t. Chaves: osso, esqueleto, fratura, ortopedia, cálcio, estrutura, cachorro, ossos do ofício */
export function osso(p, { larg = 320, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .1, L = w * .34, c = r * .8;
  const pts = [...arcoP(L, -c, r, 162, 415, 14), ...arcoP(L, c, r, -55, 198, 14), ...arcoP(-L, c, r, -18, 235, 14), ...arcoP(-L, -c, r, 125, 378, 14)];
  p.em({ x: 0, y: Math.sin(tt * 2.4) * w * .025, r: -.5 + Math.sin(tt * 1.6) * .22 }, () => {
    // no vidro "claro" é escuro: o osso fica marfim de verdade, como o dente
    // no traco "claro" some no fundo: o osso vira creme luminoso ("tinta") com um contorno mais grosso, como o dente
    const tr = p.estilo === "traco", c0 = cor === "claro" && p.estilo === "vidro" ? "#F4EEDF" : cor === "claro" && tr ? "tinta" : cor;
    branco(p, pts, c0, w * .018, { prof: 2, liso: true });
    if (tr) p.linha(pts, c0, w * .02, { fechar: true });
    p.linha([[-L * .55, -r * .12], [L * .2, -r * .12]], escuro(p, "c4", .1), w * .02);
  });
}
/** Estômago simpático que se mexe digerindo, com líquido balançando e bolhas subindo. Opções: larg, cor, t. Chaves: estômago, digestão, fome, barriga, azia, gastrite, alimentação, frio na barriga */
export function estomago(p, { larg = 300, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), m = Math.sin(tt * 3);
  const ctrl = [[-.12, -.48], [.02, -.48], [.03, -.3], [.14, -.35], [.31, -.3], [.41, -.1], [.37, .15], [.2, .33], [-.05, .37], [-.26, .31], [-.38, .33], [-.47, .24], [-.45, .12], [-.34, .12], [-.24, .15], [-.12, .08], [-.08, -.06], [-.11, -.3]];
  const pts = suave(emLarg(ctrl, w, .03, .04), 5);
  p.em({ x: 0, y: 0, sx: 1 + .03 * m, sy: 1 - .03 * m, r: m * .03 }, () => {
    p.forma(pts, cor, { prof: 2, liso: true });
    p.recortar(pts, () => {
      const sup = Array.from({ length: 9 }, (_, i) => [-w * .5 + w * i / 8, w * .2 + Math.sin(tt * 4 + i * 1.3) * w * .018]);
      p.forma([...sup, [w * .5, w * .5], [-w * .5, w * .5]], escuro(p, cor, .22), { prof: 0, liso: true });
      for (let i = 0; i < 3; i++) { const f = (tt * .7 + i / 3) % 1; p.alfa(1 - f * .6, () => p.circulo(w * (-.1 + i * .16), w * (.38 - f * .16), w * (.022 + .012 * i), maisClaro(p, cor, .6), { prof: 0, liso: true })); }
    });
    for (const x of [.13, .31]) p.circulo(x * w, -w * .06, w * .03, "tinta", { prof: 0, liso: true });
    p.linha(arcoP(w * .22, -w * .02, w * .07, 25, 155, 6), "tinta", w * .024);
  });
}
/** Vírus redondo com espículas que giram em volta enquanto o corpo pulsa. Opções: larg, cor, cor2, n (espículas), t. Chaves: vírus, gripe, infecção, contágio, pandemia, doença, covid, viral, espalhar */
export function virus(p, { larg = 300, cor = "c3", cor2 = "c1", n = 9, t = 0 } = {}) {
  const R = larg * .3, tt = p.ritmo(t), a0 = tt * .5, s = 1 + .05 * Math.sin(tt * 4);
  for (let i = 0; i < n; i++) {
    const a = a0 + i / n * TAU, c = Math.cos(a), sn = Math.sin(a), r1 = R * (1.36 + .06 * Math.sin(tt * 5 + i * 2));
    p.capsula([c * R * .85, sn * R * .85], [c * r1, sn * r1], R * .17, cor);
    p.circulo(c * r1, sn * r1, R * .18, cor2, { prof: 1, liso: true });
  }
  p.em({ x: 0, y: 0, s }, () => {
    p.circulo(0, 0, R, cor, { prof: 2 });
    [[.42, .0, .2], [.5, 2.2, .15], [.45, 4.1, .24]].forEach(([d, a, r]) => p.circulo(Math.cos(a - a0 * .6) * R * d, Math.sin(a - a0 * .6) * R * d, R * r, escuro(p, cor, .28), { prof: 0, liso: true }));
  });
}
/** Bactéria em bastão que nada rebolando, com cílios e flagelos ondulando. Opções: larg, cor, t. Chaves: bactéria, micróbio, germe, infecção, antibiótico, contaminação, sujeira, microrganismo */
export function bacteria(p, { larg = 320, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), L = w * .2, r = w * .13;
  p.em({ x: w * .08, y: Math.sin(tt * 2.5) * w * .02, r: -.35 + Math.sin(tt * 2.5) * .1 }, () => {
    for (const d of [-1, 1]) p.linha(Array.from({ length: 9 }, (_, i) => [-L - r * .8 - i * w * .028, d * r * .35 + Math.sin(tt * 7 - i * .9 + d) * w * .028 * (i / 8) + d * i * w * .006]), cor, w * .024);
    for (let i = 0; i < 12; i++) {
      const u = i / 12 * TAU + .26, c = Math.cos(u), sn = Math.sin(u), bx = c * r + (c > 0 ? L : -L) * Math.min(1, Math.abs(c) * 3), by = sn * r, on = Math.sin(tt * 6 + i * 1.7) * .25;
      if (c < -.8) continue;
      p.linha([[bx, by], [bx + Math.cos(u + on) * w * .06, by + Math.sin(u + on) * w * .06]], cor, w * .022);
    }
    p.capsula([-L, 0], [L, 0], r * 2, cor, { prof: 2 });
    p.linha(Array.from({ length: 9 }, (_, i) => [-L * .9 + i * L * .16, Math.sin(i * 1.5 + tt * 3) * r * .3 + r * .3]), "tinta", w * .02);
    for (const x of [.3, .85]) { p.circulo(L * x, -r * .25, w * .04, "#FFFFFF", { prof: 0, liso: true }); p.circulo(L * x + w * .01, -r * .25, w * .02, "#0B0F14", { prof: 0, liso: true }); }
  });
}
/** Máscara cirúrgica com pregas que infla e murcha com a respiração. Opções: larg, cor, t. Chaves: máscara, proteção, cirurgia, prevenção, higiene, pandemia, segurança, contágio */
export function mascaraCirurgica(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), resp = Math.sin(tt * 2.4), a = w * .3, N = 10, px = p.estilo === "pixel";
  // no pixel o laranja com pregas escuras vira planeta ou hambúrguer: corpo claro azulado e pregas no tom do corpo
  const cc = px && cor === "c4" ? "c3" : cor, prega = px ? escuro(p, cc, .3) : "tinta";
  const borda = (y0, alt) => Array.from({ length: N + 1 }, (_, i) => [-a + 2 * a * i / N, y0 + alt * Math.sin(Math.PI * i / N)]);
  const corpo = [...borda(-w * .17, -w * (.05 + .012 * resp)), ...borda(w * .17, w * (.08 + .035 * resp)).reverse()];
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.3) * .04 }, () => {
    // alças: um laço curto de cada lado, da borda da máscara até a orelha, sem continuar o contorno do corpo
    for (const d of [-1, 1]) p.linha(curva(emLarg([[.29, -.12], [.37, -.115], [.43, -.07], [.44, .02], [.4, .08], [.29, .1]], w).map(([x, y]) => [d * x, y]), 4), cc, px ? Math.max(w * .04, 12) : w * .026);
    p.forma(corpo, cc, { prof: 2, liso: true });
    for (let i = -1; i < 2; i++) p.linha(borda(i * w * .085 + w * .015, w * (.025 + .02 * resp) * (i + 1.5)), prega, w * .018);
    p.linha(borda(-w * .145, -w * .045).slice(3, 8), "claro", w * .026);
  });
}
/** Maca de hospital sobre rodas que vai e volta, com encosto regulável. Opções: larg, cor, k (0..1 levanta o encosto), t. Chaves: maca, leito, hospital, internação, cama, paciente, repouso, UTI, recuperação */
export function macaHospitalar(p, { larg = 400, cor = "c1", k = .5, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), bal = Math.sin(tt * 1.6) * w * .025, yq = -w * .27, rr = w * .055, ang = -(lerp(.1, .95, kk) + Math.sin(tt * 2) * .04), giro = bal / rr;
  p.em({ x: bal - w * .01, y: 0 }, () => {
    for (const x of [-w * .33, w * .33]) p.linha([[x, yq], [x, -rr]], "c4", w * .03);
    p.linha([[-w * .33, -w * .15], [w * .33, -w * .15]], "c4", w * .022);
    p.forma(retArredP(-w * .47, yq - w * .18, w * .04, w * .2, w * .015), "c4", { prof: 1, liso: true });
    p.forma(retArredP(-w * .46, yq - w * .02, w * .92, w * .045, w * .02), "c4", { prof: 1, liso: true });
    branco(p, retArredP(-w * .42, yq - w * .095, w * .55, w * .08, w * .03), "claro", w * .012, { prof: 1, liso: true });
    p.em({ x: w * .12, y: yq - w * .02, r: ang }, () => {
      branco(p, retArredP(0, -w * .075, w * .34, w * .08, w * .03), "claro", w * .012, { prof: 1, liso: true });
      p.forma(retArredP(w * .13, -w * .14, w * .19, w * .075, w * .035), "c2", { prof: 1, liso: true });
    });
    p.forma(retArredP(-w * .4, yq - w * .125, w * .38, w * .11, w * .035), cor, { prof: 1 });
    p.linha([[-w * .08, yq - w * .125], [-w * .08, yq - w * .02]], "tinta", w * .014);
    for (const x of [-w * .33, w * .33]) {
      p.circulo(x, -rr, rr, sobreFundo(p), { prof: 1, liso: true });
      p.linha([[x - Math.cos(giro) * rr * .7, -rr - Math.sin(giro) * rr * .7], [x + Math.cos(giro) * rr * .7, -rr + Math.sin(giro) * rr * .7]], "c4", w * .02);
    }
  });
}
/** Cadeira de rodas de perfil que anda para a frente e para trás com as rodas girando. Opções: larg, cor, t. Chaves: cadeira de rodas, acessibilidade, cadeirante, deficiência, inclusão, mobilidade, reabilitação, PCD */
export function cadeiraDeRodas(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .3, bal = Math.sin(tt * 1.5) * w * .035, giro = bal / R, cx = -w * .06, cy = -R;
  p.em({ x: bal - w * .05, y: 0 }, () => {
    p.linha(emLarg([[-.13, -.52], [-.2, -.94], [-.31, -.96]], w), cor, w * .045);
    p.capsula([-w * .135, -w * .6], [-w * .18, -w * .86], w * .08, "c4", { prof: 1 });
    p.linha(emLarg([[.25, -.52], [.25, -.08]], w), cor, w * .04);
    p.linha(emLarg([[.25, -.3], [.37, -.12], [.47, -.12]], w), cor, w * .045);
    p.linha(emLarg([[-.15, -.7], [.13, -.7], [.13, -.54]], w), cor, w * .035);
    p.forma(retArredP(-w * .16, -w * .57, w * .43, w * .085, w * .035), "c4", { prof: 1, liso: true });
    p.circulo(w * .25, -w * .07, w * .07, sobreFundo(p), { prof: 1, liso: true });
    p.circulo(w * .25, -w * .07, w * .028, cor, { prof: 0, liso: true });
    p.forma(circP(cx, cy, R, 36), sobreFundo(p), { prof: 2, liso: true, furos: [circP(cx, cy, R * .8, 36).reverse()] });
    for (let i = 0; i < 4; i++) { const a = giro + i * Math.PI / 4, c = Math.cos(a) * R * .82, sn = Math.sin(a) * R * .82; p.linha([[cx - c, cy - sn], [cx + c, cy + sn]], cor, w * .02); }
    p.circulo(cx, cy, R * .2, cor, { prof: 1, liso: true });
  });
}
/** Termômetro clínico digital inclinado, com a temperatura no visor e ondas de bip. Opções: larg, cor, k (0..1 sobe a temperatura de 36 a 40 graus), t. Chaves: termômetro, febre, temperatura, medir, sintoma, gripe, digital, esquentou */
export function termometroClinico(p, { larg = 340, cor = "c3", k = .4, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), h = w * .18, grau = (36 + kk * 4).toFixed(1).replace(".", ","), febre = kk > .37;
  p.em({ x: -w * .05, y: w * .03, r: -.5 + Math.sin(tt * 2) * .04 }, () => {
    p.capsula([-w * .47, 0], [-w * .15, 0], w * .055, "c4", { prof: 1 });
    p.forma([[-w * .25, -w * .032], [-w * .1, -h / 2], ...arcoP(w * .46 - h / 2, 0, h / 2, -90, 90, 10), [-w * .1, h / 2], [-w * .25, w * .032]], cor, { prof: 2, liso: true });
    p.forma(retArredP(-w * .06, -h * .32, w * .3, h * .64, h * .14), "claro", { prof: 0, liso: true });
    p.texto(grau, w * .09, h * .02, { tam: h * .46, cor: "tinta" });
    p.circulo(w * .345, 0, h * .2 * (1 + .12 * Math.sin(tt * 8)), febre ? "c1" : "c2", { prof: 0, liso: true });
    for (let i = 0; i < 2; i++) { const f = (tt * 1.2 + i / 2) % 1; p.alfa(1 - f, () => p.linha(arcoP(w * .4, 0, w * (.09 + f * .1), -48, 48, 8), febre ? "c1" : "c2", w * .022)); }
  });
}
/** Gota de sangue vermelha que estica e encolhe, com uma hemácia girando e uma gotinha caindo ao lado. Opções: alt, cor ("sangue" = vermelho do estilo), t. Chaves: sangue, gota, doação, exame, hemograma, transfusão, tipo sanguíneo, suor e sangue */
export function gotaDeSangue(p, { alt = 300, cor = "sangue", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), m = Math.sin(tt * 3.5), f = (tt * .7) % 1, c = cor === "sangue" ? SANGUE[p.estilo] || SANGUE.flat : cor, cs = escuro(p, c, .32);
  const gota = (r, topo, cy) => [[0, topo], ...arcoP(0, cy, r, -32, 212, 20)];
  p.em({ x: -h * .04, y: 0, sx: 1 - .04 * m, sy: 1 + .04 * m }, () => {
    p.forma(gota(h * .3, -h * .48, h * .18), c, { prof: 2, liso: true });
    p.linha(arcoP(0, h * .18, h * .19, 115, 165, 5), maisClaro(p, c, .5), h * .04);
  });
  // hemácia: disco vermelho com o centro afundado, que gira e flutua
  p.em({ x: -h * .3, y: -h * .3 + Math.sin(tt * 2.2) * h * .03, r: -.4 + Math.sin(tt * 1.4) * .35 }, () => {
    p.elipse(0, 0, h * .12, h * .08, c, { prof: 1, liso: true });
    p.elipse(0, 0, h * .06, h * .032, cs, { prof: 0, liso: true });
  });
  p.alfa(f < .75 ? 1 : (1 - f) * 4, () => p.em({ x: h * .33, y: -h * .22 + f * f * h * .6 }, () => p.forma(gota(h * .065, -h * .11, h * .03), c, { prof: 1, liso: true })));
}
/** Balança de banheiro vista de cima, com o ponteiro oscilando até marcar o peso. Opções: larg, cor, k (0..1 peso marcado), t. Chaves: balança, peso, emagrecer, dieta, quilos, engordar, medida, meta, obesidade */
export function balancaDePeso(p, { larg = 300, cor = "c4", k = .55, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .45) % 1, osc = Math.sin(f * 30) * Math.exp(-f * 5), ang = lerp(-1.05, 1.05, clamp(k)) + osc * .7 - Math.PI / 2, py = -w * .2;
  p.em({ x: 0, y: 0, s: 1 - .03 * Math.exp(-f * 8) }, () => {
    p.forma(retArredP(-w / 2, -w * .46, w, w * .92, w * .13), cor, { prof: 2 });
    p.forma([...arcoP(0, py, w * .24, 180, 360, 14), [w * .24, py + w * .03], [-w * .24, py + w * .03]], "claro", { prof: 0, liso: true });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .55; p.linha([[Math.cos(a) * w * .17, py + Math.sin(a) * w * .17], [Math.cos(a) * w * .215, py + Math.sin(a) * w * .215]], "tinta", w * .018); }
    p.linha([[0, py], [Math.cos(ang) * w * .16, py + Math.sin(ang) * w * .16]], "c1", w * .028);
    p.circulo(0, py, w * .03, "tinta", { prof: 0, liso: true });
    for (const d of [-1, 1]) {
      p.elipse(d * w * .19, w * .17, w * .1, w * .18, escuro(p, cor, .22), { prof: 0, liso: true });
      for (let i = 0; i < 3; i++) p.linha([[d * w * .19 - w * .06, w * (.09 + i * .08)], [d * w * .19 + w * .06, w * (.09 + i * .08)]], "tinta", w * .016);
    }
  });
}
/** Suporte de soro com a bolsa balançando, gotas pingando na câmara e o tubo descendo. Opções: alt, cor, k (0..1 quanto resta na bolsa), t. Chaves: soro, hospital, internação, hidratação, medicação na veia, tratamento, gota a gota, paciência */
export function soro(p, { alt = 420, cor = "c4", k = .65, t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), xp = -h * .11, xb = h * .1, f = (tt * 1.1) % 1, niv = clamp(k) * .86 + .04;
  p.linha([[xp - h * .15, -h * .035], [xp + h * .15, -h * .035]], "c1", h * .03);
  for (const d of [-1, 1]) p.circulo(xp + d * h * .14, -h * .022, h * .022, sobreFundo(p), { prof: 0, liso: true });
  p.linha([[xp, -h * .035], [xp, -h * .965], [xb, -h * .965], [xb, -h * .92]], "c1", h * .026);
  p.em({ x: xb, y: -h * .92, r: Math.sin(tt * 1.6) * .05 }, () => {
    const bolsa = retArredP(-h * .1, h * .02, h * .2, h * .3, h * .04);
    p.linha([[0, 0], [0, h * .03]], "c1", h * .02);
    branco(p, bolsa, "claro", h * .012, { prof: 2, liso: true });
    p.recortar(bolsa, () => {
      const y0 = h * (.02 + .3 * (1 - niv)), sup = Array.from({ length: 7 }, (_, i) => [-h * .1 + h * .2 * i / 6, y0 + Math.sin(tt * 4 + i * 1.4) * h * .008]);
      p.forma([...sup, [h * .1, h * .34], [-h * .1, h * .34]], cor, { prof: 0, liso: true });
    });
    for (let i = 1; i < 4; i++) p.linha([[h * .04, h * (.02 + i * .075)], [h * .09, h * (.02 + i * .075)]], "tinta", h * .012);
    p.forma(retP(-h * .018, h * .32, h * .036, h * .04), "c1", { prof: 0, liso: true });
    branco(p, retArredP(-h * .035, h * .355, h * .07, h * .11, h * .02), "claro", h * .01, { prof: 1, liso: true });
    p.circulo(0, h * (.375 + f * .06), h * .017, cor, { prof: 0, liso: true });
    p.forma(retP(-h * .035, h * .44, h * .07, h * .025), cor, { prof: 0, liso: true });
    p.linha(emLarg([[0, .465], [0, .56], [.02, .63], [.07, .68], [.13, .7], [.17, .74]], h), cor, h * .018);
  });
}
/** Braço dobrado que flexiona o bíceps: o antebraço sobe e o músculo cresce. Opções: larg, pele, cor (manga), t. Chaves: músculo, força, bíceps, academia, treino, forte, exercício, poder, resistência */
export function musculo(p, { larg = 320, pele = "pele1", cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = E.entraSai(vaiVem(tt, .45)), tr = p.estilo === "traco", px = p.estilo === "pixel", lw = px ? Math.max(w * .03, 9) : w * .024;
  // no traco a pele escura some no fundo azul-marinho: contorno pêssego luminoso e detalhes ainda mais claros
  const corpo = tr ? maisClaro(p, pele, .3) : pele, som = tr ? maisClaro(p, pele, .6) : escuro(p, pele, .3);
  // uma silhueta só, no jeito do emoji de bíceps: o braço deitado com a corcova do bíceps na borda de cima,
  // o cotovelo redondo embaixo e o antebraço subindo até o punho fechado. O antebraço gira em torno do cotovelo.
  const a = lerp(-1.0, -1.5, f), ux = Math.cos(a), uy = Math.sin(a), Ex = .17, Ey = .08, bump = .1 + .1 * f;
  const F = (l, q) => [Ex + ux * l - uy * q, Ey + uy * l + ux * q];
  const ctrl = [[-.5, .22], [-.22, .25], [.08, .26], [.26, .2], F(.15, .125), F(.29, .095), F(.37, .15), F(.5, .165), F(.61, .08), F(.64, -.04), F(.57, -.15), F(.44, -.165), F(.33, -.1), F(.2, -.1), F(.07, -.12),
    [.0, -.03 - bump * .55], [-.08, -.05 - bump], [-.2, -.06 - bump * 1.08], [-.32, -.05 - bump * .7], [-.42, -.035 - bump * .2], [-.5, -.03]];
  const braco = suave(emLarg(ctrl, w), 5);
  p.em({ x: -w * .04, y: w * .12 }, () => {
    p.forma(braco, corpo, { prof: 2, liso: true });
    p.recortar(braco, () => {
      p.forma(retP(-w * .6, -w * .5, w * .2, w), cor, { prof: 0, liso: true });
      p.linha([[-w * .4, -w * .5], [-w * .4, w * .5]], tr ? maisClaro(p, cor, .4) : escuro(p, cor, .3), lw);
    });
    if (tr) p.linha(braco, corpo, w * .02, { fechar: true });
    // risco embaixo do bíceps, que acompanha o inchaço, e a dobra do cotovelo
    p.linha(curva(emLarg([[-.27, -.02 + bump * .1], [-.15, .03 + bump * .15], [-.03, .0 + bump * .1]], w), 4), som, lw);
    p.linha(curva(emLarg([F(.02, -.06), F(.1, -.02), F(.12, .04)], w), 3), som, lw);
    // punho fechado: dedos dobrados de frente para o bíceps e o polegar por cima
    for (const l of [.44, .52]) p.linha(emLarg([F(l, -.17), F(l, -.07)], w), som, lw);
    p.linha(curva(emLarg([F(.36, .08), F(.42, -.02), F(.52, -.05), F(.58, -.03)], w), 3), som, lw);
    if (f > .55) for (let i = 0; i < 3; i++) { const u = -Math.PI / 2 + (i - 1) * .55, r0 = w * .05, r1 = r0 + w * .08 * (f - .55) / .45, cx = -w * .18, cy = -w * (.09 + bump); p.linha([[cx + Math.cos(u) * r0, cy + Math.sin(u) * r0], [cx + Math.cos(u) * r1, cy + Math.sin(u) * r1]], sobreFundo(p), w * .026); }
  });
}
/** Par de rins em forma de feijão que pulsam alternados, com gotas descendo pelos ureteres. Opções: larg, cor, cor2, t. Chaves: rins, rim, filtrar, urina, nefrologia, hemodiálise, beber água, filtro, limpeza do corpo */
export function rins(p, { larg = 300, cor = "c1", cor2 = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = w * .17, b = w * .3;
  const feijao = [[0, -1], [-.75, -.8], [-1, -.1], [-.8, .7], [-.1, 1], [.6, .8], [.78, .38], [.42, 0], [.78, -.42], [.55, -.86]];
  p.em({ x: 0, y: -w * .06 }, () => {
    for (const d of [-1, 1]) {
      const m = ([x, y]) => [d * (x * a - w * .23), y * b], ur = [[.5, 0], [.85, .45], [1.08, 1], [1.14, 1.65]].map(m), f = (tt * .6 + (d > 0 ? .5 : 0)) % 1, g = noCaminho(ur, f);
      p.linha(ur, cor2, w * .04);
      p.circulo(g[0], g[1], w * .032, "c4", { prof: 0, liso: true });
      p.em({ x: -d * w * .23, y: 0, s: 1 + .05 * Math.sin(tt * 3 + (d > 0 ? Math.PI : 0)) }, () => {
        const n = ([x, y]) => [d * x * a, y * b];
        p.forma(suave(feijao.map(n), 5), cor, { prof: 2, liso: true, semente: d + 3 });
        p.forma(suave([[.25, -.2], [.6, -.12], [.7, 0], [.6, .12], [.25, .2], [.1, 0]].map(n), 4), cor2, { prof: 0, liso: true });
        p.linha(suave([[-.5, -.55], [-.68, 0], [-.5, .55], [-.6, 0]].map(n), 4).slice(0, 9), "tinta", w * .02);
      });
    }
  });
}
