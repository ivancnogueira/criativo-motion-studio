// Transcreve a narração com tempo palavra por palavra (Groq Whisper) e gera legendas.
// uso: node scripts/transcrever.mjs [audio] [--saida pasta]
// Padrão: entrada/narracao.mp3 → saida/legendas/legendas.json e legendas.srt
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, lerEnv, exigir, opcao, falhaDeApi } from "./lib/ambiente.mjs";

export async function transcrever(arquivo, env, fetchFn = fetch) {
  if (!fs.existsSync(arquivo)) throw new Error(`áudio não encontrado: ${arquivo}`);
  const chave = exigir(env, "GROQ_API_KEY");
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(arquivo)], { type: "audio/mpeg" }), path.basename(arquivo));
  form.append("model", env.GROQ_WHISPER_MODEL || "whisper-large-v3");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  form.append("language", "pt");
  const r = await fetchFn("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${chave}` }, body: form });
  if (!r.ok) throw await falhaDeApi("Groq", r);
  const d = await r.json();
  const palavras = (d.words || []).map(w => ({ palavra: String(w.word).trim(), inicio: Number(w.start), fim: Number(w.end) })).filter(w => w.palavra);
  return { texto: String(d.text || "").trim(), palavras, duracao: Number(d.duration) || (palavras.length ? palavras.at(-1).fim : 0) };
}

const tempoSrt = s => {
  const ms = Math.max(0, Math.round(s * 1000));
  const p = (n, t = 2) => String(n).padStart(t, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// Agrupa palavras em blocos curtos, bons para vídeo vertical: quebra por tamanho, pausa ou pontuação.
export function agruparLegendas(palavras, { maxPalavras = 4, maxCaracteres = 22, pausa = 0.45 } = {}) {
  const blocos = [];
  let atual = [];
  const fechar = () => { if (atual.length) { blocos.push({ inicio: atual[0].inicio, fim: atual.at(-1).fim, texto: atual.map(w => w.palavra).join(" ") }); atual = []; } };
  for (const w of palavras) {
    const texto = atual.map(x => x.palavra).join(" ");
    if (atual.length && (atual.length >= maxPalavras || (texto + " " + w.palavra).length > maxCaracteres || w.inicio - atual.at(-1).fim > pausa)) fechar();
    atual.push(w);
    if (/[.!?…]$/.test(w.palavra)) fechar();
  }
  fechar();
  return blocos;
}

export const paraSrt = blocos => blocos.map((b, i) => `${i + 1}\n${tempoSrt(b.inicio)} --> ${tempoSrt(b.fim)}\n${b.texto}\n`).join("\n");

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const pasta = path.resolve(opcao(args, "--saida") || path.join(raiz, "saida", "legendas"));
    const audio = path.resolve(args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--saida") || path.join(raiz, "entrada", "narracao.mp3"));
    const t = await transcrever(audio, lerEnv());
    const blocos = agruparLegendas(t.palavras);
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(path.join(pasta, "legendas.json"), JSON.stringify({ ...t, blocos }, null, 2) + "\n");
    fs.writeFileSync(path.join(pasta, "legendas.srt"), paraSrt(blocos));
    console.log(`Transcrição: ${t.palavras.length} palavras, ${t.duracao.toFixed(1)} s, ${blocos.length} blocos de legenda`);
    console.log(`Arquivos: ${path.join(pasta, "legendas.json")} e legendas.srt`);
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
