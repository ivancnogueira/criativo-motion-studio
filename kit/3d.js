// Kit de movimento — motor 3D procedural.
// Projeta sólidos, extrusões, esferas e personagens articulados em 3D real (rotação XYZ, perspectiva,
// ordenação por profundidade e iluminação direcional) desenhando exclusivamente pelo pincel `p`.
import { clamp, lerp, esqueleto, piscar, CICLOS } from "./movimento.js";
import { misturarCor, circP } from "./pinceis.js";

const TAU = Math.PI * 2;
const HEX = /^#[0-9a-f]{6}$/i;

/** Normaliza um vetor [x, y, z]. */
export function norm3(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Rotaciona ponto [x, y, z] nos eixos X, Y e Z (radianos). */
export function rot3([x, y, z], rx = 0, ry = 0, rz = 0) {
  if (rx) { const c = Math.cos(rx), s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (ry) { const c = Math.cos(ry), s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; }
  if (rz) { const c = Math.cos(rz), s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c]; }
  return [x, y, z];
}

/** Projeta ponto 3D [x, y, z] para [px, py, z, fatorEscala]. */
export function projetar([x, y, z], { fov = 820, camZ = 900, ox = 0, oy = 0 } = {}) {
  const d = Math.max(80, camZ - z);
  const f = fov / d;
  return [ox + x * f, oy + y * f, z, f];
}

/** Calcula tom iluminado/sombreado de `cor` (-1 = sombra máxima, 0 = base, +1 = brilho especular). */
export function tom3d(p, cor, luz = 0) {
  const base = p.cor(cor);
  if (!HEX.test(base)) return base;
  if (p.estilo === "toon") {
    // Cel shading em degraus nítidos
    if (luz > 0.45) return misturarCor(base, "#FFFFFF", 0.34);
    if (luz < -0.1) return misturarCor(base, "#0D0B1A", 0.38);
    return base;
  }
  const esc = p.estilo === "traco" || p.estilo === "vidro" || p.estilo === "neon" ? p.cor("fundo") : "#0F1222";
  if (luz >= 0) return misturarCor(base, "#FFFFFF", clamp(luz, 0, 1) * 0.42);
  return misturarCor(base, esc, clamp(-luz, 0, 1) * 0.48);
}

/** Gera vértices e faces de uma caixa centrada em (0, 0, 0). */
export function caixa3d(w = 100, h = 100, d = 100, cor = "c1", { ox = 0, oy = 0, oz = 0 } = {}) {
  const x = w / 2, y = h / 2, z = d / 2;
  const verts = [
    [-x + ox, -y + oy, z + oz], [x + ox, -y + oy, z + oz], [x + ox, y + oy, z + oz], [-x + ox, y + oy, z + oz],
    [-x + ox, -y + oy, -z + oz], [x + ox, -y + oy, -z + oz], [x + ox, y + oy, -z + oz], [-x + ox, y + oy, -z + oz],
  ];
  const faces = [
    { idx: [0, 1, 2, 3], cor }, // frente
    { idx: [5, 4, 7, 6], cor }, // trás
    { idx: [4, 0, 3, 7], cor }, // esquerda
    { idx: [1, 5, 6, 2], cor }, // direita
    { idx: [4, 5, 1, 0], cor }, // topo
    { idx: [3, 2, 6, 7], cor }, // base
  ];
  return { verts, faces };
}

/** Gera vértices e faces de um cilindro/disco ao longo do eixo Y, centrado em (ox, oy, oz). */
export function cilindro3d(rTopo = 60, rBase = 60, alt = 100, segs = 12, cor = "c1", { ox = 0, oy = 0, oz = 0, corTampa = cor } = {}) {
  const verts = [], faces = [], hy = alt / 2;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * TAU, c = Math.cos(a), s = Math.sin(a);
    verts.push([ox + c * rTopo, oy - hy, oz + s * rTopo]);
    verts.push([ox + c * rBase, oy + hy, oz + s * rBase]);
  }
  const cTop = verts.length; verts.push([ox, oy - hy, oz]);
  const cBot = verts.length; verts.push([ox, oy + hy, oz]);
  for (let i = 0; i < segs; i++) {
    const n = (i + 1) % segs;
    const t0 = i * 2, b0 = t0 + 1, t1 = n * 2, b1 = t1 + 1;
    faces.push({ idx: [t0, t1, b1, b0], cor });
    faces.push({ idx: [cTop, t1, t0], cor: corTampa });
    faces.push({ idx: [cBot, b0, b1], cor: corTampa });
  }
  return { verts, faces };
}

/** Gera pirâmide/cone de base N lados centrada em (ox, oy, oz). */
export function piramide3d(r = 70, alt = 120, lados = 4, cor = "c1", { ox = 0, oy = 0, oz = 0, corBase = cor } = {}) {
  const verts = [[ox, oy - alt / 2, oz]], faces = [];
  for (let i = 0; i < lados; i++) {
    const a = (i / lados) * TAU + Math.PI / 4;
    verts.push([ox + Math.cos(a) * r, oy + alt / 2, oz + Math.sin(a) * r]);
  }
  const baseIdx = [];
  for (let i = 0; i < lados; i++) {
    const a = i + 1, b = ((i + 1) % lados) + 1;
    faces.push({ idx: [0, b, a], cor });
    baseIdx.push(lados - i);
  }
  faces.push({ idx: baseIdx, cor: corBase });
  return { verts, faces };
}

/** Combina múltiplas malhas já posicionadas numa cena única para Z-sorting conjunto. */
export function juntarMalhas(lista) {
  const verts = [], faces = [];
  for (const m of lista) {
    const off = verts.length;
    for (const v of m.verts) verts.push(v);
    for (const f of m.faces) faces.push({ ...f, idx: f.idx.map(i => i + off) });
  }
  return { verts, faces };
}

/** Renderiza uma malha 3D rotacionada e iluminada através do pincel `p`. */
export function desenharMalha3d(p, malha, {
  rx = 0, ry = 0, rz = 0, ox = 0, oy = 0, oz = 0,
  fov = 820, camZ = 900, dirLuz = [-0.45, -0.68, 0.58],
  contorno = null, espessura = 2, culling = true,
} = {}) {
  const L = norm3(dirLuz);
  const rv = malha.verts.map(v => {
    const r = rot3(v, rx, ry, rz);
    return [r[0] + ox, r[1] + oy, r[2] + oz];
  });
  const proj = rv.map(v => projetar(v, { fov, camZ }));

  const visiveis = [];
  for (const f of malha.faces) {
    if (f.idx.length < 3) continue;
    const a = rv[f.idx[0]], b = rv[f.idx[1]], c = rv[f.idx[2]];
    const n = norm3(cross3(sub3(b, a), sub3(c, a)));
    if (culling && n[2] <= 0.01) continue;
    let zMed = 0;
    for (const id of f.idx) zMed += rv[id][2];
    zMed /= f.idx.length;
    const ndl = dot3(n, L);
    const luz = ndl >= 0 ? ndl * 0.85 : ndl * 0.9;
    visiveis.push({ pts: f.idx.map(id => [proj[id][0], proj[id][1]]), z: zMed, cor: tom3d(p, f.cor, luz) });
  }
  visiveis.sort((a, b) => a.z - b.z);
  const corBorda = contorno ?? (p.estilo === "toon" || p.estilo === "quadro" || p.estilo === "retro" ? "tinta" : p.estilo === "traco" ? null : null);
  for (const f of visiveis) {
    p.forma(f.pts, f.cor, { prof: 0, liso: true });
    if (corBorda) p.linha(f.pts, corBorda, espessura, { fechar: true });
  }
  return visiveis.length;
}

/** Esfera 3D volumétrica sombreada com ponto de luz direcional e brilho especular. */
export function esfera3d(p, x, y, r, cor = "c1", { luzX = -0.35, luzY = -0.38, brilho = true } = {}) {
  if (r <= 0.5) return;
  const sombra = tom3d(p, cor, -0.55);
  const meio = tom3d(p, cor, 0.08);
  const claro = tom3d(p, cor, 0.72);
  p.circulo(x, y, r, sombra, { prof: p.estilo === "3d" ? 1 : 0, liso: true });
  p.circulo(x + r * luzX * 0.35, y + r * luzY * 0.35, r * 0.84, meio, { prof: 0, liso: true });
  p.circulo(x + r * luzX * 0.68, y + r * luzY * 0.68, r * 0.52, claro, { prof: 0, liso: true });
  if (brilho && r > 6) {
    p.alfa(p.estilo === "toon" ? 0.95 : 0.72, () =>
      p.circulo(x + r * luzX * 0.95, y + r * luzY * 0.95, Math.max(2, r * 0.2), "#FFFFFF", { prof: 0, liso: true })
    );
  }
}

/** Tubo/cápsula 3D volumétrica entre dois pontos 2D projetados `a` e `b`. */
export function capsula3d(p, a, b, w, cor = "c1") {
  const sombra = tom3d(p, cor, -0.45);
  const claro = tom3d(p, cor, 0.35);
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  p.capsula(a, b, w, sombra);
  p.capsula(
    [a[0] + nx * w * 0.12 - w * 0.08, a[1] + ny * w * 0.12 - w * 0.08],
    [b[0] + nx * w * 0.12 - w * 0.08, b[1] + ny * w * 0.12 - w * 0.08],
    w * 0.58,
    claro
  );
  if (p.estilo === "toon") {
    p.linha([a, b], "tinta", Math.max(2, w * 0.14));
  }
}

/** Personagem articulado 3D que usa exatamente os mesmos esqueletos, poses e ciclos de `kit/movimento.js`.
    Suporta giro em torno do eixo Y (`yaw`, em radianos), sombra no chão e modo robô/toy. */
export function personagem3d(p, {
  pose: ps0, altura = 300, cabecao = 1.35, yaw = 0.42,
  pele = "pele1", roupa = "c1", calca = "c4", cabelo = "tinta", sapato = "tinta",
  chapeu = null, corChapeu = "c2", expressao = "neutro", robo = false, t = 0, semente = 0,
} = {}) {
  const ps = ps0 ?? CICLOS.respirar(t + semente);
  const e = esqueleto(ps, { altura, cabecao });
  const H = altura, wM = H * 0.072, wP = H * 0.088;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const lado = cy >= 0 ? 1 : -1;
  const sepZ = H * 0.095; // afastamento entre lado esquerdo e direito no eixo Z do corpo
  const projPt = ([x, y], z0 = 0) => {
    // O esqueleto nasce olhando para +X; yaw = 0 significa perfil direito, yaw = PI/2 significa frente.
    const rx = x * cy + z0 * sy;
    const rz = -x * sy + z0 * cy;
    const f = 920 / (920 - rz);
    return { p2: [rx * f, y * f], z: rz, f };
  };

  // Sombra de contato 3D no chão
  p.alfa(0.28, () => p.elipse(0, 4, H * 0.22, H * 0.055, "tinta", { prof: 0, liso: true }));

  const q = projPt(e.quadril, 0), om = projPt(e.ombro, 0), pes = projPt(e.pescoco, 0);
  const cab = projPt(e.cabeca, 0);
  const jf = projPt(e.joelhoF, sepZ * 0.65), pf = projPt(e.peF, sepZ * 0.65);
  const jt = projPt(e.joelhoT, -sepZ * 0.65), pt = projPt(e.peT, -sepZ * 0.65);
  const cf = projPt(e.cotoveloF, sepZ * 1.15), mf = projPt(e.maoF, sepZ * 1.15);
  const ct = projPt(e.cotoveloT, -sepZ * 1.15), mt = projPt(e.maoT, -sepZ * 1.15);

  const corPele = robo ? "claro" : pele;
  const itens = [
    {
      z: (q.z + pt.z) * 0.5,
      fn: () => {
        capsula3d(p, q.p2, jt.p2, wP * jt.f, calca);
        capsula3d(p, jt.p2, pt.p2, wP * 0.9 * pt.f, calca);
        esfera3d(p, pt.p2[0] + lado * H * 0.025, pt.p2[1] - H * 0.01, wP * 0.68 * pt.f, sapato, { brilho: false });
      },
    },
    {
      z: (q.z + pf.z) * 0.5,
      fn: () => {
        capsula3d(p, q.p2, jf.p2, wP * jf.f, calca);
        capsula3d(p, jf.p2, pf.p2, wP * 0.9 * pf.f, calca);
        esfera3d(p, pf.p2[0] + lado * H * 0.025, pf.p2[1] - H * 0.01, wP * 0.68 * pf.f, sapato, { brilho: false });
      },
    },
    {
      z: (om.z + mt.z) * 0.5,
      fn: () => {
        capsula3d(p, projPt(e.ombro, -sepZ).p2, ct.p2, wM * ct.f, roupa);
        capsula3d(p, ct.p2, mt.p2, wM * 0.92 * mt.f, roupa);
        esfera3d(p, mt.p2[0], mt.p2[1], wM * 0.62 * mt.f, corPele);
      },
    },
    {
      z: (q.z + om.z) * 0.5,
      fn: () => {
        capsula3d(p, q.p2, om.p2, H * 0.21 * om.f, roupa);
        if (robo) {
          const mid = [(q.p2[0] + om.p2[0]) * 0.5 + sy * H * 0.05, (q.p2[1] + om.p2[1]) * 0.5];
          p.forma(circP(mid[0], mid[1], H * 0.042, 16), "c2", { prof: 0, liso: true });
        }
        capsula3d(p, pes.p2, cab.p2, wM * 0.7, corPele);
      },
    },
    {
      z: (om.z + mf.z) * 0.5,
      fn: () => {
        capsula3d(p, projPt(e.ombro, sepZ).p2, cf.p2, wM * cf.f, roupa);
        capsula3d(p, cf.p2, mf.p2, wM * 0.92 * mf.f, roupa);
        esfera3d(p, mf.p2[0], mf.p2[1], wM * 0.62 * mf.f, corPele);
      },
    },
    {
      z: cab.z + 4,
      fn: () => {
        const r = e.raioCabeca * cab.f;
        p.em({ x: cab.p2[0], y: cab.p2[1], r: e.angCabeca * lado }, () => {
          esfera3d(p, 0, 0, r, corPele);
          if (!robo && cabelo !== "careca") {
            p.forma(circP(-r * 0.06 * lado, -r * 0.56, r * 0.86, 20, r * 0.44), tom3d(p, cabelo, 0.12), { prof: 0, liso: true });
          }
          if (robo) {
            p.capsula([0, -r * 0.9], [0, -r * 1.38], r * 0.1, "c4");
            esfera3d(p, 0, -r * 1.44, r * 0.2, "c2");
          } else if (chapeu === "bone") {
            esfera3d(p, 0, -r * 0.5, r * 0.92, corChapeu, { brilho: false });
            p.forma([[0, -r * 0.45], [r * 1.55 * lado, -r * 0.3], [r * 1.4 * lado, -r * 0.14], [0, -r * 0.25]], corChapeu, { prof: 0, liso: true });
          } else if (chapeu === "capacete") {
            esfera3d(p, 0, -r * 0.38, r * 1.05, corChapeu);
          }
          // Rosto orientado conforme o ângulo 3D (cy, sy)
          const olharX = cy * r * 0.44;
          const olhoSep = Math.max(r * 0.18, Math.abs(sy) * r * 0.34);
          const fechado = piscar(t, semente);
          const oy = -r * 0.02, ro = Math.max(2.5, r * 0.11);
          for (const dir of [-1, 1]) {
            const ex = olharX + dir * olhoSep;
            if (Math.abs(ex) > r * 0.82) continue;
            if (fechado) p.linha([[ex - ro, oy], [ex + ro, oy]], "tinta", Math.max(2, ro * 0.65));
            else if (robo) p.circulo(ex, oy, ro * 1.15, "c2", { prof: 0, liso: true });
            else {
              p.circulo(ex, oy, ro, "tinta", { prof: 0, liso: true });
              p.circulo(ex - ro * 0.28, oy - ro * 0.28, Math.max(1.2, ro * 0.32), "#FFFFFF", { prof: 0, liso: true });
            }
          }
          const bx = olharX, by = r * 0.4;
          if (expressao === "feliz") p.linha([[bx - r * 0.18, by - r * 0.04], [bx, by + r * 0.08], [bx + r * 0.18, by - r * 0.04]], "tinta", Math.max(2, r * 0.07));
          else if (expressao === "susto") p.circulo(bx, by, r * 0.12, "tinta", { prof: 0, liso: true });
          else p.linha([[bx - r * 0.12, by], [bx + r * 0.12, by]], "tinta", Math.max(2, r * 0.06));
        });
      },
    },
  ];
  itens.sort((a, b) => a.z - b.z);
  for (const it of itens) it.fn();
  return e;
}
