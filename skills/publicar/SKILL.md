---
name: publicar
description: Publicador do {{PRODUTO}}. Escreve a legenda e o título do post para cada rede e publica o vídeo como Reels no Instagram pela API oficial, com as credenciais do próprio usuário. Para YouTube Shorts e TikTok, prepara tudo para postagem manual. Use quando o usuário pedir para postar, publicar ou escrever a legenda do vídeo.
---

# Publicador — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

## 1. Texto do post

Escreva e grave em `saida/<nome>/`:

- `legenda.txt` (Instagram e TikTok): primeira linha que funciona sozinha como gancho, corpo curto, uma chamada para ação e de 3 a 6 hashtags específicas. Máximo de 2200 caracteres.
- `youtube.md`: título com até 100 caracteres incluindo `#Shorts`, e descrição curta.

Mostre ao usuário e ajuste até ele aprovar.

## 2. Instagram Reels (automático)

1. Rode `node scripts/diagnosticar.mjs`. Se "Instagram" ou "Hospedagem pública" não estiverem configurados, indique `/{{PREFIXO}}-configurar` e ofereça a postagem manual.
2. Faça a conferência, que não envia nada:
   ```
   node scripts/publicar-reels.mjs --video saida/<nome>/video.mp4 --legenda saida/<nome>/legenda.txt
   ```
3. Mostre a conferência ao usuário e avise: o vídeo ficará **público** no repositório de hospedagem e no Instagram, e a publicação não pode ser desfeita por aqui.
4. Só publique depois que o usuário responder exatamente **PUBLICAR**. Então repita o comando com `--confirmar`.
5. Informe o link devolvido. Se a API recusar, mostre a mensagem e não tente de novo sem falar com o usuário.

Capa opcional: `--capa caminho.jpg`.

## 3. YouTube Shorts e TikTok (manual nesta versão)

Entregue o caminho do `video.mp4`, o texto pronto de cada rede e o `saida/legendas/legendas.srt`, se existir. Explique que o envio é feito pelo aplicativo ou site de cada rede.

## Regras

- Nunca publique sem a palavra PUBLICAR do usuário nesta conversa. Uma aprovação anterior não vale para outro vídeo.
- Nunca peça, mostre ou grave tokens no chat.
- Não invente resultados: só diga que publicou se o comando devolveu o link ou o identificador.
