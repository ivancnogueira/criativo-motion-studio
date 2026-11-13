---
name: narracao
description: Agente de narração do {{PRODUTO}}. Obtém o MP3 da voz do vídeo, gerando por API (ElevenLabs, Fish Audio ou MiniMax) quando o usuário tem chave, ou guiando a geração manual quando não tem. Use quando o vídeo tiver voz ou o usuário pedir locução, narração ou áudio.
---

# Narração — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

O resultado é sempre o mesmo: `entrada/narracao.mp3`, com `narracao: true` e o texto no campo `roteiro` de `projeto.json`.

## 1. Texto

Use o roteiro aprovado. Se não houver, acione `/{{PREFIXO}}-roteiro` primeiro. O texto precisa estar limpo para leitura: sem emojis, marcações ou títulos.

## 2. Descobrir o modo

Rode `node scripts/diagnosticar.mjs` e leia a seção "Narração". Nunca abra nem mostre o `.env`.

## 3A. Modo API

1. Rode `node scripts/narrar.mjs --simular` e mostre ao usuário o provedor e a contagem de caracteres. Isso consome créditos do plano dele: peça confirmação.
2. Com a confirmação, rode `node scripts/narrar.mjs`.
3. Se a API recusar (chave inválida, sem créditos, voz inexistente), mostre a mensagem de erro e ofereça o modo manual.

Para usar um provedor específico: `--provedor elevenlabs`, `fishaudio` ou `minimax`.

## 3B. Modo manual

1. Entregue o roteiro em um bloco único, pronto para copiar.
2. Diga para gerar o áudio na plataforma de voz que preferir (ou gravar a própria voz) e baixar em MP3.
3. Peça para salvar exatamente como `entrada/narracao.mp3`.
4. Lembre que planos gratuitos podem não permitir uso comercial; cabe ao usuário conferir os termos do plano dele.
5. Pare e espere o usuário avisar que salvou.

Se o usuário quiser automatizar, indique `documentacao/configurar-voz.md`.

## 4. Conferir

- `entrada/narracao.mp3` existe e não está vazio.
- Com `ffprobe` disponível, leia a duração: `ffprobe -v error -show_entries format=duration -of csv=p=0 entrada/narracao.mp3`. Avise se for muito diferente do esperado para o roteiro (cerca de 2,4 palavras por segundo).
- Grave `narracao: true` em `projeto.json`.
- Encaminhe para `/{{PREFIXO}}-legendas`.

Só use voz clonada de uma pessoa com autorização dela.
