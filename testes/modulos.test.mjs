import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { estadoIntegracoes, lerEnvTexto } from "../scripts/lib/ambiente.mjs";
import { gerarNarracao, textoParaFala } from "../scripts/lib/voz.mjs";
import { agruparLegendas, paraSrt, transcrever } from "../scripts/transcrever.mjs";
import { conferirPublicacao, hospedarNoGithub, publicarReels, normalizarLegenda } from "../scripts/lib/publicacao.mjs";
import { validarIntegracoes } from "../scripts/validar-integracoes.mjs";
import { coresDominantes, medidasDeCor, textoMetricas } from "../scripts/extrair-estilo.mjs";
import { gerarVitrine } from "../scripts/vitrine.mjs";
import { verificarProduto, pertenceAoProduto } from "../scripts/verificar-produto.mjs";
import { empacotar, empacotarZip } from "../scripts/empacotar.mjs";
import { montarPrompt } from "../scripts/montar-prompt.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "motion-teste-"));
const resposta = (corpo, { ok = true, status = 200, binario } = {}) => ({
  ok, status,
  json: async () => corpo, text: async () => (typeof corpo === "string" ? corpo : JSON.stringify(corpo)),
  arrayBuffer: async () => binario ?? new Uint8Array(4000).fill(7).buffer,
});
const SEGREDO = "chave-super-secreta-123";

test("texto para fala remove marcações", () => {
  assert.equal(textoParaFala("# Título\n\n**Olá**, _mundo_!  Veja [o site](https://x.y).\n\n\n\nFim."), "Olá, mundo! Veja o site.\n\nFim.");
});

test("narração: cada provedor chama o endereço certo e devolve áudio", async () => {
  const chamadas = [];
  const fetchFn = async (url, o) => { chamadas.push({ url, o }); return url.includes("minimax") ? resposta({ data: { audio: "07".repeat(4000) }, base_resp: { status_code: 0 } }) : resposta(null); };
  const env = { ELEVENLABS_API_KEY: SEGREDO, ELEVENLABS_VOICE_ID: "voz1", FISH_AUDIO_API_KEY: SEGREDO, FISH_AUDIO_VOICE_ID: "voz2", MINIMAX_API_KEY: SEGREDO, MINIMAX_VOICE_ID: "voz3" };
  for (const provedor of ["elevenlabs", "fishaudio", "minimax"]) {
    const r = await gerarNarracao({ texto: "Olá, este é um teste.", provedor, env, fetchFn });
    assert.equal(r.audio.length, 4000);
    assert.equal(r.caracteres, 21);
  }
  assert.match(chamadas[0].url, /api\.elevenlabs\.io\/v1\/text-to-speech\/voz1/);
  assert.equal(chamadas[0].o.headers["xi-api-key"], SEGREDO);
  assert.equal(chamadas[1].url, "https://api.fish.audio/v1/tts");
  assert.equal(JSON.parse(chamadas[1].o.body).reference_id, "voz2");
  assert.equal(chamadas[2].url, "https://api.minimax.io/v1/t2a_v2");
  assert.equal(JSON.parse(chamadas[2].o.body).voice_setting.voice_id, "voz3");
});

test("narração: erros não vazam a chave e casos inválidos são recusados", async () => {
  const env = { ELEVENLABS_API_KEY: SEGREDO, ELEVENLABS_VOICE_ID: "v" };
  await assert.rejects(gerarNarracao({ texto: "oi", provedor: "elevenlabs", env, fetchFn: async () => resposta("quota_exceeded", { ok: false, status: 401 }) }),
    e => /HTTP 401/.test(e.message) && /quota_exceeded/.test(e.message) && !e.message.includes(SEGREDO));
  await assert.rejects(gerarNarracao({ texto: "  ", provedor: "elevenlabs", env }), /roteiro vazio/);
  await assert.rejects(gerarNarracao({ texto: "a".repeat(5001), provedor: "elevenlabs", env }), /5000/);
  await assert.rejects(gerarNarracao({ texto: "oi", provedor: "elevenlabs", env: {}, fetchFn: async () => resposta(null) }), /ELEVENLABS_VOICE_ID não foi preenchido/);
  await assert.rejects(gerarNarracao({ texto: "oi", provedor: "elevenlabs", env, fetchFn: async () => resposta(null, { binario: new Uint8Array(10).buffer }) }), /vazio ou inválido/);
});

test("legendas: agrupa por tamanho, pausa e pontuação, e gera SRT válido", () => {
  const p = (palavra, inicio, fim) => ({ palavra, inicio, fim });
  const blocos = agruparLegendas([p("Isso", 0, .3), p("muda", .3, .6), p("tudo.", .6, 1), p("Agora", 2, 2.3), p("veja", 2.3, 2.6), p("como", 2.6, 2.9), p("funciona", 2.9, 3.5), p("isso", 3.5, 3.8)]);
  assert.deepEqual(blocos.map(b => b.texto), ["Isso muda tudo.", "Agora veja como", "funciona isso"]);
  const srt = paraSrt(blocos);
  assert.match(srt, /^1\n00:00:00,000 --> 00:00:01,000\nIsso muda tudo\.\n\n2\n00:00:02,000 --> 00:00:02,900\n/);
  assert.equal(paraSrt([{ inicio: 3661.5, fim: 3662, texto: "x" }]).split("\n")[1], "01:01:01,500 --> 01:01:02,000");
});

test("transcrição: lê palavras da resposta e exige a chave", async () => {
  const audio = path.join(tmp(), "n.mp3");
  fs.writeFileSync(audio, Buffer.alloc(2000));
  let pedido;
  const fetchFn = async (url, o) => { pedido = { url, o }; return resposta({ text: " Olá mundo ", duration: 1.2, words: [{ word: " Olá", start: 0, end: .5 }, { word: "mundo", start: .5, end: 1.1 }] }); };
  const t = await transcrever(audio, { GROQ_API_KEY: SEGREDO }, fetchFn);
  assert.deepEqual(t, { texto: "Olá mundo", palavras: [{ palavra: "Olá", inicio: 0, fim: .5 }, { palavra: "mundo", inicio: .5, fim: 1.1 }], duracao: 1.2 });
  assert.match(pedido.url, /api\.groq\.com/);
  await assert.rejects(transcrever(audio, {}, fetchFn), /GROQ_API_KEY não foi preenchido/);
  await assert.rejects(transcrever(path.join(tmp(), "nao-existe.mp3"), { GROQ_API_KEY: "x" }, fetchFn), /não encontrado/);
});

const envPublicacao = { META_API_VERSION: "v25.0", INSTAGRAM_BUSINESS_ID: "123", INSTAGRAM_ACCESS_TOKEN: SEGREDO, GITHUB_PAGES_OWNER: "dono", GITHUB_PAGES_REPO: "repo", GITHUB_PAGES_TOKEN: SEGREDO };

test("publicação: conferência aponta cada problema sem rede", () => {
  const dir = tmp(), video = path.join(dir, "v.mp4");
  fs.writeFileSync(video, Buffer.alloc(20000));
  assert.deepEqual(conferirPublicacao({ video, legenda: "Legenda #teste", env: envPublicacao }), []);
  const ruins = conferirPublicacao({ video: path.join(dir, "falta.mp4"), legenda: " ", capa: path.join(dir, "c.jpg"), env: {} });
  assert.ok(ruins.some(p => /vídeo não encontrado/.test(p)));
  assert.ok(ruins.some(p => /legenda vazia/.test(p)));
  assert.ok(ruins.some(p => /capa não encontrada/.test(p)));
  assert.ok(ruins.some(p => /INSTAGRAM_ACCESS_TOKEN/.test(p)));
  assert.ok(conferirPublicacao({ video, legenda: "x".repeat(2201), env: envPublicacao }).some(p => /2200/.test(p)));
  const mov = path.join(dir, "v.mov"); fs.writeFileSync(mov, Buffer.alloc(20000));
  assert.ok(conferirPublicacao({ video: mov, legenda: "ok", env: envPublicacao }).some(p => /\.mp4/.test(p)));
  assert.equal(normalizarLegenda("a\\nb\r\nc "), "a\nb\nc");
});

test("publicação: hospeda no GitHub e publica o Reels na ordem certa", async () => {
  const dir = tmp(), video = path.join(dir, "v.mp4");
  fs.writeFileSync(video, Buffer.from("conteudo-do-video"));
  const gh = [];
  const url = await hospedarNoGithub({ arquivo: video, destino: "videos/a b.mp4", env: envPublicacao, fetchFn: async (u, o) => { gh.push({ u, o }); return gh.length === 1 ? resposta({}, { ok: false, status: 404 }) : resposta({}); } });
  assert.equal(url, "https://raw.githubusercontent.com/dono/repo/main/videos/a%20b.mp4");
  assert.equal(gh[1].o.method, "PUT");
  assert.equal(Buffer.from(JSON.parse(gh[1].o.body).content, "base64").toString(), "conteudo-do-video");

  const passos = [];
  let consultas = 0;
  const fetchFn = async (u, o = {}) => {
    if (u.endsWith("/123/media")) { passos.push("container"); assert.equal(o.body.get("media_type"), "REELS"); assert.equal(o.body.get("video_url"), url); return resposta({ id: "c1" }); }
    if (u.includes("/c1?fields=status_code")) { passos.push("status"); return resposta({ status_code: ++consultas < 3 ? "IN_PROGRESS" : "FINISHED" }); }
    if (u.endsWith("/123/media_publish")) { passos.push("publicar"); assert.equal(o.body.get("creation_id"), "c1"); return resposta({ id: "m9" }); }
    if (u.includes("/m9?fields=id,permalink")) return resposta({ id: "m9", permalink: "https://instagram.com/reel/x" });
    throw new Error("chamada inesperada: " + u);
  };
  const r = await publicarReels({ videoUrl: url, legenda: "Oi", env: envPublicacao, fetchFn, intervaloMs: 0, log: () => {} });
  assert.deepEqual(r, { mediaId: "m9", permalink: "https://instagram.com/reel/x" });
  assert.deepEqual(passos, ["container", "status", "status", "status", "publicar"]);
});

test("publicação: erro de processamento e recusa da Meta interrompem sem publicar nem vazar token", async () => {
  let publicou = false;
  const fetchErro = async u => { if (u.endsWith("/media")) return resposta({ id: "c1" }); if (u.includes("status_code")) return resposta({ status_code: "ERROR", status: "formato inválido" }); publicou = true; return resposta({}); };
  await assert.rejects(publicarReels({ videoUrl: "https://x/v.mp4", legenda: "Oi", env: envPublicacao, fetchFn: fetchErro, intervaloMs: 0, log: () => {} }), /formato inválido/);
  assert.equal(publicou, false);
  await assert.rejects(publicarReels({ videoUrl: "https://x/v.mp4", legenda: "Oi", env: envPublicacao, fetchFn: async () => resposta({ error: { code: 190, message: "token expirado" } }, { ok: false, status: 400 }), log: () => {} }),
    e => /190/.test(e.message) && /token expirado/.test(e.message) && !e.message.includes(SEGREDO));
});

test("integrações: estado e validação só do que está configurado", async () => {
  assert.deepEqual(estadoIntegracoes({}).map(i => i.pronta), [false, false, false]);
  assert.equal(estadoIntegracoes(lerEnvTexto("GROQ_API_KEY=abc")).find(i => i.id === "legendas").pronta, true);
  const chamadas = [];
  const r = await validarIntegracoes({ env: { GROQ_API_KEY: "k", ...envPublicacao }, fetchFn: async u => { chamadas.push(u); return u.includes("github") ? resposta({ private: true }) : u.includes("graph.facebook") ? resposta({ id: "123", username: "perfil" }) : resposta({}); } });
  assert.equal(r.find(i => i.id === "legendas").estado, "ok");
  assert.equal(r.find(i => i.id === "instagram").detalhe, "perfil @perfil");
  assert.match(r.find(i => i.id === "hospedagem").detalhe, /privado/);
  const vazio = await validarIntegracoes({ env: {}, fetchFn: async () => { throw new Error("não deveria chamar a rede"); } });
  assert.ok(vazio.every(i => i.estado === "não configurada"));
});

test("extração de estilo: cores dominantes e medidas", () => {
  const px = (r, g, b, n) => Array.from({ length: n }, () => [r, g, b]).flat();
  const rgb = Uint8Array.from([...px(124, 58, 237, 60), ...px(57, 255, 136, 30), ...px(0, 0, 0, 10)]);
  assert.deepEqual(coresDominantes(rgb, 2), [{ hex: "#7C3AED", pct: 60 }, { hex: "#39FF88", pct: 30 }]);
  assert.deepEqual(medidasDeCor(Uint8Array.from(px(255, 255, 255, 4))), { brilho: 100, saturacao: 0 });
  const t = textoMetricas({ duracao: 9, largura: 540, altura: 960, formato: "vertical", cortes: 2, cortesPorMinuto: 13.3, planoMedio: 3, brilho: 54, saturacao: 83, cores: [{ hex: "#7C3AED", pct: 60 }] });
  assert.match(t, /Shots: 3 \(2 hard cuts/);
  assert.match(t, /#7C3AED \(~60%\)/);
});

test("vitrine lista os cinco estilos nativos com suas cenas", () => {
  const r = gerarVitrine(undefined, { gravar: false });
  assert.deepEqual(r.estilos.filter(e => !e.personalizado).map(e => e.previa), [0, 1, 2, 3, 4]);
  assert.equal(r.estilos[0].id, "recorte-de-papel");
});

test("paleta da marca vem de marca.json e exige nome e cores", () => {
  const base = { estilo: "vetor-flat", tema: "x", duracaoSegundos: 10, paleta: "marca" };
  const p = montarPrompt({ ...base, marca: { nome: "Marca Teste", cores: { dominante: "#112233", destaque: "#aabbcc", apoio: "#445566" } } });
  assert.match(p, /# PALETA DA MARCA \(Marca Teste\)/);
  assert.match(p, /dominant #112233.*highlight #AABBCC.*supporting #445566/s);
  assert.ok(!/\{\{(C[123]|MARCA_NOME)\}\}/.test(p));
  assert.throws(() => montarPrompt({ ...base, marca: { nome: "", cores: {} } }), /preencha o nome/);
  assert.throws(() => montarPrompt({ ...base, marca: { nome: "M", cores: { dominante: "azul" } } }), /cores.dominante/);
});

test("o que pertence ao produto e o que é instância", () => {
  for (const sim of ["AGENTS.md", ".env.example", "skills/roteiro/SKILL.md", "estilos/vetor-flat/prompt.md", "estilos/_personalizado/prompt.md", "entrada/LEIA-ME.md", ".agents/rules/protecao-dados-produto.md"]) assert.ok(pertenceAoProduto(sim), sim);
  for (const nao of [".env", "projeto.json", "marca.json", "runtime/instalacao.json", "saida/x/video.mp4", "entrada/narracao.mp3", "estilos/meu-estilo/estilo.json", "vitrine/estilos.js", "origem.html"]) assert.ok(!pertenceAoProduto(nao), nao);
});

test("verificação acusa arquivos de instância e dados reais; empacotar copia só o produto", () => {
  const base = tmp();
  const escrever = (rel, c) => { fs.mkdirSync(path.dirname(path.join(base, rel)), { recursive: true }); fs.writeFileSync(path.join(base, rel), c); };
  escrever("AGENTS.md", "limpo");
  escrever("skills/a/SKILL.md", "limpo");
  escrever("marca.exemplo.json", JSON.stringify({ nome: null, cores: { dominante: null, destaque: null, apoio: null } }));
  escrever(".env.example", "GROQ_API_KEY=\nMETA_API_VERSION=v25.0\n");
  assert.deepEqual(verificarProduto(base).problemas, []);
  const destino = path.join(tmp(), "copia");
  escrever(".env", "GROQ_API_KEY=abc");
  escrever("saida/v/video.mp4", "x");
  escrever("estilos/do-usuario/estilo.json", "{}");
  assert.equal(verificarProduto(base).problemas.length, 3);
  assert.equal(empacotar(destino, base).arquivos, 4);
  assert.ok(!fs.existsSync(path.join(destino, ".env")) && !fs.existsSync(path.join(destino, "saida")) && !fs.existsSync(path.join(destino, "estilos")));
  escrever("documentacao/guia.md", "pasta " + ["C:", "Users", "fulano", "x"].join("\\"));
  escrever(".env.example", "GROQ_API_KEY=" + "gsk_" + "a".repeat(24) + "\n");
  escrever("marca.exemplo.json", JSON.stringify({ nome: "Marca Real", cores: {} }));
  const motivos = verificarProduto(base).problemas.map(p => p.motivo).join(" | ");
  for (const esperado of [/caminho local/, /credencial/, /GROQ_API_KEY deve ficar vazio/, /valores null/]) assert.match(motivos, esperado);
  assert.throws(() => empacotar(path.join(tmp(), "outra"), base), /dados reais/);
  assert.throws(() => empacotar(path.join(base, "dentro"), base), /fora da pasta/);
});

test("empacotar --zip gera um zip com uma pasta só e sem dados de instância", () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "motion-zip-teste-"));
  try {
    const r = empacotarZip(pasta);
    assert.match(path.basename(r.zip), /^criativo-motion-studio-\d+\.\d+\.\d+\.zip$/);
    assert.ok(r.arquivos > 50 && r.bytes > 10000);
    assert.equal(fs.readFileSync(r.zip).subarray(0, 2).toString("latin1"), "PK");
    assert.throws(() => empacotarZip(path.join(process.cwd(), "dentro-do-produto")), /fora da pasta do produto/);
  } finally { fs.rmSync(pasta, { recursive: true, force: true }); }
});
