// Gera uma cópia limpa do produto em outra pasta: para distribuir, ou para instalar e testar sem tocar no produto.
// uso: node scripts/empacotar.mjs <pasta-de-destino>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz } from "./lib/ambiente.mjs";
import { verificarProduto, listarArquivos, pertenceAoProduto } from "./verificar-produto.mjs";

export function empacotar(destino, base = raiz) {
  const alvo = path.resolve(destino);
  const rel = path.relative(base, alvo);
  if (!rel || (!rel.startsWith("..") && !path.isAbsolute(rel))) throw new Error("o destino precisa ficar fora da pasta do produto.");
  if (fs.existsSync(alvo) && fs.readdirSync(alvo).length) throw new Error(`o destino já existe e não está vazio: ${alvo}`);
  // Arquivos de instância e de desenvolvimento ficam de fora da cópia; dado real dentro de arquivo do produto impede o pacote.
  const reais = verificarProduto(base).problemas.filter(p => pertenceAoProduto(p.arquivo.replace(/:\d+$/, "")));
  if (reais.length) throw new Error("o produto tem dados reais; corrija antes de empacotar:\n" + reais.map(p => `- ${p.arquivo} — ${p.motivo}`).join("\n"));
  const arquivos = listarArquivos(base).filter(pertenceAoProduto);
  for (const a of arquivos) {
    fs.mkdirSync(path.dirname(path.join(alvo, a)), { recursive: true });
    fs.copyFileSync(path.join(base, a), path.join(alvo, a));
  }
  return { destino: alvo, arquivos: arquivos.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error("informe a pasta de destino: node scripts/empacotar.mjs <pasta-de-destino>");
    const r = empacotar(process.argv[2]);
    console.log(`Cópia limpa criada: ${r.destino} (${r.arquivos} arquivos)`);
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
