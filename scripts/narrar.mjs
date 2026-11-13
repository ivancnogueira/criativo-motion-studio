// Gera a narração por API e salva em entrada/narracao.mp3.
// uso: node scripts/narrar.mjs [--texto arquivo.txt] [--provedor elevenlabs|fishaudio|minimax] [--saida entrada/narracao.mp3] [--simular]
// Sem --texto, usa o campo "roteiro" de projeto.json. --simular mostra o que seria feito, sem gastar créditos.
import fs from "node:fs";
import path from "node:path";
import { raiz, lerEnv, modoNarracao, opcao, PROVEDORES_DE_VOZ } from "./lib/ambiente.mjs";
import { gerarNarracao, textoParaFala } from "./lib/voz.mjs";

try {
  const args = process.argv.slice(2);
  const env = lerEnv();
  const estado = modoNarracao(env);
  const pedido = opcao(args, "--provedor");
  if (pedido && !PROVEDORES_DE_VOZ[pedido]) throw new Error(`provedor desconhecido: ${pedido}`);
  if (pedido && !estado.prontos.includes(pedido)) throw new Error(`${PROVEDORES_DE_VOZ[pedido].nome} não está configurado por completo no .env.`);
  const provedor = pedido || estado.provedor;
  if (!provedor) {
    console.log("MODO MANUAL: nenhum provedor de voz configurado no .env.");
    console.log("Gere o áudio na plataforma de sua preferência e salve como entrada/narracao.mp3.");
    process.exit(2);
  }

  const arquivoTexto = opcao(args, "--texto");
  const texto = arquivoTexto
    ? fs.readFileSync(path.resolve(arquivoTexto), "utf8")
    : JSON.parse(fs.readFileSync(path.join(raiz, "projeto.json"), "utf8")).roteiro;
  const limpo = textoParaFala(texto);
  const saida = path.resolve(opcao(args, "--saida") || path.join(raiz, "entrada", "narracao.mp3"));

  console.log(`Provedor: ${PROVEDORES_DE_VOZ[provedor].nome}`);
  console.log(`Texto: ${limpo.length} caracteres, cerca de ${limpo.split(/\s+/).filter(Boolean).length} palavras`);
  if (args.includes("--simular")) { console.log(`Simulação: nada foi gerado. Destino seria ${saida}`); process.exit(0); }

  const { audio } = await gerarNarracao({ texto, provedor, env });
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, audio);
  console.log(`Narração salva: ${saida} (${(audio.length / 1024).toFixed(0)} KB)`);
} catch (e) {
  console.error("Erro: " + e.message);
  process.exit(1);
}
