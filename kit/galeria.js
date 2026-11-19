// Kit de movimento — galeria: desenha muitas peças lado a lado, cada uma enquadrada na sua célula e animada.
// Usada por kit/demo.html. Funciona com qualquer pincel.
import { criarPincel, retP } from "./pinceis.js";
import { criarContextoFalso } from "./contexto-falso.js";
import { clamp } from "./movimento.js";

const cicloK = (t, sobe = 2.2, espera = 1.2) => clamp((t % (sobe + espera)) / sobe);
/** Opções com que a galeria chama uma peça: sempre `t`; e `k` em ciclo, se a peça tiver esse parâmetro. */
export function opcoesDaPeca(info, t) {
  const o = { t };
  if (/(^|,\s*)k\b/.test(info?.parametros || "")) o.k = cicloK(t);
  return o;
}

const medidas = new Map();
/** Caixa [x0, y0, x1, y1] que a peça ocupa em torno da origem (união de alguns instantes), medida sem desenhar. */
export function medirPeca(fn, info, chave = info?.nome) {
  if (chave && medidas.has(chave)) return medidas.get(chave);
  const ctx = criarContextoFalso({ registrar: false }), p = criarPincel("flat");
  let cx = null;
  for (const t of [.35, 1.1, 2.3, 3.4]) {
    ctx.zerar(); p.inicio(ctx, 1080, 1920, t);
    try { fn(p, opcoesDaPeca(info, t)); } catch (e) { /* a galeria mostra o erro na hora de desenhar */ }
    const c = ctx.caixa; if (c) cx = cx ? [Math.min(cx[0], c[0]), Math.min(cx[1], c[1]), Math.max(cx[2], c[2]), Math.max(cx[3], c[3])] : c.slice();
  }
  cx = cx || [-100, -100, 100, 100];
  if (chave) medidas.set(chave, cx);
  return cx;
}

/** Quantas linhas e que altura a folha precisa. */
export function tamanhoDaFolha(n, { cols = 6, cel = 300, topo = 0 } = {}) { const lin = Math.max(1, Math.ceil(n / cols)); return { largura: cols * cel, altura: topo + lin * cel, linhas: lin }; }

/** Desenha os itens [{ nome, fn, info }] numa grade. Chame entre p.inicio e p.fim (o fundo é por sua conta).
    Devolve as células [{ nome, x, y, w, h, erro }] para saber onde cada peça ficou. */
export function desenharFolha(p, itens, { cols = 6, cel = 300, topo = 0, t = 0, selecionada = null, rotulos = true } = {}) {
  const celulas = [], tam = Math.max(16, cel * .075), areaH = cel - (rotulos ? tam * 2.1 : 0);
  itens.forEach((it, i) => {
    const x = (i % cols) * cel, y = topo + Math.floor(i / cols) * cel, c = { nome: it.nome, x, y, w: cel, h: cel, erro: null };
    const [x0, y0, x1, y1] = medirPeca(it.fn, it.info, it.nome), bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
    const s = Math.min(cel * .8 / bw, areaH * .8 / bh, 4);
    if (it.nome === selecionada) p.linha(retP(x + 5, y + 5, cel - 10, cel - 10), "c2", 5, { fechar: true });
    p.recortar(retP(x + 2, y + 2, cel - 4, cel - 4), () => p.em({ x: x + cel / 2 - (x0 + x1) / 2 * s, y: y + areaH / 2 - (y0 + y1) / 2 * s, s }, () => {
      try { it.fn(p, opcoesDaPeca(it.info, t + i * .37)); } catch (e) { c.erro = String(e?.message || e); }
    }));
    if (rotulos) p.texto(c.erro ? "ERRO: " + it.nome : it.nome, x + cel / 2, y + cel - tam * 1.05, { tam, cor: c.erro ? "c1" : (p.estilo === "pixel" || p.estilo === "toon") ? "claro" : "tinta", peso: 700 });
    celulas.push(c);
  });
  return celulas;
}
