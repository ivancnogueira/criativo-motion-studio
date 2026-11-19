// Abre a galeria do kit de movimento no servidor unificado (ou em modo isolado para compatibilidade).
// uso: node scripts/kit.mjs [--porta 4173]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { criarPainel } from "./painel.mjs";

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8" };

export function criarServidorDoKit(base = raiz) {
  const pasta = path.join(base, "kit");
  return http.createServer((q, s) => {
    const rota = decodeURIComponent((q.url || "/").split("?")[0]);
    const alvo = path.normalize(path.join(pasta, rota === "/" ? "demo.html" : rota));
    const ok = alvo.startsWith(pasta + path.sep) && TIPOS[path.extname(alvo)] && fs.existsSync(alvo) && fs.statSync(alvo).isFile();
    if (!ok || q.method !== "GET") { s.writeHead(404); return s.end(); }
    s.writeHead(200, { "content-type": TIPOS[path.extname(alvo)], "cache-control": "no-store" });
    fs.createReadStream(alvo).pipe(s);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const porta = +opcao(process.argv.slice(2), "--porta") || 4173;
  const servidor = criarPainel();
  servidor.on("error", e => {
    if (e.code === "EADDRINUSE") {
      console.log(`Servidor unificado já está ativo! Acesse a galeria em: http://127.0.0.1:${porta}/galeria`);
      process.exit(0);
    }
    console.error("Erro: " + e.message);
    process.exit(1);
  });
  servidor.listen(porta, "127.0.0.1", () => {
    console.log(`Estúdio unificado (${lerProduto().nome}) — Galeria: http://127.0.0.1:${porta}/galeria  (Ctrl+C para encerrar)`);
  });
}
