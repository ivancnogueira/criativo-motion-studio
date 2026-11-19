// Categoria: Objetos e personagens 3D
// Kit de movimento — peças volumétricas e personagens articulados em 3D real (rotação XYZ, perspectiva e luz).
// Todas usam o motor kit/3d.js desenhando através do pincel `p`, por isso funcionam em todos os estilos da galeria.
// O que fica no chão tem a base em y = 0; ícones e objetos flutuantes ficam centrados na origem.
import { clamp, lerp, E, mola, circP, retP, retArredP, estrelaP, TAU, ciclo, vaiVem } from "./_comum.js";
import { caixa3d, cilindro3d, piramide3d, juntarMalhas, desenharMalha3d, esfera3d, capsula3d, personagem3d, tom3d } from "../3d.js";
import { CICLOS, atuar } from "../movimento.js";

/** Cubo 3D rotacionando no espaço com faces iluminadas e núcleo flutuante. Opções: larg, cor, t. Chaves: cubo 3d, bloco 3d, volume, caixa, dado, geometria 3d, objeto 3d */
export function cubo3d(p, { larg = 240, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.48, flut = Math.sin(tt * 2) * larg * 0.04;
  p.alfa(0.24, () => p.elipse(0, s * 0.95, s * 0.72, s * 0.18, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, caixa3d(s, s, s, cor), { rx: 0.42 + Math.sin(tt * 1.1) * 0.18, ry: tt * 0.9, oy: flut });
}

/** Pirâmide 3D em rotação contínua com base iluminada e sombra no chão. Opções: larg, cor, t. Chaves: pirâmide 3d, hierarquia 3d, funil, topo, triângulo 3d, monumento */
export function piramide3dPeca(p, { larg = 260, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.42;
  p.alfa(0.24, () => p.elipse(0, s * 0.92, s * 0.78, s * 0.2, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, piramide3d(s, s * 1.45, 4, cor, { corBase: "c4" }), { rx: 0.3, ry: tt * 0.85, oy: Math.sin(tt * 2) * s * 0.08 });
}

/** Esfera 3D com iluminação de estúdio e anel orbital girando ao redor. Opções: larg, cor, t. Chaves: esfera 3d, globo 3d, planeta 3d, orbita, bola 3d, mundo 3d */
export function esferaOrbita3d(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.28, R = larg * 0.44, inclin = 0.42;
  const anel = (frente) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * TAU;
      const x = Math.cos(a) * R, y = Math.sin(a) * R * Math.sin(inclin), z = Math.sin(a) * R * Math.cos(inclin);
      if ((frente && z >= 0) || (!frente && z <= 0)) pts.push([x, y]);
    }
    if (pts.length >= 2) p.linha(pts, "c2", Math.max(4, larg * 0.025));
  };
  anel(false);
  esfera3d(p, 0, Math.sin(tt * 2) * r * 0.08, r, cor);
  anel(true);
  const satA = tt * 1.8;
  if (Math.sin(satA) >= 0) esfera3d(p, Math.cos(satA) * R, Math.sin(satA) * R * Math.sin(inclin), larg * 0.06, "c3");
}

/** Smartphone 3D inclinado girando em perspectiva com tela acesa e alerta saltando. Opções: larg, cor, t. Chaves: celular 3d, smartphone 3d, aplicativo 3d, tela 3d, mobile 3d */
export function celular3d(p, { larg = 240, cor = "c4", t = 0 } = {}) {
  const tt = p.ritmo(t), w = larg * 0.46, h = larg * 0.86, d = larg * 0.08;
  const corpo = juntarMalhas([
    caixa3d(w, h, d, cor),
    caixa3d(w * 0.84, h * 0.84, d * 0.2, "claro", { oz: d * 0.46 }),
  ]);
  p.alfa(0.24, () => p.elipse(0, h * 0.62, w * 0.72, w * 0.18, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, corpo, { rx: -0.14, ry: Math.sin(tt * 1.1) * 0.48, oy: Math.sin(tt * 2) * larg * 0.03 });
  const pulo = Math.sin(tt * 3.2) * larg * 0.035;
  esfera3d(p, w * 0.36, -h * 0.28 + pulo, larg * 0.085, "c2");
}

/** Notebook 3D em perspectiva com tampa aberta e luz na tela. Opções: larg, cor, t. Chaves: notebook 3d, laptop 3d, computador 3d, código 3d, trabalho 3d */
export function notebook3d(p, { larg = 300, cor = "c4", t = 0 } = {}) {
  const tt = p.ritmo(t), w = larg * 0.54, d = larg * 0.36, e = larg * 0.04;
  const malha = juntarMalhas([
    caixa3d(w, e, d, cor, { oy: e * 2.4 }),
    caixa3d(w, w * 0.66, e * 0.8, cor, { oy: -w * 0.25, oz: -d * 0.46 }),
    caixa3d(w * 0.86, w * 0.52, e * 0.4, "c1", { oy: -w * 0.25, oz: -d * 0.43 }),
  ]);
  desenharMalha3d(p, malha, { rx: 0.28, ry: -0.35 + Math.sin(tt * 0.9) * 0.22, oy: Math.sin(tt * 1.8) * larg * 0.025 });
}

/** Torre de servidor 3D com gavetas em perspectiva e luzes de status piscando. Opções: alt, cor, t. Chaves: servidor 3d, nuvem 3d, banco de dados 3d, rack 3d, infraestrutura */
export function servidor3d(p, { alt = 300, cor = "c4", t = 0 } = {}) {
  const tt = p.ritmo(t), w = alt * 0.46, h = alt * 0.78, d = alt * 0.42;
  const rack = juntarMalhas([
    caixa3d(w, h, d, cor, { oy: -h / 2 }),
    caixa3d(w * 0.82, h * 0.16, d * 0.14, "tinta", { oy: -h * 0.76, oz: d * 0.48 }),
    caixa3d(w * 0.82, h * 0.16, d * 0.14, "tinta", { oy: -h * 0.52, oz: d * 0.48 }),
    caixa3d(w * 0.82, h * 0.16, d * 0.14, "tinta", { oy: -h * 0.28, oz: d * 0.48 }),
  ]);
  p.alfa(0.24, () => p.elipse(0, 6, w * 0.85, w * 0.22, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, rack, { rx: 0.18, ry: -0.45 + Math.sin(tt * 0.8) * 0.16 });
  for (let i = 0; i < 3; i++) {
    const on = Math.sin(tt * 5 + i * 2.1) > 0;
    esfera3d(p, -w * 0.22, -h * (0.76 - i * 0.24), alt * 0.028, on ? "c3" : "c2", { brilho: false });
  }
}

/** Moeda 3D espessa girando em torno do eixo vertical com brilho metálico. Opções: larg, cor, t. Chaves: moeda 3d, dinheiro 3d, lucro 3d, ouro 3d, cripto 3d, pagamento 3d */
export function moeda3d(p, { larg = 240, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.34, esp = larg * 0.09;
  p.alfa(0.24, () => p.elipse(0, r * 1.15, r * 0.75, r * 0.18, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, cilindro3d(r, r, esp, 14, cor, { corTampa: cor }), { rx: Math.PI / 2, ry: tt * 1.7, rz: 0.12 });
}

/** Cofre 3D em perspectiva com volante giratório e barra de proteção. Opções: larg, cor, t. Chaves: cofre 3d, segurança 3d, reserva 3d, banco 3d, economia 3d */
export function cofre3d(p, { larg = 260, cor = "c4", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.58;
  const cofre = juntarMalhas([
    caixa3d(s, s, s * 0.88, cor, { oy: -s / 2 }),
    caixa3d(s * 0.78, s * 0.78, s * 0.14, "c1", { oy: -s / 2, oz: s * 0.44 }),
  ]);
  desenharMalha3d(p, cofre, { rx: 0.16, ry: -0.35 + Math.sin(tt * 0.8) * 0.12 });
  const a = tt * 1.5;
  esfera3d(p, -s * 0.08, -s * 0.48, s * 0.16, "c2");
  for (let i = 0; i < 4; i++) {
    const ang = a + i * Math.PI / 2;
    p.linha([[-s * 0.08, -s * 0.48], [-s * 0.08 + Math.cos(ang) * s * 0.14, -s * 0.48 + Math.sin(ang) * s * 0.14]], "claro", Math.max(3, larg * 0.018));
  }
}

/** Gráfico de barras 3D extrudadas crescendo em cascata na perspectiva. Opções: larg, cor, k, t. Chaves: gráfico 3d, barras 3d, métricas 3d, crescimento 3d, dados 3d */
export function grafBarras3d(p, { larg = 300, cor = "c1", k = 1, t = 0 } = {}) {
  const tt = p.ritmo(t), alts = [0.36, 0.58, 0.84, 1.0], cores = [cor, "c3", "c4", "c2"];
  const n = alts.length, bw = larg * 0.14, gap = larg * 0.2, x0 = -((n - 1) * gap) / 2;
  const barras = [caixa3d(larg * 0.92, larg * 0.05, larg * 0.36, "tinta", { oy: larg * 0.025 })];
  for (let i = 0; i < n; i++) {
    const progI = clamp(k * 1.4 - i * 0.12);
    const h = Math.max(8, larg * 0.68 * alts[i] * E.sai(progI) * (0.92 + 0.08 * Math.sin(tt * 2 + i)));
    barras.push(caixa3d(bw, h, bw, cores[i], { ox: x0 + i * gap, oy: -h / 2 }));
  }
  desenharMalha3d(p, juntarMalhas(barras), { rx: 0.22, ry: -0.32 + Math.sin(tt * 0.7) * 0.12 });
}

/** Gráfico de pizza 3D inclinado girando lentamente com destaque em fatia saltada. Opções: larg, cor, t. Chaves: pizza 3d, proporção 3d, fatia 3d, mercado 3d, divisão */
export function grafPizza3d(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.36, esp = larg * 0.11;
  desenharMalha3d(p, cilindro3d(r, r, esp, 16, cor, { corTampa: "c3" }), { rx: 0.95, ry: tt * 0.6 });
  desenharMalha3d(p, cilindro3d(r * 0.45, r * 0.45, esp * 1.35, 10, "c2", { ox: r * 0.25, oz: r * 0.15 }), { rx: 0.95, ry: tt * 0.6, oy: -larg * 0.06 });
}

/** Troféu 3D brilhando e girando sobre pedestal. Opções: alt, cor, t. Chaves: troféu 3d, prêmio 3d, vitória 3d, campeão 3d, sucesso 3d */
export function trofeu3d(p, { alt = 280, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), s = alt * 0.42;
  const malha = juntarMalhas([
    caixa3d(s * 0.85, s * 0.26, s * 0.85, "tinta", { oy: -s * 0.13 }),
    cilindro3d(s * 0.15, s * 0.22, s * 0.45, 10, cor, { oy: -s * 0.48 }),
    cilindro3d(s * 0.62, s * 0.34, s * 0.66, 12, cor, { oy: -s * 1.02 }),
  ]);
  desenharMalha3d(p, malha, { rx: 0.15, ry: tt * 0.85 });
  const br = (tt * 1.4) % 1;
  p.em({ x: s * 0.55, y: -s * 1.32, s: Math.sin(br * Math.PI) + 0.05, r: tt * 2 }, () =>
    p.forma(estrelaP(0, 0, s * 0.18, s * 0.06, 4), "claro", { prof: 0, liso: true })
  );
}

/** Caixa de entrega 3D girando e abrindo com brilho saindo de dentro. Opções: larg, cor, t. Chaves: caixa 3d, encomenda 3d, entrega 3d, produto 3d, pacote 3d */
export function caixaEntrega3d(p, { larg = 240, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.52, abre = vaiVem(tt, 0.45) * s * 0.12;
  const malha = juntarMalhas([
    caixa3d(s, s * 0.86, s, cor, { oy: -s * 0.43 }),
    caixa3d(s * 1.06, s * 0.16, s * 1.06, "c1", { oy: -s * 0.94 - abre }),
  ]);
  desenharMalha3d(p, malha, { rx: 0.24, ry: -0.5 + Math.sin(tt * 0.8) * 0.25 });
}

/** Conjunto de prédios 3D em bloco urbano com luzes de janelas acendendo. Opções: alt, cor, t. Chaves: prédio 3d, cidade 3d, empresa 3d, arquitetura 3d, imóveis 3d */
export function predio3d(p, { alt = 300, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), s = alt * 0.32;
  const malha = juntarMalhas([
    caixa3d(s * 0.95, s * 1.9, s * 0.95, cor, { oy: -s * 0.95 }),
    caixa3d(s * 0.72, s * 1.35, s * 0.72, "c4", { ox: -s * 0.88, oy: -s * 0.675, oz: s * 0.15 }),
    caixa3d(s * 0.68, s * 1.05, s * 0.68, "c3", { ox: s * 0.86, oy: -s * 0.525, oz: -s * 0.1 }),
  ]);
  p.alfa(0.24, () => p.elipse(0, 6, s * 1.4, s * 0.32, "tinta", { prof: 0, liso: true }));
  desenharMalha3d(p, malha, { rx: 0.2, ry: -0.42 + Math.sin(tt * 0.6) * 0.18 });
}

/** Engrenagem 3D volumétrica girando com eixo central em destaque. Opções: larg, cor, t. Chaves: engrenagem 3d, sistema 3d, automação 3d, processo 3d, mecânica */
export function engrenagem3d(p, { larg = 260, cor = "c4", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.32, esp = larg * 0.1;
  const partes = [cilindro3d(r, r, esp, 12, cor), cilindro3d(r * 0.36, r * 0.36, esp * 1.4, 10, "c2")];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    partes.push(caixa3d(r * 0.26, esp, r * 0.26, cor, { ox: Math.cos(a) * r * 1.06, oz: Math.sin(a) * r * 1.06 }));
  }
  desenharMalha3d(p, juntarMalhas(partes), { rx: 1.05, ry: tt * 0.9 });
}

/** Nuvem 3D fofa formada por esferas iluminadas e pacotes subindo. Opções: larg, cor, t. Chaves: nuvem 3d, cloud 3d, internet 3d, dados 3d, clima 3d */
export function nuvem3d(p, { larg = 280, cor = "claro", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.16, dy = Math.sin(tt * 1.8) * larg * 0.03;
  p.em({ x: 0, y: dy }, () => {
    esfera3d(p, -r * 1.05, r * 0.18, r * 0.82, cor);
    esfera3d(p, r * 1.05, r * 0.16, r * 0.86, cor);
    esfera3d(p, -r * 0.3, -r * 0.38, r * 1.12, cor);
    esfera3d(p, r * 0.45, -r * 0.22, r * 0.96, cor);
  });
  const f = (tt * 1.1) % 1;
  esfera3d(p, 0, lerp(r * 1.4, r * 0.1, f), r * 0.22, "c2");
}

/** Foguete 3D estilizado decolando com chama volumétrica pulsando. Opções: alt, cor, t. Chaves: foguete 3d, lançamento 3d, crescimento 3d, startup 3d, espaço 3d */
export function foguete3d(p, { alt = 280, cor = "claro", t = 0 } = {}) {
  const tt = p.ritmo(t), r = alt * 0.14, h = alt * 0.44;
  const malha = juntarMalhas([
    cilindro3d(r * 0.82, r, h, 12, cor),
    piramide3d(r * 0.9, h * 0.65, 8, "c2", { oy: -h * 0.82 }),
    cilindro3d(r * 0.42, r * 0.68, h * 0.22, 8, "c4", { oy: h * 0.6 }),
  ]);
  const ch = 0.7 + 0.3 * Math.sin(tt * 18);
  esfera3d(p, 0, h * 0.82, r * 0.55 * ch, "c2");
  desenharMalha3d(p, malha, { rx: 0.12, ry: tt * 1.2, rz: -0.18, oy: Math.sin(tt * 3.5) * alt * 0.03 });
}

/** Coração 3D volumétrico pulsando com brilho suave de estúdio. Opções: larg, cor, t. Chaves: coração 3d, saúde 3d, amor 3d, curtida 3d, engajamento 3d */
export function coracao3d(p, { larg = 240, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), pulso = 1 + 0.09 * Math.pow(Math.max(0, Math.sin(tt * 3.8)), 3);
  const r = larg * 0.2 * pulso;
  p.em({ x: 0, y: Math.sin(tt * 2) * larg * 0.02 }, () => {
    esfera3d(p, -r * 0.75, -r * 0.25, r, cor);
    esfera3d(p, r * 0.75, -r * 0.25, r, cor);
    p.forma([[-r * 1.65, -r * 0.05], [0, r * 1.65], [r * 1.65, -r * 0.05]], tom3d(p, cor, -0.12), { prof: 0, liso: true });
    esfera3d(p, 0, r * 0.35, r * 0.85, cor, { brilho: false });
  });
}

/** Robô assistente de IA em 3D flutuando, girando o corpo e acenando com antena luminosa. Opções: alt, cor, t. Chaves: robô 3d, ia 3d, agente 3d, assistente 3d, bot 3d, automação */
export function robo3d(p, { alt = 290, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t);
  return personagem3d(p, {
    altura: alt, robo: true, roupa: cor, calca: "c4",
    yaw: Math.sin(tt * 0.9) * 0.55 + 0.25,
    pose: atuar(tt, [{ ate: 2.2, acao: "acenar" }, { acao: "comemorar" }]),
    t: tt,
  });
}

/** Avatar 3D articulado atuando com profundidade real de membros e giro de câmera. Opções: alt, cor, pose, t. Chaves: personagem 3d, pessoa 3d, avatar 3d, boneco 3d, mascote 3d */
export function avatar3d(p, { alt = 300, cor = "c1", pose = null, t = 0 } = {}) {
  const tt = p.ritmo(t);
  return personagem3d(p, {
    altura: alt, roupa: cor, calca: "c4", pele: "pele2", expressao: "feliz",
    yaw: 0.4 + Math.sin(tt * 0.85) * 0.45,
    pose: pose ?? atuar(tt, [{ ate: 2.5, acao: "andar" }, { ate: 4.5, acao: "apontar" }, { acao: "comemorar" }]),
    t: tt,
  });
}

/** Cápsula / núcleo de IA em 3D com dois anéis orbitando e luz pulsante. Opções: larg, cor, t. Chaves: núcleo 3d, ia 3d, energia 3d, átomo 3d, tecnologia 3d */
export function nucleoIa3d(p, { larg = 260, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.22;
  for (let i = 0; i < 2; i++) {
    const a = i ? 0.65 : -0.65;
    p.em({ x: 0, y: 0, r: a + tt * (i ? -0.4 : 0.4) }, () =>
      p.linha(circP(0, 0, larg * 0.4, 28, larg * 0.15), i ? "c2" : "c3", Math.max(4, larg * 0.022), { fechar: true })
    );
  }
  esfera3d(p, 0, 0, r * (0.95 + 0.08 * Math.sin(tt * 4)), cor);
}

/** Caminhão de entrega 3D inclinado em movimento com rodas girando. Opções: larg, cor, t. Chaves: caminhão 3d, logística 3d, frete 3d, transporte 3d, entrega 3d */
export function caminhao3d(p, { larg = 290, cor = "c1", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.32;
  const malha = juntarMalhas([
    caixa3d(s * 1.4, s * 0.95, s * 0.85, cor, { ox: -s * 0.22, oy: -s * 0.62 }),
    caixa3d(s * 0.65, s * 0.72, s * 0.82, "c2", { ox: s * 0.85, oy: -s * 0.5 }),
  ]);
  desenharMalha3d(p, malha, { rx: 0.16, ry: -0.48 + Math.sin(tt * 1.4) * 0.08, oy: Math.abs(Math.sin(tt * 8)) * s * 0.04 });
  for (const x of [-s * 0.65, s * 0.1, s * 0.72]) esfera3d(p, x, -s * 0.08, s * 0.2, "tinta");
}

/** Avião 3D cruzando o espaço com leve inclinação e rastro de nuvem. Opções: larg, cor, t. Chaves: avião 3d, viagem 3d, voo 3d, internacional 3d, rota 3d */
export function aviao3d(p, { larg = 280, cor = "claro", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.24;
  const malha = juntarMalhas([
    cilindro3d(s * 0.3, s * 0.3, s * 2.1, 10, cor),
    caixa3d(s * 2.4, s * 0.12, s * 0.55, "c1", { oy: 0 }),
    caixa3d(s * 0.9, s * 0.1, s * 0.35, "c2", { oy: s * 0.85 }),
  ]);
  desenharMalha3d(p, malha, { rx: 1.15, ry: 0.45, rz: 0.3 + Math.sin(tt * 2) * 0.12, oy: Math.sin(tt * 2.2) * s * 0.2 });
}

/** Pino de localização 3D quicando sobre disco de mapa iluminado. Opções: alt, cor, t. Chaves: pino 3d, mapa 3d, gps 3d, localização 3d, destino 3d */
export function pinoMapa3d(p, { alt = 260, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), s = alt * 0.35, q = Math.abs(Math.sin(tt * 2.6)) * s * 0.25;
  desenharMalha3d(p, cilindro3d(s * 1.1, s * 1.1, s * 0.14, 16, "c3"), { rx: 1.05 });
  p.em({ x: 0, y: -s * 0.65 - q }, () => {
    p.forma([[-s * 0.42, 0], [0, s * 0.6], [s * 0.42, 0]], tom3d(p, cor, -0.15), { prof: 0, liso: true });
    esfera3d(p, 0, -s * 0.15, s * 0.48, cor);
    esfera3d(p, 0, -s * 0.15, s * 0.18, "claro", { brilho: false });
  });
}

/** Medalha 3D girando em torno do eixo com fita de destaque. Opções: larg, cor, t. Chaves: medalha 3d, conquista 3d, selo 3d, qualidade 3d, ouro 3d */
export function medalha3d(p, { larg = 240, cor = "c2", t = 0 } = {}) {
  const tt = p.ritmo(t), r = larg * 0.3;
  p.forma([[-r * 0.48, -r * 1.65], [r * 0.48, -r * 1.65], [r * 0.25, -r * 0.5], [-r * 0.25, -r * 0.5]], "c1", { prof: 1 });
  desenharMalha3d(p, cilindro3d(r, r, r * 0.26, 14, cor), { rx: Math.PI / 2, ry: tt * 1.4 });
}

/** Seta volumétrica 3D apontando para cima/frente e pulsando. Opções: larg, cor, t. Chaves: seta 3d, direção 3d, crescimento 3d, progresso 3d, próximo passo */
export function seta3d(p, { larg = 260, cor = "c3", t = 0 } = {}) {
  const tt = p.ritmo(t), s = larg * 0.36;
  const malha = juntarMalhas([
    caixa3d(s * 0.48, s * 0.9, s * 0.44, cor, { oy: s * 0.35 }),
    piramide3d(s * 0.72, s * 0.85, 4, cor, { oy: -s * 0.45 }),
  ]);
  desenharMalha3d(p, malha, { rx: 0.18, ry: tt * 0.8, oy: Math.sin(tt * 3) * s * 0.12 });
}
