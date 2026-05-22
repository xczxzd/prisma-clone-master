// Regime detection: trend / range / chop / squeeze
import type { FCandle } from '@/market/binanceFutures';
import { atr } from './atrEngine';

export type Regime = 'TREND' | 'RANGE' | 'CHOP' | 'SQUEEZE' | 'EXPANSION';

function stddev(values: number[]): number {
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length;
  return Math.sqrt(v);
}

function adx(candles: FCandle[], period = 14): number {
  if (candles.length < period * 2) return 0;
  let plusDM = 0, minusDM = 0, trSum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1];
    const up = c.high - p.high;
    const dn = p.low - c.low;
    plusDM += up > dn && up > 0 ? up : 0;
    minusDM += dn > up && dn > 0 ? dn : 0;
    trSum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
  }
  const plusDI = (plusDM / trSum) * 100;
  const minusDI = (minusDM / trSum) * 100;
  const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1)) * 100;
  return dx;
}

export interface RegimeResult {
  regime: Regime;
  adx: number;
  bbWidth: number;
  atrPct: number;
  tradable: boolean;
}

export function detectRegime(candles: FCandle[]): RegimeResult {
  if (candles.length < 30) return { regime: 'CHOP', adx: 0, bbWidth: 0, atrPct: 0, tradable: false };
  const closes = candles.slice(-20).map(c => c.close);
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const sd = stddev(closes);
  const bbWidth = (4 * sd) / mean;
  const a = atr(candles, 14);
  const price = candles[candles.length - 1].close;
  const atrPct = a / price;
  const adxVal = adx(candles, 14);

  let regime: Regime = 'CHOP';
  if (adxVal > 25 && atrPct > 0.004) regime = 'TREND';
  else if (bbWidth < 0.015) regime = 'SQUEEZE';
  else if (atrPct > 0.012) regime = 'EXPANSION';
  else if (adxVal < 15) regime = 'RANGE';

  const tradable = regime === 'TREND' || regime === 'EXPANSION' || regime === 'SQUEEZE';
  return { regime, adx: adxVal, bbWidth, atrPct, tradable };
}
