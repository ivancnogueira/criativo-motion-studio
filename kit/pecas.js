// Kit de movimento — peças prontas: personagem articulado, cenários e objetos, todos com movimento próprio.
// Cada peça é desenhada na origem (base no chão em y = 0, centrada em x = 0) com o pincel `p`;
// posicione com p.em({ x, y, s, r }, () => peca(p, { t })). Passe sempre `t` (segundos) para a peça viver.
//
// São referências para não começar do zero. Cada vídeo deve ter peças próprias do tema: copie uma parecida,
// mude as formas, ou desenhe do zero com p.forma, p.capsula, p.linha e p.texto.
import { esqueleto, piscar, clamp, lerp, rng, semear, ruido, E, mola } from "./movimento.js";
import { circP, retP, retArredP, rotP, misturarCor } from "./pinceis.js";

const escuro = (p, cor, k = .2) => { const h = p.cor(cor); return /^#[0-9a-f]{6}$/i.test(h) ? misturarCor(h, p.cor("tinta") === h ? "#000000" : (p.estilo === "traco" || p.estilo === "vidro" ? p.cor("fundo") : "#000000"), k) : h; };

/* ================================================================ PERSONAGEM */
/** Personagem articulado. Opções:
    pose (nome, objeto ou resultado de atuar/CICLOS), altura, virado (1 olha para a direita, -1 para a esquerda),
    pele, roupa, calca, cabelo, sapato (cores), cabecao (tamanho da cabeça), penteado (curto, longo, coque, careca),
    chapeu (quepe, bone, palha, capacete, gorro) e corChapeu, expressao (neutro, feliz, susto, triste, bravo),
    naMao: função (p) => {...} que desenha um objeto na mão da frente, t, semente.
    Devolve o esqueleto (pontos das juntas) para prender outras coisas ao personagem. */
export function personagem(p, o = {}) {
  const { pose: ps = "parado", altura = 300, cabecao = 1.3, virado = 1, pele = "pele0", roupa = "c1", calca = "tinta", cabelo = "tinta", sapato = "tinta",
    penteado = "curto", chapeu = null, corChapeu = "c3", expressao = "neutro", naMao = null, t = 0, semente = 0 } = o;
  const e = esqueleto(ps, { altura, cabecao }), H = altura, wM = H * .062, wP = H * .078;
  const tras = c => escuro(p, c, .22);
  p.em({ x: 0, y: 0, sx: virado }, () => {
    const braco = (co, mao, cor) => { p.capsula(e.ombro, co, wM, cor); p.capsula(co, mao, wM * .92, cor); p.circulo(mao[0], mao[1], wM * .62, pele, { prof: 0, liso: true }); };
    const perna = (jo, pe, ang, cor, cs) => { p.capsula(e.quadril, jo, wP, cor); p.capsula(jo, pe, wP * .9, cor); const inc = clamp(-ang, -.6, .9) * .5; p.capsula([pe[0] - H * .008, pe[1]], [pe[0] + Math.cos(inc) * H * .075, pe[1] + Math.sin(inc) * H * .075], wP * .82, cs); };
    braco(e.cotoveloT, e.maoT, tras(roupa));
    perna(e.joelhoT, e.peT, e.angPeT, tras(calca), tras(sapato));
    perna(e.joelhoF, e.peF, e.angPeF, calca, sapato);
    p.capsula(e.ombro, e.quadril, H * .175, roupa, { prof: 1, liso: false });
    p.capsula(e.pescoco, [lerp(e.pescoco[0], e.cabeca[0], .5), lerp(e.pescoco[1], e.cabeca[1], .5)], wM * .9, pele);
    // cabeça, no seu próprio eixo
    const r = e.raioCabeca;
    p.em({ x: e.cabeca[0], y: e.cabeca[1], r: e.angCabeca }, () => {
      if (penteado === "longo") p.forma(arcoP(0, r * .2, r * 1.16, 150, 330).concat([[r * .2, -r * .9]]), cabelo, { prof: 0 });
      p.circulo(0, 0, r, pele, { prof: 1 });
      if (penteado !== "careca" && !["capacete", "gorro"].includes(chapeu)) p.forma(arcoP(-r * .04, -r * .06, r * 1.07, 168, 345), cabelo, { prof: 0 });
      if (penteado === "coque") p.circulo(-r * .75, -r * .85, r * .36, cabelo, { prof: 0 });
      const fechado = piscar(t, semente) || expressao === "feliz" && false, ox = r * .2, oy = -r * .02, ro = Math.max(2.5, r * .1);
      for (const dx of [ox, ox + r * .46]) {
        if (fechado) p.linha([[dx - ro, oy], [dx + ro, oy]], "tinta", Math.max(2, ro * .7));
        else if (expressao === "susto") { p.circulo(dx, oy, ro * 1.7, "#FFFFFF", { prof: 0, liso: true }); p.circulo(dx, oy, ro * .8, "tinta", { prof: 0, liso: true }); }
        else p.circulo(dx, oy, ro, "tinta", { prof: 0, liso: true });
      }
      if (expressao === "bravo" || expressao === "triste") { const s = expressao === "bravo" ? 1 : -1; p.linha([[ox - ro * 1.6, oy - ro * 2.4 - s * ro * .8], [ox + ro * 1.2, oy - ro * 2.4 + s * ro * .8]], "tinta", Math.max(2, ro * .7)); }
      const bx = r * .46, by = r * .46, lw = Math.max(2, r * .07);
      if (expressao === "feliz") p.linha(arcoP(bx, by - r * .1, r * .24, 20, 160), "tinta", lw);
      else if (expressao === "susto") p.elipse(bx, by, r * .12, r * .17, "tinta", { prof: 0, liso: true });
      else if (expressao === "triste" || expressao === "bravo") p.linha(arcoP(bx, by + r * .2, r * .22, 200, 340), "tinta", lw);
      else p.linha([[bx - r * .14, by], [bx + r * .16, by]], "tinta", lw);
      if (chapeu === "quepe") { p.forma([[-r * 1.05, -r * .5], [r * 1.05, -r * .5], [r * .9, -r * 1.15], [-r * 1.0, -r * 1.25]], corChapeu, { prof: 0 }); p.forma([[r * .5, -r * .52], [r * 1.6, -r * .42], [r * 1.5, -r * .28], [r * .5, -r * .36]], "tinta", { prof: 0 }); p.circulo(r * .25, -r * .85, r * .14, "c2", { prof: 0, liso: true }); }
      else if (chapeu === "bone") { p.forma(arcoP(0, -r * .35, r * 1.04, 180, 360), corChapeu, { prof: 0 }); p.forma([[r * .6, -r * .5], [r * 1.75, -r * .36], [r * 1.7, -r * .22], [r * .6, -r * .3]], corChapeu, { prof: 0 }); }
      else if (chapeu === "palha") { p.elipse(0, -r * .62, r * 1.9, r * .26, corChapeu, { prof: 1 }); p.forma(arcoP(0, -r * .66, r * .86, 180, 360), corChapeu, { prof: 0 }); p.linha([[-r * .84, -r * .72], [r * .84, -r * .72]], "c1", Math.max(3, r * .12)); }
      else if (chapeu === "capacete") { p.forma(arcoP(0, -r * .12, r * 1.14, 172, 368), corChapeu, { prof: 0 }); p.forma(retP(-r * 1.25, -r * .2, r * 2.6, r * .16), corChapeu, { prof: 0 }); }
      else if (chapeu === "gorro") { p.forma(arcoP(0, -r * .2, r * 1.08, 175, 365), corChapeu, { prof: 0 }); p.circulo(0, -r * 1.3, r * .24, "claro", { prof: 0 }); }
    });
    if (naMao) p.em({ x: e.maoF[0], y: e.maoF[1], r: Math.PI / 2 - e.angMaoF }, () => naMao(p));
    braco(e.cotoveloF, e.maoF, roupa);
  });
  return e;
}
/** Pontos de um arco de círculo entre dois ângulos em graus (0 = direita, 90 = baixo). */
export function arcoP(cx, cy, r, a0, a1, n = 0) { n = n || Math.max(8, Math.round(Math.abs(a1 - a0) / 12)); return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); }

/** Elencos prontos para variar: use como personagem(p, { ...TIPOS.soldado, pose, t }). */
export const TIPOS = {
  soldado: { roupa: "c3", calca: "c3", chapeu: "quepe", corChapeu: "c3", sapato: "tinta" },
  ribeirinho: { roupa: "claro", calca: "c4", chapeu: "palha", corChapeu: "c2", pele: "pele2" },
  cientista: { roupa: "claro", calca: "tinta", penteado: "coque", pele: "pele1" },
  executiva: { roupa: "c1", calca: "tinta", penteado: "longo", pele: "pele3" },
  operario: { roupa: "c2", calca: "c4", chapeu: "capacete", corChapeu: "c2", pele: "pele2" },
  jovem: { roupa: "c2", calca: "c1", chapeu: "bone", corChapeu: "c1", pele: "pele4" },
  idoso: { roupa: "c4", calca: "tinta", penteado: "careca", pele: "pele0" },
  crianca: { roupa: "c2", calca: "c3", altura: 190, cabecao: 1.7, pele: "pele1" },
};

/* ================================================================ CENÁRIO */
/** Faixa de chão de largura W, com borda irregular. */
export function chao(p, { W = 1080, alt = 300, cor = "c3", semente = 4 } = {}) {
  const r = rng(semente), pts = [[-W / 2 - 40, alt]]; for (let i = 0; i <= 8; i++) pts.push([-W / 2 - 40 + (W + 80) * i / 8, -r() * 26]); pts.push([W / 2 + 40, alt]);
  p.forma(pts, cor, { prof: 2, semente });
}
export function montanhas(p, { W = 1080, alt = 420, cor = "c4", semente = 2, picos = 5 } = {}) {
  const r = rng(semente), pts = [[-W / 2 - 40, 0]];
  for (let i = 0; i <= picos * 2; i++) pts.push([-W / 2 - 40 + (W + 80) * i / (picos * 2), -(i % 2 ? alt * (.55 + r() * .45) : alt * (.12 + r() * .25))]);
  pts.push([W / 2 + 40, 0]); p.forma(pts, cor, { prof: 1, semente });
}
/** Árvore que balança ao vento. tipo: copa, pinheiro, palmeira. */
export function arvore(p, { t = 0, alt = 360, tipo = "copa", cor = "c3", tronco = "tinta", semente = 0 } = {}) {
  const tt = p.ritmo(t), v = Math.sin(tt * 1.5 + semente) * .045;
  p.forma([[-alt * .035, 0], [alt * .035, 0], [alt * .022, -alt * .6], [-alt * .022, -alt * .6]], tronco, { prof: 1, semente: semente + 1 });
  p.em({ x: 0, y: -alt * .55, r: v }, () => {
    if (tipo === "pinheiro") for (let i = 0; i < 3; i++) p.forma([[-alt * (.26 - i * .06), -i * alt * .16], [alt * (.26 - i * .06), -i * alt * .16], [0, -alt * (.3 + i * .14)]], cor, { prof: 1, semente: semente + 3 + i });
    else if (tipo === "palmeira") for (let i = 0; i < 6; i++) { const a = -2.9 + i * .55 + Math.sin(tt * 1.8 + i) * .05; p.forma([[0, 0], [Math.cos(a) * alt * .2, Math.sin(a) * alt * .2 - alt * .08], [Math.cos(a) * alt * .42, Math.sin(a) * alt * .34 + alt * .04], [Math.cos(a) * alt * .18, Math.sin(a) * alt * .16 + alt * .03]], cor, { prof: 1, semente: semente + 3 + i }); }
    else { p.circulo(-alt * .14, -alt * .06, alt * .17, cor, { prof: 1, semente: semente + 3 }); p.circulo(alt * .14, -alt * .08, alt * .18, cor, { prof: 1, semente: semente + 4 }); p.circulo(0, -alt * .22, alt * .21, cor, { prof: 1, semente: semente + 5 }); }
  });
}
export function nuvem(p, { t = 0, larg = 300, cor = "claro", semente = 0 } = {}) {
  const tt = p.ritmo(t), d = Math.sin(tt * .5 + semente) * 16, s = larg / 300;
  p.em({ x: d, y: 0, s }, () => { p.circulo(-80, 0, 52, cor, { semente: semente + 1 }); p.circulo(-10, -34, 72, cor, { semente: semente + 2 }); p.circulo(74, -4, 58, cor, { semente: semente + 3 }); p.forma(retP(-110, -6, 220, 56), cor, { prof: 0, semente: semente + 4 }); });
}
/** Sol com raios girando (ou lua, com `lua: true`). */
export function sol(p, { t = 0, r = 90, cor = "c2", lua = false } = {}) {
  const tt = p.ritmo(t);
  if (lua) { p.circulo(0, 0, r, cor); p.circulo(r * .38, -r * .22, r * .8, "fundo", { prof: 0 }); return; }
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 + tt * .4, k = 1.28 + Math.sin(tt * 3 + i) * .06; p.forma([[Math.cos(a - .1) * r * 1.12, Math.sin(a - .1) * r * 1.12], [Math.cos(a) * r * k * 1.2, Math.sin(a) * r * k * 1.2], [Math.cos(a + .1) * r * 1.12, Math.sin(a + .1) * r * 1.12]], cor, { prof: 0, semente: i + 1 }); }
  p.circulo(0, 0, r, cor, { prof: 2 });
}
/** Estrelas piscando numa área W×H (origem no canto superior esquerdo). */
export function estrelas(p, { t = 0, W = 1080, H = 800, n = 40, cor = "claro", semente = 9 } = {}) {
  const tt = p.ritmo(t);
  for (const s of semear(n, semente)) { const k = .5 + .5 * Math.sin(tt * (1 + s.w * 3) + s.q * 6); if (k > .25) p.circulo(s.u * W, s.v * H, 3 + s.w * 5 * k, cor, { prof: 0, liso: true }); }
}
/** Água com ondas andando. Origem no centro da superfície. */
export function agua(p, { t = 0, W = 1080, alt = 260, cor = "c4", camadas = 3 } = {}) {
  const tt = p.ritmo(t);
  for (let k = 0; k < camadas; k++) {
    const pts = [[-W / 2 - 40, alt]]; for (let i = 0; i <= 24; i++) { const x = -W / 2 - 40 + (W + 80) * i / 24; pts.push([x, k * alt / camadas * .8 + Math.sin(i * .9 + tt * (1.6 + k * .5) + k * 2) * 12]); } pts.push([W / 2 + 40, alt]);
    p.forma(pts, k % 2 ? escuro(p, cor, .16) : cor, { prof: 1, semente: 20 + k, liso: true });
  }
}
/** Chuva (ou neve, com `neve: true`) numa área W×H a partir do canto superior esquerdo. */
export function chuva(p, { t = 0, W = 1080, H = 1920, n = 60, cor = "c4", neve = false, semente = 3 } = {}) {
  const tt = p.ritmo(t);
  for (const s of semear(n, semente)) { const vel = neve ? 160 + s.w * 120 : 900 + s.w * 500, y = (s.v * H + tt * vel) % H, x = s.u * W + (neve ? Math.sin(tt * 2 + s.q * 6) * 30 : -y * .12); neve ? p.circulo(x, y, 6 + s.w * 6, cor, { prof: 0, liso: true }) : p.linha([[x, y], [x - 6, y + 44]], cor, 5); }
}
/** Casa simples; com `palafita: true` fica sobre estacas (casa ribeirinha). Janela acende e apaga. */
export function casa(p, { t = 0, larg = 300, cor = "claro", telhado = "c1", palafita = false, semente = 0 } = {}) {
  const w = larg, h = w * .62, base = palafita ? -w * .34 : 0, tt = p.ritmo(t);
  if (palafita) { for (const x of [-w * .38, -w * .13, w * .13, w * .38]) p.forma(retP(x - w * .025, base, w * .05, -base), "tinta", { prof: 0, semente: semente + x }); p.forma(retP(-w * .58, base - w * .04, w * 1.16, w * .06), "tinta", { prof: 1, semente: semente + 7 }); }
  p.forma(retP(-w / 2, base - h, w, h), cor, { prof: 2, semente: semente + 1 });
  p.forma([[-w * .62, base - h], [w * .62, base - h], [0, base - h - w * .42]], telhado, { prof: 2, semente: semente + 2 });
  p.forma(retP(-w * .1, base - h * .58, w * .2, h * .58), "tinta", { prof: 0, semente: semente + 3 });
  const acesa = Math.sin(tt * .9 + semente) > -.3;
  p.forma(retP(w * .2, base - h * .72, w * .18, w * .16), acesa ? "c2" : "tinta", { prof: 0, semente: semente + 4 });
  p.forma(retP(-w * .38, base - h * .72, w * .18, w * .16), acesa ? "c2" : "tinta", { prof: 0, semente: semente + 5 });
}
/** Prédio com janelas que acendem em instantes diferentes. */
export function predio(p, { t = 0, larg = 200, alt = 520, cor = "c4", semente = 0 } = {}) {
  const tt = p.ritmo(t), r = rng(semente + 40);
  p.forma(retP(-larg / 2, -alt, larg, alt), cor, { prof: 2, semente: semente + 1 });
  const cols = 3, lin = Math.floor(alt / 80), jw = larg * .16, gap = (larg - cols * jw) / (cols + 1);
  for (let j = 0; j < lin; j++) for (let i = 0; i < cols; i++) { const f = r(); p.forma(retP(-larg / 2 + gap + i * (jw + gap), -alt + 34 + j * 78, jw, 40), Math.sin(tt * (.4 + f) + f * 9) > 0 ? "c2" : "tinta", { prof: 0, liso: true }); }
}

/* ================================================================ OBJETOS */
/** Folha de documento com linhas que se escrevem. k = quanto já foi escrito (0..1). */
export function documento(p, { k = 1, larg = 220, cor = "claro", tarjas = false, selo = null, semente = 0 } = {}) {
  const w = larg, h = w * 1.32;
  p.forma([[-w / 2, -h], [w / 2 - w * .2, -h], [w / 2, -h + w * .2], [w / 2, 0], [-w / 2, 0]], cor, { prof: 2, semente: semente + 1 });
  p.forma([[w / 2 - w * .2, -h], [w / 2, -h + w * .2], [w / 2 - w * .2, -h + w * .2]], escuro(p, cor, .14), { prof: 0, liso: true });
  for (let i = 0; i < 6; i++) { const kk = clamp(k * 6 - i); if (kk <= 0) break; const lw = (w * .72) * (i % 3 === 2 ? .6 : 1) * kk, y = -h + w * .38 + i * w * .145; tarjas && i % 2 ? p.forma(retP(-w * .36, y - w * .04, lw, w * .08), "tinta", { prof: 0, liso: true }) : p.linha([[-w * .36, y], [-w * .36 + lw, y]], "tinta", Math.max(3, w * .028)); }
  if (selo) p.em({ x: w * .1, y: -w * .3, r: -.2 }, () => p.etiqueta(selo, 0, 0, { tam: w * .13, fundo: "c1", prof: 0 }));
}
/** Pilha de páginas que cresce: k de 0 a 1 empilha `n` folhas, cada uma caindo no lugar. */
export function pilhaDePaginas(p, { k = 1, n = 9, larg = 240, cor = "claro", semente = 0 } = {}) {
  const r = rng(semente + 8);
  for (let i = 0; i < n; i++) { const kk = clamp(k * n - i); if (kk <= 0) break; const e = E.quique(kk), rot = (r() - .5) * .22, dx = (r() - .5) * 26; p.em({ x: dx, y: -i * larg * .045 - (1 - e) * 500, r: rot * e, a: clamp(kk * 4) }, () => p.forma(retP(-larg / 2, -larg * .16, larg, larg * .16), i % 3 === 2 ? escuro(p, cor, .08) : cor, { prof: 1, semente: semente + i })); }
}
/** Papéis voando pela área W×H (origem no canto superior esquerdo). */
export function papeisVoando(p, { t = 0, W = 1080, H = 1920, n = 14, cor = "claro", semente = 6 } = {}) {
  const tt = p.ritmo(t);
  for (const s of semear(n, semente)) { const y = H - ((s.v * H + tt * (220 + s.w * 260)) % (H + 200)) + 100, x = s.u * W + Math.sin(tt * 1.4 + s.q * 6) * 90, rot = tt * (1 + s.w * 2) + s.q * 6, sx = Math.cos(tt * 3 + s.q * 9); p.em({ x, y, r: rot, sx: .25 + Math.abs(sx) * .75 }, () => p.forma(retP(-46, -60, 92, 120), cor, { prof: 1, semente: s.i + 1, liso: true })); }
}
/** Pasta de arquivo: k = 0 fechada, 1 aberta mostrando folhas. */
export function pasta(p, { k = 0, larg = 360, cor = "c2", rotulo = "", semente = 0 } = {}) {
  const w = larg, h = w * .72;
  p.forma([[-w / 2, -h], [-w * .12, -h], [-w * .04, -h - w * .09], [w / 2, -h - w * .09], [w / 2, 0], [-w / 2, 0]], escuro(p, cor, .18), { prof: 2, semente: semente + 1 });
  if (k > 0) for (let i = 0; i < 3; i++) p.em({ x: (i - 1) * w * .05, y: -h * .1 - k * h * (.34 + i * .1), r: (i - 1) * .07 * k }, () => p.forma(retP(-w * .36, -h * .62, w * .72, h * .7), "claro", { prof: 1, semente: semente + 3 + i }));
  p.forma([[-w / 2, 0], [w / 2, 0], [w / 2 + k * w * .05, -h * (1 - k * .34)], [-w / 2 - k * w * .05, -h * (1 - k * .34)]], cor, { prof: 2, semente: semente + 2 });
  if (rotulo) p.etiqueta(rotulo, 0, -h * .38 * (1 - k * .3), { tam: w * .09, fundo: "claro", cor: "tinta", prof: 0 });
}
/** Cadeado: k = 0 aberto, 1 fechado (o arco desce e trava). */
export function cadeado(p, { k = 1, larg = 200, cor = "c2" } = {}) {
  const w = larg, y = -w * .78 - (1 - E.sai(k)) * w * .3, e = w * .11;
  p.forma(arcoP(0, y, w * .34, 180, 360).concat(arcoP(0, y, w * .34 - e, 360, 180)), "tinta", { prof: 0 });
  p.forma(retP(w * .34 - e, y, e, -y - w * .7), "tinta", { prof: 0, liso: true });
  p.forma(retP(-w * .34, y, e, (k > .6 ? -y - w * .7 : w * .16)), "tinta", { prof: 0, liso: true });
  p.forma(retArredP(-w / 2, -w * .78, w, w * .78, w * .08), cor, { prof: 2 });
  p.circulo(0, -w * .46, w * .09, "tinta", { prof: 0, liso: true }); p.forma(retP(-w * .03, -w * .46, w * .06, w * .2), "tinta", { prof: 0, liso: true });
}
export function chave(p, { larg = 200, cor = "c2" } = {}) {
  const w = larg;
  p.forma(circP(-w * .32, 0, w * .2), cor, { prof: 1, furos: [circP(-w * .32, 0, w * .08).reverse()] });
  p.forma([[-w * .14, -w * .05], [w * .5, -w * .05], [w * .5, w * .16], [w * .4, w * .16], [w * .4, w * .05], [w * .3, w * .05], [w * .3, w * .13], [w * .2, w * .13], [w * .2, w * .05], [-w * .14, w * .05]], cor, { prof: 1 });
}
/** Câmera de filmagem em tripé, com as bobinas girando e a luz de gravação piscando. */
export function camera(p, { t = 0, larg = 260, cor = "tinta", tripe = true } = {}) {
  const w = larg, tt = p.ritmo(t), y = tripe ? -w * 1.1 : -w * .3;
  if (tripe) for (const dx of [-w * .42, 0, w * .42]) p.capsula([0, y + w * .2], [dx, 0], w * .05, "tinta");
  for (const [cx, r] of [[-w * .16, w * .2], [w * .2, w * .16]]) { p.circulo(cx, y - w * .42, r, "c4", { prof: 1 }); for (let i = 0; i < 3; i++) { const a = tt * 3 + i * 2.094; p.circulo(cx + Math.cos(a) * r * .5, y - w * .42 + Math.sin(a) * r * .5, r * .18, "tinta", { prof: 0, liso: true }); } }
  p.forma(retArredP(-w * .4, y - w * .28, w * .8, w * .5, w * .05), cor, { prof: 2 });
  p.forma([[w * .4, y - w * .14], [w * .72, y - w * .26], [w * .72, y + w * .2], [w * .4, y + w * .08]], "c1", { prof: 1 });
  if (Math.sin(tt * 6) > 0) p.circulo(-w * .28, y - w * .16, w * .04, "c2", { prof: 0, liso: true });
}
/** Câmera fotográfica de mão, com flash em `flash` 0..1. */
export function cameraFoto(p, { larg = 120, flash = 0 } = {}) {
  const w = larg;
  p.forma(retArredP(-w / 2, -w * .34, w, w * .62, w * .08), "tinta", { prof: 1 }); p.forma(retP(-w * .2, -w * .46, w * .34, w * .14), "tinta", { prof: 0 });
  p.circulo(0, -w * .02, w * .2, "c4", { prof: 0 }); p.circulo(0, -w * .02, w * .1, "claro", { prof: 0, liso: true });
  if (flash > 0) p.alfa(flash, () => p.forma(estrelaP(w * .34, -w * .44, w * (.3 + flash * .5), w * .1, 8), "claro", { prof: 0, liso: true }));
}
export function estrelaP(cx, cy, R, r, n = 5, rot = -Math.PI / 2) { return Array.from({ length: n * 2 }, (_, i) => { const a = rot + i * Math.PI / n, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, cy + Math.sin(a) * q]; }); }
/** Celular com conteúdo rolando na tela. `tela`: função (p, w, h) para desenhar o seu próprio conteúdo. */
export function celular(p, { t = 0, larg = 260, cor = "tinta", tela = null } = {}) {
  const w = larg, h = w * 2, tt = p.ritmo(t);
  p.forma(retArredP(-w / 2, -h, w, h, w * .14), cor, { prof: 3 });
  const m = w * .06, tw = w - m * 2, th = h - m * 2;
  p.forma(retArredP(-w / 2 + m, -h + m, tw, th, w * .09), "claro", { prof: 0, liso: true });
  p.recortar(retArredP(-w / 2 + m, -h + m, tw, th, w * .09), () => {
    if (tela) return p.em({ x: -w / 2 + m, y: -h + m }, () => tela(p, tw, th));
    const rol = (tt * 60) % (th * .3);
    for (let i = -1; i < 5; i++) { const y = -h + m + i * th * .3 - rol + th * .3; p.forma(retArredP(-w / 2 + m * 2, y, tw - m * 2, th * .16, 10), ["c1", "c3", "c2"][(i + 9) % 3], { prof: 0, liso: true }); p.linha([[-w / 2 + m * 2, y + th * .21], [w * .2, y + th * .21]], "tinta", 6); }
  });
}
/** Monitor ou notebook com linhas de código sendo digitadas. */
export function computador(p, { t = 0, larg = 420, cor = "tinta" } = {}) {
  const w = larg, h = w * .62, tt = p.ritmo(t);
  p.forma(retP(-w * .06, -w * .14, w * .12, w * .14), cor, { prof: 0 }); p.forma(retArredP(-w * .24, -w * .04, w * .48, w * .05, 8), cor, { prof: 1 });
  p.forma(retArredP(-w / 2, -h - w * .12, w, h, w * .03), cor, { prof: 2 });
  p.forma(retP(-w / 2 + w * .04, -h - w * .08, w * .92, h - w * .08), "claro", { prof: 0, liso: true });
  for (let i = 0; i < 6; i++) { const k = clamp(((tt * 2.2) % 8) - i), lw = w * (.3 + ((i * 37) % 40) / 100) * k; if (lw > 0) p.linha([[-w * .4 + (i % 3) * w * .05, -h + i * h * .12], [-w * .4 + (i % 3) * w * .05 + lw, -h + i * h * .12]], ["c1", "c3", "tinta"][i % 3], Math.max(4, w * .018)); }
}
/** Veículo com rodas girando e carroceria balançando. tipo: carro, jipe, caminhao. Passe `andando: false` para parar. */
export function veiculo(p, { t = 0, larg = 420, cor = "c1", tipo = "carro", andando = true } = {}) {
  const w = larg, tt = p.ritmo(t), rr = w * .12, bal = andando ? Math.sin(tt * 14) * 2.5 : 0;
  p.em({ x: 0, y: bal }, () => {
    if (tipo === "caminhao") { p.forma(retP(-w / 2, -w * .5, w * .64, w * .38), "claro", { prof: 2 }); p.forma([[w * .16, -w * .4], [w * .38, -w * .4], [w / 2, -w * .24], [w / 2, -w * .12], [w * .16, -w * .12]], cor, { prof: 2 }); }
    else if (tipo === "jipe") { p.forma([[-w / 2, -w * .3], [-w * .46, -w * .52], [w * .12, -w * .52], [w * .2, -w * .3], [w / 2, -w * .28], [w / 2, -w * .12], [-w / 2, -w * .12]], cor, { prof: 2 }); p.forma(retP(-w * .38, -w * .47, w * .44, w * .14), "claro", { prof: 0 }); p.circulo(-w * .52, -w * .3, rr * .8, "tinta", { prof: 1 }); }
    else { p.forma([[-w / 2, -w * .12], [-w * .48, -w * .28], [-w * .3, -w * .3], [-w * .18, -w * .46], [w * .16, -w * .46], [w * .3, -w * .3], [w * .48, -w * .26], [w / 2, -w * .12]], cor, { prof: 2 }); p.forma([[-w * .22, -w * .31], [-w * .14, -w * .42], [w * .13, -w * .42], [w * .22, -w * .31]], "claro", { prof: 0 }); }
    p.circulo(w * .47, -w * .2, w * .03, "c2", { prof: 0, liso: true });
  });
  for (const x of [-w * .28, w * .28]) { p.circulo(x, -rr, rr, "tinta", { prof: 1 }); p.circulo(x, -rr, rr * .45, "claro", { prof: 0, liso: true }); const a = andando ? tt * 9 : 0; p.linha([[x - Math.cos(a) * rr * .45, -rr - Math.sin(a) * rr * .45], [x + Math.cos(a) * rr * .45, -rr + Math.sin(a) * rr * .45]], "tinta", 5); }
}
/** Canoa balançando na água. Desenhe o remador por cima com personagem(..., pose: CICLOS.remar(t)). */
export function barco(p, { t = 0, larg = 420, cor = "c1" } = {}) {
  const w = larg;
  p.forma([[-w / 2, -w * .14], [w / 2, -w * .14], [w * .36, 0], [-w * .36, 0]], cor, { prof: 2 });
  p.linha([[-w * .46, -w * .1], [w * .46, -w * .1]], "tinta", 5);
}
/** Disco voador com luzes correndo e feixe de luz. feixe = 0..1 (comprimento), altFeixe em unidades. */
export function ovni(p, { t = 0, larg = 340, cor = "c4", feixe = 0, altFeixe = 700, corFeixe = "c2" } = {}) {
  const w = larg, tt = p.ritmo(t);
  if (feixe > 0) p.alfa(.5 + Math.sin(tt * 9) * .12, () => p.forma([[-w * .16, 0], [w * .16, 0], [w * (.16 + .5 * feixe), altFeixe * feixe], [-w * (.16 + .5 * feixe), altFeixe * feixe]], corFeixe, { prof: 0, liso: true }));
  p.forma(arcoP(0, -w * .1, w * .24, 180, 360), "claro", { prof: 1 });
  p.elipse(0, -w * .06, w / 2, w * .13, cor, { prof: 2 });
  for (let i = 0; i < 5; i++) { const on = Math.floor(tt * 6) % 5 === i; p.circulo(-w * .32 + i * w * .16, -w * .04, w * .03, on ? "c2" : "tinta", { prof: 0, liso: true }); }
}
/** Foguete com chama tremulando. */
export function foguete(p, { t = 0, larg = 160, cor = "claro", chama = 1 } = {}) {
  const w = larg, tt = p.ritmo(t);
  if (chama > 0) fogo(p, { t, larg: w * .7, alt: w * 1.2 * chama, inverter: true });
  p.forma([[-w * .5, 0], [-w * .26, -w * .5], [-w * .26, 0]], "c1", { prof: 1 }); p.forma([[w * .5, 0], [w * .26, -w * .5], [w * .26, 0]], "c1", { prof: 1 });
  p.forma([[-w * .28, 0], [-w * .28, -w * 1.2], [0, -w * 1.8], [w * .28, -w * 1.2], [w * .28, 0]], cor, { prof: 2 });
  p.circulo(0, -w * 1.05, w * .15, "c4", { prof: 0 });
  void tt;
}
/** Fogo tremulando. `inverter` aponta as chamas para baixo. */
export function fogo(p, { t = 0, larg = 200, alt = 280, inverter = false } = {}) {
  const tt = p.ritmo(t), s = inverter ? -1 : 1;
  [["c1", 1], ["c2", .68], ["claro", .36]].forEach(([cor, k], n) => {
    const pts = [[-larg / 2 * k, 0]]; for (let i = 1; i < 6; i++) { const x = -larg / 2 * k + larg * k * i / 6, pico = i % 2 ? 1 : .55; pts.push([x + ruido(tt * 5 + i, n) * 14, -s * alt * k * pico * (.8 + .2 * Math.sin(tt * 9 + i * 2 + n))]); } pts.push([larg / 2 * k, 0]);
    p.forma(pts, cor, { prof: 0, semente: n + 1 });
  });
}
/** Lâmpada de ideia: `acesa` 0..1 liga com raios. */
export function lampada(p, { t = 0, larg = 160, acesa = 1 } = {}) {
  const w = larg, tt = p.ritmo(t);
  if (acesa > 0) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832 + tt * .6, r0 = w * .7, r1 = w * (.86 + .12 * Math.sin(tt * 6 + i)) * acesa + r0 * (1 - acesa); p.linha([[Math.cos(a) * r0, -w * .9 + Math.sin(a) * r0], [Math.cos(a) * r1, -w * .9 + Math.sin(a) * r1]], "c2", 8); }
  p.forma(arcoP(0, -w * .9, w * .5, 140, 400).concat([[w * .2, -w * .34], [-w * .2, -w * .34]]), acesa > .5 ? "c2" : "claro", { prof: 2 });
  p.forma(retP(-w * .2, -w * .34, w * .4, w * .26), "tinta", { prof: 0 });
}
/** Engrenagem girando. Para encaixar duas, use sentidos opostos (vel negativa) e meio dente de diferença. */
export function engrenagem(p, { t = 0, r = 120, cor = "c4", dentes = 10, vel = 1 } = {}) {
  const a0 = p.ritmo(t) * vel, pts = [];
  for (let i = 0; i < dentes; i++) for (const [d, q] of [[-.3, r * .8], [-.18, r], [.18, r], [.3, r * .8]]) { const a = a0 + (i + d) / dentes * 6.2832; pts.push([Math.cos(a) * q, Math.sin(a) * q]); }
  p.forma(pts, cor, { prof: 2, furos: [circP(0, 0, r * .3).reverse()], liso: true });
}
/** Relógio com ponteiros correndo (vel = voltas do ponteiro grande por segundo). */
export function relogio(p, { t = 0, r = 130, cor = "claro", vel = .5 } = {}) {
  const tt = p.ritmo(t);
  p.circulo(0, 0, r, "tinta", { prof: 2 }); p.circulo(0, 0, r * .86, cor, { prof: 0 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; p.linha([[Math.cos(a) * r * .7, Math.sin(a) * r * .7], [Math.cos(a) * r * .8, Math.sin(a) * r * .8]], "tinta", i % 3 ? 3 : 6); }
  const a = tt * vel * 6.2832 - 1.5708, b = a / 12;
  p.linha([[0, 0], [Math.cos(b) * r * .42, Math.sin(b) * r * .42]], "tinta", 10); p.linha([[0, 0], [Math.cos(a) * r * .66, Math.sin(a) * r * .66]], "c1", 7); p.circulo(0, 0, r * .07, "c1", { prof: 0, liso: true });
}
/** Moeda girando em torno do próprio eixo. */
export function moeda(p, { t = 0, r = 70, cor = "c2", simbolo = "$" } = {}) {
  const sx = Math.cos(p.ritmo(t) * 4);
  p.em({ x: 0, y: 0, sx: Math.abs(sx) < .12 ? .12 : sx }, () => { p.circulo(0, 0, r, cor, { prof: 2 }); p.circulo(0, 0, r * .76, escuro(p, cor, .14), { prof: 0 }); if (sx > .3) p.texto(simbolo, 0, r * .05, { tam: r * 1.1, cor: "tinta" }); });
}
/** Coração batendo. */
export function coracao(p, { t = 0, larg = 160, cor = "c1" } = {}) {
  const w = larg, f = (p.ritmo(t) * 1.3) % 1, s = 1 + .16 * Math.exp(-f * 9) + .1 * Math.exp(-Math.abs(f - .22) * 22);
  p.em({ x: 0, y: 0, s }, () => p.forma([...arcoP(-w * .25, -w * .2, w * .25, 180, 360), ...arcoP(w * .25, -w * .2, w * .25, 180, 395), [0, w * .42], ...arcoP(-w * .25, -w * .2, w * .25, 145, 180)], cor, { prof: 2 }));
}
/** Sinal de alerta piscando. */
export function alerta(p, { t = 0, larg = 200, cor = "c2" } = {}) {
  const w = larg, tt = p.ritmo(t), s = 1 + .06 * Math.sin(tt * 9);
  p.em({ x: 0, y: 0, s, r: Math.sin(tt * 18) * .03 }, () => { p.forma([[0, -w * .9], [w * .52, 0], [-w * .52, 0]], cor, { prof: 2 }); p.forma(retP(-w * .045, -w * .62, w * .09, w * .34), "tinta", { prof: 0, liso: true }); p.circulo(0, -w * .14, w * .055, "tinta", { prof: 0, liso: true }); });
}
/** Pino de mapa que quica. */
export function pino(p, { t = 0, larg = 120, cor = "c1" } = {}) {
  const w = larg, y = -Math.abs(Math.sin(p.ritmo(t) * 3)) * w * .25;
  p.elipse(0, 0, w * .3, w * .08, "tinta", { prof: 0, liso: true });
  p.em({ x: 0, y }, () => { p.forma([...arcoP(0, -w, w * .42, 150, 390), [0, 0]], cor, { prof: 2 }); p.circulo(0, -w, w * .16, "claro", { prof: 0, liso: true }); });
}
/** Termômetro: k = 0..1 é o nível. O líquido treme quando está alto. */
export function termometro(p, { t = 0, k = .5, alt = 420, cor = "c1" } = {}) {
  const h = alt, w = h * .13, tt = p.ritmo(t), n = clamp(k + (k > .7 ? Math.sin(tt * 20) * .012 : 0));
  p.forma(retArredP(-w / 2, -h, w, h - w, w / 2), "claro", { prof: 2 }); p.circulo(0, -w, w * 1.1, "claro", { prof: 2 });
  p.circulo(0, -w, w * .78, cor, { prof: 0, liso: true }); p.forma(retP(-w * .24, -w - (h - w * 2.6) * n, w * .48, (h - w * 2.6) * n + w * .3), cor, { prof: 0, liso: true });
  for (let i = 1; i < 6; i++) p.linha([[w * .7, -w * 2 - (h - w * 3) * i / 6], [w * 1.3, -w * 2 - (h - w * 3) * i / 6]], "tinta", 4);
}
/** Bateria: k = 0..1 é a carga; pisca quando está baixa. */
export function bateria(p, { t = 0, k = 1, larg = 280 } = {}) {
  const w = larg, h = w * .46, baixa = k < .25 && Math.sin(p.ritmo(t) * 10) > 0;
  p.forma(retArredP(-w / 2, -h, w, h, h * .16), "tinta", { prof: 2 }); p.forma(retP(w / 2, -h * .7, w * .06, h * .4), "tinta", { prof: 0 });
  p.forma(retP(-w / 2 + h * .14, -h + h * .14, w - h * .28, h * .72), "claro", { prof: 0, liso: true });
  if (k > 0) p.forma(retP(-w / 2 + h * .14, -h + h * .14, (w - h * .28) * clamp(k), h * .72), baixa ? "claro" : k < .25 ? "c1" : "c3", { prof: 0, liso: true });
}
/** Raio que pisca. */
export function raio(p, { t = 0, alt = 300, cor = "c2" } = {}) {
  const h = alt, on = (p.ritmo(t) * 2.5) % 1 < .6;
  if (on) p.forma([[h * .1, -h], [-h * .2, -h * .42], [-h * .02, -h * .42], [-h * .12, 0], [h * .22, -h * .58], [h * .04, -h * .58], [h * .26, -h]], cor, { prof: 1 });
}
/** Balão de fala que pulsa ao "falar". */
export function balao(p, { t = 0, texto = "", tam = 42, cor = "claro", corTexto = "tinta", lado = 1 } = {}) {
  const w = Math.max(160, p.medir(texto, { tam }) + tam * 1.6), h = tam * 2.4, s = 1 + .025 * Math.sin(p.ritmo(t) * 8);
  p.em({ x: 0, y: 0, s }, () => { p.forma([...retArredP(-w / 2, -h - tam * .7, w, h, tam * .6).slice(0, 12), [lado * w * .1, -tam * .7], [lado * w * .02, 0], [lado * -w * .06, -tam * .7], ...retArredP(-w / 2, -h - tam * .7, w, h, tam * .6).slice(12)], cor, { prof: 2 }); p.texto(texto, 0, -h / 2 - tam * .66, { tam, cor: corTexto }); });
}
/** Gráfico de barras que crescem em cascata: k = 0..1. */
export function graficoBarras(p, { k = 1, valores = [.35, .55, .45, .8, 1], larg = 420, alt = 300, cores = ["c1", "c3", "c2"] } = {}) {
  const n = valores.length, bw = larg / n * .64;
  p.linha([[-larg / 2, 0], [larg / 2, 0]], "tinta", 6);
  valores.forEach((v, i) => { const kk = mola(clamp(k * (n + 2) / 3 - i / 3), { freq: 1.4, amort: 6 }); if (kk > 0) p.forma(retP(-larg / 2 + larg / n * (i + .18), -alt * v * kk, bw, alt * v * kk), cores[i % cores.length], { prof: 1, semente: i + 1 }); });
}
/** Gráfico de linha que se traça: k = 0..1. */
export function graficoLinha(p, { k = 1, valores = [.2, .35, .3, .6, .5, .9], larg = 440, alt = 280, cor = "c1" } = {}) {
  const pts = valores.map((v, i) => [-larg / 2 + larg * i / (valores.length - 1), -alt * v]), n = clamp(k) * (pts.length - 1), i = Math.floor(n), f = n - i;
  p.linha([[-larg / 2, -alt], [-larg / 2, 0], [larg / 2, 0]], "tinta", 6);
  const vis = pts.slice(0, i + 1); if (i < pts.length - 1) vis.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
  p.linha(vis, cor, 10); const u = vis.at(-1); p.circulo(u[0], u[1], 16, cor, { prof: 1, liso: true });
}
/** Gráfico de pizza que se preenche: k = 0..1 da fatia destacada. */
export function graficoPizza(p, { k = .7, r = 150, cor = "c1", fundo = "claro" } = {}) {
  p.circulo(0, 0, r, fundo, { prof: 2 }); if (k > 0) p.forma([[0, 0], ...arcoP(0, 0, r, -90, -90 + 360 * clamp(k))], cor, { prof: 0, liso: true });
}
/** Carimbo de texto inclinado, com moldura. Use com entrada "carimbar". */
export function carimbo(p, { texto = "CONFIDENCIAL", tam = 64, cor = "c1" } = {}) {
  const w = p.medir(texto, { tam }) + tam * 1.2, h = tam * 1.9;
  p.linha(retArredP(-w / 2, -h / 2, w, h, 12), cor, tam * .14, { fechar: true }); p.texto(texto, 0, tam * .04, { tam, cor });
}
/** Marca de certo (ok = true) ou errado, que se traça com k = 0..1. */
export function marca(p, { k = 1, ok = true, larg = 160 } = {}) {
  const w = larg; p.circulo(0, 0, w / 2, ok ? "c3" : "c1", { prof: 2 });
  const tr = (a, b, kk) => kk > 0 && p.linha([a, [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk)]], "claro", w * .1);
  if (ok) { tr([-w * .24, 0], [-w * .06, w * .18], clamp(k * 2)); tr([-w * .06, w * .18], [w * .26, -w * .18], clamp(k * 2 - 1)); }
  else { tr([-w * .2, -w * .2], [w * .2, w * .2], clamp(k * 2)); tr([w * .2, -w * .2], [-w * .2, w * .2], clamp(k * 2 - 1)); }
}
/** Lupa que procura de um lado para o outro. */
export function lupa(p, { t = 0, r = 110, cor = "tinta" } = {}) {
  const tt = p.ritmo(t);
  p.em({ x: Math.sin(tt * 1.4) * r * .5, y: Math.cos(tt * 1.1) * r * .3, r: Math.sin(tt * .9) * .15 }, () => { p.capsula([r * .7, r * .7], [r * 1.6, r * 1.6], r * .24, cor); p.forma(circP(0, 0, r), cor, { prof: 2, furos: [circP(0, 0, r * .8).reverse()] }); p.alfa(.35, () => p.circulo(0, 0, r * .8, "c4", { prof: 0, liso: true })); });
}
/** Caixa de encomenda. */
export function caixa(p, { larg = 220, cor = "c2" } = {}) {
  const w = larg; p.forma(retP(-w / 2, -w * .8, w, w * .8), cor, { prof: 2 }); p.forma(retP(-w * .09, -w * .8, w * .18, w * .8), "claro", { prof: 0 }); p.forma([[-w / 2, -w * .8], [-w * .62, -w * .98], [w * .38, -w * .98], [w / 2, -w * .8]], escuro(p, cor, .14), { prof: 1 });
}
/** Envelope: k = 0 fechado, 1 aberto com a carta saindo. */
export function envelope(p, { k = 0, larg = 300, cor = "claro" } = {}) {
  const w = larg, h = w * .62;
  p.forma(retP(-w / 2, -h, w, h), escuro(p, cor, .1), { prof: 2 });
  if (k > 0) p.forma(retP(-w * .4, -h - h * .7 * k, w * .8, h * .9), "claro", { prof: 1 });
  p.forma([[-w / 2, 0], [0, -h * .55], [w / 2, 0]], cor, { prof: 1 });
  p.forma([[-w / 2, -h], [0, -h + h * .56 * (1 - k * 2)], [w / 2, -h]], escuro(p, cor, .06), { prof: 1 });
}
/** Megafone com ondas de som saindo. */
export function megafone(p, { t = 0, larg = 240, cor = "c1" } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.forma([[-w * .4, -w * .12], [w * .3, -w * .4], [w * .3, w * .4], [-w * .4, w * .12]], cor, { prof: 2 }); p.forma(retP(-w * .55, -w * .12, w * .16, w * .24), "tinta", { prof: 1 });
  for (let i = 0; i < 3; i++) { const k = ((tt * 1.6 + i / 3) % 1); p.alfa(1 - k, () => p.linha(arcoP(w * .3, 0, w * (.2 + k * .6), -40, 40), "c2", 9)); }
}
/** Troféu com brilho. */
export function trofeu(p, { t = 0, larg = 200, cor = "c2" } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.forma(retP(-w * .3, -w * .14, w * .6, w * .14), "tinta", { prof: 1 }); p.forma(retP(-w * .06, -w * .44, w * .12, w * .3), cor, { prof: 0 });
  p.linha(arcoP(-w * .34, -w * .86, w * .18, 90, 270), cor, w * .06); p.linha(arcoP(w * .34, -w * .86, w * .18, -90, 90), cor, w * .06);
  p.forma([[-w * .36, -w * 1.1], [w * .36, -w * 1.1], [w * .3, -w * .66], [0, -w * .42], [-w * .3, -w * .66]], cor, { prof: 2 });
  p.em({ x: w * .14, y: -w * .9, s: .6 + .4 * Math.abs(Math.sin(tt * 3)), r: tt }, () => p.forma(estrelaP(0, 0, w * .12, w * .04, 4), "claro", { prof: 0, liso: true }));
}
/** Bandeira ondulando no mastro. */
export function bandeira(p, { t = 0, larg = 260, cor = "c1" } = {}) {
  const w = larg, tt = p.ritmo(t), cima = [], baixo = [];
  for (let i = 0; i <= 10; i++) { const x = w * i / 10, o = Math.sin(i * .8 - tt * 5) * w * .05 * (i / 10); cima.push([x, -w * 1.5 + o]); baixo.unshift([x, -w * .95 + o]); }
  p.capsula([0, 0], [0, -w * 1.56], w * .05, "tinta"); p.forma([...cima, ...baixo], cor, { prof: 1, liso: true });
}
/** Escudo de proteção que pulsa. */
export function escudo(p, { t = 0, larg = 200, cor = "c3" } = {}) {
  const w = larg, s = 1 + .04 * Math.sin(p.ritmo(t) * 4);
  p.em({ x: 0, y: 0, s }, () => { p.forma([[0, -w * 1.1], [w * .46, -w * .92], [w * .42, -w * .4], [0, 0], [-w * .42, -w * .4], [-w * .46, -w * .92]], cor, { prof: 2 }); p.linha([[-w * .16, -w * .56], [-w * .02, -w * .4], [w * .2, -w * .72]], "claro", w * .08); });
}
/** Cérebro/rede: nós ligados por linhas com pulsos correndo. Bom para "IA", "ideias", "dados". */
export function rede(p, { t = 0, r = 200, n = 7, cor = "c1", semente = 5 } = {}) {
  const tt = p.ritmo(t), nos = semear(n, semente).map((s, i) => { const a = i / n * 6.2832 + s.u, q = r * (.45 + s.v * .55); return [Math.cos(a) * q + Math.sin(tt + i) * 6, Math.sin(a) * q + Math.cos(tt * 1.2 + i) * 6]; });
  nos.forEach((a, i) => { const b = nos[(i + 2) % n], c = nos[(i + 3) % n]; for (const d of [b, c]) { p.linha([a, d], "tinta", 4); const k = (tt * .7 + i * .21) % 1; p.circulo(lerp(a[0], d[0], k), lerp(a[1], d[1], k), 9, "c2", { prof: 0, liso: true }); } });
  nos.forEach((a, i) => p.circulo(a[0], a[1], 20 + (i % 3) * 7, i % 2 ? cor : "c3", { prof: 1, semente: i + 1 }));
}
/** Braço em primeiro plano (para mostrar algo na pele ou segurar algo). `marca`: 0..1 mostra uma mancha de queimadura. */
export function bracoGrande(p, { t = 0, larg = 520, pele = "pele1", marca: m = 0, manga = "c1" } = {}) {
  const w = larg, tt = p.ritmo(t);
  p.capsula([-w / 2, 0], [w * .3, -w * .08], w * .24, pele, { prof: 2 }); p.circulo(w * .38, -w * .1, w * .15, pele, { prof: 1 });
  for (let i = 0; i < 4; i++) p.capsula([w * .44, -w * .18 + i * w * .055], [w * .58 - (i % 3) * w * .02, -w * .2 + i * w * .06], w * .05, pele);
  p.forma(retP(-w * .56, -w * .16, w * .2, w * .34), manga, { prof: 1 });
  if (m > 0) { p.alfa(m, () => { p.forma(circP(-w * .06, -w * .04, w * .09 * (1 + .06 * Math.sin(tt * 8)), 9), "c1", { prof: 0, semente: 3 }); p.circulo(-w * .04, -w * .05, w * .04, "c2", { prof: 0, semente: 4 }); }); }
}
/** Legendas na tela: mostra o bloco atual de legendas.json com a palavra falada em destaque.
    y é a linha de base; mantenha fora dos 20% inferiores do vídeo vertical. */
export function legendas(p, dados, t, { x = 540, y = 1380, tam = 58, cor = "tinta", destaque = "c1", fundo = "claro" } = {}) {
  const b = (dados?.blocos || []).find(b => t >= b.inicio - .05 && t < b.fim + .15); if (!b) return;
  const ps = (dados.palavras || []).filter(w => w.inicio >= b.inicio - .01 && w.fim <= b.fim + .01), palavras = ps.length ? ps : b.texto.split(" ").map(s => ({ palavra: s, inicio: b.inicio, fim: b.fim }));
  const esp = tam * .32, larguras = palavras.map(w => p.medir(w.palavra, { tam })), total = larguras.reduce((a, c) => a + c, 0) + esp * (palavras.length - 1);
  const e = mola(clamp((t - b.inicio + .05) / .25), { freq: 1.2, amort: 7 });
  p.em({ x, y, s: .9 + .1 * e }, () => {
    p.forma(retArredP(-total / 2 - tam * .5, -tam * .85, total + tam, tam * 1.7, 18), fundo, { prof: 1, semente: 77 });
    let cx = -total / 2;
    palavras.forEach((w, i) => { const falada = t >= w.inicio && t < w.fim + .08; p.texto(w.palavra, cx + larguras[i] / 2, falada ? -tam * .06 : 0, { tam, cor: falada ? destaque : cor, peso: 800 }); cx += larguras[i] + esp; });
  });
}

/** Lista das peças para a página de demonstração e para o agente consultar. */
export const CATALOGO = {
  cenario: { chao, montanhas, arvore, nuvem, sol, estrelas, agua, chuva, casa, predio },
  objetos: { documento, pilhaDePaginas, papeisVoando, pasta, cadeado, chave, camera, cameraFoto, celular, computador, veiculo, barco, ovni, foguete, fogo, lampada, engrenagem, relogio, moeda, coracao, alerta, pino, termometro, bateria, raio, balao, graficoBarras, graficoLinha, graficoPizza, carimbo, marca, lupa, caixa, envelope, megafone, trofeu, bandeira, escudo, rede, bracoGrande },
};
