// Categoria: Natureza e clima
// Kit de movimento — plantas, relevo, água e fenômenos do tempo: do broto que cresce ao vulcão em erupção.
// O que nasce do chão tem a base em y = 0; o que flutua (floco, gota, tempestade) fica centrado na origem.
// A convenção das peças está em ./_comum.js.
import { clamp, lerp, semear, ruido, E, circP, retP, retArredP, rotP, misturarCor, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
const HEX6 = /^#[0-9a-f]{6}$/i;
// cinza de nuvem carregada e de fumaça: aparece sobre o fundo nos cinco estilos
const cinza = (p, k = .3) => { const a = p.cor("tinta"), b = p.cor("claro"); return HEX6.test(a) && HEX6.test(b) ? misturarCor(a, b, k) : a; };
// cor de água: azul no flat, no pixel e no vidro, ciano no traco; no papel, o c4 (azul acinzentado)
const agua = p => p.estilo === "papel" ? "c4" : "c1";
// cor de areia: amarelo no flat e no pixel; nos outros, o destaque quente (c2)
const areia = p => p.estilo === "flat" || p.estilo === "pixel" ? "c4" : "c2";
// cor da lua em cada estilo
const corLua = p => ({ papel: "c2", flat: "c4", pixel: "claro", traco: "tinta", vidro: "c2" })[p.estilo] || "c2";
// mistura duas cores (papel ou hex); se alguma não for hex, fica com a primeira
const mistura = (p, a, b, k) => { const x = p.cor(a), y = p.cor(b); return HEX6.test(x) && HEX6.test(y) ? misturarCor(x, y, k) : x; };
const mover = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
// folha com o cabo na origem e a ponta em +x
const folhaP = (L, W) => [[0, 0], [L * .22, -W * .4], [L * .5, -W * .5], [L * .8, -W * .32], [L, 0], [L * .8, W * .32], [L * .5, W * .5], [L * .22, W * .4]];
const folhaEm = (x, y, L, W, ang) => mover(rotP(folhaP(L, W), 0, 0, ang), x, y);
// arredonda uma linha aberta de pontos, mantendo as duas pontas
function suavizar(pts, vezes = 2) {
  for (let v = 0; v < vezes; v++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } o.push(pts[pts.length - 1]); pts = o; }
  return pts;
}
// brilho de quatro pontas que acende e apaga (f = 0..1)
const brilho4 = (p, x, y, r, f, cor) => p.em({ x, y, s: Math.sin(f * Math.PI) + .001, r: f * 1.5 }, () => p.forma(estrelaP(0, 0, r, r * .32, 4), cor, { prof: 0, liso: true }));
// nuvem de contorno único (lê bem no traço): base reta em y = 0, largura w
const nuvemP = w => mover([...arcoP(-.27 * w, -.13 * w, .13 * w, 90, 290, 10), ...arcoP(-.07 * w, -.24 * w, .19 * w, 200, 330, 10), ...arcoP(.17 * w, -.2 * w, .15 * w, 230, 350, 8), ...arcoP(.3 * w, -.11 * w, .11 * w, 280, 450, 10)], 0, 0);
// pinheiro simples de três andares, base em (x, 0)
function pinheiro(p, x, a, cor, tronco, bal, sd) {
  p.forma(retP(x - a * .035, -a * .2, a * .07, a * .2), tronco, { prof: 0, liso: true });
  for (let i = 0; i < 3; i++) { const y = -a * (.14 + i * .24), m = a * (.27 - i * .055); p.forma([[x - m + bal * i * .4, y], [x + m + bal * i * .4, y], [x + bal * (i + 1), y - a * .4]], cor, { prof: 1, semente: sd + i }); }
}

/* ---------------------------------------------------------------- plantas */
/** Flor de pétalas redondas que balança no caule e desabrocha. Opções: alt, cor, k (0..1 cresce e abre), t. Chaves: flor, primavera, desabrochar, crescimento, jardim, beleza, florescer, delicadeza */
export function flor(p, { alt = 320, cor = "c1", k = 1, t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), kk = clamp(k), hc = h * .66 * lerp(.3, 1, kk), bal = Math.sin(tt * 1.8) * .08, ab = E.sai(kk);
  const topo = [bal * hc, -hc], meio = [bal * hc * .3, -hc * .5], R = h * .3 * lerp(.25, 1, ab), fl = lerp(.2, 1, ab);
  p.linha([[0, 0], meio, topo], "c3", h * .05);
  p.forma(folhaEm(meio[0] * .5, -hc * .28, h * .25 * fl, h * .12 * fl, -2.6 + bal * 2), "c3", { prof: 1, liso: true });
  p.forma(folhaEm(meio[0] * .9, -hc * .46, h * .22 * fl, h * .11 * fl, -.55 + bal * 2), "c3", { prof: 1, liso: true });
  p.em({ x: topo[0], y: topo[1], r: bal * 2 + tt * .25 }, () => {
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d = R * (.6 + .05 * Math.sin(tt * 4 + i)); p.circulo(Math.cos(a) * d, Math.sin(a) * d, R * .4, cor, { prof: 1, semente: i + 1, liso: true }); }
    p.circulo(0, 0, R * .34, "c2", { prof: 1, liso: true });
  });
}
/** Girassol alto de pétalas pontudas e miolo grande, que gira devagar e acompanha o sol. Opções: alt, cor, t. Chaves: girassol, flor, sol, verão, otimismo, energia, campo, alegria */
export function girassol(p, { alt = 360, cor = "c2", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), bal = Math.sin(tt * 1.4) * .06, R = h * .2, cab = [bal * h * .7, -h * .72];
  p.linha([[0, 0], [bal * h * .2, -h * .36], cab], "c3", h * .05);
  p.forma(folhaEm(bal * h * .1, -h * .22, h * .25, h * .14, -2.75 + bal * 2), "c3", { prof: 1, liso: true });
  p.forma(folhaEm(bal * h * .2, -h * .36, h * .23, h * .13, -.4 + bal * 2), "c3", { prof: 1, liso: true });
  p.em({ x: cab[0], y: cab[1], r: bal * 2 }, () => {
    for (let cam = 0; cam < 2; cam++) for (let i = 0; i < 12; i++) {
      const a = (i + cam * .5) / 12 * TAU + tt * .2, pt = R * (cam ? 1.38 : 1.24) * (1 + .04 * Math.sin(tt * 4 + i)), q = (ang, r) => [Math.cos(ang) * r, Math.sin(ang) * r];
      p.forma([q(a - .2, R * .7), q(a - .13, R * 1.05), q(a, pt), q(a + .13, R * 1.05), q(a + .2, R * .7)], cam ? cor : escuro(p, cor, .16), { prof: 0, liso: true });
    }
    p.circulo(0, 0, R * .8, "tinta", { prof: 1, liso: true });
    p.circulo(0, 0, R * (.46 + .03 * Math.sin(tt * 4)), escuro(p, cor, .42), { prof: 0, liso: true });
  });
}
/** Arbusto redondo que se mexe com o vento, com frutinhas que pulsam. Opções: larg, cor, frutas, t. Chaves: arbusto, moita, jardim, planta, mato, cerca viva, esconder, vegetação */
export function arbusto(p, { larg = 320, cor = "c3", frutas = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), incl = Math.sin(tt * 1.6) * .06;
  const moita = (cx, rx, ry, gomos, fase) => { const N = gomos * 6, o = []; for (let i = 0; i <= N; i++) { const a = Math.PI + i / N * Math.PI, g = 1 + .11 * Math.abs(Math.sin(i / N * Math.PI * gomos)) + .012 * Math.sin(tt * 3 + i + fase), y = Math.sin(a) * ry * g; o.push([cx + Math.cos(a) * rx * g - y * incl, y]); } return o; };
  p.forma(moita(0, w * .45, w * .46, 5, 0), escuro(p, cor, .18), { prof: 2, liso: true });
  p.forma(moita(-w * .17, w * .27, w * .27, 3, 2), cor, { prof: 1, liso: true });
  p.forma(moita(w * .2, w * .23, w * .21, 3, 4), cor, { prof: 1, liso: true });
  [[-.26, -.14], [-.06, -.36], [.2, -.1], [.3, -.3], [-.3, -.33], [.06, -.2]].forEach(([x, y], i) => p.circulo(x * w - y * w * incl, y * w, w * (.042 + .01 * Math.sin(tt * 4 + i * 1.7)), frutas, { prof: 0, liso: true }));
}
/** Cacto de dois braços que balança de leve, com flores que pulsam no topo. Opções: alt, cor, t. Chaves: cacto, deserto, seca, resistência, espinho, sertão, calor, sobreviver */
export function cacto(p, { alt = 340, cor = "c3", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), l = h * .1, sombra = escuro(p, cor, .22);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.5) * .025 }, () => {
    const e = -h * (.62 + .015 * Math.sin(tt * 2.2)), d = -h * (.76 + .015 * Math.sin(tt * 2.2 + 2));
    p.capsula([-h * .08, -h * .36], [-h * .27, -h * .36], l, cor); p.capsula([-h * .27, -h * .36], [-h * .27, e], l, cor, { prof: 1 });
    p.capsula([h * .08, -h * .5], [h * .26, -h * .5], l, cor); p.capsula([h * .26, -h * .5], [h * .26, d], l, cor, { prof: 1 });
    p.forma([[-h * .115, 0], ...arcoP(0, -h * .84, h * .115, 180, 360, 10), [h * .115, 0]], cor, { prof: 2 });
    for (const x of [-h * .04, h * .04]) p.linha([[x, -h * .06], [x, -h * .86]], sombra, h * .016);
    p.linha([[-h * .27, -h * .4], [-h * .27, e]], sombra, h * .014); p.linha([[h * .26, -h * .54], [h * .26, d]], sombra, h * .014);
    p.circulo(0, -h * .955, h * (.045 + .008 * Math.sin(tt * 4)), "c1", { prof: 0, liso: true });
    p.circulo(-h * .27, e - h * .06, h * (.036 + .007 * Math.sin(tt * 4 + 1)), "c2", { prof: 0, liso: true });
  });
}
/** Folhas que caem girando e virando dentro de uma área. Opções: larg, alt, n, cor, semente, t. Chaves: folhas, outono, queda, vento, mudança, passagem do tempo, estação, desapego */
export function folhas(p, { larg = 340, alt = 360, n = 7, cor = "c3", semente = 3, t = 0 } = {}) {
  const tt = p.ritmo(t), L = larg * .2, cores = [cor, "c2", "c1"];
  if (p.estilo === "pixel") {
    // na grade de pixels, folha pequena vira mancha: poucas, grandes, cada uma na sua faixa e defasadas na queda
    const Lp = larg * .27, m = Math.max(1, Math.min(4, n)), fases = [0, .5, .25, .75];
    for (let i = 0; i < m; i++) {
      const f = (fases[i] + tt * .13 + semente * .07) % 1, c = cores[i % 3], esc = escuro(p, c, .4);
      const x = (m > 1 ? lerp(-.34, .34, i / (m - 1)) : 0) * larg + Math.sin(tt * 1.4 + i * 2) * larg * .04;
      const y = lerp(-alt / 2 + Lp * .45, alt / 2 - Lp * .45, f), ang = Math.PI / 2 + (i % 2 ? .45 : -.45) + Math.sin(tt * 1.6 + i) * .25;
      p.alfa(Math.min(1, Math.sin(f * Math.PI) * 4), () => p.em({ x, y, r: ang }, () => {
        const pts = mover(folhaP(Lp, Lp * .5), -Lp * .5, 0);
        p.forma(pts, c, { prof: 0, liso: true });
        p.linha(pts, esc, 6, { fechar: true });
        p.linha([[-Lp * .62, 0], [Lp * .36, 0]], esc, 6);
      }));
    }
    return;
  }
  for (const s of semear(n, semente)) {
    const f = (s.v + tt * (.16 + s.w * .1)) % 1, x = (s.u - .5) * larg * .72 + Math.sin(tt * 1.6 + s.q * 6) * larg * .1, vira = Math.cos(tt * 2.2 + s.q * 9), c = cores[s.i % 3];
    p.alfa(Math.min(1, Math.sin(f * Math.PI) * 4), () => p.em({ x, y: lerp(-alt / 2 + L * .5, alt / 2 - L * .5, f), r: s.q * 6 + Math.sin(tt * 1.3 + s.i) * 1.2, sy: (vira < 0 ? -1 : 1) * Math.max(.35, Math.abs(vira)) }, () => {
      p.forma(mover(folhaP(L, L * .56), -L * .5, 0), c, { prof: 1, liso: true });
      p.linha([[-L * .66, 0], [L * .3, 0]], escuro(p, c, .3), L * .07);
    }));
  }
}
/** Tufo de grama com as lâminas ondulando ao vento. Opções: larg, cor, n, t. Chaves: grama, capim, gramado, campo, pasto, relva, chão, natureza */
export function grama(p, { larg = 360, cor = "c3", n = 13, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), sem = semear(n, 21);
  for (const s of sem) {
    const x0 = lerp(-w * .42, w * .42, s.i / Math.max(1, n - 1)) + (s.u - .5) * w * .03, hh = w * (.2 + .22 * s.v), incl = (s.w - .5) * .7 + Math.sin(tt * 2 + s.i * .45) * .2, bw = w * .04;
    const meio = [x0 + Math.sin(incl * .4) * hh * .55, -Math.cos(incl * .4) * hh * .55], ponta = [x0 + Math.sin(incl) * hh, -Math.cos(incl) * hh];
    p.forma([[x0 - bw, 0], [meio[0] - bw * .75, meio[1]], ponta, [meio[0] + bw * .75, meio[1]], [x0 + bw, 0]], s.i % 2 ? cor : escuro(p, cor, .2), { prof: 1, liso: true });
  }
  p.forma([[-w * .5, 0], ...arcoP(0, 0, w * .5, 180, 360, 12).map(([x, y]) => [x, y * .11]), [w * .5, 0]], escuro(p, cor, .34), { prof: 1, liso: true });
}
/** Cogumelo de chapéu pintado que respira, com um filhote ao lado e esporos subindo. Opções: larg, cor, t. Chaves: cogumelo, fungo, floresta, conto de fadas, veneno, brotar, umidade, magia */
export function cogumelo(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  const um = (fase) => {
    const chapeu = [...arcoP(0, -w * .34, w * .42, 180, 360, 16).map(([x, y]) => [x, -w * .34 + (y + w * .34) * .86]), [w * .28, -w * .3], [0, -w * .285], [-w * .28, -w * .3]];
    p.forma([[-w * .13, 0], [-w * .09, -w * .12], [-w * .08, -w * .34], [w * .08, -w * .34], [w * .09, -w * .12], [w * .13, 0]], "claro", { prof: 1 });
    p.forma(retArredP(-w * .115, -w * .27, w * .23, w * .055, w * .025), escuro(p, cor, .25), { prof: 0, liso: true });
    p.em({ x: 0, y: -w * .3, r: Math.sin(tt * 2 + fase) * .04 }, () => p.em({ x: 0, y: w * .3 }, () => {
      p.forma(chapeu, cor, { prof: 2 });
      p.recortar(chapeu, () => [[-.2, -.5, .07], [.06, -.6, .085], [.26, -.45, .06], [-.01, -.4, .045], [-.34, -.38, .045]].forEach(([x, y, r]) => p.circulo(x * w, y * w, r * w, "claro", { prof: 0, liso: true })));
    }));
  };
  p.em({ x: w * .36, y: 0, s: .42, sy: .42 * (1 + .05 * Math.sin(tt * 3 + 2)) }, () => um(2));
  p.em({ x: -w * .08, y: 0, sy: 1 + .035 * Math.sin(tt * 3) }, () => um(0));
  for (let i = 0; i < 3; i++) { const f = (tt * .35 + i / 3) % 1; p.alfa(Math.sin(f * Math.PI), () => p.circulo(-w * .08 + (i - 1) * w * .2 + Math.sin(tt * 2 + i) * w * .03, -w * (.72 + f * .2), w * .03, "c2", { prof: 0, liso: true })); }
}
/** Floresta de pinheiros e copas em duas fileiras, balançando, com pássaros passando. Opções: larg, cor, t. Chaves: floresta, mata, bosque, selva, árvores, meio ambiente, amazônia, natureza */
export function floresta(p, { larg = 420, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), tronco = escuro(p, "c2", .45), fundo = escuro(p, cor, .26);
  const copa = (x, a, c, bal, sd) => { p.forma(retP(x - a * .04, -a * .5, a * .08, a * .5), tronco, { prof: 0, liso: true }); p.circulo(x - a * .14 + bal, -a * .6, a * .22, c, { prof: 1, semente: sd }); p.circulo(x + a * .13 + bal, -a * .62, a * .23, c, { prof: 1, semente: sd + 1 }); p.circulo(x + bal * 1.4, -a * .78, a * .25, c, { prof: 1, semente: sd + 2 }); };
  [[-.37, .5, 0], [-.13, .64, 0], [.13, .52, 1], [.37, .58, 0], [-.25, .4, 1], [.01, .45, 0], [.27, .37, 0]].forEach(([x, a, redonda], i) => {
    const bal = Math.sin(tt * 1.6 + i * 1.3) * w * a * .035, c = i < 4 ? fundo : cor;
    redonda ? copa(x * w, a * w, c, bal, i * 5 + 1) : pinheiro(p, x * w, a * w, c, tronco, bal, i * 5 + 1);
  });
  p.forma([[-w * .5, 0], [-w * .5, -w * .03], [-w * .25, -w * .05], [0, -w * .035], [w * .25, -w * .05], [w * .5, -w * .03], [w * .5, 0]], escuro(p, cor, .4), { prof: 1, liso: true });
  for (let i = 0; i < 2; i++) { const f = (tt * .12 + i * .45) % 1, x = lerp(-w * .5, w * .5, f), y = -w * (.66 + i * .07) + Math.sin(tt * 2 + i) * w * .01, asa = Math.sin(tt * 9 + i * 2) * w * .02; p.linha([[x - w * .035, y - asa], [x, y + w * .01], [x + w * .035, y - asa]], sobreFundo(p), w * .016); }
}

/* ---------------------------------------------------------------- relevo e água */
/** Pedra cinza facetada que balança, com a pedrinha ao lado pulando e levantando poeira. Opções: larg, cor (padrão: cinza de pedra), t. Chaves: pedra, rocha, obstáculo, peso, firmeza, dificuldade, pedregulho, solidez */
export function pedra(p, { larg = 300, cor = "", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || cinza(p, .45), fase = (tt * 3 / Math.PI) % 1, pulo = Math.abs(Math.sin(tt * 3)) * w * .05, m = pts => pts.map(([x, y]) => [x * w, y * w]);
  p.em({ x: -w * .04, y: 0, r: Math.sin(tt * 2.2) * .03 }, () => {
    p.forma(m([[-.44, 0], [-.48, -.16], [-.36, -.4], [-.12, -.56], [.14, -.52], [.34, -.34], [.42, -.12], [.38, 0]]), c, { prof: 2 });
    p.forma(m([[-.36, -.4], [-.12, -.56], [.14, -.52], [.03, -.34], [-.2, -.29]]), maisClaro(p, c, .3), { prof: 0, liso: true });
    p.forma(m([[.14, -.52], [.34, -.34], [.42, -.12], [.38, 0], [.14, 0], [.03, -.34]]), escuro(p, c, .24), { prof: 0, liso: true });
    p.linha(m([[-.2, -.29], [-.27, -.14], [-.2, 0]]), escuro(p, c, .3), w * .018);
    p.linha(m([[.03, -.34], [.1, -.22], [.06, -.1]]), escuro(p, c, .38), w * .014);
    [[-.3, -.2, .028], [-.08, -.42, .022], [.22, -.2, .025], [-.14, -.12, .018]].forEach(([x, y, r]) => p.circulo(x * w, y * w, r * w, escuro(p, c, .16), { prof: 0, liso: true }));
  });
  p.em({ x: w * .4, y: -pulo, r: Math.sin(tt * 3) * .15 }, () => { p.forma(m([[-.12, 0], [-.13, -.1], [-.03, -.17], [.09, -.12], [.12, 0]]), c, { prof: 1 }); p.forma(m([[-.03, -.17], [.09, -.12], [.12, 0], [.02, 0]]), escuro(p, c, .24), { prof: 0, liso: true }); });
  for (const lado of [-1, 1]) p.alfa(1 - fase, () => p.circulo(w * .4 + lado * w * (.1 + fase * .1), -w * (.025 + fase * .05), w * (.022 + fase * .025), maisClaro(p, c, .35), { prof: 0, liso: true }));
}
/** Vulcão em erupção: jato de lava, bombas voando, lava escorrendo e fumaça subindo. Opções: larg, cor, lava, k (0..1 força da erupção; 0 só fumaça), t. Chaves: vulcão, erupção, lava, explosão, crise, raiva, pressão, desastre, magma */
export function vulcao(p, { larg = 360, cor = "c4", lava = "c2", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), topo = -w * .56, fum = cinza(p, .35), quente = maisClaro(p, lava, .5);
  for (let i = 0; i < 3; i++) { const f = (tt * .22 + i / 3) % 1; p.alfa(Math.min(1, (1 - f) * 1.6), () => p.circulo(w * (.03 + f * .16) + Math.sin(tt + i * 2) * w * .02, topo - w * (.08 + f * .34), w * (.06 + f * .07) * (.65 + .35 * kk), fum, { prof: 0, semente: i + 1 })); }
  p.em({ x: Math.sin(tt * 30) * w * .006 * kk, y: 0 }, () => {
    if (kk > .03) {
      [[lava, 1], [quente, .58]].forEach(([c, s], n) => { const pts = [[-w * .12 * s, topo + w * .02]]; for (let i = 1; i < 6; i++) pts.push([-w * .12 * s + w * .24 * s * i / 6 + ruido(tt * 5 + i, n) * w * .015, topo - w * .3 * kk * s * (i % 2 ? 1 : .55) * (.8 + .2 * Math.sin(tt * 9 + i * 2 + n))]); pts.push([w * .12 * s, topo + w * .02]); p.forma(pts, c, { prof: 0, semente: n + 1 }); });
      for (const s of semear(7, 11)) { const f = (tt * .55 + s.u) % 1, a = -Math.PI / 2 + (s.v - .5) * 1.3, v = w * (.6 + .3 * s.w) * kk; p.circulo(Math.cos(a) * v * f, topo + Math.sin(a) * v * f + w * .5 * f * f, w * (.03 + .018 * s.w), s.i % 2 ? quente : lava, { prof: 0, liso: true }); }
    }
    p.forma([[-w * .5, 0], [-w * .35, -w * .19], [-w * .23, -w * .4], [-w * .13, topo], [w * .13, topo], [w * .21, -w * .42], [w * .36, -w * .18], [w * .5, 0]], cor, { prof: 2 });
    p.linha([[-w * .3, -w * .12], [-w * .22, -w * .26]], escuro(p, cor, .25), w * .018); p.linha([[w * .3, -w * .1], [w * .25, -w * .2]], escuro(p, cor, .25), w * .018);
    if (kk > .03) [[-.075, .3, -.13], [.01, .44, .03], [.085, .25, .15]].forEach(([x0, L, x1], i) => { const len = w * L * kk * (.92 + .08 * Math.sin(tt * 3 + i * 2)); p.forma([[(x0 - .035) * w, topo], [(x0 + .035) * w, topo], [(x1 + .03) * w, topo + len * .75], [x1 * w, topo + len], [(x1 - .03) * w, topo + len * .75]], lava, { prof: 0, liso: true }); });
    p.elipse(0, topo, w * .13, w * .032, kk > .03 ? quente : escuro(p, cor, .4), { prof: 0, liso: true });
  });
}
/** Cachoeira despencando do paredão, com fios de água descendo e espuma borbulhando no poço. Opções: larg, alt, cor (padrão: azul de água), rocha, t. Chaves: cachoeira, queda d'água, cascata, fluxo, abundância, natureza, força, renovação */
export function cachoeira(p, { larg = 300, alt = 360, cor = "", rocha = "c3", t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), topo = -h * .88;
  cor = cor || agua(p); const esp = maisClaro(p, cor, .72);
  p.forma([[-w * .5, 0], [-w * .5, -h * .84], [-w * .32, -h * .97], [-w * .17, topo], [w * .17, topo], [w * .33, -h], [w * .5, -h * .88], [w * .5, 0]], rocha, { prof: 2 });
  p.forma([[-w * .5, -h * .5], [-w * .26, -h * .56], [-w * .3, -h * .3], [-w * .5, -h * .24]], escuro(p, rocha, .22), { prof: 0, liso: true });
  p.forma([[w * .5, -h * .62], [w * .27, -h * .7], [w * .3, -h * .42], [w * .5, -h * .36]], escuro(p, rocha, .22), { prof: 0, liso: true });
  p.elipse(0, -h * .09, w * .45, h * .09, cor, { prof: 1, liso: true });
  for (let i = 0; i < 2; i++) { const f = (tt * .5 + i / 2) % 1; p.alfa(1 - f, () => p.linha(circP(0, -h * .09, w * (.2 + f * .22), 24, h * (.035 + f * .045)), esp, w * .02, { fechar: true })); }
  p.forma([[-w * .17, topo], [w * .17, topo], [w * .2, -h * .1], [-w * .2, -h * .1]], cor, { prof: 1, liso: true });
  for (let i = 0; i < 4; i++) { const x = lerp(-w * .115, w * .115, i / 3), f = (tt * .8 + i * .37) % 1, y = lerp(topo + h * .02, -h * .3, f); p.linha([[x, y], [x * 1.1, y + h * .14]], esp, w * .028); }
  for (let i = 0; i < 5; i++) p.circulo(lerp(-w * .2, w * .2, i / 4), -h * .12 + Math.sin(tt * 5 + i * 1.9) * h * .012, w * (.062 + .02 * Math.sin(tt * 6 + i * 2.3)), esp, { prof: 0, liso: true });
}
/** Rio que serpenteia pelo terreno até perto de quem vê, com a correnteza descendo. Opções: larg, cor (padrão: azul de água), margem, t. Chaves: rio, correnteza, curso, caminho, fluxo, jornada, margem, água doce */
export function rio(p, { larg = 400, cor = "", margem = "c3", t = 0 } = {}) {
  cor = cor || agua(p);
  const w = larg, tt = p.ritmo(t), terra = circP(0, -w * .27, w * .5, 40, w * .27), N = 24, esq = [], dir = [];
  const eixo = s => [Math.sin(s * 5 + .6) * w * .17 * (.45 + .55 * s), lerp(-w * .56, w * .02, s)], meia = s => w * lerp(.022, .125, s * s);
  for (let i = 0; i <= N; i++) { const s = i / N, [x, y] = eixo(s), m = meia(s); esq.push([x - m, y]); dir.push([x + m, y]); }
  p.forma(terra, margem, { prof: 2 });
  p.recortar(terra, () => {
    p.forma([...esq, ...dir.reverse()], cor, { prof: 0, liso: true });
    for (let j = 0; j < 5; j++) { const s = (tt * .2 + j / 5) % 1, a = eixo(s), b = eixo(Math.min(1, s + .08)), d = (j % 2 ? 1 : -1) * meia(s) * .4; p.linha([[a[0] + d, a[1]], [b[0] + d, b[1]]], maisClaro(p, cor, .65), w * (.014 + .02 * s)); }
  });
  [[-.3, -.32, .05], [.3, -.14, .055], [.27, -.38, .045], [-.37, -.2, .045], [.1, -.06, .04]].forEach(([x, y, r], i) => p.circulo(x * w + Math.sin(tt * 1.8 + i) * w * .006, y * w, r * w * (1 + .06 * Math.sin(tt * 2.5 + i * 2)), escuro(p, margem, .28), { prof: 1, liso: true }));
}
/** Ilha de areia com um coqueiro balançando e as ondas batendo em volta. Opções: larg, cor (areia), mar (padrão: azul de água), t. Chaves: ilha, praia, coqueiro, férias, isolamento, paraíso, descanso, náufrago */
export function ilha(p, { larg = 380, cor = "", mar = "", t = 0 } = {}) {
  cor = cor || areia(p); mar = mar || agua(p);
  const w = larg, tt = p.ritmo(t), bal = Math.sin(tt * 1.5) * w * .018, tronco = escuro(p, cor, .45);
  const onda = (y0, amp, fase, x0, x1) => { const o = [[x0, 0]]; for (let i = 0; i <= 16; i++) o.push([lerp(x0, x1, i / 16), y0 + Math.sin(i * 1.1 + tt * 2.4 + fase) * amp]); o.push([x1, 0]); return o; };
  p.forma(onda(-w * .085, w * .012, 0, -w * .5, w * .5), escuro(p, mar, .18), { prof: 1, liso: true });
  p.forma(arcoP(0, -w * .05, w * .36, 180, 360, 16).map(([x, y]) => [x, -w * .05 + (y + w * .05) * .42]), cor, { prof: 2 });
  const esq = [], dir = [];
  for (let i = 0; i <= 6; i++) { const s = i / 6, x = lerp(-w * .04, w * .07, s * s) + bal * s, y = lerp(-w * .16, -w * .6, s), m = w * lerp(.034, .02, s); esq.push([x - m, y]); dir.push([x + m, y]); }
  p.forma([...esq, ...dir.reverse()], tronco, { prof: 1, liso: true });
  const T = [w * .07 + bal, -w * .6];
  [-3.35, -2.55, -1.6, -.6, .2].forEach((a, i) => p.forma(folhaEm(T[0], T[1], w * .28, w * .09, a + Math.sin(tt * 1.8 + i) * .07), i % 2 ? "c3" : escuro(p, "c3", .18), { prof: 1, liso: true }));
  p.circulo(T[0] - w * .025, T[1] + w * .03, w * .032, tronco, { prof: 0, liso: true }); p.circulo(T[0] + w * .03, T[1] + w * .035, w * .032, tronco, { prof: 0, liso: true });
  p.forma(onda(-w * .05, w * .014, 2, -w * .5, w * .5), mar, { prof: 1, liso: true });
  for (let i = 0; i < 2; i++) { const x = (i ? .22 : -.26) * w + Math.sin(tt * 1.2 + i * 3) * w * .04; p.linha([[x - w * .06, -w * .022], [x + w * .06, -w * .022]], maisClaro(p, mar, .7), w * .016); }
}
/** Onda gigante que se ergue e avança sobre uma casinha, com a crista espumando. Opções: larg, cor (padrão: azul de água), t. Chaves: tsunami, onda gigante, maremoto, enxurrada, avalanche, sobrecarga, ameaça, catástrofe */
export function tsunami(p, { larg = 400, cor = "", t = 0 } = {}) {
  cor = cor || agua(p);
  const w = larg, tt = p.ritmo(t), esp = maisClaro(p, cor, .75), av = Math.sin(tt * 1.6), def = ([x, y]) => [x * w + (-y) * av * w * .07 + av * w * .01, y * w];
  const cima = suavizar([[-.5, -.1], [-.36, -.2], [-.2, -.4], [-.06, -.62], [.1, -.76], [.25, -.75], [.37, -.62], [.42, -.45], [.35, -.53], [.25, -.57], [.15, -.5], [.1, -.36], [.13, -.2], [.24, -.08], [.5, -.05]], 2).map(def);
  p.em({ x: w * .37, y: 0, r: Math.sin(tt * 14) * .02 }, () => { p.retangulo(-w * .06, -w * .09, w * .12, w * .09, "claro", { prof: 1 }); p.forma([[-w * .085, -w * .09], [0, -w * .16], [w * .085, -w * .09]], "c2", { prof: 1 }); });
  p.forma([[-w * .5, 0], ...cima, [w * .5, 0]], cor, { prof: 2, liso: true });
  p.linha(suavizar([[-.3, -.14], [-.12, -.34], [.0, -.54], [.12, -.64]], 2).map(def), escuro(p, cor, .2), w * .022);
  p.linha(suavizar([[-.16, -.08], [-.02, -.26], [.03, -.42]], 2).map(def), escuro(p, cor, .2), w * .022);
  [[.02, -.71], [.12, -.775], [.23, -.775], [.33, -.7], [.395, -.585], [.415, -.47]].forEach((q, i) => { const [x, y] = def(q); p.circulo(x, y, w * (.05 + .014 * Math.sin(tt * 6 + i * 1.8)), esp, { prof: 0, liso: true, semente: i + 1 }); });
  for (let i = 0; i < 3; i++) { const f = (tt * .8 + i / 3) % 1, [x, y] = def([.42, -.46]); p.alfa(1 - f, () => p.circulo(x + f * w * (.06 + i * .03), y + f * f * w * .2 - f * w * .04, w * .024, esp, { prof: 0, liso: true })); }
  const frente = [[-w * .5, 0]]; for (let i = 0; i <= 14; i++) frente.push([lerp(-w * .5, w * .5, i / 14), -w * .04 + Math.sin(i * 1.2 + tt * 3) * w * .012]); frente.push([w * .5, 0]);
  p.forma(frente, escuro(p, cor, .18), { prof: 0, liso: true });
}
/** Iceberg boiando: a ponta pequena acima da água e a massa enorme escondida embaixo. Opções: larg, cor (água; padrão: azul de água), t. Chaves: iceberg, gelo, ponta do iceberg, oculto, risco escondido, profundidade, frio, aparência */
export function iceberg(p, { larg = 340, cor = "", t = 0 } = {}) {
  cor = cor || agua(p);
  const w = larg, tt = p.ritmo(t), m = pts => pts.map(([x, y]) => [x * w, y * w]), y0 = -w * .06, escura = p.estilo === "traco" || p.estilo === "vidro";
  const gelo = escura ? "#FFFFFF" : "claro", gelo2 = maisClaro(p, cor, escura ? .7 : .62), fundo = maisClaro(p, cor, .4);
  p.em({ x: 0, y: y0 + Math.sin(tt * 1.5) * w * .014, r: Math.sin(tt * 1.1) * .025 }, () => {
    const baixo = m([[-.3, 0], [-.38, .14], [-.3, .32], [-.12, .47], [.08, .43], [.26, .32], [.36, .13], [.32, 0]]);
    // no pixel a transparência vira a cor mais próxima da paleta: a massa submersa ganha tons sólidos
    const px = p.estilo === "pixel", sub = () => { p.forma(baixo, px ? mistura(p, fundo, "fundo", .35) : fundo, { prof: 1 }); p.forma(m([[.08, .43], [.26, .32], [.36, .13], [.32, 0], [.1, 0], [.02, .2]]), px ? mistura(p, cor, "fundo", .35) : cor, { prof: 0, liso: true }); };
    px ? sub() : p.alfa(.7, sub);
    p.forma(m([[-.25, 0], [-.18, -.2], [-.06, -.25], [.02, -.42], [.12, -.31], [.18, -.14], [.29, 0]]), gelo, { prof: 2 });
    p.forma(m([[.02, -.42], [.12, -.31], [.18, -.14], [.29, 0], [.07, 0], [0, -.21]]), gelo2, { prof: 0, liso: true });
    brilho4(p, -w * .1, -w * .34, w * .06, (tt * .7) % 1, sobreFundo(p));
  });
  const linhaDagua = []; for (let i = 0; i <= 20; i++) linhaDagua.push([lerp(-w * .5, w * .5, i / 20), y0 + Math.sin(i * 1.3 + tt * 2.6) * w * .014]);
  p.linha(linhaDagua, cor, w * .026);
  for (let i = 0; i < 2; i++) { const f = (tt * .3 + i / 2) % 1; p.alfa(Math.sin(f * Math.PI), () => p.linha(circP((i ? .43 : -.44) * w, y0 + w * (.42 - f * .34), w * .022, 10), cor, w * .014, { fechar: true })); }
}
/** Dunas de areia em ondas suaves com a face de sombra marcada, ondulações do vento, o sol pulsando e a areia voando da crista. Opções: larg, cor (padrão: cor de areia do estilo), t. Chaves: dunas, deserto, areia, seca, calor, vazio, travessia, escassez */
export function dunas(p, { larg = 420, cor = "", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), N = 14, px = p.estilo === "pixel";
  // areia: amarelo no flat e no pixel; bege (destaque quente clareado) no papel e no traco; pêssego no vidro
  const base = cor || (p.estilo === "flat" || px ? "c4" : p.estilo === "papel" ? mistura(p, "c2", "claro", .3) : p.estilo === "vidro" ? "c2" : maisClaro(p, "c2", .35));
  const sol = ({ papel: "c1", flat: "c2", pixel: "c2", traco: "tinta", vidro: "tinta" })[p.estilo] || "c2";
  const risco = px ? 6 : w * .008;
  // perfil de onda: subida longa e suave a barlavento, crista arredondada e face de sombra mais curta e íngreme
  const duna = (cx, a, hh, c, sd) => {
    const x0 = cx - a, xc = cx + a * .3, x1 = cx + a, sombra = escuro(p, c, .2), ond = escuro(p, c, .1), perfil = [], face = [], dentro = [];
    for (let i = 0; i <= N; i++) { const s = i / N; perfil.push([lerp(x0, xc, s), -hh * (1 - Math.cos(s * Math.PI)) / 2]); }
    for (let i = 1; i <= N; i++) { const s = i / N, pt = [lerp(xc, x1, s), -hh * (1 + Math.cos(s * Math.PI)) / 2]; perfil.push(pt); face.push(pt); }
    for (let i = N; i >= 0; i--) { const u = i / N; dentro.push([lerp(xc + (x1 - xc) * .35, xc, u) - Math.sin(u * Math.PI) * a * .1, -hh * Math.sin(u * Math.PI / 2)]); }
    p.forma(perfil, c, { prof: 1, semente: sd, liso: true });
    p.forma([[xc, -hh], ...face, ...dentro.slice(0, -1)], sombra, { prof: 0, liso: true });
    // ondulações do vento na face iluminada, paralelas à encosta
    for (let j = 1; j <= 3; j++) {
      const ln = []; for (let i = 0; i <= 8; i++) { const s = lerp(.25, .85, i / 8), y = -hh * (1 - Math.cos(s * Math.PI)) / 2; ln.push([lerp(x0, xc, s) - a * .02, y + hh * .2 * j + Math.sin(s * 9 + j) * hh * .02]); }
      p.recortar(perfil, () => p.linha(ln, ond, risco));
    }
    // areia soprada da crista
    for (let i = 0; i < 3; i++) { const f = (tt * .5 + i / 3 + sd * .2) % 1; p.alfa(1 - f, () => p.linha([[xc + f * a * .5, -hh - w * .012 - Math.sin(f * 3) * w * .02 - i * w * .012], [xc + f * a * .5 + w * .045, -hh - w * .016 - Math.sin(f * 3 + .3) * w * .02 - i * w * .012]], maisClaro(p, c, .2), px ? 6 : w * .012)); }
  };
  p.circulo(w * .27, -w * .36, w * (.075 + .005 * Math.sin(tt * 4)), sol, { prof: 1, liso: true });
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + tt * .4; p.linha([[w * .27 + Math.cos(a) * w * .1, -w * .36 + Math.sin(a) * w * .1], [w * .27 + Math.cos(a) * w * .13, -w * .36 + Math.sin(a) * w * .13]], sol, w * .014); }
  duna(-w * .16, w * .38, w * .2, maisClaro(p, base, .12), 1);
  duna(w * .25, w * .27, w * .14, base, 2);
  duna(-w * .04, w * .5, w * .08, escuro(p, base, .06), 3);
}
/** Chão que racha ao meio e treme, com a casa e a árvore tombando e ondas de choque dos lados. Opções: larg, cor, terra, k (0..1 abre a rachadura), t. Chaves: terremoto, tremor, abalo, rachadura, crise, instabilidade, ruptura, choque */
export function terremoto(p, { larg = 340, cor = "c3", terra = "c4", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), sh = Math.sin(tt * 38) * w * .012, sv = Math.cos(tt * 31) * w * .008, g = w * (.012 + .035 * kk), yT = -w * .3;
  const racha = [[.02, -.3], [-.05, -.21], [.05, -.14], [-.03, -.07], [.03, 0]].map(([x, y]) => [x * w, y * w]);
  for (const lado of [-1, 1]) for (let i = 0; i < 2; i++) { const f = (tt * 1.2 + i / 2) % 1, c = lado * w * .52; p.alfa(1 - f, () => p.linha(arcoP(c, -w * .16, w * (.05 + f * .13), lado > 0 ? -38 : 142, lado > 0 ? 38 : 218, 8), sobreFundo(p), w * .025)); }
  p.em({ x: -sh, y: sv + kk * w * .015 }, () => {
    p.em({ x: -w * .28, y: yT, r: -.12 * kk + Math.sin(tt * 17) * .025 }, () => { p.retangulo(-w * .08, -w * .17, w * .16, w * .18, "claro", { prof: 1 }); p.forma([[-w * .115, -w * .17], [0, -w * .28], [w * .115, -w * .17]], "c1", { prof: 1 }); p.retangulo(-w * .025, -w * .09, w * .05, w * .09, "tinta", { prof: 0, liso: true }); });
    p.forma([[-w * .5, 0], [-w * .5, yT], ...mover(racha, -g, 0)], terra, { prof: 2 });
    p.forma([[-w * .5, yT], [w * .02 - g, yT], [-w * .019 - g, yT + w * .05], [-w * .5, yT + w * .05]], cor, { prof: 0, liso: true });
  });
  p.em({ x: sh, y: -sv - kk * w * .015 }, () => {
    p.em({ x: w * .28, y: yT + w * .01, r: .14 * kk + Math.sin(tt * 15 + 1) * .03 }, () => pinheiro(p, 0, w * .27, escuro(p, cor, .2), escuro(p, "c2", .45), 0, 40));
    p.forma([[w * .5, yT], [w * .5, 0], ...mover(racha.slice().reverse(), g, 0)], terra, { prof: 2 });
    p.forma([[w * .02 + g, yT], [w * .5, yT], [w * .5, yT + w * .05], [-w * .019 + g, yT + w * .05]], cor, { prof: 0, liso: true });
  });
  if (kk > .1) for (const s of semear(4, 8)) { const f = (tt * 1.1 + s.u) % 1; p.retangulo((s.v - .5) * w * .3 * f - w * .02, yT - Math.sin(f * Math.PI) * w * (.1 + .12 * s.w) - w * .02, w * .04, w * .04, terra, { prof: 0, liso: true, rot: f * 5 + s.q * 3 }); }
}

/* ---------------------------------------------------------------- céu e clima */
/** Arco-íris que se traça de uma nuvem à outra, com as nuvens flutuando e brilhos piscando. Opções: larg, k (0..1 traça o arco), t. Chaves: arco-íris, esperança, diversidade, depois da chuva, cores, alegria, promessa, orgulho */
export function arcoIris(p, { larg = 400, k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), a1 = 180 + 180 * kk, esp = w * .058, R = w * .44;
  if (kk > .02) ["c1", "c2", "c3", "c4"].forEach((c, i) => { const ro = R - i * esp, ri = ro - esp * 1.02; p.forma([...arcoP(0, 0, ro, 180, a1, 28), ...arcoP(0, 0, ri, a1, 180, 28)], c, { prof: i ? 0 : 1, liso: true }); });
  const nuv = (x, s, fase) => p.em({ x, y: w * .02 + Math.sin(tt * 2 + fase) * w * .012, s }, () => p.forma(nuvemP(w * .34), "claro", { prof: 2, liso: true }));
  nuv(-R + esp * 2, 1, 0); nuv(R - esp * 2, clamp((kk - .88) / .12), 2);
  for (let i = 0; i < 3; i++) { const f = (tt * .6 + i / 3) % 1, a = (200 + i * 62) * Math.PI / 180; if (kk > (i + 1) / 4) brilho4(p, Math.cos(a) * w * .53, Math.sin(a) * w * .53, w * .045, f, sobreFundo(p)); }
}
/** Nuvem carregada que treme, com chuva caindo inclinada e relâmpagos piscando. Opções: larg, cor (chuva; padrão: azul de água), t. Chaves: tempestade, temporal, relâmpago, trovão, chuva forte, crise, turbulência, tempo fechado */
export function tempestade(p, { larg = 340, cor = "", t = 0 } = {}) {
  cor = cor || agua(p); const raio = p.estilo === "flat" || p.estilo === "pixel" ? "c4" : "c2";
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1, clarao = f < .2 || (f > .28 && f < .4), base = -w * .08;
  // clarão: halo atrás da nuvem (no pixel a transparência não existe, fica só o raio mais claro)
  if (clarao && p.estilo !== "pixel") p.alfa(.28, () => p.circulo(0, base - w * .1, w * .5, maisClaro(p, raio, .4), { prof: 0, liso: true }));
  // chuva de vento forte: bem inclinada e arrastada para a esquerda
  for (const s of semear(11, 5)) { const g = (s.v + tt * (1.1 + s.w * .5)) % 1, y = lerp(base, w * .42, g), x = (s.u - .45) * w * .7 - g * w * .2; p.linha([[x, y], [x - w * .06, y + w * .075]], cor, w * .032); }
  // raio em zigue-zague sempre presente; no clarão fica mais claro, cresce e ganha um galho
  const zig = [[w * .02, base], [-w * .1, w * .14], [-w * .02, w * .14], [-w * .12, w * .42], [w * .12, w * .06], [w * .03, w * .06], [w * .12, base]];
  p.em({ x: 0, y: base, s: clarao ? 1.06 : 1 }, () => p.forma(mover(zig, 0, -base), clarao && p.estilo !== "pixel" ? maisClaro(p, raio, .35) : raio, { prof: 1, liso: true }));
  if (clarao) p.forma([[w * .2, base], [w * .15, w * .1], [w * .19, w * .1], [w * .14, w * .24], [w * .25, w * .06], [w * .21, w * .06], [w * .26, base]], raio, { prof: 0, liso: true });
  p.em({ x: Math.sin(tt * 1.3) * w * .015 + (clarao ? Math.sin(tt * 40) * w * .006 : 0), y: base + Math.sin(tt * 2) * w * .008 }, () => {
    p.forma(nuvemP(w), clarao ? maisClaro(p, cinza(p, .3), .3) : cinza(p, .3), { prof: 2, liso: true });
    p.linha(arcoP(-.07 * w, -.24 * w, .12 * w, 215, 300, 6), cinza(p, .5), w * .02); p.linha(arcoP(.17 * w, -.2 * w, .09 * w, 250, 330, 5), cinza(p, .5), w * .02);
  });
}
/** Tornado em funil que gira e serpenteia, levantando poeira e destroços. Opções: larg, alt, cor, t. Chaves: tornado, furacão, redemoinho, ciclone, caos, destruição, confusão, turbilhão */
export function tornado(p, { larg = 300, alt = 380, cor = "c4", t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), n = 8, nivel = i => { const s = i / (n - 1); return { x: Math.sin(tt * 3 + i * .75) * w * .07 * (s + .15), y: -h * (.93 - s * .83), rx: w * lerp(.48, .06, Math.pow(s, .75)), ry: h * lerp(.07, .035, s) }; };
  const pe = nivel(n - 1);
  for (let i = 0; i < 3; i++) p.circulo(pe.x + (i - 1) * w * .12, -h * .035, w * (.07 + .02 * Math.sin(tt * 6 + i * 2)), escuro(p, cor, .3), { prof: 0, semente: i + 1 });
  for (let i = n - 1; i >= 0; i--) {
    const v = nivel(i), a = (tt * 220 + i * 55) % 360;
    p.elipse(v.x, v.y, v.rx, v.ry, i % 2 ? escuro(p, cor, .18) : cor, { prof: i ? 0 : 2, liso: true, semente: i + 1 });
    if (a < 150 && v.rx > w * .12) p.linha(arcoP(0, 0, 1, a + 10, a + 55, 5).map(([x, y]) => [v.x + x * v.rx * .8, v.y + y * v.ry * .8]), maisClaro(p, cor, .6), w * .02);
  }
  for (let j = 0; j < 4; j++) { const v = nivel(1 + j * 2), a = tt * 4 + j * 1.7, x = v.x + Math.cos(a) * v.rx * 1.3, y = v.y + Math.sin(a) * v.ry * 1.6; p.retangulo(x - w * .025, y - w * .025, w * .05, w * .05, "c2", { prof: 0, liso: true, rot: a * 2 }); }
}
/** Floco de neve de seis braços que gira devagar e pulsa. Opções: larg, cor, t. Chaves: neve, floco, frio, inverno, gelo, congelar, natal, único */
export function flocoDeNeve(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), e = larg * .05, q = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
  p.em({ x: 0, y: 0, r: tt * .3, s: 1 + .05 * Math.sin(tt * 3) }, () => {
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU, ponta = q(a, R * .94);
      p.linha([[0, 0], ponta], cor, e);
      for (const [d, L] of [[.42, .27], [.68, .2]]) { const b = q(a, R * d); p.linha([[b[0] + Math.cos(a + 1.05) * R * L, b[1] + Math.sin(a + 1.05) * R * L], b, [b[0] + Math.cos(a - 1.05) * R * L, b[1] + Math.sin(a - 1.05) * R * L]], cor, e * .8); }
      p.circulo(ponta[0], ponta[1], e * .95, cor, { prof: 0, liso: true });
    }
    p.forma(Array.from({ length: 6 }, (_, i) => q(i / 6 * TAU + TAU / 12, R * .2)), cor, { prof: 1, liso: true });
  });
}
/** Rajadas de vento que correm e se enrolam na ponta, levando folhas. Opções: larg, cor (padrão: a do traço sobre o fundo), t. Chaves: vento, ventania, rajada, brisa, mudança, sopro, ar, levar embora */
export function ventania(p, { larg = 400, cor = "", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || sobreFundo(p);
  [[-.2, .2, .075, 0], [.02, .3, .095, 1.3], [.23, .08, .065, 2.6]].forEach(([y0, xf, rc, fase], i) => {
    const pts = []; for (let j = 0; j <= 10; j++) { const x = lerp(-w * .5, xf * w, j / 10); pts.push([x, y0 * w + Math.sin(j * .7 + tt * 3 + fase) * w * .012 * (1 - j / 10)]); }
    pts.push(...arcoP(xf * w, (y0 - rc) * w, rc * w, 90, -150, 14));
    p.linha(pts, c, w * .034, { tracejado: [w * .62, w * .22], desloc: tt * w * .7 + i * w * .3 });
  });
  for (const s of semear(4, 14)) { const f = (tt * .4 + s.u) % 1, L = w * .12; p.alfa(Math.min(1, Math.sin(f * Math.PI) * 3), () => p.em({ x: lerp(-w * .46, w * .46, f), y: (s.v - .5) * w * .34 - w * .09 + Math.sin(f * TAU * 1.5 + s.q * 6) * w * .06, r: tt * 4 * (s.i % 2 ? 1 : -1) + s.q * 6 }, () => p.forma(mover(folhaP(L, L * .56), -L / 2, 0), s.i % 2 ? "c3" : "c2", { prof: 1, liso: true }))); }
}
/** Lua com crateras cuja fase muda de nova a cheia e volta, com estrelas piscando. Opções: larg, cor (padrão: a cor de lua do estilo), k (0 crescente fina, .5 cheia, 1 minguante fina; sem k o ciclo anda sozinho e passa rápido pela lua nova), t. Chaves: lua, fases da lua, noite, ciclo, mês, calendário, tempo passando, crescente, minguante */
export function luaFases(p, { larg = 260, cor = "", k = null, t = 0 } = {}) {
  cor = cor || corLua(p);
  const R = larg / 2, tt = p.ritmo(t), u = (tt * .14 + .3) % 1, f = .12 + .76 * (k == null ? u + .9 * Math.sin(u * TAU) / TAU : clamp(k)), c = Math.cos(f * TAU), lado = f < .5 ? 1 : -1, N = 24, luz = [];
  const escura = p.estilo === "traco" || p.estilo === "vidro", apagada = escura ? escuro(p, cor, .68) : p.estilo === "pixel" ? mistura(p, cor, "sombra", .62) : mistura(p, cor, cinza(p, .6), .7);
  for (let i = 0; i <= N; i++) { const th = -Math.PI / 2 + i / N * Math.PI; luz.push([lado * Math.cos(th) * R, Math.sin(th) * R]); }
  for (let i = N - 1; i >= 1; i--) { const th = -Math.PI / 2 + i / N * Math.PI; luz.push([lado * c * Math.cos(th) * R, Math.sin(th) * R]); }
  for (let i = 0; i < 3; i++) { const a = [3.6, 5.5, 2.3][i]; brilho4(p, Math.cos(a) * R * 1.3, Math.sin(a) * R * 1.3, R * .16, (tt * .6 + i / 3) % 1, sobreFundo(p)); }
  p.em({ x: 0, y: Math.sin(tt * 1.6) * R * .04, r: Math.sin(tt * .9) * .05 }, () => {
    const crateras = [[-.38, -.3, .2], [.3, .12, .25], [-.14, .46, .15], [.4, -.46, .13], [-.55, .2, .1]];
    p.circulo(0, 0, R, apagada, { prof: 2, liso: true });
    crateras.forEach(([x, y, r]) => p.circulo(x * R, y * R, r * R, escuro(p, apagada, .12), { prof: 0, liso: true }));
    if (c < .985) { p.forma(luz, cor, { prof: 0, liso: true }); p.recortar(luz, () => crateras.forEach(([x, y, r]) => p.circulo(x * R, y * R, r * R, escuro(p, cor, .2), { prof: 0, liso: true }))); }
  });
}
/** Gota d'água que balança e estica, soltando ondas e respingos embaixo. Opções: larg, cor (padrão: azul de água), t. Chaves: gota, água, pingo, lágrima, chuva, economia de água, umidade, sede, pouco a pouco */
export function gota(p, { larg = 200, cor = "", t = 0 } = {}) {
  cor = cor || agua(p);
  const w = larg, tt = p.ritmo(t), R = w * .4, est = Math.sin(tt * 4) * .06, yb = w * .52;
  for (let i = 0; i < 2; i++) { const f = (tt * .7 + i / 2) % 1; p.alfa(1 - f, () => p.linha(circP(0, yb, w * (.14 + f * .36), 24, w * (.035 + f * .07)), cor, w * .035, { fechar: true })); }
  for (const lado of [-1, 1]) { const f = (tt * .9 + (lado > 0 ? .5 : 0)) % 1; p.circulo(lado * w * (.3 + f * .12), yb - Math.sin(f * Math.PI) * w * .24, w * .065 * (1 - f * .4), cor, { prof: 0, liso: true }); }
  p.em({ x: 0, y: w * .06 + Math.sin(tt * 2) * w * .03, sx: 1 - est, sy: 1 + est }, () => {
    p.forma([...arcoP(0, 0, R, -50, 230, 26), [-R * .3, -R * 1.25], [0, -R * 1.85], [R * .3, -R * 1.25]], cor, { prof: 2, liso: true });
    p.linha(arcoP(0, 0, R * .64, 115, 190, 8), maisClaro(p, cor, .7), R * .16);
  });
}
