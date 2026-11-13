# Proteção de dados do produto (regra anticontaminação)

## Contexto

Esta pasta é um **produto-modelo vendido para instalação nas máquinas de outros usuários**. Ela nunca deve conter dados reais de ninguém, incluindo o próprio criador do produto.

- **Produto:** o modelo genérico que é distribuído. Não tem `.env`.
- **Instância:** a cópia instalada na máquina de um usuário, preenchida com os dados dele. Tem `.env`.

Se existir um arquivo `.env` nesta pasta, ela é uma instância e esta regra não restringe o uso normal. Sem `.env`, ela é o produto e tudo abaixo é obrigatório.

## Regras obrigatórias no produto

1. **Nunca rode a instalação aqui.** `npm run instalar` cria `.env`, `projeto.json` e `runtime/`, e grava skills com o caminho desta máquina. Para testar, gere uma cópia com `npm run empacotar -- <pasta-de-destino>` e instale na cópia.

2. **Nunca produza vídeos nem estilos aqui.** Roteiros, áudios, legendas, vídeos, estilos extraídos e publicações são dados de instância.

3. **Nunca grave dados reais:**
   - nomes de pessoas, empresas ou marcas reais;
   - perfis, endereços de publicações e identificadores de mídia;
   - cores, fontes ou paletas de uma marca específica;
   - caminhos de pastas desta máquina, nomes de usuário, e-mails;
   - chaves, tokens ou qualquer credencial.

4. **Modelos usam valores neutros.** Arquivos `*.exemplo.json` e `.env.example` ficam com `null`, vazio ou exemplos genéricos. O que o usuário preenche nasce na instância: `.env`, `projeto.json`, `marca.json`.

5. **Arquivos de instância estão no `.gitignore`** e não entram no pacote: `.env`, `projeto.json`, `marca.json`, `runtime/`, `saida/`, `vitrine/estilos.js`, o conteúdo de `entrada/` e qualquer pasta de `estilos/` além das nativas e de `_personalizado/`.

6. **Skills instaladas não voltam para o produto.** As cópias nas pastas globais das plataformas recebem o caminho da instância; a fonte em `skills/` usa apenas os marcadores `{{PASTA_DO_PRODUTO}}`, `{{PREFIXO}}` e `{{PRODUTO}}`.

## Dados do cliente e atualizações

Na instância, tudo o que não é arquivo do produto é dado do cliente e **nunca** pode ser sobrescrito por uma atualização, seja por `git pull`, seja por `npm run atualizar`: `.env`, `marca.json`, `projeto.json`, `entrada/` (menos `LEIA-ME.md`), `saida/`, `runtime/`, `render/`, `vitrine/estilos.js` e as pastas de estilos criados em `estilos/`.

- A lista de arquivos do produto é única: `scripts/verificar-produto.mjs`. O atualizador só copia o que está nela; qualquer outro caminho vindo de um pacote é ignorado.
- Nenhum arquivo versionado no git pode estar fora dessa lista (há um teste para isso). Assim o `git pull` nunca traz um arquivo para cima de um dado do cliente.
- O atualizador nunca apaga arquivos do cliente e nunca lê o conteúdo do `.env`; ao final lista apenas os **nomes** de variáveis novas.
- Ao criar uma pasta nova de dados do cliente, ela não entra na lista do produto e fica protegida automaticamente.

## Antes de distribuir

```
npm run verificar:produto
npm test
```

A verificação falha se encontrar arquivos de instância, caminhos locais, credenciais, e-mails, perfis ou marcas reais.

## Consequência da violação

Dados reais no produto chegam a todos os usuários que instalarem ou atualizarem, expondo informações de outra pessoa.
