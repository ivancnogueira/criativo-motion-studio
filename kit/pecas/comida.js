// Categoria: Comida e bebida
// Kit de movimento — frutas, pratos, lanches, bebidas e utensílios de cozinha, todos com vida própria
// (vapor, balanço, gota, tampa pulando). A convenção das peças está em ./_comum.js.
import { clamp, lerp, rng, mola, circP, retArredP, rotP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU, vaiVem } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
// fios de vapor que sobem ondulando e somem
const vapor = (p, x, y, alt, tt, n = 3, abre = .5) => {
  for (let i = 0; i < n; i++) {
    const f = (tt * .5 + i / n) % 1, x0 = x + (n > 1 ? i / (n - 1) - .5 : 0) * alt * abre;
    // no pixel a transparência parcial vira uma cor de fundo: lá o fio aparece inteiro ou some
    const a = Math.sin(f * Math.PI) * 1.3, px = p.estilo === "pixel";
    p.alfa(px ? (a > .45 ? 1 : 0) : a, () => p.linha(Array.from({ length: 9 }, (_, j) => [x0 + Math.sin(j * .75 + tt * 3 + i * 2) * alt * .07, y - alt * (f * .55 + j / 8 * .45)]), sobreFundo(p), Math.max(px ? 12 : 6, alt * .05)));
  }
};
// folha pontuda que sai de (x, y) com comprimento c na direção a
const folhaP = (x, y, c, a, g = .3) => rotP([...Array.from({ length: 7 }, (_, i) => [x + c * i / 6, y - Math.sin(i / 6 * Math.PI) * c * g]), ...Array.from({ length: 5 }, (_, i) => [x + c * (5 - i) / 6, y + Math.sin((5 - i) / 6 * Math.PI) * c * g])], x, y, a);
// reflexo de luz que pulsa sobre um corpo colorido
const brilho = (p, x, y, r, cor, tt, f = 0) => p.em({ x, y, r: -.7, s: 1 + .18 * Math.sin(tt * 4 + f) }, () => p.elipse(0, 0, r, r * .42, maisClaro(p, cor, .5), { prof: 0, liso: true }));
// branco de clara, arroz e miolo: "claro" é escuro no traco e no vidro, lá vira um creme bem claro
const branco = p => p.estilo === "traco" || p.estilo === "vidro" ? "#FFF4DE" : "claro";
// ovo frito visto de cima: a clara ondula e a gema desliza
const ovo = (p, R, tt, f = 0, prof = 2) => {
  p.forma(Array.from({ length: 36 }, (_, i) => { const a = i / 36 * TAU, r = R * (.84 + .09 * Math.sin(a * 3 + tt * 1.6 + f) + .06 * Math.sin(a * 5 - tt * 2.3 + f * 2)); return [Math.cos(a) * r * 1.06, Math.sin(a) * r * .94]; }), branco(p), { prof, semente: 3 });
  const gx = R * (.1 + .05 * Math.sin(tt * 2 + f)), gy = -R * .04 + R * .04 * Math.cos(tt * 2.6 + f);
  p.circulo(gx, gy, R * .38, "c2", { prof: 1, semente: 4 });
  brilho(p, gx - R * .12, gy - R * .14, R * .11, "c2", tt, f);
};
// chama de vela em forma de gota
const chamaVela = (p, x, y, s, tt, f) => p.em({ x, y, sx: 1 + .14 * Math.sin(tt * 9 + f), sy: 1 + .2 * Math.sin(tt * 7 + f * 2), r: Math.sin(tt * 5 + f) * .22 }, () => {
  p.forma([[0, -3 * s], [.75 * s, -1.6 * s], [.95 * s, -.7 * s], [.6 * s, -.05 * s], [0, .1 * s], [-.6 * s, -.05 * s], [-.95 * s, -.7 * s], [-.75 * s, -1.6 * s]], "c2", { prof: 0, liso: true });
});

// amarelo de banana, milho e queijo em cada estilo (o c2 do flat e do pixel é coral, o c4 do pixel puxa para laranja;
// no traco e no vidro um amarelo vivo)
const amarelo = p => ({ flat: "c4", pixel: "#F4D35E", traco: "#FFD84D", vidro: "#FFD970" })[p.estilo] || "c2";
// vermelho de tomate e melancia em cada estilo (o c2 do papel é ocre, o do traco laranja e o do vidro pêssego)
const vermelho = p => ({ papel: "c1", traco: "#FF5E6E", vidro: "#FF5C75" })[p.estilo] || "c2";

/* ---------------------------------------------------------------- frutas e legumes */
/** Maçã com cabinho e folha, balançando de um lado para o outro. Opções: larg, cor, folha, t. Chaves: maçã, fruta, saúde, alimentação saudável, lanche, tentação, professor, dieta */
export function maca(p, { larg = 240, cor = "c2", folha = "c3", t = 0 } = {}) {
  const w = larg, R = w / 2, tt = p.ritmo(t);
  const corpo = Array.from({ length: 40 }, (_, i) => { const a = i / 40 * TAU, s = Math.sin(a), x0 = Math.cos(a) * R, g = Math.exp(-((x0 / (R * .38)) ** 2)); return [x0 * (1 - .12 * (s + 1) / 2), -R * .9 + s * R * .9 + (s < 0 ? g * R * .22 : -g * R * .08)]; });
  p.em({ x: 0, y: 0, r: Math.sin(tt * 2.5) * .09 }, () => {
    p.capsula([0, -R * 1.5], [R * .1, -R * 2.02], R * .1, sobreFundo(p));
    p.forma(corpo, cor, { prof: 2, semente: 2 });
    p.forma(folhaP(R * .08, -R * 1.86, R * .72, -.45 + Math.sin(tt * 4) * .16, .34), folha, { prof: 1, liso: true });
    brilho(p, -R * .45, -R * 1.2, R * .2, cor, tt);
  });
}
/** Banana curva que balança como gangorra. Opções: larg, cor, t. Chaves: banana, fruta, potássio, energia, lanche, casca, escorregão, tropical */
export function banana(p, { larg = 300, cor = null, t = 0 } = {}) {
  cor = cor || amarelo(p);
  // cabo e ponta marrons; no traco e no vidro, um tom escuro da própria casca (marrom some no fundo escuro)
  const px = p.estilo === "pixel", ponta = p.estilo === "traco" || p.estilo === "vidro" ? escuro(p, cor, .5) : "#6B4526", w = larg, tt = p.ritmo(t), fora = arcoP(0, -w * .42, w * .56, 25, 155, 18), dentro = arcoP(0, -w * .75, w * .72, 135, 45, 16);
  p.em({ x: 0, y: w * .07 - Math.abs(Math.sin(tt * 2.5)) * w * .03, r: Math.sin(tt * 2.5) * .17 }, () => {
    // no pixel o cabo e a ponta escura ganham ao menos 2x2 pixels, senão somem e a banana vira um crescente qualquer
    p.capsula([w * .5, -w * .215], [w * .56, -w * .33], Math.max(px ? 26 : 0, w * .06), ponta, { prof: 1 });
    p.forma([...fora, ...dentro], cor, { prof: 2, semente: 5 });
    p.linha(arcoP(0, -w * .6, w * .665, 120, 60, 12), escuro(p, cor, .25), Math.max(px ? 12 : 0, w * .022));
    p.circulo(-w * .5, -w * .21, Math.max(px ? 14 : 0, w * .045), ponta, { prof: 0, liso: true });
    brilho(p, -w * .2, w * .0, w * .06, cor, tt);
  });
}
/** Laranja inteira e uma metade cortada que rola mostrando os gomos. Opções: larg, cor, folha, t. Chaves: laranja, fruta, cítrico, suco, vitamina C, gomos, limão, frescor */
export function laranja(p, { larg = 320, cor = "c2", folha = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .3, r = w * .22, am = .035 * Math.sin(tt * 3), rola = Math.sin(tt * 2.2) * .3;
  p.em({ x: -w * .19, y: 0, sx: 1 - am, sy: 1 + am }, () => {
    p.capsula([0, -R * 1.9], [R * .06, -R * 2.14], R * .1, sobreFundo(p));
    p.circulo(0, -R, R, cor, { prof: 2, semente: 6 });
    for (const [x, y] of [[.3, -.6], [.5, -1.1], [.1, -1.4], [-.2, -.45], [.45, -.8]]) p.circulo(x * R, y * R, R * .045, escuro(p, cor, .25), { prof: 0, liso: true });
    p.forma(folhaP(R * .05, -R * 2.0, R * .7, -.3 + Math.sin(tt * 4) * .14, .34), folha, { prof: 1, liso: true });
    brilho(p, -R * .42, -R * 1.35, R * .2, cor, tt);
  });
  p.em({ x: w * .26 + rola * r * .6, y: -r, r: rola }, () => {
    p.circulo(0, 0, r, cor, { prof: 2, semente: 7 });
    // casca branca e divisórias num tom quase branco da própria fruta: continuam claras no traco e no vidro
    const branco = maisClaro(p, cor, .75);
    p.circulo(0, 0, r * .84, branco, { prof: 0, liso: true });
    p.circulo(0, 0, r * .73, maisClaro(p, cor, .22), { prof: 0, liso: true });
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; p.linha([[Math.cos(a) * r * .1, Math.sin(a) * r * .1], [Math.cos(a) * r * .74, Math.sin(a) * r * .74]], branco, r * .08); }
  });
}
/** Cacho de uvas pendurado, balançando como pêndulo, com a folha tremendo. Opções: larg, cor, folha, t. Chaves: uva, cacho, vinho, fruta, colheita, vinhedo, abundância, safra */
export function uva(p, { larg = 220, cor = "c1", folha = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = w * .16;
  p.em({ x: 0, y: -w * .76, r: Math.sin(tt * 2.2) * .11 }, () => {
    p.capsula([0, -w * .02], [0, w * .3], w * .05, sobreFundo(p));
    p.linha(arcoP(-w * .14, w * .08, w * .1, 0, -200 - 30 * Math.sin(tt * 3), 10), folha, w * .028);
    [3, 4, 3, 2, 1].forEach((n, j) => {
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * r * 1.85, y = w * .36 + j * r * 1.52, s = 1 + .05 * Math.sin(tt * 4 + i * 1.7 + j);
        p.circulo(x, y, r * s, (i + j) % 2 ? cor : escuro(p, cor, .14), { prof: 1, semente: 10 + j * 5 + i });
        p.circulo(x - r * .32, y - r * .34, r * .2, maisClaro(p, cor, .5), { prof: 0, liso: true });
      }
    });
    p.forma(folhaP(w * .01, w * .1, w * .5, -.25 + Math.sin(tt * 4) * .12, .36), folha, { prof: 1, liso: true });
  });
}
/** Fatia de melancia em meia-lua que balança sobre a casca, com as sementes pulsando. Opções: larg, cor, casca, t. Chaves: melancia, fatia, fruta, verão, refrescante, praia, calor, férias */
export function melancia(p, { larg = 320, cor = null, casca = "c3", t = 0 } = {}) {
  cor = cor || vermelho(p);
  // faixa branca da casca: "claro" é escuro no traco e no vidro, lá vira um verde bem claro; sementes sempre escuras
  const escuroEst = p.estilo === "traco" || p.estilo === "vidro", entrecasca = escuroEst ? maisClaro(p, casca, .6) : "claro", semente = p.estilo === "vidro" ? "#2A1A24" : "tinta";
  const w = larg, R = w / 2, tt = p.ritmo(t), a = Math.sin(tt * 2.2) * .22;
  p.em({ x: a * R * .5, y: -R, r: a }, () => {
    p.forma(arcoP(0, 0, R, 0, 180, 24), casca, { prof: 2, semente: 8 });
    p.forma(arcoP(0, 0, R * .88, 0, 180, 22), entrecasca, { prof: 0, liso: true });
    p.forma(arcoP(0, 0, R * .79, 0, 180, 22), cor, { prof: 0, liso: true });
    [[-.5, .18], [-.22, .42], [.1, .2], [.42, .34], [0, .58], [.28, .56], [-.34, .2]].slice(0, 6).forEach(([x, y], i) => { const s = 1 + .2 * Math.sin(tt * 4 + i * 1.3); p.forma(folhaP(x * R, y * R - R * .07 * s, R * .15 * s, Math.PI / 2, .34), semente, { prof: 0, liso: true }); });
  });
}
/** Cenoura inclinada que quica, com as folhas abanando. Opções: larg, cor, folha, t. Chaves: cenoura, legume, horta, vegetal, salada, visão, coelho, incentivo */
export function cenoura(p, { larg = 360, cor = "c2", folha = "c3", t = 0 } = {}) {
  const L = larg, tt = p.ritmo(t), b = L * .12, y0 = -L * .2, y1 = L * .5, perfil = [[.55, 0], [.95, .04], [1, .12], [.9, .3], [.7, .52], [.45, .75], [.2, .93], [.06, 1]];
  const pt = ([fx, fy], s) => [fx * b * s, lerp(y0, y1, fy)];
  p.em({ x: -L * .02, y: L * .05 - Math.abs(Math.sin(tt * 2.6)) * L * .04, r: .7 + Math.sin(tt * 2.6) * .08 }, () => {
    [-.5, 0, .5].forEach((d, i) => p.forma(folhaP(0, y0 + L * .03, L * (i === 1 ? .36 : .3), -Math.PI / 2 + d + Math.sin(tt * 4 + i * 1.2) * .14, .22), i === 1 ? folha : escuro(p, folha, .15), { prof: 1, liso: true }));
    p.forma([...perfil.map(q => pt(q, 1)), ...perfil.slice().reverse().map(q => pt(q, -1))], cor, { prof: 2, semente: 9 });
    [[.16, -1], [.34, 1], [.52, -1], [.7, 1]].forEach(([fy, s]) => { const hw = b * (1 - fy * .82); p.linha([[s * hw * .95, lerp(y0, y1, fy)], [s * hw * .1, lerp(y0, y1, fy) + L * .012]], escuro(p, cor, .28), L * .02); });
  });
}
/** Tomate achatado com a coroa de folhas, pulando e amassando ao cair. Opções: larg, cor, folha, t. Chaves: tomate, legume, salada, molho, horta, ketchup, vermelho, feira */
export function tomate(p, { larg = 240, cor = null, folha = "c3", t = 0 } = {}) {
  cor = cor || vermelho(p);
  const w = larg, tt = p.ritmo(t), f = (tt * .9) % 1, pulo = Math.sin(clamp(f / .6) * Math.PI) * w * .14, am = f > .6 ? Math.sin((f - .6) / .4 * Math.PI) * .1 : 0;
  p.em({ x: 0, y: -pulo, sx: 1 + am, sy: 1 - am }, () => {
    p.forma(Array.from({ length: 40 }, (_, i) => { const a = i / 40 * TAU, r = 1 + .035 * Math.cos(a * 5 + 1.57); return [Math.cos(a) * w * .5 * r, -w * .4 + Math.sin(a) * w * .4 * r]; }), cor, { prof: 2, semente: 11 });
    brilho(p, -w * .26, -w * .55, w * .09, cor, tt);
    p.capsula([0, -w * .76], [w * .03, -w * .92], w * .06, folha, { prof: 1 });
    p.em({ x: 0, y: -w * .76, sy: .55, r: Math.sin(tt * 3) * .1 }, () => p.forma(estrelaP(0, 0, w * .25, w * .08, 5), folha, { prof: 0, liso: true }));
  });
}
/** Espiga de milho com a palha abanando e pipocas estourando grudadas na lateral. Opções: alt, cor, palha, t. Chaves: milho, espiga, pipoca, colheita, grão, safra, agronegócio, festa junina */
export function milho(p, { alt = 380, cor = null, palha = "c3", t = 0 } = {}) {
  cor = cor || amarelo(p);
  const a = alt, tt = p.ritmo(t), bal = Math.sin(tt * 2) * .06;
  const espiga = Array.from({ length: 32 }, (_, i) => { const g = i / 32 * TAU, c = Math.cos(g), u = (1 - Math.sin(g)) / 2; return [Math.sign(c) * Math.abs(c) ** .6 * a * .15 * (1 - .4 * u), -a * .04 + Math.sin(g) * a * .46]; });
  p.em({ x: 0, y: 0, r: bal }, () => {
    for (const s of [-1, 1]) p.forma(folhaP(0, a * .44, a * .66, -Math.PI / 2 + s * (.42 + .08 * Math.sin(tt * 3 + s)), .2), escuro(p, palha, .15), { prof: 1, liso: true });
    // espiga num tom escuro e os grãos amarelos por cima, em fileiras retas: o vão escuro entre eles é o que lê como milho
    p.forma(espiga, escuro(p, cor, .35), { prof: 2, semente: 12 });
    p.recortar(espiga, () => {
      // no pixel, menos grãos e maiores, para cada um ter pixels próprios
      const px = p.estilo === "pixel", cols = px ? [-1, 0, 1] : [-1.5, -.5, .5, 1.5], dx = px ? .082 : .062, dy = px ? .088 : .074;
      for (let j = 0; j * dy < .95; j++) for (const i of cols) p.elipse(i * a * dx, -a * .47 + j * a * dy, a * dx * .4, a * dy * .4, cor, { prof: 0, liso: true });
    });
    for (const s of [-1, 1]) p.forma(folhaP(s * a * .02, a * .47, a * .42, -Math.PI / 2 + s * (.3 + .06 * Math.sin(tt * 3.5 + s)), .3), palha, { prof: 1, liso: true });
    p.capsula([0, a * .43], [0, a * .52], a * .07, palha, { prof: 1 });
    // pipocas claras grudadas na lateral da espiga, que estouram (mola) e ficam ali pulsando
    const px = p.estilo === "pixel", rp = a * (px ? .08 : .066), pipoca = branco(p), miolo = escuro(p, cor, .1);
    [[1, -.3, .095, 0], [-1, -.12, .118, .45], [1, -.04, .12, .8]].forEach(([s, y, lw, d]) => {
      const f = (tt * .5 + d) % 1, e = mola(clamp(f * 5), { freq: 2, amort: 4 }) * (1 + .05 * Math.sin(tt * 4 + d * 9));
      p.em({ x: s * (lw * a + rp * .55), y: y * a, s: e + .001, r: d * 4 }, () => {
        p.forma(Array.from({ length: 30 }, (_, i) => { const g = i / 30 * TAU, q = rp * (.8 + .13 * Math.cos(g * 3 + d) + .07 * Math.cos(g * 7 + 1)); return [Math.cos(g) * q, Math.sin(g) * q]; }), pipoca, { prof: 1, liso: true });
        p.circulo(rp * .1, rp * .38, rp * (px ? .3 : .2), miolo, { prof: 0, liso: true });
      });
    });
  });
}

/* ---------------------------------------------------------------- pães, queijos e pratos */
/** Pão de forma fatiado: as fatias tombam como dominó e voltam, com vapor de pão quente. Opções: larg, cor, t. Chaves: pão, padaria, fatia, café da manhã, trigo, sustento, ganha-pão, torrada */
export function pao(p, { larg = 320, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = w * .2, h = w * .52, cai = vaiVem(tt, .35);
  const fatia = [[-a, 0], [a, 0], [a, -h * .55], ...Array.from({ length: 13 }, (_, i) => { const g = -i / 12 * Math.PI; return [Math.cos(g) * a * 1.22, -h * .6 + Math.sin(g) * h * .4]; }), [-a, -h * .55]];
  vapor(p, w * .08, -h * 1.02, w * .3, tt, 2, .6);
  for (let i = 0; i < 4; i++) {
    const r = -.03 - (i / 3) ** 2 * .34 * cai - .025 * Math.sin(tt * 3 + i);
    p.em({ x: w * .24 - i * w * .15, y: 0, r }, () => {
      p.forma(fatia, i % 2 ? cor : escuro(p, cor, .1), { prof: i === 3 ? 2 : 1, semente: 20 + i });
      p.em({ x: 0, y: -h * .07, s: .82 }, () => p.forma(fatia, branco(p), { prof: 0, liso: true }));
    });
  }
}
/** Fatia de queijo em cunha, com os furos pulsando e um quique. Opções: larg, cor, t. Chaves: queijo, laticínio, fatia, furos, rato, lacuna, mineiro, derivado do leite */
export function queijo(p, { larg = 320, cor = null, t = 0 } = {}) {
  cor = cor || amarelo(p);
  const w = larg, tt = p.ritmo(t), f = (tt * .8) % 1, pulo = Math.sin(clamp(f / .5) * Math.PI) * w * .06, am = f > .5 ? Math.sin((f - .5) / .5 * Math.PI) * .06 : 0, furo = escuro(p, cor, .32);
  p.em({ x: 0, y: -pulo, sx: 1 + am, sy: 1 - am }, () => {
    p.forma([[-w * .5, -w * .26], [w * .5, -w * .32], [w * .12, -w * .56]], maisClaro(p, cor, .35), { prof: 1, semente: 13 });
    p.forma([[-w * .5, 0], [w * .5, 0], [w * .5, -w * .32], [-w * .5, -w * .26]], cor, { prof: 2, semente: 14 });
    [[-.24, -.11, .06], [.1, -.17, .075], [.33, -.08, .05], [-.02, -.05, .035]].forEach(([x, y, r], i) => p.circulo(x * w, y * w, r * w * (1 + .16 * Math.sin(tt * 4 + i * 1.6)), furo, { prof: 0, liso: true }));
    p.elipse(w * .14, -w * .4, w * .07 * (1 + .14 * Math.sin(tt * 4 + 2)), w * .035, furo, { prof: 0, liso: true });
    p.forma(arcoP(-w * .5, -w * .12, w * .07, -90, 90, 8), furo, { prof: 0, liso: true });
  });
}
/** Ovo frito visto de cima: a clara ondula, a gema desliza e respingos pulsam na borda. Opções: larg, t. Chaves: ovo, ovo frito, café da manhã, proteína, gema, fritura, simples, básico */
export function ovoFrito(p, { larg = 300, t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t);
  // respingos de fritura sobre a borda da clara (mesma ondulação de ovo()): desenhados antes, a clara cobre a metade
  // de dentro e só um calombo aparece para fora, crescendo e encolhendo ali mesmo
  for (let i = 0; i < 4; i++) { const f = (tt * .9 + i / 4) % 1, a = i * 1.57 + .5, q = R * (.84 + .09 * Math.sin(a * 3 + tt * 1.6) + .06 * Math.sin(a * 5 - tt * 2.3)); p.circulo(Math.cos(a) * q * 1.06, Math.sin(a) * q * .94, R * (.035 + .05 * Math.sin(f * Math.PI)), branco(p), { prof: 0, liso: true }); }
  ovo(p, R, tt);
}
/** Pizza redonda com uma fatia saindo e puxando fios de queijo. Opções: larg, cor, k (0..1 afasta a fatia), t. Chaves: pizza, fatia, pedaço, parte, divisão, participação, delivery, jantar */
export function pizza(p, { larg = 340, cor = "c2", k = .6, t = 0 } = {}) {
  const w = larg, R = w * .42, tt = p.ritmo(t), kk = clamp(k), a0 = -78, a1 = -33, molho = maisClaro(p, cor, .5), calab = escuro(p, cor, .38), dir = (a0 + a1) / 2 * Math.PI / 180;
  const cx = -w * .05, cy = w * .05, d = kk * R * .42 + (kk > 0 ? (Math.sin(tt * 3) + 1) * R * .025 : 0), gira = Math.sin(tt * 1.5) * .04;
  const setor = (r, b0, b1) => [[0, 0], ...arcoP(0, 0, r, b0, b1)];
  const calabresa = (b0, b1, n, sem) => { const r = rng(sem); for (let i = 0; i < n; i++) { const a = lerp(b0, b1, (i + .25 + r() * .5) / n) * Math.PI / 180, q = R * (i % 2 ? .62 : .36) + r() * R * .06; p.circulo(Math.cos(a) * q, Math.sin(a) * q, R * (.085 + .012 * Math.sin(tt * 4 + i)), calab, { prof: 0, liso: true }); } };
  p.em({ x: cx, y: cy, r: gira }, () => {
    p.forma(setor(R, a1, a0 + 360), cor, { prof: 2, semente: 15 });
    p.forma(setor(R * .85, a1, a0 + 360), molho, { prof: 0, liso: true });
    for (let i = 1; i < 7; i++) { const a = (a1 + i * 45) * Math.PI / 180; p.linha([[Math.cos(a) * R * .1, Math.sin(a) * R * .1], [Math.cos(a) * R * .84, Math.sin(a) * R * .84]], escuro(p, cor, .22), R * .035); }
    calabresa(a1 + 12, a0 + 348, 10, 5);
  });
  if (kk > .04) for (const s of [-.28, .28]) { const q = R * .5, x0 = cx + Math.cos(dir + s) * q, y0 = cy + Math.sin(dir + s) * q, dx = Math.cos(dir) * d, dy = Math.sin(dir) * d; p.linha([[x0 - dx * .15, y0 - dy * .15], [x0 + dx * .5 + R * .03, y0 + dy * .5 + R * .05 * kk], [x0 + dx * 1.1, y0 + dy * 1.1]], molho, R * .035); }
  p.em({ x: cx + Math.cos(dir) * d, y: cy + Math.sin(dir) * d, r: gira + Math.sin(tt * 3) * .04 * kk }, () => {
    p.forma(setor(R, a0, a1), cor, { prof: 2, semente: 16 });
    p.forma(setor(R * .85, a0, a1), molho, { prof: 0, liso: true });
    calabresa(a0 + 8, a1 - 8, 2, 9);
  });
}
/** Hambúrguer em camadas que se abrem e fecham como sanfona. Opções: larg, cor, t. Chaves: hambúrguer, lanche, fast food, sanduíche, camadas, burger, lanchonete, combo */
export function hamburguer(p, { larg = 320, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1, ab = Math.sin(clamp(f / .55) * Math.PI), sobe = i => -ab * w * .032 * i, carne = escuro(p, "c2", .55);
  p.em({ x: 0, y: sobe(0) }, () => p.forma(retArredP(-w * .46, -w * .13, w * .92, w * .13, w * .06), cor, { prof: 2, semente: 17 }));
  p.em({ x: 0, y: sobe(1) }, () => p.forma(retArredP(-w * .49, -w * .27, w * .98, w * .15, w * .07), carne, { prof: 1, semente: 18 }));
  p.em({ x: 0, y: sobe(2) }, () => p.forma([[-w * .48, -w * .32], [w * .48, -w * .32], [w * .48, -w * .27], [w * .34, -w * .27], [w * .24, -w * .19], [w * .14, -w * .27], [-w * .18, -w * .27], [-w * .28, -w * .21], [-w * .38, -w * .27], [-w * .48, -w * .27]], "c4", { prof: 0, liso: true }));
  p.em({ x: 0, y: sobe(3) }, () => p.forma(retArredP(-w * .45, -w * .385, w * .9, w * .075, w * .035), "c1", { prof: 1, liso: true }));
  p.em({ x: 0, y: sobe(4) }, () => p.forma([[-w * .5, -w * .445], [w * .5, -w * .445], ...Array.from({ length: 21 }, (_, j) => [lerp(w * .5, -w * .5, j / 20), -w * .395 + Math.sin(j / 20 * Math.PI * 9 + tt * 2) * w * .022])], "c3", { prof: 1, liso: true }));
  p.em({ x: 0, y: sobe(5) }, () => {
    p.forma([...Array.from({ length: 19 }, (_, i) => { const g = Math.PI + i / 18 * Math.PI; return [Math.cos(g) * w * .48, -w * .47 + Math.sin(g) * w * .3]; }), [w * .46, -w * .43], [-w * .46, -w * .43]], cor, { prof: 2, semente: 19 });
    [[-.26, -.56, .4], [-.08, -.68, -.3], [.12, -.6, .5], [.28, -.53, -.4], [.02, -.52, .1]].forEach(([x, y, r]) => p.capsula([x * w - Math.cos(r) * w * .022, y * w - Math.sin(r) * w * .022], [x * w + Math.cos(r) * w * .022, y * w + Math.sin(r) * w * .022], w * .034, "claro"));
  });
}
/** Caixinha de batata frita com os palitos balançando e um deles pulando para fora. Opções: larg, cor, batata, t. Chaves: batata frita, fritas, fast food, lanche, porção, acompanhamento, petisco, combo */
export function batataFrita(p, { larg = 260, cor = "c1", batata = "c2", t = 0 } = {}) {
  const w = larg, h = w * .8, tt = p.ritmo(t), r = rng(31), vez = Math.floor(tt * .8) % 7, fp = (tt * .8) % 1;
  p.forma([[-w * .37, -h * .86], ...Array.from({ length: 9 }, (_, i) => [lerp(-w * .37, w * .37, i / 8), -h * .86 - Math.sin(i / 8 * Math.PI) * h * .1]), [w * .31, -h * .3], [-w * .31, -h * .3]], escuro(p, cor, .28), { prof: 1, semente: 21 });
  for (let i = 0; i < 7; i++) {
    const len = h * (.72 + r() * .26), pulo = i === vez ? Math.sin(fp * Math.PI) * h * .22 : 0, bob = Math.sin(tt * 3 + i * 1.3) * h * .03;
    p.em({ x: lerp(-w * .28, w * .28, i / 6), y: -h * .3, r: (i - 3) * .085 + Math.sin(tt * 2.5 + i) * .03 }, () => p.forma(retArredP(-w * .048, -len - bob - pulo, w * .096, len, w * .02), i % 2 ? batata : maisClaro(p, batata, .28), { prof: 1, semente: 40 + i }));
  }
  p.forma([...Array.from({ length: 11 }, (_, i) => [lerp(-w * .4, w * .4, i / 10), -h * .74 + Math.sin(i / 10 * Math.PI) * h * .15]), [w * .3, 0], [-w * .3, 0]], cor, { prof: 2, semente: 22 });
  p.circulo(0, -h * .28, w * .1 * (1 + .06 * Math.sin(tt * 4)), "claro", { prof: 0, liso: true });
}
/** Prato feito visto de cima: arroz, feijão borbulhando, ovo frito e salada, com vapor subindo. Opções: larg, cor, t. Chaves: prato feito, almoço, refeição, arroz e feijão, comida caseira, marmita, restaurante, PF */
export function pratoFeito(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), feijao = escuro(p, "c2", .6);
  p.em({ x: 0, y: R * .12, r: Math.sin(tt * 1.4) * .04 }, () => {
    p.circulo(0, 0, R, cor, { prof: 2, semente: 23 });
    p.circulo(0, 0, R * .8, maisClaro(p, cor, .4), { prof: 0, liso: true });
    // arroz branco (creme claro nos estilos escuros), com grãos num creme um pouco mais fechado
    const arroz = branco(p), grao = arroz === "claro" ? escuro(p, "claro", .22) : "#E6D3AE";
    for (const [x, y, r] of [[-.36, -.3, .24], [-.12, -.42, .22], [-.44, -.08, .2], [-.18, -.18, .24]]) p.circulo(x * R, y * R, r * R, arroz, { prof: 1, semente: 50 + Math.round(x * 10) });
    for (const [x, y, a] of [[-.4, -.3, .4], [-.2, -.4, -.5], [-.3, -.12, 1.2], [-.08, -.26, .1], [-.5, -.1, -.9]]) p.linha([[x * R - Math.cos(a) * R * .04, y * R - Math.sin(a) * R * .04], [x * R + Math.cos(a) * R * .04, y * R + Math.sin(a) * R * .04]], grao, R * .03);
    p.forma(Array.from({ length: 24 }, (_, i) => { const a = i / 24 * TAU, r = R * (.3 + .03 * Math.sin(a * 4 + tt * 2)); return [-R * .26 + Math.cos(a) * r * 1.15, R * .34 + Math.sin(a) * r * .85]; }), feijao, { prof: 1, semente: 24 });
    for (let i = 0; i < 6; i++) { const a = i * 1.1, q = R * (.08 + (i % 3) * .07), s = 1 + .3 * Math.sin(tt * 5 + i * 1.9); p.elipse(-R * .26 + Math.cos(a) * q * 1.2, R * .34 + Math.sin(a) * q * .8, R * .055 * s, R * .038 * s, maisClaro(p, feijao, .3), { prof: 0, liso: true }); }
    for (const [x, y, a] of [[.2, .5, -.5], [.44, .36, -1.1]]) p.forma(folhaP(x * R, y * R, R * .4, a + Math.sin(tt * 3 + x * 9) * .06, .42), "c3", { prof: 1, liso: true });
    for (const [x, y] of [[.5, .12], [.3, .26]]) { p.circulo(x * R, y * R, R * .13, "c2", { prof: 1, liso: true }); p.circulo(x * R, y * R, R * .06, maisClaro(p, "c2", .4), { prof: 0, liso: true }); }
    p.em({ x: R * .3, y: -R * .3 }, () => ovo(p, R * .34, tt, 1, 1));
  });
  vapor(p, 0, -R * .5, R * .75, tt, 3, .9);
}
/** Espetinho de churrasco com os pedaços girando no palito e a fumaça subindo. Opções: larg, cor, t. Chaves: espeto, espetinho, churrasco, carne, brasa, churrasqueira, confraternização, fim de semana */
export function espeto(p, { larg = 400, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), carne = escuro(p, cor, .4), g = w * .13;
  vapor(p, 0, -w * .1, w * .3, tt, 3, 1.5);
  p.em({ x: 0, y: w * .12, r: -.2 + Math.sin(tt * 2) * .04 }, () => {
    p.forma([[-w * .5, -w * .016], [w * .44, -w * .016], [w * .5, 0], [w * .44, w * .016], [-w * .5, w * .016]], "c4", { prof: 1, liso: true });
    p.circulo(-w * .47, 0, w * .04, "c4", { prof: 1, liso: true });
    for (let i = 0; i < 5; i++) {
      const x = -w * .3 + i * w * .15, sy = .8 + .2 * Math.cos(tt * 2.4 + i * .9), tipo = i % 4;
      p.em({ x, y: Math.sin(tt * 2.4 + i * .9) * w * .008, sy }, () => {
        if (tipo === 0) { p.forma(retArredP(-g / 2, -g * .6, g, g * 1.2, g * .2), carne, { prof: 2, semente: 60 + i }); for (const d of [-.25, .2]) p.linha([[-g * .3, g * (d + .15)], [g * .3, g * (d - .15)]], escuro(p, cor, .7), w * .016); }
        else if (tipo === 1) { p.elipse(0, 0, g * .42, g * .62, "claro", { prof: 2, semente: 60 + i }); p.linha(arcoP(0, 0, g * .3, -60, 60, 6).map(([a, b]) => [a * .8, b * 1.4]), escuro(p, "claro", .25), w * .014); }
        else if (tipo === 2) p.forma(retArredP(-g * .42, -g * .56, g * .84, g * 1.12, g * .3), "c3", { prof: 2, semente: 60 + i });
        else { p.circulo(0, 0, g * .55, "c2", { prof: 2, semente: 60 + i }); brilho(p, -g * .15, -g * .2, g * .14, "c2", tt, i); }
      });
    }
  });
}

/* ---------------------------------------------------------------- doces */
/** Sorvete de casquinha com duas bolas, cereja e uma gota que escorre e pinga. Opções: alt, cor, sabor, sabor2, t. Chaves: sorvete, casquinha, sobremesa, verão, doce, gelado, derretendo, prazo */
export function sorvete(p, { alt = 380, cor = "c2", sabor = "c1", sabor2 = "c3", t = 0 } = {}) {
  const a = alt, tt = p.ritmo(t), bal = Math.sin(tt * 2.2) * .05, cone = [[-a * .2, -a * .53], [a * .2, -a * .53], [0, 0]], f = (tt * .55) % 1;
  p.em({ x: 0, y: 0, r: bal }, () => {
    p.forma(cone, cor, { prof: 2, semente: 25 });
    p.recortar(cone, () => { for (let i = -3; i < 7; i++) { p.linha([[-a * .3 + i * a * .09, -a * .56], [-a * .02 + i * a * .09, 0]], escuro(p, cor, .25), a * .018); p.linha([[a * .3 - i * a * .09, -a * .56], [a * .02 - i * a * .09, 0]], escuro(p, cor, .25), a * .018); } });
    // gota: escorre pela casquinha e depois cai
    const gx = f < .55 ? lerp(a * .1, a * .085, f / .55) : a * .085, gy = f < .55 ? lerp(-a * .5, -a * .3, f / .55) : lerp(-a * .3, -a * .02, ((f - .55) / .45) ** 2);
    p.capsula([a * .1, -a * .52], [gx, Math.min(gy, -a * .3)], a * .05, sabor);
    p.alfa(f > .93 ? (1 - f) / .07 : 1, () => p.circulo(gx, gy, a * .036, sabor, { prof: 0, liso: true }));
    p.circulo(0, -a * .61, a * .2, sabor, { prof: 2, semente: 26 });
    for (const x of [-.15, -.05, .1, .17]) p.circulo(x * a, -a * .52, a * .06, sabor, { prof: 0, liso: true });
    p.em({ x: 0, y: -a * .61, r: Math.sin(tt * 2.2 + .6) * .1 }, () => {
      p.circulo(0, -a * .21, a * .165, sabor2, { prof: 2, semente: 27 });
      for (const x of [-.12, 0, .12]) p.circulo(x * a, -a * .1, a * .055, sabor2, { prof: 0, liso: true });
      brilho(p, -a * .07, -a * .27, a * .04, sabor2, tt);
      p.linha([[0, -a * .37], [a * .03, -a * .45]], sobreFundo(p), a * .016);
      p.circulo(0, -a * .385, a * .05, "c1", { prof: 1, liso: true });
    });
  });
}
/** Bolo de festa com cobertura escorrida e três velas de chama tremulando. Opções: larg, cor, cobertura, t. Chaves: bolo, aniversário, festa, comemoração, parabéns, celebração, vela, conquista */
export function bolo(p, { larg = 320, cor = "c1", cobertura = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), am = .02 * Math.sin(tt * 3);
  p.elipse(0, -w * .035, w * .5, w * .05, "c4", { prof: 1, liso: true });
  p.em({ x: 0, y: -w * .05, sx: 1 + am, sy: 1 - am }, () => {
    p.forma(retArredP(-w * .4, -w * .4, w * .8, w * .4, w * .03), cor, { prof: 2, semente: 28 });
    p.forma(retArredP(-w * .4, -w * .19, w * .8, w * .05, w * .01), "c2", { prof: 0, liso: true });
    [-.2, 0, .2].forEach((x, i) => {
      p.forma(retArredP(x * w - w * .025, -w * .6, w * .05, w * .18, w * .01), "c3", { prof: 1, liso: true });
      chamaVela(p, x * w, -w * .615, w * .034, tt, i * 2.1);
    });
    p.forma([...retArredP(-w * .43, -w * .47, w * .86, w * .12, w * .05).slice(0, 6), ...Array.from({ length: 41 }, (_, j) => { const u = j / 40, e = Math.abs(Math.sin(u * Math.PI * 5)); return [lerp(w * .43, -w * .43, u), -w * .37 + e * w * (.05 + .05 * ((Math.floor(u * 5) * 3) % 4) / 3 + .008 * Math.sin(tt * 3 + Math.floor(u * 5)))]; }), ...retArredP(-w * .43, -w * .47, w * .86, w * .12, w * .05).slice(18)], cobertura, { prof: 1, liso: true });
  });
}
/** Rosquinha com cobertura e granulado, girando devagar e quicando. Opções: larg, cor, cobertura, t. Chaves: rosquinha, donut, doce, sobremesa, confeitaria, guloseima, açúcar, tentação */
export function rosquinha(p, { larg = 280, cor = "c2", cobertura = "c1", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), r = rng(77), cores = ["claro", "c3", "c4"];
  p.em({ x: 0, y: -Math.abs(Math.sin(tt * 2.4)) * R * .08 + R * .04, r: tt * .35, s: 1 + .02 * Math.sin(tt * 4.8) }, () => {
    p.forma(circP(0, 0, R * .96, 40), cor, { prof: 2, semente: 29, furos: [circP(0, 0, R * .27, 20).reverse()] });
    p.forma(Array.from({ length: 56 }, (_, i) => { const a = i / 56 * TAU, q = R * (.79 + .055 * Math.sin(a * 7)); return [Math.cos(a) * q, Math.sin(a) * q]; }), cobertura, { prof: 0, liso: true, furos: [circP(0, 0, R * .36, 20).reverse()] });
    for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + r() * .3, q = R * (.47 + r() * .2), g = r() * 3.14 + Math.sin(tt * 3 + i) * .3, x = Math.cos(a) * q, y = Math.sin(a) * q; p.capsula([x - Math.cos(g) * R * .055, y - Math.sin(g) * R * .055], [x + Math.cos(g) * R * .055, y + Math.sin(g) * R * .055], R * .05, cores[i % 3]); }
  });
}

/* ---------------------------------------------------------------- bebidas */
/** Xícara de café no pires, com o vapor subindo e a bebida ondulando. Opções: larg, cor, t. Chaves: café, xícara, cafezinho, pausa, manhã, energia, reunião, acordar */
export function cafe(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), liq = escuro(p, "c2", .6);
  vapor(p, 0, -w * .57, w * .36, tt, 3, .5);
  p.elipse(0, -w * .035, w * .5, w * .05, "claro", { prof: 1, liso: true });
  p.em({ x: 0, y: -w * .03, r: Math.sin(tt * 2) * .015 }, () => {
    p.linha(arcoP(w * .28, -w * .3, w * .11, -85, 85, 10), cor, w * .055);
    p.forma([[-w * .3, -w * .5], [w * .3, -w * .5], [w * .285, -w * .28], [w * .23, -w * .12], [w * .13, -w * .03], [-w * .13, -w * .03], [-w * .23, -w * .12], [-w * .285, -w * .28]], cor, { prof: 2, semente: 30 });
    p.elipse(0, -w * .5, w * .3, w * .06, maisClaro(p, cor, .3), { prof: 0, liso: true });
    p.elipse(0, -w * .495, w * .25, w * .04, liq, { prof: 0, liso: true });
    p.linha(Array.from({ length: 7 }, (_, i) => [lerp(-w * .12, w * .12, i / 6), -w * .495 + Math.sin(i * 1.1 + tt * 4) * w * .008]), maisClaro(p, liq, .35), w * .016);
    brilho(p, -w * .17, -w * .3, w * .06, cor, tt);
  });
}
/** Copo de suco que enche até o nível k, com a superfície ondulando, bolhas e canudo. Opções: alt, cor, k (0..1 nível do suco), t. Chaves: suco, copo, bebida, refresco, sede, encher, nível, meio cheio */
export function copoDeSuco(p, { alt = 340, cor = "c2", k = .75, t = 0 } = {}) {
  const a = alt, tt = p.ritmo(t), kk = clamp(k), topo = -a * .8, vidro = [[-a * .2, topo], [a * .2, topo], [a * .15, 0], [-a * .15, 0]], nivel = -a * (.03 + kk * .68);
  // vidro translúcido; no pixel a transparência vira mancha, então lá o copo se lê só pelo contorno
  if (p.estilo !== "pixel") p.alfa(.35, () => p.forma(vidro, "claro", { prof: 1, liso: true }));
  if (kk > 0) p.recortar(vidro, () => {
    p.forma([...Array.from({ length: 13 }, (_, i) => [lerp(-a * .22, a * .22, i / 12), nivel + Math.sin(i * .9 + tt * 4) * a * .012]), [a * .22, a * .01], [-a * .22, a * .01]], cor, { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) { const f = (tt * .6 + i * .27) % 1; p.circulo((i - 1.5) * a * .07 + Math.sin(tt * 3 + i) * a * .01, lerp(-a * .03, nivel + a * .03, f), a * .024, maisClaro(p, cor, .55), { prof: 0, liso: true }); }
  });
  p.capsula([a * .0, -a * .1], [a * .15 + Math.sin(tt * 2) * a * .012, -a * 1.0], a * .04, "c1", { prof: 1 });
  p.linha([vidro[0], vidro[3], vidro[2], vidro[1]], sobreFundo(p), Math.max(p.estilo === "pixel" ? 12 : 6, a * .018));
  p.em({ x: -a * .2, y: topo, r: Math.sin(tt * 2.2) * .25 }, () => {
    const branco = maisClaro(p, cor, .75);
    p.circulo(0, 0, a * .095, cor, { prof: 1, liso: true }); p.circulo(0, 0, a * .075, branco, { prof: 0, liso: true }); p.circulo(0, 0, a * .06, maisClaro(p, cor, .2), { prof: 0, liso: true });
    for (let i = 0; i < 3; i++) { const g = i / 3 * Math.PI; p.linha([[-Math.cos(g) * a * .06, -Math.sin(g) * a * .06], [Math.cos(g) * a * .06, Math.sin(g) * a * .06]], branco, a * .014); }
  });
}
/** Garrafa com rótulo e tampa: balança de leve enquanto o líquido ondula e solta bolhas. Opções: alt, cor, k (0..1 nível do líquido), t. Chaves: garrafa, bebida, refrigerante, vinho, cerveja, água, embalagem, gargalo */
export function garrafa(p, { alt = 400, cor = "c3", k = .72, t = 0 } = {}) {
  const a = alt, tt = p.ritmo(t), kk = clamp(k), bal = Math.sin(tt * 2) * .05, lado = [[.12, 0], [.14, -.03], [.14, -.5], [.13, -.56], [.1, -.62], [.065, -.67], [.048, -.72], [.048, -.92]];
  const corpo = [...lado.map(([x, y]) => [x * a, y * a]), ...lado.slice().reverse().map(([x, y]) => [-x * a, y * a])], nivel = -a * (.04 + kk * .62);
  p.em({ x: 0, y: 0, r: bal }, () => {
    p.forma(corpo, cor, { prof: 2, semente: 32 });
    if (kk > 0) p.recortar(corpo, () => {
      p.forma([...Array.from({ length: 9 }, (_, i) => [lerp(-a * .15, a * .15, i / 8), nivel + Math.sin(i * 1.1 + tt * 4) * a * .01 - bal * (i - 4) * a * .05]), [a * .15, a * .01], [-a * .15, a * .01]], escuro(p, cor, .28), { prof: 0, liso: true });
      for (let i = 0; i < 3; i++) { const f = (tt * .7 + i / 3) % 1; p.circulo((i - 1) * a * .06, lerp(-a * .04, nivel + a * .03, f), a * .022, maisClaro(p, cor, .45), { prof: 0, liso: true }); }
    });
    p.forma(retArredP(-a * .14, -a * .42, a * .28, a * .22, a * .01), "claro", { prof: 0, liso: true });
    p.circulo(0, -a * .31, a * .06 * (1 + .08 * Math.sin(tt * 4)), "c1", { prof: 0, liso: true });
    p.capsula([-a * .095, -a * .46], [-a * .095, -a * .54], a * .03, maisClaro(p, cor, .5));
    p.forma(retArredP(-a * .065, -a * .985, a * .13, a * .075, a * .015), "c2", { prof: 1, liso: true });
  });
}

/* ---------------------------------------------------------------- utensílios */
/** Panela no fogo com a tampa pulando e o vapor escapando. Opções: larg, cor, t. Chaves: panela, cozinhar, fervendo, pressão, cozinha, preparo, caldeirão, sob pressão */
export function panela(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * 1.1) % 1, up = Math.sin(clamp(f / .45) * Math.PI), inc = Math.sin(Math.floor(tt * 1.1) * 2.3) * .14 * up;
  vapor(p, 0, -w * .56, w * .34, tt, 3, 1.3);
  for (const s of [-1, 1]) p.forma(retArredP(s > 0 ? w * .36 : -w * .5, -w * .37, w * .14, w * .075, w * .03), "c1", { prof: 1, liso: true });
  p.forma([[-w * .38, -w * .42], [w * .38, -w * .42], [w * .37, -w * .07], [w * .31, 0], [-w * .31, 0], [-w * .37, -w * .07]], cor, { prof: 2, semente: 33 });
  p.capsula([-w * .27, -w * .32], [-w * .27, -w * .12], w * .035, maisClaro(p, cor, .5));
  p.forma(retArredP(-w * .41, -w * .46, w * .82, w * .065, w * .03), escuro(p, cor, .2), { prof: 1, liso: true });
  p.em({ x: 0, y: -w * .46 - up * w * .09, r: inc }, () => {
    p.circulo(0, -w * .15, w * .05, "c1", { prof: 1, liso: true });
    p.forma([...Array.from({ length: 17 }, (_, i) => { const g = Math.PI + i / 16 * Math.PI; return [Math.cos(g) * w * .4, Math.sin(g) * w * .13]; }), [w * .4, w * .02], [-w * .4, w * .02]], maisClaro(p, cor, .22), { prof: 1, semente: 34 });
  });
}
/** Frigideira vista de cima sendo sacudida, com um ovo fritando e chiando dentro. Opções: larg, cor, t. Chaves: frigideira, fritar, cozinhar, fogão, fritura, cozinha, preparo, mão na massa */
export function frigideira(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .3, f = (tt * .6) % 1, sac = f < .5 ? Math.sin(tt * 16) * w * .014 * (1 - f * 2) : 0;
  p.em({ x: sac - w * .02, y: 0, r: .32 + Math.sin(tt * 2) * .04 }, () => {
    p.forma(retArredP(w * .02, -w * .05, w * .5, w * .1, w * .05), "c1", { prof: 1, semente: 35 });
    p.circulo(w * .46, 0, w * .022, "claro", { prof: 0, liso: true });
    p.circulo(-w * .2, 0, R, cor, { prof: 2, semente: 36 });
    p.circulo(-w * .2, 0, R * .84, escuro(p, cor, .35), { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) { const g = (tt * 1.1 + i / 4) % 1, a = i * 1.6 + Math.floor(tt * 1.1 + i / 4) * 2.1; p.circulo(-w * .2 + Math.cos(a) * R * .62, Math.sin(a) * R * .62, R * .07 * Math.sin(g * Math.PI) + .01, "claro", { prof: 0, liso: true }); }
    p.em({ x: -w * .2 - sac * 1.5, y: Math.sin(tt * 2.4) * R * .04 }, () => ovo(p, R * .5, tt, 2, 1));
  });
}
/** Garfo e faca cruzados que abrem e fecham como tesoura, com um brilho na ponta. Opções: alt, cor, t. Chaves: talheres, garfo, faca, refeição, restaurante, almoço, jantar, fome */
export function talheres(p, { alt = 360, cor = "c4", t = 0 } = {}) {
  const a = alt, tt = p.ritmo(t), ang = .5 + .1 * Math.sin(tt * 2.6), f = (tt * .8) % 1;
  p.em({ x: 0, y: 0, r: ang }, () => {
    p.capsula([0, a * .48], [0, a * .06], a * .07, escuro(p, cor, .25), { prof: 1 });
    p.forma([[-a * .045, a * .08], [a * .05, a * .08], [a * .068, -a * .2], [a * .045, -a * .4], [-a * .045, -a * .5]], cor, { prof: 2, semente: 37 });
  });
  p.em({ x: 0, y: 0, r: -ang }, () => {
    for (const x of [-.068, 0, .068]) p.capsula([x * a, -a * .22], [x * a, -a * .49], a * .036, cor, { prof: 1 });
    p.forma(retArredP(-a * .087, -a * .28, a * .174, a * .16, a * .05), cor, { prof: 1, semente: 38 });
    p.capsula([0, a * .48], [0, -a * .16], a * .06, cor, { prof: 1 });
  });
  p.em({ x: Math.sin(ang) * a * .47 + a * .05, y: -Math.cos(ang) * a * .47, s: Math.sin(f * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, a * .09, a * .028, 4), sobreFundo(p), { prof: 0, liso: true }));
}

/** Café e pão animados para o café da manhã. Chaves: café, pão, manhã, comida */
export function cafeDaManha(p, { t = 0 } = {}) {
  p.em({ x: -85, s: .55 }, () => cafe(p, { t }));
  p.em({ x: 85, s: .55 }, () => pao(p, { t }));
}
