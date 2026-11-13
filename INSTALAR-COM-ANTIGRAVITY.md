# Instalação assistida pelo Antigravity

Abra o Antigravity em uma janela vazia (ou na pasta onde você guarda seus projetos) e envie este prompt no chat:

```text
Instale o Criativo Motion Studio a partir de https://github.com/ivancnogueira/criativo-motion-studio.git em uma nova pasta criativo-motion-studio no diretório atual. Depois do clone, leia integralmente GEMINI.md, AGENTS.md, README.md, INSTALAR.md e documentacao/onboarding-guiado.md. Você está autorizado a executar npm run instalar, instalar o FFmpeg e o Remotion e preparar o ambiente. Conduza a instalação e o onboarding como um único processo contínuo, sem encerrar entre etapas.

Antes da primeira pergunta, mostre estes seis marcos:
1) Instalação (Node.js 20+, FFmpeg, skills no Antigravity, .env, Remotion)
2) Marca (nome e três cores, opcional)
3) Estilo (escolher um dos 5 estilos no painel ou criar um estilo novo a partir de um vídeo)
4) Voz e legendas (API de voz ou narração manual; chave Groq para legendas)
5) Primeiro vídeo (tema, storyboard, animação, revisão e MP4)
6) Publicação (opcional, só com a palavra PUBLICAR)

Em cada interação, mostre o marco atual, o progresso, a decisão que estamos tomando e o resultado da próxima etapa. Nunca termine apenas perguntando se quero continuar.

Regras fundamentais:
- No marco Instalação, confira node --version (20 ou superior) e ffmpeg -version; se algo faltar, me diga o comando de instalação e confirme comigo antes de rodar. Rode npm run instalar -- --plataforma antigravity (as skills vão para ~/.gemini/config/skills, com atalho em ~/.gemini/antigravity/skills). Depois instale o Remotion na pasta render/ desta instalação: npm init -y, npm install remotion @remotion/cli @remotion/captions react react-dom, npx remotion browser ensure e um teste de renderização curto conferido com ffprobe. Avise-me sobre a licença do Remotion (https://www.remotion.dev/license). Rode npm run diagnosticar e explique o resultado em linguagem simples.
- Nunca abra, mostre ou peça o conteúdo do .env, nem peça chaves ou tokens no chat. Eu preencho o .env no meu computador; use npm run diagnosticar e npm run validar:integracoes para saber o que está configurado.
- No marco Estilo, rode npm run painel, me passe o endereço local e espere eu escolher o estilo ou enviar o vídeo de referência pela página.
- Preserve .env, projeto.json, marca.json, entrada/ e estilos já criados; não sobrescreva respostas anteriores.
- No marco Primeiro vídeo, use /motion-criar-video e mostre cada resultado que pede aprovação (storyboard, teste de estilo) antes de seguir.
- No marco Publicação, só rode a publicação depois que eu escrever a palavra PUBLICAR; antes disso, apenas a conferência.
- Ao final, avise que preciso recarregar a janela do Antigravity para os comandos /motion-... aparecerem, e entregue o caminho do index.html e do MP4.
```

---

## Se você já baixou o projeto

Se você já clonou ou extraiu o projeto e abriu a pasta no Antigravity, envie:

```text
Inicie o onboarding do Criativo Motion Studio nesta pasta. Leia integralmente GEMINI.md, AGENTS.md, README.md e documentacao/onboarding-guiado.md. Verifique Node.js, FFmpeg e Remotion, rode npm run instalar -- --plataforma antigravity e conduza o processo pelos 6 marcos até o primeiro vídeo.
```

---

## Comportamento obrigatório do agente

1. **Preservação:** manter `.env`, `projeto.json`, `marca.json`, `entrada/` e estilos existentes.
2. **Segurança de credenciais:** nunca receber, exibir ou solicitar chaves ou tokens no chat, em comandos ou em commits.
3. **Publicação com aprovação explícita:** só a palavra `PUBLICAR`, escrita por você, autoriza a publicação.
4. **Conclusão real:** encerrar apenas com um MP4 conferido ou quando você pedir para parar.
