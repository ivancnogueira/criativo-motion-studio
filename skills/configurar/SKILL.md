---
name: configurar
description: Assistente de configuração do {{PRODUTO}}. Verifica a instalação e guia o usuário, passo a passo, na criação das chaves de voz, legendas e publicação. Use na primeira vez, quando algo não funcionar, ou quando o usuário perguntar como configurar uma chave ou conectar o Instagram.
---

# Configurar — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

## 1. Diagnóstico

Rode `node scripts/diagnosticar.mjs` e explique o resultado em linguagem simples: o que já funciona e o que cada item pendente destrava. Nada é obrigatório para criar o primeiro vídeo; sem chaves, a narração é manual e a publicação também.

## 2. Guiar uma integração por vez

Pergunte o que o usuário quer ativar e siga o guia correspondente:

| Para | Guia | Custo |
|---|---|---|
| Legendas sincronizadas | `documentacao/configurar-apis.md` | Gratuito |
| Narração automática | `documentacao/configurar-voz.md` | Plano do provedor |
| Publicar no Instagram | `documentacao/configurar-meta.md` e `documentacao/configurar-github.md` | Gratuito |

Leia o guia e conduza um passo de cada vez, esperando o usuário concluir antes do próximo.

## 3. Preencher o .env

O usuário abre o arquivo `.env` na pasta do produto e cola cada valor na linha certa. Diga exatamente qual é o nome do campo.

**Nunca peça para colar chaves ou tokens no chat, e nunca leia nem mostre o conteúdo do `.env`.** Se o usuário colar uma chave na conversa, avise que ela ficou exposta e recomende gerar outra.

## 4. Validar

```
node scripts/validar-integracoes.mjs
```

O comando testa cada integração preenchida só por leitura e não exibe chaves. Explique qualquer falha e o que conferir.

## 5. Marca

Pergunte se o usuário quer usar as cores da própria marca nos vídeos. Se sim, copie `marca.exemplo.json` para `marca.json` e preencha o nome e as três cores em hexadecimal: dominante, destaque e apoio.

## 6. Instalação das skills

Se o diagnóstico mostrar skills pendentes em alguma plataforma, rode `node scripts/instalar-skills.mjs` e peça para fechar e reabrir o agente.
