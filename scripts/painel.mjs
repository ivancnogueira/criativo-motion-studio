// Painel local: escolher o estilo, configurar o vídeo e criar um estilo a partir de um vídeo enviado pela página.
// uso: node scripts/painel.mjs [--porta 4173]
// Só atende em 127.0.0.1. Grava apenas em projeto.json, marca.json, entrada/ e estilos/<id>/ da instância.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { gerarVitrine } from "./vitrine.mjs";
import { temFfmpeg } from "./extrair-estilo.mjs";

const MB = 1024 * 1024;
export const LIMITES = { video: 500 * MB, audio: 50 * MB, json: 64 * 1024 };
export const EXTENSOES_DE_VIDEO = [".mp4", ".mov", ".m4v", ".webm", ".mkv"];
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARQUIVO_DE_VIDEO = /^referencia-[a-z0-9-]+\.(?:mp4|mov|m4v|webm|mkv)$/;

class Recusa extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}

// Transforma um nome qualquer em um trecho seguro para nome de arquivo ou id de estilo.
export function nomeSeguro(texto, reserva = "video") {
  const s = String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
  return s || reserva;
}

// Reconhece o tipo pelo começo do arquivo, sem confiar na extensão nem no tipo informado pelo navegador.
export function assinatura(inicio) {
  const b = Buffer.from(inicio);
  if (b.length < 12) return null;
  if (["ftyp", "moov", "mdat", "wide", "free", "skip"].includes(b.toString("latin1", 4, 8))) return "mp4";
  if (b.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  if (b.toString("latin1", 0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return "mp3";
  return null;
}
const FAMILIA = { ".mp4": "mp4", ".mov": "mp4", ".m4v": "mp4", ".webm": "webm", ".mkv": "webm", ".mp3": "mp3" };

export function listarIdsDeEstilo(base = raiz) {
  const pasta = path.join(base, "estilos");
  return fs.readdirSync(pasta, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(pasta, d.name, "estilo.json")))
    .map(d => d.name);
}

// Confere e normaliza a configuração do vídeo. Campos desconhecidos do arquivo atual são preservados.
export function validarProjeto(dados, { estilos, atual = {} }) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new Recusa(400, "configuração inválida.");
  const estilo = String(dados.estilo || "");
  if (!ID.test(estilo) || !estilos.includes(estilo)) throw new Recusa(400, "escolha um dos estilos da lista.");
  const tema = String(dados.tema || "").trim();
  if (!tema) throw new Recusa(400, "escreva o tema do vídeo. Uma frase já basta.");
  if (tema.length > 2000) throw new Recusa(400, "o tema deve ter até 2000 caracteres.");
  const roteiro = String(dados.roteiro || "").trim();
  if (roteiro.length > 5000) throw new Recusa(400, "o roteiro deve ter até 5000 caracteres.");
  const narracao = dados.narracao === true;
  const duracao = Math.round(Number(dados.duracaoSegundos));
  if (!narracao && !(duracao >= 5 && duracao <= 600)) throw new Recusa(400, "a duração deve ficar entre 5 segundos e 10 minutos.");
  const paleta = String(dados.paleta || "estilo");
  if (!["estilo", "marca", "personalizada"].includes(paleta)) throw new Recusa(400, "paleta desconhecida.");
  const cores = {};
  for (const k of ["dominante", "destaque", "apoio"]) {
    const v = String(dados.cores?.[k] ?? atual.cores?.[k] ?? "");
    if (paleta === "personalizada" && !HEX.test(v)) throw new Recusa(400, `a cor ${k} deve ser um hexadecimal como #2563EB.`);
    if (HEX.test(v)) cores[k] = v.toUpperCase();
  }
  return {
    ...atual, estilo, tema, storyboard: dados.storyboard === true, narracao, roteiro,
    legendas: narracao && dados.legendas === true,
    duracaoSegundos: duracao >= 5 && duracao <= 600 ? duracao : Number(atual.duracaoSegundos) || 30,
    vertical: dados.vertical === true, musica: dados.musica === true, efeitos: dados.efeitos === true,
    paleta, cores, testeDeEstilo: dados.testeDeEstilo !== false,
  };
}

export function validarMarca(dados) {
  const nome = String(dados?.nome || "").trim().replace(/[{}]/g, "");
  if (!nome) throw new Recusa(400, "escreva o nome da marca.");
  if (nome.length > 60) throw new Recusa(400, "o nome da marca deve ter até 60 caracteres.");
  const cores = {};
  for (const k of ["dominante", "destaque", "apoio"]) {
    if (!HEX.test(String(dados?.cores?.[k] || ""))) throw new Recusa(400, `a cor ${k} da marca deve ser um hexadecimal como #2563EB.`);
    cores[k] = dados.cores[k].toUpperCase();
  }
  return { nome, cores };
}

const lerJson = (arquivo, reserva = null) => { try { return JSON.parse(fs.readFileSync(arquivo, "utf8")); } catch { return reserva; } };
const gravarJson = (arquivo, dados) => fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2) + "\n");

export function estadoDoPainel(base = raiz) {
  const produto = lerProduto(base);
  const indice = lerJson(path.join(base, "estilos", "indice.json"), { estilos: [], comecePor: [] });
  const pastaEstilos = path.join(base, "estilos");
  const estilos = gerarVitrine(base, { gravar: false }).estilos.map(e => {
    const j = lerJson(path.join(pastaEstilos, e.id, "estilo.json"), {});
    return { ...e, imagem: e.imagem ? e.imagem.replace(/^\.\./, "") : "", temaExemplo: j.temaExemplo || "", cores: Array.isArray(j.cores) ? j.cores.filter(c => HEX.test(c)).slice(0, 3) : [] };
  });
  // Estilos já extraídos de um vídeo, mas ainda sem a direção de arte escrita pelo agente.
  const emPreparacao = fs.readdirSync(pastaEstilos, { withFileTypes: true })
    .filter(d => d.isDirectory() && ID.test(d.name) && !fs.existsSync(path.join(pastaEstilos, d.name, "estilo.json")) && fs.existsSync(path.join(pastaEstilos, d.name, "referencia.png")))
    .map(d => ({ id: d.name, nome: String(lerJson(path.join(pastaEstilos, d.name, "pedido.json"), {})?.nome || d.name), folha: `/estilos/${d.name}/referencia.png` }));
  const instancia = fs.existsSync(path.join(base, ".env"));
  const narracao = path.join(base, "entrada", "narracao.mp3");
  const entrada = path.join(base, "entrada");
  return {
    produto: produto.nome, prefixo: produto.prefixo, versao: produto.versao, instancia, ffmpeg: temFfmpeg(),
    estilos, emPreparacao, comecePor: indice.comecePor || [],
    projeto: lerJson(path.join(base, "projeto.json")) || lerJson(path.join(base, "projeto.exemplo.json"), {}),
    projetoSalvo: fs.existsSync(path.join(base, "projeto.json")),
    marca: lerJson(path.join(base, "marca.json")),
    narracao: fs.existsSync(narracao) ? { presente: true, megabytes: +(fs.statSync(narracao).size / MB).toFixed(1) } : { presente: false },
    videos: fs.existsSync(entrada) ? fs.readdirSync(entrada).filter(f => ARQUIVO_DE_VIDEO.test(f)).sort() : [],
    limites: { videoMb: LIMITES.video / MB, audioMb: LIMITES.audio / MB, extensoes: EXTENSOES_DE_VIDEO },
  };
}

function lerCorpoJson(req) {
  return new Promise((ok, falha) => {
    if (!/^application\/json\b/i.test(req.headers["content-type"] || "")) return falha(new Recusa(415, "envie os dados como JSON."));
    const partes = []; let total = 0;
    req.on("data", c => { total += c.length; if (total > LIMITES.json) { falha(new Recusa(413, "dados grandes demais.")); req.destroy(); } else partes.push(c); });
    req.on("end", () => { try { ok(JSON.parse(Buffer.concat(partes).toString("utf8") || "{}")); } catch { falha(new Recusa(400, "JSON inválido.")); } });
    req.on("error", falha);
  });
}

// Recebe o arquivo em partes, confere tamanho e assinatura, e só então dá o nome definitivo dentro de entrada/.
function receberArquivo(req, base, { tipo, nome }) {
  const ext = path.extname(String(nome || "")).toLowerCase();
  const limite = tipo === "audio" ? LIMITES.audio : LIMITES.video;
  if (tipo === "audio" ? ext !== ".mp3" : !EXTENSOES_DE_VIDEO.includes(ext))
    throw new Recusa(415, tipo === "audio" ? "a narração precisa ser um arquivo .mp3." : `formato não aceito. Use ${EXTENSOES_DE_VIDEO.join(", ")}.`);
  const declarado = Number(req.headers["content-length"]);
  if (declarado > limite) throw new Recusa(413, `arquivo grande demais: o limite é ${limite / MB} MB.`);
  const entrada = path.join(base, "entrada");
  fs.mkdirSync(entrada, { recursive: true });
  const final = tipo === "audio" ? "narracao.mp3" : `referencia-${nomeSeguro(path.basename(String(nome), ext))}${ext}`;
  const parcial = path.join(entrada, `.envio-${crypto.randomBytes(6).toString("hex")}.parcial`);
  return new Promise((ok, falha) => {
    const saida = fs.createWriteStream(parcial, { flags: "wx" });
    let total = 0, cabeca = Buffer.alloc(0), conferido = false, encerrado = false;
    const abortar = erro => {
      if (encerrado) return; encerrado = true;
      req.unpipe(saida); saida.destroy(); req.resume();
      fs.rm(parcial, { force: true }, () => falha(erro));
    };
    req.on("data", c => {
      total += c.length;
      if (total > limite) return abortar(new Recusa(413, `arquivo grande demais: o limite é ${limite / MB} MB.`));
      if (!conferido) {
        cabeca = Buffer.concat([cabeca, c]).subarray(0, 16);
        if (cabeca.length >= 12) {
          conferido = true;
          if (assinatura(cabeca) !== FAMILIA[ext]) return abortar(new Recusa(415, "o conteúdo do arquivo não corresponde a um " + (tipo === "audio" ? "MP3." : "vídeo " + ext + ".")));
        }
      }
    });
    req.on("error", () => abortar(new Recusa(400, "o envio foi interrompido.")));
    req.on("aborted", () => abortar(new Recusa(400, "o envio foi interrompido.")));
    saida.on("error", () => abortar(new Recusa(500, "não foi possível gravar o arquivo.")));
    saida.on("finish", () => {
      if (encerrado) return;
      if (!conferido) return abortar(new Recusa(400, "arquivo vazio ou pequeno demais."));
      encerrado = true;
      fs.renameSync(parcial, path.join(entrada, final));
      ok({ arquivo: final, megabytes: +(total / MB).toFixed(1) });
    });
    req.pipe(saida);
  });
}

let extraindo = false;
function extrair(base, dados) {
  const arquivo = String(dados?.arquivo || "");
  if (!ARQUIVO_DE_VIDEO.test(arquivo)) throw new Recusa(400, "envie o vídeo pela página antes de extrair.");
  const video = path.join(base, "entrada", arquivo);
  if (!fs.existsSync(video)) throw new Recusa(404, "o vídeo enviado não está mais em entrada/. Envie de novo.");
  const nome = String(dados?.nome || "").trim().replace(/[{}<>]/g, "").slice(0, 60);
  const id = nomeSeguro(dados?.id || nome, "");
  if (!ID.test(id)) throw new Recusa(400, "dê um nome ao estilo, com letras ou números.");
  if (fs.existsSync(path.join(base, "estilos", id, "estilo.json"))) throw new Recusa(409, `já existe um estilo chamado "${id}". Escolha outro nome.`);
  const inicio = Number(dados?.inicio) || 0, duracao = Number(dados?.duracao) || 12;
  if (!(inicio >= 0 && inicio <= 36000) || !(duracao >= 2 && duracao <= 60)) throw new Recusa(400, "o trecho deve ter de 2 a 60 segundos.");
  if (extraindo) throw new Recusa(409, "já existe uma extração em andamento. Aguarde terminar.");
  extraindo = true;
  return new Promise((ok, falha) => {
    const filho = spawn(process.execPath, [path.join(base, "scripts", "extrair-estilo.mjs"), video, "--id", id, "--inicio", String(inicio), "--duracao", String(duracao)], { cwd: base, windowsHide: true });
    let saida = "";
    filho.stdout.on("data", c => { saida += c; });
    filho.stderr.on("data", c => { saida += c; });
    filho.on("error", () => { extraindo = false; falha(new Recusa(500, "não foi possível iniciar a extração.")); });
    filho.on("close", codigo => {
      extraindo = false;
      if (codigo !== 0) return falha(new Recusa(422, (saida.match(/Erro: (.+)/)?.[1] || "a extração falhou.").slice(0, 300)));
      const pasta = path.join(base, "estilos", id);
      gravarJson(path.join(pasta, "pedido.json"), { nome: nome || id, video: `entrada/${arquivo}`, inicio, duracao });
      const metricas = fs.existsSync(path.join(pasta, "metricas.md")) ? fs.readFileSync(path.join(pasta, "metricas.md"), "utf8").trim() : "";
      ok({ id, nome: nome || id, folha: `/estilos/${id}/referencia.png`, metricas });
    });
  });
}

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
// Só estes caminhos são servidos; qualquer outro devolve 404.
const ESTATICOS = [
  /^\/painel\/(?:index\.html|painel\.js|painel\.css)$/,
  /^\/vitrine\/previas\.js$/,
  /^\/estilos\/[a-z0-9-]+\/referencia\.(?:png|jpg|jpeg|webp)$/,
  /^\/estilos\/[a-z0-9-]+\/referencia\/(?:quadro|movimento)-\d{2}\.jpg$/,
];
const SEGURANCA = {
  "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "cache-control": "no-store",
  "content-security-policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' blob: data:; media-src blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

export function criarPainel({ base = raiz } = {}) {
  const responder = (res, status, corpo) => { res.writeHead(status, { ...SEGURANCA, "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(corpo)); };
  return http.createServer(async (req, res) => {
    try {
      // Só aceita pedidos feitos ao próprio endereço local, e gravações só vindas da própria página.
      const host = String(req.headers.host || "");
      if (!/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(host)) throw new Recusa(403, "endereço não permitido.");
      const url = new URL(req.url, `http://${host}`);
      const caminho = url.pathname === "/" ? "/painel/index.html" : url.pathname;

      if (req.method === "GET" && caminho === "/api/estado") return responder(res, 200, estadoDoPainel(base));
      if (req.method === "GET") {
        const alvo = path.join(base, ...caminho.split("/").filter(Boolean));
        if (!ESTATICOS.some(r => r.test(caminho)) || !alvo.startsWith(base + path.sep) || !fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) throw new Recusa(404, "não encontrado.");
        res.writeHead(200, { ...SEGURANCA, "content-type": TIPOS[path.extname(alvo).toLowerCase()] });
        return fs.createReadStream(alvo).pipe(res);
      }
      if (req.method !== "POST") throw new Recusa(405, "método não permitido.");
      const origem = req.headers.origin;
      if ((origem && origem !== `http://${host}`) || req.headers["x-painel"] !== "1") throw new Recusa(403, "pedido recusado.");
      if (!fs.existsSync(path.join(base, ".env"))) throw new Recusa(409, "Esta pasta ainda não foi instalada. Rode npm run instalar e abra o painel de novo.");

      if (caminho === "/api/projeto") {
        const projeto = validarProjeto(await lerCorpoJson(req), { estilos: listarIdsDeEstilo(base), atual: lerJson(path.join(base, "projeto.json"), {}) || {} });
        gravarJson(path.join(base, "projeto.json"), projeto);
        return responder(res, 200, { projeto });
      }
      if (caminho === "/api/marca") {
        const marca = validarMarca(await lerCorpoJson(req));
        gravarJson(path.join(base, "marca.json"), marca);
        return responder(res, 200, { marca });
      }
      if (caminho === "/api/enviar") {
        const tipo = url.searchParams.get("tipo") === "audio" ? "audio" : "video";
        return responder(res, 200, await receberArquivo(req, base, { tipo, nome: url.searchParams.get("nome") }));
      }
      if (caminho === "/api/extrair") return responder(res, 200, await extrair(base, await lerCorpoJson(req)));
      throw new Recusa(404, "não encontrado.");
    } catch (e) {
      if (!(e instanceof Recusa)) console.error("Erro no painel: " + e.message);
      if (!res.headersSent) responder(res, e instanceof Recusa ? e.status : 500, { erro: e instanceof Recusa ? e.message : "erro interno do painel." });
      else res.end();
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const porta = Number(opcao(process.argv.slice(2), "--porta") || 4173);
    if (!Number.isInteger(porta) || porta < 1024 || porta > 65535) throw new Error("a porta deve ser um número entre 1024 e 65535.");
    const servidor = criarPainel();
    servidor.on("error", e => { console.error("Erro: " + (e.code === "EADDRINUSE" ? `a porta ${porta} já está em uso. Tente: node scripts/painel.mjs --porta ${porta + 1}` : e.message)); process.exit(1); });
    servidor.listen(porta, "127.0.0.1", () => {
      console.log(`Painel do ${lerProduto().nome}: http://127.0.0.1:${porta}/  (Ctrl+C para encerrar)`);
      if (!fs.existsSync(path.join(raiz, ".env"))) console.log("Aviso: esta pasta não está instalada; o painel abre só para consulta.");
    });
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
