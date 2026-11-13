// Testa, só por leitura, as integrações que estiverem preenchidas no .env. Não mostra nem grava chaves.
// uso: node scripts/validar-integracoes.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lerEnv, estadoIntegracoes } from "./lib/ambiente.mjs";

async function ler(fetchFn, url, headers, rotulo) {
  let r;
  try { r = await fetchFn(url, { headers, signal: AbortSignal.timeout(12_000) }); }
  catch { throw new Error(`${rotulo} não respondeu. Verifique a conexão.`); }
  if (!r.ok) throw new Error(`${rotulo} recusou a validação (HTTP ${r.status}). Verifique a chave e os identificadores.`);
  return r.json().catch(() => ({}));
}

const TESTES = {
  async legendas(env, f) {
    await ler(f, "https://api.groq.com/openai/v1/models", { authorization: `Bearer ${env.GROQ_API_KEY}` }, "Groq");
    return "chave aceita";
  },
  async instagram(env, f) {
    const p = await ler(f, `https://graph.facebook.com/${encodeURIComponent(env.META_API_VERSION)}/${encodeURIComponent(env.INSTAGRAM_BUSINESS_ID)}?fields=id,username`, { authorization: `Bearer ${env.INSTAGRAM_ACCESS_TOKEN}` }, "Meta / Instagram");
    if (String(p.id || "") !== String(env.INSTAGRAM_BUSINESS_ID)) throw new Error("a Meta devolveu um perfil diferente do INSTAGRAM_BUSINESS_ID.");
    return `perfil @${p.username || "?"}`;
  },
  async hospedagem(env, f) {
    const repo = await ler(f, `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_PAGES_OWNER)}/${encodeURIComponent(env.GITHUB_PAGES_REPO)}`, { authorization: `Bearer ${env.GITHUB_PAGES_TOKEN}`, accept: "application/vnd.github+json" }, "GitHub");
    if (repo.private) throw new Error("o repositório de hospedagem é privado; a Meta só baixa de repositório público.");
    return "repositório público acessível";
  },
};

export async function validarIntegracoes({ env = lerEnv(), fetchFn = fetch } = {}) {
  const saida = [];
  for (const i of estadoIntegracoes(env)) {
    if (!i.pronta) { saida.push({ ...i, estado: "não configurada" }); continue; }
    try { saida.push({ ...i, estado: "ok", detalhe: await TESTES[i.id](env, fetchFn) }); }
    catch (e) { saida.push({ ...i, estado: "falhou", detalhe: e.message }); }
  }
  return saida;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await validarIntegracoes();
  for (const i of r) console.log(`- ${i.nome}: ${i.estado}${i.detalhe ? " — " + i.detalhe : i.estado === "não configurada" ? ` (falta ${i.faltam.join(", ")})` : ""}`);
  process.exit(r.some(i => i.estado === "falhou") ? 1 : 0);
}
