# Instalação do Criativo Motion Studio

O Criativo Motion Studio funciona dentro do seu agente de código: **Claude Code**, **Codex** ou **Antigravity**. Você instala uma vez e passa a usar comandos de barra (`/motion-criar-video` e os outros) em qualquer conversa.

## Pré-requisitos

- **Node.js 20 ou superior** — [baixar](https://nodejs.org). Confira com `node --version`.
- **Um agente de código** instalado: Claude Code, Codex ou Antigravity.
- **Git** — [baixar](https://git-scm.com), só para o modo de instalação por clone.
- **FFmpeg** — necessário para extrair estilos de vídeos e conferir o MP4. Windows: `winget install Gyan.FFmpeg`. Mac: `brew install ffmpeg`. Linux: `sudo apt install ffmpeg`.

## Modo 1 — Instalação assistida pelo agente (recomendado)

Abra uma janela vazia do seu agente e cole o prompt do seu caso:

| Seu agente | Prompt pronto |
|---|---|
| Claude Code | [INSTALAR-COM-CLAUDE.md](INSTALAR-COM-CLAUDE.md) |
| Codex | [INSTALAR-COM-CODEX.md](INSTALAR-COM-CODEX.md) |
| Antigravity | [INSTALAR-COM-ANTIGRAVITY.md](INSTALAR-COM-ANTIGRAVITY.md) |

O agente baixa o projeto, instala os comandos de barra no seu computador, prepara o Remotion e conduz a configuração em marcos, até o primeiro vídeo.

## Modo 2 — Instalação manual

```bash
git clone https://github.com/ivancnogueira/criativo-motion-studio.git
cd criativo-motion-studio
npm run instalar
```

O instalador cria as pastas de trabalho, o `.env` a partir do `.env.example`, o `projeto.json`, instala as skills nas pastas globais das plataformas que encontrar e mostra um diagnóstico. Para escolher a plataforma: `npm run instalar -- --plataforma claude` (ou `codex`, `antigravity`, `todas`).

Depois, abra o painel:

```bash
npm run painel
```

e acesse o endereço mostrado no terminal (`http://127.0.0.1:4173/`).

## O painel local

O painel mostra os 5 estilos com cena animada, deixa você configurar o vídeo (tema, formato, narração, legendas, cores), enviar o MP3 da narração e **enviar um vídeo de referência para criar um estilo novo**. Ele só atende neste computador e grava apenas em `projeto.json`, `marca.json`, `entrada/` e `estilos/`.

## Remotion (renderização do MP4)

O Remotion é público e gratuito para uso individual e para equipes pequenas; empresas maiores podem precisar de licença. Confira as condições em <https://www.remotion.dev/license> antes de usar comercialmente. O agente instalador instala o Remotion na pasta `render/` da sua instalação, sem alterar o projeto base.

## Configurar voz, legendas e publicação (opcional)

Tudo vai no arquivo `.env`, que fica só no seu computador. Nunca cole chaves no chat. Os guias estão em `documentacao/`:

- `configurar-voz.md` — ElevenLabs, Fish Audio ou MiniMax (ou envie o MP3 manualmente);
- `configurar-apis.md` — Groq, para legendas;
- `configurar-meta.md` — Instagram;
- `configurar-github.md` — hospedagem pública do vídeo para a publicação.

Para conferir o que está configurado: `npm run diagnosticar` e `npm run validar:integracoes`.

## Problemas?

```bash
npm run diagnosticar
npm test
```

Se persistir, confira: Node.js 20+ (`node --version`), FFmpeg (`ffmpeg -version`) e se o `.env` existe na pasta.
