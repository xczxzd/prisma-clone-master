## Reestruturação Institucional — PRISMA IA Scanner

Este é um trabalho muito grande (40+ arquivos novos, várias edge functions, mudanças profundas no frontend e infraestrutura realtime). Vou entregar em **fases incrementais** para garantir que cada parte funcione antes de seguir adiante. Você poderá testar entre cada fase.

### Fase 1 — Fundação Quantitativa (núcleo + engines puras)
Criar a base matemática institucional usando **apenas dados reais Binance Futures** (fapi). Sem mocks, sem `Math.random`.

```
src/core/
  eventBus.ts            # pub/sub interno
  stateManager.ts        # cache reativo de candles/OI/funding
  confluenceEngine.ts    # combina engines em score 0-100
  signalPipeline.ts      # orquestra: regime → HTF → sweep → score → emit
src/engine/
  htfBias.ts             # bias 4H/1H (EMA50/200 + estrutura)
  marketStructure.ts     # HH/HL/LH/LL, BOS, CHOCH
  regimeEngine.ts        # trend/range/chop/squeeze (ADX + BB width)
  atrEngine.ts           # ATR + displacement candles (>20% ATR)
  displacement.ts        # candles institucionais
  fvgEngine.ts           # fair value gaps limpos
  institutionalScore.ts  # tabela de pesos do prompt
src/liquidity/
  liquidityMap.ts        # equal highs/lows, pools
  sweepDetector.ts       # liquidity sweeps + rejeição
src/market/
  binanceFutures.ts      # cliente fapi (klines, ticker, OI, funding, LSR, liquidations)
```

### Fase 2 — Realtime + Orderflow
```
src/realtime/
  websocketManager.ts    # multi-stream Binance Futures, auto-reconnect
  streamManager.ts       # subscribe por símbolo/timeframe
src/orderflow/
  deltaEngine.ts         # delta de aggTrades
  aggression.ts          # buy/sell aggression
  absorption.ts          # absorção institucional
  imbalance.ts           # desequilíbrios
src/engine/
  oiEngine.ts            # OI realtime + divergência
  fundingEngine.ts       # funding extremos
  whaleEngine.ts         # clusters de aggTrades grandes
  squeezeEngine.ts       # short/long squeeze detection
  consensusEngine.ts     # gate final multi-fator
```

### Fase 3 — Pipeline de Sinais Real + Anti-Conflito
- Substituir geração atual (que usa Math.random) por `signalPipeline.ts`.
- Implementar **anti-conflito HTF**: bloquear SHORT se 4H+1H bullish, e vice-versa.
- Filtros anti-falso sinal (breakout sem volume, sweep sem rejeição, sinal contra HTF).
- Score mínimo configurável (default 80) para promover sinal → Telegram.
- Substituir `Dashboard.tsx` e `StrategyV3.tsx` para consumir o pipeline real.

### Fase 4 — Telegram Automático Profissional
Reformular as edge functions existentes (`telegram-auto-runner`, `telegram-send`):
- Scanner de **+400 pares** Binance Futures (paginado por batch).
- Envio só com score ≥ 80, dedup por par/direção/janela.
- Mensagens formatadas com: ativo, direção, TF, score, entry/SL/TP1-3, RR, ATR, volume, OI, funding, motivo, horário.
- Alertas separados: whale, squeeze, liquidation cascade, funding extreme, sweep.
- Cron `pg_cron` a cada 60s chamando o runner (substitui o intervalo no frontend).
- Tabela `signal_dedup` para evitar duplicatas em janelas de 30min.

### Fase 5 — Dashboard Terminal Institucional
Novos componentes no dashboard:
- Heatmap institucional (todos os pares por score)
- Liquidity map (zonas + sweeps recentes)
- Smart money flow (delta acumulado)
- OI + Funding panel
- Liquidation tracker
- Whale activity feed
- Squeeze meter
- Regime indicator
- ATR monitor
- Confluence panel (mostra os 8 fatores do score)

### Fase 6 — Logs, QA e limpeza final
- Tabela `system_logs` para sinais, telegram, ws, erros.
- Remover **todo** `Math.random` do projeto (grep + substituir).
- Remover sinais mockados de `Dashboard.tsx`, `StrategyV3.tsx`, `PriceProjection.tsx`.
- Testes manuais com BTCUSDT/ETHUSDT validando cada engine.

### O que NÃO vou fazer neste projeto
Estas peças do prompt **não cabem** num projeto Lovable (frontend Vite + edge functions Deno) e exigiriam infraestrutura externa:

- **Redis + BullMQ** (filas) — Lovable não roda workers persistentes. Vou usar `pg_cron` + tabela `job_queue` como substituto leve.
- **Puppeteer screenshots** — não roda em edge functions Deno. Vou enviar link TradingView + imagem do gráfico via API alternativa (chart-img.com) se você adicionar uma chave; senão, mensagens texto-only HTML ricas.
- **App mobile nativo realtime** — o projeto é web; o PWA já é responsivo. App nativo separado fica fora de escopo.
- **Footprint chart real** — requer dados tick-by-tick pagos. Vou aproximar com aggTrades 1s.
- **400 pares em websocket simultâneo no browser** — inviável. Faço scan REST paginado server-side a cada 60s + WS apenas para watchlist (até 20 pares).

### Como vou trabalhar
Vou pedir sua aprovação aqui, depois executar **Fase 1 inteira** numa rodada (criar todos os arquivos da fundação + uma migration para `signal_dedup` e `system_logs`). Em seguida você testa, e seguimos para Fase 2. Cada fase termina com algo verificável na tela.

**Posso começar pela Fase 1?** Se quiser pular alguma fase, mudar prioridade, ou aceitar/recusar os itens do "NÃO vou fazer", me avise antes.
