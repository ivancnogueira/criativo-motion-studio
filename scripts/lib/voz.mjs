// Provedores de voz. Todos têm a mesma forma: (texto, env, fetchFn) → Buffer com o MP3.
import { exigir, falhaDeApi } from "./ambiente.mjs";

async function elevenlabs(texto, env, fetchFn) {
  const voz = exigir(env, "ELEVENLABS_VOICE_ID");
  const r = await fetchFn(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voz)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": exigir(env, "ELEVENLABS_API_KEY"), "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: texto, model_id: env.ELEVENLABS_MODEL || "eleven_multilingual_v2" }),
  });
  if (!r.ok) throw await falhaDeApi("ElevenLabs", r);
  return Buffer.from(await r.arrayBuffer());
}

async function fishaudio(texto, env, fetchFn) {
  const r = await fetchFn("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { authorization: `Bearer ${exigir(env, "FISH_AUDIO_API_KEY")}`, "content-type": "application/json", model: env.FISH_AUDIO_MODEL || "s2.1-pro" },
    body: JSON.stringify({ text: texto, reference_id: exigir(env, "FISH_AUDIO_VOICE_ID"), format: "mp3", mp3_bitrate: 128, language: "pt-BR" }),
  });
  if (!r.ok) throw await falhaDeApi("Fish Audio", r);
  return Buffer.from(await r.arrayBuffer());
}

async function minimax(texto, env, fetchFn) {
  const r = await fetchFn("https://api.minimax.io/v1/t2a_v2", {
    method: "POST",
    headers: { authorization: `Bearer ${exigir(env, "MINIMAX_API_KEY")}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: env.MINIMAX_MODEL || "speech-2.8-hd", text: texto, stream: false, output_format: "hex", language_boost: "Portuguese",
      voice_setting: { voice_id: exigir(env, "MINIMAX_VOICE_ID"), speed: 1, vol: 1, pitch: 0 },
      audio_setting: { sample_rate: 32000, bitrate: 128000, format: "mp3", channel: 1 },
    }),
  });
  if (!r.ok) throw await falhaDeApi("MiniMax", r);
  const dados = await r.json();
  if (dados.base_resp && dados.base_resp.status_code !== 0) throw new Error(`MiniMax recusou o pedido (${dados.base_resp.status_code}): ${String(dados.base_resp.status_msg || "").slice(0, 200)}`);
  if (!dados.data?.audio) throw new Error("MiniMax não devolveu áudio.");
  return Buffer.from(dados.data.audio, "hex");
}

export const GERADORES = { elevenlabs, fishaudio, minimax };

// Limpa o roteiro para leitura em voz alta: tira marcações e espaços sobrando.
export function textoParaFala(texto) {
  return String(texto || "")
    .replace(/^#+\s.*$/gm, "")
    .replace(/[*_`>]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function gerarNarracao({ texto, provedor, env, fetchFn = fetch }) {
  const limpo = textoParaFala(texto);
  if (!limpo) throw new Error("roteiro vazio: não há texto para narrar.");
  if (limpo.length > 5000) throw new Error(`roteiro com ${limpo.length} caracteres: o limite por geração é 5000. Divida o texto.`);
  const gerar = GERADORES[provedor];
  if (!gerar) throw new Error(`provedor de voz desconhecido: ${provedor}`);
  const audio = await gerar(limpo, env, fetchFn);
  if (audio.length < 1000) throw new Error("o provedor devolveu um áudio vazio ou inválido.");
  return { audio, caracteres: limpo.length };
}
