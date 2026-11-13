import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as M from "../kit/movimento.js";
import { medirQuadros, trechosParados, relatorio } from "../scripts/medir-movimento.mjs";
import { pertenceAoProduto } from "../scripts/verificar-produto.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("entradas começam invisíveis e terminam no lugar", () => {
  for (const tipo of M.ENTRADAS) {
    const fim = M.entrada(tipo, 1);
    assert.equal(M.entrada(tipo, 0).a, 0, tipo);
    assert.ok(Math.abs(fim.x) < 1e-6 && Math.abs(fim.y) < 1e-6 && Math.abs(fim.r) < .05, tipo + " termina no lugar");
    assert.ok(Math.abs(fim.s * fim.sx * fim.sy - 1) < .03 && fim.a === 1, tipo + " termina em tamanho real");
  }
});

test("movimento contínuo muda com o tempo", () => {
  for (const tipo of ["respirar", "flutuar", "balancar", "tremer", "pulsar", "pairar", "vento"])
    assert.notDeepEqual(M.vivo(tipo, .3), M.vivo(tipo, .9), tipo);
});

test("esqueleto mantém os pés no chão e a cabeça no alto em todas as poses e ciclos", () => {
  const poses = [...Object.values(M.POSES), ...Object.values(M.CICLOS).flatMap(c => [0, .2, .45, .7].map(t => c(t)))];
  for (const p of poses) {
    const e = M.esqueleto(p, { altura: 300 }), numeros = Object.values(e).flat().filter(v => typeof v === "number");
    assert.ok(numeros.every(Number.isFinite));
    if ((p.tronco || 0) < 60 && !(p.y < 0)) assert.ok(Math.abs(Math.max(e.peF[1], e.peT[1])) < 1e-6, "pé mais baixo no chão");
    if ((p.tronco || 0) < 60) assert.ok(e.cabeca[1] < -100, "cabeça acima do chão");
  }
});

test("atuar passa de uma ação à outra sem salto", () => {
  const roteiro = [{ ate: 2, acao: "andar" }, { ate: 4, acao: "apontar" }, { acao: "comemorar" }];
  const a = M.atuar(1.999, roteiro), b = M.atuar(2.001, roteiro);
  assert.ok(Math.abs(a.bracoF[0] - b.bracoF[0]) < 3);
  assert.ok(M.atuar(3.5, roteiro).bracoF[0] > 80);
  assert.ok(M.atuar(9, roteiro).bracoF[0] > 150);
});

const legendas = { duracao: 9, palavras: "Em 1977 a ordem chegou. Ribeirinhos viram luzes. Soldados filmaram tudo.".split(" ").map((p, i) => ({ palavra: p, inicio: i * .8, fim: i * .8 + .6 })) };

test("sincronia: acha o tempo de uma palavra e divide a narração em beats por frase", () => {
  assert.equal(M.tempoDaPalavra(legendas, "ribeirinhos"), 4);
  assert.equal(M.tempoDaPalavra(legendas, "inexistente"), null);
  const b = M.beatsPorFrases(legendas, ["Em 1977", "Ribeirinhos viram", "Soldados"]);
  assert.deepEqual(b.map(x => [x.de, x.ate]), [[0, 4], [4, 6.4], [6.4, 9]]);
  assert.throws(() => M.beatsPorFrases(legendas, ["Frase que não existe"]), /não tem o trecho/);
});

test("conferirBeats aponta beat sem imagem, parado, repetido e com palavra que não aparece", () => {
  const bom = { de: 0, ate: 3, fala: "x", palavrasChave: ["soldados"], mostra: ["soldados marchando"], move: ["a", "b", "c"], entrada: "pop", transicao: "rasgo" };
  assert.deepEqual(M.conferirBeats([bom]), []);
  const avisos = M.conferirBeats([bom, { de: 3, ate: 12, fala: "y", palavrasChave: ["câmeras"], mostra: ["um texto"], move: ["a"], entrada: "pop", transicao: "rasgo" }]).join("\n");
  for (const esperado of [/só 1 coisa/, /sem novos momentos/, /"câmeras" é falada/, /mesma transição/, /mesma entrada/]) assert.match(avisos, esperado);
  assert.match(M.conferirBeats([{ de: 0, ate: 2, move: ["a", "b", "c"] }]).join("\n"), /não diz o que aparece/);
});

test("caminho anda em velocidade constante e câmera interpola", () => {
  const c = M.caminho([[0, 0], [100, 0], [100, 100]], { suave: false });
  assert.equal(c.comprimento, 200);
  assert.deepEqual([c.em(.25).x, c.em(.75).y], [50, 50]);
  assert.equal(M.camera(1, [{ t: 0, zoom: 1 }, { t: 2, zoom: 2 }], k => k).zoom, 1.5);
});

test("medidor de movimento separa vídeo vivo de vídeo parado", () => {
  const parado = Array.from({ length: 26 }, () => new Uint8Array(100).fill(50));
  const vivo = Array.from({ length: 26 }, (_, i) => Uint8Array.from({ length: 100 }, (_, k) => (k + i) % 10 < 3 ? 250 : 20));
  const a = medirQuadros(parado), b = medirQuadros(vivo);
  assert.ok(a.every(v => v === 0) && b.every(v => v > .15));
  assert.deepEqual(trechosParados(a), [{ de: 0, ate: 5 }]);
  assert.deepEqual(trechosParados(b), []);
  assert.match(relatorio(a).texto, /parado demais/);
  assert.match(relatorio(b).texto, /bom nível/);
});

test("kit faz parte do produto e as peças do catálogo existem", async () => {
  for (const f of ["movimento.js", "pinceis.js", "pecas.js", "filme.js", "tocador.js", "exemplo.js", "demo.html", "LEIA-ME.md"]) {
    assert.ok(fs.existsSync(path.join(raiz, "kit", f)), f);
    assert.ok(pertenceAoProduto("kit/" + f), f);
  }
  const pecas = await import("../kit/pecas.js"), guia = fs.readFileSync(path.join(raiz, "kit", "LEIA-ME.md"), "utf8");
  for (const grupo of Object.values(pecas.CATALOGO)) for (const [nome, fn] of Object.entries(grupo)) { assert.equal(typeof fn, "function", nome); assert.ok(guia.includes(nome), `guia cita ${nome}`); }
  for (const nome of [...Object.keys(M.POSES), ...Object.keys(M.CICLOS), ...M.ENTRADAS]) assert.ok(guia.includes(nome), `guia cita ${nome}`);
});

test("skills de animação usam o kit como referência e exigem movimento", () => {
  const ler = s => fs.readFileSync(path.join(raiz, "skills", s, "SKILL.md"), "utf8");
  assert.match(ler("animar"), /kit\/LEIA-ME\.md/); assert.match(ler("animar"), /não um molde/); assert.match(ler("animar"), /Peças próprias do tema/);
  assert.match(ler("storyboard"), /beats\.json/); assert.match(ler("storyboard"), /conferir-beats/);
  assert.match(ler("revisar"), /medir-movimento/); assert.match(ler("revisar"), /Fala contra imagem/);
});
