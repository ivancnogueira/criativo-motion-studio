// Categoria: Efeitos
// Kit de movimento — efeitos de partículas, impacto, luz e energia: fumaça, explosão, brilho, confete, magia.
// Todos centrados na origem (o ponto de onde o efeito nasce). Sem `k`, cada efeito se repete sozinho com `t`;
// os de disparo único (explosao, estouro, ondaDeChoque, respingo, fogosDeArtificio) aceitam `k` (0..1 = progresso
// do disparo) e, sem ele, disparam em laço. A convenção das peças está em ./_comum.js.
import { clamp, lerp, rng, semear, ruido, E, mola, circP, misturarCor, TAU, arcoP, estrelaP, sobreFundo, ciclo } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
const HEX6 = /^#[0-9a-f]{6}$/i;
/** Parte fracionária, também para tempos negativos: base dos laços. */
const fr = x => x - Math.floor(x);
/** Cinza que aparece sobre o fundo do estilo (k = 0 é o fundo, 1 é a cor de traço solto): fumaça, vapor, neblina. */
function cinza(p, k = .4) { const a = p.cor("fundo"), b = p.cor(sobreFundo(p)); return HEX6.test(a) && HEX6.test(b) ? misturarCor(a, b, k) : sobreFundo(p); }
/** Duas cores quentes do estilo, de fora para dentro: fogo, explosão, faísca e brasa. */
const quentes = p => ({ papel: ["c1", "c2"], flat: ["c2", "c4"], pixel: ["c2", "c4"] })[p.estilo] || ["c2", sobreFundo(p)];
/** Cor de luz forte do estilo: amarelo nos estilos claros, branco luminoso nos escuros. */
const luz = p => quentes(p)[1];
/** Cor de água do estilo (o azul da paleta). */
const corDeAgua = p => p.estilo === "papel" ? "c4" : "c1";
/** Brilho interno sobre um corpo colorido: cartão nos estilos claros, tinta luminosa nos escuros. */
const nucleo = p => p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro";
/** Terra: cinza puxado para a cor quente, para poeira. */
function terra(p) { const g = cinza(p, .34), q = p.cor(quentes(p)[1]); return HEX6.test(g) && HEX6.test(q) ? misturarCor(g, q, .3) : g; }
/** Espessura de traço que não some no pixel. */
const grosso = (p, v) => p.estilo === "pixel" ? Math.max(v, 12) : v;
/** Dissipar uma partícula: transparência nos estilos lisos; no pixel ela some de uma vez (meio-tom vira outra cor). */
const sumir = (p, a, fn) => p.alfa(p.estilo === "pixel" ? (a > .3 ? 1 : 0) : a, fn);
/** Bolota irregular (nuvem de fumaça) com os gomos girando conforme `fase`. */
function bolotaP(cx, cy, rx, ry = rx, sd = 0, fase = 0, n = 24) {
  const g = rng(sd * 97 + 13), f0 = g() * TAU, f1 = g() * TAU, lob = 4 + Math.floor(g() * 3);
  return Array.from({ length: n }, (_, i) => { const a = i / n * TAU, q = 1 + .12 * Math.cos(a * lob + f0 + fase) + .05 * Math.sin(a * (lob + 3) + f1 - fase * .7); return [cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q]; });
}
/** Estrela de pontas irregulares (explosão, estouro de quadrinhos), sempre a mesma para a mesma semente. */
function irregularP(R, r, m, sd, rot = 0) {
  const g = rng(sd * 53 + 7);
  return Array.from({ length: m * 2 }, (_, i) => { const a = rot + (i + (g() - .5) * .45) * Math.PI / m, q = (i % 2 ? r : R) * (.84 + g() * .32); return [Math.cos(a) * q, Math.sin(a) * q]; });
}
/** Cintilância de quatro pontas. */
const cintilaP = (cx, cy, R, fino = .3, rot = 0) => estrelaP(cx, cy, R, R * fino, 4, rot - Math.PI / 2);
/** Coração centrado em (cx, cy), de largura w. */
const coracaoP = (cx, cy, w) => [...arcoP(cx - w * .25, cy - w * .2, w * .25, 180, 360), ...arcoP(cx + w * .25, cy - w * .2, w * .25, 180, 395), [cx, cy + w * .42], ...arcoP(cx - w * .25, cy - w * .2, w * .25, 145, 180)];
/** Gota com a ponta para cima e o bojo de raio r na origem. */
const gotaP = r => [[0, -r * 2.1], ...arcoP(0, 0, r, -28, 208, 14)];
/** Busto (cabeça, pescoço e ombros) de largura ~0,54·w, base em y = 0,42·w, afastado `d` para fora: a figura da aura e o brilho em volta dela. */
function bustoP(w, d = 0) {
  const base = w * .42, Rh = w * .15, Yh = -w * .2, N = w * .065, Ys = w * .02, S = w * .27, rs = w * .1;
  const th = Math.asin(Math.min(.95, (N + d) / (Rh + d))) * 180 / Math.PI;
  return [[-S - d, base], [-S - d, Ys + rs + (base - Ys - rs) * .5], ...arcoP(-S + rs, Ys + rs, rs + d, 180, 270, 6), [-N - d, Ys - d], ...arcoP(0, Yh, Rh + d, 90 + th, 450 - th, 30), [N + d, Ys - d], ...arcoP(S - rs, Ys + rs, rs + d, 270, 360, 6), [S + d, Ys + rs + (base - Ys - rs) * .5], [S + d, base]];
}
/** Brasa: cores de fora (vermelho), do meio (laranja) e do miolo aceso (só nos fundos escuros), quentes em todos os estilos. */
function brasaCores(p) {
  if (p.estilo === "papel") return ["c1", "c2", null];
  if (p.estilo === "flat" || p.estilo === "pixel") return ["c2", "c4", p.estilo === "pixel" ? "claro" : null];
  const c2 = p.cor("c2"); if (!HEX6.test(c2)) return ["c2", "c2", "tinta"];
  return p.estilo === "traco" ? [misturarCor(c2, "#FF3A1A", .6), c2, misturarCor(c2, "#FFF4D6", .65)] : [misturarCor(c2, "#FF3A10", .72), misturarCor(c2, "#FF8C1A", .62), "#FFE9B8"];
}
/** Letra Z cheia, de altura s. */
const zP = s => { const a = s * .45, b = s * .5, e = s * .25; return [[-a, -b], [a, -b], [a, -b + e], [-a + e * 1.3, b - e], [a, b - e], [a, b], [-a, b], [-a, b - e], [a - e * 1.3, -b + e], [-a, -b + e]]; };

/* ---------------------------------------------------------------- peças */
/** Nuvens de fumaça que sobem da origem, crescem, se desfazem e entortam com o vento. Opções: larg, cor (padrão: cinza do estilo), n, vento, semente, t. Chaves: fumaça, queimar, incêndio, chaminé, poluição, sumir, problema, desaparecer */
export function fumaca(p, { larg = 220, cor = null, n = 9, vento = .3, semente = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), alt = w * 1.45, perto = cor || cinza(p, .52), longe = cor || cinza(p, .34);
  const nuvens = semear(n, semente).map(q => ({ q, f: fr(tt * .32 + q.i / n + q.u * .04) })).sort((a, b) => b.f - a.f);
  for (const { q, f } of nuvens) {
    const r = w * (.11 + .2 * E.sai(f)) * (.85 + .3 * q.v), x = w * (vento * f * f + .15 * Math.sin(f * 5 + q.u * 6) * f), y = -alt * f - w * .05;
    p.alfa(Math.min(1, f / .08) * (1 - Math.pow(f, 1.8)), () => p.forma(bolotaP(x, y, r, r * .9, q.i + semente * 7, tt * .9), f < .45 ? perto : longe, { prof: 1, semente: 10 + q.i }));
  }
}
/** Explosão: clarão de pontas, estilhaços voando e fumaça que fica no fim. Opções: larg, cor, cor2, n (estilhaços), k (0..1 progresso do disparo; sem k repete), semente, t. Chaves: explosão, bomba, estouro, impacto, destruição, crise, revolução, boom */
export function explosao(p, { larg = 340, cor = null, cor2 = null, n = 12, k = null, semente = 2, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = k == null ? ciclo(tt, 1.4, .5) : clamp(k), [qa, qb] = quentes(p), fora = cor || qa, dentro = cor2 || qb;
  const fumo = cinza(p, .45), sk = E.sai(clamp((kk - .08) / .6));
  if (kk > 0) semear(7, semente + 50).forEach(q => {
    const a = q.i / 7 * TAU + q.u, d = w * (.12 + .2 * sk), r = w * (.07 + .12 * sk) * (.8 + .4 * q.v);
    p.alfa(clamp(kk * 4) * (1 - .55 * clamp((kk - .55) / .45)), () => p.forma(bolotaP(Math.cos(a) * d, Math.sin(a) * d * .8 - w * .14 * kk, r, r * .9, q.i + 3, tt * .7), fumo, { prof: 1, semente: 30 + q.i }));
  });
  const s1 = E.sai(clamp(kk / .2)), af = 1 - clamp((kk - .45) / .35);
  if (af > 0 && s1 > .02) sumir(p, af, () => p.em({ x: 0, y: 0, s: s1 * (1 + .04 * Math.sin(tt * 30) + .12 * clamp((kk - .3) / .5)), r: tt * .4 }, () => {
    p.forma(irregularP(w * .44, w * .27, 9, semente), fora, { prof: 2, semente: 5 });
    p.forma(irregularP(w * .29, w * .18, 8, semente + 1, .3), dentro, { prof: 0, semente: 6 });
    if (nucleo(p) === "claro") p.forma(irregularP(w * .13, w * .09, 6, semente + 2, .6), "claro", { prof: 0, liso: true });
  }));
  semear(n, semente).forEach(q => {
    const a = q.u * TAU, d = w * (.25 + .3 * q.v) * E.sai(kk), x = Math.cos(a) * d, y = Math.sin(a) * d + w * .3 * kk * kk, s = w * (.03 + .025 * q.w), g = q.q * 6 + kk * 8 * (q.i % 2 ? 1 : -1);
    const pts = [[-s, -s * .6], [s * .8, -s], [s, s * .5], [-s * .4, s]].map(([px, py]) => [x + px * Math.cos(g) - py * Math.sin(g), y + px * Math.sin(g) + py * Math.cos(g)]);
    sumir(p, clamp(kk * 8) * (1 - clamp((kk - .6) / .38)), () => p.forma(pts, q.i % 3 ? fora : sobreFundo(p), { prof: 0, liso: true }));
  });
}
/** Brilho: cintilância grande pulsando e girando, com faíscas menores piscando em volta. Opções: larg, cor, n, semente, t. Chaves: brilho, brilhante, novo, limpo, mágico, destaque, perfeito, especial */
export function brilho(p, { larg = 240, cor = "c2", n = 6, semente = 3, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .3;
  p.em({ x: 0, y: 0, s: .85 + .18 * Math.sin(tt * 4), r: Math.sin(tt * 1.3) * .25 }, () => {
    p.forma(cintilaP(0, 0, R * .62, .32, Math.PI / 4), "c4", { prof: 0, liso: true });
    p.forma(cintilaP(0, 0, R, .24), cor, { prof: 2, liso: true });
  });
  semear(n, semente).forEach(q => {
    const a = q.i / n * TAU + q.u, d = w * (.3 + .16 * q.v), f = Math.max(0, Math.sin(tt * (2.2 + q.w * 1.5) + q.q * TAU));
    if (f < .08) return;
    const x = Math.cos(a) * d, y = Math.sin(a) * d;
    if (q.i % 3 === 2) p.circulo(x, y, w * .04 * f, sobreFundo(p), { prof: 0, liso: true });
    else p.forma(cintilaP(x, y, w * (.08 + .05 * q.w) * f, .34, f * .6), q.i % 3 ? sobreFundo(p) : cor, { prof: 0, liso: true });
  });
}
/** Faíscas espirrando em leque da origem e caindo com a gravidade, com o ponto de contato tremendo. Opções: larg, cor, n, semente, t. Chaves: faísca, solda, atrito, curto-circuito, esmerilhar, energia, conflito, trabalho duro */
export function faiscas(p, { larg = 320, cor = null, n = 22, semente = 4, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), [qa, qb] = quentes(p), ca = cor || qa;
  const pos = (q, f) => { const a = -Math.PI / 2 + (q.v - .5) * 1.6, v = w * (.5 + .45 * q.w); return [Math.cos(a) * v * f, Math.sin(a) * v * f + w * .55 * f * f]; };
  semear(n, semente).forEach(q => {
    const f = fr(tt * 1.3 + q.u), a = pos(q, f), b = pos(q, Math.max(0, f - .15));
    sumir(p, 1 - f * f, () => p.linha([b, a], q.i % 3 ? ca : qb, grosso(p, w * (.024 + .012 * q.q))));
  });
  const s = .8 + .4 * Math.abs(ruido(tt * 9, semente));
  p.forma(cintilaP(0, 0, w * .13 * s, .3, tt * 3), qb, { prof: 0, liso: true });
  p.circulo(0, 0, w * .05 * s, ca, { prof: 0, liso: true });
}
/** Nuvem de poeira rolando rente ao chão para os dois lados, com pedrinhas pulando. Opções: larg, cor (padrão: cor de terra), n, semente, t. Chaves: poeira, freada, pó, queda, sujeira, abandono, velocidade, aterrissar */
export function poeira(p, { larg = 340, cor = null, n = 14, semente = 5, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || terra(p), clara = cor || cinza(p, .3);
  semear(6, semente + 9).forEach(q => {
    const f = fr(tt * .8 + q.u), lado = q.i % 2 ? 1 : -1, s = w * .022, x = lado * w * (.12 + .38 * f * (.6 + .4 * q.v)), y = -w * (.1 + .16 * q.w) * Math.sin(f * Math.PI) - s;
    sumir(p, 1 - f, () => p.forma([[x - s, y], [x, y - s * 1.2], [x + s, y + s * .2], [x - s * .2, y + s]], sobreFundo(p), { prof: 0, liso: true }));
  });
  const nuvens = semear(n, semente).map(q => ({ q, f: fr(tt * .45 + q.i / n) })).sort((a, b) => b.f - a.f);
  for (const { q, f } of nuvens) {
    const lado = q.i % 2 ? 1 : -1, r = w * (.05 + .09 * E.sai(f)) * (.8 + .4 * q.v), x = lado * w * (.03 + .34 * E.sai(f) * (.7 + .3 * q.w)), y = -r * .7 - w * .1 * f * q.u;
    p.alfa(.8 * Math.min(1, f / .08) * (1 - Math.pow(f, 1.3)), () => p.forma(bolotaP(x, y, r, r * .8, q.i + 40, tt), f < .4 ? c : clara, { prof: f < .4 ? 1 : 0, semente: 60 + q.i }));
  }
}
/** Confete e serpentinas caindo e girando no ar, em todas as cores da paleta. Opções: larg, n, semente, t. Chaves: confete, festa, comemoração, parabéns, vitória, aniversário, conquista, celebrar */
export function confete(p, { larg = 320, n = 18, semente = 6, t = 0 } = {}) {
  const w = larg, h = w * 1.1, tt = p.ritmo(t), cores = ["c1", "c2", "c3", "c4"], borda = f => clamp((.5 - Math.abs(f - .5)) / .1);
  for (let i = 0; i < 3; i++) {
    const f = fr(i / 3 + tt * .14), y0 = (f - .5) * h, x0 = (i - 1) * w * .32 + w * .05, pts = Array.from({ length: 8 }, (_, j) => [x0 + Math.sin(j * 1.3 + tt * 3 + i) * w * .045, y0 - w * .15 + j * w * .045]);
    sumir(p, borda(f), () => p.linha(pts, cores[(i + 1) % 4], grosso(p, w * .026)));
  }
  semear(n, semente).forEach(q => {
    const f = fr(q.v + tt * (.16 + .12 * q.w)), x = (q.u - .5) * w + Math.sin(tt * 2 + q.q * 6) * w * .05, y = (f - .5) * h, c = cores[q.i % 4], giro = Math.cos(tt * (4 + 3 * q.q) + q.u * 9);
    const redondo = q.q < .25, sy = redondo ? 1 : (Math.abs(giro) < .2 ? .2 * Math.sign(giro || 1) : giro);
    sumir(p, borda(f), () => p.em({ x, y, r: tt * (1 + 2 * q.q) * (q.i % 2 ? 1 : -1) + q.u * 6, sy }, () => {
      if (redondo) p.circulo(0, 0, w * .036, c, { prof: 0, liso: true });
      else p.retangulo(-w * .032, -w * .05, w * .064, w * .1, c, { prof: 1, liso: true });
    }));
  });
}
/** Bolhas de sabão subindo e balançando, com reflexo, que estouram no alto. Opções: larg, cor, n, semente, t. Chaves: bolha, sabão, limpeza, espuma, mergulho, ar, leveza, bolha financeira */
export function bolhas(p, { larg = 260, cor = null, n = 8, semente = 7, t = 0 } = {}) {
  const w = larg, h = w * 1.4, tt = p.ritmo(t), c = cor || corDeAgua(p);
  semear(n, semente).forEach(q => {
    const f = fr(tt * .26 * (.8 + .4 * q.v) + q.i / n), r = w * (.06 + .07 * q.q) * (.5 + .5 * Math.min(1, f * 5));
    const x = (q.w - .5) * w * .7 * Math.min(1, .3 + f * 2) + Math.sin(tt * 2.6 + q.u * 6) * w * .05, y = -f * h + w * .04, e = grosso(p, Math.max(w * .024, r * .14));
    if (f > .88) { const k = (f - .88) / .12; sumir(p, 1 - k, () => p.linha(circP(x, y, r * (1 + k * .7), 18), c, e, { fechar: true, tracejado: [r * .5, r * .45] })); return; }
    if (p.estilo !== "pixel") p.alfa(.3, () => p.circulo(x, y, r, c, { prof: 0, liso: true }));
    p.linha(circP(x, y, r, 20), c, e, { fechar: true });
    p.circulo(x - r * .36, y - r * .36, r * .26, "#FFFFFF", { prof: 0, liso: true });
  });
}
/** Onda de choque: anéis que se abrem da origem com traços de impacto e clarão. Opções: larg, cor, k (0..1 progresso do disparo; sem k repete), semente, t. Chaves: impacto, onda de choque, pancada, choque, repercussão, efeito, alcance, propagação */
export function ondaDeChoque(p, { larg = 360, cor = "c2", k = null, semente = 8, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = k == null ? ciclo(tt, 1.1, .2) : clamp(k), cores = [cor, luz(p), cor];
  for (let j = 2; j >= 0; j--) {
    const kj = clamp((kk - j * .12) / .72), R = w * .5 * E.sai(kj), a = j === 0 ? Math.max(.35, 1 - kj * kj) : 1 - kj;
    if (kj <= 0 || R < 3) continue;
    sumir(p, a, () => p.linha(circP(0, 0, R * (1 + .015 * Math.sin(tt * 6 + j)), 40), cores[j], grosso(p, w * (.014 + .05 * (1 - kj))), { fechar: true }));
  }
  const k0 = clamp(kk / .72), R0 = w * .5 * E.sai(k0);
  if (k0 > .05 && k0 < 1) sumir(p, 1 - k0, () => { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + semente; p.linha([[Math.cos(a) * R0 * .68, Math.sin(a) * R0 * .68], [Math.cos(a) * R0 * .9, Math.sin(a) * R0 * .9]], sobreFundo(p), grosso(p, w * .022)); } });
  const kf = clamp(kk / .3), rf = w * .16 * Math.sin(kf * Math.PI);
  if (kf < 1 && rf > 2) p.forma(cintilaP(0, 0, rf * 1.4, .4, tt * 2), luz(p), { prof: 0, liso: true });
}
/** Linhas de velocidade passando em disparada para a esquerda: o objeto corre para a direita. Opções: larg, cor, n, semente, t. Chaves: velocidade, rápido, pressa, correr, agilidade, urgente, acelerar, movimento */
export function linhasDeVelocidade(p, { larg = 380, cor = "c1", n = 9, semente = 9, t = 0 } = {}) {
  const w = larg, h = w * .5, tt = p.ritmo(t), cores = [cor, sobreFundo(p), "c4"];
  semear(n, semente).forEach(q => {
    const yn = n > 1 ? q.i / (n - 1) - .5 : 0, y = yn * h + (q.u - .5) * h * .08, L = w * (.25 + .3 * q.v) * (1 - Math.abs(yn) * .9), f = fr(tt * 1.4 * (.7 + .6 * q.w) + q.u);
    const x = w * .5 - f * (w + L), x0 = Math.max(x, -w / 2), x1 = Math.min(x + L, w / 2);
    if (x1 - x0 < w * .03) return;
    sumir(p, Math.pow(Math.sin(Math.PI * f), .5), () => p.capsula([x0, y], [x1, y], grosso(p, w * (.018 + .022 * (1 - 2 * Math.abs(yn)))), cores[q.i % 3]));
  });
}
/** Raios de luz em leque girando devagar em volta de um núcleo que pulsa. Opções: larg, cor, n, t. Chaves: raios de luz, iluminação, revelação, glória, destaque, esperança, novidade, sol nascendo */
export function raiosDeLuz(p, { larg = 380, cor = null, n = 12, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || luz(p), rot = tt * .25, d = TAU / n * .27, s = 1 + .06 * Math.sin(tt * 4);
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, r0 = w * .18, r1 = w * .5 * (i % 2 ? .74 : 1) * (1 + .05 * Math.sin(tt * 3 + i * 1.7));
    p.alfa(i % 2 ? .6 : .9, () => p.forma([[Math.cos(a - d * .35) * r0, Math.sin(a - d * .35) * r0], [Math.cos(a - d) * r1, Math.sin(a - d) * r1], [Math.cos(a + d) * r1, Math.sin(a + d) * r1], [Math.cos(a + d * .35) * r0, Math.sin(a + d * .35) * r0]], c, { prof: 0, liso: true }));
  }
  sumir(p, .5 + .3 * Math.sin(tt * 4), () => p.linha(circP(0, 0, w * .16 * s, 30), c, grosso(p, w * .02), { fechar: true }));
  p.circulo(0, 0, w * .12 * s, c, { prof: 2 });
}
/** Fogos de artifício: o rojão sobe até a origem e abre em flores de faíscas que caem piscando. Opções: larg, cor, cor2, n, k (0..1 progresso do disparo; sem k repete), semente, t. Chaves: fogos de artifício, réveillon, festa, comemoração, ano novo, sucesso, lançamento, celebrar */
export function fogosDeArtificio(p, { larg = 380, cor = "c2", cor2 = "c3", n = 14, k = null, semente = 10, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = k == null ? ciclo(tt, 2, .4) : clamp(k), sf = sobreFundo(p), e = grosso(p, w * .02);
  if (kk < .22) {
    const s = E.sai(kk / .22), y = w * .46 * (1 - s);
    p.linha([[0, y], [Math.sin(tt * 20) * w * .01, y + w * .12 * (1 - s * .5)]], cor, e);
    p.circulo(0, y, w * .03, luz(p), { prof: 0, liso: true });
  }
  const flor = (cx, cy, kb, alcance, m, c, ponta, rot) => {
    if (kb <= 0) return;
    const D = alcance * E.sai(Math.min(1, kb * 1.4)), cai = w * .14 * kb * kb, a = kb < .7 ? 1 : 1 - (kb - .7) / .3 * .5;
    sumir(p, a, () => { for (let i = 0; i < m; i++) {
      const an = i / m * TAU + rot, x = cx + Math.cos(an) * D, y = cy + Math.sin(an) * D + cai, q = .5 + .38 * kb;
      p.linha([[cx + Math.cos(an) * D * q, cy + Math.sin(an) * D * q + cai * .7], [x, y]], c, e);
      if (ponta) sumir(p, kb > .55 ? .5 + .5 * Math.sin(tt * 22 + i * 2) : 1, () => p.circulo(x, y, w * .026, i % 2 ? c : ponta, { prof: 0, liso: true }));
    } });
  };
  const kb = clamp((kk - .2) / .8);
  flor(-w * .25, -w * .19, clamp((kk - .38) / .62), w * .17, 8, cor2, null, .2);
  flor(0, 0, kb, w * .42, n, cor, sf, semente);
  if (kb > 0) { const D = w * .22 * E.sai(Math.min(1, kb * 1.4)); sumir(p, 1 - kb * .6, () => { for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + .4; p.circulo(Math.cos(an) * D, Math.sin(an) * D + w * .1 * kb * kb, w * .024, cor2, { prof: 0, liso: true }); } }); }
}
/** Fios de vapor subindo em ondas e se desfazendo no alto. Opções: larg, cor (padrão: cinza do estilo), n (fios), semente, t. Chaves: vapor, quente, café, calor, cozinhar, banho, chá, cheiro */
export function vapor(p, { larg = 200, cor = null, n = 3, semente = 11, t = 0 } = {}) {
  const w = larg, alt = w * 1.6, tt = p.ritmo(t), forte = p.estilo === "papel" || p.estilo === "vidro", g = rng(semente);
  const c = cor || (p.estilo === "vidro" ? "tinta" : cinza(p, p.estilo === "papel" ? .74 : p.estilo === "flat" ? .45 : p.estilo === "traco" ? .8 : .62));
  for (let i = 0; i < n; i++) {
    const x0 = (n > 1 ? i / (n - 1) - .5 : 0) * w * .5, fase = g() * 6, vis = forte ? .88 + .12 * Math.sin(tt * 1.4 + fase) : .6 + .4 * Math.sin(tt * 1.4 + fase), topo = alt * (.82 + .18 * Math.sin(tt * 1.1 + fase));
    const meio = s => [x0 + Math.sin(s * 7 - tt * 3.2 + fase) * w * .1 * (.35 + s), -s * topo - w * .03], esp = s => w * (forte ? .072 : .055) * Math.sin(Math.PI * Math.min(1, s * 1.1 + .06));
    const esq = [], dir = [];
    for (let j = 0; j <= 16; j++) { const s = j / 16, [x, y] = meio(s), e = esp(s); esq.push([x - e, y]); dir.push([x + e, y]); }
    if (p.estilo === "pixel") { const m = Array.from({ length: 13 }, (_, j) => meio(j / 12 * .92 + .02)); p.linha(m, c, 14); }
    else sumir(p, vis, () => p.forma([...esq, ...dir.reverse()], c, { prof: 0, semente: 20 + i }));
  }
}
/** Respingo: coroa de líquido, gotas voando em arco e poça que se espalha. Opções: larg, cor, n (gotas), k (0..1 progresso do disparo; sem k repete), semente, t. Chaves: respingo, água, líquido, derramar, splash, mergulho, gota, molhar */
export function respingo(p, { larg = 320, cor = null, n = 12, k = null, semente = 12, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = k == null ? ciclo(tt, 1.3, .3) : clamp(k), c = cor || corDeAgua(p);
  const rx = w * (.14 + .22 * E.sai(clamp(kk * 1.3)));
  p.elipse(0, 0, rx, rx * .2, c, { prof: 0, semente: 3 });
  if (kk > .6) { const f = fr(tt * .8); sumir(p, (1 - f) * clamp((kk - .6) / .2), () => p.linha(circP(0, 0, rx * (.4 + .55 * f), 28, rx * .2 * (.4 + .55 * f)), "tinta", grosso(p, w * .014), { fechar: true })); }
  const kc = clamp(kk / .6), hc = w * .26 * Math.sin(Math.PI * kc), cw = w * (.08 + .1 * E.sai(kc));
  if (hc > 4) {
    const g = rng(semente), pts = [[-cw, 0]];
    for (let i = 0; i <= 12; i++) { const s = i / 12; pts.push([lerp(-cw * 1.4, cw * 1.4, s), -(i % 2 === 0 ? hc * (.75 + .25 * g()) : hc * .42)]); }
    pts.push([cw, 0]);
    sumir(p, 1 - clamp((kc - .7) / .3), () => p.forma(pts, c, { prof: 1, semente: 7 }));
  }
  const kj = clamp((kk - .3) / .45), hj = w * .34 * Math.sin(Math.PI * kj);
  if (hj > 6) { p.capsula([0, -w * .02], [0, -hj], w * .06, c); if (kj > .3) p.circulo(0, -hj - w * .07, w * .035, c, { prof: 0, liso: true }); }
  if (kk > 0) semear(n, semente + 1).forEach(q => {
    const a = -Math.PI / 2 + (q.u - .5) * 2.2, v = w * (.75 + .5 * q.v), f = kk * 1.6, x = Math.cos(a) * v * f * .55, y = Math.sin(a) * v * f + w * .8 * f * f - w * .02;
    if (y > -3) return;
    const vx = Math.cos(a) * v * .55, vy = Math.sin(a) * v + w * 1.6 * f;
    p.em({ x, y, r: Math.atan2(-vx, vy) }, () => p.forma(gotaP(w * (.024 + .012 * q.w)), c, { prof: 0, liso: true }));
  });
}
/** Neblina: faixas de névoa em camadas deslizando para lados opostos. Opções: larg, cor (padrão: cinza do estilo), n, semente, t. Chaves: neblina, névoa, nevoeiro, mistério, incerteza, confusão, frio, manhã */
export function neblina(p, { larg = 420, cor = null, n = 7, semente = 13, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), perto = cor || cinza(p, .34), longe = cor || cinza(p, .2);
  const faixas = semear(n, semente).sort((a, b) => (b.i % 2) - (a.i % 2));
  for (const q of faixas) {
    const y = ((n > 1 ? q.i / (n - 1) : .5) - .5) * w * .42, rx = w * (.2 + .1 * q.u), x = (q.w - .5) * w * .45 + Math.sin(tt * .5 * (.6 + q.q) * (q.i % 2 ? 1 : -1) + q.u * 6) * w * .1;
    p.alfa(.75, () => p.forma(bolotaP(x, y, rx, rx * .24, q.i + 70, tt * .6), q.i % 2 ? longe : perto, { prof: 0, semente: 80 + q.i }));
  }
  for (let i = 0; i < 3; i++) { const y = (i - 1) * w * .15 + w * .06, d = Math.sin(tt * .6 + i * 2) * w * .1; p.alfa(.85, () => p.capsula([-w * .32 + d + i * w * .08, y], [w * .12 + d + i * w * .08, y], grosso(p, w * .035), perto)); }
}
/** Estouro de quadrinhos: estrela de impacto que salta com mola, com onomatopeia e traços de ação. Opções: larg, cor, cor2, texto, k (0..1 progresso do disparo; sem k repete), semente, t. Chaves: estouro, pow, impacto, quadrinhos, surpresa, bomba, novidade, revelação */
export function estouro(p, { larg = 320, cor = "c2", cor2 = "c1", texto = "POW!", k = null, semente = 14, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = k == null ? ciclo(tt, .45, 1.2) : clamp(k), s = mola(kk, { freq: 1.8, amort: 5 }) * (1 + .03 * Math.sin(tt * 7));
  if (s <= .02) return;
  p.em({ x: 0, y: 0, s, r: Math.sin(tt * 2) * .05 - (1 - kk) * .4 }, () => {
    p.forma(irregularP(w * .5, w * .31, 11, semente), cor2, { prof: 2, semente: 4 });
    p.forma(irregularP(w * .38, w * .25, 11, semente + 3, .14), cor, { prof: 0, semente: 5 });
    if (texto) p.em({ x: 0, y: 0, r: -.12 }, () => p.texto(texto, 0, w * .01, { tam: w * .15, cor: "tinta", peso: 900 }));
  });
  if (kk > .3) for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + .2, f = fr(tt * 1.5 + i * .37), r0 = w * (.55 + .08 * f), r1 = r0 + w * .09 * (1 - f * .5);
    sumir(p, 1 - f, () => p.linha([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], sobreFundo(p), grosso(p, w * .025)));
  }
}
/** Corações subindo da origem, balançando e sumindo no alto. Opções: larg, cor, cor2, n, semente, t. Chaves: corações, amor, paixão, curtidas, carinho, namoro, encantado, gratidão */
export function coracoesSubindo(p, { larg = 260, cor = "c1", cor2 = "c2", n = 6, semente = 15, t = 0 } = {}) {
  const w = larg, h = w * 1.3, tt = p.ritmo(t);
  semear(n, semente).forEach(q => {
    const f = fr(tt * .3 + q.i / n + q.u * .05), x = (q.w - .5) * w * .6 * E.sai(Math.min(1, f * 2)) + Math.sin(tt * 2.2 + q.u * 6) * w * .07 * f, y = -f * h - w * .08, s = w * (.18 + .12 * q.q) * Math.min(1, f * 6);
    if (s < 3) return;
    sumir(p, 1 - clamp((f - .65) / .35), () => p.em({ x, y, r: Math.sin(tt * 2.6 + q.i) * .25 }, () => p.forma(coracaoP(0, 0, s), q.i % 2 ? cor2 : cor, { prof: 1, liso: true })));
  });
}
/** Letras Z subindo em diagonal, crescendo e sumindo: alguém dormindo. Opções: larg, cor, n, t. Chaves: dormir, sono, cansaço, tédio, descanso, preguiça, noite, insônia */
export function zzz(p, { larg = 240, cor = "c3", n = 3, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  for (let i = 0; i < n; i++) {
    const f = fr(tt * .38 + i / n), s = w * (.2 + .2 * f), x = w * .5 * f + Math.sin(f * 7 + tt) * w * .04, y = -w * .95 * f - s * .5;
    sumir(p, Math.min(1, f / .12) * (1 - clamp((f - .7) / .3)), () => p.em({ x, y, r: -.25 + Math.sin(tt * 2 + i) * .15 }, () => p.forma(zP(s), cor, { prof: 1, liso: true })));
  }
}
/** Gotas de suor: rosto nervoso (a origem) com gotas grandes escorrendo nas têmporas, gotinhas espirrando e tracinhos de tensão saindo da cabeça. Opções: larg, cor, n, cabeca (false = só as gotas, para pôr sobre um personagem), semente, t. Chaves: suor, nervoso, calor, esforço, ansiedade, cansaço, pressão, prazo */
export function gotasDeSuor(p, { larg = 260, cor = null, n = 3, cabeca = true, semente = 16, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = p.estilo === "pixel", c = cor || corDeAgua(p), R = w * .3, sf = sobreFundo(p), treme = Math.sin(tt * 40) * w * .006;
  const gota = r => { p.forma(gotaP(r), c, { prof: 1, liso: true }); p.elipse(-r * .36, -r * .02, r * (px ? .26 : .2), r * .38, "#FFFFFF", { prof: 0, liso: true }); };
  if (cabeca) p.em({ x: treme, y: 0 }, () => {
    p.circulo(0, 0, R, "pele0", { prof: 1, semente: 3 });
    const e = grosso(p, w * .024);
    for (const s of [-1, 1]) {
      p.linha([[s * R * .6, -R * .2], [s * R * .16, -R * .38]], "tinta", e);
      p.elipse(s * R * .36, R * .04, R * .09, R * .13, "tinta", { prof: 0, liso: true });
    }
    p.linha([[-R * .34, R * .52], [-R * .17, R * .42], [0, R * .52], [R * .17, R * .42], [R * .34, R * .52]], "tinta", e);
  });
  for (let i = 0; i < 3; i++) {
    const a = (-90 + (i - 1) * 32) * Math.PI / 180, b = Math.max(0, Math.sin(tt * 6 + i * 1.3)), r0 = R * 1.14, r1 = R * (1.4 + .1 * b);
    sumir(p, px ? 1 : .35 + .65 * b, () => p.linha([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], sf, grosso(p, w * .026)));
  }
  semear(n, semente).forEach(q => {
    const lado = q.i % 2 ? 1 : -1, a0 = -Math.PI / 2 + lado * (.75 + .3 * q.u), f = fr(tt * .8 + q.i / n), vx = Math.cos(a0) * w * .4, vy = Math.sin(a0) * w * .3, g = w * .9;
    const x = Math.cos(a0) * R * 1.05 + vx * f, y = Math.sin(a0) * R * 1.05 + vy * f + g * f * f * .5, r = w * (px ? .05 : .04) * (.8 + .4 * q.v) * Math.min(1, f * 6);
    if (r < 2) return;
    sumir(p, 1 - clamp((f - .6) / .4), () => p.em({ x, y, r: clamp(vx / w, -.4, .4) * .6 * (1 - f) }, () => gota(r)));
  });
  for (const lado of [1, -1]) {
    const f = fr(tt * .35 + (lado > 0 ? 0 : .5)), a = (-40 + 60 * f) * Math.PI / 180, ang = lado > 0 ? a : Math.PI - a;
    sumir(p, 1 - clamp((f - .78) / .22), () => p.em({ x: Math.cos(ang) * R * .98 + treme, y: Math.sin(ang) * R * .98, s: Math.min(1, f * 7), r: lado * .18 }, () => gota(w * (lado > 0 ? .085 : .065))));
  }
}
/** Pegadas de pés descalços (planta com arco e dedos), esquerdo e direito em zigue-zague, surgindo uma a uma ao longo do caminho e se apagando atrás. Opções: larg, cor, n, t. Chaves: pegadas, caminho, passos, rastro, jornada, seguir, trajetória, investigação */
export function pegadas(p, { larg = 380, cor = null, n = 5, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = p.estilo === "pixel", c = cor || (px ? "c1" : sobreFundo(p)), cab = tt * 2, L = w * .3, fw = L * .42, afasta = w * .09;
  // o caminho sobe reto: pé de pé, sem girar, fica limpo também no pixel
  const a0 = [0, w * .46], a1 = [0, -w * .46], ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  // pé esquerdo, dedos para cima (-y) e dedão do lado de dentro (+x); o direito é o mesmo espelhado
  const sola = [[-fw * .38, L * .3], [-fw * .42, L * .1], [-fw * .47, -L * .06], ...arcoP(fw * .02, -L * .12, fw * .48, 180, 340, 10), [fw * .47, -L * .03], [fw * .26, L * .07], [fw * .06, L * .16], [fw * .16, L * .27], ...arcoP(0, L * .33, fw * .37, -10, 180, 8)];
  const dedos = px ? [[.44, -.45, .22], [-.04, -.52, .17], [-.46, -.48, .16], [-.8, -.35, .15]] : [[.42, -.46, .22], [.04, -.52, .15], [-.26, -.5, .14], [-.5, -.44, .13], [-.66, -.35, .11]];
  for (let i = 0; i < n; i++) {
    const idade = fr((cab - i) / n) * n, s = n > 1 ? i / (n - 1) : .5, lado = i % 2 ? 1 : -1, x = lerp(a0[0], a1[0], s) + nx * lado * afasta, y = lerp(a0[1], a1[1], s) + ny * lado * afasta;
    sumir(p, 1 - clamp((idade - n * .45) / (n * .5)), () => p.em({ x, y, r: ang + Math.PI / 2, s: .8 + .2 * Math.min(1, idade * 4), sx: -lado }, () => {
      p.forma(sola, c, { prof: 0, semente: 40 + i });
      for (const [dx, dy, r] of dedos) p.circulo(dx * fw, dy * L, r * fw, c, { prof: 0, liso: true });
    }));
  }
}
/** Magia: estrelinhas subindo em espiral por um rastro tracejado, saindo de um brilho na origem. Opções: larg, cor, cor2, n, semente, t. Chaves: magia, mágica, encanto, fantasia, transformação, feitiço, surpresa, sonho */
export function magia(p, { larg = 280, cor = "c4", cor2 = "c2", n = 12, semente = 17, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fase = tt * 2.4, hel = f => { const th = f * TAU * 1.6 + fase, rr = w * (.06 + .3 * f); return [Math.cos(th) * rr, -f * w * .85, Math.sin(th)]; };
  if (p.estilo === "pixel") {
    // no pixel: rastro de pontos espaçados, poucas estrelas grandes e a maior na ponta do rastro
    const hp = f => { const th = f * TAU * .9 + tt * 1.6, rr = w * (.08 + .22 * f); return [Math.cos(th) * rr, -f * w * .85, Math.sin(th)]; };
    for (let j = 1; j < 12; j++) { const f = fr(j / 12 - tt * .25), [x, y] = hp(f * .9); p.circulo(x, y, w * .022, j % 2 ? cor : "claro", { prof: 0, liso: true }); }
    for (let i = 0; i < 3; i++) {
      const f = fr(tt * .3 + i / 3) * .82, [x, y] = hp(f), R = w * (.085 + .03 * (1 - f));
      sumir(p, Math.min(1, f / .06), () => p.forma(cintilaP(x, y, R, .3, 0), i % 2 ? cor : cor2, { prof: 0, liso: true }));
    }
    const [xt, yt] = hp(.92), st = 1 + .15 * Math.sin(tt * 6);
    p.forma(cintilaP(xt, yt, w * .15 * st, .3, 0), cor2, { prof: 0, liso: true });
    p.forma(cintilaP(xt, yt, w * .07 * st, .3, 0), "claro", { prof: 0, liso: true });
    p.forma(cintilaP(0, 0, w * .1 * st, .3, 0), cor, { prof: 0, liso: true });
    return;
  }
  sumir(p, .6, () => p.linha(Array.from({ length: 32 }, (_, j) => hel(j / 31).slice(0, 2)), cor, grosso(p, w * .02), { tracejado: [w * .05, w * .035], desloc: tt * w * .3 }));
  semear(n, semente).forEach(q => {
    const f = fr(tt * .3 + q.i / n), [x, y, z] = hel(f), prof = .75 + .25 * z, a = Math.min(1, f / .08) * (1 - clamp((f - .7) / .3)) * (z < 0 ? .7 : 1);
    sumir(p, a, () => {
      if (q.i % 3 === 2) p.circulo(x, y, w * .032 * prof, sobreFundo(p), { prof: 0, liso: true });
      else p.forma(cintilaP(x, y, w * (.07 + .04 * (1 - f)) * prof, .32, tt * 2 + q.u * 3), q.i % 3 ? cor2 : cor, { prof: 0, liso: true });
    });
  });
  const s = .85 + .25 * Math.sin(tt * 6);
  p.forma(cintilaP(0, 0, w * .12 * s, .26, tt), cor2, { prof: 1, liso: true });
}
/** Portal: vórtice oval com a borda em chamas girando, braços em espiral e partículas sendo sugadas. Opções: larg, cor, cor2, n, semente, t. Chaves: portal, vórtice, passagem, teletransporte, outro mundo, buraco negro, transição, viagem */
export function portal(p, { larg = 260, cor = "c3", cor2 = "c4", n = 8, semente = 18, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rx = w * .5, ry = w * .66;
  const aro = (sc, fase, amp) => Array.from({ length: 56 }, (_, i) => { const a = i / 56 * TAU, q = sc * (1 + amp * Math.sin(a * 12 + fase) + amp * .4 * Math.sin(a * 19 - fase * 1.3)); return [Math.cos(a) * rx * q, Math.sin(a) * ry * q]; });
  semear(n, semente).forEach(q => {
    const f = fr(tt * .5 + q.i / n), sc = 1.2 - .32 * f, an = q.u * TAU + f * 2.5;
    sumir(p, Math.min(1, f / .1) * (1 - f), () => p.circulo(Math.cos(an) * rx * sc, Math.sin(an) * ry * sc, w * .032, sobreFundo(p), { prof: 0, liso: true }));
  });
  p.em({ x: 0, y: 0, s: 1 + .03 * Math.sin(tt * 3) }, () => {
    p.forma(aro(1, tt * 3, .055), cor, { prof: 2, liso: true });
    p.forma(aro(.8, -tt * 4, .025), cor2, { prof: 0, liso: true });
    for (let b = 0; b < 4; b++) p.linha(Array.from({ length: 15 }, (_, j) => { const s = j / 14, sc = .74 * (1 - s * .8), an = b / 4 * TAU + s * 4 + tt * 2.2; return [Math.cos(an) * rx * sc, Math.sin(an) * ry * sc]; }), b % 2 ? cor : "c1", grosso(p, w * .04));
    const sc = .17 + .03 * Math.sin(tt * 5); p.elipse(0, 0, rx * sc, ry * sc, "tinta", { prof: 0, liso: true });
  });
}
/** Aura de energia: silhueta de uma pessoa (busto) envolta por camadas de brilho em chamas que seguem o contorno do corpo, pulsando e se expandindo, com faíscas subindo. Opções: larg, cor, n (ondas), semente, t. Chaves: aura, energia, poder, carisma, espiritual, concentração, força interior, presença */
export function aura(p, { larg = 280, cor = "c4", n = 3, semente = 19, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = p.estilo === "pixel", fig = p.estilo === "traco" ? "tinta" : p.estilo === "vidro" ? "claro" : "tinta";
  // contorno do busto afastado `d`, com línguas de chama para fora onde a borda olha para cima
  const chama = (d, amp, fase) => { const b = bustoP(w, d), m = b.length; return b.map(([x, y], i) => {
    const [ax, ay] = b[(i - 1 + m) % m], [bx, by] = b[(i + 1) % m], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L, up = Math.max(0, -ny) * (y < w * .38 ? 1 : 0);
    const o = amp * up * up * Math.pow(.5 + .5 * Math.sin(x / w * 40 - fase), 2); return [x + nx * o, y + ny * o];
  }); };
  for (let l = 0; l < n; l++) { const f = fr(tt * .45 + l / n); sumir(p, (1 - f) * .85, () => p.linha(chama(w * (.1 + .12 * f), w * .1, tt * 4 + l * 2), cor, grosso(p, w * .026 * (1 - f * .4)), { fechar: true })); }
  if (px) {
    p.forma(chama(w * .085, w * .1, tt * 5), cor, { prof: 0, liso: true });
    p.forma(chama(w * .04, w * .05, -tt * 5), "c2", { prof: 0, liso: true });
  } else {
    p.alfa(.38, () => p.forma(chama(w * .09, w * .11, tt * 5), cor, { prof: 0, semente: 9 }));
    p.alfa(.55, () => p.forma(chama(w * .045, w * .05, -tt * 4), cor, { prof: 0, semente: 8 }));
    p.linha(chama(w * .09, w * .11, tt * 5), cor, grosso(p, w * .026), { fechar: true });
  }
  p.forma(bustoP(w, 0), fig, { prof: 1, semente: 7 });
  semear(6, semente).forEach(q => {
    const f = fr(tt * .55 + q.u), lado = q.i % 2 ? 1 : -1;
    sumir(p, Math.sin(Math.PI * f), () => p.forma(cintilaP(lado * w * (.36 + .06 * q.v) * (1 - f * .4), w * (.36 - .85 * f), w * (px ? .07 : .055), .32), q.i % 3 ? cor : sobreFundo(p), { prof: 0, liso: true }));
  });
}
/** Relâmpago: descarga em zigue-zague com galhos que pisca e muda de forma a cada raio. Opções: alt, cor, semente, t. Chaves: relâmpago, tempestade, trovão, choque, energia, ideia súbita, perigo, eletricidade */
export function relampago(p, { alt = 380, cor = "c2", semente = 20, t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), vez = Math.floor(tt * 1.1), f = fr(tt * 1.1), g = rng(semente * 131 + vez * 7919);
  const aceso = f < .1 || (f > .15 && f < .55) || (f > .6 && f < .66), a = aceso ? 1 : .8 - .3 * f;
  const m = 8, pts = [[0, -h / 2]];
  for (let j = 1; j <= m; j++) pts.push([clamp(pts[j - 1][0] + (g() - .5) * h * .18, -h * .17, h * .17), -h / 2 + j / m * h]);
  const deriva = pts[m][0]; pts.forEach((q, j) => { q[0] -= deriva * j / m; });
  const galhos = [0, 1].map(b => { const j = 2 + Math.floor(g() * 3) + b * 2, lado = b ? 1 : -1, q = [pts[j].slice()]; for (let i = 1; i <= 3; i++) q.push([q[i - 1][0] + lado * h * (.05 + g() * .06), q[i - 1][1] + h * (.05 + g() * .05)]); return q; });
  sumir(p, a, () => {
    if (aceso && p.estilo !== "pixel") p.alfa(.35, () => p.linha(pts, cor, h * .09));
    for (const q of galhos) p.linha(q, cor, grosso(p, h * .026));
    p.linha(pts, cor, grosso(p, h * .045));
    if (p.estilo !== "pixel") p.linha(pts, nucleo(p), h * .014);
    if (aceso) p.forma(cintilaP(0, h / 2, h * .11 * (1 + .2 * Math.sin(tt * 30)), .3), luz(p), { prof: 0, liso: true });
  });
}
/** Brasas incandescentes subindo da origem com brilho quente, piscando e apagando no ar: muitas embaixo, poucas no alto. Opções: larg, cor, n, semente, t. Chaves: brasa, fogueira, calor, cinzas, acampamento, paixão, resto, inferno */
export function brasas(p, { larg = 240, cor = null, n = 18, semente = 21, t = 0 } = {}) {
  const w = larg, h = w * 1.4, tt = p.ritmo(t), px = p.estilo === "pixel", [vermelho, laranja, miolo] = brasaCores(p), fora = cor || vermelho;
  const ponto = (x, y, d, c) => p.linha([[x, y], [x + .01, y]], c, d);
  semear(n, semente).forEach(q => {
    const vida = .35 + .65 * q.q, f = fr(tt * .4 * (.7 + .6 * q.v) + q.u) * vida, fl = f / vida;
    const x = (q.w - .5) * w * .6 * (1 - .4 * f) + ruido(tt * .9 + q.i * 7, semente) * w * .22 * f, y = -f * h, r = w * (.03 + .025 * q.v) * (1 - .5 * fl);
    const b = .5 + .5 * Math.sin(tt * (9 + q.w * 7) + q.i * 2.3), a = Math.min(1, fl / .08) * (1 - Math.pow(fl, 3)), c = b > .5 ? laranja : fora;
    if (px) { const s = Math.max(r, 9); sumir(p, a, () => { p.em({ x, y, r: Math.PI / 4 }, () => p.retangulo(-s * .75, -s * .75, s * 1.5, s * 1.5, c, { prof: 0, liso: true })); if (b > .7) p.retangulo(x - 4, y - 4, 8, 8, miolo, { prof: 0, liso: true }); }); return; }
    if (miolo) p.alfa(a * (.1 + .16 * b), () => ponto(x, y, r * 3.6, laranja));
    p.alfa(a, () => {
      ponto(x, y, r * (miolo ? 2 : 2.6) * (.8 + .25 * b), c);
      if (miolo && b > .45) ponto(x, y, r * .9 * b, miolo);
    });
  });
}
/** Holofote: refletor no suporte varrendo a cena com um cone de luz e a poça iluminada no chão. Opções: larg, cor (da luz), cor2 (do refletor), t. Chaves: holofote, palco, destaque, show, atenção, estrela, apresentação, foco */
export function holofote(p, { larg = 300, cor = null, cor2 = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || luz(p), ang = Math.sin(tt * .9) * .32, L = w * 1.1, b = w * .27, sf = sobreFundo(p);
  p.alfa(.55, () => p.elipse(-Math.sin(ang) * L, Math.cos(ang) * L, b / Math.cos(ang) * 1.05, w * .07, c, { prof: 0, semente: 4 }));
  p.em({ x: 0, y: 0, r: ang }, () => {
    p.alfa(.38, () => p.forma([[-w * .075, w * .06], [w * .075, w * .06], [b, L], [-b, L]], c, { prof: 0, liso: true }));
    p.alfa(.35, () => p.forma([[-w * .045, w * .06], [w * .045, w * .06], [b * .5, L], [-b * .5, L]], c, { prof: 0, liso: true }));
    semear(5, 3).forEach(q => { const f = fr(tt * .15 + q.u), yy = w * .2 + f * (L - w * .3), meia = lerp(w * .07, b, yy / L) * .75; sumir(p, Math.sin(Math.PI * f), () => p.circulo((q.v - .5) * 2 * meia, yy, w * .022, c, { prof: 0, liso: true })); });
  });
  p.linha([[-w * .14, 0], [-w * .14, -w * .17], [w * .14, -w * .17], [w * .14, 0]], sf, grosso(p, w * .03));
  p.capsula([0, -w * .17], [0, -w * .27], w * .045, sf);
  p.em({ x: 0, y: 0, r: ang }, () => {
    p.forma([[-w * .11, -w * .13], [w * .11, -w * .13], [w * .09, w * .06], [-w * .09, w * .06]], cor2, { prof: 2 });
    p.elipse(0, w * .065, w * .095, w * .03, c, { prof: 0, liso: true });
  });
  for (const x of [-w * .14, w * .14]) p.circulo(x, 0, w * .025, sf, { prof: 0, liso: true });
}
/** Vibração: celular (a origem) tremendo com arcos de tremor em pares simétricos dos dois lados e marcas de batida embaixo. Opções: larg, cor, objeto (false = só os arcos, para pôr em volta de outro objeto), t. Chaves: vibrar, tremer, celular tocando, notificação, nervoso, chamada, alarme, terremoto */
export function vibracao(p, { larg = 320, cor = "c1", objeto = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), px = p.estilo === "pixel", sf = sobreFundo(p), cores = [cor, cor, sf], dx = Math.sin(tt * 45) * w * .012;
  if (objeto) p.em({ x: dx, y: 0, r: Math.sin(tt * 38) * .07 }, () => {
    const pw = w * .17, ph = w * .3;
    p.retangulo(-pw / 2, -ph / 2, pw, ph, px ? "claro" : "tinta", { raio: pw * .2, prof: 1, liso: true });
    p.retangulo(-pw * .37, -ph * .38, pw * .74, ph * .68, "c3", { raio: pw * .06, prof: 0, liso: true });
    p.circulo(0, ph * .4, pw * .08, px ? "tinta" : "c3", { prof: 0, liso: true });
  });
  p.em({ x: dx, y: 0 }, () => {
    for (let j = 0; j < 3; j++) {
      const b = Math.max(0, Math.sin(tt * 9 - j * 1.1)), R = w * (.2 + .1 * j) + b * w * .02, e = px ? Math.max(14, w * .04) : w * (.036 - .006 * j);
      for (const lado of [-1, 1]) { const c0 = lado > 0 ? 0 : 180; sumir(p, px ? 1 : .3 + .7 * b, () => p.linha(arcoP(0, 0, R, c0 - 32 + j * 4, c0 + 32 - j * 4, 10), cores[j], e)); }
    }
  });
  const pulo = Math.abs(Math.sin(tt * 9)) * w * .015;
  for (const lado of [-1, 1]) for (let i = 0; i < 2; i++) { const x = lado * w * (.07 + i * .08); p.linha([[x, w * .21 + pulo], [x + lado * w * .055, w * .31 + pulo]], sf, grosso(p, w * .026)); }
}
