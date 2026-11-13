# Configurar a publicação no Instagram (Meta)

Esta etapa é manual: o produto não cria aplicativo, conta nem token em seu nome. Você usa o seu próprio aplicativo da Meta.

## Antes de começar

- O Instagram precisa ser uma conta profissional vinculada a uma Página do Facebook.
- Você precisa ser administrador da conta e da Página.

## Passos

1. Acesse o painel de desenvolvedores da Meta (<https://developers.facebook.com>) e crie ou escolha um aplicativo.
2. Habilite os produtos e permissões de publicação de conteúdo do Instagram exigidos pelo painel.
3. Gere o token de acesso pelo fluxo oficial da sua conta.
4. Preencha no `.env`:
   - `META_API_VERSION` (já vem com um valor padrão)
   - `INSTAGRAM_BUSINESS_ID`
   - `FACEBOOK_PAGE_ID`
   - `INSTAGRAM_ACCESS_TOKEN`
5. Configure a hospedagem pública conforme `configurar-github.md`. A Meta só publica um vídeo a partir de uma URL HTTPS pública.
6. Rode `npm run validar:integracoes`. O teste é só de leitura e não exibe tokens.

## Como a publicação acontece

O comando `publicar-reels` primeiro só confere e mostra o que será postado. A publicação real exige `--confirmar`, e o agente só usa essa opção depois que você responder PUBLICAR na conversa.

Tokens da Meta expiram. Se a validação passar a falhar, gere um token novo e atualize o `.env`.
