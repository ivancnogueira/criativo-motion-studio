# Onboarding guiado — Criativo Motion Studio

Roteiro que o agente instalador segue. É um processo contínuo: mostre os marcos no começo e, em cada resposta, diga o marco atual, o progresso e o resultado da próxima etapa. Nunca encerre só perguntando se o usuário quer continuar.

## Marcos

1. **Instalação** — Node.js 20+, FFmpeg, comandos de barra, `.env`, Remotion.
2. **Marca** — nome e três cores (opcional; só para a paleta "marca").
3. **Estilo** — escolher entre os 5 nativos pelo painel ou criar um estilo novo a partir de um vídeo.
4. **Voz e legendas** — API de voz, ou narração manual; chave Groq para legendas.
5. **Primeiro vídeo** — tema, storyboard (se ligado), animação, revisão e MP4.
6. **Publicação** — opcional; só com a palavra PUBLICAR do usuário.

## Regras do agente

- **Nunca** abra, mostre ou peça o conteúdo do `.env`. Use `npm run diagnosticar` e `npm run validar:integracoes` para saber o que está configurado. O usuário preenche as chaves no arquivo.
- **Preserve** o `.env`, o `projeto.json`, o `marca.json`, a pasta `entrada/` e os estilos já criados. Não sobrescreva.
- Não edite `estilos/` nativos nem `blocos/` durante a produção de um vídeo.
- Mostre ao usuário cada resultado (painel, storyboard, teste de estilo) e espere a resposta quando a etapa pedir aprovação.
- Publicar exige a palavra **PUBLICAR** escrita pelo usuário na conversa. Sem ela, rode apenas o modo de conferência.
- Conclua só quando o usuário tiver um MP4 conferido (`/motion-renderizar`) ou disser que quer parar.

## Marco 1 — Instalação

1. `node --version` (precisa ser 20 ou superior). Se faltar, oriente o download em <https://nodejs.org> e pare.
2. `ffmpeg -version`. Se faltar, ofereça instalar (Windows: `winget install Gyan.FFmpeg`; Mac: `brew install ffmpeg`; Linux: `sudo apt install ffmpeg`) e confirme com o usuário antes.
3. `npm run instalar` (use `-- --plataforma <claude|codex|antigravity>` se o usuário usar só uma).
4. Remotion, na pasta `render/` da instalação:
   - `mkdir render` e, dentro dela, `npm init -y`;
   - `npm install remotion @remotion/cli @remotion/captions react react-dom`;
   - `npx remotion browser ensure` para baixar o navegador de renderização;
   - teste rápido: crie `render/teste/` com uma composição mínima e rode `npx remotion render` para gerar um MP4 curto, confira com `ffprobe` e apague o teste;
   - avise o usuário sobre a licença: <https://www.remotion.dev/license>.
5. `npm run diagnosticar` e mostre o resultado em linguagem simples.

## Marco 2 — Marca

Pergunte o nome e as três cores (dominante, destaque, apoio). Se o usuário não tiver, pule: a paleta "estilo" funciona sem marca. Grave pelo painel ou em `marca.json`.

## Marco 3 — Estilo

Abra o painel (`npm run painel`) e peça ao usuário para escolher um estilo ou arrastar um vídeo de referência na página (ela cria e salva o estilo sozinha). Só use `estilos/_personalizado/CRIAR-ESTILO.md` se ele preferir criar o estilo pela linha de comando.

## Marco 4 — Voz e legendas

Pergunte se o usuário tem API de voz. Se tiver, oriente `documentacao/configurar-voz.md`; se não, ele gera o MP3 em um serviço e salva em `entrada/narracao.mp3` (o painel também recebe o arquivo). Legendas: `documentacao/configurar-apis.md`. Valide com `npm run validar:integracoes`.

## Marco 5 — Primeiro vídeo

Use `/motion-criar-video`. Ele conduz roteiro, estilo, narração, legendas, storyboard, animação, renderização e revisão. Termine mostrando o caminho do `index.html` e do MP4.

## Marco 6 — Publicação

Só se o usuário quiser. Siga `documentacao/configurar-meta.md` e `documentacao/configurar-github.md`, rode a conferência sem `--confirmar` e publique apenas depois da palavra PUBLICAR.
