// Mede quanto da tela se move em um vídeo pronto e aponta os trechos parados. Também gera folhas de quadros
// (um por segundo) para a revisão visual.
// uso: node scripts/medir-movimento.mjs saida/<nome>/video.mp4 [--pasta saida/<nome>/revisao] [--sem-folhas]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const LW = 54, LH = 96, QPS = 5;

/** Recebe quadros em tons de cinza (Uint8Array de largura×altura) e devolve, para cada segundo,
    a fração da tela que mudou. `limiar` é a diferença mínima de brilho para contar como mudança. */
export function medirQuadros(quadros, { qps = QPS, limiar = 14 } = {}) {
  const porSegundo = [];
  for (let i = 1; i < quadros.length; i++) {
    const a = quadros[i - 1], b = quadros[i]; let n = 0;
    for (let k = 0; k < a.length; k++) if (Math.abs(a[k] - b[k]) > limiar) n++;
    const s = Math.floor((i - 1) / qps); (porSegundo[s] ||= []).push(n / a.length);
  }
  return porSegundo.map(v => v.reduce((x, y) => x + y, 0) / v.length);
}

/** Junta segundos seguidos com pouco movimento em trechos. */
export function trechosParados(porSegundo, { minimo = .012, duracao = 2 } = {}) {
  const out = []; let ini = -1;
  porSegundo.forEach((v, s) => {
    if (v < minimo) { if (ini < 0) ini = s; }
    else { if (ini >= 0 && s - ini >= duracao) out.push({ de: ini, ate: s }); ini = -1; }
  });
  if (ini >= 0 && porSegundo.length - ini >= duracao) out.push({ de: ini, ate: porSegundo.length });
  return out;
}

export function relatorio(porSegundo) {
  const media = porSegundo.reduce((a, b) => a + b, 0) / (porSegundo.length || 1), parados = trechosParados(porSegundo);
  const pct = v => (v * 100).toFixed(1) + "%";
  const linhas = [`Movimento médio: ${pct(media)} da tela muda a cada quadro medido (${porSegundo.length} s de vídeo).`];
  linhas.push(media < .03 ? "Avaliação: vídeo parado demais. Um motion graphics vivo costuma ficar acima de 4%." : media < .05 ? "Avaliação: pouco movimento. Acrescente vida aos elementos que já estão na tela." : "Avaliação: bom nível de movimento.");
  if (parados.length) { linhas.push("", "Trechos quase parados (menos de 1,2% da tela mudando):"); for (const p of parados) linhas.push(`- de ${p.de} s a ${p.ate} s`); }
  else linhas.push("Nenhum trecho parado por 2 segundos ou mais.");
  linhas.push("", "Por segundo: " + porSegundo.map((v, s) => `${s}s ${pct(v)}`).join(" · "));
  return { media, parados, texto: linhas.join("\n") };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), video = args.find(a => !a.startsWith("--"));
  const iPasta = args.indexOf("--pasta");
  if (!video || !fs.existsSync(video)) { console.error("Erro: informe o caminho de um vídeo que exista. Exemplo: node scripts/medir-movimento.mjs saida/meu-video/video.mp4"); process.exit(1); }
  const pasta = iPasta >= 0 ? args[iPasta + 1] : path.join(path.dirname(video), "revisao");
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", video, "-vf", `fps=${QPS},scale=${LW}:${LH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) { console.error("Erro: não consegui ler o vídeo com o FFmpeg. " + (r.error?.message || String(r.stderr).trim() || "Confira se o FFmpeg está instalado (npm run diagnosticar).")); process.exit(1); }
  const tam = LW * LH, quadros = [];
  for (let i = 0; i + tam <= r.stdout.length; i += tam) quadros.push(r.stdout.subarray(i, i + tam));
  const rel = relatorio(medirQuadros(quadros));
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(path.join(pasta, "movimento.md"), "# Medição de movimento\n\n" + rel.texto + "\n");
  console.log(rel.texto);
  if (!args.includes("--sem-folhas")) {
    const f = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-vf", "fps=1,scale=270:-2,tile=6x2", path.join(pasta, "folha-%02d.jpg")]);
    console.log(f.status === 0 ? `\nFolhas de quadros (um por segundo, 12 por folha) em ${pasta}. Abra cada uma e confira se o que é falado aparece.` : "\nNão consegui gerar as folhas de quadros.");
  }
  process.exit(rel.parados.length || rel.media < .03 ? 2 : 0);
}
