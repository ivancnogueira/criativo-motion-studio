# Criar um estilo novo a partir de um vídeo de referência

Um estilo personalizado é uma pasta `estilos/<id>/` (id em minúsculas, só letras, números e hífen) com:

| Arquivo | Conteúdo | Quem cria |
|---|---|---|
| `referencia.png` | Folha com 12 quadros do vídeo. Obrigatória. | `scripts/extrair-estilo.mjs` |
| `referencia/quadro-NN.jpg` | Os mesmos quadros, um por arquivo. O número do quadro é o do nome do arquivo. | idem |
| `referencia/movimento-NN.jpg` | Quadros consecutivos do momento de maior movimento. | idem |
| `metricas.md` | Medidas do vídeo: duração, cortes, brilho, saturação e cores dominantes. | idem |
| `direcao.md` | Direção de arte em inglês, no formato de `direcao-formato.md`. | agente |
| `estilo.json` | Metadados (modelo em `estilo.exemplo.json`). | agente |

## Passos

1. `node scripts/extrair-estilo.mjs <video> --id <id> [--inicio s] [--duracao s]`. Requer FFmpeg.
2. Estude a folha, os quadros e a sequência de movimento, seguindo `analise-regras.md`.
3. Escreva `direcao.md` com exatamente os títulos de `direcao-formato.md`.
4. Escreva `estilo.json` a partir de `estilo.exemplo.json`. Campos de vitrine em português; `rotulo` e `resumoPrompt` em inglês, porque entram no prompt.
5. `sequenciaMovimento` é `true` quando a extração gerou os quadros de movimento.
6. Não altere `metricas.md` nem invente números.
7. Teste: aponte `projeto.json` para o novo id e rode `node scripts/montar-prompt.mjs`. Atualize a vitrine com `node scripts/vitrine.mjs`.

Estilos criados pelo painel chegam com `"rascunho": true` em `estilo.json`: foram montados só por medidas, sem entender o conteúdo do vídeo. O agente deve olhar os quadros, reescrever `direcao.md` e os campos de vitrine, manter `cores`, `medidas` e `metricas.md`, e remover o campo `rascunho`.

Quem já tem uma folha de referência pronta (por exemplo, gerada pelo app original) pode salvá-la direto como `referencia.png` e pular o passo 1.

Nunca cite o criador, canal, marca ou personagens do vídeo de referência, nem reaproveite o assunto dele.
