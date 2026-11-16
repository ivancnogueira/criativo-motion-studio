// Categoria: Tecnologia
// Kit de movimento — aparelhos, telas, redes e máquinas: tudo com luz piscando, tela andando ou sinal saindo.
// O que fica no chão tem a base em y = 0; ícones e aparelhos de mão ficam centrados na origem.
// A convenção das peças está em ./_comum.js. (celular, computador, bateria e rede estão em ./base.js.)
import { clamp, lerp, rng, E, mola, circP, retP, retArredP, misturarCor, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU, ciclo, vaiVem } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (local) */
const HEX6 = /^#[0-9a-f]{6}$/i;
/** Versão apagada de uma cor: puxa para o fundo (LED desligado, barra de sinal sem força). */
const apagado = (p, cor, k = .65) => { const a = p.cor(cor), b = p.cor("fundo"); return HEX6.test(a) && HEX6.test(b) ? misturarCor(a, b, k) : a; };
/** Tela de aparelho: fundo "claro" e o conteúdo de `fn` recortado dentro dela. */
function visor(p, x, y, w, h, r, fn) { const pts = r ? retArredP(x, y, w, h, r) : retP(x, y, w, h); p.forma(pts, "claro", { prof: 0, liso: true }); p.recortar(pts, fn); }
/** Linhas de código sendo digitadas, com recuos e cursor piscando no fim da linha atual. */
function linhasDigitadas(p, x, y, w, h, tt, n = 5) {
  const dy = h / n, f = (tt * 2.4) % (n + 2.5) + .5, lw = Math.max(6, dy * .3), cores = ["c1", "tinta", "c3", "c2"];
  let cx = x, cy = y + dy * .5;
  for (let i = 0; i < n; i++) {
    const k = clamp(f - i); if (k <= 0) break;
    const rec = [0, 1, 2, 1, 0, 1][i % 6] * w * .1, comp = w * (.3 + ((i * 37) % 35) / 100) * k, yy = y + dy * (i + .5);
    p.linha([[x + rec, yy], [x + rec + Math.max(comp, 2), yy]], cores[i % 4], lw);
    cx = x + rec + comp + lw; cy = yy;
  }
  if (f < n ? true : Math.sin(tt * 10) > 0) p.forma(retP(cx, cy - dy * .32, lw * .9, dy * .64), "c2", { prof: 0, liso: true });
}
/** Ondas de sinal: arcos que nascem em (x, y), crescem e somem. */
function ondas(p, x, y, r0, r1, a0, a1, cor, lw, tt, n = 3, vel = 1.2) {
  for (let i = 0; i < n; i++) { const f = (tt * vel + i / n) % 1; p.alfa(1 - f * .85, () => p.linha(arcoP(x, y, lerp(r0, r1, f), a0, a1, 10), cor, lw)); }
}
/** Balão de conversa em uma forma só, com a ponta embaixo do lado `lado` (1 direita, -1 esquerda). */
function bolha(x, y, w, h, r, lado) {
  const pts = retArredP(x, y, w, h, r);
  const ponta = lado > 0 ? [[x + w - r * .5, y + h + r * .8], [x + w - r * 2, y + h]] : [[x + r * 2, y + h], [x + r * .5, y + h + r * .8]];
  return [...pts.slice(0, 12), ...ponta, ...pts.slice(12)];
}

/* ---------------------------------------------------------------- peças */
/** Notebook aberto com código sendo digitado na tela e cursor piscando. Opções: larg, cor, t. Chaves: notebook, laptop, computador, trabalho remoto, home office, programar, estudar, digitar */
export function notebook(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), sx = -w * .39, sy = -w * .63, sw = w * .78, sh = w * .53, m = w * .035;
  p.forma(retArredP(sx, sy, sw, sh, w * .035), cor, { prof: 2 });
  visor(p, sx + m, sy + m, sw - m * 2, sh - m * 2, 0, () => linhasDigitadas(p, sx + m * 2, sy + m * 1.6, sw - m * 4, sh - m * 3.4, tt, 5));
  p.forma([[-w * .39, -w * .1], [w * .39, -w * .1], [w * .5, -w * .03], [w * .5, 0], [-w * .5, 0], [-w * .5, -w * .03]], cor, { prof: 2 });
  for (let i = 0; i < 2; i++) p.linha([[-w * (.34 + i * .04), -w * (.078 - i * .022)], [w * (.34 + i * .04), -w * (.078 - i * .022)]], "tinta", w * .014);
  p.forma(retArredP(-w * .09, -w * .034, w * .18, w * .022, w * .01), "tinta", { prof: 0, liso: true });
  if (Math.sin(tt * 4) > -.3) p.circulo(w * .43, -w * .02, w * .018, "c2", { prof: 0, liso: true });
}
/** Tablet deitado com grade de aplicativos; um ícone por vez é tocado e pulsa. Opções: larg, cor, t. Chaves: tablet, ipad, aplicativos, tela de toque, apps, leitura digital, tocar, dispositivo */
export function tablet(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, h = w * .72, tt = p.ritmo(t), m = w * .05, tw = w * .82, th = h - m * 2, x0 = -w / 2 + m, y0 = -h / 2 + m;
  const ativo = Math.floor(tt * 1.4) % 12, f = (tt * 1.4) % 1, cores = ["c3", "c4", "c2", "c1"];
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .015, r: -.05 + Math.sin(tt * 1.3) * .03 }, () => {
    p.forma(retArredP(-w / 2, -h / 2, w, h, w * .07), cor, { prof: 3 });
    visor(p, x0, y0, tw, th, w * .03, () => {
      for (let i = 0; i < 12; i++) {
        const cx = x0 + tw * ((i % 4) + .5) / 4, cy = y0 + th * (Math.floor(i / 4) + .5) / 3, s = w * .12 * (i === ativo ? 1 + .25 * Math.sin(f * Math.PI) : 1);
        p.forma(retArredP(cx - s / 2, cy - s / 2, s, s, s * .28), i === ativo ? "c2" : cores[(i * 7 + 1) % 3 === 2 ? 3 : (i * 7 + 1) % 3], { prof: 0, liso: true });
      }
      const ax = x0 + tw * ((ativo % 4) + .5) / 4, ay = y0 + th * (Math.floor(ativo / 4) + .5) / 3;
      p.alfa(1 - f, () => p.linha(circP(ax, ay, w * (.07 + f * .08), 20), "tinta", w * .014, { fechar: true }));
    });
    p.circulo(w / 2 - m * 1.25, 0, w * .024, "tinta", { prof: 0, liso: true });
  });
}
/** Torre de servidor com gavetas, luzes piscando e barras de atividade. Opções: alt, cor, n (gavetas), t. Chaves: servidor, data center, hospedagem, banco de dados, infraestrutura, armazenamento, backup, sistema */
export function servidor(p, { alt = 380, cor = "c4", n = 4, t = 0 } = {}) {
  const h = alt, w = h * .66, tt = p.ritmo(t), m = w * .06, uh = (h - m * 2) / n;
  p.forma(retArredP(-w / 2, -h, w, h, w * .06), cor, { prof: 2 });
  for (let i = 0; i < n; i++) {
    const y = -h + m + i * uh, cy = y + uh * .5;
    p.forma(retArredP(-w / 2 + m, y + uh * .09, w - m * 2, uh * .82, w * .035), "tinta", { prof: 0, liso: true });
    for (let j = 0; j < 2; j++) { const liga = Math.sin(tt * (5 + i * 1.7 + j * 2.3) + i * 2 + j) > (j ? .2 : -.5); p.circulo(-w * .31 + j * w * .12, cy, w * .036, liga ? (j ? "c2" : "c3") : apagado(p, j ? "c2" : "c3", .7), { prof: 0, liso: true }); }
    const k = .25 + .75 * vaiVem(tt + i * .37, .45 + i * .13);
    p.linha([[-w * .06, cy], [w * .34, cy]], apagado(p, cor, .55), w * .05);
    p.linha([[-w * .06, cy], [-w * .06 + w * .4 * k, cy]], cor, w * .05);
  }
}
/** Roteador com antenas, luzes piscando e ondas de sinal subindo. Opções: larg, cor, t. Chaves: roteador, wi-fi, internet, rede, conexão, banda larga, modem, sinal */
export function roteador(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bh = w * .2, y0 = -bh - w * .04;
  for (const s of [-1, 1]) { const bal = Math.sin(tt * 2 + s) * .03; p.capsula([s * w * .33, y0 + w * .02], [s * w * (.42 + bal), y0 - w * .42], w * .05, escuro(p, cor, .3)); p.circulo(s * w * (.42 + bal), y0 - w * .42, w * .04, "c2", { prof: 0, liso: true }); }
  ondas(p, 0, y0 - w * .02, w * .1, w * .46, 222, 318, "c2", w * .04, tt);
  for (const s of [-1, 1]) p.forma(retP(s * w * .34 - w * .05, -w * .05, w * .1, w * .05), escuro(p, cor, .3), { prof: 0, liso: true });
  p.forma(retArredP(-w / 2, y0, w, bh, w * .07), cor, { prof: 2 });
  for (let i = 0; i < 5; i++) { const liga = i === 0 || Math.sin(tt * (4 + i * 1.9) + i * 1.3) > -.1; p.circulo(-w * .32 + i * w * .11, y0 + bh * .5, w * .028, liga ? (i === 0 ? "c3" : "claro") : "tinta", { prof: 0, liso: true }); }
  p.linha([[w * .22, y0 + bh * .5], [w * .4, y0 + bh * .5]], "tinta", w * .03);
}
/** Chip de processador com pinos que acendem em volta e núcleo pulsando. Opções: larg, cor, t. Chaves: chip, processador, hardware, semicondutor, inteligência artificial, cpu, desempenho, tecnologia */
export function chip(p, { larg = 280, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), a = w * .31, n = 4, cab = Math.floor(tt * 7) % (n * 4);
  for (let l = 0; l < 4; l++) for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * a * .5, ang = l * Math.PI / 2, c = Math.cos(ang), s = Math.sin(ang), id = l * n + i, dist = ((cab - id) % (n * 4) + n * 4) % (n * 4);
    const pt = r => [c * r - s * u, s * r + c * u];
    p.capsula(pt(a * .9), pt(a + w * .17), w * .055, dist < 3 ? "c2" : sobreFundo(p));
  }
  p.forma(retArredP(-a, -a, a * 2, a * 2, w * .05), cor, { prof: 2 });
  p.forma(retArredP(-a * .62, -a * .62, a * 1.24, a * 1.24, w * .03), "tinta", { prof: 0, liso: true });
  const s = a * (.3 + .08 * Math.sin(tt * 5)); p.forma(retArredP(-s, -s, s * 2, s * 2, w * .02), "c2", { prof: 0, liso: true });
  p.circulo(-a * .8, -a * .8, w * .025, "tinta", { prof: 0, liso: true });
}
/** Robô simpático que acena, pisca os olhos e tem o painel do peito oscilando. Opções: alt, cor, t. Chaves: robô, automação, inteligência artificial, bot, máquina, assistente, futuro, androide */
export function robo(p, { alt = 380, cor = "c4", t = 0 } = {}) {
  const h = alt, w = h * .62, tt = p.ritmo(t), by = Math.sin(tt * 3) * h * .01, esc = escuro(p, cor, .3), pisca = (tt * .45) % 1 > .93;
  for (const s of [-1, 1]) { p.forma(retP(s * w * .2 - w * .09, -h * .21, w * .18, h * .18), esc, { prof: 0, liso: true }); p.forma(retArredP(s * w * .2 - w * .15, -h * .05, w * .3, h * .05, w * .04), cor, { prof: 1 }); }
  p.em({ x: 0, y: by }, () => {
    const om = [w * .4, -h * .5], ang = -1.05 + Math.sin(tt * 5) * .38, mao = [om[0] + Math.cos(ang) * h * .23, om[1] + Math.sin(ang) * h * .23];
    p.capsula([-w * .4, -h * .5], [-w * .58, -h * .3], w * .12, esc); p.circulo(-w * .58, -h * .29, w * .09, "c2", { prof: 0, liso: true });
    p.capsula(om, mao, w * .12, esc); p.circulo(mao[0], mao[1], w * .09, "c2", { prof: 0, liso: true });
    p.forma(retArredP(-w * .4, -h * .58, w * .8, h * .4, w * .09), cor, { prof: 2 });
    visor(p, -w * .27, -h * .51, w * .54, h * .2, w * .04, () => { for (let i = 0; i < 4; i++) { const k = .25 + .7 * vaiVem(tt + i * .21, .9 + i * .17); p.forma(retP(-w * .21 + i * w * .115, -h * .33 - h * .15 * k, w * .075, h * .15 * k), ["c1", "c3", "c2", "c1"][i], { prof: 0, liso: true }); } });
    p.forma(retP(-w * .09, -h * .63, w * .18, h * .06), esc, { prof: 0, liso: true });
    p.linha([[0, -h * .9], [0, -h * .955]], esc, w * .05);
    p.circulo(0, -h * .96, w * (.055 + .012 * Math.sin(tt * 6)), "c2", { prof: 0, liso: true });
    for (const s of [-1, 1]) p.forma(retArredP(s * w * .5 - w * .05, -h * .81, w * .1, h * .11, w * .03), esc, { prof: 0, liso: true });
    p.forma(retArredP(-w * .46, -h * .9, w * .92, h * .29, w * .11), cor, { prof: 2 });
    p.forma(retArredP(-w * .36, -h * .84, w * .72, h * .14, w * .07), "tinta", { prof: 0, liso: true });
    for (const s of [-1, 1]) p.elipse(s * w * .17, -h * .77, w * .075, w * (pisca ? .02 : .075), "c2", { prof: 0, liso: true });
    p.linha([[-w * .12, -h * .655], [w * .12, -h * .655]], "tinta", w * .035);
  });
}
/** Satélite em órbita com painéis solares, balançando e emitindo sinal pela antena. Opções: larg, cor, t. Chaves: satélite, órbita, gps, espaço, transmissão, telecomunicação, localização, cobertura */
export function satelite(p, { larg = 380, cor = "c4", t = 0 } = {}) {
  const w = larg * .92, tt = p.ritmo(t);
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .025 - w * .05, r: -.32 + Math.sin(tt * 1.1) * .06 }, () => {
    p.linha([[-w * .2, 0], [w * .2, 0]], sobreFundo(p), w * .03);
    for (const s of [-1, 1]) {
      const x0 = s > 0 ? w * .17 : -w * .5; p.forma(retP(x0, -w * .115, w * .33, w * .23), "c1", { prof: 1 });
      for (let i = 1; i < 3; i++) p.linha([[x0 + i * w * .11, -w * .115], [x0 + i * w * .11, w * .115]], "tinta", w * .013);
      p.linha([[x0, 0], [x0 + w * .33, 0]], "tinta", w * .013);
    }
    if (p.estilo === "pixel") {
      // no pixel a transparência vira cor escura: ondas sólidas em laranja, grossas, que somem de vez no fim
      for (let i = 0; i < 3; i++) { const f = (tt * 1.3 + i / 3) % 1; if (f < .8) p.linha(arcoP(0, w * .33, lerp(w * .07, w * .32, f), 50, 130, 10), "c4", w * .035); }
      p.forma([...arcoP(0, w * .3, w * .13, 180, 360, 10)], "claro", { prof: 1, liso: true });
    } else {
      ondas(p, 0, w * .33, w * .05, w * .24, 50, 130, "c2", w * .035, tt, 3, 1.3);
      p.forma([...arcoP(0, w * .3, w * .13, 180, 360, 10)], "claro", { prof: 1, liso: true });
    }
    p.linha([[0, w * .3], [0, w * .35]], sobreFundo(p), w * .022);
    p.forma(retArredP(-w * .12, -w * .17, w * .24, w * .35, w * .04), cor, { prof: 2 });
    p.forma(retP(-w * .12, -w * .09, w * .24, w * .06), "tinta", { prof: 0, liso: true });
    if (Math.sin(tt * 7) > 0) p.circulo(0, w * .07, w * .03, "c2", { prof: 0, liso: true });
  });
}
/** Relógio inteligente com anel de meta enchendo e batimento cardíaco correndo na tela. Opções: larg, cor, pulseira, t. Chaves: smartwatch, relógio inteligente, saúde, batimento, exercício, monitorar, notificação, vestível */
export function smartwatch(p, { larg = 200, cor = "c1", pulseira = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), pad = [0, 0, -.25, 0, .35, -1, .7, 0, 0, -.3, 0, 0], d = Math.floor(tt * 9), k = .15 + .85 * ciclo(tt, 2.4, .8);
  p.forma(retArredP(-w * .31, -w * .86, w * .62, w * 1.72, w * .1), pulseira, { prof: 1 });
  for (let i = 0; i < 2; i++) p.circulo(0, w * (.66 + i * .1), w * .035, "tinta", { prof: 0, liso: true });
  p.forma(retArredP(-w * .12, -w * .78, w * .24, w * .1, w * .03), "tinta", { prof: 0, liso: true });
  p.forma(retArredP(w * .48, -w * .12, w * .08, w * .24, w * .03), escuro(p, cor, .3), { prof: 0, liso: true });
  p.forma(retArredP(-w * .5, -w * .56, w, w * 1.12, w * .26), cor, { prof: 2 });
  visor(p, -w * .39, -w * .45, w * .78, w * .9, w * .18, () => {
    p.linha(circP(0, -w * .1, w * .22, 28), apagado(p, "c3", .7), w * .06, { fechar: true });
    p.linha(arcoP(0, -w * .1, w * .22, -90, -90 + 360 * k, 28), "c3", w * .06);
    p.circulo(0, -w * .1, w * (.07 + .02 * Math.max(0, Math.sin(tt * 7))), "c2", { prof: 0, liso: true });
    p.linha(pad.map((_, i) => [-w * .3 + i * w * .055, w * .27 + pad[(i + d) % pad.length] * w * .09]), "c2", w * .035);
  });
}
/** Fone de ouvido de arco que pulsa no ritmo, com ondas de som saindo dos dois lados. Opções: larg, cor, t. Chaves: fone de ouvido, headphone, música, podcast, áudio, ouvir, concentração, som */
export function foneDeOuvido(p, { larg = 280, cor = "c1", t = 0 } = {}) {
  const w = larg * .82, tt = p.ritmo(t), bat = Math.max(0, Math.sin(tt * 8)), y0 = w * .06;
  p.em({ x: 0, y: y0, r: Math.sin(tt * 2) * .04 }, () => {
    p.linha(arcoP(0, 0, w * .4, 180, 360, 20), cor, w * .08);
    for (const s of [-1, 1]) {
      ondas(p, s * w * .46, w * .14, w * .06, w * .2, s > 0 ? -40 : 140, s > 0 ? 40 : 220, "c2", w * .04, tt, 2, 1.5);
      p.forma(retArredP(s * w * .33 - w * .05, -w * .02, w * .1, w * .3, w * .04), "tinta", { prof: 0, liso: true });
      p.em({ x: s * w * .42, y: w * .13, s: 1 + bat * .06 }, () => p.forma(retArredP(-w * .09, -w * .2, w * .18, w * .4, w * .08), cor, { prof: 2 }));
    }
  });
}
/** Teclado com teclas sendo apertadas uma a uma, como alguém digitando. Opções: larg, cor, t. Chaves: teclado, digitar, escrever, texto, programar, atalho, trabalho, mensagem */
export function teclado(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, h = w * .42, tt = p.ritmo(t), kw = w * .074, g = w * .016, kh = h * .17, x0 = -(kw * 10 + g * 9) / 2, y0 = -h / 2 + h * .09, passoY = kh + h * .05;
  const r = rng(Math.floor(tt * 7) + 11), tecla = Math.floor(r() * 30), espaco = r() < .18;
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.2) * .015 }, () => {
    p.forma(retArredP(-w / 2, -h / 2, w, h, w * .035), cor, { prof: 2 });
    for (let j = 0; j < 3; j++) for (let i = 0; i < 10; i++) {
      const on = !espaco && tecla === j * 10 + i;
      p.forma(retArredP(x0 + i * (kw + g), y0 + j * passoY + (on ? kh * .14 : 0), kw, kh, kw * .2), on ? "c2" : "claro", { prof: 0, liso: true });
    }
    const y3 = y0 + 3 * passoY;
    for (const i of [0, 1, 8, 9]) p.forma(retArredP(x0 + i * (kw + g), y3, kw, kh, kw * .2), "claro", { prof: 0, liso: true });
    p.forma(retArredP(x0 + 2 * (kw + g), y3 + (espaco ? kh * .14 : 0), kw * 6 + g * 5, kh, kw * .2), espaco ? "c2" : "claro", { prof: 0, liso: true });
  });
}
/** Mouse com fio balançando, rodinha girando e cliques no botão esquerdo. Opções: larg, cor, t. Chaves: mouse, clique, clicar, cursor, selecionar, navegar, apontar, computador */
export function mouse(p, { larg = 180, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .9) % 1, clique = f < .3, corpo = retArredP(-w / 2, -w * .52, w, w * 1.38, w * .5), sway = Math.sin(tt * 2.2) * w * .1;
  p.linha(Array.from({ length: 9 }, (_, i) => { const u = i / 8; return [Math.sin(u * 4) * w * .14 * u + sway * u * u, -w * .5 - u * w * .42]; }), sobreFundo(p), w * .045);
  p.forma(corpo, cor, { prof: 2 });
  p.recortar(corpo, () => { if (clique) p.forma(retP(-w / 2, -w * .52, w / 2, w * .52), "c2", { prof: 0, liso: true }); });
  p.linha([[-w / 2, 0], [w / 2, 0]], "tinta", w * .04);
  p.linha([[0, -w * .52], [0, 0]], "tinta", w * .04);
  p.forma(retArredP(-w * .08, -w * .38, w * .16, w * .28, w * .08), "claro", { prof: 0, liso: true });
  const ry = -w * .36 + ((tt * .6) % 1) * w * .18; p.forma(retArredP(-w * .08, ry, w * .16, w * .08, w * .03), "tinta", { prof: 0, liso: true });
  if (clique) for (let i = 0; i < 3; i++) { const a = -2.75 + i * .42, r0 = w * (.68 + f * .3), r1 = r0 + w * .14; p.linha([[Math.cos(a) * r0, -w * .1 + Math.sin(a) * r0], [Math.cos(a) * r1, -w * .1 + Math.sin(a) * r1]], "c2", w * .045); }
}
/** Impressora que puxa o papel de cima e solta a folha impressa embaixo, com a luz piscando. Opções: larg, cor, t. Chaves: impressora, imprimir, documento, papel, escritório, relatório, cópia, burocracia */
export function impressora(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), k = E.entraSai(ciclo(tt, 1.7, .7)), L = w * .22, yS = -w * .26, tremor = k > 0 && k < 1 ? Math.sin(tt * 40) * w * .004 : 0;
  p.forma(retP(-w * .27, -w * .84 + k * w * .05, w * .54, w * .3), "claro", { prof: 1 });
  for (let i = 0; i < 2; i++) p.linha([[-w * .18, -w * .77 + k * w * .05 + i * w * .06], [w * (.14 - i * .1), -w * .77 + k * w * .05 + i * w * .06]], "tinta", w * .016);
  p.forma(retArredP(-w * .46, -w * .3, w * .92, w * .27, w * .04), cor, { prof: 2 });
  p.forma(retP(-w * .36, -w * .26, w * .72, w * .2), "tinta", { prof: 0, liso: true });
  p.recortar(retP(-w * .4, yS, w * .8, w * .3), () => {
    const y = yS + (k - 1) * L; p.forma(retP(-w * .3, y, w * .6, L), "claro", { prof: 0, liso: true });
    for (let i = 0; i < 3; i++) p.linha([[-w * .23, y + L * (.3 + i * .24)], [w * (.2 - (i % 2) * .12), y + L * (.3 + i * .24)]], i === 0 ? "c1" : "tinta", w * .018);
  });
  p.forma(retArredP(-w * .4, -w * .08, w * .8, w * .05, w * .02), escuro(p, cor, .3), { prof: 1 });
  p.em({ x: tremor, y: 0 }, () => {
    p.forma(retArredP(-w / 2, -w * .62, w, w * .38, w * .06), cor, { prof: 2 });
    p.forma(retArredP(-w * .36, -w * .32, w * .72, w * .05, w * .02), "tinta", { prof: 0, liso: true });
    p.forma(retArredP(-w * .36, -w * .56, w * .34, w * .09, w * .03), "tinta", { prof: 0, liso: true });
    p.circulo(w * .36, -w * .5, w * .032, Math.sin(tt * 9) > 0 || k >= 1 ? "c3" : "tinta", { prof: 0, liso: true });
    p.circulo(w * .25, -w * .5, w * .032, "c2", { prof: 0, liso: true });
  });
}
/** Televisão de tela larga passando paisagem com sol, luz de ao vivo e faixa de notícias correndo. Opções: larg, cor, t. Chaves: televisão, tv, notícia, programa, ao vivo, assistir, mídia, jornal, streaming */
export function televisao(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), y0 = -w * .66, h = w * .58, m = w * .028, sx = -w / 2 + m, sy = y0 + m, sw = w - m * 2, sh = h - m * 2, esc = escuro(p, cor, .3);
  for (const s of [-1, 1]) p.forma([[s * w * .3, -w * .1], [s * w * .22, -w * .1], [s * w * .33, 0], [s * w * .41, 0]], esc, { prof: 0, liso: true });
  p.forma(retArredP(-w / 2, y0, w, h, w * .03), cor, { prof: 2 });
  visor(p, sx, sy, sw, sh, 0, () => {
    p.circulo(sx + sw * (.2 + .6 * ((tt * .08) % 1)), sy + sh * (.3 - .08 * Math.sin(tt * .5)), w * .065, "c2", { prof: 0, liso: true });
    p.forma([[sx, sy + sh], [sx, sy + sh * .62], [sx + sw * .22, sy + sh * .36], [sx + sw * .42, sy + sh * .62], [sx + sw * .6, sy + sh * .44], [sx + sw, sy + sh * .7], [sx + sw, sy + sh]], "c3", { prof: 0, liso: true });
    p.forma(retP(sx, sy + sh * .78, sw, sh * .22), "c1", { prof: 0, liso: true });
    const d = (tt * w * .16) % (w * .3);
    for (let x = sx - d; x < sx + sw; x += w * .3) p.linha([[x + w * .03, sy + sh * .89], [x + w * .22, sy + sh * .89]], "tinta", w * .028);
    if (Math.sin(tt * 5) > -.2) p.circulo(sx + sw * .9, sy + sh * .14, w * .028, "c1", { prof: 0, liso: true });
  });
}
/** Controle de videogame que balança, com botões acendendo em sequência e alavancas mexendo. Opções: larg, cor, t. Chaves: controle, videogame, jogo, game, jogar, diversão, gamificação, console, joystick */
export function controleDeGame(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), metade = [[0, -.2], [.2, -.2], [.32, -.18], [.41, -.1], [.47, .05], [.5, .2], [.47, .28], [.41, .29], [.34, .22], [.25, .11], [0, .1]];
  const pts = [...metade.map(([x, y]) => [x * w, y * w]), ...metade.slice(1, -1).reverse().map(([x, y]) => [-x * w, y * w])], aceso = Math.floor(tt * 3) % 4;
  p.em({ x: 0, y: Math.sin(tt * 3) * w * .015 - w * .03, r: Math.sin(tt * 2.2) * .07 }, () => {
    p.forma(pts, cor, { prof: 3 });
    p.forma(retArredP(-w * .345, -w * .085, w * .17, w * .055, w * .015), "tinta", { prof: 0, liso: true });
    p.forma(retArredP(-w * .2875, -w * .1425, w * .055, w * .17, w * .015), "tinta", { prof: 0, liso: true });
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 - Math.PI / 2; p.circulo(w * .26 + Math.cos(a) * w * .07, -w * .058 + Math.sin(a) * w * .07, w * .032, i === aceso ? "c2" : "claro", { prof: 0, liso: true }); }
    for (const s of [-1, 1]) { const a = tt * 2.4 * s + s; p.circulo(s * w * .1, w * .02, w * .055, "tinta", { prof: 0, liso: true }); p.circulo(s * w * .1 + Math.cos(a) * w * .018, w * .02 + Math.sin(a) * w * .018, w * .03, "claro", { prof: 0, liso: true }); }
    p.linha([[-w * .05, -w * .13], [w * .05, -w * .13]], "tinta", w * .03);
  });
}
/** Pendrive inclinado com luz piscando e blocos de dados saindo pelo conector. Opções: larg, cor, t. Chaves: pendrive, usb, arquivo, backup, armazenar, transferir, memória, salvar, dados */
export function pendrive(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg * .84, tt = p.ritmo(t);
  p.em({ x: -w * .06, y: Math.sin(tt * 2) * w * .02, r: -.32 + Math.sin(tt * 1.4) * .04 }, () => {
    for (let i = 0; i < 3; i++) { const f = (tt * .9 + i / 3) % 1, s = w * .06; p.alfa(1 - f * .8, () => p.forma(retP(w * .42 + f * w * .22 - s / 2, (i - 1) * w * .07 * (1 + f) - s / 2, s, s), i === 1 ? "c2" : "c3", { prof: 0, liso: true })); }
    p.forma(retP(w * .1, -w * .1, w * .28, w * .2), "claro", { prof: 1, liso: true });
    for (const s of [-1, 1]) p.forma(retP(w * .23, s * w * .05 - w * .022, w * .08, w * .044), "tinta", { prof: 0, liso: true });
    p.forma(retArredP(-w * .5, -w * .16, w * .64, w * .32, w * .07), cor, { prof: 2 });
    p.circulo(-w * .4, 0, w * .045, "tinta", { prof: 0, liso: true });
    p.forma(retArredP(-w * .28, -w * .08, w * .2, w * .16, w * .03), "claro", { prof: 0, liso: true });
    p.circulo(w * .04, 0, w * .04, Math.sin(tt * 8) > 0 ? "c2" : "tinta", { prof: 0, liso: true });
  });
}
/** Nuvem de dados com uma seta subindo e outra descendo sem parar. Opções: larg, cor, t. Chaves: nuvem, cloud, upload, download, armazenamento, sincronizar, backup, enviar, baixar */
export function nuvemDeDados(p, { larg = 360, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), y0 = -w * .1;
  p.em({ x: 0, y: y0 + Math.sin(tt * 1.8) * w * .015 }, () => {
    p.forma([...arcoP(-w * .26, w * .04, w * .16, 90, 262, 10), ...arcoP(-w * .05, -w * .08, w * .22, 205, 338, 10), ...arcoP(w * .22, w * .02, w * .18, 255, 450, 12)], cor, { prof: 2 });
  });
  for (const s of [-1, 1]) {
    const f = (tt * .8 + (s > 0 ? .5 : 0)) % 1, x = s * w * .1, d = (f - .5) * w * .12 * -s, ya = y0 + w * .34 + d, yb = y0 + w * .05 + d;
    p.alfa(.45 + .55 * Math.sin(f * Math.PI), () => p.seta(s < 0 ? [[x, ya], [x, yb + w * .06]] : [[x, yb], [x, ya - w * .06]], s < 0 ? "c1" : "c2", w * .045));
  }
}
/** Símbolo de wi-fi com as ondas acendendo de dentro para fora. Opções: larg, cor, k (0..1 força do sinal), t. Chaves: wi-fi, sinal, internet, conexão, sem fio, rede, cobertura, online */
export function sinalWifi(p, { larg = 280, cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg * 1.2, tt = p.ritmo(t), y0 = w * .27, max = Math.round(clamp(k) * 3), fase = Math.floor(tt * 3) % 5, off = apagado(p, cor, p.estilo === "papel" || p.estilo === "flat" ? .58 : .3);
  // aceso: do mais claro (dentro) para a cor cheia (fora); apagado: tom médio, sempre visível no fundo escuro
  for (let i = 2; i >= 0; i--) { const on = i < max && fase > i; p.linha(arcoP(0, y0, w * (.19 + i * .17), 225, 315, 14), on ? maisClaro(p, cor, [.38, .2, 0][i]) : off, w * .075); }
  p.circulo(0, y0, w * (.06 + .012 * Math.sin(tt * 6)), max > 0 || Math.sin(tt * 6) > 0 ? cor : off, { prof: 0, liso: true });
}
/** Código QR com módulos trocando e uma linha de leitura varrendo de cima a baixo. Opções: larg, cor, semente, t. Chaves: qr code, código, escanear, pix, pagamento, link, leitura, acesso rápido */
export function qrCode(p, { larg = 260, cor = "c1", semente = 3, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = 11, c = w * .8 / n, x0 = -w * .4, r = rng(semente * 17 + 5), muda = Math.floor(tt * 3);
  p.forma(retArredP(-w / 2, -w / 2, w, w, w * .06), "claro", { prof: 2 });
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = r(), canto = (i < 4 && j < 4) || (i > n - 5 && j < 4) || (i < 4 && j > n - 5); if (canto) continue;
    const troca = v > .86 && ((i * 5 + j * 3 + muda) % 3 === 0);
    if ((v < .46) !== troca) p.forma(retP(x0 + i * c, x0 + j * c, c * 1.02, c * 1.02), "tinta", { prof: 0, liso: true });
  }
  for (const [i, j] of [[0, 0], [n - 3, 0], [0, n - 3]]) {
    const x = x0 + i * c, y = x0 + j * c;
    p.forma(retP(x, y, c * 3, c * 3), "tinta", { prof: 0, liso: true, furos: [retP(x + c * .7, y + c * .7, c * 1.6, c * 1.6).reverse()] });
    p.forma(retP(x + c * 1.05, y + c * 1.05, c * .9, c * .9), "tinta", { prof: 0, liso: true });
  }
  const ys = lerp(-w * .42, w * .42, vaiVem(tt, .35));
  p.alfa(.3, () => p.forma(retP(-w * .5, ys - w * .07, w, w * .14), cor, { prof: 0, liso: true }));
  p.linha([[-w * .56, ys], [w * .56, ys]], cor, w * .035);
}
/** Janela de editor com barra de título e linhas de código sendo digitadas, cursor piscando. Opções: larg, cor, t. Chaves: código, programação, software, desenvolvedor, script, terminal, sistema, automação */
export function janelaDeCodigo(p, { larg = 400, cor = "c1", t = 0 } = {}) {
  const w = larg, h = w * .72, tt = p.ritmo(t), bh = h * .17, m = w * .025;
  p.em({ x: 0, y: Math.sin(tt * 1.7) * w * .012 }, () => {
    p.forma(retArredP(-w / 2, -h / 2, w, h, w * .04), cor, { prof: 3 });
    for (let i = 0; i < 3; i++) p.circulo(-w * .43 + i * w * .065, -h / 2 + bh * .52, w * .022, ["c2", "claro", "c3"][i], { prof: 0, liso: true });
    visor(p, -w / 2 + m, -h / 2 + bh, w - m * 2, h - bh - m, w * .02, () => {
      for (let i = 0; i < 6; i++) p.forma(retP(-w / 2 + m * 2, -h / 2 + bh + (h - bh - m) * (i + .32) / 6.3, w * .03, (h - bh - m) * .055), apagado(p, "tinta", .6), { prof: 0, liso: true });
      linhasDigitadas(p, -w / 2 + m * 2 + w * .07, -h / 2 + bh + m * .4, w * .8, (h - bh - m) * .96, tt, 6);
    });
  });
}
/** Janela de navegador com barra de endereço, página rolando e ponteiro do mouse passeando. Opções: larg, cor, t. Chaves: navegador, site, internet, página, web, link, pesquisa, online, loja virtual */
export function navegador(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, h = w * .74, tt = p.ritmo(t), bh = h * .2, m = w * .025, cx = -w / 2 + m, cy = -h / 2 + bh, cw = w - m * 2, ch = h - bh - m;
  p.em({ x: 0, y: Math.sin(tt * 1.7 + 1) * w * .012 }, () => {
    p.forma(retArredP(-w / 2, -h / 2, w, h, w * .04), cor, { prof: 3 });
    for (let i = 0; i < 3; i++) p.circulo(-w * .43 + i * w * .06, -h / 2 + bh * .5, w * .02, ["c2", "c1", "c3"][i], { prof: 0, liso: true });
    p.forma(retArredP(-w * .24, -h / 2 + bh * .22, w * .68, bh * .56, bh * .28), "claro", { prof: 0, liso: true });
    p.linha([[-w * .19, -h / 2 + bh * .5], [w * (.02 + .12 * ciclo(tt, 1.2, 2.2)), -h / 2 + bh * .5]], "tinta", w * .018);
    visor(p, cx, cy, cw, ch, w * .02, () => {
      // a página rola em ciclo; cada bloco é aparado na borda da tela para não passar dela (nem na medida da peça)
      const per = ch * 1.1, rol = (tt * w * .09) % per, y0v = cy, y1v = cy + ch;
      const ret = (x, y, ww, hh, cor) => { const a = Math.max(y, y0v), b = Math.min(y + hh, y1v); if (b - a > 1) p.forma(retP(x, a, ww, b - a), cor, { prof: 0, liso: true }); };
      for (let q = 0; q < 2; q++) {
        const y = cy + m - rol + q * per;
        if (y > y1v || y + per < y0v) continue;
        ret(cx + m, y, cw - m * 2, ch * .42, "c1");
        const sy = y + ch * .16; if (sy - w * .045 > y0v && sy + w * .045 < y1v) p.circulo(cx + cw * .78, sy, w * .045, "c2", { prof: 0, liso: true });
        const mont = [[cx + m * 2, y + ch * .42], [cx + cw * .3, y + ch * .16], [cx + cw * .48, y + ch * .32], [cx + cw * .6, y + ch * .24], [cx + cw * .8, y + ch * .42]];
        if (y + ch * .42 > y0v + 2 && y + ch * .16 < y1v - 2) p.forma(mont.map(([a, b]) => [a, clamp(b, y0v, y1v)]), "c3", { prof: 0, liso: true });
        for (let i = 0; i < 2; i++) { const ly = y + ch * (.56 + i * .14); if (ly > y0v && ly < y1v) p.linha([[cx + m * 1.5, ly], [cx + cw * (.62 - i * .2), ly]], "tinta", w * .022); }
        ret(cx + cw * .68, y + ch * .52, cw * .26, ch * .2, "c2");
        for (let i = 0; i < 3; i++) ret(cx + m + i * (cw - m) / 3, y + ch * .84, (cw - m) / 3 - m, ch * .2, ["c3", "c4", "c2"][i]);
      }
      const px = Math.sin(tt * .9) * w * .22 + w * .08, py = cy + ch * (.5 + .22 * Math.sin(tt * 1.3 + 1)), s = w * .9;
      p.forma([[0, 0], [0, .11], [.028, .084], [.047, .125], [.064, .117], [.045, .077], [.08, .077]].map(([a, b]) => [px + a * s, py + b * s]), "tinta", { prof: 1, liso: true });
    });
  });
}
/** Conversa com IA: a pergunta surge, a resposta digita reticências e depois escreve as linhas, em ciclo. Opções: larg, cor, t. Chaves: chat, inteligência artificial, chatbot, conversa, assistente, pergunta e resposta, atendimento, prompt, mensagem */
export function chatDeIA(p, { larg = 360, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt + 1.5) % 6.4, some = clamp((6.4 - f) / .35), r = w * .07;
  const surge = (de, x, y, fn) => { const k = clamp((f - de) / .45); if (k > 0) p.em({ x, y, s: Math.max(.001, mola(k, { freq: 2, amort: 5 })) }, fn); };
  p.alfa(some, () => {
    surge(0, w * .46, -w * .2, () => {
      p.forma(bolha(-w * .52, -w * .24, w * .52, w * .2, r, 1), cor, { prof: 2 });
      for (let i = 0; i < 2; i++) p.linha([[-w * .45, -w * .175 + i * w * .07], [-w * (.09 + i * .14), -w * .175 + i * w * .07]], "tinta", w * .028);
    });
    surge(.9, -w * .46, w * .16, () => {
      p.forma(bolha(0, -w * .3, w * .7, w * .28, r, -1), "claro", { prof: 2 });
      if (f < 2.8) for (let i = 0; i < 3; i++) p.circulo(w * (.25 + i * .1), -w * .16 - Math.max(0, Math.sin(tt * 7 - i * .9)) * w * .05, w * .034, "tinta", { prof: 0, liso: true });
      else for (let i = 0; i < 3; i++) { const k = clamp((f - 2.8) / .5 - i * .7); if (k > 0) p.linha([[w * .08, -w * .235 + i * w * .075], [w * .08 + w * [.52, .44, .3][i] * k, -w * .235 + i * w * .075]], i === 0 ? "c3" : "tinta", w * .028); }
    });
    surge(4.3, w * .46, w * .44, () => {
      p.forma(bolha(-w * .4, -w * .19, w * .4, w * .16, r, 1), cor, { prof: 2 });
      p.linha([[-w * .33, -w * .11], [-w * .08, -w * .11]], "tinta", w * .028);
    });
  });
  // o brilho da IA fica sempre à vista, mesmo quando a conversa recomeça
  p.em({ x: -w * .4, y: w * .31, r: tt * 1.2, s: 1 + .12 * Math.sin(tt * 5) + .25 * clamp(1 - Math.abs(f - 1.3) / .4) }, () => p.forma(estrelaP(0, 0, w * .085, w * .032, 4), "c2", { prof: 1, liso: true }));
}
/** Câmera de segurança presa à parede, varrendo de um lado ao outro com luz de gravação piscando. Opções: larg, cor, t. Chaves: câmera de segurança, vigilância, monitoramento, segurança, cftv, privacidade, proteção, fiscalização */
export function cameraDeSeguranca(p, { larg = 320, cor = "c4", t = 0 } = {}) {
  const w = larg * .9, tt = p.ritmo(t), esc = escuro(p, cor, .3), ang = .3 + Math.sin(tt * 1.3) * .2;
  p.em({ x: -w * .04, y: -w * .02 }, () => {
    p.forma(retArredP(-w * .5, -w * .34, w * .09, w * .34, w * .03), esc, { prof: 1 });
    p.linha([[-w * .43, -w * .17], [-w * .22, -w * .17], [-w * .18, -w * .02]], esc, w * .055);
    p.em({ x: -w * .18, y: 0, r: ang }, () => {
      const f = (tt * .8) % 1, px = p.estilo === "pixel";
      if (px) {
        // no pixel a transparência vira azul-escuro: cone em tom claro já misturado, onda sólida e lente clara com borda
        const cone = HEX6.test(p.cor("c4")) && HEX6.test(p.cor("fundo")) ? misturarCor(maisClaro(p, "c4", .5), p.cor("fundo"), Math.sin(tt * 4) > 0 ? .3 : .4) : "c4";
        p.forma([[w * .56, 0], [w * .86, -w * .17], [w * .86, w * .17]], cone, { prof: 0, liso: true });
        if (f < .75) p.linha(arcoP(w * .56, 0, w * (.08 + f * .24), -28, 28, 8), "claro", w * .04);
      } else {
        p.alfa(.22 + .1 * Math.sin(tt * 4), () => p.forma([[w * .56, 0], [w * .86, -w * .17], [w * .86, w * .17]], "c2", { prof: 0, liso: true }));
        p.alfa(1 - f, () => p.linha(arcoP(w * .56, 0, w * (.08 + f * .24), -28, 28, 8), "c2", w * .03));
        p.forma(retP(w * .46, -w * .085, w * .11, w * .17), "tinta", { prof: 0, liso: true });
      }
      p.forma(retArredP(-w * .1, -w * .115, w * .6, w * .23, w * .05), cor, { prof: 2 });
      p.forma([[-w * .12, -w * .15], [w * .58, -w * .15], [w * .58, -w * .09], [-w * .12, -w * .09]], esc, { prof: 0, liso: true });
      p.circulo(w * .0, w * .02, w * .04, Math.sin(tt * 6) > 0 ? "c1" : "tinta", { prof: 0, liso: true });
      p.linha([[w * .14, w * .02], [w * .36, w * .02]], "tinta", w * .025);
      if (px) { p.circulo(w * .5, 0, w * .1, "claro", { prof: 0, liso: true }); p.circulo(w * .5, 0, w * .065, "c3", { prof: 0, liso: true }); p.circulo(w * .5, 0, w * .03, "tinta", { prof: 0, liso: true }); }
    });
    p.circulo(-w * .18, 0, w * .06, esc, { prof: 0, liso: true });
  });
}
/** Placa solar em suporte, com brilho correndo pelas células e sol girando os raios. Opções: larg, cor, t. Chaves: placa solar, energia solar, painel fotovoltaico, sustentável, energia limpa, economia de energia, renovável, conta de luz */
export function placaSolar(p, { larg = 360, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), yb = -w * .2, yt = -w * .64, xb = w * .5, xt = w * .38, painel = [[-xb, yb], [xb, yb], [xt, yt], [-xt, yt]];
  p.capsula([0, -w * .02], [0, -w * .3], w * .06, sobreFundo(p));
  p.forma(retArredP(-w * .2, -w * .05, w * .4, w * .05, w * .02), sobreFundo(p), { prof: 1 });
  const sx = w * .34, sy = -w * .86, sr = w * .075;
  for (let i = 0; i < 8; i++) { const a = tt * .8 + i * TAU / 8; p.linha([[sx + Math.cos(a) * sr * 1.45, sy + Math.sin(a) * sr * 1.45], [sx + Math.cos(a) * sr * 2, sy + Math.sin(a) * sr * 2]], "c2", w * .025); }
  p.circulo(sx, sy, sr * (1 + .08 * Math.sin(tt * 4)), "c2", { prof: 1, liso: true });
  p.forma(painel, cor, { prof: 2 });
  p.recortar(painel, () => {
    const f = (tt * .45) % 1, x = lerp(-w * .55, w * .25, f);
    p.alfa(.45 * Math.sin(f * Math.PI), () => p.forma([[x, yb], [x + w * .16, yb], [x + w * .3, yt], [x + w * .14, yt]], maisClaro(p, cor, .6), { prof: 0, liso: true }));
  });
  for (let i = 1; i < 4; i++) { const u = i / 4 * 2 - 1; p.linha([[u * xb, yb], [u * xt, yt]], "tinta", w * .014); }
  p.linha([[-(xb + xt) / 2, (yb + yt) / 2], [(xb + xt) / 2, (yb + yt) / 2]], "tinta", w * .014);
  p.linha(painel, "tinta", w * .02, { fechar: true });
}
/** Óculos de realidade virtual com reflexo passando no visor e faíscas flutuando em volta. Opções: larg, cor, t. Chaves: realidade virtual, óculos vr, metaverso, imersão, simulação, realidade aumentada, experiência, futuro */
export function oculosVR(p, { larg = 340, cor = "c4", t = 0 } = {}) {
  const w = larg * .9, tt = p.ritmo(t), base = retArredP(-w * .45, -w * .2, w * .9, w * .42, w * .13);
  const corpo = [...base.slice(0, 12), [w * .1, w * .22], [w * .05, w * .1], [-w * .05, w * .1], [-w * .1, w * .22], ...base.slice(12)], visorP = retArredP(-w * .37, -w * .13, w * .74, w * .2, w * .09);
  for (let i = 0; i < 3; i++) { const f = (tt * .5 + i / 3) % 1, a = i * 2.3 + .6; p.em({ x: Math.cos(a) * w * .52, y: -w * .1 + Math.sin(a) * w * .3 - f * w * .08, s: Math.sin(f * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, w * .07, w * .025, 4), "c2", { prof: 0, liso: true })); }
  p.em({ x: 0, y: w * .04 + Math.sin(tt * 2) * w * .015, r: Math.sin(tt * 1.3) * .04 }, () => {
    p.linha(arcoP(0, w * .12, w * .5, 205, 335, 16), escuro(p, cor, .3), w * .07);
    for (const s of [-1, 1]) p.forma(retArredP(s * w * .47 - w * .04, -w * .1, w * .08, w * .2, w * .02), escuro(p, cor, .3), { prof: 0, liso: true });
    p.forma(corpo, cor, { prof: 3 });
    p.forma(visorP, "tinta", { prof: 0, liso: true });
    p.recortar(visorP, () => {
      const f = (tt * .5) % 1, x = lerp(-w * .45, w * .25, f);
      p.alfa(.55 * Math.sin(f * Math.PI), () => p.forma([[x, w * .08], [x + w * .1, w * .08], [x + w * .2, -w * .14], [x + w * .1, -w * .14]], "c3", { prof: 0, liso: true }));
    });
    for (const s of [-1, 1]) p.circulo(s * w * .18, -w * .03, w * (.035 + .012 * Math.sin(tt * 5 + s)), "c2", { prof: 0, liso: true });
  });
}
/** Braço robótico de fábrica que dobra as juntas e abre e fecha a garra. Opções: alt, cor, t. Chaves: braço robótico, automação, indústria, fábrica, robótica, produção, linha de montagem, máquina, eficiência */
export function bracoRobotico(p, { alt = 380, cor = "c2", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), a1 = -1.95 + .22 * Math.sin(tt * 1.4), a2 = a1 + 1.55 + .4 * Math.sin(tt * 1.4 + 1.1), abre = .22 + .2 * vaiVem(tt, .8);
  const j0 = [0, -h * .15], j1 = [j0[0] + Math.cos(a1) * h * .44, j0[1] + Math.sin(a1) * h * .44], j2 = [j1[0] + Math.cos(a2) * h * .34, j1[1] + Math.sin(a2) * h * .34], esc = escuro(p, cor, .3);
  p.forma(retArredP(-h * .22, -h * .07, h * .44, h * .07, h * .02), sobreFundo(p), { prof: 1 });
  p.forma([...arcoP(0, -h * .07, h * .13, 180, 360, 12)], esc, { prof: 1, liso: true });
  if (p.estilo === "pixel") {
    // no pixel: punho, palma e duas pinças grossas e bem separadas, contorno escuro no braço e juntas com aro claro
    const u = [Math.cos(a2), Math.sin(a2)], n = [-u[1], u[0]], pt = (o, a, b) => [o[0] + u[0] * a + n[0] * b, o[1] + u[1] * a + n[1] * b];
    const c = pt(j2, h * .07, 0), g = h * (.045 + abre * .2);
    p.capsula(j2, c, h * .07, sobreFundo(p));
    p.linha([pt(c, 0, -g - h * .02), pt(c, 0, g + h * .02)], sobreFundo(p), h * .05);
    for (const s of [-1, 1]) p.linha([pt(c, 0, s * g), pt(c, h * .13, s * g), pt(c, h * .16, s * (g - h * .022))], sobreFundo(p), h * .045);
    p.capsula(j1, j2, h * .075 + h * .035, "tinta");
    p.capsula(j0, j1, h * .1 + h * .035, "tinta");
  } else for (const s of [-1, 1]) {
    const b = a2 + s * (abre + .35), m = [j2[0] + Math.cos(b) * h * .1, j2[1] + Math.sin(b) * h * .1], e = [m[0] + Math.cos(a2 - s * .25) * h * .08, m[1] + Math.sin(a2 - s * .25) * h * .08];
    p.linha([j2, m, e], sobreFundo(p), h * .04);
  }
  p.capsula(j1, j2, h * .075, cor, { prof: 1 });
  p.capsula(j0, j1, h * .1, cor, { prof: 2 });
  for (const [j, r] of [[j0, .065], [j1, .058], [j2, .045]]) {
    if (p.estilo === "pixel") p.circulo(j[0], j[1], h * (r + .018), "claro", { prof: 0, liso: true });
    p.circulo(j[0], j[1], h * r, "tinta", { prof: 0, liso: true }); p.circulo(j[0], j[1], h * r * .42, Math.sin(tt * 5 + r * 90) > 0 ? "c3" : "claro", { prof: 0, liso: true });
  }
}

/** Notebook e mouse para cenas de trabalho digital. Chaves: trabalho, computador, notebook, mouse */
export function estacaoDeTrabalho(p, { t = 0 } = {}) {
  p.em({ x: -85, s: .55 }, () => notebook(p, { t }));
  p.em({ x: 85, s: .55 }, () => mouse(p, { t }));
}
