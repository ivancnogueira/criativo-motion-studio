// Categoria: Gráficos e dados
// Kit de movimento — gráficos, painéis e diagramas para mostrar números, comparações, processos, metas e prazos.
// Quase todas têm `k` (0..1 constrói a peça em cascata, com mola) e vida própria com `t` depois de prontas.
// Aceitam os dados por opção (valores, rotulos, valor, texto) e já vêm com bons exemplos.
// A convenção das peças está em ./_comum.js. graficoBarras, graficoLinha e graficoPizza ficam em ./base.js.
import { clamp, lerp, semear, ruido, E, mola, circP, retP, retArredP, misturarCor, arcoP, estrelaP, maisClaro, sobreFundo, TAU } from "./_comum.js";

/* ---------------------------------------------------------------- apoio (sem export) */
const HEX = /^#[0-9a-f]{6}$/i;
/** Progresso com mola do item i de n, para construir em cascata: `janela` itens crescem ao mesmo tempo. */
const cascata = (k, i, n, janela = 3) => mola(clamp(k * (n + janela - 1) / janela - i / janela), { freq: 1.4, amort: 6 });
/** Opacidade que o pixel não suporta bem (ele reduz tudo à paleta): lá a forma fica sólida. */
const meio = (p, a) => p.estilo === "pixel" ? 1 : a;
/** Cor apagada que aparece sobre o fundo em qualquer estilo (trilho vazio, item não preenchido). */
const apagado = (p, k = .22) => { const a = p.cor("fundo"), b = p.cor(sobreFundo(p)); return HEX.test(a) && HEX.test(b) ? misturarCor(a, b, k) : "claro"; };
/** Mistura duas cores por papel ou hex (k = 0 é a, k = 1 é b). */
const mistura = (p, a, b, k) => { const x = p.cor(a), y = p.cor(b); return HEX.test(x) && HEX.test(y) ? misturarCor(x, y, clamp(k)) : (k > .5 ? b : a); };
/** Cor de detalhe em cima de um corpo "tinta" (no traco, "claro" quase some no fundo). */
const sobreTinta = p => p.estilo === "traco" ? "tinta" : "claro";
/** Número no jeito brasileiro: 12.500 e 3,5. */
const numero = (v, casas = 0) => { const [i, d] = Math.abs(v).toFixed(casas).split("."); return (v < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : ""); };
/** Eixos em L de um gráfico apoiado no chão. */
const eixos = (p, w, h, lw) => p.linha([[-w / 2, -h * 1.04], [-w / 2, 0], [w / 2 + lw, 0]], sobreFundo(p), lw);
/** Trecho inicial de uma linha de pontos, até a fração f do comprimento. */
function parcial(pts, f) {
  const segs = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); tot += d; }
  const out = [pts[0]]; let resta = clamp(f) * tot;
  for (let i = 1; i < pts.length; i++) {
    const d = segs[i - 1];
    if (resta >= d) { out.push(pts[i]); resta -= d; } else { const q = d ? resta / d : 0; out.push([lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]); break; }
  }
  if (out.length < 2) out.push(pts[0]);
  return out;
}
const aoLongo = (pts, f) => parcial(pts, f).at(-1);
/** Faixa de brilho inclinada que atravessa uma forma (f = 0..1 da esquerda para a direita). */
function faixaDeBrilho(p, pts, [x0, y0, x1, y1], f, cor) {
  if (p.estilo === "traco" || x1 - x0 < 16) return;
  const h = y1 - y0, l = Math.max(14, Math.min(x1 - x0, h) * .4), x = lerp(x0 - h - l, x1, f), cx = v => clamp(v, x0, x1);
  p.recortar(pts, () => p.forma([[cx(x), y1], [cx(x + l), y1], [cx(x + l + h), y0], [cx(x + h), y0]], maisClaro(p, cor, .35), { prof: 0, liso: true }));
}
/** Anel que se abre e some, para marcar um ponto vivo. */
const pulsoAnel = (p, x, y, r0, r1, cor, lw, t, vel = 1.2) => { const f = (t * vel) % 1; p.alfa(1 - f, () => p.linha(circP(x, y, lerp(r0, r1, f), 22), cor, lw, { fechar: true })); };

/* ---------------------------------------------------------------- peças */
/** Barras deitadas que crescem em cascata, com rótulo, porcentagem e um brilho correndo. Opções: larg, valores, rotulos, cores, k (0..1 faz as barras crescerem), t. Chaves: barras horizontais, comparação, pesquisa, preferência, participação, porcentagem, resultado, votação */
export function barrasHorizontais(p, { larg = 400, valores = [.92, .74, .58, .4], rotulos = ["A", "B", "C", "D"], cores = ["c1", "c3", "c2", "c4"], k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = Math.max(1, valores.length), h = w * .16 * n, passo = h / n, bh = passo * .64, x0 = -w * .32, max = w * .68, tam = Math.min(bh * .6, w * .065);
  p.linha([[x0, -h / 2 - passo * .12], [x0, h / 2 + passo * .12]], sobreFundo(p), w * .014);
  valores.forEach((v, i) => {
    const y = -h / 2 + passo * (i + .5), kk = cascata(k, i, n), comp = max * clamp(v, 0, 1.15) * kk * (1 + .02 * Math.sin(tt * 2.4 + i * 1.3)), c = cores[i % cores.length];
    p.texto(rotulos[i] ?? "", x0 - w * .035, y, { tam, cor: sobreFundo(p), alinhar: "right" });
    if (comp < 3) return;
    const pts = retArredP(x0, y - bh / 2, comp, bh, bh * .22);
    p.forma(pts, c, { prof: 1, semente: i + 3 });
    const f = (tt * .5 + i * .17) % 1.5; if (f < 1) faixaDeBrilho(p, pts, [x0, y - bh / 2, x0 + comp, y + bh / 2], f, c);
    p.texto(Math.round(v * 100 * clamp(kk)) + "%", x0 + comp + w * .025, y, { tam, cor: sobreFundo(p), alinhar: "left" });
  });
}

/** Colunas empilhadas em camadas que sobem uma faixa por vez; o topo de cada coluna respira. Opções: larg, alt, valores (lista de colunas, cada uma com as camadas), cores, k (0..1 empilha as camadas), t. Chaves: barras empilhadas, composição, divisão, fatia, distribuição, orçamento, segmentos, camadas */
export function barrasEmpilhadas(p, { larg = 380, alt = 300, valores = [[.3, .2, .12], [.34, .26, .18], [.3, .3, .26], [.42, .32, .24]], cores = ["c1", "c3", "c2"], k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = Math.max(1, valores.length), m = Math.max(1, ...valores.map(c => c.length)), soma = c => c.reduce((s, v) => s + v, 0), maior = Math.max(1e-6, ...valores.map(soma));
  const passo = w * .92 / n, bw = passo * .64, fresta = w * .008;
  p.linha([[-w / 2, 0], [w / 2, 0]], sobreFundo(p), w * .014);
  valores.forEach((col, i) => {
    const x = -w * .46 + passo * (i + .5) - bw / 2; let y = 0;
    col.forEach((v, j) => {
      const kk = cascata(k, j * n + i, n * m, 4), topo = j === col.length - 1, hh = alt * v / maior * kk * (topo ? 1 + .07 * Math.sin(tt * 2.6 + i * 1.4) : 1);
      if (hh < 2) return;
      const c = cores[j % cores.length], pts = topo ? retArredP(x, y - hh, bw, hh - fresta + bw * .12, bw * .12).map(([a, b]) => [a, Math.min(b, y - fresta)]) : retP(x, y - hh, bw, Math.max(1, hh - fresta));
      p.forma(pts, c, { prof: 1, semente: i * 7 + j + 1 });
      if (topo) { const f = (tt * .45 + i * .22) % 1.6; if (f < 1) faixaDeBrilho(p, pts, [x, y - hh, x + bw, y - fresta], f, c); }
      y -= hh;
    });
  });
}

/** Gráfico de área com duas séries que se revelam da esquerda para a direita; a linha ondula e a ponta pulsa. Opções: larg, alt, valores, valores2, cor, cor2, k (0..1 revela a área), t. Chaves: gráfico de área, evolução, crescimento, volume, acumulado, histórico, audiência, tendência */
export function graficoDeArea(p, { larg = 420, alt = 280, valores = [.2, .36, .3, .52, .46, .7, .86], valores2 = [.1, .16, .2, .18, .3, .34, .44], cor = "c3", cor2 = "c1", k = 1, t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), kk = E.entraSai(clamp(k)), n = Math.max(2, valores.length);
  const serie = (vs, fase) => vs.map((v, i) => [-w / 2 + w * i / Math.max(1, vs.length - 1), -h * clamp(v + .035 * Math.sin(tt * 2 + i * 1.3 + fase), 0, 1.02)]);
  const a = serie(valores, 0), b = serie(valores2, 2);
  eixos(p, w, h, w * .014);
  if (kk < .01) return;
  p.recortar(retP(-w / 2, -h * 1.2, w * kk, h * 1.2 + 1), () => {
    p.forma([[-w / 2, 0], ...a, [w / 2, 0]], cor, { prof: 1, semente: 4 });
    p.forma([[-w / 2, 0], ...b, [w / 2, 0]], cor2, { prof: 1, semente: 9 });
  });
  const q = kk * (n - 1), i = Math.min(n - 2, Math.floor(q)), f = q - i, ponta = [lerp(a[i][0], a[i + 1][0], f), lerp(a[i][1], a[i + 1][1], f)], vis = [...a.slice(0, i + 1), ponta];
  p.linha(vis, sobreFundo(p), w * .012);
  vis.slice(0, -1).forEach(([x, y]) => p.circulo(x, y, w * .016, sobreFundo(p), { prof: 0, liso: true }));
  p.circulo(ponta[0], ponta[1], w * .024, "c2", { prof: 1, liso: true });
  pulsoAnel(p, ponta[0], ponta[1], w * .03, w * .08, "c2", w * .012, tt);
}

/** Gráfico de rosca que se fecha em volta, com a fatia principal saltando e a porcentagem no meio. Opções: r, valores, cores, texto, k (0..1 fecha a rosca), t. Chaves: rosca, donut, participação, fatia, proporção, percentual, divisão, mercado */
export function rosca(p, { r = 150, valores = [.45, .3, .25], cores = ["c1", "c3", "c2"], texto = null, k = 1, t = 0 } = {}) {
  const tt = p.ritmo(t), soma = valores.reduce((s, v) => s + v, 0) || 1, kv = clamp(k * 1.15), varre = 360 * E.entraSai(kv), ri = r * .56, folga = 2.5;
  if (varre < 359) p.forma(circP(0, 0, r * .98, 48), apagado(p, .14), { prof: 0, liso: true, furos: [circP(0, 0, ri * 1.02, 36).reverse()] });
  let a = -90;
  p.em({ x: 0, y: 0, r: Math.sin(tt * .9) * .05 }, () => valores.forEach((v, i) => {
    const vao = 360 * v / soma, a0 = a + folga / 2, a1 = Math.min(a + vao, -90 + varre) - folga / 2; a += vao;
    if (a1 - a0 < .5) return;
    const md = (a0 + a1) / 2 * Math.PI / 180, d = i === 0 ? r * .07 * (.5 + .5 * Math.sin(tt * 3)) : 0;
    p.em({ x: Math.cos(md) * d, y: Math.sin(md) * d }, () => p.forma([...arcoP(0, 0, r, a0, a1), ...arcoP(0, 0, ri, a1, a0)], cores[i % cores.length], { prof: i === 0 ? 2 : 1, semente: i + 5 }));
  }));
  p.texto(texto ?? Math.round(valores[0] / soma * 100 * kv) + "%", 0, r * .03, { tam: r * .38, cor: sobreFundo(p) });
}

/** Velocímetro com faixas de cor e o ponteiro que sobe até o valor e treme lá no alto. Opções: larg, k (0..1 posição do ponteiro), cor (do mostrador), zonas, t. Chaves: velocímetro, medidor, desempenho, nível, intensidade, risco, velocidade, potência, pressão */
export function velocimetro(p, { larg = 360, k = .72, cor = "tinta", zonas = ["c3", "c4", "c1"], t = 0 } = {}) {
  const w = larg, R = w / 2, tt = p.ritmo(t), cy = -R * .36, v = clamp(clamp(k) + ruido(tt * 3, 4) * .025 + (k > .8 ? Math.sin(tt * 31) * .012 : 0)), nz = Math.max(1, zonas.length);
  p.forma([...arcoP(0, cy, R, 180, 360, 30), [R, 0], [-R, 0]], cor, { prof: 2 });
  zonas.forEach((c, i) => { const a0 = 180 + 180 * i / nz + (i ? 1.5 : 4), a1 = 180 + 180 * (i + 1) / nz - (i < nz - 1 ? 1.5 : 4); p.forma([...arcoP(0, cy, R * .88, a0, a1), ...arcoP(0, cy, R * .7, a1, a0)], c, { prof: 0, liso: true, semente: i + 2 }); });
  for (let i = 0; i <= 10; i++) { const a = (180 + i * 18) * Math.PI / 180, r0 = R * (i % 5 ? .58 : .52); p.linha([[Math.cos(a) * r0, cy + Math.sin(a) * r0], [Math.cos(a) * R * .64, cy + Math.sin(a) * R * .64]], sobreTinta(p), R * (i % 5 ? .025 : .04)); }
  p.em({ x: 0, y: cy, r: (180 + 180 * v) * Math.PI / 180 }, () => p.forma([[R * .8, 0], [0, -R * .06], [-R * .15, 0], [0, R * .06]], "c2", { prof: 1, liso: true }));
  p.circulo(0, cy, R * .1, "c2", { prof: 1, liso: true });
  p.circulo(0, cy, R * .04, cor, { prof: 0, liso: true });
  p.texto(Math.round(v * 100), 0, -R * .12, { tam: R * .17, cor: "c2" });
}

/** Número grande que conta até o valor, com sublinhado enchendo e brilhos quando chega lá. Opções: valor, prefixo, sufixo, casas, tam, cor, k (0..1 conta do zero até o valor), t. Chaves: contador, número, total, quantidade, recorde, seguidores, visualizações, faturamento, estatística */
export function contador(p, { valor = 1250, prefixo = "", sufixo = "", casas = 0, tam = 120, cor = "c1", k = 1, t = 0 } = {}) {
  const tt = p.ritmo(t), kk = E.sai(clamp(k)), atual = valor * kk, s = prefixo + numero(casas ? atual : Math.round(atual), casas) + sufixo;
  const L = Math.max(tam * 1.4, p.medir(prefixo + numero(valor, casas) + sufixo, { tam, peso: 900 })), pronto = clamp((clamp(k) - .85) * 7), y = tam * .66, e = tam * .14;
  p.em({ x: 0, y: -tam * .08, s: 1 + .035 * Math.sin(tt * 3) + .08 * Math.sin(Math.PI * pronto) }, () => p.texto(s, 0, 0, { tam, cor, peso: 900 }));
  p.capsula([-L / 2, y], [L / 2, y], e, apagado(p, .2));
  if (kk > .02) {
    const xf = -L / 2 + L * kk; p.capsula([-L / 2, y], [xf, y], e, cor);
    if (p.estilo !== "traco" && kk > .3) { const g = (tt * .7) % 1, xg = -L / 2 + e * .5 + (xf + L / 2 - e) * g; p.circulo(xg, y, e * .32, maisClaro(p, cor, .55), { prof: 0, liso: true }); }
  }
  [[-L / 2 - tam * .28, -tam * .48], [L / 2 + tam * .22, -tam * .58], [L / 2 + tam * .32, tam * .1]].forEach(([x, yy], i) => {
    const f = (tt * .9 + i * .33) % 1, sc = Math.sin(f * Math.PI) * pronto;
    if (sc > .02) p.em({ x, y: yy, s: sc, r: f * 1.5 }, () => p.forma(estrelaP(0, 0, tam * .2, tam * .07, 4), "c2", { prof: 0, liso: true }));
  });
}

/** Tabela com cabeçalho colorido e linhas que entram uma a uma; uma faixa de destaque desce pelas linhas. Opções: larg, dados (lista de linhas; a primeira é o cabeçalho), cor, k (0..1 faz as linhas entrarem), t. Chaves: tabela, planilha, dados, preços, lista, relatório, comparação de planos, valores */
export function tabela(p, { larg = 400, dados = [["Plano", "Mês", "Ano"], ["Básico", "29", "290"], ["Pro", "59", "590"], ["Max", "99", "990"]], cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), nl = Math.max(1, dados.length), nc = Math.max(1, ...dados.map(l => l.length)), lh = w * .15, h = lh * nl, x0 = -w / 2, y0 = -h / 2, cw = w / nc, tam = lh * .4, cartao = retArredP(x0, y0, w, h, w * .04);
  p.em({ x: 0, y: Math.sin(tt * 1.4) * w * .012, r: Math.sin(tt * .9) * .012 }, () => {
    p.forma(cartao, "claro", { prof: 2 });
    p.recortar(cartao, () => {
      p.forma(retP(x0, y0, w, lh), cor, { prof: 0, liso: true });
      for (let i = 2; i < nl; i += 2) p.forma(retP(x0, y0 + lh * i, w, lh), mistura(p, "claro", cor, .14), { prof: 0, liso: true });
      if (nl > 2) {
        const pos = (tt * .7) % (nl - 1), i = Math.floor(pos), f = E.entraSai(clamp((pos - i - .6) / .4)), lin = 1 + lerp(i, (i + 1) % (nl - 1), f);
        p.alfa(clamp(k * 3 - 1.5), () => p.forma(retP(x0, y0 + lh * lin, w, lh), mistura(p, "claro", "c2", .42), { prof: 0, liso: true }));
      }
    });
    for (let j = 1; j < nc; j++) p.linha([[x0 + cw * j, y0 + lh * 1.15], [x0 + cw * j, y0 + h - lh * .15]], mistura(p, "claro", "tinta", .22), w * .008);
    dados.forEach((linha, i) => {
      const ki = cascata(k, i, nl);
      if (ki > .01) p.alfa(clamp(ki * 2), () => p.em({ x: (1 - clamp(ki)) * w * .06, y: 0 }, () => linha.forEach((s, j) => p.texto(s, j ? x0 + cw * (j + .5) : x0 + cw * .14, y0 + lh * (i + .5), { tam, cor: "tinta", peso: i ? 600 : 800, alinhar: j ? "center" : "left" }))));
    });
  });
}

/** Linha do tempo que avança como uma seta, com marcos que surgem e etiquetas de data; o marco atual pulsa. Opções: larg, rotulos, cores, k (0..1 avança a linha), t. Chaves: linha do tempo, história, cronologia, etapas, marcos, trajetória, evolução, cronograma, prazo */
export function linhaDoTempo(p, { larg = 420, rotulos = ["2020", "2022", "2024", "2026"], cores = ["c1", "c3", "c2", "c4"], k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = Math.max(1, rotulos.length), lw = w * .022, x0 = -w * .46, x1 = w * .46 - lw * 2.6, kk = E.sai(clamp(k)), tam = w * .046;
  p.capsula([x0, 0], [x1, 0], lw, apagado(p, .2));
  if (kk > .03) p.seta([[x0, 0], [lerp(x0, x1, kk), 0]], sobreFundo(p), lw);
  let atual = -1;
  rotulos.forEach((s, i) => {
    const xi = lerp(x0, x1, (i + .5) / n), ki = mola(clamp((kk - (i + .5) / n) * n * 1.5 + .4), { freq: 1.4, amort: 5 }), c = cores[i % cores.length], dir = i % 2 ? 1 : -1;
    if (ki <= .01) return; if (ki >= .6) atual = i;
    const cw = Math.max(w * .19, p.medir(s, { tam }) + tam * 1.2), ch = w * .095, cy = dir * w * .17 + Math.sin(tt * 2 + i * 1.7) * w * .012 + (1 - ki) * dir * w * .05;
    p.alfa(clamp(ki * 2), () => {
      p.linha([[xi, dir * w * .045], [xi, cy - dir * ch / 2]], sobreFundo(p), w * .011);
      p.forma(retArredP(xi - cw / 2, cy - ch / 2, cw, ch, ch * .28), c, { prof: 1, semente: i + 2 });
      p.texto(s, xi, cy, { tam, cor: "tinta" });
    });
    p.em({ x: xi, y: 0, s: ki }, () => { p.circulo(0, 0, w * .042, c, { prof: 1, liso: true }); p.circulo(0, 0, w * .017, "claro", { prof: 0, liso: true }); });
  });
  if (atual >= 0) pulsoAnel(p, lerp(x0, x1, (atual + .5) / n), 0, w * .05, w * .1, cores[atual % cores.length], w * .012, tt, 1.1);
}

/** Fluxograma de decisão: início, losango de pergunta e dois caminhos; uma ficha percorre o fluxo. Opções: larg, rotulos (início, pergunta, sim, não), cores, k (0..1 monta o fluxo), t. Chaves: fluxograma, processo, decisão, etapas, caminho, algoritmo, se então, passo a passo, sistema */
export function fluxograma(p, { larg = 400, rotulos = ["Início", "?", "Sim", "Não"], cores = ["c3", "c2", "c1", "c4"], k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), lw = w * .018, tam = w * .05, f = i => cascata(k, i, 5, 2), pc = lw * 2.6;
  const yI = -w * .36, yD = -w * .04, yC = w * .3, xC = w * .3, dx = w * .15, dy = w * .11, bw = w * .3, bh = w * .13;
  const s1 = [[0, yI + w * .065], [0, yD - dy - pc]], lado = sx => [[sx * dx, yD], [sx * xC, yD], [sx * xC, yC - bh / 2 - pc]];
  const no = (i, x, y, fn) => { const kk = f(i); if (kk > .01) p.em({ x, y, s: kk }, fn); }, vis = clamp(f(4) * 3 - 2);
  // a ficha passa por baixo dos nós: some dentro deles e reaparece nas setas
  if (vis > 0) { const c = (tt * .45) % 2, sx = c < 1 ? -1 : 1, pt = aoLongo([[0, yI], [0, yD], [sx * xC, yD], [sx * xC, yC]], E.entraSai(c % 1)); p.alfa(vis, () => p.circulo(pt[0], pt[1], w * .034, sobreFundo(p), { prof: 1, liso: true })); }
  no(0, 0, yI, () => { p.forma(retArredP(-w * .17, -w * .065, w * .34, w * .13, w * .065), cores[0], { prof: 2 }); p.texto(rotulos[0] ?? "", 0, 0, { tam, cor: "tinta" }); });
  if (f(1) > .05) p.seta(parcial(s1, clamp(f(1))), sobreFundo(p), lw);
  no(2, 0, yD, () => p.em({ x: 0, y: 0, s: 1 + .04 * Math.sin(tt * 4) }, () => { p.forma([[0, -dy], [dx, 0], [0, dy], [-dx, 0]], cores[1], { prof: 2 }); p.texto(rotulos[1] ?? "", 0, 0, { tam: tam * 1.2, cor: "tinta" }); }));
  if (f(3) > .05) for (const sx of [-1, 1]) p.seta(parcial(lado(sx), clamp(f(3))), sobreFundo(p), lw);
  [-1, 1].forEach((sx, j) => no(4, sx * xC, yC, () => { p.forma(retArredP(-bw / 2, -bh / 2, bw, bh, bh * .2), cores[2 + j], { prof: 2, semente: j + 3 }); p.texto(rotulos[2 + j] ?? "", 0, 0, { tam, cor: "tinta" }); }));
}

/** Mapa de calor em grade: as células acendem em diagonal e um ponto quente passeia pela grade. Opções: larg, linhas, colunas, cor, k (0..1 acende as células), t. Chaves: mapa de calor, intensidade, frequência, concentração, horários, atividade, dados, padrão */
export function mapaDeCalor(p, { larg = 380, linhas = 5, colunas = 7, cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), nl = Math.max(1, linhas), nc = Math.max(1, colunas), cel = w / nc, h = cel * nl, x0 = -w / 2, y0 = -h / 2, lado = cel * .84, base = semear(nl * nc, 31), frio = apagado(p, .12);
  const hx = (nc - 1) * (.5 + .4 * Math.sin(tt * .6)), hy = (nl - 1) * (.5 + .42 * Math.sin(tt * .9 + 1));
  for (let i = 0; i < nl; i++) for (let j = 0; j < nc; j++) {
    const kk = cascata(k, i + j, nl + nc - 1, 4); if (kk <= .01) continue;
    const v = clamp(.06 + base[i * nc + j].u * .42 + .66 * Math.exp(-((j - hx) ** 2 + (i - hy) ** 2) / 3.2));
    p.em({ x: x0 + cel * (j + .5), y: y0 + cel * (i + .5), s: kk }, () => p.forma(retArredP(-lado / 2, -lado / 2, lado, lado, lado * .18), mistura(p, frio, cor, v), { prof: 0, liso: true }));
  }
}

/** Gráfico de dispersão: pontos surgem um a um, tremem de leve e uma linha de tendência tracejada corre por eles. Opções: larg, alt, n, cor, cor2, k (0..1 faz os pontos surgirem), t. Chaves: dispersão, correlação, pontos, amostra, pesquisa, relação, análise, padrão */
export function dispersao(p, { larg = 380, alt = 300, n = 16, cor = "c1", cor2 = "c2", k = 1, t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), r = w * .028, reta = x => .1 + .72 * x;
  const pts = semear(Math.max(1, n), 23).map(s => { const x = .07 + .86 * s.u; return { x, y: clamp(reta(x) + (s.v - .5) * .34, .06, .95), q: s.w, i: s.i }; }).sort((a, b) => a.x - b.x);
  eixos(p, w, h, w * .014);
  const kl = clamp(k * 1.5 - .5);
  if (kl > .02) p.linha(parcial([[-w / 2 + w * .04, -h * reta(.04)], [-w / 2 + w * .96, -h * reta(.96)]], kl), cor2, w * .016, { tracejado: [w * .045, w * .03], desloc: tt * 40 });
  pts.forEach((d, i) => {
    const kk = cascata(clamp(k * 1.25), i, pts.length, 5); if (kk <= .01) return;
    p.circulo(-w / 2 + w * d.x + ruido(tt * .9, d.i) * w * .012, -h * d.y + ruido(tt * .9, d.i + 50) * h * .018, r * kk, d.q > .8 ? "c3" : cor, { prof: 1, liso: true });
  });
}

/** Gráfico de radar (teia) em que o polígono dos dados cresce do centro e respira. Opções: r, valores, rotulos, cor, k (0..1 abre o polígono), t. Chaves: radar, teia, habilidades, perfil, competências, avaliação, atributos, equilíbrio */
export function graficoRadar(p, { r = 160, valores = [.85, .6, .9, .5, .75, .65], rotulos = [], cor = "c1", k = 1, t = 0 } = {}) {
  const n = Math.max(3, valores.length), tt = p.ritmo(t), P = (i, q) => { const a = -Math.PI / 2 + i * TAU / n; return [Math.cos(a) * q, Math.sin(a) * q]; }, lw = r * .018;
  p.alfa(meio(p, .45), () => { for (const q of [.34, .67, 1]) p.linha(Array.from({ length: n }, (_, i) => P(i, r * q)), sobreFundo(p), lw, { fechar: true }); for (let i = 0; i < n; i++) p.linha([[0, 0], P(i, r)], sobreFundo(p), lw); });
  const kk = mola(clamp(k), { freq: 1.2, amort: 5 });
  if (kk > .03) {
    const dados = Array.from({ length: n }, (_, i) => P(i, r * clamp(valores[i] ?? .5, .05, 1.1) * kk * (1 + .05 * Math.sin(tt * 2.2 + i * 1.7))));
    p.alfa(meio(p, .62), () => p.forma(dados, cor, { prof: 1, liso: true }));
    p.linha(dados, cor, r * .03, { fechar: true });
    dados.forEach(([x, y]) => p.circulo(x, y, r * .045, "c2", { prof: 0, liso: true }));
  }
  rotulos.forEach((s, i) => { const [x, y] = P(i, r * 1.2); p.texto(s, x, y, { tam: r * .12, cor: sobreFundo(p), peso: 700 }); });
}

/** Pirâmide de níveis em camadas que caem e se empilham de baixo para cima; o topo flutua com um brilho. Opções: larg, rotulos (de baixo para cima), cores, k (0..1 empilha os níveis), t. Chaves: pirâmide, níveis, hierarquia, etapas, base, topo, prioridade, maslow, funil invertido */
export function piramideDeNiveis(p, { larg = 380, rotulos = ["Base", "Prática", "Domínio", "Topo"], cores = ["c4", "c3", "c1", "c2"], k = 1, t = 0 } = {}) {
  const w = larg, h = w * .86, n = Math.max(1, rotulos.length), tt = p.ritmo(t), fresta = h * .028, lh = (h - fresta * (n - 1)) / n, meia = y => w / 2 * (1 + y / h);
  for (let i = 0; i < n; i++) {
    const yb = -i * (lh + fresta), yt = yb - lh, kk = cascata(k, i, n), topo = i === n - 1;
    if (kk <= .01) continue;
    const dy = -(1 - kk) * h * .35 - (topo ? Math.abs(Math.sin(tt * 2.4)) * h * .035 : 0), yTx = topo && n > 1 ? yb - lh * .28 : (yb + yt) / 2, t0 = lh * .3, tam = Math.min(t0, t0 * meia(yTx - t0 * .4) * 1.6 / Math.max(1, p.medir(rotulos[i], { tam: t0 })));
    p.alfa(clamp(kk * 3), () => p.em({ x: 0, y: dy }, () => {
      p.forma([[-meia(yb), yb], [meia(yb), yb], [meia(yt), yt], [-meia(yt), yt]], cores[i % cores.length], { prof: 2, semente: i + 2 });
      p.texto(rotulos[i], 0, yTx, { tam, cor: "tinta" });
    }));
  }
  const f = (tt * .8) % 1, sc = Math.sin(f * Math.PI) * clamp(k * 4 - 3);
  if (sc > .02) p.em({ x: w * .1, y: -h * 1.02, s: sc, r: f * 2 }, () => p.forma(estrelaP(0, 0, w * .055, w * .018, 4), sobreFundo(p), { prof: 0, liso: true }));
}

/** Duas colunas lado a lado, A contra B, com rótulos na base, porcentagens e o selo VS; a vencedora brilha. Opções: alt, a, b (valores 0..1), rotuloA, rotuloB, textoA, textoB, corA, corB, k (0..1 faz as colunas subirem), t. Chaves: comparativo, antes e depois, versus, comparação, diferença, concorrência, escolha, melhor */
export function comparativo(p, { alt = 320, a = .45, b = .85, rotuloA = "Antes", rotuloB = "Depois", textoA = null, textoB = null, corA = "c1", corB = "c3", k = 1, t = 0 } = {}) {
  const h = alt, w = h * 1.05, tt = p.ritmo(t), bh = h * .14, cw = w * .3, maxH = h - bh - h * .17, ganha = b >= a ? 1 : 0;
  [[a, -w * .22, corA, textoA], [b, w * .22, corB, textoB]].forEach(([v, x, c, tx], i) => {
    const kk = cascata(k, i, 2, 2), hh = maxH * clamp(v) * kk * (1 + (i === ganha ? .02 * Math.sin(tt * 3) : .008 * Math.sin(tt * 2))), rr = cw * .14;
    if (hh > 1) {
      const pts = retArredP(x - cw / 2, -bh - hh, cw, hh + rr, rr);
      p.forma(pts, c, { prof: 2, semente: i + 1 });
      if (i === ganha) { const f = (tt * .5) % 1.4; if (f < 1) faixaDeBrilho(p, pts, [x - cw / 2, -bh - hh, x + cw / 2, -bh + rr], f, c); }
    }
    p.texto(tx ?? Math.round(v * 100 * clamp(kk)) + "%", x, -bh - hh - h * .065 - (i === ganha ? Math.abs(Math.sin(tt * 3)) * h * .025 : 0), { tam: h * .1, cor: sobreFundo(p) });
  });
  p.forma(retArredP(-w / 2, -bh, w, bh, bh * .22), "claro", { prof: 2 });
  p.texto(rotuloA, -w * .22, -bh / 2, { tam: bh * .4, cor: "tinta" });
  p.texto(rotuloB, w * .22, -bh / 2, { tam: bh * .4, cor: "tinta" });
  p.em({ x: 0, y: -bh - maxH * .3, r: Math.sin(tt * 2) * .14, s: clamp(k * 2) }, () => { p.circulo(0, 0, h * .068, "tinta", { prof: 1, liso: true }); p.texto("VS", 0, h * .004, { tam: h * .056, cor: sobreTinta(p) }); });
}

/** Ranking com medalhas: as linhas entram da direita e, de tempos em tempos, o terceiro ultrapassa o segundo. Opções: larg, itens, valores, cor, k (0..1 faz as linhas entrarem), t. Chaves: ranking, classificação, placar, líderes, top, posição, competição, primeiro lugar, disputa */
export function ranking(p, { larg = 360, itens = ["Ana", "Beto", "Caio", "Duda"], valores = [.95, .82, .7, .52], cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), n = Math.max(1, itens.length), lh = w * .2, y0 = -lh * n / 2, rb = lh * .36, xb = -w / 2 + rb, medalhas = ["c2", "c4", "c3"];
  const fase = tt % 5, troca = n > 2 ? E.entraSai(clamp((fase - 1.2) / .7)) - E.entraSai(clamp((fase - 3.6) / .7)) : 0, yDe = i => y0 + lh * (i + .5);
  // na troca, quem sobe passa na frente (deslocado para a direita, maior, com moldura e fundo opaco) e quem desce passa atrás, apagado
  const arco = n > 2 ? Math.sin(Math.PI * clamp(troca)) : 0, sobe = fase < 2.4 ? 2 : 1, desce = 3 - sobe;
  const cartao = (g = 0) => retArredP(xb - g, -lh * .36 - g, w / 2 - xb + g * 2, lh * .72 + g * 2, lh * .36 + g);
  const linha = i => {
    const kk = cascata(k, i, n); if (kk <= .01) return;
    const troc = i === 1 || i === 2, y = i === 1 ? lerp(yDe(1), yDe(2), troca) : i === 2 ? lerp(yDe(2), yDe(1), troca) : yDe(i);
    const frente = troc && arco > .02 && i === sobe, atras = troc && arco > .02 && i === desce;
    const pos = troc && troca > .5 ? 3 - i : i, s = frente ? 1 + .06 * arco : atras ? 1 - .04 * arco : 1;
    const dx = frente ? w * .08 * arco : atras ? -w * .03 * arco : 0;
    p.alfa(clamp(kk * 2) * (atras ? 1 - .45 * arco : 1), () => p.em({ x: (1 - kk) * w * .4 + dx, y, s }, () => {
      if (frente) {
        p.forma(cartao(lh * .07), cor, { prof: 2, liso: true });
        for (let j = 0; j < (p.estilo === "vidro" ? 4 : 1); j++) p.forma(cartao(), "fundo", { prof: 0, liso: true });
      }
      p.forma(cartao(), atras && p.estilo === "pixel" ? apagado(p, .3) : "claro", { prof: frente ? 0 : 1, semente: i + 4 });
      p.texto(itens[i], xb + rb * 1.7, 0, { tam: lh * .32, cor: atras && p.estilo === "pixel" ? sobreFundo(p) : "tinta", alinhar: "left" });
      p.capsula([w * .03, 0], [w * .03 + w * .41 * clamp(valores[i] ?? .5), 0], lh * .24, cor);
      if (frente || atras) { const sg = frente ? -1 : 1, ax = -w * .045, d = lh * .19; p.forma([[ax, sg * d], [ax + d, -sg * d * .7], [ax - d, -sg * d * .7]], frente ? "c3" : "c1", { prof: 0, liso: true }); }
      p.em({ x: xb, y: 0, s: kk * (pos === 0 ? 1 + .07 * Math.sin(tt * 4) : 1) }, () => { p.circulo(0, 0, rb, medalhas[pos] ?? apagado(p, .35), { prof: 1, liso: true, semente: i + 9 }); p.texto(pos + 1, 0, rb * .06, { tam: rb * 1.05, cor: "tinta" }); });
    }));
  };
  for (let i = 0; i < n; i++) if (n <= 2 || (i !== 1 && i !== 2)) linha(i);
  if (n > 2) { linha(desce); linha(sobe); }
}

/** Anel de porcentagem que enche até o valor, com a ponta pulsando e um brilho correndo pelo arco. Opções: r, k (0..1 quanto do anel está cheio), cor, rotulo, t. Chaves: porcentagem, progresso, meta, taxa, conclusão, aproveitamento, índice, objetivo */
export function anelDePorcentagem(p, { r = 140, k = .72, cor = "c3", rotulo = "", t = 0 } = {}) {
  const tt = p.ritmo(t), kk = clamp(k), e = r * .24, rm = r - e / 2;
  p.forma(circP(0, 0, r, 48), apagado(p, .16), { prof: 1, furos: [circP(0, 0, r - e, 40).reverse()] });
  if (kk > .004) {
    const a0 = -90, a1 = -90 + 360 * Math.min(kk, .995), rad = a => a * Math.PI / 180, c0 = [Math.cos(rad(a0)) * rm, Math.sin(rad(a0)) * rm], c1 = [Math.cos(rad(a1)) * rm, Math.sin(rad(a1)) * rm];
    p.forma([...arcoP(0, 0, r, a0, a1), ...arcoP(c1[0], c1[1], e / 2, a1, a1 + 180, 6), ...arcoP(0, 0, r - e, a1, a0), ...arcoP(c0[0], c0[1], e / 2, a0 + 180, a0 + 360, 6)], cor, { prof: 1, liso: true });
    const f = (tt * .55) % 1.3; if (f < 1 && p.estilo !== "traco") { const bb = a0 + (a1 - a0) * f; p.linha(arcoP(0, 0, rm, Math.max(a0, bb - 28), bb, 5), maisClaro(p, cor, .45), e * .34); }
    pulsoAnel(p, c1[0], c1[1], e * .5, e * 1.05, cor, r * .025, tt);
  }
  p.texto(Math.round(kk * 100) + "%", 0, rotulo ? -r * .08 : r * .02, { tam: r * .42, cor: sobreFundo(p) });
  if (rotulo) p.texto(rotulo, 0, r * .27, { tam: r * .14, cor: sobreFundo(p), peso: 600 });
}

/** Folha de calendário que balança: os dias vão sendo marcados até o dia destacado, que ganha um círculo pulsando. Opções: larg, dia, mes, cor, k (0..1 marca os dias até o dia destacado), t. Chaves: calendário, prazo, data, agenda, dia, contagem regressiva, compromisso, vencimento, mês */
export function calendario(p, { larg = 320, dia = 18, mes = "JUNHO", cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, h = w * 1.02, tt = p.ritmo(t), x0 = -w / 2, y0 = -h / 2, hh = h * .23, pag = retArredP(x0, y0, w, h, w * .06), inicio = 3, dias = 30, cel = w * .86 / 7, gx = x0 + w * .07, gy = y0 + hh + h * .055, alvo = clamp(Math.round(dia), 1, dias), kd = clamp(k * 1.18) * (alvo - 1), lado = cel * .62;
  const pos = d => { const q = d - 1 + inicio; return [gx + cel * (q % 7 + .5), gy + cel * (Math.floor(q / 7) + .5)]; }, cinza = mistura(p, "claro", "tinta", .16);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.2) * .025 }, () => {
    p.forma(pag, "claro", { prof: 2 });
    p.recortar(pag, () => p.forma(retP(x0, y0, w, hh), cor, { prof: 0, liso: true }));
    p.texto(mes, 0, y0 + hh * .56, { tam: hh * .4, cor: "tinta" });
    for (const x of [-w * .25, w * .25]) p.capsula([x, y0 - w * .05], [x, y0 + w * .06], w * .05, sobreFundo(p));
    for (let d = 1; d <= dias; d++) {
      if (d === alvo) continue;
      const [x, y] = pos(d), fresco = d < alvo ? clamp(kd - d + 1) : 0;
      if (fresco < 1) p.forma(retArredP(x - lado / 2, y - lado / 2, lado, lado, lado * .25), cinza, { prof: 0, liso: true });
      if (fresco > 0) { const s = mola(fresco, { freq: 1.6, amort: 5 }); p.em({ x, y, s }, () => p.forma(retArredP(-lado / 2, -lado / 2, lado, lado, lado * .25), cor, { prof: 0, liso: true })); }
    }
    const [ax, ay] = pos(alvo), kr = clamp(k * 4 - 3);
    p.em({ x: ax, y: ay, s: 1 + .08 * Math.sin(tt * 4) }, () => { p.circulo(0, 0, cel * .5, "c2", { prof: 1, liso: true }); p.texto(alvo, 0, cel * .03, { tam: cel * .48, cor: "tinta" }); });
    if (kr > .02) p.linha(arcoP(ax, ay, cel * .64, -90, -90 + 360 * kr), cor, w * .018);
  });
}

/** Mapa dobrado com terrenos, rota tracejada correndo e pinos que caem e quicam em sequência. Opções: larg, pinos (posições de -0.5 a 0.5), cor, k (0..1 faz os pinos caírem e a rota se traçar), t. Chaves: mapa, localização, rota, endereço, destino, viagem, lojas, cobertura, onde */
export function mapaComPinos(p, { larg = 400, pinos = [[-.3, .14], [.02, -.06], [.3, .16]], cor = "c1", k = 1, t = 0 } = {}) {
  const w = larg, h = w * .6, tt = p.ritmo(t), np = 4, pw = w / np, dob = h * .07, d = i => (i % 2 ? dob : 0) - dob / 2, pr = w * .052, n = pinos.length;
  const cima = Array.from({ length: np + 1 }, (_, i) => [-w / 2 + i * pw, -h / 2 + d(i)]), baixo = cima.map(([x, y]) => [x, y + h]), contorno = [...cima, ...baixo.slice().reverse()];
  const mancha = (cx, cy, r, s) => Array.from({ length: 16 }, (_, i) => { const a = i / 16 * TAU, q = r * (1 + .22 * Math.sin(a * 3 + s) + .1 * Math.cos(a * 5 + s * 2)); return [cx + Math.cos(a) * q * 1.35, cy + Math.sin(a) * q]; });
  for (let i = 0; i < np; i++) p.forma([cima[i], cima[i + 1], baixo[i + 1], baixo[i]], i % 2 ? mistura(p, "claro", "tinta", .1) : "claro", { prof: 1, semente: i + 1 });
  p.recortar(contorno, () => {
    p.forma(mancha(-w * .26, -h * .2, h * .22, 1), "c3", { prof: 0, semente: 21 });
    p.forma(mancha(w * .26, h * .22, h * .2, 4), "c3", { prof: 0, semente: 22 });
    p.linha([[-w * .5, h * .02], [-w * .12, h * .1], [w * .12, -h * .12], [w * .5, -h * .04]], mistura(p, "claro", "tinta", .25), w * .02);
    if (p.estilo === "flat" || p.estilo === "papel" || p.estilo === "vidro") for (let i = 1; i < np; i += 2) p.alfa(.1, () => p.forma([cima[i], cima[i + 1], baixo[i + 1], baixo[i]], "tinta", { prof: 0, liso: true }));
  });
  const xy = pinos.map(([u, v]) => [u * w, v * h]), rota = [];
  xy.forEach((a, i) => { rota.push(a); const b = xy[i + 1]; if (b) rota.push([(a[0] + b[0]) / 2 - (b[1] - a[1]) * .3, (a[1] + b[1]) / 2 + (b[0] - a[0]) * .3]); });
  const kr = clamp(k * 1.3 - .3);
  if (rota.length > 1 && kr > .02) p.linha(parcial(rota, kr), "tinta", w * .014, { tracejado: [w * .035, w * .025], desloc: tt * 25 });
  xy.forEach(([x, y], i) => {
    const ki = cascata(k, i, n, 2); if (ki <= .01) return;
    const pulo = Math.max(0, Math.sin(tt * 3 - i * 1.3)) ** 2 * w * .035, c = i === n - 1 ? "c2" : cor;
    if (p.estilo !== "pixel" && p.estilo !== "traco") p.alfa(.22 * clamp(ki), () => p.elipse(x, y, pr * .7, pr * .22, "tinta", { prof: 0, liso: true }));
    p.alfa(clamp(ki * 3), () => p.em({ x, y: y - pulo - (1 - ki) * h * .4 }, () => { p.forma([...arcoP(0, -pr * 2.2, pr, 150, 390, 12), [0, 0]], c, { prof: 2, semente: i + 30 }); p.circulo(0, -pr * 2.2, pr * .42, "claro", { prof: 0, liso: true }); }));
  });
}

/** Diagrama de Venn: os círculos deslizam até se sobrepor e o miolo em comum pulsa com um brilho. Opções: r, n (2 ou 3 círculos), cores, rotulos, k (0..1 junta os círculos), t. Chaves: diagrama de venn, interseção, em comum, sobreposição, conjunto, combinação, ponto de encontro, equilíbrio */
export function diagramaDeVenn(p, { r = 110, n = 3, cores = ["c1", "c3", "c2"], rotulos = ["A", "B", "C"], k = 1, t = 0 } = {}) {
  const tt = p.ritmo(t), kk = mola(clamp(k), { freq: 1.1, amort: 5 }), m = n >= 3 ? 3 : 2, d = r * (m === 3 ? .6 : .56) * (1 + .05 * Math.sin(tt * 1.8)) * (1 + 1.3 * (1 - kk));
  const cs = (m === 3 ? [-150, -30, 90] : [180, 0]).map(a => [Math.cos(a * Math.PI / 180) * d, Math.sin(a * Math.PI / 180) * d]);
  p.alfa(clamp(k * 3), () => {
    cs.forEach(([x, y], i) => p.alfa(meio(p, .62), () => p.circulo(x, y, r, cores[i % cores.length], { prof: 1, semente: i + 3 })));
    if (p.estilo !== "traco") cs.forEach(([x, y], i) => p.linha(circP(x, y, r, 40), p.estilo === "pixel" ? sobreFundo(p) : cores[i % cores.length], r * .035, { fechar: true }));
    if (kk > .55) {
      let fn = () => p.circulo(0, 0, r * .8, "c4", { prof: 0, liso: true });
      for (const [x, y] of cs.slice(1)) { const antes = fn; fn = () => p.recortar(circP(x, y, r, 40), antes); }
      p.alfa(clamp((kk - .55) * 4) * meio(p, .8 + .2 * Math.sin(tt * 3)), () => p.recortar(circP(cs[0][0], cs[0][1], r, 40), fn));
      const f = (tt * .9) % 1; p.em({ x: 0, y: m === 3 ? 0 : 0, s: .5 + .5 * Math.sin(f * Math.PI), r: f * 1.6 }, () => p.forma(estrelaP(0, 0, r * .16, r * .05, 4), "tinta", { prof: 0, liso: true }));
    }
    cs.forEach(([x, y], i) => { const L = Math.hypot(x, y) || 1; p.texto(rotulos[i] ?? "", x + x / L * r * .45, y + y / L * r * .45, { tam: r * .3, cor: "tinta" }); });
  });
}

/** Quadro kanban de três colunas: os cartões aparecem e um deles viaja de "a fazer" até "feito". Opções: larg, titulos, cores, k (0..1 monta as colunas), t. Chaves: kanban, tarefas, organização, fluxo de trabalho, produtividade, projeto, gestão, andamento, equipe */
export function kanban(p, { larg = 400, titulos = ["A fazer", "Fazendo", "Feito"], cores = ["c1", "c4", "c3"], k = 1, t = 0 } = {}) {
  const w = larg, h = w * .74, tt = p.ritmo(t), nc = 3, g = w * .025, cw = (w - g * (nc - 1)) / nc, y0 = -h / 2, pad = cw * .08, hh = h * .13, ch = h * .17, cartW = cw - pad * 2, painel = apagado(p, .1);
  const colX = i => -w / 2 + i * (cw + g), vaga = (i, j) => [colX(i) + pad + cartW / 2, y0 + pad + hh + pad + j * (ch + pad) + ch / 2];
  const cartao = (x, y, c, { s = 1, r = 0, prof = 1 } = {}) => p.em({ x, y, s, r }, () => {
    p.forma(retArredP(-cartW / 2, -ch / 2, cartW, ch, ch * .18), "claro", { prof, liso: true });
    p.capsula([-cartW * .34, -ch * .17], [-cartW * .02, -ch * .17], ch * .16, c);
    p.linha([[-cartW * .34, ch * .18], [cartW * .3, ch * .18]], mistura(p, "claro", "tinta", .45), ch * .1);
  });
  const fixos = [2, 1, 2];
  for (let i = 0; i < nc; i++) {
    const ki = cascata(k, i, nc); if (ki <= .01) continue;
    p.alfa(clamp(ki * 2), () => p.em({ x: 0, y: (1 - ki) * h * .12 }, () => {
      p.forma(retArredP(colX(i), y0, cw, h, cw * .08), painel, { prof: 1, semente: i + 1 });
      p.forma(retArredP(colX(i) + pad, y0 + pad, cartW, hh, hh * .3), cores[i % cores.length], { prof: 0, liso: true });
      p.texto(titulos[i] ?? "", colX(i) + cw / 2, y0 + pad + hh / 2, { tam: w * .038, cor: "tinta" });
      for (let j = 0; j < fixos[i]; j++) { const [x, y] = vaga(i, j); cartao(x, y, cores[(i + j + 1) % cores.length]); }
    }));
  }
  const T = tt % 6, ida1 = E.entraSai(clamp((T - 1) / .8)), ida2 = E.entraSai(clamp((T - 3.2) / .8)), A = vaga(0, 2), B = vaga(1, 1), C = vaga(2, 2), arco = Math.sin(ida1 * Math.PI) + Math.sin(ida2 * Math.PI);
  const x = lerp(lerp(A[0], B[0], ida1), C[0], ida2), y = lerp(lerp(A[1], B[1], ida1), C[1], ida2) - arco * h * .06, vis = clamp(k * 3 - 2) * (T > 5.5 ? 1 - (T - 5.5) / .5 : T < .4 ? T / .4 : 1);
  if (vis > 0) p.alfa(vis, () => cartao(x, y, "c2", { s: 1 + arco * .08, r: arco * .1 + Math.sin(tt * 3) * .025, prof: arco > .05 ? 3 : 1 }));
}

/** Cartão de indicador (KPI): rótulo, valor grande, selo de variação com seta e minigráfico que se traça. Opções: larg, valor, rotulo, variacao, queda, cor, valores, k (0..1 traça o minigráfico), t. Chaves: indicador, métrica, kpi, painel, dashboard, faturamento, resultado, desempenho, vendas */
export function cartaoDeMetrica(p, { larg = 340, valor = "R$ 48 mil", rotulo = "Faturamento", variacao = "+12%", queda = false, cor = "c3", valores = [.3, .42, .36, .58, .5, .74, .92], k = 1, t = 0 } = {}) {
  const w = larg, h = w * .7, tt = p.ritmo(t), x0 = -w / 2, y0 = -h / 2, pad = w * .08, cv = queda ? "c1" : cor, kk = clamp(k), card = retArredP(x0, y0, w, h, w * .06);
  p.em({ x: 0, y: 0, s: .9 + .1 * mola(clamp(k * 2), { freq: 1.3, amort: 5 }) }, () => {
    p.forma(card, "claro", { prof: 2 });
    p.recortar(card, () => p.forma(retP(x0, y0, w * .035, h), cv, { prof: 0, liso: true }));
    p.texto(rotulo, x0 + pad, y0 + pad + w * .03, { tam: w * .058, cor: "tinta", peso: 600, alinhar: "left" });
    p.alfa(clamp(k * 3), () => p.texto(valor, x0 + pad, y0 + h * .4, { tam: w * .13, cor: "tinta", peso: 900, alinhar: "left" }));
    const tp = w * .05, pw = p.medir(variacao, { tam: tp }) + tp * 2.5, ph = tp * 1.8, px = x0 + w - pad - pw, py = y0 + pad - ph * .15, s = queda ? 1 : -1, ax = px + tp * .95, ay = py + ph / 2 + Math.sin(tt * 4) * ph * .08;
    p.forma(retArredP(px, py, pw, ph, ph / 2), cv, { prof: 0, liso: true });
    p.forma([[ax, ay + s * tp * .42], [ax + tp * .42, ay - s * tp * .3], [ax - tp * .42, ay - s * tp * .3]], "tinta", { prof: 0, liso: true });
    p.texto(variacao, px + tp * 1.65, py + ph / 2, { tam: tp, cor: "tinta", alinhar: "left" });
    const sx0 = x0 + pad, sx1 = x0 + w - pad, sy0 = y0 + h * .6, sy1 = y0 + h - pad * .9, nv = Math.max(2, valores.length);
    const pts = Array.from({ length: nv }, (_, i) => { const v = clamp(valores[i] ?? .5); return [lerp(sx0, sx1, i / (nv - 1)), lerp(sy1, sy0, queda ? 1 - v : v) + Math.sin(tt * 2 + i) * h * .008]; });
    const vis = parcial(pts, E.sai(kk)), u = vis.at(-1);
    if (kk > .02) {
      p.forma([[sx0, sy1], ...vis, [u[0], sy1]], mistura(p, "claro", cv, .25), { prof: 0, liso: true });
      p.linha(vis, cv, w * .022);
      p.circulo(u[0], u[1], w * .022, cv, { prof: 0, liso: true });
      pulsoAnel(p, u[0], u[1], w * .025, w * .06, cv, w * .01, tt);
    }
  });
}

/** Seta grossa de alta (ou de queda) sobre colunas, que cresce com mola e avança no ritmo, com o número embaixo. Opções: larg, valor, queda, cor, k (0..1 faz a seta crescer), t. Chaves: tendência, alta, queda, crescimento, aumento, redução, subir, cair, variação */
export function tendencia(p, { larg = 320, valor = "+38%", queda = false, cor = "", k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), c = cor || (queda ? "c1" : "c3"), s = queda ? 1 : -1, kk = mola(clamp(k), { freq: 1.2, amort: 5 }), ang = s * .62, L = w * .72, th = w * .13, hl = w * .24, hw = w * .32;
  (queda ? [.34, .24, .14] : [.14, .24, .34]).forEach((v, i) => { const hh = w * v * cascata(k, i, 3, 2); if (hh > 1) p.forma(retP(-w * .3 + i * w * .23, w * .08 - hh, w * .14, hh), apagado(p, .2), { prof: 0, semente: i + 2 }); });
  const cx = 0, cy = -w * .17, bx = cx - Math.cos(ang) * L / 2, by = cy - Math.sin(ang) * L / 2, av = Math.sin(tt * 3) * w * .025;
  if (kk > .02) p.em({ x: bx, y: by, r: ang, s: kk }, () => p.forma([[av, -th / 2], [L - hl + av, -th / 2], [L - hl + av, -hw / 2], [L + av, 0], [L - hl + av, hw / 2], [L - hl + av, th / 2], [av, th / 2]], c, { prof: 2 }));
  p.alfa(clamp(k * 2), () => p.em({ x: 0, y: w * .26, s: 1 + .04 * Math.sin(tt * 3) }, () => p.texto(valor, 0, 0, { tam: w * .2, cor: c, peso: 900 })));
}

/** Pictograma: fileiras de pessoinhas em que `quantos` de `de` se preenchem uma a uma e pulam em onda. Opções: larg, de, quantos, cor, rotulo, k (0..1 preenche as pessoas), t. Chaves: pictograma, pessoas, proporção, estatística, população, maioria, em cada dez, público, amostra */
export function pictograma(p, { larg = 400, de = 10, quantos = 7, cor = "c1", rotulo = true, k = 1, t = 0 } = {}) {
  const w = larg, tt = p.ritmo(t), total = Math.max(1, Math.round(de)), cols = total > 6 ? Math.ceil(total / 2) : total, filas = Math.ceil(total / cols), cel = w / cols, hp = cel * 1.2, gy = cel * .22, extra = rotulo ? cel * .6 : 0;
  const H = filas * hp + (filas - 1) * gy + extra, topo = -H / 2 + extra, cheio = clamp(k) * clamp(quantos, 0, total), vazio = apagado(p, .25);
  const pessoa = c => { p.circulo(0, -hp * .8, cel * .17, c, { prof: 1, liso: true }); p.forma([...arcoP(0, -hp * .38, cel * .3, 180, 360, 10), [cel * .3, 0], [-cel * .3, 0]], c, { prof: 1, liso: true }); };
  for (let i = 0; i < total; i++) {
    const fila = Math.floor(i / cols), nf = Math.min(cols, total - fila * cols), col = i - fila * cols, x = -w / 2 + cel * (col + .5) + (cols - nf) * cel / 2, fi = clamp(cheio - i);
    const y = topo + (fila + 1) * hp + fila * gy - (fi >= 1 ? Math.max(0, Math.sin(tt * 4 - i * .55)) * cel * .08 : 0);
    p.em({ x, y, s: 1 + .14 * Math.sin(Math.PI * fi) }, () => {
      if (fi < 1) pessoa(vazio);
      if (fi >= 1) pessoa(cor); else if (fi > 0) p.recortar(retP(-cel * .32, -hp - 2, cel * .64 * fi, hp + 4), () => pessoa(cor));
    });
  }
  if (rotulo) p.texto(`${Math.round(cheio)} de ${total}`, 0, -H / 2 + cel * .22, { tam: cel * .36, cor: sobreFundo(p) });
}

/** Gráfico de bolhas: bolhas de tamanhos diferentes estouram no lugar, flutuam e respiram sobre os eixos. Opções: larg, alt, bolhas (lista de [x, y, tamanho] de 0 a 1), cores, k (0..1 faz as bolhas surgirem), t. Chaves: gráfico de bolhas, tamanho, volume, mercado, comparação, oportunidades, portfólio, peso */
export function graficoDeBolhas(p, { larg = 380, alt = 300, bolhas = [[.18, .28, .45], [.38, .6, .75], [.56, .34, .5], [.72, .72, 1], [.88, .45, .55], [.24, .78, .35]], cores = ["c1", "c3", "c2", "c4"], k = 1, t = 0 } = {}) {
  const w = larg, h = alt, tt = p.ritmo(t), n = Math.max(1, bolhas.length), R = w * .11;
  eixos(p, w, h, w * .014);
  for (const q of [.34, .67]) p.linha([[-w / 2, -h * q], [w / 2, -h * q]], apagado(p, .3), w * .008, { tracejado: [w * .03, w * .025] });
  bolhas.forEach(([bx, by, bs], i) => {
    const kk = cascata(k, i, n); if (kk <= .01) return;
    const r = R * Math.sqrt(clamp(bs, .05, 1.2)) * kk * (1 + .05 * Math.sin(tt * 2.2 + i * 1.9)), x = -w / 2 + w * bx + Math.sin(tt * .9 + i * 2.3) * w * .01, y = -h * by + Math.sin(tt * 1.4 + i) * h * .022, c = cores[i % cores.length];
    p.alfa(meio(p, .85), () => p.circulo(x, y, r, c, { prof: 1, semente: i + 7 }));
    if (p.estilo !== "traco" && r > 18) p.circulo(x - r * .36, y - r * .36, r * .22, maisClaro(p, c, .5), { prof: 0, liso: true });
  });
}

/** Lista de tarefas numa prancheta: os itens vão sendo marcados com um certo traçado e o próximo pendente pisca. Opções: larg, itens, cor, prancheta, k (0..1 marca os itens), t. Chaves: checklist, lista de tarefas, concluído, passo a passo, organização, planejamento, feito, requisitos, conferir */
export function checklist(p, { larg = 320, itens = ["Planejar", "Gravar", "Editar", "Publicar"], cor = "c3", prancheta = "c2", k = 1, t = 0 } = {}) {
  const w = larg, n = Math.max(1, itens.length), lh = w * .19, h = lh * n + w * .24, tt = p.ritmo(t), x0 = -w / 2, y0 = -h / 2, cx = clamp(k) * n * 1.05, lado = lh * .6, proximo = Math.floor(cx);
  p.em({ x: 0, y: 0, r: Math.sin(tt * 1.1) * .02 }, () => {
    p.forma(retArredP(x0, y0, w, h, w * .05), prancheta, { prof: 2 });
    p.forma(retArredP(x0 + w * .06, y0 + w * .09, w * .88, h - w * .13, w * .025), "claro", { prof: 1 });
    p.forma(retArredP(-w * .17, y0 - w * .05, w * .34, w * .12, w * .035), "tinta", { prof: 1 });
    p.circulo(0, y0 - w * .015, w * .028, prancheta, { prof: 0, liso: true });
    itens.forEach((s, i) => {
      const y = y0 + w * .17 + lh * (i + .5), bx = x0 + w * .15 + lado / 2, ki = clamp(cx - i), feito = ki >= 1;
      p.em({ x: bx, y, s: i === proximo && !feito ? 1 + .1 * Math.sin(tt * 7) : 1 }, () => p.linha(retArredP(-lado / 2, -lado / 2, lado, lado, lado * .2), mistura(p, "claro", "tinta", .55), w * .018, { fechar: true }));
      p.alfa(feito ? .55 : 1, () => p.texto(s, bx + lado * .95, y, { tam: lh * .36, cor: "tinta", alinhar: "left", peso: 700 }));
      if (ki > .03) p.em({ x: bx, y, s: feito ? 1 + .14 * Math.max(0, Math.sin(tt * 3 - i * .8)) ** 4 : 1 }, () => {
        const cheio = clamp((ki - .85) / .15);
        if (cheio > 0) p.em({ x: 0, y: 0, s: mola(cheio, { freq: 1.6, amort: 5 }) }, () => p.forma(retArredP(-lado / 2, -lado / 2, lado, lado, lado * .2), cor, { prof: 0, liso: true }));
        p.linha(parcial([[-lado * .3, -lado * .02], [-lado * .06, lado * .26], [lado * .58, -lado * .52]], ki), cheio > .5 ? "tinta" : cor, w * .04);
      });
    });
  });
}

/** Métrica e gráfico para apresentar resultados. Chaves: resultados, métrica, gráfico, dados */
export function painelDeResultados(p, { t = 0 } = {}) {
  p.em({ x: -85, s: .55 }, () => cartaoDeMetrica(p, { t }));
  p.em({ x: 85, s: .55 }, () => tendencia(p, { t }));
}
