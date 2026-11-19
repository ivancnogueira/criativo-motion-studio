# Criativo Motion Studio

Uma máquina de vídeos curtos em motion graphics — Reels, Shorts e TikTok — conduzida por agentes dentro do **Claude Code**, do **Codex** ou do **Antigravity**. Você escolhe um dos 17 estilos nativos, ou cria um estilo novo a partir de um vídeo de que gostou, e os agentes cuidam do resto: roteiro, narração, legendas, storyboard, animação, renderização, revisão e publicação.

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

## Os 17 estilos nativos

Recorte de Papel, Vidro Líquido, Isométrico em Linha, Vetor Flat, Pixel Art 8-bit, 3D Toy & Massinha, 3D Cel-Shading, 3D Neon & HUD, Aquarela & Tinta Viva, Risografia & Zine, Cartoon Retrô 1930 (Rubber Hose), Quadro Branco & Caneta, Bento Grid & SaaS, Tipografia Cinética, Mapa & Satélite, Colagem Editorial e Bauhaus & Brutalismo. Veja cada um animado no painel (`npm run painel`).

Quer um estilo próprio? Arraste um vídeo de referência para o painel: a própria página mede cores e ritmo, reconhece o tipo de visual e monta o template, que fica salvo em `estilos/`. O vídeo é lido no navegador e não sai do seu computador. Sem o painel, o guia está em `estilos/_personalizado/CRIAR-ESTILO.md`.

## Painel local unificado

```bash
npm run painel
```

Dashboard com sidebar e rotas limpas em um único servidor (`http://127.0.0.1:4173`): escolha um dos 17 estilos (`/estilos`), crie estilos novos por vídeo (`/criar-estilo`), explore a galeria de 492 peças e objetos 3D (`/galeria`), o elenco de 46 personagens (`/personagens`), os 13 estilos de legenda (`/legendas`) e cenas de demonstração (`/cenas`). `npm run kit` também aponta para o servidor unificado (`/galeria`). O servidor só atende neste computador.

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
npm run atualizar             # atualiza o produto sem tocar nos seus dados
npm run diagnosticar          # o que está instalado e configurado
npm run validar:integracoes   # testa as chaves preenchidas (só leitura)
npm run desinstalar-skills    # remove os comandos de barra instalados
npm test                      # testes do produto
```

## Produto e instalação

Esta pasta é o **produto**: o modelo genérico, sem dados de ninguém. Cada pessoa instala a própria cópia, e é nela que ficam o `.env`, a marca, os vídeos de referência, os estilos criados e as saídas. Veja `.agents/rules/protecao-dados-produto.md`.

## Licenças de terceiros

O Remotion, usado na renderização, é gratuito para uso individual e equipes pequenas; empresas maiores podem precisar de licença: <https://www.remotion.dev/license>. O FFmpeg segue a própria licença: <https://ffmpeg.org/legal.html>. O painel inclui o mp4box.js (BSD-3-Clause), usado só para ler vídeos que o navegador não toca; o aviso de licença está no início de `painel/mp4box.js`.
