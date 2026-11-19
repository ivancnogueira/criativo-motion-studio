// Cenas de prévia dos estilos nativos. Extraído do app original; RENDER[i](canvas, tempoEmSegundos).
/* ---------- preview renderers: one scene per style, logical space 640x360 ---------- */
const LW = 640, LH = 360;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eout = t => 1 - Math.pow(1 - t, 3);
function rng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashSeed(n, k) { let h = Math.imul(n ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(k + 0x27d4eb2f, 0xC2B2AE35); h ^= h >>> 15; return h >>> 0; }
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function scaled(cv) { const c = cv.getContext("2d"); const s = cv.width / LW; c.setTransform(s, 0, 0, s, 0, 0); return [c, s]; }
const SANS = 'Archivo, "Arial Narrow", Arial, sans-serif';
const MONO = '"Courier Prime", ui-monospace, Menlo, monospace';
function font(c, w, px, stretch = "normal", fam = SANS) { c.font = `${w} ${px}px ${fam}`; try { c.fontStretch = stretch; } catch (e) {} }
function txt(c, s, x, y, col, align = "left", base = "alphabetic", ls = 0) {
  c.fillStyle = col; c.textAlign = align; c.textBaseline = base;
  try { c.letterSpacing = ls + "px"; } catch (e) {}
  c.fillText(s, x, y);
  try { c.letterSpacing = "0px"; } catch (e) {}
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
const cache = {};
function noiseTex(key, w, h, seed, fn) {
  if (cache[key]) return cache[key];
  const cv = mk(w, h), c = cv.getContext("2d"), id = c.createImageData(w, h), r = rng(seed);
  for (let i = 0; i < w * h; i++) { const [R, G, B, A] = fn(r, i % w, (i / w) | 0); id.data.set([R, G, B, A], i * 4); }
  c.putImageData(id, 0, 0); return (cache[key] = cv);
}

/* =========================================================== 1. PAPER CUT-OUT */
const P = { cream: "#EFE6FA", char: "#2A1A47", terra: "#8B5CF6", mustard: "#5BEA8E", sage: "#2FBFB1", dusty: "#B79CE6", card: "#FCF8FF" };
function fiber() {
  if (cache.fiber) return cache.fiber;
  const cv = mk(1280, 720), c = cv.getContext("2d"), r = rng(7);
  const n = noiseTex("fibern", 1280, 720, 11, (r) => { const v = 225 + r() * 30; return [v, v - 3, v - 8, 255]; });
  c.drawImage(n, 0, 0);
  c.lineCap = "round";
  for (let i = 0; i < 1400; i++) {
    const x = r() * 1280, y = r() * 720, a = r() * Math.PI * 2, l = 4 + r() * 14;
    c.strokeStyle = r() < .5 ? "rgba(140,110,80,.16)" : "rgba(255,255,255,.35)"; c.lineWidth = .6 + r() * .8;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  return (cache.fiber = cv);
}
function roughen(pts, seed, j = .9, step = 11) {
  const r = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(L / step)), nx = -(y2 - y1) / (L || 1), ny = (x2 - x1) / (L || 1);
    for (let k = 0; k < n; k++) { const t = k / n, d = (r() - .5) * 2 * j; out.push([x1 + (x2 - x1) * t + nx * d, y1 + (y2 - y1) * t + ny * d]); }
  }
  return out;
}
const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const circP = (cx, cy, r, n = 40) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
function rotP(pts, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); }
function path(c, polys) { c.beginPath(); for (const p of polys) { p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } }
function paper(c, polys, color, depth = 2, seed = 1, rough = .9) {
  polys = polys.map((p, i) => roughen(p, seed * 31 + i, rough));
  c.save(); c.shadowColor = "rgba(74,48,26,.30)"; c.shadowBlur = depth * 3.2; c.shadowOffsetX = depth * .9; c.shadowOffsetY = depth * 1.5;
  path(c, polys); c.fillStyle = color; c.fill("evenodd"); c.restore();
  c.save(); path(c, polys); c.clip("evenodd"); c.globalCompositeOperation = "multiply"; c.globalAlpha = .55;
  c.drawImage(fiber(), (seed * 37) % 300 - 300, (seed * 53) % 200 - 200, 1280, 720); c.restore();
  c.save(); c.translate(-.5, -.5); path(c, polys); c.strokeStyle = "rgba(255,250,240,.5)"; c.lineWidth = .8; c.stroke(); c.restore();
}
function renderPaper(cv, t) {
  const [c] = scaled(cv);
  const st = Math.floor(t * 12) / 12; // stop-motion cadence for paper pieces
  c.fillStyle = P.cream; c.fillRect(0, 0, LW, LH);
  c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = .7; c.drawImage(fiber(), 0, 0, 1280, 720); c.restore();
  // ground layers
  paper(c, [[[-10, 312], [140, 300], [300, 316], [470, 298], [650, 310], [650, 370], [-10, 370]]], P.sage, 3, 4, 2.2);
  paper(c, [[[-10, 336], [200, 328], [420, 340], [650, 330], [650, 370], [-10, 370]]], "#23988D", 2, 5, 1.8);
  // title banner
  font(c, 800, 19, "semi-condensed");
  const bT = "COMO FUNCIONA UM AGENTE", bR = Math.max(312, 44 + c.measureText(bT).width + bT.length * .6 + 30);
  paper(c, [[[30, 26], [bR, 26], [bR - 14, 47], [bR, 68], [30, 68]]], P.terra, 3, 6);
  font(c, 800, 19, "semi-condensed"); txt(c, bT, 44, 54, P.card, "left", "alphabetic", .6);
  paper(c, [rotP(rectP(40, 76, 176, 22), 128, 87, -.02)], P.card, 2, 8);
  font(c, 600, 11.5); txt(c, "meta → age → confere → decide", 52, 91, P.char);
  // loop ring
  const cx = 330, cy = 196;
  paper(c, [circP(cx, cy, 112, 64), circP(cx, cy, 90, 56).reverse()], P.dusty, 3, 9, 1.1);
  c.save(); c.strokeStyle = "rgba(36,49,57,.55)"; c.lineWidth = 1.2; c.setLineDash([3, 5]); c.beginPath(); c.arc(cx, cy, 101, 0, 6.28); c.stroke(); c.restore();
  // chevrons on ring
  for (let k = 0; k < 4; k++) {
    const a = -Math.PI / 4 + k * Math.PI / 2, x = cx + Math.cos(a) * 101, y = cy + Math.sin(a) * 101;
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = P.char; c.beginPath(); c.moveTo(-5, -4); c.lineTo(5, 0); c.lineTo(-5, 4); c.closePath(); c.fill(); c.restore();
  }
  // token travelling around the loop (stepped)
  const ta = -Math.PI / 2 + st * 1.1;
  const tx = cx + Math.cos(ta) * 101, ty = cy + Math.sin(ta) * 101;
  paper(c, [circP(tx, ty, 9, 18)], P.card, 3, 12, .5);
  paper(c, [circP(tx, ty, 4.5, 12)], P.terra, 1, 13, .3);
  // stations
  const ST = [
    { a: -Math.PI / 2, label: "META", col: P.mustard, ink: P.char, icon: "target", r: -.04 },
    { a: 0, label: "FERRAMENTA", col: P.terra, ink: P.card, icon: "wrench", r: .05 },
    { a: Math.PI / 2, label: "CONFERE", col: P.sage, ink: P.card, icon: "check", r: -.03 },
    { a: Math.PI, label: "DECIDE", col: P.char, ink: P.card, icon: "fork", r: .04 },
  ];
  ST.forEach((s, i) => {
    const x = cx + Math.cos(s.a) * 112, y = cy + Math.sin(s.a) * 112 + Math.sin(st * 2 + i) * 1.2;
    const w = s.label.length > 8 ? 122 : s.label.length > 6 ? 104 : 92, h = 38, active = Math.floor(((ta + Math.PI / 2) / (Math.PI / 2) + .5) % 4) === i;
    paper(c, [rotP(rectP(x - w / 2, y - h / 2, w, h), x, y, s.r)], s.col, active ? 5 : 3, 20 + i);
    c.save(); c.translate(x, y); c.rotate(s.r);
    font(c, 800, 12.5, "semi-condensed"); txt(c, s.label, -w / 2 + 30, 4.5, s.ink, "left", "alphabetic", .5);
    c.strokeStyle = s.ink; c.fillStyle = s.ink; c.lineWidth = 2; c.lineCap = "round"; const ix = -w / 2 + 16;
    if (s.icon === "target") { c.beginPath(); c.arc(ix, 0, 8, 0, 6.28); c.stroke(); c.beginPath(); c.arc(ix, 0, 3.5, 0, 6.28); c.fill(); }
    if (s.icon === "wrench") { c.beginPath(); c.moveTo(ix - 6, 6); c.lineTo(ix + 3, -3); c.stroke(); c.beginPath(); c.arc(ix + 5, -5, 4, .6, 5.2); c.stroke(); }
    if (s.icon === "check") { c.beginPath(); c.moveTo(ix - 7, 0); c.lineTo(ix - 2, 5); c.lineTo(ix + 7, -6); c.stroke(); }
    if (s.icon === "fork") { c.beginPath(); c.moveTo(ix - 7, 6); c.lineTo(ix - 1, 0); c.lineTo(ix + 7, -6); c.moveTo(ix - 1, 0); c.lineTo(ix + 7, 6); c.stroke(); }
    c.restore();
  });
  // agent in the middle
  const blink = (st % 3.2) < .12;
  paper(c, [rectP(cx - 2, cy - 52, 4, 16)], P.char, 1, 30, .3);
  paper(c, [circP(cx, cy - 55, 6, 16)], P.mustard, 2, 31, .4);
  paper(c, [rectP(cx - 30, cy - 38, 60, 40)], P.char, 4, 32, .8);
  if (blink) { c.fillStyle = P.card; c.fillRect(cx - 17, cy - 19, 12, 2.5); c.fillRect(cx + 5, cy - 19, 12, 2.5); }
  else { paper(c, [circP(cx - 11, cy - 18, 6.5, 16)], P.card, 1, 33, .3); paper(c, [circP(cx + 11, cy - 18, 6.5, 16)], P.card, 1, 34, .3); c.fillStyle = P.char; c.beginPath(); c.arc(cx - 9, cy - 18, 2.6, 0, 6.28); c.arc(cx + 13, cy - 18, 2.6, 0, 6.28); c.fill(); }
  paper(c, [rectP(cx - 25, cy + 6, 50, 34)], P.dusty, 4, 35, .7);
  paper(c, [rectP(cx - 17, cy + 13, 34, 12)], P.card, 1, 36, .3);
  font(c, 800, 8); txt(c, "AGENTE", cx, cy + 22, P.char, "center", "alphabetic", .6);
  // tool shelf (right)
  const tools = [["buscar", 60], ["rodar código", 98], ["ler arquivos", 136]];
  tools.forEach(([n, y], i) => {
    const x = 548, w = 92, h = 30, r = (i - 1) * .05;
    paper(c, [rotP(rectP(x - w / 2, y - h / 2 + 30, w, h), x, y + 30, r)], i === 1 ? P.mustard : P.card, 3, 40 + i);
    c.save(); c.translate(x, y + 30); c.rotate(r); font(c, 700, 11.5); txt(c, n, 0, 4, P.char, "center"); c.restore();
  });
  c.save(); c.strokeStyle = P.char; c.lineWidth = 1.4; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx + 118, cy - 22); c.bezierCurveTo(460, 150, 476, 132, 500, 128); c.stroke(); c.restore();
  paper(c, [rotP(rectP(462, 210, 104, 22), 514, 221, .04)], P.card, 2, 46);
  font(c, 600, 10.5); txt(c, "escolhe a ferramenta", 514, 225, P.char, "center");
  // results card (left)
  const lx = 82, ly = 168;
  paper(c, [rotP(rectP(lx - 54, ly - 36, 108, 96), lx, ly, -.05)], P.card, 4, 50);
  c.save(); c.translate(lx, ly); c.rotate(-.05);
  font(c, 800, 10, "semi-condensed"); txt(c, "RESULTADO", -42, -18, P.terra, "left", "alphabetic", .8);
  const bars = [.55, .8, .4, .95];
  bars.forEach((b, i) => { const g = clamp((st - .3 - i * .25) / .5); c.fillStyle = i === 3 ? P.terra : P.sage; c.fillRect(-40 + i * 21, 42 - b * 46 * g, 14, b * 46 * g); });
  c.fillStyle = P.char; c.fillRect(-44, 43, 88, 1.5);
  c.restore();
  font(c, 600, 10.5); txt(c, "confere o que aconteceu", lx, ly + 76, P.char, "center");
  // tape on result card
  c.save(); c.translate(lx - 8, ly - 40); c.rotate(-.18); c.fillStyle = "rgba(232,182,92,.55)"; c.fillRect(-18, -6, 36, 12); c.restore();
}

/* =========================================================== 2. GENERATIVE PARTICLES */
function glassBg(W, H) {
  const key = "gbg" + W; if (cache[key]) return cache[key];
  const cv = mk(W, H); const [c] = scaled(cv);
  const g = c.createLinearGradient(0, 0, LW, LH); g.addColorStop(0, "#120A24"); g.addColorStop(1, "#22163F"); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  [[170, 120, 190, "89,156,255", .45], [470, 270, 170, "101,217,211", .35], [530, 80, 130, "184,171,255", .4], [110, 300, 110, "255,199,171", .28]].forEach(([x, y, r, col, a]) => {
    const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`); c.fillStyle = rg; c.fillRect(0, 0, LW, LH);
  });
  c.strokeStyle = "rgba(242,247,255,.06)"; c.lineWidth = .6; c.beginPath();
  for (let x = 0; x <= LW; x += 24) { c.moveTo(x, 0); c.lineTo(x, LH); } for (let y = 0; y <= LH; y += 24) { c.moveTo(0, y); c.lineTo(LW, y); } c.stroke();
  // browser window
  c.fillStyle = "rgba(10,17,32,.55)"; rr(c, 216, 70, 280, 140, 10); c.fill();
  c.strokeStyle = "rgba(242,247,255,.55)"; c.lineWidth = 1; rr(c, 216, 70, 280, 140, 10); c.stroke();
  c.beginPath(); c.moveTo(216, 96); c.lineTo(496, 96); c.stroke();
  ["#7DFFB0", "#B8ABFF", "#65D9D3"].forEach((cl, i) => { c.fillStyle = cl; c.beginPath(); c.arc(230 + i * 11, 83, 3.2, 0, 6.28); c.fill(); });
  c.fillStyle = "rgba(242,247,255,.1)"; rr(c, 268, 76, 196, 14, 7); c.fill();
  font(c, 500, 10, "normal", MONO); txt(c, "http://localhost:3000", 278, 86.5, "#F2F7FF");
  font(c, 700, 15); txt(c, "Hábitos", 230, 120, "#FFFFFF");
  for (let i = 0; i < 3; i++) {
    const y = 132 + i * 22; c.strokeStyle = "rgba(242,247,255,.35)"; rr(c, 230, y, 150, 16, 4); c.stroke();
    c.fillStyle = i < 2 ? "#65D9D3" : "rgba(242,247,255,.25)"; c.beginPath(); c.arc(240, y + 8, 4, 0, 6.28); c.fill();
    font(c, 500, 9.5); txt(c, ["Beber água", "Ler 20 páginas", "Andar 8 mil passos"][i], 250, y + 11.5, "#F2F7FF");
  }
  c.fillStyle = "#9B6BFF"; rr(c, 396, 166, 86, 26, 13); c.fill(); font(c, 700, 11); txt(c, "Publicar →", 439, 183, "#FFFFFF", "center");
  c.lineWidth = 5; c.strokeStyle = "rgba(242,247,255,.15)"; c.beginPath(); c.arc(440, 134, 18, 0, 6.28); c.stroke(); c.strokeStyle = "#B8ABFF"; c.lineCap = "round"; c.beginPath(); c.arc(440, 134, 18, -1.57, -1.57 + 6.28 * .66); c.stroke(); c.lineCap = "butt";
  font(c, 700, 11); txt(c, "2/3", 440, 138, "#FFFFFF", "center"); font(c, 500, 9); txt(c, "hoje", 440, 164, "rgba(242,247,255,.7)", "center");
  font(c, 500, 9, "normal", MONO); txt(c, "● servidor rodando", 230, 205, "#65D9D3");
  // flow
  const nodes = [["prompt", 88], ["interface", 232], ["teste no localhost", 386], ["seu-app.com", 548]];
  c.strokeStyle = "rgba(242,247,255,.5)"; c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) { const a = nodes[i][1] + 58, b = nodes[i + 1][1] - 60; c.beginPath(); c.moveTo(a, 268); c.lineTo(b, 268); c.stroke(); c.beginPath(); c.moveTo(b - 6, 264); c.lineTo(b, 268); c.lineTo(b - 6, 272); c.stroke(); }
  nodes.forEach(([n, x], i) => {
    c.fillStyle = i === 3 ? "rgba(101,217,211,.22)" : "rgba(242,247,255,.08)"; rr(c, x - 56, 254, 112, 28, 14); c.fill();
    c.strokeStyle = i === 3 ? "#65D9D3" : "rgba(242,247,255,.45)"; rr(c, x - 56, 254, 112, 28, 14); c.stroke();
    font(c, 600, i >= 2 ? 10 : 11, "normal", i >= 2 ? MONO : SANS); txt(c, n, x, 272, "#F2F7FF", "center");
  });
  font(c, 500, 9.5, "normal", MONO);
  ["01 pede", "02 cria", "03 corrige", "04 publica"].forEach((s, i) => txt(c, s, nodes[i][1], 300, "rgba(242,247,255,.55)", "center"));
  const id = cv.getContext("2d").getImageData(0, 0, W, H);
  return (cache[key] = { cv, id });
}
function renderGlass(cv, t) {
  const W = cv.width, H = cv.height, s = W / LW, ctx = cv.getContext("2d");
  const bg = glassBg(W, H), src = bg.id.data, out = ctx.createImageData(W, H), o = out.data; o.set(src);
  const lx = 350 + Math.sin(t * .45) * 92, ly = 124 + Math.sin(t * .3) * 4, half = 60, R = 34;
  const ang = t * .7, bx = lx + Math.cos(ang) * 100, by = ly + 66 + Math.sin(ang) * 22, br = 24;
  const sd = (x, y) => {
    const px = clamp(x, lx - half, lx + half), d1 = Math.hypot(x - px, y - ly) - R;
    const d2 = Math.hypot(x - bx, y - by) - br, k = 26, h = clamp(.5 + .5 * (d2 - d1) / k);
    return lerp(d2, d1, h) - k * h * (1 - h);
  };
  const x0 = Math.max(0, Math.floor((Math.min(lx - half - R, bx - br) - 22) * s)), x1 = Math.min(W, Math.ceil((Math.max(lx + half + R, bx + br) + 22) * s));
  const y0 = Math.max(0, Math.floor((Math.min(ly - R, by - br) - 18) * s)), y1 = Math.min(H, Math.ceil((Math.max(ly + R, by + br) + 28) * s));
  const samp = (x, y, ch) => { x = clamp(Math.round(x * s), 0, W - 1); y = clamp(Math.round(y * s), 0, H - 1); return src[(y * W + x) * 4 + ch]; };
  for (let py = y0; py < y1; py++) for (let px = x0; px < x1; px++) {
    const x = px / s, y = py / s, d = sd(x, y), i = (py * W + px) * 4;
    if (d > 0) { // soft shadow below
      const ds = sd(x - 2, y - 9); const sh = clamp(1 - (ds + 2) / 16) * .38;
      if (sh > 0) { o[i] *= 1 - sh; o[i + 1] *= 1 - sh; o[i + 2] *= 1 - sh; }
      if (d * s > 1.2) continue;
    }
    const e = .6, gx = (sd(x + e, y) - d) / e, gy = (sd(x, y + e) - d) / e, gl = Math.hypot(gx, gy) || 1, nx = gx / gl, ny = gy / gl;
    const q = clamp(-d / 15), rim = 1 - q, bend = Math.pow(rim, 2) * 15;
    const zx = lx + (x - lx) * .8, zy = ly + (y - ly) * .8;
    let r = samp(zx + nx * bend * 1.12, zy + ny * bend * 1.12, 0), g = samp(zx + nx * bend, zy + ny * bend, 1), b = samp(zx + nx * bend * .88, zy + ny * bend * .88, 2);
    const L = clamp(-(nx * -.6 + ny * -.8)) * 0, lit = clamp(nx * -.62 + ny * -.78), shade = clamp(nx * .62 + ny * .78);
    const hi = Math.pow(rim, 3.2) * lit * 230 + Math.pow(rim, 6) * 60, lo = Math.pow(rim, 2.5) * shade * .3;
    r = r * (1 - lo) * .94 + 15 + hi; g = g * (1 - lo) * .95 + 16 + hi; b = b * (1 - lo) * .96 + 24 + hi;
    const a = clamp(.5 - d * s);
    o[i] = lerp(o[i], r, a); o[i + 1] = lerp(o[i + 1], g, a); o[i + 2] = lerp(o[i + 2], b, a);
  }
  ctx.putImageData(out, 0, 0);
  const [c] = scaled(cv);
  // specular streak
  const sg = c.createLinearGradient(lx - 50, ly - 30, lx - 10, ly - 10); sg.addColorStop(0, "rgba(255,255,255,.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
  c.strokeStyle = sg; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(lx - half + 2, ly - R + 10); c.quadraticCurveTo(lx - half + 14, ly - R + 3, lx - 10, ly - R + 4); c.stroke();
  // sharp headline
  font(c, 700, 23); txt(c, "Ideia → app no ar", 28, 44, "#FFFFFF");
  font(c, 500, 10.5, "normal", MONO); txt(c, "prompt · prévia · ajuste · publica", 29, 62, "#65D9D3", "left", "alphabetic", .5);
  c.fillStyle = "rgba(101,217,211,.16)"; rr(c, 494, 318, 120, 22, 11); c.fill();
  font(c, 600, 10, "normal", MONO); txt(c, "● 200 OK · público", 554, 333, "#65D9D3", "center");
}

/* =========================================================== 4. KINETIC TYPE */
const ISO = { bg: "#150C29", face: "#1B1035", top: "#251747", side: "#170D2E", line: "#C3B2E3", ivory: "#F7F3FF", turq: "#2CE3D3", orange: "#39FF88", ultra: "#A274FF", mint: "#B6F8D6" };
function renderIso(cv, t) {
  const [c] = scaled(cv);
  const p = t % 10, u = 19, ox = 172, oy = 92, cs = Math.cos(Math.PI / 6) * u, sn = .5 * u;
  const I = (x, y, z = 0) => [ox + (x - y) * cs, oy + (x + y) * sn - z * u];
  const draw = clamp(p / 2.4), fade = p > 9.5 ? 1 - (p - 9.5) / .5 : 1;
  c.fillStyle = ISO.bg; c.fillRect(0, 0, LW, LH);
  c.globalAlpha = fade;
  const poly = (pts, stroke, fill, lw = 1, prog = 1) => {
    c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) {
      let L = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); }
      c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = "round"; if (prog < 1) c.setLineDash([L * prog, L + 1]); c.stroke(); c.setLineDash([]);
    }
  };
  const box = (x, y, z, w, d, h, st = ISO.line, lw = 1, pr = 1) => {
    const P0 = I(x, y + d, z), P1 = I(x + w, y + d, z), P2 = I(x + w, y, z), T0 = I(x, y, z + h), T1 = I(x, y + d, z + h), T2 = I(x + w, y + d, z + h), T3 = I(x + w, y, z + h);
    poly([P0, P1, T2, T1], st, ISO.face, lw, pr); poly([P1, P2, T3, T2], st, ISO.side, lw, pr); poly([T0, T1, T2, T3], st, ISO.top, lw, pr);
  };
  const line = (a, b, st, lw = 1, dash) => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.strokeStyle = st; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.stroke(); c.setLineDash([]); };
  // ground grid
  c.strokeStyle = "rgba(168,184,198,.07)"; c.lineWidth = .6; c.beginPath();
  for (let k = -2; k <= 24; k++) { let a = I(k, -2), b = I(k, 10); c.moveTo(...a); c.lineTo(...b); } for (let k = -2; k <= 10; k++) { const a = I(-2, k), b = I(24, k); c.moveTo(...a); c.lineTo(...b); } c.stroke();
  // road
  line(I(10.4, 3.2), I(23, 3.2), "rgba(168,184,198,.4)", .9); line(I(10.4, 4.8), I(23, 4.8), "rgba(168,184,198,.4)", .9);
  line(I(10.4, 4), I(23, 4), "rgba(168,184,198,.25)", .7, [4, 6]);
  // route on the ground
  const route = [[.6, 7.8], [1.8, 7.8], [1.8, 6.4], [5.6, 6.4], [5.6, 4.6], [10, 4.6], [10, 3.7], [19.2, 3.7]];
  const rp = route.map(([x, y]) => I(x, y, .02));
  c.beginPath(); rp.forEach((q, i) => i ? c.lineTo(...q) : c.moveTo(...q)); c.strokeStyle = "rgba(56,216,210,.3)"; c.lineWidth = 3.4; c.stroke();
  c.setLineDash([4, 6]); c.lineDashOffset = -t * 18; c.strokeStyle = ISO.turq; c.lineWidth = 1.3; c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
  // warehouse cutaway
  const wx = 3, wy = .4, ww = 6.6, wd = 5, wh = 3.2;
  poly([I(wx, wy), I(wx + ww, wy), I(wx + ww, wy + wd), I(wx, wy + wd)], ISO.line, "rgba(14,28,46,.85)", .8, draw);
  poly([I(wx, wy, 0), I(wx, wy + wd, 0), I(wx, wy + wd, wh), I(wx, wy, wh)], ISO.line, ISO.face, 1.4, draw);
  poly([I(wx, wy, 0), I(wx + ww, wy, 0), I(wx + ww, wy, wh), I(wx, wy, wh)], ISO.line, ISO.side, 1.4, draw);
  for (let k = 1; k < 5; k++) line(I(wx, wy + k, 0), I(wx, wy + k, wh), "rgba(168,184,198,.2)", .5);
  for (let k = 1; k < 6; k++) line(I(wx + k * 1.1, wy, 0), I(wx + k * 1.1, wy, wh), "rgba(168,184,198,.2)", .5);
  // racks
  [[3.6, 1], [3.6, 2.9]].forEach(([x, y], ri) => {
    box(x, y, 0, 3, .9, 2.4, ISO.line, 1, draw);
    for (let lv = 1; lv < 3; lv++) line(I(x, y + .9, lv * .8), I(x + 3, y + .9, lv * .8), ISO.line, .7);
    for (let k = 0; k < 3; k++) box(x + .25 + k * 1, y + .2, .05 + ((k + ri) % 2) * .8, .55, .5, .48, ISO.orange, .9, draw);
  });
  // picker
  const pk = I(5.3, 4.6, 0); c.strokeStyle = ISO.mint; c.lineWidth = 1.4; c.beginPath(); c.arc(pk[0], pk[1] - 26, 3.4, 0, 6.28); c.moveTo(pk[0], pk[1] - 22); c.lineTo(pk[0], pk[1] - 11); c.lineTo(pk[0] - 3, pk[1]); c.moveTo(pk[0], pk[1] - 11); c.lineTo(pk[0] + 3, pk[1]); c.moveTo(pk[0] - 4, pk[1] - 18); c.lineTo(pk[0] + 5, pk[1] - 15); c.stroke();
  // conveyor with moving boxes
  box(7.6, .9, 0, 1, 4.2, .6, ISO.line, 1, draw);
  for (let k = 0; k < 3; k++) { const yy = 1 + ((p * .5 + k * 1.3) % 3.6); box(7.82, yy, .6, .55, .55, .45, ISO.orange, .9, draw); }
  // front low walls (cutaway)
  poly([I(wx, wy + wd, 0), I(wx + ww, wy + wd, 0), I(wx + ww, wy + wd, .8), I(wx, wy + wd, .8)], ISO.ivory, ISO.face, 1.6, draw);
  poly([I(wx + ww, wy, 0), I(wx + ww, wy + wd, 0), I(wx + ww, wy + wd, .8), I(wx + ww, wy, .8)], ISO.ivory, ISO.side, 1.6, draw);
  line(I(wx, wy + wd, .8), I(wx, wy + wd, wh), "rgba(246,245,239,.35)", .8, [2, 3]); line(I(wx + ww, wy, .8), I(wx + ww, wy, wh), "rgba(246,245,239,.35)", .8, [2, 3]);
  line(I(wx, wy + wd, wh), I(wx, wy, wh), "rgba(246,245,239,.7)", 1.2); line(I(wx, wy, wh), I(wx + ww, wy, wh), "rgba(246,245,239,.7)", 1.2);
  // phone (standing slab, screen on +x face)
  box(0, 6.4, 0, .35, 2.6, 4.4, ISO.ivory, 1.6, draw);
  c.save(); const a0 = I(.35, 6.6, 4.15), au = I(.35, 8.8, 4.15), av = I(.35, 6.6, .3);
  c.transform((au[0] - a0[0]) / 100, (au[1] - a0[1]) / 100, (av[0] - a0[0]) / 100, (av[1] - a0[1]) / 100, a0[0], a0[1]);
  c.globalAlpha = fade * clamp((p - 1.2) / .6);
  c.fillStyle = "rgba(56,216,210,.12)"; c.fillRect(0, 0, 100, 100);
  c.fillStyle = ISO.line; c.fillRect(10, 12, 60, 5); c.fillRect(10, 22, 40, 3); c.fillRect(10, 30, 50, 3);
  c.strokeStyle = ISO.line; c.lineWidth = 1.5; c.strokeRect(10, 42, 80, 18);
  c.fillStyle = ISO.turq; c.fillRect(10, 72, 80, 16);
  c.restore(); c.globalAlpha = fade;
  // van moving along road
  const vp = clamp((p - 4.4) / 3), vx = lerp(10.8, 15.6, eio(vp)), vy = 3.5;
  box(vx, vy, .25, 1.7, .95, .85, ISO.ivory, 1.4, draw); box(vx + 1.7, vy, .25, .6, .95, .55, ISO.ivory, 1.4, draw);
  [vx + .35, vx + 1.8].forEach(xx => { const q = I(xx, vy + .95, .22); c.beginPath(); c.ellipse(q[0], q[1], 4.6, 3.4, .5, 0, 6.28); c.fillStyle = ISO.bg; c.fill(); c.strokeStyle = ISO.line; c.lineWidth = 1.1; c.stroke(); });
  // house
  const hx = 19.6, hy = 2.2, hw = 2.6, hd = 2.6, hh = 1.9;
  box(hx, hy, 0, hw, hd, hh, ISO.ivory, 1.4, draw);
  const R1 = I(hx, hy + hd / 2, hh + 1.3), R2 = I(hx + hw, hy + hd / 2, hh + 1.3);
  poly([I(hx, hy + hd, hh), I(hx + hw, hy + hd, hh), R2, R1], ISO.ivory, ISO.top, 1.4, draw);
  poly([I(hx + hw, hy, hh), I(hx + hw, hy + hd, hh), R2], ISO.ivory, ISO.side, 1.4, draw);
  poly([I(hx + hw * .4, hy + hd, 0), I(hx + hw * .4, hy + hd, 1.15), I(hx + hw * .62, hy + hd, 1.15), I(hx + hw * .62, hy + hd, 0)], ISO.line, null, 1);
  // delivered pin
  const dv = clamp((p - 7.6) / .5), pin = I(hx + hw / 2, hy + hd / 2, hh + 3.4 + Math.sin(t * 3) * .1);
  if (dv > 0) { c.globalAlpha = fade * dv; c.fillStyle = ISO.orange; c.beginPath(); c.arc(pin[0], pin[1] - 7, 9, Math.PI * .85, Math.PI * 2.15); c.lineTo(pin[0], pin[1] + 7); c.closePath(); c.fill(); c.strokeStyle = ISO.bg; c.lineWidth = 2; c.beginPath(); c.moveTo(pin[0] - 4, pin[1] - 7); c.lineTo(pin[0] - .5, pin[1] - 3.5); c.lineTo(pin[0] + 4.5, pin[1] - 10); c.stroke(); c.globalAlpha = fade; }
  // packets along route
  let segL = [], tot = 0; for (let i = 0; i < rp.length - 1; i++) { const l = Math.hypot(rp[i + 1][0] - rp[i][0], rp[i + 1][1] - rp[i][1]); segL.push(l); tot += l; }
  for (let k = 0; k < 3; k++) {
    let dd = ((t * 44 + k * tot / 3) % tot); let i = 0; while (dd > segL[i]) { dd -= segL[i]; i++; }
    const f = dd / segL[i], x = lerp(rp[i][0], rp[i + 1][0], f), y = lerp(rp[i][1], rp[i + 1][1], f);
    c.fillStyle = "rgba(255,175,101,.25)"; c.beginPath(); c.arc(x, y, 6, 0, 6.28); c.fill(); c.fillStyle = ISO.orange; c.beginPath(); c.arc(x, y, 2.8, 0, 6.28); c.fill();
  }
  // callouts
  const call = (n, s, at, lx, ly, on) => {
    c.globalAlpha = fade * clamp((p - on) / .4);
    line(at, [lx, ly], "rgba(246,245,239,.5)", .7); c.fillStyle = ISO.ivory; c.beginPath(); c.arc(at[0], at[1], 1.8, 0, 6.28); c.fill();
    c.fillStyle = ISO.turq; c.beginPath(); c.arc(lx, ly, 8, 0, 6.28); c.fill(); font(c, 700, 9, "normal", MONO); txt(c, n, lx, ly + 3.2, ISO.bg, "center");
    font(c, 700, 9.5, "normal", MONO); txt(c, s, lx + 13, ly + 3.4, ISO.ivory, "left", "alphabetic", 1);
    c.globalAlpha = fade;
  };
  call("1", "PEDIDO", I(.2, 6.8, 4.45), 112, 40, 1.4);
  call("2", "PAGO", I(.35, 7.7, 1.3), 30, 236, 1.9);
  call("3", "SEPARAÇÃO", I(5.3, 2.5, 3.2), 330, 34, 2.4);
  call("4", "EM TRÂNSITO", I(vx + 1, vy, 1.2), 470, 118, 4.6);
  call("5", "ENTREGUE", I(hx + hw, hy, hh + .6), 520, 190, 7.6);
  // title + tracking bar
  font(c, 700, 22); txt(c, "Pedido → sua porta", 28, 312, ISO.ivory);
  const stage = p < 1.9 ? 1 : p < 2.6 ? 2 : p < 4.6 ? 3 : p < 7.6 ? 4 : 5;
  font(c, 700, 8.5, "normal", MONO); txt(c, "RASTREIO", 28, 336, ISO.line, "left", "alphabetic", 1.5);
  for (let k = 0; k < 5; k++) {
    const x = 100 + k * 30; if (k < 4) line([x + 4, 333], [x + 26, 333], k + 1 < stage ? ISO.turq : "rgba(168,184,198,.3)", 1.4);
    c.beginPath(); c.arc(x, 333, 4, 0, 6.28); if (k < stage) { c.fillStyle = ISO.turq; c.fill(); } else { c.strokeStyle = "rgba(168,184,198,.5)"; c.lineWidth = 1; c.stroke(); }
  }
  c.globalAlpha = 1;
}

/* =========================================================== 6. FLAT VECTOR */
const FV = { ink: "#22143D", ivory: "#F7F3FC", cob: "#7C3AED", teal: "#14C8B8", coral: "#2EE57A", amber: "#FFC65C", peri: "#C4B0F7", slate: "#7E7199" };
function renderFlat(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = FV.ivory; c.fillRect(0, 0, LW, LH);
  c.fillStyle = "#E7E6DC"; c.fillRect(0, 310, LW, 50);
  c.fillStyle = "rgba(22,185,154,.25)"; c.fillRect(0, 310, LW, 3);
  font(c, 800, 24); txt(c, "Sol → energia em casa", 28, 42, FV.ink);
  font(c, 500, 11); txt(c, "Como a energia solar abastece a casa", 29, 60, FV.slate);
  // sun
  const sx = 92, sy = 124;
  c.save(); c.translate(sx, sy); c.rotate(t * .15);
  for (let k = 0; k < 12; k++) { c.rotate(Math.PI / 6); c.fillStyle = FV.amber; rr(c, 40, -3.5, 16 + (k % 2) * 6, 7, 3.5); c.fill(); }
  c.restore();
  c.fillStyle = FV.amber; c.beginPath(); c.arc(sx, sy, 32, 0, 6.28); c.fill();
  c.fillStyle = "#FFD98A"; c.beginPath(); c.arc(sx - 8, sy - 8, 16, 0, 6.28); c.fill();
  // house
  const hx = -30, roof = [[300 + hx, 206], [476 + hx, 206], [446 + hx, 146], [330 + hx, 146]];
  c.fillStyle = "#DEDFFB"; c.fillRect(312 + hx, 204, 152, 106);
  c.fillStyle = "#C9CBF6"; c.fillRect(312 + hx, 204, 152, 6);
  c.fillStyle = FV.ink; c.beginPath(); roof.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
  const Q = [[314 + hx, 198], [462 + hx, 198], [436 + hx, 152], [340 + hx, 152]], bl = (u, v) => [lerp(lerp(Q[0][0], Q[1][0], u), lerp(Q[3][0], Q[2][0], u), v), lerp(lerp(Q[0][1], Q[1][1], u), lerp(Q[3][1], Q[2][1], u), v)];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
    const g = .04, a = bl(i / 5 + g / 2, j / 2 + g), b = bl((i + 1) / 5 - g / 2, j / 2 + g), d = bl((i + 1) / 5 - g / 2, (j + 1) / 2 - g), e = bl(i / 5 + g / 2, (j + 1) / 2 - g);
    c.fillStyle = FV.cob; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.lineTo(...e); c.closePath(); c.fill();
    c.strokeStyle = "rgba(255,255,255,.22)"; c.lineWidth = .7; c.beginPath(); const m1 = bl((i + .5) / 5, j / 2 + g), m2 = bl((i + .5) / 5, (j + 1) / 2 - g); c.moveTo(...m1); c.lineTo(...m2); c.stroke();
  }
  const gp = (t * .35) % 1.6; c.save(); c.beginPath(); c.moveTo(...Q[0]); Q.slice(1).forEach(q => c.lineTo(...q)); c.closePath(); c.clip();
  c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); const gx = lerp(220, 500, gp); c.moveTo(gx, 210); c.lineTo(gx + 14, 210); c.lineTo(gx + 44, 140); c.lineTo(gx + 30, 140); c.fill(); c.restore();
  c.fillStyle = FV.ink; rr(c, 374 + hx, 252, 30, 58, [15, 15, 0, 0]); c.fill();
  const glow = .25 + .2 * Math.sin(t * 2.4);
  [[326 + hx, 226], [420 + hx, 226]].forEach(([x, y]) => { c.fillStyle = `rgba(255,198,92,${glow})`; rr(c, x - 6, y - 6, 46, 42, 9); c.fill(); c.fillStyle = FV.ink; rr(c, x, y, 34, 30, 4); c.fill(); c.fillStyle = FV.amber; rr(c, x + 3, y + 3, 28, 24, 2); c.fill(); c.fillStyle = FV.ink; c.fillRect(x + 16, y + 3, 2, 24); });
  // photons
  for (let k = 0; k < 9; k++) {
    const u = (t * .55 + k / 9) % 1, tx = lerp(310, 410, (k * .37) % 1), ty = lerp(194, 158, (k * .53) % 1);
    const x = lerp(sx + 30, tx, u), y = lerp(sy + 10, ty, u), ang = Math.atan2(ty - sy, tx - sx);
    c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = k % 3 ? FV.amber : FV.coral; c.globalAlpha = Math.sin(u * Math.PI); rr(c, -7, -2, 14, 4, 2); c.fill(); c.restore();
  }
  c.globalAlpha = 1;
  // magnified cell inset
  const mx = 160, my = 240, mr = 50, anchor = bl(.2, .55);
  c.strokeStyle = FV.slate; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(mx + 36, my - 36); c.lineTo(anchor[0], anchor[1]); c.stroke(); c.setLineDash([]);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(mx, my, mr + 5, 0, 6.28); c.fill();
  c.save(); c.beginPath(); c.arc(mx, my, mr, 0, 6.28); c.clip();
  c.fillStyle = FV.cob; c.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
  c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 1; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(mx + k * 16, my - mr); c.lineTo(mx + k * 16, my + mr); c.moveTo(mx - mr, my + k * 16); c.lineTo(mx + mr, my + k * 16); c.stroke(); }
  for (let k = 0; k < 10; k++) { const u = (t * .4 + k / 10) % 1, x = mx - mr + u * mr * 2, y = my + Math.sin(k * 2.3 + t * 2) * 30; c.fillStyle = FV.coral; c.beginPath(); c.arc(x, y, 4, 0, 6.28); c.fill(); c.fillStyle = "#fff"; c.fillRect(x - 2, y - .6, 4, 1.2); }
  c.restore();
  c.strokeStyle = FV.ink; c.lineWidth = 3; c.beginPath(); c.arc(mx, my, mr, 0, 6.28); c.stroke();
  const chip = (n, x, y) => { c.fillStyle = FV.ink; c.beginPath(); c.arc(x, y, 9, 0, 6.28); c.fill(); font(c, 800, 10.5); txt(c, n, x, y + 3.8, FV.ivory, "center"); };
  chip("1", mx - 44, my - 42); font(c, 600, 11); txt(c, "A luz libera elétrons", mx, my + 72, FV.ink, "center"); txt(c, "nas células de silício", mx, my + 86, FV.slate, "center");
  // wires
  const wire = (pts, col, sp) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = "#D8D6CA"; c.lineWidth = 5; c.lineJoin = "round"; c.stroke(); c.setLineDash([7, 7]); c.lineDashOffset = -t * sp; c.strokeStyle = col; c.lineWidth = 3; c.stroke(); c.setLineDash([]); };
  wire([[432, 190], [494, 190], [494, 226]], FV.amber, 26);
  wire([[470, 254], [434, 254]], FV.teal, 26);
  wire([[518, 256], [572, 256], [572, 276]], FV.teal, 22);
  wire([[518, 238], [606, 238], [606, 180]], FV.teal, 22);
  // inverter
  c.fillStyle = FV.teal; rr(c, 470, 226, 48, 44, 8); c.fill();
  c.strokeStyle = "#fff"; c.lineWidth = 2; c.lineJoin = "miter"; c.beginPath(); c.moveTo(477, 252); c.lineTo(477, 242); c.lineTo(484, 242); c.lineTo(484, 252); c.lineTo(491, 252); c.lineTo(491, 242);
  c.moveTo(495, 247); for (let k = 0; k <= 16; k++) c.lineTo(495 + k, 247 - Math.sin(k / 16 * 6.28) * 5); c.stroke();
  chip("2", 458, 178); font(c, 700, 10.5); txt(c, "CC", 471, 182, FV.ink);
  chip("3", 466, 334); font(c, 700, 10.5); txt(c, "Inversor: CC → CA", 480, 338, FV.ink);
  // battery
  c.fillStyle = FV.ink; rr(c, 556, 276, 34, 18, 3); c.fill(); c.fillRect(590, 281, 3, 8);
  const lv = Math.floor(((t * .8) % 4) + 1); for (let k = 0; k < 4; k++) { c.fillStyle = k < lv ? FV.amber : "#3A4560"; c.fillRect(559 + k * 7.5, 279, 5.5, 12); }
  // pylon
  const py = 120; c.strokeStyle = FV.slate; c.lineWidth = 2; c.beginPath(); c.moveTo(596, py + 60); c.lineTo(606, py); c.lineTo(616, py + 60); c.moveTo(598, py + 46); c.lineTo(614, py + 46); c.moveTo(600, py + 28); c.lineTo(612, py + 28); c.moveTo(592, py + 12); c.lineTo(620, py + 12); c.moveTo(602, py + 22); c.lineTo(612, py + 34); c.moveTo(610, py + 22); c.lineTo(600, py + 34); c.stroke();
  chip("4", 470, 96); font(c, 700, 10.5); txt(c, "Sobra → bateria ou rede", 484, 100, FV.ink);
}

/* =========================================================== 7. RISOGRAPH */
const PX = { navy: "#170E2C", ink: "#2C1D4F", plum: "#4D2F78", blue: "#8B5CF6", aqua: "#2ED9C9", mint: "#5CFF8F", coral: "#D08BFF", orange: "#F5AE69", gold: "#F8D46D", pale: "#F2F0DA", dark: "#0C0D1C" };
const GLY = { A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010", U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010", Z: "111001010100111", "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110", "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010", "8": "111101111101111", "9": "111101111001110", " ": "000000000000000", ">": "100010001010100", "-": "000000111000000", "?": "110001010000010", "!": "010010010000010", ":": "000010000010000", "/": "001001010100100", ".": "000000000000010" };
function ptxt(c, s, x, y, col) { c.fillStyle = col; [...s].forEach((ch, k) => { const g = GLY[ch] || GLY[" "]; for (let b = 0; b < 15; b++) if (g[b] === "1") c.fillRect(x + k * 4 + b % 3, y + ((b / 3) | 0), 1, 1); }); }
const HERO = {
  stand: ["...ccc....", "..ccccc...", "..ppppp...", "..pkpkp...", "..ppppp...", "...aaa....", ".aaaaaaa..", ".paaaaap..", "..bbbbb...", "..bb.bb...", "..bb.bb...", ".ddd.ddd.."],
  walk1: ["...ccc....", "..ccccc...", "..ppppp...", "..pkpkp...", "..ppppp...", "...aaa....", ".aaaaaaa..", ".paaaaap..", "..bbbbb...", ".bb...bb..", "bb.....bb.", "dd.....dd."],
  walk2: ["...ccc....", "..ccccc...", "..ppppp...", "..pkpkp...", "..ppppp...", "...aaa....", "..aaaaa...", "..aaaap...", "..bbbbb...", "...bbb....", "...bb.....", "...ddd...."],
  jump: ["...ccc..c.", "..ccccc.c.", "..ppppp...", "..pkpkp...", "p.ppppp.p.", "pa.aaa.ap.", ".aaaaaaa..", "..aaaaa...", "..bbbbb...", ".bb...bb..", ".bd...db..", ".........."],
};
const HC = { c: PX.coral, p: PX.pale, k: PX.navy, a: PX.aqua, b: PX.blue, d: PX.ink };
function spr(c, f, x, y, flip) { f.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== ".") { c.fillStyle = HC[ch]; c.fillRect(x + (flip ? 9 - i : i), y + j, 1, 1); } })); }
function renderPixel(cv, t) {
  const lo = cache.lo || (cache.lo = mk(160, 90)), c = lo.getContext("2d");
  const p = t % 2.4, r = rng(5);
  c.fillStyle = PX.navy; c.fillRect(0, 0, 160, 90);
  for (let k = 0; k < 40; k++) { const x = (r() * 104) | 0, y = (r() * 46) | 0, tw = Math.floor(t * 3 + k) % 7 === 0; c.fillStyle = tw ? PX.pale : r() < .5 ? PX.plum : PX.blue; c.fillRect(x, y, 1, 1); }
  // far mountains (parallax, integer offsets)
  const off1 = Math.floor(t * 3) % 32;
  c.fillStyle = PX.plum; for (let x = 0; x < 106; x++) { const xx = x + off1; const h = 14 + Math.abs(((xx % 32) - 16)) * -.6 + ((xx * 7) % 3); c.fillRect(x, 66 - h, 1, h); }
  const off2 = Math.floor(t * 6) % 24;
  c.fillStyle = PX.ink; for (let x = 0; x < 106; x++) { const xx = x + off2; const h = 6 + Math.round(Math.sin(xx / 24 * Math.PI * 2) * 3); c.fillRect(x, 66 - h, 1, h); }
  // ground tiles
  for (let tx = 0; tx < 106; tx += 8) for (let ty = 66; ty < 90; ty += 6) {
    c.fillStyle = ty === 66 ? PX.mint : PX.plum; c.fillRect(tx, ty, 8, ty === 66 ? 2 : 6);
    if (ty === 66) { c.fillStyle = PX.plum; c.fillRect(tx, 68, 8, 4); c.fillStyle = PX.ink; c.fillRect(tx + 7, 68, 1, 4); }
    else { c.fillStyle = PX.ink; c.fillRect(tx + ((ty / 6) % 2 ? 0 : 4), ty, 1, 6); c.fillRect(tx, ty + 5, 8, 1); }
  }
  // ? block + coin
  const bump = p > .42 && p < .6 ? -1 : 0;
  c.fillStyle = PX.gold; c.fillRect(50, 26 + bump, 10, 10); c.fillStyle = PX.orange; c.fillRect(50, 35 + bump, 10, 1); c.fillRect(59, 26 + bump, 1, 10); ptxt(c, "?", 53, 28 + bump, PX.navy);
  if (p > .45 && p < 1.2) { const cy = 20 - Math.floor((p - .45) * 18); const cw = Math.floor(t * 10) % 4; c.fillStyle = PX.gold; c.fillRect(55 - (cw === 1 ? 0 : 1), cy, cw === 1 ? 1 : 3, 5); }
  // hero
  const jumping = p > .15 && p < .95, jt = (p - .15) / .8;
  const hx = 50 + Math.round(Math.sin(t * .6) * 2), hy = jumping ? Math.max(37, Math.round(54 - Math.sin(jt * Math.PI) * 24)) : 54;
  const pose = jumping ? HERO.jump : (Math.floor(t * 8) % 2 ? HERO.walk1 : HERO.walk2);
  if (jumping) { c.fillStyle = PX.ink; for (let k = 1; k < 4; k++) c.fillRect(hx + 3, hy + 12 + k * 2, 4 - k, 1); }
  spr(c, pose, hx, hy);
  // collision box near block
  if (jumping && hy < 40) { c.fillStyle = PX.gold; for (let k = 0; k < 14; k += 2) { c.fillRect(hx - 2 + k, hy - 2, 1, 1); c.fillRect(hx - 2 + k, hy + 12, 1, 1); } for (let k = 0; k < 14; k += 2) { c.fillRect(hx - 2, hy - 2 + k, 1, 1); c.fillRect(hx + 11, hy - 2 + k, 1, 1); } ptxt(c, "BUM!", hx - 19, hy + 3, PX.gold); }
  // title + A button
  const pressed = p < .2;
  c.fillStyle = PX.dark; c.fillRect(3, 4 + 1, 9, 8); c.fillStyle = pressed ? PX.orange : PX.coral; c.fillRect(4, 3 + (pressed ? 1 : 0), 7, 7); c.fillRect(3, 4 + (pressed ? 1 : 0), 9, 5);
  ptxt(c, "A", 6, 4 + (pressed ? 1 : 0), PX.pale);
  ptxt(c, "APERTE > PULA", 15, 5, PX.pale);
  // signal pixels to loop panel
  for (let k = 0; k < 4; k++) { const u = (p * 2.4 + k * .07); if (u < 1) { c.fillStyle = PX.coral; c.fillRect(Math.round(lerp(64, 110, u)), 8, 2, 1); } }
  // loop panel
  c.fillStyle = PX.dark; c.fillRect(106, 2, 52, 86); c.fillStyle = PX.ink; c.fillRect(107, 3, 50, 84);
  c.fillStyle = PX.pale; c.fillRect(106, 2, 52, 1); c.fillRect(106, 87, 52, 1); c.fillRect(106, 2, 1, 86); c.fillRect(157, 2, 1, 86);
  ptxt(c, "LOOP", 110, 6, PX.gold);
  const stepI = Math.floor(t * 2.5) % 3;
  ["COMANDO", "ATUALIZA", "DESENHA"].forEach((w, k) => { const y = 15 + k * 11; if (k === stepI) { c.fillStyle = PX.plum; c.fillRect(109, y - 2, 46, 9); c.fillStyle = PX.gold; c.fillRect(109, y - 2, 2, 9); } ptxt(c, w, 114, y, k === stepI ? PX.pale : PX.aqua); });
  c.fillStyle = PX.aqua; c.fillRect(150, 17, 1, 22); c.fillRect(147, 39, 4, 1); c.fillRect(150, 17, 3, 1); c.fillRect(152, 16, 1, 3);
  ptxt(c, "QUADROS", 110, 52, PX.gold);
  const fr = [HERO.stand, HERO.walk1, HERO.walk2, HERO.jump], cur = jumping ? 3 : Math.floor(t * 8) % 2 + 1;
  fr.forEach((f, k) => { const x = 108 + k * 12, y = 60; c.fillStyle = k === cur ? PX.coral : PX.plum; c.fillRect(x, y, 12, 1); c.fillRect(x, y + 13, 12, 1); c.fillRect(x, y, 1, 14); c.fillRect(x + 11, y, 1, 14); spr(c, f, x + 1, y + 1); });
  ptxt(c, "X:" + String(hx).padStart(2, "0") + " Y:" + String(hy).padStart(2, "0"), 109, 79, PX.mint);
  // upscale, nearest neighbour
  const o = cv.getContext("2d"); o.setTransform(1, 0, 0, 1, 0, 0); o.imageSmoothingEnabled = false; o.drawImage(lo, 0, 0, cv.width, cv.height);
}

/* =========================================================== 6. 3D TOY & MASSINHA */
function sphere3d(c, x, y, r, corBase, corLuz, corSombra) {
  const g = c.createRadialGradient(x - r * .34, y - r * .36, r * .08, x, y, r);
  g.addColorStop(0, corLuz); g.addColorStop(.55, corBase); g.addColorStop(1, corSombra);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
}
function boxIso3d(c, cx, cy, w, h, d, ry, topCol, leftCol, rightCol) {
  const cs = Math.cos(ry), sn = Math.sin(ry), hw = w / 2, hd = d / 2, hh = h / 2;
  const P = (x, y, z) => {
    const rx = x * cs + z * sn, rz = -x * sn + z * cs, f = 520 / (520 - rz * .65);
    return [cx + rx * f, cy + (y - rz * .22) * f];
  };
  const face = (pts, fill) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = fill; c.fill(); };
  const T0 = P(-hw, -hh, -hd), T1 = P(hw, -hh, -hd), T2 = P(hw, -hh, hd), T3 = P(-hw, -hh, hd);
  const B0 = P(-hw, hh, -hd), B1 = P(hw, hh, -hd), B2 = P(hw, hh, hd), B3 = P(-hw, hh, hd);
  if (sn >= 0) face([T0, T3, B3, B0], leftCol); else face([T1, T2, B2, B1], rightCol);
  face([T3, T2, B2, B3], sn >= 0 ? rightCol : leftCol);
  face([T0, T1, T2, T3], topCol);
}
function renderToy3D(cv, t) {
  const [c] = scaled(cv);
  const bg = c.createLinearGradient(0, 0, 0, LH); bg.addColorStop(0, "#F6F7FC"); bg.addColorStop(1, "#DDE1F4");
  c.fillStyle = bg; c.fillRect(0, 0, LW, LH);
  const glow = c.createRadialGradient(220, 110, 10, 320, 170, 320);
  glow.addColorStop(0, "rgba(255,255,255,.85)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = glow; c.fillRect(0, 0, LW, LH);
  font(c, 800, 21); txt(c, "Estúdio 3D Clay", 28, 42, "#1E243B");
  font(c, 500, 11); txt(c, "personagens e volumes suaves com luz real", 29, 60, "#5C6588");
  // Piso e sombras
  c.fillStyle = "rgba(30,36,59,.10)";
  c.beginPath(); c.ellipse(195, 294, 62, 16, 0, 0, 6.2832); c.fill();
  c.beginPath(); c.ellipse(455, 296, 98, 22, 0, 0, 6.2832); c.fill();
  // Personagem / Mascote Toy 3D
  const bounce = Math.abs(Math.sin(t * 2.8)) * 12, wave = Math.sin(t * 4.5) * 14;
  const rx = 195, ry = 236 - bounce;
  c.lineCap = "round";
  // Pernas
  c.strokeStyle = "#2E375C"; c.lineWidth = 15;
  c.beginPath(); c.moveTo(rx - 14, ry + 18); c.lineTo(rx - 18, 286); c.moveTo(rx + 14, ry + 18); c.lineTo(rx + 18, 286); c.stroke();
  // Braços
  c.strokeStyle = "#5B6CFF"; c.lineWidth = 13;
  c.beginPath(); c.moveTo(rx - 28, ry - 4); c.lineTo(rx - 50, ry + 14); c.moveTo(rx + 28, ry - 4); c.lineTo(rx + 56, ry - 26 + wave); c.stroke();
  sphere3d(c, rx + 58, ry - 28 + wave, 9, "#FF785A", "#FFC1B3", "#B9462E");
  // Tronco e Cabeça
  sphere3d(c, rx, ry, 34, "#5B6CFF", "#9AA6FF", "#3441A8");
  sphere3d(c, rx, ry - 56, 38, "#FFFFFF", "#FFFFFF", "#CFD6EE");
  // Antena + visor
  c.strokeStyle = "#2E375C"; c.lineWidth = 4; c.beginPath(); c.moveTo(rx, ry - 94); c.lineTo(rx, ry - 110); c.stroke();
  sphere3d(c, rx, ry - 114, 8, "#FFC84D", "#FFF0B3", "#C78E18");
  c.fillStyle = "#1E243B"; rr(c, rx - 22, ry - 68, 44, 22, 11); c.fill();
  c.fillStyle = "#14C8A8"; c.beginPath(); c.arc(rx - 9, ry - 57, 4, 0, 6.28); c.arc(rx + 9, ry - 57, 4, 0, 6.28); c.fill();
  // Barras 3D e Moeda 3D flutuando
  const vals = [.45, .75, 1.0], cols = [["#6EE7CF", "#14C8A8", "#0B8771"], ["#FF9A83", "#FF785A", "#BE4329"], ["#8C99FF", "#5B6CFF", "#3541AE"]];
  vals.forEach((v, i) => {
    const h = 38 + v * 68 + Math.sin(t * 2.2 + i) * 10;
    boxIso3d(c, 390 + i * 62, 286 - h / 2, 38, h, 38, -0.45 + Math.sin(t * .7) * .12, cols[i][0], cols[i][1], cols[i][2]);
  });
  const coinY = 128 + Math.sin(t * 2.4) * 10, coinW = 6 + Math.abs(Math.cos(t * 2.1)) * 22;
  c.fillStyle = "#D4971A"; c.beginPath(); c.ellipse(460 + 4, coinY, coinW, 24, 0, 0, 6.28); c.fill();
  c.fillStyle = "#FFC84D"; c.beginPath(); c.ellipse(460, coinY, coinW, 24, 0, 0, 6.28); c.fill();
  c.strokeStyle = "#FFF2B2"; c.lineWidth = 2; c.stroke();
}

/* =========================================================== 7. 3D CEL-SHADING ANIME */
function renderCelAnime(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#18132B"; c.fillRect(0, 0, LW, LH);
  // Linhas de velocidade radiais
  c.save(); c.translate(340, 185); c.strokeStyle = "rgba(56,214,255,.16)";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 6.2832 + t * .12, r0 = 110 + ((t * 140 + i * 31) % 90);
    c.lineWidth = i % 3 === 0 ? 2.5 : 1.2;
    c.beginPath(); c.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); c.lineTo(Math.cos(a) * (r0 + 95), Math.sin(a) * (r0 + 95)); c.stroke();
  }
  c.restore();
  // Blocos 3D com contorno duro toon
  const ang = t * .9;
  for (let i = 0; i < 3; i++) {
    const a = ang + i * 2.094, x = 350 + Math.cos(a) * 125, y = 188 + Math.sin(a) * 46;
    const z = Math.sin(a), sc = .72 + (z + 1) * .22;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = "#0D0917"; rr(c, -26 + 5, -26 + 6, 52, 52, 12); c.fill();
    c.fillStyle = ["#FF4D6D", "#FFD166", "#38D6FF"][i]; rr(c, -26, -26, 52, 52, 12); c.fill();
    c.fillStyle = "rgba(255,255,255,.35)"; rr(c, -22, -22, 44, 16, 8); c.fill();
    c.strokeStyle = "#0D0917"; c.lineWidth = 3.5; rr(c, -26, -26, 52, 52, 12); c.stroke();
    c.restore();
  }
  // Núcleo central toon
  const pul = 1 + Math.sin(t * 4) * .06;
  c.save(); c.translate(350, 185); c.scale(pul, pul);
  c.fillStyle = "#0D0917"; c.beginPath(); c.arc(6, 7, 50, 0, 6.28); c.fill();
  c.fillStyle = "#9B72FF"; c.beginPath(); c.arc(0, 0, 50, 0, 6.28); c.fill();
  c.fillStyle = "#C3AAFF"; c.beginPath(); c.arc(-10, -10, 32, 0, 6.28); c.fill();
  c.strokeStyle = "#0D0917"; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 50, 0, 6.28); c.stroke();
  c.fillStyle = "#FFF8EC"; c.beginPath(); c.arc(-18, -18, 8, 0, 6.28); c.fill();
  c.restore();
  // Título estilo anime
  c.fillStyle = "#0D0917"; rr(c, 32, 30, 214, 38, 8); c.fill();
  c.fillStyle = "#FF4D6D"; rr(c, 28, 26, 214, 38, 8); c.fill();
  c.strokeStyle = "#0D0917"; c.lineWidth = 3; c.stroke();
  font(c, 900, 17); txt(c, "AÇÃO EM CEL-SHADING", 135, 50, "#FFF8EC", "center");
  font(c, 700, 11); txt(c, "CONTORNO + SOMBRA EM BLOCO", 30, 82, "#FFD166");
}

/* =========================================================== 8. 3D NEON & HUD */
function renderNeon3D(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#070816"; c.fillRect(0, 0, LW, LH);
  // Grade em perspectiva no chão
  c.strokeStyle = "rgba(0,245,212,.18)"; c.lineWidth = 1;
  const hy = 205;
  for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(320 + i * 18, hy); c.lineTo(320 + i * 78, LH); c.stroke(); }
  for (let j = 0; j < 7; j++) { const f = ((j + (t * 1.4) % 1) / 7), y = hy + f * f * (LH - hy); c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
  // Cubo wireframe neon 3D girando
  const cs = Math.cos(t * .9), sn = Math.sin(t * .9), cx = 250, cy = 175, s = 54;
  const pts = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([x, y, z]) => {
    const rx = x * cs + z * sn, rz = -x * sn + z * cs, ry = y * .9 + rz * .35, f = 3.2 / (3.2 - rz * .6);
    return [cx + rx * s * f, cy + ry * s * f];
  });
  c.save(); c.shadowColor = "#00F5D4"; c.shadowBlur = 14; c.strokeStyle = "#00F5D4"; c.lineWidth = 2.4;
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => {
    c.beginPath(); c.moveTo(pts[a][0], pts[a][1]); c.lineTo(pts[b][0], pts[b][1]); c.stroke();
  });
  c.fillStyle = "#FF3CAC"; c.shadowColor = "#FF3CAC"; c.beginPath(); c.arc(cx, cy, 14 + Math.sin(t * 4) * 3, 0, 6.28); c.fill();
  c.restore();
  // Painel HUD lateral
  c.fillStyle = "rgba(17,23,52,.86)"; rr(c, 370, 82, 232, 186, 10); c.fill();
  c.strokeStyle = "#6C63FF"; c.lineWidth = 1.6; rr(c, 370, 82, 232, 186, 10); c.stroke();
  font(c, 700, 12, "normal", MONO); txt(c, "CRIPTOGRAFIA ATIVA", 388, 110, "#00F5D4");
  for (let i = 0; i < 4; i++) {
    const k = .35 + .65 * (.5 + .5 * Math.sin(t * 2.5 + i * 1.4));
    c.fillStyle = "rgba(233,244,255,.12)"; rr(c, 388, 130 + i * 30, 194, 12, 6); c.fill();
    c.fillStyle = i % 2 ? "#FF3CAC" : "#00F5D4"; rr(c, 388, 130 + i * 30, 194 * k, 12, 6); c.fill();
  }
  font(c, 700, 20); txt(c, "3D NEON HUD", 30, 46, "#E9F4FF");
  font(c, 500, 10.5, "normal", MONO); txt(c, "SISTEMA SEGURO · CAMADA 3D", 31, 64, "#FF3CAC");
}

/* =========================================================== 9. AQUARELA */
function renderAquarela(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#FAF6EE"; c.fillRect(0, 0, LW, LH);
  c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = .45; c.drawImage(fiber(), 0, 0, 1280, 720); c.restore();
  // Manchas orgânicas de aquarela
  const manchas = [
    [220 + Math.sin(t * .6) * 8, 195, 115, "76,126,168"],
    [350 + Math.cos(t * .5) * 10, 175, 105, "224,122,95"],
    [450, 225 + Math.sin(t * .7) * 6, 95, "129,178,154"],
    [300, 250, 88, "242,204,143"],
  ];
  manchas.forEach(([x, y, r, rgb], i) => {
    const pul = 1 + Math.sin(t * 1.4 + i) * .05;
    const g = c.createRadialGradient(x, y, r * .1, x, y, r * pul);
    g.addColorStop(0, `rgba(${rgb},.42)`); g.addColorStop(.75, `rgba(${rgb},.24)`); g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * pul, 0, 6.28); c.fill();
  });
  // Traços delicados de nanquim por cima
  c.strokeStyle = "#2B303A"; c.lineWidth = 2; c.lineCap = "round";
  c.beginPath();
  for (let x = 80; x <= 560; x += 8) {
    const y = 210 + Math.sin(x * .025 - t * 1.8) * 28 + Math.cos(x * .06 + t) * 10;
    x === 80 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.stroke();
  for (let i = 0; i < 4; i++) {
    const x = 150 + i * 115, y = 210 + Math.sin(x * .025 - t * 1.8) * 28;
    c.fillStyle = "#FFFDF8"; c.beginPath(); c.arc(x, y, 10, 0, 6.28); c.fill();
    c.strokeStyle = "#2B303A"; c.lineWidth = 2; c.stroke();
  }
  font(c, 700, 24, "normal", "Georgia, serif"); txt(c, "Aquarela & Tinta Viva", 34, 50, "#2B303A");
  font(c, 500, 12, "normal", "Georgia, serif"); txt(c, "pigmento orgânico sobre papel texturizado", 35, 70, "#4C7EA8");
}

/* =========================================================== 10. RISOGRAFIA */
function renderRiso(cv, t) {
  const [c] = scaled(cv);
  const st = Math.floor(t * 12) / 12;
  c.fillStyle = "#F4EFE4"; c.fillRect(0, 0, LW, LH);
  // Retícula de fundo
  c.fillStyle = "rgba(0,120,191,.13)";
  for (let x = 24; x < LW; x += 28) for (let y = 24; y < LH; y += 28) { c.beginPath(); c.arc(x, y, 1.8, 0, 6.28); c.fill(); }
  // Chapas desalinhadas em multiply
  c.save(); c.globalCompositeOperation = "multiply";
  const dx = Math.sin(st * 4) * 3;
  c.fillStyle = "#FF48B0"; c.beginPath(); c.arc(230 + dx, 195, 72, 0, 6.28); c.fill();
  c.fillStyle = "#0078BF"; c.beginPath(); c.arc(242 - dx, 202, 72, 0, 6.28); c.fill();
  c.fillStyle = "#FF6C2F"; rr(c, 340, 130 + dx, 220, 118, 6); c.fill();
  c.fillStyle = "#00A95C"; rr(c, 352, 140 - dx, 220, 118, 6); c.fill();
  c.restore();
  // Texto zine e marcas de registro (+)
  c.strokeStyle = "#1D264B"; c.lineWidth = 1.6;
  [[24, 24], [LW - 24, 24], [24, LH - 24], [LW - 24, LH - 24]].forEach(([x, y]) => {
    c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.moveTo(x, y - 8); c.lineTo(x, y + 8); c.stroke();
  });
  font(c, 900, 22); txt(c, "ZINE RISOGRÁFICO", 38, 52, "#1D264B");
  font(c, 700, 13, "normal", MONO); txt(c, "EDIÇÃO 04 // TINTA SOBREPOSTA", 380, 198, "#FFFBF2");
}

/* =========================================================== 11. RUBBER HOSE 1930 */
function renderRubberHose(cv, t) {
  const [c] = scaled(cv);
  const st = Math.floor(t * 12) / 12, p = Math.abs(Math.sin(st * 3.6)), sq = 1 + (1 - p) * .16;
  c.fillStyle = "#F1E8D6"; c.fillRect(0, 0, LW, LH);
  // Piso e sombras
  c.fillStyle = "#DFD2B8"; c.fillRect(0, 290, LW, 70);
  c.fillStyle = "rgba(24,20,18,.22)"; c.beginPath(); c.ellipse(230, 295, 58 * sq, 12, 0, 0, 6.28); c.fill();
  // Cofrinho / Personagem elástico anos 30
  const y = 225 - p * 44;
  c.strokeStyle = "#181412"; c.lineWidth = 9; c.lineCap = "round";
  c.beginPath(); c.moveTo(205, y + 32); c.quadraticCurveTo(188, 265, 195, 290); c.moveTo(255, y + 32); c.quadraticCurveTo(272, 265, 265, 290); c.stroke();
  c.beginPath(); c.moveTo(184, y); c.quadraticCurveTo(148, y - 20 - p * 20, 138, y - 42); c.moveTo(276, y); c.quadraticCurveTo(312, y - 24, 326, y - 8); c.stroke();
  c.fillStyle = "#FBF7EE"; c.lineWidth = 3.5; c.beginPath(); c.arc(138, y - 42, 11, 0, 6.28); c.fill(); c.stroke();
  c.beginPath(); c.arc(326, y - 8, 11, 0, 6.28); c.fill(); c.stroke();
  c.save(); c.translate(230, y); c.scale(sq, 2 - sq);
  c.fillStyle = "#D95D39"; c.beginPath(); c.ellipse(0, 0, 56, 46, 0, 0, 6.28); c.fill(); c.strokeStyle = "#181412"; c.lineWidth = 4; c.stroke();
  // Olhos estilo pie-cut
  for (const ex of [-16, 16]) {
    c.fillStyle = "#FBF7EE"; c.beginPath(); c.ellipse(ex, -10, 10, 14, 0, 0, 6.28); c.fill(); c.stroke();
    c.fillStyle = "#181412"; c.beginPath(); c.arc(ex + 3, -10, 4.5, 0, 6.28); c.fill();
  }
  c.beginPath(); c.arc(0, 12, 16, .1, Math.PI - .1); c.stroke();
  c.restore();
  // Moeda saltando
  const my = 155 + Math.sin(st * 4.2) * 28;
  c.fillStyle = "#E8B954"; c.strokeStyle = "#181412"; c.lineWidth = 3.5; c.beginPath(); c.arc(460, my, 32, 0, 6.28); c.fill(); c.stroke();
  font(c, 900, 22); txt(c, "$", 460, my + 8, "#181412", "center");
  font(c, 900, 22); txt(c, "RUBBER HOSE 1930", 34, 48, "#181412");
  font(c, 700, 12); txt(c, "FÍSICA ELÁSTICA + TRAÇO VINTAGE", 35, 68, "#5C8078");
}

/* =========================================================== 12. QUADRO BRANCO */
function renderQuadroBranco(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#FBFBF9"; c.fillRect(0, 0, LW, LH);
  c.fillStyle = "rgba(37,99,235,.13)";
  for (let x = 28; x < LW; x += 28) for (let y = 28; y < LH; y += 28) { c.beginPath(); c.arc(x, y, 1.3, 0, 6.28); c.fill(); }
  const k = clamp((t % 6) / 3.5);
  // Marca-texto amarelo atrás do título
  c.fillStyle = "rgba(245,158,11,.32)"; rr(c, 34, 24, 270 * clamp(k * 2), 34, 6); c.fill();
  font(c, 800, 22, "normal", MONO); txt(c, "REGRA 50 · 30 · 20", 42, 48, "#1E2430");
  // Círculo desenhando ao vivo
  const cx = 220, cy = 208, r = 82;
  c.lineCap = "round";
  c.strokeStyle = "#2563EB"; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 6.28 * .5 * k); c.stroke();
  if (k > .35) { c.strokeStyle = "#10B981"; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2 + 6.28 * .5, -Math.PI / 2 + 6.28 * (.5 + .3 * clamp((k - .35) / .4))); c.stroke(); }
  if (k > .65) { c.strokeStyle = "#EF4444"; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2 + 6.28 * .8, -Math.PI / 2 + 6.28 * (.8 + .2 * clamp((k - .65) / .35))); c.stroke(); }
  // Rótulos escritos
  [["50% ESSENCIAL", 370, 140, "#2563EB"], ["30% DESEJOS", 370, 200, "#10B981"], ["20% RESERVA", 370, 260, "#EF4444"]].forEach(([s, x, y, col], i) => {
    if (k > i * .25) {
      c.fillStyle = col; c.beginPath(); c.arc(x - 16, y - 5, 6, 0, 6.28); c.fill();
      font(c, 700, 16, "normal", MONO); txt(c, s, x, y, "#1E2430");
    }
  });
}

/* =========================================================== 13. BENTO UI & SAAS */
function renderBentoUI(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#0C101B"; c.fillRect(0, 0, LW, LH);
  const ativo = Math.floor(t / 1.8) % 3;
  const card = (x, y, w, h, ac) => {
    c.fillStyle = "#171E2E"; rr(c, x, y, w, h, 14); c.fill();
    c.strokeStyle = ac ? "#6366F1" : "rgba(255,255,255,.12)"; c.lineWidth = ac ? 2.2 : 1; rr(c, x, y, w, h, 14); c.stroke();
  };
  card(32, 34, 270, 144, ativo === 0);
  card(320, 34, 288, 144, ativo === 1);
  card(32, 196, 386, 130, ativo === 2);
  card(436, 196, 172, 130, false);
  // Conteúdo dos cartões
  font(c, 600, 11); txt(c, "LEADS ATIVOS", 52, 62, "#94A3B8");
  font(c, 800, 32); txt(c, "+" + Math.round(128 + Math.sin(t * 2) * 14), 52, 108, "#22D3EE");
  c.fillStyle = "#34D399"; rr(c, 52, 126, 94, 24, 12); c.fill();
  font(c, 700, 11); txt(c, "● AO VIVO", 99, 142, "#0C101B", "center");
  // Sparkline cartão 2
  font(c, 600, 11); txt(c, "CONVERSÃO", 340, 62, "#94A3B8");
  c.strokeStyle = "#6366F1"; c.lineWidth = 3; c.beginPath();
  for (let i = 0; i <= 12; i++) { const x = 342 + i * 20, y = 148 - (Math.sin(i * .6 + t * 2.5) * .3 + i / 16) * 60; i ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.stroke();
  // Barras cartão 3
  font(c, 600, 11); txt(c, "AUTOMAÇÃO IA", 52, 224, "#94A3B8");
  for (let i = 0; i < 6; i++) {
    const h = 24 + (Math.sin(t * 3 + i) * .5 + .5) * 44;
    c.fillStyle = i === 4 ? "#22D3EE" : "#6366F1"; rr(c, 56 + i * 54, 304 - h, 34, h, 6); c.fill();
  }
  font(c, 800, 26); txt(c, "99%", 522, 264, "#F3F6FC", "center");
  font(c, 600, 11); txt(c, "BENTO UI", 522, 288, "#34D399", "center");
  // Cursor guiado
  const pos = [[165, 110], [460, 105], [220, 265]][ativo];
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.moveTo(pos[0], pos[1]); c.lineTo(pos[0] + 16, pos[1] + 10); c.lineTo(pos[0] + 6, pos[1] + 12); c.lineTo(pos[0] + 3, pos[1] + 20); c.closePath(); c.fill();
}

/* =========================================================== 14. TIPOGRAFIA CINÉTICA */
function renderTipoCinetica(cv, t) {
  const [c] = scaled(cv);
  const cyc = t % 4, flip = cyc > 2.4 && cyc < 3.4;
  c.fillStyle = flip ? "#FFD60A" : "#111116"; c.fillRect(0, 0, LW, LH);
  const ink = flip ? "#111116" : "#F8F8F4";
  // Faixa correndo no topo
  c.fillStyle = flip ? "#111116" : "#FF3B30"; c.fillRect(0, 28, LW, 34);
  font(c, 800, 14, "normal", MONO); txt(c, "01 · GANCHO FORTE   ·   02 · RITMO RÁPIDO   ·   03 · RETENÇÃO", 320 - ((t * 90) % 240), 50, "#F8F8F4", "center");
  // Palavras em escala de impacto
  const sc = .92 + Math.sin(t * 6) * .04;
  c.save(); c.translate(320, 160); c.scale(sc, sc);
  font(c, 900, 58); txt(c, flip ? "VIRALIZA!" : "NÃO TRAVE", 0, 0, ink, "center");
  c.restore();
  font(c, 900, 38); txt(c, "O SEU VÍDEO", 320, 224, flip ? "#FF3B30" : "#FFD60A", "center");
  // Barra de risco / sublinhado animado
  const w = 360 * clamp((cyc % 2) * 1.4);
  c.fillStyle = flip ? "#111116" : "#30D158"; c.fillRect(140, 246, w, 10);
  font(c, 700, 13, "normal", MONO); txt(c, "TIPOGRAFIA COMO PROTAGONISTA", 320, 306, flip ? "#111116" : "#64D2FF", "center");
}

/* =========================================================== 15. MAPA & SATÉLITE */
function renderMapaDoc(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#0B1A28"; c.fillRect(0, 0, LW, LH);
  c.strokeStyle = "rgba(56,189,248,.09)"; c.lineWidth = 1;
  for (let x = 0; x < LW; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, LH); c.stroke(); }
  for (let y = 0; y < LH; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
  // Massas continentais estilizadas
  const terra = (pts, acesa) => {
    c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
    c.fillStyle = acesa ? "rgba(56,189,248,.22)" : "#162B3D"; c.fill();
    c.strokeStyle = acesa ? "#38BDF8" : "#274762"; c.lineWidth = 2; c.stroke();
  };
  terra([[60, 110], [190, 90], [230, 175], [165, 290], [95, 270], [70, 195]], true);
  terra([[290, 85], [470, 75], [560, 145], [510, 275], [380, 285], [310, 185]], false);
  // Rota em arco + ponto viajando
  const p0 = [150, 165], p1 = [445, 175], ctrl = [295, 65];
  c.strokeStyle = "#F97316"; c.lineWidth = 3; c.setLineDash([7, 7]); c.lineDashOffset = -t * 30;
  c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(ctrl[0], ctrl[1], p1[0], p1[1]); c.stroke(); c.setLineDash([]);
  const u = (t * .45) % 1, bx = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * ctrl[0] + u * u * p1[0];
  const by = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * ctrl[1] + u * u * p1[1];
  c.fillStyle = "#FACC15"; c.beginPath(); c.arc(bx, by, 6, 0, 6.28); c.fill();
  // Pinos com radar
  [p0, p1].forEach(([px, py], i) => {
    const r = 8 + ((t * 18 + i * 10) % 18);
    c.strokeStyle = "rgba(74,222,128,.55)"; c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, r, 0, 6.28); c.stroke();
    c.fillStyle = "#4ADE80"; c.beginPath(); c.arc(px, py, 6, 0, 6.28); c.fill();
  });
  font(c, 800, 20); txt(c, "ROTAS & GEOPOLÍTICA", 30, 44, "#F0F6FA");
  font(c, 600, 10.5, "normal", MONO); txt(c, "LAT -23.5 · LON -46.6 · ESCALA GLOBAL", 30, 334, "#38BDF8");
}

/* =========================================================== 16. COLAGEM EDITORIAL */
function renderColagem(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#EFEAE0"; c.fillRect(0, 0, LW, LH);
  c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = .55; c.drawImage(fiber(), 0, 0, 1280, 720); c.restore();
  // Recortes em camadas
  c.save(); c.translate(220, 185); c.rotate(-.04);
  c.fillStyle = "rgba(27,27,29,.22)"; c.fillRect(-130 + 6, -92 + 8, 260, 184);
  c.fillStyle = "#FCF9F2"; c.fillRect(-130, -92, 260, 184);
  c.fillStyle = "#FACC15"; c.fillRect(-110, -68, 175 * clamp((t % 3) * 1.4), 24);
  font(c, 900, 16); txt(c, "ARQUIVO CONFIDENCIAL", -104, -50, "#1B1B1D");
  for (let i = 0; i < 4; i++) {
    const h = 24 + ((i + 1) * 16) * (.7 + .3 * Math.sin(t * 2 + i));
    c.fillStyle = i === 2 ? "#E11D48" : "#0EA5E9"; c.fillRect(-95 + i * 48, 66 - h, 30, h);
  }
  c.restore();
  // Fita adesiva e carimbo
  c.save(); c.translate(200, 88); c.rotate(.15); c.fillStyle = "rgba(250,204,21,.65)"; c.fillRect(-34, -10, 68, 20); c.restore();
  const s = 1 + Math.max(0, Math.sin(t * 3) * .08);
  c.save(); c.translate(475, 195); c.rotate(-.16); c.scale(s, s);
  c.strokeStyle = "#E11D48"; c.lineWidth = 4; rr(c, -74, -28, 148, 56, 6); c.stroke();
  font(c, 900, 22); txt(c, "REVELADO", 0, 8, "#E11D48", "center");
  c.restore();
  font(c, 900, 22); txt(c, "COLAGEM EDITORIAL", 34, 48, "#1B1B1D");
}

/* =========================================================== 17. BAUHAUS SUÍÇO */
function renderBauhaus(cv, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#F4F1EA"; c.fillRect(0, 0, LW, LH);
  // Grade suíça
  c.strokeStyle = "rgba(17,17,17,.12)"; c.lineWidth = 1;
  for (let x = 80; x < LW; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, LH); c.stroke(); }
  for (let y = 90; y < LH; y += 90) { c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
  // Sólidos geométricos Bauhaus em rotação escalonada
  const a = Math.floor(t / 1.4) * (Math.PI / 2) + eio(clamp((t % 1.4) / .6)) * (Math.PI / 2);
  c.save(); c.translate(420, 180); c.rotate(a);
  c.fillStyle = "#D92B2B"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 96, 0, Math.PI / 2); c.closePath(); c.fill();
  c.fillStyle = "#1D4ED8"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 96, Math.PI, Math.PI * 1.5); c.closePath(); c.fill();
  c.fillStyle = "#F2B705"; c.beginPath(); c.arc(0, 0, 42, 0, 6.28); c.fill();
  c.restore();
  c.fillStyle = "#111111"; c.fillRect(40, 120, 240, 12);
  c.fillStyle = "#D92B2B"; c.fillRect(40, 250, 96, 40);
  c.fillStyle = "#1D4ED8"; c.fillRect(148, 250, 96, 40);
  font(c, 900, 32); txt(c, "BAUHAUS", 40, 102, "#111111");
  font(c, 700, 14); txt(c, "01 · FORMA   02 · GRADE", 40, 165, "#111111");
  font(c, 700, 14); txt(c, "03 · CONTRASTE PURO", 40, 190, "#D92B2B");
}

const RENDER = [
  renderPaper, renderGlass, renderIso, renderFlat, renderPixel,
  renderToy3D, renderCelAnime, renderNeon3D, renderAquarela, renderRiso, renderRubberHose,
  renderQuadroBranco, renderBentoUI, renderTipoCinetica, renderMapaDoc, renderColagem, renderBauhaus,
];
