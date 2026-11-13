// Atualiza a vitrine de estilos (vitrine/index.html) com os estilos instalados, nativos e personalizados.
// uso: node scripts/vitrine.mjs [--servir]   (--servir abre um endereço local, útil se o navegador bloquear arquivos locais)
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { raiz, lerProduto } from "./lib/ambiente.mjs";

export function gerarVitrine(base = raiz, { gravar = true } = {}) {
  const produto = lerProduto(base);
  const indice = JSON.parse(fs.readFileSync(path.join(base, "estilos", "indice.json"), "utf8"));
  const pasta = path.join(base, "estilos");
  const estilos = fs.readdirSync(pasta, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(pasta, d.name, "estilo.json")))
    .map(d => {
      const e = JSON.parse(fs.readFileSync(path.join(pasta, d.name, "estilo.json"), "utf8"));
      const ref = ["png", "jpg", "jpeg", "webp"].map(x => `referencia.${x}`).find(f => fs.existsSync(path.join(pasta, d.name, f)));
      return {
        id: d.name, nome: e.nome, subtitulo: e.subtitulo || "", resumo: e.resumo || "", aparencia: e.aparencia || "",
        melhorPara: e.melhorPara || "", bomSaber: e.bomSaber || "", personalizado: !!e.personalizado,
        previa: indice.estilos.indexOf(d.name), // posição da cena animada nativa; -1 quando não há
        imagem: e.personalizado && ref ? `../estilos/${d.name}/${ref}` : "",
      };
    })
    .sort((a, b) => (a.previa < 0) - (b.previa < 0) || a.previa - b.previa || a.nome.localeCompare(b.nome));
  const dados = { produto: produto.nome, prefixo: produto.prefixo, estilos };
  if (gravar) fs.writeFileSync(path.join(base, "vitrine", "estilos.js"), `window.VITRINE = ${JSON.stringify(dados, null, 2)};\n`);
  return { arquivo: path.join(base, "vitrine", "index.html"), estilos };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = gerarVitrine();
  console.log(`Vitrine atualizada com ${r.estilos.length} estilos (${r.estilos.filter(e => e.personalizado).length} personalizados).`);
  if (!process.argv.includes("--servir")) console.log(`Abra no navegador: ${pathToFileURL(r.arquivo).href}`);
  else {
    const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
    const permitidas = [path.join(raiz, "vitrine"), path.join(raiz, "estilos")];
    http.createServer((q, s) => {
      const alvo = path.normalize(path.join(raiz, decodeURIComponent(q.url.split("?")[0])));
      const ok = permitidas.some(p => alvo.startsWith(p + path.sep)) && tipos[path.extname(alvo).toLowerCase()] && fs.existsSync(alvo) && fs.statSync(alvo).isFile();
      if (!ok) { s.writeHead(404); return s.end(); }
      s.writeHead(200, { "content-type": tipos[path.extname(alvo).toLowerCase()] });
      fs.createReadStream(alvo).pipe(s);
    }).listen(4173, "127.0.0.1", () => console.log("Abra no navegador: http://localhost:4173/vitrine/index.html  (Ctrl+C para encerrar)"));
  }
}
