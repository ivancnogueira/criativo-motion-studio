// Categoria: Cidade e construções
// Kit de movimento — construções e mobiliário urbano vistos de frente, com a base em y = 0 e centrados em x = 0.
// Cada peça tem vida própria: janelas acendem, fumaça sobe, bandeiras tremulam, luzes giram. A convenção está em ./_comum.js.
import { clamp, lerp, rng, E, retP, retArredP, arcoP, poligonoP, escuro, maisClaro, misturarCor, sobreFundo, ciclo, vaiVem } from "./_comum.js";

const D = { prof: 0, liso: true };
// cor de texto ou detalhe claro em cima de um corpo colorido (no traco o corpo é vazado: usa a própria cor)
const sobreCor = (p, cor) => p.estilo === "traco" ? cor : "claro";
// asfalto e ferro escuro soltos sobre o fundo (no pixel, "tinta" some no fundo)
const asfalto = p => p.estilo === "pixel" ? "sombra" : "tinta";
// porta ou janela em arco: base em y, altura reta `a`, raio r
const arcoPorta = (x, y, r, a) => [...arcoP(x, y - a, r, 180, 360, 8), [x + r, y], [x - r, y]];

// grade de janelas que acendem e apagam em instantes diferentes
function janelas(p, x, y, w, h, cols, lin, tt, semente, { acesa = "c2", apagada = "tinta", fw = .62, fh = .62 } = {}) {
  const r = rng(semente + 11), cw = w / cols, ch = h / lin;
  for (let j = 0; j < lin; j++) for (let i = 0; i < cols; i++) { const f = r(); p.forma(retP(x + i * cw + cw * (1 - fw) / 2, y + j * ch + ch * (1 - fh) / 2, cw * fw, ch * fh), Math.sin(tt * (.5 + f) + f * 9) > 0 ? acesa : apagada, D); }
}
// bandeirinha tremulando a partir do topo do mastro (x, y)
function flamula(p, x, y, w, cor, tt, fase = 0) {
  const cima = [], baixo = [];
  for (let i = 0; i <= 6; i++) { const u = i / 6, o = Math.sin(i * 1.1 - tt * 6 + fase) * w * .1 * u; cima.push([x + w * u, y + o]); baixo.unshift([x + w * u, y + w * .58 + o]); }
  p.forma([...cima, ...baixo], cor, D);
}
// bolas de fumaça subindo e se desfazendo
function fumaca(p, x, y, r, tt, n = 4) {
  const forte = p.estilo === "pixel" ? 1 : .55;
  for (let i = 0; i < n; i++) { const f = (tt * .3 + i / n) % 1; p.alfa(forte * Math.min(1, 2 * (1 - f)), () => p.circulo(x + Math.sin(f * 5 + i * 2) * r * .5 + f * r * 1.4, y - f * r * 4.2, r * (.55 + f * .8), sobreFundo(p), { prof: 0, liso: true })); }
}
// facho de luz translúcido (no pixel, um contorno tracejado que anda)
function luz(p, pts, cor, a, tt) {
  if (p.estilo === "pixel") p.linha(pts, cor, 6, { fechar: true, tracejado: [12, 12], desloc: tt * 40 });
  else p.alfa(a, () => p.forma(pts, cor, D));
}

/** Arranha-céu em degraus com janelas acendendo e luz piscando na antena. Opções: larg, alt, cor, semente, t. Chaves: arranha-céu, prédio alto, torre, empresa, corporação, centro financeiro, crescimento, ambição */
export function arranhaCeu(p, { larg = 180, alt = 420, cor = "c4", semente = 0, t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), pisca = Math.sin(tt * 5) > 0;
  p.capsula([0, -h * .9], [0, -h * .985], w * .08, cor);
  p.forma(retP(-w * .2, -h * .92, w * .4, h * .12), cor, { prof: 1, semente: semente + 3 });
  p.forma(retP(-w * .36, -h * .82, w * .72, h * .24), cor, { prof: 1, semente: semente + 2 });
  p.forma(retP(-w / 2, -h * .62, w, h * .62), cor, { prof: 2, semente: semente + 1 });
  janelas(p, -w * .3, -h * .8, w * .6, h * .16, 2, 2, tt, semente + 5);
  janelas(p, -w * .44, -h * .6, w * .88, h * .5, 3, 5, tt, semente);
  p.forma(retP(-w * .13, -h * .07, w * .26, h * .07), "tinta", D);
  p.alfa(.35 + .3 * Math.sin(tt * 3.1), () => p.circulo(0, -h * .985, w * (.1 + .05 * Math.sin(tt * 3.1)), "c1", D));
  p.circulo(0, -h * .985, w * (pisca ? .075 : .05), pisca ? "c1" : "tinta", D);
}
/** Igreja com torre, cruz e sino que balança soltando ondas de som. Opções: larg, cor, telhado, t. Chaves: igreja, capela, religião, fé, templo, casamento, missa, tradição */
export function igreja(p, { larg = 280, cor = "claro", telhado = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bal = Math.sin(tt * 4) * .5;
  for (let i = 0; i < 2; i++) { const f = (tt * .9 + i / 2) % 1; p.alfa(1 - f, () => { for (const s of [-1, 1]) p.linha(arcoP(0, -w * .68, w * (.24 + f * .16), s > 0 ? -35 : 145, s > 0 ? 35 : 215, 8), "c2", w * .025); }); }
  p.forma([[-w * .5, -w * .4], [w * .5, -w * .4], [w * .4, -w * .58], [-w * .4, -w * .58]], telhado, { prof: 1, semente: 1 });
  p.forma(retP(-w * .46, -w * .4, w * .92, w * .4), cor, { prof: 2, semente: 2 });
  for (const s of [-1, 1]) p.forma(arcoPorta(s * w * .31, -w * .1, w * .055, w * .14), Math.sin(tt * .8 + s) > -.2 ? "c2" : "tinta", D);
  p.capsula([0, -w * 1.2], [0, -w * 1.42], w * .05, "c2"); p.capsula([-w * .08, -w * 1.34], [w * .08, -w * 1.34], w * .05, "c2");
  p.forma([[-w * .21, -w * .88], [w * .21, -w * .88], [0, -w * 1.24]], telhado, { prof: 1, semente: 3 });
  p.forma(retP(-w * .17, -w * .88, w * .34, w * .88), cor, { prof: 2, semente: 4 });
  p.forma(arcoPorta(0, -w * .56, w * .095, w * .14), "tinta", D);
  p.em({ x: 0, y: -w * .77, r: bal }, () => { p.forma([[-w * .03, 0], [w * .03, 0], [w * .07, w * .13], [-w * .07, w * .13]], "c2", D); p.circulo(0, w * .15, w * .028, "c2", D); });
  p.circulo(0, -w * .42, w * .055, "c4", D);
  p.forma(arcoPorta(0, 0, w * .085, w * .18), "tinta", D);
}
/** Escola com frontão, relógio que anda, placa e bandeira tremulando. Opções: larg, cor, telhado, texto, t. Chaves: escola, colégio, educação, ensino, aula, aprender, estudante, formação */
export function escola(p, { larg = 380, cor = "c2", telhado = "c1", texto = "ESCOLA", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), am = tt * 1.5, ah = tt * .25, cy = -w * .47;
  p.forma(retP(-w * .014, -w * .93, w * .028, w * .25), sobreFundo(p), D);
  flamula(p, w * .014, -w * .93, w * .17, "c3", tt);
  p.forma(retP(-w / 2, -w * .38, w, w * .38), cor, { prof: 2, semente: 1 });
  p.forma(retP(-w * .52, -w * .43, w * 1.04, w * .06), telhado, { prof: 1, semente: 2 });
  janelas(p, -w * .47, -w * .33, w * .28, w * .28, 2, 2, tt, 1, { acesa: "claro" });
  janelas(p, w * .19, -w * .33, w * .28, w * .28, 2, 2, tt, 5, { acesa: "claro" });
  p.forma(retP(-w * .17, -w * .56, w * .34, w * .56), cor, { prof: 2, semente: 3 });
  p.forma([[-w * .21, -w * .56], [w * .21, -w * .56], [0, -w * .72]], telhado, { prof: 1, semente: 4 });
  p.circulo(0, cy, w * .065, "claro", D);
  p.linha([[0, cy], [Math.sin(am) * w * .048, cy - Math.cos(am) * w * .048]], "tinta", w * .014);
  p.linha([[0, cy], [Math.sin(ah) * w * .03, cy - Math.cos(ah) * w * .03]], "tinta", w * .018);
  p.forma(retArredP(-w * .15, -w * .37, w * .3, w * .08, w * .012), "claro", D);
  p.texto(texto, 0, -w * .328, { tam: w * .052, cor: "tinta" });
  p.forma(retP(-w * .08, -w * .25, w * .16, w * .25), "tinta", D);
  p.forma(retP(-w * .2, -w * .03, w * .4, w * .03), telhado, D);
}
/** Hospital com cruz que pulsa, janelas acendendo e porta automática abrindo. Opções: larg, cor, cruz, t. Chaves: hospital, saúde, clínica, emergência, pronto-socorro, médico, tratamento, cuidado */
export function hospital(p, { larg = 340, cor = "claro", cruz = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), s = 1 + .1 * Math.sin(tt * 4), ab = E.entraSai(vaiVem(tt, .22)), a = w * .04, b = w * .115;
  p.forma(retP(-w / 2, -w * .5, w, w * .5), cor, { prof: 2, semente: 1 });
  p.forma(retP(-w * .21, -w * .9, w * .42, w * .9), cor, { prof: 2, semente: 2 });
  janelas(p, -w * .47, -w * .45, w * .25, w * .32, 2, 2, tt, 2, { apagada: "c4" });
  janelas(p, w * .22, -w * .45, w * .25, w * .32, 2, 2, tt, 6, { apagada: "c4" });
  janelas(p, -w * .16, -w * .57, w * .32, w * .22, 2, 2, tt, 9, { apagada: "c4" });
  p.em({ x: 0, y: -w * .73, s }, () => p.forma([[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]], cruz, D));
  p.forma(retP(-w * .13, -w * .25, w * .26, w * .25), "tinta", D);
  for (const d of [-1, 1]) { const lw = w * .12 * (1 - ab * .75); p.forma(retP(d < 0 ? -w * .12 : w * .12 - lw, -w * .24, lw, w * .24), "c4", D); }
  p.forma(retP(-w * .19, -w * .31, w * .38, w * .06), cruz, { prof: 1, liso: true });
}
/** Fábrica de telhado dentado com chaminés soltando fumaça e janelas acesas. Opções: larg, cor, t. Chaves: fábrica, indústria, produção, chaminé, poluição, manufatura, trabalho, economia */
export function fabrica(p, { larg = 360, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), x0 = -w * .5, d = w * .2, fe = escuro(p, cor, .3);
  fumaca(p, w * .37, -w * .86, w * .055, tt);
  fumaca(p, w * .2, -w * .66, w * .045, tt + 1.4, 3);
  p.forma(retP(w * .31, -w * .82, w * .12, w * .82), "c4", { prof: 1, semente: 1 });
  p.forma(retP(w * .295, -w * .84, w * .15, w * .05), fe, D);
  p.forma(retP(w * .155, -w * .62, w * .1, w * .62), "c4", { prof: 1, semente: 2 });
  p.forma(retP(w * .14, -w * .64, w * .13, w * .045), fe, D);
  for (let i = 0; i < 3; i++) p.forma([[x0 + i * d, -w * .29], [x0 + i * d, -w * .46], [x0 + (i + 1) * d, -w * .29]], fe, { prof: 1, liso: true });
  p.forma(retP(x0, -w * .3, w, w * .3), cor, { prof: 2, semente: 3 });
  janelas(p, x0 + w * .03, -w * .26, w * .56, w * .12, 4, 1, tt, 3, { fw: .68, fh: .75 });
  p.forma(retP(w * .14, -w * .2, w * .28, w * .2), "tinta", D);
  for (let i = 1; i < 3; i++) p.linha([[w * .16, -w * .2 + i * w * .066], [w * .4, -w * .2 + i * w * .066]], cor, w * .014);
}
/** Loja com toldo listrado balançando, letreiro com luzes correndo e brilho na vitrine. Opções: larg, cor, toldo, texto, t. Chaves: loja, comércio, vitrine, varejo, mercado, negócio, vender, compras */
export function loja(p, { larg = 320, cor = "claro", toldo = "c1", texto = "LOJA", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = 6, V = retP(-w * .4, -w * .42, w * .46, w * .3), bx = lerp(-w * .6, w * .2, ciclo(tt, 1.2, 1.4)), passo = Math.floor(tt * 4);
  p.forma(retP(-w * .48, -w * .7, w * .96, w * .7), cor, { prof: 2, semente: 1 });
  p.forma(retArredP(-w * .33, -w * .93, w * .66, w * .21, w * .03), "c2", { prof: 1, semente: 2 });
  p.texto(texto, 0, -w * .82, { tam: w * .12, cor: "tinta" });
  for (let i = 0; i < 5; i++) p.circulo((i - 2) * w * .14, -w * .945, w * .028, (i + passo) % 2 ? "c1" : "claro", D);
  p.forma(V, "c4", D);
  p.recortar(V, () => p.alfa(.6, () => p.forma([[bx, -w * .12], [bx + w * .1, -w * .12], [bx + w * .28, -w * .42], [bx + w * .18, -w * .42]], "claro", D)));
  p.forma(retP(-w * .44, -w * .12, w * .54, w * .035), "tinta", D);
  p.forma(retP(w * .14, -w * .42, w * .26, w * .42), "tinta", D);
  p.forma(retP(w * .17, -w * .38, w * .2, w * .22), "c4", D);
  p.circulo(w * .19, -w * .1, w * .022, "c2", D);
  for (let i = 0; i < n; i++) {
    const u0 = i / n - .5, u1 = (i + 1) / n - .5, c = i % 2 ? "claro" : toldo, yb = -w * .47 + Math.sin(tt * 3 + i * .9) * w * .012, xa = u0 * w * 1.1, xb = u1 * w * 1.1;
    p.forma([[u0 * w * .98, -w * .64], [u1 * w * .98, -w * .64], [xb, yb], ...arcoP((xa + xb) / 2, yb, (xb - xa) / 2, 0, 180, 6), [xa, yb]], c, { prof: 1, liso: true });
  }
}
/** Ponte pênsil com torres, cabos e carros atravessando sobre a água. Opções: larg, cor, t. Chaves: ponte, ligação, conexão, travessia, unir, superar obstáculo, caminho, acesso */
export function ponte(p, { larg = 420, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), yd = -w * .17, yt = -w * .54, xt = w * .25, fe = escuro(p, cor, .35);
  const cabo = x => { const ax = Math.abs(x); return ax <= xt ? lerp(yd - w * .05, yt, (ax / xt) ** 2) : lerp(yt, yd, (ax - xt) / (w * .5 - xt)); };
  p.linha(Array.from({ length: 22 }, (_, i) => [lerp(-w * .5, w * .5, i / 21), -w * .02 + Math.sin(i * 1.3 - tt * 3) * w * .012]), "c4", w * .022);
  for (let i = -3; i <= 3; i++) { if (!i) continue; const x = i * xt / 4; p.linha([[x, cabo(x)], [x, yd]], cor, w * .012); }
  for (const s of [-1, 1]) { const x = s * (xt + (w * .5 - xt) * .45); p.linha([[x, cabo(x)], [x, yd]], cor, w * .012); }
  p.linha(Array.from({ length: 41 }, (_, i) => { const x = lerp(-w * .5, w * .5, i / 40); return [x, cabo(x)]; }), cor, w * .02);
  for (const s of [-1, 1]) p.forma(retP(s * xt - w * .03, yt - w * .03, w * .06, -yt + w * .03), cor, { prof: 1, semente: s + 3 });
  for (const [f0, c, dir] of [[0, "c2", 1], [.5, "c3", -1]]) {
    const f = (tt * .16 + f0) % 1, x = dir * lerp(-w * .46, w * .46, f);
    p.forma(retArredP(x - w * .05, yd - w * .045, w * .1, w * .045, w * .012), c, D);
    p.forma(retArredP(x - w * .028, yd - w * .075, w * .056, w * .04, w * .012), c, D);
  }
  p.forma(retP(-w * .5, yd, w, w * .045), fe, { prof: 1, semente: 6 });
}
/** Semáforo que troca de verde para amarelo e vermelho, com a luz acesa pulsando. Opções: alt, cor, t. Chaves: semáforo, sinal, trânsito, pare, siga, atenção, permissão, regra */
export function semaforo(p, { alt = 360, cor = "c4", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), f = ((tt % 5.4) + 5.4) % 5.4, q = f < 2.4 ? 2 : f < 3.2 ? 1 : 0, luzes = ["#E5484D", "#F5B83D", "#3DBE6B"], r = h * .078, pulso = 1 + .07 * Math.sin(tt * 8);
  p.forma(retP(-h * .035, -h * .42, h * .07, h * .42), sobreFundo(p), { prof: 1, semente: 1 });
  p.forma(retArredP(-h * .1, -h * .04, h * .2, h * .04, h * .012), sobreFundo(p), D);
  p.forma(retArredP(-h * .15, -h, h * .3, h * .6, h * .05), cor, { prof: 2, semente: 2 });
  for (let i = 0; i < 3; i++) { const y = -h * (.9 - i * .2); p.circulo(0, y, r * 1.18, "tinta", D); p.circulo(0, y, i === q ? r * pulso : r * .55, i === q ? luzes[i] : escuro(p, luzes[i], .55), D); }
  p.alfa(.5, () => p.linha(arcoP(0, -h * (.9 - q * .2), r * (1.75 + .2 * Math.sin(tt * 8)), 0, 360, 24), luzes[q], h * .018));
}
/** Poste de rua com braço curvo e facho de luz que tremula no chão. Opções: alt, cor, t. Chaves: poste, luz de rua, iluminação, noite, energia elétrica, rua, segurança, infraestrutura */
export function posteDeLuz(p, { alt = 400, cor = "c4", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), trem = .5 + .5 * Math.sin(tt * 7) * Math.sin(tt * 2.3);
  p.em({ x: -h * .2, y: 0 }, () => {
    const cone = [[h * .15, -h * .93], [h * .25, -h * .93], [h * (.43 + .015 * trem), 0], [-h * (.03 + .015 * trem), 0]];
    // pixel: triângulo cheio num amarelo-claro (mistura de c4 com claro), sem pontilhado; traço: contorno claro com brilho e miolo fraco
    if (p.estilo === "pixel") p.forma(cone, misturarCor(p.cor("c4"), p.cor("claro"), .6), D);
    else if (p.estilo === "traco") p.alfa(.75 + .25 * trem, () => p.forma(cone, maisClaro(p, "c2", .35), D));
    else luz(p, cone, "c2", .2 + .14 * trem, tt);
    p.forma(retArredP(-h * .05, -h * .13, h * .1, h * .13, h * .015), cor, { prof: 1, semente: 1 });
    p.forma(retP(-h * .022, -h * .88, h * .044, h * .78), cor, { prof: 1, semente: 2 });
    p.linha([[0, -h * .86], ...arcoP(h * .1, -h * .88, h * .1, 180, 270, 8), [h * .16, -h * .98]], cor, h * .044);
    p.forma([[h * .1, -h * .998], [h * .3, -h * .998], [h * .275, -h * .945], [h * .125, -h * .945]], cor, { prof: 1, liso: true });
    p.elipse(h * .2, -h * .94, h * (.062 + .008 * trem), h * .028, "c2", D);
  });
}
/** Placa de rua no poste, com o nome escrito, balançando de leve ao vento. Opções: larg, cor, texto, t. Chaves: placa de rua, endereço, esquina, localização, direção, bairro, onde fica, nome da rua */
export function placaDeRua(p, { larg = 320, cor = "c3", texto = "RUA DAS FLORES", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), h = w * .25, bal = Math.sin(tt * 2.2) * .04, s = String(texto), t0 = h * .46;
  const tam = Math.min(t0, t0 * w * .84 / Math.max(1, p.medir(s, { tam: t0 })));
  p.forma(retP(-w * .028, -w * .96, w * .056, w * .96), sobreFundo(p), { prof: 1, semente: 1 });
  p.circulo(0, -w * .97, w * .045, sobreFundo(p), D);
  p.em({ x: 0, y: -w * .56, r: -bal * 1.4 }, () => p.forma(retArredP(-w * .1, -h * .42, w * .2, h * .84, h * .1), escuro(p, cor, .28), { prof: 1, liso: true }));
  p.em({ x: 0, y: -w * .8, r: bal }, () => {
    p.forma(retArredP(-w / 2, -h / 2, w, h, h * .14), cor, { prof: 2, liso: true });
    if (p.estilo !== "pixel") p.linha(retArredP(-w / 2 + h * .1, -h * .4, w - h * .2, h * .8, h * .08), sobreCor(p, cor), w * .01, { fechar: true });
    p.texto(s, 0, h * .03, { tam, cor: sobreCor(p, cor) });
  });
}
/** Banco de praça de ripas com um passarinho pulando no encosto. Opções: larg, cor, t. Chaves: banco de praça, praça, descanso, parque, espera, pausa, sossego, aposentadoria */
export function bancoDePraca(p, { larg = 320, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fe = escuro(p, cor, .45), ida = Math.cos(tt * .5 * Math.PI * 2 * .12) < 0 ? -1 : 1;
  const bx = lerp(-w * .3, w * .3, vaiVem(tt, .06)), by = -w * .6 - Math.abs(Math.sin(tt * 5)) * w * .035, dir = Math.sin(tt * .06 * Math.PI * 2) >= 0 ? 1 : -1;
  for (const s of [-1, 1]) {
    p.forma(retP(s * w * .38 - w * .022, -w * .58, w * .044, w * .58), fe, D);
    p.linha([[s * w * .38, -w * .38], [s * w * .47, -w * .38], [s * w * .47, -w * .25]], fe, w * .04);
    p.forma(retP(s * w * .44 - w * .05, -w * .035, w * .1, w * .035), fe, D);
  }
  for (const y of [-w * .57, -w * .45]) p.forma(retArredP(-w * .46, y, w * .92, w * .095, w * .015), cor, { prof: 1, semente: Math.round(-y) });
  p.forma(retArredP(-w * .5, -w * .28, w, w * .08, w * .02), cor, { prof: 2, semente: 7 });
  p.em({ x: bx, y: by, sx: dir * ida * ida }, () => {
    p.forma([[-w * .04, -w * .04], [-w * .11, -w * .075], [-w * .09, -w * .02]], "c1", D);
    p.circulo(0, -w * .045, w * .05, "c1", D);
    p.circulo(w * .045, -w * .095, w * .034, "c1", D);
    p.forma([[w * .07, -w * .11], [w * .12, -w * .095], [w * .07, -w * .08]], "c2", D);
  });
}
/** Chafariz de duas bacias com jatos de água subindo e caindo sem parar. Opções: larg, cor, agua, t. Chaves: chafariz, fonte, praça, água, abundância, fluxo, turismo, frescor */
export function chafariz(p, { larg = 340, cor = "claro", agua = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), lw = w * .034, tr = { tracejado: [w * .075, w * .045], desloc: tt * w * .7 }, topo = -w * (.86 + .03 * Math.sin(tt * 5));
  const jato = (x0, y0, x1, y1, alt) => Array.from({ length: 13 }, (_, i) => { const u = i / 12; return [lerp(x0, x1, u), lerp(y0, y1, u) - alt * 4 * u * (1 - u)]; });
  p.linha([[0, -w * .5], [0, topo]], agua, lw * 1.2, tr);
  for (const s of [-1, 1]) p.linha(jato(0, topo + w * .04, s * w * .18, -w * .5, w * .1), agua, lw, tr);
  for (const s of [-1, 1]) p.linha(jato(s * w * .2, -w * .47, s * w * .37, -w * .18, w * .05), agua, lw, tr);
  p.forma(retP(-w * .055, -w * .44, w * .11, w * .3), cor, { prof: 1, semente: 1 });
  p.forma([[-w * .27, -w * .5], [w * .27, -w * .5], [w * .13, -w * .4], [-w * .13, -w * .4]], cor, { prof: 1, semente: 2 });
  p.forma(Array.from({ length: 15 }, (_, i) => [lerp(-w * .46, w * .46, i / 14), -w * .2 + Math.sin(i * 1.7 + tt * 4) * w * .012]).concat([[w * .46, -w * .1], [-w * .46, -w * .1]]), agua, D);
  p.forma([[-w * .5, -w * .15], [w * .5, -w * .15], [w * .42, 0], [-w * .42, 0]], cor, { prof: 2, semente: 3 });
  p.forma(retArredP(-w * .52, -w * .18, w * 1.04, w * .05, w * .025), cor, { prof: 1, liso: true });
  for (let i = 0; i < 4; i++) { const f = (tt * .9 + i / 4) % 1; p.circulo((i - 1.5) * w * .21, -w * .22 - Math.sin(f * Math.PI) * w * .08, w * .026, agua, D); }
}
/** Estádio oval com gramado, refletores piscando, bandeiras e flashes da torcida. Opções: larg, cor, t. Chaves: estádio, futebol, arena, jogo, torcida, esporte, show, campeonato, evento */
export function estadio(p, { larg = 420, cor = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), cy = -w * .32, rx = w * .5, ry = w * .12, fe = escuro(p, cor, .3);
  const el = (a0, a1, kx = 1, ky = 1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [Math.cos(a) * rx * kx, cy + Math.sin(a) * ry * ky]; });
  for (const s of [-1, 1]) {
    p.forma(retP(s * w * .37 - w * .015, -w * .66, w * .03, w * .34), sobreFundo(p), D);
    p.forma(retP(s * w * .37 - w * .07, -w * .72, w * .14, w * .08), Math.sin(tt * 6 + s) > -.5 ? "c2" : "claro", { prof: 1, liso: true });
  }
  for (let i = -1; i <= 1; i++) { const x = i * w * .2, y = cy - ry * Math.sqrt(1 - (x / rx) ** 2); p.forma(retP(x - w * .008, y - w * .13, w * .016, w * .13), sobreFundo(p), D); flamula(p, x + w * .008, y - w * .13, w * .09, ["c1", "c2", "c3"][i + 1], tt, i); }
  p.forma(el(0, 360, 1, 1, 32).slice(1), fe, { prof: 1, liso: true });
  p.forma(el(0, 360, .64, .52, 24).slice(1), "c3", D);
  p.linha([[0, cy - ry * .5], [0, cy + ry * .5]], "claro", w * .012);
  for (let i = 0; i < 6; i++) { const a = (205 + i * 26) * Math.PI / 180, on = Math.sin(tt * (4 + i * .7) + i * 2.1) > .55; p.circulo(Math.cos(a) * rx * .82, cy + Math.sin(a) * ry * .8, w * (on ? .022 : .012), on ? "claro" : cor, D); }
  p.forma([...el(180, 0), [w * .43, 0], [-w * .43, 0]], cor, { prof: 2, semente: 5 });
  p.linha(el(168, 12).map(([x, y]) => [x * .95, y + w * .12]), "tinta", w * .016);
  for (let i = -2; i <= 2; i++) p.forma(arcoPorta(i * w * .15, 0, w * .034, w * .06), "tinta", D);
}
/** Prefeitura clássica com colunas, frontão, cúpula e bandeira tremulando. Opções: larg, cor, cupula, t. Chaves: prefeitura, governo, poder público, política, lei, tribunal, banco, instituição, burocracia */
export function prefeitura(p, { larg = 380, cor = "claro", cupula = "c4", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fundo = escuro(p, cor, .25);
  p.forma(retP(-w * .014, -w * 1.0, w * .028, w * .22), sobreFundo(p), D);
  flamula(p, w * .014, -w * 1.0, w * .16, "c1", tt);
  p.forma(arcoP(0, -w * .64, w * .17, 180, 360, 14), cupula, { prof: 1, liso: true });
  p.forma(retP(-w * .21, -w * .66, w * .42, w * .07), cor, { prof: 1, semente: 1 });
  p.forma(retP(-w * .43, -w * .4, w * .86, w * .32), fundo, { prof: 1, semente: 2 });
  for (let i = 0; i < 5; i++) { if (i === 2) continue; p.forma(retP((i - 2) * w * .152 - w * .035, -w * .33, w * .07, w * .12), Math.sin(tt * (.7 + i * .2) + i * 2) > -.2 ? "c2" : "tinta", D); }
  p.forma(arcoPorta(0, -w * .08, w * .045, w * .17), "tinta", D);
  for (let i = 0; i < 6; i++) p.forma(retP((i - 2.5) * w * .152 - w * .028, -w * .4, w * .056, w * .32), cor, { prof: 1, liso: true });
  p.forma(retP(-w * .46, -w * .46, w * .92, w * .065), cor, { prof: 1, semente: 3 });
  p.forma([[-w * .49, -w * .46], [w * .49, -w * .46], [0, -w * .62]], cor, { prof: 1, semente: 4 });
  p.circulo(0, -w * .51, w * (.034 + .005 * Math.sin(tt * 4)), "c2", D);
  p.forma(retP(-w * .47, -w * .08, w * .94, w * .045), cor, { prof: 1, semente: 5 });
  p.forma(retP(-w * .5, -w * .04, w, w * .04), cor, { prof: 1, semente: 6 });
}
/** Torre de antena treliçada com luz piscando e ondas de sinal saindo do topo. Opções: alt, cor, t. Chaves: antena, torre de celular, sinal, transmissão, telecomunicação, rádio, cobertura, internet, alcance */
export function antena(p, { alt = 400, cor = "c1", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), px = p.estilo === "pixel", lw = h * (px ? .03 : .022), topo = -h * .84, n = px ? 4 : 5, X = u => lerp(h * .17, h * .03, u), pisca = Math.sin(tt * 6) > 0;
  for (let i = 0; i < 3; i++) { const f = (tt * .8 + i / 3) % 1; p.alfa(1 - f, () => { p.linha(arcoP(0, -h * .92, h * (.09 + f * .2), -40, 40, 8), "c2", lw); p.linha(arcoP(0, -h * .92, h * (.09 + f * .2), 140, 220, 8), "c2", lw); }); }
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n; p.linha([[-X(u0), topo * u0], [X(u1), topo * u1], [-X(u1), topo * u1], [X(u0), topo * u0]], cor, lw * .8); }
  p.linha([[-X(0), 0], [-X(1), topo]], cor, lw * 1.3); p.linha([[X(0), 0], [X(1), topo]], cor, lw * 1.3);
  p.capsula([0, topo], [0, -h * .95], h * .035, cor);
  for (const s of [-1, 1]) p.forma(retArredP(s * h * .065 - h * .02, topo * .96, h * .04, h * .11, h * .01), "c4", D);
  p.circulo(0, -h * .955, h * (pisca ? .038 : .024), pisca ? "c2" : cor, D);
}
/** Guindaste de obra com lança treliçada, carrinho que desliza e carga sendo içada. Opções: larg, cor, carga, t. Chaves: guindaste, obra, construção, içar, erguer, em construção, desenvolvimento, crescimento, engenharia */
export function guindaste(p, { larg = 380, cor = "c2", carga = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), lw = w * .02, xm = -w * .12, yj = -w * .82, mw = w * .035, fe = escuro(p, cor, .4);
  const xc = lerp(w * .12, w * .4, vaiVem(tt, .05)), yg = lerp(-w * .16, -w * .58, E.entraSai(vaiVem(tt, .14))), bal = Math.sin(tt * 2.4) * w * .012, pisca = Math.sin(tt * 6) > 0;
  p.forma(retP(xm - w * .13, -w * .05, w * .26, w * .05), fe, { prof: 1, semente: 1 });
  p.linha(Array.from({ length: 10 }, (_, i) => [xm + (i % 2 ? mw : -mw), lerp(-w * .05, yj, i / 9)]), cor, lw * .8);
  p.linha([[xm - mw, -w * .05], [xm - mw, yj]], cor, lw); p.linha([[xm + mw, -w * .05], [xm + mw, yj]], cor, lw);
  p.linha(Array.from({ length: 12 }, (_, i) => [lerp(xm + mw, w * .5, i / 11), yj - (i % 2 ? w * .05 : 0)]), cor, lw * .8);
  p.linha([[-w * .42, yj], [w * .5, yj]], cor, lw); p.linha([[xm, yj - w * .05], [w * .5, yj - w * .05]], cor, lw);
  p.linha([[xm, yj], [xm, yj - w * .2]], cor, lw * 1.4);
  p.linha([[-w * .4, yj], [xm, yj - w * .2], [w * .32, yj - w * .05]], cor, lw * .6);
  p.forma(retP(-w * .46, yj, w * .15, w * .1), fe, { prof: 1, semente: 2 });
  p.forma(retArredP(xm + mw, yj + w * .012, w * .11, w * .1, w * .012), "claro", { prof: 1, liso: true });
  p.forma(retP(xm + mw + w * .045, yj + w * .03, w * .05, w * .045), "c4", D);
  p.linha([[xc, yj], [xc + bal, yg - w * .07]], sobreFundo(p), w * .012);
  p.forma(retP(xc - w * .035, yj - w * .005, w * .07, w * .035), fe, D);
  p.em({ x: xc + bal, y: yg }, () => { p.linha([[-w * .055, 0], [0, -w * .07], [w * .055, 0]], sobreFundo(p), w * .012); p.forma(retP(-w * .065, 0, w * .13, w * .1), carga, { prof: 1, semente: 3 }); p.linha([[-w * .065, w * .05], [w * .065, w * .05]], "tinta", w * .014); });
  p.circulo(xm, yj - w * .2, w * (pisca ? .028 : .018), pisca ? "c1" : cor, D);
}
/** Boca de túnel num morro, com faróis de carro se aproximando no escuro e faixa da pista correndo. Opções: larg, cor, t. Chaves: túnel, passagem, saída, luz no fim do túnel, esperança, travessia, atalho, montanha */
export function tunel(p, { larg = 360, cor = "c3", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), R = w * .25, f = ciclo(tt, 2.2, .7), s = lerp(.12, 1, f * f), B = arcoPorta(0, 0, R, w * .2), fe = escuro(p, cor, .3);
  p.forma(Array.from({ length: 23 }, (_, i) => { const u = i / 22; return [lerp(-w * .5, w * .5, u), -w * (.62 * Math.sin(u * Math.PI) ** .7 + .025 * Math.sin(u * 11) * Math.sin(u * Math.PI))]; }), cor, { prof: 2, semente: 1 });
  for (const [x, y] of [[-w * .3, -w * .32], [w * .34, -w * .26], [w * .12, -w * .53]]) p.forma([[x - w * .045, y], [x + w * .045, y], [x, y - w * .11]], fe, D);
  p.forma(arcoPorta(0, 0, R * 1.24, w * .2), "claro", { prof: 1, liso: true });
  for (let i = 0; i < 5; i++) { const a = (200 + i * 35) * Math.PI / 180; p.linha([[Math.cos(a) * R, -w * .2 + Math.sin(a) * R], [Math.cos(a) * R * 1.24, -w * .2 + Math.sin(a) * R * 1.24]], "tinta", w * .012); }
  p.forma(B, "tinta", D);
  p.recortar(B, () => {
    p.forma([[-R * .95, 0], [R * .95, 0], [R * .1, -w * .17], [-R * .1, -w * .17]], asfalto(p) === "tinta" ? escuro(p, "c4", .5) : "sombra", D);
    for (let i = 0; i < 3; i++) { const u = (tt * .6 + i / 3) % 1, y = lerp(-w * .16, 0, u * u), lg = lerp(w * .008, w * .03, u); p.forma(retP(-lg / 2, y, lg, lerp(w * .01, w * .05, u)), "claro", D); }
    p.alfa(clamp(f * 6) * clamp((1 - f) * 8 + (f >= 1 ? 1 : 0)), () => { for (const d of [-1, 1]) p.circulo(d * R * .42 * s, lerp(-w * .18, -w * .1, f * f), R * .2 * s + w * .01, "c2", D); });
  });
}
/** Ponto de ônibus com cobertura, banco, vidro com reflexo e painel contando os minutos. Opções: larg, cor, t. Chaves: ponto de ônibus, parada, transporte público, espera, mobilidade, deslocamento, rotina, atraso */
export function pontoDeOnibus(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), fe = escuro(p, cor, .4), min = 5 - Math.floor((((tt * .5) % 5) + 5) % 5), V = retP(-w * .36, -w * .5, w * .58, w * .38), bx = lerp(-w * .5, w * .25, ciclo(tt, 1.4, 1.2)), px = w * .4, qx = Math.sin(tt * 6) * w * .006;
  p.alfa(p.estilo === "pixel" ? 1 : .6, () => p.forma(V, "c4", D));
  p.recortar(V, () => p.alfa(.6, () => p.forma([[bx, -w * .12], [bx + w * .09, -w * .12], [bx + w * .3, -w * .5], [bx + w * .21, -w * .5]], "claro", D)));
  for (const x of [-w * .38, w * .24]) p.forma(retP(x - w * .02, -w * .64, w * .04, w * .64), fe, D);
  for (const x of [-w * .24, w * .1]) p.forma(retP(x - w * .018, -w * .17, w * .036, w * .17), fe, D);
  p.forma(retArredP(-w * .31, -w * .21, w * .48, w * .055, w * .015), "c2", { prof: 1, liso: true });
  p.forma([[-w * .48, -w * .63], [w * .34, -w * .63], [w * .3, -w * .72], [-w * .44, -w * .72]], cor, { prof: 2, semente: 1 });
  p.forma(retP(-w * .22, -w * .63, w * .32, w * .1), "tinta", D);
  p.texto(min + " min", -w * .06, -w * .578, { tam: w * .065, cor: "c2" });
  p.forma(retP(px - w * .016, -w * .8, w * .032, w * .8), sobreFundo(p), D);
  p.circulo(px, -w * .82, w * .1, cor, { prof: 1, liso: true });
  p.forma(retArredP(px - w * .062 + qx, -w * .875, w * .124, w * .09, w * .02), "claro", D);
  p.forma(retP(px - w * .045 + qx, -w * .86, w * .09, w * .032), cor, D);
  for (const d of [-1, 1]) p.circulo(px + d * w * .035 + qx, -w * .782, w * .02, "tinta", D);
}
/** Faixa de pedestre em perspectiva: as listras acendem em sequência e pegadas atravessam a rua. Opções: larg, cor, t. Chaves: faixa de pedestre, atravessar, travessia, trânsito, segurança, pedestre, rua, passo a passo */
export function faixaDePedestre(p, { larg = 400, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), H = w * .5, n = 6, px = (x, y) => [x * lerp(1, .6, -y / H), y], cel = w * .86 / n, vez = Math.floor(tt * 3) % (n + 3);
  p.forma([px(-w * .5, 0), px(w * .5, 0), px(w * .5, -H), px(-w * .5, -H)], asfalto(p), { prof: 1, semente: 1 });
  for (const s of [-1, 1]) p.linha([px(s * w * .5, 0), px(s * w * .5, -H)], "c4", w * .02);
  for (let i = 0; i < n; i++) { const xa = -w * .43 + i * cel + cel * .18, xb = xa + cel * .64; p.forma([px(xa, -H * .16), px(xb, -H * .16), px(xb, -H * .84), px(xa, -H * .84)], i === vez ? "c2" : cor, D); }
  for (let j = 0; j < 6; j++) { const f = (((tt * 2 - j) % 9) + 9) % 9, a = f < 4 ? Math.min(1, 2 - f * .5) : 0, y = -H * (.5 + (j % 2 ? .1 : -.1)), [x] = px(-w * .4 + j * w * .16, y); p.alfa(a, () => p.elipse(x, y, w * .04, w * .02, "c1", D)); }
}
/** Hidrante de rua que treme com a pressão e esguicha gotas de água pelo bocal. Opções: alt, cor, t. Chaves: hidrante, bombeiro, incêndio, água, emergência, prevenção, segurança, vazamento */
export function hidrante(p, { alt = 280, cor = "c1", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), fe = escuro(p, cor, .3), trem = Math.sin(tt * 30) * h * .005;
  for (let i = 0; i < 4; i++) { const f = (tt * 1.2 + i / 4) % 1; p.circulo(h * .33 + f * h * .22, -h * .5 + f * f * h * .46, h * .04 * (1 - .35 * f), "c3", D); }
  p.em({ x: trem, y: 0 }, () => {
    p.forma(retArredP(-h * .25, -h * .08, h * .5, h * .08, h * .02), fe, { prof: 1, liso: true });
    p.forma(retArredP(-h * .29, -h * .57, h * .58, h * .15, h * .03), cor, { prof: 1, semente: 1 });
    for (const s of [-1, 1]) p.forma(retArredP(s * h * .3 - h * .03, -h * .6, h * .06, h * .21, h * .015), fe, D);
    p.forma(retP(-h * .17, -h * .68, h * .34, h * .62), cor, { prof: 2, semente: 2 });
    p.forma(arcoP(0, -h * .7, h * .17, 180, 360, 12), cor, { prof: 1, liso: true });
    p.forma(retArredP(-h * .21, -h * .73, h * .42, h * .07, h * .02), fe, D);
    p.forma(retArredP(-h * .055, -h * .96, h * .11, h * .1, h * .015), fe, D);
    p.circulo(0, -h * .43, h * .09, fe, D);
    p.forma(poligonoP(0, -h * .43, h * .05, 5, tt * .8), "tinta", D);
  });
}
/** Lixeira de tampa que abre sozinha enquanto uma bolinha de papel voa para dentro. Opções: alt, cor, t. Chaves: lixeira, lixo, descartar, jogar fora, limpeza, excluir, apagar, desperdício */
export function lixeira(p, { alt = 250, cor = "c3", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), f = (((tt * .45) % 1) + 1) % 1, abre = E.entraSai(clamp(f / .15)) * (1 - E.entraSai(clamp((f - .62) / .15))), fe = escuro(p, cor, .3);
  const u = clamp((f - .1) / .42), bate = f > .52 && f < .7 ? Math.sin((f - .52) / .18 * Math.PI) * .05 : 0, bx = lerp(h * .58, 0, u), by = lerp(-h * .8, -h * .62, u) - Math.sin(u * Math.PI) * h * .32;
  p.alfa(u < 1 ? 1 : 0, () => p.forma(poligonoP(bx, by, h * .065, 7, u * 7), "claro", { prof: 1, liso: true }));
  p.em({ x: 0, y: 0, sx: 1 + bate, sy: 1 - bate }, () => {
    p.forma([[-h * .28, -h * .72], [h * .28, -h * .72], [h * .22, 0], [-h * .22, 0]], cor, { prof: 2, semente: 1 });
    for (const x of [-.13, 0, .13]) p.capsula([x * h, -h * .62], [x * h * .82, -h * .1], h * .04, fe);
    p.em({ x: -h * .31, y: -h * .72, r: -abre * .95 + Math.sin(tt * 9) * .012 }, () => {
      p.forma(retArredP(h * .22, -h * .15, h * .18, h * .08, h * .02), fe, D);
      p.forma(retArredP(-h * .02, -h * .1, h * .66, h * .1, h * .03), cor, { prof: 1, liso: true });
    });
  });
}
/** Muro de tijolos que se levanta: o último tijolo cai no lugar e o capim balança no pé. Opções: larg, alt, cor, k (0..1 quanto do muro está erguido), semente, t. Chaves: muro, parede, tijolos, barreira, obstáculo, bloqueio, divisão, proteção, construir */
export function muro(p, { larg = 400, alt = 220, cor = "c1", k = 1, semente = 0, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), lin = 5, cols = 5, bh = alt / lin, bw = w / cols, g = Math.max(8, w * .022), r = rng(semente + 21), tij = [];
  for (let j = 0; j < lin; j++) { const off = j % 2 ? -bw / 2 : 0; for (let i = 0; i < cols + (j % 2 ? 1 : 0); i++) { const xa = Math.max(-w / 2, -w / 2 + off + i * bw), xb = Math.min(w / 2, -w / 2 + off + (i + 1) * bw); tij.push([xa, xb, j, r() < .3]); } }
  // o último tijolo cai só enquanto k avança por ele (primeiros 40% da sua fatia); com k parado ele já está assentado, rente à fileira
  const nk = clamp(k) * tij.length, feitos = Math.ceil(nk - 1e-6), cai = clamp((nk - (feitos - 1)) / .4);
  if (feitos > 0) {
    const ult = tij[feitos - 1], cheias = ult[2] + (feitos === tij.length || tij[feitos][2] !== ult[2] ? 1 : 0);
    if (cheias > 0) p.forma(retP(-w / 2, -cheias * bh, w, cheias * bh), "claro", { prof: 2, semente: semente + 1 });
    const borda = cai >= 1 ? ult[1] : feitos > 1 && tij[feitos - 2][2] === ult[2] ? tij[feitos - 2][1] : null;
    if (cheias === ult[2] && borda !== null) p.forma(retP(-w / 2, -(ult[2] + 1) * bh, borda + w / 2, bh), "claro", { prof: 1, liso: true });
    for (let n = 0; n < feitos; n++) { const [xa, xb, j, esc] = tij[n], dy = n === feitos - 1 ? -bh * 1.5 * (1 - cai * cai) : 0; p.forma(retP(xa + g / 2, -(j + 1) * bh + g / 2 + dy, xb - xa - g, bh - g), esc ? escuro(p, cor, .18) : cor, D); }
  }
  for (const [x, s] of [[-w * .36, 1], [w * .08, .8], [w * .38, 1.1]]) { const b = Math.sin(tt * 3 + x) * w * .02, a = w * .035 * s; p.forma([[x - a, 0], [x - a * 1.3 + b, -a * 1.6], [x - a * .3, -a * .5], [x + b, -a * 2.3], [x + a * .3, -a * .5], [x + a * 1.3 + b, -a * 1.6], [x + a, 0]], "c3", D); }
}
/** Farol listrado sobre rochas com o facho de luz girando de um lado para o outro. Opções: alt, cor, faixa, t. Chaves: farol, guia, orientação, direção, alerta, costa, porto seguro, rumo, visão */
export function farol(p, { alt = 420, cor = "claro", faixa = "c1", t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), a = tt * 1.5, c = Math.cos(a), s = c >= 0 ? 1 : -1, len = h * .5 * Math.max(.1, Math.abs(c)), yl = -h * .81, frente = Math.sin(a) > 0 ? clamp(1 - Math.abs(c) / .35) : 0;
  const hw = u => lerp(.135, .08, u) * h, y = u => lerp(-h * .06, -h * .73, u), banda = (u0, u1) => [[-hw(u0), y(u0)], [hw(u0), y(u0)], [hw(u1), y(u1)], [-hw(u1), y(u1)]];
  luz(p, [[0, yl - h * .02], [s * len, yl - h * .03 - len * .24], [s * len, yl + h * .03 + len * .24], [0, yl + h * .02]], "c2", .5, tt);
  p.forma([[-h * .3, 0], [-h * .25, -h * .06], [-h * .12, -h * .1], [h * .06, -h * .075], [h * .2, -h * .1], [h * .3, 0]], escuro(p, "c4", .25), { prof: 1, semente: 1 });
  p.forma(banda(0, 1), cor, { prof: 2, semente: 2 });
  p.forma(banda(.2, .4), faixa, D); p.forma(banda(.6, .8), faixa, D);
  p.forma(arcoPorta(0, y(0), h * .04, h * .06), "tinta", D);
  p.forma(retP(-h * .025, y(.5) - h * .03, h * .05, h * .06), "tinta", D);
  p.forma(retP(-h * .13, -h * .76, h * .26, h * .04), faixa, { prof: 1, liso: true });
  p.forma(retP(-h * .065, -h * .88, h * .13, h * .12), frente > .3 ? "claro" : "c2", D);
  p.linha([[0, -h * .88], [0, -h * .76]], "tinta", h * .014);
  p.forma([[-h * .09, -h * .88], [h * .09, -h * .88], [0, -h * .97]], faixa, { prof: 1, liso: true });
  p.capsula([0, -h * .96], [0, -h * .995], h * .03, faixa);
  p.alfa(frente * .8, () => p.circulo(0, yl, h * (.05 + .09 * frente), "c2", D));
}
/** Moinho de vento com as quatro pás girando e a janela acendendo. Opções: alt, cor, telhado, pa, vel, t. Chaves: moinho, vento, energia, campo, girar, tradição, fazenda, força da natureza */
export function moinho(p, { alt = 400, cor = "claro", telhado = "c1", pa = "c2", vel = 1, t = 0 } = {}) {
  const h = alt, tt = p.ritmo(t), cy = -h * .68, R = h * .31;
  p.forma([[-h * .18, 0], [h * .18, 0], [h * .1, -h * .62], [-h * .1, -h * .62]], cor, { prof: 2, semente: 1 });
  p.forma([[-h * .13, -h * .61], [-h * .1, -h * .72], [0, -h * .79], [h * .1, -h * .72], [h * .13, -h * .61]], telhado, { prof: 1, semente: 2 });
  p.forma(arcoPorta(0, 0, h * .05, h * .09), "tinta", D);
  p.forma(retP(-h * .035, -h * .4, h * .07, h * .08), Math.sin(tt * .9) > -.3 ? "c2" : "tinta", D);
  if (p.estilo === "pixel") {
    // pixel: pás como quatro retângulos cheios com moldura escura, afastados do cubo; cubo como bloco quadrado escuro
    const fr = h * .018, mold = escuro(p, pa, .45), r0 = R * .32;
    p.em({ x: 0, y: cy, r: tt * 1.1 * vel }, () => {
      for (let i = 0; i < 4; i++) p.em({ x: 0, y: 0, r: i * Math.PI / 2 }, () => {
        p.forma(retP(-h * .012, -r0, h * .024, r0), mold, D);
        p.forma(retP(-h * .05 - fr, -R - fr, h * .1 + fr * 2, R - r0 + fr * 2), mold, D);
        p.forma(retP(-h * .05, -R, h * .1, R - r0), pa, D);
      });
    });
    p.forma(retP(-h * .03, cy - h * .03, h * .06, h * .06), "tinta", D);
    return;
  }
  p.em({ x: 0, y: cy, r: tt * 1.1 * vel }, () => {
    for (let i = 0; i < 4; i++) p.em({ x: 0, y: 0, r: i * Math.PI / 2 }, () => { p.forma(retP(h * .012, -R, h * .09, R * .7), pa, { prof: 1, liso: true }); p.capsula([0, 0], [0, -R], h * .025, p.estilo === "pixel" ? escuro(p, pa, .35) : sobreFundo(p)); });
    p.circulo(0, 0, h * .04, telhado, { prof: 1, liso: true });
  });
}
/** Fila de prédios variados ao fundo, com janelas acendendo e luz piscando no mais alto. Opções: larg, alt, cor, n (quantos prédios), semente, t. Chaves: skyline, cidade, horizonte, metrópole, centro, urbano, cidade grande, mercado, panorama */
export function skyline(p, { larg = 420, alt = 0, cor = "c4", n = 6, semente = 0, t = 0 } = {}) {
  const w = larg, H = alt || w * .58, tt = p.ritmo(t), r = rng(semente + 77), q = Array.from({ length: Math.max(1, n) }, () => .7 + r() * .6), soma = q.reduce((a, b) => a + b, 0), pisca = Math.sin(tt * 5) > 0;
  let x = -w / 2, alto = [0, 0];
  q.forEach((qi, i) => {
    const bw = w * qi / soma, bh = H * (.4 + r() * .3 + (i % 2 ? .18 : 0)), tipo = (i + Math.floor(r() * 2)) % 4, c = i % 2 ? cor : escuro(p, cor, .22), cx = x + bw / 2, lin = Math.max(1, Math.min(3, Math.floor(bh / (H * .2))));
    let topo = bh;
    if (tipo === 1) { p.forma(retP(cx - bw * .28, -bh - H * .09, bw * .56, H * .1), c, { prof: 1, semente: semente + i + 20 }); topo = bh + H * .09; }
    else if (tipo === 2) { p.forma([[x, -bh + 1], [x + bw, -bh + 1], [cx, -bh - H * .1]], c, { prof: 1, semente: semente + i + 20 }); topo = bh + H * .1; }
    else if (tipo === 3) { p.forma(retP(cx - bw * .08, -bh - H * .1, bw * .16, H * .11), c, D); topo = bh + H * .1; }
    p.forma(retP(x, -bh, bw + 1, bh), c, { prof: 1, semente: semente + i + 1 });
    janelas(p, x + bw * .12, -bh + H * .04, bw * .76, lin * H * .15, 2, lin, tt, semente + i * 7, { fw: .66, fh: .6 });
    if (topo > alto[1]) alto = [cx, topo];
    x += bw;
  });
  p.alfa(.35 + .3 * Math.sin(tt * 3.1), () => p.circulo(alto[0], -alto[1] - w * .012, w * (.03 + .014 * Math.sin(tt * 3.1)), "c1", D));
  p.circulo(alto[0], -alto[1] - w * .012, w * (pisca ? .02 : .013), pisca ? "c1" : cor, D);
}
