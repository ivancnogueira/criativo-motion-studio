// Índice e busca das peças do kit de movimento.
// uso: node scripts/pecas.mjs <termos>          lista as peças e os personagens que combinam (ex.: npm run pecas -- exército)
//      node scripts/pecas.mjs --elenco [termos]   lista o elenco diverso (idades, gêneros, tons de pele), com filtro opcional
//      node scripts/pecas.mjs --categoria <id>  lista as peças de uma categoria
//      node scripts/pecas.mjs --categorias      lista as categorias
//      node scripts/pecas.mjs --gerar           refaz kit/indice.json a partir do código de kit/pecas/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raizPadrao = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** Ordem das categorias no índice e na galeria; as que não estiverem aqui vão para o fim, em ordem alfabética. */
export const ORDEM = ["base", "pessoas", "animais", "natureza", "cidade", "transporte", "tecnologia", "dinheiro", "saude", "comida", "casa", "ciencia", "historia", "esporte", "simbolos", "graficos", "efeitos"];

const fechar = (s, i, abre, fecha) => { let n = 0; for (let j = i; j < s.length; j++) { if (s[j] === abre) n++; else if (s[j] === fecha && --n === 0) return j; } return -1; };
const limpo = s => s.replace(/\s+/g, " ").trim();
function nomesDosParametros(texto) {
  const nomes = []; let n = 0, atual = "";
  for (const ch of texto + ",") {
    if ("([{".includes(ch)) n++; else if (")]}".includes(ch)) n--;
    if (ch === "," && n === 0) { const nome = atual.split(/[=:]/)[0].trim(); if (nome) nomes.push(nome); atual = ""; } else atual += ch;
  }
  return nomes;
}

/** Lê um arquivo de categoria e devolve { id, titulo, pecas: [{ nome, categoria, descricao, chaves, parametros, exemplo }] }. */
export function lerCategoria(arquivo) {
  const fonte = fs.readFileSync(arquivo, "utf8").replace(/\r\n/g, "\n"), id = path.basename(arquivo, ".js");
  const titulo = /^\/\/ Categoria: (.+)$/m.exec(fonte)?.[1].trim() || id, pecas = [];
  const re = /^export function (\w+)\(/gm; let m;
  while ((m = re.exec(fonte))) {
    const nome = m[1], abre = m.index + m[0].length - 1, fim = fechar(fonte, abre, "(", ")"), args = fonte.slice(abre + 1, fim);
    let parametros = "";
    const chave = args.indexOf("{");
    if (chave >= 0) parametros = args.slice(chave + 1, fechar(args, chave, "{", "}"));
    else { const corpo = fonte.slice(fim, fonte.indexOf("\n}", fim)), d = /const \{/.exec(corpo); if (d) { const i = d.index + d[0].length - 1; parametros = corpo.slice(i + 1, fechar(corpo, i, "{", "}")); } }
    parametros = limpo(parametros);
    const antes = fonte.slice(0, m.index).trimEnd(), temComentario = antes.endsWith("*/"), comentario = temComentario ? limpo(antes.slice(antes.lastIndexOf("/**") + 3, -2)) : "";
    const [texto, chaves = ""] = comentario.split(/\s*Chaves:\s*/), descricao = texto.split(/\s*Opções:/)[0].trim();
    const nomes = nomesDosParametros(parametros), usa = ["k", "t"].filter(n => nomes.includes(n));
    pecas.push({ nome, categoria: id, descricao, chaves: chaves.split(",").map(s => s.trim()).filter(Boolean), parametros, exemplo: `p.em({ x, y }, () => K.${nome}(p${usa.length ? `, { ${usa.join(", ")} }` : ""}))` });
  }
  return { id, titulo, pecas };
}

export function listarCategorias(raiz = raizPadrao) {
  const pasta = path.join(raiz, "kit", "pecas");
  const ids = fs.readdirSync(pasta).filter(f => f.endsWith(".js") && !f.startsWith("_")).map(f => f.slice(0, -3));
  const pos = id => ORDEM.includes(id) ? ORDEM.indexOf(id) : ORDEM.length;
  return ids.sort((a, b) => pos(a) - pos(b) || a.localeCompare(b)).map(id => lerCategoria(path.join(pasta, id + ".js")));
}

/** Texto de kit/pecas.js: reexporta todas as categorias e as legendas, na ordem do índice. */
export function textoDoReexportador(raiz = raizPadrao) {
  const ids = listarCategorias(raiz).map(c => c.id), nome = id => "c_" + id.replace(/[^a-z0-9]/gi, "_");
  return `// Kit de movimento — peças prontas. Este arquivo só reúne as categorias de kit/pecas/ e as legendas:
// import * as K from "./kit/pecas.js" dá acesso a tudo (K.personagem, K.tanque, K.legenda...).
// Gerado por \`node scripts/pecas.mjs --gerar\` junto com kit/indice.json. Não edite à mão.
//
// Para achar uma peça: npm run pecas -- <palavra> (busca em kit/indice.json) ou a galeria de npm run kit.
// São referências para não começar do zero: cada vídeo deve ter peças próprias do tema.
${ids.map(id => `export * from "./pecas/${id}.js";`).join("\n")}
export { legenda, legendas, legendasDeExemplo, ESTILOS_DE_LEGENDA, NOMES_DE_LEGENDA, LEGENDA_PADRAO, conferirEstiloDeLegenda } from "./legendas.js";
export { pessoa, escolherElenco, PERSONAGENS, CABELOS, IDADES, FAIXAS, GENEROS } from "./elenco.js";

${ids.map(id => `import * as ${nome(id)} from "./pecas/${id}.js";`).join("\n")}
/** As categorias, na ordem do índice: { id: módulo }. As peças de cada uma estão listadas em kit/indice.json. */
export const CATEGORIAS = { ${ids.map(id => `${id}: ${nome(id)}`).join(", ")} };
`;
}

/** Monta o índice a partir do código. Os registros (elenco, legendas) vêm dos próprios módulos do kit. */
export async function gerarIndice(raiz = raizPadrao) {
  const cats = listarCategorias(raiz), K = await import(pathToFileURL(path.join(raiz, "kit", "pecas.js")).href);
  const chaves = o => Object.keys(o || {});
  return {
    aviso: "Gerado por `node scripts/pecas.mjs --gerar` a partir de kit/pecas/. Não edite à mão.",
    total: cats.reduce((n, c) => n + c.pecas.length, 0),
    categorias: cats.map(c => ({ id: c.id, titulo: c.titulo, total: c.pecas.length })),
    personagens: Object.entries(K.PERSONAGENS || {}).map(([id, x]) => ({ id, nome: x.nome, idade: x.idade, genero: x.genero, pele: x.pele, cabelo: x.cabelo, exemplo: `K.pessoa(p, "${id}", { pose, t })` })),
    elenco: { tipos: chaves(K.TIPOS), penteados: ["curto", "longo", "coque", "careca", ...chaves(K.PENTEADOS)], chapeus: ["quepe", "bone", "palha", "capacete", "gorro", ...chaves(K.CHAPEUS)], rostos: chaves(K.ROSTOS), trajes: chaves(K.TRAJES), costas: chaves(K.COSTAS) },
    legendas: Object.entries(K.ESTILOS_DE_LEGENDA || {}).map(([id, e]) => ({ id, descricao: e.descricao })),
    pecas: cats.flatMap(c => c.pecas),
  };
}
/** Texto do índice: uma peça por linha, para as diferenças ficarem fáceis de ler. */
export function textoDoIndice(ind) {
  const linhas = v => "[\n" + v.map(x => "    " + JSON.stringify(x)).join(",\n") + "\n  ]";
  return `{\n  "aviso": ${JSON.stringify(ind.aviso)},\n  "total": ${ind.total},\n  "categorias": ${linhas(ind.categorias)},\n  "personagens": ${linhas(ind.personagens)},\n  "elenco": ${JSON.stringify(ind.elenco)},\n  "legendas": ${linhas(ind.legendas)},\n  "pecas": ${linhas(ind.pecas)}\n}\n`;
}
export const lerIndice = (raiz = raizPadrao) => JSON.parse(fs.readFileSync(path.join(raiz, "kit", "indice.json"), "utf8"));

const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const raizDaPalavra = s => s.length > 4 ? s.replace(/(oes|aes|ais|eis|es|s)$/, "") : s;
/** Peças que combinam com os termos, da mais próxima para a menos. Ignora acentos, maiúsculas e plural. */
export function buscar(indice, termos) {
  const ts = [].concat(termos).flatMap(t => norm(t).split(/[^a-z0-9]+/)).filter(Boolean).map(raizDaPalavra);
  if (!ts.length) return [];
  const pontuar = (pc, t) => {
    const nome = norm(pc.nome), chaves = pc.chaves.map(norm); let n = 0;
    if (nome === t || raizDaPalavra(nome) === t) n = 10; else if (nome.includes(t)) n = 6;
    if (chaves.some(c => c === t || raizDaPalavra(c) === t)) n = Math.max(n, 8); else if (chaves.some(c => c.split(" ").some(x => x.startsWith(t)))) n = Math.max(n, 5);
    if (!n && norm(pc.categoria).startsWith(t)) n = 3;
    if (!n && norm(pc.descricao).split(/[^a-z0-9]+/).some(x => x.startsWith(t))) n = 2;
    return n;
  };
  return indice.pecas.map(pc => { const ns = ts.map(t => pontuar(pc, t)); return { pc, n: ns.every(Boolean) ? ns.reduce((a, b) => a + b, 0) : 0 }; })
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.pc.nome.localeCompare(b.pc.nome)).map(x => x.pc);
}

const IDADE_TXT = { crianca: "criança infantil menino menina", adolescente: "adolescente jovem garoto garota", adulto: "adulto adulta", idoso: "idoso idosa velho velha senhor senhora terceira idade avô avó" };
const GENERO_TXT = { feminino: "mulher feminino", masculino: "homem masculino", neutro: "neutro não binário não binária" };
/** Personagens do elenco que combinam com os termos (nome, idade, gênero, cabelo). */
export function buscarPersonagens(indice, termos) {
  const ts = [].concat(termos).flatMap(t => norm(t).split(/[^a-z0-9]+/)).filter(Boolean).map(raizDaPalavra);
  return (indice.personagens || []).filter(x => { const alvo = norm([x.id, x.nome, IDADE_TXT[x.idade], GENERO_TXT[x.genero], x.cabelo].join(" ")).split(/[^a-z0-9]+/).map(raizDaPalavra); return ts.length && ts.every(t => alvo.some(a => a.startsWith(t))); });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), arq = path.join(raizPadrao, "kit", "indice.json");
  const mostrar = pc => console.log(`${pc.nome}  [${pc.categoria}]  ${pc.descricao}\n    ${pc.exemplo}    opções: ${pc.parametros || "nenhuma"}`);
  if (args[0] === "--gerar") {
    fs.writeFileSync(path.join(raizPadrao, "kit", "pecas.js"), textoDoReexportador());
    const ind = await gerarIndice(), K = await import(pathToFileURL(path.join(raizPadrao, "kit", "pecas.js")).href);
    const sumidas = ind.pecas.filter(pc => typeof K[pc.nome] !== "function").map(pc => `${pc.nome} (${pc.categoria})`);
    if (sumidas.length) { console.error(`Erro: peças com nome repetido entre categorias não são exportadas por kit/pecas.js: ${sumidas.join(", ")}. Renomeie uma delas.`); process.exit(1); }
    fs.writeFileSync(arq, textoDoIndice(ind));
    console.log(`Índice refeito: kit/indice.json e kit/pecas.js, ${ind.total} peças em ${ind.categorias.length} categorias.`);
  } else if (!fs.existsSync(arq)) { console.error("Erro: kit/indice.json não existe. Rode: node scripts/pecas.mjs --gerar"); process.exit(1); }
  else {
    const ind = lerIndice();
    if (args[0] === "--categorias" || !args.length) {
      for (const c of ind.categorias) console.log(`${c.id.padEnd(12)} ${String(c.total).padStart(3)} peças  ${c.titulo}`);
      console.log(`\n${ind.total} peças. Busque com: npm run pecas -- <palavra>   ·   Veja todas com: npm run kit`);
    } else if (args[0] === "--elenco") {
      const lista = args.length > 1 ? buscarPersonagens(ind, args.slice(1)) : ind.personagens;
      for (const x of lista) console.log(`${x.id.padEnd(20)} ${x.idade.padEnd(12)} ${x.genero.padEnd(10)} ${x.pele}  ${x.nome}`);
      console.log(`\n${lista.length} personagem(ns). Uso: K.pessoa(p, "id", { pose, virado, t }) · veja na aba Personagens de npm run kit`);
    } else if (args[0] === "--categoria") {
      const lista = ind.pecas.filter(pc => pc.categoria === args[1]);
      if (!lista.length) { console.error(`Erro: categoria "${args[1] || ""}" não existe. Opções: ${ind.categorias.map(c => c.id).join(", ")}`); process.exit(1); }
      lista.forEach(mostrar);
    } else {
      const achadas = buscar(ind, args), gente = buscarPersonagens(ind, args);
      if (gente.length) { console.log("Personagens do elenco:"); for (const x of gente.slice(0, 8)) console.log(`  ${x.exemplo}  — ${x.nome}`); if (achadas.length) console.log(""); }
      if (!achadas.length && gente.length) {}
      else if (!achadas.length) console.log(`Nenhuma peça para "${args.join(" ")}". Tente um sinônimo ou veja as categorias: npm run pecas -- --categorias\nSe não houver, desenhe a peça do tema (kit/LEIA-ME.md).`);
      else { achadas.slice(0, 12).forEach(mostrar); if (achadas.length > 12) console.log(`... e mais ${achadas.length - 12}. Refine a busca.`); }
    }
  }
}
