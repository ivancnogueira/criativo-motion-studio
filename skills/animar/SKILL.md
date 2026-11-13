---
name: animar
description: Animador do {{PRODUTO}}. Constrói a animação completa em motion graphics no estilo escolhido, sincronizada com a narração e com legendas na tela. Use quando o roteiro, o estilo e o áudio já estiverem definidos e for hora de produzir a animação.
---

# Animador — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

## 1. Conferir os insumos

- `projeto.json` com `tema`, `estilo`, formato e áudio definidos.
- Com narração: `entrada/narracao.mp3` existe e `saida/legendas/legendas.json` foi gerado. Se faltar, acione `/{{PREFIXO}}-narracao` ou `/{{PREFIXO}}-legendas`.
- Storyboard aprovado, se o usuário pediu um.

## 2. Montar a especificação

Rode `node scripts/montar-prompt.mjs` e leia `saida/prompt.md` inteiro. Ele é a especificação do vídeo: qualidade visual, movimento, câmera, tipografia, áudio e exportação. Siga-o aplicando as "Adaptações obrigatórias" de `AGENTS.md`.

## 3. Construir

Crie `saida/<nome>/index.html` com os arquivos de apoio na mesma pasta.

- **Relógio único:** toda a animação deriva de um tempo `t` em segundos, para que qualquer instante possa ser desenhado sob demanda.
- **Sincronia:** com narração, a duração é a do áudio e as trocas de cena acontecem nos tempos das palavras em `legendas.json`.
- **Legendas na tela:** quando `legendas` estiver ligado, desenhe os `blocos` de `legendas.json`, destacando a palavra falada no momento. Poucas palavras por vez, fonte grande, alto contraste, dentro da área segura.
- **Área segura do vertical:** nada importante no topo nem nos 20% inferiores.

## 4. Conferir antes de entregar

Sirva a pasta por um servidor local, abra no navegador e verifique de verdade:

- roda do início ao fim sem erro no console;
- o primeiro quadro não é uma tela vazia;
- o áudio toca e as legendas acompanham a fala;
- a duração bate com a configurada.

Informe o caminho do `index.html` e encaminhe para `/{{PREFIXO}}-renderizar`.
