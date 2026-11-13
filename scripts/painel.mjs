// Painel local: escolher o estilo, configurar o vídeo, enviar a narração e criar um estilo novo a partir de um vídeo
// (o vídeo é lido no navegador; só os quadros escolhidos chegam aqui para serem salvos).
// uso: node scripts/painel.mjs [--porta 4173]
// Só atende em 127.0.0.1. Grava apenas em projeto.json, marca.json, entrada/narracao.mp3 e estilos/<id>/ da instância.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { gerarVitrine } from "./vitrine.mjs";

const MB = 1024 * 1024;
export const LIMITES = { audio: 50 * MB, json: 64 * 1024, estilo: 24 * MB, imagem: 4 * MB };
const HEX = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class Recusa extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}

// Transforma um nome qualquer em um trecho seguro para id de estilo.
export function nomeSeguro(texto, reserva = "estilo") {
  const s = String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
  return s || reserva;
}

// Reconhece o tipo pelo começo do arquivo, sem confiar na extensão nem no tipo informado pelo navegador.
export function assinatura(inicio) {
  const b = Buffer.from(inicio);
  if (b.length >= 12 && ["ftyp", "moov", "mdat", "wide", "free", "skip"].includes(b.toString("latin1", 4, 8))) return "mp4";
  if (b.length >= 12 && b.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  if (b.length >= 12 && (b.toString("latin1", 0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0))) return "mp3";
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 4 && b.readUInt32BE(0) === 0x89504e47) return "png";
  return null;
}

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
const lerTexto = arquivo => { try { return fs.readFileSync(arquivo, "utf8").trim(); } catch { return ""; } };
const arquivosNumerados = (pasta, prefixo) => { try { return fs.readdirSync(pasta).filter(f => new RegExp(`^${prefixo}-\\d{2}\\.jpg$`).test(f)).sort(); } catch { return []; } };

export function estadoDoPainel(base = raiz) {
  const produto = lerProduto(base);
  const indice = lerJson(path.join(base, "estilos", "indice.json"), { estilos: [], comecePor: [] });
  const pastaEstilos = path.join(base, "estilos");
  const estilos = gerarVitrine(base, { gravar: false }).estilos.map(e => ({ id: e.id, nome: e.nome, previa: e.previa, personalizado: e.personalizado }));
  // Estilos criados pelo usuário, com tudo que a página precisa para mostrar o card e a folha.
  const personalizados = listarIdsDeEstilo(base)
    .map(id => ({ id, json: lerJson(path.join(pastaEstilos, id, "estilo.json"), {}) }))
    .filter(e => e.json.personalizado === true)
    .map(({ id, json }) => ({
      id, json,
      direcao: lerTexto(path.join(pastaEstilos, id, "direcao.md")),
      metricas: lerTexto(path.join(pastaEstilos, id, "metricas.md")),
      quadros: arquivosNumerados(path.join(pastaEstilos, id, "referencia"), "quadro").map(f => `/estilos/${id}/referencia/${f}`),
      movimento: arquivosNumerados(path.join(pastaEstilos, id, "referencia"), "movimento").map(f => `/estilos/${id}/referencia/${f}`),
    }));
  const narracao = path.join(base, "entrada", "narracao.mp3");
  return {
    produto: produto.nome, prefixo: produto.prefixo, versao: produto.versao, instancia: fs.existsSync(path.join(base, ".env")),
    estilos, personalizados, comecePor: indice.comecePor || [],
    projeto: lerJson(path.join(base, "projeto.json")) || lerJson(path.join(base, "projeto.exemplo.json"), {}),
    projetoSalvo: fs.existsSync(path.join(base, "projeto.json")),
    marca: lerJson(path.join(base, "marca.json")),
    narracao: fs.existsSync(narracao) ? { presente: true, megabytes: +(fs.statSync(narracao).size / MB).toFixed(1) } : { presente: false },
  };
}

function lerCorpoJson(req, limite = LIMITES.json) {
  return new Promise((ok, falha) => {
    if (!/^application\/json\b/i.test(req.headers["content-type"] || "")) return falha(new Recusa(415, "envie os dados como JSON."));
    const partes = []; let total = 0;
    req.on("data", c => { total += c.length; if (total > limite) { falha(new Recusa(413, "dados grandes demais.")); req.destroy(); } else partes.push(c); });
    req.on("end", () => { try { ok(JSON.parse(Buffer.concat(partes).toString("utf8") || "{}")); } catch { falha(new Recusa(400, "JSON inválido.")); } });
    req.on("error", falha);
  });
}

// Recebe o MP3 da narração em partes, confere tamanho e assinatura, e só então dá o nome definitivo.
function receberAudio(req, base, nome) {
  if (path.extname(String(nome || "")).toLowerCase() !== ".mp3") throw new Recusa(415, "a narração precisa ser um arquivo .mp3.");
  const declarado = Number(req.headers["content-length"]);
  if (declarado > LIMITES.audio) throw new Recusa(413, `arquivo grande demais: o limite é ${LIMITES.audio / MB} MB.`);
  const entrada = path.join(base, "entrada");
  fs.mkdirSync(entrada, { recursive: true });
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
      if (total > LIMITES.audio) return abortar(new Recusa(413, `arquivo grande demais: o limite é ${LIMITES.audio / MB} MB.`));
      if (!conferido) {
        cabeca = Buffer.concat([cabeca, c]).subarray(0, 16);
        if (cabeca.length >= 12) {
          conferido = true;
          if (assinatura(cabeca) !== "mp3") return abortar(new Recusa(415, "o conteúdo do arquivo não corresponde a um MP3."));
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
      fs.renameSync(parcial, path.join(entrada, "narracao.mp3"));
      ok({ arquivo: "narracao.mp3", megabytes: +(total / MB).toFixed(1) });
    });
    req.pipe(saida);
  });
}

// Decodifica uma imagem enviada como data URL e confere o tipo pelo conteúdo.
function imagemDeDataUrl(valor, tipo, rotulo) {
  const m = /^data:image\/(?:jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(String(valor || ""));
  if (!m) throw new Recusa(400, `${rotulo}: imagem inválida.`);
  const bytes = Buffer.from(m[1], "base64");
  if (bytes.length > LIMITES.imagem) throw new Recusa(413, `${rotulo}: imagem grande demais.`);
  if (assinatura(bytes.subarray(0, 16)) !== tipo) throw new Recusa(400, `${rotulo}: o conteúdo não é uma imagem ${tipo.toUpperCase()}.`);
  return bytes;
}
const texto = (v, max, rotulo, obrigatorio = false) => {
  const s = String(v ?? "").trim();
  if (obrigatorio && !s) throw new Recusa(400, `${rotulo} não pode ficar vazio.`);
  if (s.length > max) throw new Recusa(400, `${rotulo} passou de ${max} caracteres.`);
  return s;
};

// Salva um estilo criado a partir de vídeo: estilos/<id>/ com folha, quadros, medidas, direção e metadados.
export function gravarEstilo(base, d) {
  if (!d || typeof d !== "object") throw new Recusa(400, "dados do estilo inválidos.");
  const e = d.estilo || {};
  const nome = texto(e.nome, 60, "o nome do estilo", true).replace(/[{}]/g, "");
  const quadros = Array.isArray(d.quadros) ? d.quadros : [], movimento = Array.isArray(d.movimento) ? d.movimento : [];
  if (quadros.length < 1 || quadros.length > 12 || movimento.length > 6) throw new Recusa(400, "quantidade de quadros inválida.");
  const imgQ = quadros.map((q, i) => imagemDeDataUrl(q, "jpg", `quadro ${i + 1}`));
  const imgM = movimento.map((q, i) => imagemDeDataUrl(q, "jpg", `movimento ${i + 1}`));
  const folha = imagemDeDataUrl(d.folha, "png", "folha de referência");
  const direcao = texto(d.direcao, 20000, "a direção de estilo", true);
  const cores = (Array.isArray(e.cores) ? e.cores : []).filter(c => HEX.test(String(c))).slice(0, 6).map(c => c.toUpperCase());
  const medidas = e.medidas && typeof e.medidas === "object" ? Object.fromEntries(["len", "shots", "avgShot", "motion"].filter(k => Number.isFinite(+e.medidas[k])).map(k => [k, +e.medidas[k]])
    .concat([["motionLabel", texto(e.medidas.motionLabel, 40, "movimento")], ["aspect", texto(e.medidas.aspect, 40, "formato")]])) : null;
  const ids = new Set(fs.readdirSync(path.join(base, "estilos")));
  const raizId = nomeSeguro(d.id || nome);
  let id = raizId;
  for (let n = 2; ids.has(id); n++) id = `${raizId}-${n}`;
  const meta = {
    id, personalizado: true, nome,
    subtitulo: texto(e.subtitulo, 80, "o subtítulo"), motor: texto(e.motor, 120, "a técnica"), resumo: texto(e.resumo, 300, "o resumo"),
    aparencia: texto(e.aparencia, 800, "o campo Como fica"), melhorPara: texto(e.melhorPara, 400, "o campo Melhor para"),
    bomSaber: texto(e.bomSaber, 500, "o campo Bom saber"), temaExemplo: texto(e.temaExemplo, 600, "o tema de exemplo"),
    rotulo: texto(e.rotulo, 200, "o rótulo") || nome, resumoPrompt: texto(e.resumoPrompt, 800, "o resumo do prompt"),
    cores, sequenciaMovimento: imgM.length > 0, px: e.px === true, ...(medidas ? { medidas } : {}),
  };
  const pasta = path.join(base, "estilos", id), tmp = path.join(base, "estilos", `.novo-${crypto.randomBytes(5).toString("hex")}`);
  try {
    fs.mkdirSync(path.join(tmp, "referencia"), { recursive: true });
    fs.writeFileSync(path.join(tmp, "referencia.png"), folha);
    imgQ.forEach((b, i) => fs.writeFileSync(path.join(tmp, "referencia", `quadro-${String(i + 1).padStart(2, "0")}.jpg`), b));
    imgM.forEach((b, i) => fs.writeFileSync(path.join(tmp, "referencia", `movimento-${String(i + 1).padStart(2, "0")}.jpg`), b));
    fs.writeFileSync(path.join(tmp, "direcao.md"), direcao + "\n");
    fs.writeFileSync(path.join(tmp, "metricas.md"), texto(d.metricas, 6000, "as medidas") + "\n");
    gravarJson(path.join(tmp, "estilo.json"), meta);
    fs.renameSync(tmp, pasta);
  } catch (err) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw err instanceof Recusa ? err : new Recusa(500, "não foi possível gravar o estilo.");
  }
  return { id };
}

// Só estilos criados pelo usuário podem ser excluídos; os nativos e o modelo ficam intactos.
export function excluirEstilo(base, id) {
  id = String(id || "");
  if (!ID.test(id)) throw new Recusa(400, "estilo inválido.");
  const pasta = path.join(base, "estilos", id);
  if (lerJson(path.join(pasta, "estilo.json"), {}).personalizado !== true) throw new Recusa(403, "só estilos criados por você podem ser excluídos.");
  fs.rmSync(pasta, { recursive: true, force: true });
  return { id };
}

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
// Só estes caminhos são servidos; qualquer outro devolve 404.
const ESTATICOS = [
  /^\/painel\/(?:index\.html|app\.js|mp4box\.js|painel\.css)$/,
  /^\/vitrine\/previas\.js$/,
  /^\/estilos\/[a-z0-9-]+\/referencia\.(?:png|jpg|jpeg|webp)$/,
  /^\/estilos\/[a-z0-9-]+\/referencia\/(?:quadro|movimento)-\d{2}\.jpg$/,
];
const SEGURANCA = {
  "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "cache-control": "no-store",
  "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' blob: data:; media-src blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
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
      if (caminho === "/api/enviar") return responder(res, 200, await receberAudio(req, base, url.searchParams.get("nome")));
      if (caminho === "/api/estilo") return responder(res, 200, gravarEstilo(base, await lerCorpoJson(req, LIMITES.estilo)));
      if (caminho === "/api/estilo/excluir") return responder(res, 200, excluirEstilo(base, (await lerCorpoJson(req)).id));
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
