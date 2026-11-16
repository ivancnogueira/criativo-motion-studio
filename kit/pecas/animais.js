// Categoria: Animais
// Kit de movimento — bichos de perfil, olhando para a direita, com silhueta que se reconhece em miniatura.
// Os de chão têm a base em y = 0; os que voam ou nadam ficam centrados na origem. A convenção está em ./_comum.js.
import { clamp, lerp, circP, retArredP, rotP, arcoP, estrelaP, escuro, sobreFundo, TAU, ciclo, vaiVem } from "./_comum.js";

const D = { prof: 0, liso: true };
/** Pontos em fração da largura viram unidades. */
const m = (w, pts) => pts.map(([x, y]) => [x * w, y * w]);
/** Linha que parte de (x, y) e vai virando: a0 é o ângulo inicial, `curva` o quanto vira até o fim, `onda(k)` o balanço. */
function curvaP(x, y, comp, a0, curva, n = 10, onda = () => 0) {
  const o = [[x, y]];
  for (let i = 1; i <= n; i++) { const a = a0 + curva * i / n + onda(i / n); x += Math.cos(a) * comp / n; y += Math.sin(a) * comp / n; o.push([x, y]); }
  return o;
}
/** Forma de fita em volta de uma linha; `esp` é a espessura (número ou função de 0..1 ao longo da linha). */
function fita(pts, esp) {
  const n = pts.length, a = [], b = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    const e = (typeof esp === "function" ? esp(i / (n - 1)) : esp) / 2;
    a.push([pts[i][0] - dy / L * e, pts[i][1] + dx / L * e]); b.push([pts[i][0] + dy / L * e, pts[i][1] - dx / L * e]);
  }
  return [...a, ...b.reverse()];
}
/** Olho que pisca: branco com pupila; fechado vira um risco. */
function olho(p, x, y, r, tt, fase = 0) {
  if ((tt * .33 + fase) % 1 < .06) return p.linha([[x - r, y], [x + r, y]], "tinta", r * .7);
  p.circulo(x, y, r, "#FFFFFF", D); p.circulo(x + r * .28, y, r * .58, "#000000", D);
}
/** Uma perna reta do quadril (x, y) até o chão, inclinada por `ang`, com casco opcional. */
function perna(p, x, y, esp, ang, cor, casco) {
  const comp = -y - esp / 2, b = [x + Math.sin(ang) * comp, y + Math.cos(ang) * comp];
  p.capsula([x, y], b, esp, cor);
  if (casco) p.capsula([b[0] - Math.sin(ang) * esp * .25, b[1] - Math.cos(ang) * esp * .25], b, esp, casco);
}
/** As quatro pernas de um quadrúpede: as de trás (lado de lá) mais escuras, alternando o passo. Desenhe antes do corpo. */
function pernas(p, xs, yq, esp, cor, tt, { andando = true, casco = null, vel = 7, amp = .4 } = {}) {
  const longe = escuro(p, cor, .25), a = i => andando ? Math.sin(tt * vel + i * Math.PI) * amp : 0;
  xs.forEach((x, i) => perna(p, x + esp * .6, yq, esp, a(i + 1), longe, casco));
  xs.forEach((x, i) => perna(p, x, yq, esp, a(i), cor, casco));
}
/** Bicho branco: no traco e no vidro "claro" é escuro e some no fundo, então o corpo usa "tinta" (a cor clara desses estilos). */
const branco = (p, cor) => cor === "claro" && (p.estilo === "traco" || p.estilo === "vidro") ? "tinta" : cor;
/** Detalhe escuro sobre um corpo branco: no traco e no vidro "tinta" é clara, então vira "claro" (o tom escuro). */
const pinta = (p, cor) => cor === "tinta" && (p.estilo === "traco" || p.estilo === "vidro") ? "claro" : cor;
const sobe = (tt, andando, w, vel = 7) => andando ? Math.abs(Math.sin(tt * vel)) * w * .012 : Math.sin(tt * 3) * w * .006;

/** Cachorro de perfil que anda e abana o rabo, com a orelha balançando. Opções: larg, cor, andando, t. Chaves: cachorro, cão, pet, animal de estimação, fidelidade, amigo, lealdade, companheiro */
export function cachorro(p, { larg = 340, cor = "c4", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), col = cor === "c1" ? "c2" : "c1";
  pernas(p, [-w * .25, w * .13], -w * .3, w * .075, cor, tt, { andando });
  p.em({ x: 0, y: -sobe(tt, andando, w) }, () => {
    p.forma(fita(curvaP(-w * .31, -w * .47, w * .25, -2 + Math.sin(tt * 12) * .45, .5, 6), k => w * (.065 - .03 * k)), cor, D);
    p.forma(retArredP(-w * .36, -w * .53, w * .6, w * .27, w * .12), cor, { prof: 2 });
    p.capsula([w * .15, -w * .43], [w * .27, -w * .61], w * .17, cor);
    p.capsula([w * .14, -w * .56], [w * .29, -w * .46], w * .045, col);
    p.circulo(w * .3, -w * .65, w * .12, cor, { prof: 1 });
    p.forma(retArredP(w * .32, -w * .68, w * .2, w * .125, w * .05), cor, D);
    p.circulo(w * .505, -w * .655, w * .032, "tinta", D);
    p.em({ x: w * .25, y: -w * .73, r: .15 + Math.sin(tt * 7) * .18 }, () => p.forma(m(w, [[-.045, 0], [.05, -.01], [.035, .15], [-.02, .19], [-.065, .1]]), escuro(p, cor, .3), { prof: 1, liso: true }));
    olho(p, w * .36, -w * .68, w * .03, tt);
  });
}
/** Gato de perfil que anda com a cauda comprida ondulando no ar. Opções: larg, cor, andando, t. Chaves: gato, felino, pet, animal de estimação, curiosidade, independência, bichano, miau */
export function gato(p, { larg = 320, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  pernas(p, [-w * .21, w * .12], -w * .25, w * .06, cor, tt, { andando, vel: 6 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 6) }, () => {
    p.forma(fita(curvaP(-w * .27, -w * .37, w * .46, -2.5, 1.9, 12, k => Math.sin(tt * 3 - k * 3) * .4 * k), k => w * (.055 - .015 * k)), cor, D);
    p.forma(retArredP(-w * .3, -w * .44, w * .52, w * .21, w * .1), cor, { prof: 2 });
    p.forma(m(w, [[.17, -.55], [.19, -.72], [.28, -.6]]), cor, D);
    p.forma(m(w, [[.27, -.6], [.36, -.72], [.38, -.55]]), cor, D);
    p.circulo(w * .27, -w * .49, w * .125, cor, { prof: 1 });
    for (const dy of [-.03, .025]) p.linha([[w * .37, -w * .45], [w * .5, -w * (.45 - dy) + Math.sin(tt * 5) * w * .006]], sobreFundo(p), w * .01);
    p.circulo(w * .39, -w * .47, w * .022, "tinta", D);
    olho(p, w * .31, -w * .52, w * .03, tt, .3);
  });
}
/** Pássaro voando de perfil, batendo a asa e subindo e descendo. Opções: larg, cor, t. Chaves: pássaro, ave, passarinho, voar, liberdade, leveza, céu, mensagem */
export function passaro(p, { larg = 280, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bico = cor === "c4" ? "c2" : "c4", bat = Math.sin(tt * 11);
  p.em({ x: 0, y: -bat * w * .03 + w * .06, r: Math.sin(tt * 2) * .06 }, () => {
    p.em({ x: -w * .2, y: w * .02, r: Math.sin(tt * 5.5) * .12 }, () => p.forma(m(w, [[.04, -.06], [-.28, -.12], [-.22, 0], [-.3, .1], [.04, .08]]), escuro(p, cor, .25), { prof: 1 }));
    p.elipse(0, 0, w * .27, w * .18, cor, { prof: 2 });
    p.circulo(w * .23, -w * .12, w * .13, cor, { prof: 1 });
    p.forma(m(w, [[.33, -.19], [.5, -.12], [.33, -.06]]), bico, D);
    p.elipse(w * .06, w * .07, w * .15, w * .085, "claro", D);
    p.em({ x: -w * .02, y: -w * .04, sy: lerp(-.75, 1, .5 + .5 * bat) }, () => p.forma(m(w, [[.12, .02], [.02, -.3], [-.26, -.4], [-.22, -.14], [-.14, .04]]), escuro(p, cor, .3), { prof: 1 }));
    olho(p, w * .27, -w * .15, w * .034, tt, .5);
  });
}
/** Peixe nadando: a cauda bate, o corpo ondula e bolhas sobem. Opções: larg, cor, t. Chaves: peixe, nadar, mar, rio, pesca, aquário, oceano, fluir */
export function peixe(p, { larg = 300, cor = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bat = Math.sin(tt * 7), nad = escuro(p, cor, .28);
  for (let i = 0; i < 3; i++) { const f = (tt * .5 + i / 3) % 1; p.alfa(1 - f, () => p.linha(circP(w * (.4 + .04 * Math.sin(f * 9 + i)), -w * (.06 + f * .32), w * (.022 + .02 * f), 12), sobreFundo(p), w * .012, { fechar: true })); }
  p.em({ x: 0, y: Math.sin(tt * 2.2) * w * .02, r: -bat * .05 }, () => {
    p.em({ x: -w * .2, y: 0, r: bat * .38 }, () => p.forma(m(w, [[.04, -.04], [-.26, -.2], [-.18, 0], [-.26, .2], [.04, .04]]), nad, { prof: 1 }));
    p.forma(m(w, [[-.08, -.13], [.04, -.28], [.2, -.12]]), nad, D);
    p.forma(m(w, [[0, .13], [-.06, .24], [.12, .14]]), nad, D);
    p.elipse(w * .06, 0, w * .3, w * .17, cor, { prof: 2 });
    p.linha(arcoP(w * .1, 0, w * .13, -50, 50, 8), "tinta", w * .014);
    p.em({ x: w * .02, y: w * .03, r: .5 + bat * .25 }, () => p.forma(m(w, [[0, 0], [-.13, .02], [-.08, .1]]), nad, D));
    olho(p, w * .23, -w * .045, w * .038, tt, .2);
  });
}
/** Cavalo de perfil trotando, com crina e cauda ao vento. Opções: larg, cor, crina, andando, t. Chaves: cavalo, galope, corrida, força, potência, velocidade, fazenda, montaria */
export function cavalo(p, { larg = 380, cor = "c1", crina = "c4", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), v = Math.sin(tt * 6) * .02;
  p.forma(fita(curvaP(-w * .3, -w * .62, w * .42, 2.5, -.9, 8, k => Math.sin(tt * 5 - k * 3) * .3 * k), k => w * (.05 + .09 * Math.sin(k * 2.6))), crina, { prof: 1, liso: true });
  pernas(p, [-w * .22, w * .15], -w * .42, w * .06, cor, tt, { andando, casco: "tinta", vel: 8, amp: .45 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 8) }, () => {
    p.forma(retArredP(-w * .33, -w * .68, w * .58, w * .29, w * .13), cor, { prof: 2 });
    p.forma(m(w, [[.06, -.62], [.2, -.92], [.34, -.86], [.27, -.5], [.14, -.42]]), cor, D);
    p.forma(m(w, [[.22, -.93], [.24, -1.04], [.31, -.92]]), cor, D);
    p.capsula([w * .27, -w * .87], [w * .43, -w * .72], w * .14, cor);
    p.capsula([w * .4, -w * .75], [w * .47, -w * .69], w * .105, cor);
    p.forma(m(w, [[.24, -.98 + v], [.3, -.9], [.17, -.6], [.03, -.56 + v], [.09, -.72], [.06, -.8 + v], [.15, -.86]]), crina, { prof: 1, liso: true });
    p.circulo(w * .485, -w * .7, w * .018, "tinta", D);
    olho(p, w * .34, -w * .84, w * .028, tt, .1);
  });
}
/** Vaca malhada de perfil que anda, mastiga e balança o rabo. Opções: larg, cor, manchas, andando, t. Chaves: vaca, boi, gado, leite, fazenda, pecuária, agronegócio, rebanho */
export function vaca(p, { larg = 380, cor = "claro", manchas = "tinta", andando = true, t = 0 } = {}) {
  cor = branco(p, cor); manchas = pinta(p, manchas);
  const w = larg, tt = p.ritmo(t), corpo = retArredP(-w * .36, -w * .66, w * .6, w * .35, w * .1), rabo = curvaP(-w * .35, -w * .6, w * .34, 1.9 + Math.sin(tt * 4) * .3, -.2, 6, k => Math.sin(tt * 4 - k * 2) * .3 * k);
  p.circulo(-w * .12, -w * .31, w * .06, "c2", D);
  pernas(p, [-w * .25, w * .13], -w * .34, w * .065, cor, tt, { andando, casco: manchas, vel: 5, amp: .3 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 5) }, () => {
    p.forma(fita(rabo, w * .028), cor, D); p.circulo(rabo[6][0], rabo[6][1], w * .04, manchas, D);
    p.forma(corpo, cor, { prof: 2 });
    p.recortar(corpo, () => { for (const [x, y, r] of [[-.3, -.62, .13], [-.06, -.4, .11], [.1, -.66, .1]]) p.circulo(w * x, w * y, w * r, manchas, { prof: 0, semente: 5 }); });
    p.forma(m(w, [[.2, -.78], [.21, -.92], [.3, -.8]]), "c4", D);
    p.capsula([w * .2, -w * .72], [w * .1, -w * .76], w * .065, cor);
    p.forma(m(w, [[.16, -.74], [.24, -.82], [.36, -.8], [.47, -.56], [.44, -.46], [.33, -.44], [.2, -.56]]), cor, { prof: 1, liso: true });
    p.elipse(w * .405, -w * .5 + Math.sin(tt * 6) * w * .008, w * .075, w * .062, "c2", D);
    olho(p, w * .32, -w * .7, w * .03, tt, .4);
  });
}
/** Porco de perfil que anda, com o rabinho enrolado girando e a orelha balançando. Opções: larg, cor, andando, t. Chaves: porco, leitão, cofrinho, poupança, economia, fazenda, suíno, guardar dinheiro */
export function porco(p, { larg = 320, cor = "c2", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fuc = escuro(p, cor, .22);
  pernas(p, [-w * .2, w * .12], -w * .2, w * .075, cor, tt, { andando, casco: "tinta", vel: 8, amp: .3 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 8) }, () => {
    p.linha(Array.from({ length: 14 }, (_, i) => { const a = i * .75 + tt * 3, r = w * (.02 + i * .0028); return [-w * .4 - i * w * .004 + Math.cos(a) * r, -w * .46 + Math.sin(a) * r]; }), cor, w * .028);
    p.elipse(-w * .05, -w * .38, w * .34, w * .23, cor, { prof: 2 });
    p.circulo(w * .24, -w * .37, w * .165, cor, { prof: 1 });
    p.elipse(w * .405, -w * .35, w * .05, w * .08, fuc, D);
    p.circulo(w * .41, -w * .35, w * .022, "tinta", D);
    p.em({ x: w * .2, y: -w * .5, r: Math.sin(tt * 6) * .15 }, () => p.forma(m(w, [[-.07, .03], [.0, -.14], [.09, .04]]), fuc, { prof: 1, liso: true }));
    olho(p, w * .3, -w * .42, w * .03, tt, .6);
  });
}
/** Galinha de perfil que caminha e cisca, baixando a cabeça para bicar. Opções: larg, cor, crista, andando, t. Chaves: galinha, frango, ave, ovo, granja, galinheiro, fazenda, ciscar */
export function galinha(p, { larg = 260, cor = "claro", crista = "c1", andando = true, t = 0 } = {}) {
  cor = branco(p, cor); if (cor === "tinta" && crista === "c1") crista = "c2"; // no traco e no vidro c1 é azul: a crista fica no tom quente
  const w = larg, tt = p.ritmo(t), f = (tt * .6) % 1, bica = f < .3 ? Math.sin(f / .3 * Math.PI) : 0, asa = escuro(p, cor, .16);
  for (let i = 0; i < 2; i++) {
    const a = andando ? Math.sin(tt * 7 + i * Math.PI) * .35 : 0, x = -w * .03 + i * w * .04, pe = [x + Math.sin(a) * w * .28, -w * .025 - Math.max(0, Math.cos(tt * 7 + i * Math.PI)) * (andando ? w * .03 : 0)];
    p.capsula([x, -w * .3], pe, w * .04, "c4"); p.capsula([pe[0] - w * .03, pe[1]], [pe[0] + w * .09, pe[1]], w * .04, "c4");
  }
  p.em({ x: 0, y: -sobe(tt, andando, w) }, () => {
    p.em({ x: -w * .2, y: -w * .5, r: Math.sin(tt * 5) * .08 }, () => p.forma(m(w, [[.06, .04], [-.1, -.34], [-.14, -.2], [-.24, -.3], [-.22, -.14], [-.3, -.16], [-.2, .04], [0, .12]]), cor, { prof: 1 }));
    p.elipse(-w * .04, -w * .45, w * .27, w * .21, cor, { prof: 2 });
    p.em({ x: w * .12, y: -w * .5, r: bica * 1.25 }, () => {
      p.capsula([0, 0], [w * .09, -w * .26], w * .16, cor);
      for (const [x, y] of [[.04, -.38], [.105, -.41], [.16, -.37]]) p.circulo(w * x, w * y, w * .045, crista, D);
      p.circulo(w * .165, -w * .19, w * .04, crista, D);
      p.circulo(w * .1, -w * .29, w * .095, cor, { prof: 1 });
      p.forma(m(w, [[.17, -.34], [.3, -.28], [.17, -.23]]), "c4", D);
      olho(p, w * .12, -w * .31, w * .03, tt, .7);
    });
    p.em({ x: -w * .06, y: -w * .46, r: -.15 + Math.sin(tt * 7) * .06 }, () => p.elipse(0, 0, w * .16, w * .1, asa, D));
  });
}
/** Borboleta vista de cima batendo as asas e flutuando. Opções: larg, cor, cor2, t. Chaves: borboleta, transformação, metamorfose, leveza, mudança, primavera, delicadeza, evolução */
export function borboleta(p, { larg = 300, cor = "c1", cor2 = "c2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = .3 + .7 * Math.abs(Math.cos(tt * 5)), s = sobreFundo(p);
  p.em({ x: 0, y: Math.sin(tt * 2.5) * w * .04, r: Math.sin(tt * 1.3) * .14 }, () => {
    for (const lado of [-1, 1]) p.em({ x: 0, y: 0, sx: lado * f }, () => {
      p.forma(m(w, [[.02, .0], [.3, .02], [.4, .2], [.3, .4], [.14, .4], [.04, .26]]), cor2, { prof: 1 });
      p.forma(m(w, [[.02, -.04], [.1, -.34], [.34, -.46], [.5, -.36], [.48, -.14], [.3, .04], [.02, .06]]), cor, { prof: 2 });
      p.circulo(w * .33, -w * .26, w * .075, "claro", D); p.circulo(w * .24, w * .22, w * .05, "claro", D);
    });
    for (const lado of [-1, 1]) p.linha(curvaP(lado * w * .015, -w * .26, w * .22, -Math.PI / 2 + lado * .25, lado * 1.1, 6), s, w * .014);
    p.capsula([0, -w * .2], [0, w * .26], w * .065, s);
    p.circulo(0, -w * .25, w * .05, s, D);
  });
}
/** Abelha listrada voando em zigue-zague, com as asas batendo depressa. Opções: larg, cor, t. Chaves: abelha, mel, colmeia, trabalho em equipe, produtividade, polinização, zumbido, inseto */
export function abelha(p, { larg = 280, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), corpo = circP(-w * .04, 0, w * .26, 28, w * .18), s = sobreFundo(p), bat = Math.sin(tt * 30);
  p.em({ x: Math.sin(tt * 2) * w * .04, y: Math.sin(tt * 4) * w * .04 + w * .08, r: Math.sin(tt * 2) * .08 }, () => {
    p.forma(m(w, [[-.27, -.05], [-.42, 0], [-.27, .05]]), s, D);
    p.linha(curvaP(w * .28, -w * .1, w * .17, -1.2, 1 + Math.sin(tt * 6) * .3, 5), s, w * .016);
    p.forma(corpo, cor, { prof: 2 });
    p.recortar(corpo, () => { for (const x of [-.2, -.06, .08]) p.forma(m(w, [[x, -.2], [x + .07, -.2], [x + .07, .2], [x, .2]]), "tinta", D); });
    p.circulo(w * .25, -w * .01, w * .115, cor, { prof: 1 });
    olho(p, w * .29, -w * .03, w * .034, tt, .8);
    p.alfa(.85, () => { for (const [x, r] of [[-.1, -.5], [.03, .2]]) p.em({ x: w * x, y: -w * .15, r: r + bat * .28 }, () => p.elipse(0, -w * .17, w * .085, w * .19, "claro", { prof: 1, liso: true })); });
  });
}
/** Cobra enrolada com o pescoço erguido balançando e a língua saindo. Opções: larg, cor, t. Chaves: cobra, serpente, veneno, perigo, traição, ameaça, bote, armadilha */
export function cobra(p, { larg = 340, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bal = Math.sin(tt * 2.4), lingua = (tt * .9) % 1 < .45 ? Math.abs(Math.sin(tt * 18)) : 0, esc = escuro(p, cor, .2);
  const col = curvaP(w * .02, -w * .34, w * .5, -2.1, 1.5 + bal * .25, 12, k => bal * .25 * k), fim = col[12], ant = col[11], ang = Math.atan2(fim[1] - ant[1], fim[0] - ant[0]) + .9;
  p.forma(fita(curvaP(-w * .22, -w * .05, w * .3, Math.PI, .3 + Math.sin(tt * 5) * .4, 6), k => w * (.09 - .075 * k)), cor, D);
  // no pixel as voltas encostadas viram um cone liso: lá ficam faixas separadas por um vão escuro, com larguras bem diferentes
  const px = p.estilo === "pixel", voltas = px ? [[-.33, .66, 0, .105], [-.22, .46, .125, .1], [-.14, .3, .245, .095]] : [[-.3, .6, 0, .125], [-.23, .46, .11, .125], [-.15, .3, .22, .125]];
  voltas.forEach(([x, l, y, h], i) => { p.forma(retArredP(w * x, -w * (y + h), w * l, w * h, w * h / 2), (i + (px ? 1 : 0)) % 2 ? esc : cor, { prof: 1, liso: true }); });
  if (px) for (const [x, l, y] of voltas.slice(1)) p.linha([[w * (x - .02), -w * (y - .01)], [w * (x + l + .02), -w * (y - .01)]], "fundo", w * .02);
  p.forma(fita(col, k => w * (px ? .15 - .03 * k : .115 - .03 * k)), cor, { prof: 1, liso: true });
  p.em({ x: fim[0], y: fim[1], r: ang }, () => {
    if (lingua > .1) p.linha([[w * .1, 0], [w * (.12 + lingua * .1), 0], [w * (.15 + lingua * .13), -w * .03], [w * (.12 + lingua * .1), 0], [w * (.15 + lingua * .13), w * .03]], cor === "c1" ? "c2" : "c1", w * .016);
    p.forma(m(w, [[-.07, -.055], [.04, -.075], [.15, -.03], [.15, .03], [.04, .07], [-.07, .05]]), cor, { prof: 1, liso: true });
    olho(p, w * .055, -w * .025, w * .028, tt, .15);
  });
}
/** Tartaruga de perfil andando devagar, com a cabeça entrando e saindo do casco. Opções: larg, cor, pele, andando, t. Chaves: tartaruga, lento, devagar, paciência, longevidade, proteção, casco, persistência */
export function tartaruga(p, { larg = 340, cor = "c3", pele = "c4", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ext = vaiVem(tt, .25) * w * .07, casco = [...arcoP(0, -w * .15, w * .31, 180, 360, 18).map(([x, y]) => [x, -w * .15 + (y + w * .15) * .95]), [w * .31, -w * .15]];
  pernas(p, [-w * .2, w * .14], -w * .13, w * .09, pele, tt, { andando, vel: 3, amp: .35 });
  p.forma(m(w, [[-.28, -.14], [-.42, -.08 + Math.sin(tt * 3) * .015], [-.28, -.07]]), pele, D);
  p.capsula([w * .24, -w * .15], [w * .36 + ext, -w * .25], w * .1, pele);
  p.circulo(w * .38 + ext, -w * .27, w * .085, pele, { prof: 1 });
  olho(p, w * .4 + ext, -w * .29, w * .028, tt, .25);
  p.forma(casco, cor, { prof: 2 });
  p.recortar(casco, () => { for (const [x, y] of [[-.17, -.25], [0, -.34], [.17, -.25]]) p.linha(circP(w * x, w * y, w * .085, 6), "tinta", w * .014, { fechar: true }); });
  p.forma(retArredP(-w * .34, -w * .17, w * .68, w * .07, w * .035), escuro(p, cor, .25), D);
}
/** Elefante de perfil que anda balançando a tromba e abanando a orelha. Opções: larg, cor, andando, t. Chaves: elefante, memória, grande, peso, força, gigante, sabedoria, safári */
export function elefante(p, { larg = 400, cor = "c4", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rabo = curvaP(-w * .39, -w * .58, w * .24, 1.8 + Math.sin(tt * 3) * .25, -.2, 5);
  pernas(p, [-w * .22, w * .1], -w * .3, w * .13, cor, tt, { andando, vel: 4, amp: .22 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 4) }, () => {
    p.forma(fita(rabo, w * .025), cor, D); p.circulo(rabo[5][0], rabo[5][1], w * .03, "tinta", D);
    p.elipse(-w * .08, -w * .5, w * .33, w * .25, cor, { prof: 2 });
    p.forma(fita(curvaP(w * .38, -w * .6, w * .52, 1.0, .75 + Math.sin(tt * 2.5) * .35, 12, k => Math.sin(tt * 2.5 - k * 2) * .2 * k).map(([x, y]) => [x, Math.min(y, -w * .03)]), k => w * (.13 - .07 * k)), cor, { prof: 1, liso: true });
    p.circulo(w * .25, -w * .6, w * .19, cor, { prof: 1 });
    p.forma(fita(curvaP(w * .33, -w * .47, w * .17, .7, -1, 5), k => w * (.05 - .035 * k)), "#FFFFFF", D);
    p.em({ x: w * .2, y: -w * .68, sx: .8 + .2 * Math.sin(tt * 3) }, () => p.forma(m(w, [[.03, -.06], [-.12, -.1], [-.2, .02], [-.17, .2], [-.06, .27], [.03, .14]]), escuro(p, cor, .22), { prof: 1 }));
    olho(p, w * .33, -w * .66, w * .028, tt, .35);
  });
}
/** Leão de perfil que anda, com a juba pulsando e o rabo de tufo balançando. Opções: larg, cor, juba, andando, t. Chaves: leão, rei, liderança, coragem, força, selva, imposto de renda, poder */
export function leao(p, { larg = 380, cor = "c4", juba = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rabo = curvaP(-w * .31, -w * .5, w * .38, 2.6, -2.2, 8, k => Math.sin(tt * 4 - k * 2) * .35 * k);
  pernas(p, [-w * .23, w * .1], -w * .3, w * .075, cor, tt, { andando, vel: 6 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 6) }, () => {
    p.forma(fita(rabo, w * .035), cor, D); p.circulo(rabo[8][0], rabo[8][1], w * .05, juba, D);
    p.forma(retArredP(-w * .34, -w * .57, w * .54, w * .28, w * .13), cor, { prof: 2 });
    p.forma(estrelaP(w * .2, -w * .6, w * (.265 + .012 * Math.sin(tt * 5)), w * .215, 13, tt * .25), juba, { prof: 1 });
    p.circulo(w * .19, -w * .74, w * .045, cor, D);
    p.circulo(w * .27, -w * .6, w * .135, cor, { prof: 1 });
    p.elipse(w * .37, -w * .555, w * .075, w * .065, "claro", D);
    p.circulo(w * .425, -w * .585, w * .028, "tinta", D);
    olho(p, w * .31, -w * .65, w * .03, tt, .45);
  });
}
/** Macaco sentado coçando a cabeça, com a cauda enrolada balançando. Opções: larg, cor, rosto, t. Chaves: macaco, primata, brincadeira, imitação, travessura, selva, esperteza, bagunça */
export function macaco(p, { larg = 300, cor = "c1", rosto = "pele4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), coca = Math.sin(tt * 9) * w * .025, bal = Math.sin(tt * 2) * .04;
  p.forma(fita(curvaP(-w * .12, -w * .08, w * .8, Math.PI + .2, 4.6, 20, k => Math.sin(tt * 2.5) * .25 * k), w * .05), cor, D);
  p.capsula([-w * .13, -w * .46], [-w * .21, -w * .16], w * .085, escuro(p, cor, .2));
  p.elipse(0, -w * .31, w * .21, w * .29, cor, { prof: 2 });
  p.elipse(w * .03, -w * .28, w * .12, w * .18, rosto, D);
  p.capsula([w * .02, -w * .09], [w * .2, -w * .05], w * .1, cor); p.capsula([w * .2, -w * .04], [w * .29, -w * .04], w * .075, rosto);
  p.em({ x: w * .03, y: -w * .55, r: bal }, () => {
    for (const x of [-.2, .2]) { p.circulo(w * x, -w * .17, w * .08, cor, { prof: 1 }); p.circulo(w * x, -w * .17, w * .042, rosto, D); }
    p.circulo(0, -w * .16, w * .19, cor, { prof: 1 });
    for (const x of [-.07, .07]) p.circulo(w * x, -w * .19, w * .09, rosto, D);
    p.elipse(0, -w * .08, w * .14, w * .1, rosto, D);
    for (const x of [-.07, .07]) p.circulo(w * x, -w * .19, w * .028, "#000000", D);
    p.linha(arcoP(0, -w * .1, w * .07, 25, 155, 6), "tinta", w * .014);
  });
  p.capsula([w * .15, -w * .47], [w * .33, -w * .62], w * .085, cor); p.capsula([w * .33, -w * .62], [w * .2 + coca, -w * .9], w * .08, cor);
  p.circulo(w * .2 + coca, -w * .91, w * .05, rosto, D);
}
/** Onça-pintada de perfil andando agachada, com a cauda longa ondulando. Opções: larg, cor, andando, t. Chaves: onça, jaguar, pintada, predador, caça, Pantanal, Amazônia, agilidade */
export function onca(p, { larg = 380, cor = "c4", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), rabo = curvaP(-w * .31, -w * .44, w * .44, 2.4, -1.7, 10, k => Math.sin(tt * 3 - k * 3) * .3 * k), corpo = retArredP(-w * .34, -w * .51, w * .58, w * .25, w * .12);
  pernas(p, [-w * .24, w * .13], -w * .27, w * .075, cor, tt, { andando, vel: 6 });
  p.em({ x: 0, y: -sobe(tt, andando, w, 6) }, () => {
    p.forma(fita(rabo, w * .05), cor, D);
    for (const i of [4, 7, 10]) p.circulo(rabo[i][0], rabo[i][1], w * .03, "tinta", D);
    p.forma(corpo, cor, { prof: 2 });
    for (const [x, y] of [[-.27, -.44], [-.2, -.34], [-.13, -.45], [-.05, -.35], [.03, -.45], [.11, -.36], [-.29, -.33]]) p.forma(circP(w * x, w * y, w * .034, 10), "tinta", { prof: 0, liso: true, furos: [circP(w * x, w * y, w * .014, 8).reverse()] });
    for (const x of [.19, .3]) p.circulo(w * x, -w * .59, w * .045, cor, D);
    p.circulo(w * .27, -w * .48, w * .13, cor, { prof: 1 });
    p.elipse(w * .37, -w * .44, w * .065, w * .055, "claro", D);
    p.circulo(w * .42, -w * .465, w * .026, "tinta", D);
    olho(p, w * .31, -w * .52, w * .03, tt, .55);
  });
}
/** Jacaré de perfil rastejando, abrindo e fechando a boca cheia de dentes e batendo a cauda. Opções: larg, cor, andando, t. Chaves: jacaré, crocodilo, pântano, perigo, mordida, Pantanal, predador, risco */
export function jacare(p, { larg = 420, cor = "c3", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), ab = .06 + .3 * vaiVem(tt, .45), cw = Math.sin(tt * 3) * .03, eixo = [w * .18, -w * .13], esc = escuro(p, cor, .25);
  const gira = (pts, a) => rotP(m(w, pts), eixo[0], eixo[1], a);
  pernas(p, [-w * .16, w * .1], -w * .1, w * .06, cor, tt, { andando, vel: 5, amp: .5 });
  for (let i = 0; i < 6; i++) { const x = -.3 + i * .08; p.forma(m(w, [[x - .035, -.19 + (i < 2 ? .05 * (2 - i) : 0)], [x, -.25 + (i < 2 ? .05 * (2 - i) : 0)], [x + .035, -.19 + (i < 2 ? .04 * (2 - i) : 0)]]), esc, D); }
  p.forma(m(w, [[-.5, -.07 - cw * 2], [-.34, -.13 - cw], [-.2, -.2], [.16, -.21], [.22, -.17], [.22, -.05], [-.2, -.04], [-.36, -.035 - cw], [-.5, -.03 - cw * 2]]), cor, { prof: 2 });
  p.forma(gira([[.18, -.13], [.5, -.125], [.49, -.075], [.18, -.04]], ab * .35), cor, { prof: 1, liso: true });
  for (const x of [.27, .34, .41, .47]) p.forma(gira([[x - .02, -.125], [x + .02, -.125], [x, -.165]], ab * .35), "#FFFFFF", D);
  for (const x of [.26, .33, .4, .47]) p.forma(gira([[x - .02, -.14], [x + .02, -.14], [x, -.095]], -ab), "#FFFFFF", D);
  p.forma(gira([[.16, -.21], [.22, -.275], [.29, -.22], [.48, -.2], [.52, -.17], [.51, -.135], [.18, -.13]], -ab), cor, { prof: 1, liso: true });
  const o = gira([[.225, -.225]], -ab)[0]; olho(p, o[0], o[1], w * .026, tt, .65);
}
/** Tubarão nadando de perfil, com a cauda batendo e a barbatana cortando a água. Opções: larg, cor, t. Chaves: tubarão, predador, perigo, mar, ameaça, concorrência, agressivo, investidor */
export function tubarao(p, { larg = 400, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bat = Math.sin(tt * 5), esc = escuro(p, cor, .22);
  const corpo = m(w, [[.5, -.03], [.36, -.11], [.1, -.15], [-.16, -.11], [-.36, -.035], [-.36, .025], [-.16, .08], [.1, .13], [.34, .1], [.46, .04]]);
  p.em({ x: 0, y: Math.sin(tt * 2) * w * .02, r: -bat * .035 }, () => {
    p.em({ x: -w * .33, y: 0, r: bat * .3 }, () => p.forma(m(w, [[.02, -.03], [-.2, -.26], [-.11, 0], [-.17, .16], [.02, .03]]), esc, { prof: 1 }));
    p.forma(m(w, [[.1, -.14], [-.06, -.36], [-.12, -.11]]), esc, { prof: 1 });
    p.forma(corpo, cor, { prof: 2 });
    p.recortar(corpo, () => p.elipse(w * .12, w * .17, w * .46, w * .12, "claro", D));
    p.em({ x: w * .12, y: w * .07, r: bat * .1 }, () => p.forma(m(w, [[.06, 0], [-.12, .2], [-.08, 0]]), esc, { prof: 1 }));
    for (const x of [.3, .35, .4]) p.forma(m(w, [[x - .022, .055], [x + .022, .05], [x, .095]]), "#FFFFFF", D);
    p.linha(m(w, [[.24, .06], [.44, .045]]), "tinta", w * .014);
    for (const x of [.14, .18, .22]) p.linha(m(w, [[x, -.06], [x - .015, .02]]), "tinta", w * .012);
    olho(p, w * .36, -w * .04, w * .028, tt, .75);
  });
}
/** Baleia nadando com a cauda batendo e o esguicho de água subindo. Opções: larg, cor, t. Chaves: baleia, oceano, gigante, mar, grande investidor, imenso, profundidade, esguicho */
export function baleia(p, { larg = 400, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bat = Math.sin(tt * 3), agua = cor === "c4" ? "c3" : "c4", f = ciclo(tt, 1.2, .5);
  const corpo = [...arcoP(w * .16, w * .04, w * .25, -90, 90, 12), ...m(w, [[-.1, .26], [-.3, .1], [-.42, -.02], [-.36, -.1], [-.2, -.12], [-.04, -.2]])];
  p.em({ x: 0, y: Math.sin(tt * 1.6) * w * .02 + w * .04, r: bat * .03 }, () => {
    for (const lado of [-1, 1]) p.alfa(1 - f * .6, () => p.linha(curvaP(w * .12, -w * .22, w * .2 * f + 1, -Math.PI / 2 + lado * .15, lado * 2.2, 8), agua, w * .03));
    p.em({ x: -w * .38, y: -w * .06, r: bat * .3 }, () => p.forma(m(w, [[.03, .03], [-.04, -.03], [-.16, -.2], [-.1, -.04], [-.2, .08], [-.03, .05]]), cor, { prof: 1 }));
    p.forma(corpo, cor, { prof: 2 });
    p.recortar(corpo, () => { p.elipse(w * .1, w * .32, w * .4, w * .16, "claro", D); for (const x of [0, .08, .16, .24]) p.linha(m(w, [[x, .2], [x + .05, .3]]), escuro(p, "claro", .25), w * .012); });
    p.em({ x: w * .08, y: w * .15, r: .3 + bat * .2 }, () => p.forma(m(w, [[.05, 0], [-.1, .14], [-.06, 0]]), escuro(p, cor, .22), { prof: 1 }));
    p.linha(arcoP(w * .34, w * .0, w * .09, 30, 110, 6), "tinta", w * .014);
    olho(p, w * .27, -w * .02, w * .03, tt, .85);
  });
}
/** Coruja de frente pousada num galho, piscando, mexendo os olhos e inclinando a cabeça. Opções: larg, cor, t. Chaves: coruja, sabedoria, estudo, noite, conhecimento, educação, atenção, professor */
export function coruja(p, { larg = 240, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), olha = Math.sin(tt * 1.5) * w * .03, pisca = (tt * .3) % 1 < .07, esc = escuro(p, cor, .25);
  p.capsula([-w * .5, -w * .05], [w * .5, -w * .05], w * .08, "c3");
  p.em({ x: 0, y: -w * .1, r: Math.sin(tt * 1.2) * .05 }, () => {
    for (const s of [-1, 1]) p.forma(m(w, [[s * .3, -.64], [s * .27, -.98], [s * .06, -.8]]), cor, { prof: 1 });
    p.elipse(0, -w * .44, w * .32, w * .44, cor, { prof: 2 });
    p.elipse(0, -w * .3, w * .19, w * .25, "claro", D);
    for (const [x, y] of [[-.08, -.34], [.08, -.34], [0, -.22], [-.08, -.12], [.08, -.12]]) p.linha(m(w, [[x - .04, y - .03], [x, y], [x + .04, y - .03]]), esc, w * .018);
    for (const s of [-1, 1]) p.em({ x: s * w * .3, y: -w * .56, r: s * (-.12 - .1 * vaiVem(tt, .6)) }, () => p.elipse(0, w * .2, w * .09, w * .25, esc, { prof: 1 }));
    for (const s of [-1, 1]) {
      p.circulo(s * w * .135, -w * .62, w * .135, "claro", D);
      if (pisca) p.linha([[s * w * .135 - w * .08, -w * .62], [s * w * .135 + w * .08, -w * .62]], "tinta", w * .025);
      else { p.circulo(s * w * .135, -w * .62, w * .095, "#FFFFFF", D); p.circulo(s * w * .135 + olha, -w * .62, w * .05, "#000000", D); }
    }
    p.forma(m(w, [[-.05, -.56], [.05, -.56], [0, -.44]]), "c4", D);
    for (const s of [-1, 1]) p.capsula([s * w * .1, -w * .01], [s * w * .1, w * .04], w * .09, "c4");
  });
}
/** Sapo de perfil que infla o papo e dá um pulinho de tempos em tempos. Opções: larg, cor, t. Chaves: sapo, rã, pulo, lagoa, brejo, salto, engolir sapo, anfíbio */
export function sapo(p, { larg = 300, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .45) % 1, pulo = f < .3 ? Math.sin(f / .3 * Math.PI) : 0, papo = 1 + .3 * vaiVem(tt, 1.2) * (1 - pulo), esc = escuro(p, cor, .22);
  p.em({ x: 0, y: -pulo * w * .22, r: -pulo * .18 }, () => {
    const pe = [-w * (.22 + pulo * .12), -w * .035 + pulo * w * .14];
    p.capsula([-w * .12, -w * .12], pe, w * .06, esc); p.capsula(pe, [pe[0] + w * (.2 - pulo * .08), pe[1] + pulo * w * .02], w * .06, esc);
    p.capsula([w * .2, -w * .18], [w * .25, -w * .04], w * .06, esc); p.capsula([w * .23, -w * .03], [w * .35, -w * .03], w * .055, esc);
    p.forma(m(w, [[-.36, -.08], [-.3, -.26], [-.1, -.4], [.14, -.44], [.34, -.38], [.42, -.28], [.36, -.16], [.16, -.07], [-.2, -.04]]), cor, { prof: 2 });
    p.elipse(w * .23, -w * .15, w * .11 * papo, w * .075 * papo, "claro", D);
    p.em({ x: -w * .16, y: -w * .14, r: -.5 + pulo * .6 }, () => p.elipse(0, 0, w * .18, w * .09, esc, { prof: 1 }));
    p.linha(m(w, [[.41, -.27], [.28, -.25], [.14, -.27]]), "tinta", w * .016);
    p.circulo(w * .2, -w * .44, w * .085, cor, { prof: 1 });
    p.circulo(w * .21, -w * .45, w * .058, "#FFFFFF", D);
    if ((tt * .33) % 1 < .06) p.linha(m(w, [[.15, -.45], [.27, -.45]]), "tinta", w * .02); else p.circulo(w * .225, -w * .45, w * .032, "#000000", D);
  });
}
/** Formiga de perfil andando com as seis pernas e mexendo as antenas. Opções: larg, cor, andando, t. Chaves: formiga, trabalho, esforço, disciplina, pequeno, operária, formigueiro, persistência */
export function formiga(p, { larg = 300, cor = "c1", andando = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), esc = escuro(p, cor, .3), ant = Math.sin(tt * 6) * .25;
  // Pernas saem de baixo do tórax, com o joelho abaixo da barriga e aberto para fora: nenhuma cruza o corpo.
  // As seis ficam atrás do corpo (as de perto na cor do corpo, as de longe mais escuras), sem traço por cima dele.
  const pernaF = (i, c, fase) => {
    const x = (-.03 + i * .06) * w, d = [-.16, -.05, .13][i] * w, f = tt * 9 + i * 2.1 + fase;
    const s = andando ? Math.sin(f) : 0, sobe = andando ? Math.max(0, Math.cos(f)) : 0;
    p.linha([[x, -w * .255], [x + d * .75 + s * w * .025, -w * .2 - sobe * w * .015], [x + d * 1.05 + s * w * .06, -sobe * w * .035 - w * .015]], c, w * .032);
  };
  for (let i = 0; i < 3; i++) pernaF(i, esc, Math.PI);
  for (let i = 0; i < 3; i++) pernaF(i, cor, 0);
  p.em({ x: 0, y: Math.sin(tt * 9) * w * .006 }, () => {
    for (const k of [0, 1]) p.linha(curvaP(w * .3, -w * .45, w * .24, -1.1 + k * .35 + ant * (k ? 1 : -1), 1.3, 6), k ? cor : esc, w * .024);
    p.elipse(-w * .27, -w * .36, w * .2, w * .14, cor, { prof: 2 });
    p.elipse(w * .03, -w * .33, w * .13, w * .09, cor, { prof: 1 });
    p.circulo(w * .25, -w * .38, w * .105, cor, { prof: 1 });
    p.forma(m(w, [[.33, -.35], [.42, -.29], [.32, -.3]]), esc, D);
    olho(p, w * .28, -w * .4, w * .032, tt, .95);
  });
}
/** Aranha pendurada no fio, subindo e descendo e mexendo as oito pernas. Opções: larg, cor, t. Chaves: aranha, teia, medo, armadilha, fobia, rede, inseto, susto */
export function aranha(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), dy = Math.sin(tt * 1.6) * w * .06, esc = escuro(p, cor, .25);
  p.linha([[0, -w * .5], [0, dy - w * .1]], sobreFundo(p), w * .014);
  p.em({ x: 0, y: dy }, () => {
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const b = Math.sin(tt * 5 + i * 1.3 + (s > 0 ? 0 : 1.5)) * .05, a = -.75 + i * .5 + b * 3;
      p.linha([[s * w * .07, w * (.1 + i * .01)], [s * w * (.07 + Math.cos(a) * .22), w * (.08 + Math.sin(a) * .2 - .1)], [s * w * (.1 + Math.cos(a) * .36), w * (.14 + Math.sin(a) * .34)]], cor, w * .03);
    }
    p.circulo(0, -w * .03, w * .18, cor, { prof: 2 });
    for (const [x, y] of [[0, -.1], [-.07, -.01], [.07, -.01]]) p.circulo(w * x, w * y, w * .035, esc === p.cor(cor) ? "tinta" : esc, D);
    p.circulo(0, w * .17, w * .11, cor, { prof: 1 });
    for (const s of [-1, 1]) { p.circulo(s * w * .045, w * .2, w * .03, "#FFFFFF", D); p.circulo(s * w * .045, w * .21, w * .015, "#000000", D); }
  });
}
/** Pinguim em pé que ginga de um lado para o outro e bate as nadadeiras. Opções: larg, cor, t. Chaves: pinguim, frio, gelo, Antártida, inverno, polo sul, fofo, elegante */
export function pinguim(p, { larg = 220, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), g = Math.sin(tt * 5), bate = .35 + .35 * Math.sin(tt * 10);
  for (const s of [-1, 1]) p.capsula([s * w * .13 - w * .04, -w * .03 - Math.max(0, s * g) * w * .03], [s * w * .13 + w * .12, -w * .03 - Math.max(0, s * g) * w * .03], w * .07, "c4");
  p.em({ x: 0, y: 0, r: g * .07 }, () => {
    for (const s of [-1, 1]) p.em({ x: s * w * .26, y: -w * .68, r: -s * bate }, () => p.forma(m(w, [[-.06, -.02], [.06, -.02], [.05, .3], [0, .4], [-.05, .3]]), escuro(p, cor, .25), { prof: 1, liso: true }));
    p.forma([...arcoP(w * .02, -w * .88, w * .2, 180, 360, 10), ...m(w, [[.3, -.6], [.31, -.3], [.24, -.08], [0, -.03], [-.24, -.08], [-.31, -.3], [-.28, -.6]])], cor, { prof: 2 });
    p.elipse(w * .05, -w * .4, w * .2, w * .34, "claro", D);
    p.circulo(w * .09, -w * .86, w * .1, "claro", D);
    p.forma(m(w, [[.17, -.88], [.37, -.81], [.17, -.76]]), "c4", D);
    olho(p, w * .1, -w * .88, w * .034, tt, .05);
  });
}
