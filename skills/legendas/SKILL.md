---
name: legendas
description: Agente de legendas do {{PRODUTO}}. Transcreve a narração com o tempo de cada palavra e gera legendas sincronizadas (arquivo SRT e dados para a animação). Use depois que o MP3 da narração existir, ou quando o usuário pedir legendas ou SRT.
---

# Legendas — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

As legendas vêm sempre da transcrição do áudio final, nunca do roteiro. Assim a sincronia fica correta mesmo que a fala tenha mudado alguma palavra.

## 1. Transcrever

```
node scripts/transcrever.mjs
```

Lê `entrada/narracao.mp3` e grava em `saida/legendas/`:

- `legendas.json`: texto, `palavras` (com início e fim em segundos), `blocos` (grupos curtos para a tela) e `duracao`.
- `legendas.srt`: para enviar junto com o vídeo às redes.

Se o comando avisar que falta `GROQ_API_KEY`, explique que a chave é gratuita e indique `documentacao/configurar-apis.md`. O usuário preenche no `.env`; nunca peça a chave no chat.

## 2. Revisar

Compare o texto transcrito com o `roteiro` de `projeto.json`. Corrija em `legendas.json` e no `.srt` apenas erros de grafia (nomes próprios, siglas, termos técnicos), sem mexer nos tempos. Mostre ao usuário o que corrigiu.

## 3. Ligar no projeto

Grave `legendas: true` em `projeto.json`. O animador usa os `blocos` para desenhar as legendas na tela e os tempos das `palavras` para sincronizar as cenas.

## Sem chave de transcrição

Sem a chave, não há tempos por palavra. Diga isso claramente e ofereça seguir sem legendas sincronizadas; não estime tempos a partir do roteiro como se fossem medidos.
