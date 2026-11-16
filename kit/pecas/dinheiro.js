// Categoria: Dinheiro e negócios
// Kit de movimento — dinheiro, comércio e vida de empresa: cédulas, cofres, cartões, contratos, vendas e gráficos da bolsa.
// O símbolo padrão é "$"; passe `simbolo: "R$"` para trocar. A convenção das peças está em ./_comum.js.
import { clamp, lerp, rng, E, circP, retP, retArredP, rotP, arcoP, estrelaP, escuro, maisClaro, sobreFundo, TAU } from "./_comum.js";

// brilho de quatro pontas que abre e fecha (f de 0 a 1)
const cintilar = (p, x, y, r, f, cor) => p.em({ x, y, s: Math.sin(clamp(f) * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, r, r * .3, 4), cor || sobreFundo(p), { prof: 0, liso: true }));
// metade de baixo de uma elipse, da esquerda para a direita
const meiaElipse = (cx, cy, rx, ry, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI * (1 - i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
// faixa de luz inclinada que atravessa uma forma (não aparece no traco, que só tem contorno)
const reflexo = (p, pts, x, larg, alt, cor) => { if (p.estilo === "traco") return; p.recortar(pts, () => p.alfa(.4, () => p.forma([[x, alt], [x + larg, alt], [x + larg * 2.2, -alt], [x + larg * 1.2, -alt]], maisClaro(p, cor, .65), { prof: 0, liso: true }))); };

/** Cédula que ondula como papel ao vento, com o símbolo no centro. Opções: larg, cor, simbolo, t. Chaves: cédula, nota, dinheiro, grana, papel-moeda, pagamento, salário, valor */
export function cedula(p, { larg = 360, cor = "c3", simbolo = "$", t = 0 } = {}) {
  const w = larg, h = w * .48, tt = p.ritmo(t), on = x => Math.sin(x / w * 5 + tt * 3) * h * .1;
  const faixa = (x0, x1, y0, y1, n = 16) => { const a = [], b = []; for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); a.push([x, y0 + on(x)]); b.unshift([x, y1 + on(x)]); } return [...a, ...b]; };
  p.forma(faixa(-w / 2, w / 2, -h / 2, h / 2), cor, { prof: 2, semente: 3 });
  p.linha(faixa(-w * .44, w * .44, -h * .36, h * .36), "tinta", w * .016, { fechar: true });
  for (const s of [-1, 1]) p.circulo(s * w * .31, on(s * w * .31), h * .12, escuro(p, cor, .28), { prof: 0, liso: true });
  p.elipse(0, on(0), h * .3, h * .32, "claro", { prof: 0, liso: true });
  p.texto(simbolo, 0, on(0) + h * .02, { tam: h * (simbolo.length > 1 ? .3 : .44), cor: "tinta" });
}
/** Pilha de moedas que cresce moeda a moeda; a de cima salta e brilha. Opções: larg, cor, n (moedas), k (0..1 quanto da pilha), simbolo, t. Chaves: moedas, pilha, economia, poupança, juntar dinheiro, acumular, riqueza, crescimento */
export function pilhaDeMoedas(p, { larg = 220, cor = "c2", n = 6, k = 1, simbolo = "$", t = 0 } = {}) {
  const w = larg, rx = w * .45, ry = rx * .3, hc = w * .15, tt = p.ritmo(t), q = clamp(k) * n, tot = Math.ceil(q), r = rng(n * 7 + 3), f = (tt * .6) % 1, borda = escuro(p, cor, .25);
  for (let i = 0; i < tot; i++) {
    const dx = (r() - .5) * w * .1, ult = i === tot - 1, kk = ult ? clamp(q - i) : 1, pulo = ult && f < .4 ? Math.sin(f / .4 * Math.PI) * hc * .8 : 0;
    const y0 = -ry - i * hc - pulo - (1 - E.sai(kk)) * w * .5;
    p.alfa(clamp(kk * 3), () => {
      p.forma([[dx - rx, y0 - hc], ...meiaElipse(dx, y0, rx, ry), [dx + rx, y0 - hc]], borda, { prof: i ? 0 : 1, liso: true });
      p.elipse(dx, y0 - hc, rx, ry, cor, { prof: 0, liso: true });
      if (ult) { p.elipse(dx, y0 - hc, rx * .72, ry * .72, borda, { prof: 0, liso: true }); p.em({ x: dx, y: y0 - hc, sy: .42 }, () => p.texto(simbolo, 0, 0, { tam: rx * .9, cor: "tinta" })); }
    });
  }
  if (tot > 0) cintilar(p, rx * .8, -tot * hc - ry * 2.4, w * .1, (tt * .6 + .5) % 1);
}
/** Cofre de aço com o segredo girando; a porta abre e mostra o ouro. Opções: larg, cor, k (0 fechado, 1 aberto), t. Chaves: cofre, segurança, guardar, reserva, proteção, patrimônio, banco, sigilo */
export function cofre(p, { larg = 300, cor = "c4", k = 0, t = 0 } = {}) {
  const w = larg, h = w * .92, tt = p.ritmo(t), a = E.entraSai(clamp(k)) * 1.95, sx = Math.cos(a), m = w * .09, dw = w - m * 2, dh = h - m * 2, y0 = -h - w * .07;
  for (const s of [-1, 1]) p.retangulo(s * w * .32 - w * .09, -w * .08, w * .18, w * .08, escuro(p, cor, .45), { prof: 0 });
  p.forma(retArredP(-w / 2, y0, w, h, w * .06), cor, { prof: 2 });
  if (a > .05) {
    p.forma(retP(-w / 2 + m, y0 + m, dw, dh), "tinta", { prof: 0, liso: true });
    p.linha([[-w / 2 + m, y0 + m + dh * .5], [w / 2 - m, y0 + m + dh * .5]], cor, w * .03);
    for (let i = 0; i < 3; i++) { const x = -w * .2 + i * w * .2, yb = y0 + m + dh - w * .02; p.forma([[x - w * .09, yb], [x + w * .09, yb], [x + w * .06, yb - w * .1], [x - w * .06, yb - w * .1]], "c2", { prof: 0, liso: true }); }
    for (let i = 0; i < 3; i++) p.retangulo(-w * .22, y0 + m + dh * .5 - w * .07 - i * w * .06, w * .34, w * .05, "c3", { prof: 0, liso: true });
    cintilar(p, w * .2, y0 + m + dh * .76, w * .08, (tt * .8) % 1, "claro");
  }
  p.em({ x: -w / 2 + m, y: y0 + m, sx: Math.abs(sx) < .08 ? .08 : sx }, () => {
    p.forma(retArredP(0, 0, dw, dh, w * .03), sx < 0 ? escuro(p, cor, .3) : maisClaro(p, cor, .16), { prof: a > .05 ? 1 : 0 });
    if (sx < 0) return;
    const cx = dw * .46, cy = dh * .5, R = w * .19, g = Math.sin(tt * 1.6) * 2.4;
    for (const y of [dh * .16, dh * .84]) p.retangulo(-w * .02, y - w * .05, w * .07, w * .1, "tinta", { prof: 0, liso: true });
    p.circulo(cx, cy, R, "claro", { prof: 1, liso: true });
    for (let i = 0; i < 3; i++) { const b = g + i * TAU / 6; p.linha([[cx - Math.cos(b) * R * .82, cy - Math.sin(b) * R * .82], [cx + Math.cos(b) * R * .82, cy + Math.sin(b) * R * .82]], "tinta", w * .028); }
    p.circulo(cx, cy, R * .3, "c2", { prof: 0, liso: true });
    p.capsula([dw * .88, dh * .34], [dw * .88, dh * .66], w * .05, "tinta");
    if (Math.sin(tt * 5) > 0) p.circulo(dw * .14, dh * .12, w * .035, "c1", { prof: 0, liso: true });
  });
}
/** Cofrinho de porquinho que engole moedas pela fenda e balança o rabo. Opções: larg, cor, simbolo, t. Chaves: cofrinho, porquinho, poupança, economizar, guardar dinheiro, reserva, mesada, investimento */
export function cofrinho(p, { larg = 300, cor = "c1", simbolo = "$", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1, cai = clamp(f / .45), eng = f > .45 ? Math.sin(clamp((f - .45) / .3) * Math.PI) : 0;
  const cy = -w * .4, rx = w * .4, ry = w * .28, esc = escuro(p, cor, .22);
  if (f < .45) { const gx = Math.cos(tt * 9); p.em({ x: -w * .02, y: lerp(-w * .98, cy - ry * .95, E.entra(cai)), sx: Math.abs(gx) < .25 ? .25 : gx }, () => { p.circulo(0, 0, w * .085, "c2", { prof: 1, liso: true }); if (gx > .5) p.texto(simbolo, 0, w * .005, { tam: w * .1, cor: "tinta" }); }); }
  for (const x of [-w * .2, w * .17]) p.retangulo(x, -w * .2, w * .1, w * .2, esc, { prof: 0, raio: w * .03 });
  p.linha(arcoP(-rx - w * .045, cy - w * .04, w * .05, 20, 420 + Math.sin(tt * 6) * 50, 14), cor, w * .032);
  p.em({ x: 0, y: 0, sx: 1 + eng * .04, sy: 1 - eng * .05 }, () => {
    p.forma([[w * .02, cy - ry * .7], [w * .07, cy - ry * 1.32], [w * .2, cy - ry * .8]], esc, { prof: 0 });
    p.elipse(0, cy, rx, ry, cor, { prof: 2 });
    for (const x of [-w * .31, w * .05]) p.retangulo(x, -w * .23, w * .12, w * .23, cor, { prof: 0, raio: w * .035 });
    p.forma([[w * .12, cy - ry * .62], [w * .2, cy - ry * 1.28], [w * .31, cy - ry * .6]], cor, { prof: 1 });
    p.elipse(rx * 1.0, cy + ry * .08, w * .085, w * .11, esc, { prof: 1, liso: true });
    for (const dy of [-.035, .04]) p.elipse(rx * 1.02, cy + ry * .08 + dy * w, w * .022, w * .026, "tinta", { prof: 0, liso: true });
    p.circulo(w * .22, cy - ry * .22, w * .03, "tinta", { prof: 0, liso: true });
    p.capsula([-w * .11, cy - ry * .86], [w * .07, cy - ry * .86], w * .04, "tinta");
  });
}
/** Carteira de couro com as cédulas subindo e descendo e o botão brilhando. Opções: larg, cor, t. Chaves: carteira, bolso, gasto, orçamento, dinheiro do mês, pagar, consumo, finanças pessoais */
export function carteira(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, h = w * .64, tt = p.ritmo(t), esc = escuro(p, cor, .28), topo = -h / 2 + h * .2;
  p.em({ x: 0, y: h * .12, r: Math.sin(tt * 2) * .04 }, () => {
    for (let i = 0; i < 3; i++) { const sobe = h * (.3 + .09 * Math.sin(tt * 3 + i * 1.4) - i * .06), x = -w * .42 + i * w * .06; p.forma(retP(x, topo - sobe, w * .62, sobe + h * .06), i % 2 ? maisClaro(p, "c3", .25) : "c3", { prof: 0, semente: 5 + i }); p.circulo(x + w * .31, topo - sobe * .5, h * .07, "tinta", { prof: 0, liso: true }); }
    p.forma(retArredP(-w / 2, -h / 2, w, h, w * .07), esc, { prof: 2, furos: [] });
    p.forma(retArredP(-w / 2, topo, w, h / 2 - topo, w * .07), cor, { prof: 1 });
    p.linha(retArredP(-w * .45, topo + w * .05, w * .9, h / 2 - topo - w * .1, w * .04), "tinta", w * .014, { fechar: true, tracejado: [w * .035, w * .03] });
    p.forma(retArredP(w * .2, h * .0, w * .37, h * .26, h * .13), esc, { prof: 1 });
    p.circulo(w * .3, h * .13, h * .065 * (1 + .15 * Math.sin(tt * 5)), "c2", { prof: 0, liso: true });
  });
}
/** Cartão de crédito inclinado que flutua, com reflexo correndo e ondas de aproximação. Opções: larg, cor, t. Chaves: cartão, crédito, débito, pagamento, compra, fatura, parcelar, aproximação, banco */
export function cartaoDeCredito(p, { larg = 360, cor = "c1", t = 0 } = {}) {
  const w = larg * .94, h = w * .62, tt = p.ritmo(t), corpo = retArredP(-w / 2, -h / 2, w, h, w * .06), f = (tt * .5) % 1;
  p.em({ x: 0, y: Math.sin(tt * 2.2) * h * .04, r: -.08 + Math.sin(tt * 1.6) * .05 }, () => {
    p.forma(corpo, cor, { prof: 3 });
    reflexo(p, corpo, lerp(-w * .9, w * .7, f), w * .12, h / 2, cor);
    p.forma(retArredP(-w * .39, -h * .26, w * .17, h * .25, w * .025), "c2", { prof: 0, liso: true });
    p.linha([[-w * .39, -h * .135], [-w * .22, -h * .135]], "tinta", w * .012); p.linha([[-w * .305, -h * .26], [-w * .305, -h * .01]], "tinta", w * .012);
    for (let i = 0; i < 3; i++) { const g = (tt * 1.2 + i / 3) % 1; p.alfa(1 - g, () => p.linha(arcoP(-w * .15, -h * .135, w * (.03 + g * .09), -50, 50, 8), "tinta", w * .018)); }
    for (let i = 0; i < 4; i++) p.capsula([-w * .39 + i * w * .2, h * .14], [-w * .39 + i * w * .2 + w * .13, h * .14], h * .085, "tinta");
    p.capsula([-w * .39, h * .33], [-w * .1, h * .33], h * .05, "tinta");
    p.circulo(w * .24, h * .29, h * .12, "c2", { prof: 0, liso: true }); p.circulo(w * .34, h * .29, h * .12, "c4", { prof: 0, liso: true });
  });
}
/** Saco de dinheiro amarrado que respira e solta moedas pela boca. Opções: larg, cor, simbolo, t. Chaves: saco de dinheiro, fortuna, lucro, prêmio, bolada, riqueza, faturamento, ganhar dinheiro */
export function sacoDeDinheiro(p, { larg = 260, cor = "c4", simbolo = "$", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), resp = Math.sin(tt * 3);
  for (let i = 0; i < 2; i++) { const f = (tt * .8 + i * .5) % 1, x = (i ? 1 : -1) * w * (.12 + f * .26), y = -w * 1.0 - Math.sin(f * Math.PI) * w * .2 + f * f * w * .22; p.alfa(f < .8 ? 1 : (1 - f) / .2, () => { p.circulo(x, y, w * .075, "c2", { prof: 0, liso: true }); p.circulo(x, y, w * .04, escuro(p, "c2", .25), { prof: 0, liso: true }); }); }
  p.em({ x: 0, y: 0, sx: 1 - resp * .025, sy: 1 + resp * .03 }, () => {
    p.forma([[-w * .22, -w * 1.06], [-w * .08, -w * .99], [0, -w * 1.08], [w * .09, -w * .99], [w * .23, -w * 1.05], [w * .1, -w * .84], [-w * .1, -w * .84]], escuro(p, cor, .18), { prof: 1 });
    p.forma([[-w * .1, -w * .85], [-w * .2, -w * .76], ...arcoP(0, -w * .42, w * .46, 215, -35, 22), [w * .2, -w * .76], [w * .1, -w * .85]].map(([x, y]) => [x, Math.min(y, 0)]), cor, { prof: 2 });
    p.capsula([-w * .13, -w * .84], [w * .13, -w * .84], w * .075, "c1");
    p.capsula([w * .1, -w * .84], [w * .2, -w * .74], w * .04, "c1"); p.capsula([w * .1, -w * .84], [w * .25, -w * .82], w * .04, "c1");
    p.texto(simbolo, 0, -w * .38, { tam: w * (simbolo.length > 1 ? .3 : .44), cor: "tinta" });
  });
}
/** Maquininha de cartão: o cartão entra, a tela processa e aprova. Opções: larg, cor, simbolo, t. Chaves: maquininha, cartão, pagamento, venda, passar o cartão, débito, crédito, comércio, taxa */
export function maquininha(p, { larg = 200, cor = "c4", simbolo = "$", t = 0 } = {}) {
  const w = larg, h = w * 1.5, tt = p.ritmo(t), f = (tt * .4) % 1, entra = E.entraSai(clamp(f / .22)) * (1 - E.entraSai(clamp((f - .82) / .18))), ok = f > .45 && f < .82;
  const yc = -h - w * .4 + entra * w * .26;
  p.forma(retArredP(-w * .3, yc, w * .6, -h + w * .03 - yc, w * .04), "c1", { prof: 1 });
  p.linha([[-w * .3, yc + w * .1], [w * .3, yc + w * .1]], "tinta", w * .05);
  p.forma(retArredP(-w / 2, -h, w, h, w * .1), cor, { prof: 2 });
  p.forma(retArredP(-w * .39, -h + w * .12, w * .78, w * .44, w * .04), "claro", { prof: 0, liso: true });
  const ym = -h + w * .34;
  if (ok) p.linha([[-w * .15, ym], [-w * .04, ym + w * .1], [w * .17, ym - w * .11]], "c3", w * .07);
  else if (f >= .22 && f <= .45) for (let i = 0; i < 3; i++) p.circulo((i - 1) * w * .16, ym - Math.max(0, Math.sin(tt * 9 - i)) * w * .05, w * .045, "tinta", { prof: 0, liso: true });
  else p.texto(simbolo, 0, ym, { tam: w * .28, cor: "tinta" });
  for (let i = 0; i < 12; i++) { const c = i % 3, l = (i - c) / 3; p.forma(retArredP(-w * .36 + c * w * .26, -h + w * .68 + l * w * .19, w * .2, w * .13, w * .03), l < 3 ? "tinta" : ["c1", "c2", "c3"][c], { prof: 0, liso: true }); }
}
/** Nota fiscal comprida que balança presa por cima, com itens, total e código de barras. Opções: larg, cor, k (0..1 imprime as linhas), simbolo, t. Chaves: nota fiscal, recibo, cupom, comprovante, imposto, conta, despesa, compra */
export function notaFiscal(p, { larg = 220, cor = "claro", k = 1, simbolo = "$", t = 0 } = {}) {
  const w = larg, h = w * 1.5, tt = p.ritmo(t), nz = 9, vis = clamp(k) * 8, bal = Math.sin(tt * 2.4);
  p.em({ x: 0, y: -h / 2, r: bal * .05 }, () => {
    const zig = []; for (let i = 0; i <= nz * 2; i++) zig.push([w / 2 - i * w / (nz * 2), h - (i % 2 ? w * .06 : 0)]);
    p.forma([[-w / 2, 0], [w / 2, 0], ...zig], cor, { prof: 2, liso: true });
    p.texto(simbolo, 0, h * .1, { tam: w * .2, cor: "tinta" });
    p.linha([[-w * .4, h * .2], [w * .4, h * .2]], "tinta", w * .02, { tracejado: [w * .05, w * .04] });
    for (let i = 0; i < 4; i++) { if (vis <= i) break; const y = h * (.28 + i * .085), q = clamp(vis - i); p.linha([[-w * .4, y], [-w * .4 + w * (.3 + ((i * 37) % 20) / 100) * q, y]], "tinta", w * .035); if (q > .7) p.linha([[w * .24, y], [w * .4, y]], "tinta", w * .035); }
    if (vis > 4) p.linha([[-w * .4, h * .62], [w * .4, h * .62]], "tinta", w * .02, { tracejado: [w * .05, w * .04] });
    if (vis > 5) { p.linha([[-w * .4, h * .7], [-w * .1, h * .7]], "c1", w * .06); p.forma(retArredP(w * .1, h * .7 - w * .06, w * .3, w * .12, w * .02), "c1", { prof: 0, liso: true }); }
    if (vis > 6.5) { const r = rng(11); let x = -w * .36; while (x < w * .34) { const lw = w * (.02 + r() * .035); p.linha([[x + lw / 2, h * .8], [x + lw / 2, h * .9]], "tinta", lw); x += lw + w * (.025 + r() * .02); } }
  });
}
/** Contrato com a assinatura sendo escrita pela caneta e o selo pulsando. Opções: larg, cor, k (0..1 assina), t. Chaves: contrato, assinatura, acordo, documento, fechar negócio, compromisso, termo, cláusula, prazo */
export function contrato(p, { larg = 260, cor = "claro", k = 1, t = 0 } = {}) {
  const w = larg, h = w * 1.3, tt = p.ritmo(t), kk = clamp(k);
  p.forma(retP(-w / 2, -h / 2, w, h), cor, { prof: 2 });
  p.linha([[-w * .28, -h * .38], [w * .28, -h * .38]], "tinta", w * .055);
  for (let i = 0; i < 5; i++) p.linha([[-w * .38, -h * .26 + i * h * .085], [i === 4 ? w * .05 : w * .38, -h * .26 + i * h * .085]], "tinta", w * .028);
  p.em({ x: w * .3, y: h * .3, s: 1 + .07 * Math.sin(tt * 4) }, () => {
    for (const s of [-1, 1]) p.forma([[s * w * .01, w * .04], [s * w * .09, w * .2], [s * w * .04, w * .17], [0, w * .2]], escuro(p, "c1", .25), { prof: 0, liso: true });
    p.forma(estrelaP(0, 0, w * .12, w * .095, 12), "c1", { prof: 1, liso: true });
    p.circulo(0, 0, w * .05, "tinta", { prof: 0, liso: true });
  });
  p.linha([[-w * .4, h * .36], [w * .08, h * .36]], "tinta", w * .018);
  const ass = Array.from({ length: 33 }, (_, i) => { const u = i / 32; return [lerp(-w * .36, w * .04, u) + Math.sin(u * TAU * 4) * w * .03, h * .33 - Math.abs(Math.sin(u * TAU * 2.5)) * h * .075 * (1 - u * .4)]; });
  const n = Math.round(kk * 32); if (n >= 1) p.linha(ass.slice(0, n + 1), "c1", w * .026);
  const [px, py] = ass[n], lev = kk >= 1 ? (1 + Math.sin(tt * 4)) * w * .03 : Math.abs(Math.sin(tt * 14)) * w * .008, a = -1.02 + Math.sin(tt * 4) * .07;
  p.em({ x: px, y: py - lev, r: a }, () => {
    p.forma([[0, 0], [w * .08, -w * .03], [w * .08, w * .03]], "tinta", { prof: 0, liso: true });
    p.forma(retArredP(w * .08, -w * .035, w * .42, w * .07, w * .03), "c2", { prof: 1, liso: true });
    p.forma(retP(w * .4, -w * .035, w * .05, w * .07), "tinta", { prof: 0, liso: true });
  });
}
/** Aperto de mãos entre duas mangas, sacudindo com linhas de impacto. Opções: larg, cor, cor2, pele, pele2, t. Chaves: aperto de mãos, acordo, parceria, negócio fechado, cliente, confiança, sociedade, negociação */
export function apertoDeMaos(p, { larg = 380, cor = "c1", cor2 = "c3", pele = "pele0", pele2 = "pele2", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), bal = Math.sin(tt * 7);
  const braco = (dir, manga, pl, frente) => p.em({ x: 0, y: 0, sx: dir, r: -dir * .16 }, () => {
    p.forma(retP(-w * .5, -w * .1, w * .2, w * .2), manga, { prof: 1 });
    p.forma(retP(-w * .31, -w * .11, w * .06, w * .22), "claro", { prof: 0 });
    p.forma(retArredP(-w * .26, -w * .09, w * .3, w * .18, w * .07), pl, { prof: 1, liso: true });
    p.capsula([-w * .13, -w * .07], [-w * .01, -w * .125], w * .065, pl);
    if (frente) for (let i = 0; i < 4; i++) p.capsula([-w * .02, -w * .06 + i * w * .042], [w * .13 - i * w * .012, -w * .05 + i * w * .046], w * .042, i % 2 ? escuro(p, pl, .12) : pl);
  });
  p.em({ x: 0, y: bal * w * .03 + w * .03, r: bal * .025 }, () => { braco(1, cor, pele, false); braco(-1, cor2, pele2, true); });
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * .5, r0 = w * .2, r1 = w * (.26 + .03 * Math.abs(bal)); p.linha([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]], "c2", w * .022); }
}
/** Maleta executiva que dá pulinhos, com os fechos brilhando. Opções: larg, cor, t. Chaves: maleta, pasta executiva, trabalho, emprego, negócios, empresa, carreira, executivo, viagem a trabalho */
export function maleta(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const w = larg, h = w * .62, tt = p.ritmo(t), f = (tt * .6) % 1, pulo = f < .35 ? Math.sin(f / .35 * Math.PI) : 0, amassa = f > .35 && f < .5 ? Math.sin((f - .35) / .15 * Math.PI) * .05 : 0, esc = escuro(p, cor, .3);
  p.em({ x: 0, y: -pulo * w * .07, r: Math.sin(tt * 2.4) * .03, sy: 1 - amassa, sx: 1 + amassa * .6 }, () => {
    p.forma(retArredP(-w * .19, -h - w * .15, w * .38, w * .22, w * .06), esc, { prof: 1, furos: [retArredP(-w * .13, -h - w * .09, w * .26, w * .14, w * .03).reverse()] });
    p.forma(retArredP(-w / 2, -h, w, h, w * .07), cor, { prof: 2 });
    p.forma([[-w / 2, -h * .62], [w / 2, -h * .62], [w / 2, -h * .5], [-w / 2, -h * .5]], esc, { prof: 0, liso: true });
    for (const s of [-1, 1]) p.forma(retArredP(s * w * .3 - w * .045, -h * .72, w * .09, h * .3, w * .02), "c2", { prof: 0, liso: true });
    p.forma(retArredP(-w * .07, -h * .7, w * .14, h * .28, w * .02), "c2", { prof: 0, liso: true });
    p.circulo(0, -h * .54, w * .025, "tinta", { prof: 0, liso: true });
    cintilar(p, w * .3, -h * .72, w * .09, (tt * .6 + .4) % 1, "claro");
  });
}
/** Calculadora com os números mudando no visor e as teclas sendo apertadas. Opções: larg, cor, t. Chaves: calculadora, conta, cálculo, orçamento, imposto, somar, custo, matemática financeira */
export function calculadora(p, { larg = 220, cor = "c4", t = 0 } = {}) {
  const w = larg, h = w * 1.38, tt = p.ritmo(t), passo = Math.floor(tt * 3), aperta = ((passo * 7) % 16 + 16) % 16;
  p.forma(retArredP(-w / 2, -h / 2, w, h, w * .09), cor, { prof: 2 });
  p.forma(retArredP(-w * .4, -h / 2 + w * .1, w * .8, w * .3, w * .03), "claro", { prof: 0, liso: true });
  p.texto(String(((passo * 1373) % 9000 + 9000) % 9000 + 1000), w * .34, -h / 2 + w * .26, { tam: w * .2, cor: "tinta", alinhar: "right" });
  for (let i = 0; i < 16; i++) {
    const c = i % 4, l = (i - c) / 4, x = -w * .4 + c * w * .21, y = -h / 2 + w * .5 + l * w * .21, d = i === aperta ? w * .02 : 0;
    p.forma(retArredP(x + d, y + d, w * .17 - d * 2, w * .17 - d * 2, w * .035), i === aperta ? "claro" : c === 3 ? "c1" : i === 14 ? "c2" : "tinta", { prof: 0, liso: true });
  }
}
/** Balança de dois pratos que oscila, comparando dois pesos. Opções: larg, cor, k (0 pesa à esquerda, .5 equilibra, 1 pesa à direita), t. Chaves: balança, equilíbrio, justiça, comparar, custo-benefício, pesar, prós e contras, decisão */
export function balanca(p, { larg = 360, cor = "c2", k = .5, t = 0 } = {}) {
  const w = larg, alt = w * .86, tt = p.ritmo(t), ang = (clamp(k) - .5) * .7 + Math.sin(tt * 2.2) * .09, L = w * .37, yv = -alt + w * .07, fio = w * .3;
  p.forma([[-w * .24, 0], [-w * .17, -w * .08], [w * .17, -w * .08], [w * .24, 0]], cor, { prof: 1 });
  p.forma(retP(-w * .028, yv, w * .056, alt - w * .14), cor, { prof: 0 });
  const e = s => [s * L * Math.cos(ang), yv + s * L * Math.sin(ang)];
  for (const s of [-1, 1]) {
    const [x, y] = e(s), yp = y + fio, rp = w * .15;
    for (const d of [-1, 1]) p.linha([[x, y], [x + d * rp, yp]], cor, w * .014);
    if (s < 0) p.circulo(x, yp - w * .065, w * .065, "c1", { prof: 0, liso: true }); else p.forma(retArredP(x - w * .06, yp - w * .11, w * .12, w * .11, w * .015), "c3", { prof: 0, liso: true });
    p.forma([[x - rp, yp], ...meiaElipse(x, yp, rp, w * .075), [x + rp, yp]], cor, { prof: 1, liso: true });
  }
  p.capsula(e(-1), e(1), w * .05, cor, { prof: 1 });
  p.circulo(0, yv, w * .06, cor, { prof: 1, liso: true }); p.circulo(0, yv, w * .025, "tinta", { prof: 0, liso: true });
}
/** Etiqueta de preço pendurada pelo barbante, balançando. Opções: larg, cor, simbolo, t. Chaves: etiqueta, preço, promoção, desconto, oferta, quanto custa, valor, liquidação */
export function etiquetaDePreco(p, { larg = 300, cor = "c2", simbolo = "$", t = 0 } = {}) {
  const w = larg * .9, h = w * .54, tt = p.ritmo(t), bal = Math.sin(tt * 2.6) * .16, px = -w * .36, py = -h * .16;
  p.linha([[px, py], [px - w * .03, py - h * .35], [px + w * .05 + bal * w * .1, py - h * .62], [px + w * .2 + bal * w * .16, py - h * .7]], sobreFundo(p), w * .02);
  p.em({ x: px, y: py, r: .22 + bal }, () => {
    p.forma([[-w * .12, 0], [w * .04, -h / 2], ...retArredP(w * .04, -h / 2, w * .8, h, w * .05).slice(1, 12), [w * .04, h / 2]], cor, { prof: 2, furos: [circP(0, 0, w * .04, 14).reverse()] });
    p.linha([[w * .12, -h * .34], [w * .12, h * .34]], "tinta", w * .014, { tracejado: [w * .03, w * .03] });
    p.texto(simbolo, w * .48, h * .03, { tam: h * (simbolo.length > 1 ? .5 : .72), cor: "tinta" });
  });
}
/** Carrinho de compras rodando, com os produtos sacudindo dentro. Opções: larg, cor, t. Chaves: carrinho, compras, supermercado, loja virtual, e-commerce, consumo, pedido, varejo */
export function carrinhoDeCompras(p, { larg = 340, cor = "c1", t = 0 } = {}) {
  const w = larg * .92, tt = p.ritmo(t), rr = w * .075, esc = escuro(p, cor, .3), x0 = w * .04;
  p.em({ x: x0, y: Math.sin(tt * 12) * w * .006 }, () => {
    const itens = [[-w * .2, w * .18, w * .2, "c2"], [w * .0, w * .15, w * .28, "c3"], [w * .17, w * .17, w * .16, "c4"]];
    itens.forEach(([x, lw, al, c], i) => { const q = Math.abs(Math.sin(tt * 5 + i * 1.3)) * w * .03; p.forma(retArredP(x, -w * .6 - al - q, lw, al + w * .03, w * .02), c, { prof: 0, semente: 7 + i }); });
    p.linha([[-w * .26, -w * .62], [-w * .36, -w * .78], [-w * .52, -w * .78]], esc, w * .05);
    p.linha([[-w * .16, -w * .27], [-w * .1, -w * .15], [w * .34, -w * .15]], esc, w * .04);
    p.forma([[-w * .3, -w * .62], [w * .46, -w * .62], [w * .37, -w * .27], [-w * .18, -w * .27]], cor, { prof: 2 });
    for (let i = 1; i < 4; i++) { const u = i / 4; p.linha([[lerp(-w * .3, w * .46, u), -w * .62], [lerp(-w * .18, w * .37, u), -w * .27]], "tinta", w * .018); }
    p.linha([[-w * .24, -w * .445], [w * .415, -w * .445]], "tinta", w * .018);
    for (const x of [-w * .08, w * .3]) { p.circulo(x, -rr, rr, sobreFundo(p), { prof: 1, liso: true }); p.circulo(x, -rr, rr * .45, cor, { prof: 0, liso: true }); const a = tt * 8; p.linha([[x - Math.cos(a) * rr * .8, -rr - Math.sin(a) * rr * .8], [x + Math.cos(a) * rr * .8, -rr + Math.sin(a) * rr * .8]], cor, w * .018); }
  });
}
/** Sacola de compras que balança, com as alças mexendo e uma estrela pulsando. Opções: larg, cor, t. Chaves: sacola, compras, loja, shopping, varejo, presente, consumo, produto, venda */
export function sacola(p, { larg = 240, cor = "c2", t = 0 } = {}) {
  const w = larg, h = w * 1.0, tt = p.ritmo(t), bal = Math.sin(tt * 2.5), esc = escuro(p, cor, .32);
  p.em({ x: 0, y: 0, r: bal * .035 }, () => {
    const alca = (dx, c) => p.linha(Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1 + i / 12), q = Math.sin(i / 12 * Math.PI); return [dx + Math.cos(a) * w * .2 + bal * q * w * .04, -h + w * .05 + Math.sin(a) * w * .3]; }), c, w * .045);
    alca(w * .04, escuro(p, cor, .5));
    p.forma([[-w * .5, -h], [w * .5, -h], [w * .42, 0], [-w * .42, 0]], cor, { prof: 2 });
    p.forma([[-w * .5, -h], [w * .5, -h], [w * .487, -h * .84], [-w * .487, -h * .84]], esc, { prof: 0, liso: true });
    alca(-w * .04, esc);
    for (const s of [-1, 1]) p.circulo(-w * .04 + s * w * .2, -h + w * .07, w * .035, "tinta", { prof: 0, liso: true });
    p.em({ x: 0, y: -h * .4, s: 1 + .12 * Math.sin(tt * 4), r: Math.sin(tt * 2) * .2 }, () => p.forma(estrelaP(0, 0, w * .2, w * .09, 5), "tinta", { prof: 0, liso: true }));
  });
}
/** Caixa registradora: o visor pisca, a gaveta abre com as notas e fecha de novo. Opções: larg, cor, simbolo, t. Chaves: caixa registradora, caixa, venda, faturamento, loja, cobrar, receita, comércio, entrada de dinheiro */
export function caixaRegistradora(p, { larg = 340, cor = "c1", simbolo = "$", t = 0 } = {}) {
  const w = larg * .88, tt = p.ritmo(t), f = (tt * .5) % 1, abre = E.sai(clamp(f / .2)) * (1 - E.entraSai(clamp((f - .75) / .25))), esc = escuro(p, cor, .28), incl = x => -w * .62 + (x + w * .1) / (w * .4) * w * .2;
  p.em({ x: -w * .1, y: 0 }, () => {
    if (abre > .03) {
      const gx = w * .3, gl = abre * w * .32;
      for (let i = 0; i < 2; i++) if (gl > w * (.12 + i * .1)) p.forma(retP(gx + gl - w * (.13 + i * .1), -w * .3 - i * w * .02, w * .08, w * .14), "c3", { prof: 0, semente: 4 + i });
      p.forma(retP(gx, -w * .2, gl, w * .15), esc, { prof: 1 });
      p.circulo(gx + gl, -w * .125, w * .035, "c2", { prof: 0, liso: true });
    }
    p.forma(retP(-w * .31, -w * .76, w * .07, w * .16), esc, { prof: 0 });
    p.forma(retArredP(-w * .44, -w * .96, w * .36, w * .23, w * .03), esc, { prof: 1 });
    p.forma(retP(-w * .405, -w * .925, w * .29, w * .16), "claro", { prof: 0, liso: true });
    if (abre > .03 || Math.sin(tt * 6) > -.3) p.texto(simbolo, -w * .26, -w * .84, { tam: w * .13, cor: "tinta" });
    p.forma([[-w * .42, -w * .3], [w * .3, -w * .3], [w * .3, -w * .42], [-w * .1, -w * .62], [-w * .42, -w * .62]], maisClaro(p, cor, .14), { prof: 1 });
    p.forma(retArredP(-w * .44, -w * .3, w * .76, w * .3, w * .03), cor, { prof: 2 });
    p.linha([[-w * .36, -w * .2], [w * .24, -w * .2]], "tinta", w * .018);
    for (let i = 0; i < 6; i++) { const c = i % 3, l = (i - c) / 3, x = -w * .04 + c * w * .1, q = Math.floor(tt * 4) % 6 === i; p.forma(retArredP(x, incl(x) + w * .055 + l * w * .09, w * .07, w * .06, w * .015), q ? "c2" : "tinta", { prof: 0, liso: true }); }
    p.forma(retArredP(-w * .36, -w * .55, w * .2, w * .17, w * .02), esc, { prof: 0, liso: true });
    if (abre > .5) for (let i = 0; i < 3; i++) { const a = -2.5 + i * .45, r0 = w * .2, r1 = w * .27; p.linha([[-w * .26 + Math.cos(a) * r0, -w * .84 + Math.sin(a) * r0], [-w * .26 + Math.cos(a) * r1, -w * .84 + Math.sin(a) * r1]], "c2", w * .02); }
  });
}
/** Gráfico de velas da bolsa: as velas surgem uma a uma e a última oscila com a linha de preço. Opções: larg, alt, cor (alta), cor2 (baixa), n, k (0..1 revela as velas), semente, t. Chaves: velas, candles, bolsa, ações, trade, mercado, cotação, cripto, investimento */
export function candles(p, { larg = 400, alt = 280, cor = "c3", cor2 = "c1", n = 7, k = 1, semente = 4, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), r = rng(semente), dx = w * .9 / n, lc = dx * .6, kk = clamp(k) * n;
  // série com tendência de alta (com uma ou duas quedas), normalizada para ocupar a altura toda
  const serie = []; let v = 0;
  for (let i = 0; i < n; i++) { const ab = v, fe = ab + (i % 3 === 2 ? -.5 - r() * .4 : .45 + r() * .7); serie.push([ab, fe, Math.max(ab, fe) + .12 + r() * .25, Math.min(ab, fe) - .12 - r() * .25]); v = fe; }
  const mn = Math.min(...serie.map(s => s[3])), mx = Math.max(...serie.map(s => s[2])), Y = u => -alt * .06 - (u - mn) / (mx - mn || 1) * alt * .86;
  p.linha([[-w / 2, -alt], [-w / 2, 0], [w / 2, 0]], sobreFundo(p), w * .014);
  let fim = null;
  for (let i = 0; i < n; i++) {
    const vivo = i === n - 1 ? (Math.sin(tt * 3) * .14 + Math.sin(tt * 7.3) * .06) * (mx - mn) * .25 : 0, [ab, fe0, hi0, lo] = serie[i], fe = fe0 + vivo, hi = Math.max(hi0, fe + .05);
    const ki = clamp(kk - i); if (ki <= 0) continue;
    const c = fe >= ab ? cor : cor2, x = -w / 2 + w * .08 + dx * (i + .5), q = E.sai(ki), meio = (ab + fe) / 2, yv = u => Y(meio + (u - meio) * q);
    p.linha([[x, yv(hi)], [x, yv(lo)]], c, w * .02);
    const y1 = yv(Math.max(ab, fe)), y2 = yv(Math.min(ab, fe));
    p.forma(retP(x - lc / 2, y1, lc, Math.max(y2 - y1, alt * .05)), c, { prof: 1, semente: 20 + i });
    if (ki >= 1) fim = [x, Y(fe), c];
  }
  if (fim) { p.linha([[-w / 2, fim[1]], [w / 2, fim[1]]], fim[2], w * .012, { tracejado: [w * .03, w * .025], desloc: tt * w * .08 }); p.circulo(fim[0], fim[1], w * .022 * (1.2 + .4 * Math.sin(tt * 6)), fim[2], { prof: 0, liso: true }); }
}
/** Cifrão grande que pulsa e balança, com anel de brilho e faíscas. Opções: larg, cor, simbolo, t. Chaves: cifrão, dinheiro, lucro, preço, custo, valor, monetizar, ganhar, caro */
export function cifrao(p, { larg = 240, cor = "c3", simbolo = "$", t = 0 } = {}) {
  const w = larg, R = w * .19, tt = p.ritmo(t), f = (tt * .9) % 1;
  p.alfa(1 - f, () => p.linha(circP(0, 0, w * (.34 + f * .16), 36), cor, w * .025, { fechar: true }));
  p.em({ x: 0, y: 0, s: 1 + .06 * Math.sin(tt * 4), r: Math.sin(tt * 2) * .1 }, () => {
    if (simbolo !== "$") return p.texto(simbolo, 0, w * .02, { tam: w * .5, cor });
    p.linha([[0, -w * .47], [0, w * .47]], cor, w * .075);
    p.linha([...arcoP(0, -R, R, -25, -270, 16), ...arcoP(0, R, R, -90, 155, 16).slice(1)], cor, w * .13);
  });
  for (let i = 0; i < 3; i++) { const a = i * 2.2 + .6; cintilar(p, Math.cos(a) * w * .42, Math.sin(a) * w * .4, w * .08, (tt * .8 + i / 3) % 1); }
}
/** Alvo de anéis com uma flecha que voa, acerta o centro e vibra. Opções: larg, cor, t. Chaves: alvo, meta, objetivo, acertar, foco, público-alvo, resultado, estratégia, mira */
export function alvo(p, { larg = 300, cor = "c1", t = 0 } = {}) {
  const R = larg * .4, tt = p.ritmo(t), f = (tt * .45) % 1, voo = clamp(f / .2), d = Math.max(0, f - .2), bate = f >= .2 ? Math.exp(-d * 9) : 0, vib = Math.sin(d * 70) * bate, fora = clamp((f - .9) / .1);
  const ang = -.62, cx = -R * .12, cy = R * .1;
  p.em({ x: cx - bate * R * .03, y: cy + bate * R * .03, s: 1 + bate * .05 }, () => {
    [1, .78, .56, .34, .14].forEach((q, i) => p.circulo(0, 0, R * q, i % 2 ? "claro" : cor, { prof: i ? 0 : 2, liso: i > 0, semente: 2 }));
  });
  const dist = (1 - E.entra(voo)) * R * .7 + fora * R * .7, L = R * 1.25;
  p.alfa(Math.min(clamp(voo * 4), 1 - fora), () => p.em({ x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist, r: ang + vib * .12 }, () => {
    p.linha([[0, 0], [L, 0]], "c4", R * .07);
    p.forma([[-R * .02, 0], [R * .2, -R * .08], [R * .2, R * .08]], "tinta", { prof: 0, liso: true });
    for (const s of [-1, 1]) p.forma([[L * .76, 0], [L * .86, s * R * .15], [L * 1.06, s * R * .15], [L * .96, 0]], "c2", { prof: 0, liso: true });
  }));
  if (f >= .2 && f < .5) for (let i = 0; i < 4; i++) { const a = ang + Math.PI + (i - 1.5) * .7, q = (f - .2) / .3; p.alfa(1 - q, () => p.linha([[cx + Math.cos(a) * R * (.2 + q * .3), cy + Math.sin(a) * R * (.2 + q * .3)], [cx + Math.cos(a) * R * (.32 + q * .4), cy + Math.sin(a) * R * (.32 + q * .4)]], "c2", R * .06)); }
}
// uma barra de ouro vista de frente, com a base em y = 0
function barraDeOuro(p, w, cor, marca, fx) {
  const h = w * .34, frente = [[-w / 2, 0], [w / 2, 0], [w * .4, -h], [-w * .4, -h]];
  const tampa = [[-w * .4, -h], [w * .4, -h], [w * .33, -h - w * .11], [-w * .33, -h - w * .11]];
  p.forma(tampa, maisClaro(p, cor, .35), { prof: 0, semente: 8 });
  if (p.estilo !== "traco") p.forma([[-w * .3, -h - w * .075], [w * .3, -h - w * .075], [w * .28, -h - w * .095], [-w * .28, -h - w * .095]], maisClaro(p, cor, .75), { prof: 0, liso: true });
  p.forma(frente, cor, { prof: 1, semente: 9 });
  reflexo(p, frente, fx * w, w * .1, h, cor);
  p.texto(marca, 0, -h * .46, { tam: h * .5, cor: "tinta" });
}
/** Barras de ouro empilhadas com reflexo correndo e faíscas piscando. Opções: larg, cor ("ouro" = a cor dourada da paleta), n (1 a 3 barras), marca, t. Chaves: lingote, ouro, barra de ouro, reserva, riqueza, tesouro, investimento seguro, patrimônio, valioso */
export function lingote(p, { larg = 300, cor = "ouro", n = 3, marca = "999", t = 0 } = {}) {
  if (cor === "ouro") cor = { flat: "c4", pixel: "c4" }[p.estilo] || "c2";
  const w = larg, tt = p.ritmo(t), q = clamp(Math.round(n), 1, 3), bw = q > 1 ? w * .5 : w, h = bw * .45, fx = lerp(-1, .8, (tt * .5) % 1);
  const pos = q === 1 ? [[0, 0]] : q === 2 ? [[-bw * .5, 0], [bw * .5, 0]] : [[-bw * .5, 0], [bw * .5, 0], [0, -h]];
  pos.forEach(([x, y], i) => p.em({ x, y: y - (i === 2 ? Math.max(0, Math.sin(tt * 3)) * w * .02 : 0) }, () => barraDeOuro(p, bw, cor, marca, fx - i * .25)));
  const topo = q === 3 ? h * 2 : h;
  for (let i = 0; i < 3; i++) cintilar(p, (i - 1) * w * .36 + w * .04, -topo * (.55 + (i % 2) * .5), w * .07, (tt * .7 + i / 3) % 1, i === 1 ? "claro" : undefined);
}
/** Cédulas e moedas caindo, girando e virando no ar. Opções: larg, alt, n, cor, cor2, simbolo, semente, t. Chaves: chuva de dinheiro, lucro, enriquecer, ganhos, renda extra, prêmio, sucesso financeiro, fartura */
export function chuvaDeDinheiro(p, { larg = 400, alt = 400, n = 9, cor = "c3", cor2 = "c2", simbolo = "$", semente = 6, t = 0 } = {}) {
  const tt = p.ritmo(t), r = rng(semente), bw = larg * .26, bh = bw * .5;
  for (let i = 0; i < n; i++) {
    const x0 = ((i + .5) / n - .5) * larg * .78 + (r() - .5) * larg * .08, vel = .22 + r() * .16, fase = (i * .618 + r() * .2) % 1, g = r() * TAU, f = (tt * vel + fase) % 1;
    const x = x0 + Math.sin(tt * 2 + g) * larg * .04, y = lerp(-alt * .42, alt * .42, f), vira = Math.cos(tt * 3 + g), a = clamp(Math.sin(f * Math.PI) * 5);
    if (i % 3 === 2) p.alfa(a, () => p.em({ x, y, sx: Math.abs(vira) < .2 ? .2 : vira }, () => { p.circulo(0, 0, bh * .55, cor2, { prof: 1, liso: true }); p.circulo(0, 0, bh * .38, escuro(p, cor2, .22), { prof: 0, liso: true }); if (vira > .6) p.texto(simbolo, 0, 0, { tam: bh * .55, cor: "tinta" }); }));
    else p.alfa(a, () => p.em({ x, y, r: Math.sin(tt * 1.5 + g) * .7, sy: Math.abs(vira) < .25 ? .25 : vira }, () => { p.forma(retArredP(-bw / 2, -bh / 2, bw, bh, bh * .12), i % 2 ? maisClaro(p, cor, .2) : cor, { prof: 1, semente: 30 + i }); p.elipse(0, 0, bh * .3, bh * .3, "claro", { prof: 0, liso: true }); for (const s of [-1, 1]) p.circulo(s * bw * .34, 0, bh * .12, "tinta", { prof: 0, liso: true }); }));
  }
}
/** Funil de vendas em faixas: as bolinhas entram por cima, algumas somem e poucas saem embaixo como moeda. Opções: larg, cor, niveis, t. Chaves: funil, vendas, conversão, leads, clientes, filtro, marketing, etapas, prospecção */
export function funilDeVendas(p, { larg = 340, cor = "c1", niveis = 4, t = 0 } = {}) {
  const w = larg * .92, alt = w, tt = p.ritmo(t), n = clamp(Math.round(niveis), 2, 5), cores = [cor, "c2", "c3", "c4", "c1"].filter((c, i) => !i || c !== cor), topo = -alt * .36, fundo = alt * .36, hb = (fundo - topo) / n, vao = hb * .14;
  const lg = y => lerp(w, w * .2, clamp((y - topo) / (fundo - topo)));
  for (let i = 0; i < n; i++) { const y0 = topo + i * hb, y1 = y0 + hb - vao, s = 1 + .025 * Math.sin(tt * 4 - i * 1.2); p.forma([[-lg(y0) / 2 * s, y0], [lg(y0) / 2 * s, y0], [lg(y1) / 2 * s, y1], [-lg(y1) / 2 * s, y1]], cores[i % cores.length], { prof: 1, semente: 12 + i }); }
  const r = rng(21), m = 8;
  for (let j = 0; j < m; j++) {
    const u = r() - .5, f = (tt * .3 + j / m) % 1, y = lerp(-alt * .5, alt * .5, f), passa = j % 4 === 0, some = topo + ((j % (n - 1)) + 1) * hb - vao, x = u * lg(y) * .75 + Math.sin(tt * 3 + j) * w * .01;
    const a = Math.min(clamp(f * 12), passa ? clamp((1 - f) * 10) : clamp((some - y) / (hb * .3)));
    if (passa && y > fundo - vao) p.alfa(a, () => { p.circulo(x * .3, y, w * .05, "c2", { prof: 1, liso: true }); p.circulo(x * .3, y, w * .026, escuro(p, "c2", .25), { prof: 0, liso: true }); });
    else p.alfa(a, () => p.circulo(x, y, w * .036, sobreFundo(p), { prof: 0, liso: true }));
  }
}
/** Organograma: a caixa de cima, as linhas e as caixas de baixo surgem em ordem; um ponto percorre as ligações. Opções: larg, cor, cor2, filhos (2 a 4), k (0..1 monta), t. Chaves: organograma, hierarquia, equipe, empresa, cargos, estrutura, liderança, departamentos, gestão */
export function organograma(p, { larg = 400, cor = "c1", cor2 = "c3", filhos = 3, k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = clamp(Math.round(filhos), 2, 4), kk = clamp(k / .85), px = p.estilo === "pixel", fio = sobreFundo(p), lw = w * (px ? .036 : .016);
  const fase = (a, b) => clamp((kk - a) / (b - a)), esp = w * .98 / n, m = Math.floor((n - 1) / 2), cor3 = cor2 === "c4" ? "c2" : "c4";
  // três níveis: o chefe, os n cartões do meio e dois cartões menores pendurados no cartão do meio
  const bw0 = w * .32, bw1 = Math.min(w * .27, esp * .82), bw2 = Math.min(w * .21, esp * .78), al = bw => bw * .62;
  const y0 = -w * .36, y1 = 0, y2 = w * .34, xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * esp);
  const lim = w * .5 - bw2 / 2, gs = [-1, 1].map(s => clamp(xs[m] + s * Math.max(esp * .5, bw2 * .62), -lim, lim));
  const pulso = Math.floor(tt * .8) % (n + 2), bate = 1 + .06 * Math.sin((tt * .8 % 1) * Math.PI);
  const cartao = (x, y, bw, c, q, i, alvo) => {
    if (q <= 0) return;
    const bh = al(bw);
    p.em({ x, y: y + (px ? 0 : Math.sin(tt * 3 - i * .9) * w * .008), s: E.volta(clamp(q)) * (alvo ? bate : 1) }, () => {
      if (px) {
        // no pixel: bloco reto, cabeça e corpo quadrados e uma linha de texto, sem curvas pequenas que viram borrão
        p.retangulo(-bw / 2, -bh / 2, bw, bh, c, { prof: 0 });
        const u = bh / 6;
        p.retangulo(-bw * .38, -u * 2, u * 1.6, u * 1.6, "tinta", { prof: 0 });
        p.retangulo(-bw * .38 - u * .5, u * .2, u * 2.6, u * 1.8, "tinta", { prof: 0 });
        p.retangulo(-bw * .38 + u * 3, -u * .5, bw * .76 - u * 3.2, u * 1.1, "tinta", { prof: 0 });
        return;
      }
      p.forma(retArredP(-bw / 2, -bh / 2, bw, bh, bh * .18), c, { prof: 1, semente: 40 + i });
      p.circulo(-bw * .26, -bh * .08, bh * .17, "tinta", { prof: 0, liso: true });
      p.forma([[-bw * .4, bh * .34], ...arcoP(-bw * .26, bh * .34, bw * .14, 180, 360, 8), [-bw * .12, bh * .34]], "tinta", { prof: 0, liso: true });
      p.capsula([bw * .02, -bh * .12], [bw * .36, -bh * .12], bh * .12, "tinta"); p.capsula([bw * .02, bh * .14], [bw * .26, bh * .14], bh * .1, "tinta");
    });
  };
  // colchete: desce do pai, abre para os lados e desce até cada filho
  const ligar = (xp, yp, kids, yk, q) => {
    if (q <= 0) return;
    const ym = (yp + yk) / 2, q1 = clamp(q * 3), q2 = clamp(q * 3 - 1), q3 = clamp(q * 3 - 2), xa = Math.min(...kids), xb = Math.max(...kids);
    p.linha([[xp, yp], [xp, lerp(yp, ym, q1)]], fio, lw);
    if (q2 > 0) p.linha([[lerp(xp, xa, q2), ym], [lerp(xp, xb, q2), ym]], fio, lw);
    if (q3 > 0) for (const x of kids) p.linha([[x, ym], [x, lerp(ym, yk, q3)]], fio, lw);
  };
  ligar(0, y0 + al(bw0) / 2, xs, y1 - al(bw1) / 2, fase(.18, .4));
  ligar(xs[m], y1 + al(bw1) / 2, gs, y2 - al(bw2) / 2, fase(.6, .78));
  const pronto = kk >= 1;
  cartao(0, y0, bw0, cor, fase(0, .2), 0, false);
  xs.forEach((x, i) => cartao(x, y1, bw1, cor2, fase(.38 + i * .06, .52 + i * .06), i + 1, pronto && pulso === i));
  gs.forEach((x, j) => cartao(x, y2, bw2, cor3, fase(.76 + j * .06, .9 + j * .06), n + 1 + j, pronto && pulso === n + j));
  if (pronto) {
    // um ponto desce pelas ligações até o cartão que pulsa
    const yA = y0 + al(bw0) / 2, yB = y1 - al(bw1) / 2, ymA = (yA + yB) / 2, cam = [[0, yA], [0, ymA]];
    if (pulso < n) cam.push([xs[pulso], ymA], [xs[pulso], yB]);
    else { const yC = y1 + al(bw1) / 2, yD = y2 - al(bw2) / 2, ymB = (yC + yD) / 2, xg = gs[pulso - n]; cam.push([xs[m], ymA], [xs[m], ymB], [xg, ymB], [xg, yD]); }
    const comp = cam.slice(1).map((c, i) => Math.hypot(c[0] - cam[i][0], c[1] - cam[i][1])), tot = comp.reduce((a, b) => a + b, 0) || 1;
    let d = ((tt * .8) % 1) * tot, s = 0;
    while (s < comp.length - 1 && d > comp[s]) d -= comp[s++];
    const u = comp[s] ? clamp(d / comp[s]) : 1;
    p.circulo(lerp(cam[s][0], cam[s + 1][0], u), lerp(cam[s][1], cam[s + 1][1], u), w * (px ? .034 : .028), "c2", { prof: 0, liso: true });
  }
}
