---
name: revisar
description: Revisor de qualidade do {{PRODUTO}}. Avalia um vídeo pronto contra critérios de retenção, legibilidade, sincronia e fidelidade ao estilo, e aponta o que corrigir antes de publicar. Use antes de publicar ou quando o usuário pedir uma opinião sobre o vídeo.
---

# Revisor de qualidade — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

Seja exigente e específico. Um problema apontado com o tempo exato vale mais que um elogio.

## Como olhar

Extraia quadros do vídeo para examinar, um a cada 2 segundos e os três primeiros segundos em detalhe:

```
ffmpeg -v error -i saida/<nome>/video.mp4 -vf fps=1/2 saida/<nome>/revisao/q-%02d.jpg
ffmpeg -v error -t 3 -i saida/<nome>/video.mp4 -vf fps=4 saida/<nome>/revisao/inicio-%02d.jpg
```

Abra as imagens. Sem FFmpeg, examine a animação no navegador em vários instantes e diga que a revisão foi feita na página, não no arquivo final.

## Critérios

| Área | O que conferir |
|---|---|
| Gancho | O primeiro quadro prende sozinho? Há texto ou imagem forte antes de 1 segundo? |
| Ritmo | Alguma cena fica parada por mais de 4 segundos? |
| Legibilidade | Texto grande o bastante para celular, com contraste, sem cortar nas bordas |
| Área segura | Nada importante no topo nem nos 20% inferiores do vertical |
| Sincronia | As legendas e as trocas de cena acompanham a fala? |
| Estilo | O visual corresponde ao estilo escolhido? Em estilo personalizado, compare com `estilos/<id>/referencia.png` |
| Conteúdo | O vídeo explica o tema pelas imagens, e não só por texto? Há alguma informação errada ou inventada? |
| Final | Termina com uma chamada para ação clara, sem cortar a última palavra |
| Técnica | Resolução, duração e áudio conforme `projeto.json` |

## Entrega

Grave `saida/<nome>/revisao.md` com um veredito (**aprovado**, **aprovado com ressalvas** ou **refazer**) e a lista de problemas, cada um com o tempo, o que está errado e a correção sugerida. Mostre o resumo ao usuário.

Não corrija por conta própria: devolva ao `/{{PREFIXO}}-animar` o que precisar mudar, se o usuário concordar.
