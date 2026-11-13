// Kit de movimento — pincéis. Um pincel desenha as mesmas formas no acabamento de cada estilo:
// papel (recorte rasgado com sombra e fibra), flat (vetor chapado), pixel (baixa resolução), traco
// (linhas técnicas luminosas) e vidro (translúcido com brilho). As peças de kit/pecas.js usam só o pincel,
// por isso servem para os cinco estilos.
//
// É referência em Canvas 2D. Se o estilo pedir outro motor (WebGL, Three.js, SVG), use kit/movimento.js
// para os tempos e poses e desenhe com o motor do estilo. Crie pincéis e formas novas à vontade.
import { rng, clamp, aplicar, passo } from "./movimento.js";

/** Papéis de cor: fundo, tinta (texto e contornos), claro (cartões), c1 dominante, c2 destaque, c3 e c4 apoio. */
export const PALETAS = {
  papel: { fundo: "#F3EBDD", tinta: "#243139", claro: "#FFF8EB", c1: "#C56B50", c2: "#E8B65C", c3: "#8A9B7C", c4: "#7C9DA5", sombra: "rgba(74,48,26,.30)" },
  flat: { fundo: "#F6F5EE", tinta: "#172235", claro: "#FFFFFF", c1: "#4667FF", c2: "#FF765E", c3: "#16B99A", c4: "#FFC65C", sombra: "rgba(23,34,53,.14)" },
  pixel: { fundo: "#141528", tinta: "#0C0D1C", claro: "#F2F0DA", c1: "#4A86D4", c2: "#F47E74", c3: "#73D9C9", c4: "#F5AE69", sombra: "#282B4D" },
  traco: { fundo: "#0C1726", tinta: "#F6F5EF", claro: "#1A2A3A", c1: "#38D8D2", c2: "#FFAF65", c3: "#648CFF", c4: "#A8F2D2", sombra: "rgba(0,0,0,.4)" },
  vidro: { fundo: "#0A1120", tinta: "#F2F7FF", claro: "#15243C", c1: "#599CFF", c2: "#FFC7AB", c3: "#65D9D3", c4: "#B8ABFF", sombra: "rgba(0,0,0,.35)" },
};
/** Qual pincel serve de referência para cada estilo nativo. Estilos criados pelo usuário: escolha o mais próximo. */
export const PINCEL_DO_ESTILO = { "recorte-de-papel": "papel", "vetor-flat": "flat", "pixel-art-8-bit": "pixel", "isometrico-em-linha": "traco", "vidro-liquido": "vidro" };
const TONS_DE_PELE = ["#F2C9A5", "#D9A37A", "#B97A56", "#8A5A3C", "#F6D7BD", "#6B4430"];

/* ---------------------------------------------------------------- geometria */
export const retP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export const circP = (cx, cy, r, n = 0, ry = r) => { n = n || Math.max(14, Math.min(48, Math.round(r / 3) + 12)); return Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * ry]); };
export function retArredP(x, y, w, h, r = 12) {
  r = Math.min(r, w / 2, h / 2); const o = [], q = (cx, cy, a0) => { for (let i = 0; i <= 5; i++) { const a = a0 + i / 5 * 1.5708; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  q(x + w - r, y + r, -1.5708); q(x + w - r, y + h - r, 0); q(x + r, y + h - r, 1.5708); q(x + r, y + r, 3.1416); return o;
}
export function capsulaP(a, b, w) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = w / 2, o = [];
  for (let i = 0; i <= 7; i++) { const t = ang + 1.5708 + i / 7 * 3.1416; o.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  for (let i = 0; i <= 7; i++) { const t = ang - 1.5708 + i / 7 * 3.1416; o.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  return o;
}
export const rotP = (pts, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
const caixa = pts => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
const perimetro = pts => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0);

function rasgar(pts, semente, j = 2.2, step = 26) {
  const r = rng(semente), out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(L / step)), nx = -(y2 - y1) / (L || 1), ny = (x2 - x1) / (L || 1);
    for (let k = 0; k < n; k++) { const t = k / n, d = (r() - .5) * 2 * j; out.push([x1 + (x2 - x1) * t + nx * d, y1 + (y2 - y1) * t + ny * d]); }
  }
  return out;
}
const hex = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
/** Mistura duas cores hex: k = 0 é `a`, k = 1 é `b`. */
export function misturarCor(a, b, k) { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join(""); }
const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };

const texturas = {};
function fibra() {
  if (texturas.fibra) return texturas.fibra;
  const cv = document.createElement("canvas"); cv.width = cv.height = 512;
  const c = cv.getContext("2d"), r = rng(7), id = c.createImageData(512, 512);
  for (let i = 0; i < 512 * 512; i++) { const v = 226 + r() * 29; id.data.set([v, v - 3, v - 8, 255], i * 4); }
  c.putImageData(id, 0, 0); c.lineCap = "round";
  for (let i = 0; i < 900; i++) {
    const x = r() * 512, y = r() * 512, a = r() * 6.28, l = 6 + r() * 20;
    c.strokeStyle = r() < .5 ? "rgba(140,110,80,.18)" : "rgba(255,255,255,.4)"; c.lineWidth = .8 + r();
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  return (texturas.fibra = cv);
}

/* ---------------------------------------------------------------- pincel */
/** Cria um pincel. `estilo`: papel, flat, pixel, traco ou vidro (ou o id de um estilo nativo).
    `paleta` troca cores por papel: { c1: "#...", c2: "#...", fundo: "#..." }. */
export function criarPincel(estilo = "flat", { paleta = {}, semente = 1, pixel = 6 } = {}) {
  const tipo = PINCEL_DO_ESTILO[estilo] || (PALETAS[estilo] ? estilo : "flat");
  const cores = { ...PALETAS[tipo], ...paleta };
  const FONTE = { papel: '"Archivo", "Arial Narrow", Arial, sans-serif', flat: '"Inter", "Segoe UI", Arial, sans-serif', pixel: '"Press Start 2P", "Courier New", monospace', traco: '"JetBrains Mono", "Courier New", monospace', vidro: '"Inter", "Segoe UI", Arial, sans-serif' }[tipo];
  let real = null, base = null, baixa = null, W = 0, H = 0, tempo = 0, filaTexto = [], contador = 0;
  const quant = new Map(); let usadas = new Map();

  const p = {
    estilo: tipo, cores, fonte: FONTE, c: null, largura: 0, altura: 0,
    /** quadros por segundo da cadência de stop-motion do estilo (0 = movimento contínuo) */
    qps: { papel: 12, pixel: 10 }[tipo] || 0,
    /** 0..1: quanto do traçado está revelado (ver p.tracar) */
    revelar: 1,
    /** tempo no ritmo do estilo: em passos no papel e no pixel, contínuo nos outros */
    ritmo: t => p.qps ? passo(t, p.qps) : t,
    cor: n => cores[n] || (/^pele(\d)?$/.test(n) ? TONS_DE_PELE[(+n.slice(4) || 0) % TONS_DE_PELE.length] : n),

    /** Chame no começo de cada quadro, antes de desenhar. */
    inicio(ctx, largura, altura, t = 0) {
      real = ctx; W = p.largura = largura; H = p.altura = altura; tempo = t; filaTexto = []; contador = 0; p.revelar = 1;
      if (tipo === "pixel") {
        const w = Math.ceil(W / pixel), h = Math.ceil(H / pixel);
        if (!baixa || baixa.width !== w || baixa.height !== h) { baixa = document.createElement("canvas"); baixa.width = w; baixa.height = h; }
        const b = baixa.getContext("2d", { willReadFrequently: true });
        b.setTransform(1 / pixel, 0, 0, 1 / pixel, 0, 0); b.globalAlpha = 1; b.clearRect(0, 0, W, H);
        base = ctx.getTransform(); p.c = b; usadas = new Map();
      } else p.c = ctx;
    },
    /** Chame no fim de cada quadro. No pixel, é aqui que a imagem vira pixels duros. */
    fim() {
      if (tipo !== "pixel") return;
      const b = p.c, w = baixa.width, h = baixa.height, id = b.getImageData(0, 0, w, h), d = id.data;
      const pal = [...usadas.values()];
      if (quant.tam !== pal.length) { quant.clear(); quant.tam = pal.length; }
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 128) { d[i + 3] = 0; continue; }
        const k = d[i] << 16 | d[i + 1] << 8 | d[i + 2]; let v = quant.get(k);
        if (v === undefined) { let m = 1e9; v = k; for (const [r, g, bl] of pal) { const e = (r - d[i]) ** 2 + (g - d[i + 1]) ** 2 + (bl - d[i + 2]) ** 2; if (e < m) { m = e; v = r << 16 | g << 8 | bl; } } quant.set(k, v); }
        d[i] = v >> 16; d[i + 1] = v >> 8 & 255; d[i + 2] = v & 255; d[i + 3] = 255;
      }
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.putImageData(id, 0, 0); b.restore();
      real.save(); real.imageSmoothingEnabled = false; real.drawImage(baixa, 0, 0, w * pixel, h * pixel);
      for (const f of filaTexto) { real.setTransform(base.multiply(new DOMMatrix([pixel, 0, 0, pixel, 0, 0])).multiply(f.m)); real.globalAlpha = f.a; escrever(real, f); }
      real.restore(); p.c = real;
    },

    /** Fundo do estilo, com vida própria. */
    fundo(t = tempo) {
      const c = p.c;
      if (tipo === "papel") {
        c.fillStyle = cores.fundo; c.fillRect(0, 0, W, H);
        c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = .6; c.fillStyle = c.createPattern(fibra(), "repeat"); c.fillRect(0, 0, W, H); c.restore();
        c.save(); c.strokeStyle = rgba(cores.tinta, .06); c.lineWidth = 2; c.beginPath();
        for (let x = 60; x < W; x += 60) { c.moveTo(x, 0); c.lineTo(x, H); } for (let y = 60; y < H; y += 60) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke(); c.restore();
      } else if (tipo === "flat") {
        c.fillStyle = cores.fundo; c.fillRect(0, 0, W, H);
        const r = rng(semente + 3);
        for (let i = 0; i < 7; i++) { const x = r() * W, y = r() * H, s = 90 + r() * 220; c.fillStyle = rgba(cores[["c1", "c3", "c4"][i % 3]], .07); c.beginPath(); c.arc(x + Math.sin(t * .3 + i) * 30, y + Math.cos(t * .25 + i * 2) * 30, s, 0, 6.2832); c.fill(); }
      } else if (tipo === "pixel") {
        usar(cores.fundo); usar(cores.sombra); usar(cores.claro);
        c.fillStyle = cores.fundo; c.fillRect(0, 0, W, H);
        const r = rng(semente + 5), tp = passo(t, 4);
        for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H * .8, liga = Math.sin(tp * 2 + i * 1.7) > .2; c.fillStyle = liga ? cores.claro : cores.sombra; c.fillRect(Math.round(x / pixel) * pixel, Math.round(y / pixel) * pixel, pixel, pixel); }
      } else if (tipo === "traco") {
        c.fillStyle = cores.fundo; c.fillRect(0, 0, W, H);
        c.save(); c.strokeStyle = rgba(cores.tinta, .055); c.lineWidth = 1.5; c.beginPath();
        const g = 90, d = (t * 12) % g;
        for (let x = -H; x < W + H; x += g) { c.moveTo(x + d, 0); c.lineTo(x + d + H * .577 * 2, H); c.moveTo(x + d, 0); c.lineTo(x + d - H * .577 * 2, H); }
        c.stroke(); c.restore();
      } else {
        const g = c.createLinearGradient(0, 0, W * .3, H); g.addColorStop(0, cores.claro); g.addColorStop(1, cores.fundo); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.save(); c.globalCompositeOperation = "lighter";
        [["c1", .22, .28], ["c4", .8, .5], ["c3", .3, .8]].forEach(([n, x, y], i) => {
          const cx = W * x + Math.sin(t * .35 + i * 2) * W * .12, cy = H * y + Math.cos(t * .28 + i) * H * .06, R = Math.max(W, H) * .42;
          const gr = c.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, rgba(cores[n], .34)); gr.addColorStop(1, rgba(cores[n], 0)); c.fillStyle = gr; c.fillRect(0, 0, W, H);
        });
        c.restore();
      }
    },

    /** Forma fechada por pontos [[x,y],...]. É a base de tudo: cada estilo dá o seu acabamento.
        opções: prof (altura da sombra, 0 = sem), semente (rasgo do papel), furos (lista de formas vazadas), liso (sem rasgo). */
    forma(pts, cor = "c1", { prof = 1, semente: sd, furos = [], liso = false } = {}) {
      if (pts.length < 3) return;
      const c = p.c, f = p.cor(cor); sd = sd ?? ++contador;
      const tracar = (lista) => { c.beginPath(); for (const pl of lista) { pl.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } };
      if (tipo === "papel") {
        const [x0, y0, x1, y1] = caixa(pts), tam = Math.max(x1 - x0, y1 - y0);
        const j = liso ? 0 : clamp(tam / 90, .5, 2.4), lista = [pts, ...furos].map((q, i) => j ? rasgar(q, sd * 31 + i, j, clamp(tam / 7, 9, 28)) : q);
        c.save(); if (prof > 0) { c.shadowColor = cores.sombra; c.shadowBlur = prof * 9; c.shadowOffsetX = prof * 2.5; c.shadowOffsetY = prof * 4.5; }
        tracar(lista); c.fillStyle = f; c.fill("evenodd"); c.restore();
        if (tam > 46) { c.save(); tracar(lista); c.globalCompositeOperation = "multiply"; c.globalAlpha *= .5; c.fillStyle = c.createPattern(fibra(), "repeat"); c.fill("evenodd"); c.restore(); }
        c.save(); c.translate(-1.2, -1.2); tracar(lista); c.strokeStyle = "rgba(255,250,240,.55)"; c.lineWidth = 2; c.stroke(); c.restore();
      } else if (tipo === "flat") {
        c.save(); if (prof > 1) { c.shadowColor = cores.sombra; c.shadowBlur = 0; c.shadowOffsetX = prof * 4; c.shadowOffsetY = prof * 6; }
        tracar([pts, ...furos]); c.fillStyle = f; c.fill("evenodd"); c.restore();
      } else if (tipo === "pixel") {
        usar(f); tracar([pts, ...furos]); c.fillStyle = f; c.fill("evenodd");
      } else if (tipo === "traco") {
        const L = perimetro(pts), k = clamp(p.revelar);
        c.save(); c.lineJoin = c.lineCap = "round";
        tracar([pts, ...furos]); c.globalAlpha *= clamp((k - .55) / .45); c.fillStyle = misturarCor(cores.fundo, f, .16); c.fill("evenodd"); c.restore();
        c.save(); c.lineJoin = c.lineCap = "round"; tracar([pts, ...furos]); if (k < 1) c.setLineDash([L * k, L * 2]);
        c.shadowColor = f; c.shadowBlur = 10; c.strokeStyle = f; c.lineWidth = 3.5; c.stroke(); c.restore();
      } else {
        const [x0, y0, x1, y1] = caixa(pts);
        c.save(); if (prof > 0) { c.shadowColor = rgba(f, .45); c.shadowBlur = 26 * prof; c.shadowOffsetY = 8 * prof; }
        const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, rgba(f, .78)); g.addColorStop(1, rgba(f, .34));
        tracar([pts, ...furos]); c.fillStyle = g; c.fill("evenodd"); c.restore();
        c.save(); tracar([pts, ...furos]); c.clip("evenodd");
        const b = c.createLinearGradient(x0, y0, x0, y0 + (y1 - y0) * .55); b.addColorStop(0, "rgba(255,255,255,.34)"); b.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = b; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.restore();
        c.save(); tracar([pts, ...furos]); c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 2; c.stroke(); c.restore();
      }
    },
    circulo: (x, y, r, cor, o) => p.forma(circP(x, y, r), cor, o),
    elipse: (x, y, rx, ry, cor, o) => p.forma(circP(x, y, rx, 0, ry), cor, o),
    retangulo: (x, y, w, h, cor, { raio = 0, rot = 0, ...o } = {}) => { let pts = raio ? retArredP(x, y, w, h, raio) : retP(x, y, w, h); if (rot) pts = rotP(pts, x + w / 2, y + h / 2, rot); p.forma(pts, cor, o); },
    /** Membro ou barra arredondada entre dois pontos. */
    capsula: (a, b, w, cor, o) => p.forma(capsulaP(a, b, w), cor, { prof: 0, liso: true, ...o }),

    /** Linha aberta por pontos. opções: tracejado [risco, vão], desloc (anima o tracejado), fechar. */
    linha(pts, cor = "tinta", w = 6, { tracejado, desloc = 0, fechar = false } = {}) {
      if (pts.length < 2) return;
      const c = p.c, f = p.cor(cor); if (tipo === "pixel") usar(f);
      c.save(); c.lineJoin = c.lineCap = tipo === "pixel" ? "butt" : "round"; c.strokeStyle = f; c.lineWidth = tipo === "pixel" ? Math.max(pixel, Math.round(w / pixel) * pixel) : w;
      if (tracejado) { c.setLineDash(tracejado); c.lineDashOffset = -desloc; }
      if (tipo === "traco") { c.shadowColor = f; c.shadowBlur = 10; }
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (fechar) c.closePath(); c.stroke(); c.restore();
    },
    seta(pts, cor = "tinta", w = 8, o) {
      p.linha(pts, cor, w, o); const [a, b] = pts.slice(-2), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = w * 2.6;
      p.forma([[b[0] + Math.cos(ang) * s, b[1] + Math.sin(ang) * s], [b[0] + Math.cos(ang + 2.4) * s, b[1] + Math.sin(ang + 2.4) * s], [b[0] + Math.cos(ang - 2.4) * s, b[1] + Math.sin(ang - 2.4) * s]], cor, { prof: 0, liso: true });
    },

    /** Texto. opções: tam, cor, peso, alinhar (left, center, right), base, maiusculas. */
    texto(s, x, y, { tam = 44, cor = "tinta", peso = 800, alinhar = "center", base = "middle", espaco = 0 } = {}) {
      const f = { s: String(s), x, y, tam, cor: p.cor(cor), peso, alinhar, base, espaco };
      if (tipo === "pixel") { f.tam = Math.max(pixel * 3, Math.round(tam * .62 / pixel) * pixel); f.m = p.c.getTransform(); f.a = p.c.globalAlpha; filaTexto.push(f); }
      else escrever(p.c, f);
    },
    medir(s, { tam = 44, peso = 800 } = {}) { const c = p.c; c.save(); c.font = `${peso} ${tipo === "pixel" ? Math.max(pixel * 3, Math.round(tam * .62 / pixel) * pixel) : tam}px ${FONTE}`; const w = c.measureText(String(s)).width; c.restore(); return tipo === "pixel" ? w * 1.02 : w; },
    /** Faixa com texto: a etiqueta de cada estilo. opções: tam, cor do texto, fundo, rot, ponta (recorte em V). */
    etiqueta(s, x, y, { tam = 40, cor = "claro", fundo = "c1", rot = 0, ponta = false, prof = 1 } = {}) {
      const w = p.medir(s, { tam }) + tam * 1.3, h = tam * 1.75;
      p.em({ x, y, r: rot }, () => {
        const pts = ponta ? [[-w / 2, -h / 2], [w / 2 + h * .3, -h / 2], [w / 2, 0], [w / 2 + h * .3, h / 2], [-w / 2, h / 2]] : (tipo === "papel" || tipo === "pixel" ? retP(-w / 2, -h / 2, w, h) : retArredP(-w / 2, -h / 2, w, h, tipo === "vidro" ? h / 2 : 10));
        p.forma(pts, fundo, { prof });
        p.texto(s, 0, tam * .04, { tam, cor: tipo === "traco" ? fundo : cor });
      });
    },

    /** Desenha `fn` dentro de uma transformação { x, y, s, sx, sy, r, a } (as de entrada, saida e vivo). */
    em(tr, fn) { const c = p.c; if ((tr.a ?? 1) <= 0 || (tr.s ?? 1) === 0) return; c.save(); aplicar(c, tr); fn(p); c.restore(); },
    alfa(a, fn) { if (a <= 0) return; const c = p.c; c.save(); c.globalAlpha *= clamp(a); fn(p); c.restore(); },
    /** Desenha `fn` só dentro da forma `pts`. */
    recortar(pts, fn) { const c = p.c; c.save(); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); fn(p); c.restore(); },
    /** Entrada "desenhando": no estilo traco as linhas se traçam; nos outros a peça surge crescendo. k = 0..1. */
    tracar(k, fn) {
      k = clamp(k); if (k <= 0) return;
      if (tipo === "traco") { const a = p.revelar; p.revelar = k; fn(p); p.revelar = a; }
      else p.alfa(clamp(k * 3), fn);
    },
  };

  function usar(h) { if (/^#[0-9a-f]{6}$/i.test(h) && !usadas.has(h)) usadas.set(h, hex(h)); }
  function escrever(c, f) {
    c.save(); c.font = `${f.peso} ${f.tam}px ${FONTE}`; c.textAlign = f.alinhar; c.textBaseline = f.base; c.fillStyle = f.cor;
    try { c.letterSpacing = f.espaco + "px"; } catch (e) { /* navegador sem suporte */ }
    if (tipo === "traco") { c.shadowColor = f.cor; c.shadowBlur = 8; }
    if (tipo === "vidro") { c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 10; c.shadowOffsetY = 2; }
    c.fillText(f.s, f.x, f.y); c.restore();
  }
  return p;
}
