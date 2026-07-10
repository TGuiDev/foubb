# Joguinhos dos Rangers

Coleção de jogos de festa para jogar em grupo com um único celular, feita em Next.js (App Router) + Tailwind CSS + shadcn/ui.

## Jogos disponíveis

- **Faz ou Bebe** — desafios e ordens para beber, um baralho de cartas viradas por vez.
- **Impostor** — um jogador não sabe a palavra secreta e precisa se disfarçar sem ser pego.
- **Quem Sou Eu?** — personagem na testa: adivinhe quem você é fazendo perguntas de sim ou não.
- **Mímica** — represente a palavra com gestos e corra contra o tempo para os outros adivinharem.
- **Qual é a Nota?** — um jogador recebe uma nota secreta e responde categorias de acordo com ela.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm start` — roda o build de produção
- `npm run lint` — lint do projeto

## Estrutura

- `app/jogos/<jogo>/page.tsx` — tela de cada jogo
- `app/api/*` — rotas de dados (bancos de palavras locais e integrações com PokéAPI / Rick and Morty API)
- `data/*.json` — bancos de palavras e personagens usados pelos jogos
- `components/` — modais de configuração de cada jogo e componentes shadcn/ui (`components/ui`)
- `components/GameHeader.tsx` — cabeçalho compartilhado (voltar ao menu + botão de regras) usado por todas as telas de jogo
- `lib/shuffle.ts` — utilitário de embaralhamento compartilhado
