// Kit de movimento — tocador simples para a página: ajusta o canvas, toca, pausa, busca e acompanha o áudio.
// O botão Exportar e os demais controles pedidos pelo prompt do estilo continuam por conta da página do vídeo.
//
// uso: const toc = tocar(canvas, filme, { audio, aoAtualizar: t => ... });  toc.alternar(); toc.ir(12.5);
export function tocar(canvas, filme, { audio = null, repetir = true, aoAtualizar = null, escala = 1 } = {}) {
  const ctx = canvas.getContext("2d");
  canvas.width = Math.round(filme.largura * escala); canvas.height = Math.round(filme.altura * escala);
  let t = 0, tocando = false, anterior = 0, pedido = 0;
  const desenhar = () => { ctx.setTransform(escala, 0, 0, escala, 0, 0); filme.desenhar(ctx, t); aoAtualizar?.(t); };
  const passo = agora => {
    if (!tocando) return;
    if (audio && !audio.paused) t = audio.currentTime; else t += (agora - anterior) / 1000;
    anterior = agora;
    if (t >= filme.duracao) { if (repetir) { t = 0; if (audio) audio.currentTime = 0; } else { t = filme.duracao; api.pausar(); } }
    desenhar(); pedido = requestAnimationFrame(passo);
  };
  const api = {
    get tempo() { return t; }, get tocando() { return tocando; },
    tocar() { if (tocando) return; tocando = true; anterior = performance.now(); if (audio) { audio.currentTime = t; audio.play().catch(() => {}); } pedido = requestAnimationFrame(passo); },
    pausar() { tocando = false; cancelAnimationFrame(pedido); audio?.pause(); },
    alternar() { tocando ? api.pausar() : api.tocar(); },
    /** Vai para o instante `s` e desenha esse quadro, tocando ou não. */
    ir(s) { t = Math.max(0, Math.min(filme.duracao, s)); if (audio) audio.currentTime = t; desenhar(); },
    trocarFilme(novo) { filme = novo; canvas.width = Math.round(filme.largura * escala); canvas.height = Math.round(filme.altura * escala); api.ir(Math.min(t, filme.duracao)); },
  };
  desenhar();
  return api;
}
