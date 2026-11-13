// Gera uma cópia limpa do produto em outra pasta: para distribuir, ou para instalar e testar sem tocar no produto.
// uso: node scripts/empacotar.mjs <pasta-de-destino>          copia limpa em uma pasta nova
//      node scripts/empacotar.mjs <pasta-de-saida> --zip      gera <pasta-de-saida>/criativo-motion-studio-<versao>.zip
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto } from "./lib/ambiente.mjs";
import { verificarProduto, listarArquivos, pertenceAoProduto } from "./verificar-produto.mjs";

function foraDoProduto(alvo, base) {
  const rel = path.relative(base, alvo);
  if (!rel || (!rel.startsWith("..") && !path.isAbsolute(rel))) throw new Error("o destino precisa ficar fora da pasta do produto.");
}

export function empacotar(destino, base = raiz) {
  const alvo = path.resolve(destino);
  foraDoProduto(alvo, base);
  if (fs.existsSync(alvo) && fs.readdirSync(alvo).length) throw new Error(`o destino já existe e não está vazio: ${alvo}`);
  // Arquivos de instância e de desenvolvimento ficam de fora da cópia; dado real dentro de arquivo do produto impede o pacote.
  const reais = verificarProduto(base).problemas.filter(p => pertenceAoProduto(p.arquivo.replace(/:\d+$/, "")));
  if (reais.length) throw new Error("o produto tem dados reais; corrija antes de empacotar:\n" + reais.map(p => `- ${p.arquivo} — ${p.motivo}`).join("\n"));
  const arquivos = listarArquivos(base).filter(pertenceAoProduto);
  for (const a of arquivos) {
    fs.mkdirSync(path.dirname(path.join(alvo, a)), { recursive: true });
    fs.copyFileSync(path.join(base, a), path.join(alvo, a));
  }
  return { destino: alvo, arquivos: arquivos.length };
}

// Compacta uma pasta em .zip com um único diretório na raiz do arquivo (extrair gera uma pasta só).
function compactar(pastaPai, nomePasta, zip) {
  const tentativas = [];
  // No Windows, usa o tar do sistema (bsdtar), que grava caminhos com "/" e abre em qualquer sistema. O PATH pode ter outro tar.
  if (process.platform === "win32") tentativas.push([path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-a", "-c", "-f", zip, "-C", pastaPai, nomePasta]]);
  else tentativas.push(["tar", ["-a", "-c", "-f", zip, "-C", pastaPai, nomePasta]]);
  tentativas.push(["zip", ["-r", "-q", zip, nomePasta]]);
  for (const [cmd, args] of tentativas) {
    fs.rmSync(zip, { force: true });
    const r = spawnSync(cmd, args, { cwd: pastaPai, encoding: "utf8" });
    if (r.status === 0 && fs.existsSync(zip)) {
      const cab = Buffer.alloc(2); const fd = fs.openSync(zip, "r"); fs.readSync(fd, cab, 0, 2, 0); fs.closeSync(fd);
      if (cab.toString("latin1") === "PK") return;
    }
  }
  throw new Error("não consegui gerar o .zip: instale o tar (Windows 10 ou superior já tem) ou o comando zip.");
}

export function empacotarZip(saida, base = raiz) {
  const pasta = path.resolve(saida);
  foraDoProduto(pasta, base);
  const nomePasta = "criativo-motion-studio";
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "motion-zip-"));
  try {
    const r = empacotar(path.join(temp, nomePasta), base);
    fs.mkdirSync(pasta, { recursive: true });
    const zip = path.join(pasta, `${nomePasta}-${lerProduto(base).versao}.zip`);
    compactar(temp, nomePasta, zip);
    return { zip, arquivos: r.arquivos, bytes: fs.statSync(zip).size };
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), zip = args.includes("--zip"), destino = args.find(a => !a.startsWith("--"));
    if (!destino) throw new Error("informe a pasta de destino: node scripts/empacotar.mjs <pasta-de-destino> [--zip]");
    if (zip) {
      const r = empacotarZip(destino);
      console.log(`ZIP criado: ${r.zip} (${r.arquivos} arquivos, ${(r.bytes / 1024 / 1024).toFixed(1)} MB)`);
    } else {
      const r = empacotar(destino);
      console.log(`Cópia limpa criada: ${r.destino} (${r.arquivos} arquivos)`);
    }
  } catch (e) {
    console.error("Erro: " + e.message);
    process.exit(1);
  }
}
