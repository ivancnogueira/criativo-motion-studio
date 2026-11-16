// Categoria: Comunicação e criação de conteúdo
import { celular, camera, megafone, envelope } from "./base.js";
import { microfone } from "./esporte.js";
import { brilho } from "./efeitos.js";
import { sinalWifi } from "./tecnologia.js";

/** Gravação de podcast com microfone e brilho pulsante. Chaves: podcast, microfone, entrevista, gravação */
export function gravacaoDePodcast(p, { t = 0 } = {}) {
  p.em({ x: -45, s: .8 }, () => microfone(p, { t }));
  p.em({ x: 85, y: -140, s: .35 }, () => brilho(p, { t }));
}

/** Transmissão ao vivo com câmera e sinal animado. Chaves: transmissão, câmera, live, vídeo */
export function transmissaoAoVivo(p, { t = 0 } = {}) {
  p.em({ x: -40, s: .65 }, () => camera(p, { t }));
  p.em({ x: 95, y: -125, s: .38 }, () => sinalWifi(p, { t }));
}

/** Divulgação de conteúdo com megafone e celular em movimento. Chaves: divulgação, conteúdo, celular, marketing */
export function divulgacaoDigital(p, { t = 0 } = {}) {
  p.em({ x: -75, s: .55 }, () => megafone(p, { t }));
  p.em({ x: 90, s: .55 }, () => celular(p, { t }));
}

/** Mensagem recebida com envelope e brilho animado. Chaves: mensagem, email, carta, notificação */
export function mensagemRecebida(p, { t = 0 } = {}) {
  p.em({ x: -35, s: .7 }, () => envelope(p, { t }));
  p.em({ x: 105, y: -80, s: .35 }, () => brilho(p, { t }));
}
