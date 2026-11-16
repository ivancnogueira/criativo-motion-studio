// Kit de movimento — estilos de legenda na tela. Todos leem saida/legendas/legendas.json
// ({ palavras: [{ palavra, inicio, fim }], blocos: [{ inicio, fim, texto }], duracao }) e desenham só com o pincel,
// por isso funcionam nos cinco estilos de vídeo.
//
// uso: legenda(p, dados, t, { estilo: "karaoke" })   — o estilo vem de projeto.json, campo estiloLegenda.
// São referências: copie um estilo, mude tamanhos, cores e entrada, ou crie o seu.
import { clamp, lerp, E, mola } from "./movimento.js";
import { retP, retArredP } from "./pinceis.js";

// cor de texto que aparece sobre qualquer cena, e a cor oposta para contorno e faixa
const luz = p => p.estilo === "traco" || p.estilo === "vidro" ? "tinta" : "claro";
const breu = p => p.estilo === "traco" || p.estilo === "vidro" ? "claro" : "tinta";

/** Texto com contorno (o mesmo texto desenhado em volta, na cor da borda). `grosso` é a fração do tamanho. */
function escrever(p, s, x, y, { tam, cor, borda = null, grosso = .08, alinhar = "center" } = {}) {
  if (borda) { const d = Math.max(p.estilo === "pixel" ? 6 : 2, tam * grosso), n = grosso > .1 ? 12 : 8; for (let i = 0; i < n; i++) p.texto(s, x + Math.cos(i / n * 6.2832) * d, y + Math.sin(i / n * 6.2832) * d, { tam, cor: borda, alinhar }); }
  p.texto(s, x, y, { tam, cor, alinhar });
}
/** Distribui os textos em linhas centradas em (0, 0). Cada item ganha x (centro), esq (borda esquerda), y, w e tam. */
function dispor(p, textos, { tam, largura, tams = null }) {
  const itens = textos.map((s, i) => { const tm = tams?.[i] ?? tam; return { s, i, tam: tm, w: p.medir(s, { tam: tm }) }; });
  const esp = tam * .32, linhas = [[]]; let wl = 0;
  for (const it of itens) { if (linhas.at(-1).length && wl + esp + it.w > largura) { linhas.push([]); wl = 0; } wl += (linhas.at(-1).length ? esp : 0) + it.w; linhas.at(-1).push(it); }
  const alt = Math.max(...itens.map(i => i.tam), tam) * 1.28, y0 = -(linhas.length - 1) * alt / 2; let wmax = 0;
  linhas.forEach((l, n) => { const total = l.reduce((a, c) => a + c.w, 0) + esp * (l.length - 1); wmax = Math.max(wmax, total); let cx = -total / 2; for (const it of l) { it.x = cx + it.w / 2; it.esq = cx; it.y = y0 + n * alt; cx += it.w + esp; } });
  return { itens, largura: wmax, altura: linhas.length * alt, linhas: linhas.length };
}
const semAcento = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Os estilos. Cada um: { nome, descricao, y (altura padrão, fração da tela), desenhar(c) }.
    c = { p, ps (palavras do bloco), txt(i), t, tam, largura, cor, destaque, fundo, borda, e (entrada 0..1), atual, falada(i), frac(i), chaves } */
export const ESTILOS_DE_LEGENDA = {
  bloco: {
    nome: "Bloco com destaque", descricao: "Cartão com o trecho atual; a palavra falada muda de cor e sobe um pouco.", fundo: true,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c);
      p.em({ s: .9 + .1 * c.e }, () => {
        p.forma(retArredP(-L.largura / 2 - tam * .5, -L.altura / 2 - tam * .22, L.largura + tam, L.altura + tam * .44, 18), c.fundo, { prof: 1, semente: 77 });
        for (const it of L.itens) { const f = c.falada(it.i); p.texto(it.s, it.x, it.y + (f ? -tam * .06 : 0), { tam, cor: f ? c.destaque : c.cor }); }
      });
    },
  },
  palavra: {
    nome: "Palavra por palavra", descricao: "Uma palavra grande por vez, no centro, entrando com um pulo.", y: .6, maiusculas: true,
    desenhar(c) {
      const { p } = c, i = c.atual, s = c.txt(i), w = c.ps[i], k = mola(clamp((c.t - w.inicio) / .24 + (i ? 0 : .5)), { freq: 1.3, amort: 6 });
      const tam = Math.min(c.tam * 2, c.tam * 2 * c.largura / Math.max(1, p.medir(s, { tam: c.tam * 2 })));
      p.em({ s: .55 + .45 * k, r: (i % 2 ? 1 : -1) * .05 * (1 - k) }, () => escrever(p, s, 0, 0, { tam, cor: i % 3 === 2 ? c.destaque : c.cor, borda: c.borda, grosso: .07 }));
    },
  },
  karaoke: {
    nome: "Karaokê", descricao: "O trecho inteiro aparece e as letras se pintam conforme a fala avança.",
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c);
      p.em({ s: .92 + .08 * c.e }, () => {
        for (const it of L.itens) escrever(p, it.s, it.esq, it.y, { tam, cor: c.cor, borda: c.borda, alinhar: "left" });
        for (const it of L.itens) { const n = Math.ceil(c.frac(it.i) * it.s.length); if (n > 0) p.texto(it.s.slice(0, n), it.esq, it.y, { tam, cor: c.destaque, alinhar: "left" }); }
      });
    },
  },
  caixa: {
    nome: "Caixa que pula", descricao: "Uma caixa colorida salta de palavra em palavra, acompanhando a fala.", maiusculas: true,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c), a = L.itens[c.atual], b = L.itens[Math.max(0, c.atual - 1)];
      const k = E.sai(clamp((c.t - c.ps[c.atual].inicio) / .14)), v = n => lerp(b[n], a[n], k), salto = Math.sin(k * Math.PI) * tam * .16;
      p.em({ s: .92 + .08 * c.e }, () => {
        p.forma(retArredP(v("x") - v("w") / 2 - tam * .2, v("y") - tam * .62 - salto, v("w") + tam * .4, tam * 1.24, tam * .2), c.destaque, { prof: 1, semente: 31, liso: true });
        for (const it of L.itens) it.i === c.atual ? p.texto(it.s, it.x, it.y - salto * k, { tam, cor: "tinta" }) : escrever(p, it.s, it.x, it.y, { tam, cor: c.cor, borda: c.borda });
      });
    },
  },
  maquina: {
    nome: "Máquina de escrever", descricao: "As letras são datilografadas no ritmo da fala, com o cursor piscando.", fundo: true,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c); let cur = [L.itens[0].esq, L.itens[0].y];
      p.forma(retArredP(-L.largura / 2 - tam * .5, -L.altura / 2 - tam * .22, L.largura + tam, L.altura + tam * .44, 8), c.fundo, { prof: 1, semente: 53 });
      // a datilografia adianta um instante, para a primeira letra já estar na tela quando a palavra começa
      for (const it of L.itens) { const w = c.ps[it.i], n = Math.ceil(clamp((c.t - w.inicio + .06) / Math.max(.05, w.fim - w.inicio)) * it.s.length); if (n <= 0) break; const parte = it.s.slice(0, n); p.texto(parte, it.esq, it.y, { tam, cor: c.cor, alinhar: "left" }); cur = [it.esq + p.medir(parte, { tam }) + tam * .06, it.y]; }
      if (Math.sin(c.t * 9) > -.2) p.forma(retP(cur[0], cur[1] - tam * .46, tam * .12, tam * .92), c.destaque, { prof: 0, liso: true });
    },
  },
  chave: {
    nome: "Palavra-chave em destaque", descricao: "O trecho em tamanho normal e a palavra mais importante maior, colorida, pulando ao ser dita.",
    desenhar(c) {
      const { p, tam } = c, limpas = c.ps.map(w => semAcento(w.palavra));
      let alvo = limpas.map((s, i) => c.chaves.some(k => s.startsWith(k)) ? i : -1).filter(i => i >= 0);
      if (!alvo.length) { const maior = limpas.reduce((m, s, i) => s.length > limpas[m].length ? i : m, 0); if (limpas[maior].length >= 5) alvo = [maior]; }
      const L = dispor(p, c.ps.map((_, i) => alvo.includes(i) ? c.txt(i).toUpperCase() : c.txt(i)), { ...c, tams: c.ps.map((_, i) => alvo.includes(i) ? tam * 1.5 : tam) });
      p.em({ s: .92 + .08 * c.e }, () => {
        for (const it of L.itens) {
          if (!alvo.includes(it.i)) { escrever(p, it.s, it.x, it.y, { tam: it.tam, cor: c.cor, borda: c.borda }); continue; }
          const k = mola(clamp((c.t - c.ps[it.i].inicio) / .35), { freq: 1.6, amort: 5 });
          p.em({ x: it.x, y: it.y, s: .82 + .18 * k, r: -.04 * k }, () => escrever(p, it.s, 0, 0, { tam: it.tam, cor: c.destaque, borda: c.borda, grosso: .09 }));
        }
      });
    },
  },
  faixa: {
    nome: "Faixa inferior clássica", descricao: "Faixa escura de lado a lado com o trecho centralizado, como legenda de TV.", y: .74, faixa: true,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c), h = L.altura + tam * .7;
      p.alfa(p.estilo === "pixel" ? 1 : .86 * clamp(c.e * 2), () => p.forma(retP(-c.x - 20, -h / 2, p.largura + 40, h), c.fundo, { prof: 0, liso: true }));
      for (const it of L.itens) p.texto(it.s, it.x, it.y, { tam, cor: c.cor });
    },
  },
  pop: {
    nome: "Pop com quique", descricao: "Cada palavra aparece quicando no instante em que é dita e fica até o fim do trecho.", maiusculas: true,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c);
      for (const it of L.itens) {
        const w = c.ps[it.i]; if (c.t < w.inicio - .03) continue;
        const k = mola(clamp((c.t - w.inicio + .03) / .4), { freq: 2, amort: 4.5 });
        p.em({ x: it.x, y: it.y - (1 - Math.min(1, k)) * tam * .5, s: .3 + .7 * k, r: (it.i % 2 ? 1 : -1) * .06 * (1 - Math.min(1, k)) }, () => escrever(p, it.s, 0, 0, { tam, cor: it.i === c.atual ? c.destaque : c.cor, borda: c.borda }));
      }
    },
  },
  contorno: {
    nome: "Duas linhas com contorno", descricao: "Letras grandes em maiúsculas com contorno grosso, em até duas linhas; a palavra falada muda de cor.", maiusculas: true, estreito: .78, maior: 1.12,
    desenhar(c) {
      const { p, tam } = c, L = dispor(p, c.ps.map((_, i) => c.txt(i)), c);
      p.em({ s: .86 + .14 * c.e }, () => { for (const it of L.itens) escrever(p, it.s, it.x, it.y, { tam, cor: c.falada(it.i) ? c.destaque : c.cor, borda: c.borda, grosso: .15 }); });
    },
  },
};
export const NOMES_DE_LEGENDA = Object.keys(ESTILOS_DE_LEGENDA);
export const LEGENDA_PADRAO = "bloco";
/** Devolve o id se o estilo existe; senão lança um erro que lista as opções. */
export function conferirEstiloDeLegenda(id) {
  if (!Object.hasOwn(ESTILOS_DE_LEGENDA, String(id))) throw new Error(`estiloLegenda "${id}" não existe. Opções: ${NOMES_DE_LEGENDA.join(", ")}`);
  return String(id);
}

/** Palavras do bloco, com tempos. Sem tempos por palavra, reparte a duração do bloco pelo tamanho de cada uma. */
function palavrasDoBloco(dados, b) {
  const ps = (dados.palavras || []).filter(w => w.inicio >= b.inicio - .01 && w.fim <= b.fim + .01); if (ps.length) return ps;
  const partes = String(b.texto || "").split(/\s+/).filter(Boolean), total = partes.reduce((a, s) => a + s.length, 0) || 1; let ac = 0;
  return partes.map(s => { const inicio = b.inicio + (b.fim - b.inicio) * ac / total; ac += s.length; return { palavra: s, inicio, fim: b.inicio + (b.fim - b.inicio) * ac / total }; });
}
const blocosDe = dados => dados?.blocos?.length ? dados.blocos : Array.from({ length: Math.ceil((dados?.palavras?.length || 0) / 4) }, (_, i) => { const g = dados.palavras.slice(i * 4, i * 4 + 4); return { inicio: g[0].inicio, fim: g.at(-1).fim, texto: g.map(w => w.palavra).join(" ") }; });

/** Desenha a legenda do instante `t` no estilo pedido. Chame por cima da cena (no `sobre` do filme).
    opções: estilo (um de NOMES_DE_LEGENDA), x e y (centro do texto; padrão: meio da tela, fora dos 20% inferiores),
    tam, largura (máxima de uma linha), cor, destaque, fundo, borda, maiusculas, chaves (palavras a destacar no estilo "chave").
    Devolve true quando havia um trecho para mostrar. */
export function legenda(p, dados, t, { estilo = LEGENDA_PADRAO, x = p.largura / 2, y, tam, largura, cor, destaque, fundo, borda, maiusculas, chaves = [] } = {}) {
  const est = ESTILOS_DE_LEGENDA[conferirEstiloDeLegenda(estilo)];
  const b = blocosDe(dados).find(b => t >= b.inicio - .05 && t < b.fim + .15); if (!b) return false;
  const ps = palavrasDoBloco(dados || {}, b); if (!ps.length) return false;
  const maius = maiusculas ?? !!est.maiusculas; let atual = 0; ps.forEach((w, i) => { if (t >= w.inicio) atual = i; });
  const c = {
    p, ps, t, x, atual, chaves: [].concat(chaves).map(semAcento).filter(Boolean),
    tam: (tam ?? Math.round(p.largura * .054)) * (est.maior || 1), largura: (largura ?? p.largura * .84) * (est.estreito || 1),
    cor: cor ?? (est.fundo ? "tinta" : luz(p)), destaque: destaque ?? (est.fundo ? "c1" : "c2"), fundo: fundo ?? (est.faixa ? breu(p) : "claro"), borda: borda ?? breu(p),
    e: mola(clamp((t - b.inicio + .05) / .25), { freq: 1.2, amort: 7 }),
    txt: i => maius ? ps[i].palavra.toUpperCase() : ps[i].palavra,
    falada: i => t >= ps[i].inicio && t < ps[i].fim + .08,
    frac: i => clamp((t - ps[i].inicio) / Math.max(.05, ps[i].fim - ps[i].inicio)),
  };
  p.em({ x, y: y ?? p.altura * (est.y || .72) }, () => est.desenhar(c));
  return true;
}
/** Compatível com a versão anterior do kit: o estilo "bloco". */
export const legendas = (p, dados, t, o = {}) => legenda(p, dados, t, { ...o, estilo: "bloco" });

/** Dados de exemplo no formato de legendas.json, para testar um estilo sem narração. */
export function legendasDeExemplo(texto = "Cada estilo de legenda acompanha a fala, palavra por palavra, e destaca o que importa na tela.") {
  const palavras = []; let t = .3;
  for (const s of texto.split(/\s+/).filter(Boolean)) { const d = .16 + s.length * .045; palavras.push({ palavra: s, inicio: +t.toFixed(2), fim: +(t + d).toFixed(2) }); t += d + (/[.,!?]$/.test(s) ? .32 : .05); }
  const blocos = []; let g = [];
  const fechar = () => { if (g.length) { blocos.push({ inicio: g[0].inicio, fim: g.at(-1).fim, texto: g.map(w => w.palavra).join(" ") }); g = []; } };
  for (const w of palavras) { if (g.length >= 4 || g.reduce((a, x) => a + x.palavra.length + 1, 0) + w.palavra.length > 22) fechar(); g.push(w); if (/[.,!?]$/.test(w.palavra)) fechar(); }
  fechar();
  return { texto, palavras, blocos, duracao: +(t + .4).toFixed(2) };
}
