---
name: extrator-de-estilos
description: Extrator de estilos do {{PRODUTO}}. Cria um estilo visual novo a partir de um vídeo que o usuário gostou: extrai quadros, paleta e ritmo, analisa o visual e grava um estilo reutilizável. Use quando o usuário quiser copiar o visual de um vídeo, extrair um estilo ou adicionar um estilo próprio além dos nativos.
---

# Extrator de estilos — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

O objetivo é capturar a linguagem visual de um vídeo (cores, materiais, formas, tipografia, movimento, ritmo) para aplicá-la a outros assuntos. Nunca o conteúdo dele.

## 0. O estilo já veio do painel?

Se o usuário passou um id (por exemplo `/{{PREFIXO}}-extrator-de-estilos meu-estilo`) e `estilos/<id>/` já existe com `referencia.png`, `referencia/quadro-NN.jpg` e `"rascunho": true` em `estilo.json`, o estilo foi criado pelo painel **só por medidas** de cor, ritmo e bordas. A página não entende o conteúdo do vídeo, então o tipo de visual, o nome e o texto podem estar errados.

Nesse caso pule os passos 1 e 2 e **refine**: abra a folha e os quadros (`referencia/quadro-NN.jpg`, `movimento-NN.jpg`), siga o passo 3 e reescreva `direcao.md` e os campos de `estilo.json` (`nome`, `subtitulo`, `motor`, `resumo`, `aparencia`, `melhorPara`, `bomSaber`, `temaExemplo`, `rotulo`, `resumoPrompt`) com o que você de fato vê. Mantenha `cores`, `medidas` e `metricas.md`. Ao terminar, **remova** o campo `rascunho` de `estilo.json`. Depois siga o passo 5.

## 1. Receber o vídeo

Peça o arquivo de vídeo (o usuário pode colocá-lo em `entrada/`) e pergunte qual trecho representa melhor o estilo. O ideal são 8 a 15 segundos com bastante movimento. Combine um nome e derive o id: minúsculas, números e hífen.

## 2. Extrair

```
node scripts/extrair-estilo.mjs entrada/<video> --id <id> --inicio <segundos> --duracao <segundos>
```

O comando cria em `estilos/<id>/`: `referencia.png` (folha com 12 quadros), `referencia/quadro-NN.jpg`, `referencia/movimento-NN.jpg` (quadros consecutivos do momento de maior movimento) e `metricas.md`. Se faltar o FFmpeg, explique como instalar e pare.

## 3. Analisar

Abra e estude a folha, os quadros e a sequência de movimento. Siga as regras de `estilos/_personalizado/analise-regras.md`. Use a sequência de movimento para inferir como as coisas se mexem.

## 4. Escrever o estilo

Em `estilos/<id>/`:

- `direcao.md`: em inglês, com exatamente os títulos de `estilos/_personalizado/direcao-formato.md`.
- `estilo.json`: a partir de `estilos/_personalizado/estilo.exemplo.json`. Campos de vitrine em português; `rotulo` e `resumoPrompt` em inglês. `sequenciaMovimento` conforme o resultado do comando. `cores` com os hexadecimais de `metricas.md`.

Não altere `metricas.md` nem invente medidas.

## 5. Testar e apresentar

Aponte `projeto.json` para o novo id e rode `node scripts/montar-prompt.mjs`. Rode também `node scripts/vitrine.mjs` para o estilo aparecer na vitrine. Mostre ao usuário o resumo do estilo e ofereça produzir um vídeo de teste com `/{{PREFIXO}}-criar-video`.

## Regras

- Nunca cite o criador, canal, marca ou personagens do vídeo de referência.
- Se o vídeo for filmagem real ou 3D renderizado, traduza para um equivalente desenhável em código e diga isso com honestidade no campo `bomSaber`.
- O usuário deve ter o direito de usar o vídeo como referência; em caso de dúvida, lembre-o disso.
