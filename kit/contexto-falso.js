// Kit de movimento — contexto de canvas falso. Não desenha: registra as chamadas, acompanha as transformações
// e mede a caixa do que foi desenhado. Serve para a galeria enquadrar cada peça e para os testes conferirem,
// sem navegador, que uma peça desenha sem erro.
//
// uso: const ctx = criarContextoFalso(); pincel.inicio(ctx, 1080, 1920, t); peca(pincel, { t }); pincel.fim();
//      ctx.chamadas (lista de [nome, ...números]) · ctx.caixa ([x0, y0, x1, y1] ou null) · ctx.invalidos

/** Matriz afim 2D mínima, com o que os pincéis usam de DOMMatrix. */
export class MatrizFalsa {
  constructor(v = [1, 0, 0, 1, 0, 0]) { [this.a, this.b, this.c, this.d, this.e, this.f] = v; }
  multiply(m) { return new MatrizFalsa([this.a * m.a + this.c * m.b, this.b * m.a + this.d * m.b, this.a * m.c + this.c * m.d, this.b * m.c + this.d * m.d, this.a * m.e + this.c * m.f + this.e, this.b * m.e + this.d * m.f + this.f]); }
  ponto(x, y) { return [this.a * x + this.c * y + this.e, this.b * x + this.d * y + this.f]; }
}

export function criarContextoFalso({ largura = 1080, altura = 1920, registrar = true } = {}) {
  let m = new MatrizFalsa(), alfa = 1;
  const pilha = [], estado = { chamadas: [], invalidos: [], caixa: null, formas: 0 };
  const nota = (nome, args) => {
    if (registrar) estado.chamadas.push([nome, ...args.map(v => typeof v === "number" ? Math.round(v * 100) / 100 : typeof v === "string" ? v : 0)]);
    if (args.some(v => typeof v === "number" && !Number.isFinite(v))) estado.invalidos.push(nome);
  };
  const marcar = (x, y) => { if (!Number.isFinite(x) || !Number.isFinite(y) || alfa <= 0) return; const [px, py] = m.ponto(x, y), c = estado.caixa; if (!c) estado.caixa = [px, py, px, py]; else { c[0] = Math.min(c[0], px); c[1] = Math.min(c[1], py); c[2] = Math.max(c[2], px); c[3] = Math.max(c[3], py); } };
  const degrade = () => ({ addColorStop() {} });
  const medirTexto = s => { const tam = parseFloat(/(\d+(?:\.\d+)?)px/.exec(alvo.font)?.[1] || 10); return { width: String(s).length * tam * .58, tam }; };
  const alvo = {
    canvas: { width: largura, height: altura }, font: "10px sans-serif", textAlign: "start", textBaseline: "alphabetic",
    fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, globalCompositeOperation: "source-over", imageSmoothingEnabled: true,
    get globalAlpha() { return alfa; }, set globalAlpha(v) { if (Number.isFinite(v)) alfa = v; else estado.invalidos.push("globalAlpha"); },
    save() { pilha.push([m, alfa, alvo.font, alvo.textAlign, alvo.textBaseline]); },
    restore() { const e = pilha.pop(); if (e) [m, alfa, alvo.font, alvo.textAlign, alvo.textBaseline] = e; },
    translate(x, y) { nota("translate", [x, y]); m = m.multiply(new MatrizFalsa([1, 0, 0, 1, x, y])); },
    rotate(a) { nota("rotate", [a]); const c = Math.cos(a), s = Math.sin(a); m = m.multiply(new MatrizFalsa([c, s, -s, c, 0, 0])); },
    scale(x, y) { nota("scale", [x, y]); m = m.multiply(new MatrizFalsa([x, 0, 0, y, 0, 0])); },
    transform(a, b, c, d, e, f) { nota("transform", [a, b, c, d, e, f]); m = m.multiply(new MatrizFalsa([a, b, c, d, e, f])); },
    setTransform(a, b, c, d, e, f) { m = typeof a === "object" && a ? new MatrizFalsa([a.a, a.b, a.c, a.d, a.e, a.f]) : new MatrizFalsa(a === undefined ? undefined : [a, b, c, d, e, f]); },
    getTransform() { return new MatrizFalsa([m.a, m.b, m.c, m.d, m.e, m.f]); },
    beginPath() {}, closePath() {}, clip() {}, setLineDash() {},
    moveTo(x, y) { nota("moveTo", [x, y]); marcar(x, y); },
    lineTo(x, y) { nota("lineTo", [x, y]); marcar(x, y); },
    quadraticCurveTo(a, b, x, y) { nota("quadraticCurveTo", [a, b, x, y]); marcar(a, b); marcar(x, y); },
    bezierCurveTo(a, b, c, d, x, y) { nota("bezierCurveTo", [a, b, c, d, x, y]); marcar(a, b); marcar(c, d); marcar(x, y); },
    arc(x, y, r) { nota("arc", [x, y, r]); marcar(x - r, y - r); marcar(x + r, y + r); },
    rect(x, y, w, h) { nota("rect", [x, y, w, h]); marcar(x, y); marcar(x + w, y + h); },
    fill() { estado.formas++; nota("fill", []); }, stroke() { estado.formas++; nota("stroke", []); },
    fillRect(x, y, w, h) { nota("fillRect", [x, y, w, h]); },
    clearRect() {}, strokeRect(x, y, w, h) { nota("strokeRect", [x, y, w, h]); },
    fillText(s, x, y) {
      estado.formas++; nota("fillText", [String(s), x, y]);
      const { width: w, tam } = medirTexto(s), x0 = alvo.textAlign === "center" ? x - w / 2 : alvo.textAlign === "right" || alvo.textAlign === "end" ? x - w : x;
      const y0 = alvo.textBaseline === "middle" ? y - tam / 2 : alvo.textBaseline === "top" ? y : y - tam * .8;
      marcar(x0, y0); marcar(x0 + w, y0 + tam);
    },
    strokeText(s, x, y) { alvo.fillText(s, x, y); },
    measureText: medirTexto,
    createLinearGradient: degrade, createRadialGradient: degrade, createPattern: () => ({}),
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }),
    putImageData() {}, drawImage() {},
  };
  Object.defineProperties(alvo, { chamadas: { get: () => estado.chamadas }, invalidos: { get: () => estado.invalidos }, caixa: { get: () => estado.caixa }, formas: { get: () => estado.formas } });
  /** Esquece o que foi registrado, para medir outra peça com o mesmo contexto. */
  alvo.zerar = () => { estado.chamadas = []; estado.invalidos = []; estado.caixa = null; estado.formas = 0; m = new MatrizFalsa(); alfa = 1; pilha.length = 0; };
  return alvo;
}

/** Tela falsa (para document.createElement("canvas") fora do navegador). */
export function criarTelaFalsa() {
  const tela = { width: 300, height: 150, getContext: () => (tela.ctx ||= criarContextoFalso({ registrar: false })) };
  return tela;
}
/** Prepara o Node para rodar os pincéis sem navegador: cria `document` e `DOMMatrix` falsos se não existirem. */
export function prepararAmbienteFalso(g = globalThis) {
  if (!g.document) g.document = { createElement: () => criarTelaFalsa() };
  if (!g.DOMMatrix) g.DOMMatrix = class extends MatrizFalsa { constructor(v) { super(v); } };
}
