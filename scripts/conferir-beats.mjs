// Confere o plano de beats de um vídeo antes de animar.
// uso: node scripts/conferir-beats.mjs saida/<nome>/beats.json
import fs from "node:fs";
import { conferirBeats } from "../kit/movimento.js";

const arquivo = process.argv[2];
if (!arquivo || !fs.existsSync(arquivo)) { console.error("Erro: informe o arquivo de beats. Exemplo: node scripts/conferir-beats.mjs saida/meu-video/beats.json"); process.exit(1); }
let beats;
try { beats = JSON.parse(fs.readFileSync(arquivo, "utf8")); } catch (e) { console.error("Erro: o arquivo não é um JSON válido. " + e.message); process.exit(1); }
if (!Array.isArray(beats) || !beats.length) { console.error("Erro: o arquivo precisa ser uma lista com pelo menos um beat."); process.exit(1); }
const avisos = conferirBeats(beats);
if (!avisos.length) { console.log(`Plano ok: ${beats.length} beats, todos com imagem, movimento e variação.`); process.exit(0); }
console.log(`Plano com ${avisos.length} ponto(s) a corrigir:`);
for (const a of avisos) console.log("- " + a);
process.exit(2);
