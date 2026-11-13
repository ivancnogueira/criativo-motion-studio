// Atualiza o produto instalado sem tocar nos dados do cliente.
// uso:
//   node scripts/atualizar.mjs                      clone: git pull (só avança, nunca sobrescreve alteração local)
//   node scripts/atualizar.mjs --zip <arquivo.zip>  ZIP novo baixado pelo cliente
//   node scripts/atualizar.mjs --pasta <pasta>      pacote já extraído
//   node scripts/atualizar.mjs --url <https://...>  ZIP em um endereço direto
//   opções: --simular (só mostra o que mudaria), --forcar (aceita versão igual ou mais antiga), --sem-instalar
//
// Só arquivos do produto (a lista de scripts/verificar-produto.mjs) são trocados. Tudo o mais é dado do cliente
// e nunca é lido nem alterado: .env, marca.json, projeto.json, entrada/, saida/, runtime/, render/ e os estilos criados.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { raiz, lerProduto, opcao } from "./lib/ambiente.mjs";
import { listarArquivos, pertenceAoProduto } from "./verificar-produto.mjs";

export const DADOS_DO_CLIENTE = ".env, marca.json, projeto.json, entrada/, saida/, runtime/, render/ e os estilos que você criou";

const versaoNum = v => String(v || "0").split(".").map(n => parseInt(n, 10) || 0);
export function compararVersoes(a, b) {
  const x = versaoNum(a), y = versaoNum(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0) ? -1 : 1;
  return 0;
}

// Acha a pasta do pacote: a própria pasta, ou a única subpasta que contém produto.json.
export function localizarRaiz(dir) {
  if (fs.existsSync(path.join(dir, "produto.json"))) return dir;
  const sub = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "produto.json")));
  if (sub.length === 1) return path.join(dir, sub[0].name);
  throw new Error("esse arquivo não parece um pacote do produto (não achei produto.json).");
}

const mesmoConteudo = (a, b) => { const x = fs.readFileSync(a), y = fs.readFileSync(b); return x.length === y.length && x.equals(y); };

// Compara o pacote novo com a instalação, olhando só os arquivos que pertencem ao produto.
export function planejar(origem, base = raiz, { forcar = false } = {}) {
  const novo = lerProduto(origem), atual = lerProduto(base);
  if (novo.nome !== atual.nome) throw new Error(`o pacote é de outro produto ("${novo.nome}"), não de "${atual.nome}".`);
  if (!forcar && compararVersoes(novo.versao, atual.versao) <= 0)
    throw new Error(compararVersoes(novo.versao, atual.versao) === 0 ? `você já está na versão ${atual.versao}.` : `o pacote (${novo.versao}) é mais antigo que o instalado (${atual.versao}). Use --forcar se for de propósito.`);
  const doPacote = listarArquivos(origem).filter(pertenceAoProduto);
  const noPacote = new Set(doPacote);
  const novos = [], alterados = [];
  let iguais = 0;
  for (const a of doPacote) {
    const dst = path.join(base, a);
    if (!fs.existsSync(dst)) novos.push(a);
    else if (!mesmoConteudo(path.join(origem, a), dst)) alterados.push(a);
    else iguais++;
  }
  const obsoletos = listarArquivos(base).filter(pertenceAoProduto).filter(a => !noPacote.has(a));
  return { de: atual.versao, para: novo.versao, origem, novos, alterados, iguais, obsoletos };
}

export function aplicar(plano, base = raiz) {
  for (const a of [...plano.novos, ...plano.alterados]) {
    if (!pertenceAoProduto(a)) throw new Error(`recusado: ${a} não é arquivo do produto.`); // dupla trava
    fs.mkdirSync(path.dirname(path.join(base, a)), { recursive: true });
    fs.copyFileSync(path.join(plano.origem, a), path.join(base, a));
  }
  return plano.novos.length + plano.alterados.length;
}

// Nomes (nunca valores) de variáveis novas do .env.example que ainda não estão no .env do cliente.
export function chavesNovasDoEnv(base = raiz) {
  const nomes = arq => { try { return fs.readFileSync(path.join(base, arq), "utf8").split(/\r?\n/).map(l => /^\s*([A-Z][A-Z0-9_]*)\s*=/.exec(l)?.[1]).filter(Boolean); } catch { return null; } };
  const modelo = nomes(".env.example"), meu = nomes(".env");
  if (!modelo || !meu) return [];
  return modelo.filter(n => !meu.includes(n));
}

function extrairZip(zip, destino) {
  const tentativas = [];
  if (process.platform === "win32") tentativas.push([path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe"), ["-xf", zip, "-C", destino]]);
  else tentativas.push(["unzip", ["-q", "-o", zip, "-d", destino]]);
  tentativas.push(["tar", ["-xf", zip, "-C", destino]]);
  for (const [cmd, args] of tentativas) {
    const r = spawnSync(cmd, args, { encoding: "utf8" });
    if (r.status === 0) return;
  }
  throw new Error("não consegui abrir o ZIP: instale o unzip (Mac e Linux) ou use o Windows 10 ou superior.");
}

async function baixar(url, destino) {
  if (!/^https:\/\//i.test(url)) throw new Error("o endereço precisa começar com https://");
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`o download falhou (${r.status}).`);
  const bytes = Buffer.from(await r.arrayBuffer());
  if (bytes.length > 200 * 1024 * 1024) throw new Error("o arquivo é grande demais para ser o produto.");
  if (bytes.subarray(0, 2).toString("latin1") !== "PK") throw new Error("o endereço não devolveu um arquivo ZIP.");
  fs.writeFileSync(destino, bytes);
}

function rodar(cmd, args, opcoes = {}) {
  return spawnSync(cmd, args, { cwd: raiz, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, ...opcoes });
}

function atualizarPorGit() {
  const alterados = rodar("git", ["status", "--porcelain", "--untracked-files=no"]).stdout.trim();
  if (alterados) throw new Error(`você alterou arquivos do produto, e eu não vou sobrescrevê-los:\n${alterados}\nDesfaça essas alterações ou guarde-as com git stash e rode de novo. Seus dados (${DADOS_DO_CLIENTE}) não entram nessa conta.`);
  const antes = lerProduto().versao;
  const r = rodar("git", ["pull", "--ff-only"], { timeout: 180000 });
  const saida = ((r.stdout || "") + (r.stderr || "")).trim();
  if (r.status !== 0) {
    const login = /could not read|Authentication|denied|403|404|terminal prompts/i.test(saida);
    throw new Error("o git não conseguiu atualizar.\n" + saida + (login ? "\nParece falta de login ou de acesso ao repositório. Faça o login do git (por exemplo, gh auth login) e tente de novo, ou atualize com um ZIP novo: npm run atualizar -- --zip <arquivo>." : ""));
  }
  console.log(saida || "git pull concluído.");
  return { de: antes, para: lerProduto().versao };
}

function relatorio(p, simular) {
  console.log(`\nVersão instalada: ${p.de}   Pacote: ${p.para}`);
  console.log(`${simular ? "Mudaria" : "Atualizados"}: ${p.alterados.length} arquivos alterados, ${p.novos.length} novos, ${p.iguais} iguais.`);
  for (const a of p.novos) console.log(`  + ${a}`);
  for (const a of p.alterados) console.log(`  ~ ${a}`);
  if (p.obsoletos.length) { console.log(`\nArquivos do produto que não existem mais no pacote (mantidos, pode apagar se quiser):`); for (const a of p.obsoletos) console.log(`  - ${a}`); }
  console.log(`\nNão foram tocados: ${DADOS_DO_CLIENTE}.`);
}

async function principal(args) {
  const simular = args.includes("--simular"), forcar = args.includes("--forcar"), semInstalar = args.includes("--sem-instalar");
  const zip = opcao(args, "--zip"), pasta = opcao(args, "--pasta"), url = opcao(args, "--url");
  const temGit = fs.existsSync(path.join(raiz, ".git"));
  let versoes;
  if (!zip && !pasta && !url) {
    if (!temGit) throw new Error("esta pasta não é um clone do git, então preciso do pacote novo. Baixe o ZIP atualizado e rode:\n  npm run atualizar -- --zip <caminho-do-arquivo.zip>");
    if (simular) throw new Error("--simular só vale para ZIP ou pasta; no git, use git fetch e git log para ver o que mudou.");
    versoes = atualizarPorGit();
  } else {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "motion-atualizar-"));
    try {
      let origem;
      if (pasta) origem = localizarRaiz(path.resolve(pasta));
      else {
        let arq = zip && path.resolve(zip);
        if (url) { arq = path.join(temp, "pacote.zip"); await baixar(url, arq); }
        if (!fs.existsSync(arq)) throw new Error(`não achei o arquivo: ${arq}`);
        const aberto = path.join(temp, "pacote"); fs.mkdirSync(aberto);
        extrairZip(arq, aberto);
        origem = localizarRaiz(aberto);
      }
      const plano = planejar(origem, raiz, { forcar });
      relatorio(plano, simular);
      if (simular) return;
      aplicar(plano, raiz);
      versoes = { de: plano.de, para: plano.para };
    } finally { fs.rmSync(temp, { recursive: true, force: true }); }
  }
  if (!semInstalar) {
    console.log("\nAtualizando os comandos de barra nas plataformas…");
    const r = spawnSync(process.execPath, [path.join(raiz, "scripts", "instalar.mjs")], { cwd: raiz, stdio: "inherit" });
    if (r.status !== 0) throw new Error("o produto foi atualizado, mas a reinstalação dos comandos falhou. Rode npm run instalar.");
  }
  const novas = chavesNovasDoEnv(raiz);
  if (novas.length) console.log(`\nO .env.example ganhou variáveis que o seu .env ainda não tem (nomes apenas): ${novas.join(", ")}. Veja a documentação antes de usar o recurso correspondente.`);
  console.log(`\nAtualização concluída: ${versoes.de} → ${versoes.para}. Feche e reabra o agente nesta pasta.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal(process.argv.slice(2)).catch(e => { console.error("Erro: " + e.message); process.exit(1); });
}
