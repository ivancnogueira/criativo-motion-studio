// Instala (ou remove) as skills do produto nas pastas globais das plataformas detectadas.
// uso: node scripts/instalar-skills.mjs [--plataforma claude,codex,antigravity|todas] [--remover] [--home PASTA]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { PLATAFORMAS, destinosDe, homePadrao, interpretarPlataformas } from "./lib/plataformas.mjs";

const MARCA = ".instalado-por.json"; // identifica pastas criadas por este instalador

function listarSkills(base) {
  const dir = path.join(base, "skills");
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "SKILL.md")))
    .map(d => d.name).sort();
}

function lerMarca(pasta) {
  try { return JSON.parse(fs.readFileSync(path.join(pasta, MARCA), "utf8")); } catch { return null; }
}

// Copia a skill aplicando o prefixo do produto e a pasta onde ele está instalado.
function copiarSkill(origem, destino, { nomeFinal, produto, base }) {
  fs.rmSync(destino, { recursive: true, force: true });
  fs.cpSync(origem, destino, { recursive: true });
  const arq = path.join(destino, "SKILL.md");
  const texto = fs.readFileSync(arq, "utf8")
    .replace(/^name:.*$/m, `name: ${nomeFinal}`)
    .replaceAll("{{PASTA_DO_PRODUTO}}", base)
    .replaceAll("{{PREFIXO}}", produto.prefixo)
    .replaceAll("{{PRODUTO}}", produto.nome);
  fs.writeFileSync(arq, texto);
  fs.writeFileSync(path.join(destino, MARCA), JSON.stringify({ produto: produto.prefixo, versao: produto.versao, origem: base }, null, 2) + "\n");
}

export function instalarSkills({ base = raiz, home = homePadrao(), plataformas, log = console.log } = {}) {
  const produto = lerProduto(base);
  const ids = plataformas ?? interpretarPlataformas(null, home);
  const skills = listarSkills(base);
  const resultado = { instaladas: [], puladas: [], plataformas: ids };
  if (!ids.length) { log("Nenhuma plataforma encontrada (Claude Code, Codex ou Antigravity). Use --plataforma para escolher."); return resultado; }
  for (const id of ids) {
    for (const pastaSkills of destinosDe(id, home)) {
      fs.mkdirSync(pastaSkills, { recursive: true });
      log(`\n${PLATAFORMAS[id].nome} → ${pastaSkills}`);
      for (const s of skills) {
        const nomeFinal = `${produto.prefixo}-${s}`;
        const destino = path.join(pastaSkills, nomeFinal);
        const marca = fs.existsSync(destino) ? lerMarca(destino) : null;
        if (fs.existsSync(destino) && marca?.produto !== produto.prefixo) {
          log(`  pulada  /${nomeFinal} — já existe uma skill com esse nome que não é deste produto`);
          resultado.puladas.push(destino);
          continue;
        }
        copiarSkill(path.join(base, "skills", s), destino, { nomeFinal, produto, base });
        log(`  ok      /${nomeFinal}`);
        resultado.instaladas.push(destino);
      }
    }
  }
  return resultado;
}

// Remove somente as pastas que este produto instalou (conferindo a marca).
export function removerSkills({ base = raiz, home = homePadrao(), plataformas, log = console.log } = {}) {
  const produto = lerProduto(base);
  const ids = plataformas ?? Object.keys(PLATAFORMAS);
  const removidas = [];
  for (const id of ids) {
    for (const pastaSkills of destinosDe(id, home)) {
      if (!fs.existsSync(pastaSkills)) continue;
      for (const d of fs.readdirSync(pastaSkills, { withFileTypes: true })) {
        const alvo = path.join(pastaSkills, d.name);
        if (!d.isDirectory() || lerMarca(alvo)?.produto !== produto.prefixo) continue;
        fs.rmSync(alvo, { recursive: true, force: true });
        log(`  removida ${alvo}`);
        removidas.push(alvo);
      }
    }
  }
  if (!removidas.length) log("Nenhuma skill deste produto encontrada para remover.");
  return { removidas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const home = opcao(args, "--home") ? path.resolve(opcao(args, "--home")) : homePadrao();
    const escolha = opcao(args, "--plataforma");
    if (args.includes("--remover")) {
      removerSkills({ home, plataformas: escolha ? interpretarPlataformas(escolha, home) : undefined });
    } else {
      const r = instalarSkills({ home, plataformas: interpretarPlataformas(escolha, home) });
      if (r.instaladas.length) console.log("\nFeche e reabra o agente para os comandos de barra aparecerem.");
    }
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
