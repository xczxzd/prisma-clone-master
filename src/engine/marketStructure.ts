// Market Structure: HH/HL/LH/LL, BOS, CHOCH
import type { FCandle } from '@/market/binanceFutures';

export interface Pivot { index: number; price: number; type: 'HIGH' | 'LOW' }
export interface StructureResult {
  pivots: Pivot[];
  lastSwing: 'HH' | 'HL' | 'LH' | 'LL' | null;
  bos: 'BULL' | 'BEAR' | null;
  choch: 'BULL' | 'BEAR' | null;
  trend: 'BULL' | 'BEAR' | 'RANGE';
}

function findPivots(candles: FCandle[], left = 3, right = 3): Pivot[] {
  const piv: Pivot[] = [];
  for (let i = left; i < candles.length - right; i++) {
    const c = candles[i];
    let isHigh = true, isLow = true;
    for (let k = 1; k <= left; k++) {
      if (candles[i - k].high >= c.high) isHigh = false;
      if (candles[i - k].low <= c.low) isLow = false;
    }
    for (let k = 1; k <= right; k++) {
      if (candles[i + k].high >= c.high) isHigh = false;
      if (candles[i + k].low <= c.low) isLow = false;
    }
    if (isHigh) piv.push({ index: i, price: c.high, type: 'HIGH' });
    if (isLow) piv.push({ index: i, price: c.low, type: 'LOW' });
  }
  return piv;
}

export function analyzeStructure(candles: FCandle[]): StructureResult {
  const pivots = findPivots(candles);
  if (pivots.length < 4) return { pivots, lastSwing: null, bos: null, choch: null, trend: 'RANGE' };

  const highs = pivots.filter(p => p.type === 'HIGH').slice(-3);
  const lows = pivots.filter(p => p.type === 'LOW').slice(-3);

  let trend: 'BULL' | 'BEAR' | 'RANGE' = 'RANGE';
  if (highs.length >= 2 && lows.length >= 2) {
    const hhUp = highs[highs.length - 1].price > highs[highs.length - 2].price;
    const hlUp = lows[lows.length - 1].price > lows[lows.length - 2].price;
    const lhDn = highs[highs.length - 1].price < highs[highs.length - 2].price;
    const llDn = lows[lows.length - 1].price < lows[lows.length - 2].price;
    if (hhUp && hlUp) trend = 'BULL';
    else if (lhDn && llDn) trend = 'BEAR';
  }

  const last = candles[candles.length - 1].close;
  const lastHigh = highs[highs.length - 1]?.price;
  const lastLow = lows[lows.length - 1]?.price;
  const prevHigh = highs[highs.length - 2]?.price;
  const prevLow = lows[lows.length - 2]?.price;

  let bos: StructureResult['bos'] = null;
  if (lastHigh && last > lastHigh) bos = 'BULL';
  else if (lastLow && last < lastLow) bos = 'BEAR';

  let choch: StructureResult['choch'] = null;
  if (trend === 'BEAR' && lastHigh && last > lastHigh) choch = 'BULL';
  else if (trend === 'BULL' && lastLow && last < lastLow) choch = 'BEAR';

  const lastSwing: StructureResult['lastSwing'] =
    trend === 'BULL' ? 'HH' : trend === 'BEAR' ? 'LL' : (lastHigh && prevHigh && lastHigh < prevHigh ? 'LH' : 'HL');

  return { pivots, lastSwing, bos, choch, trend };
}
