# Kit de movimento

Peças e movimentos prontos para a animação não começar do zero nem ficar parada. Veja tudo funcionando com `npm run kit`: galeria de peças por categoria com busca, elenco de personagens, estilos de legenda e cenas de exemplo, nos cinco estilos.

## O kit é referência, não molde

- **Use como ponto de partida.** Copie `kit/` para `saida/<nome>/kit/` e mude o que quiser nessa cópia. Nunca edite `kit/` do produto durante um vídeo.
- **Busque antes de desenhar.** A biblioteca tem centenas de peças; procure no índice (abaixo) antes de criar algo do zero.
- **Cada vídeo precisa de peças próprias.** A biblioteca cobre o genérico (pessoas, animais, veículos, objetos, ícones). O que é específico do tema você desenha: copie a peça mais parecida e mude as formas, ou crie do zero com `p.forma`, `p.capsula`, `p.linha` e `p.texto`. Um vídeo feito só com peças prontas fica igual aos outros.
- **Varie de propósito.** Troque elenco, cores, poses, entradas e transições entre cenas e entre vídeos. Nunca a mesma entrada ou a mesma transição duas vezes seguidas.
- **O prompt do estilo manda.** Os pincéis são referência em Canvas 2D. Se o estilo pedir WebGL, Three.js ou SVG, use `movimento.js` (que só devolve números) para tempos, poses e curvas, e desenhe com o motor do estilo. Paleta, tipografia e acabamento são os do prompt.
- **Estilos criados pelo usuário:** comece pelo pincel mais próximo, passe a paleta de `metricas.md` em `paleta` e ajuste o acabamento na sua cópia até bater com a folha de referência.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `movimento.js` | Motor sem desenho: curvas, entradas, saídas, movimento contínuo, beats, sincronia com a fala, caminhos, câmera, esqueleto e atuação de personagem |
| `pinceis.js` | `criarPincel(estilo)`: as mesmas formas no acabamento de cada estilo (papel, flat, pixel, traco, vidro) |
| `pecas.js` | Reúne tudo: `import * as K from "./kit/pecas.js"` dá acesso a todas as peças e às legendas |
| `pecas/<categoria>.js` | A biblioteca, um arquivo por categoria (`base.js` tem o personagem e as peças originais; `_comum.js` tem a convenção e os apoios) |
| `indice.json` | Índice gerado do código: nome, categoria, palavras-chave, opções e exemplo de cada peça; elenco e legendas |
| `elenco.js` | Elenco diverso pronto: `pessoa(p, id, { pose, t })` e `escolherElenco` |
| `legendas.js` | Estilos de legenda na tela |
| `galeria.js`, `contexto-falso.js` | Grade da galeria e um contexto de canvas que só mede, usado nos testes |
| `filme.js` | `criarFilme({ beats })`: junta os beats em `desenhar(ctx, t)` com transições |
| `tocador.js` | `tocar(canvas, filme, { audio })`: tocar, pausar, buscar e seguir o áudio |
| `exemplo.js` | Filme de demonstração; o beat "cena" é um modelo de composição |

## Achar e usar uma peça

```
node scripts/pecas.mjs exército        # busca por palavra (ignora acento e plural); mostra o exemplo de uso e as opções
node scripts/pecas.mjs --categorias    # lista as categorias e quantas peças cada uma tem
node scripts/pecas.mjs --categoria animais
```

Ou leia `kit/indice.json`, ou abra a galeria (`npm run kit`) e clique na peça. Toda peça segue a mesma forma:

```js
p.em({ x: 540, y: 1300, s: 1.2 }, () => K.tanque(p, { t }));            // posição e escala por fora; opções por dentro
p.em(combinar({ x: 300, y: 900 }, entrada("pop", k)), () => K.cofre(p, { k: prog(L, 1, 2), t }));
```

- Desenhada em torno da origem: o que fica no chão tem a base em `y = 0`; ícones e efeitos ficam centrados.
- Passe sempre `t` (a peça tem movimento próprio). `k`, quando existe, é o progresso de 0 a 1 que você controla (abrir, encher, traçar).
- Cores por papel (`cor: "c2"`), então a peça acompanha a paleta do estilo ou da marca.
- Gente variada: o elenco diverso tem crianças, adolescentes, adultos e idosos de vários gêneros, tons de pele e cabelos, com hijab, turbante, cadeira de rodas, bengala e gestante. `K.pessoa(p, "idosaNegra", { pose: atuar(L, roteiro), virado: -1, t })`; `K.escolherElenco({ n: 5, idade: "adulto" })` sorteia ids com tons de pele diferentes para uma cena com várias pessoas. Liste com `node scripts/pecas.mjs --elenco [filtro]` ou veja na aba Personagens. Varie o elenco entre cenas e entre vídeos.
- Profissões: `K.medico(p, { pose, virado, t })` e as demais profissões aceitam as mesmas opções do `personagem`; os nomes de `TIPOS`, penteados, chapéus e acessórios estão em `elenco` no índice. Ex.: `K.personagem(p, { ...K.TIPOS.bombeiro, rosto: "bigode", pose: atuar(L, roteiro), t })`.
- Peça nova para o tema: copie a mais parecida para o arquivo do seu vídeo e mude. A convenção está no topo de `kit/pecas/_comum.js`. Mexeu em `kit/pecas/` do produto? Rode `node scripts/pecas.mjs --gerar`.

## Legendas na tela

```js
sobre: q => K.legenda(q.p, legendas, q.t, { estilo: projeto.estiloLegenda })
```

O estilo vem de `estiloLegenda` em `projeto.json`: `bloco` (padrão), `palavra`, `karaoke`, `caixa`, `maquina`, `chave`, `faixa`, `pop` ou `contorno`; veja todos tocando na aba Legendas da galeria. Opções: `y`, `tam`, `largura`, `cor`, `destaque`, `fundo`, `maiusculas` e, no estilo `chave`, `chaves: ["palavra"]`. Um nome que não existe dá erro com a lista de opções. Ajuste tipografia e cores ao prompt do estilo; mantenha a legenda fora dos 20% inferiores do vertical.

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
], sobre: q => K.legenda(q.p, legendas, q.t, { estilo: "karaoke" }) });
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

**pecas/base.js** — `personagem(p, { pose, virado, roupa, penteado, chapeu, rosto, noTronco, nasCostas, expressao, naMao, t })`, elenco em `TIPOS` (soldado, ribeirinho, cientista, executiva, operario, jovem, idoso, crianca e as profissões de `pecas/pessoas.js`). Cenário: `chao, montanhas, arvore, nuvem, sol, estrelas, agua, chuva, casa, predio`. Objetos: `documento, pilhaDePaginas, papeisVoando, pasta, cadeado, chave, camera, cameraFoto, celular, computador, veiculo, barco, ovni, foguete, fogo, lampada, engrenagem, relogio, moeda, coracao, alerta, pino, termometro, bateria, raio, balao, graficoBarras, graficoLinha, graficoPizza, carimbo, marca, lupa, caixa, envelope, megafone, trofeu, bandeira, escudo, rede, bracoGrande`. As demais categorias (pessoas, animais, natureza, cidade, transporte, tecnologia, dinheiro, saúde, comida, casa, ciência, história, esporte, símbolos, gráficos, efeitos) estão no índice. Os parâmetros de cada peça estão no comentário acima da função.

**filme.js** — `criarFilme({ largura, altura, estilo, paleta, beats, transicao, fundo, sobre })` → `{ desenhar(ctx, t), duracao, beatEm(t) }`. Transições: `empurrar, cortina, rasgo, iris, blocos, zoom, virar, corte`.

## Conferir

- Plano antes de animar: `conferirBeats(beats)` aponta beat sem imagem, com menos de três movimentos, parado por tempo demais ou com palavra falada que não aparece.
- Vídeo pronto: `node scripts/medir-movimento.mjs saida/<nome>/video.mp4` mede quanto da tela se move por segundo, lista os trechos parados e gera folhas de quadros para conferir se o que é falado aparece.
