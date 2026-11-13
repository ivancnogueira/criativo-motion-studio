// Kit de movimento — filme de demonstração. Mostra o elenco, uma cena composta, o catálogo de peças e as
// entradas, em qualquer um dos cinco pincéis. Abra kit/demo.html para ver.
//
// Leia o beat "cena" como modelo de composição: vários planos, personagens que atuam em sequência,
// objetos que chegam na hora certa, e nada parado. Não copie a cena: cada vídeo pede a sua.
import { criarFilme } from "./filme.js";
import { entrada, vivo, combinar, atuar, CICLOS, clamp, prog, E, ENTRADAS, mola, impacto, camera, aplicarCamera, lerp } from "./movimento.js";
import * as K from "./pecas.js";

const ciclo = (t, sobe = 2, espera = 1.2) => clamp((t % (sobe + espera)) / sobe);

const OBJETOS = [
  ["documento", .9, 0, (p, t) => K.documento(p, { k: ciclo(t), selo: "OK" })],
  ["pilhaDePaginas", .9, 0, (p, t) => K.pilhaDePaginas(p, { k: ciclo(t, 2.4) })],
  ["pasta", .7, 0, (p, t) => K.pasta(p, { k: E.entraSai(ciclo(t, 1.4)), rotulo: "ARQUIVO" })],
  ["cadeado", 1, 0, (p, t) => K.cadeado(p, { k: ciclo(t, 1) })],
  ["chave", 1, -90, (p, t) => p.em(vivo("balancar", t, { amp: 3 }), () => K.chave(p))],
  ["camera", .78, 0, (p, t) => K.camera(p, { t })],
  ["cameraFoto", 1.6, -60, (p, t) => K.cameraFoto(p, { flash: 1 - clamp((t % 1.5) * 3) })],
  ["celular", .5, 0, (p, t) => K.celular(p, { t })],
  ["computador", .62, 0, (p, t) => K.computador(p, { t })],
  ["veiculo", .62, 0, (p, t) => K.veiculo(p, { t })],
  ["veiculo jipe", .62, 0, (p, t) => K.veiculo(p, { t, tipo: "jipe", cor: "c3" })],
  ["barco", .62, -20, (p, t) => p.em(vivo("flutuar", t), () => K.barco(p))],
  ["ovni", .7, -170, (p, t) => p.em(vivo("pairar", t), () => K.ovni(p, { t, feixe: ciclo(t, 1.5), altFeixe: 210 }))],
  ["foguete", .8, -60, (p, t) => p.em(vivo("tremer", t, { amp: .6 }), () => K.foguete(p, { t }))],
  ["fogo", .9, 0, (p, t) => K.fogo(p, { t })],
  ["lampada", 1, 0, (p, t) => K.lampada(p, { t, acesa: ciclo(t, .8, 1.6) })],
  ["engrenagem", .9, -120, (p, t) => K.engrenagem(p, { t })],
  ["relogio", .9, -125, (p, t) => K.relogio(p, { t })],
  ["moeda", 1.3, -110, (p, t) => K.moeda(p, { t })],
  ["coracao", 1.2, -110, (p, t) => K.coracao(p, { t })],
  ["alerta", 1.1, -10, (p, t) => K.alerta(p, { t })],
  ["pino", 1.4, -10, (p, t) => K.pino(p, { t })],
  ["termometro", .6, 0, (p, t) => K.termometro(p, { t, k: ciclo(t) })],
  ["bateria", .9, -40, (p, t) => K.bateria(p, { t, k: 1 - ciclo(t, 2.4) })],
  ["raio", .8, 0, (p, t) => K.raio(p, { t })],
  ["balao", 1, -30, (p, t) => K.balao(p, { t, texto: "Olá!" })],
  ["graficoBarras", .62, -10, (p, t) => K.graficoBarras(p, { k: ciclo(t) })],
  ["graficoLinha", .6, -10, (p, t) => K.graficoLinha(p, { k: ciclo(t) })],
  ["graficoPizza", .8, -125, (p, t) => K.graficoPizza(p, { k: ciclo(t) * .8 })],
  ["carimbo", .62, -110, (p, t) => p.em(entrada("carimbar", ciclo(t, .7, 1.6)), () => K.carimbo(p, { texto: "APROVADO" }))],
  ["marca", 1.3, -110, (p, t) => K.marca(p, { k: ciclo(t, .8) })],
  ["lupa", .7, -130, (p, t) => K.lupa(p, { t })],
  ["caixa", 1, 0, (p, t) => p.em(entrada("cair", ciclo(t, 1), { dist: 160 }), () => K.caixa(p))],
  ["envelope", .8, -10, (p, t) => K.envelope(p, { k: E.entraSai(ciclo(t, 1.2)) })],
  ["megafone", .9, -120, (p, t) => K.megafone(p, { t })],
  ["trofeu", 1, 0, (p, t) => K.trofeu(p, { t })],
  ["bandeira", .62, 0, (p, t) => K.bandeira(p, { t })],
  ["escudo", 1, -10, (p, t) => K.escudo(p, { t })],
  ["rede", .58, -125, (p, t) => K.rede(p, { t })],
  ["bracoGrande", .5, -70, (p, t) => K.bracoGrande(p, { t, marca: ciclo(t) })],
  ["arvore", .62, 0, (p, t) => K.arvore(p, { t })],
  ["arvore palmeira", .62, 0, (p, t) => K.arvore(p, { t, tipo: "palmeira" })],
  ["casa palafita", .62, 0, (p, t) => K.casa(p, { t, palafita: true })],
  ["predio", .45, 0, (p, t) => K.predio(p, { t })],
  ["sol", .9, -125, (p, t) => K.sol(p, { t })],
];
const ELENCO = [["soldado", "andar"], ["ribeirinho", "acenar"], ["cientista", "digitar"], ["executiva", "comemorar"], ["operario", "empurrar"], ["jovem", "correr"], ["idoso", "olhar"], ["crianca", "tremer"]];

/** Monta o filme de demonstração no estilo pedido. */
export function criarExemplo(estilo = "papel", { vertical = true, paleta } = {}) {
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080, cols = vertical ? 3 : 5, porPagina = cols * (vertical ? 5 : 3);
  const titulo = (q, s) => q.p.em(combinar({ x: W / 2, y: vertical ? 300 : 110 }, entrada("deslizar", q.entra, { de: "cima", dist: 300 })), () => q.p.etiqueta(s, 0, 0, { tam: vertical ? 58 : 50, fundo: "c1", ponta: true, prof: 2 }));
  const grade = (i, n, topo, base) => { const lin = Math.ceil(n / cols), cw = W / cols, ch = (base - topo) / lin; return { x: cw * (i % cols + .5), y: topo + ch * (Math.floor(i / cols) + 1) - 70, cw, ch }; };

  const beats = [];
  // 1. Elenco: oito personagens, cada um num ciclo diferente.
  beats.push({ de: 0, ate: 6, desenhar(q) {
    const { p, ritmo: t } = q; titulo(q, "ELENCO E CICLOS");
    const c4 = vertical ? 4 : 8;
    ELENCO.forEach(([tipo, acao], i) => {
      const x = W / c4 * (i % c4 + .5), y = (vertical ? 900 : 760) + Math.floor(i / c4) * 520, k = q.cascata(i, { atraso: .1 });
      p.em(combinar({ x, y }, entrada("pop", k)), () => { p.elipse(0, 6, 90, 16, "sombra", { prof: 0, liso: true }); K.personagem(p, { ...K.TIPOS[tipo], pose: CICLOS[acao](t), t, semente: i, expressao: acao === "tremer" ? "susto" : acao === "comemorar" ? "feliz" : "neutro" }); p.texto(`${tipo} · ${acao}`, 0, 70, { tam: 28, cor: "tinta", peso: 700 }); });
    });
  } });
  // 2. Cena composta: planos, atuação em sequência, chegada de objetos, câmera.
  beats.push({ de: 6, ate: 15, desenhar(q) {
    const { p, ritmo: t, local: L } = q, chaoY = vertical ? 1380 : 860;
    p.c.save(); aplicarCamera(p.c, camera(L, [{ t: 0, x: W / 2, y: H / 2, zoom: 1 }, { t: 3, x: W / 2, y: H / 2, zoom: 1 }, { t: 5, x: W * .5, y: H * .46, zoom: 1.14 }, { t: 9, x: W * .5, y: H * .46, zoom: 1.14 }]), W, H);
    const tremor = impacto(L, 3.6, { forca: 14 }); p.c.translate(tremor.x, tremor.y);
    p.em({ x: W * .78, y: chaoY - 760 }, () => K.sol(p, { t, r: 70, lua: true, cor: "claro" }));
    p.em({ x: W * .2, y: chaoY - 800 }, () => K.nuvem(p, { t, larg: 260 }));
    p.em({ x: W / 2, y: chaoY - 60 }, () => K.montanhas(p, { W: W * 1.3, alt: 380, cor: "c4" }));
    p.em({ x: W * .12, y: chaoY - 30 }, () => K.arvore(p, { t, tipo: "palmeira", alt: 420 }));
    p.em(combinar({ x: W * .8, y: chaoY - 20 }, entrada("crescer", q.cascata(0, { espera: .2 }))), () => K.casa(p, { t, palafita: true, larg: 280, telhado: "c1" }));
    // o disco chega por um arco, para sobre a cena e liga o feixe
    const ch = E.sai(prog(L, 1.6, 3.4)), ox = lerp(-300, W * .46, ch), oy = lerp(chaoY - 1300, chaoY - 900, ch) - Math.sin(ch * Math.PI) * 120;
    p.em(combinar({ x: ox, y: oy }, vivo("pairar", t)), () => K.ovni(p, { t, larg: 380, feixe: E.sai(prog(L, 3.6, 4.6)), altFeixe: 880 }));
    p.em({ x: W / 2, y: chaoY }, () => K.agua(p, { t, W: W * 1.3, alt: H - chaoY + 80, cor: "c3" }));
    // remador entra pela esquerda e para
    const bx = lerp(-260, W * .34, E.sai(prog(L, 0, 3)));
    p.em(combinar({ x: bx, y: chaoY + 70 }, vivo("flutuar", t, { amp: .8 })), () => {
      p.em({ x: -20, y: -34 }, () => K.personagem(p, { ...K.TIPOS.ribeirinho, altura: 250, t, semente: 2, expressao: L > 3.6 ? "susto" : "neutro", pose: atuar(L, [{ ate: 3, acao: "remar" }, { ate: 3.6, acao: "sentado" }, { acao: t => ({ ...CICLOS.tremer(t), pernaF: [86, 86], pernaT: [80, 84] }) }]) }));
      K.barco(p, { larg: 400, cor: "c1" });
    });
    // soldado entra andando pela direita, para, aponta e fotografa
    const sx = lerp(W + 200, W * .7, prog(L, .8, 3.2));
    p.em({ x: sx, y: chaoY + 6 }, () => K.personagem(p, { ...K.TIPOS.soldado, virado: -1, altura: 300, t, semente: 4, expressao: L > 3.6 ? "susto" : "neutro",
      pose: atuar(L, [{ ate: 3.2, acao: "andar" }, { ate: 3.6, acao: "parado" }, { ate: 5.4, acao: "apontarCima" }, { acao: "fotografar" }]),
      naMao: L > 5.4 ? pp => K.cameraFoto(pp, { larg: 90, flash: 1 - clamp(((L - 5.6) % 1.2) * 4) }) : null }));
    p.em(combinar({ x: W * .66, y: chaoY - 400 }, entrada("pop", prog(L, 3.9, 4.4)), saida0(prog(L, 5.2, 5.5))), () => K.balao(p, { t, texto: "Olha!", lado: 1 }));
    p.c.restore();
    titulo(q, "CENA COMPOSTA");
  } });
  // 3. Catálogo de peças, em páginas.
  for (let pg = 0; pg * porPagina < OBJETOS.length; pg++) {
    const de = 15 + pg * 6, itens = OBJETOS.slice(pg * porPagina, (pg + 1) * porPagina);
    beats.push({ de, ate: de + 6, desenhar(q) {
      const { p, ritmo: t } = q; titulo(q, `PEÇAS ${pg + 1}`);
      itens.forEach(([nome, s, dy, fn], i) => {
        const g = grade(i, porPagina, vertical ? 400 : 190, vertical ? 1800 : 1040), tipo = ENTRADAS[(i + pg * 3) % ENTRADAS.length];
        p.em(combinar({ x: g.x, y: g.y }, entrada(tipo === "carimbar" ? "pop" : tipo, q.cascata(i, { atraso: .07, dur: .6 }), { dist: 200 })), () => { p.em({ x: 0, y: dy * s, s: s * (vertical ? .78 : .8) }, () => fn(p, t + i)); p.texto(nome, 0, 44, { tam: 24, cor: "tinta", peso: 700 }); });
      });
    } });
  }
  // 4. Entradas e movimentos contínuos.
  const fim = beats.at(-1).ate;
  beats.push({ de: fim, ate: fim + 7, desenhar(q) {
    const { p, ritmo: t, local: L } = q; titulo(q, "ENTRADAS E VIDA");
    ENTRADAS.forEach((tipo, i) => { const col = i % 2, lin = Math.floor(i / 2), x = W * (col ? .72 : .28), y = (vertical ? 520 : 260) + lin * (vertical ? 150 : 110); p.em(combinar({ x, y }, entrada(tipo, clamp(((L + 3 - i * .12) % 3) / .8), { de: col ? "direita" : "esquerda", dist: 300 })), () => p.etiqueta(tipo, 0, 0, { tam: 38, fundo: ["c1", "c3", "c2", "c4"][i % 4], cor: "tinta" })); });
    ["respirar", "flutuar", "balancar", "tremer", "pulsar", "pairar", "vento"].forEach((tipo, i) => { const x = W / 7 * (i + .5), y = vertical ? 1620 : 960; p.em(combinar({ x, y }, vivo(tipo, t, { amp: 2, semente: i })), () => p.circulo(0, -60, 46, ["c1", "c3", "c2", "c4"][i % 4], { prof: 2, semente: i + 1 })); p.texto(tipo, x, y + 20, { tam: 22, cor: "tinta", peso: 700 }); });
    void mola;
  } });
  return criarFilme({ largura: W, altura: H, estilo, paleta, beats });
}
const saida0 = k => ({ s: 1 - E.entra(k), a: k >= 1 ? 0 : 1 });
