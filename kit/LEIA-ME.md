# Kit de movimento

Peças e movimentos prontos para a animação não começar do zero nem ficar parada. Veja tudo funcionando com `npm run kit` (abre `kit/demo.html`, com os cinco estilos).

## O kit é referência, não molde

- **Use como ponto de partida.** Copie `kit/` para `saida/<nome>/kit/` e mude o que quiser nessa cópia. Nunca edite `kit/` do produto durante um vídeo.
- **Cada vídeo precisa de peças próprias.** O catálogo cobre o genérico (pessoas, casa, documento, veículo). O que é específico do tema você desenha: copie a peça mais parecida e mude as formas, ou crie do zero com `p.forma`, `p.capsula`, `p.linha` e `p.texto`. Um vídeo feito só com peças do catálogo fica igual aos outros.
- **Varie de propósito.** Troque elenco, cores, poses, entradas e transições entre cenas e entre vídeos. Nunca a mesma entrada ou a mesma transição duas vezes seguidas.
- **O prompt do estilo manda.** Os pincéis são referência em Canvas 2D. Se o estilo pedir WebGL, Three.js ou SVG, use `movimento.js` (que só devolve números) para tempos, poses e curvas, e desenhe com o motor do estilo. Paleta, tipografia e acabamento são os do prompt.
- **Estilos criados pelo usuário:** comece pelo pincel mais próximo, passe a paleta de `metricas.md` em `paleta` e ajuste o acabamento na sua cópia até bater com a folha de referência.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `movimento.js` | Motor sem desenho: curvas, entradas, saídas, movimento contínuo, beats, sincronia com a fala, caminhos, câmera, esqueleto e atuação de personagem |
| `pinceis.js` | `criarPincel(estilo)`: as mesmas formas no acabamento de cada estilo (papel, flat, pixel, traco, vidro) |
| `pecas.js` | Personagem articulado, elenco, cenários e objetos animados; legendas na tela |
| `filme.js` | `criarFilme({ beats })`: junta os beats em `desenhar(ctx, t)` com transições |
| `tocador.js` | `tocar(canvas, filme, { audio })`: tocar, pausar, buscar e seguir o áudio |
| `exemplo.js` | Filme de demonstração; o beat "cena" é um modelo de composição |

## Receita de uma cena viva

```js
import { criarFilme } from "./kit/filme.js";
import { entrada, vivo, combinar, atuar, prog, E, lerp, tempoDaPalavra, beatsPorFrases } from "./kit/movimento.js";
import * as K from "./kit/pecas.js";

const frases = beatsPorFrases(legendas, ["Em 1977", "O que os militares", "Ribeirinhos relatavam"]); // [{ de, ate }]
const tSoldados = tempoDaPalavra(legendas, "soldados");                                             // segundo exato da palavra

const filme = criarFilme({ largura: 1080, altura: 1920, estilo: "recorte-de-papel", beats: [
  { ...frases[0], desenhar(q) {
      const { p, ritmo: t, local: L, W } = q;          // t: tempo no ritmo do estilo · L: segundos desde o início do beat
      p.em({ x: W / 2, y: 1300 }, () => K.montanhas(p, { W, cor: "c4" }));                       // plano de fundo
      const x = lerp(-200, 400, prog(L, 0, 2.5));                                                   // entra andando
      p.em({ x, y: 1400 }, () => K.personagem(p, { ...K.TIPOS.soldado, t,
        pose: atuar(L, [{ ate: 2.5, acao: "andar" }, { ate: 4, acao: "apontarCima" }, { acao: "fotografar" }]) }));
      p.em(combinar({ x: 700, y: 700 }, entrada("cair", q.cascata(0, { espera: 1.2 })), vivo("pairar", t)),
        () => K.ovni(p, { t, feixe: E.sai(prog(L, 2.6, 3.4)) }));                                   // chega na hora e continua vivo
  } },
  // ...um beat por frase
], sobre: q => K.legendas(q.p, legendas, q.t) });
```

Regras que fazem a diferença:

1. **Um beat por frase da narração**, com os tempos vindos de `legendas.json` (`beatsPorFrases`, `tempoDaPalavra`). Cada substantivo ou ação falada aparece na tela no instante em que é dita.
2. **Três camadas de movimento em tudo:** entrada (`entrada`), vida enquanto está na tela (`vivo`, ciclos, `t` nas peças) e saída ou transição. Pelo menos três coisas se movendo a qualquer momento.
3. **Personagem atua, não posa:** use `atuar` com uma sequência (anda, para, reage). Personagens reagem ao que acontece (`expressao`, pose de susto, olhar para o objeto).
4. **Planos:** fundo, meio e frente, com tamanhos diferentes. Use `camera` para aproximar no momento importante e `impacto` em batidas e carimbos.
5. **Um acontecimento novo a cada 2 a 4 segundos** dentro do beat (`prog(L, inicio, fim)` para agendar).
6. **Transições com peso** (`criarFilme` alterna as do estilo sozinho; `transicao: "corte"` só de propósito).

## Referência rápida

**movimento.js** — `clamp, lerp, prog(t, de, ate), passo(t, qps), rng, ruido, semear` · curvas `E.linear, entra, sai, entraSai, volta, elastico, quique` e `mola(k)` · `entrada(tipo, k, { de, dist })` com `pop, deslizar, cair, subir, girar, crescer, surgir, carimbar, desdobrar, pendurar, rolar` · `saida(tipo, k)` com `encolher, deslizar, cair, sumir, voar` · `vivo(tipo, t)` com `respirar, flutuar, balancar, tremer, pulsar, pairar, vento` · `combinar(...)` · `fase, escalonar` · `tempoDaPalavra, beatsPorFrases, conferirBeats` · `caminho(pontos).em(k)`, `arco` · `camera(t, chaves)`, `aplicarCamera`, `impacto` · personagem: `POSES` (parado, apontar, apontarCima, acenar, segurar, carregar, comemorar, assustado, medo, pensando, olharCima, maosNaCintura, sentado, digitando, agachado, empurrar, continencia, fotografar, deitado), `CICLOS` (andar, correr, acenar, digitar, comemorar, tremer, remar, olhar, empurrar, respirar), `atuar(t, roteiro)`, `misturar(a, b, k)`, `esqueleto(pose)`, `piscar`. Uma pose é um objeto de ângulos; crie as suas: `{ bracoF: [120, 30], tronco: 10 }`.

**pinceis.js** — `criarPincel(estilo, { paleta })` devolve `p`: `p.forma(pontos, cor, { prof, furos })`, `p.circulo`, `p.elipse`, `p.retangulo`, `p.capsula(a, b, largura, cor)`, `p.linha(pontos, cor, largura, { tracejado, desloc })`, `p.seta`, `p.texto(s, x, y, { tam, cor })`, `p.etiqueta(s, x, y, { fundo, ponta })`, `p.em(transformacao, fn)`, `p.alfa`, `p.recortar`, `p.tracar(k, fn)`, `p.fundo(t)`, `p.ritmo(t)`. Cores por papel: `fundo, tinta, claro, c1, c2, c3, c4, pele0…pele5`, ou um hex. Formas auxiliares: `retP, retArredP, circP, capsulaP, rotP`.

**pecas.js** — `personagem(p, { pose, virado, roupa, chapeu, expressao, naMao, t })`, elenco em `TIPOS` (soldado, ribeirinho, cientista, executiva, operario, jovem, idoso, crianca). Cenário: `chao, montanhas, arvore, nuvem, sol, estrelas, agua, chuva, casa, predio`. Objetos: `documento, pilhaDePaginas, papeisVoando, pasta, cadeado, chave, camera, cameraFoto, celular, computador, veiculo, barco, ovni, foguete, fogo, lampada, engrenagem, relogio, moeda, coracao, alerta, pino, termometro, bateria, raio, balao, graficoBarras, graficoLinha, graficoPizza, carimbo, marca, lupa, caixa, envelope, megafone, trofeu, bandeira, escudo, rede, bracoGrande`. Legendas: `legendas(p, dados, t)`. Os parâmetros de cada peça estão no comentário acima da função.

**filme.js** — `criarFilme({ largura, altura, estilo, paleta, beats, transicao, fundo, sobre })` → `{ desenhar(ctx, t), duracao, beatEm(t) }`. Transições: `empurrar, cortina, rasgo, iris, blocos, zoom, virar, corte`.

## Conferir

- Plano antes de animar: `conferirBeats(beats)` aponta beat sem imagem, com menos de três movimentos, parado por tempo demais ou com palavra falada que não aparece.
- Vídeo pronto: `node scripts/medir-movimento.mjs saida/<nome>/video.mp4` mede quanto da tela se move por segundo, lista os trechos parados e gera folhas de quadros para conferir se o que é falado aparece.
