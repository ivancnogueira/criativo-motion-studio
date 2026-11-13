# Instalação assistida pelo Codex

Escolha a opção conforme a forma como você recebeu o Criativo Motion Studio.

## A) Recebi um arquivo ZIP (mais simples)

1. Instale o **Node.js** (versão 20 ou superior) em <https://nodejs.org>, na versão marcada como LTS. Se não tiver certeza de que já tem, pule: o agente confere.
2. Extraia o ZIP em uma pasta definitiva, por exemplo `Documentos\criativo-motion-studio`. **Não mova essa pasta depois**, porque os comandos de barra ficam ligados a ela.
3. Abra o Codex dentro da pasta extraída: no terminal, entre na pasta (cd) e digite codex. Ou, no aplicativo, abra essa pasta como projeto.
4. Cole este prompt no chat:

```text
Inicie a instalação guiada do Criativo Motion Studio nesta pasta, que veio de um arquivo ZIP. Leia integralmente AGENTS.md, README.md, INSTALAR.md e documentacao/onboarding-guiado.md. Você está autorizado a executar npm run instalar, instalar o FFmpeg e o Remotion e preparar o ambiente. Conduza a instalação e o onboarding como um único processo contínuo, sem encerrar entre etapas.

Antes da primeira pergunta, mostre estes seis marcos:
1) Instalação (Node.js 20+, FFmpeg, comandos de barra no Codex, .env, Remotion)
2) Chaves e credenciais (eu preencho o .env: voz, legendas e, se quiser publicar, Instagram)
3) Marca (nome e três cores, opcional)
4) Estilo (escolher um dos 5 estilos no painel ou criar um estilo novo a partir de um vídeo)
5) Primeiro vídeo (tema, plano de beats, storyboard, animação, revisão e MP4)
6) Publicação (opcional, só com a palavra PUBLICAR)

Em cada interação, mostre o marco atual, o progresso, a decisão que estamos tomando e o resultado da próxima etapa. Nunca termine apenas perguntando se quero continuar.

Regras fundamentais:
- Fale comigo em português simples, sem jargão: eu posso ser iniciante e não conhecer terminal, Node.js ou git. Explique o que vai fazer antes de cada comando.
- No marco Instalação, confira node --version (20 ou superior) e ffmpeg -version. Se algo faltar, me diga o que é, de onde baixar e o comando de instalação, e confirme comigo antes de rodar. Rode npm run instalar -- --plataforma codex (as skills vão para ~/.codex/skills, ou para $CODEX_HOME/skills se essa variável existir). Depois instale o Remotion na pasta render/ desta instalação: npm init -y, npm install remotion @remotion/cli @remotion/captions react react-dom, npx remotion browser ensure e um teste de renderização curto conferido com ffprobe. Avise-me sobre a licença do Remotion (https://www.remotion.dev/license). Rode npm run diagnosticar e explique o resultado em linguagem simples.
- Os comandos de barra ficam ligados a esta pasta. Me avise para não mover nem apagar a pasta depois da instalação; se eu mover, rode npm run instalar de novo na pasta nova.
- Nunca abra, mostre ou peça o conteúdo do .env, nem peça chaves ou tokens no chat. Eu preencho o .env no meu computador; use npm run diagnosticar e npm run validar:integracoes para saber o que está configurado.
- O marco Chaves e credenciais é uma parada obrigatória: não pule e não siga sem a minha resposta. Mostre uma tabela do que cada chave libera (voz, legendas pelo Groq, publicação no Instagram) e do que está faltando segundo npm run diagnosticar. Pergunte quais eu quero configurar agora e me guie passo a passo com os guias da pasta documentacao: onde criar a conta, onde copiar a chave e em qual linha do .env colar. Me diga o caminho completo do .env e como abrir. Espere eu avisar que salvei, rode npm run validar:integracoes e me mostre o que passou. Só avance quando eu disser que terminei ou que quero pular.
- No marco Estilo, rode npm run painel, me passe o endereço local e espere eu escolher o estilo ou enviar o vídeo de referência pela página.
- Preserve .env, projeto.json, marca.json, entrada/ e estilos já criados; não sobrescreva respostas anteriores.
- No marco Primeiro vídeo, use a skill motion-criar-video. O vídeo só está pronto quando tudo o que é falado aparece na tela e nada fica parado: confira com npm run medir-movimento e olhando os quadros. Mostre cada resultado que pede aprovação (storyboard, teste de estilo) antes de seguir.
- No marco Publicação, só rode a publicação depois que eu escrever a palavra PUBLICAR; antes disso, apenas a conferência.
- Ao final, avise que preciso reiniciar o Codex ou abrir uma nova conversa para as skills do Criativo Motion Studio aparecerem, e entregue o caminho do index.html e do MP4.
```

## B) Tenho acesso ao repositório no GitHub (clone)

Precisa de **git** instalado (<https://git-scm.com>) e de acesso ao repositório privado: você recebe um convite por e-mail. Aceite o convite e faça o login do git no seu computador antes de começar. Em uma pasta vazia, abra o Codex e cole:

```text
Instale o Criativo Motion Studio a partir de https://github.com/ivancnogueira/criativo-motion-studio.git em uma nova pasta criativo-motion-studio no diretório atual. Depois do clone, leia integralmente AGENTS.md, README.md, INSTALAR.md e documentacao/onboarding-guiado.md. Você está autorizado a executar npm run instalar, instalar o FFmpeg e o Remotion e preparar o ambiente. Conduza a instalação e o onboarding como um único processo contínuo, sem encerrar entre etapas.

Antes da primeira pergunta, mostre estes seis marcos:
1) Instalação (Node.js 20+, FFmpeg, comandos de barra no Codex, .env, Remotion)
2) Chaves e credenciais (eu preencho o .env: voz, legendas e, se quiser publicar, Instagram)
3) Marca (nome e três cores, opcional)
4) Estilo (escolher um dos 5 estilos no painel ou criar um estilo novo a partir de um vídeo)
5) Primeiro vídeo (tema, plano de beats, storyboard, animação, revisão e MP4)
6) Publicação (opcional, só com a palavra PUBLICAR)

Em cada interação, mostre o marco atual, o progresso, a decisão que estamos tomando e o resultado da próxima etapa. Nunca termine apenas perguntando se quero continuar.

Regras fundamentais:
- Fale comigo em português simples, sem jargão: eu posso ser iniciante e não conhecer terminal, Node.js ou git. Explique o que vai fazer antes de cada comando.
- No marco Instalação, confira node --version (20 ou superior) e ffmpeg -version. Se algo faltar, me diga o que é, de onde baixar e o comando de instalação, e confirme comigo antes de rodar. Rode npm run instalar -- --plataforma codex (as skills vão para ~/.codex/skills, ou para $CODEX_HOME/skills se essa variável existir). Depois instale o Remotion na pasta render/ desta instalação: npm init -y, npm install remotion @remotion/cli @remotion/captions react react-dom, npx remotion browser ensure e um teste de renderização curto conferido com ffprobe. Avise-me sobre a licença do Remotion (https://www.remotion.dev/license). Rode npm run diagnosticar e explique o resultado em linguagem simples.
- Os comandos de barra ficam ligados a esta pasta. Me avise para não mover nem apagar a pasta depois da instalação; se eu mover, rode npm run instalar de novo na pasta nova.
- Nunca abra, mostre ou peça o conteúdo do .env, nem peça chaves ou tokens no chat. Eu preencho o .env no meu computador; use npm run diagnosticar e npm run validar:integracoes para saber o que está configurado.
- O marco Chaves e credenciais é uma parada obrigatória: não pule e não siga sem a minha resposta. Mostre uma tabela do que cada chave libera (voz, legendas pelo Groq, publicação no Instagram) e do que está faltando segundo npm run diagnosticar. Pergunte quais eu quero configurar agora e me guie passo a passo com os guias da pasta documentacao: onde criar a conta, onde copiar a chave e em qual linha do .env colar. Me diga o caminho completo do .env e como abrir. Espere eu avisar que salvei, rode npm run validar:integracoes e me mostre o que passou. Só avance quando eu disser que terminei ou que quero pular.
- No marco Estilo, rode npm run painel, me passe o endereço local e espere eu escolher o estilo ou enviar o vídeo de referência pela página.
- Preserve .env, projeto.json, marca.json, entrada/ e estilos já criados; não sobrescreva respostas anteriores.
- No marco Primeiro vídeo, use a skill motion-criar-video. O vídeo só está pronto quando tudo o que é falado aparece na tela e nada fica parado: confira com npm run medir-movimento e olhando os quadros. Mostre cada resultado que pede aprovação (storyboard, teste de estilo) antes de seguir.
- No marco Publicação, só rode a publicação depois que eu escrever a palavra PUBLICAR; antes disso, apenas a conferência.
- Ao final, avise que preciso reiniciar o Codex ou abrir uma nova conversa para as skills do Criativo Motion Studio aparecerem, e entregue o caminho do index.html e do MP4.
- Se o clone pedir login ou falhar por falta de acesso, pare e me explique. Eu faço o login do git (por exemplo com gh auth login) ou uso o ZIP. Nunca peça um token no chat.
```

## Atualizar depois

As atualizações trocam só o produto (código, skills, estilos nativos e documentação). **Seus dados nunca são tocados**: `.env`, `marca.json`, `projeto.json`, `entrada/`, `saida/`, `render/` e os estilos que você criou. Abra o agente na pasta e cole:

```text
Atualize o Criativo Motion Studio nesta pasta. Se ela for um clone do git, rode npm run atualizar. Se eu tiver baixado um ZIP novo, rode npm run atualizar -- --simular --zip CAMINHO-DO-ARQUIVO, me mostre o relatório e, com a minha confirmação, rode sem --simular. Nunca apague nem sobrescreva .env, marca.json, projeto.json, entrada, saida, render ou estilos criados por mim, e nunca abra o .env. Ao final, explique em português simples o que mudou.
```

---

## Comportamento obrigatório do agente

1. **Preservação:** manter `.env`, `projeto.json`, `marca.json`, `entrada/` e estilos existentes.
2. **Segurança de credenciais:** nunca receber, exibir ou solicitar chaves ou tokens no chat, em comandos ou em commits.
3. **Publicação com aprovação explícita:** só a palavra `PUBLICAR`, escrita por você, autoriza a publicação.
4. **Conclusão real:** encerrar apenas com um MP4 conferido ou quando você pedir para parar.
