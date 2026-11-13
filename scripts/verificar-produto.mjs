// Confere se a pasta está limpa para ser distribuída como produto: sem arquivos de instância e sem dados reais.
// uso: node scripts/verificar-produto.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz } from "./lib/ambiente.mjs";

// O que faz parte do produto. Tudo fora desta lista é instância ou material de desenvolvimento.
export const ARQUIVOS_DO_PRODUTO = [".env.example", ".gitattributes", ".gitignore", "AGENTS.md", "CLAUDE.md", "GEMINI.md", "INSTALAR.md", "INSTALAR-COM-ANTIGRAVITY.md", "INSTALAR-COM-CLAUDE.md", "INSTALAR-COM-CODEX.md", "README.md", "marca.exemplo.json", "package.json", "produto.json", "projeto.exemplo.json"];
export const PASTAS_DO_PRODUTO = [".agents", "blocos", "documentacao", "entrada", "estilos", "painel", "scripts", "skills", "testes", "vitrine"];
const ESTILOS_DO_PRODUTO = ["_personalizado", "indice.json", "recorte-de-papel", "vidro-liquido", "isometrico-em-linha", "vetor-flat", "pixel-art-8-bit"];
const IGNORAR = new Set(["node_modules", ".git"]);

// Um caminho relativo (com /) pertence ao produto?
export function pertenceAoProduto(rel) {
  const partes = rel.split("/");
  if (partes.length === 1) return ARQUIVOS_DO_PRODUTO.includes(rel);
  if (!PASTAS_DO_PRODUTO.includes(partes[0])) return false;
  if (partes[0] === "estilos") return ESTILOS_DO_PRODUTO.includes(partes[1]);
  if (partes[0] === "entrada") return rel === "entrada/LEIA-ME.md";
  if (rel === "vitrine/estilos.js") return false;
  return true;
}

export function listarArquivos(base, dir = "") {
  const saida = [];
  for (const d of fs.readdirSync(path.join(base, dir), { withFileTypes: true })) {
    if (IGNORAR.has(d.name)) continue;
    const rel = dir ? `${dir}/${d.name}` : d.name;
    if (d.isDirectory()) saida.push(...listarArquivos(base, rel)); else saida.push(rel);
  }
  return saida;
}

const PADROES = [
  { nome: "caminho local desta máquina", re: /[A-Za-z]:\\(?:Users|PROJETOS|Documents)\\|\/(?:Users|home)\/[A-Za-z0-9._-]+\// },
  { nome: "e-mail", re: /[A-Za-z0-9._%+-]+@(?!anthropic\.com|example\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { nome: "credencial", re: /\b(?:gsk_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|EAA[A-Za-z0-9]{30,})\b/ },
  { nome: "publicação ou perfil real", re: /instagram\.com\/(?:p|reel|reels)\/[A-Za-z0-9_-]{5,}|tiktok\.com\/@[A-Za-z0-9._]+\/video|youtu\.be\/[A-Za-z0-9_-]{6,}/ },
  { nome: "marca real", re: /ideias\s+artificiais|escola\s*de\s*ferramentas|navibotlab/i },
];
const TEXTO = new Set([".md", ".mjs", ".js", ".json", ".html", ".css", ".txt", ".example", ".yml", ".yaml", ""]);

export function verificarProduto(base = raiz) {
  const problemas = [];
  const arquivos = listarArquivos(base);
  for (const rel of arquivos) {
    if (!pertenceAoProduto(rel)) { problemas.push({ arquivo: rel, motivo: "não faz parte do produto (arquivo de instância ou de desenvolvimento)" }); continue; }
    if (rel === "scripts/verificar-produto.mjs" || !TEXTO.has(path.extname(rel).toLowerCase())) continue;
    const linhas = fs.readFileSync(path.join(base, rel), "utf8").split("\n");
    for (const p of PADROES) {
      const n = linhas.findIndex(l => p.re.test(l));
      if (n >= 0) problemas.push({ arquivo: `${rel}:${n + 1}`, motivo: p.nome });
    }
  }
  for (const [arq, campo] of [[".env.example", null], ["marca.exemplo.json", "json"]]) {
    if (!fs.existsSync(path.join(base, arq))) continue;
    const texto = fs.readFileSync(path.join(base, arq), "utf8");
    if (campo === "json") {
      const m = JSON.parse(texto);
      if (m.nome !== null || Object.values(m.cores || {}).some(v => v !== null)) problemas.push({ arquivo: arq, motivo: "modelo de marca deve ficar com valores null" });
    } else {
      const permitidos = { META_API_VERSION: /^v\d+\.\d+$/, GITHUB_PAGES_BRANCH: /^main$/ };
      for (const l of texto.split("\n")) {
        const m = /^([A-Z0-9_]+)=(.+)$/.exec(l.trim());
        if (m && !(permitidos[m[1]]?.test(m[2]))) problemas.push({ arquivo: arq, motivo: `${m[1]} deve ficar vazio no modelo` });
      }
    }
  }
  return { problemas, arquivosDoProduto: arquivos.filter(pertenceAoProduto) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = verificarProduto();
  if (!r.problemas.length) { console.log(`Produto limpo: ${r.arquivosDoProduto.length} arquivos, nenhum dado de instância ou dado real encontrado.`); process.exit(0); }
  console.error(`Produto contaminado: ${r.problemas.length} problema(s).`);
  for (const p of r.problemas) console.error(`- ${p.arquivo} — ${p.motivo}`);
  process.exit(1);
}
