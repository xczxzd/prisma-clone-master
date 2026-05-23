// Aggression: razão buy/sell agressivo em janela.
import type { AggTrade } from '@/realtime/streamManager';

export interface AggressionStats {
  buyVol: number;
  sellVol: number;
  ratio: number;   // buy / (buy + sell)
  dominantSide: 'BUY' | 'SELL' | 'NEUTRAL';
  imbalancePct: number; // |buy - sell| / total * 100
}

export function aggressionFromTrades(trades: AggTrade[]): AggressionStats {
  let buy = 0, sell = 0;
  for (const t of trades) {
    if (t.isBuyerMaker) sell += t.qty; else buy += t.qty;
  }
  const total = buy + sell;
  const ratio = total > 0 ? buy / total : 0.5;
  const imb = total > 0 ? (Math.abs(buy - sell) / total) * 100 : 0;
  let dom: AggressionStats['dominantSide'] = 'NEUTRAL';
  if (ratio > 0.6) dom = 'BUY';
  else if (ratio < 0.4) dom = 'SELL';
  return { buyVol: buy, sellVol: sell, ratio, dominantSide: dom, imbalancePct: imb };
}
