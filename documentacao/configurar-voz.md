# Configurar a narração automática

Sem nenhuma chave, a narração funciona no modo manual: o agente entrega o texto e você salva o MP3 em `entrada/narracao.mp3`. Com a chave de um provedor, o agente gera o áudio sozinho.

Preencha apenas o provedor que você usa. Cada geração consome créditos do seu plano; o agente mostra a contagem de caracteres antes e pede confirmação.

## ElevenLabs

1. Em <https://elevenlabs.io>, abra o seu perfil e vá em **API Keys**. Crie uma chave.
2. Em **Voices**, escolha a voz e copie o **Voice ID**.
3. No `.env`: `ELEVENLABS_API_KEY=` e `ELEVENLABS_VOICE_ID=`.

## Fish Audio

1. Em <https://fish.audio>, abra a área de API e crie uma chave.
2. Abra a página da voz desejada e copie o identificador do modelo de voz.
3. No `.env`: `FISH_AUDIO_API_KEY=` e `FISH_AUDIO_VOICE_ID=`.

## MiniMax

1. Em <https://platform.minimax.io>, vá em **Account Management → API Keys** e crie uma chave.
2. Escolha uma voz na lista de vozes e copie o `voice_id`.
3. No `.env`: `MINIMAX_API_KEY=` e `MINIMAX_VOICE_ID=`.

## Mais de um provedor

Se preencher mais de um, escolha o preferido em `VOZ_PROVEDOR=` com `elevenlabs`, `fishaudio` ou `minimax`.

## Avisos

- Confira nos termos do seu plano se o uso comercial é permitido. Planos gratuitos costumam ter restrições.
- Só clone a voz de uma pessoa com autorização dela.
- Nunca cole chaves no chat do agente.
