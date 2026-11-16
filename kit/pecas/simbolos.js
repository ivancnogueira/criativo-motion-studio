// Categoria: Símbolos, setas e ícones
// Kit de movimento — ícones para ideias abstratas: direção, ciclo, aprovação, atenção e estados de interface.
// Todos centrados na origem. A convenção das peças está em ./_comum.js.
import { clamp, lerp, E, mola, circP, retP, retArredP, rotP, arcoP, estrelaP, escuro, sobreFundo, TAU, ciclo } from "./_comum.js";

/** Seta curva que se traça e balança. Opções: larg, cor, k (0..1 traça a seta), t. Chaves: seta, curva, direção, próximo, leva a, consequência, fluxo */
export function setaCurva(p, { larg = 300, cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), pts = arcoP(0, w * .3, w * .5, 205, 335, 20), n = Math.max(2, Math.round(clamp(k) * pts.length));
  p.em({ x: 0, y: Math.sin(tt * 3) * w * .02, r: Math.sin(tt * 2) * .05 }, () => p.seta(pts.slice(0, n), cor, w * .07));
}
/** Duas setas em sentidos opostos que deslizam uma contra a outra. Opções: larg, cor, cor2, t. Chaves: troca, ida e volta, câmbio, transferência, sincronizar, comparar, setas */
export function setaDupla(p, { larg = 300, cor = "c1", cor2 = "c3", t = 0 } = {}) {
  const w = larg, d = Math.sin(p.ritmo(t) * 3) * w * .06;
  p.seta([[-w * .4 + d, -w * .13], [w * .3 + d, -w * .13]], cor, w * .07);
  p.seta([[w * .4 - d, w * .13], [-w * .3 - d, w * .13]], cor2, w * .07);
}
/** Setas em círculo girando sem parar. Opções: larg, cor, n (quantas setas), vel, t. Chaves: ciclo, repetir, processo, rotina, atualizar, loop, recarregar, setas */
export function setasCiclo(p, { larg = 300, cor = "c1", n = 3, vel = 1, t = 0 } = {}) {
  const r = larg * .36, a0 = p.ritmo(t) * 60 * vel, cores = [cor, "c3", "c2", "c4"];
  for (let i = 0; i < n; i++) { const a = a0 + i * 360 / n; p.seta(arcoP(0, 0, r, a, a + 360 / n - 40, 10), cores[i % cores.length], larg * .06); }
}
/** Seta em zigue-zague que se traça subindo (ou caindo), com a ponta pulsando. Opções: larg, cor, k (0..1 traça), queda, t. Chaves: crescimento, alta, queda, tendência, subir, cair, resultado, seta */
export function setaZigueZague(p, { larg = 320, cor = "c3", k = 1, queda = false, t = 0 } = {}) {
  const w = larg, s = queda ? -1 : 1, base = [[-w * .45, w * .25], [-w * .18, -w * .04], [0, w * .12], [w * .4, -w * .28]].map(([x, y]) => [x, y * s]);
  const kk = clamp(k) * 3; if (kk < .05) return;
  const i = Math.min(2, Math.floor(kk)), f = Math.min(1, kk - i), ponta = [lerp(base[i][0], base[i + 1][0], f), lerp(base[i][1], base[i + 1][1], f)];
  p.seta([...base.slice(0, i + 1), ponta], queda ? "c1" : cor, w * .07);
  const pulso = (p.ritmo(t) * 1.2) % 1; p.alfa(1 - pulso, () => p.linha(circP(ponta[0], ponta[1], w * (.06 + pulso * .12), 20), queda ? "c1" : cor, w * .025, { fechar: true }));
}
/** Estrela que pulsa, com brilhos piscando em volta. Opções: larg, cor, pontas, t. Chaves: estrela, favorito, avaliação, destaque, nota, qualidade, sucesso */
export function estrela(p, { larg = 220, cor = "c2", pontas = 5, t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t);
  p.em({ x: 0, y: 0, s: 1 + .07 * Math.sin(tt * 4), r: Math.sin(tt * 1.5) * .12 }, () => p.forma(estrelaP(0, 0, R, R * .45, pontas), cor, { prof: 2 }));
  for (let i = 0; i < 3; i++) { const f = (tt * .8 + i / 3) % 1, a = i * 2.2 + 1; p.em({ x: Math.cos(a) * R * 1.05, y: Math.sin(a) * R * 1.05, s: Math.sin(f * Math.PI) + .001, r: f * 2 }, () => p.forma(estrelaP(0, 0, R * .22, R * .07, 4), sobreFundo(p), { prof: 0, liso: true })); }
}
/** Mão de joinha que balança aprovando; com `baixo` vira reprovação. Opções: larg, pele, manga, baixo, t. Chaves: joinha, curtir, like, aprovar, gostei, positivo, negativo, reprovar, mão */
export function joinha(p, { larg = 240, pele = "pele0", manga = "c1", baixo = false, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.em({ x: 0, y: w * .05, sy: baixo ? -1 : 1, r: Math.sin(tt * 4) * .1 - .06 }, () => {
    p.capsula([w * .0, -w * .1], [w * .1, -w * .46], w * .18, pele, { prof: 1 });
    p.forma(retArredP(-w * .22, -w * .14, w * .56, w * .46, w * .1), pele, { prof: 2 });
    for (let i = 1; i < 4; i++) p.linha([[w * .08, -w * .14 + i * w * .115], [w * .33, -w * .14 + i * w * .115]], escuro(p, pele, .25), w * .022);
    p.forma(retArredP(-w * .45, -w * .16, w * .22, w * .5, w * .04), manga, { prof: 1 });
  });
}
/** Ponto de interrogação que quica e inclina. Opções: larg, cor, t. Chaves: dúvida, pergunta, interrogação, por quê, mistério, desconhecido, como */
export function interrogacao(p, { larg = 220, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.em({ x: 0, y: -Math.abs(Math.sin(tt * 2.5)) * w * .07, r: Math.sin(tt * 2.5) * .12 }, () => {
    p.linha([...arcoP(0, -w * .2, w * .21, 180, 400, 14), [w * .01, w * .05], [0, w * .16]], cor, w * .12);
    p.circulo(0, w * .37, w * .08, cor, { prof: 0, liso: true });
  });
}
/** Ponto de exclamação que treme em rajadas. Opções: larg, cor, t. Chaves: exclamação, atenção, importante, urgente, surpresa, aviso, cuidado */
export function exclamacao(p, { larg = 220, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .8) % 1, tremor = f < .4 ? Math.sin(tt * 42) * w * .035 * (1 - f / .4) : 0;
  p.em({ x: tremor, y: 0, s: 1 + (f < .15 ? .12 * (1 - f / .15) : 0) }, () => {
    p.forma([[-w * .09, -w * .44], [w * .09, -w * .44], [w * .045, w * .14], [-w * .045, w * .14]], cor, { prof: 2 });
    p.circulo(0, w * .34, w * .09, cor, { prof: 1 });
  });
}
/** Placa de proibido que pulsa. Opções: larg, cor, t. Chaves: proibido, não pode, bloqueado, vetado, censura, negar, impedir, restrição */
export function proibido(p, { larg = 240, cor = "c1", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t);
  p.em({ x: 0, y: 0, s: 1 + .05 * Math.sin(tt * 5), r: Math.sin(tt * 2.5) * .04 }, () => {
    p.forma(circP(0, 0, R), cor, { prof: 2, furos: [circP(0, 0, R * .74).reverse()] });
    p.forma(rotP(retP(-R * .82, -R * .13, R * 1.64, R * .26), 0, 0, Math.PI / 4), cor, { prof: 0, liso: true });
  });
}
/** Sinal de mais que dá um quarto de volta e pulsa; com `menos` vira sinal de menos. Opções: larg, cor, menos, t. Chaves: mais, somar, adicionar, novo, positivo, menos, subtrair, vantagem */
export function sinalDeMais(p, { larg = 200, cor = "c3", menos = false, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), volta = Math.floor(tt / 1.6) + E.entraSai(clamp((tt % 1.6) / .5));
  p.em({ x: 0, y: 0, r: menos ? Math.sin(tt * 3) * .08 : volta * Math.PI / 2, s: 1 + .06 * Math.sin(tt * 4) }, () => {
    p.forma(retArredP(-w * .42, -w * .11, w * .84, w * .22, w * .05), cor, { prof: 2 });
    if (!menos) p.forma(retArredP(-w * .11, -w * .42, w * .22, w * .84, w * .05), cor, { prof: 0 });
  });
}
/** Símbolo do infinito com um ponto correndo pelo traço. Opções: larg, cor, t. Chaves: infinito, sem fim, ilimitado, para sempre, contínuo, eterno */
export function infinito(p, { larg = 320, cor = "c1", t = 0 } = {}) {
  const a = larg * .5, laco = th => { const d = 1 + Math.sin(th) ** 2; return [a * Math.cos(th) / d, a * 1.25 * Math.sin(th) * Math.cos(th) / d]; };
  p.linha(Array.from({ length: 49 }, (_, i) => laco(i / 48 * TAU)), cor, larg * .06, { fechar: true });
  const pt = laco(p.ritmo(t) * 2.2); p.circulo(pt[0], pt[1], larg * .06, "c2", { prof: 1, liso: true });
}
/** Sino que toca balançando, com o ponto de aviso pulando. Opções: larg, cor, aviso, t. Chaves: sino, notificação, lembrete, alarme, aviso, inscreva-se, alerta */
export function sino(p, { larg = 220, cor = "c2", aviso = true, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), f = (tt * .7) % 1, bal = Math.sin(tt * 14) * .28 * Math.max(0, 1 - f * 1.8);
  p.em({ x: 0, y: -w * .42, r: bal }, () => {
    p.circulo(-bal * w * .5, w * .78, w * .08, sobreFundo(p), { prof: 0, liso: true });
    p.forma([...arcoP(0, w * .32, w * .27, 180, 360, 12), [w * .3, w * .56], [w * .42, w * .7], [-w * .42, w * .7], [-w * .3, w * .56]], cor, { prof: 2 });
    p.circulo(0, w * .03, w * .06, cor, { prof: 0, liso: true });
  });
  if (aviso) p.em({ x: w * .28, y: -w * .3, s: .8 + .3 * mola(clamp(f * 3), { freq: 2, amort: 4 }) }, () => p.circulo(0, 0, w * .11, "c1", { prof: 1, liso: true }));
}
/** Mira que gira e fecha o foco no centro. Opções: larg, cor, t. Chaves: mira, foco, objetivo, precisão, público-alvo, atingir, meta */
export function mira(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), s = 1 + .08 * Math.sin(tt * 3);
  p.em({ x: 0, y: 0, r: tt * .6 }, () => { for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; p.linha([[Math.cos(a) * R * .62, Math.sin(a) * R * .62], [Math.cos(a) * R, Math.sin(a) * R]], sobreFundo(p), R * .09); } });
  p.linha(circP(0, 0, R * .74 * s, 36), cor, R * .09, { fechar: true });
  p.linha(circP(0, 0, R * .4 / s, 28), cor, R * .06, { fechar: true });
  p.circulo(0, 0, R * .13, cor, { prof: 0, liso: true });
}
/** Roda de carregamento: pontos que crescem em sequência. Opções: larg, cor, n, t. Chaves: carregando, espera, processando, loading, aguarde, demora, pensando */
export function carregando(p, { larg = 220, cor = "c1", n = 8, t = 0 } = {}) {
  const R = larg * .36, cab = p.ritmo(t) * 9;
  for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2, atras = (((cab - i) % n) + n) % n / n; p.circulo(Math.cos(a) * R, Math.sin(a) * R, larg * (.035 + .075 * (1 - atras)), atras < .5 ? cor : "c4", { prof: 0, liso: true }); }
}
/** Barra de progresso que enche, com listras andando e a porcentagem em cima. Opções: larg, cor, k (0..1 quanto encheu), rotulo, t. Chaves: progresso, barra, andamento, porcentagem, carregamento, etapa, download, meta */
export function barraDeProgresso(p, { larg = 380, cor = "c3", k = .6, rotulo = true, t = 0 } = {}) {
  const w = larg, h = w * .15, kk = clamp(k), cheio = retArredP(-w / 2, -h / 2, Math.max(h, w * kk), h, h / 2), d = (p.ritmo(t) * h * 1.5) % (h * 1.2);
  p.forma(retArredP(-w / 2, -h / 2, w, h, h / 2), "claro", { prof: 1 });
  p.linha(retArredP(-w / 2, -h / 2, w, h, h / 2), sobreFundo(p), w * .016, { fechar: true });
  if (kk > 0) { p.forma(cheio, cor, { prof: 0, liso: true }); p.recortar(cheio, () => { for (let x = -w / 2 - h + d; x < -w / 2 + w * kk; x += h * 1.2) p.forma([[x, h / 2], [x + h * .5, h / 2], [x + h, -h / 2], [x + h * .5, -h / 2]], escuro(p, cor, .18), { prof: 0, liso: true }); }); }
  if (rotulo) p.texto(Math.round(kk * 100) + "%", 0, -h * 1.5, { tam: h * 1.1, cor: sobreFundo(p) });
}
/** Interruptor de liga e desliga: o botão desliza e solta faíscas ao ligar. Opções: larg, cor, k (0 desligado, 1 ligado), t. Chaves: interruptor, ligar, desligar, ativar, botão, chave, configuração, modo */
export function interruptor(p, { larg = 300, cor = "c3", k = 1, t = 0 } = {}) {
  const w = larg, h = w * .46, kk = E.entraSai(clamp(k)), x = lerp(-w / 2 + h / 2, w / 2 - h / 2, kk), tt = p.ritmo(t);
  p.forma(retArredP(-w / 2, -h / 2, w, h, h / 2), kk > .5 ? cor : "c4", { prof: 2 });
  p.circulo(x, 0, h * .38 * (1 + .04 * Math.sin(tt * 5)), "tinta", { prof: 1, liso: true });
  if (kk > .9) for (let i = 0; i < 5; i++) { const a = -2.4 + i * .6, r0 = h * .62, r1 = h * (.78 + .1 * Math.sin(tt * 8 + i)); p.linha([[x + Math.cos(a) * r0, Math.sin(a) * r0], [x + Math.cos(a) * r1, Math.sin(a) * r1]], "c2", w * .025); }
}
/** Botão de tocar com anel pulsando; com `pausa` mostra as duas barras. Opções: larg, cor, pausa, t. Chaves: play, tocar, vídeo, assistir, começar, iniciar, pausa, reproduzir */
export function botaoPlay(p, { larg = 240, cor = "c1", pausa = false, t = 0 } = {}) {
  const R = larg * .4, tt = p.ritmo(t), f = (tt * 1.1) % 1;
  p.alfa(1 - f, () => p.linha(circP(0, 0, R * (1 + f * .28), 36), cor, R * .08, { fechar: true }));
  p.circulo(0, 0, R * (1 + .03 * Math.sin(tt * 6)), cor, { prof: 2 });
  if (pausa) for (const x of [-R * .3, R * .08]) p.forma(retArredP(x, -R * .4, R * .22, R * .8, R * .05), "tinta", { prof: 0, liso: true });
  else p.forma([[-R * .28, -R * .44], [R * .5, 0], [-R * .28, R * .44]], "tinta", { prof: 0, liso: true });
}
/** Alto-falante com ondas de som saindo; com `mudo` aparece um xis. Opções: larg, cor, mudo, t. Chaves: som, áudio, volume, alto-falante, barulho, mudo, silêncio, ouvir */
export function altoFalante(p, { larg = 260, cor = "c1", mudo = false, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), s = 1 + (mudo ? 0 : .05 * Math.sin(tt * 12));
  p.em({ x: -w * .12, y: 0, s }, () => p.forma([[-w * .34, -w * .13], [-w * .16, -w * .13], [w * .06, -w * .32], [w * .06, w * .32], [-w * .16, w * .13], [-w * .34, w * .13]], cor, { prof: 2 }));
  if (mudo) { const d = w * .11, x = w * .26 + Math.sin(tt * 3) * w * .01; p.linha([[x - d, -d], [x + d, d]], "c2", w * .06); p.linha([[x + d, -d], [x - d, d]], "c2", w * .06); }
  else for (let i = 0; i < 3; i++) { const f = (tt * 1.4 + i / 3) % 1; p.alfa(1 - f, () => p.linha(arcoP(-w * .06, 0, w * (.14 + f * .42), -42, 42, 10), "c2", w * .045)); }
}
/** Dois elos de corrente que se puxam e voltam. Opções: larg, cor, cor2, t. Chaves: link, elo, corrente, conexão, vínculo, ligação, união, dependência */
export function elo(p, { larg = 300, cor = "c1", cor2 = "c3", t = 0 } = {}) {
  const w = larg, d = w * (.13 + .04 * Math.sin(p.ritmo(t) * 3)), anel = c => p.forma(retArredP(-w * .26, -w * .13, w * .52, w * .26, w * .13), c, { prof: 1, furos: [retArredP(-w * .17, -w * .05, w * .34, w * .1, w * .05).reverse()] });
  p.em({ x: 0, y: 0, r: -.5 }, () => { p.em({ x: -d, y: 0 }, () => anel(cor)); p.em({ x: d, y: 0 }, () => anel(cor2)); p.forma(retArredP(-d - w * .02, -w * .13, w * .1, w * .08, w * .02), cor, { prof: 0, liso: true }); });
}
/** Selo de verificado: a borda recortada gira e o certo se traça de tempos em tempos. Opções: larg, cor, t. Chaves: verificado, selo, oficial, garantia, confiável, certificado, autêntico, qualidade */
export function seloVerificado(p, { larg = 240, cor = "c3", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), a0 = tt * .5, k = ciclo(tt, .7, 1.8);
  p.forma(Array.from({ length: 72 }, (_, i) => { const a = a0 + i / 72 * TAU, r = R * (.9 + .1 * Math.cos(i / 72 * TAU * 12)); return [Math.cos(a) * r, Math.sin(a) * r]; }), cor, { prof: 2, liso: true });
  const pts = [[-R * .4, 0], [-R * .1, R * .28], [R * .42, -R * .3]], k1 = clamp(k * 2), k2 = clamp(k * 2 - 1), tr = [pts[0], [lerp(pts[0][0], pts[1][0], k1), lerp(pts[0][1], pts[1][1], k1)]];
  if (k2 > 0) tr.push([lerp(pts[1][0], pts[2][0], k2), lerp(pts[1][1], pts[2][1], k2)]);
  if (k1 > .05) p.linha(tr, "tinta", R * .17);
}
/** Balão de pensamento com bolinhas subindo e reticências pulando. Opções: larg, cor, t. Chaves: pensamento, pensar, ideia, imaginar, sonho, dúvida, reflexão, balão */
export function balaoDePensamento(p, { larg = 320, cor = "claro", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t);
  for (const [x, y, r, i] of [[-w * .36, w * .34, w * .035, 0], [-w * .28, w * .24, w * .06, 1]]) p.circulo(x, y, r * (1 + .25 * Math.sin(tt * 4 - i)), cor, { prof: 1 });
  p.em({ x: 0, y: 0, s: 1 + .025 * Math.sin(tt * 3) }, () => {
    for (const [x, y, r] of [[-w * .26, 0, w * .19], [-w * .08, -w * .14, w * .2], [w * .14, -w * .12, w * .21], [w * .29, .02 * w, w * .17], [w * .1, w * .1, w * .2], [-w * .12, w * .09, w * .19]]) p.circulo(x, y, r, cor, { prof: 1, semente: Math.round(x) + 9 });
    p.forma(retArredP(-w * .26, -w * .12, w * .56, w * .22, w * .1), cor, { prof: 0, liso: true });
    for (let i = 0; i < 3; i++) p.circulo((i - 1) * w * .14, -Math.max(0, Math.sin(tt * 5 - i * .9)) * w * .06, w * .04, "tinta", { prof: 0, liso: true });
  });
}
/** Cerquilha (hashtag) que inclina e quica. Opções: larg, cor, t. Chaves: hashtag, cerquilha, tendência, rede social, assunto, tag, trending, número */
export function hashtag(p, { larg = 220, cor = "c1", t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), inc = .12 + Math.sin(tt * 3) * .05;
  p.em({ x: 0, y: -Math.abs(Math.sin(tt * 3)) * w * .05 }, () => {
    for (const x of [-w * .15, w * .15]) p.capsula([x + inc * w * .4, -w * .4], [x - inc * w * .4, w * .4], w * .1, cor, { prof: 1 });
    for (const y of [-w * .14, w * .14]) p.capsula([-w * .4, y], [w * .4, y], w * .1, cor, { prof: 1 });
  });
}
/** Arroba com a cauda que se enrola e desenrola. Opções: larg, cor, t. Chaves: arroba, e-mail, perfil, usuário, menção, contato, rede social, endereço */
export function arroba(p, { larg = 240, cor = "c1", t = 0 } = {}) {
  const R = larg / 2, tt = p.ritmo(t), fim = 300 + 40 * Math.sin(tt * 2.5);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.5) * .08 }, () => {
    p.linha(circP(0, 0, R * .34, 24), cor, R * .16, { fechar: true });
    p.linha([[R * .34, -R * .34], [R * .34, R * .12], ...arcoP(R * .62, R * .12, R * .28, 180, 0, 8), ...arcoP(0, 0, R * .9, 8, -fim, 30)], cor, R * .16);
  });
}
/** Três setas em triângulo que giram: reciclagem e reaproveitamento. Opções: larg, cor, t. Chaves: reciclar, reciclagem, sustentável, reaproveitar, meio ambiente, ecologia, lixo, verde */
export function reciclar(p, { larg = 280, cor = "c3", t = 0 } = {}) {
  const R = larg * .4, tt = p.ritmo(t), v = i => { const a = -Math.PI / 2 + i * TAU / 3; return [Math.cos(a) * R, Math.sin(a) * R]; };
  p.em({ x: 0, y: larg * .05, r: Math.sin(tt * 1.2) * .25, s: 1 + .04 * Math.sin(tt * 4) }, () => {
    for (let i = 0; i < 3; i++) { const a = v(i), b = v(i + 1); p.seta([[lerp(a[0], b[0], .2), lerp(a[1], b[1], .2)], [lerp(a[0], b[0], .68), lerp(a[1], b[1], .68)]], [cor, "c1", "c2"][i], larg * .075); }
  });
}

/** Sino e selo para representar confirmação. Chaves: confirmação, notificação, sino, verificado */
export function confirmacaoNotificada(p, { t = 0 } = {}) {
  p.em({ x: -85, s: .55 }, () => sino(p, { t }));
  p.em({ x: 85, s: .55 }, () => seloVerificado(p, { t }));
}
