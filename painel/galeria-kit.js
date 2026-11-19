// Visões integradas do Kit de Movimento dentro do painel unificado (/galeria, /personagens, /legendas, /cenas).
import { criarExemplo } from "/kit/exemplo.js";
import { tocar } from "/kit/tocador.js";
import { criarPincel, retP } from "/kit/pinceis.js";
import { desenharFolha, tamanhoDaFolha, medirPeca, opcoesDaPeca } from "/kit/galeria.js";
import { legenda, legendasDeExemplo } from "/kit/legendas.js";
import * as K from "/kit/pecas.js";
import { CICLOS } from "/kit/movimento.js";

const ESTILOS = [
  ["3d", "3D Toy & Massinha", true],
  ["toon", "3D Cel-Shading", true],
  ["neon", "3D Neon & HUD", true],
  ["papel", "Recorte de Papel", false],
  ["flat", "Vetor Flat", false],
  ["vidro", "Vidro Líquido", false],
  ["traco", "Isométrico em Linha", false],
  ["pixel", "Pixel Art", false],
  ["aquarela", "Aquarela", false],
  ["riso", "Risografia", false],
  ["retro", "Rubber Hose 1930", false],
  ["quadro", "Quadro Branco", false],
  ["bento", "Bento UI", false],
  ["cinetico", "Tipografia Cinética", false],
  ["mapa", "Mapa & Satélite", false],
  ["colagem", "Colagem Editorial", false],
  ["bauhaus", "Bauhaus", false],
];

const IDADES_TXT = { todas: "Todas", crianca: "Crianças", adolescente: "Adolescentes", adulto: "Adultos", idoso: "Idosos" };
const GENEROS_TXT = { todos: "Todos", feminino: "Feminino", masculino: "Masculino", neutro: "Neutro" };
const GESTOS = { variado: "Variado", andar: "Andar", correr: "Correr", comemorar: "Comemorar", acenar: "Acenar", digitar: "Digitar", olhar: "Olhar", parado: "Parado" };
const VARIADO = ["andar", "olhar", "apontar", "respirar", "maosNaCintura", "andar", "segurar", "olhar"];
const PELES_HEX = { pele0: "#F6D5BE", pele1: "#E4B28D", pele2: "#C78B5E", pele3: "#9D633E", pele4: "#6E4226", pele5: "#462816" };

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export async function inicializarGaleriaKit({ container, aoEscolherLegenda, aoNavegarUrl, legendaAtual = "bloco" }) {
  const indice = await (await fetch("/kit/indice.json")).json();

  const state = {
    ativo: false,
    aba: "galeria",
    estilo: "3d",
    cat: "objetos3d",
    q: "",
    pag: 0,
    sel: null,
    idade: "todas",
    genero: "todos",
    gesto: "variado",
    selP: "criadoraConteudo",
    texto: legendasDeExemplo().texto,
    legendaAtiva: legendaAtual,
    vertical: true,
    fixo: null,
  };

  if (!K.PERSONAGENS[state.selP]) state.selP = Object.keys(K.PERSONAGENS)[0];
  if (!indice.categorias.some(c => c.id === state.cat)) state.cat = indice.categorias[0].id;

  let pincel = criarPincel(state.estilo);
  let dadosLegenda = legendasDeExemplo(state.texto);
  let celulas = [];
  let celulasP = [];
  let toc = null;
  let filme = null;
  let rafId = 0;
  let ultimo = 0;
  const inicio = performance.now();
  const erros = new Set();
  const COLS_GAL = 5;
  const CEL_GAL = 280;
  const POR_PAGINA = 20;

  container.innerHTML = buildMarkup();
  const $ = sel => container.querySelector(sel);

  function buildMarkup() {
    const pillsEstilo = ESTILOS.map(([id, nome, e3d]) => `
      <button type="button" class="brush-pill${e3d ? " is-3d" : ""}" data-brush="${id}">
        ${e3d ? '<span class="tag-3d">3D</span>' : ""}${esc(nome)}
      </button>`).join("");

    const catItems = [
      ...indice.categorias.map(c => ({ ...c, destaque: c.id === "objetos3d" })),
      { id: "todas", titulo: "Todas as peças", total: indice.total, destaque: false },
    ].map(c => `
      <button type="button" class="cat-item${c.destaque ? " featured" : ""}" data-cat="${c.id}">
        <span class="cat-name">${c.destaque ? '<span class="tag-3d">3D</span>' : ""}${esc(c.titulo)}</span>
        <span class="cat-count">${c.total}</span>
      </button>`).join("");

    const cardsLegenda = Object.entries(K.ESTILOS_DE_LEGENDA).map(([id, e]) => `
      <article class="cap-card" data-cap="${id}">
        <div class="cap-top">
          <code>${esc(id)}</code>
          <button type="button" class="mini use-cap-btn" data-use-cap="${id}">Usar no projeto</button>
        </div>
        <h4>${esc(e.nome)}</h4>
        <p>${esc(e.descricao)}</p>
      </article>`).join("");

    return `
      <section class="kit-brushbar">
        <div class="kit-brushbar-head">
          <span class="kit-kicker">Acabamento visual (17 pincéis)</span>
          <span class="kit-tip">Troque o pincel para ver as 492 peças e os 46 personagens em 3D, anime, papel, flat ou aquarela.</span>
        </div>
        <div class="brush-strip" id="kit-brushes">${pillsEstilo}</div>
      </section>

      <section class="kit-sub" id="sub-galeria">
        <div class="kit-galeria-layout">
          <aside class="kit-cats-panel" aria-label="Categorias de peças">
            <div class="panel-head">
              <h3>Categorias</h3>
              <span>${indice.total} peças</span>
            </div>
            <div class="cat-list" id="kit-cats">${catItems}</div>
          </aside>

          <div class="kit-stage-panel">
            <div class="stage-bar">
              <div class="stage-info">
                <h2 id="gal-cat-title">Objetos e personagens 3D</h2>
                <span id="gal-pag-info" class="stage-meta"></span>
              </div>
              <div class="pager">
                <button type="button" class="mini" id="kit-ant" aria-label="Página anterior">‹ Anterior</button>
                <span id="kit-pag-num" class="pag-num">1 / 1</span>
                <button type="button" class="mini" id="kit-prox" aria-label="Próxima página">Próxima ›</button>
              </div>
            </div>
            <div class="canvas-frame">
              <canvas id="kit-cv-galeria" aria-label="Grade interativa de peças animadas"></canvas>
            </div>
            <p class="stage-foot-note">Clique em qualquer peça na grade para inspecionar em tamanho grande e copiar o código.</p>
          </div>

          <aside class="kit-inspector" id="kit-inspector" aria-label="Inspetor da peça selecionada">
            <div class="insp-head">
              <span class="tag-pill" id="insp-cat">Categoria</span>
              <button type="button" class="mini" id="insp-copy-btn">Copiar código</button>
            </div>
            <div class="insp-zoom-box">
              <canvas id="kit-cv-zoom" width="260" height="220" aria-label="Prévia ampliada da peça"></canvas>
            </div>
            <h3 id="insp-nome">Selecione uma peça</h3>
            <p id="insp-desc" class="insp-desc"></p>
            <div class="insp-quick-brushes">
              <span>Testar em:</span>
              <button type="button" class="mini" data-brush-quick="3d">3D Toy</button>
              <button type="button" class="mini" data-brush-quick="toon">Cel 3D</button>
              <button type="button" class="mini" data-brush-quick="flat">Flat</button>
              <button type="button" class="mini" data-brush-quick="aquarela">Aquarela</button>
            </div>
            <div class="code-box">
              <span class="code-label">Como usar</span>
              <pre id="insp-ex"></pre>
            </div>
            <div class="code-box">
              <span class="code-label">Opções aceitas</span>
              <pre id="insp-par"></pre>
            </div>
          </aside>
        </div>
      </section>

      <section class="kit-sub" id="sub-personagens" hidden>
        <div class="hero-char-stage">
          <div class="char-stage-canvas-wrap">
            <canvas id="kit-cv-char-hero" width="380" height="340" aria-label="Palco de prévia do personagem"></canvas>
            <span class="char-stage-badge" id="char-brush-badge">3D Toy</span>
          </div>
          <div class="char-stage-info">
            <div class="char-meta-top">
              <span class="tag-pill" id="char-hero-age">Adulto</span>
              <span class="tag-pill alt" id="char-hero-gender">Feminino</span>
              <span class="skin-dot" id="char-hero-skin" title="Tom de pele"></span>
            </div>
            <h2 id="char-hero-title">criadoraConteudo</h2>
            <p id="char-hero-sub" class="insp-desc"></p>
            <div class="char-traits" id="char-hero-traits"></div>

            <div class="char-controls">
              <div class="ctrl-row">
                <span class="code-label">Gesto / Atuação</span>
                <div class="chip-row" id="kit-gestos">
                  ${Object.entries(GESTOS).map(([v, label]) => `<button type="button" class="chip" data-gesto="${v}">${label}</button>`).join("")}
                </div>
              </div>
              <div class="ctrl-row">
                <span class="code-label">Acabamento em destaque</span>
                <div class="chip-row">
                  <button type="button" class="chip" data-brush-quick="3d">3D Toy</button>
                  <button type="button" class="chip" data-brush-quick="toon">3D Toon</button>
                  <button type="button" class="chip" data-brush-quick="retro">Retro 1930</button>
                  <button type="button" class="chip" data-brush-quick="papel">Papel</button>
                  <button type="button" class="chip" data-brush-quick="flat">Flat</button>
                </div>
              </div>
            </div>

            <div class="code-box inline-copy">
              <div class="code-head">
                <span class="code-label">Código para usar na cena</span>
                <button type="button" class="mini" id="char-copy-btn">Copiar código</button>
              </div>
              <pre id="char-hero-code"></pre>
            </div>
          </div>
        </div>

        <div class="stage-bar char-filters-bar">
          <div class="filter-group">
            <span class="code-label">Idade</span>
            <div class="chip-row" id="kit-idades">
              ${Object.entries(IDADES_TXT).map(([v, label]) => `<button type="button" class="chip" data-idade="${v}">${label}</button>`).join("")}
            </div>
          </div>
          <div class="filter-group">
            <span class="code-label">Gênero</span>
            <div class="chip-row" id="kit-generos">
              ${Object.entries(GENEROS_TXT).map(([v, label]) => `<button type="button" class="chip" data-genero="${v}">${label}</button>`).join("")}
            </div>
          </div>
          <span class="stage-meta" id="char-count"></span>
        </div>

        <div class="canvas-frame">
          <canvas id="kit-cv-personagens" aria-label="Grade de personagens"></canvas>
        </div>
      </section>

      <section class="kit-sub" id="sub-legendas" hidden>
        <div class="cap-toolbar">
          <div class="cap-input-wrap">
            <label for="kit-cap-text" class="code-label">Texto de demonstração ao vivo</label>
            <input type="text" id="kit-cap-text" value="${esc(state.texto)}" placeholder="Digite uma frase para testar os 13 estilos de legenda...">
          </div>
          <div class="cap-active-note">
            <span>Estilo ativo no formulário:</span>
            <strong id="kit-cap-active-label">${esc(state.legendaAtiva)}</strong>
          </div>
        </div>

        <div class="canvas-frame cap-canvas-wrap">
          <canvas id="kit-cv-legendas" aria-label="Comparação animada dos 13 estilos de legenda"></canvas>
        </div>

        <div class="legendas-grid" id="kit-legendas-cards">${cardsLegenda}</div>
      </section>

      <section class="kit-sub" id="sub-cenas" hidden>
        <div class="cenas-toolbar">
          <div class="cenas-group">
            <button type="button" class="btn-primary" id="kit-play-toggle">Pausar</button>
            <span class="tempo-readout" id="kit-tempo">0.0 s</span>
          </div>
          <div class="cenas-group" id="kit-formatos">
            <button type="button" class="chip" data-v="1">Vertical 9:16</button>
            <button type="button" class="chip" data-v="0">Horizontal 16:9</button>
          </div>
          <div class="cenas-beats" id="kit-trechos"></div>
          <div class="cenas-scrubber">
            <input id="kit-linha" type="range" min="0" max="1" step="0.001" value="0" aria-label="Linha do tempo do vídeo demo">
          </div>
        </div>
        <div class="canvas-frame theater-frame">
          <canvas id="kit-cv-cenas" aria-label="Player de cenas de demonstração"></canvas>
        </div>
      </section>
    `;
  }

  /* ---------- filtragem & dados ---------- */
  function pecasFiltradas() {
    const q = norm(state.q).split(/[^a-z0-9]+/).filter(Boolean);
    const lista = q.length
      ? indice.pecas.filter(pc => {
          const alvo = norm([pc.nome, pc.categoria, pc.descricao, ...pc.chaves].join(" "));
          return q.every(t => alvo.includes(t));
        })
      : state.cat === "todas"
        ? indice.pecas
        : indice.pecas.filter(pc => pc.categoria === state.cat);
    return lista.filter(pc => typeof K[pc.nome] === "function");
  }

  function pagina() {
    const lista = pecasFiltradas();
    const n = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    state.pag = Math.min(state.pag, n - 1);
    const itens = lista.slice(state.pag * POR_PAGINA, (state.pag + 1) * POR_PAGINA);
    if (!state.sel || !itens.some(pc => pc.nome === state.sel)) {
      state.sel = itens[0]?.nome || lista[0]?.nome || null;
    }
    return { lista, n, itens };
  }

  function personagensFiltrados() {
    const q = norm(state.q).split(/[^a-z0-9]+/).filter(Boolean);
    return Object.entries(K.PERSONAGENS).filter(([id, x]) => {
      if (state.idade !== "todas" && x.idade !== state.idade) return false;
      if (state.genero !== "todos" && x.genero !== state.genero) return false;
      if (!q.length) return true;
      const texto = norm([id, x.nome, x.idade, x.genero, x.cabelo, x.opcoes?.penteado, x.opcoes?.chapeu, x.opcoes?.rosto, x.opcoes?.noTronco].join(" "));
      return q.every(t => texto.includes(t));
    });
  }

  function poseDe(id, i, t) {
    if (K.PERSONAGENS[id]?.cadeira) return undefined;
    const g = state.gesto === "variado" ? VARIADO[i % VARIADO.length] : state.gesto;
    return CICLOS[g] ? CICLOS[g](t + i * 0.25) : g;
  }

  /* ---------- inspetor e hero updates ---------- */
  function atualizarInspectorPeca() {
    const pc = indice.pecas.find(x => x.nome === state.sel);
    if (!pc) {
      $("#insp-nome").textContent = "Nenhuma peça encontrada";
      $("#insp-desc").textContent = "Limpe a busca ou escolha outra categoria para explorar.";
      $("#insp-ex").textContent = "";
      $("#insp-par").textContent = "";
      return;
    }
    const catObj = indice.categorias.find(c => c.id === pc.categoria);
    $("#insp-cat").textContent = catObj ? catObj.titulo : pc.categoria;
    $("#insp-nome").textContent = pc.nome;
    $("#insp-desc").textContent = pc.descricao;
    $("#insp-ex").textContent = pc.exemplo;
    $("#insp-par").textContent = pc.parametros || "t";
  }

  function atualizarHeroPersonagem() {
    const id = state.selP;
    const x = K.PERSONAGENS[id];
    if (!x) return;
    const estiloInfo = ESTILOS.find(e => e[0] === state.estilo);
    $("#char-brush-badge").textContent = estiloInfo ? estiloInfo[1] : state.estilo;
    $("#char-hero-age").textContent = IDADES_TXT[x.idade]?.replace(/s$/, "") || x.idade;
    $("#char-hero-gender").textContent = x.genero;
    $("#char-hero-skin").style.background = PELES_HEX[x.pele] || "#C78B5E";
    $("#char-hero-title").textContent = id;
    $("#char-hero-sub").textContent = `${x.nome} · cabelo ${x.cabelo}`;
    const traits = [
      x.opcoes?.penteado && `Penteado: ${x.opcoes.penteado}`,
      x.opcoes?.chapeu && `Acessório: ${x.opcoes.chapeu}`,
      x.opcoes?.rosto && `Rosto: ${x.opcoes.rosto}`,
      x.opcoes?.noTronco && `Traje: ${x.opcoes.noTronco}`,
      x.cadeira && "Cadeira de rodas",
      x.bengala && "Bengala",
    ].filter(Boolean);
    $("#char-hero-traits").innerHTML = traits.map(t => `<span class="trait-tag">${esc(t)}</span>`).join("");
    $("#char-hero-code").textContent = `K.pessoa(p, "${id}", { pose: atuar(L, roteiro), virado: 1, t })`;
  }

  /* ---------- desenhos nos canvases ---------- */
  function desenharGaleria(t) {
    const cv = $("#kit-cv-galeria");
    const zoomCv = $("#kit-cv-zoom");
    if (!cv) return;
    const { itens } = pagina();
    const { largura, altura } = tamanhoDaFolha(Math.max(itens.length, COLS_GAL), { cols: COLS_GAL, cel: CEL_GAL });
    if (cv.width !== largura || cv.height !== altura) { cv.width = largura; cv.height = altura; }
    const ctx = cv.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    pincel.inicio(ctx, largura, altura, t);
    pincel.fundo(t);
    celulas = desenharFolha(pincel, itens.map(pc => ({ nome: pc.nome, fn: K[pc.nome], info: pc })), { cols: COLS_GAL, cel: CEL_GAL, t, selecionada: state.sel });
    if (!itens.length) pincel.texto("Nenhuma peça encontrada", largura / 2, altura / 2, { tam: 34, cor: "c1" });
    pincel.fim();

    for (const c of celulas) {
      if (c.erro && !erros.has(c.nome)) { erros.add(c.nome); console.error(`peça ${c.nome}: ${c.erro}`); }
    }

    if (zoomCv) {
      const zCtx = zoomCv.getContext("2d");
      const W = zoomCv.width, H = zoomCv.height;
      zCtx.setTransform(1, 0, 0, 1, 0, 0);
      pincel.inicio(zCtx, W, H, t);
      pincel.fundo(t);
      const pc = indice.pecas.find(x => x.nome === state.sel);
      if (pc && typeof K[pc.nome] === "function") {
        const [x0, y0, x1, y1] = medirPeca(K[pc.nome], pc, pc.nome);
        const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
        const s = Math.min((W * 0.72) / bw, (H * 0.72) / bh, 3.6);
        pincel.em({ x: W / 2 - ((x0 + x1) / 2) * s, y: H / 2 - ((y0 + y1) / 2) * s, s }, () => {
          try { K[pc.nome](pincel, opcoesDaPeca(pc, t)); } catch {}
        });
      }
      pincel.fim();
    }
  }

  function desenharPersonagens(t) {
    const heroCv = $("#kit-cv-char-hero");
    if (heroCv && K.PERSONAGENS[state.selP]) {
      const hCtx = heroCv.getContext("2d");
      const W = heroCv.width, H = heroCv.height;
      hCtx.setTransform(1, 0, 0, 1, 0, 0);
      pincel.inicio(hCtx, W, H, t);
      pincel.fundo(t);
      const id = state.selP;
      const g = state.gesto === "variado" ? "acenar" : state.gesto;
      const pose = K.PERSONAGENS[id].cadeira ? undefined : (CICLOS[g] ? CICLOS[g](t) : g);
      pincel.em({ x: W / 2, y: H * 0.8, s: 0.78 }, () => {
        pincel.elipse(0, 6, 76, 14, "sombra", { prof: 0, liso: true });
        K.pessoa(pincel, id, { t, pose, semente: 3 });
      });
      pincel.fim();
    }

    const cv = $("#kit-cv-personagens");
    if (!cv) return;
    const lista = personagensFiltrados();
    const cols = 7, cel = 250;
    const { largura, altura } = tamanhoDaFolha(Math.max(lista.length, cols), { cols, cel });
    if (cv.width !== largura || cv.height !== altura) { cv.width = largura; cv.height = altura; }
    const ctx = cv.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    pincel.inicio(ctx, largura, altura, t);
    pincel.fundo(t);
    celulasP = desenharFolha(pincel, lista.map(([id], i) => ({
      nome: id,
      info: { parametros: "t" },
      fn: (p, o) => K.pessoa(p, id, { t: o.t, pose: poseDe(id, i, o.t), semente: i }),
    })), { cols, cel, t, selecionada: state.selP });
    if (!lista.length) pincel.texto("Nenhum personagem com esses filtros", largura / 2, altura / 2, { tam: 34, cor: "c1" });
    pincel.fim();
  }

  function desenharLegendas(t) {
    const cv = $("#kit-cv-legendas");
    if (!cv) return;
    const nomes = K.NOMES_DE_LEGENDA;
    const LW = 560, LH = 310, cols = 3, lin = Math.ceil(nomes.length / cols);
    const W = LW * cols, H = LH * lin;
    const tt = t % (dadosLegenda.duracao + 0.6);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const ctx = cv.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    pincel.inicio(ctx, W, H, t);
    pincel.fundo(t);
    nomes.forEach((nome, i) => {
      const x = (i % cols) * LW, y = Math.floor(i / cols) * LH;
      pincel.recortar(retP(x + 3, y + 3, LW - 6, LH - 6), () => pincel.em({ x, y }, () => {
        pincel.em({ x: 120, y: LH - 18, s: 0.56 }, () => K.casa(pincel, { t }));
        pincel.em({ x: LW - 105, y: LH - 18, s: 0.56 }, () => K.predio(pincel, { t, alt: 340, semente: i }));
        pincel.em({ x: LW / 2 + Math.sin(t * 0.6 + i) * 85, y: LH - 14, s: 0.45 }, () => K.veiculo(pincel, { t, cor: ["c1", "c3", "c2"][i % 3] }));
        legenda(pincel, dadosLegenda, tt, { estilo: nome, x: LW / 2, y: LH * 0.46, tam: 36, largura: LW * 0.86 });
        pincel.texto(`${nome} · ${K.ESTILOS_DE_LEGENDA[nome].nome}`, 16, 26, { tam: 19, cor: "c2", alinhar: "left", peso: 700 });
      }));
      pincel.linha(retP(x + 2, y + 2, LW - 4, LH - 4), "c4", 2, { fechar: true });
    });
    pincel.fim();
  }

  function prepararDemo() {
    const cv = $("#kit-cv-cenas");
    if (!cv) return;
    filme = criarExemplo(state.estilo, { vertical: state.vertical });
    if (!toc) {
      toc = tocar(cv, filme, {
        escala: 0.5,
        aoAtualizar: t => {
          const r = $("#kit-linha");
          const tm = $("#kit-tempo");
          if (r) r.value = t / filme.duracao;
          if (tm) tm.textContent = `${t.toFixed(1)} s de ${filme.duracao.toFixed(0)} s`;
        },
      });
    } else {
      toc.trocarFilme(filme);
    }
    const tr = $("#kit-trechos");
    tr.innerHTML = "";
    filme.beats.forEach((b, i) => {
      const x = document.createElement("button");
      x.type = "button";
      x.className = "chip";
      x.textContent = `Beat ${i + 1}`;
      x.title = `${b.de} s`;
      x.onclick = () => toc.ir(b.de + 0.01);
      tr.append(x);
    });
    container.querySelectorAll("#kit-formatos button").forEach(b => b.setAttribute("aria-pressed", String((b.dataset.v === "1") === state.vertical)));
    if (state.fixo !== null) {
      toc.pausar();
      toc.ir(state.fixo);
    } else {
      toc.tocar();
    }
    const playBtn = $("#kit-play-toggle");
    if (playBtn) playBtn.textContent = toc.tocando ? "Pausar" : "Tocar";
  }

  /* ---------- sincronia de UI ---------- */
  function atualizarUI() {
    for (const aba of ["galeria", "personagens", "legendas", "cenas"]) {
      const el = $("#sub-" + aba);
      if (el) el.hidden = state.aba !== aba;
    }
    container.querySelectorAll("[data-brush]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.brush === state.estilo)));
    container.querySelectorAll("[data-brush-quick]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.brushQuick === state.estilo)));
    container.querySelectorAll("#kit-cats button").forEach(b => b.setAttribute("aria-pressed", String(!state.q.trim() && b.dataset.cat === state.cat)));
    container.querySelectorAll("#kit-idades button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.idade === state.idade)));
    container.querySelectorAll("#kit-generos button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.genero === state.genero)));
    container.querySelectorAll("#kit-gestos button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.gesto === state.gesto)));
    container.querySelectorAll(".cap-card").forEach(card => {
      const on = card.dataset.cap === state.legendaAtiva;
      card.classList.toggle("is-active", on);
      const btn = card.querySelector(".use-cap-btn");
      if (btn) btn.textContent = on ? "Ativo no projeto ✓" : "Usar no projeto";
    });
    const activeLbl = $("#kit-cap-active-label");
    if (activeLbl) activeLbl.textContent = state.legendaAtiva;

    if (state.aba === "galeria") {
      const { lista, n } = pagina();
      const catTitulo = state.q.trim()
        ? `Busca: "${state.q.trim()}"`
        : state.cat === "todas"
          ? "Todas as peças"
          : (indice.categorias.find(c => c.id === state.cat)?.titulo || state.cat);
      $("#gal-cat-title").textContent = catTitulo;
      $("#gal-pag-info").textContent = `${lista.length} peça${lista.length === 1 ? "" : "s"}`;
      $("#kit-pag-num").textContent = `${state.pag + 1} / ${n}`;
      $("#kit-ant").disabled = state.pag === 0;
      $("#kit-prox").disabled = state.pag >= n - 1;
      atualizarInspectorPeca();
    } else if (state.aba === "personagens") {
      const lista = personagensFiltrados();
      if (lista.length && !lista.some(([id]) => id === state.selP)) state.selP = lista[0][0];
      $("#char-count").textContent = `${lista.length} ${lista.length === 1 ? "personagem" : "personagens"}`;
      atualizarHeroPersonagem();
    }

    if (state.ativo && state.aba === "cenas") {
      prepararDemo();
    } else {
      toc?.pausar();
    }
  }

  function loop(agora) {
    if (!state.ativo) { rafId = 0; return; }
    rafId = requestAnimationFrame(loop);
    if (document.hidden || state.aba === "cenas" || agora - ultimo < 32) return;
    ultimo = agora;
    const t = state.fixo ?? (agora - inicio) / 1000;
    try {
      if (state.aba === "galeria") desenharGaleria(t);
      else if (state.aba === "personagens") desenharPersonagens(t);
      else if (state.aba === "legendas") desenharLegendas(t);
    } catch (e) {
      if (!erros.has(e.message)) { erros.add(e.message); console.error(e); }
    }
  }

  /* ---------- eventos ---------- */
  container.addEventListener("click", async e => {
    const brushBtn = e.target.closest("[data-brush], [data-brush-quick]");
    if (brushBtn) {
      state.estilo = brushBtn.dataset.brush || brushBtn.dataset.brushQuick;
      pincel = criarPincel(state.estilo);
      atualizarUI();
      return;
    }
    const catBtn = e.target.closest("#kit-cats button");
    if (catBtn) {
      state.cat = catBtn.dataset.cat;
      state.q = "";
      state.pag = 0;
      state.sel = null;
      if (state.cat === "objetos3d" && state.estilo === "papel") {
        state.estilo = "3d";
        pincel = criarPincel("3d");
      }
      atualizarUI();
      if (aoNavegarUrl) aoNavegarUrl(`/galeria?cat=${encodeURIComponent(state.cat)}&estilo=${encodeURIComponent(state.estilo)}`);
      return;
    }
    if (e.target.closest("#kit-ant")) { state.pag = Math.max(0, state.pag - 1); state.sel = null; atualizarUI(); return; }
    if (e.target.closest("#kit-prox")) { state.pag++; state.sel = null; atualizarUI(); return; }

    const idd = e.target.closest("#kit-idades button");
    if (idd) { state.idade = idd.dataset.idade; atualizarUI(); return; }
    const gen = e.target.closest("#kit-generos button");
    if (gen) { state.genero = gen.dataset.genero; atualizarUI(); return; }
    const ges = e.target.closest("#kit-gestos button");
    if (ges) { state.gesto = ges.dataset.gesto; atualizarUI(); return; }

    const copyPeca = e.target.closest("#insp-copy-btn");
    if (copyPeca) {
      const txtCode = $("#insp-ex").textContent;
      try { await navigator.clipboard.writeText(txtCode); copyPeca.textContent = "Copiado ✓"; } catch { copyPeca.textContent = "Selecione"; }
      setTimeout(() => { copyPeca.textContent = "Copiar código"; }, 1600);
      return;
    }
    const copyChar = e.target.closest("#char-copy-btn");
    if (copyChar) {
      const txtCode = $("#char-hero-code").textContent;
      try { await navigator.clipboard.writeText(txtCode); copyChar.textContent = "Copiado ✓"; } catch { copyChar.textContent = "Selecione"; }
      setTimeout(() => { copyChar.textContent = "Copiar código"; }, 1600);
      return;
    }

    const useCap = e.target.closest(".use-cap-btn");
    if (useCap) {
      state.legendaAtiva = useCap.dataset.useCap;
      aoEscolherLegenda?.(state.legendaAtiva);
      atualizarUI();
      return;
    }

    const fmtBtn = e.target.closest("#kit-formatos button");
    if (fmtBtn) {
      state.vertical = fmtBtn.dataset.v === "1";
      prepararDemo();
      return;
    }
    if (e.target.closest("#kit-play-toggle") && toc) {
      toc.alternar();
      $("#kit-play-toggle").textContent = toc.tocando ? "Pausar" : "Tocar";
      return;
    }
  });

  $("#kit-cv-galeria").addEventListener("click", e => {
    const cv = e.currentTarget;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * cv.width / r.width;
    const y = (e.clientY - r.top) * cv.height / r.height;
    const c = celulas.find(cell => x >= cell.x && x < cell.x + cell.w && y >= cell.y && y < cell.y + cell.h);
    if (c) {
      state.sel = c.nome;
      atualizarInspectorPeca();
      desenharGaleria((performance.now() - inicio) / 1000);
    }
  });

  $("#kit-cv-personagens").addEventListener("click", e => {
    const cv = e.currentTarget;
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) * cv.width / r.width;
    const y = (e.clientY - r.top) * cv.height / r.height;
    const c = celulasP.find(cell => x >= cell.x && x < cell.x + cell.w && y >= cell.y && y < cell.y + cell.h);
    if (c) {
      state.selP = c.nome;
      atualizarHeroPersonagem();
      desenharPersonagens((performance.now() - inicio) / 1000);
      container.querySelector(".hero-char-stage")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  $("#kit-cap-text").addEventListener("input", e => {
    state.texto = e.target.value.trim() || legendasDeExemplo().texto;
    dadosLegenda = legendasDeExemplo(state.texto);
  });

  $("#kit-linha").addEventListener("input", e => {
    if (toc && filme) toc.ir(Number(e.target.value) * filme.duracao);
  });

  return {
    indice,
    ativar(aba, searchParams) {
      state.aba = ["galeria", "personagens", "legendas", "cenas"].includes(aba) ? aba : "galeria";
      if (searchParams) {
        const cat = searchParams.get("cat");
        if (cat && (cat === "todas" || indice.categorias.some(c => c.id === cat))) {
          state.cat = cat;
          state.pag = 0;
          state.sel = null;
        }
        const est = searchParams.get("estilo");
        if (est && ESTILOS.some(e => e[0] === est)) {
          state.estilo = est;
          pincel = criarPincel(est);
        }
        const peca = searchParams.get("peca");
        if (peca && indice.pecas.some(pc => pc.nome === peca)) state.sel = peca;
        const p = searchParams.get("p");
        if (p && K.PERSONAGENS[p]) state.selP = p;
      }
      state.ativo = true;
      atualizarUI();
      if (!rafId) {
        ultimo = 0;
        rafId = requestAnimationFrame(loop);
      }
    },
    desativar() {
      state.ativo = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
      toc?.pausar();
    },
    filtrarBusca(texto) {
      state.q = texto || "";
      state.pag = 0;
      state.sel = null;
      if (state.ativo) atualizarUI();
    },
    atualizarLegendaAtiva(id) {
      state.legendaAtiva = id;
      if (state.ativo) atualizarUI();
    },
  };
}
