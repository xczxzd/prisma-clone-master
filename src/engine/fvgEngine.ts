// Fair Value Gap engine
import type { FCandle } from '@/market/binanceFutures';

export interface FVG {
  index: number;
  type: 'BULL' | 'BEAR';
  top: number;
  bottom: number;
  filled: boolean;
}

export function detectFVGs(candles: FCandle[], lookback = 50): FVG[] {
  const out: FVG[] = [];
  const start = Math.max(2, candles.length - lookback);
  for (let i = start; i < candles.length; i++) {
    const c0 = candles[i - 2], c1 = candles[i - 1], c2 = candles[i];
    // Bullish FVG: low de c2 > high de c0 (gap)
    if (c2.low > c0.high) {
      const filled = candles.slice(i + 1).some(k => k.low <= c0.high);
      out.push({ index: i - 1, type: 'BULL', top: c2.low, bottom: c0.high, filled });
    }
    if (c2.high < c0.low) {
      const filled = candles.slice(i + 1).some(k => k.high >= c0.low);
      out.push({ index: i - 1, type: 'BEAR', top: c0.low, bottom: c2.high, filled });
    }
  }
  return out;
}

export function nearestUnfilledFVG(candles: FCandle[], direction: 'BULL' | 'BEAR'): FVG | null {
  const all = detectFVGs(candles).filter(f => !f.filled && f.type === direction);
  return all.length ? all[all.length - 1] : null;
}
