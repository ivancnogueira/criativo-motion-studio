import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { empacotar, empacotarZip } from "../scripts/empacotar.mjs";
import { aplicar, chavesNovasDoEnv, compararVersoes, localizarRaiz, planejar } from "../scripts/atualizar.mjs";
import { pertenceAoProduto, listarArquivos } from "../scripts/verificar-produto.mjs";
import { raiz } from "../scripts/lib/ambiente.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "motion-atualizar-teste-"));
const escrever = (base, rel, texto) => { fs.mkdirSync(path.dirname(path.join(base, rel)), { recursive: true }); fs.writeFileSync(path.join(base, rel), texto); };
const ler = (base, rel) => fs.readFileSync(path.join(base, rel), "utf8");
const versao = (base, v) => { const p = JSON.parse(ler(base, "produto.json")); p.versao = v; fs.writeFileSync(path.join(base, "produto.json"), JSON.stringify(p, null, 2)); };

// Instalação de um cliente: produto + dados dele.
function instalacaoComDados(pasta) {
  const base = path.join(pasta, "cliente");
  empacotar(base);
  versao(base, "0.1.0");
  escrever(base, ".env", "GROQ_API_KEY=segredo-do-cliente\nVOZ_PROVEDOR=fish\n");
  escrever(base, "marca.json", '{"nome":"Marca do Cliente"}');
  escrever(base, "projeto.json", '{"tema":"meu tema"}');
  escrever(base, "entrada/voz.mp3", "audio do cliente");
  escrever(base, "saida/video/index.html", "video do cliente");
  escrever(base, "runtime/estado.json", "{}");
  escrever(base, "render/node_modules/remotion/index.js", "x");
  escrever(base, "estilos/meu-estilo/estilo.json", '{"nome":"Meu estilo","personalizado":true}');
  escrever(base, "estilos/meu-estilo/direcao.md", "direção do cliente");
  return base;
}

test("compara versões", () => {
  assert.equal(compararVersoes("0.2.0", "0.10.0"), -1);
  assert.equal(compararVersoes("1.0.0", "0.9.9"), 1);
  assert.equal(compararVersoes("0.2", "0.2.0"), 0);
});

test("atualização troca só arquivos do produto e preserva todos os dados do cliente", () => {
  const pasta = tmp();
  try {
    const base = instalacaoComDados(pasta);
    const pacote = path.join(pasta, "pacote");
    empacotar(pacote);
    versao(pacote, "0.3.0");
    escrever(pacote, "README.md", "README novo");
    escrever(pacote, "documentacao/novo.md", "documento novo");
    // um pacote malicioso ou mal feito: tenta levar dados e colidir com o estilo do cliente
    escrever(pacote, ".env", "GROQ_API_KEY=trocada");
    escrever(pacote, "marca.json", '{"nome":"Outra marca"}');
    escrever(pacote, "projeto.json", '{"tema":"outro"}');
    escrever(pacote, "saida/intruso.txt", "x");
    escrever(pacote, "entrada/intruso.mp3", "x");
    escrever(pacote, "render/intruso.js", "x");
    escrever(pacote, "estilos/meu-estilo/estilo.json", '{"nome":"Sequestrado"}');
    escrever(pacote, "node_modules/x/y.js", "x");

    const plano = planejar(pacote, base);
    assert.equal(plano.de, "0.1.0"); assert.equal(plano.para, "0.3.0");
    assert.ok(plano.alterados.includes("README.md") && plano.alterados.includes("produto.json"));
    assert.ok(plano.novos.includes("documentacao/novo.md"));
    for (const a of [...plano.novos, ...plano.alterados]) assert.ok(pertenceAoProduto(a), `${a} não deveria ser atualizado`);
    aplicar(plano, base);

    assert.equal(ler(base, "README.md"), "README novo");
    assert.equal(ler(base, "documentacao/novo.md"), "documento novo");
    assert.equal(JSON.parse(ler(base, "produto.json")).versao, "0.3.0");
    // dados do cliente intactos
    assert.equal(ler(base, ".env"), "GROQ_API_KEY=segredo-do-cliente\nVOZ_PROVEDOR=fish\n");
    assert.equal(ler(base, "marca.json"), '{"nome":"Marca do Cliente"}');
    assert.equal(ler(base, "projeto.json"), '{"tema":"meu tema"}');
    assert.equal(ler(base, "entrada/voz.mp3"), "audio do cliente");
    assert.equal(ler(base, "saida/video/index.html"), "video do cliente");
    assert.equal(ler(base, "runtime/estado.json"), "{}");
    assert.equal(ler(base, "render/node_modules/remotion/index.js"), "x");
    assert.equal(ler(base, "estilos/meu-estilo/estilo.json"), '{"nome":"Meu estilo","personalizado":true}');
    assert.equal(ler(base, "estilos/meu-estilo/direcao.md"), "direção do cliente");
    // nada do que veio de fora do produto entrou
    for (const rel of ["saida/intruso.txt", "entrada/intruso.mp3", "render/intruso.js", "node_modules/x/y.js"]) assert.equal(fs.existsSync(path.join(base, rel)), false, rel);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});

test("recusa pacote mais antigo, igual ou de outro produto", () => {
  const pasta = tmp();
  try {
    const base = instalacaoComDados(pasta);
    versao(base, "0.5.0");
    const pacote = path.join(pasta, "pacote");
    empacotar(pacote); versao(pacote, "0.4.0");
    assert.throws(() => planejar(pacote, base), /mais antigo/);
    assert.doesNotThrow(() => planejar(pacote, base, { forcar: true }));
    versao(pacote, "0.5.0");
    assert.throws(() => planejar(pacote, base), /já está na versão/);
    const outro = JSON.parse(ler(pacote, "produto.json")); outro.nome = "Outro Produto"; outro.versao = "9.0.0";
    fs.writeFileSync(path.join(pacote, "produto.json"), JSON.stringify(outro));
    assert.throws(() => planejar(pacote, base), /outro produto/);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});

test("acha a raiz do pacote em pasta aninhada e recusa o que não é o produto", () => {
  const pasta = tmp();
  try {
    empacotar(path.join(pasta, "externa", "criativo-motion-studio"));
    assert.equal(path.basename(localizarRaiz(path.join(pasta, "externa"))), "criativo-motion-studio");
    fs.mkdirSync(path.join(pasta, "vazia"));
    assert.throws(() => localizarRaiz(path.join(pasta, "vazia")), /não parece um pacote/);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});

test("avisa só os nomes das variáveis novas do .env, nunca valores", () => {
  const pasta = tmp();
  try {
    escrever(pasta, ".env.example", "A=\nB=\nNOVA_CHAVE=\n");
    escrever(pasta, ".env", "A=1\nB=valor-secreto\n");
    assert.deepEqual(chavesNovasDoEnv(pasta), ["NOVA_CHAVE"]);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});

test("comando atualizar com ZIP novo e com pasta, sem tocar nos dados", () => {
  const pasta = tmp();
  try {
    const base = instalacaoComDados(pasta);
    const zip = empacotarZip(path.join(pasta, "zips")).zip; // versão atual do produto, mais nova que 0.1.0
    const simulado = spawnSync(process.execPath, [path.join(base, "scripts", "atualizar.mjs"), "--zip", zip, "--simular"], { encoding: "utf8" });
    assert.equal(simulado.status, 0, simulado.stderr);
    assert.match(simulado.stdout, /Mudaria/);
    assert.equal(JSON.parse(ler(base, "produto.json")).versao, "0.1.0", "--simular não pode gravar");
    const r = spawnSync(process.execPath, [path.join(base, "scripts", "atualizar.mjs"), "--zip", zip, "--sem-instalar"], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /Atualização concluída: 0\.1\.0 →/);
    assert.equal(ler(base, ".env"), "GROQ_API_KEY=segredo-do-cliente\nVOZ_PROVEDOR=fish\n");
    assert.equal(ler(base, "estilos/meu-estilo/direcao.md"), "direção do cliente");
    const denovo = spawnSync(process.execPath, [path.join(base, "scripts", "atualizar.mjs"), "--zip", zip, "--sem-instalar"], { encoding: "utf8" });
    assert.notEqual(denovo.status, 0);
    assert.match(denovo.stderr, /já está na versão/);
    const semFonte = spawnSync(process.execPath, [path.join(base, "scripts", "atualizar.mjs")], { encoding: "utf8" });
    assert.notEqual(semFonte.status, 0);
    assert.match(semFonte.stderr, /não é um clone do git/);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});

test("nenhum arquivo versionado no git está fora da lista do produto", { skip: !fs.existsSync(path.join(raiz, ".git")) }, () => {
  const r = spawnSync("git", ["ls-files"], { cwd: raiz, encoding: "utf8" });
  if (r.status !== 0) return;
  const fora = r.stdout.split("\n").filter(Boolean).filter(a => !pertenceAoProduto(a));
  assert.deepEqual(fora, [], "arquivos versionados que o git pull e a atualização tratariam como do produto, mas que são dados ou desenvolvimento");
  assert.ok(listarArquivos(raiz).length > 0);
});
