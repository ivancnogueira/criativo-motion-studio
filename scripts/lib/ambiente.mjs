// Funções comuns: raiz do produto, leitura do .env e estado das integrações.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function lerProduto(base = raiz) {
  return JSON.parse(fs.readFileSync(path.join(base, "produto.json"), "utf8"));
}

export function lerEnvTexto(texto) {
  const env = {};
  for (const original of String(texto || "").split(/\r?\n/)) {
    const linha = original.trim();
    if (!linha || linha.startsWith("#")) continue;
    const i = linha.indexOf("=");
    if (i < 1) continue;
    let valor = linha.slice(i + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) valor = valor.slice(1, -1);
    env[linha.slice(0, i).trim()] = valor;
  }
  return env;
}

export function lerEnv(base = raiz) {
  try { return lerEnvTexto(fs.readFileSync(path.join(base, ".env"), "utf8")); }
  catch (e) { if (e.code === "ENOENT") return {}; throw e; }
}

export const preenchido = v => Boolean(v && !/^<.*>$/.test(v) && !/^(alterar|preencher|exemplo)/i.test(v));

// Exige um campo do .env sem nunca revelar o valor em mensagens.
export function exigir(env, nome) {
  if (!preenchido(env[nome])) throw new Error(`${nome} não foi preenchido no .env.`);
  return env[nome];
}

export const PROVEDORES_DE_VOZ = {
  elevenlabs: { nome: "ElevenLabs", chaves: ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"] },
  fishaudio: { nome: "Fish Audio", chaves: ["FISH_AUDIO_API_KEY", "FISH_AUDIO_VOICE_ID"] },
  minimax: { nome: "MiniMax", chaves: ["MINIMAX_API_KEY", "MINIMAX_VOICE_ID"] },
};

// Decide como a narração será produzida, sem nunca expor valores das chaves.
export function modoNarracao(env) {
  const prontos = [], incompletos = [];
  for (const [id, p] of Object.entries(PROVEDORES_DE_VOZ)) {
    const faltam = p.chaves.filter(k => !preenchido(env[k]));
    if (!faltam.length) prontos.push(id);
    else if (faltam.length < p.chaves.length) incompletos.push({ id, faltam });
  }
  const preferido = String(env.VOZ_PROVEDOR || "").trim().toLowerCase();
  const escolhido = prontos.includes(preferido) ? preferido : prontos[0] || null;
  return { modo: escolhido ? "api" : "manual", provedor: escolhido, prontos, incompletos };
}

export const INTEGRACOES = {
  legendas: { nome: "Legendas (Groq)", chaves: ["GROQ_API_KEY"], semIsso: "legendas sincronizadas ficam indisponíveis" },
  instagram: { nome: "Instagram (Meta)", chaves: ["META_API_VERSION", "INSTAGRAM_BUSINESS_ID", "INSTAGRAM_ACCESS_TOKEN"], semIsso: "publicação manual" },
  hospedagem: { nome: "Hospedagem pública (GitHub)", chaves: ["GITHUB_PAGES_OWNER", "GITHUB_PAGES_REPO", "GITHUB_PAGES_TOKEN"], semIsso: "publicação manual" },
};

export function estadoIntegracoes(env) {
  return Object.entries(INTEGRACOES).map(([id, i]) => {
    const faltam = i.chaves.filter(k => !preenchido(env[k]));
    return { id, nome: i.nome, pronta: !faltam.length, faltam, semIsso: i.semIsso };
  });
}

export function opcao(args, nome) {
  const i = args.indexOf(nome);
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith("--")) throw new Error(`a opção ${nome} precisa de um valor`);
  return v;
}

// Erro de API sem vazar segredos: só o status e um trecho curto da resposta.
export async function falhaDeApi(rotulo, resposta) {
  let detalhe = "";
  try { detalhe = (await resposta.text()).slice(0, 300); } catch {}
  return new Error(`${rotulo} recusou o pedido (HTTP ${resposta.status})${detalhe ? ": " + detalhe : ""}`);
}
