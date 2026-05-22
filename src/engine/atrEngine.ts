// ATR + displacement
import type { FCandle } from '@/market/binanceFutures';

export function atr(candles: FCandle[], period = 14): number {
  if (candles.length < period + 1) return 0;
  let sum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1];
    const tr = Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
    sum += tr;
  }
  return sum / period;
}

export function dailyATR(candles: FCandle[]): number { return atr(candles, 14); }

// Manipulation candle: range > 20% ATR diário (proxy = ATR(14) na TF analisada)
export function isManipulationCandle(c: FCandle, atrValue: number): boolean {
  if (!atrValue) return false;
  const range = c.high - c.low;
  return range > atrValue * 1.2;
}

export function isExpansion(candles: FCandle[]): boolean {
  if (candles.length < 20) return false;
  const a = atr(candles, 14);
  const last = candles[candles.length - 1];
  return (last.high - last.low) > a * 1.5;
}
