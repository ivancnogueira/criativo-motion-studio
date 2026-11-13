# Configurar a hospedagem pública (GitHub)

Para publicar pelo Instagram, o vídeo precisa estar em uma URL HTTPS pública. O produto usa um repositório público do GitHub só para isso.

**Tudo que for enviado a esse repositório fica público.** O produto envia apenas o MP4 final e a capa. Nunca use o repositório do próprio produto nem envie o `.env`.

## 1. Criar o repositório

1. Entre na sua conta do GitHub.
2. Crie um repositório **público**, por exemplo `meus-videos-publicos`, e marque a opção de criar com um README, para que a branch `main` exista.

## 2. Criar uma credencial mínima

Em **Settings → Developer settings → Personal access tokens → Fine-grained tokens**, crie um token com:

- acesso somente ao repositório criado;
- permissão **Contents: Read and write**;
- nenhuma outra permissão.

## 3. Preencher o .env

```text
GITHUB_PAGES_OWNER=seu-usuario
GITHUB_PAGES_REPO=meus-videos-publicos
GITHUB_PAGES_BRANCH=main
GITHUB_PAGES_TOKEN=
```

`GITHUB_PAGES_BASE_URL` pode ficar vazio.

## 4. Validar

Rode `npm run validar:integracoes`. Ele confirma que o repositório existe, é público e aceita a credencial.

## Limite

Cada vídeo precisa ter menos de 95 MB. Vídeos curtos em 1080p ficam bem abaixo disso.
