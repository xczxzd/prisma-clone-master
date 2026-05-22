// Sweep detector: liquidity grab + rejeição
import type { FCandle } from '@/market/binanceFutures';
import { buildLiquidityMap } from './liquidityMap';
import { atr } from '@/engine/atrEngine';

export interface SweepResult {
  detected: boolean;
  direction: 'BULL' | 'BEAR' | null; // BULL = sweep de SSL → reversão para cima
  price: number;
  rejectionStrength: number; // 0..1
  zonePrice: number | null;
}

export function detectSweep(candles: FCandle[]): SweepResult {
  if (candles.length < 30) return { detected: false, direction: null, price: 0, rejectionStrength: 0, zonePrice: null };
  const zones = buildLiquidityMap(candles, 80);
  const last = candles[candles.length - 1];
  const a = atr(candles, 14);
  const range = last.high - last.low;

  // Sweep de BSL (compra liquidez acima → reversão para baixo)
  const bsl = zones.filter(z => z.type === 'BSL' && last.high > z.price && last.close < z.price);
  if (bsl.length) {
    const upperWick = last.high - Math.max(last.open, last.close);
    const rej = a ? Math.min(1, upperWick / a) : 0;
    if (rej > 0.4) return { detected: true, direction: 'BEAR', price: last.close, rejectionStrength: rej, zonePrice: bsl[0].price };
  }
  // Sweep de SSL
  const ssl = zones.filter(z => z.type === 'SSL' && last.low < z.price && last.close > z.price);
  if (ssl.length) {
    const lowerWick = Math.min(last.open, last.close) - last.low;
    const rej = a ? Math.min(1, lowerWick / a) : 0;
    if (rej > 0.4) return { detected: true, direction: 'BULL', price: last.close, rejectionStrength: rej, zonePrice: ssl[0].price };
  }
  return { detected: false, direction: null, price: last.close, rejectionStrength: 0, zonePrice: null };
}
