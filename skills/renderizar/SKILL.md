---
name: renderizar
description: Renderizador do {{PRODUTO}}. Transforma a animação pronta em um arquivo MP4 no formato e na resolução configurados e confere o arquivo final. Use quando a animação estiver aprovada e o usuário quiser o vídeo em MP4.
---

# Renderizador — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

Nesta versão, o MP4 é gerado pela própria página da animação, pelo botão Exportar que o animador construiu. O instalador prepara o Remotion na pasta `render/` (confira com `npm run diagnosticar`), mas a renderização automática da animação por linha de comando ainda não está ligada ao fluxo: use o botão Exportar. Só use o Remotion se o usuário pedir e a animação tiver sido construída como composição Remotion.

## 1. Exportar

1. Sirva `saida/<nome>/` por um servidor local e abra `index.html` no Chrome ou Edge.
2. Acione Exportar. Se você tiver uma ferramenta de navegador, faça isso você mesmo; se não, peça ao usuário para clicar e aguardar.
3. Peça para salvar o arquivo como `saida/<nome>/video.mp4`.

Não troque de aba durante a exportação: o navegador reduz a velocidade de abas em segundo plano.

## 2. Conferir o arquivo

Com `ffprobe` disponível:

```
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size -of json saida/<nome>/video.mp4
```

Verifique e relate:

- resolução igual à configurada (1080 × 1920 no vertical, 1920 × 1080 no horizontal);
- duração igual à da narração, ou à configurada quando não há voz, com tolerância de meio segundo;
- trilha de áudio presente quando há narração, música ou efeitos;
- tamanho abaixo de 95 MB, limite para publicar pelo `/{{PREFIXO}}-publicar`.

Sem `ffprobe`, diga que não foi possível conferir e peça ao usuário para assistir ao arquivo.

## 3. Se algo estiver errado

Volte ao `/{{PREFIXO}}-animar` com o problema específico. Não diga que o vídeo está pronto com uma conferência reprovada.

Depois, encaminhe para `/{{PREFIXO}}-revisar`.
