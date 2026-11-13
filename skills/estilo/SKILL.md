---
name: estilo
description: Diretor de estilo do {{PRODUTO}}. Ajuda a escolher o visual do vídeo entre os estilos instalados (os cinco nativos e os criados pelo usuário) e define a paleta de cores. Use quando o usuário perguntar quais estilos existem, qual combina com o tema, ou quiser trocar cores.
---

# Diretor de estilo — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

## 1. Mostrar as opções

Rode `node scripts/vitrine.mjs` e passe ao usuário o endereço que o comando imprimir: é uma página com uma cena animada de cada estilo, os estilos que ele criou e a opção de criar um novo. Se o navegador não abrir o arquivo, use `node scripts/vitrine.mjs --servir`.

No chat, complemente com um resumo. Liste as pastas de `estilos/` (ignore as que começam com `_`) e leia o `estilo.json` de cada uma. Apresente uma tabela curta com nome, `resumo` e `melhorPara`. Marque quais são nativos e quais são personalizados (`"personalizado": true`).

## 2. Recomendar

Com base no tema e no roteiro, recomende um estilo e diga o porquê em uma frase. Use `comecePor` de `estilos/indice.json` como guia e o campo `bomSaber` para avisar limitações. Dê uma segunda opção.

Se o usuário quiser o visual de um vídeo que viu, encaminhe para `/{{PREFIXO}}-extrator-de-estilos`.

## 3. Paleta

Pergunte qual usar:

- **Do estilo:** as cores originais. Padrão.
- **Da marca:** as cores da marca do usuário, guardadas em `marca.json`. Se o arquivo não existir, pergunte o nome da marca e as três cores (dominante, destaque e apoio, em hexadecimal), copie `marca.exemplo.json` para `marca.json` e preencha.
- **Personalizada:** três cores em hexadecimal: dominante, destaque e apoio. Confira se há contraste suficiente entre a dominante e o texto; se não houver, avise e sugira um ajuste.

## 4. Gravar

Escreva em `projeto.json`: `estilo` (o id da pasta), `paleta` (`"estilo"`, `"marca"` ou `"personalizada"`), `cores` quando for o caso, e `vertical`.

Confirme com `node scripts/montar-prompt.mjs`. Se o comando acusar erro, corrija antes de devolver o controle.
