// Publica um vídeo como Reels no Instagram do usuário.
// uso: node scripts/publicar-reels.mjs --video saida/x/video.mp4 --legenda saida/x/legenda.txt [--capa capa.jpg] [--confirmar]
// Sem --confirmar é só uma conferência: nada é enviado nem publicado.
import fs from "node:fs";
import path from "node:path";
import { raiz, lerEnv, opcao } from "./lib/ambiente.mjs";
import { conferirPublicacao, hospedarNoGithub, publicarReels, normalizarLegenda } from "./lib/publicacao.mjs";

try {
  const args = process.argv.slice(2);
  const video = opcao(args, "--video") && path.resolve(opcao(args, "--video"));
  const arqLegenda = opcao(args, "--legenda") && path.resolve(opcao(args, "--legenda"));
  const capa = opcao(args, "--capa") && path.resolve(opcao(args, "--capa"));
  if (!video || !arqLegenda) throw new Error("informe --video e --legenda.");
  const legenda = fs.existsSync(arqLegenda) ? fs.readFileSync(arqLegenda, "utf8") : "";
  const env = lerEnv();

  const problemas = conferirPublicacao({ video, legenda, capa, env });
  if (problemas.length) { console.error("Não é possível publicar:\n" + problemas.map(p => "- " + p).join("\n")); process.exit(1); }

  const texto = normalizarLegenda(legenda);
  console.log("Destino: Instagram Reels");
  console.log(`Vídeo: ${video} (${(fs.statSync(video).size / 1048576).toFixed(1)} MB)`);
  console.log(`Capa: ${capa || "automática"}`);
  console.log(`Legenda (${texto.length} caracteres):\n${texto}\n`);

  if (!args.includes("--confirmar")) {
    console.log("CONFERÊNCIA: nada foi enviado. O vídeo ficará público no repositório de hospedagem e no Instagram.");
    console.log("Para publicar de verdade, repita o comando com --confirmar.");
    process.exit(0);
  }

  const carimbo = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  console.log("Enviando o vídeo para a hospedagem pública...");
  const videoUrl = await hospedarNoGithub({ arquivo: video, destino: `videos/${carimbo}.mp4`, env });
  const capaUrl = capa ? await hospedarNoGithub({ arquivo: capa, destino: `videos/${carimbo}${path.extname(capa).toLowerCase()}`, env }) : undefined;

  const r = await publicarReels({ videoUrl, capaUrl, legenda, env });
  fs.mkdirSync(path.join(raiz, "runtime"), { recursive: true });
  fs.appendFileSync(path.join(raiz, "runtime", "publicacoes.jsonl"), JSON.stringify({ em: new Date().toISOString(), rede: "instagram", video, videoUrl, ...r }) + "\n");
  console.log(`Publicado: ${r.permalink || r.mediaId}`);
} catch (e) {
  console.error("Erro: " + e.message);
  process.exit(1);
}
