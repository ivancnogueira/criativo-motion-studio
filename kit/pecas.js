// Kit de movimento — peças prontas. Este arquivo só reúne as categorias de kit/pecas/ e as legendas:
// import * as K from "./kit/pecas.js" dá acesso a tudo (K.personagem, K.tanque, K.legenda...).
// Gerado por `node scripts/pecas.mjs --gerar` junto com kit/indice.json. Não edite à mão.
//
// Para achar uma peça: npm run pecas -- <palavra> (busca em kit/indice.json) ou a galeria de npm run kit.
// São referências para não começar do zero: cada vídeo deve ter peças próprias do tema.
export * from "./pecas/base.js";
export * from "./pecas/pessoas.js";
export * from "./pecas/animais.js";
export * from "./pecas/natureza.js";
export * from "./pecas/cidade.js";
export * from "./pecas/transporte.js";
export * from "./pecas/tecnologia.js";
export * from "./pecas/dinheiro.js";
export * from "./pecas/saude.js";
export * from "./pecas/comida.js";
export * from "./pecas/casa.js";
export * from "./pecas/ciencia.js";
export * from "./pecas/historia.js";
export * from "./pecas/esporte.js";
export * from "./pecas/simbolos.js";
export * from "./pecas/graficos.js";
export * from "./pecas/efeitos.js";
export { legenda, legendas, legendasDeExemplo, ESTILOS_DE_LEGENDA, NOMES_DE_LEGENDA, LEGENDA_PADRAO, conferirEstiloDeLegenda } from "./legendas.js";
export { pessoa, escolherElenco, PERSONAGENS, CABELOS, IDADES, FAIXAS, GENEROS } from "./elenco.js";

import * as c_base from "./pecas/base.js";
import * as c_pessoas from "./pecas/pessoas.js";
import * as c_animais from "./pecas/animais.js";
import * as c_natureza from "./pecas/natureza.js";
import * as c_cidade from "./pecas/cidade.js";
import * as c_transporte from "./pecas/transporte.js";
import * as c_tecnologia from "./pecas/tecnologia.js";
import * as c_dinheiro from "./pecas/dinheiro.js";
import * as c_saude from "./pecas/saude.js";
import * as c_comida from "./pecas/comida.js";
import * as c_casa from "./pecas/casa.js";
import * as c_ciencia from "./pecas/ciencia.js";
import * as c_historia from "./pecas/historia.js";
import * as c_esporte from "./pecas/esporte.js";
import * as c_simbolos from "./pecas/simbolos.js";
import * as c_graficos from "./pecas/graficos.js";
import * as c_efeitos from "./pecas/efeitos.js";
/** As categorias, na ordem do índice: { id: módulo }. As peças de cada uma estão listadas em kit/indice.json. */
export const CATEGORIAS = { base: c_base, pessoas: c_pessoas, animais: c_animais, natureza: c_natureza, cidade: c_cidade, transporte: c_transporte, tecnologia: c_tecnologia, dinheiro: c_dinheiro, saude: c_saude, comida: c_comida, casa: c_casa, ciencia: c_ciencia, historia: c_historia, esporte: c_esporte, simbolos: c_simbolos, graficos: c_graficos, efeitos: c_efeitos };
