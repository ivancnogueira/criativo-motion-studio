// Página do painel local. Fala só com o servidor de scripts/painel.mjs, no mesmo endereço.
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const CORES = ["dominante", "destaque", "apoio"];
const ROTULO = { dominante: "Dominante", destaque: "Destaque", apoio: "Apoio" };
let E = null;            // estado vindo do servidor
let escolhido = "";      // id do estilo escolhido
let telas = [];

async function api(caminho, corpo) {
  const r = await fetch(caminho, corpo === undefined ? {} : { method: "POST", headers: { "content-type": "application/json", "x-painel": "1" }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || "algo deu errado.");
  return j;
}
const dizer = (el, texto, tipo = "") => { el.textContent = texto; el.className = "msg " + tipo; };

function camposDeCor(destino, prefixo, valores) {
  destino.innerHTML = CORES.map(k => `<label>${ROTULO[k]}<input type="color" id="${prefixo}-${k}" value="${esc(valores?.[k] || "#2563eb")}"></label>`).join("");
}
const lerCores = prefixo => Object.fromEntries(CORES.map(k => [k, $(`${prefixo}-${k}`).value]));

function desenharEstilos() {
  const grade = $("grade");
  grade.innerHTML = E.estilos.map(e => `
    <button type="button" class="cartao" role="radio" aria-checked="${e.id === escolhido}" data-id="${esc(e.id)}">
      ${e.previa >= 0 ? `<canvas class="palco" data-previa="${e.previa}" width="640" height="360" role="img" aria-label="Cena animada no estilo ${esc(e.nome)}"></canvas>`
        : `<div class="palco">${e.imagem ? `<img src="${esc(e.imagem)}" alt="Quadros de referência do estilo ${esc(e.nome)}">` : ""}</div>`}
      <span class="corpo">
        <span class="etiqueta ${e.personalizado ? "meu" : ""}">${e.personalizado ? "Seu estilo" : "Estilo nativo"}</span>
        <h3>${esc(e.nome)}<small>${esc(e.subtitulo)}</small></h3>
        <p>${esc(e.resumo)}</p>
        ${e.melhorPara ? `<p><b>Melhor para:</b> ${esc(e.melhorPara)}</p>` : ""}
      </span>
    </button>`).join("");
  telas = [...grade.querySelectorAll("canvas[data-previa]")].map(cv => ({ cv, i: +cv.dataset.previa, visivel: false, ultimo: 0 }));
  telas.forEach(t => desenhar(t, 2));
}
const desenhar = (t, tempo) => { try { RENDER[t.i](t.cv, tempo); } catch (e) { console.error(e); t.quebrou = true; } };

function iniciarAnimacao() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const obs = new IntersectionObserver(es => es.forEach(e => { const t = telas.find(x => x.cv === e.target); if (t) t.visivel = e.isIntersecting; }), { threshold: .2 });
  new MutationObserver(() => telas.forEach(t => obs.observe(t.cv))).observe($("grade"), { childList: true });
  telas.forEach(t => obs.observe(t.cv));
  const inicio = performance.now();
  const laco = agora => {
    requestAnimationFrame(laco);
    for (const t of telas) { if (!t.visivel || t.quebrou || agora - t.ultimo < 40) continue; t.ultimo = agora; desenhar(t, (agora - inicio) / 1000); }
  };
  requestAnimationFrame(laco);
}

function escolher(id) {
  escolhido = id;
  document.querySelectorAll("#grade .cartao").forEach(c => c.setAttribute("aria-checked", String(c.dataset.id === id)));
  const e = E.estilos.find(x => x.id === id);
  $("bloco-teste").hidden = !e?.personalizado;
  atualizarComando();
}

function atualizarComando() {
  $("cmd").textContent = `/${E.prefixo}-criar-video`;
}

function aplicarProjeto(p) {
  $("tema").value = p.tema || "";
  document.querySelector(`input[name=vertical][value="${p.vertical === true}"]`).checked = true;
  $("narracao").checked = p.narracao === true;
  $("roteiro").value = p.roteiro || "";
  $("legendas").checked = p.legendas === true;
  $("duracao").value = p.duracaoSegundos || 30;
  $("storyboard").checked = p.storyboard === true;
  $("musica").checked = p.musica === true;
  $("efeitos").checked = p.efeitos === true;
  $("teste").checked = p.testeDeEstilo !== false;
  const paleta = p.paleta || "estilo";
  document.querySelector(`input[name=paleta][value="${paleta}"]`).checked = true;
  camposDeCor($("cores-vid"), "cv", p.cores);
  mostrarCondicionais();
}

function mostrarCondicionais() {
  const nar = $("narracao").checked;
  $("bloco-narracao").hidden = !nar;
  $("bloco-duracao").hidden = nar;
  const paleta = document.querySelector("input[name=paleta]:checked")?.value;
  $("cores-vid").hidden = paleta !== "personalizada";
  $("bloco-marca").hidden = paleta !== "marca";
}

function desenharNarracao() {
  $("estado-narracao").textContent = E.narracao.presente
    ? `Arquivo atual: entrada/narracao.mp3 (${E.narracao.megabytes} MB). Enviar outro substitui este.`
    : "Ainda não há narração. Envie o MP3 abaixo ou gere por API (comando de narração do agente).";
}

function desenharPreparacao() {
  $("em-preparacao").innerHTML = E.emPreparacao.map(p => `
    <div class="prep">
      <b>${esc(p.nome)}</b> — extraído, aguardando a direção de arte.
      <img src="${esc(p.folha)}" alt="Folha de referência de ${esc(p.nome)}">
      <p class="nota">Cole no chat do agente: <code>/${esc(E.prefixo)}-extrator-de-estilos ${esc(p.id)}</code></p>
    </div>`).join("");
}

async function carregar() {
  E = await api("/api/estado");
  document.title = `Painel · ${E.produto}`;
  $("titulo").textContent = E.produto;
  if (!E.instancia) { $("aviso").hidden = false; $("aviso").textContent = "Esta pasta ainda não foi instalada: o painel abre só para consulta. Rode npm run instalar para poder salvar."; }
  $("sugestoes").innerHTML = E.comecePor.map(s => `${esc(s.pergunta)} <button type="button" class="link" data-sugerir="${esc(s.estilo)}">${esc(E.estilos.find(x => x.id === s.estilo)?.nome || s.estilo)}</button>`).join(" · ");
  $("sem-ffmpeg").hidden = E.ffmpeg;
  $("extrair").disabled = !E.ffmpeg;
  desenharEstilos();
  const p = E.projeto || {};
  aplicarProjeto(p);
  escolher(E.estilos.some(e => e.id === p.estilo) ? p.estilo : E.estilos[0]?.id || "");
  const m = E.marca || {};
  $("marca-nome").value = m.nome || "";
  camposDeCor($("cores-marca"), "cm", m.cores);
  desenharNarracao();
  desenharPreparacao();
}

function montarProjeto() {
  const paleta = document.querySelector("input[name=paleta]:checked").value;
  return {
    estilo: escolhido, tema: $("tema").value, storyboard: $("storyboard").checked, narracao: $("narracao").checked,
    roteiro: $("roteiro").value, legendas: $("legendas").checked, duracaoSegundos: Number($("duracao").value),
    vertical: document.querySelector("input[name=vertical]:checked").value === "true",
    musica: $("musica").checked, efeitos: $("efeitos").checked, paleta, cores: lerCores("cv"), testeDeEstilo: $("teste").checked,
  };
}

// Envia um arquivo com barra de progresso; o servidor confere tamanho e tipo.
function enviar(arquivo, tipo) {
  return new Promise((ok, falha) => {
    const x = new XMLHttpRequest();
    x.open("POST", `/api/enviar?tipo=${tipo}&nome=${encodeURIComponent(arquivo.name)}`);
    x.setRequestHeader("x-painel", "1");
    x.responseType = "json";
    const barra = $("prog");
    barra.hidden = false; barra.value = 0;
    x.upload.onprogress = e => { if (e.lengthComputable) barra.value = Math.round(e.loaded / e.total * 100); };
    x.onload = () => { barra.hidden = true; x.status === 200 ? ok(x.response) : falha(new Error(x.response?.erro || "o envio falhou.")); };
    x.onerror = () => { barra.hidden = true; falha(new Error("não foi possível falar com o painel. Ele ainda está aberto no terminal?")); };
    x.send(arquivo);
  });
}

document.addEventListener("click", ev => {
  const card = ev.target.closest("#grade .cartao"); if (card) return escolher(card.dataset.id);
  const sug = ev.target.closest("[data-sugerir]"); if (sug) { escolher(sug.dataset.sugerir); $("estilo").scrollIntoView(); }
});
document.addEventListener("change", ev => { if (ev.target.matches("#narracao, input[name=paleta]")) mostrarCondicionais(); });

$("exemplo").addEventListener("click", () => {
  const e = E.estilos.find(x => x.id === escolhido);
  if (e?.temaExemplo) $("tema").value = e.temaExemplo; else dizer($("msg-form"), "Este estilo não tem tema de exemplo.", "erro");
});

$("form").addEventListener("submit", async ev => {
  ev.preventDefault();
  const msg = $("msg-form"), b = $("salvar"); b.disabled = true;
  try { await api("/api/projeto", montarProjeto()); dizer(msg, "Configuração salva em projeto.json. Agora cole o comando da etapa 3 no agente.", "ok"); }
  catch (e) { dizer(msg, e.message, "erro"); }
  b.disabled = false;
});

$("salvar-marca").addEventListener("click", async () => {
  try { await api("/api/marca", { nome: $("marca-nome").value, cores: lerCores("cm") }); dizer($("msg-form"), "Marca salva em marca.json.", "ok"); }
  catch (e) { dizer($("msg-form"), e.message, "erro"); }
});

$("arq-audio").addEventListener("change", async ev => {
  const f = ev.target.files[0]; if (!f) return;
  try { const r = await enviar(f, "audio"); E.narracao = { presente: true, megabytes: r.megabytes }; desenharNarracao(); }
  catch (e) { $("estado-narracao").textContent = "Erro: " + e.message; }
  ev.target.value = "";
});

$("extrair").addEventListener("click", async () => {
  const msg = $("msg-novo"), b = $("extrair"), f = $("arq-video").files[0], nome = $("novo-nome").value.trim();
  if (!nome) return dizer(msg, "Dê um nome ao estilo.", "erro");
  if (!f) return dizer(msg, "Escolha o vídeo de referência.", "erro");
  b.disabled = true;
  try {
    dizer(msg, "Enviando o vídeo…");
    const up = await enviar(f, "video");
    dizer(msg, "Extraindo quadros, movimento e cores… pode levar alguns segundos.");
    const r = await api("/api/extrair", { arquivo: up.arquivo, nome, inicio: Number($("novo-inicio").value) || 0, duracao: Number($("novo-duracao").value) || 12 });
    dizer(msg, "Extração concluída.", "ok");
    const caixa = $("resultado-novo");
    caixa.hidden = false;
    caixa.innerHTML = `<b>${esc(r.nome)}</b>
      <img src="${esc(r.folha)}?t=${Date.now()}" alt="Folha de referência extraída do vídeo">
      <p>Agora cole no chat do agente para ele escrever a direção de arte do estilo:</p>
      <div class="comando"><code>/${esc(E.prefixo)}-extrator-de-estilos ${esc(r.id)}</code></div>
      <details><summary>Medidas extraídas</summary><pre>${esc(r.metricas)}</pre></details>`;
    E = { ...E, ...(await api("/api/estado")) }; desenharPreparacao();
  } catch (e) { dizer(msg, e.message, "erro"); }
  b.disabled = false;
});

$("copiar").addEventListener("click", async () => {
  const b = $("copiar");
  try { await navigator.clipboard.writeText($("cmd").textContent); b.textContent = "Copiado"; }
  catch { const r = document.createRange(); r.selectNodeContents($("cmd")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selecionado"; }
  setTimeout(() => { b.textContent = "Copiar"; }, 1600);
});

carregar().then(iniciarAnimacao).catch(e => { $("aviso").hidden = false; $("aviso").textContent = "Não foi possível carregar o painel: " + e.message; });
