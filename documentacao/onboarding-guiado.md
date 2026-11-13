# Onboarding guiado — Criativo Motion Studio

Roteiro que o agente instalador segue. É um processo contínuo: mostre os marcos no começo e, em cada resposta, diga o marco atual, o progresso e o resultado da próxima etapa. Nunca encerre só perguntando se o usuário quer continuar.

## Marcos

1. **Instalação** — Node.js 20+, FFmpeg, comandos de barra, `.env`, Remotion.
2. **Chaves e credenciais** — o usuário preenche o `.env`: voz, legendas e, se quiser publicar, Instagram. Parada obrigatória.
3. **Marca** — nome e três cores (opcional; só para a paleta "marca").
4. **Estilo** — escolher entre os 5 nativos pelo painel ou criar um estilo novo a partir de um vídeo.
5. **Primeiro vídeo** — tema, plano de beats, storyboard (se ligado), animação, revisão e MP4.
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

## Marco 2 — Chaves e credenciais

Não pule este marco e não siga para o próximo sem uma resposta do usuário.

1. Rode `npm run diagnosticar` e mostre, em uma tabela simples, o que cada chave libera e o que está faltando:
   - **Voz** (ElevenLabs, Fish Audio ou MiniMax): narração gerada automaticamente. Sem ela, o usuário grava ou gera o MP3 por fora e salva em `entrada/narracao.mp3`.
   - **Groq**: legendas sincronizadas e a divisão do vídeo pelas frases da narração. Recomendada para todo vídeo com voz.
   - **Instagram (Meta) e GitHub**: publicação automática de Reels. Opcional.
2. Pergunte quais ele quer configurar agora. Para cada uma, guie passo a passo com o guia correspondente (`documentacao/configurar-voz.md`, `configurar-apis.md`, `configurar-meta.md`, `configurar-github.md`): onde criar a conta, onde copiar a chave e em qual linha do `.env` colar.
3. Diga onde está o arquivo `.env` (caminho completo) e como abrir. O usuário cola as chaves no arquivo e avisa quando salvar. Nunca peça a chave no chat nem abra o arquivo.
4. Rode `npm run validar:integracoes` e mostre o que passou e o que falhou. Repita até passar, ou até o usuário decidir deixar para depois.
5. Só avance quando o usuário disser que terminou ou que quer pular. Registre o que ficou sem configurar e avise de novo na etapa que depender disso.

## Marco 3 — Marca

Pergunte o nome e as três cores (dominante, destaque, apoio). Se o usuário não tiver, pule: a paleta "estilo" funciona sem marca. Grave pelo painel ou em `marca.json`.

## Marco 4 — Estilo

Abra o painel (`npm run painel`) e peça ao usuário para escolher um estilo ou arrastar um vídeo de referência na página (ela cria e salva o estilo sozinha). Só use `estilos/_personalizado/CRIAR-ESTILO.md` se ele preferir criar o estilo pela linha de comando.

## Marco 5 — Primeiro vídeo

Use `/motion-criar-video`. Ele conduz roteiro, estilo, narração, legendas, plano de beats, storyboard, animação, renderização e revisão. Sem chave de voz, o usuário salva o MP3 em `entrada/narracao.mp3` (o painel também recebe o arquivo). Termine mostrando o caminho do `index.html` e do MP4.

## Marco 6 — Publicação

Só se o usuário quiser. Se as chaves de publicação não foram configuradas no marco 2, siga `documentacao/configurar-meta.md` e `documentacao/configurar-github.md` agora; rode a conferência sem `--confirmar` e publique apenas depois da palavra PUBLICAR.
