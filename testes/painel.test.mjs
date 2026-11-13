import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { criarPainel, nomeSeguro, assinatura, validarProjeto, validarMarca } from "../scripts/painel.mjs";
import { empacotar } from "../scripts/empacotar.mjs";

// O painel grava em projeto.json, marca.json e entrada/, então os testes rodam numa cópia limpa e instalada à mão.
function instancia() {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "motion-painel-"));
  const destino = path.join(pasta, "copia");
  empacotar(destino);
  fs.writeFileSync(path.join(destino, ".env"), "");
  return destino;
}
async function subir(base) {
  const servidor = criarPainel({ base });
  await new Promise(ok => servidor.listen(0, "127.0.0.1", ok));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  return { url, fechar: () => new Promise(ok => servidor.close(ok)) };
}
const post = (url, corpo, extra = {}) => fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-painel": "1", ...extra }, body: JSON.stringify(corpo) });
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypisom"), Buffer.alloc(200)]);

test("nomes e assinaturas de arquivo", () => {
  assert.equal(nomeSeguro("Neon Retrô!! ../x"), "neon-retro-x");
  assert.equal(nomeSeguro("???", "video"), "video");
  assert.equal(assinatura(MP4), "mp4");
  assert.equal(assinatura(Buffer.from("ID3\u0004" + "\0".repeat(20))), "mp3");
  assert.equal(assinatura(Buffer.alloc(40)), null);
});

test("valida projeto e marca", () => {
  const estilos = ["vetor-flat"];
  assert.throws(() => validarProjeto({ estilo: "../x", tema: "a", duracaoSegundos: 20 }, { estilos }), /estilos da lista/);
  assert.throws(() => validarProjeto({ estilo: "vetor-flat", tema: " ", duracaoSegundos: 20 }, { estilos }), /tema/);
  assert.throws(() => validarProjeto({ estilo: "vetor-flat", tema: "a", duracaoSegundos: 2 }, { estilos }), /duração/);
  assert.throws(() => validarProjeto({ estilo: "vetor-flat", tema: "a", duracaoSegundos: 20, paleta: "personalizada", cores: { dominante: "azul" } }, { estilos }), /hexadecimal/);
  const p = validarProjeto({ estilo: "vetor-flat", tema: "a", narracao: true, legendas: true, vertical: true }, { estilos, atual: { campoNovo: 1 } });
  assert.equal(p.legendas, true); assert.equal(p.campoNovo, 1);
  assert.equal(validarProjeto({ estilo: "vetor-flat", tema: "a", duracaoSegundos: 20, legendas: true }, { estilos }).legendas, false);
  assert.throws(() => validarMarca({ nome: "", cores: {} }), /nome/);
  assert.equal(validarMarca({ nome: "A{{B", cores: { dominante: "#aabbcc", destaque: "#112233", apoio: "#ffffff" } }).nome, "AB");
});

test("painel: estado, gravação, envio e proteções", async () => {
  const base = instancia();
  const { url, fechar } = await subir(base);
  try {
    const estado = await (await fetch(url + "/api/estado")).json();
    assert.equal(estado.estilos.length, 5);
    assert.equal(estado.instancia, true);
    assert.equal((await fetch(url + "/")).status, 200);
    assert.equal((await fetch(url + "/painel/painel.js")).status, 200);
    assert.equal((await fetch(url + "/.env")).status, 404);
    assert.equal((await fetch(url + "/scripts/painel.mjs")).status, 404);
    assert.equal((await fetch(url + "/estilos/vetor-flat/prompt.md")).status, 404);

    const ok = { estilo: "vetor-flat", tema: "Como funciona o Wi-Fi", duracaoSegundos: 20, vertical: true, paleta: "estilo" };
    assert.equal((await post(url + "/api/projeto", ok)).status, 200);
    assert.equal(JSON.parse(fs.readFileSync(path.join(base, "projeto.json"), "utf8")).tema, "Como funciona o Wi-Fi");
    assert.equal((await post(url + "/api/projeto", ok, { "x-painel": "0" })).status, 403);
    assert.equal((await post(url + "/api/projeto", ok, { origin: "http://outro.site" })).status, 403);
    assert.equal((await post(url + "/api/projeto", { ...ok, estilo: "../.." })).status, 400);

    const envio = (nome, corpo, tipo = "video") => fetch(`${url}/api/enviar?tipo=${tipo}&nome=${encodeURIComponent(nome)}`, { method: "POST", headers: { "x-painel": "1" }, body: corpo });
    const bom = await envio("Meu Vídeo.mp4", MP4);
    assert.equal(bom.status, 200);
    assert.ok(fs.existsSync(path.join(base, "entrada", "referencia-meu-video.mp4")));
    assert.equal((await envio("falso.mp4", Buffer.alloc(300))).status, 415);
    assert.equal((await envio("texto.exe", MP4)).status, 415);
    assert.equal((await envio("../../fuga.mp4", MP4)).status, 200);
    assert.ok(fs.existsSync(path.join(base, "entrada", "referencia-fuga.mp4")));
    assert.deepEqual(fs.readdirSync(path.join(base, "entrada")).filter(f => f.endsWith(".parcial")), []);
    assert.equal((await post(url + "/api/extrair", { arquivo: "../../projeto.json", nome: "x" })).status, 400);
    assert.equal((await post(url + "/api/extrair", { arquivo: "referencia-nao-existe.mp4", nome: "x" })).status, 404);
  } finally { await fechar(); fs.rmSync(path.dirname(base), { recursive: true, force: true }); }
});

test("painel recusa gravar em pasta não instalada e host estranho", async () => {
  const base = instancia();
  fs.rmSync(path.join(base, ".env"));
  const { url, fechar } = await subir(base);
  try {
    const r = await post(url + "/api/projeto", { estilo: "vetor-flat", tema: "a", duracaoSegundos: 20 });
    assert.equal(r.status, 409);
    assert.equal(fs.existsSync(path.join(base, "projeto.json")), false);
    const status = await new Promise((ok, falha) => {
      const q = http.request({ host: "127.0.0.1", port: new URL(url).port, path: "/api/estado", headers: { host: "exemplo.com" } }, s => { s.resume(); ok(s.statusCode); });
      q.on("error", falha); q.end();
    });
    assert.equal(status, 403);
  } finally { await fechar(); fs.rmSync(path.dirname(base), { recursive: true, force: true }); }
});
