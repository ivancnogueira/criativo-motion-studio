// Categoria: Transporte
// Kit de movimento — veículos de perfil, com a frente para +x: terra, água e ar, mais a pista e o trilho por onde andam.
// O que roda no chão tem as rodas em y = 0; o que voa ou mergulha fica centrado na origem; barcos trazem a própria
// água (a base da água é y = 0). A convenção das peças está em ./_comum.js.
import { ruido, circP, retP, retArredP, capsulaP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
/** Multiplica uma lista de pontos por w: as peças são escritas em frações da largura. */
const S = (w, pts) => pts.map(([x, y]) => [x * w, y * w]);
/** Preto de pneu e de borracha: no pixel a "tinta" some no fundo escuro, então vira um cinza de borracha. */
const breu = p => p.estilo === "pixel" ? escuro(p, "claro", .6) : "tinta";
/** Papel da paleta (c1..c4) cuja matiz fica mais perto de `alvo` (graus), evitando `evitar`. */
function matizDe(p, alvo, evitar, padrao = "c4") {
  let melhor = padrao, nota = Infinity;
  for (const n of ["c1", "c2", "c3", "c4"]) {
    const h = p.cor(n); if (n === evitar || !/^#[0-9a-f]{6}$/i.test(h)) continue;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d < .08) continue;
    const mat = (mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60, dist = Math.abs(mat - alvo) + (d < .2 ? 60 : 0);
    if (dist < nota) { nota = dist; melhor = n; }
  }
  return melhor;
}
/** Papel da paleta que mais lembra água (matiz perto do azul-piscina), evitando a cor do casco. */
const aguaDe = (p, evitar) => matizDe(p, 200, evitar);
/** Cor de energia (raio, plugue): o papel mais amarelado da paleta, fora a cor do corpo. */
const energiaDe = (p, evitar) => matizDe(p, 48, evitar);
/** Sobe e desce da carroceria: trepida andando, respira parado. */
const balanco = (tt, w, andando) => andando ? Math.sin(tt * 13) * w * .008 : Math.sin(tt * 3) * w * .004;
/** Roda apoiada no chão (y = 0) em x, com calota e `raios` raios saindo do cubo, girando no ângulo a. */
function roda(p, x, r, a, { calota = "claro", raios = 3 } = {}) {
  p.circulo(x, -r, r, breu(p), { prof: 1 });
  p.circulo(x, -r, r * .56, calota, { prof: 0, liso: true });
  for (let i = 0; i < raios; i++) { const b = a + i * TAU / raios; p.linha([[x, -r], [x + Math.cos(b) * r * .52, -r + Math.sin(b) * r * .52]], breu(p), Math.max(4, r * (raios > 3 ? .1 : .15))); }
  p.circulo(x, -r, Math.max(3, r * .15), breu(p), { prof: 0, liso: true });
}
/** Bolas de fumaça que nascem em (x, y), sobem `alt` e derivam para dx. */
function fumaca(p, x, y, tt, { r = 14, n = 3, dx = -.6, alt = 70, vel = .7 } = {}) {
  for (let i = 0; i < n; i++) {
    const f = (tt * vel + i / n) % 1, some = f > .75 ? (1 - f) / .25 : 1;
    // no pixel a transparência vira outra cor da paleta (fumaça laranja parece fogo): lá a fumaça é um cinza chapado
    const px = p.estilo === "pixel", cor = px ? escuro(p, "claro", .35) : sobreFundo(p);
    p.alfa(px ? 1 : .8 - f * .25, () => p.circulo(x + dx * f * alt + ruido(tt * 2 + i, i) * r * .3, y - f * alt, Math.max(.5, r * (.55 + f * .9) * some), cor, { prof: 0, liso: true, semente: i + 1 }));
  }
}
/** Faixa de água com ondas correndo: a crista fica em y e a base em y + alt. */
function ondas(p, w, tt, { cor = "c4", y = 0, alt = 30, larg = 1.12 } = {}) {
  const n = 18, pts = [];
  for (let i = 0; i <= n; i++) pts.push([-w * larg / 2 + w * larg * i / n, y + Math.sin(i * 1.25 + tt * 4) * alt * .2]);
  const crista = pts.slice();
  pts.push([w * larg / 2, y + alt], [-w * larg / 2, y + alt]);
  p.forma(pts, cor, { prof: 0, liso: true });
  if (p.estilo !== "traco") p.alfa(.85, () => p.linha(crista, maisClaro(p, cor, .55), Math.max(4, alt * .14)));
}
/** Riscos de velocidade que escorrem para trás a partir de (x, y). */
function rastro(p, x, y, w, tt, n = 3) {
  for (let i = 0; i < n; i++) { const f = (tt * 1.5 + i * .37) % 1, x1 = x - f * w * .1, yy = y - i * w * .07; p.alfa(1 - f * .4, () => p.linha([[x1 - w * .09 * (1 - f * .5), yy], [x1, yy]], sobreFundo(p), Math.max(5, w * .014))); }
}
/** Barra de sirene sobre o teto: os dois lados alternam e soltam raios. */
function giroflex(p, x, y, l, tt, corA = "c1", corB = "c3") {
  const lado = Math.floor(tt * 5) % 2, h = l * .42, cx = x + (lado ? -l / 4 : l / 4), cy = y - h * .5;
  p.forma(retArredP(x - l / 2, y - h, l / 2, h, h * .3), lado ? corA : escuro(p, corA, .5), { prof: 0, liso: true });
  p.forma(retArredP(x, y - h, l / 2, h, h * .3), lado ? escuro(p, corB, .5) : corB, { prof: 0, liso: true });
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .8; p.linha([[cx + Math.cos(a) * h * 1.1, cy + Math.sin(a) * h * 1.1], [cx + Math.cos(a) * h * 2, cy + Math.sin(a) * h * 2]], lado ? corA : corB, Math.max(5, l * .07)); }
}
/** Sedã de perfil: carroceria, vidros, farol e rodas. `extras` desenha por cima, junto com a carroceria. */
function seda(p, w, cor, tt, andando, extras) {
  p.em({ x: 0, y: balanco(tt, w, andando) }, () => {
    p.forma(S(w, [[-.5, -.1], [-.49, -.25], [-.36, -.29], [-.22, -.44], [.12, -.44], [.28, -.29], [.47, -.25], [.5, -.1]]), cor, { prof: 2 });
    p.forma(S(w, [[-.31, -.3], [-.2, -.405], [-.05, -.405], [-.05, -.3]]), "claro", { prof: 0, liso: true });
    p.forma(S(w, [[-.01, -.3], [-.01, -.405], [.1, -.405], [.21, -.3]]), "claro", { prof: 0, liso: true });
    p.circulo(w * .455, -w * .2, w * .03, "c2", { prof: 0, liso: true });
    if (extras) extras();
  });
  for (const x of [-w * .3, w * .3]) roda(p, x, w * .085, andando ? tt * 9 : 0);
}

/* ---------------------------------------------------------------- terra */
/** Ônibus urbano com rodas girando e carroceria trepidando. Opções: larg, cor, andando, t. Chaves: ônibus, coletivo, transporte público, passageiro, lotação, viagem, excursão, mobilidade */
export function onibus(p, { larg = 420, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = andando ? tt * 9 : 0;
  p.em({ x: 0, y: balanco(tt, w, andando) }, () => {
    p.forma(retArredP(-w * .5, -w * .47, w, w * .4, w * .05), cor, { prof: 2 });
    p.forma(retP(-w * .5, -w * .2, w, w * .045), escuro(p, cor, .3), { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) p.forma(retArredP(-w * .455 + i * w * .16, -w * .41, w * .135, w * .15, w * .015), "claro", { prof: 0, liso: true });
    p.forma(retArredP(w * .19, -w * .41, w * .1, w * .31, w * .012), "claro", { prof: 0, liso: true });
    p.linha([[w * .24, -w * .41], [w * .24, -w * .1]], "tinta", Math.max(4, w * .012));
    p.forma(S(w, [[.32, -.41], [.45, -.41], [.478, -.26], [.32, -.26]]), "claro", { prof: 0, liso: true });
    p.circulo(w * .46, -w * .14, w * .03, "c2", { prof: 0, liso: true });
    p.forma(retP(-w * .5, -w * .15, w * .035, w * .05), "c2", { prof: 0, liso: true });
  });
  for (const x of [-w * .29, w * .36]) roda(p, x, w * .08, a);
}
/** Moto com rodas girando, escapamento soltando fumaça e riscos de velocidade. Opções: larg, cor, andando, t. Chaves: moto, motocicleta, entrega, motoboy, delivery, rapidez, agilidade, liberdade */
export function moto(p, { larg = 360, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .155, a = andando ? tt * 9 : 0;
  if (andando) rastro(p, -w * .52, -w * .2, w, tt);
  for (const x of [-w * .33, w * .33]) roda(p, x, r, a);
  p.em({ x: 0, y: balanco(tt, w, andando) }, () => {
    p.capsula([w * .33, -r], [w * .19, -w * .47], w * .04, sobreFundo(p));
    p.capsula([-w * .33, -r], [-w * .02, -w * .2], w * .045, sobreFundo(p));
    p.capsula([-w * .4, -w * .2], [-w * .06, -w * .15], w * .05, "c4");
    p.forma(retArredP(-w * .11, -w * .3, w * .22, w * .17, w * .03), "c4", { prof: 1 });
    p.forma(S(w, [[-.36, -.36], [-.3, -.43], [-.04, -.42], [-.04, -.34], [-.3, -.33]]), breu(p), { prof: 1, liso: true });
    p.forma(S(w, [[-.06, -.33], [-.02, -.47], [.14, -.48], [.21, -.38], [.1, -.3], [-.04, -.3]]), cor, { prof: 2 });
    p.capsula([w * .2, -w * .48], [w * .1, -w * .55], w * .04, sobreFundo(p));
    p.circulo(w * .26, -w * .43, w * .045, "c2", { prof: 0, liso: true });
    p.linha(arcoP(-w * .33, -r, r * 1.22, 215, 320, 8), cor, w * .04);
  });
  if (andando) fumaca(p, -w * .44, -w * .2, tt, { r: w * .035, alt: w * .1, dx: -1.2, vel: 1.1 });
}
/** Bicicleta com rodas e pedais girando. Opções: larg, cor, andando, t. Chaves: bicicleta, bike, pedalar, ciclista, ciclovia, saúde, exercício, sustentável */
export function bicicleta(p, { larg = 340, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .2, a = andando ? tt * 5 : Math.sin(tt * 2) * .5, g = w * .035, aro = sobreFundo(p);
  for (const x of [-w * .3, w * .3]) {
    p.linha(circP(x, -r, r - g / 2, 28), aro, g, { fechar: true });
    for (let i = 0; i < 3; i++) { const b = a * 1.4 + i * Math.PI / 3, c = Math.cos(b) * (r - g), s = Math.sin(b) * (r - g); p.linha([[x - c, -r - s], [x + c, -r + s]], aro, Math.max(3, w * .01)); }
  }
  const R = [-w * .3, -r], B = [-w * .03, -r], Sx = [-w * .11, -w * .5], H = [w * .17, -w * .49], F = [w * .3, -r];
  p.em({ x: 0, y: andando ? Math.sin(tt * 10) * w * .004 : 0 }, () => {
    p.linha([R, B, H, Sx, R], cor, g);
    p.linha([B, Sx, [-w * .125, -w * .56]], cor, g);
    p.linha([F, H, [w * .15, -w * .58], [w * .23, -w * .6]], cor, g);
    p.capsula([-w * .2, -w * .57], [-w * .06, -w * .57], w * .045, aro);
    p.capsula([w * .2, -w * .6], [w * .27, -w * .6], w * .045, aro);
  });
  p.circulo(B[0], B[1], w * .045, "c2", { prof: 0, liso: true });
  const cx = Math.cos(a) * w * .085, cy = Math.sin(a) * w * .085;
  p.linha([[B[0] - cx, B[1] - cy], [B[0] + cx, B[1] + cy]], aro, w * .022);
  for (const s of [-1, 1]) p.capsula([B[0] + s * cx - w * .035, B[1] + s * cy], [B[0] + s * cx + w * .035, B[1] + s * cy], w * .03, "c2");
}
/** Locomotiva a vapor com bielas girando e fumaça saindo da chaminé. Opções: larg, cor, andando, t. Chaves: trem, locomotiva, ferrovia, maria-fumaça, estação, nos trilhos, progresso, a todo vapor */
export function trem(p, { larg = 420, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .088, a = andando ? tt * 7 : 0;
  fumaca(p, w * .24, -w * .6, tt, { r: w * .05, n: 4, alt: w * .2, dx: -1.1, vel: andando ? .8 : .35 });
  p.em({ x: 0, y: balanco(tt, w, andando) * .7 }, () => {
    p.forma(S(w, [[.19, -.42], [.17, -.58], [.31, -.58], [.29, -.42]]), breu(p), { prof: 1 });
    p.forma(arcoP(-w * .02, -w * .42, w * .055, 180, 360, 8), "c2", { prof: 1, liso: true });
    p.forma(retArredP(-w * .22, -w * .44, w * .6, w * .28, w * .04), cor, { prof: 2 });
    for (const x of [-.04, .14]) p.linha([[w * x, -w * .43], [w * x, -w * .17]], "tinta", Math.max(4, w * .014));
    p.forma(retArredP(w * .3, -w * .46, w * .1, w * .32, w * .03), escuro(p, cor, .35), { prof: 1 });
    p.circulo(w * .4, -w * .37, w * .035, "c2", { prof: 0, liso: true });
    p.forma(retP(-w * .47, -w * .52, w * .27, w * .38), cor, { prof: 2 });
    p.forma(retArredP(-w * .42, -w * .46, w * .17, w * .15, w * .015), "claro", { prof: 0, liso: true });
    p.forma(retP(-w * .5, -w * .56, w * .33, w * .05), breu(p), { prof: 1, liso: true });
    p.forma(retP(-w * .47, -w * .17, w * .87, w * .06), breu(p), { prof: 0, liso: true });
    p.forma(S(w, [[.38, -.15], [.5, -.02], [.38, -.02]]), "c2", { prof: 1 });
  });
  for (const x of [-.3, -.1, .1]) roda(p, w * x, r, a, { calota: "c2", raios: 6 });
  roda(p, w * .29, w * .055, a * 1.5);
  const ox = Math.cos(a) * r * .5, oy = Math.sin(a) * r * .5;
  p.capsula([-w * .3 + ox, -r + oy], [w * .1 + ox, -r + oy], w * .03, sobreFundo(p));
}
/** Vagão de metrô deslizando no trilho, com dormentes correndo e farol piscando. Opções: larg, cor, andando, t. Chaves: metrô, trem urbano, estação, transporte público, linha, subterrâneo, hora do rush, mobilidade */
export function metro(p, { larg = 420, cor = "c3", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = andando ? tt * 12 : 0;
  p.linha([[-w * .5, -w * .012], [w * .5, -w * .012]], sobreFundo(p), w * .024, { tracejado: [w * .05, w * .05], desloc: andando ? -tt * w * .9 : 0 });
  for (const x of [-.36, -.24, .24, .36]) roda(p, w * x, w * .04, a);
  p.em({ x: 0, y: balanco(tt, w, andando) * .5 }, () => {
    for (const x of [-.42, .18]) p.forma(retArredP(w * x, -w * .1, w * .24, w * .05, w * .015), breu(p), { prof: 0, liso: true });
    p.forma(S(w, [[-.5, -.08], [-.5, -.37], [-.47, -.41], [.3, -.41], [.42, -.35], [.485, -.22], [.5, -.08]]), cor, { prof: 2 });
    p.forma(retP(-w * .5, -w * .17, w * .99, w * .04), "c2", { prof: 0, liso: true });
    for (const x of [-.45, -.2, .05]) p.forma(retArredP(w * x, -w * .35, w * .13, w * .13, w * .015), "claro", { prof: 0, liso: true });
    for (const x of [-.3, -.05, .2]) { p.forma(retArredP(w * x, -w * .36, w * .08, w * .27, w * .012), "claro", { prof: 0, liso: true }); p.linha([[w * (x + .04), -w * .36], [w * (x + .04), -w * .09]], "tinta", Math.max(4, w * .012)); }
    p.forma(S(w, [[.31, -.36], [.4, -.325], [.455, -.22], [.31, -.22]]), "claro", { prof: 0, liso: true });
    p.circulo(w * .455, -w * .13, w * (.026 + .008 * Math.sin(tt * 6)), "c2", { prof: 0, liso: true });
  });
}
/** Carreta: cavalo mecânico puxando um baú comprido, com fumaça na chaminé. Opções: larg, cor, andando, t. Chaves: carreta, caminhão, frete, carga, logística, entrega, transportadora, estrada */
export function carreta(p, { larg = 420, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = andando ? tt * 9 : 0;
  fumaca(p, w * .185, -w * .5, tt, { r: w * .028, alt: w * .12, dx: -1.2, vel: andando ? 1 : .4 });
  p.em({ x: 0, y: balanco(tt, w, andando) }, () => {
    p.capsula([w * .185, -w * .2], [w * .185, -w * .47], w * .03, sobreFundo(p));
    p.forma(retP(-w * .5, -w * .13, w * .96, w * .05), breu(p), { prof: 0, liso: true });
    p.forma(retP(-w * .5, -w * .44, w * .65, w * .31), "claro", { prof: 2 });
    p.forma(retP(-w * .5, -w * .3, w * .65, w * .06), cor, { prof: 0, liso: true });
    for (const x of [-.34, -.18, -.02]) p.linha([[w * x, -w * .43], [w * x, -w * .14]], "tinta", Math.max(4, w * .01));
    p.forma(S(w, [[.21, -.1], [.21, -.4], [.36, -.4], [.44, -.27], [.5, -.25], [.5, -.1]]), cor, { prof: 2 });
    p.forma(S(w, [[.27, -.365], [.35, -.365], [.415, -.265], [.27, -.265]]), "claro", { prof: 0, liso: true });
    p.circulo(w * .475, -w * .17, w * .026, "c2", { prof: 0, liso: true });
  });
  for (const x of [-.42, -.28, .1, .38]) roda(p, w * x, w * .065, a);
}
/** Trator de roda traseira grande, trepidando e soltando fumaça pelo escapamento. Opções: larg, cor, andando, t. Chaves: trator, agro, fazenda, campo, lavoura, colheita, agricultura, máquina */
export function trator(p, { larg = 320, cor = "c3", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = andando ? tt * 4 : 0, R = w * .25, cx = -w * .2, trep = Math.sin(tt * 18) * w * .006 + balanco(tt, w, andando);
  fumaca(p, w * .24, -w * .8, tt, { r: w * .04, alt: w * .16, dx: -.9, vel: 1 });
  p.em({ x: 0, y: trep }, () => {
    p.capsula([w * .24, -w * .5], [w * .24, -w * .77], w * .04, sobreFundo(p));
    p.forma(S(w, [[-.37, -.9], [-.02, -.9], [.03, -.5], [-.4, -.5]]), "claro", { prof: 1 });
    p.linha([[-w * .19, -w * .9], [-w * .19, -w * .5]], "tinta", Math.max(4, w * .014));
    p.forma(retArredP(-w * .43, -w * .96, w * .48, w * .08, w * .025), cor, { prof: 1 });
    p.forma(retP(-w * .05, -w * .32, w * .4, w * .12), escuro(p, cor, .4), { prof: 0, liso: true });
    p.forma(retArredP(-w * .42, -w * .53, w * .86, w * .23, w * .04), cor, { prof: 2 });
    p.circulo(w * .41, -w * .44, w * .04, "c2", { prof: 0, liso: true });
  });
  p.forma(Array.from({ length: 28 }, (_, i) => { const b = a + i / 28 * TAU, q = R * (i % 2 ? 1 : .9); return [cx + Math.cos(b) * q, -R + Math.sin(b) * q]; }), breu(p), { prof: 1, liso: true });
  p.circulo(cx, -R, R * .5, "c2", { prof: 0, liso: true });
  for (let i = 0; i < 2; i++) { const b = a + i * Math.PI / 2; p.linha([[cx - Math.cos(b) * R * .45, -R - Math.sin(b) * R * .45], [cx + Math.cos(b) * R * .45, -R + Math.sin(b) * R * .45]], breu(p), w * .025); }
  roda(p, w * .32, w * .14, a * 1.8, { calota: "c2" });
}
/** Ambulância com a cruz na lateral e a sirene piscando. Opções: larg, cor (cruz e faixa), andando, t. Chaves: ambulância, emergência, socorro, hospital, resgate, urgência, saúde, samu */
export function ambulancia(p, { larg = 400, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = andando ? tt * 9 : 0;
  p.em({ x: 0, y: balanco(tt, w, andando) }, () => {
    giroflex(p, -w * .02, -w * .47, w * .16, tt, cor, "c2");
    p.forma(S(w, [[-.5, -.1], [-.5, -.48], [.2, -.48], [.36, -.31], [.48, -.28], [.5, -.1]]), "claro", { prof: 2 });
    p.forma(retP(-w * .5, -w * .22, w * .99, w * .045), cor, { prof: 0, liso: true });
    p.forma(S(w, [[.13, -.43], [.2, -.43], [.325, -.3], [.13, -.3]]), "c4", { prof: 0, liso: true });
    const cx = -w * .2, cy = -w * .345, b = w * .09, e = w * .03;
    p.forma([[cx - e, cy - b], [cx + e, cy - b], [cx + e, cy - e], [cx + b, cy - e], [cx + b, cy + e], [cx + e, cy + e], [cx + e, cy + b], [cx - e, cy + b], [cx - e, cy + e], [cx - b, cy + e], [cx - b, cy - e], [cx - e, cy - e]], cor, { prof: 0, liso: true });
    p.circulo(w * .46, -w * .17, w * .028, "c2", { prof: 0, liso: true });
  });
  for (const x of [-w * .3, w * .31]) roda(p, x, w * .08, a);
}
/** Viatura de polícia com o giroflex alternando as luzes e a estrela na porta. Opções: larg, cor, andando, t. Chaves: viatura, polícia, segurança, patrulha, lei, fiscalização, perseguição, ocorrência */
export function viatura(p, { larg = 400, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  seda(p, w, cor, tt, andando, () => {
    giroflex(p, -w * .05, -w * .44, w * .18, tt, "c2", "c3");
    p.forma(S(w, [[-.33, -.27], [.23, -.27], [.23, -.13], [-.33, -.13]]), "claro", { prof: 0, liso: true });
    p.forma(estrelaP(-w * .05, -w * .2, w * .06, w * .026, 5), cor, { prof: 0, liso: true });
  });
}
/** Táxi com a faixa quadriculada e o luminoso do teto pulsando. Opções: larg, cor, andando, t. Chaves: táxi, corrida, motorista, aplicativo, passageiro, cidade, tarifa, mobilidade */
export function taxi(p, { larg = 400, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  seda(p, w, cor, tt, andando, () => {
    const q = w * .045;
    for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) p.forma(retP(-w * .31 + i * q, -w * .25 + j * q, q, q), "tinta", { prof: 0, liso: true });
    p.em({ x: -w * .05, y: -w * .44, s: 1 + .06 * Math.sin(tt * 5) }, () => {
      p.forma(retArredP(-w * .12, -w * .1, w * .24, w * .1, w * .02), "claro", { prof: 1, liso: true });
      p.texto("TAXI", 0, -w * .047, { tam: w * .068, cor: p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "#111111" });
    });
  });
}
/** Carro elétrico com o raio pulsando na porta e o cabo de tomada balançando atrás. Opções: larg, cor, andando, t. Chaves: carro elétrico, recarga, energia limpa, sustentável, bateria, tomada, futuro, inovação */
export function carroEletrico(p, { larg = 400, cor = "c3", andando = true, t = 0 } = {}) {
  const px = p.estilo === "pixel", w = larg * (px ? .72 : .84), tt = p.ritmo(t), x0 = larg * (px ? .14 : .08), a = andando ? tt * 9 : 0, sw = Math.sin(tt * (andando ? 6 : 2)) * w * .03;
  const en = energiaDe(p, cor), opaco = p.estilo !== "traco" && p.estilo !== "vidro";
  const curva = (A, C, D) => Array.from({ length: 11 }, (_, i) => { const f = i / 10; return [(1 - f) ** 2 * A[0] + 2 * f * (1 - f) * C[0] + f * f * D[0], (1 - f) ** 2 * A[1] + 2 * f * (1 - f) * C[1] + f * f * D[1]]; });
  if (px) {
    // pixel: plugue deitado com os dois pinos para fora (para trás), cabo claro de dois pixels que desce do carro e sobe até o plugue
    const P = [x0 - w * .74, -w * .19 + sw * .4], bw = w * .13, ep = Math.max(14, w * .055), dp = Math.max(22, w * .085), bh = 2 * dp + ep * 1.6;
    p.linha(curva([x0 - w * .49, -w * .17], [x0 - w * .58, w * .07 + sw * .5], [P[0] + bw / 2, P[1] + dp * .4]), "claro", Math.max(14, w * .05));
    p.em({ x: P[0], y: P[1] }, () => {
      for (const s of [-1, 1]) p.forma(retP(-bw / 2 - w * .1, s * dp - ep / 2, w * .11, ep), "claro", { prof: 0, liso: true });
      p.forma(retP(-bw / 2, -bh / 2, bw, bh), en, { prof: 1, liso: true });
    });
  } else {
    const A = [x0 - w * .49, -w * .22], C = [x0 - w * .6, -w * .02 + sw], D = [x0 - w * .66, -w * .16 - sw * .6];
    // cabo grosso e plugue de bloco com dois pinos, para ler como tomada
    p.linha(curva(A, C, D), breu(p), Math.max(6, w * .03));
    p.em({ x: D[0], y: D[1], r: -.5 - sw * .01 }, () => {
      for (const s of [-1, 1]) p.forma(retP(s * w * .05 - Math.max(3, w * .013), -w * .2, Math.max(6, w * .026), w * .09), sobreFundo(p), { prof: 0, liso: true });
      p.forma(retArredP(-w * .09, -w * .13, w * .18, w * .13, w * .025), en, { prof: 1, liso: true });
    });
  }
  p.em({ x: x0, y: balanco(tt, w, andando) }, () => {
    p.forma(S(w, [[-.5, -.1], [-.5, -.25], [-.41, -.4], [-.22, -.48], [.1, -.48], [.29, -.33], [.46, -.28], [.5, -.19], [.5, -.1]]), cor, { prof: 2 });
    // no pixel as janelas sobem um pouco, para o raio não encostar nelas
    const yb = px ? -.355 : -.32, f = (-.32 - yb) / .11;
    p.forma(S(w, [[-.37 + .17 * f, yb], [-.2, -.43], [-.05, -.43], [-.05, yb]]), "claro", { prof: 0, liso: true });
    p.forma(S(w, [[-.01, yb], [-.01, -.43], [.08, -.43], [.22 - .14 * f, yb]]), "claro", { prof: 0, liso: true });
    p.circulo(w * .455, -w * .21, w * .03, "c2", { prof: 0, liso: true });
    // raio grande e grosso na porta (mais da metade da altura da lateral), com contorno escuro em papel, flat e vidro
    // (o traço já contorna sozinho); no pixel ele vem maior, na cor de energia, com borda de pixel e meio feita por linha
    const H = w * (px ? .3 : .2), raio = px ? S(H, [[-.04, -.5], [.42, -.5], [.2, -.1], [.5, -.1], [-.2, .5], [-.06, .06], [-.36, .06]])
      : S(H, [[-.05, -.5], [.35, -.5], [.12, -.1], [.4, -.1], [-.22, .5], [-.02, .04], [-.32, .04]]);
    p.em({ x: -w * .1, y: -w * (px ? .215 : .21), s: 1 + (px ? .03 : .06) * Math.sin(tt * 6) }, () => {
      if (px) p.linha([...raio, raio[0], raio[1]], "tinta", 12);
      else if (p.estilo !== "traco") p.forma(raio.map(([x, y]) => [x * 1.25, y * 1.18]), opaco ? "tinta" : "claro", { prof: 0, liso: true });
      p.forma(raio, en, { prof: 0, liso: true });
    });
  });
  for (const x of [-.3, .3]) roda(p, x0 + w * x, w * .085, a);
}
/** Patinete elétrico que oscila, com rodas girando e riscos de velocidade. Opções: larg, cor, andando, t. Chaves: patinete, scooter, micromobilidade, cidade, aluguel, trajeto curto, última milha, sustentável */
export function patinete(p, { larg = 240, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .115, a = andando ? tt * 10 : 0;
  if (andando) rastro(p, -w * .56, -w * .2, w, tt, 2);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 3) * .035 }, () => {
    for (const x of [-w * .36, w * .36]) roda(p, x, r, a);
    p.capsula([-w * .34, -w * .15], [w * .2, -w * .15], w * .09, cor, { prof: 1 });
    p.linha(arcoP(-w * .36, -r, r * 1.3, 200, 300, 6), cor, w * .05);
    p.capsula([w * .2, -w * .15], [w * .36, -r], w * .06, cor);
    p.capsula([w * .36, -r], [w * .23, -w * 1.04], w * .06, cor, { prof: 1 });
    p.capsula([w * .11, -w * 1.06], [w * .34, -w * 1.06], w * .075, sobreFundo(p));
    p.circulo(w * .3, -w * .86, w * .05, "c2", { prof: 0, liso: true });
    p.circulo(-w * .08, -w * .15, w * .035, Math.floor(tt * 3) % 2 ? "c3" : "c2", { prof: 0, liso: true });
  });
}
/** Carroça de madeira com a roda de raios girando e a carga sacudindo. Opções: larg, cor, andando, t. Chaves: carroça, carreta de boi, rural, antigamente, interior, feira, tradição, atraso */
export function carroca(p, { larg = 360, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .2, cx = -w * .12, a = andando ? tt * 3 : Math.sin(tt * 1.5) * .15, mad = escuro(p, cor, .35), sac = andando ? Math.abs(Math.sin(tt * 6)) * w * .012 : Math.sin(tt * 3) * w * .003;
  p.em({ x: 0, y: -sac }, () => {
    for (const [x, y, rr, i] of [[-.3, -.53, .1, 0], [-.12, -.56, .11, 1], [.05, -.53, .09, 2]]) p.elipse(w * x, w * y - (andando ? Math.abs(Math.sin(tt * 6 + i)) * w * .012 : 0), w * rr, w * rr * .8, "claro", { prof: 1, semente: i + 3 });
    p.capsula([w * .14, -w * .3], [w * .5, -w * .36], w * .04, mad);
    p.forma(S(w, [[-.5, -.52], [.22, -.52], [.17, -.25], [-.45, -.25]]), cor, { prof: 2 });
    for (const y of [-.43, -.34]) p.linha([[-w * .46, w * y], [w * .19, w * y]], mad, Math.max(4, w * .012));
  });
  p.forma(circP(cx, -R, R, 30), mad, { prof: 1, liso: true, furos: [circP(cx, -R, R * .8, 24).reverse()] });
  for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 4, c = Math.cos(b) * R * .85, s = Math.sin(b) * R * .85; p.linha([[cx - c, -R - s], [cx + c, -R + s]], mad, w * .022); }
  p.circulo(cx, -R, R * .2, cor, { prof: 0, liso: true });
}
/** Trecho de pista visto de cima, com as faixas do meio correndo para trás. Opções: larg, cor (faixas), andando, t. Chaves: estrada, pista, rodovia, asfalto, caminho, trajeto, jornada, percurso */
export function estrada(p, { larg = 420, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), h = w * .3, vazado = p.estilo === "traco" || p.estilo === "vidro", asf = vazado ? "claro" : breu(p), d = andando ? -tt * w * .9 : -Math.sin(tt * 2) * w * .02;
  p.forma(retP(-w / 2, -h, w, h), asf, { prof: 1, liso: true });
  for (const y of [-h + w * .03, -w * .03]) p.linha([[-w / 2, y], [w / 2, y]], vazado ? "tinta" : "claro", Math.max(6, w * .016));
  p.recortar(retP(-w / 2, -h, w, h), () => {
    const passo = w * .22, x0 = ((d % passo) + passo) % passo - passo;
    for (let x = -w / 2 + x0; x < w / 2 + passo; x += passo) p.forma(retP(x, -h / 2 - w * .02, w * .12, w * .04), cor, { prof: 0, liso: true });
  });
}
/** Trecho de trilho visto de cima, com os dormentes correndo por baixo dos dois trilhos. Opções: larg, cor (dormentes), andando, t. Chaves: trilhos, ferrovia, linha do trem, dormentes, caminho certo, nos trilhos, rota, direção */
export function trilhos(p, { larg = 420, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), h = w * .28, d = andando ? -tt * w * .7 : -Math.sin(tt * 2) * w * .02, passo = w * .12, x0 = ((d % passo) + passo) % passo - passo, aco = sobreFundo(p), mad = escuro(p, cor, .25);
  p.recortar(retP(-w / 2, -h - 2, w, h + 4), () => {
    for (let x = -w / 2 + x0 - passo; x < w / 2 + passo; x += passo) p.forma(retP(x, -h, w * .055, h), mad, { prof: 0, liso: true });
  });
  for (const y of [-h * .78, -h * .22]) {
    p.linha([[-w / 2, y], [w / 2, y]], aco, Math.max(p.estilo === "pixel" ? 12 : 8, w * .03));
    if (p.estilo !== "traco" && p.estilo !== "pixel") p.linha([[-w / 2, y - w * .006], [w / 2, y - w * .006]], maisClaro(p, aco, .5), Math.max(2, w * .007));
  }
}

/* ---------------------------------------------------------------- ar */
/** Avião de passageiros que plana subindo e descendo, com rastros correndo atrás. Opções: larg, cor (cauda e asas), corpo, t. Chaves: avião, voo, viagem, aeroporto, decolar, férias, exportação, ir longe */
export function aviao(p, { larg = 420, cor = "c1", corpo = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .02, r: Math.sin(tt * 1.4) * .035 }, () => {
    for (let i = 0; i < 2; i++) { const f = (tt * 1.2 + i * .5) % 1, y = w * (-.02 + i * .07); p.alfa(1 - f * .4, () => p.linha([[-w * (.5 + f * .08), y], [-w * (.36 + f * .06), y]], sobreFundo(p), Math.max(5, w * .014))); }
    p.forma(S(w, [[-.3, -.07], [-.42, -.26], [-.5, -.26], [-.45, -.03]]), cor, { prof: 1 });
    p.forma(S(w, [[-.5, -.04], [-.3, -.085], [.3, -.09], [.42, -.07], [.5, -.01], [.44, .045], [.3, .07], [-.28, .06]]), corpo, { prof: 2 });
    p.forma(S(w, [[.36, -.065], [.42, -.05], [.455, -.02], [.37, -.02]]), "c4", { prof: 0, liso: true });
    for (let i = 0; i < 6; i++) p.forma(retArredP(w * (-.24 + i * .09), -w * .045, w * .04, w * .04, w * .01), "tinta", { prof: 0, liso: true });
    p.forma(S(w, [[-.34, -.01], [-.5, .0], [-.52, .035], [-.36, .03]]), cor, { prof: 1 });
    p.capsula([-w * .02, w * .13], [w * .1, w * .13], w * .07, "c4", { prof: 1 });
    p.forma(S(w, [[.1, .02], [-.1, .22], [-.2, .22], [-.1, .03]]), cor, { prof: 1 });
    p.circulo(-w * .46, -w * .25, w * .02, Math.floor(tt * 2.5) % 2 ? "c2" : cor, { prof: 0, liso: true });
  });
}
/** Helicóptero pairando, com o rotor principal e o da cauda girando. Opções: larg, cor, t. Chaves: helicóptero, resgate, sobrevoo, visão de cima, urgência, patrulha, reportagem aérea */
export function helicoptero(p, { larg = 380, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), gira = .25 + .75 * Math.abs(Math.cos(tt * 11)), aco = sobreFundo(p), ar = tt * 14;
  p.em({ x: -w * .04, y: Math.sin(tt * 2.2) * w * .02, r: .05 + Math.sin(tt * 1.6) * .03 }, () => {
    p.linha([[-w * .1, w * .25], [w * .28, w * .25], [w * .33, w * .2]], aco, w * .025);
    for (const x of [0, .2]) p.linha([[w * x, w * .14], [w * x, w * .25]], aco, w * .022);
    p.forma(S(w, [[-.06, -.06], [-.5, -.08], [-.5, -.025], [-.04, .1]]), cor, { prof: 1 });
    p.forma(S(w, [[-.52, -.17], [-.45, -.17], [-.42, -.03], [-.5, .03]]), escuro(p, cor, .3), { prof: 1 });
    p.elipse(w * .1, w * .02, w * .25, w * .17, cor, { prof: 2 });
    p.forma(S(w, [[.12, -.11], [.24, -.085], [.32, .0], [.33, .06], [.12, .06]]), "claro", { prof: 0, liso: true });
    p.forma(retP(w * .075, -w * .2, w * .05, w * .07), breu(p), { prof: 0, liso: true });
    p.alfa(.55, () => p.elipse(w * .1, -w * .21, w * .46, w * .03, aco, { prof: 0, liso: true }));
    p.capsula([w * (.1 - .46 * gira), -w * .21], [w * (.1 + .46 * gira), -w * .21], w * .028, aco);
    p.linha([[-w * .485 - Math.cos(ar) * w * .08, -w * .1 - Math.sin(ar) * w * .08], [-w * .485 + Math.cos(ar) * w * .08, -w * .1 + Math.sin(ar) * w * .08]], aco, w * .022);
    p.circulo(-w * .485, -w * .1, w * .022, "c2", { prof: 0, liso: true });
  });
}
/** Balão de ar quente que flutua e balança, com a chama pulsando. Opções: alt, cor, cor2, t. Chaves: balão, ar quente, passeio, subir, leveza, sonho, liberdade, visão ampla */
export function balaoDeArQuente(p, { alt = 380, cor = "c1", cor2 = "c2", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), cy = -h * .16, R = h * .32, env = [...arcoP(0, cy, R, 150, 390, 26), [h * .075, h * .2], [-h * .075, h * .2]], fl = .8 + .25 * Math.sin(tt * 13);
  p.em({ x: 0, y: Math.sin(tt * 1.5) * h * .02, r: Math.sin(tt * 1.1) * .05 }, () => {
    for (const s of [-1, 1]) p.linha([[s * h * .07, h * .2], [s * h * .06, h * .37]], sobreFundo(p), Math.max(4, h * .012));
    p.forma([[-h * .03, h * .25], [0, h * (.25 - .09 * fl)], [h * .03, h * .25], [0, h * .29]], cor2, { prof: 0, liso: true });
    p.forma(env, cor, { prof: 2 });
    p.recortar(env, () => { p.elipse(0, cy, R * .68, R * 1.6, cor2, { prof: 0, liso: true }); p.elipse(0, cy, R * .3, R * 1.6, cor, { prof: 0, liso: true }); });
    p.forma(retP(-h * .08, h * .185, h * .16, h * .035), escuro(p, cor, .35), { prof: 0, liso: true });
    p.forma(retArredP(-h * .075, h * .36, h * .15, h * .12, h * .02), "c4", { prof: 1 });
    p.linha([[-h * .075, h * .4], [h * .075, h * .4]], "tinta", Math.max(4, h * .012));
  });
}
/** Drone de quatro hélices pairando, com as hélices girando e a luz piscando. Opções: larg, cor, t. Chaves: drone, filmagem aérea, entrega, tecnologia, vigilância, mapeamento, visão de cima, automação */
export function drone(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), aco = sobreFundo(p);
  p.em({ x: 0, y: Math.sin(tt * 2.6) * w * .025, r: ruido(tt * .8, 3) * .08 }, () => {
    for (const s of [-1, 1]) {
      p.linha([[s * w * .08, w * .05], [s * w * .17, w * .2], [s * w * .26, w * .2]], aco, w * .025);
      p.capsula([s * w * .1, -w * .03], [s * w * .36, -w * .09], w * .045, aco);
      p.forma(retArredP(s * w * .36 - w * .035, -w * .15, w * .07, w * .09, w * .015), cor, { prof: 1, liso: true });
      const g = .25 + .75 * Math.abs(Math.cos(tt * 12 + (s > 0 ? 1 : 0)));
      p.alfa(.55, () => p.elipse(s * w * .36, -w * .17, w * .14, w * .025, aco, { prof: 0, liso: true }));
      p.capsula([s * w * .36 - w * .14 * g, -w * .17], [s * w * .36 + w * .14 * g, -w * .17], w * .028, aco);
    }
    p.forma(retArredP(-w * .15, -w * .09, w * .3, w * .15, w * .06), cor, { prof: 2 });
    p.circulo(0, w * .09, w * .06, breu(p), { prof: 1, liso: true });
    p.circulo(0, w * .095, w * .03, "c2", { prof: 0, liso: true });
    p.circulo(w * .09, -w * .02, w * .025, Math.floor(tt * 3) % 2 ? "c1" : "c3", { prof: 0, liso: true });
  });
}
/** Cabine de teleférico que desliza pelo cabo e balança pendurada. Opções: larg, cor, t. Chaves: teleférico, bondinho, cabo, montanha, turismo, subida, travessia, ponto turístico */
export function teleferico(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), incl = .22, yc = x => -w * .3 - x * incl, xc = Math.sin(tt * .9) * w * .13, bal = Math.sin(tt * 2.3) * .06;
  p.linha([[-w * .5, yc(-w * .5)], [w * .5, yc(w * .5)]], sobreFundo(p), w * .02);
  p.em({ x: xc, y: yc(xc), r: bal }, () => {
    p.capsula([0, 0], [0, w * .16], w * .03, sobreFundo(p));
    p.em({ x: 0, y: 0, r: -Math.atan(incl) - bal }, () => { p.capsula([-w * .07, 0], [w * .07, 0], w * .05, "c2"); for (const s of [-1, 1]) p.circulo(s * w * .06, -w * .012, w * .032, "c2", { prof: 0, liso: true }); });
    p.forma(retArredP(-w * .2, w * .16, w * .4, w * .34, w * .08), cor, { prof: 2 });
    p.forma(retArredP(-w * .22, w * .14, w * .44, w * .06, w * .03), escuro(p, cor, .3), { prof: 1, liso: true });
    for (const x of [-.16, .02]) p.forma(retArredP(w * x, w * .23, w * .14, w * .13, w * .02), "claro", { prof: 0, liso: true });
    p.linha([[-w * .19, w * .42], [w * .19, w * .42]], "tinta", Math.max(4, w * .014));
  });
}

/* ---------------------------------------------------------------- água */
/** Navio cargueiro com contêineres, balançando nas ondas e soltando fumaça. Opções: larg, cor, carga, agua (cor da água), t. Chaves: navio, cargueiro, porto, exportação, importação, contêiner, comércio exterior, logística */
export function navio(p, { larg = 420, cor = "c1", carga = true, agua, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), cores = ["c2", "c3", "c4"];
  fumaca(p, -w * .35, -w * .56, tt, { r: w * .035, alt: w * .14, dx: -1, vel: .5 });
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .008, r: Math.sin(tt * 1.5) * .012 }, () => {
    p.forma(retP(-w * .39, -w * .54, w * .08, w * .12), cor, { prof: 1 });
    p.forma(retP(-w * .39, -w * .51, w * .08, w * .035), "claro", { prof: 0, liso: true });
    p.forma(retP(-w * .45, -w * .43, w * .2, w * .2), "claro", { prof: 1 });
    p.forma(retP(-w * .43, -w * .4, w * .16, w * .04), "c4", { prof: 0, liso: true });
    if (carga) for (let j = 0; j < 2; j++) for (let i = 0; i < 4 - j; i++) p.forma(retP(w * (-.22 + i * .135 + j * .07), -w * (.31 + j * .075), w * .125, w * .07), cores[(i + j * 2) % 3], { prof: 0, semente: i + j * 5 + 2 });
    p.forma(S(w, [[-.5, -.24], [.32, -.24], [.36, -.29], [.5, -.29], [.4, -.03], [-.45, -.03]]), cor, { prof: 2 });
    p.linha([[-w * .47, -w * .18], [w * .45, -w * .18]], "tinta", Math.max(4, w * .012));
  });
  ondas(p, w, tt, { cor: agua || aguaDe(p, cor), y: -w * .075, alt: w * .075 });
}
/** Veleiro que aderna com o vento, velas enfunando e bandeirinha tremulando. Opções: larg, cor, cor2, agua (cor da água), t. Chaves: veleiro, vela, vento a favor, navegar, mar, rumo, liberdade, regata */
export function veleiro(p, { larg = 320, cor = "c1", cor2 = "c2", agua, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), b = w * (.035 + .025 * Math.sin(tt * 2.4)), ond = Math.sin(tt * 7) * w * .025;
  p.em({ x: 0, y: -w * .06 + Math.sin(tt * 2) * w * .01, r: Math.sin(tt * 1.7) * .05 }, () => {
    p.capsula([0, -w * .16], [0, -w * .98], w * .03, sobreFundo(p));
    p.forma([[0, -w * .98], [-w * .13, -w * .95 + ond], [0, -w * .91]], cor, { prof: 0, liso: true });
    p.forma([[-w * .03, -w * .92], [-w * .03, -w * .22], [-w * .44, -w * .22], [-w * .235 - b * .87, -w * .57 - b * .49]], "claro", { prof: 1 });
    p.forma([[w * .03, -w * .88], [w * .03, -w * .25], [w * .46, -w * .25], [w * .245 + b * .84, -w * .565 - b * .55]], cor2, { prof: 1 });
    p.forma(S(w, [[-.44, -.17], [.5, -.19], [.34, 0], [-.36, 0]]), cor, { prof: 2 });
    p.linha([[-w * .41, -w * .12], [w * .44, -w * .13]], "tinta", Math.max(4, w * .014));
  });
  ondas(p, w, tt, { cor: agua || aguaDe(p, cor), y: -w * .09, alt: w * .09, larg: 1.2 });
}
/** Lancha de proa empinada quicando na água, com espuma espirrando atrás. Opções: larg, cor, andando, agua (cor da água), t. Chaves: lancha, barco rápido, velocidade, mar, passeio, verão, luxo, acelerar */
export function lancha(p, { larg = 400, cor = "c1", andando = true, agua, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), mar = agua || aguaDe(p, cor), esp = maisClaro(p, mar, .45);
  if (andando) for (let i = 0; i < 4; i++) { const f = (tt * 1.3 + i / 4) % 1; p.circulo(-w * (.4 + f * .14), -w * (.09 + Math.sin(f * Math.PI) * .13) + i * w * .01, Math.max(.5, w * .04 * (1 - f * .7)), esp, { prof: 0, liso: true, semente: i + 1 }); }
  p.em({ x: 0, y: -w * .05 + (andando ? -Math.abs(Math.sin(tt * 5)) * w * .02 : Math.sin(tt * 2) * w * .008), r: andando ? -.07 + Math.sin(tt * 5) * .025 : Math.sin(tt * 1.6) * .02 }, () => {
    p.forma(retArredP(-w * .5, -w * .25, w * .07, w * .2, w * .02), breu(p), { prof: 1, liso: true });
    p.forma(S(w, [[.1, -.19], [-.03, -.33], [-.09, -.33], [-.05, -.19]]), "c4", { prof: 1 });
    p.forma(retArredP(-w * .3, -w * .26, w * .22, w * .08, w * .03), "claro", { prof: 1, liso: true });
    p.forma(S(w, [[-.45, -.2], [.22, -.2], [.5, -.25], [.3, -.03], [-.4, -.02]]), cor, { prof: 2 });
    p.forma(S(w, [[-.44, -.15], [.36, -.15], [.33, -.11], [-.43, -.11]]), "claro", { prof: 0, liso: true });
  });
  ondas(p, w, tt, { cor: mar, y: -w * .07, alt: w * .07, larg: 1.16 });
}
/** Submarino que flutua debaixo d'água, com a hélice girando e bolhas subindo. Opções: larg, cor, t. Chaves: submarino, fundo do mar, mergulho, profundidade, oculto, explorar, sondar, por baixo dos panos */
export function submarino(p, { larg = 380, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), aco = sobreFundo(p), g = Math.abs(Math.cos(tt * 9));
  for (let i = 0; i < 4; i++) { const f = (tt * .5 + i / 4) % 1; p.alfa(p.estilo === "pixel" ? 1 : 1 - f * .5, () => p.linha(circP(-w * .46 - i * w * .012 + Math.sin(tt * 3 + i) * w * .012, -w * (.06 + f * .22), w * (.016 + f * .02), 12), aco, Math.max(4, w * .012), { fechar: true })); }
  p.em({ x: w * .03, y: Math.sin(tt * 1.8) * w * .02, r: Math.sin(tt * 1.3) * .03 }, () => {
    p.linha([[w * .03, -w * .22], [w * .03, -w * .36], [w * .11, -w * .36]], aco, w * .03);
    p.elipse(-w * .47, w * .04, w * .028, w * (.03 + .1 * g), aco, { prof: 0, liso: true });
    p.forma(S(w, [[-.3, -.02], [-.43, -.1], [-.43, .18], [-.3, .1]]), escuro(p, cor, .3), { prof: 1 });
    p.forma(retArredP(-w * .1, -w * .25, w * .22, w * .2, w * .05), cor, { prof: 1 });
    p.forma(capsulaP([-w * .25, w * .04], [w * .3, w * .04], w * .29), cor, { prof: 2 });
    for (const x of [-.14, .06, .26]) { p.circulo(w * x, w * .03, w * .05, "claro", { prof: 0, liso: true }); p.circulo(w * x, w * .03, w * .028, "c4", { prof: 0, liso: true }); }
  });
}
