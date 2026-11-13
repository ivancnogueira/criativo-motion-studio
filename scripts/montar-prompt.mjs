// Monta o prompt final a partir de projeto.json + estilos/<id>/prompt.md.
// uso: node scripts/montar-prompt.mjs [projeto.json] [saida/prompt.md]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ler = p => fs.readFileSync(path.join(raiz, p), "utf8");

function textoDuracao(n) {
  const m = Math.floor(n / 60), s = n % 60;
  if (!m) return `${s} seconds`;
  const partes = `${m} minute${m > 1 ? "s" : ""}` + (s ? ` ${s} second${s > 1 ? "s" : ""}` : "");
  return `${partes} (${n} seconds)`;
}

const HEX = /^#[0-9a-f]{6}$/i;

function aplicarCores(modelo, c, origem) {
  for (const k of ["dominante", "destaque", "apoio"])
    if (!HEX.test(c?.[k] || "")) throw new Error(`${origem}: cores.${k} deve ser um hex como #2563EB`);
  const mapa = { C1: c.dominante, C2: c.destaque, C3: c.apoio };
  return modelo.replace(/{{(C[123])}}/g, (x, k) => mapa[k].toUpperCase());
}

function blocoPaleta(p) {
  if (p.paleta === "marca") {
    const marca = p.marca ?? (fs.existsSync(path.join(raiz, "marca.json")) ? JSON.parse(ler("marca.json")) : null);
    if (!marca) throw new Error("paleta da marca: falta o arquivo marca.json. Copie marca.exemplo.json para marca.json e preencha o nome e as cores.");
    if (!String(marca.nome || "").trim()) throw new Error("paleta da marca: preencha o nome em marca.json.");
    return aplicarCores(ler("blocos/paleta-marca.md"), marca.cores, "marca.json").replace("{{MARCA_NOME}}", () => String(marca.nome).trim().replace(/[{}]/g, ""));
  }
  if (p.paleta === "personalizada") return aplicarCores(ler("blocos/paleta-personalizada.md"), p.cores, "paleta personalizada");
  return "";
}

function listarEstilos() {
  return fs.readdirSync(path.join(raiz, "estilos"), { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(raiz, "estilos", d.name, "estilo.json")))
    .map(d => d.name).sort();
}

// texto vindo de um estilo não pode criar marcadores {{...}} novos
const semMarcadores = s => String(s || "").replace(/\{\{/g, "{ {").replace(/\}\}/g, "} }");
const secao = (texto, nome, ligado) => texto
  .replace(new RegExp(`\\{\\{#${nome}\\}\\}([\\s\\S]*?)\\{\\{/${nome}\\}\\}`, "g"), (m, x) => ligado ? x : "")
  .replace(new RegExp(`\\{\\{\\^${nome}\\}\\}([\\s\\S]*?)\\{\\{/${nome}\\}\\}`, "g"), (m, x) => ligado ? "" : x);

export function acharReferencia(id) {
  return ["png", "jpg", "jpeg", "webp"].map(e => `estilos/${id}/referencia.${e}`).find(f => fs.existsSync(path.join(raiz, f)));
}

// Estilo criado a partir de um vídeo de referência: bloco de fidelidade + modelo genérico preenchido.
function modeloPersonalizado(id, e, p) {
  const opcional = f => fs.existsSync(path.join(raiz, f)) ? ler(f).trim() : "";
  const direcao = e.direcao ?? opcional(`estilos/${id}/direcao.md`);
  const metricas = e.metricas ?? opcional(`estilos/${id}/metricas.md`);
  if (!direcao) throw new Error(`estilo "${id}": falta estilos/${id}/direcao.md`);
  if (!e.rotulo && !e.nome) throw new Error(`estilo "${id}": estilo.json precisa de "nome" ou "rotulo"`);
  let fid = ler("estilos/_personalizado/fidelidade.md").replace("{{STYLE_NAME}}", () => semMarcadores(e.nome));
  fid = secao(fid, "SEQUENCIA", !!e.sequenciaMovimento);
  fid = secao(fid, "TESTE", p.testeDeEstilo !== false);
  const corpo = ler("estilos/_personalizado/prompt.md")
    .replace("{{STYLE_SUMMARY}}", () => semMarcadores(e.resumoPrompt))
    .replace("{{STYLE_METRICS}}", () => semMarcadores(metricas))
    .replace("{{STYLE_DIRECTION}}", () => semMarcadores(direcao));
  return fid + corpo;
}

export function montarPrompt(p, estiloEmMemoria) {
  const id = String(p.estilo || "");
  let e = estiloEmMemoria;
  if (!e) {
    const estilos = listarEstilos();
    if (!/^[a-z0-9-]+$/.test(id) || !estilos.includes(id)) throw new Error(`estilo "${id}" não existe. Opções: ${estilos.join(", ")}`);
    e = JSON.parse(ler(`estilos/${id}/estilo.json`));
    if (e.personalizado && !acharReferencia(id)) throw new Error(`estilo "${id}": falta a folha de referência em estilos/${id}/referencia.png`);
  }
  const tema = String(p.tema || "").trim();
  if (!tema) throw new Error("projeto sem tema");
  const narracao = !!p.narracao;
  const roteiro = String(p.roteiro || "").trim().replace(/\s+/g, " ").replace(/"/g, "'");
  const seg = Math.round(+p.duracaoSegundos || 0);
  if (!narracao && seg <= 0) throw new Error("duracaoSegundos deve ser maior que zero (ou ligue a narração)");
  const mapa = {
    TOPIC: tema,
    STORYBOARD: p.storyboard ? "Enabled" : "Disabled",
    VOICEOVER: narracao ? "Enabled — attached MP3" : "Disabled",
    TRANSCRIPT: narracao && roteiro ? `"${roteiro}"` : '""',
    SUBTITLES: narracao && p.legendas ? "Generate SRT, with optional on-screen display" : "Disabled",
    DURATION: narracao ? "Not used — the runtime follows the attached voiceover's actual decoded length" : textoDuracao(seg),
    FORMAT: p.vertical ? "Vertical, 9:16" : "Horizontal, 16:9",
    RESOLUTION: p.vertical ? "1080 × 1920" : "1920 × 1080",
    SFX: p.efeitos ? "Enabled" : "Disabled",
    MUSIC: p.musica ? "Enabled" : "Disabled",
  };
  if (e.personalizado) mapa.STYLE_LABEL = e.rotulo || e.nome;
  const modelo = e.personalizado ? modeloPersonalizado(id, e, p) : ler(`estilos/${id}/prompt.md`);
  return ler("blocos/idioma.md") + blocoPaleta(p) + modelo.replace(/\{\{(\w+)\}\}/g, (m, k) => mapa[k] ?? m);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entrada = path.resolve(process.argv[2] || path.join(raiz, "projeto.json"));
  if (!fs.existsSync(entrada)) { console.error("Erro: projeto.json não existe. Rode npm run instalar, ou copie projeto.exemplo.json para projeto.json."); process.exit(1); }
  const saida = path.resolve(process.argv[3] || path.join(raiz, "saida", "prompt.md"));
  try {
    const prompt = montarPrompt(JSON.parse(fs.readFileSync(entrada, "utf8")));
    fs.mkdirSync(path.dirname(saida), { recursive: true });
    fs.writeFileSync(saida, prompt);
    console.log(`Prompt montado: ${path.relative(process.cwd(), saida)} (${prompt.length} caracteres)`);
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
