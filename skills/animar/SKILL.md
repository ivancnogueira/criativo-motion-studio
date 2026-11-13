---
name: animar
description: Animador do {{PRODUTO}}. Constrói a animação completa em motion graphics no estilo escolhido, sincronizada com a narração e com legendas na tela. Use quando o roteiro, o estilo e o áudio já estiverem definidos e for hora de produzir a animação.
---

# Animador — {{PRODUTO}}

**Pasta do produto:** `{{PASTA_DO_PRODUTO}}`

Você é um animador, não um montador de slides. O vídeo só está bom quando **tudo o que é falado aparece na tela no instante em que é dito, e nada fica parado**.

## 1. Conferir os insumos

- `projeto.json` com `tema`, `estilo`, formato e áudio definidos.
- Com narração: `entrada/narracao.mp3` existe e `saida/legendas/legendas.json` foi gerado. Se faltar, acione `/{{PREFIXO}}-narracao` ou `/{{PREFIXO}}-legendas`.
- Plano de beats em `saida/<nome>/beats.json` (feito pelo `/{{PREFIXO}}-storyboard`). Se não existir, faça o plano antes de animar, seguindo a seção "Plano de beats" daquela skill, mesmo sem pedir aprovação.

## 2. Montar a especificação

Rode `node scripts/montar-prompt.mjs` e leia `saida/prompt.md` inteiro. Ele é a especificação do vídeo: qualidade visual, movimento, câmera, tipografia, áudio e exportação. Siga-o aplicando as "Adaptações obrigatórias" de `AGENTS.md`.

## 3. Preparar o kit de movimento

1. Leia `kit/LEIA-ME.md` e o beat "cena" de `kit/exemplo.js`. Se puder, veja a demonstração (`npm run kit`).
2. Copie a pasta `kit/` para `saida/<nome>/kit/`. Trabalhe nessa cópia e mude o que precisar; nunca edite `kit/` do produto.
3. O kit é **referência para não começar do zero, não um molde**. Você é livre para desenhar, animar e estruturar do seu jeito, desde que cumpra as regras de movimento abaixo e o prompt do estilo. Se o estilo pedir outro motor (WebGL, Three.js, SVG), use `kit/movimento.js` para tempos, poses e curvas e desenhe com o motor do estilo.

## 4. Construir

Crie `saida/<nome>/index.html` com os arquivos de apoio na mesma pasta.

- **Relógio único:** toda a animação deriva de um tempo `t` em segundos, para que qualquer instante possa ser desenhado sob demanda.
- **Um beat por frase:** os tempos vêm de `legendas.json` (`beatsPorFrases`, `tempoDaPalavra`). Cada pessoa, lugar, objeto e ação citados na frase aparece na tela quando a palavra é dita. Se a narração diz "soldados com câmeras", há soldados com câmeras, fazendo algo.
- **Ilustre, não rotule:** uma etiqueta com a palavra não substitui a imagem. Texto na tela só resume.
- **Peças próprias do tema:** em cada vídeo, desenhe pelo menos uma peça nova por beat para o que é específico do assunto (copie a mais parecida do catálogo e mude, ou crie do zero). Um vídeo só com peças do catálogo fica genérico.
- **Três camadas de movimento:** tudo entra, vive enquanto está na tela e sai. Pelo menos três coisas se movendo a qualquer momento, e um acontecimento novo a cada 2 a 4 segundos.
- **Personagens atuam:** andam, param, apontam, reagem ao que acontece. Nunca um boneco em pé parado.
- **Planos e câmera:** fundo, meio e frente; aproxime no momento importante.
- **Variedade:** não repita a mesma entrada nem a mesma transição duas vezes seguidas, e não reaproveite a composição de um beat no seguinte.
- **Transições com peso:** nada de corte seco, a não ser de propósito.
- **Legendas na tela:** quando `legendas` estiver ligado, desenhe os `blocos` de `legendas.json`, destacando a palavra falada no momento. Poucas palavras por vez, fonte grande, alto contraste, dentro da área segura.
- **Área segura do vertical:** nada importante no topo nem nos 20% inferiores.

## 5. Conferir antes de entregar

Sirva a pasta por um servidor local, abra no navegador e verifique de verdade:

- roda do início ao fim sem erro no console;
- o primeiro quadro não é uma tela vazia;
- o áudio toca e as legendas acompanham a fala;
- a duração bate com a configurada;
- **olhe os quadros:** capture a tela no meio de cada beat e em duas transições. Para cada beat, liste as palavras-chave da frase e confirme, olhando a imagem, que cada uma está desenhada. Compare dois instantes do mesmo beat com 1 segundo de diferença: se parecerem iguais, o beat está parado. Corrija antes de entregar.

Informe o caminho do `index.html` e encaminhe para `/{{PREFIXO}}-renderizar`.
