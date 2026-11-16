// Categoria: História e militar
// Kit de movimento — peças de história, forças armadas e monumentos antigos, em tom de documentário: nada de sangue
// nem violência gráfica (o disparo vira só recuo e fumaça). O que fica no chão tem a base em y = 0 e sobe; o que
// flutua fica centrado na origem. A convenção das peças está em ./_comum.js.
import { clamp, lerp, rng, E, circP, retP, retArredP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU, ciclo, vaiVem } from "./_comum.js";
import { personagem, TIPOS } from "./base.js";
import { CICLOS } from "../movimento.js";

const L = { prof: 0, liso: true };
/** Tom de pedra, mármore e fumaça que aparece em qualquer estilo ("claro" puro some no fundo do flat e do papel). */
const pedra = (p, k = .18) => p.estilo === "flat" || p.estilo === "papel" ? escuro(p, "claro", k) : "claro";
/** Fase 0..per que recomeça sozinha (para disparos e pancadas periódicas). */
const fase = (tt, per) => ((tt % per) + per) % per;
/** Baforada de fumaça com idade f (0 nasce, 1 some), subindo e crescendo. */
function baforada(p, x, y, r, f) {
  if (f <= 0 || f >= 1) return;
  const rr = r * (.45 + f * .9), dy = -f * r * 1.4;
  p.alfa(1 - f * f, () => { for (const [dx, dy2, s] of [[0, 0, 1], [-.6, .25, .72], [.6, .2, .78]]) p.circulo(x + dx * rr, y + dy + dy2 * rr, rr * s, pedra(p, .22), L); });
}
/** Linha de ondas que corre, para barcos (base em y = 0). */
function ondas(p, w, tt, cor = "c3") {
  const pts = []; for (let i = 0; i <= 24; i++) pts.push([-w / 2 + w * i / 24, Math.sin(i * 1.3 + tt * 3) * w * .012]);
  p.linha(pts, cor, w * .024);
}
/** Bandeirola tremulando presa no topo de um mastro em (x, y); dir = 1 aponta para a direita, -1 para a esquerda. */
function flamula(p, x, y, tam, cor, tt, dir = 1, fs = 0) {
  const cima = [], n = 6; for (let i = 0; i <= n; i++) { const u = i / n; cima.push([x + dir * u * tam, y + Math.sin(tt * 6 - u * 3 + fs) * tam * .14 * u]); }
  const baixo = cima.map(([px, py], i) => [px, py + tam * .55 * (1 - i / n * .45)]).reverse();
  p.forma([...cima, ...baixo], cor, L);
}
/** Pássaros em V batendo asas. */
function passaros(p, lista, w, tt, cor) {
  lista.forEach(([x, y], i) => { const b = Math.sin(tt * 9 + i * 2.1) * w * .016; p.linha([[x - w * .035, y - b], [x, y + w * .01], [x + w * .035, y - b]], cor, w * .012); });
}
/** Contorno de muralha com ameias, da base (y = base) até o topo, com n dentes. */
function ameias(x0, x1, base, topo, h, n) {
  const u = (x1 - x0) / (2 * n - 1), pts = [[x0, base]];
  for (let i = 0; i < n; i++) { const a = x0 + 2 * i * u, b = a + u; pts.push([a, topo - h], [b, topo - h], [b, topo]); if (i < n - 1) pts.push([b + u, topo]); }
  pts.push([x1, base]); return pts;
}
/** Curva de Bézier quadrática amostrada em n + 1 pontos. */
const bezier = (a, c, b, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; });
/** Brilho de quatro pontas que nasce e some (f de 0 a 1). */
function cintilar(p, x, y, r, f, cor) { if (f <= 0 || f >= 1) return; p.em({ x, y, s: Math.sin(f * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, r, r * .28, 4), cor, L)); }

/** Tanque de guerra com as esteiras rodando, a torre mirando e o canhão recuando com fumaça. Opções: larg, cor, t. Chaves: tanque, blindado, exército, guerra, avanço, força, defesa, poder militar */
export function tanque(p, { larg = 360, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = fase(tt, 2.8), rec = w * .08 * Math.exp(-f * 6), bal = Math.sin(tt * 12) * w * .004, mira = Math.sin(tt * .9) * .05, esc = escuro(p, cor, .3);
  baforada(p, -w * .5, -w * .3, w * .04, (tt * 1.1) % 1);
  p.forma(retArredP(-w * .47, -w * .2, w * .94, w * .2, w * .1), "tinta", { prof: 2 });
  p.linha(retArredP(-w * .452, -w * .186, w * .904, w * .172, w * .086), "c4", w * .024, { tracejado: [w * .024, w * .026], desloc: tt * w * .3, fechar: true });
  for (let i = 0; i < 5; i++) {
    const x = -w * .34 + i * w * .17, y = -w * .1, r = i % 4 ? w * .064 : w * .052, a = tt * 7 + i;
    p.circulo(x, y, r, esc, { prof: 0 }); p.circulo(x, y, r * .4, "c4", L);
    p.linha([[x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x - Math.cos(a) * r * .8, y - Math.sin(a) * r * .8]], "c4", w * .016);
  }
  const mx = -w * .03 + Math.cos(mira) * (w * .6 - rec), my = -w * .36 + Math.sin(mira) * (w * .6 - rec) + bal;
  p.em({ x: 0, y: bal }, () => {
    p.forma([[-w * .48, -w * .19], [w * .48, -w * .19], [w * .5, -w * .25], [w * .4, -w * .31], [-w * .42, -w * .31], [-w * .5, -w * .25]], cor, { prof: 2 });
    p.linha([[-w * .46, -w * .23], [w * .47, -w * .23]], esc, w * .016);
    p.em({ x: -w * .03, y: -w * .36, r: mira }, () => {
      p.capsula([w * .05 - rec, 0], [w * .56 - rec, 0], w * .05, esc);
      p.retangulo(w * .53 - rec, -w * .034, w * .075, w * .068, esc, { ...L, raio: w * .012 });
      p.forma([[-w * .22, w * .05], [w * .17, w * .05], [w * .21, 0], [w * .12, -w * .085], [-w * .16, -w * .1], [-w * .25, -w * .03]], maisClaro(p, cor, .14), { prof: 1 });
      p.elipse(-w * .04, -w * .095, w * .075, w * .026, esc, L);
      p.linha([[-w * .16, -w * .1], [-w * .16 - Math.sin(tt * 3) * w * .03, -w * .3]], esc, w * .012);
    });
  });
  baforada(p, mx + w * .05, my, w * .075, f / 1.3); baforada(p, mx + w * .12, my - w * .02, w * .055, (f - .2) / 1.3);
}

/** Caça a jato visto de cima, inclinando nas curvas, com a chama do motor e o rastro branco ficando para trás. Opções: larg, cor, t. Chaves: caça, avião de guerra, jato, força aérea, velocidade, supersônico, rapidez, ataque aéreo */
export function cacaMilitar(p, { larg = 380, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .25), fum = pedra(p, .2);
  p.em({ x: w * .06, y: Math.sin(tt * 1.6) * w * .03, r: Math.sin(tt * 1.1) * .06, sy: .8 + .2 * Math.cos(tt * 1.3) }, () => {
    for (const s of [-1, 1]) p.alfa(.8, () => p.linha([[-w * .15, s * w * .25], [-w * .36, s * w * .25 + Math.sin(tt * 2) * w * .01], [-w * .56, s * w * .25 + Math.sin(tt * 2 - 1) * w * .03]], fum, w * .024, { tracejado: [w * .07, w * .035], desloc: tt * w * .5 }));
    for (let i = 0; i < 4; i++) { const f = (tt * 1.6 + i / 4) % 1; p.alfa(1 - f, () => p.circulo(-w * .34 - f * w * .22, Math.sin(tt * 3 + i) * w * .012, w * (.026 + f * .03), fum, L)); }
    const fl = w * (.07 + .03 * Math.sin(tt * 31));
    p.forma([[-w * .27, -w * .03], [-w * .27 - fl, 0], [-w * .27, w * .03]], "c2", L);
    for (const s of [-1, 1]) {
      p.forma([[w * .1, s * w * .04], [-w * .1, s * w * .25], [-w * .17, s * w * .25], [-w * .15, s * w * .04]], cor, { prof: 2 });
      p.forma([[-w * .13, s * w * .035], [-w * .24, s * w * .13], [-w * .285, s * w * .13], [-w * .26, s * w * .035]], esc, { prof: 1 });
    }
    p.forma([[w * .38, 0], [w * .26, -w * .034], [w * .08, -w * .05], [-w * .22, -w * .05], [-w * .28, -w * .032], [-w * .28, w * .032], [-w * .22, w * .05], [w * .08, w * .05], [w * .26, w * .034]], cor, { prof: 2 });
    p.elipse(w * .19, 0, w * .08, w * .025, "tinta", L);
    for (const s of [-1, 1]) p.forma(estrelaP(-w * .09, s * w * .15, w * .035, w * .014, 5), "claro", L);
  });
}

/** Navio de guerra balançando no mar, com o radar girando, fumaça na chaminé e a bandeira tremulando. Opções: larg, cor, t. Chaves: navio de guerra, marinha, frota, encouraçado, mar, guerra naval, esquadra, defesa */
export function navioDeGuerra(p, { larg = 420, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .3), cla = maisClaro(p, cor, .3);
  p.em({ x: 0, y: Math.sin(tt * 1.5) * w * .01, r: Math.sin(tt * 1.1) * .018 }, () => {
    for (let i = 0; i < 3; i++) { const f = (tt * .5 + i / 3) % 1; baforada(p, -w * .16 - f * w * .12, -w * .37, w * .05, f); }
    p.linha([[w * .03, -w * .28], [w * .03, -w * .47]], esc, w * .014);
    p.linha([[-w * .04, -w * .41], [w * .1, -w * .41]], esc, w * .012);
    p.em({ x: w * .03, y: -w * .48, sx: .15 + .85 * Math.abs(Math.cos(tt * 2.4)) }, () => p.retangulo(-w * .055, -w * .014, w * .11, w * .028, esc, L));
    p.linha([[-w * .46, -w * .13], [-w * .46, -w * .28]], esc, w * .012);
    flamula(p, -w * .46, -w * .28, w * .09, "c2", tt, -1);
    for (const [x, d] of [[w * .25, 1], [-w * .33, -1]]) {
      p.capsula([x, -w * .165], [x + d * w * .18, -w * .185], w * .026, esc);
      p.forma([[x - w * .075, -w * .13], [x + w * .075, -w * .13], [x + w * .055, -w * .195], [x - w * .055, -w * .195]], esc, { prof: 1 });
    }
    p.forma(retP(-w * .25, -w * .215, w * .4, w * .095), cla, { prof: 1 });
    p.forma([[-w * .21, -w * .2], [-w * .11, -w * .2], [-w * .12, -w * .36], [-w * .2, -w * .36]], esc, { prof: 1 });
    p.forma(retP(-w * .06, -w * .3, w * .18, w * .095), cla, { prof: 1 });
    p.linha([[-w * .04, -w * .262], [w * .1, -w * .262]], "tinta", w * .024, { tracejado: [w * .022, w * .014] });
    p.forma([[-w * .5, -w * .135], [w * .4, -w * .135], [w * .52, -w * .185], [w * .42, 0], [-w * .45, 0]], cor, { prof: 2 });
    p.forma([[-w * .46, -w * .035], [w * .43, -w * .035], [w * .42, 0], [-w * .45, 0]], esc, L);
    p.linha([[-w * .36, -w * .085], [w * .32, -w * .085]], "tinta", w * .018, { tracejado: [w * .018, w * .05] });
  });
  ondas(p, w * 1.1, tt);
}

/** Míssil voando em diagonal, com a chama tremendo e o rastro de fumaça. Opções: larg, cor, t. Chaves: míssil, foguete, lançamento, ameaça, arma, tensão, alcance, guerra fria */
export function missil(p, { larg = 360, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), det = "c1";
  p.em({ x: w * .04, y: 0, r: -.5 + Math.sin(tt * 1.7) * .05 }, () => {
    for (let i = 0; i < 5; i++) { const f = (tt * 1.5 + i / 5) % 1; p.alfa(1 - f, () => p.circulo(-w * .38 - f * w * .3, Math.sin(i * 2 + tt) * w * .02 * f, w * (.04 + f * .06), pedra(p, .2), L)); }
    const fl = w * (.1 + .04 * Math.sin(tt * 29));
    p.forma([[-w * .3, -w * .04], [-w * .3 - fl, 0], [-w * .3, w * .04]], "c2", L);
    p.forma([[-w * .3, -w * .022], [-w * .3 - fl * .55, 0], [-w * .3, w * .022]], "c4", L);
    for (const s of [-1, 1]) {
      p.forma([[-w * .29, s * w * .05], [-w * .16, s * w * .05], [-w * .3, s * w * .15], [-w * .35, s * w * .15]], det, { prof: 1 });
      p.forma([[w * .02, s * w * .05], [w * .11, s * w * .05], [w * .03, s * w * .1]], det, { prof: 0 });
    }
    const nariz = [[w * .2, -w * .055], [w * .27, -w * .05], [w * .32, -w * .034], [w * .37, 0], [w * .32, w * .034], [w * .27, w * .05], [w * .2, w * .055]];
    p.forma([[-w * .3, -w * .055], ...nariz, [-w * .3, w * .055]], cor, { prof: 2 });
    p.forma(nariz.slice(1, 6), det, L);
    p.retangulo(-w * .09, -w * .055, w * .045, w * .11, det, L);
  });
}

/** Canhão antigo de rodas que dispara de tempos em tempos: recua, a roda gira e sai fumaça. Opções: larg, cor, t. Chaves: canhão, artilharia, batalha, disparo, pólvora, guerra antiga, forte, impacto */
export function canhao(p, { larg = 380, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = fase(tt, 3), rec = w * .06 * Math.exp(-f * 2.5), madeira = "c2", esc = escuro(p, cor, .3), R = w * .19, cx = -rec, cy = -R, ang = -.34;
  for (const [x, y] of [[w * .3, -w * .045], [w * .4, -w * .045], [w * .35, -w * .125]]) p.circulo(x, y, w * .045, esc, { prof: 1 });
  p.forma([[cx - w * .04, -w * .4], [cx + w * .1, -w * .35], [cx + w * .08, -w * .27], [cx - w * .44, -w * .02], [cx - w * .46, 0], [cx - w * .5, -w * .045]], escuro(p, madeira, .2), { prof: 1 });
  p.forma(circP(cx, cy, R), madeira, { prof: 2, furos: [circP(cx, cy, R * .74).reverse()] });
  const giro = -rec / R;
  for (let i = 0; i < 4; i++) { const a = giro + i * Math.PI / 4; p.capsula([cx + Math.cos(a) * R * .78, cy + Math.sin(a) * R * .78], [cx - Math.cos(a) * R * .78, cy - Math.sin(a) * R * .78], w * .026, madeira); }
  p.circulo(cx, cy, R * .2, esc, L);
  p.em({ x: cx + w * .02, y: -w * .38, r: ang }, () => {
    p.circulo(-w * .21, 0, w * .045, cor, { prof: 0 });
    p.forma([[-w * .19, -w * .065], [w * .34, -w * .045], [w * .34, w * .045], [-w * .19, w * .065]], cor, { prof: 2 });
    p.retangulo(w * .3, -w * .056, w * .055, w * .112, esc, { ...L, raio: w * .012 });
    p.retangulo(-w * .09, -w * .062, w * .035, w * .124, esc, L);
  });
  const m = [cx + w * .02 + Math.cos(ang) * w * .39, -w * .38 + Math.sin(ang) * w * .39];
  if (f < .15) p.forma(estrelaP(m[0] + w * .05, m[1] - w * .02, w * .075, w * .03, 6), "c2", L);
  baforada(p, m[0] + w * .08, m[1] - w * .02, w * .085, f / 1.7); baforada(p, m[0] + w * .15, m[1] - w * .06, w * .065, (f - .2) / 1.7);
}

/** Espada erguida que balança, com um brilho correndo pela lâmina. Opções: alt, cor, t. Chaves: espada, cavaleiro, batalha, honra, coragem, medieval, duelo, conquista */
export function espada(p, { alt = 380, cor = "c2", t = 0 } = {}) {
  const a = alt, tt = p.ritmo(t), lam = [[0, -a * .5], [a * .042, -a * .42], [a * .042, a * .2], [-a * .042, a * .2], [-a * .042, -a * .42]];
  p.em({ x: 0, y: Math.sin(tt * 1.8) * a * .015, r: Math.sin(tt * 1.3) * .1 }, () => {
    p.forma(lam, "claro", { prof: 2 });
    p.linha(lam, sobreFundo(p), a * .008, { fechar: true });
    p.linha([[0, -a * .38], [0, a * .17]], pedra(p, .3), a * .014);
    p.capsula([-a * .16, a * .205], [a * .16, a * .205], a * .05, cor, { prof: 1 });
    for (const s of [-1, 1]) p.circulo(s * a * .17, a * .205, a * .034, cor, L);
    p.forma(retArredP(-a * .028, a * .228, a * .056, a * .18, a * .012), "c1", { prof: 0 });
    for (let i = 0; i < 4; i++) p.linha([[-a * .028, a * (.245 + i * .04)], [a * .028, a * (.265 + i * .04)]], "tinta", a * .008);
    p.circulo(0, a * .445, a * .045, cor, { prof: 1 });
    const g = (tt * .6) % 1; cintilar(p, 0, lerp(a * .16, -a * .44, g), a * .075, g, "c4");
  });
}

/** Contorno de escudo de cavaleiro (topo reto e ponta embaixo), em escala k. */
function escudoP(w, k = 1) {
  const W = w * .42 * k, y0 = -w * .44 * k, y1 = -w * .04 * k, yb = w * .5 * k, cy = w * .34 * k, o = [[-W, y0], [0, y0 + w * .05 * k], [W, y0]];
  o.push(...bezier([W, y1], [W, cy], [0, yb], 8), ...bezier([0, yb], [-W, cy], [-W, y1], 8).slice(1));
  return o;
}
/** Escudo medieval de brasão esquartelado, com borda de metal, balançando e com um brilho passando. Opções: larg, cor, cor2, t. Chaves: escudo medieval, brasão, cavaleiro, proteção, defesa, nobreza, segurança, guarda */
export function escudoMedieval(p, { larg = 280, cor = "c1", cor2 = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fora = escudoP(w), dentro = escudoP(w, .84).map(([x, y]) => [x, y + w * .01]);
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .02, r: Math.sin(tt * 1.2) * .08 }, () => {
    p.forma(fora, "c2", { prof: 2 });
    p.forma(dentro, cor2, { prof: 0 });
    p.recortar(dentro, () => {
      p.forma(retP(-w * .5, -w * .5, w * .5, w * .48), cor, L);
      p.forma(retP(0, -w * .02, w * .5, w * .6), cor, L);
      if (p.estilo !== "traco") { const x = lerp(-w * .9, w * .9, (tt * .35) % 1); p.alfa(.3, () => p.forma([[x - w * .1, -w * .6], [x + w * .02, -w * .6], [x - w * .2, w * .6], [x - w * .32, w * .6]], "claro", L)); }
    });
    p.linha(dentro, escuro(p, "c2", .3), w * .014, { fechar: true });
    p.circulo(0, -w * .02, w * .085, "c2", { prof: 1 });
    p.forma(estrelaP(0, -w * .02, w * .06, w * .025, 5, -Math.PI / 2 + tt * .8), escuro(p, "c2", .35), L);
  });
}

/** Arco que se estica, solta a flecha e recarrega em ciclo. Opções: larg, cor, t. Chaves: arco e flecha, arqueiro, mira, alvo, objetivo, precisão, lançar, foco */
export function arcoEFlecha(p, { larg = 300, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = fase(tt, 2.6), puxa = f < 1.5 ? E.entraSai(clamp((f - .2) / 1.1)) : f < 1.58 ? 1 - (f - 1.5) / .08 : 0;
  const xm = w * .1, bojo = w * (.2 + .08 * puxa), h = w * .46 * (1 - .06 * puxa), ponta = xm - bojo, nock = ponta - w * .26 * puxa;
  const arco = Array.from({ length: 13 }, (_, i) => { const v = i / 6 - 1; return [xm - bojo * v * v, v * h]; });
  const flecha = (x0, al) => {
    p.alfa(al, () => {
      p.linha([[x0, 0], [x0 + w * .6, 0]], sobreFundo(p), w * .018);
      p.forma([[x0 + w * .67, 0], [x0 + w * .58, -w * .042], [x0 + w * .6, 0], [x0 + w * .58, w * .042]], "c4", L);
      for (const s of [-1, 1]) p.forma([[x0 + w * .02, 0], [x0 + w * .1, 0], [x0 + w * .05, s * w * .045], [x0 - w * .01, s * w * .045]], "c1", L);
    });
  };
  p.em({ x: -w * .08, y: 0 }, () => {
    p.linha([arco[0], [nock, 0], arco[12]], sobreFundo(p), w * .01);
    p.linha(arco, cor, w * .045);
    p.forma(retArredP(xm - w * .035, -w * .07, w * .05, w * .14, w * .015), "c1", { prof: 1 });
    if (f < 1.5) flecha(nock, 1);
    else if (f < 2.15) { const v = (f - 1.5) / .65; flecha(ponta + E.sai(v) * w * .32, 1 - v); }
    if (f > 2.15) flecha(ponta, clamp((f - 2.15) / .3));
  });
}

/** Capacete militar com a jugular balançando e um brilho correndo pelo casco. Opções: larg, cor, t. Chaves: capacete, soldado, exército, proteção, guerra, segurança, combate, recruta */
export function capaceteMilitar(p, { larg = 300, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .25);
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .015 - w * .02, r: Math.sin(tt * 2.2) * .05 }, () => {
    for (const s of [-1, 1]) {
      const sw = Math.sin(tt * 2.6 - .6 + s * .8) * w * .05, a = [s * w * .3, w * .05], b = [s * w * .22 + sw, w * .34];
      p.linha(bezier(a, [s * w * .3, w * .22], b, 8), "c2", w * .032);
      p.retangulo(b[0] - w * .03, b[1] - w * .02, w * .06, w * .05, "c4", { ...L, raio: w * .01 });
    }
    const domo = arcoP(0, w * .04, w * .36, 180, 360, 24).map(([x, y]) => [x, w * .04 + (y - w * .04) * 1.04]);
    p.forma(domo, cor, { prof: 2 });
    p.forma([[-w * .355, w * .01], [-w * .34, -w * .06], [w * .34, -w * .06], [w * .355, w * .01]], esc, L);
    p.forma(estrelaP(0, -w * .17, w * .065, w * .027, 5), "claro", L);
    const a0 = 205 + vaiVem(tt, .25) * 80; p.alfa(.75, () => p.linha(arcoP(0, w * .04, w * .28, a0, a0 + 34, 6), maisClaro(p, cor, .45), w * .03));
    p.forma([[-w * .48, w * .08], [-w * .4, w * .0], [w * .4, w * .0], [w * .48, w * .08], [w * .38, w * .1], [-w * .38, w * .1]], cor, { prof: 1 });
    p.linha([[-w * .38, w * .02], [w * .38, w * .02]], esc, w * .016);
  });
}

/** Medalha de honra pendurada na fita, balançando, com um brilho piscando no disco. Opções: larg, cor, t. Chaves: medalha, condecoração, honra, mérito, conquista, reconhecimento, herói, prêmio */
export function medalha(p, { larg = 260, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .24, esc = escuro(p, cor, .22);
  p.em({ x: 0, y: -w * .5, r: Math.sin(tt * 2) * .1 }, () => p.em({ x: 0, y: w * .5 }, () => {
    p.forma([[-w * .22, -w * .5], [w * .0, -w * .5], [w * .1, -w * .04], [-w * .1, -w * .04]], "c1", { prof: 1 });
    p.linha([[-w * .11, -w * .5], [w * .0, -w * .04]], "claro", w * .03);
    p.forma([[w * .22, -w * .5], [w * .0, -w * .5], [-w * .1, -w * .04], [w * .1, -w * .04]], "c3", { prof: 1 });
    p.linha([[w * .11, -w * .5], [w * .0, -w * .04]], "claro", w * .03);
    p.forma(retArredP(-w * .25, -w * .55, w * .5, w * .07, w * .02), cor, { prof: 1 });
    p.forma(circP(0, -w * .03, w * .05), cor, { prof: 0, furos: [circP(0, -w * .03, w * .025).reverse()] });
    p.circulo(0, w * .2, r, cor, { prof: 2 });
    p.linha(circP(0, w * .2, r * .8, 32), esc, w * .016, { fechar: true });
    p.forma(estrelaP(0, w * .2, r * .58, r * .24, 5), esc, L);
    cintilar(p, -r * .45, w * .2 - r * .45, w * .08, (tt * .7) % 1, "claro");
  }));
}

/** Pelotão de soldados marchando em fila, todos no mesmo passo, com o fuzil nas costas. Opções: n, alt, cor, t. Chaves: pelotão, soldados, exército, tropa, marcha, disciplina, equipe, sincronia */
export function pelotao(p, { n = 4, alt = 220, cor = "c3", t = 0 } = {}) {
  const H = alt, tt = p.ritmo(t), sp = H * .44, pose = CICLOS.andar(tt, { vel: 1.3, amp: .85 }), arma = escuro(p, "c2", .25);
  const fuzil = (q, e, h) => q.capsula([e.ombro[0] - h * .15, e.ombro[1] - h * .19], [e.quadril[0] + h * .06, e.quadril[1] + h * .02], h * .04, arma);
  for (let i = 0; i < n; i++) p.em({ x: (i - (n - 1) / 2) * sp, y: 0 }, () => personagem(p, { ...TIPOS.soldado, roupa: cor, calca: escuro(p, cor, .15), corChapeu: cor, pose, altura: H, nasCostas: fuzil, t: tt, semente: i * 3 }));
}

/** Castelo medieval com torres, ameias, bandeiras tremulando e a grade do portão subindo e descendo. Opções: larg, cor, t. Chaves: castelo, medieval, reino, fortaleza, rei, proteção, idade média, poder */
export function castelo(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .22), telhado = "c1";
  p.linha([[0, -w * .62], [0, -w * .8]], esc, w * .012); flamula(p, 0, -w * .8, w * .1, "c2", tt);
  p.forma(ameias(-w * .17, w * .17, 0, -w * .58, w * .055, 5), esc, { prof: 1 });
  p.forma([[-w * .02, -w * .4], [-w * .02, -w * .47], [0, -w * .49], [w * .02, -w * .47], [w * .02, -w * .4]], "tinta", L);
  p.forma(ameias(-w * .36, w * .36, 0, -w * .28, w * .05, 9), cor, { prof: 1 });
  p.linha([[-w * .28, -w * .15], [w * .28, -w * .15]], esc, w * .012, { tracejado: [w * .06, w * .04] });
  const portao = [[-w * .085, 0], [-w * .085, -w * .12], ...arcoP(0, -w * .12, w * .085, 180, 360, 10), [w * .085, 0]];
  p.forma(portao, "tinta", L);
  const yb = -w * .015 - vaiVem(tt, .18) * w * .13;
  p.recortar(portao, () => {
    for (let i = 0; i < 4; i++) { const x = -w * .06 + i * w * .04; p.linha([[x, -w * .22], [x, yb]], cor, w * .014); }
    for (const dy of [-w * .03, -w * .09]) p.linha([[-w * .09, yb + dy], [w * .09, yb + dy]], cor, w * .012);
  });
  for (const s of [-1, 1]) {
    const x = s * w * .37;
    p.forma(retP(x - w * .085, -w * .48, w * .17, w * .48), cor, { prof: 2 });
    p.forma(retP(x - w * .1, -w * .52, w * .2, w * .05), esc, { prof: 1 });
    p.forma([[x - w * .115, -w * .52], [x + w * .115, -w * .52], [x, -w * .75]], telhado, { prof: 1 });
    p.forma(retArredP(x - w * .02, -w * .38, w * .04, w * .09, w * .02), "tinta", L);
    p.linha([[x, -w * .75], [x, -w * .85]], esc, w * .012); flamula(p, x, -w * .85, w * .08, "c2", tt, 1, s);
  }
}

/** Pirâmides do Egito no deserto, com o sol passando e a areia soprando. Opções: larg, cor, t. Chaves: pirâmide, Egito, faraó, antiguidade, deserto, história antiga, monumento, mistério */
export function piramide(p, { larg = 420, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .25);
  const sx = w * .3 + Math.sin(tt * .5) * w * .07, sy = -w * .5 + Math.cos(tt * .5) * w * .025;
  p.alfa(.35, () => p.circulo(sx, sy, w * (.085 + .01 * Math.sin(tt * 3)), cor, L));
  p.circulo(sx, sy, w * .06, cor, { prof: 0 });
  const piram = (x0, x1, xa, ya, xm, sd) => { p.forma([[x0, 0], [xa, ya], [xm, 0]], cor, { prof: 1, semente: sd }); p.forma([[xa, ya], [x1, 0], [xm, 0]], esc, { prof: 1, semente: sd + 1 }); };
  piram(w * .32, w * .52, w * .43, -w * .15, w * .45, 3);
  piram(w * .02, w * .44, w * .25, -w * .32, w * .3, 5);
  const A = [-w * .1, -w * .5], esq = [[-w * .48, 0], A, [w * .02, 0]];
  piram(-w * .48, w * .28, A[0], A[1], w * .02, 7);
  p.recortar(esq, () => { for (let i = 1; i < 6; i++) p.linha([[-w * .5, -i * w * .08], [w * .05, -i * w * .08]], esc, w * .008); });
  for (let i = 0; i < 5; i++) { const u = (tt * .18 + i / 5) % 1, x = lerp(-w * .55, w * .55, u), y = -w * (.02 + .03 * ((i * 7) % 3)); p.alfa(Math.sin(u * Math.PI), () => p.linha([[x, y], [x + w * .06, y - w * .005]], esc, w * .012)); }
}

/** Templo grego de colunas, com um brilho no frontão e pássaros cruzando o céu. Opções: larg, cor, t. Chaves: templo, Grécia, Roma antiga, colunas, democracia, filosofia, tradição, pilares */
export function templo(p, { larg = 400, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = p.estilo === "pixel", cl = p.estilo === "flat" || p.estilo === "papel", c = cor === "claro" ? pedra(p, .17) : cor;
  const fundo = px ? "tinta" : cor === "claro" ? (cl ? escuro(p, "claro", .62) : pedra(p, .45)) : escuro(p, cor, .4), linha = px ? "tinta" : cor === "claro" ? (cl ? escuro(p, "claro", .45) : pedra(p, .25)) : escuro(p, cor, .2);
  const u = (tt * .1) % 1; passaros(p, [[lerp(-w * .55, w * .55, u), -w * .82], [lerp(-w * .55, w * .55, u) - w * .08, -w * .78]], w, tt, "c1");
  p.forma(retP(-w * .36, -w * .48, w * .72, w * .38), fundo, { prof: 0 });
  for (const [x, y, ww] of [[-w * .46, -w * .035, w * .92], [-w * .43, -w * .07, w * .86], [-w * .4, -w * .105, w * .8]]) {
    p.forma(retP(x, y, ww, w * .035), c, { prof: 1 });
    if (cl) p.linha([[x, y + w * .035], [x + ww, y + w * .035]], linha, w * .01);
  }
  for (let i = 0; i < 6; i++) {
    const x = -w * .32 + i * w * .128;
    p.forma([[x - w * .05, -w * .105], [x - w * .05, -w * .125], [x - w * .037, -w * .125], [x - w * .037, -w * .45], [x - w * .055, -w * .45], [x - w * .055, -w * .48], [x + w * .055, -w * .48], [x + w * .055, -w * .45], [x + w * .037, -w * .45], [x + w * .037, -w * .125], [x + w * .05, -w * .125], [x + w * .05, -w * .105]], c, { prof: 1 });
    p.linha([[x, -w * .43], [x, -w * .14]], linha, w * .008);
  }
  p.forma(retP(-w * .43, -w * .545, w * .86, w * .065), c, { prof: 1 });
  p.linha([[-w * .4, -w * .51], [w * .4, -w * .51]], linha, w * .024, { tracejado: [w * .022, w * .034] });
  p.forma([[-w * .46, -w * .545], [w * .46, -w * .545], [0, -w * .72]], c, { prof: 1 });
  p.forma([[-w * .34, -w * .565], [w * .34, -w * .565], [0, -w * .685]], linha, L);
  if (cl) p.linha([[-w * .46, -w * .545], [0, -w * .72], [w * .46, -w * .545], [-w * .46, -w * .545]], linha, w * .01, { fechar: true });
  cintilar(p, w * .3, -w * .6, w * .05, (tt * .5) % 1, "c2");
}

/** Caravela das grandes navegações balançando nas ondas, com as velas enfunadas e a cruz pintada. Opções: larg, cor, t. Chaves: caravela, navegação, descobrimento, expedição, viagem, aventura, explorar, Cabral */
export function caravela(p, { larg = 400, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .3), madeira = escuro(p, cor, .4), b = w * (.035 + .018 * Math.sin(tt * 2.2));
  const vela = (xL, xR, yT, yB) => {
    const o = [], n = 6;
    for (let i = 0; i <= n; i++) { const u = i / n; o.push([lerp(xL, xR, u), yT + Math.sin(u * Math.PI) * b * .3]); }
    for (let i = 1; i <= n; i++) { const u = i / n; o.push([xR + Math.sin(u * Math.PI) * b, lerp(yT, yB, u)]); }
    for (let i = 1; i <= n; i++) { const u = i / n; o.push([lerp(xR, xL, u), yB + Math.sin(u * Math.PI) * b * .3]); }
    for (let i = 1; i < n; i++) { const u = i / n; o.push([xL + Math.sin(u * Math.PI) * b, lerp(yB, yT, u)]); }
    return o;
  };
  const cruz = (x, y, s) => { p.capsula([x, y - s], [x, y + s], s * .32, "c1"); p.capsula([x - s * .7, y - s * .2], [x + s * .7, y - s * .2], s * .32, "c1"); };
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .012, r: Math.sin(tt * 1.2) * .03 }, () => {
    for (const [x, top] of [[w * .2, -w * .66], [-w * .02, -w * .8], [-w * .27, -w * .6]]) p.linha([[x, -w * .15], [x, top]], madeira, w * .018);
    flamula(p, -w * .02, -w * .8, w * .09, "c1", tt);
    flamula(p, w * .2, -w * .66, w * .07, "c1", tt, 1, 1);
    p.linha([[-w * .44, -w * .26], [-w * .17, -w * .62]], madeira, w * .014);
    p.forma([[-w * .43, -w * .27], [-w * .18, -w * .6], [-w * .22 + b, -w * .42], [-w * .25 + b * .6, -w * .27]], "claro", { prof: 1 });
    p.forma(vela(-w * .14, w * .09, -w * .72, -w * .3), "claro", { prof: 1 });
    p.linha([[-w * .17, -w * .72], [w * .12, -w * .72]], madeira, w * .016);
    p.forma(vela(w * .11, w * .29, -w * .58, -w * .3), "claro", { prof: 1 });
    p.linha([[w * .08, -w * .58], [w * .32, -w * .58]], madeira, w * .016);
    cruz(-w * .025 + b * .6, -w * .51, w * .09); cruz(w * .2 + b * .6, -w * .44, w * .06);
    p.forma([[-w * .46, -w * .25], [-w * .46, -w * .36], [-w * .26, -w * .33], [-w * .26, -w * .22]], cor, { prof: 1 });
    p.forma([[-w * .46, -w * .29], [-w * .3, -w * .24], [w * .2, -w * .2], [w * .46, -w * .28], [w * .36, -w * .08], [w * .2, 0], [-w * .3, 0], [-w * .42, -w * .1]], cor, { prof: 2 });
    p.linha([[-w * .43, -w * .17], [w * .02, -w * .12], [w * .38, -w * .17]], esc, w * .026);
  });
  ondas(p, w * 1.1, tt);
}

/** Pergaminho que se desenrola revelando linhas de texto e um selo de cera. Opções: larg, cor, k (0..1 desenrola), t. Chaves: pergaminho, documento antigo, decreto, lei, tratado, carta, manuscrito, história */
export function pergaminho(p, { larg = 300, cor = "claro", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = lerp(.16, 1, E.sai(clamp(k * 1.5))), h = w * 1.05, y0 = -h * kk / 2, yb = h * kk / 2, H0 = -h / 2;
  const rolo = pedra(p, .22), borda = p.estilo === "pixel" ? "tinta" : escuro(p, rolo === "claro" ? "c4" : rolo, .35);
  p.em({ x: 0, y: Math.sin(tt * 1.7) * w * .015, r: Math.sin(tt * 1.2) * .04 }, () => {
    const folha = [[-w * .42, y0], [w * .42, y0], [w * .42, yb], [-w * .42, yb]];
    p.forma(folha, cor, { prof: 1 });
    p.recortar(folha, () => {
      p.linha([[-w * .22, H0 + h * .13], [w * .22, H0 + h * .13]], "tinta", w * .03);
      for (let i = 0; i < 6; i++) { const y = H0 + h * (.25 + i * .1), fim = i === 5 ? lerp(-w * .2, w * .2, ciclo(tt, 2.5, 1)) : w * (.32 - ((i * 37) % 3) * .07); p.linha([[-w * .32, y], [fim, y]], "tinta", w * .016); }
    });
    for (const [y, s] of [[y0, -1], [yb, 1]]) {
      p.capsula([-w * .47, y], [w * .47, y], w * .13, rolo, { prof: 1 });
      p.linha([[-w * .44, y - s * w * .03], [w * .44, y - s * w * .03]], borda, w * .014);
      p.linha([[-w * .3, y + s * w * .045], [w * .3, y + s * w * .045]], borda, w * .01);
      for (const lado of [-1, 1]) p.capsula([lado * w * .47, y], [lado * w * .55, y], w * .085, "c1", { prof: 0 });
    }
    if (kk > .85) p.em({ x: w * .22, y: yb - h * .12, s: E.volta(clamp((kk - .85) / .15)) * (1 + .04 * Math.sin(tt * 4)) }, () => { p.forma(estrelaP(0, 0, w * .075, w * .062, 12), "c1", { prof: 1 }); p.circulo(0, 0, w * .04, escuro(p, "c1", .2), L); });
  });
}

/** Coroa de rei com joias brilhando, inclinando de leve. Opções: larg, cor, t. Chaves: coroa, rei, rainha, monarquia, realeza, poder, império, liderança */
export function coroa(p, { larg = 300, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .22);
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .025 + w * .04, r: Math.sin(tt * 1.1) * .06 }, () => {
    p.forma(arcoP(0, w * .08, w * .36, 180, 360, 16), "c1", { prof: 1 });
    p.forma([[-w * .42, w * .1], [-w * .47, -w * .26], [-w * .22, -w * .05], [0, -w * .36], [w * .22, -w * .05], [w * .47, -w * .26], [w * .42, w * .1]], cor, { prof: 2 });
    for (const [x, y] of [[-w * .47, -w * .3], [0, -w * .4], [w * .47, -w * .3]]) p.circulo(x, y, w * .05, cor, { prof: 1 });
    p.forma(retArredP(-w * .44, w * .04, w * .88, w * .16, w * .03), esc, { prof: 1 });
    p.elipse(-w * .26, w * .12, w * .055, w * .04, "c1", { prof: 0 });
    p.elipse(w * .26, w * .12, w * .055, w * .04, "c1", { prof: 0 });
    p.forma([[0, w * .06], [w * .055, w * .12], [0, w * .18], [-w * .055, w * .12]], "c3", { prof: 0 });
    p.circulo(0, -w * .14, w * .04, "c3", { prof: 0 });
    for (let i = 0; i < 3; i++) { const f = (tt * .8 + i / 3) % 1, [x, y] = [[-w * .26, w * .1], [0, -w * .16], [w * .26, w * .1]][i]; cintilar(p, x + w * .03, y - w * .03, w * .07, f, "claro"); }
  });
}

/** Busto de bronze com coroa de louros sobre um pedestal, com brilhos correndo pela estátua. Opções: larg, cor (use "claro" para mármore), cor2 (pedestal), t. Chaves: estátua, busto, monumento, herói, imperador, memória, legado, homenagem */
export function estatua(p, { larg = 260, cor = "c3", cor2 = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor === "claro" ? pedra(p, .08) : cor, det = "tinta";
  p.forma(retP(-w * .34, -w * .08, w * .68, w * .08), cor2, { prof: 2 });
  p.forma(retP(-w * .25, -w * .62, w * .5, w * .54), cor2, { prof: 1 });
  p.forma(retP(-w * .32, -w * .7, w * .64, w * .08), cor2, { prof: 1 });
  p.forma(retP(-w * .16, -w * .44, w * .32, w * .14), "claro", { prof: 0 });
  for (const [y, l] of [[-w * .4, .2], [-w * .345, .12]]) p.linha([[-w * l * .5, y], [w * l * .5, y]], det, w * .014);
  p.forma([[-w * .12, -w * .7], [w * .12, -w * .7], [w * .08, -w * .77], [-w * .08, -w * .77]], c, { prof: 1 });
  const peito = [[-w * .3, -w * .76], [w * .3, -w * .76], [w * .29, -w * .9], [w * .22, -w * .98], [w * .08, -w * 1.0], [-w * .08, -w * 1.0], [-w * .22, -w * .98], [-w * .29, -w * .9]];
  p.forma(retP(-w * .06, -w * 1.08, w * .12, w * .12), c, { prof: 0 });
  p.forma(peito, c, { prof: 1 });
  p.linha(bezier([-w * .24, -w * .95], [-w * .02, -w * .9], [w * .12, -w * .78], 8), det, w * .012);
  p.linha(bezier([-w * .1, -w * .99], [w * .06, -w * .92], [w * .22, -w * .8], 8), det, w * .012);
  p.elipse(0, -w * 1.18, w * .13, w * .16, c, { prof: 1 });
  for (let i = 0; i < 9; i++) { const a = (195 + i * 18.5) * Math.PI / 180, x = Math.cos(a) * w * .135, y = -w * 1.18 + Math.sin(a) * w * .16; p.elipse(x, y, w * .042, w * .022, "c2", { prof: 0, liso: true }); }
  for (const dx of [-w * .05, w * .05]) p.linha(arcoP(dx, -w * 1.2, w * .025, 20, 160, 4), det, w * .01);
  p.linha([[0, -w * 1.18], [-w * .012, -w * 1.12], [w * .01, -w * 1.115]], det, w * .01);
  p.linha([[-w * .03, -w * 1.08], [w * .03, -w * 1.08]], det, w * .01);
  const g = (tt * .45) % 1; cintilar(p, lerp(-w * .2, w * .2, g), lerp(-w * .8, -w * 1.25, g), w * .07, g, "c2");
  const g2 = (tt * .45 + .5) % 1; cintilar(p, lerp(w * .2, -w * .15, g2), lerp(-w * .3, -w * .55, g2), w * .06, g2, "claro");
}

/** Ampulheta com a areia escorrendo do bulbo de cima para o de baixo. Opções: alt, cor, areia, k (0..1 quanto já escorreu; sem k escorre sozinha), t. Chaves: ampulheta, tempo, prazo, espera, urgência, contagem regressiva, paciência, demora */
export function ampulheta(p, { alt = 340, cor = "c1", areia = "c2", k = null, t = 0 } = {}) {
  const h = alt, w = h * .62, tt = p.ritmo(t), kk = clamp(k ?? ciclo(tt, 6, 1.2)), yT = -h * .92, yB = -h * .08;
  const Y = u => lerp(yT, yB, u), hw = u => w * .045 + w * .29 * Math.abs(Math.cos(Math.PI * u)) ** .7;
  const lado = (u0, u1, s, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const u = lerp(u0, u1, i / n); return [s * hw(u), Y(u)]; });
  const vidro = [...lado(0, 1, 1, 20), ...lado(1, 0, -1, 20)];
  for (const s of [-1, 1]) p.capsula([s * w * .44, -h * .95], [s * w * .44, -h * .05], w * .055, cor, { prof: 1 });
  p.alfa(.5, () => p.forma(vidro, "claro", L));
  const uS = lerp(.08, .5, kk); if (kk < .99) p.forma([...lado(uS, .49, 1, 8), ...lado(.49, uS, -1, 8)], areia, L);
  const uB = lerp(.97, .62, kk), monte = h * .05 * kk;
  p.forma([...lado(.97, uB, -1, 8), [0, Y(uB) - monte], ...lado(uB, .97, 1, 8)], areia, L);
  if (kk > .01 && kk < .99) p.linha([[0, Y(.5)], [0, Y(uB) - monte]], areia, w * .035, { tracejado: [w * .05, w * .03], desloc: tt * w * .6 });
  p.alfa(.45 + .35 * Math.sin(tt * 2.4), () => p.linha(lado(.1, .3, -.62, 6), pedra(p, .02), w * .03));
  p.linha(vidro, sobreFundo(p), w * .016, { fechar: true });
  for (const y of [-h, -h * .08]) { p.forma(retArredP(-w * .52, y, w * 1.04, h * .08, h * .02), cor, { prof: 2 }); }
}

/** Mapa antigo de pergaminho com ilhas, rosa dos ventos e a rota tracejada andando até o X do tesouro. Opções: larg, cor, k (0..1 traça a rota), t. Chaves: mapa, rota, tesouro, caminho, exploração, destino, estratégia, plano */
export function mapaAntigo(p, { larg = 400, cor = "claro", k = 1, t = 0 } = {}) {
  const w = larg, h = w * .66, tt = p.ritmo(t), r = rng(11), cantos = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], borda = [];
  for (let s = 0; s < 4; s++) { const [x0, y0] = cantos[s], [x1, y1] = cantos[(s + 1) % 4]; for (let i = 0; i < 8; i++) { const u = i / 8, j = (r() - .5) * w * .035; borda.push([lerp(x0, x1, u) + (s % 2 ? j : 0), lerp(y0, y1, u) + (s % 2 ? 0 : j)]); } }
  const ilha = (cx, cy, rx, ry, sd) => { const q = rng(sd); return Array.from({ length: 18 }, (_, i) => { const a = i / 18 * TAU, f = .78 + q() * .35; return [cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]; }); };
  p.em({ x: 0, y: Math.sin(tt * 1.4) * w * .01, r: Math.sin(tt * .9) * .02 }, () => {
    p.forma(borda, cor, { prof: 2 });
    p.linha(borda, pedra(p, .35), w * .012, { fechar: true });
    p.forma(ilha(-w * .27, -h * .04, w * .13, h * .24, 3), "c3", { prof: 0 });
    p.forma(ilha(w * .22, h * .1, w * .14, h * .2, 8), "c3", { prof: 0 });
    p.forma(ilha(w * .02, -h * .3, w * .055, h * .08, 4), "c3", { prof: 0 });
    for (const [x, y] of [[-w * .05, h * .32], [w * .1, h * .36], [-w * .38, h * .34]]) { const d = Math.sin(tt * 2 + x) * w * .01; p.linha(Array.from({ length: 7 }, (_, i) => [x + d + i * w * .012, y + Math.sin(i * 1.4) * w * .008]), "c4", w * .01); }
    p.em({ x: w * .34, y: -h * .27, r: Math.sin(tt * 1.5) * .25 }, () => {
      p.linha(circP(0, 0, w * .055, 20), "tinta", w * .008, { fechar: true });
      p.forma(estrelaP(0, 0, w * .075, w * .018, 4), "tinta", L);
      p.forma([[0, -w * .075], [w * .018, 0], [-w * .018, 0]], "c1", L);
    });
    const rota = [...bezier([-w * .24, -h * .02], [-w * .12, h * .45], [w * .0, h * .05], 12), ...bezier([w * .0, h * .05], [w * .1, -h * .3], [w * .23, h * .08], 12).slice(1)];
    const kk = clamp(k), n = Math.max(2, Math.round(kk * rota.length));
    p.linha(rota.slice(0, n), "c1", w * .014, { tracejado: [w * .03, w * .022], desloc: tt * w * .06 });
    if (kk < .95) { const [x, y] = rota[n - 1]; p.circulo(x, y, w * .018, "c1", L); }
    p.alfa(clamp((kk - .85) / .15), () => p.em({ x: w * .23, y: h * .08, s: 1 + .14 * Math.sin(tt * 5), r: Math.sin(tt * 2.5) * .1 }, () => { const d = w * .035; p.capsula([-d, -d], [d, d], w * .024, "c1"); p.capsula([d, -d], [-d, d], w * .024, "c1"); }));
  });
}

/** Barraca de acampamento militar com a lona da porta batendo ao vento e a bandeira no mastro. Opções: larg, cor, t. Chaves: barraca, acampamento, base militar, exército, abrigo, missão, tenda, campanha */
export function barracaMilitar(p, { larg = 380, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .25), vento = Math.sin(tt * 3) * .6 + Math.sin(tt * 7.3) * .3, corda = sobreFundo(p);
  const A = [-w * .14, -w * .48], B = [w * .26, -w * .54];
  p.linha([A, [-w * .5, 0]], corda, w * .008); p.linha([B, [w * .5, 0]], corda, w * .008);
  for (const x of [-w * .5, w * .5]) p.linha([[x, w * .0], [x + (x < 0 ? -1 : 1) * w * .01, -w * .04]], "c2", w * .016);
  p.linha([A, [A[0], A[1] - w * .24]], escuro(p, "c2", .2), w * .014);
  flamula(p, A[0], A[1] - w * .24, w * .13, "c1", tt);
  p.forma([A, B, [w * .46, -w * .04], [w * .18, 0]], esc, { prof: 2 });
  p.linha([[w * .06, -w * .51], [w * .32, -w * .02]], escuro(p, cor, .4), w * .01);
  p.forma([[-w * .44, 0], A, [w * .18, 0]], cor, { prof: 1 });
  p.forma([[-w * .14, -w * .38], [-w * .28, 0], [w * .0, 0]], "tinta", L);
  const fx = w * .05 * vento;
  p.forma([[-w * .14, -w * .38], [w * .02, 0], [-w * .05 + fx, -w * .015]], maisClaro(p, cor, .15), { prof: 1 });
  p.linha([A, B], escuro(p, cor, .4), w * .012);
}

/** Tela de radar com a varredura girando e alvos piscando quando o feixe passa. Opções: larg, cor, t. Chaves: radar, monitoramento, vigilância, detectar, rastrear, alvo, controle, sonar */
export function radar(p, { larg = 300, cor = "c3", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), Ri = R * .86, a = (tt * 2) % TAU, deg = 180 / Math.PI;
  p.circulo(0, 0, R, pedra(p, .3), { prof: 2 });
  for (let i = 0; i < 12; i++) { const b = i / 12 * TAU; p.linha([[Math.cos(b) * R * .9, Math.sin(b) * R * .9], [Math.cos(b) * R * .97, Math.sin(b) * R * .97]], "tinta", R * .02); }
  p.circulo(0, 0, Ri, p.estilo === "vidro" ? "claro" : "tinta", { prof: 0 });
  for (const f of [.36, .7]) p.alfa(.7, () => p.linha(circP(0, 0, Ri * f, 32), cor, R * .014, { fechar: true }));
  p.alfa(.7, () => { p.linha([[-Ri, 0], [Ri, 0]], cor, R * .012); p.linha([[0, -Ri], [0, Ri]], cor, R * .012); });
  for (let j = 0; j < 4; j++) p.alfa((1 - j / 4) * .45, () => p.forma([[0, 0], ...arcoP(0, 0, Ri, (a - (j + 1) * .26) * deg, (a - j * .26) * deg, 4)], cor, L));
  p.linha([[0, 0], [Math.cos(a) * Ri, Math.sin(a) * Ri]], cor, R * .026);
  [[.55, .6], [.8, 2.2], [.35, 3.4], [.68, 4.6], [.45, 5.5]].forEach(([d, b0], i) => {
    const b = b0 + tt * .05 * (i % 2 ? 1 : -1), atras = (((a - b) % TAU) + TAU) % TAU, lum = clamp(1 - atras / 3.2);
    if (lum > 0) p.alfa(lum, () => p.circulo(Math.cos(b) * Ri * d, Math.sin(b) * Ri * d, R * .055 * (.7 + .3 * lum), "c2", L));
  });
  p.circulo(0, 0, R * .04, cor, L);
}

/** Binóculo vasculhando o horizonte de um lado para o outro, com o reflexo correndo nas lentes. Opções: larg, cor, t. Chaves: binóculo, observar, vigiar, procurar, explorar, visão, olhar longe, futuro */
export function binoculo(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .3), varre = Math.sin(tt * 1.1);
  p.em({ x: varre * w * .04, y: Math.sin(tt * 2.2) * w * .01 - w * .02, r: varre * .06 }, () => {
    for (const s of [-1, 1]) {
      p.forma(retArredP(s * w * .19 - w * .075, -w * .38, w * .15, w * .16, w * .03), esc, { prof: 1 });
      p.forma([[s * w * .19 - w * .1, -w * .25], [s * w * .19 + w * .1, -w * .25], [s * w * .25 + w * .15, w * .1], [s * w * .25 - w * .15, w * .1]], cor, { prof: 2 });
      const lente = circP(s * w * .25, w * .16, w * .135);
      p.circulo(s * w * .25, w * .16, w * .175, esc, { prof: 1 });
      p.forma(lente, "c4", L);
      p.recortar(lente, () => { const d = ((tt * .5 + (s > 0 ? .15 : 0)) % 1) * w * .6 - w * .3; p.alfa(.7, () => p.forma([[s * w * .25 + d - w * .03, w * .0], [s * w * .25 + d + w * .03, w * .0], [s * w * .25 + d - w * .06, w * .32], [s * w * .25 + d - w * .12, w * .32]], "claro", L)); });
    }
    p.forma(retArredP(-w * .1, -w * .2, w * .2, w * .1, w * .03), esc, { prof: 1 });
    p.circulo(0, -w * .28, w * .06, cor, { prof: 1 });
    for (let i = 0; i < 3; i++) { const y = -w * .28 + (((tt * .8 + i / 3) % 1) - .5) * w * .1; p.linha([[-w * .045, y], [w * .045, y]], "tinta", w * .01); }
  });
}

/** Cerca de arame farpado entre mourões, com os fios vibrando. Opções: larg, cor, t. Chaves: arame farpado, cerca, fronteira, limite, prisão, barreira, perigo, restrição */
export function arameFarpado(p, { larg = 420, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fio = sobreFundo(p), f = fase(tt, 3.2), puxao = Math.exp(-f * 2.2) * Math.sin(f * 22) * w * .03;
  const postes = [-w * .44, 0, w * .44];
  postes.forEach((x, i) => p.forma([[x - w * .024, 0], [x + w * .024, 0], [x + w * .024, -w * .39 - i % 2 * w * .02], [x - w * .024, -w * .42]], cor, { prof: 1, semente: i + 2 }));
  [-w * .12, -w * .23, -w * .34].forEach((y0, j) => {
    for (let s = 0; s < 2; s++) {
      const x0 = postes[s], x1 = postes[s + 1], amp = (s === 0 ? puxao : puxao * .4) * (1 - j * .2), sag = w * (.02 + .006 * Math.sin(tt * 1.5 + j + s));
      const y = u => y0 + Math.sin(u * Math.PI) * (sag + amp);
      p.linha(Array.from({ length: 13 }, (_, i) => [lerp(x0, x1, i / 12), y(i / 12)]), fio, w * .01);
      for (const u of [.22, .5, .78]) p.forma(estrelaP(lerp(x0, x1, u), y(u), w * .028, w * .007, 4, Math.PI / 4 + j), fio, L);
    }
  });
}

/** Coliseu de Roma em ruína, com arcos em três andares e pássaros voando em volta. Opções: larg, cor, t. Chaves: coliseu, Roma, Império Romano, gladiador, arena, ruína, antiguidade, espetáculo */
export function coliseu(p, { larg = 420, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .28), oco = escuro(p, cor, .5), H = w * .52;
  const topo = [[-w * .48, -H], [w * .06, -H], [w * .1, -H * .88], [w * .17, -H * .88], [w * .21, -H * .74], [w * .28, -H * .74], [w * .31, -H * .6], [w * .39, -H * .58], [w * .43, -H * .45], [w * .48, -H * .43]];
  const fachada = [[-w * .48, 0], ...topo, [w * .48, 0]];
  const alturaTopo = x => { for (let i = 0; i < topo.length - 1; i++) { const [x0, y0] = topo[i], [x1, y1] = topo[i + 1]; if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0 || 1)); } return -H; };
  const ang = tt * .6; passaros(p, [0, 1, 2].map(i => [w * .12 + Math.cos(ang + i * 2.1) * w * .3, -H * 1.22 + Math.sin(ang + i * 2.1) * w * .07]), w, tt, sobreFundo(p));
  p.forma([[-w * .1, 0], [-w * .1, -H * .97], [w * .4, -H * .9], [w * .45, -H * .8], [w * .45, 0]], esc, { prof: 0 });
  p.forma(fachada, oco, L);
  const furos = [], aw = w * .056;
  [[-H * .03, -H * .2], [-H * .32, -H * .48], [-H * .6, -H * .76]].forEach(([yB, yS]) => {
    for (let i = 0; i < 9; i++) {
      const x = -w * .42 + i * w * .105;
      if (yS - aw / 2 - w * .02 < Math.max(alturaTopo(x - aw / 2), alturaTopo(x + aw / 2))) continue;
      furos.push([[x - aw / 2, yB], [x - aw / 2, yS], ...arcoP(x, yS, aw / 2, 180, 360, 6), [x + aw / 2, yB]].reverse());
    }
  });
  for (let i = 0; i < 9; i++) { const x = -w * .42 + i * w * .105; if (-H * .96 < alturaTopo(x + w * .02) + w * .01) continue; furos.push(retP(x - w * .016, -H * .96, w * .032, H * .06).reverse()); }
  p.forma(fachada, cor, { prof: 2, furos });
  p.recortar(fachada, () => { for (const y of [-H * .28, -H * .56, -H * .84]) p.linha([[-w * .5, y], [w * .5, y]], esc, w * .014); });
}

/** Espada e escudo para uma cena medieval. Chaves: medieval, espada, escudo, história */
export function defesaMedieval(p, { t = 0 } = {}) {
  p.em({ x: -85, s: .55 }, () => espada(p, { t }));
  p.em({ x: 85, s: .55 }, () => escudoMedieval(p, { t }));
}
