// Hospedagem pública no GitHub e publicação de Reels pela API oficial da Meta.
import fs from "node:fs";
import path from "node:path";
import { exigir } from "./ambiente.mjs";

const esperar = ms => new Promise(r => setTimeout(r, ms));
const LIMITE_GITHUB = 95 * 1024 * 1024; // a Contents API recusa arquivos de 100 MB ou mais

export function normalizarLegenda(texto) {
  return String(texto || "").replace(/\\n/g, "\n").replace(/\r\n?/g, "\n").trim();
}

// Confere o que dá para conferir sem rede. Devolve a lista de problemas (vazia = pronto).
export function conferirPublicacao({ video, legenda, capa, env }) {
  const problemas = [];
  if (!video || !fs.existsSync(video)) problemas.push(`vídeo não encontrado: ${video}`);
  else {
    if (path.extname(video).toLowerCase() !== ".mp4") problemas.push("o vídeo precisa ser .mp4");
    const tamanho = fs.statSync(video).size;
    if (tamanho < 10_000) problemas.push("o vídeo está vazio ou corrompido");
    if (tamanho > LIMITE_GITHUB) problemas.push(`o vídeo tem ${(tamanho / 1048576).toFixed(0)} MB; o limite para hospedar é 95 MB`);
  }
  if (capa && !fs.existsSync(capa)) problemas.push(`capa não encontrada: ${capa}`);
  const texto = normalizarLegenda(legenda);
  if (!texto) problemas.push("legenda vazia");
  if (texto.length > 2200) problemas.push(`legenda com ${texto.length} caracteres; o Instagram aceita até 2200`);
  if ((texto.match(/#[\p{L}\p{N}_]+/gu) || []).length > 30) problemas.push("mais de 30 hashtags");
  for (const k of ["META_API_VERSION", "INSTAGRAM_BUSINESS_ID", "INSTAGRAM_ACCESS_TOKEN", "GITHUB_PAGES_OWNER", "GITHUB_PAGES_REPO", "GITHUB_PAGES_TOKEN"]) {
    try { exigir(env, k); } catch (e) { problemas.push(e.message); }
  }
  return problemas;
}

const nomeValido = v => /^[a-z0-9_.-]+$/i.test(v || "");

// Envia um arquivo ao repositório público e devolve a URL HTTPS que a Meta consegue baixar.
export async function hospedarNoGithub({ arquivo, destino, env, fetchFn = fetch }) {
  const owner = exigir(env, "GITHUB_PAGES_OWNER"), repo = exigir(env, "GITHUB_PAGES_REPO"), token = exigir(env, "GITHUB_PAGES_TOKEN");
  const branch = env.GITHUB_PAGES_BRANCH || "main";
  if (!nomeValido(owner) || !nomeValido(repo) || !nomeValido(branch)) throw new Error("dono, repositório ou branch do GitHub inválido no .env.");
  const caminho = destino.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${caminho}`;
  const headers = { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "content-type": "application/json" };
  let sha;
  const atual = await fetchFn(`${url}?ref=${encodeURIComponent(branch)}`, { headers });
  if (atual.ok) sha = (await atual.json()).sha;
  else if (atual.status !== 404) throw new Error(`GitHub recusou a leitura (HTTP ${atual.status}). Verifique o token e o repositório.`);
  const r = await fetchFn(url, {
    method: "PUT", headers,
    body: JSON.stringify({ message: `publica ${destino}`, branch, content: fs.readFileSync(arquivo).toString("base64"), ...(sha ? { sha } : {}) }),
  });
  if (!r.ok) throw new Error(`GitHub recusou o envio (HTTP ${r.status}). Verifique se o token tem Contents: write neste repositório.`);
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${caminho}`;
}

async function chamarMeta(fetchFn, url, opcoes) {
  const r = await fetchFn(url, opcoes);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error(`Meta API recusou a operação (${d.error?.code || r.status}): ${d.error?.error_user_msg || d.error?.message || ""}`);
  return d;
}

export async function publicarReels({ videoUrl, capaUrl, legenda, env, fetchFn = fetch, intervaloMs = 5000, tentativas = 60, log = console.log }) {
  const base = `https://graph.facebook.com/${exigir(env, "META_API_VERSION")}`;
  const ig = exigir(env, "INSTAGRAM_BUSINESS_ID"), token = exigir(env, "INSTAGRAM_ACCESS_TOKEN");
  const post = (rota, campos) => chamarMeta(fetchFn, `${base}/${rota}`, { method: "POST", body: new URLSearchParams({ ...campos, access_token: token }) });
  const get = rota => chamarMeta(fetchFn, `${base}/${rota}`, { headers: { authorization: `Bearer ${token}` } });

  log("1. Criando o container do Reels...");
  const container = (await post(`${ig}/media`, { media_type: "REELS", video_url: videoUrl, caption: normalizarLegenda(legenda), share_to_feed: "true", ...(capaUrl ? { cover_url: capaUrl } : {}) })).id;

  log("2. Aguardando o Instagram processar o vídeo...");
  for (let t = 1; ; t++) {
    const estado = await get(`${container}?fields=status_code,status`);
    if (estado.status_code === "FINISHED") break;
    if (estado.status_code === "ERROR") throw new Error(`o Instagram não conseguiu processar o vídeo: ${estado.status || "sem detalhe"}`);
    if (t >= tentativas) throw new Error("tempo esgotado aguardando o processamento do vídeo.");
    await esperar(intervaloMs);
  }

  log("3. Publicando...");
  const mediaId = (await post(`${ig}/media_publish`, { creation_id: container })).id;
  const publicado = await get(`${mediaId}?fields=id,permalink`);
  return { mediaId, permalink: publicado.permalink || "" };
}
