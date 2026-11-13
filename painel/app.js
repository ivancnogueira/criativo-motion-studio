// Painel local do Criativo Motion Studio. Base: o app original de estilos, adaptado para gravar na instalação.
const BOOT = await (await fetch("/api/estado")).json();
async function api(caminho, corpo) {
  const r = await fetch(caminho, corpo === undefined ? {} : { method: "POST", headers: { "content-type": "application/json", "x-painel": "1" }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || "algo deu errado.");
  return j;
}
document.title = BOOT.produto;
document.getElementById("brand-name").textContent = BOOT.produto;
if (!BOOT.instancia) { const a = document.getElementById("aviso"); a.hidden = false; }

const STYLES = [
  { name: "Recorte de Papel", sub: "editorial artesanal", engine: "Canvas 2D · texturas de papel", t: 2.2,
    teaser: "Camadas de papel colorido que deslizam, dobram e se encaixam em infográficos.",
    looks: "Papel recortado com bordas rasgadas, textura de fibra e sombras suaves. As peças se montam em diagramas, os rótulos ficam em faixas de papel e as partes pequenas se mexem com um leve passo de stop-motion.",
    best: "Explicações de como algo funciona, ciclos e processos, tudo que precisa parecer acolhedor e fácil de entender.",
    know: "Cada cena tem muito detalhe de papel, então vale ligar o Storyboard antes. Você confere os quadros antes do agente animar.",
    ex: "Explique como funcionam os agentes de IA: como recebem um objetivo, escolhem ações, usam ferramentas, conferem os resultados e decidem o próximo passo." },
  { name: "Vidro Líquido", sub: "produto premium", engine: "Shaders WebGL de refração", t: 1.5,
    teaser: "Lentes de vidro deslizam pela cena e distorcem o que está atrás delas.",
    looks: "Formas de vidro refrativo passam sobre uma interface escura e detalhada. Elas ampliam e distorcem o que está embaixo, se juntam e se separam, com brilhos fortes nas bordas.",
    best: "Demonstrações de apps e produtos, fluxos de SaaS, qualquer coisa com uma interface para mostrar.",
    know: "É o estilo mais pesado de renderizar. Exporte no Chrome, num computador razoavelmente rápido, para um MP4 sem travadas.",
    ex: "Mostre como a IA transforma uma ideia num aplicativo funcionando: do pedido inicial à interface, a prévia e os testes no localhost, a correção de problemas e a publicação num endereço público para outras pessoas usarem." },
  { name: "Isométrico em Linha", sub: "desenho técnico", engine: "Three.js ortográfico · geometria de linhas", t: 8.2,
    teaser: "Desenhos de linha precisos que se traçam sozinhos e depois começam a funcionar.",
    looks: "Prédios, máquinas e rotas isométricas se desenham linha por linha num fundo escuro. Depois as partes se movem: pacotes percorrem caminhos, veículos andam, indicadores se preenchem.",
    best: "Sistemas, fluxos de dados, logística, arquitetura, tudo que tem um caminho físico.",
    know: "Temas abstratos funcionam, mas o agente os transforma em estruturas e caminhos. Quanto mais físico o processo, melhor fica este estilo.",
    ex: "Explique o caminho de uma compra online, do pagamento à entrega: o cliente confirma o pedido, o pagamento é aprovado, o estoque é reservado, o produto é separado e embalado, o entregador leva e o rastreio atualiza até a entrega." },
  { name: "Vetor Flat", sub: "estúdio 2D limpo", engine: "Caminhos SVG · morphing de formas", t: 1.3,
    teaser: "Ilustração 2D marcante, com formas que se transformam de uma ideia na próxima.",
    looks: "Cores chapadas, formas nítidas e transições suaves. Objetos ganham cortes internos, fios e setas mostram o que flui para onde, e chamadas numeradas guiam os passos.",
    best: "Ciência, energia, saúde e explicações do dia a dia sobre como as coisas funcionam.",
    know: "O curinga mais seguro. Se não souber qual estilo combina com o tema, comece por aqui.",
    ex: "Explique como os painéis solares geram energia para uma casa: a luz energiza os elétrons nas células, o painel produz corrente contínua, o inversor converte em corrente alternada e o excedente vai para uma bateria ou para a rede." },
  { name: "Pixel Art 8-Bit", sub: "jogo retrô", engine: "Canvas em baixa resolução · pixel nítido", t: .5, px: true,
    teaser: "Sprites em pixel, letras bitmap e transições em blocos com clima de chiptune.",
    looks: "Uma cena em baixa resolução ampliada com bordas de pixel duras: sprites animados, fundos em camadas, fontes de pixel e painéis no estilo HUD. A música, se marcada, tem som de videogame antigo.",
    best: "Games, conceitos de programação, nostalgia e explicações divertidas.",
    know: "Texto em pixel é grosso, então use poucas palavras curtas na tela. Funciona também para temas que não têm nada a ver com games.",
    ex: "Explique como um jogo 2D responde ao jogador: o botão vira uma ação, o loop do jogo atualiza posições e checa colisões, os quadros do sprite mostram o movimento e a tela é redesenhada." },
];
const IDS_BASE = BOOT.estilos.filter(e => e.previa >= 0).sort((a, b) => a.previa - b.previa).map(e => e.id);
STYLES.forEach((s, i) => { s.id = IDS_BASE[i] || "base-" + i; });
const STARTS = [
  { q: "Explicar como algo funciona?", a: "Vetor Flat", i: 3 },
  { q: "Mostrar um app ou produto?", a: "Vidro Líquido", i: 1 },
  { q: "Mostrar um sistema ou um fluxo?", a: "Isométrico em Linha", i: 2 },
  { q: "Um processo que precisa parecer amigável?", a: "Recorte de Papel", i: 0 },
  { q: "Games, código ou gancho de nostalgia?", a: "Pixel Art 8-Bit", i: 4 },
];
const TIPS = {
  storyboard: "O agente planeja primeiro: uma tabela cena a cena (tempo, visual, movimento, texto na tela, som) e quadros de prévia reais neste estilo. Ele para aí até você responder APROVADO ou pedir mudanças. Deixe desmarcado para ir direto à animação pronta.",
  voiceover: "Faça o MP3 da narração antes (grave ou use um serviço de texto para fala) e envie aqui. O vídeo dura exatamente o mesmo que o áudio e as cenas mudam junto com as palavras. Também dá para gerar o áudio por API (ElevenLabs, Fish Audio ou MiniMax): veja a documentação de voz.",
  script: "Opcional. Cole o roteiro para o agente saber o que é dito e sincronizar as cenas. Sem alinhamento real com o áudio, os tempos ficam marcados como estimativa.",
  subtitles: "Legendas na tela sincronizadas com a narração, mais um arquivo SRT. Precisam da chave Groq no .env (veja a documentação).",
  music: "Composta em código com a Web Audio API. Nada de trilha de banco, e ela some junto com o fim do vídeo.",
  sfx: "Whooshes, cliques e impactos suaves gerados em código e sincronizados com o que acontece na tela.",
  brand: "Usa as três cores da sua marca no lugar das cores do estilo. A técnica e o acabamento do estilo continuam iguais.",
};
/* ---------- state ---------- */
const DEF = { brandName: "", b1: "#2563EB", b2: "#F59E0B", b3: "#10B981", styleTest: true, topic: "", storyboard: false, voiceover: false, script: "", subtitles: false, min: 0, sec: 30, vertical: false, music: true, sfx: true, palette: "style", c1: "#2563EB", c2: "#F59E0B", c3: "#10B981" };
let S = { ...DEF, ...(BOOT.marca ? { brandName: BOOT.marca.nome, b1: BOOT.marca.cores.dominante, b2: BOOT.marca.cores.destaque, b3: BOOT.marca.cores.apoio } : {}) };
if (BOOT.projetoSalvo) {
  const p = BOOT.projeto, seg = Math.max(0, Math.round(+p.duracaoSegundos || 30));
  Object.assign(S, { styleTest: p.testeDeEstilo !== false, topic: p.tema || "", storyboard: !!p.storyboard, voiceover: !!p.narracao, script: p.roteiro || "",
    subtitles: !!p.legendas, min: Math.floor(seg / 60), sec: seg % 60, vertical: !!p.vertical, music: p.musica !== false, sfx: p.efeitos !== false,
    palette: ({ estilo: "style", marca: "brand", personalizada: "custom" })[p.paleta] || "style" });
  if (p.cores) Object.assign(S, { c1: p.cores.dominante || S.c1, c2: p.cores.destaque || S.c2, c3: p.cores.apoio || S.c3 });
}
const save = () => {}; // a configuração só é gravada quando você clica em Salvar
const secs = () => (+S.min || 0) * 60 + (+S.sec || 0);
function durText(n) {
  const m = Math.floor(n / 60), s = n % 60;
  if (!m) return `${s} seconds`;
  const parts = `${m} minute${m > 1 ? "s" : ""}` + (s ? ` ${s} second${s > 1 ? "s" : ""}` : "");
  return `${parts} (${n} seconds)`;
}
const clock = n => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;


/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const arrow = `<svg class="doodle" viewBox="0 0 34 20" width="26" height="16" aria-hidden="true"><path d="M2 10 C10 8 20 12 30 10"/><path d="M23 3 L31 10 L23 17"/></svg>`;
const tick = `<svg class="doodle" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 11 L8 15 L17 4"/></svg>`;
const clip = `<svg class="doodle" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="7" y="4" width="12" height="16" rx="2"/><path d="M4 8 V20 Q4 22 6 22 H14"/></svg>`;

/* ---------- cards ---------- */
const grid = document.getElementById("grid");
/* estilos ocultos: escolha de cada pessoa (navegador + conta, quando der) */
const HIDDEN = new Set();
try { JSON.parse(localStorage.getItem("motion-hidden") || "[]").forEach(k => HIDDEN.add(k)); } catch (e) {}
let MANAGE = false;
const ARM = { key: "", until: 0 }; // exclusão aguardando o segundo clique
const keyOf = i => STYLES[i] ? STYLES[i].id : "";
const isHidden = i => HIDDEN.has(keyOf(i));
function numOf(i) { let n = 0; for (let k = 0; k <= i && k < STYLES.length; k++) if (!isHidden(k)) n++; return isHidden(i) ? "–" : n; }
function neighbor(i, d) { let k = i + d; while (k >= 0 && k < STYLES.length && isHidden(k)) k += d; return k >= 0 && k < STYLES.length ? k : -1; }
function renderGrid() {
  let pos = 0;
  grid.classList.toggle("manage", MANAGE);
  grid.innerHTML = STYLES.map((s, i) => isHidden(i) ? "" : `
  <li style="animation-delay:${.3 + Math.min(pos++, 8) * .06}s">
    <button class="card${s.custom ? " custom" : ""}" type="button" data-i="${i}" aria-haspopup="dialog">
      <span class="pin" aria-hidden="true"></span>
      <span class="shot"><canvas ${s.px ? 'class="px"' : ""} width="640" height="360" role="img" aria-label="Quadro de exemplo no estilo ${esc(s.name)}"></canvas>${s.custom ? `<span class="badge">do vídeo</span>` : ""}</span>
      <span class="card-top"><span class="n">${numOf(i)}</span><span class="engine">${esc(s.engine)}</span></span>
      <h2>${esc(s.name)}<small>${esc(s.sub)}</small></h2>
      <p>${esc(s.teaser)}</p>
      ${s.custom ? `<span class="byline">Estilo criado por você</span>` : ""}
      <span class="open-hint">Configurar o vídeo ${arrow}</span>
    </button>
    <div class="card-acts">
      <button type="button" class="mini" data-hide="${i}" title="Tirar este estilo da sua grade"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.6"/><path d="M4 20 20 4"/></svg>Ocultar</button>
      ${typeof canDelete === "function" && canDelete(s) ? (ARM.key === s.id && Date.now() < ARM.until ? `<button type="button" class="mini danger armed" data-del="${i}">Confirmar exclusão</button>` : `<button type="button" class="mini danger" data-del="${i}" title="Apagar este estilo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>Excluir</button>`) : ""}
    </div>
  </li>`).join("") + (MANAGE ? "" : typeof creatorCard === "function" ? creatorCard() : "");
  renderTools();
}
function renderTools() {
  const hid = STYLES.map((s, i) => i).filter(isHidden);
  const btn = document.getElementById("manage-btn"), note = document.getElementById("hidden-note"), list = document.getElementById("hidden-list");
  btn.textContent = MANAGE ? "Pronto" : "Ocultar ou excluir estilos";
  btn.setAttribute("aria-pressed", String(MANAGE));
  note.innerHTML = MANAGE ? "Ocultar tira o estilo só da sua grade. Excluir apaga o estilo criado por você desta instalação."
    : hid.length ? `${hid.length} ${hid.length > 1 ? "estilos ocultos" : "estilo oculto"} · <button type="button" class="linkish" id="show-hidden">ver</button>` : "";
  list.hidden = !(MANAGE && hid.length);
  list.innerHTML = MANAGE && hid.length ? `<small class="k">Ocultos</small><div class="chips">${hid.map(i => `<button type="button" class="chip" data-unhide="${i}">${esc(STYLES[i].name)} · mostrar</button>`).join("")}</div>` : "";
}
function saveHidden() {
  try { localStorage.setItem("motion-hidden", JSON.stringify([...HIDDEN])); } catch (e) {}
}
function setHidden(i, on) {
  const k = keyOf(i); if (!k) return;
  if (on) HIDDEN.add(k); else HIDDEN.delete(k);
  saveHidden();
  if (on && !sheet.hidden && current === i) close();
  renderGrid(); drawCards();
}
document.getElementById("starts").innerHTML = STARTS.map(s =>
  `<li><button type="button" data-i="${s.i}"><span>${s.q}</span><b>${s.a} →</b></button></li>`).join("");

function fontsReady() {
  const loads = ['900 40px Archivo', '700 40px Archivo', '500 20px Archivo', '700 12px "Courier Prime"', '400 12px "Courier Prime"'].map(f => document.fonts.load(f).catch(() => {}));
  return Promise.race([Promise.all(loads), new Promise(r => setTimeout(r, 2500))]);
}
function drawCards() {
  const cards = [...grid.querySelectorAll(".card[data-i]")].filter(c => c.dataset.i !== "new");
  let k = 0;
  const next = () => { if (k >= cards.length) return; const i = +cards[k].dataset.i, cv = cards[k].querySelector("canvas"), s = STYLES[i]; try { if (s && cv && s.custom) renderCustom(cv, s, 0); else if (s && cv) RENDER[i](cv, s.t); } catch (e) { console.error(e); } k++; setTimeout(next, 16); };
  next();
}

/* ---------- sheet body ---------- */
const chk = (id, label, on, extra = "", tip = "") => `
  <div class="opt">
    <label class="chk" for="${id}"><input type="checkbox" id="${id}" ${on ? "checked" : ""}><span class="box">${tick}</span><span>${label}${extra ? ` <em>${extra}</em>` : ""}</span></label>
    ${tip ? `<button type="button" class="tip-btn" aria-label="Mais sobre ${label.toLowerCase()}" aria-expanded="false" aria-describedby="tip-${id}">i</button><span class="tip-body" role="tooltip" id="tip-${id}">${TIPS[tip]}</span>` : ""}
  </div>`;

function body(s, i) {
  const n = secs();
  return `
    <div class="s-head">
      <span class="n">${numOf(i)}</span>
      <div class="s-title"><h2 id="sheet-title">${esc(s.name)}</h2><span class="engine">${esc(s.sub)} · ${esc(s.engine)}</span></div>
      <button class="close" type="button" data-close aria-label="Fechar">
        <svg class="doodle" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 3 L17 17"/><path d="M17 3 L3 17"/></svg>
      </button>
    </div>
    <figure class="film">
      <span class="tape"></span>
      <div class="screen"><canvas id="live" ${s.px ? 'class="px"' : ""} role="img" aria-label="Exemplo animado no estilo ${s.name}"></canvas></div>
      <figcaption><span>${s.custom ? "Quadros do vídeo de referência. O visual é recriado do zero, com o seu tema." : "Cena de exemplo neste estilo, desenhada ao vivo no seu navegador. O seu vídeo segue o seu tema."}</span>${reduce ? "" : `<button type="button" class="mini" id="playbtn" aria-pressed="false">Pausar</button>`}</figcaption>
    </figure>
    <div class="pair">
      <div class="field"><small>Como fica</small><p>${esc(s.looks)}</p></div>
      <div class="field best"><small>Melhor para</small><p>${esc(s.best)}</p></div>
    </div>
    <div class="field catch"><small>Bom saber</small><p>${esc(s.know)}</p></div>
    ${s.custom && typeof customPanel === "function" ? customPanel(s) : ""}

    <form class="setup" id="setup" novalidate>
      <span class="tape"></span>
      <h3>Monte seu prompt<span>Suas escolhas continuam iguais quando você troca de estilo.</span></h3>

      <div class="step">
        <span class="dot">1</span>
        <label class="step-h" for="f-topic">Sobre o que é o vídeo?</label>
        <div class="step-b">
          <textarea id="f-topic" rows="3" placeholder="ex.: ${esc(s.ex)}">${esc(S.topic)}</textarea>
          <p class="err" id="topic-err" hidden>Escreva o tema primeiro. Uma frase já basta.</p>
          <button type="button" class="linkish" data-example>Usar o tema de exemplo deste estilo</button>
        </div>
      </div>

      <div class="step">
        <span class="dot">2</span>
        <div class="step-b">${chk("f-storyboard", "Storyboard antes", S.storyboard, "plano + quadros de prévia, depois você aprova", "storyboard")}</div>
      </div>

      <div class="step">
        <span class="dot">3</span>
        <span class="step-h" id="dur-h">Duração do vídeo</span>
        <div class="step-b">
          <div class="dur-box${S.voiceover ? " off" : ""}" id="dur-box">
            <div class="dur" role="group" aria-labelledby="dur-h">
              <label for="f-min"><input class="num" id="f-min" type="number" inputmode="numeric" min="0" max="10" value="${+S.min || 0}" ${S.voiceover ? "disabled" : ""}> min</label>
              <label for="f-sec"><input class="num" id="f-sec" type="number" inputmode="numeric" min="0" max="59" value="${+S.sec || 0}" ${S.voiceover ? "disabled" : ""}> seg</label>
            </div>
            <div class="chips" id="presets">${durPresets(s).map(([v, lab]) => `<button type="button" class="chip" data-preset="${v}" aria-pressed="${n === v}" ${S.voiceover ? "disabled" : ""}>${lab}</button>`).join("")}</div>
            <p class="err" id="dur-err" hidden>Escolha entre 5 segundos e 10 minutos.</p>
          </div>
          <p class="hint vo-note" id="dur-vo" ${S.voiceover ? "" : "hidden"}>Com narração em MP3 marcada, o vídeo dura o tempo da narração. <button type="button" class="linkish" id="use-dur">Usar a duração acima</button></p>
        </div>
      </div>

      <div class="step">
        <span class="dot">4</span>
        <div class="step-b">
          ${chk("f-voiceover", "Vou anexar uma narração em MP3", S.voiceover, "", "voiceover")}
          <div class="sub-panel" id="vo-on" ${S.voiceover ? "" : "hidden"}>
            <p class="hint">Duração do vídeo = duração da narração.</p>
            <div class="upl">
              <label class="step-h small" for="f-mp3">Arquivo MP3 da narração</label>
              <input type="file" id="f-mp3" accept=".mp3,audio/mpeg">
              <p class="hint" id="mp3-st" aria-live="polite">${BOOT.narracao.presente ? `Arquivo atual: entrada/narracao.mp3 (${BOOT.narracao.megabytes} MB). Enviar outro substitui este.` : "Nenhum MP3 enviado ainda."}</p>
            </div>
            <div class="script-f">
              <div class="opt">
                <label class="step-h small" for="f-script">Roteiro da narração <em>opcional</em></label>
                <button type="button" class="tip-btn" aria-label="Mais sobre o roteiro" aria-expanded="false" aria-describedby="tip-f-script">i</button>
                <span class="tip-body" role="tooltip" id="tip-f-script">${TIPS.script}</span>
              </div>
              <textarea id="f-script" rows="2" placeholder="Cole o que a narração diz">${esc(S.script)}</textarea>
            </div>
            ${chk("f-subtitles", "Adicionar legendas", S.subtitles, "arquivo SRT + botão de legendas", "subtitles")}
          </div>
        </div>
      </div>

      <div class="step">
        <span class="dot">5</span>
        <span class="step-h" id="fmt-h">Formato</span>
        <div class="step-b">
          <div class="formats" role="radiogroup" aria-labelledby="fmt-h">
            <label class="fmt"><input type="radio" name="fmt" value="h" ${S.vertical ? "" : "checked"}><span class="frame h"></span><span><b>Horizontal 16:9</b><span>1920 × 1080</span></span></label>
            <label class="fmt"><input type="radio" name="fmt" value="v" ${S.vertical ? "checked" : ""}><span class="frame v"></span><span><b>Vertical 9:16</b><span>1080 × 1920</span></span></label>
          </div>
        </div>
      </div>

      <div class="step">
        <span class="dot">6</span>
        <span class="step-h">Áudio</span>
        <div class="step-b audio">
          ${chk("f-music", "Música de fundo", S.music, "", "music")}
          ${chk("f-sfx", "Efeitos sonoros", S.sfx, "", "sfx")}
        </div>
      </div>

      <div class="step">
        <span class="dot">7</span>
        <span class="step-h" id="pal-h">Cores do vídeo</span>
        <div class="step-b">
          <div class="formats pals" role="radiogroup" aria-labelledby="pal-h">
            <label class="fmt"><input type="radio" name="pal" value="style" ${S.palette === "style" ? "checked" : ""}><span class="sws">${(s.colors && s.colors.length >= 3 ? s.colors : ["#E8B65C", "#C56B50", "#4667FF"]).slice(0, 3).map(c => `<i style="background:${esc(c)}"></i>`).join("")}</span><span><b>Cores do estilo</b><span>${s.custom ? "as do vídeo" : "paleta original"}</span></span></label>
            <label class="fmt"><input type="radio" name="pal" value="brand" ${S.palette === "brand" ? "checked" : ""}><span class="sws" id="sw-brand"><i style="background:${S.b1}"></i><i style="background:${S.b2}"></i><i style="background:${S.b3}"></i></span><span><b>${esc(S.brandName || "Minha marca")}</b><span>as cores da sua marca</span></span></label>
            <label class="fmt"><input type="radio" name="pal" value="custom" ${S.palette === "custom" ? "checked" : ""}><span class="sws" id="sw-custom"><i style="background:${S.c1}"></i><i style="background:${S.c2}"></i><i style="background:${S.c3}"></i></span><span><b>Minhas cores</b><span>você escolhe</span></span></label>
          </div>
          <div class="sub-panel colors" id="pal-brand" ${S.palette === "brand" ? "" : "hidden"}>
            <label class="rf brandf" for="f-bn"><span class="k">Nome da marca</span><input class="num" id="f-bn" maxlength="60" value="${esc(S.brandName)}" placeholder="ex.: Minha Marca"></label>
            <label class="cpick" for="f-b1"><input type="color" id="f-b1" value="${S.b1}"><span><b>Dominante</b><code id="v-b1">${S.b1.toUpperCase()}</code></span></label>
            <label class="cpick" for="f-b2"><input type="color" id="f-b2" value="${S.b2}"><span><b>Destaque</b><code id="v-b2">${S.b2.toUpperCase()}</code></span></label>
            <label class="cpick" for="f-b3"><input type="color" id="f-b3" value="${S.b3}"><span><b>Apoio</b><code id="v-b3">${S.b3.toUpperCase()}</code></span></label>
            <p class="hint">Fica salvo em marca.json e vale para todos os vídeos que usarem as cores da marca.</p>
          </div>
          <div class="sub-panel colors" id="pal-custom" ${S.palette === "custom" ? "" : "hidden"}>
            <label class="cpick" for="f-c1"><input type="color" id="f-c1" value="${S.c1}"><span><b>Dominante</b><code id="v-c1">${S.c1.toUpperCase()}</code></span></label>
            <label class="cpick" for="f-c2"><input type="color" id="f-c2" value="${S.c2}"><span><b>Destaque</b><code id="v-c2">${S.c2.toUpperCase()}</code></span></label>
            <label class="cpick" for="f-c3"><input type="color" id="f-c3" value="${S.c3}"><span><b>Apoio</b><code id="v-c3">${S.c3.toUpperCase()}</code></span></label>
            <p class="hint">A dominante cobre a maior parte da tela, o destaque marca os pontos importantes e o apoio completa o resto.</p>
          </div>
        </div>
      </div>

      <p class="fixed">Sempre incluído: exportação MP4 a 30 fps, controles de play / pausa / linha do tempo.</p>

      <div class="copybar">
        ${s.custom ? chk("f-styletest", "Mostrar um quadro de teste do estilo antes do vídeo", S.styleTest, "recomendado") : ""}
        <div class="summary" id="summary" aria-label="Suas configurações"></div>
        <div class="copy-row">
          <button class="copy-btn" type="button" id="copy">${clip}<span>Salvar configuração</span></button>
          <p class="status" id="status" aria-live="polite"></p>
        </div>
        <div class="cmdbox" id="cmdbox" hidden><code id="cmd">/${BOOT.prefixo}-criar-video</code><button type="button" class="mini" id="copy-cmd">Copiar comando</button></div>
        <p class="hint">Depois de salvar, cole o comando no chat do seu agente (Claude Code, Codex ou Antigravity).</p>
        <details class="dir">
          <summary>Prefere usar em um chat, sem agente? (opcional)</summary>
          <p class="hint">Copie o prompt completo e cole em um chat de IA${s.custom ? ", anexando a folha de referência na mesma mensagem (a imagem e o texto vão em colagens separadas)" : ""}. A configuração é salva antes de copiar.</p>
          <div class="copy-row">
            <button type="button" class="mini" id="copy-prompt">Copiar prompt</button>
            ${s.custom ? `<a class="mini" href="/estilos/${esc(s.id)}/referencia.png" download="referencia-${esc(s.id)}.png">Baixar folha de referência</a>` : ""}
          </div>
          <p class="hint" id="prompt-st" aria-live="polite"></p>
          <div class="fallback" id="prompt-fallback" hidden><textarea id="prompt-text" readonly rows="8" aria-label="Texto do prompt"></textarea></div>
        </details>
      </div>
    </form>

    <div class="s-foot">
      <button type="button" class="linkish hide-this" data-hide="${i}">${isHidden(i) ? "Mostrar este estilo na grade" : "Ocultar este estilo"}</button>
      <div class="nav">
        <button type="button" data-step="-1" ${neighbor(i, -1) < 0 ? "disabled" : ""}>← Estilo anterior</button>
        <button type="button" data-step="1" ${neighbor(i, 1) < 0 ? "disabled" : ""}>Próximo estilo →</button>
      </div>
    </div>`;
}

function durPresets(s) {
  const base = [15, 30, 45, 60, 90, 120].map(v => [v, v < 60 ? v + "s" : clock(v)]);
  const ref = s && s.custom && s.metrics && s.metrics.len ? Math.round(s.metrics.len) : 0;
  if (ref >= 5 && ref <= 600 && !base.some(([v]) => v === ref)) base.push([ref, `${ref < 60 ? ref + "s" : clock(ref)} · referência`]);
  return base.sort((x, y) => x[0] - y[0]);
}
function refresh() {
  const $ = id => inner.querySelector("#" + id); if (!$("summary")) return;
  $("vo-on").hidden = !S.voiceover; $("dur-vo").hidden = !S.voiceover; $("dur-box").classList.toggle("off", S.voiceover);
  inner.querySelectorAll("#dur-box input, #dur-box .chip").forEach(el => el.disabled = S.voiceover); $("pal-custom").hidden = S.palette !== "custom"; $("pal-brand").hidden = S.palette !== "brand";
  const n = secs();
  inner.querySelectorAll("[data-preset]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.preset === n)));
  const bits = [S.storyboard ? "Storyboard antes" : "Direto para o vídeo",
    S.voiceover ? "Narração MP3" + (S.subtitles ? " + SRT" : "") : "Duração " + clock(n),
    S.vertical ? "1080 × 1920" : "1920 × 1080",
    S.music ? "Música" : "Sem música", S.sfx ? "Efeitos sonoros" : "Sem efeitos", ({ style: "Cores do estilo", brand: "Cores da marca", custom: "Minhas cores" })[S.palette] || "Cores do estilo", "MP4"];
  $("summary").innerHTML = bits.map(b => `<span>${b}</span>`).join("");
  { const st = $("status"), box = $("cmdbox"); if (st && !st.dataset.keep) st.textContent = ""; if (box) box.hidden = true; }
  save();
}

/* ---------- live preview loop ---------- */
let raf = 0, playing = true, t0 = 0, tAt = 0;
function sizeLive(i) {
  const cv = inner.querySelector("#live"); if (!cv) return null;
  const heavy = i === 1 && !STYLES[i].custom, w = STYLES[i].px ? 640 : heavy ? 960 : 1280;
  cv.width = w; cv.height = w * 9 / 16; return cv;
}
function startLive(i) {
  cancelAnimationFrame(raf);
  const cv = sizeLive(i); if (!cv) return;
  const st = STYLES[i], draw = st.custom ? (c, t) => renderCustom(c, st, t) : RENDER[i];
  tAt = st.custom ? 0 : st.t; t0 = performance.now(); let last = 0;
  draw(cv, tAt);
  if (reduce || !playing) return;
  const heavy = (i === 1 && !st.custom) || st.custom;
  const loop = now => {
    raf = requestAnimationFrame(loop);
    if (heavy && now - last < 32) return; last = now;
    try { draw(cv, tAt + (now - t0) / 1000); } catch (e) { cancelAnimationFrame(raf); }
  };
  raf = requestAnimationFrame(loop);
}
function stopLive() { cancelAnimationFrame(raf); raf = 0; }

/* ---------- sheet open / close (same motion as the repos page) ---------- */
const scrim = document.getElementById("scrim");
const sheet = document.getElementById("sheet");
const inner = document.getElementById("sheet-in");
let current = -1, openedAt = -1, origin = null, busy = false;

function fill(i) {
  if (i < 0) { inner.innerHTML = creatorBody(); creatorMounted(); return; }
  const st = STYLES[i], asp = st.custom && st.metrics && st.metrics.aspect;
  if (asp === "Vertical" || asp === "Horizontal") { S.vertical = asp === "Vertical"; save(); } // o formato acompanha a referência
  inner.innerHTML = body(STYLES[i], i); refresh(); startLive(i); }
function rectTransform(from, to) {
  const sx = from.width / to.width, sy = from.height / to.height;
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`;
}
function open(i, fromEl) {
  if (busy) return;
  current = i; openedAt = i; origin = fromEl || grid.querySelector(`.card[data-i="${i}"]`);
  fill(i);
  scrim.hidden = false; sheet.hidden = false;
  document.body.classList.add("locked");
  sheet.scrollTop = 0;
  requestAnimationFrame(() => scrim.classList.add("on"));
  const card = grid.querySelector(`.card[data-i="${i}"]`);
  if (reduce || !card || !origin.classList.contains("card")) { sheet.querySelector("[data-close]").focus(); return; }
  busy = true;
  const to = sheet.getBoundingClientRect(), from = card.getBoundingClientRect();
  sheet.classList.add("hide-body");
  sheet.style.transition = "none";
  sheet.style.transform = rectTransform(from, to);
  sheet.getBoundingClientRect();
  sheet.style.transition = "transform .5s var(--ease)";
  sheet.style.transform = "none";
  const done = () => {
    sheet.removeEventListener("transitionend", done);
    sheet.classList.remove("hide-body");
    busy = false;
    sheet.querySelector("[data-close]").focus({ preventScroll: true });
  };
  sheet.addEventListener("transitionend", done);
  setTimeout(() => busy && done(), 700);
}
function close() {
  if (busy || sheet.hidden) return;
  stopLive();
  const card = grid.querySelector(`.card[data-i="${current}"]`);
  const finish = () => {
    sheet.hidden = true; scrim.hidden = true;
    sheet.style.transition = "none"; sheet.style.transform = "none";
    sheet.classList.remove("hide-body");
    document.body.classList.remove("locked");
    busy = false;
    ((origin && openedAt === current) ? origin : card)?.focus({ preventScroll: true });
  };
  scrim.classList.remove("on");
  if (reduce || !card) return finish();
  busy = true;
  card.scrollIntoView({ block: "nearest" });
  sheet.classList.add("hide-body");
  const to = sheet.getBoundingClientRect(), from = card.getBoundingClientRect();
  sheet.style.transition = "transform .42s var(--ease)";
  sheet.style.transform = rectTransform(from, to);
  const done = () => { sheet.removeEventListener("transitionend", done); finish(); };
  sheet.addEventListener("transitionend", done);
  setTimeout(() => busy && done(), 600);
}
function step(d) {
  if (current < 0) return;
  const n = neighbor(current, d);
  if (n < 0) return;
  current = n; fill(n);
  sheet.scrollTop = 0;
  inner.querySelectorAll(":scope > *").forEach(el => { el.style.animation = "none"; el.offsetWidth; el.style.animation = ""; });
}

/* ---------- copy ---------- */
async function copyPrompt() {
  const $ = id => inner.querySelector("#" + id);
  const topic = $("f-topic"), btn = $("copy"), label = btn.querySelector("span"), st = $("status");
  let bad = null;
  $("topic-err").hidden = !!S.topic.trim();
  if (!S.topic.trim()) bad = topic;
  const n = secs(), durBad = !S.voiceover && (n < 5 || n > 600);
  $("dur-err").hidden = !durBad;
  if (durBad && !bad) bad = $("f-sec");
  if (bad) { bad.classList.remove("bad"); bad.offsetWidth; bad.classList.add("bad"); bad.focus(); bad.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); return; }
  btn.disabled = true; label.textContent = "Salvando…";
  try {
    if (S.palette === "brand") {
      const r = await api("/api/marca", { nome: S.brandName, cores: { dominante: S.b1, destaque: S.b2, apoio: S.b3 } });
      BOOT.marca = r.marca;
    }
    await api("/api/projeto", {
      estilo: STYLES[current].id, tema: S.topic, storyboard: S.storyboard, narracao: S.voiceover, roteiro: S.script, legendas: S.subtitles,
      duracaoSegundos: n, vertical: S.vertical, musica: S.music, efeitos: S.sfx,
      paleta: ({ style: "estilo", brand: "marca", custom: "personalizada" })[S.palette] || "estilo",
      cores: { dominante: S.c1, destaque: S.c2, apoio: S.c3 }, testeDeEstilo: S.styleTest,
    });
    label.textContent = "Salvo"; btn.classList.add("ok");
    st.dataset.keep = "1"; st.innerHTML = "<b>Configuração salva</b> em projeto.json. Cole o comando abaixo no chat do agente.";
    $("cmdbox").hidden = false;
    setTimeout(() => { btn.classList.remove("ok"); label.textContent = "Salvar configuração"; delete st.dataset.keep; }, 2200);
  } catch (e) {
    label.textContent = "Salvar configuração"; st.textContent = e.message;
  }
  btn.disabled = false;
}
async function copiarComando() {
  const b = inner.querySelector("#copy-cmd"), t = inner.querySelector("#cmd").textContent;
  try { await navigator.clipboard.writeText(t); b.textContent = "Copiado"; }
  catch (e) { const r = document.createRange(); r.selectNodeContents(inner.querySelector("#cmd")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selecionado"; }
  setTimeout(() => { b.textContent = "Copiar comando"; }, 1600);
}
async function copiarPrompt() {
  const $ = id => inner.querySelector("#" + id), st = $("prompt-st");
  await copyPrompt();
  if ($("cmdbox").hidden) { st.textContent = "Preencha o que falta acima para salvar a configuração e gerar o prompt."; return; }
  st.textContent = "Montando o prompt…";
  try {
    const r = await fetch("/api/prompt"), j = await r.json();
    if (!r.ok) throw new Error(j.erro || "não consegui montar o prompt.");
    try { await navigator.clipboard.writeText(j.prompt); st.textContent = "Prompt copiado (" + (j.prompt.length / 1000).toFixed(0) + " mil caracteres)."; $("prompt-fallback").hidden = true; }
    catch (e) { const ta = $("prompt-text"); ta.value = j.prompt; $("prompt-fallback").hidden = false; ta.focus(); ta.select(); st.textContent = "O navegador bloqueou a área de transferência: o texto está selecionado abaixo, use Ctrl+C."; }
  } catch (e) { st.textContent = e.message; }
}
async function enviarMp3(arq) {
  const st = inner.querySelector("#mp3-st"); if (!arq) return;
  st.textContent = "Enviando…";
  try {
    const r = await fetch("/api/enviar?tipo=audio&nome=" + encodeURIComponent(arq.name), { method: "POST", headers: { "x-painel": "1" }, body: arq });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || "o envio falhou.");
    BOOT.narracao = { presente: true, megabytes: j.megabytes };
    st.textContent = "Arquivo atual: entrada/narracao.mp3 (" + j.megabytes + " MB). Enviar outro substitui este.";
  } catch (e) { st.textContent = "Erro: " + e.message; }
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const card = e.target.closest(".card, .start button");
  if (card && card.dataset.i === "new") return openCreator(card);
  if (card) return open(+card.dataset.i, card);
  if (e.target.closest("[data-close]") || e.target === scrim) return close();
  const s = e.target.closest("[data-step]");
  if (s) return step(+s.dataset.step);
  const tb = e.target.closest(".tip-btn");
  if (tb) {
    const box = tb.closest(".opt"), on = !box.classList.contains("tip-open");
    inner.querySelectorAll(".opt.tip-open").forEach(o => { o.classList.remove("tip-open"); o.querySelector(".tip-btn").setAttribute("aria-expanded", "false"); });
    if (on) { box.classList.add("tip-open"); tb.setAttribute("aria-expanded", "true"); }
    return;
  }
  if (!e.target.closest(".tip-body")) inner.querySelectorAll(".opt.tip-open").forEach(o => { o.classList.remove("tip-open"); o.querySelector(".tip-btn").setAttribute("aria-expanded", "false"); });
  if (e.target.closest("#copy")) { copyPrompt(); return; }
  if (e.target.closest("#copy-cmd")) { copiarComando(); return; }
  if (e.target.closest("#copy-prompt")) { copiarPrompt(); return; }
  if (e.target.closest("#use-dur")) { S.voiceover = false; const cb = inner.querySelector("#f-voiceover"); if (cb) cb.checked = false; refresh(); inner.querySelector("#f-sec")?.focus(); return; }
  if (e.target.closest("[data-example]")) {
    S.topic = STYLES[current].ex; const ta = inner.querySelector("#f-topic"); ta.value = S.topic; inner.querySelector("#topic-err").hidden = true; ta.classList.remove("bad"); refresh(); ta.focus(); return;
  }
  const pr = e.target.closest("[data-preset]");
  if (pr) { const v = +pr.dataset.preset; S.min = Math.floor(v / 60); S.sec = v % 60; inner.querySelector("#f-min").value = S.min; inner.querySelector("#f-sec").value = S.sec; inner.querySelector("#dur-err").hidden = true; refresh(); return; }
  if (e.target.closest("#playbtn")) {
    playing = !playing; const b = e.target.closest("#playbtn");
    b.textContent = playing ? "Pausar" : "Tocar"; b.setAttribute("aria-pressed", String(!playing));
    if (playing) startLive(current); else stopLive();
  }
});
document.addEventListener("input", e => {
  const id = e.target.id;
  if (id === "f-topic") { S.topic = e.target.value; if (S.topic.trim()) { inner.querySelector("#topic-err").hidden = true; e.target.classList.remove("bad"); } }
  else if (id === "f-script") S.script = e.target.value;
  else if (id === "f-min" || id === "f-sec") {
    let v = Math.max(0, Math.floor(+e.target.value || 0));
    if (id === "f-sec" && v > 59) { S.min = (+S.min || 0) + Math.floor(v / 60); v %= 60; inner.querySelector("#f-min").value = S.min; e.target.value = v; }
    S[id === "f-min" ? "min" : "sec"] = v;
    const n = secs(); if (n >= 5 && n <= 600) { inner.querySelector("#dur-err").hidden = true; e.target.classList.remove("bad"); }
  } else if (/^f-c[123]$/.test(id)) {
    const k = id.slice(2); S[k] = e.target.value; inner.querySelector("#v-" + k).textContent = S[k].toUpperCase();
    inner.querySelectorAll("#sw-custom i")[+k[1] - 1].style.background = S[k];
  } else if (id === "f-bn") { S.brandName = e.target.value; }
  else if (/^f-b[123]$/.test(id)) {
    const k = id.slice(2); S[k] = e.target.value; inner.querySelector("#v-" + k).textContent = S[k].toUpperCase();
    inner.querySelectorAll("#sw-brand i")[+k[1] - 1].style.background = S[k];
  } else return;
  refresh();
});
document.addEventListener("change", e => {
  if (e.target.id === "f-mp3") { enviarMp3(e.target.files[0]); e.target.value = ""; return; }
  const map = { "f-styletest": "styleTest", "f-storyboard": "storyboard", "f-voiceover": "voiceover", "f-subtitles": "subtitles", "f-music": "music", "f-sfx": "sfx" };
  if (map[e.target.id]) { S[map[e.target.id]] = e.target.checked; refresh(); return; }
  if (e.target.name === "fmt") { S.vertical = e.target.value === "v"; refresh(); }
  if (e.target.name === "pal") { S.palette = e.target.value; refresh(); }
});
document.addEventListener("submit", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (sheet.hidden) return;
  if (e.key === "Escape") {
    const openTip = inner.querySelector(".opt.tip-open");
    if (openTip) { openTip.classList.remove("tip-open"); openTip.querySelector(".tip-btn").setAttribute("aria-expanded", "false"); return; }
    e.preventDefault(); close();
  }
  if (e.key === "Tab") {
    const f = [...sheet.querySelectorAll("button:not([disabled]), a[href], input, textarea")].filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
document.addEventListener("visibilitychange", () => { if (document.hidden) stopLive(); else if (!sheet.hidden && playing && current >= 0) startLive(current); });

fontsReady().then(drawCards);

/* ---------- estilos a partir de vídeo: o vídeo é lido no navegador; só os quadros escolhidos são salvos na instalação ---------- */
const BASE_N = STYLES.length;
const SAVED = [];   // estilos salvos (todas as pessoas)
const IMG = {};
const CR = { picks: null, burst: [], pname: "", refining: false, manual: null, answer: "", reader: null, mode: "", loading: false, file: null, url: "", dur: 0, start: 0, end: 0, w: 0, h: 0, hint: "", busy: false, result: null, frames: [], metrics: null, err: "", stage: 0, chars: 0 };
let ctrl = null;

const plus = `<svg class="doodle" viewBox="0 0 40 40" width="46" height="46" aria-hidden="true"><path d="M20 6 C20 15 21 25 20 34"/><path d="M6 20 C15 19 26 21 34 20"/></svg>`;
const film = `<svg class="doodle" viewBox="0 0 48 36" width="54" height="40" aria-hidden="true"><rect x="3" y="4" width="42" height="28" rx="4"/><path d="M20 12 L31 18 L20 24 Z"/><path d="M3 10 H45 M3 26 H45"/></svg>`;

/* ---------- helpers ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmtS = n => (Math.round(n * 10) / 10).toFixed(1).replace(".", ",") + " s";
const hex = (r, g, b) => "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const safeTpl = s => String(s || "").replace(/\{\{/g, "{ {").replace(/\}\}/g, "} }");
function frameSrc(f) { return f; }
let redrawT = 0;
function getImg(f) {
  if (!IMG[f]) {
    const im = new Image(); im.decoding = "async";
    im.onload = () => { clearTimeout(redrawT); redrawT = setTimeout(redrawCustom, 60); };
    im.src = frameSrc(f); IMG[f] = im;
  }
  return IMG[f];
}

/* ---------- prévia: quadros da referência em cross-fade ---------- */
function drawCover(c, im, x, y, w, h, zoom) {
  const r = Math.max(w / im.naturalWidth, h / im.naturalHeight) * zoom;
  const dw = im.naturalWidth * r, dh = im.naturalHeight * r;
  c.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function drawFrame(c, im, zoom) {
  const ar = im.naturalWidth / im.naturalHeight;
  if (ar > 1.6) { drawCover(c, im, 0, 0, LW, LH, zoom); return; }
  // vídeo vertical ou quadrado: fundo desfocado + quadro inteiro no meio
  c.save(); try { c.filter = "blur(18px) brightness(.55)"; } catch (e) {}
  drawCover(c, im, -20, -20, LW + 40, LH + 40, 1.1); c.restore();
  const h = LH, w = h * ar; c.drawImage(im, (LW - w) / 2, 0, w, h);
}
function renderCustom(cv, s, t) {
  const [c] = scaled(cv);
  c.fillStyle = "#1B1430"; c.fillRect(0, 0, LW, LH);
  const fr = (s.frames || []).map(getImg).filter(im => im.complete && im.naturalWidth);
  if (!fr.length) {
    const cols = s.colors && s.colors.length ? s.colors : ["#7C3AED", "#39FF88", "#14C8B8"];
    cols.slice(0, 5).forEach((col, k, a) => { c.fillStyle = col; c.fillRect(k * LW / a.length, LH - 18, LW / a.length, 18); });
    txt(c, "carregando quadros…", LW / 2, LH / 2, "#CFC4E8", "center", "middle"); return;
  }
  const per = 1.9, fade = .55, n = fr.length;
  const k = Math.floor(t / per) % n, ph = (t % per) / per;
  c.globalAlpha = 1; drawFrame(c, fr[k], 1.02 + .05 * ph);
  const left = per - (t % per);
  if (n > 1 && left < fade && t > 0) { c.globalAlpha = 1 - left / fade; drawFrame(c, fr[(k + 1) % n], 1.02); c.globalAlpha = 1; }
}
function redrawCustom() {
  grid.querySelectorAll(".card[data-i]").forEach(card => { const s = STYLES[+card.dataset.i], cv = card.querySelector("canvas"); if (s && s.custom && cv) try { renderCustom(cv, s, 0); } catch (e) {} });
  if (!sheet.hidden && current >= 0 && STYLES[current] && STYLES[current].custom && (reduce || !playing)) startLive(current);
}

/* ---------- prompt completo de um estilo criado ---------- */

/* ---------- grade ---------- */
function creatorCard() {
  return `
  <li style="animation-delay:${.3 + Math.min(STYLES.length, 8) * .06}s">
    <button class="card new-card" type="button" data-i="new" aria-haspopup="dialog">
      <span class="shot drop-shot">${plus}<span>arraste um trecho de vídeo</span></span>
      <span class="card-top"><span class="n">+</span><span class="engine">vídeo de referência → template</span></span>
      <h2>Criar um estilo novo<small>a partir de um vídeo que você gostou</small></h2>
      <p>A página mede as cores e o ritmo do trecho, você marca como é o visual e o estilo fica pronto, igual aos de cima.</p>
      <span class="open-hint">Começar ${arrow}</span>
    </button>
  </li>`;
}

/* ---------- painel extra dentro de um estilo criado ---------- */

/* ---------- criador ---------- */
function openCreator(card) { open(-1, card); }
function stepper() {
  const st = ["Lendo cores, cortes e movimento", "Separando os quadros principais", "Reconhecendo o estilo"];
  return `<ol class="stages">${st.map((s, k) => `<li class="${CR.stage > k + 1 || (CR.stage === 4 && k === 3) ? "done" : CR.stage === k + 1 ? "on" : ""}">${s}${CR.stage === 3 && k === 2 && CR.chars ? ` <em>${(CR.chars / 1000).toFixed(1).replace(".", ",")} mil caracteres</em>` : ""}</li>`).join("")}</ol>`;
}
function creatorBody() {
  const r = CR.result;
  return `
    <div class="s-head">
      <span class="n">+</span>
      <div class="s-title"><h2 id="sheet-title">Novo estilo a partir de vídeo</h2><span class="engine">vídeo de referência → template</span></div>
      <button class="close" type="button" data-close aria-label="Fechar">
        <svg class="doodle" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 3 L17 17"/><path d="M17 3 L3 17"/></svg>
      </button>
    </div>
    <div class="setup">
      <span class="tape"></span>
      <h3>1. Escolha o trecho<span>De 5 a 30 segundos funciona melhor. O vídeo é lido aqui no seu navegador e não sai do seu computador. Só os quadros escolhidos ficam salvos no estilo.</span></h3>
      ${CR.loading ? `<div class="drop busy"><b>Abrindo o vídeo…</b><span>${esc(CR.file ? CR.file.name : "")}</span></div>` : CR.url ? `
        <div class="vbox">${CR.mode === "wc" ? `<canvas id="cr-poster" class="poster"></canvas>` : `<video id="cr-video" src="${CR.url}" controls muted playsinline preload="auto"></video>`}</div>
        ${CR.mode === "wc" ? `<p class="hint">Seu navegador não toca este vídeo aqui dentro, então ele é lido por um decodificador próprio. A análise funciona igual; a prévia mostra o quadro do início do trecho.</p>` : ""}
        <div class="trim">
          <label for="cr-start"><span class="k">Início (s)</span><input class="num" id="cr-start" type="number" min="0" step="0.1" value="${CR.start.toFixed(1)}"></label>
          <label for="cr-end"><span class="k">Fim (s)</span><input class="num" id="cr-end" type="number" min="0" step="0.1" value="${CR.end.toFixed(1)}"></label>
          ${CR.mode === "wc" ? "" : `<div class="trim-btns"><button type="button" class="mini" id="cr-setstart">Início = posição atual</button><button type="button" class="mini" id="cr-setend">Fim = posição atual</button></div>`}
          <p class="hint" id="cr-len">${trimText()}</p>
        </div>
        ${CR.result ? `<button type="button" class="linkish" id="cr-again">Criar de novo com outro trecho</button>` : ""}
        <button type="button" class="linkish" id="cr-change">Trocar o vídeo</button>` : `
        <label class="drop" id="cr-drop" for="cr-file">
          ${film}
          <b>Arraste o vídeo aqui</b>
          <span>ou clique para escolher · MP4, MOV ou WebM</span>
          <input type="file" id="cr-file" accept="video/*">
        </label>`}
      <p class="err" id="cr-err" ${CR.err ? "" : "hidden"}>${esc(CR.err)}</p>
    </div>

    ${CR.result ? "" : `
    <div class="setup">
      <span class="tape"></span>
      <h3>2. Criar o estilo<span>A página lê o trecho, reconhece o tipo de visual, o movimento, o texto e o acabamento, e monta o template sozinha. Leva alguns segundos.</span></h3>
      <div class="copy-row">
        <button class="copy-btn" type="button" id="cr-go" ${!CR.url || CR.loading || CR.busy ? "disabled" : ""}>${film}<span>${CR.busy ? "Criando…" : "Criar estilo"}</span></button>
        ${CR.busy ? `<button type="button" class="linkish" id="cr-cancel">Cancelar</button>` : ""}
      </div>
      ${CR.stage ? stepper() : ""}
    </div>`}

    ${r ? resultBlock(r) : ""}`;
}
function trimText() {
  const len = Math.max(0, CR.end - CR.start);
  if (len < 1.5) return "Trecho curto demais: escolha pelo menos 2 segundos.";
  if (len > 60) return `Trecho de ${fmtS(len)}. Só os primeiros 60 segundos serão analisados.`;
  return `Trecho de ${fmtS(len)} de um vídeo de ${fmtS(CR.dur)}.`;
}
function rerenderCreator(focusId) {
  if (current !== -1 || sheet.hidden) return;
  const y = sheet.scrollTop;
  inner.innerHTML = creatorBody(); creatorMounted();
  inner.querySelectorAll(":scope > *").forEach(el => el.style.animation = "none");
  sheet.scrollTop = y;
  if (focusId) inner.querySelector("#" + focusId)?.focus({ preventScroll: true });
}
function creatorMounted() {
  const drop = inner.querySelector("#cr-drop");
  if (drop) {
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
    drop.addEventListener("drop", e => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) loadVideo(f); });
  }
  const v = inner.querySelector("#cr-video");
  if (v) {
    v.addEventListener("loadedmetadata", () => { try { v.currentTime = CR.start; } catch (e) {} }, { once: true });
    v.addEventListener("error", () => switchToCodec(), { once: true });
  }
  if (inner.querySelector("#cr-poster")) drawPoster();
}
// soltar o vídeo em qualquer lugar da folha também funciona
sheet.addEventListener("dragover", e => { if (current === -1) e.preventDefault(); });
sheet.addEventListener("drop", e => { if (current !== -1) return; e.preventDefault(); const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) loadVideo(f); });

let loadTok = 0;
async function loadVideo(file) {
  const okType = file && ((file.type && /^video\//.test(file.type)) || /\.(mp4|m4v|mov|webm|mkv|3gp)$/i.test(file.name || ""));
  if (!okType) { CR.err = "Esse arquivo não parece um vídeo. Use MP4, MOV ou WebM."; return rerenderCreator(); }
  const tok = ++loadTok;
  if (CR.url) URL.revokeObjectURL(CR.url);
  if (CR.reader) CR.reader.close();
  Object.assign(CR, { file, url: URL.createObjectURL(file), reader: null, mode: "", loading: true, err: "", result: null, stage: 0, frames: [], burst: [], picks: null, metrics: null, manual: null, answer: "" });
  rerenderCreator();
  let meta = null;
  try { meta = await probeElement(CR.url); } catch (e) { meta = null; }
  if (tok !== loadTok) return;
  if (meta) {
    Object.assign(CR, { mode: "el", dur: meta.dur, w: meta.w, h: meta.h });
  } else {
    try {
      const r = await codecReader(file);
      if (tok !== loadTok) return;
      Object.assign(CR, { mode: "wc", reader: r, dur: r.dur, w: r.w, h: r.h });
    } catch (e) {
      if (tok !== loadTok) return;
      console.warn("leitura do vídeo falhou", e);
      URL.revokeObjectURL(CR.url);
      Object.assign(CR, { url: "", loading: false, err: readErr(e) });
      return rerenderCreator();
    }
  }
  CR.loading = false; CR.start = 0; CR.end = Math.min(CR.dur, 30);
  rerenderCreator("cr-hint");
}
// o player do navegador abriu os dados mas não toca: passa para o decodificador próprio
async function switchToCodec() {
  if (CR.mode !== "el" || !CR.file || CR.busy) return;
  try {
    const r = await codecReader(CR.file);
    Object.assign(CR, { mode: "wc", reader: r });
  } catch (e) { CR.err = readErr(e); }
  rerenderCreator();
}

/* ---------- leitores de vídeo: player do navegador, ou decodificador próprio (WebCodecs + mp4box) ---------- */
const MP4BOX_URL = "/painel/mp4box.js";
let mp4boxP = null;
function loadMp4box() {
  if (window.MP4Box && window.DataStream) return Promise.resolve();
  return mp4boxP || (mp4boxP = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = MP4BOX_URL; s.async = true;
    s.onload = () => (window.MP4Box ? res() : rej({ code: "lib" }));
    s.onerror = () => { mp4boxP = null; rej({ code: "lib" }); };
    document.head.appendChild(s);
  }));
}
function probeElement(url) {
  return new Promise((res, rej) => {
    const v = document.createElement("video"); let done = false;
    const end = (ok, val) => { if (done) return; done = true; clearTimeout(tm); v.removeAttribute("src"); v.load(); ok ? res(val) : rej(val); };
    const tm = setTimeout(() => end(false, { code: "video", detail: "timeout" }), 7000);
    v.muted = true; v.playsInline = true; v.preload = "metadata";
    v.onloadedmetadata = () => {
      if (!v.videoWidth || !isFinite(v.duration)) return end(false, { code: "video", detail: "no-image" });
      end(true, { dur: v.duration, w: v.videoWidth, h: v.videoHeight });
    };
    v.onerror = () => end(false, { code: "video", detail: v.error ? "media-" + v.error.code : "error" });
    v.src = url;
  });
}
function elementReader(url) {
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
  const ready = new Promise((res, rej) => {
    if (v.readyState >= 2) return res();
    v.onloadeddata = res; v.onerror = () => rej({ code: "video" }); setTimeout(res, 5000);
  });
  return {
    kind: "el",
    async sample(times, fn, signal) {
      await ready;
      for (const t of times) { if (signal && signal.aborted) throw { code: "cancelled" }; await seek(v, t); await fn(v, t); }
    },
    close() { v.removeAttribute("src"); v.load(); },
  };
}
async function codecReader(file) {
  if (typeof VideoDecoder === "undefined" || typeof EncodedVideoChunk === "undefined") throw { code: "nocodec", detail: "sem WebCodecs" };
  await loadMp4box();
  const buf = await file.arrayBuffer(); buf.fileStart = 0;
  const mp = MP4Box.createFile();
  let info = null, bad = null;
  mp.onReady = i => { info = i; }; mp.onError = e => { bad = e; };
  mp.appendBuffer(buf); mp.flush();
  if (!info) throw { code: "demux", detail: String(bad || "sem moov") };
  const tr = (info.videoTracks || [])[0];
  if (!tr) throw { code: "demux", detail: "sem faixa de vídeo" };
  const samples = [];
  mp.onSamples = (id, u, s) => { for (const x of s) samples.push(x); };
  mp.setExtractionOptions(tr.id, null, { nbSamples: 500 });
  mp.start(); mp.flush();
  if (!samples.length) throw { code: "demux", detail: "sem amostras" };
  let desc;
  const trak = mp.getTrackById(tr.id);
  for (const e of trak.mdia.minf.stbl.stsd.entries) {
    const box = e.avcC || e.hvcC || e.vpcC || e.av1C;
    if (box) { const ds = new DataStream(undefined, 0, DataStream.BIG_ENDIAN); box.write(ds); desc = new Uint8Array(ds.buffer, 8); break; }
  }
  const W0 = tr.video ? tr.video.width : tr.track_width, H0 = tr.video ? tr.video.height : tr.track_height;
  const config = { codec: tr.codec.startsWith("vp08") ? "vp8" : tr.codec, codedWidth: W0, codedHeight: H0 };
  if (desc) config.description = desc;
  const sup = await VideoDecoder.isConfigSupported(config).catch(() => ({ supported: false }));
  if (!sup.supported) throw { code: "nocodec", detail: tr.codec };
  const ts = tr.timescale, sec = s => s.cts / ts;
  const dur = tr.duration && tr.timescale ? tr.duration / tr.timescale : info.duration / info.timescale;
  return {
    kind: "wc", dur, w: W0, h: H0, codec: tr.codec,
    async sample(times, fn, signal) {
      if (!times.length) return;
      let i = 0;
      for (let j = 0; j < samples.length; j++) if (samples[j].is_sync && sec(samples[j]) <= times[0] + 1e-3) i = j;
      const endT = times[times.length - 1], out = [];
      let err = null, wake = null, fed = false, flushed = false, k = 0, lastF = null;
      const poke = () => { const w = wake; wake = null; w && w(); };
      const dec = new VideoDecoder({ output: f => { out.push(f); poke(); }, error: e => { err = e; poke(); } });
      dec.configure(config);
      const wait = () => new Promise(r => { wake = r; setTimeout(poke, 60); });
      try {
        while (k < times.length) {
          if (signal && signal.aborted) throw { code: "cancelled" };
          if (err) throw { code: "decode", detail: String(err && err.message || err) };
          while (!fed && dec.decodeQueueSize < 6 && out.length < 6) {
            if (i >= samples.length || (samples[i].is_sync && sec(samples[i]) > endT + 1)) {
              fed = true; dec.flush().then(() => { flushed = true; poke(); }, e => { err = err || e; flushed = true; poke(); });
              break;
            }
            const s = samples[i++];
            dec.decode(new EncodedVideoChunk({ type: s.is_sync ? "key" : "delta", timestamp: Math.round(s.cts * 1e6 / ts), duration: Math.round(s.duration * 1e6 / ts), data: s.data }));
          }
          while (out.length && k < times.length) {
            const f = out.shift(), fend = (f.timestamp + (f.duration || 33334)) / 1e6;
            while (k < times.length && times[k] < fend) { await fn(f, times[k]); k++; }
            if (lastF) lastF.close();
            lastF = f;
          }
          if (k >= times.length) break;
          if (fed && flushed && !out.length) {
            if (!lastF) throw { code: "decode", detail: "nenhum quadro" };
            while (k < times.length) { await fn(lastF, times[k]); k++; }
            break;
          }
          if (!out.length) await wait();
        }
      } finally {
        out.forEach(f => f.close()); if (lastF) lastF.close();
        try { dec.close(); } catch (e) {}
      }
    },
    close() {},
  };
}
function readErr(e) {
  const c = e && e.code;
  if (c === "nocodec") return `Seu navegador não tem decodificador para este vídeo${e.detail && e.detail !== "sem WebCodecs" ? ` (codec ${e.detail})` : ""}. Exporte o trecho em MP4 H.264, ou abra o sistema no Chrome ou Edge atualizados.`;
  if (c === "lib") return "Seu navegador não tocou este vídeo e não consegui carregar o leitor alternativo. Confira a internet e tente de novo.";
  if (c === "demux") return "Não consegui abrir este arquivo. Ele pode estar incompleto ou não ser MP4/MOV. Tente exportar o trecho de novo em MP4.";
  if (c === "decode") return "O vídeo abriu, mas não consegui decodificar os quadros. Exporte o trecho em MP4 H.264 e tente de novo.";
  return "Não consegui ler este vídeo. Exporte o trecho em MP4 H.264 e tente de novo.";
}
async function drawPoster() {
  const cv = inner.querySelector("#cr-poster"); if (!cv || !CR.reader) return;
  const tok = (drawPoster.tok = (drawPoster.tok || 0) + 1);
  const w = 960, h = Math.round(w * CR.h / CR.w); 
  try {
    await CR.reader.sample([Math.min(Math.max(0, CR.start), Math.max(0, CR.dur - .05))], f => {
      if (tok !== drawPoster.tok) return;
      cv.width = w; cv.height = h; cv.getContext("2d").drawImage(f, 0, 0, w, h);
    });
  } catch (e) {}
}

/* ---------- leitura do vídeo ---------- */
function seek(v, t) {
  return new Promise(res => {
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    v.addEventListener("seeked", fin, { once: true }); setTimeout(fin, 2500);
    v.currentTime = Math.min(Math.max(0, t), Math.max(0, (v.duration || t) - .05));
  });
}
async function readMotion(reader, a, b, signal) {
  const len = b - a, n = Math.round(clamp(len * 8, 24, 220)), dt = len / n;
  const W = 64, H = Math.max(18, Math.round(64 * CR.h / CR.w)) | 0;
  const cv = mk(W, H), c = cv.getContext("2d", { willReadFrequently: true });
  const diffs = [], dists = [], times = [], pix = [], covs = [], thins = [], glows = [];
  let prevG = null, prevH = null, prevD = null, bri = 0, sat = 0, cnt = 0;
  const ts = Array.from({ length: n }, (_, i) => a + i * dt);
  let i = -1;
  await reader.sample(ts, (src, t) => {
    i++;
    c.clearRect(0, 0, W, H);
    let d;
    try { c.drawImage(src, 0, 0, W, H); d = c.getImageData(0, 0, W, H).data; } catch (e) { throw { code: "video", detail: String(e && e.name) }; }
    if (i === 0) { let op = 0; for (let p = 3; p < d.length; p += 4) if (d[p]) op++; if (op < d.length / 8) throw { code: "video", detail: "quadro vazio" }; }
    const g = new Float32Array(W * H), hist = new Float32Array(64);
    for (let p = 0, q = 0; p < d.length; p += 4, q++) {
      const R = d[p], G = d[p + 1], B = d[p + 2];
      g[q] = .299 * R + .587 * G + .114 * B;
      hist[(R >> 6) * 16 + (G >> 6) * 4 + (B >> 6)]++;
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      bri += g[q]; sat += mx ? (mx - mn) / mx : 0; cnt++;
      if ((q & 7) === 0) pix.push(R, G, B);
    }
    if (prevG) {
      let s = 0; for (let q = 0; q < g.length; q++) s += Math.abs(g[q] - prevG[q]);
      let hd = 0; for (let k = 0; k < 64; k++) hd += Math.abs(hist[k] - prevH[k]);
      diffs.push(s / g.length); dists.push(hd / (2 * g.length)); times.push(t);
      // que tipo de mudança: a imagem toda (câmera) ou partes (elementos), finas (traços) ou que acendem
      const mask = new Uint8Array(W * H); let ch = 0, gl = 0, er = 0;
      for (let q = 0, p = 0; q < g.length; q++, p += 4) {
        if (Math.abs(g[q] - prevG[q]) > 18) {
          mask[q] = 1; ch++;
          const mxN = Math.max(d[p], d[p + 1], d[p + 2]), mnN = Math.min(d[p], d[p + 1], d[p + 2]), mxO = Math.max(prevD[p], prevD[p + 1], prevD[p + 2]), mnO = Math.min(prevD[p], prevD[p + 1], prevD[p + 2]);
          const sN = mxN ? (mxN - mnN) / mxN : 0, sO = mxO ? (mxO - mnO) / mxO : 0;
          if (sN - sO > .12 || (g[q] - prevG[q] > 22 && sN > .3)) gl++;
        }
      }
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const q = y * W + x; if (mask[q] && mask[q - 1] && mask[q + 1] && mask[q - W] && mask[q + W]) er++; }
      covs.push(ch / g.length); thins.push(ch ? 1 - er / ch : 0); glows.push(ch ? gl / ch : 0);
    }
    prevG = g; prevH = hist; prevD = d.slice();
    if (i % 6 === 0) { CR.chars = 0; const el = inner.querySelector(".stages li.on"); if (el) el.dataset.p = Math.round(i / n * 100) + "%"; }
  }, signal);
  // cortes: salto grande de cor e de brilho ao mesmo tempo
  const cuts = []; let last = -9;
  dists.forEach((h, k) => { if (h > .34 && diffs[k] > 16 && times[k] - last > .3) { cuts.push(times[k]); last = times[k]; } });
  const moving = diffs.filter((d, k) => !cuts.includes(times[k]));
  const mean = moving.reduce((x, y) => x + y, 0) / Math.max(1, moving.length);
  const sd = Math.sqrt(moving.reduce((x, y) => x + (y - mean) ** 2, 0) / Math.max(1, moving.length));
  const stat = moving.filter(d => d < 1.2).length / Math.max(1, moving.length);
  let peak = a, pv = -1; diffs.forEach((d, k) => { if (!cuts.includes(times[k]) && d > pv) { pv = d; peak = times[k]; } });
  const shots = cuts.length + 1;
  const motion = mean / 2.55; // 0..100
  const mv = diffs.map((dd, k) => k).filter(k => !cuts.includes(times[k]) && diffs[k] > 1.2);
  const loc = mv.filter(k => covs[k] > .002 && covs[k] < .3);
  const avgOf = (arr, ks) => ks.length ? ks.reduce((x, k) => x + arr[k], 0) / ks.length : 0;
  let steps = 0; for (let k = 1; k < diffs.length; k++) if ((diffs[k] < .6) !== (diffs[k - 1] < .6)) steps++;
  const traits = { camRatio: mv.length ? mv.filter(k => covs[k] > .45).length / mv.length : 0, localRatio: mv.length ? loc.length / mv.length : 0, thinAvg: avgOf(thins, loc), glowAvg: avgOf(glows, loc), stepRatio: diffs.length ? steps / diffs.length : 0, movingRatio: diffs.length ? mv.length / diffs.length : 0 };
  const motionLabel = motion < 2 ? "muito calmo" : motion < 5 ? "calmo" : motion < 10 ? "moderado" : motion < 18 ? "intenso" : "muito intenso";
  return {
    traits, len, shots, cuts, avgShot: len / shots, cutsPerMin: cuts.length / len * 60, motion, motionSd: sd / 2.55, staticPct: stat * 100, peak,
    brightness: bri / cnt / 2.55, saturation: sat / cnt * 100, colors: dominant(pix), motionLabel,
    aspect: CR.w > CR.h * 1.2 ? "Horizontal" : CR.h > CR.w * 1.2 ? "Vertical" : "Quadrado", w: CR.w, h: CR.h,
  };
}
function dominant(pix) {
  const box = new Map();
  for (let i = 0; i < pix.length; i += 3) {
    const k = (pix[i] >> 4) << 8 | (pix[i + 1] >> 4) << 4 | (pix[i + 2] >> 4);
    const e = box.get(k) || [0, 0, 0, 0]; e[0] += pix[i]; e[1] += pix[i + 1]; e[2] += pix[i + 2]; e[3]++; box.set(k, e);
  }
  const all = [...box.values()].sort((x, y) => y[3] - x[3]).map(e => [e[0] / e[3], e[1] / e[3], e[2] / e[3], e[3]]);
  const out = [];
  for (const c of all) {
    if (out.every(o => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) > 46)) out.push(c);
    if (out.length >= 7) break;
  }
  const tot = pix.length / 3;
  return out.map(c => ({ hex: hex(c[0], c[1], c[2]), pct: Math.round(c[3] / tot * 100) }));
}
function pickTimes(m, a, b, k) {
  const bounds = [a, ...m.cuts, b], shots = [];
  for (let i = 0; i < bounds.length - 1; i++) shots.push({ s: bounds[i], e: bounds[i + 1] });
  let pick = shots.slice().sort((x, y) => (y.e - y.s) - (x.e - x.s)).slice(0, k).map(s => (s.s + s.e) / 2);
  for (let j = 1; pick.length < k && j < 40; j++) {
    const t = a + (b - a) * ((j * .618) % 1);
    if (pick.every(p => Math.abs(p - t) > (b - a) / (k * 2.2))) pick.push(t);
  }
  return pick.slice(0, k).sort((x, y) => x - y);
}
async function grab(reader, times, w, q, signal) {
  const h = Math.round(w * CR.h / CR.w), res = [];
  await reader.sample(times, async (src, t) => {
    const cv = mk(w, h); cv.getContext("2d").drawImage(src, 0, 0, w, h);
    const blob = await new Promise(r => cv.toBlob(r, "image/jpeg", q));
    if (!blob) throw { code: "video", detail: "toBlob" };
    res.push({ t, blob, url: URL.createObjectURL(blob) });
  }, signal);
  return res;
}

/* ---------- medidas do trecho ---------- */
function metricsText(m) {
  const cols = m.colors.map(c => `${c.hex} (~${c.pct}%)`).join(", ");
  return [
    `- Clip analysed: ${m.len.toFixed(1)} s, ${m.aspect.toLowerCase()} (${m.w} × ${m.h})`,
    `- Shots: ${m.shots} (${m.cuts.length} hard cuts, about ${m.cutsPerMin.toFixed(0)} cuts per minute, average shot ${m.avgShot.toFixed(1)} s)`,
    `- Motion energy: ${m.motion.toFixed(1)} / 100 (${({ "muito calmo": "very calm", calmo: "calm", moderado: "moderate", intenso: "intense", "muito intenso": "very intense" })[m.motionLabel]}), variability ${m.motionSd.toFixed(1)}, about ${m.staticPct.toFixed(0)}% of sampled moments nearly still`,
    `- Average brightness ${m.brightness.toFixed(0)} / 100, average saturation ${m.saturation.toFixed(0)} / 100`,
    `- Dominant colours: ${cols}`,
  ].join("\n");
}
const TYPES = {
  match: { label: "Fiel à referência", sub: "estilo do vídeo", engine: "Canvas 2D · fiel à referência", en: "reference-matched",
    dir: "The visual language is defined by the reference sheet: reproduce its kind of imagery (illustration, photo-like, map, typography, 3D or drawn), its shape language, materials and level of detail as closely as code allows, with original content for the user's topic.",
    tech: "Choose the renderer that best reproduces the reference (Canvas 2D for flat, drawn or textured looks; WebGL/Three.js for real depth), with cached textures and a deterministic renderAt(t) clock.",
    teaser: "O visual do vídeo de referência recriado para o seu tema.", best: "Quando você quer o mesmo jeito do vídeo que inspirou o estilo.", ex: "Explique um tema do seu canal no mesmo estilo do vídeo de referência." },
  flat: { label: "Ilustração flat", sub: "vetor plano", engine: "Canvas 2D · vetores", en: "flat 2D vector illustration",
    dir: "Flat 2D vector illustration. Build every object from clean geometric primitives (circles, rounded rectangles, simple paths) with solid fills, at most one subtle gradient per object, and either no outlines or one thin consistent outline weight. Characters and props are simplified but specific: recognizable silhouettes, a few internal details, consistent corner radii. Compositions are tidy and centred on one idea at a time, with generous negative space.",
    tech: "Canvas 2D with a small scene graph of reusable vector components (Path2D cached once), a deterministic renderAt(t) clock and eased property tweens. SVG-like crispness at any resolution.",
    teaser: "Ilustrações planas e limpas que se montam e explicam o tema.", best: "Explicações de processos, produtos, educação e tecnologia.", ex: "Explique como a energia solar chega até a tomada de casa, mostrando o caminho da luz até a eletricidade." },
  "3d": { label: "3D estilizado", sub: "volumes suaves", engine: "Three.js · luz suave", en: "stylized soft 3D",
    dir: "Stylized 3D look with soft, rounded volumes, gentle bevels and a toy-like scale. One warm key light and a cool fill, soft contact shadows, light ambient occlusion, matte materials with a slight sheen on accents. Objects sit on simple floors or float in clean space; depth is used to separate ideas.",
    tech: "Three.js with an orthographic or low-FOV perspective camera, MeshStandardMaterial, soft shadows (PCFSoft) and baked-looking gradients; fall back to layered Canvas 2D shading if WebGL is unavailable.",
    teaser: "Objetos 3D arredondados, com luz suave, que giram e se encaixam.", best: "Produtos, tecnologia, ciência e qualquer tema com objetos físicos.", ex: "Mostre por dentro como funciona um motor elétrico, peça por peça." },
  paper: { label: "Recorte e colagem", sub: "papel em camadas", engine: "Canvas 2D · texturas de papel", en: "paper cut-out collage",
    dir: "Paper cut-out and collage. Every element is a cut shape with slightly irregular, hand-cut edges, a visible paper-fibre texture and a soft drop shadow that reveals stacked layers. Mix flat coloured papers with a few photo-like or printed scraps, tape pieces and labels. Motion has a handmade stop-motion cadence.",
    tech: "Canvas 2D with procedurally roughened polygons (seeded jitter along edges), a cached fibre-noise texture multiplied over each piece, offset shadows, and time quantised to 12 fps steps for the paper pieces.",
    teaser: "Peças de papel recortado que deslizam, dobram e se encaixam.", best: "Histórias, curiosidades, educação e temas leves.", ex: "Explique como funciona a reciclagem do papel, do lixo até um caderno novo." },
  map: { label: "Mapa e satélite", sub: "documentário cartográfico", engine: "Canvas 2D · relevo procedural", en: "documentary satellite map",
    dir: "Documentary cartography. A satellite-like terrain base generated procedurally (relief shading from layered noise, darker oceans, coastlines, rivers), regions highlighted with translucent colour fills and glowing borders, animated routes drawn as lines, pins and markers, dates and place labels styled like a history documentary. The camera flies over the map, zooming into regions and pulling back to show context.",
    tech: "Canvas 2D: a cached procedural terrain texture (fractal noise + hillshade), vector region shapes drawn over it with feathered glows, a 2D camera (pan/zoom with eased transforms), animated stroke-dashoffset routes. Draw approximate, stylised geography from the topic; never pretend to be an exact map.",
    teaser: "Voos sobre o mapa, regiões que acendem e rotas que se desenham.", best: "História, geografia, curiosidades sobre lugares e explicações com território.", ex: "Explique por que o Brasil tem esse formato, mostrando como as fronteiras foram desenhadas ao longo do tempo." },
  type: { label: "Tipografia em movimento", sub: "texto como protagonista", engine: "Canvas 2D · tipografia cinética", en: "kinetic typography",
    dir: "Kinetic typography. Words are the main visual: large, bold type that slides, scales, stacks and snaps into layouts, with one keyword at a time highlighted by colour, underline or a box. Supporting graphics are minimal icons and simple shapes that frame the words.",
    tech: "Canvas 2D text with measured layouts (measureText), per-word and per-letter tweens, masks for reveals, and loaded web fonts before rendering.",
    teaser: "Palavras grandes que entram, pulam e se reorganizam no ritmo.", best: "Frases de impacto, listas, dados rápidos e vídeos curtos.", ex: "Mostre os 5 erros mais comuns de quem começa a investir, um por vez." },
  hand: { label: "Desenho à mão", sub: "traço vivo", engine: "Canvas 2D · traço irregular", en: "hand-drawn sketch",
    dir: "Hand-drawn sketch style. Lines look drawn with a marker, pencil or chalk: slightly wobbly strokes with varying pressure, loose hatching for shading, imperfect circles, handwritten-looking labels. Drawings appear by being drawn stroke by stroke, then get coloured with loose fills that do not perfectly match the lines.",
    tech: "Canvas 2D with seeded jittered polylines (two passes per stroke for a sketchy look), stroke-reveal by path length, and a paper or board texture underneath.",
    teaser: "Desenhos que se fazem na hora, com traço de caneta e anotações.", best: "Aulas, explicações passo a passo e ideias abstratas.", ex: "Explique como o coração bombeia o sangue, desenhando cada parte enquanto fala." },
  pixel: { label: "Pixel art", sub: "retrô 8/16-bit", engine: "Canvas 2D · grade de pixels", en: "retro pixel art",
    dir: "Retro pixel art. Everything is drawn on a coarse pixel grid with a limited palette, hard edges and no anti-aliasing, game-like sprites, tiles and UI boxes, chunky pixel fonts. Animation uses few frames per action and integer pixel movement.",
    tech: "Render to a small offscreen canvas (e.g. 320×180 or 180×320) and scale up with imageSmoothingEnabled = false; sprites as small pixel arrays; time stepped at 8–12 fps for sprites.",
    teaser: "Sprites e cenários de videogame antigo explicando o tema.", best: "Tecnologia, games, programação e temas descontraídos.", ex: "Explique como funciona a memória de um computador como se fosse uma fase de videogame." },
  mixed: { label: "Grafismos sobre fundo", sub: "mídia mista", engine: "Canvas 2D · camadas e máscaras", en: "mixed-media graphics over rich backgrounds",
    dir: "Mixed media. Rich, photographic-feeling backgrounds faked with code (deep gradients, blurred shapes, noise, vignettes and light leaks) under bold graphic overlays: callout boxes, arrows, highlights, cut-out shapes and data graphics. Layers move at different speeds for depth.",
    tech: "Canvas 2D with layered compositing: blurred gradient fields, cached noise, masks for reveals, and crisp vector overlays drawn on top.",
    teaser: "Fundos ricos com grafismos, setas e destaques por cima.", best: "Notícias, documentários curtos, curiosidades e explicações rápidas.", ex: "Explique por que o céu fica laranja no pôr do sol, com grafismos sobre a paisagem." },
};
const MOTIONS = {
  cuts: ["Cortes rápidos", "Hard cuts between compositions on the beat; each new shot reframes the same idea from a new angle or zoom level instead of starting from scratch."],
  zoom: ["Câmera com zoom e viagens", "A continuous virtual camera: slow push-ins on details, pull-backs to reveal context and lateral travels between areas, always eased (no linear moves)."],
  pop: ["Elementos surgem com pulo", "Elements enter with a quick scale-up overshoot (about 0→110→100% in 0.25–0.35 s) and small follow-through, staggered by 50–80 ms."],
  wipe: ["Deslizar e varrer", "Transitions slide or wipe across the frame (directional masks and push transitions) so one scene pushes the next out."],
  morph: ["Formas que se transformam", "Shapes morph into the next idea (a circle becomes a pie chart, an icon becomes a map region), keeping continuity between scenes."],
  draw: ["Linhas que se desenham", "Lines, routes and outlines draw themselves on (stroke reveal by path length) before fills appear."],
  stop: ["Tremido / stop-motion", "A slight handmade jitter: positions update in steps (12 fps) with tiny random offsets so things feel physically animated."],
  parallax: ["Camadas em parallax", "Foreground, middle and background layers move at different speeds during camera moves to create depth."],
  glow: ["Regiões que acendem", "Areas light up: colour fills fade in with a soft glow and pulsing borders to point at what is being explained."],
};
const TEXTS = {
  caption: ["Legenda grande, palavra destacada", "Large bold captions, two to four words at a time, centred in the lower-middle area; the key word of each phrase is highlighted in the accent colour. Caption timing follows the narration closely."],
  labels: ["Títulos e rótulos", "Short titles and clean labels attached to the objects they describe (leader lines, tags, small boxes); numbers and dates are emphasised."],
  minimal: ["Pouco texto", "Very little text: only essential labels or a single number. The images carry the explanation."],
  hero: ["A tipografia é a estrela", "Typography is the hero: oversized words fill the frame, interact with shapes and are animated per word or per letter."],
};
const FINISHES = {
  grain: ["Textura / granulado", "A fine grain or paper texture over the whole frame (seeded, stable per frame) so nothing looks sterile."],
  neon: ["Brilho neon", "Accents glow: additive light, soft bloom around lines and highlighted shapes against darker areas."],
  soft: ["Sombras suaves", "Soft, diffuse drop shadows separate layers and give gentle depth."],
  outline: ["Contorno grosso", "Thick, confident outlines around main shapes and characters."],
  clean: ["Plano e limpo", "Clean and flat: no noise, crisp edges, precise alignment and plenty of breathing room."],
  cine: ["Look cinematográfico", "Cinematic finish: subtle vignette, slight film grain, gentle contrast curve and occasional light leaks."],
};
function suggestPicks(m) {
  const motion = [];
  if (m.cutsPerMin > 18) motion.push("cuts");
  if (m.motion < 6 || m.staticPct > 45) motion.push("zoom");
  if (m.motion > 9) motion.push("pop");
  if (!motion.length) motion.push("zoom");
  const finish = [];
  if (m.saturation > 55 && m.brightness < 42) finish.push("neon");
  if (m.brightness < 35) finish.push("cine");
  if (!finish.length) finish.push(m.saturation < 30 ? "grain" : "clean");
  return { type: "", motion, text: m.aspect === "Vertical" ? "caption" : "labels", finish };
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function lum(h) { const c = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function satOf(h) { const [r, g, b] = hexRgb(h), mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; }
function paletteRoles(cols) {
  const list = cols.slice(0, 7), bg = list[0] ? list[0].hex : "#111111";
  let text = list.slice(1).map(c => c.hex).sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
  if (!text || contrast(text, bg) < 4.5) text = lum(bg) > .4 ? "#141414" : "#FFFFFF";
  const accents = list.slice(1).map(c => c.hex).filter(h => h !== text).sort((a, b) => satOf(b) - satOf(a)).slice(0, 3);
  return { bg, text, accents, all: list };
}
const slug = s => String(s || "estilo").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "estilo";
function localTemplate(m, picks, nameIn) {
  const T = TYPES[picks.type] || TYPES.flat, pal = paletteRoles(m.colors);
  const dark = m.brightness < 40, bright = m.brightness > 65, vivid = m.saturation > 55, muted = m.saturation < 28;
  const pace = m.avgShot < 2 ? "rápido" : m.avgShot < 5 ? "médio" : "calmo";
  const paceEn = m.avgShot < 2 ? "fast" : m.avgShot < 5 ? "medium" : "calm";
  const mot = picks.motion.filter(k => MOTIONS[k]), fin = picks.finish.filter(k => FINISHES[k]), tx = TEXTS[picks.text] || TEXTS.labels;
  const name = (nameIn || "").trim() || `${T.label} ${fin.includes("neon") ? "Neon" : dark ? "Noturno" : vivid ? "Vibrante" : "Suave"}`;
  const shotEvery = Math.max(.8, Math.min(8, m.avgShot)).toFixed(1);
  const energyEn = m.motion < 3 ? "very calm" : m.motion < 6 ? "calm" : m.motion < 11 ? "moderate" : m.motion < 18 ? "energetic" : "very energetic";
  const direction = [
    "## How to use this direction",
    "This is a measured starting point. The attached reference sheet (see section 0) is the real source of truth: where this text and the frames disagree, follow the frames.",
    "",
    "## Art direction and palette",
    `- Base / background: ${pal.bg} (the most present colour in the clip)`,
    `- Main text and key lines: ${pal.text}`,
    pal.accents.length ? `- Accents for highlights, routes, keywords and data: ${pal.accents.join(", ")}` : "",
    `- Full measured palette: ${pal.all.map(c => `${c.hex} (~${c.pct}%)`).join(", ")}`,
    `Overall the image is ${dark ? "dark" : bright ? "bright" : "mid-toned"} (brightness ${m.brightness.toFixed(0)}/100) and ${vivid ? "vivid" : muted ? "muted" : "balanced"} (saturation ${m.saturation.toFixed(0)}/100). Keep that balance: accents occupy a small share of the frame and are reserved for what matters.`,
    "",
    "## Visual language",
    T.dir,
    ...(m.look ? ["", "Measured from the frames: " + m.look] : []),
    "",
    "## Materials, texture and finish",
    ...fin.map(k => FINISHES[k][1]),
    "",
    "## Typography and on-screen text",
    tx[1],
    `The reference is ${m.aspect.toLowerCase()} (${m.w} × ${m.h}); when the configured format differs, recompose for that format instead of cropping.`,
    "",
    "## Signature motion vocabulary",
    ...(mot.length ? mot.map(k => "- " + MOTIONS[k][1]) : ["- Smooth eased moves; one main action at a time."]),
    "",
    "## Pacing and rhythm",
    `The reference changes its main composition about every ${shotEvery} s (${m.shots} shot${m.shots > 1 ? "s" : ""} in ${m.len.toFixed(1)} s, about ${m.cutsPerMin.toFixed(0)} cuts per minute). Motion energy is ${energyEn} (${m.motion.toFixed(1)}/100) and roughly ${m.staticPct.toFixed(0)}% of moments are nearly still. Match this ${paceEn} rhythm: ${paceEn === "fast" ? "new information every beat, short holds of 0.4–0.8 s on key words" : paceEn === "medium" ? "a new idea every few seconds, holds of about 1 s on key information" : "long continuous moves, holds of 1.5–2.5 s so details can be read"}.`,
    "",
    "## Transitions",
    mot.includes("cuts") ? "Mostly hard cuts on the beat, with an occasional continuous camera move to connect related ideas." : mot.includes("wipe") ? "Directional wipes and push transitions that keep a consistent direction for forward progress." : mot.includes("morph") ? "Morph transitions: the last shape of one idea becomes the first shape of the next." : "Continuous transitions: the camera travels from one idea to the next inside the same world, with no hard cuts.",
    "",
    "## Camera",
    mot.includes("zoom") || mot.includes("parallax") ? "A virtual camera is always gently alive: slow push-ins on details and pull-backs for context, eased in and out, never static for long." : "Mostly locked framing with occasional eased reframes to focus on the active element.",
    "",
    "## Information graphics in this style",
    `Charts, maps, numbers and diagrams use the same ${T.en} language and palette: accents mark the data that matters, labels follow the typography rule above, and graphics build up step by step with the motion vocabulary.`,
    "",
    "## Technical approach",
    T.tech,
    "",
    "## MUSIC DIRECTION",
    m.motion > 10 || paceEn === "fast" ? "Upbeat, rhythmic instrumental (around 110–128 BPM) with a clear pulse that the cuts and pops can lock to." : paceEn === "calm" ? "Calm, atmospheric instrumental (around 70–90 BPM): soft pads and a gentle pulse, documentary feel." : "Mid-tempo instrumental (around 95–110 BPM), light percussion and warm synths, curious and positive.",
    "",
    "## SOUND DIRECTION",
    `Short, tasteful accents matched to the motion: ${[mot.includes("pop") && "soft pops for elements appearing", (mot.includes("wipe") || mot.includes("zoom")) && "airy whooshes for camera moves and wipes", mot.includes("draw") && "light scratch or pen sounds for lines drawing on", mot.includes("glow") && "subtle shimmer when regions light up", mot.includes("cuts") && "a crisp tick on hard cuts"].filter(Boolean).join(", ") || "soft whooshes for transitions and light clicks for labels"}. Keep them below the music and narration.`,
    "",
    "## What to avoid",
    "Generic slide-deck layouts, random motion that does not explain anything, colours outside the palette, cluttered frames with several things moving at once, and copying the reference clip's content.",
  ].filter(x => x !== false).join("\n");
  const motPt = mot.map(k => MOTIONS[k][0].toLowerCase());
  return {
    name: name.slice(0, 60), sub: T.sub, engine: T.engine, teaser: T.teaser,
    looks: `Paleta ${dark ? "escura" : bright ? "clara" : "média"} e ${vivid ? "vibrante" : muted ? "contida" : "equilibrada"}, tirada do vídeo. ${motPt.length ? "Movimento: " + motPt.join(", ") + "." : ""} Ritmo ${pace}: uma composição nova a cada ${shotEvery.replace(".", ",")} s, em média.`,
    best: T.best,
    know: "Criado a partir das medidas do vídeo e das suas escolhas. A folha de referência fica salva com o estilo: o agente estuda os quadros e copia o acabamento com mais fidelidade.",
    ex: T.ex, styleLabel: `${T.en}${fin.length ? ", " + fin.map(k => FINISHES[k][0].toLowerCase()).join(", ") : ""} (reference-derived)`,
    summary: `A ${T.en} explainer style with a ${dark ? "dark" : bright ? "bright" : "mid-toned"}, ${vivid ? "vivid" : muted ? "muted" : "balanced"} palette taken from a reference clip, ${paceEn} pacing and ${mot.length ? mot.map(k => MOTIONS[k][0]).length + " signature motion traits" : "smooth eased motion"} described below.`,
    colors: [pal.bg, pal.text, ...pal.accents].filter((c, i, a) => a.indexOf(c) === i).slice(0, 6),
    px: picks.type === "pixel", direction, origin: "local",
  };
}
function pickChips() {
  const P = CR.picks, chipsOf = (obj, sel, attr, multi) => Object.entries(obj).map(([k, v]) => {
    const on = multi ? sel.includes(k) : sel === k;
    return `<button type="button" class="chip pick" data-${attr}="${k}" aria-pressed="${on}">${esc(Array.isArray(v) ? v[0] : v.label)}</button>`;
  }).join("");
  return `<div class="adjust-in">
      <div class="pick-g"><span class="k">Tipo de visual</span><div class="chips">${chipsOf(TYPES, P.type, "ptype", false)}</div></div>
      <div class="pick-g"><span class="k">Movimento</span><div class="chips">${chipsOf(MOTIONS, P.motion, "pmot", true)}</div></div>
      <div class="pick-g"><span class="k">Texto na tela</span><div class="chips">${chipsOf(TEXTS, P.text, "ptext", false)}</div></div>
      <div class="pick-g"><span class="k">Acabamento</span><div class="chips">${chipsOf(FINISHES, P.finish, "pfin", true)}</div></div>
      <p class="hint">Cada clique atualiza o template na hora.</p></div>`;
}
function detectedLine() {
  const P = CR.picks, parts = [TYPES[P.type] && TYPES[P.type].label, ...P.motion.map(k => MOTIONS[k] && MOTIONS[k][0]), TEXTS[P.text] && TEXTS[P.text][0], ...P.finish.map(k => FINISHES[k] && FINISHES[k][0])].filter(Boolean);
  return `<div class="detected"><span class="k">Detectado no vídeo</span><span class="summary">${parts.map(t => `<span>${esc(t)}</span>`).join("")}</span></div>`;
}
function picksBlock() {
  const P = CR.picks, chipsOf = (obj, sel, attr, multi) => Object.entries(obj).map(([k, v]) => {
    const on = multi ? sel.includes(k) : sel === k;
    return `<button type="button" class="chip pick" data-${attr}="${k}" aria-pressed="${on}">${esc(Array.isArray(v) ? v[0] : v.label)}</button>`;
  }).join("");
  const m = CR.metrics;
  return `
    <div class="setup picks">
      <span class="tape"></span>
      <h3>2. Como é esse estilo?<span>A página já mediu cores e ritmo. Marque o que mais parece com o vídeo: isso vira a receita do template.</span></h3>
      <div class="vbox frames">${CR.frames.slice(0, 8).map(fr => `<img src="${fr.url}" alt="Quadro em ${fmtS(fr.t)}">`).join("")}</div>
      <div class="measured">
        <span class="sws big">${m.colors.slice(0, 6).map(c => `<i style="background:${c.hex}" title="${c.hex}"></i>`).join("")}</span>
        <span class="summary">${[m.shots + (m.shots > 1 ? " planos" : " plano"), "um a cada " + fmtS(m.avgShot), "movimento " + m.motionLabel, m.aspect].map(t => `<span>${esc(t)}</span>`).join("")}</span>
      </div>
      <div class="pick-g"><span class="k">Tipo de visual ${P.type ? "" : "<em class='need'>escolha um</em>"}</span><div class="chips">${chipsOf(TYPES, P.type, "ptype", false)}</div></div>
      <div class="pick-g"><span class="k">Movimento <em>pode marcar vários</em></span><div class="chips">${chipsOf(MOTIONS, P.motion, "pmot", true)}</div></div>
      <div class="pick-g"><span class="k">Texto na tela</span><div class="chips">${chipsOf(TEXTS, P.text, "ptext", false)}</div></div>
      <div class="pick-g"><span class="k">Acabamento <em>pode marcar vários</em></span><div class="chips">${chipsOf(FINISHES, P.finish, "pfin", true)}</div></div>
      <label class="rf"><span class="k">Nome do estilo <em>opcional</em></span><input class="num" id="cp-name" value="${esc(CR.pname)}" placeholder="${esc(P.type ? TYPES[P.type].label + "…" : "ex.: Mapa Documentário")}"></label>
      <div class="copy-row">
        <button class="copy-btn" type="button" id="cr-make" ${P.type ? "" : "disabled"}>${tick}<span>${CR.result ? "Atualizar template" : "Criar template"}</span></button>
        <p class="status" id="cr-make-st">${P.type ? "Na hora, direto no seu navegador." : "Escolha o tipo de visual para continuar."}</p>
      </div>
    </div>`;
}
async function readClip() {
  if (CR.busy || !CR.url) return;
  const a = Math.max(0, Math.min(CR.start, CR.dur)), b = Math.min(CR.dur, Math.max(CR.end, a), a + 60);
  if (b - a < 1.5) { CR.err = "Escolha um trecho de pelo menos 2 segundos."; return rerenderCreator(); }
  ctrl = new AbortController();
  CR.frames.forEach(f => URL.revokeObjectURL(f.url)); (CR.burst || []).forEach(f => URL.revokeObjectURL(f.url));
  Object.assign(CR, { busy: true, err: "", stage: 1, chars: 0, result: null, frames: [], burst: [], metrics: null, picks: null });
  rerenderCreator();
  let reader = CR.mode === "wc" && CR.reader ? CR.reader : elementReader(CR.url);
  try {
    let m;
    try { m = await readMotion(reader, a, b, ctrl.signal); }
    catch (e) {
      if (!(e && e.code === "video") || reader.kind !== "el") throw e;
      reader.close();
      if (!CR.reader) CR.reader = await codecReader(CR.file);
      CR.mode = "wc"; reader = CR.reader;
      m = await readMotion(reader, a, b, ctrl.signal);
    }
    CR.metrics = m; CR.stage = 2; rerenderCreator();
    CR.frames = await grab(reader, pickTimes(m, a, b, 9), 768, .85, ctrl.signal);
    CR.burst = await grab(reader, [0, 1, 2].map(k => Math.min(b - .05, m.peak + k * .12)), 512, .8, ctrl.signal);
    CR.stage = 3; rerenderCreator();
    const feats = await visualFeatures(CR.frames);
    m.look = lookSentences(feats); m.features = feats;
    CR.picks = feats ? autoPicks(m, feats) : { ...suggestPicks(m), type: "match" };
    CR.stage = 0;
    makeLocal(true);
  } catch (e) {
    CR.stage = 0; CR.metrics = null;
    CR.err = e && ["video", "nocodec", "lib", "demux", "decode"].includes(e.code) ? readErr(e) : e && e.code === "cancelled" ? "Leitura cancelada." : "Algo falhou ao ler o vídeo. Tente de novo.";
    if (e && !e.code) console.error(e);
  } finally {
    CR.busy = false; ctrl = null; if (reader && reader.kind === "el") reader.close();
    rerenderCreator();
    if (CR.result) inner.querySelector(".result")?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }
}
function makeLocal(quiet) {
  if (!CR.picks || !CR.picks.type) return;
  const r = localTemplate(CR.metrics, CR.picks, CR.pname);
  const m = CR.metrics;
  r.metrics = { len: m.len, shots: m.shots, avgShot: m.avgShot, motion: m.motion, motionLabel: m.motionLabel, aspect: m.aspect };
  r.metricsText = metricsText(m);
  CR.result = r; CR.err = "";
  if (quiet) return;
  const y = sheet.scrollTop; rerenderCreator(); sheet.scrollTop = y;
}

/* ---------- detecção automática do estilo (automática) ---------- */
async function frameFeatures(blob) {
  const bm = await createImageBitmap(blob), W = 320, H = Math.max(40, Math.round(W * bm.height / bm.width));
  const cv = mk(W, H), c = cv.getContext("2d", { willReadFrequently: true });
  c.drawImage(bm, 0, 0, W, H); if (bm.close) bm.close();
  const d = c.getImageData(0, 0, W, H).data, N = W * H;
  const L = new Float32Array(N), S = new Float32Array(N), bins = new Map();
  let earth = 0, water = 0, bright = 0, sat = 0;
  for (let q = 0, p = 0; q < N; q++, p += 4) {
    const r = d[p], g = d[p + 1], b = d[p + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    L[q] = .299 * r + .587 * g + .114 * b; S[q] = mx ? (mx - mn) / mx : 0;
    bright += L[q]; sat += S[q];
    const k = (r >> 3) << 10 | (g >> 3) << 5 | (b >> 3); bins.set(k, (bins.get(k) || 0) + 1);
    if (mx - mn > 12) {
      let h = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
      if (h >= 35 && h <= 165 && L[q] > 25 && L[q] < 210 && S[q] > .12 && S[q] < .75) earth++;
      if (h >= 170 && h <= 250 && S[q] > .15) water++;
    }
  }
  const counts = [...bins.values()].sort((x, y) => y - x); let acc = 0, k90 = 0; while (acc < .9 * N && k90 < counts.length) acc += counts[k90++];
  let lap = 0, flatLap = 0, flatN = 0, smooth = 0, edges = 0, eq = 0, darkEdge = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const q = y * W + x, l = L[q];
    const lp = Math.abs(4 * l - L[q - 1] - L[q + 1] - L[q - W] - L[q + W]);
    const gr = Math.abs(L[q + 1] - L[q - 1]) + Math.abs(L[q + W] - L[q - W]);
    lap += lp;
    if (gr < 8) { flatLap += lp; flatN++; }
    if (gr >= 3 && gr < 24) smooth++;
    if (gr > 70) { edges++; if (l < 80 && l <= Math.min(L[q - 1], L[q + 1], L[q - W], L[q + W]) + 2) darkEdge++; }
    if (Math.abs(l - L[q + 1]) < .5) eq++;
  }
  // faixas de texto: linhas com muitas transições fortes, em blocos baixos
  const rows = new Float32Array(H);
  for (let y = 0; y < H; y++) { let t = 0; for (let x = 1; x < W; x++) if (Math.abs(L[y * W + x] - L[y * W + x - 1]) > 55) t++; rows[y] = t / W; }
  let textRows = 0, ySum = 0;
  for (let y = 0; y < H;) {
    if (rows[y] > .1) { let e = y; while (e < H && rows[e] > .06) e++; const h = e - y; if (h >= 3 && h <= H * .14) { textRows += h; ySum += (y + e) / 2 * h; } y = e; } else y++;
  }
  const box = (x0, y0, x1, y1) => { let s = 0, n = 0; for (let y = Math.floor(y0 * H); y < y1 * H; y++) for (let x = Math.floor(x0 * W); x < x1 * W; x++) { s += L[y * W + x]; n++; } return s / Math.max(1, n); };
  const corners = (box(0, 0, .12, .12) + box(.88, 0, 1, .12) + box(0, .88, .12, 1) + box(.88, .88, 1, 1)) / 4;
  const center = (box(.44, 0, .56, .12) + box(.44, .88, .56, 1) + box(0, .44, .12, .56) + box(.88, .44, 1, .56)) / 4; // meio das bordas
  let hiSat = 0; for (let q = 0; q < N; q++) if (S[q] > .6 && L[q] > 120) hiSat++;
  const inner = (W - 2) * (H - 2);
  return {
    k90, lap: lap / inner, flatNoise: flatN ? flatLap / flatN : 0, smooth: smooth / inner, edges: edges / inner, darkEdge: edges ? darkEdge / edges : 0,
    eq: eq / inner, earth: earth / N, water: water / N, bright: bright / N / 2.55, sat: sat / N, hiSat: hiSat / N,
    textCov: textRows / H, textY: textRows ? ySum / textRows / H : 0, vignette: center > 8 ? corners / center : 1,
  };
}
async function visualFeatures(frames) {
  const list = [];
  for (const f of frames) { try { list.push(await frameFeatures(f.blob)); } catch (e) {} }
  if (!list.length) return null;
  const avg = {}; for (const k of Object.keys(list[0])) { const v = list.map(x => x[k]).sort((a, b) => a - b); avg[k] = v[Math.floor(v.length / 2)]; }
  avg.textFrames = list.filter(x => x.textCov > .04).length / list.length;
  return avg;
}
function autoPicks(m, f) {
  // tipo de visual: pontua cada família e fica com a mais forte
  const many = f.k90 > 700, few = f.k90 < 220;
  const sc = {
    map: f.earth > .12 ? f.earth * 2.2 + f.water * 1.2 + (f.water > .05 ? .5 : 0) - (f.k90 < 60 ? .6 : 0) : 0,
    pixel: f.eq > .6 && f.k90 < 80 && f.edges > .13 && f.flatNoise < 1.5 ? 1.6 : 0,
    type: f.textCov > .1 && f.textFrames > .6 && f.k90 < 60 && f.edges < .1 ? 1.2 + f.textCov * 2 : f.textCov > .2 && f.textFrames > .6 && f.k90 < 400 ? 1 + f.textCov : 0,
    hand: f.bright > 62 && f.sat < .22 && f.darkEdge > .3 && f.k90 < 600 ? 1.15 : 0,
    paper: few && f.flatNoise > 2.2 && f.bright > 40 ? .95 + Math.min(.4, (f.flatNoise - 2.2) / 6) : 0,
    flat: few ? 1 - Math.min(.5, f.flatNoise / 8) : f.k90 < 450 ? .55 : .15,
    "3d": f.smooth > .28 && f.flatNoise < 3 && f.k90 > 100 && f.k90 < 1600 ? .7 + f.smooth : 0,
    mixed: many ? .65 + Math.min(.4, f.lap / 30) : .2,
  };
  const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
  const type = ranked[0][1] < .6 || ranked[0][1] - ranked[1][1] < .08 ? "match" : ranked[0][0];
  // movimento
  const t = m.traits || {}, motion = [];
  if (m.cutsPerMin > 18 || m.shots >= 5) motion.push("cuts");
  if (t.camRatio > .28) motion.push("zoom");
  if (t.localRatio > .15) {
    if (t.glowAvg > .3) motion.push("glow");
    if (t.thinAvg > .72) motion.push("draw");
    if (m.motion > 8 || (!motion.includes("glow") && !motion.includes("draw"))) motion.push("pop");
  }
  if (type === "paper" || f.flatNoise > 3 && few) { if (t.stepRatio > .25) motion.push("stop"); }
  if (!motion.length) motion.push(m.motion < 6 ? "zoom" : "pop");
  // texto
  const text = type === "type" || (f.textFrames > .6 && f.textCov > .22) ? "hero" : f.textFrames < .3 ? "minimal" : (f.textY > .55 || m.aspect === "Vertical") ? "caption" : "labels";
  // acabamento
  const fin = [];
  if (f.bright < 45 && f.hiSat > .03) fin.push("neon");
  if (f.vignette < .8 || (f.bright < 30 && many)) fin.push("cine");
  if ((f.flatNoise > 3 && !many && type !== "map") || type === "paper") fin.push("grain");
  if (f.darkEdge > .45 && few) fin.push("outline");
  if (!fin.length) fin.push(few && f.flatNoise < 1.6 ? "clean" : f.smooth > .25 ? "soft" : "clean");
  return { type, motion: motion.slice(0, 4), text, finish: fin.slice(0, 2), scores: Object.fromEntries(ranked.map(([k, v]) => [k, +v.toFixed(2)])) };
}
function lookSentences(f) {
  if (!f) return "";
  const out = [];
  out.push(f.k90 < 220 ? "The frames use a small set of flat colour areas." : f.k90 < 700 ? "The frames mix flat colour areas with some gradients and detail." : "The frames are rich in colour variation and fine detail, close to photographic or painted imagery.");
  out.push(f.flatNoise > 2.5 ? "Even flat areas carry visible texture or grain." : f.smooth > .25 ? "Surfaces are smooth with soft gradients and shading." : "Edges are crisp and flat areas are clean.");
  if (f.darkEdge > .4) out.push("Shapes tend to have dark outlines.");
  if (f.textFrames > .5) out.push(f.textY > .55 ? "On-screen text appears in most frames, mostly in the lower half." : "On-screen text appears in most frames.");
  if (f.vignette < .78) out.push("Corners are darker than the centre (vignette).");
  return out.join(" ");
}

/* ---------- salvar / usar / excluir ---------- */
function readResultForm() {
  const r = { ...CR.result };
  ["name", "sub", "engine", "teaser", "looks", "best", "know", "ex", "direction"].forEach(k => { const el = inner.querySelector("#rs-" + k); if (el) r[k] = el.value.trim(); });
  if (!r.name) r.name = "Estilo sem nome";
  return r;
}
function asStyle(r, extra) {
  return { custom: true, name: r.name, sub: r.sub, engine: r.engine, teaser: r.teaser, looks: r.looks, best: r.best, know: r.know, ex: r.ex,
    styleLabel: r.styleLabel, summary: r.summary, colors: r.colors, direction: r.direction, metrics: r.metrics, metricsText: r.metricsText, px: r.px, origin: r.origin || "", ...extra };
}
async function shrink(blob, w, q) {
  try {
    const bm = await createImageBitmap(blob); if (bm.width <= w) return blob;
    const cv = mk(w, Math.round(w * bm.height / bm.width)); cv.getContext("2d").drawImage(bm, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(b => r(b || blob), "image/jpeg", q));
  } catch (e) { return blob; }
}
function canDelete(s) { return !!(s && s.custom); }
// confirmação em dois cliques (o claude.ai bloqueia as caixas de confirmação do navegador)
function armed(btn, label) {
  if (btn.classList.contains("armed")) return true;
  btn.dataset.label = btn.textContent; btn.textContent = label; btn.classList.add("armed");
  clearTimeout(btn._t); btn._t = setTimeout(() => { btn.classList.remove("armed"); btn.textContent = btn.dataset.label; }, 4000);
  return false;
}
function closeThenApply() { close(); setTimeout(applyCustoms, 650); }
function resetCreator() {
  if (CR.url) URL.revokeObjectURL(CR.url);
  CR.frames.forEach(f => URL.revokeObjectURL(f.url));
  loadTok++; if (CR.reader) CR.reader.close();
  if (CR.manual) URL.revokeObjectURL(CR.manual.url);
  (CR.burst || []).forEach(f => URL.revokeObjectURL(f.url));
  Object.assign(CR, { picks: null, burst: [], pname: "", refining: false, manual: null, answer: "", reader: null, mode: "", loading: false, file: null, url: "", dur: 0, start: 0, end: 0, hint: "", busy: false, result: null, frames: [], metrics: null, err: "", stage: 0, chars: 0 });
}
let pendingOpen = "";
function openStyleById(id) {
  const i = STYLES.findIndex(s => s.id === id); if (i < 0) return;
  if (sheet.hidden) return open(i);
  current = i; openedAt = -2; fill(i); sheet.scrollTop = 0;
}

/* ---------- folha de referência para anexar ---------- */
function loadImgs(list) {
  return Promise.all((list || []).map(f => new Promise(r => { const im = getImg(f); if (im.complete && im.naturalWidth) r(im); else { im.addEventListener("load", () => r(im), { once: true }); im.addEventListener("error", () => r(null), { once: true }); setTimeout(() => r(im.naturalWidth ? im : null), 8000); } })));
}
async function contactSheet(s, type = "image/png") {
  const ims = (await loadImgs((s.frames || []).slice(0, 9))).filter(Boolean);
  if (!ims.length) throw 0;
  const bur = (await loadImgs((s.burst || []).slice(0, 3))).filter(Boolean);
  const ar = ims[0].naturalWidth / ims[0].naturalHeight, vert = ar < .9;
  const cols = vert ? Math.min(5, ims.length) : Math.min(3, ims.length), cw = vert ? 300 : 520, ch = Math.round(cw / ar), pad = 18, head = 92;
  const rows = Math.ceil(ims.length / cols), W = cols * cw + (cols + 1) * pad;
  const motionH = bur.length ? 48 + ch + pad : 0, palH = 110;
  const cv = mk(W, head + rows * (ch + pad) + pad + motionH + palH), c = cv.getContext("2d");
  c.fillStyle = "#14101F"; c.fillRect(0, 0, cv.width, cv.height);
  c.textBaseline = "middle"; c.fillStyle = "#F4EEFF"; c.font = "700 30px Archivo, Arial, sans-serif";
  c.fillText("Referência de estilo · " + s.name, pad, 36);
  c.fillStyle = "#B8A9D9"; c.font = "400 18px Arial, sans-serif";
  c.fillText("Quadros do vídeo original. Reproduza este visual com conteúdo novo; não copie o assunto, personagens ou textos.", pad, 70);
  const label = (txt, x, y) => { c.font = "700 18px Arial, sans-serif"; const w = c.measureText(txt).width + 16; c.fillStyle = "rgba(0,0,0,.75)"; c.fillRect(x, y, w, 28); c.fillStyle = "#fff"; c.fillText(txt, x + 8, y + 15); };
  ims.forEach((im, k) => {
    const x = pad + (k % cols) * (cw + pad), y = head + Math.floor(k / cols) * (ch + pad);
    c.drawImage(im, x, y, cw, ch); label(String(k + 1), x, y);
  });
  let y = head + rows * (ch + pad) + pad;
  if (bur.length) {
    c.fillStyle = "#F4EEFF"; c.font = "700 20px Arial, sans-serif"; c.fillText("Sequência de movimento (quadros seguidos, ~0,12 s entre eles)", pad, y + 20);
    y += 48;
    bur.forEach((im, k) => { const x = pad + k * (cw + pad); c.drawImage(im, x, y, cw, ch); label("M" + (k + 1), x, y); });
    y += ch + pad;
  }
  const cols2 = (s.colors || []).slice(0, 6);
  c.fillStyle = "#F4EEFF"; c.font = "700 20px Arial, sans-serif"; c.fillText("Paleta", pad, y + 18);
  cols2.forEach((hx, k) => {
    const x = pad + k * 170, yy = y + 40;
    c.fillStyle = hx; c.fillRect(x, yy, 48, 48); c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeRect(x, yy, 48, 48);
    c.fillStyle = "#F4EEFF"; c.font = "400 20px Courier New, monospace"; c.fillText(hx, x + 58, yy + 24);
  });
  return new Promise(r => cv.toBlob(r, type, .9));
}
/* ---------- estilos salvos na instalação ---------- */
function applyCustoms() {
  const curId = current >= 0 && STYLES[current] ? STYLES[current].id : null;
  const wasCustom = current >= BASE_N;
  STYLES.splice(BASE_N, STYLES.length - BASE_N, ...SAVED);
  renderGrid(); drawCards();
  if (pendingOpen && STYLES.some(s => s.id === pendingOpen)) { const id = pendingOpen; pendingOpen = ""; return openStyleById(id); }
  if (!sheet.hidden && wasCustom) {
    const i = STYLES.findIndex(s => s.id === curId);
    if (i < 0) close(); else current = i;
  }
}


function estiloDoServidor(p) {
  const j = p.json || {};
  return { id: p.id, custom: true, name: j.nome || p.id, sub: j.subtitulo || "", engine: j.motor || "", teaser: j.resumo || "", looks: j.aparencia || "",
    best: j.melhorPara || "", know: j.bomSaber || "", ex: j.temaExemplo || "", colors: j.cores || [], summary: j.resumoPrompt || "", styleLabel: j.rotulo || j.nome || p.id,
    direction: p.direcao || "", metrics: j.medidas || null, metricsText: p.metricas || "", px: !!j.px, frames: p.quadros || [], burst: p.movimento || [] };
}
async function loadSaved() {
  const e = await api("/api/estado");
  BOOT.estilos = e.estilos; BOOT.personalizados = e.personalizados;
  SAVED.length = 0;
  for (const p of e.personalizados) SAVED.push(estiloDoServidor(p));
  applyCustoms();
}
const dataUrl = blob => new Promise((ok, falha) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => falha(new Error("não consegui ler a imagem.")); r.readAsDataURL(blob); });

function customPanel(s) {
  const m = s.metrics || {};
  const chips = [m.len && "Trecho de " + fmtS(m.len), m.shots && m.shots + (m.shots > 1 ? " planos" : " plano"), m.avgShot && "Plano médio " + fmtS(m.avgShot), m.motion != null && "Movimento " + m.motionLabel, m.aspect && m.aspect].filter(Boolean);
  return `
    <div class="refbox">
      <small class="k">Do vídeo de referência</small>
      <div class="summary">${chips.map(c => `<span>${esc(c)}</span>`).join("")}</div>
      <div class="ref-actions"><button type="button" class="mini danger" id="cr-delete">Excluir estilo</button></div>
      <p class="hint ref-remind">A folha de referência e os quadros ficam salvos em estilos/${esc(s.id)}/. O agente estuda esses arquivos ao produzir o vídeo, então não é preciso anexar nada.</p>
      <details class="dir"><summary>Ver a direção de estilo</summary><pre>${esc(s.direction)}</pre></details>
      <p class="status" id="cr-del-status" aria-live="polite"></p>
    </div>`;
}
function resultBlock(r) {
  const f = (id, label, val, rows) => rows
    ? `<label class="rf"><span class="k">${label}</span><textarea id="rs-${id}" rows="${rows}">${esc(val || "")}</textarea></label>`
    : `<label class="rf"><span class="k">${label}</span><input class="num" id="rs-${id}" value="${esc(val || "")}"></label>`;
  return `
    <div class="setup result">
      <span class="tape"></span>
      <h3>2. Seu template<span>Montado automaticamente a partir do vídeo. Revise o que quiser e salve.</span></h3>
      ${CR.picks ? detectedLine() : ""}
      <div class="vbox frames">${CR.frames.slice(0, 8).map(fr => `<img src="${fr.url}" alt="Quadro em ${fmtS(fr.t)}">`).join("")}</div>
      <div class="sws big">${(r.colors || []).map(c => `<i style="background:${esc(c)}" title="${esc(c)}"></i>`).join("")}</div>
      <div class="rgrid">
        ${f("name", "Nome", r.name)}
        ${f("sub", "Subtítulo", r.sub)}
        ${f("engine", "Técnica", r.engine)}
        ${f("teaser", "Resumo do card", r.teaser, 2)}
        ${f("looks", "Como fica", r.looks, 3)}
        ${f("best", "Melhor para", r.best, 2)}
        ${f("know", "Bom saber", r.know, 2)}
        ${f("ex", "Tema de exemplo", r.ex, 2)}
      </div>
      <details class="dir"><summary>Direção de estilo (vai dentro do prompt, em inglês)</summary><textarea id="rs-direction" rows="16">${esc(r.direction)}</textarea></details>
      ${CR.picks ? `<details class="dir adjust"><summary>Ajustar o que foi detectado (opcional)</summary>${pickChips()}</details>` : ""}
      <div class="copy-row">
        <button class="copy-btn" type="button" id="cr-save">${tick}<span>Salvar estilo</span></button>
        <p class="status" id="cr-save-status" aria-live="polite">O estilo é salvo na pasta estilos/ desta instalação e aparece na grade, pronto para os agentes usarem.</p>
      </div>
    </div>`;
}
async function onSave() {
  const st = inner.querySelector("#cr-save-status"), btn = inner.querySelector("#cr-save");
  const say = t => { if (st) st.textContent = t; };
  const r = readResultForm();
  if (btn) btn.disabled = true;
  try {
    say("Preparando os quadros…");
    const quadros = await Promise.all(CR.frames.map(async f => dataUrl(await shrink(f.blob, 768, .85))));
    const movimento = await Promise.all((CR.burst || []).map(async f => dataUrl(await shrink(f.blob, 512, .8))));
    const folha = await dataUrl(await contactSheet({ name: r.name, frames: CR.frames.map(f => f.url), burst: (CR.burst || []).map(f => f.url), colors: r.colors }, "image/png"));
    say("Salvando…");
    const res = await api("/api/estilo", {
      id: r.name, direcao: r.direction, metricas: r.metricsText || "", quadros, movimento, folha,
      estilo: { nome: r.name, subtitulo: r.sub, motor: r.engine, resumo: r.teaser, aparencia: r.looks, melhorPara: r.best, bomSaber: r.know, temaExemplo: r.ex,
        rotulo: r.styleLabel, resumoPrompt: r.summary, cores: r.colors, sequenciaMovimento: movimento.length > 0, medidas: r.metrics || null, px: !!r.px },
    });
    resetCreator(); pendingOpen = res.id; await loadSaved();
  } catch (e) { say(e.message || "Não consegui salvar o estilo."); if (btn) btn.disabled = false; }
}
async function deleteStyle(s, statusEl) {
  const say = t => { if (statusEl) statusEl.textContent = t; };
  const inSheet = !sheet.hidden && STYLES[current] === s;
  say("Excluindo…");
  try {
    await api("/api/estilo/excluir", { id: s.id });
    HIDDEN.delete(s.id); saveHidden();
    const k = SAVED.indexOf(s); if (k >= 0) SAVED.splice(k, 1);
    say(`"${s.name}" foi excluído.`);
    if (inSheet) closeThenApply(); else applyCustoms();
  } catch (e) { say(e.message || "Não consegui excluir."); }
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const s = current >= 0 ? STYLES[current] : null;
  if (e.target.closest("#cr-go")) return readClip();
  if (e.target.closest("#cr-make")) return makeLocal();
  const pk = e.target.closest("[data-ptype],[data-pmot],[data-ptext],[data-pfin]");
  if (pk && CR.picks) {
    const P = CR.picks, d = pk.dataset;
    if (d.ptype) P.type = d.ptype;
    else if (d.ptext) P.text = d.ptext;
    else { const arr = d.pmot ? P.motion : P.finish, k = d.pmot || d.pfin, at = arr.indexOf(k); if (at >= 0) arr.splice(at, 1); else arr.push(k); }
    if (CR.result && CR.result.origin !== "claude") { const open = !!inner.querySelector(".adjust[open]"); makeLocal(true); const y = sheet.scrollTop; rerenderCreator(); if (open) inner.querySelector(".adjust")?.setAttribute("open", ""); sheet.scrollTop = y; return; }
    const y = sheet.scrollTop; rerenderCreator(); sheet.scrollTop = y; return;
  }
  if (e.target.closest("#cr-again")) { CR.result = null; CR.picks = null; CR.pname = ""; rerenderCreator(); return; }
  if (e.target.closest("#cr-cancel")) { ctrl && ctrl.abort(); return; }
  if (e.target.closest("#cr-change")) { resetCreator(); return rerenderCreator(); }
  if (e.target.closest("#cr-save")) return onSave();
  if (e.target.closest("#cr-setstart, #cr-setend")) {
    const v = inner.querySelector("#cr-video"); if (!v) return;
    if (e.target.closest("#cr-setstart")) CR.start = v.currentTime; else CR.end = v.currentTime;
    if (CR.end < CR.start) [CR.start, CR.end] = [CR.end, CR.start];
    inner.querySelector("#cr-start").value = CR.start.toFixed(1); inner.querySelector("#cr-end").value = CR.end.toFixed(1);
    inner.querySelector("#cr-len").textContent = trimText(); return;
  }
  if (s && s.custom) {
    const del = e.target.closest("#cr-delete");
    if (del) { if (armed(del, "Clique de novo para excluir")) deleteStyle(s, inner.querySelector("#cr-del-status")); return; }
  }
});
document.addEventListener("change", e => { if (e.target.id === "cr-file" && e.target.files[0]) loadVideo(e.target.files[0]); });
document.addEventListener("input", e => {
  const id = e.target.id;
  if (id === "cr-hint") CR.hint = e.target.value;
  else if (id === "cp-name") CR.pname = e.target.value;
  else if (id === "cr-start" || id === "cr-end") {
    const v = Math.max(0, Math.min(CR.dur, +e.target.value || 0));
    if (id === "cr-start") CR.start = v; else CR.end = v;
    inner.querySelector("#cr-len").textContent = trimText();
    if (id === "cr-start" && CR.mode === "wc") { clearTimeout(drawPoster.t); drawPoster.t = setTimeout(drawPoster, 350); }
  } else if (id && id.startsWith("rs-") && CR.result) { CR.result[id.slice(3)] = e.target.value; if (id === "rs-name") CR.pname = e.target.value; }
});

document.addEventListener("click", e => {
  const h = e.target.closest("[data-hide]");
  if (h) { const i = +h.dataset.hide; setHidden(i, !isHidden(i)); return; }
  const u = e.target.closest("[data-unhide]");
  if (u) { setHidden(+u.dataset.unhide, false); return; }
  const d = e.target.closest("[data-del]");
  if (d) {
    const s = STYLES[+d.dataset.del]; if (!s) return;
    if (ARM.key === s.id && Date.now() < ARM.until) { ARM.key = ""; deleteStyle(s, document.getElementById("grid-status")); return; }
    ARM.key = s.id; ARM.until = Date.now() + 5000;
    d.textContent = "Confirmar exclusão"; d.classList.add("armed");
    setTimeout(() => { if (ARM.key === s.id && Date.now() >= ARM.until) { ARM.key = ""; const b = grid.querySelector(`[data-del="${STYLES.indexOf(s)}"]`); if (b) { b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>Excluir`; b.classList.remove("armed"); } } }, 5100);
    return;
  }
  if (e.target.closest("#manage-btn") || e.target.closest("#show-hidden")) {
    MANAGE = !MANAGE || !!e.target.closest("#show-hidden");
    document.getElementById("grid-status").textContent = "";
    renderGrid(); drawCards(); return;
  }
});
renderGrid();
loadSaved();

