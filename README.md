# Criativo Motion Studio

Uma máquina de vídeos curtos em motion graphics — Reels, Shorts e TikTok — conduzida por agentes dentro do **Claude Code**, do **Codex** ou do **Antigravity**. Você escolhe um dos 5 estilos nativos, ou cria um estilo novo a partir de um vídeo de que gostou, e os agentes cuidam do resto: roteiro, narração, legendas, storyboard, animação, renderização, revisão e publicação.

## Instalação rápida

Cole o prompt do seu agente em uma janela vazia:

- [Claude Code](INSTALAR-COM-CLAUDE.md)
- [Codex](INSTALAR-COM-CODEX.md)
- [Antigravity](INSTALAR-COM-ANTIGRAVITY.md)

Ou instale à mão, seguindo o [INSTALAR.md](INSTALAR.md).

## Como funciona

```text
roteiro → estilo → narração → legendas → storyboard → animação → renderização → revisão → publicação
```

Cada etapa é uma skill que vira um comando de barra (o prefixo vem de `produto.json`):

| Comando | Para quê |
|---|---|
| `/motion-criar-video` | conduz tudo, do tema ao MP4 |
| `/motion-roteiro` | gancho e roteiro para vídeo curto |
| `/motion-estilo` | escolhe ou confirma o estilo |
| `/motion-extrator-de-estilos` | cria um estilo novo a partir de um vídeo de referência |
| `/motion-narracao` | gera o áudio por API ou prepara o texto para você gravar |
| `/motion-legendas` | legendas na tela e arquivo SRT |
| `/motion-storyboard` | planeja e espera sua aprovação antes de animar |
| `/motion-animar` | constrói a animação em HTML/JavaScript |
| `/motion-renderizar` | exporta e confere o MP4 |
| `/motion-revisar` | revisão de qualidade |
| `/motion-publicar` | publica no Instagram, só com a palavra PUBLICAR |
| `/motion-configurar` | guia as chaves e integrações |

## Os 5 estilos nativos

Recorte de Papel, Vidro Líquido, Isométrico em Linha, Vetor Flat e Pixel Art 8-bit. Veja cada um animado no painel (`npm run painel`).

Quer um estilo próprio? Envie um vídeo de referência pelo painel: o produto extrai quadros, movimento e cores, e o agente escreve a direção de arte. O guia está em `estilos/_personalizado/CRIAR-ESTILO.md`.

## Painel local

```bash
npm run painel
```

Escolha o estilo, configure o vídeo, envie o MP3 da narração e crie estilos novos enviando vídeos. O painel só atende neste computador.

## Voz, legendas e publicação

| Recurso | Opções | Guia |
|---|---|---|
| Voz | ElevenLabs, Fish Audio, MiniMax — ou MP3 enviado por você | `documentacao/configurar-voz.md` |
| Legendas | Groq (Whisper) | `documentacao/configurar-apis.md` |
| Instagram | API oficial da Meta, com o seu próprio app | `documentacao/configurar-meta.md` |
| Hospedagem do vídeo | GitHub (repositório público seu) | `documentacao/configurar-github.md` |

As chaves ficam no `.env`, só no seu computador. Nunca as cole no chat. YouTube e TikTok ainda não têm publicação automática: use o MP4 gerado.

## Comandos úteis

```bash
npm run instalar              # prepara a pasta e instala os comandos de barra
npm run painel                # painel local
npm run diagnosticar          # o que está instalado e configurado
npm run validar:integracoes   # testa as chaves preenchidas (só leitura)
npm run desinstalar-skills    # remove os comandos de barra instalados
npm test                      # testes do produto
```

## Produto e instalação

Esta pasta é o **produto**: o modelo genérico, sem dados de ninguém. Cada pessoa instala a própria cópia, e é nela que ficam o `.env`, a marca, os vídeos de referência, os estilos criados e as saídas. Veja `.agents/rules/protecao-dados-produto.md`.

## Licenças de terceiros

O Remotion, usado na renderização, é gratuito para uso individual e equipes pequenas; empresas maiores podem precisar de licença: <https://www.remotion.dev/license>. O FFmpeg segue a própria licença: <https://ffmpeg.org/legal.html>.
