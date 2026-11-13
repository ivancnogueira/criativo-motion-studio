# Criativo Motion Studio — instruções para o agente

Este repositório gera vídeos de motion graphics em HTML/JavaScript a partir de um estilo e de uma configuração. Converse com o usuário em português do Brasil.

## Estrutura

- `projeto.json` — configuração do vídeo a produzir. Criado na instalação a partir de `projeto.exemplo.json`.
- `marca.json` — nome e cores da marca do usuário, usados pela paleta `"marca"`. Criado a partir de `marca.exemplo.json` quando o usuário informar a marca.
- `estilos/<id>/prompt.md` — direção completa de cada estilo. `estilos/<id>/estilo.json` — descrição curta.
- `estilos/indice.json` — lista de estilos e sugestões de qual usar.
- `estilos/_personalizado/` — modelo e instruções para estilos criados a partir de um vídeo de referência (ver `CRIAR-ESTILO.md`).
- `blocos/` — trechos comuns (idioma, paletas).
- `scripts/montar-prompt.mjs` — junta tudo em `saida/prompt.md`.
- `skills/` — skills do produto; o instalador as copia para a pasta global de cada plataforma como comandos de barra.
- `scripts/instalar.mjs`, `scripts/diagnosticar.mjs` — instalação e verificação (`npm run instalar`, `npm run diagnosticar`).
- `.env` — chaves do usuário. Nunca abra, mostre ou peça o conteúdo dele no chat; use o diagnóstico para saber o que está configurado.
- `entrada/` — arquivos do usuário (narração MP3, vídeos de referência).
- `vitrine/` — cenas animadas dos estilos (`node scripts/vitrine.mjs`), usadas também pelo painel.
- `painel/` e `scripts/painel.mjs` — painel local (`npm run painel`): escolher estilo, configurar o vídeo, enviar a narração e criar estilo a partir de um vídeo (lido no navegador; a página grava a folha, os quadros, `metricas.md`, `direcao.md` e `estilo.json` em `estilos/<id>/`). Só atende em 127.0.0.1.
- `render/` — instalado só na instância pelo agente instalador (Remotion). Nunca faz parte do produto.
- `README.md`, `INSTALAR.md`, `INSTALAR-COM-*.md` e `documentacao/onboarding-guiado.md` — instalação guiada por plataforma.
- `documentacao/` — guias de configuração das chaves.
- `saida/` — tudo que for gerado.

## Campos de `projeto.json`

| Campo | Valores |
|---|---|
| `estilo` | nome de uma pasta em `estilos/` (base ou personalizado) |
| `tema` | o que o vídeo explica |
| `storyboard` | `true` = planejar e esperar aprovação antes de animar |
| `narracao` | `true` = usar `entrada/narracao.mp3`; a duração segue o áudio |
| `roteiro` | texto da narração (opcional) |
| `legendas` | `true` = legendas na tela a partir de `saida/legendas/legendas.json`, mais o SRT (só com narração) |
| `duracaoSegundos` | duração quando não há narração |
| `vertical` | `true` = 9:16 (1080×1920); `false` = 16:9 (1920×1080) |
| `musica`, `efeitos` | áudio gerado em código |
| `paleta` | `"estilo"`, `"marca"` (usa `marca.json`) ou `"personalizada"` (usa `cores`) |
| `testeDeEstilo` | só para estilos personalizados: `true` (padrão) = mostrar um quadro de teste e esperar confirmação antes de animar |

## Produto e instância

Esta pasta pode ser o **produto** (o modelo genérico que é distribuído) ou uma **instância** (a cópia instalada na máquina de um usuário). É uma instância quando existe um arquivo `.env` nela.

Para atualizar uma instância: `npm run atualizar` (clone) ou `npm run atualizar -- --simular --zip <arquivo>` e depois sem `--simular` (ZIP). Isso troca só os arquivos do produto e preserva os dados do cliente (`.env`, `marca.json`, `projeto.json`, `entrada/`, `saida/`, `runtime/`, `render/`, estilos criados). Nunca atualize copiando arquivos à mão nem extraindo o ZIP por cima.

Para distribuir: `npm run empacotar -- <pasta-de-saida> --zip` gera o ZIP limpo (uma pasta só, sem dados de instância); sem `--zip` cria uma cópia em pasta, útil para testar a instalação sem tocar no produto.

No produto, nunca rode a instalação, nunca produza vídeos e nunca grave dados reais de ninguém. As regras completas estão em `.agents/rules/protecao-dados-produto.md`; confira com `npm run verificar:produto`.

## Linha de produção

Cada etapa tem uma skill em `skills/`: `criar-video` (conduz tudo), `roteiro`, `estilo`, `extrator-de-estilos`, `narracao`, `legendas`, `storyboard`, `animar`, `renderizar`, `revisar`, `publicar` e `configurar`. Instaladas, viram comandos de barra com o prefixo de `produto.json`.

| Comando | Para quê |
|---|---|
| `node scripts/diagnosticar.mjs` | estado da instalação e do que está configurado |
| `node scripts/validar-integracoes.mjs` | testa as chaves preenchidas, só por leitura |
| `node scripts/narrar.mjs [--simular]` | gera `entrada/narracao.mp3` por API |
| `node scripts/transcrever.mjs` | gera `saida/legendas/legendas.json` e `.srt` |
| `node scripts/extrair-estilo.mjs <video> --id <id>` | material para um estilo novo |
| `node scripts/publicar-reels.mjs --video … --legenda … [--confirmar]` | publica no Instagram; sem `--confirmar` só confere |

Publicar exige a palavra PUBLICAR do usuário na conversa.

## Como produzir um vídeo

1. Rode `node scripts/montar-prompt.mjs`. Se der erro, mostre a mensagem ao usuário e pare.
2. Leia `saida/prompt.md` inteiro e siga-o como a especificação do trabalho, com as adaptações abaixo.
3. Não edite `estilos/` nem `blocos/` durante a produção de um vídeo.

## Adaptações obrigatórias

Os prompts foram escritos para uma conversa de chat com "HTML Artifact". Aqui o ambiente é um workspace de arquivos. Onde o prompt disser:

- **"HTML Artifact" / "inside this conversation"** → crie uma página em `saida/<nome-curto-do-tema>/index.html`, com JavaScript e demais arquivos na mesma pasta. Sirva a pasta por um servidor local e abra no navegador para conferir o resultado de verdade antes de dizer que está pronto.
- **"attached MP3" / narração anexada** → o arquivo é `entrada/narracao.mp3`. Se `narracao` for `true` e o arquivo não existir, peça ao usuário e pare.
- **Storyboard com aprovação** → grave a tabela e os quadros em `saida/<nome>/storyboard/`, mostre ao usuário e pare até ele responder APROVADO ou pedir mudanças.
- **"reference sheet" anexada** (estilos personalizados) → é o arquivo `estilos/<id>/referencia.png`, com os quadros também em `estilos/<id>/referencia/quadro-NN.jpg` (o número do quadro é o do nome do arquivo), a sequência de movimento em `movimento-NN.jpg` e a paleta com hexadecimais em `metricas.md`. Abra e estude essas imagens antes de qualquer coisa. O quadro de teste de estilo vai em `saida/<nome>/teste-de-estilo.html`; mostre ao usuário e pare até ele confirmar.
- **Exportação** → mantenha o botão Exportar na página, como o prompt pede. Entregue também o caminho do `index.html`.
- **Bibliotecas** → pode instalar pacotes do npm dentro de `saida/<nome>/` em vez de carregar por CDN, respeitando a lista de ferramentas permitidas do prompt.

Em tudo o mais (qualidade visual, movimento, sincronia, áudio, checagens finais), vale o que está no prompt.

## Criar um estilo novo

Quando o usuário pedir um estilo a partir de um vídeo ou folha de referência, siga `estilos/_personalizado/CRIAR-ESTILO.md`.
