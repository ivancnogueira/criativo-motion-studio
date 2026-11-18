// Confere se o MP4 exportado atende à especificação de projeto.json (assinatura, resolução, duração, áudio e tamanho).
// Também pode anexar entrada/narracao.mp3 ao vídeo com --juntar-audio quando a exportação do navegador sair sem voz.
// uso: node scripts/conferir-video.mjs saida/<nome>/video.mp4 [--projeto projeto.json] [--juntar-audio]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { raiz, opcao } from "./lib/ambiente.mjs";
import { assinatura } from "./painel.mjs";
import { temFfmpeg } from "./extrair-estilo.mjs";

const LIMITE_MB = 95 * 1024 * 1024;
const rodar = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 });

/** Avalia os metadados extraídos pelo ffprobe contra a configuração de projeto.json. */
export function avaliarMetadadosVideo(info, projeto = {}, { duracaoEsperada = null, tamanhoBytes = null, toleranciaSeg = 0.6 } = {}) {
  const problemas = [];
  const streams = Array.isArray(info?.streams) ? info.streams : [];
  const video = streams.find(s => s.codec_type === "video");
  const audio = streams.find(s => s.codec_type === "audio");
  if (!video) {
    problemas.push("não há trilha de vídeo no arquivo.");
    return { ok: false, problemas, resumo: null };
  }
  const largura = Number(video.width) || 0, altura = Number(video.height) || 0;
  const espLargura = projeto.vertical ? 1080 : 1920, espAltura = projeto.vertical ? 1920 : 1080;
  if (largura !== espLargura || altura !== espAltura) {
    problemas.push(`resolução ${largura}×${altura} difere da configurada (${espLargura}×${espAltura}).`);
  }
  const duracao = Number(info?.format?.duration ?? video.duration) || 0;
  const alvoDur = duracaoEsperada ?? (projeto.narracao ? null : Number(projeto.duracaoSegundos) || null);
  if (alvoDur && Math.abs(duracao - alvoDur) > toleranciaSeg) {
    problemas.push(`duração de ${duracao.toFixed(1)} s difere da esperada (${Number(alvoDur).toFixed(1)} s).`);
  }
  const exigeAudio = Boolean(projeto.narracao || projeto.musica || projeto.efeitos);
  if (exigeAudio && !audio) {
    problemas.push("falta trilha de áudio (o projeto tem narração, música ou efeitos ativados).");
  }
  const bytes = tamanhoBytes ?? (Number(info?.format?.size) || 0);
  if (bytes > 0 && bytes < 10_000) problemas.push("o arquivo de vídeo está pequeno demais ou truncado.");
  if (bytes > LIMITE_MB) problemas.push(`o arquivo tem ${(bytes / 1048576).toFixed(1)} MB; o limite para publicar é 95 MB.`);

  return {
    ok: problemas.length === 0,
    problemas,
    resumo: {
      largura, altura, duracao,
      codecVideo: video.codec_name || "desconhecido",
      temAudio: Boolean(audio),
      codecAudio: audio?.codec_name || null,
      megabytes: +(bytes / 1048576).toFixed(2),
    },
  };
}

export function lerInfoFfprobe(arquivo) {
  const txt = rodar("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,duration,r_frame_rate:format=duration,size", "-of", "json", arquivo]);
  return JSON.parse(txt);
}

export function juntarAudioNoVideo(video, audio, destino = video) {
  if (!temFfmpeg()) throw new Error("FFmpeg não encontrado para juntar o áudio.");
  if (!fs.existsSync(video)) throw new Error(`vídeo não encontrado: ${video}`);
  if (!fs.existsSync(audio)) throw new Error(`áudio não encontrado: ${audio}`);
  const tmp = `${destino}.mux-${process.pid}.mp4`;
  try {
    rodar("ffmpeg", ["-y", "-v", "error", "-i", video, "-i", audio, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-map", "0:v:0", "-map", "1:a:0", "-shortest", "-movflags", "+faststart", tmp]);
    fs.renameSync(tmp, destino);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

export function conferirVideo(video, { base = raiz, projeto = null, duracaoEsperada = null } = {}) {
  if (!video || !fs.existsSync(video)) throw new Error(`vídeo não encontrado: ${video}`);
  const tamanhoBytes = fs.statSync(video).size;
  if (tamanhoBytes < 10_000) return { ok: false, problemas: ["o arquivo de vídeo está vazio ou corrompido."], resumo: null };
  const cabeca = Buffer.alloc(16);
  const fd = fs.openSync(video, "r");
  try { fs.readSync(fd, cabeca, 0, 16, 0); } finally { fs.closeSync(fd); }
  const tipo = assinatura(cabeca);
  if (tipo !== "mp4") {
    return { ok: false, problemas: [`o conteúdo do arquivo não é um container MP4 válido${tipo ? ` (detectado: ${tipo})` : ""}.`], resumo: null };
  }
  const proj = projeto ?? (fs.existsSync(path.join(base, "projeto.json")) ? JSON.parse(fs.readFileSync(path.join(base, "projeto.json"), "utf8")) : {});
  if (!temFfmpeg()) {
    const problemas = tamanhoBytes > LIMITE_MB ? [`o arquivo tem ${(tamanhoBytes / 1048576).toFixed(1)} MB; o limite é 95 MB.`] : [];
    return { ok: problemas.length === 0, semFfprobe: true, problemas, resumo: { megabytes: +(tamanhoBytes / 1048576).toFixed(2) } };
  }
  let durEsp = duracaoEsperada;
  if (durEsp == null && proj.narracao) {
    const arqLeg = path.join(base, "saida", "legendas", "legendas.json");
    const arqAudio = path.join(base, "entrada", "narracao.mp3");
    if (fs.existsSync(arqAudio)) {
      try { durEsp = Number(lerInfoFfprobe(arqAudio)?.format?.duration) || null; } catch {}
    }
    if (durEsp == null && fs.existsSync(arqLeg)) {
      try { durEsp = Number(JSON.parse(fs.readFileSync(arqLeg, "utf8")).duracao) || null; } catch {}
    }
  }
  const info = lerInfoFfprobe(video);
  return avaliarMetadadosVideo(info, proj, { duracaoEsperada: durEsp, tamanhoBytes });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const video = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--projeto");
    if (!video) throw new Error("uso: node scripts/conferir-video.mjs saida/<nome>/video.mp4 [--projeto projeto.json] [--juntar-audio]");
    const caminhoVideo = path.resolve(video);
    const arqProjeto = opcao(args, "--projeto") ? path.resolve(opcao(args, "--projeto")) : path.join(raiz, "projeto.json");
    const projeto = fs.existsSync(arqProjeto) ? JSON.parse(fs.readFileSync(arqProjeto, "utf8")) : {};
    if (args.includes("--juntar-audio")) {
      const audio = path.join(raiz, "entrada", "narracao.mp3");
      juntarAudioNoVideo(caminhoVideo, audio);
      console.log("Áudio de entrada/narracao.mp3 incorporado ao MP4.");
    }
    const r = conferirVideo(caminhoVideo, { projeto });
    if (r.resumo && !r.semFfprobe) {
      console.log(`Vídeo: ${r.resumo.largura}×${r.resumo.altura} (${r.resumo.codecVideo}), ${r.resumo.duracao.toFixed(1)} s, áudio: ${r.resumo.temAudio ? r.resumo.codecAudio : "ausente"}, ${r.resumo.megabytes} MB`);
    } else if (r.semFfprobe) {
      console.log(`Assinatura MP4 válida (${r.resumo.megabytes} MB). Instale o FFmpeg para conferir resolução, duração e áudio.`);
    }
    if (r.ok) {
      console.log("Conferência técnica aprovada.");
      process.exit(0);
    }
    console.error("Problemas encontrados no vídeo:\n" + r.problemas.map(p => "- " + p).join("\n"));
    process.exit(2);
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
