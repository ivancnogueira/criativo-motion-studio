// Categoria: Esporte e lazer
// Kit de movimento — bolas, equipamentos, música, cinema, jogos e passatempos.
// O que fica no chão tem a base em y = 0; o que flutua fica centrado na origem. A convenção está em ./_comum.js.
import { clamp, lerp, E, rng, semear, ruido, circP, retP, retArredP, rotP, capsulaP, arcoP, estrelaP, poligonoP, escuro, maisClaro, sobreFundo, TAU, vaiVem } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local, sem export) */
/** Contorno escuro só no flat, onde objeto branco sobre fundo claro precisa de borda. */
const contorno = (p, pts, w) => { if (p.estilo === "flat") p.linha(pts, "tinta", w, { fechar: true }); };
/** No pixel, transparência abaixo de meio some: lá tudo fica opaco. */
const opaco = (p, a) => p.estilo === "pixel" ? 1 : a;
/** Sombra achatada no chão (y = 0). */
function sombraNoChao(p, x, rx, ry) {
  if (p.estilo === "traco" || rx <= 0) return;
  if (p.estilo === "pixel") p.elipse(x, 0, rx, ry, "sombra", { prof: 0, liso: true });
  else p.alfa(.14, () => p.elipse(x, 0, rx, ry, "tinta", { prof: 0, liso: true }));
}
/** Quique periódico: f (fase 0..1), h (altura 0..1, parábola) e am (0..1, amassado perto do chão). */
function quique(tt, per = 1) { const f = ((tt / per) % 1 + 1) % 1; return { f, h: 4 * f * (1 - f), am: Math.max(0, 1 - Math.min(f, 1 - f) / .09) }; }
/** Polilinha grossa como forma fechada (para peças curvas como o shape do skate). */
function tiraP(pts, w) {
  const n = pts.length, esq = [], dir = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    esq.push([pts[i][0] + nx, pts[i][1] + ny]); dir.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return [...esq, ...dir.reverse()];
}
/** Arco de elipse entre dois ângulos em graus. */
const arcoElipseP = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
/** Barra branca de trave: no flat ganha borda escura para não sumir no fundo claro. */
function barraBranca(p, a, b, w) { if (p.estilo === "flat") p.capsula(a, b, w * 1.35, "tinta"); p.capsula(a, b, w, "claro", { prof: p.estilo === "papel" ? 1 : 0 }); }

function desenharFutebol(p, r, giro) {
  const bola = circP(0, 0, r, 40), lw = r * .055;
  p.forma(bola, "claro", { prof: 2 });
  p.em({ x: 0, y: 0, r: giro }, () => p.recortar(bola, () => {
    p.forma(poligonoP(0, 0, r * .34, 5), "tinta", { prof: 0, liso: true });
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * TAU / 5, c = Math.cos(a), s = Math.sin(a);
      p.linha([[c * r * .3, s * r * .3], [c * r * .74, s * r * .74]], "tinta", lw);
      const pc = [c * r * 1.02, s * r * 1.02], pent = poligonoP(pc[0], pc[1], r * .3, 5, a + Math.PI);
      p.forma(pent, "tinta", { prof: 0, liso: true });
      for (const j of [1, 4]) { const v = pent[j], d = a + (j === 1 ? .62 : -.62); p.linha([v, [v[0] + Math.cos(d) * r * .5, v[1] + Math.sin(d) * r * .5]], "tinta", lw); }
    }
  }));
  if (p.estilo !== "pixel") p.alfa(.5, () => p.elipse(-r * .38, -r * .42, r * .2, r * .11, "#FFFFFF", { prof: 0, liso: true }));
  // no pixel a tinta dos gomos é quase a cor do fundo: um aro claro devolve a silhueta redonda
  if (p.estilo === "pixel") p.linha(circP(0, 0, r * .97, 40), "claro", r * .09, { fechar: true });
  contorno(p, bola, lw);
}
function desenharBasquete(p, r, cor, giro) {
  const bola = circP(0, 0, r, 40), lw = r * .065;
  p.forma(bola, cor, { prof: 2 });
  p.em({ x: 0, y: 0, r: giro }, () => p.recortar(bola, () => {
    p.linha([[-r * 1.1, 0], [r * 1.1, 0]], "tinta", lw);
    p.linha([[0, -r * 1.1], [0, r * 1.1]], "tinta", lw);
    p.linha(arcoP(-r * 1.32, 0, r * .95, -62, 62, 14), "tinta", lw);
    p.linha(arcoP(r * 1.32, 0, r * .95, 118, 242, 14), "tinta", lw);
  }));
  if (p.estilo !== "pixel") p.alfa(.4, () => p.elipse(-r * .38, -r * .45, r * .22, r * .1, maisClaro(p, cor, .5), { prof: 0, liso: true }));
}

/* ---------------------------------------------------------------- bolas */
/** Bola de futebol que quica girando, com a sombra no chão. Opções: r, quica, t. Chaves: futebol, bola, gol, jogo, Copa, partida, time, esporte */
export function bolaDeFutebol(p, { r = 120, quica = true, t = 0 } = {}) {
  const tt = p.ritmo(t), q = quica ? quique(tt, 1.1) : { h: 0, am: 0 };
  sombraNoChao(p, 0, r * (.85 - q.h * .35), r * .13);
  p.em({ x: 0, y: -r * (1 - q.am * .1) - q.h * r * .8, sx: 1 + q.am * .1, sy: 1 - q.am * .1 }, () => desenharFutebol(p, r, tt * 2.2));
}
/** Bola de basquete que quica girando, amassando ao tocar o chão. Opções: r, cor, quica, t. Chaves: basquete, bola, cesta, arremesso, quadra, jogo, esporte, ponto */
export function bolaDeBasquete(p, { r = 120, cor = "c2", quica = true, t = 0 } = {}) {
  const tt = p.ritmo(t), q = quica ? quique(tt, .9) : { h: 0, am: 0 };
  sombraNoChao(p, 0, r * (.85 - q.h * .35), r * .13);
  p.em({ x: 0, y: -r * (1 - q.am * .12) - q.h * r * .8, sx: 1 + q.am * .12, sy: 1 - q.am * .12 }, () => desenharBasquete(p, r, cor, -tt * 1.8));
}
/** Raquete de tênis que balança no golpe, com a bolinha indo e voltando. Opções: larg, cor, t. Chaves: tênis, raquete, bolinha, saque, quadra, partida, golpe, esporte */
export function raquete(p, { larg = 380, cor = "c1", t = 0 } = {}) {
  const L = larg, tt = p.ritmo(t), g = Math.sin(tt * 3), ang = .5 + g * .28;
  const hy = -L * .24, rx = L * .17, ry = L * .22, aro = L * .03, fora = circP(0, hy, rx, 40, ry), dentro = circP(0, hy, rx - aro, 40, ry - aro);
  p.em({ x: 0, y: L * .28, r: ang }, () => p.em({ x: 0, y: -L * .28 }, () => {
    for (const s of [-1, 1]) p.capsula([s * rx * .5, hy + ry * .86], [0, L * .1], aro * .9, cor, { prof: 1 });
    p.capsula([0, L * .06], [0, L * .46], L * .055, cor, { prof: 1 });
    p.capsula([0, L * .24], [0, L * .47], L * .072, escuro(p, cor, .3));
    p.forma(dentro, "claro", { prof: 0, liso: true });
    p.recortar(dentro, () => p.alfa(opaco(p, .5), () => {
      const nv = p.estilo === "pixel" ? 2 : 3, nh = p.estilo === "pixel" ? 2 : 4;
      for (let i = -nv; i <= nv; i++) p.linha([[i * rx / (nv + 1), hy - ry], [i * rx / (nv + 1), hy + ry]], "tinta", L * .008);
      for (let i = -nh; i <= nh; i++) p.linha([[-rx, hy + i * ry / (nh + 1)], [rx, hy + i * ry / (nh + 1)]], "tinta", L * .008);
    }));
    p.forma(fora, cor, { prof: 2, furos: [dentro.slice().reverse()] });
  }));
  const bx = L * (.4 - .1 * Math.sin(tt * 3 + .6)), by = -L * (.36 + .06 * Math.cos(tt * 3 + .6)), br = L * .065;
  p.em({ x: bx, y: by, r: tt * 4 }, () => {
    p.circulo(0, 0, br, "c4", { prof: 1 });
    p.linha(arcoP(-br * 1.25, 0, br * .9, -50, 50, 8), "claro", br * .16);
    p.linha(arcoP(br * 1.25, 0, br * .9, 130, 230, 8), "claro", br * .16);
  });
}
/** Trave de gol com a rede balançando quando a bola entra. Opções: larg, t. Chaves: gol, trave, futebol, rede, golaço, meta, chute, objetivo */
export function trave(p, { larg = 400, t = 0 } = {}) {
  const w = larg, h = w * .42, tt = p.ritmo(t), pw = w * .032, bx = w * .4, bTopo = -h * .84, bBase = -h * .2;
  const P = 3.2, f = (tt % P) / P, choque = f > .3 ? Math.exp(-(f - .3) * 9) : 0, amp = w * .01 * (1 + 4 * choque);
  const onda = (x, y) => [x + Math.sin(tt * 2.6 + y * .03 + x * .01) * amp, y + Math.sin(tt * 2.1 + x * .02) * amp * .6 - choque * w * .03 * Math.max(0, 1 - Math.abs(x) / bx)];
  p.linha([[-w * .58, 0], [w * .58, 0]], "c3", w * .02);
  p.alfa(opaco(p, .55), () => {
    const rede = sobreFundo(p), lw = w * .007, N = p.estilo === "pixel" ? 6 : 10, M = p.estilo === "pixel" ? 3 : 6;
    for (let i = 0; i <= N; i++) { const x = -bx + 2 * bx * i / N; p.linha(Array.from({ length: 7 }, (_, j) => onda(x, lerp(bTopo, bBase, j / 6))), rede, lw); }
    for (let j = 0; j <= M; j++) { const y = lerp(bTopo, bBase, j / M); p.linha(Array.from({ length: 11 }, (_, i) => onda(-bx + 2 * bx * i / 10, y)), rede, lw); }
    for (let j = 0; j <= M; j++) { const k = j / M; for (const s of [-1, 1]) p.linha([[s * w / 2, -h * k], onda(s * bx, lerp(bBase, bTopo, k))], rede, lw); }
    for (let i = 0; i <= N; i++) { const k = i / N; p.linha([[lerp(-w / 2, w / 2, k), -h], onda(lerp(-bx, bx, k), bTopo)], rede, lw); }
  });
  if (f < .75) {
    const k = clamp(f / .3), queda = clamp((f - .3) / .25), x = lerp(w * .34, w * .08, k), y = f < .3 ? lerp(-h * .12, -h * .55, E.sai(k)) - Math.sin(k * Math.PI) * h * .2 : lerp(-h * .55, bBase - h * .04, E.entra(queda)), r = lerp(h * .3, h * .14, E.sai(k));
    p.alfa(clamp((.75 - f) / .15), () => p.em({ x, y, s: r / 100 }, () => desenharFutebol(p, 100, tt * 5)));
  }
  barraBranca(p, [-w / 2, 0], [-w / 2, -h], pw); barraBranca(p, [w / 2, 0], [w / 2, -h], pw); barraBranca(p, [-w / 2, -h], [w / 2, -h], pw);
}
/** Cesta de basquete com tabela, aro e rede; a bola cai pela cesta e a rede balança. Opções: alt, cor, t. Chaves: basquete, cesta, arremesso, ponto, acertar, meta, quadra, NBA */
export function cestaDeBasquete(p, { alt = 400, cor = "c1", t = 0 } = {}) {
  const H = alt, tt = p.ritmo(t), bw = H * .6, bh = H * .38, topo = -H, aroY = topo + bh * .96, rx = bw * .2, ry = rx * .28, br = rx * .74;
  const P = 2.8, f = (tt % P) / P, passa = f > .26 && f < .5 ? Math.sin((f - .26) / .24 * Math.PI) : 0, redeH = H * .17 * (1 + .3 * passa);
  p.forma(retArredP(-H * .1, -H * .035, H * .2, H * .035, H * .01), cor, { prof: 1 });
  p.capsula([0, -H * .02], [0, topo + bh * .5], H * .05, cor, { prof: 1 });
  const tab = retArredP(-bw / 2, topo, bw, bh, bw * .03), m = bw * .035;
  p.forma(tab, "claro", { prof: 2 });
  contorno(p, tab, H * .008);
  p.linha(retP(-bw / 2 + m, topo + m, bw - m * 2, bh - m * 2), cor, H * .018, { fechar: true });
  p.linha(retP(-bw * .17, aroY - bh * .42, bw * .34, bh * .34), "c2", H * .015, { fechar: true });
  p.linha(arcoElipseP(0, aroY, rx, ry, 180, 360), "c2", H * .02);
  let by = 0, a = 1;
  if (f < .26) by = lerp(topo - br * 1.3, aroY, E.entra(f / .26));
  else if (f < .5) by = lerp(aroY, aroY + redeH, (f - .26) / .24);
  else if (f < .64) by = lerp(aroY + redeH, -br, E.entra((f - .5) / .14));
  else by = -br - Math.sin((f - .64) / .36 * Math.PI) * H * .12;
  a = clamp(f / .06) * clamp((1 - f) / .12);
  p.alfa(a, () => p.em({ x: 0, y: by }, () => desenharBasquete(p, br, "c2", tt * 3)));
  p.alfa(opaco(p, .75), () => {
    const N = 6, dx = Math.sin(tt * 3) * rx * .1 + passa * rx * .05, baixo = i => [lerp(-rx * .62, rx * .62, i / N) + dx, aroY + redeH];
    for (let i = 0; i <= N; i++) {
      const topoN = [lerp(-rx, rx, i / N), aroY];
      if (i < N) p.linha([topoN, baixo(i + 1)], sobreFundo(p), H * .009);
      if (i > 0) p.linha([topoN, baixo(i - 1)], sobreFundo(p), H * .009);
    }
    p.linha([baixo(0), baixo(N)], sobreFundo(p), H * .009);
  });
  p.linha(arcoElipseP(0, aroY, rx, ry, 0, 180), "c2", H * .022);
}

/* ---------------------------------------------------------------- academia e competição */
/** Halter subindo e descendo no exercício, com riscos de esforço no alto. Opções: larg, cor, t. Chaves: academia, halter, peso, treino, musculação, força, esforço, disciplina */
export function halter(p, { larg = 360, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), sobe = E.entraSai(vaiVem(tt, .55)), barra = sobreFundo(p), y = w * .06 - sobe * w * .12;
  p.em({ x: 0, y, r: Math.sin(tt * 1.9) * .06 }, () => {
    p.capsula([-w * .47, 0], [w * .47, 0], w * .05, barra);
    p.capsula([-w * .15, 0], [w * .15, 0], w * .08, barra);
    for (const s of [-1, 1]) {
      const x1 = s * w * .2, x2 = s * w * .28, x3 = s * w * .345;
      p.forma(retArredP(x1 - w * .035, -w * .21, w * .07, w * .42, w * .02), cor, { prof: 2 });
      p.forma(retArredP(x2 - w * .03, -w * .16, w * .06, w * .32, w * .02), escuro(p, cor, .18), { prof: 1 });
      p.forma(retArredP(x3 - w * .018, -w * .06, w * .036, w * .12, w * .01), barra, { prof: 0, liso: true });
      if (p.estilo !== "pixel") p.alfa(.35, () => p.forma(retArredP(x1 - w * .025, -w * .19, w * .02, w * .3, w * .01), maisClaro(p, cor, .5), { prof: 0, liso: true }));
    }
  });
  const forca = clamp((sobe - .65) / .35);
  if (forca > 0) p.alfa(forca, () => { for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + s * (.5 + i * .4), cx = s * w * .32, cy = y - w * .2; p.linha([[cx + Math.cos(a) * w * .06, cy + Math.sin(a) * w * .06], [cx + Math.cos(a) * w * .12, cy + Math.sin(a) * w * .12]], "c2", w * .022); } });
}
/** Pódio de três lugares que sobe, com a estrela do campeão girando e confete caindo. Opções: larg, cor, k (0..1 ergue o pódio), t. Chaves: pódio, campeão, vencedor, primeiro lugar, ranking, competição, vitória, conquista */
export function podio(p, { larg = 400, cor = "c2", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kk = clamp(k), bw = w * .32, base = w * .05;
  // a base e os três degraus aparecem sempre; k só os faz crescer de 55% até a altura cheia, na ordem 1, 2, 3
  const cresce = atraso => .55 + .45 * E.volta(clamp(kk * 1.6 - atraso));
  p.forma(retArredP(-w * .53, -base, w * 1.06, base, w * .012), escuro(p, "c4", .15), { prof: 1 });
  const blocos = [[-w * .48, w * .34, "c1", "2", .15], [w * .16, w * .26, "c3", "3", .3], [-w * .16, w * .46, cor, "1", 0]];
  for (const [x, bh0, c, n, atraso] of blocos) {
    const bh = bh0 * cresce(atraso), y0 = -base;
    p.forma(retP(x, y0 - bh, bw, bh), c, { prof: 2 });
    p.forma(retP(x, y0 - bh, bw, w * .035), maisClaro(p, c, .3), { prof: 0, liso: true });
    p.texto(n, x + bw / 2, y0 - bh + Math.min(bh * .5, w * .13), { tam: w * .12, cor: "tinta" });
  }
  const h1 = base + w * .46 * cresce(0);
  if (kk > .5) p.alfa(clamp((kk - .5) * 3), () => p.em({ x: 0, y: -h1 - w * .12 - Math.abs(Math.sin(tt * 3)) * w * .05, r: Math.sin(tt * 2) * .3, s: 1 + .08 * Math.sin(tt * 6) }, () => p.forma(estrelaP(0, 0, w * .08, w * .036, 5), "c2", { prof: 1 })));
  for (const c of semear(9, 41)) {
    const fq = (tt * .3 + c.v) % 1, x = (c.u - .5) * w * .95 + Math.sin(tt * 2 + c.i) * w * .03, yy = lerp(-w * .9, -w * .5, fq);
    p.alfa(Math.min(1, (1 - fq) * 4) * clamp(kk * 2 - 1), () => p.retangulo(x, yy, w * .03, w * .05, ["c1", "c2", "c3", "c4"][c.i % 4], { rot: tt * 3 + c.w * 6, prof: 0, liso: true }));
  }
}
/** Apito de juiz que treme quando sopra, com o som saindo e o cordão balançando. Opções: larg, cor, t. Chaves: apito, juiz, árbitro, falta, regra, treinador, alerta, início */
export function apito(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .6) % 1, sopra = f < .5 ? Math.sin(f / .5 * Math.PI) : 0, tremor = Math.sin(tt * 55) * w * .01 * sopra;
  const bal = Math.sin(tt * 2.2) * w * .04;
  p.linha([[w * .3, -w * .22], [w * .36 + bal * .3, -w * .34], [w * .34 + bal, -w * .46], [w * .24 + bal * 1.4, -w * .52]], "c3", w * .03);
  p.em({ x: tremor, y: 0 }, () => {
    p.linha(circP(w * .29, -w * .18, w * .055, 16), sobreFundo(p), w * .024, { fechar: true });
    p.forma(retArredP(-w * .47, -w * .2, w * .6, w * .15, w * .035), cor, { prof: 1 });
    p.circulo(w * .08, 0, w * .22, cor, { prof: 2 });
    p.forma(retArredP(-w * .47, -w * .17, w * .035, w * .09, w * .012), "tinta", { prof: 0, liso: true });
    p.forma(retP(-w * .2, -w * .2, w * .12, w * .05), "tinta", { prof: 0, liso: true });
    if (p.estilo !== "pixel") p.alfa(.45, () => { p.capsula([-w * .4, -w * .17], [-w * .26, -w * .17], w * .025, maisClaro(p, cor, .6)); p.linha(arcoP(w * .08, 0, w * .15, 200, 260, 6), maisClaro(p, cor, .6), w * .03); });
  });
  if (sopra > .05) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .45, r0 = w * .1, r1 = r0 + w * .14 * sopra; p.alfa(sopra, () => p.linha([[-w * .14 + Math.cos(a) * r0, -w * .2 + Math.sin(a) * r0], [-w * .14 + Math.cos(a) * r1, -w * .2 + Math.sin(a) * r1]], "c2", w * .03)); }
}
/** Cronômetro com o ponteiro correndo e o tempo passado marcado no mostrador. Opções: r, cor, vel, t. Chaves: cronômetro, tempo, prazo, rapidez, contagem, recorde, urgência, minuto */
export function cronometro(p, { r = 140, cor = "c1", vel = 1, t = 0 } = {}) {
  const tt = p.ritmo(t), volta = tt * vel / 3, fr = ((volta % 1) + 1) % 1, a = -90 + fr * 360, aperta = fr < .06 ? 1 - fr / .06 : 0;
  p.em({ x: 0, y: r * .12 }, () => {
    p.capsula([0, -r * .98], [0, -r * 1.16], r * .14, cor, { prof: 1 });
    p.forma(retArredP(-r * .22, -r * 1.3 + aperta * r * .07, r * .44, r * .15, r * .05), cor, { prof: 1 });
    p.em({ x: Math.cos(-.8) * r * 1.02, y: Math.sin(-.8) * r * 1.02, r: -.8 + Math.PI / 2 }, () => p.forma(retArredP(-r * .1, -r * .07, r * .2, r * .14, r * .04), cor, { prof: 1 }));
    p.circulo(0, 0, r, cor, { prof: 2 });
    p.circulo(0, 0, r * .82, "claro", { prof: 0, liso: true });
    if (fr > .01) p.alfa(opaco(p, .45), () => p.forma([[0, 0], ...arcoP(0, 0, r * .76, -90, a, Math.max(2, Math.round(fr * 30)))], "c2", { prof: 0, liso: true }));
    for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, gr = i % 3 === 0, r0 = r * (gr ? .6 : .67); p.linha([[Math.cos(b) * r0, Math.sin(b) * r0], [Math.cos(b) * r * .76, Math.sin(b) * r * .76]], "tinta", r * (gr ? .06 : .035)); }
    const ar = a * Math.PI / 180;
    p.linha([[-Math.cos(ar) * r * .14, -Math.sin(ar) * r * .14], [Math.cos(ar) * r * .7, Math.sin(ar) * r * .7]], "c1", r * .06);
    p.circulo(0, 0, r * .09, "tinta", { prof: 0, liso: true });
  });
}

/* ---------------------------------------------------------------- equipamentos */
/** Tênis esportivo de lado que bate o calcanhar como quem caminha. Opções: larg, cor, t. Chaves: tênis, calçado, corrida, caminhada, sapato, treino, passo, moda */
export function tenis(p, { larg = 380, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), pisa = Math.max(0, Math.sin(tt * 3.2)), P = pts => pts.map(([x, y]) => [x * w, y * w]);
  sombraNoChao(p, w * .03, w * (.5 - pisa * .06), w * .035);
  p.em({ x: w * .5, y: 0, r: pisa * .14 }, () => p.em({ x: -w * .5, y: 0 }, () => {
    p.forma(P([[-.47, -.1], [-.5, -.24], [-.47, -.38], [-.4, -.44], [-.32, -.41], [-.24, -.39], [-.16, -.4], [-.11, -.52], [-.02, -.54], [.03, -.45], [.18, -.34], [.36, -.26], [.47, -.2], [.5, -.12], [.5, -.08]]), cor, { prof: 2 });
    p.forma(P([[-.12, -.4], [-.11, -.52], [-.02, -.54], [.03, -.45], [-.04, -.42]]), escuro(p, cor, .2), { prof: 0 });
    p.forma(P([[-.42, -.425], [-.34, -.395], [-.22, -.375], [-.15, -.4], [-.2, -.45], [-.32, -.455]]), "tinta", { prof: 0, liso: true });
    p.forma(P([[-.5, -.24], [-.47, -.38], [-.42, -.37], [-.42, -.22]]), "c2", { prof: 0 });
    p.forma(P([[.26, -.29], [.38, -.25], [.47, -.2], [.5, -.12], [.5, -.09], [.22, -.09]]), maisClaro(p, cor, .3), { prof: 0 });
    p.forma(tiraP(P([[-.36, -.17], [-.2, -.24], [-.02, -.25], [.14, -.2]]), w * .05), "c2", { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) { const k = i / 3.3, cx = lerp(-.04, .2, k) * w, cy = lerp(-.44, -.32, k) * w; p.capsula([cx - w * .045, cy - w * .03], [cx + w * .045, cy + w * .03], w * .026, "claro"); }
    const sola = P([[-.5, -.13], [.42, -.13], [.52, -.1], [.55, -.05], [.5, 0], [-.47, 0], [-.52, -.05]]);
    p.forma(sola, "claro", { prof: 1 });
    p.forma(P([[-.48, -.035], [.52, -.035], [.5, 0], [-.47, 0]]), "c4", { prof: 0, liso: true });
    contorno(p, sola, w * .01);
  }));
}
/** Skate andando com as rodinhas girando e dando um ollie de tempos em tempos. Opções: larg, cor, t. Chaves: skate, manobra, radical, rua, juventude, liberdade, lazer, equilíbrio */
export function skate(p, { larg = 400, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt % 2.6) / 2.6, g = clamp(f / .42), pulo = f < .42 ? Math.sin(Math.PI * g) : 0, rot = f < .42 ? -Math.sin(TAU * g) * .2 : 0;
  const rr = w * .068, yR = -rr, deckY = -w * .2, barra = sobreFundo(p);
  p.alfa(opaco(p, .6), () => { for (let i = 0; i < 3; i++) { const d = ((tt * 1.6 + i / 3) % 1), x = -w * .5 - d * w * .14, y = -w * (.08 + i * .07) - pulo * w * .2; p.linha([[x, y], [x - w * .1 * (1 - d), y]], "c4", w * .02); } });
  sombraNoChao(p, 0, w * (.42 - pulo * .14), w * .035);
  p.em({ x: 0, y: -pulo * w * .2 + deckY, r: rot }, () => p.em({ x: 0, y: -deckY }, () => {
    for (const x of [-w * .28, w * .28]) {
      p.forma([[x - w * .06, deckY + w * .015], [x + w * .06, deckY + w * .015], [x + w * .025, yR], [x - w * .025, yR]], barra, { prof: 0, liso: true });
      p.circulo(x, yR, rr, "c4", { prof: 1 });
      p.circulo(x, yR, rr * .42, escuro(p, "c4", .3), { prof: 0, liso: true });
      const a = tt * 9; p.circulo(x + Math.cos(a) * rr * .68, yR + Math.sin(a) * rr * .68, rr * .2, "claro", { prof: 0, liso: true });
    }
    const linha = Array.from({ length: 25 }, (_, i) => { const x = -w * .5 + w * i / 24, ax = Math.abs(x); return [x, deckY - Math.pow(Math.max(0, ax - w * .33) / (w * .17), 1.6) * w * .1]; });
    p.forma(tiraP(linha, w * .05), cor, { prof: 2 });
    for (const q of [linha[0], linha[24]]) p.circulo(q[0], q[1], w * .025, cor, { prof: 0, liso: true });
    p.linha(linha.slice(1, 24).map(([x, y]) => [x, y - w * .014]), "tinta", w * .012);
  }));
}
/** Prancha de surfe em pé balançando sobre ondinhas que correm. Opções: larg, cor, t. Chaves: surfe, prancha, praia, onda, mar, verão, férias, liberdade */
export function pranchaDeSurf(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const L = larg, W = L * .27, tt = p.ritmo(t), dir = [];
  for (let i = 0; i <= 26; i++) { const s = i / 26; dir.push([W / 2 * Math.pow(Math.sin(Math.PI * s * .86), .62), -L / 2 + s * L]); }
  const x1 = dir[26][0], prancha = [...dir, [x1 * .6, L / 2 + W * .07], [0, L / 2 + W * .09], [-x1 * .6, L / 2 + W * .07], ...dir.slice().reverse().map(([x, y]) => [-x, y])];
  for (let j = 0; j < 2; j++) { const y = L * (.46 + j * .07), pts = Array.from({ length: 17 }, (_, i) => { const x = -L * .38 + L * .76 * i / 16; return [x, y + Math.sin(i * .9 - tt * 4 + j * 1.5) * L * .018]; }); p.linha(pts, j ? "c3" : "c1", L * .022); }
  p.em({ x: Math.sin(tt * 1.4) * L * .02, y: Math.sin(tt * 2.2) * L * .02, r: .3 + Math.sin(tt * 1.6) * .09 }, () => {
    p.forma(prancha, cor, { prof: 2 });
    p.recortar(prancha, () => {
      p.forma(retP(-W, -L * .2, W * 2, L * .06), "c1", { prof: 0, liso: true });
      p.forma(retP(-W, -L * .12, W * 2, L * .025), "c2", { prof: 0, liso: true });
      p.forma(retP(-W, L * .3, W * 2, L * .04), "c1", { prof: 0, liso: true });
    });
    p.alfa(opaco(p, .5), () => p.linha([[0, -L * .48], [0, L * .5]], "tinta", L * .009));
    contorno(p, prancha, L * .008);
  });
}
/** Luva de boxe dando um soco para a frente, com o impacto no fim do golpe. Opções: larg, cor, t. Chaves: boxe, luva, soco, luta, golpe, força, desafio, competição */
export function luvaDeBoxe(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1, soco = f < .12 ? E.sai(f / .12) : f < .3 ? 1 : f < .6 ? 1 - E.entraSai((f - .3) / .3) : 0, x = -w * .1 + soco * w * .18;
  if (soco > .85) p.alfa((soco - .85) / .15, () => { for (let i = 0; i < 5; i++) { const a = (i - 2) * .45, cx = x + w * .5, r0 = w * .06, r1 = w * (.16 + (i % 2) * .04); p.linha([[cx + Math.cos(a) * r0, Math.sin(a) * r0], [cx + Math.cos(a) * r1, Math.sin(a) * r1]], "c2", w * .03); } });
  p.em({ x, y: Math.sin(tt * 2.3) * w * .025, r: -.06 + soco * .06 + Math.sin(tt * 1.7) * .025 }, () => {
    const esc = escuro(p, cor, .3);
    // punho com a faixa branca e o cadarço
    const punho = retArredP(-w * .52, -w * .17, w * .3, w * .3, w * .05);
    p.forma(punho, cor, { prof: 1 });
    p.forma(retP(-w * .46, -w * .17, w * .09, w * .3), "claro", { prof: 0 });
    for (let i = 0; i < 3; i++) { const y = -w * .12 + i * w * .085; p.linha([[-w * .33, y], [-w * .26, y + w * .05]], esc, w * .018); p.linha([[-w * .33, y + w * .05], [-w * .26, y]], esc, w * .018); }
    // mão fechada: corpo arredondado que avança
    const luva = [[-w * .28, -w * .2], [-w * .12, -w * .3], ...arcoP(w * .12, -w * .07, w * .26, -110, 80, 18), [w * .02, w * .13], [-w * .28, w * .13]];
    p.forma(luva, cor, { prof: 2 });
    // dedão: lobo de baixo, separado por um vinco
    const dedao = capsulaP([-w * .2, w * .15], [w * .15, w * .14], w * .15);
    p.forma(dedao, escuro(p, cor, .12), { prof: 1 });
    p.linha([[-w * .22, w * .075], [w * .13, w * .07]], esc, p.estilo === "pixel" ? w * .04 : w * .02);
    p.linha(arcoP(w * .12, -w * .07, w * .17, -80, 30, 10), esc, w * .016);
    if (p.estilo !== "pixel") p.alfa(.5, () => p.elipse(w * .1, -w * .22, w * .11, w * .04, maisClaro(p, cor, .5), { prof: 0, liso: true }));
  });
}

/* ---------------------------------------------------------------- música e cinema */
/** Violão inclinado com as cordas vibrando a cada batida. Opções: larg, cor, t. Chaves: violão, música, cantor, show, sertanejo, acústico, banda, tocar */
export function violao(p, { larg = 400, cor = "c2", t = 0 } = {}) {
  const L = larg, tt = p.ritmo(t), r1 = L * .15, r2 = L * .2, cyU = L * .02, cyL = L * .27, f = (tt * .8) % 1, vibra = Math.exp(-f * 4);
  const corpo = [...arcoP(0, cyU, r1, 37, -217, 24), [-L * .11, L * .11], ...arcoP(0, cyL, r2, -127, -413, 30), [L * .11, L * .11]];
  p.em({ x: 0, y: -vibra * L * .01, r: .55 + Math.sin(tt * 1.5) * .06 }, () => {
    p.forma(retP(-L * .034, -L * .38, L * .068, L * .27), escuro(p, cor, .4), { prof: 1 });
    p.forma([[-L * .055, -L * .5], [L * .055, -L * .5], [L * .042, -L * .37], [-L * .042, -L * .37]], escuro(p, cor, .5), { prof: 1 });
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) p.circulo(s * L * .065, -L * (.475 - i * .04), L * .016, "claro", { prof: 0, liso: true });
    p.forma(corpo, cor, { prof: 2 });
    p.linha(circP(0, L * .08, L * .072, 24), escuro(p, cor, .3), L * .014, { fechar: true });
    p.circulo(0, L * .08, L * .055, "tinta", { prof: 0, liso: true });
    p.forma(retArredP(-L * .075, cyL + L * .05, L * .15, L * .035, L * .012), "tinta", { prof: 0, liso: true });
    for (let i = -1; i <= 1; i++) { const x = i * L * .016, mx = x + Math.sin(tt * 45 + i * 2) * L * .008 * vibra; p.linha([[x, cyL + L * .065], [mx, L * .08], [x, -L * .37]], "claro", L * .006); }
  });
}
/** Microfone de mão com as ondas de voz pulsando dos dois lados. Opções: larg, cor, t. Chaves: microfone, cantar, voz, podcast, entrevista, discurso, palco, karaokê */
export function microfone(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const L = larg, tt = p.ritmo(t), R = L * .17, ang = -.28 + Math.sin(tt * 1.6) * .07, hy = -L * .2 - R * .82, cab = circP(0, hy, R, 32);
  const hx = -hy * Math.sin(ang), hyG = hy * Math.cos(ang);
  for (let i = 0; i < 2; i++) { const fo = (tt * 1.1 + i / 2) % 1, rr = R * (1.35 + fo * .7); p.alfa(1 - fo, () => { p.linha(arcoP(hx, hyG, rr, -38, 38, 8), "c2", L * .024); p.linha(arcoP(hx, hyG, rr, 142, 218, 8), "c2", L * .024); }); }
  p.em({ x: 0, y: 0, r: ang }, () => {
    p.forma([[-R * .62, -L * .17], [R * .62, -L * .17], [R * .3, L * .44], [-R * .3, L * .44]], cor, { prof: 2 });
    p.circulo(0, L * .44, R * .3, cor, { prof: 0 });
    p.forma(retArredP(-R * .14, L * .0, R * .28, L * .08, R * .1), "c2", { prof: 0, liso: true });
    p.forma(retArredP(-R * .72, -L * .22, R * 1.44, L * .07, R * .12), "tinta", { prof: 1 });
    p.forma(cab, "claro", { prof: 2 });
    p.recortar(cab, () => p.alfa(opaco(p, .4), () => { for (let i = -4; i <= 4; i++) { const d = i * R * .3; p.linha([[d - R, hy - R], [d + R, hy + R]], "tinta", L * .008); p.linha([[d + R, hy - R], [d - R, hy + R]], "tinta", L * .008); } }));
    contorno(p, cab, L * .01);
    if (p.estilo !== "pixel") p.alfa(.5, () => p.elipse(-R * .38, hy - R * .45, R * .24, R * .13, "#FFFFFF", { prof: 0, liso: true }));
  });
}
/** Notas musicais flutuando e balançando no ar. Opções: larg, t. Chaves: música, notas, melodia, canção, som, trilha sonora, ritmo, harmonia */
export function notasMusicais(p, { larg = 340, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  const cabeca = (x, y, s, cor) => p.forma(rotP(circP(x, y, s * .3, 20, s * .21), x, y, -.42), cor, { prof: 1 });
  const notas = [
    [-w * .28, w * .22, w * .4, "c1", "dupla", 0],
    [w * .3, w * .12, w * .34, "c2", "colcheia", 1.7],
    [-w * .5, -w * .26, w * .24, "c3", "seminima", 3.1],
  ];
  for (const [x, y, s, cor, tipo, fase] of notas) {
    p.em({ x: x + Math.sin(tt * 1.3 + fase) * w * .02, y: y + Math.sin(tt * 2 + fase) * w * .045, r: Math.sin(tt * 1.6 + fase) * .14 }, () => {
      const hw = s * .075, hx = s * .24;
      if (tipo === "dupla") {
        const d = s * .62, sobe = s * .12;
        cabeca(0, 0, s, cor); cabeca(d, -sobe, s, cor);
        p.capsula([hx, -s * .06], [hx, -s], hw, cor); p.capsula([d + hx, -sobe - s * .06], [d + hx, -s - sobe], hw, cor);
        p.forma([[hx - hw / 2, -s - s * .02], [d + hx + hw / 2, -s - sobe - s * .02], [d + hx + hw / 2, -s - sobe + s * .16], [hx - hw / 2, -s + s * .18]], cor, { prof: 0, liso: true });
      } else {
        cabeca(0, 0, s, cor);
        p.capsula([hx, -s * .06], [hx, -s], hw, cor);
        if (tipo === "colcheia") p.forma(tiraP([[hx, -s * .96], [hx + s * .2, -s * .78], [hx + s * .26, -s * .58], [hx + s * .18, -s * .42]], s * .1), cor, { prof: 0, liso: true });
      }
    });
  }
}
/** Claquete de cinema que abre e bate; sem k, bate sozinha em laço. Opções: larg, cor, k (0..1 fecha a haste; vazio = laço), t. Chaves: cinema, filme, gravação, ação, cena, vídeo, bastidores, produção */
export function claquete(p, { larg = 360, cor = "c1", k = null, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1;
  const abre = k == null ? (f < .55 ? E.sai(f / .55) : f < .65 ? 1 - E.entra((f - .55) / .1) : 0) : 1 - E.entra(clamp(k));
  const bateu = k == null ? (f >= .65 && f < .85 ? 1 - (f - .65) / .2 : 0) : (clamp(k) > .97 ? .5 + .5 * Math.sin(tt * 8) : 0);
  const listrada = (y, h) => { const pts = retP(-w / 2, y, w, h); p.forma(pts, "claro", { prof: 1 }); p.recortar(pts, () => { for (let i = 0; i < 7; i++) { const x = -w / 2 + i * w * .16 - w * .02; p.forma([[x, y + h], [x + w * .08, y + h], [x + w * .08 + h, y], [x + h, y]], "tinta", { prof: 0, liso: true }); } }); contorno(p, pts, w * .008); };
  p.em({ x: 0, y: bateu * w * .015, r: Math.sin(tt * 1.3) * .04 }, () => {
    const corpo = retArredP(-w / 2, -w * .2, w, w * .54, w * .02);
    p.forma(corpo, cor, { prof: 2 });
    const giz = p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro", lg = p.estilo === "pixel" ? w * .03 : w * .012;
    p.linha([[-w * .44, w * .0], [w * .44, w * .0]], giz, lg);
    p.linha([[-w * .44, w * .16], [w * .44, w * .16]], giz, lg);
    p.linha([[0, w * .0], [0, w * .16]], giz, lg);
    p.texto("CENA", -w * .22, -w * .095, { tam: w * .075, cor: giz });
    p.texto("1", w * .22, -w * .095, { tam: w * .09, cor: giz });
    p.texto("TAKE 3", -w * .22, w * .08, { tam: w * .05, cor: giz });
    p.texto("ROLA", w * .22, w * .08, { tam: w * .05, cor: giz });
    listrada(-w * .3, w * .1);
    p.em({ x: -w / 2, y: -w * .3, r: -abre * .55 }, () => p.em({ x: w / 2, y: w * .3 }, () => listrada(-w * .41, w * .1)));
    p.circulo(-w * .46, -w * .3, w * .022, sobreFundo(p), { prof: 0, liso: true });
  });
  if (bateu > 0) p.alfa(bateu, () => { for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .5, cx = w * .52, cy = -w * .38; p.linha([[cx + Math.cos(a) * w * .04, cy + Math.sin(a) * w * .04], [cx + Math.cos(a) * w * .12, cy + Math.sin(a) * w * .12]], "c2", w * .025); } });
}
function pipocaP(p, x, y, r, rot) {
  p.em({ x, y, r: rot }, () => {
    p.circulo(0, r * .1, r, "c4", { prof: 1, liso: true });
    p.circulo(-r * .35, -r * .25, r * .72, "claro", { prof: 0, liso: true });
    p.circulo(r * .4, -r * .12, r * .66, "claro", { prof: 0, liso: true });
  });
}
/** Balde de pipoca listrado com pipocas pulando para fora e caindo de volta. Opções: larg, cor, t. Chaves: pipoca, cinema, filme, lanche, sessão, diversão, estourar, lazer */
export function pipoca(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), H = w * .8, tw = w * .72, bw = w * .5, topY = -H;
  const monte = [[-.3, .02, .085], [-.16, -.08, .09], [0, -.12, .095], [.16, -.08, .09], [.3, .02, .085], [-.22, .06, .08], [.08, -.02, .09], [-.06, .05, .08], [.22, .06, .08], [-.08, -.18, .08], [.1, -.19, .08]];
  monte.forEach(([x, y, r], i) => pipocaP(p, x * w, topY + y * w - w * .02 + ruido(tt * 2, i) * w * .008, r * w, i * 1.3));
  const balde = [[-tw / 2, topY], [tw / 2, topY], [bw / 2, 0], [-bw / 2, 0]];
  p.forma(balde, "claro", { prof: 2 });
  p.recortar(balde, () => { for (let j = 1; j < 7; j += 2) { const a = j / 7, b = (j + 1) / 7; p.forma([[lerp(-tw / 2, tw / 2, a), topY], [lerp(-tw / 2, tw / 2, b), topY], [lerp(-bw / 2, bw / 2, b), 0], [lerp(-bw / 2, bw / 2, a), 0]], cor, { prof: 0, liso: true }); } });
  contorno(p, balde, w * .01);
  const borda = retArredP(-tw / 2 - w * .03, topY - w * .02, tw + w * .06, w * .07, w * .03);
  p.forma(borda, "claro", { prof: 1 });
  contorno(p, borda, w * .01);
  for (let i = 0; i < 4; i++) {
    const fq = (tt * .75 + i * .27) % 1, x0 = (i / 3 - .5) * tw * .55, x = x0 + (i % 2 ? 1 : -1) * w * .18 * fq, y = topY - w * .1 - Math.sin(Math.PI * fq) * w * (.32 + (i % 2) * .1);
    pipocaP(p, x, y, w * .06, fq * 7 + i);
  }
}
/** Ingresso de evento balançando, com brilho passando; o canhoto destaca com k. Opções: larg, cor, k (0..1 destaca o canhoto), t. Chaves: ingresso, bilhete, evento, show, cinema, entrada, acesso, convite */
export function ingresso(p, { larg = 380, cor = "c2", k = 0, t = 0 } = {}) {
  const w = larg, h = w * .46, tt = p.ritmo(t), xs = w * .22, r = h * .13, kk = E.entraSai(clamp(k));
  const principal = [[-w / 2, -h / 2], [xs - r, -h / 2], ...arcoP(xs, -h / 2, r, 180, 90, 8), ...arcoP(xs, h / 2, r, 270, 180, 8), [-w / 2, h / 2]];
  const canhoto = [[xs + r, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [xs + r, h / 2], ...arcoP(xs, h / 2, r, 360, 270, 8), ...arcoP(xs, -h / 2, r, 90, 0, 8)];
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .02, r: -.12 + Math.sin(tt * 1.3) * .05 }, () => {
    p.forma(principal, cor, { prof: 2 });
    contorno(p, principal, w * .008);
    p.alfa(opaco(p, .45), () => p.linha(retP(-w * .45, -h * .36, w * .58, h * .72), "tinta", w * .009, { fechar: true }));
    if (p.estilo !== "pixel") p.recortar(principal, () => { const bx = -w * .7 + ((tt * .35) % 1) * w * 1.4; p.alfa(.3, () => p.forma([[bx, -h], [bx + w * .08, -h], [bx - w * .06, h], [bx - w * .14, h]], "#FFFFFF", { prof: 0, liso: true })); });
    p.texto("INGRESSO", -w * .16, -h * .08, { tam: w * .072, cor: "tinta" });
    p.texto("FILA A · 07", -w * .16, h * .2, { tam: w * .04, cor: "tinta", peso: 600 });
    p.linha([[xs, -h / 2 + r * 1.4], [xs, h / 2 - r * 1.4]], "tinta", w * .012, { tracejado: [w * .022, w * .022] });
    p.em({ x: xs + kk * w * .12, y: kk * w * .1, r: kk * .4 }, () => p.em({ x: -xs, y: 0 }, () => {
      p.forma(canhoto, cor, { prof: 2 });
      contorno(p, canhoto, w * .008);
      p.em({ x: (xs + w / 2) / 2 + r * .3, y: 0, r: tt * .8 }, () => p.forma(estrelaP(0, 0, h * .2, h * .09, 5), "c1", { prof: 0, liso: true }));
    }));
  });
}

/* ---------------------------------------------------------------- jogos e passatempos */
const PONTOS = { 1: [[.5, .5]], 2: [[.27, .27], [.73, .73]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.27, .24], [.73, .24], [.27, .5], [.73, .5], [.27, .76], [.73, .76]] };
/** Dado em perspectiva rolando aos pulinhos, trocando as faces a cada queda. Opções: larg, cor, t. Chaves: dado, sorte, acaso, jogo, aposta, probabilidade, risco, tabuleiro */
export function dado(p, { larg = 220, cor = "c1", t = 0 } = {}) {
  const e = larg / 1.732, tt = p.ritmo(t), per = 1.3, n = Math.floor(tt / per), f = ((tt / per) % 1 + 1) % 1, g = clamp(f / .5);
  const pulo = f < .5 ? Math.sin(Math.PI * g) : 0, giro = f < .5 ? Math.sin(Math.PI * g) * .45 * (n % 2 ? 1 : -1) : 0, am = f >= .5 && f < .62 ? Math.sin((f - .5) / .12 * Math.PI) * .08 : 0;
  const r = rng(n * 7 + 3), topo = 1 + Math.floor(r() * 6), livres = [1, 2, 3, 4, 5, 6].filter(v => v !== topo && v !== 7 - topo), esq = livres[Math.floor(r() * livres.length)], dir = livres.find(v => v !== esq && v !== 7 - esq);
  const cx = .866 * e, F = [0, 0], R = [cx, -e * .5], Lb = [-cx, -e * .5], Ft = [0, -e], Rt = [cx, -e * 1.5], Bt = [0, -e * 2], Lt = [-cx, -e * 1.5];
  const face = (P0, P1, P3, c, v) => {
    const P2 = [P1[0] + P3[0] - P0[0], P1[1] + P3[1] - P0[1]], m = (u, w) => [P0[0] + u * (P1[0] - P0[0]) + w * (P3[0] - P0[0]), P0[1] + u * (P1[1] - P0[1]) + w * (P3[1] - P0[1])];
    p.forma([P0, P1, P2, P3], c, { prof: 0 });
    for (const [u, w] of PONTOS[v]) p.forma(circP(0, 0, .105, 14).map(([a, b]) => m(u + a, w + b)), "claro", { prof: 0, liso: true });
  };
  sombraNoChao(p, 0, cx * (1.05 - pulo * .3), e * .12);
  p.em({ x: 0, y: -pulo * e * .6 - e, r: giro, sx: 1 + am, sy: 1 - am }, () => p.em({ x: 0, y: e }, () => {
    p.forma([F, R, Rt, Bt, Lt, Lb], cor, { prof: 2 });
    face(Bt, Rt, Lt, maisClaro(p, cor, .28), topo);
    face(Lt, Ft, Lb, cor, esq);
    face(Ft, Rt, F, escuro(p, cor, .22), dir);
  }));
}
function coracaoP(cx, cy, s) { return Array.from({ length: 32 }, (_, i) => { const a = i / 32 * TAU; return [cx + 16 * Math.sin(a) ** 3 * s / 32, cy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s / 30 - s * .05]; }); }
function naipe(p, tipo, x, y, s, cor) {
  if (tipo === "copas") p.forma(coracaoP(x, y, s), cor, { prof: 0, liso: true });
  else if (tipo === "ouros") p.forma([[x, y - s * .5], [x + s * .36, y], [x, y + s * .5], [x - s * .36, y]], cor, { prof: 0, liso: true });
  else if (tipo === "espadas") { p.forma(coracaoP(x, y - s * .06, s * .9).map(([a, b]) => [a, 2 * (y - s * .06) - b]), cor, { prof: 0, liso: true }); p.forma([[x, y + s * .05], [x + s * .2, y + s * .5], [x - s * .2, y + s * .5]], cor, { prof: 0, liso: true }); }
  else { for (const [dx, dy] of [[0, -.24], [-.24, .06], [.24, .06]]) p.circulo(x + dx * s, y + dy * s, s * .22, cor, { prof: 0, liso: true }); p.forma([[x, y], [x + s * .18, y + s * .5], [x - s * .18, y + s * .5]], cor, { prof: 0, liso: true }); }
}
/** Cartas de baralho em leque que respira, com o ás de copas na frente. Opções: larg, cor, k (0..1 abre o leque), t. Chaves: baralho, cartas, jogo, sorte, truque, pôquer, aposta, estratégia */
export function baralho(p, { larg = 300, cor = "c1", k = 1, t = 0 } = {}) {
  const L = larg, tt = p.ritmo(t), cw = L * .5, ch = L * .7, piv = L * .32, abre = (.2 + .04 * Math.sin(tt * 1.5)) * E.sai(clamp(k)) + .02;
  const cartas = [["paus", "tinta"], ["ouros", cor], ["espadas", "tinta"], ["copas", cor]];
  cartas.forEach(([tipo, c], i) => {
    const frente = i === 3, ang = (i - 1.5) * abre, sobe = frente ? Math.max(0, Math.sin(tt * 2)) * L * .03 : 0;
    p.em({ x: 0, y: piv, r: ang }, () => {
      const y0 = -ch * .92 - sobe, carta = retArredP(-cw / 2, y0, cw, ch, cw * .08);
      p.forma(carta, "claro", { prof: 1 });
      contorno(p, carta, L * .008);
      naipe(p, tipo, -cw / 2 + cw * .16, y0 + ch * (frente ? .24 : .14), cw * .16, c);
      if (frente) {
        p.texto("A", -cw / 2 + cw * .16, y0 + ch * .09, { tam: cw * .2, cor: c });
        p.em({ x: 0, y: y0 + ch * .55, s: 1 + .05 * Math.sin(tt * 4) }, () => naipe(p, tipo, 0, 0, cw * .5, c));
      }
    });
  });
}
/** Cavalo do xadrez que dá um pulinho de jogada e volta a assentar. Opções: alt, cor, t. Chaves: xadrez, estratégia, jogada, tática, pensar, planejamento, decisão, inteligência */
export function pecaDeXadrez(p, { alt = 360, cor = "c1", t = 0 } = {}) {
  const H = alt, tt = p.ritmo(t), f = (tt % 2.4) / 2.4, g = clamp(f / .35), pulo = f < .35 ? Math.sin(Math.PI * g) : 0, am = f >= .35 && f < .45 ? Math.sin((f - .35) / .1 * Math.PI) * .06 : 0;
  const P = pts => pts.map(([x, y]) => [x * H, y * H]);
  sombraNoChao(p, 0, H * (.3 - pulo * .08), H * .03);
  p.em({ x: 0, y: -pulo * H * .14, r: -pulo * .14 + Math.sin(tt * 1.5) * .02, sx: 1 + am, sy: 1 - am }, () => {
    const cabeca = P([[-.2, -.2], [-.15, -.34], [-.07, -.44], [-.2, -.5], [-.3, -.56], [-.33, -.63], [-.27, -.7], [-.15, -.78], [-.11, -.86], [-.06, -.96], [.0, -.88], [.08, -.86], [.18, -.76], [.24, -.6], [.26, -.42], [.23, -.2]]);
    p.forma(cabeca, cor, { prof: 2 });
    p.linha(P([[.06, -.84], [.16, -.72], [.21, -.58], [.22, -.42]]), escuro(p, cor, .3), H * .03);
    p.circulo(-.14 * H, -.68 * H, H * .028, "tinta", { prof: 0, liso: true });
    p.circulo(-.28 * H, -.6 * H, H * .016, escuro(p, cor, .4), { prof: 0, liso: true });
    p.linha(P([[-.24, -.53], [-.17, -.53]]), escuro(p, cor, .4), H * .014);
    if (p.estilo !== "pixel") p.alfa(.4, () => p.linha(P([[-.16, -.74], [-.26, -.67]]), maisClaro(p, cor, .5), H * .02));
    p.forma(retArredP(-.24 * H, -.24 * H, .48 * H, .08 * H, .03 * H), escuro(p, cor, .15), { prof: 1 });
    p.forma(retArredP(-.3 * H, -.17 * H, .6 * H, .1 * H, .03 * H), cor, { prof: 1 });
    p.forma(retArredP(-.34 * H, -.08 * H, .68 * H, .08 * H, .025 * H), escuro(p, cor, .15), { prof: 1 });
  });
}
function chama(p, x, larg, alt, tt) {
  [["c2", 1], ["claro", .55]].forEach(([cor, k], n) => {
    const pts = [[x - larg / 2 * k, 0]];
    for (let i = 1; i < 6; i++) { const px = x - larg / 2 * k + larg * k * i / 6, pico = i === 3 ? 1 : i % 2 ? .62 : .78; pts.push([px + ruido(tt * 5 + i, n + 3) * larg * .06, -alt * k * pico * (.82 + .18 * Math.sin(tt * 9 + i * 2 + n))]); }
    pts.push([x + larg / 2 * k, 0]);
    p.forma(pts, cor, { prof: 0, semente: n + 11 });
  });
}
/** Barraca de acampamento com a porta balançando e uma fogueira crepitando ao lado. Opções: larg, cor, t. Chaves: acampamento, barraca, camping, fogueira, natureza, aventura, viagem, férias */
export function acampamento(p, { larg = 420, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), A = [-w * .18, -w * .46], B = [-w * .3, -w * .5], vento = Math.sin(tt * 2.4);
  if (p.estilo !== "pixel" && p.estilo !== "traco") p.alfa(.16 + .05 * Math.sin(tt * 9), () => p.elipse(w * .3, -w * .02, w * .2, w * .05, "c2", { prof: 0, liso: true }));
  p.alfa(opaco(p, .6), () => p.linha([A, [w * .14, 0]], sobreFundo(p), w * .008));
  p.capsula(A, [A[0], A[1] - w * .1], w * .014, sobreFundo(p));
  p.forma([[A[0], A[1] - w * .1], [A[0] + w * .08 + vento * w * .01, A[1] - w * .085 + vento * w * .01], [A[0], A[1] - w * .065]], "c2", { prof: 0, liso: true });
  p.forma([[-w * .52, -w * .05], B, A, [-w * .44, 0]], escuro(p, cor, .25), { prof: 1 });
  p.forma([[-w * .44, 0], A, [w * .08, 0]], cor, { prof: 2 });
  p.forma([[A[0], -w * .3], [-w * .28, 0], [-w * .08, 0]], "tinta", { prof: 0, liso: true });
  p.forma([[A[0], -w * .3], [-w * .08, 0], [-w * .02 + vento * w * .012, 0], [A[0] + w * .02, -w * .26]], maisClaro(p, cor, .3), { prof: 0 });
  const lenha = escuro(p, "c2", .45);
  p.capsula([w * .19, -w * .012], [w * .41, -w * .06], w * .035, lenha, { prof: 1 });
  p.capsula([w * .41, -w * .012], [w * .19, -w * .06], w * .035, lenha, { prof: 1 });
  chama(p, w * .3, w * .17, w * .24, tt);
  for (const c of semear(4, 23)) { const fq = (tt * .6 + c.u) % 1; p.alfa(1 - fq, () => p.circulo(w * .3 + (c.v - .5) * w * .12 + Math.sin(tt * 3 + c.i) * w * .02, -w * .2 - fq * w * .2, w * .016, "c2", { prof: 0, liso: true })); }
  p.linha([[-w * .56, 0], [w * .5, 0]], "c3", w * .015);
}
/** Pipa no vento com a rabiola ondulando e a linha descendo até a mão. Opções: larg, cor, t. Chaves: pipa, papagaio, vento, infância, liberdade, brincadeira, céu, voar */
export function pipa(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), kh = w * .58, kx = w * .08 + Math.sin(tt * 1.3) * w * .03, ky = -w * .2 + Math.sin(tt * 1.7) * w * .035, ang = .32 + Math.sin(tt * 2) * .1;
  const T = [0, -.42 * kh], Rr = [.34 * kh, -.1 * kh], B = [0, .58 * kh], Lf = [-.34 * kh, -.1 * kh], C = [0, -.1 * kh];
  const glob = ([x, y]) => [kx + x * Math.cos(ang) - y * Math.sin(ang), ky + x * Math.sin(ang) + y * Math.cos(ang)];
  const cg = glob(C), bg = glob(B), mao = [-w * .5, w * .55];
  p.alfa(opaco(p, .75), () => p.linha(Array.from({ length: 9 }, (_, i) => { const k = i / 8; return [lerp(cg[0], mao[0], k), lerp(cg[1], mao[1], k) + Math.sin(k * Math.PI) * w * .06]; }), sobreFundo(p), w * .008));
  const rab = [bg]; for (let i = 1; i <= 10; i++) { const q = rab[i - 1]; rab.push([q[0] + w * .028 + Math.sin(tt * 4 - i * .7) * w * .02, q[1] + w * .045]); }
  p.linha(rab, sobreFundo(p), w * .01);
  for (let i = 3; i <= 10; i += 3) { const [x, y] = rab[i], c = ["c3", "c4", "c2"][(i / 3 - 1) % 3], a = Math.sin(tt * 4 - i * .7) * .5; p.em({ x, y, r: a }, () => { p.forma([[0, 0], [-w * .05, -w * .03], [-w * .05, w * .03]], c, { prof: 0, liso: true }); p.forma([[0, 0], [w * .05, -w * .03], [w * .05, w * .03]], c, { prof: 0, liso: true }); }); }
  p.em({ x: kx, y: ky, r: ang }, () => {
    p.forma([T, Rr, B, Lf], cor, { prof: 2 });
    p.forma([T, Rr, C], "c2", { prof: 0, liso: true });
    p.forma([B, Lf, C], "c2", { prof: 0, liso: true });
    p.linha([T, B], "tinta", w * .014); p.linha([Lf, Rr], "tinta", w * .014);
  });
}
/** Paleta de pintor com tintas tremendo e o pincel passando de cor em cor. Opções: larg, t. Chaves: pintura, arte, criatividade, cores, artista, desenho, design, expressão */
export function paletaDePintura(p, { larg = 380, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rx = w * .48, ry = w * .34;
  const contornoP = Array.from({ length: 56 }, (_, i) => { const a = i / 56 * TAU, d = Math.atan2(Math.sin(a - 2.75), Math.cos(a - 2.75)), rr = 1 - .3 * Math.exp(-(d * d) / .06); return [Math.cos(a) * rx * rr, Math.sin(a) * ry * rr]; });
  const furo = circP(-w * .22, w * .1, w * .055, 18);
  const tintas = [[-w * .12, -w * .18, "c1"], [w * .1, -w * .21, "c2"], [w * .29, -w * .1, "c3"], [w * .3, w * .1, "c4"]];
  const passo = tt * .6, idx = Math.floor(passo) % 4, g = passo % 1, de = tintas[idx], para = tintas[(idx + 1) % 4], mov = E.entraSai(clamp((g - .45) / .55));
  const px = lerp(de[0], para[0], mov), py = lerp(de[1], para[1], mov) - Math.sin(mov * Math.PI) * w * .1 - (g < .45 ? Math.max(0, Math.sin(g / .45 * Math.PI * 2)) * w * .03 : 0);
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .015, r: -.1 + Math.sin(tt * 1.2) * .03 }, () => {
    p.forma(contornoP, "claro", { prof: 2, furos: [furo.slice().reverse()] });
    contorno(p, contornoP, w * .009); contorno(p, furo, w * .009);
    tintas.forEach(([x, y, c], i) => { const s = 1 + .07 * Math.sin(tt * 3 + i * 1.7); p.forma(Array.from({ length: 16 }, (_, j) => { const a = j / 16 * TAU, rr = w * .07 * s * (1 + .12 * Math.sin(a * 3 + i)); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * .85]; }), c, { prof: 1, liso: true }); });
    p.em({ x: px, y: py, r: .75 }, () => {
      p.capsula([0, -w * .2], [0, -w * .5], w * .045, escuro(p, "c2", .3), { prof: 1 });
      p.forma(retP(-w * .028, -w * .2, w * .056, w * .07), "claro", { prof: 0 });
      contorno(p, retP(-w * .028, -w * .2, w * .056, w * .07), w * .006);
      p.forma([[-w * .028, -w * .13], [w * .028, -w * .13], [w * .014, -w * .04], [0, 0], [-w * .014, -w * .04]], de[2], { prof: 0, liso: true });
    });
  });
}
