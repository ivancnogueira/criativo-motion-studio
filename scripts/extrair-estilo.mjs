// Extrai de um vídeo de referência o material para criar um estilo novo:
// quadros-chave, sequência de movimento, folha de referência, paleta e medidas.
// uso: node scripts/extrair-estilo.mjs <video> --id meu-estilo [--inicio 0] [--duracao 12]
// Requer ffmpeg e ffprobe instalados.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { raiz, opcao } from "./lib/ambiente.mjs";

const rodar = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const rodarBin = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });

export function temFfmpeg() {
  try { rodar("ffmpeg", ["-version"]); rodar("ffprobe", ["-version"]); return true; } catch { return false; }
}

// Cores dominantes a partir de pixels RGB crus: agrupa em caixas de 32 níveis e ordena por frequência.
export function coresDominantes(rgb, quantas = 6) {
  const caixas = new Map();
  const total = Math.floor(rgb.length / 3);
  for (let i = 0; i + 2 < rgb.length; i += 3) {
    const k = (rgb[i] >> 5) << 6 | (rgb[i + 1] >> 5) << 3 | (rgb[i + 2] >> 5);
    const c = caixas.get(k) || { n: 0, r: 0, g: 0, b: 0 };
    c.n++; c.r += rgb[i]; c.g += rgb[i + 1]; c.b += rgb[i + 2];
    caixas.set(k, c);
  }
  const hex = v => Math.round(v).toString(16).padStart(2, "0").toUpperCase();
  return [...caixas.values()].sort((a, b) => b.n - a.n).slice(0, quantas)
    .map(c => ({ hex: `#${hex(c.r / c.n)}${hex(c.g / c.n)}${hex(c.b / c.n)}`, pct: Math.round((c.n / total) * 100) }));
}

export function medidasDeCor(rgb) {
  let brilho = 0, sat = 0;
  const total = Math.floor(rgb.length / 3) || 1;
  for (let i = 0; i + 2 < rgb.length; i += 3) {
    const r = rgb[i], g = rgb[i + 1], b = rgb[i + 2], max = Math.max(r, g, b), min = Math.min(r, g, b);
    brilho += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sat += max ? (max - min) / max : 0;
  }
  return { brilho: Math.round((brilho / total) * 100), saturacao: Math.round((sat / total) * 100) };
}

export function textoMetricas(m) {
  return [
    `- Clip analysed: ${m.duracao.toFixed(1)} s, ${m.formato} (${m.largura} × ${m.altura})`,
    `- Shots: ${m.cortes + 1} (${m.cortes} hard cuts, about ${m.cortesPorMinuto.toFixed(0)} cuts per minute, average shot ${m.planoMedio.toFixed(1)} s)`,
    `- Average brightness ${m.brilho} / 100, average saturation ${m.saturacao} / 100`,
    `- Dominant colours: ${m.cores.map(c => `${c.hex} (~${c.pct}%)`).join(", ")}`,
  ].join("\n");
}

export function extrairEstilo({ video, id, inicio = 0, duracao = 12, base = raiz, log = console.log }) {
  if (!/^[a-z0-9-]+$/.test(id || "")) throw new Error("o id do estilo deve ter só letras minúsculas, números e hífen.");
  if (!fs.existsSync(video)) throw new Error(`vídeo não encontrado: ${video}`);
  if (!temFfmpeg()) throw new Error("ffmpeg e ffprobe não foram encontrados. Instale o FFmpeg (https://ffmpeg.org) e tente de novo.");
  const pasta = path.join(base, "estilos", id);
  if (fs.existsSync(path.join(pasta, "estilo.json"))) throw new Error(`já existe um estilo com o id "${id}".`);

  const info = JSON.parse(rodar("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", video]));
  const largura = info.streams?.[0]?.width, altura = info.streams?.[0]?.height, total = Number(info.format?.duration);
  if (!largura || !total) throw new Error("não foi possível ler o vídeo. Ele tem trilha de imagem?");
  inicio = Math.max(0, Math.min(inicio, Math.max(0, total - 1)));
  duracao = Math.min(Math.max(2, duracao), 60, total - inicio);
  const trecho = ["-ss", String(inicio), "-t", String(duracao), "-i", video];
  const quadros = path.join(pasta, "referencia");
  fs.mkdirSync(quadros, { recursive: true });

  log("Extraindo 12 quadros-chave...");
  rodar("ffmpeg", ["-y", "-v", "error", ...trecho, "-vf", `fps=12/${duracao},scale=640:-2`, "-frames:v", "12", "-q:v", "3", path.join(quadros, "quadro-%02d.jpg")]);

  log("Localizando cortes...");
  const deteccao = spawnSync("ffmpeg", ["-v", "info", ...trecho, "-vf", "select='gt(scene,0.35)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const saida = String(deteccao.stderr || "");
  const temposDeCorte = [...saida.matchAll(/pts_time:([\d.]+)/g)].map(m => Number(m[1]));

  log("Extraindo sequência de movimento...");
  const meio = temposDeCorte.length ? Math.max(0, temposDeCorte[0] - 0.3) : duracao / 2;
  rodar("ffmpeg", ["-y", "-v", "error", "-ss", String(inicio + meio), "-t", "0.75", "-i", video, "-vf", "fps=8,scale=640:-2", "-frames:v", "6", "-q:v", "3", path.join(quadros, "movimento-%02d.jpg")]);

  log("Montando a folha de referência...");
  rodar("ffmpeg", ["-y", "-v", "error", ...trecho, "-vf", `fps=12/${duracao},scale=480:-2,tile=4x3:padding=8:margin=8:color=white`, "-frames:v", "1", path.join(pasta, "referencia.png")]);

  log("Medindo cores...");
  const rgb = rodarBin("ffmpeg", ["-v", "error", ...trecho, "-vf", `fps=12/${duracao},scale=64:64`, "-frames:v", "12", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
  const cores = coresDominantes(rgb), { brilho, saturacao } = medidasDeCor(rgb);

  const cortes = temposDeCorte.length;
  const m = {
    duracao, largura, altura, formato: altura > largura ? "vertical" : altura === largura ? "square" : "horizontal",
    cortes, cortesPorMinuto: (cortes / duracao) * 60, planoMedio: duracao / (cortes + 1), brilho, saturacao, cores,
  };
  fs.writeFileSync(path.join(pasta, "metricas.md"), textoMetricas(m) + "\n");
  const sequencia = fs.readdirSync(quadros).filter(f => f.startsWith("movimento-")).length > 1;
  return { pasta, metricas: m, sequenciaMovimento: sequencia, quadros: fs.readdirSync(quadros).sort() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const video = args.find((a, i) => !a.startsWith("--") && !["--id", "--inicio", "--duracao"].includes(args[i - 1]));
    if (!video || !opcao(args, "--id")) throw new Error("uso: node scripts/extrair-estilo.mjs <video> --id meu-estilo [--inicio 0] [--duracao 12]");
    const r = extrairEstilo({ video: path.resolve(video), id: opcao(args, "--id"), inicio: Number(opcao(args, "--inicio") || 0), duracao: Number(opcao(args, "--duracao") || 12) });
    console.log(`\nMaterial do estilo em: ${r.pasta}`);
    console.log(`- referencia.png (folha com 12 quadros)\n- referencia/ (${r.quadros.length} imagens)\n- metricas.md`);
    console.log(`Sequência de movimento: ${r.sequenciaMovimento ? "sim" : "não"}`);
    console.log("\n" + textoMetricas(r.metricas));
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
