# Configurar as legendas (Groq)

A Groq Cloud transcreve a narração e devolve o tempo de cada palavra. É o que permite legendas sincronizadas. O plano gratuito não pede cartão.

1. Acesse <https://console.groq.com> e entre com sua conta Google ou GitHub.
2. No menu lateral, abra **API Keys** e clique em **Create API Key**.
3. Dê um nome (por exemplo, `Motion Studio`) e confirme.
4. Copie a chave gerada (começa com `gsk_`).
5. Abra o arquivo `.env` na pasta do produto e cole na linha `GROQ_API_KEY=`.

Teste com `npm run validar:integracoes`.

Nunca cole a chave no chat do agente. Se isso acontecer, apague a chave no painel da Groq e crie outra.
