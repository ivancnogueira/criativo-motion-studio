import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { instalarSkills, removerSkills } from "../scripts/instalar-skills.mjs";
import { detectar, interpretarPlataformas } from "../scripts/lib/plataformas.mjs";
import { lerEnvTexto, modoNarracao, lerProduto, raiz } from "../scripts/lib/ambiente.mjs";
import { diagnosticar } from "../scripts/diagnosticar.mjs";

const quieto = () => {};
function homeFalso(...pastas) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "motion-teste-"));
  for (const p of pastas) fs.mkdirSync(path.join(home, p), { recursive: true });
  return home;
}
const prefixo = lerProduto().prefixo;

test("detecta só as plataformas presentes", () => {
  assert.deepEqual(detectar(homeFalso(".claude")), ["claude"]);
  assert.deepEqual(detectar(homeFalso(".codex", ".gemini")), ["codex", "antigravity"]);
  assert.deepEqual(detectar(homeFalso()), []);
});

test("recusa plataforma desconhecida", () => {
  assert.throws(() => interpretarPlataformas("claude,chatgpt", homeFalso()), /desconhecida/);
  assert.deepEqual(interpretarPlataformas("todas", homeFalso()), ["claude", "codex", "antigravity"]);
});

test("instala nas três plataformas com prefixo e pasta do produto", () => {
  const home = homeFalso(".claude", ".codex", ".gemini");
  const r = instalarSkills({ home, log: quieto });
  assert.equal(r.puladas.length, 0);
  for (const pasta of [".claude/skills", ".codex/skills", ".gemini/config/skills"]) {
    const skill = path.join(home, pasta, `${prefixo}-criar-video`, "SKILL.md");
    const texto = fs.readFileSync(skill, "utf8");
    assert.match(texto, new RegExp(`^name: ${prefixo}-criar-video$`, "m"));
    assert.ok(texto.includes(raiz), "deve conter a pasta do produto");
    assert.ok(!texto.includes("{{"), "não pode sobrar marcador");
  }
  assert.ok(!fs.existsSync(path.join(home, ".gemini/antigravity/skills")), "não cria destino secundário inexistente");
});

test("só instala onde a plataforma existe", () => {
  const home = homeFalso(".codex");
  instalarSkills({ home, log: quieto });
  assert.ok(fs.existsSync(path.join(home, ".codex/skills", `${prefixo}-narracao`)));
  assert.ok(!fs.existsSync(path.join(home, ".claude")));
});

test("não sobrescreve skill de terceiros com o mesmo nome e não a remove", () => {
  const home = homeFalso(".claude");
  const alheia = path.join(home, ".claude/skills", `${prefixo}-criar-video`);
  fs.mkdirSync(alheia, { recursive: true });
  fs.writeFileSync(path.join(alheia, "SKILL.md"), "de outra pessoa");
  const r = instalarSkills({ home, log: quieto });
  assert.equal(r.puladas.length, 1);
  assert.equal(fs.readFileSync(path.join(alheia, "SKILL.md"), "utf8"), "de outra pessoa");
  removerSkills({ home, log: quieto });
  assert.ok(fs.existsSync(alheia), "skill alheia permanece");
  assert.ok(!fs.existsSync(path.join(home, ".claude/skills", `${prefixo}-narracao`)), "as nossas saem");
});

test("reinstalar atualiza e remover limpa tudo que é nosso", () => {
  const home = homeFalso(".claude");
  instalarSkills({ home, log: quieto });
  const r2 = instalarSkills({ home, log: quieto });
  assert.equal(r2.puladas.length, 0);
  const outra = path.join(home, ".claude/skills", "skill-de-outro-produto");
  fs.mkdirSync(outra);
  const { removidas } = removerSkills({ home, log: quieto });
  assert.equal(removidas.length, r2.instaladas.length);
  assert.ok(fs.existsSync(outra));
});

test("diagnóstico reflete a instalação", () => {
  const home = homeFalso(".claude", ".codex");
  assert.ok(diagnosticar({ home }).problemas.some(p => /Skills não instaladas/.test(p)));
  instalarSkills({ home, log: quieto });
  const d = diagnosticar({ home });
  const claude = d.plataformas.find(p => p.id === "claude");
  assert.equal(claude.skills, claude.total);
  assert.equal(d.plataformas.find(p => p.id === "antigravity").detectada, false);
  assert.equal(d.estilos.length, 5);
});

test("modo de narração: manual sem chaves, api com conjunto completo, preferido respeitado", () => {
  assert.equal(modoNarracao({}).modo, "manual");
  const parcial = modoNarracao(lerEnvTexto("ELEVENLABS_API_KEY=abc\nELEVENLABS_VOICE_ID="));
  assert.equal(parcial.modo, "manual");
  assert.deepEqual(parcial.incompletos, [{ id: "elevenlabs", faltam: ["ELEVENLABS_VOICE_ID"] }]);
  const dois = lerEnvTexto('ELEVENLABS_API_KEY=a\nELEVENLABS_VOICE_ID=b\nFISH_AUDIO_API_KEY="c"\nFISH_AUDIO_VOICE_ID=d\nVOZ_PROVEDOR=fishaudio');
  assert.equal(modoNarracao(dois).provedor, "fishaudio");
  assert.equal(modoNarracao({ ...dois, VOZ_PROVEDOR: "minimax" }).provedor, "elevenlabs");
});
