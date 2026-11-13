// Kit de movimento — motor comum a todos os estilos. Não desenha nada: só devolve números.
// Funciona no navegador, no Remotion e no Node. Tudo é função pura do tempo `t` (em segundos),
// então qualquer instante pode ser desenhado sob demanda, na página e na renderização.
//
// É um ponto de partida, não um limite: copie, mude e crie funções novas à vontade.

/* ---------------------------------------------------------------- básicos */
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
/** Progresso 0..1 de `t` entre dois tempos. */
export const prog = (t, de, ate) => clamp((t - de) / ((ate - de) || 1e-6));
/** Tempo em passos, para a cadência de stop-motion (12 quadros por segundo no papel, 8 no pixel). */
export const passo = (t, qps = 12) => Math.floor(t * qps) / qps;

export function rng(semente = 1) {
  let a = semente >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
/** Ruído suave entre -1 e 1, sempre igual para o mesmo `t` e a mesma semente. */
export function ruido(t, semente = 0) {
  const i = Math.floor(t), f = t - i, v = n => rng((n * 374761393 + semente * 668265263) | 0)() * 2 - 1;
  const s = f * f * (3 - 2 * f);
  return lerp(v(i), v(i + 1), s);
}
/** Lista de `n` sorteios fixos (u, v, w, q entre 0 e 1) para partículas: chuva, faíscas, papéis voando. */
export function semear(n, semente = 1) {
  const r = rng(semente);
  return Array.from({ length: n }, (_, i) => ({ i, u: r(), v: r(), w: r(), q: r() }));
}

/* ---------------------------------------------------------------- curvas */
export const E = {
  linear: k => k,
  entra: k => k * k * k,
  sai: k => 1 - Math.pow(1 - k, 3),
  entraSai: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  /** passa um pouco do ponto e volta */
  volta: k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  elastico: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * 2.0944) + 1,
  quique: k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; },
};
/** Mola amortecida de 0 a 1: `k` é o progresso 0..1. Mais `freq` = mais balanço; mais `amort` = para antes. */
export function mola(k, { freq = 2.4, amort = 5 } = {}) {
  if (k <= 0) return 0; if (k >= 1) return 1;
  return 1 - Math.exp(-amort * k) * Math.cos(freq * 6.2832 * k);
}

/* ---------------------------------------------------------------- transformações
   Uma transformação é { x, y, s, sx, sy, r, a }: deslocamento, escala, rotação (radianos) e opacidade. */
export const neutra = () => ({ x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, a: 1 });
export function combinar(...ts) {
  const o = neutra();
  for (const t of ts) { if (!t) continue; o.x += t.x || 0; o.y += t.y || 0; o.r += t.r || 0; o.s *= t.s ?? 1; o.sx *= t.sx ?? 1; o.sy *= t.sy ?? 1; o.a *= t.a ?? 1; }
  return o;
}
/** Aplica a transformação num contexto de canvas (use entre save() e restore()). */
export function aplicar(ctx, tr) {
  ctx.translate(tr.x || 0, tr.y || 0);
  if (tr.r) ctx.rotate(tr.r);
  ctx.scale((tr.s ?? 1) * (tr.sx ?? 1), (tr.s ?? 1) * (tr.sy ?? 1));
  if ((tr.a ?? 1) < 1) ctx.globalAlpha *= clamp(tr.a);
}

const DIRECOES = { esquerda: [-1, 0], direita: [1, 0], cima: [0, -1], baixo: [0, 1] };

/** Entradas prontas. `k` é o progresso 0..1 da entrada; devolve a transformação daquele instante.
    Tipos: pop, deslizar, cair, subir, girar, crescer, surgir, carimbar, desdobrar, pendurar, rolar. */
export function entrada(tipo, k, { de = "baixo", dist = 400 } = {}) {
  k = clamp(k);
  const o = neutra(), [dx, dy] = DIRECOES[de] || DIRECOES.baixo;
  if (k <= 0) return { ...o, a: 0, s: tipo === "deslizar" || tipo === "cair" ? 1 : 0 };
  switch (tipo) {
    case "pop": o.s = mola(k); o.a = clamp(k * 6); break;
    case "deslizar": { const e = E.volta(k); o.x = dx * dist * (1 - e); o.y = dy * dist * (1 - e); o.r = dx * .12 * (1 - E.sai(k)); o.a = clamp(k * 5); break; }
    case "cair": { o.y = -dist * (1 - E.quique(k)); o.sy = 1 - .12 * Math.sin(clamp((k - .36) * 6) * Math.PI); o.a = clamp(k * 8); break; }
    case "subir": o.y = dist * .35 * (1 - E.sai(k)); o.a = E.sai(k); break;
    case "girar": o.r = (1 - E.volta(k)) * -1.6; o.s = E.volta(k); o.a = clamp(k * 5); break;
    case "crescer": o.sy = mola(k, { freq: 1.6, amort: 6 }); o.a = clamp(k * 8); break;
    case "surgir": o.a = E.entraSai(k); o.s = lerp(.92, 1, E.sai(k)); break;
    case "carimbar": { const e = E.entra(clamp(k * 2.2)); o.s = lerp(2.6, 1, e); o.a = clamp(k * 5); const tr = k > .45 ? Math.exp(-(k - .45) * 9) * (1 - k) : 0; o.x = Math.sin(k * 90) * 9 * tr; o.r = Math.sin(k * 70) * .03 * tr; break; }
    case "desdobrar": o.sx = E.volta(k); o.a = clamp(k * 8); break;
    case "pendurar": o.r = Math.exp(-4 * k) * Math.sin(k * 14) * .5; o.y = -dist * (1 - E.sai(clamp(k * 2))); o.a = clamp(k * 8); break;
    case "rolar": o.x = dx * dist * (1 - E.sai(k)); o.r = -dx * (1 - E.sai(k)) * 6.2832; o.a = clamp(k * 6); break;
    default: o.a = k;
  }
  return o;
}
export const ENTRADAS = ["pop", "deslizar", "cair", "subir", "girar", "crescer", "surgir", "carimbar", "desdobrar", "pendurar", "rolar"];

/** Saídas prontas: `k` vai de 0 (ainda na tela) a 1 (fora). Tipos: encolher, deslizar, cair, sumir, voar. */
export function saida(tipo, k, { para = "baixo", dist = 500 } = {}) {
  k = clamp(k);
  const o = neutra(), [dx, dy] = DIRECOES[para] || DIRECOES.baixo, e = E.entra(k);
  switch (tipo) {
    case "encolher": o.s = 1 - E.entra(k); o.r = e * .5; break;
    case "deslizar": o.x = dx * dist * e; o.y = dy * dist * e; break;
    case "cair": o.y = dist * e; o.r = e * .7; break;
    case "voar": o.y = -dist * e; o.x = dist * .4 * e; o.r = -e * .5; o.s = 1 - e * .4; break;
    default: o.a = 1 - k; o.s = 1 - e * .06;
  }
  return o;
}

/** Movimento contínuo, para nada ficar parado enquanto está na tela.
    Tipos: respirar, flutuar, balancar, tremer, pulsar, pairar, vento. */
export function vivo(tipo, t, { amp = 1, vel = 1, semente = 0 } = {}) {
  const o = neutra(), f = t * vel + semente * 1.37;
  switch (tipo) {
    case "respirar": o.sy = 1 + .018 * amp * Math.sin(f * 2.2); o.sx = 1 - .008 * amp * Math.sin(f * 2.2); break;
    case "flutuar": o.y = Math.sin(f * 1.7) * 10 * amp; o.r = Math.sin(f * 1.1 + 1) * .03 * amp; break;
    case "balancar": o.r = Math.sin(f * 2.4) * .07 * amp; break;
    case "tremer": o.x = ruido(f * 14, semente) * 4 * amp; o.y = ruido(f * 14, semente + 9) * 4 * amp; break;
    case "pulsar": o.s = 1 + .05 * amp * Math.pow(Math.max(0, Math.sin(f * 3.2)), 3); break;
    case "pairar": o.x = Math.sin(f * 1.3) * 14 * amp; o.y = Math.sin(f * 2.1 + .7) * 9 * amp; break;
    case "vento": o.r = (Math.sin(f * 1.6) * .05 + ruido(f * 2, semente) * .04) * amp; break;
  }
  return o;
}

/* ---------------------------------------------------------------- ritmo: beats
   Um beat é um trecho do vídeo (de, ate, em segundos), normalmente uma frase da narração. */
/** Fases de um trecho: `entra` 0..1 no começo, `sai` 0..1 no fim, `local` segundos desde o início. */
export function fase(t, de, ate, { entra = .5, sai = .35 } = {}) {
  return { ativo: t >= de && t < ate, local: t - de, k: prog(t, de, ate), entra: prog(t, de, de + entra), sai: prog(t, ate - sai, ate) };
}
/** Progresso 0..1 do item `i` de uma lista que entra em cascata. */
export const escalonar = (i, local, { atraso = .12, dur = .5, espera = 0 } = {}) => clamp((local - espera - i * atraso) / dur);

const semAcento = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
/** Em que segundo a palavra é falada. `legendas` é o conteúdo de saida/legendas/legendas.json.
    `ocorrencia` escolhe a 1ª, 2ª... vez. Devolve null se a palavra não for dita. */
export function tempoDaPalavra(legendas, palavra, ocorrencia = 1) {
  const alvo = semAcento(palavra); let n = 0;
  for (const w of legendas?.palavras || []) if (semAcento(w.palavra).startsWith(alvo) && ++n === ocorrencia) return w.inicio;
  return null;
}
/** Divide a narração em beats pelas palavras que abrem cada frase.
    inicios = ["Em 1977", "O que os militares", ...] → [{ de, ate, texto }]. */
export function beatsPorFrases(legendas, inicios) {
  const ps = legendas?.palavras || [], cortes = [];
  let i = 0;
  for (const ini of inicios) {
    const alvo = String(ini).trim().split(/\s+/).map(semAcento).filter(Boolean);
    let achou = -1;
    for (let j = i; j <= ps.length - alvo.length && achou < 0; j++) if (alvo.every((a, k) => semAcento(ps[j + k].palavra) === a)) achou = j;
    if (achou < 0) throw new Error(`a narração não tem o trecho "${ini}" depois de ${i ? ps[i - 1].fim.toFixed(1) + " s" : "o início"}`);
    cortes.push(achou); i = achou + alvo.length;
  }
  const fim = legendas.duracao || ps.at(-1)?.fim || 0;
  return cortes.map((c, n) => ({ de: n === 0 ? 0 : ps[c].inicio, ate: n + 1 < cortes.length ? ps[cortes[n + 1]].inicio : fim, texto: ps.slice(c, cortes[n + 1] ?? ps.length).map(w => w.palavra).join(" ") }));
}

/** Confere um plano de beats antes de animar. Cada beat: { de, ate, fala, mostra: [..], move: [..], entrada, transicao }.
    Devolve uma lista de avisos; vazia quando o plano está bom. */
export function conferirBeats(beats, { maxParado = 4, minMovimentos = 3 } = {}) {
  const av = [];
  beats.forEach((b, i) => {
    const n = `beat ${i + 1}` + (b.fala ? ` ("${String(b.fala).slice(0, 28)}…")` : "");
    if (!(b.ate > b.de)) av.push(`${n}: tempos inválidos.`);
    if (!b.mostra?.length) av.push(`${n}: não diz o que aparece na tela.`);
    if ((b.move?.length || 0) < minMovimentos) av.push(`${n}: só ${b.move?.length || 0} coisa(s) em movimento; precisa de pelo menos ${minMovimentos}.`);
    if (b.ate - b.de > maxParado && (b.momentos?.length || 0) < Math.floor((b.ate - b.de) / maxParado)) av.push(`${n}: dura ${(b.ate - b.de).toFixed(1)} s sem novos momentos; acrescente um acontecimento a cada ${maxParado} s.`);
    for (const p of b.palavrasChave || []) if (!JSON.stringify(b.mostra || []).toLowerCase().includes(String(p).toLowerCase())) av.push(`${n}: a palavra "${p}" é falada mas não aparece em "mostra".`);
    const a = beats[i - 1];
    if (a) {
      if (a.transicao && a.transicao === b.transicao) av.push(`${n}: mesma transição do beat anterior (${b.transicao}).`);
      if (a.entrada && a.entrada === b.entrada) av.push(`${n}: mesma entrada do beat anterior (${b.entrada}).`);
      if (Math.abs(b.de - a.ate) > .05) av.push(`${n}: começa em ${b.de} s, mas o anterior termina em ${a.ate} s.`);
    }
  });
  return av;
}

/* ---------------------------------------------------------------- caminhos e câmera */
/** Caminho por pontos [[x,y],...]. `em(k)` devolve posição e ângulo no progresso 0..1, com velocidade constante. */
export function caminho(pontos, { suave = true } = {}) {
  let pts = pontos;
  if (suave && pontos.length > 2) {
    pts = [];
    const P = i => pontos[clamp(i, 0, pontos.length - 1)];
    for (let i = 0; i < pontos.length - 1; i++) for (let s = 0; s < 12; s++) {
      const u = s / 12, [a, b, c, d] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
      const cr = n => .5 * (2 * b[n] + (-a[n] + c[n]) * u + (2 * a[n] - 5 * b[n] + 4 * c[n] - d[n]) * u * u + (-a[n] + 3 * b[n] - 3 * c[n] + d[n]) * u * u * u);
      pts.push([cr(0), cr(1)]);
    }
    pts.push(pontos.at(-1));
  }
  const ac = [0];
  for (let i = 1; i < pts.length; i++) ac.push(ac[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = ac.at(-1) || 1;
  return {
    comprimento: total, pontos: pts,
    em(k) {
      const alvo = clamp(k) * total; let i = 1;
      while (i < pts.length - 1 && ac[i] < alvo) i++;
      const u = (alvo - ac[i - 1]) / ((ac[i] - ac[i - 1]) || 1), a = pts[i - 1], b = pts[i];
      return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    },
    /** os pontos do começo até o progresso k, para desenhar um traço que cresce */
    ate(k) { const alvo = clamp(k) * total, out = []; for (let i = 0; i < pts.length && ac[i] <= alvo; i++) out.push(pts[i]); const p = this.em(k); out.push([p.x, p.y]); return out; },
  };
}
/** Arco de um ponto a outro (para coisas arremessadas). `alt` é a altura do arco. */
export function arco(a, b, k, alt = 200) { return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * alt }; }

/** Câmera por chaves [{ t, x, y, zoom, r }]: x e y são o ponto da cena que fica no centro. */
export function camera(t, chaves, curva = E.entraSai) {
  if (!chaves?.length) return { x: null, y: null, zoom: 1, r: 0 };
  let i = 0; while (i < chaves.length - 1 && chaves[i + 1].t <= t) i++;
  const a = chaves[i], b = chaves[Math.min(i + 1, chaves.length - 1)], k = curva(prog(t, a.t, b.t));
  const v = n => lerp(a[n] ?? (n === "zoom" ? 1 : 0), b[n] ?? a[n] ?? (n === "zoom" ? 1 : 0), k);
  return { x: v("x"), y: v("y"), zoom: v("zoom"), r: v("r") };
}
export function aplicarCamera(ctx, cam, W, H) {
  ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); if (cam.r) ctx.rotate(cam.r);
  ctx.translate(-(cam.x ?? W / 2), -(cam.y ?? H / 2));
}
/** Tremor de impacto que some sozinho: use logo depois de um carimbo, queda ou batida em `t0`. */
export function impacto(t, t0, { forca = 18, dur = .45 } = {}) {
  const k = prog(t, t0, t0 + dur); if (k <= 0 || k >= 1) return { x: 0, y: 0 };
  const d = (1 - k) * (1 - k) * forca; return { x: Math.sin(k * 60) * d, y: Math.cos(k * 47) * d * .7 };
}

/* ---------------------------------------------------------------- personagem: esqueleto
   Uma pose são ângulos em graus. 0 = membro pendurado para baixo; positivo = para a frente (lado para onde olha).
   braco/perna: [raiz, dobra]. F = membro da frente, T = de trás. */
const P0 = { tronco: 0, cabeca: 0, bracoF: [8, 10], bracoT: [-8, 12], pernaF: [4, 0], pernaT: [-4, 0], x: 0, y: 0 };
export const POSES = {
  parado: P0,
  apontar: { ...P0, bracoF: [88, 4], tronco: 3 },
  apontarCima: { ...P0, bracoF: [138, 8], cabeca: -14 },
  acenar: { ...P0, bracoF: [150, 35] },
  segurar: { ...P0, bracoF: [62, 48], bracoT: [52, 55] },
  carregar: { ...P0, bracoF: [40, 75], bracoT: [34, 78], tronco: -4 },
  comemorar: { ...P0, bracoF: [162, 4], bracoT: [198, -4], cabeca: -10, y: -.04 },
  assustado: { ...P0, tronco: -10, cabeca: -8, bracoF: [118, 62], bracoT: [146, 70], pernaF: [14, 14], pernaT: [-10, 8] },
  medo: { ...P0, tronco: -8, cabeca: 12, bracoF: [62, 116], bracoT: [56, 122], pernaF: [16, 26], pernaT: [-4, 22] },
  pensando: { ...P0, bracoF: [42, 122], bracoT: [14, 78], cabeca: 9 },
  olharCima: { ...P0, cabeca: -26, tronco: -5, bracoF: [112, 96] },
  maosNaCintura: { ...P0, bracoF: [-32, 104], bracoT: [-40, 108] },
  sentado: { ...P0, pernaF: [86, 86], pernaT: [80, 84], bracoF: [34, 56], bracoT: [26, 58] },
  digitando: { ...P0, pernaF: [86, 86], pernaT: [80, 84], bracoF: [52, 52], bracoT: [46, 54], tronco: 7, cabeca: 6 },
  agachado: { ...P0, pernaF: [72, 122], pernaT: [52, 112], tronco: 26, bracoF: [50, 30], bracoT: [40, 34] },
  empurrar: { ...P0, tronco: 22, bracoF: [78, 12], bracoT: [70, 16], pernaF: [26, 30], pernaT: [-34, 6] },
  continencia: { ...P0, bracoF: [72, 128], tronco: -2 },
  fotografar: { ...P0, bracoF: [70, 96], bracoT: [64, 100], tronco: 5, cabeca: 4 },
  deitado: { ...P0, tronco: 88, cabeca: -6, pernaF: [84, 0], pernaT: [80, 4], bracoF: [98, 8], bracoT: [80, 10] },
};
const mist = (a, b, k) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k);
/** Mistura duas poses: k = 0 é `a`, k = 1 é `b`. */
export function misturar(a, b, k) {
  a = pose(a); b = pose(b); const o = {};
  for (const n of Object.keys(P0)) o[n] = mist(a[n] ?? P0[n], b[n] ?? P0[n], k);
  return o;
}
/** Aceita o nome de uma pose pronta ou um objeto de pose (completo ou só com o que muda). */
export const pose = p => typeof p === "string" ? (POSES[p] || P0) : { ...P0, ...p };

/** Ciclos: devolvem a pose para o instante `t`. vel = passos por segundo. */
export const CICLOS = {
  andar(t, { vel = 1.6, amp = 1 } = {}) {
    const f = t * vel * 6.2832, s = Math.sin(f), c = Math.cos(f);
    return { ...P0, tronco: 4, cabeca: Math.sin(f * 2) * 1.5, pernaF: [28 * amp * s, 8 + 44 * Math.max(0, c)], pernaT: [-28 * amp * s, 8 + 44 * Math.max(0, -c)], bracoF: [-24 * amp * s, 16], bracoT: [24 * amp * s, 16] };
  },
  correr(t, { vel = 2.6 } = {}) {
    const f = t * vel * 6.2832, s = Math.sin(f), c = Math.cos(f);
    return { ...P0, tronco: 16, pernaF: [46 * s, 22 + 74 * Math.max(0, c)], pernaT: [-46 * s, 22 + 74 * Math.max(0, -c)], bracoF: [-48 * s, 86], bracoT: [48 * s, 86], y: -.02 * Math.abs(c) };
  },
  acenar(t, { vel = 2.2 } = {}) { return { ...POSES.acenar, bracoF: [150, 30 + Math.sin(t * vel * 6.2832) * 28] }; },
  digitar(t, { vel = 5 } = {}) { const s = Math.sin(t * vel * 6.2832); return { ...POSES.digitando, bracoF: [52, 52 + s * 7], bracoT: [46, 54 - s * 7], cabeca: 6 + Math.sin(t * 1.3) * 3 }; },
  comemorar(t, { vel = 2 } = {}) { const s = Math.abs(Math.sin(t * vel * 3.1416)); return { ...POSES.comemorar, y: -.09 * s, bracoF: [162 + s * 8, 4], bracoT: [198 - s * 8, -4], pernaF: [6, 18 * (1 - s)], pernaT: [-6, 18 * (1 - s)] }; },
  tremer(t) { const d = Math.sin(t * 38) * 2.2; return { ...POSES.medo, tronco: -8 + d, bracoF: [62 + d, 116], bracoT: [56 - d, 122], cabeca: 12 + d }; },
  remar(t, { vel = .8 } = {}) { const f = t * vel * 6.2832; return { ...POSES.sentado, tronco: 8 + Math.sin(f) * 12, bracoF: [58 + Math.sin(f) * 26, 30 + Math.cos(f) * 20], bracoT: [50 + Math.sin(f) * 26, 34 + Math.cos(f) * 20] }; },
  olhar(t, { vel = .5 } = {}) { return { ...P0, cabeca: Math.sin(t * vel * 6.2832) * 14, tronco: Math.sin(t * vel * 6.2832) * 2 }; },
  empurrar(t, { vel = 1.4 } = {}) { const f = t * vel * 6.2832, s = Math.sin(f), c = Math.cos(f); return { ...POSES.empurrar, pernaF: [26 + 18 * s, 18 + 30 * Math.max(0, c)], pernaT: [-30 - 18 * s, 8 + 30 * Math.max(0, -c)] }; },
  respirar(t) { return { ...P0, bracoF: [8 + Math.sin(t * 2) * 2, 10], bracoT: [-8 - Math.sin(t * 2) * 2, 12], cabeca: Math.sin(t * .9) * 2 }; },
};

/** Atuação: uma sequência de ações no tempo, com passagem suave entre elas.
    roteiro = [{ ate: 2, acao: "andar" }, { ate: 4.5, acao: "apontar" }, { acao: "comemorar" }]
    `acao` é o nome de um ciclo, o nome de uma pose ou um objeto de pose. Poses paradas ganham respiração. */
export function atuar(t, roteiro, { passagem = .28 } = {}) {
  const um = (a, opcoes) => {
    if (typeof a === "function") return a(t);
    if (typeof a === "string" && CICLOS[a]) return CICLOS[a](t, opcoes);
    const p = pose(a), r = Math.sin(t * 2.1);
    return { ...p, bracoT: [p.bracoT[0] - r * 1.5, p.bracoT[1]], cabeca: p.cabeca + Math.sin(t * .8) * 1.5, tronco: p.tronco + r * .6 };
  };
  let ini = 0;
  for (let i = 0; i < roteiro.length; i++) {
    const fim = roteiro[i].ate ?? Infinity;
    if (t < fim || i === roteiro.length - 1) {
      const atual = um(roteiro[i].acao, roteiro[i]);
      if (i > 0 && t - ini < passagem) return misturar(um(roteiro[i - 1].acao, roteiro[i - 1]), atual, E.entraSai((t - ini) / passagem));
      return atual;
    }
    ini = fim;
  }
  return P0;
}

const PROP = { cabeca: .1, pescoco: .028, tronco: .3, braco: .155, ante: .15, coxa: .215, canela: .215 };
/** Transforma uma pose em pontos: cabeca, pescoco, ombro, cotoveloF/T, maoF/T, quadril, joelhoF/T, peF/T.
    O chão fica em y = 0 e a origem entre os pés; y cresce para baixo, como no canvas. O personagem olha para +x. */
export function esqueleto(p, { altura = 300, cabecao = 1 } = {}) {
  p = pose(p);
  const H = altura, g = Math.PI / 180, d = a => [Math.sin(a * g), Math.cos(a * g)];
  const quadril = [0, 0];
  const perna = ([q, j]) => {
    const a = d(q), jo = [a[0] * PROP.coxa * H, a[1] * PROP.coxa * H], b = d(q - j);
    return { jo, pe: [jo[0] + b[0] * PROP.canela * H, jo[1] + b[1] * PROP.canela * H], ang: (q - j) * g };
  };
  const pf = perna(p.pernaF), pt = perna(p.pernaT);
  const cima = [Math.sin(p.tronco * g), -Math.cos(p.tronco * g)];
  const pescoco = [cima[0] * PROP.tronco * H, cima[1] * PROP.tronco * H];
  const ombro = [pescoco[0] - cima[0] * .025 * H, pescoco[1] - cima[1] * .025 * H];
  const braco = ([o, c]) => {
    const a = d(o + p.tronco), co = [ombro[0] + a[0] * PROP.braco * H, ombro[1] + a[1] * PROP.braco * H], b = d(o + c + p.tronco);
    return { co, mao: [co[0] + b[0] * PROP.ante * H, co[1] + b[1] * PROP.ante * H], ang: (o + c + p.tronco) * g };
  };
  const bf = braco(p.bracoF), bt = braco(p.bracoT);
  const cab = [Math.sin((p.tronco + p.cabeca) * g), -Math.cos((p.tronco + p.cabeca) * g)], rc = PROP.cabeca * H * cabecao;
  const cabeca = [pescoco[0] + cab[0] * (PROP.pescoco * H + rc), pescoco[1] + cab[1] * (PROP.pescoco * H + rc)];
  const chao = Math.max(pf.pe[1], pt.pe[1], p.tronco > 60 ? pescoco[1] : -1e9);
  const dy = -chao + (p.y || 0) * H, dx = (p.x || 0) * H, m = ([x, y]) => [x + dx, y + dy];
  return {
    altura: H, raioCabeca: rc, angCabeca: (p.tronco + p.cabeca) * g, angTronco: p.tronco * g,
    cabeca: m(cabeca), pescoco: m(pescoco), ombro: m(ombro), quadril: m(quadril),
    cotoveloF: m(bf.co), maoF: m(bf.mao), angMaoF: bf.ang, cotoveloT: m(bt.co), maoT: m(bt.mao), angMaoT: bt.ang,
    joelhoF: m(pf.jo), peF: m(pf.pe), angPeF: pf.ang, joelhoT: m(pt.jo), peT: m(pt.pe), angPeT: pt.ang,
  };
}
/** Olhos fechados (1) ou abertos (0): pisca de tempos em tempos, em instantes diferentes para cada semente. */
export function piscar(t, semente = 0) {
  const ciclo = 2.6 + (rng(semente + 5)() * 2), f = (t + rng(semente + 11)() * ciclo) % ciclo;
  return f < .12 ? 1 : 0;
}
