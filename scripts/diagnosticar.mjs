// Mostra o estado da instalação. Nunca imprime valores do .env.
// uso: node scripts/diagnosticar.mjs [--home PASTA] [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, lerEnv, modoNarracao, estadoIntegracoes, PROVEDORES_DE_VOZ } from "./lib/ambiente.mjs";
import { temFfmpeg } from "./extrair-estilo.mjs";
import { PLATAFORMAS, destinosDe, detectar, homePadrao } from "./lib/plataformas.mjs";

export function diagnosticar({ base = raiz, home = homePadrao() } = {}) {
  const produto = lerProduto(base);
  const node = Number(process.versions.node.split(".")[0]);
  const pastaEstilos = path.join(base, "estilos");
  const estilos = fs.readdirSync(pastaEstilos, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(pastaEstilos, d.name, "estilo.json")))
    .map(d => d.name).sort();
  const esperadas = fs.readdirSync(path.join(base, "skills"), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => `${produto.prefixo}-${d.name}`);
  const detectadas = detectar(home);
  const plataformas = Object.keys(PLATAFORMAS).map(id => {
    const presentes = detectadas.includes(id)
      ? esperadas.filter(s => destinosDe(id, home).some(d => fs.existsSync(path.join(d, s, "SKILL.md"))))
      : [];
    return { id, nome: PLATAFORMAS[id].nome, detectada: detectadas.includes(id), skills: presentes.length, total: esperadas.length };
  });
  const temEnv = fs.existsSync(path.join(base, ".env"));
  const env = lerEnv(base);
  const narracao = modoNarracao(env);
  const integracoes = estadoIntegracoes(env);
  const problemas = [];
  if (node < 20) problemas.push("Node.js 20 ou superior é necessário.");
  if (!estilos.length) problemas.push("Nenhum estilo encontrado em estilos/.");
  if (!detectadas.length) problemas.push("Nenhuma plataforma de agente encontrada neste computador.");
  if (detectadas.length && !plataformas.some(p => p.skills === p.total)) problemas.push("Skills não instaladas. Rode: npm run instalar-skills");
  // Ferramentas de vídeo: avisos, não impedem usar o resto.
  const ffmpeg = temFfmpeg();
  const remotion = fs.existsSync(path.join(base, "render", "node_modules", "remotion", "package.json"));
  const avisos = [];
  if (!ffmpeg) avisos.push("FFmpeg não encontrado: necessário para extrair estilos e conferir o MP4 (https://ffmpeg.org).");
  if (!remotion) avisos.push("Remotion não instalado em render/: o agente instalador faz isso (veja INSTALAR.md).");
  return { produto, node: process.versions.node, estilos, plataformas, temEnv, narracao, integracoes, ffmpeg, remotion, avisos, problemas };
}

function imprimir(d) {
  console.log(`${d.produto.nome} ${d.produto.versao}\n`);
  console.log(`Node.js: ${d.node}`);
  console.log(`Estilos: ${d.estilos.length} (${d.estilos.join(", ")})`);
  console.log(`Arquivo .env: ${d.temEnv ? "presente" : "ausente (rode npm run instalar)"}`);
  console.log("\nPlataformas:");
  for (const p of d.plataformas)
    console.log(`- ${p.nome}: ${!p.detectada ? "não encontrada" : p.skills === p.total ? `skills instaladas (${p.skills})` : `skills pendentes (${p.skills} de ${p.total})`}`);
  console.log("\nNarração:");
  if (d.narracao.modo === "api") console.log(`- Modo API: ${PROVEDORES_DE_VOZ[d.narracao.provedor].nome}${d.narracao.prontos.length > 1 ? ` (também configurados: ${d.narracao.prontos.filter(id => id !== d.narracao.provedor).map(id => PROVEDORES_DE_VOZ[id].nome).join(", ")})` : ""}`);
  else console.log("- Modo manual: o agente entrega o texto e você salva o MP3 em entrada/narracao.mp3");
  for (const i of d.narracao.incompletos) console.log(`- ${PROVEDORES_DE_VOZ[i.id].nome}: incompleto, falta ${i.faltam.join(", ")}`);
  console.log("\nIntegrações:");
  for (const i of d.integracoes) console.log(`- ${i.nome}: ${i.pronta ? "configurada" : `não configurada (${i.semIsso})`}`);
  console.log("\nFerramentas de vídeo:");
  console.log(`- FFmpeg: ${d.ffmpeg ? "encontrado" : "não encontrado"}`);
  console.log(`- Remotion (render/): ${d.remotion ? "instalado" : "não instalado"}`);
  if (d.avisos.length) console.log(`\nAvisos:\n${d.avisos.map(a => "- " + a).join("\n")}`);
  console.log(d.problemas.length ? `\nPendências:\n${d.problemas.map(p => "- " + p).join("\n")}` : "\nTudo certo.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const i = args.indexOf("--home");
  const d = diagnosticar({ home: i >= 0 ? path.resolve(args[i + 1]) : homePadrao() });
  if (args.includes("--json")) console.log(JSON.stringify(d, null, 2)); else imprimir(d);
  process.exit(d.problemas.length ? 1 : 0);
}
