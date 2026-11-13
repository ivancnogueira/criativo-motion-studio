// Kit de movimento — filme: junta os beats numa função única desenhar(ctx, t), com transições entre eles.
// A mesma função serve para a página (tocador), para o storyboard (um instante de cada beat) e para a
// renderização quadro a quadro.
//
// É opcional. Um vídeo pode ter a sua própria estrutura; use daqui só o que ajudar.
import { criarPincel, retP, circP } from "./pinceis.js";
import { clamp, E, rng, escalonar, prog } from "./movimento.js";

export const TRANSICOES = ["empurrar", "cortina", "rasgo", "iris", "blocos", "zoom", "virar", "corte"];
/** Transições que combinam com cada pincel; o modo "auto" alterna entre elas sem repetir. */
export const TRANSICOES_DO_ESTILO = { papel: ["rasgo", "virar", "cortina", "empurrar"], flat: ["empurrar", "iris", "cortina", "virar"], pixel: ["blocos", "empurrar", "cortina"], traco: ["cortina", "zoom", "empurrar", "iris"], vidro: ["zoom", "iris", "empurrar", "cortina"] };

/** Cria o filme.
    beats: [{ de, ate, desenhar(q), transicao?, fundo?(q) }]
      q = { p, t, ritmo, local, dur, k, entra, sai, W, H, cx, cy, i, cascata(i, opções) }
        p: pincel · t: tempo do vídeo · ritmo: tempo na cadência do estilo · local: segundos desde o início do beat
        k: progresso 0..1 do beat · entra / sai: 0..1 no começo e no fim · cascata: progresso de itens em sequência
    transicao: "auto" ou um nome de TRANSICOES, usada na chegada de cada beat (o beat pode ter a sua).
    fundo(q): troca o fundo do estilo. sobre(q): desenhado por cima de tudo (legendas, marca). */
export function criarFilme({ largura = 1080, altura = 1920, fps = 30, duracao, estilo = "flat", paleta, semente = 1, beats = [], transicao = "auto", durTransicao = .6, fundo = null, sobre = null } = {}) {
  const p = criarPincel(estilo, { paleta, semente }), W = largura, H = altura;
  const lista = TRANSICOES_DO_ESTILO[p.estilo] || TRANSICOES_DO_ESTILO.flat;
  duracao = duracao ?? (beats.at(-1)?.ate || 0);
  const tipoDe = i => { const t = beats[i].transicao || transicao; return t === "auto" ? lista[(i - 1 + semente) % lista.length] : t; };

  function q(i, t) {
    const b = beats[i], local = t - b.de, dur = b.ate - b.de;
    return { p, t, ritmo: p.ritmo(t), local, dur, k: clamp(local / dur), entra: prog(local, 0, .5), sai: prog(local, dur - .35, dur), W, H, cx: W / 2, cy: H / 2, i, beat: b, cascata: (n, o) => escalonar(n, local, o) };
  }
  function camada(i, t) { const x = q(i, t), f = beats[i].fundo || fundo; f ? f(x) : p.fundo(t); beats[i].desenhar(x); }

  function transitar(tipo, k, i, t) {
    const c = p.c, A = () => camada(i - 1, t), B = () => camada(i, t), e = E.entraSai(k), dir = i % 2 ? 1 : -1;
    const dentro = (pts, fn) => { c.save(); c.beginPath(); for (const pl of pts) { pl.forEach(([x, y], n) => n ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); } c.clip(); fn(); c.restore(); };
    if (tipo === "empurrar") { c.save(); c.translate(-e * W * dir, 0); A(); c.restore(); c.save(); c.translate((1 - e) * W * dir, 0); B(); c.restore(); }
    else if (tipo === "cortina" || tipo === "rasgo") {
      A();
      const r = rng(i * 13 + 5), vert = tipo === "rasgo", L = vert ? H : W, T = vert ? W : H, pos = -90 + e * (L + 180), borda = [], n = 16;
      for (let s = 0; s <= n; s++) borda.push([s / n * T, pos + (r() - .5) * (vert ? 70 : 34) + (vert ? 0 : (s / n - .5) * 160)]);
      const m = ([a, b]) => vert ? [a, b] : [b, a];
      const area = [m([0, -200]), m([T, -200]), ...borda.slice().reverse().map(m)];
      dentro([area], B);
      const faixa = [...borda.map(m), ...borda.slice().reverse().map(([a, b]) => m([a, b + (vert ? 46 : 60)]))];
      if (k > 0 && k < 1) p.forma(faixa, vert ? "claro" : "c2", { prof: 2, semente: i + 3 });
    }
    else if (tipo === "iris") { A(); const R = e * Math.hypot(W, H) * .56; dentro([circP(W / 2, H / 2, R, 48)], B); if (k < 1) p.linha(circP(W / 2, H / 2, R, 48), "c2", 22, { fechar: true }); }
    else if (tipo === "blocos") { A(); const r = rng(i * 7 + 1), cols = 6, lin = Math.round(cols * H / W), cw = W / cols, ch = H / lin, cel = []; for (let y = 0; y < lin; y++) for (let x = 0; x < cols; x++) if (r() * .8 + (x + y) / (cols + lin) * .2 < k) cel.push(retP(x * cw - 1, y * ch - 1, cw + 2, ch + 2)); if (cel.length) dentro(cel, B); }
    else if (tipo === "zoom") { c.save(); c.translate(W / 2, H / 2); c.scale(1 + e * .8, 1 + e * .8); c.translate(-W / 2, -H / 2); A(); c.restore(); c.save(); c.globalAlpha = clamp(k * 1.6); c.translate(W / 2, H / 2); c.scale(.72 + .28 * e, .72 + .28 * e); c.translate(-W / 2, -H / 2); B(); c.restore(); }
    else if (tipo === "virar") { p.fundo(t); const s = k < .5 ? 1 - E.entra(k * 2) : E.sai(k * 2 - 1); c.save(); c.translate(W / 2, 0); c.scale(Math.max(.001, s), 1); c.translate(-W / 2, 0); k < .5 ? A() : B(); c.restore(); }
    else B();
  }

  return {
    largura: W, altura: H, fps, duracao, beats, pincel: p,
    /** Índice do beat que está na tela no instante t. */
    beatEm(t) { let i = 0; while (i < beats.length - 1 && t >= beats[i + 1].de) i++; return i; },
    /** Desenha o instante `t` (segundos) inteiro no contexto. */
    desenhar(ctx, t) {
      t = clamp(t, 0, Math.max(0, duracao - 1e-4));
      p.inicio(ctx, W, H, t);
      if (beats.length) {
        const i = this.beatEm(t), tipo = i > 0 ? tipoDe(i) : "corte", k = (t - beats[i].de) / durTransicao;
        if (i > 0 && tipo !== "corte" && k < 1) transitar(tipo, k, i, t); else camada(i, t);
        if (sobre) sobre(q(i, t));
      } else p.fundo(t);
      p.fim();
    },
  };
}
