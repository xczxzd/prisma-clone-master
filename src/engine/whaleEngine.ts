// Whale Engine: detecta clusters de trades grandes (whale activity) em aggTrades.
import type { AggTrade } from '@/realtime/streamManager';

export interface WhaleHit {
  symbol: string;
  side: 'BUY' | 'SELL';
  notional: number;
  qty: number;
  price: number;
  tradeTime: number;
}

export interface WhaleStats {
  hits: WhaleHit[];
  buyNotional: number;
  sellNotional: number;
  delta: number;
  dominantSide: 'BUY' | 'SELL' | 'NEUTRAL';
}

/**
 * Considera "whale" qualquer aggTrade com notional ≥ minNotional (default 100k USD).
 */
export function scanWhales(trades: AggTrade[], minNotional = 100_000): WhaleStats {
  const hits: WhaleHit[] = [];
  let buy = 0, sell = 0;
  for (const t of trades) {
    if (t.quote >= minNotional) {
      const side: 'BUY' | 'SELL' = t.isBuyerMaker ? 'SELL' : 'BUY';
      hits.push({
        symbol: t.symbol, side, notional: t.quote, qty: t.qty,
        price: t.price, tradeTime: t.tradeTime,
      });
      if (side === 'BUY') buy += t.quote; else sell += t.quote;
    }
  }
  const delta = buy - sell;
  const total = buy + sell;
  let dominantSide: WhaleStats['dominantSide'] = 'NEUTRAL';
  if (total > 0) {
    if (buy / total > 0.6) dominantSide = 'BUY';
    else if (sell / total > 0.6) dominantSide = 'SELL';
  }
  return { hits, buyNotional: buy, sellNotional: sell, delta, dominantSide };
}
