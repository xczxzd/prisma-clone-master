// Liquidity map: equal highs/lows, pools
import type { FCandle } from '@/market/binanceFutures';

export interface LiquidityZone {
  price: number;
  type: 'BSL' | 'SSL'; // Buy-Side Liquidity (above), Sell-Side (below)
  touches: number;
  index: number;
}

const EPSILON = 0.0015; // 0.15%

export function buildLiquidityMap(candles: FCandle[], lookback = 100): LiquidityZone[] {
  const slice = candles.slice(-lookback);
  const highs: { p: number; i: number }[] = slice.map((c, i) => ({ p: c.high, i }));
  const lows: { p: number; i: number }[] = slice.map((c, i) => ({ p: c.low, i }));

  const zones: LiquidityZone[] = [];
  const cluster = (arr: { p: number; i: number }[], type: 'BSL' | 'SSL') => {
    const used = new Set<number>();
    for (let i = 0; i < arr.length; i++) {
      if (used.has(i)) continue;
      let touches = 1, sum = arr[i].p, last = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (Math.abs(arr[j].p - arr[i].p) / arr[i].p < EPSILON) {
          touches++; sum += arr[j].p; used.add(j); last = j;
        }
      }
      if (touches >= 2) zones.push({ price: sum / touches, type, touches, index: last });
    }
  };
  cluster(highs, 'BSL');
  cluster(lows, 'SSL');
  return zones.sort((a, b) => b.touches - a.touches).slice(0, 12);
}
