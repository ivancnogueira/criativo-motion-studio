---
name: storyboard
description: Artista de storyboard do {{PRODUTO}}. Planeja o vídeo cena a cena e desenha quadros de prévia reais no estilo escolhido, para aprovação antes da animação. Use quando o usuário quiser ver ou aprovar o plano visual antes de animar.
---

# Storyboard — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

## 1. Preparar

1. Grave `"storyboard": true` em `projeto.json` e rode `node scripts/montar-prompt.mjs`.
2. Leia `saida/prompt.md` inteiro. A seção de storyboard do prompt define o que entregar; siga-a com as adaptações de `AGENTS.md`.
3. Se houver `saida/<nome>/roteiro.md`, use a tabela de cenas dele como ponto de partida. Com narração, alinhe os tempos de cada cena a `saida/legendas/legendas.json`.
4. Leia `kit/LEIA-ME.md` para saber quais peças e movimentos já existem e o que precisará ser desenhado para este tema.

## 2. Plano de beats

Divida a narração em beats, um por frase. Grave `saida/<nome>/beats.json`, uma lista com um objeto por beat:

```json
{
  "de": 5.2, "ate": 10.8,
  "fala": "Ribeirinhos relatavam feixes de luz que sugavam a energia e queimavam a pele.",
  "palavrasChave": ["ribeirinhos", "feixes de luz", "energia", "pele"],
  "mostra": ["ribeirinhos na canoa em frente às casas de palafita", "feixes de luz descendo do céu", "energia drenada: lampião apagando", "pele: braço em primeiro plano com a queimadura surgindo"],
  "move": ["canoa balança e o remador rema", "feixe desce e varre a água", "ribeirinho se encolhe de medo", "lampião pisca e apaga"],
  "momentos": ["6.0 feixe acende", "8.4 corte para o braço"],
  "entrada": "deslizar", "transicao": "rasgo",
  "pecasNovas": ["lampião", "feixe varrendo"]
}
```

- `palavrasChave`: toda pessoa, lugar, objeto e ação concreta da frase. Cada uma precisa estar em `mostra` como imagem, não como texto.
- `move`: pelo menos três movimentos por beat.
- `momentos`: um acontecimento novo a cada 2 a 4 segundos, com o tempo.
- `entrada` e `transicao`: nunca iguais às do beat anterior.
- `pecasNovas`: o que será desenhado especialmente para este vídeo.

Confira o plano e corrija os avisos:

```
node scripts/conferir-beats.mjs saida/<nome>/beats.json
```

## 3. Entregar

Em `saida/<nome>/storyboard/`:

- `storyboard.md`: tabela com tempo, fala, o que se vê, o que se move, texto na tela e som de cada beat (a partir de `beats.json`).
- `index.html`: uma página com os quadros de prévia desenhados de verdade no estilo (mesmo código de desenho que a animação vai usar, congelado em um instante de cada beat), no formato do vídeo.

Abra a página e confira que todos os quadros aparecem e que cada palavra-chave está visível no quadro do seu beat, antes de mostrar ao usuário.

## 4. Aprovar

Mostre os quadros e pare. Só siga para a animação quando o usuário responder APROVADO. Se ele pedir mudanças, refaça apenas os beats afetados e mostre de novo.

## Regras

- Nenhuma cena parada por mais de 4 segundos.
- O primeiro quadro precisa funcionar sozinho como gancho visual.
- Texto na tela dentro da área segura do formato vertical: longe do topo e dos 20% inferiores, onde ficam os botões das redes.
- O kit é referência: proponha composições e peças próprias para o tema, e não repita o enquadramento de um beat no seguinte.
