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

## 2. Entregar

Em `saida/<nome>/storyboard/`:

- `storyboard.md`: tabela com tempo, o que se vê, o que se move, texto na tela e som de cada cena.
- `index.html`: uma página com os quadros de prévia desenhados de verdade no estilo (mesmo código de desenho que a animação vai usar, congelado em um instante de cada cena), no formato do vídeo.

Abra a página e confira que todos os quadros aparecem antes de mostrar ao usuário.

## 3. Aprovar

Mostre os quadros e pare. Só siga para a animação quando o usuário responder APROVADO. Se ele pedir mudanças, refaça apenas as cenas afetadas e mostre de novo.

## Regras

- Nenhuma cena parada por mais de 4 segundos.
- O primeiro quadro precisa funcionar sozinho como gancho visual.
- Texto na tela dentro da área segura do formato vertical: longe do topo e dos 20% inferiores, onde ficam os botões das redes.
