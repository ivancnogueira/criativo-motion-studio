// Onde cada plataforma procura skills globais (as que viram comandos de barra).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const PLATAFORMAS = {
  claude: {
    nome: "Claude Code",
    sinal: home => [path.join(home, ".claude")],
    destinos: home => [path.join(home, ".claude", "skills")],
  },
  codex: {
    nome: "Codex",
    sinal: home => [process.env.CODEX_HOME || path.join(home, ".codex")],
    destinos: home => [path.join(process.env.CODEX_HOME || path.join(home, ".codex"), "skills")],
  },
  antigravity: {
    nome: "Antigravity",
    sinal: home => [path.join(home, ".gemini")],
    // config/skills é a pasta real; antigravity/skills costuma ser um atalho para ela.
    destinos: home => [path.join(home, ".gemini", "config", "skills"), path.join(home, ".gemini", "antigravity", "skills")],
  },
};

export const homePadrao = () => os.homedir();

export function detectar(home = homePadrao()) {
  return Object.keys(PLATAFORMAS).filter(id => PLATAFORMAS[id].sinal(home).some(p => fs.existsSync(p)));
}

const real = p => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };

// Pastas de destino de uma plataforma, sem repetir a mesma pasta física (atalhos).
// Um destino secundário só entra se já existir; o primeiro é criado se faltar.
export function destinosDe(id, home = homePadrao()) {
  const vistos = new Set(), saida = [];
  PLATAFORMAS[id].destinos(home).forEach((d, i) => {
    if (i > 0 && !fs.existsSync(d)) return;
    const r = real(d);
    if (vistos.has(r)) return;
    vistos.add(r);
    saida.push(d);
  });
  return saida;
}

export function interpretarPlataformas(valor, home = homePadrao()) {
  if (!valor) return detectar(home);
  if (valor === "todas") return Object.keys(PLATAFORMAS);
  const ids = valor.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const ruins = ids.filter(id => !PLATAFORMAS[id]);
  if (ruins.length) throw new Error(`plataforma desconhecida: ${ruins.join(", ")}. Opções: ${Object.keys(PLATAFORMAS).join(", ")}, todas`);
  return [...new Set(ids)];
}
