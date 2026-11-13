---
name: revisar
description: Revisor de qualidade do {{PRODUTO}}. Avalia um vídeo pronto contra critérios de retenção, legibilidade, sincronia e fidelidade ao estilo, e aponta o que corrigir antes de publicar. Use antes de publicar ou quando o usuário pedir uma opinião sobre o vídeo.
---

# Revisor de qualidade — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

Seja exigente e específico. Um problema apontado com o tempo exato vale mais que um elogio.

## Como olhar

Meça o movimento e gere as folhas de quadros (um quadro por segundo):

```
node scripts/medir-movimento.mjs saida/<nome>/video.mp4
ffmpeg -v error -t 3 -i saida/<nome>/video.mp4 -vf fps=4 saida/<nome>/revisao/inicio-%02d.jpg
```

O comando grava `saida/<nome>/revisao/movimento.md` (quanto da tela se move por segundo e a lista de trechos parados) e as folhas `folha-NN.jpg`. Abra todas as imagens. Sem FFmpeg, examine a animação no navegador em vários instantes e diga que a revisão foi feita na página, não no arquivo final.

**Fala contra imagem:** para cada frase da narração (use `beats.json` ou `legendas.json`), liste as pessoas, lugares, objetos e ações citados e procure cada um nos quadros daquele trecho. Monte uma tabela "falado / aparece? / em que segundo". Uma etiqueta com a palavra não conta como aparecer.

## Critérios

| Área | O que conferir |
|---|---|
| Gancho | O primeiro quadro prende sozinho? Há texto ou imagem forte antes de 1 segundo? |
| Movimento | `movimento.md` aponta trecho parado ou média abaixo de 4%? Há personagem ou objeto imóvel enquanto está na tela? |
| Fala e imagem | Tudo o que é falado aparece desenhado no momento em que é dito? |
| Ritmo | Alguma cena fica sem acontecimento novo por mais de 4 segundos? As transições têm movimento, sem corte seco? |
| Variedade | As cenas têm composições diferentes entre si, com peças próprias do tema? |
| Legibilidade | Texto grande o bastante para celular, com contraste, sem cortar nas bordas |
| Área segura | Nada importante no topo nem nos 20% inferiores do vertical |
| Sincronia | As legendas e as trocas de cena acompanham a fala? |
| Estilo | O visual corresponde ao estilo escolhido? Em estilo personalizado, compare com `estilos/<id>/referencia.png` |
| Conteúdo | O vídeo explica o tema pelas imagens, e não só por texto? Há alguma informação errada ou inventada? |
| Final | Termina com uma chamada para ação clara, sem cortar a última palavra |
| Técnica | Resolução, duração e áudio conforme `projeto.json` |

## Entrega

Trecho parado, ou palavra-chave falada que não aparece, é motivo de **refazer**.

Grave `saida/<nome>/revisao.md` com a tabela de fala contra imagem, um veredito (**aprovado**, **aprovado com ressalvas** ou **refazer**) e a lista de problemas, cada um com o tempo, o que está errado e a correção sugerida. Mostre o resumo ao usuário.

Não corrija por conta própria: devolva ao `/{{PREFIXO}}-animar` o que precisar mudar, se o usuário concordar.
