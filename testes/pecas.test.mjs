import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as K from "../kit/pecas.js";
import { criarPincel } from "../kit/pinceis.js";
import { criarContextoFalso, prepararAmbienteFalso } from "../kit/contexto-falso.js";
import { opcoesDaPeca, medirPeca } from "../kit/galeria.js";
import { legenda, NOMES_DE_LEGENDA, ESTILOS_DE_LEGENDA, conferirEstiloDeLegenda, legendasDeExemplo } from "../kit/legendas.js";
import { gerarIndice, textoDoIndice, textoDoReexportador, lerIndice, buscar, buscarPersonagens, ORDEM } from "../scripts/pecas.mjs";
import { CICLOS } from "../kit/movimento.js";
import { montarPrompt } from "../scripts/montar-prompt.mjs";
import { validarProjeto } from "../scripts/painel.mjs";
import { pertenceAoProduto } from "../scripts/verificar-produto.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ler = f => fs.readFileSync(path.join(raiz, f), "utf8").replace(/\r\n/g, "\n");
const PINCEIS = ["papel", "flat", "pixel", "traco", "vidro"];
const indice = lerIndice(raiz);
prepararAmbienteFalso();

/** Desenha uma peça num pincel com o contexto falso e devolve o contexto, para olhar o que foi registrado. */
function desenhar(pc, estilo, t, registrar = false) {
  const ctx = criarContextoFalso({ largura: 600, altura: 600, registrar }), p = criarPincel(estilo);
  p.inicio(ctx, 600, 600, t); p.em({ x: 300, y: 400 }, () => K[pc.nome](p, opcoesDaPeca(pc, t))); p.fim();
  return ctx;
}

test("índice das peças está em dia com o código de kit/pecas/", async () => {
  assert.equal(ler("kit/pecas.js"), textoDoReexportador(raiz), "kit/pecas.js não reexporta todas as categorias: rode node scripts/pecas.mjs --gerar");
  assert.equal(ler("kit/indice.json"), textoDoIndice(await gerarIndice(raiz)), "kit/indice.json está desatualizado: rode node scripts/pecas.mjs --gerar");
});

test("biblioteca tem 300 peças ou mais, com categorias não vazias, com nome único, descrição e palavras-chave", () => {
  assert.ok(indice.total >= 300, `só ${indice.total} peças`);
  assert.equal(indice.total, indice.pecas.length);
  assert.deepEqual(indice.categorias.map(c => c.id), ORDEM, "categorias na ordem esperada");
  for (const c of indice.categorias) {
    assert.equal(c.total, indice.pecas.filter(pc => pc.categoria === c.id).length, c.id);
    assert.ok(c.total > 0, `${c.id} não tem peças`);
    assert.ok(pertenceAoProduto(`kit/pecas/${c.id}.js`), c.id);
  }
  const nomes = indice.pecas.map(pc => pc.nome);
  assert.equal(new Set(nomes).size, nomes.length, "nome repetido: " + nomes.filter((n, i) => nomes.indexOf(n) !== i).join(", "));
  for (const pc of indice.pecas) {
    assert.ok(pc.descricao.length >= 12, `${pc.nome}: falta a descrição no comentário de uma linha`);
    assert.ok(pc.chaves.length >= 3, `${pc.nome}: precisa de pelo menos 3 palavras-chave`);
    assert.match(pc.exemplo, new RegExp(`K\\.${pc.nome}\\(p`), pc.nome);
  }
  assert.ok(pertenceAoProduto("kit/indice.json"));
});

test("kit/pecas.js reexporta tudo: cada peça do índice existe, é função e está na sua categoria", () => {
  assert.deepEqual(Object.keys(K.CATEGORIAS), indice.categorias.map(c => c.id));
  for (const pc of indice.pecas) {
    assert.equal(typeof K[pc.nome], "function", `${pc.nome} não é exportada por kit/pecas.js`);
    assert.equal(K.CATEGORIAS[pc.categoria][pc.nome], K[pc.nome], pc.nome);
  }
  for (const antiga of ["personagem", "TIPOS", "CATALOGO", "legendas", "arcoP", "estrelaP"]) assert.ok(K[antiga], antiga);
});

test("cada peça desenha sem erro nos cinco pincéis", () => {
  for (const pc of indice.pecas) for (const estilo of PINCEIS) for (const t of [.4, 2.3]) {
    let ctx;
    assert.doesNotThrow(() => { ctx = desenhar(pc, estilo, t); }, `${pc.nome} no pincel ${estilo}, t = ${t}`);
    assert.deepEqual(ctx.invalidos, [], `${pc.nome} (${estilo}) passou número inválido ao canvas`);
  }
  for (const pc of indice.pecas) {
    assert.ok(desenhar(pc, "flat", .4).formas > 0 || desenhar(pc, "flat", 1.1).formas > 0, `${pc.nome} não desenhou nada`);
    const [x0, y0, x1, y1] = medirPeca(K[pc.nome], pc);
    assert.ok(x1 - x0 < 2600 && y1 - y0 < 2600, `${pc.nome}: tamanho padrão exagerado`);
  }
});

test("peças das categorias novas têm movimento próprio e usam só o pincel", () => {
  for (const pc of indice.pecas.filter(pc => pc.categoria !== "base")) {
    const quadros = [.4, 1.7, 2.9].map(t => JSON.stringify(desenhar(pc, "flat", t, true).chamadas));
    assert.ok(new Set(quadros).size > 1, `${pc.nome} está parada: o desenho não muda com t`);
    assert.match(pc.parametros, /(^|,\s*)t\b/, `${pc.nome} precisa aceitar t`);
  }
  for (const c of indice.categorias.filter(c => c.id !== "base")) {
    const fonte = ler(`kit/pecas/${c.id}.js`);
    assert.match(fonte, /^\/\/ Categoria: /, c.id);
    for (const [re, o] of [[/\bp\.c\b/, "p.c"], [/\b(?:document|window)\s*\./, "document/window"], [/Math\.random|Date\.now|new Date/, "Math.random/Date"], [/getContext|ctx\./, "contexto do canvas"]]) assert.doesNotMatch(fonte, re, `${c.id}.js usa ${o}`);
  }
});

test("elenco: os tipos só citam penteados, chapéus e acessórios que existem", () => {
  const e = indice.elenco;
  assert.deepEqual(e.tipos, Object.keys(K.TIPOS));
  for (const [nome, tipo] of Object.entries(K.TIPOS)) {
    for (const [campo, lista] of [["penteado", e.penteados], ["chapeu", e.chapeus], ["rosto", e.rostos], ["noTronco", e.trajes], ["nasCostas", e.costas]])
      for (const v of [].concat(tipo[campo] ?? [])) if (typeof v === "string") assert.ok(lista.includes(v), `TIPOS.${nome}.${campo}: "${v}" não existe`);
  }
  assert.ok(e.tipos.length >= 20 && e.chapeus.length >= 12 && e.penteados.length >= 10, "elenco ampliado");
  for (const estilo of PINCEIS) for (const tipo of e.tipos) {
    const ctx = criarContextoFalso({ registrar: false }), p = criarPincel(estilo); p.inicio(ctx, 600, 600, 1);
    assert.doesNotThrow(() => K.personagem(p, { ...K.TIPOS[tipo], pose: "acenar", t: 1 }), `${tipo} (${estilo})`); p.fim();
    assert.deepEqual(ctx.invalidos, [], tipo);
  }
});

test("busca acha peças por palavra-chave, sem depender de acento, maiúscula ou plural", () => {
  const nomes = t => buscar(indice, t).map(pc => pc.nome);
  assert.ok(nomes("exército").includes("tanque") && nomes("EXERCITO").includes("pelotao"));
  assert.ok(nomes("médicos").includes("medico"));
  assert.ok(nomes("dinheiro").length >= 5);
  assert.equal(nomes("seta")[0].startsWith("seta"), true);
  assert.deepEqual(nomes("palavraquenaoexiste"), []);
});

const dadosDeTeste = (() => { const d = legendasDeExemplo("Soldados filmaram tudo, e ninguém explicou o que eram as luzes."); const d0 = d.palavras[0].inicio; for (const l of [...d.palavras, ...d.blocos]) { l.inicio = +(l.inicio - d0).toFixed(2); l.fim = +(l.fim - d0).toFixed(2); } d.duracao = d.palavras.at(-1).fim; return d; })();

test("legendas: todos os estilos desenham no começo, no meio e no fim, nos cinco pincéis", () => {
  assert.ok(NOMES_DE_LEGENDA.length >= 13, `${NOMES_DE_LEGENDA.length} estilos`);
  for (const nome of NOMES_DE_LEGENDA) {
    assert.ok(ESTILOS_DE_LEGENDA[nome].nome && ESTILOS_DE_LEGENDA[nome].descricao, nome);
    for (const estilo of PINCEIS) for (const [t, quando] of [[0, "começo"], [dadosDeTeste.duracao / 2, "meio"], [dadosDeTeste.duracao, "fim"]]) {
      const ctx = criarContextoFalso({ registrar: true }), p = criarPincel(estilo); let desenhou;
      p.inicio(ctx, 1080, 1920, t);
      assert.doesNotThrow(() => { desenhou = legenda(p, dadosDeTeste, t, { estilo: nome }); }, `${nome} (${estilo}) no ${quando}`);
      p.fim();
      assert.equal(desenhou, true, `${nome} não achou trecho no ${quando}`);
      assert.ok(ctx.chamadas.some(c => c[0] === "fillText"), `${nome} (${estilo}) não escreveu nada no ${quando}`);
      assert.deepEqual(ctx.invalidos, [], `${nome} (${estilo})`);
      const [x0, y0, x1, y1] = ctx.caixa;
      if (estilo !== "pixel") assert.ok(x0 > -60 && x1 < 1140 && y0 > 0 && y1 < 1920 * .8, `${nome} (${estilo}) sai da área segura no ${quando}: ${[x0, y0, x1, y1].map(Math.round)}`);
    }
  }
  // sem tempos por palavra e sem blocos, ainda funciona
  const p = criarPincel("flat"); p.inicio(criarContextoFalso(), 1080, 1920, 1);
  assert.equal(legenda(p, { blocos: [{ inicio: 0, fim: 2, texto: "Só o bloco" }] }, 1, { estilo: "karaoke" }), true);
  assert.equal(legenda(p, { palavras: dadosDeTeste.palavras }, .2, { estilo: "pop" }), true);
  assert.equal(legenda(p, dadosDeTeste, 99), false);
  assert.equal(K.legendas(p, dadosDeTeste, .2), true);
});

test("estiloLegenda inválido dá erro claro; o campo está no exemplo, no AGENTS, no montador e no painel", () => {
  assert.throws(() => conferirEstiloDeLegenda("neon"), /estiloLegenda "neon" não existe\. Opções: bloco, /);
  const p = criarPincel("flat"); p.inicio(criarContextoFalso(), 1080, 1920, 0);
  assert.throws(() => legenda(p, dadosDeTeste, 0, { estilo: "neon" }), /estiloLegenda "neon" não existe/);
  const base = { estilo: "vetor-flat", tema: "teste", narracao: true, legendas: true, vertical: true };
  assert.throws(() => montarPrompt({ ...base, estiloLegenda: "neon" }), /estiloLegenda "neon" não existe\. Opções:/);
  assert.match(montarPrompt({ ...base, estiloLegenda: "karaoke" }), /On-screen caption style: "karaoke"/);
  assert.match(montarPrompt(base), /On-screen caption style: "bloco"/);
  assert.doesNotMatch(montarPrompt({ ...base, legendas: false, estiloLegenda: "karaoke" }), /On-screen caption style/);
  const estilos = ["vetor-flat"];
  assert.equal(validarProjeto({ ...base, estiloLegenda: "pop" }, { estilos }).estiloLegenda, "pop");
  assert.equal(validarProjeto(base, { estilos }).estiloLegenda, "bloco");
  assert.throws(() => validarProjeto({ ...base, estiloLegenda: "neon" }, { estilos }), /estiloLegenda "neon" não existe/);
  assert.ok(NOMES_DE_LEGENDA.includes(JSON.parse(ler("projeto.exemplo.json")).estiloLegenda));
  const agents = ler("AGENTS.md"), painel = ler("painel/app.js"), skillLegendas = ler("skills/legendas/SKILL.md");
  for (const nome of NOMES_DE_LEGENDA) {
    assert.ok(agents.includes("`" + nome + "`"), `AGENTS.md cita ${nome}`);
    assert.ok(skillLegendas.includes("`" + nome + "`"), `skills/legendas/SKILL.md cita ${nome}`);
  }
  assert.match(painel, /estiloLegenda/);
  assert.deepEqual(indice.legendas.map(l => l.id), NOMES_DE_LEGENDA);
});

test("guia e skills ensinam a buscar no índice antes de desenhar e a escolher a legenda", () => {
  const guia = ler("kit/LEIA-ME.md"), skill = s => ler(`skills/${s}/SKILL.md`);
  assert.match(guia, /pecas\.mjs/); assert.match(guia, /indice\.json/); assert.match(guia, /estiloLegenda/);
  assert.ok(guia.split("\n").length < 110, "o guia deve continuar curto");
  for (const s of ["animar", "storyboard", "criar-video"]) assert.match(skill(s), /pecas\.mjs/, s);
  for (const s of ["animar", "legendas", "criar-video"]) assert.match(skill(s), /estiloLegenda/, s);
  assert.match(skill("animar"), /Peças próprias do tema/);
  assert.match(ler("kit/demo.html"), /indice\.json/);
  assert.equal(JSON.parse(ler("package.json")).scripts.pecas, "node scripts/pecas.mjs");
});

test("elenco diverso: todas as idades, gêneros e tons de pele, com acessórios que existem, desenhando nos cinco pincéis", () => {
  const ids = Object.keys(K.PERSONAGENS), xs = Object.values(K.PERSONAGENS), e = indice.elenco;
  assert.ok(ids.length >= 36, `só ${ids.length} personagens`);
  for (const idade of K.FAIXAS) {
    const daIdade = xs.filter(x => x.idade === idade);
    assert.ok(daIdade.length >= 6, `poucos personagens de ${idade}`);
    assert.ok(new Set(daIdade.map(x => x.genero)).size >= 2, `${idade} sem variedade de gênero`);
    assert.ok(new Set(daIdade.map(x => x.pele)).size >= 4, `${idade} sem variedade de tom de pele`);
  }
  for (const g of K.GENEROS) assert.ok(xs.some(x => x.genero === g), `falta gênero ${g}`);
  for (let i = 0; i < 6; i++) assert.ok(xs.some(x => x.pele === "pele" + i), `falta pele${i}`);
  assert.ok(xs.some(x => x.cadeira) && xs.some(x => x.bengala) && xs.some(x => x.opcoes.chapeu === "hijab"), "cadeira de rodas, bengala e hijab");
  for (const [id, x] of Object.entries(K.PERSONAGENS)) {
    assert.ok(K.IDADES[x.idade] && K.GENEROS.includes(x.genero) && K.CABELOS[x.cabelo], id);
    for (const [campo, lista] of [["penteado", e.penteados], ["chapeu", e.chapeus], ["rosto", e.rostos], ["noTronco", e.trajes], ["nasCostas", e.costas]])
      for (const v of [].concat(x.opcoes[campo] ?? [])) assert.ok(lista.includes(v), `${id}.${campo}: "${v}" não existe`);
    for (const estilo of PINCEIS) for (const pose of [undefined, "apontar", CICLOS.andar(1.2)]) {
      const ctx = criarContextoFalso({ registrar: false }), p = criarPincel(estilo); p.inicio(ctx, 600, 600, 1.2);
      assert.doesNotThrow(() => K.pessoa(p, id, { pose, t: 1.2, virado: -1 }), `${id} (${estilo})`); p.fim();
      assert.deepEqual(ctx.invalidos, [], `${id} (${estilo})`);
    }
  }
  assert.throws(() => K.pessoa(criarPincel("flat"), "ninguem"), /personagem "ninguem" não existe\. Opções:/);
  const cinco = K.escolherElenco({ n: 5, semente: 2 });
  assert.equal(new Set(cinco).size, 5);
  assert.equal(new Set(cinco.map(id => K.PERSONAGENS[id].pele)).size, 5, "escolherElenco varia os tons de pele");
  assert.ok(K.escolherElenco({ n: 3, idade: "idoso" }).every(id => K.PERSONAGENS[id].idade === "idoso"));
  assert.deepEqual(indice.personagens.map(x => x.id), ids, "índice traz o elenco");
  const idosas = buscarPersonagens(indice, "idosa").map(x => x.id);
  assert.ok(idosas.every(id => K.PERSONAGENS[id].idade === "idoso") && ids.filter(id => K.PERSONAGENS[id].idade === "idoso" && K.PERSONAGENS[id].genero === "feminino").every(id => idosas.includes(id)), "busca por idosa");
  assert.match(ler("kit/demo.html"), /data-aba="personagens"/);
});
