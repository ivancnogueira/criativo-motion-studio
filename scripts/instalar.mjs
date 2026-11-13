// Instalação completa: confere o Node, prepara pastas e .env, instala as skills e mostra o diagnóstico.
// uso: node scripts/instalar.mjs [--plataforma claude,codex,antigravity|todas] [--home PASTA]
import fs from "node:fs";
import path from "node:path";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { homePadrao, interpretarPlataformas } from "./lib/plataformas.mjs";
import { instalarSkills } from "./instalar-skills.mjs";

try {
  const args = process.argv.slice(2);
  const produto = lerProduto();
  console.log(`Instalando ${produto.nome} ${produto.versao}\n`);

  if (Number(process.versions.node.split(".")[0]) < 20) throw new Error("é necessário Node.js 20 ou superior (https://nodejs.org).");

  for (const pasta of ["entrada", "saida", "runtime"]) fs.mkdirSync(path.join(raiz, pasta), { recursive: true });

  const env = path.join(raiz, ".env");
  if (fs.existsSync(env)) console.log(".env preservado: nenhuma chave existente foi alterada.");
  else { fs.copyFileSync(path.join(raiz, ".env.example"), env); console.log(".env criado a partir de .env.example."); }

  const projeto = path.join(raiz, "projeto.json");
  if (!fs.existsSync(projeto)) { fs.copyFileSync(path.join(raiz, "projeto.exemplo.json"), projeto); console.log("projeto.json criado a partir de projeto.exemplo.json."); }
  (await import("./vitrine.mjs")).gerarVitrine();

  const home = opcao(args, "--home") ? path.resolve(opcao(args, "--home")) : homePadrao();
  const r = instalarSkills({ home, plataformas: interpretarPlataformas(opcao(args, "--plataforma"), home) });
  fs.writeFileSync(path.join(raiz, "runtime", "instalacao.json"), JSON.stringify({ em: new Date().toISOString(), versao: produto.versao, ...r }, null, 2) + "\n");

  console.log("\n----------------------------------------\n");
  const { diagnosticar } = await import("./diagnosticar.mjs");
  const d = diagnosticar({ home });
  if (d.problemas.length) { console.log("Pendências:\n" + d.problemas.map(p => "- " + p).join("\n")); process.exit(1); }
  console.log(`Instalação concluída. Feche e reabra o agente nesta pasta e digite /${produto.prefixo}-criar-video.`);
} catch (e) {
  console.error("Erro: " + e.message);
  process.exit(1);
}
