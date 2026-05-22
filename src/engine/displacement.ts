// Displacement: candles institucionais (corpo grande + range expandido + close direcional)
import type { FCandle } from '@/market/binanceFutures';
import { atr } from './atrEngine';

export interface Displacement {
  detected: boolean;
  direction: 'UP' | 'DOWN' | 'NONE';
  strength: number; // 0..1
  index: number;
}

export function detectDisplacement(candles: FCandle[]): Displacement {
  if (candles.length < 20) return { detected: false, direction: 'NONE', strength: 0, index: -1 };
  const a = atr(candles, 14);
  const i = candles.length - 1;
  const c = candles[i];
  const body = Math.abs(c.close - c.open);
  const range = c.high - c.low;
  if (!a || !range) return { detected: false, direction: 'NONE', strength: 0, index: i };
  const bodyRatio = body / range;
  const rangeVsAtr = range / a;
  const strong = bodyRatio > 0.6 && rangeVsAtr > 1.4;
  if (!strong) return { detected: false, direction: 'NONE', strength: 0, index: i };
  return {
    detected: true,
    direction: c.close > c.open ? 'UP' : 'DOWN',
    strength: Math.min(1, (bodyRatio * 0.5 + Math.min(rangeVsAtr / 3, 1) * 0.5)),
    index: i,
  };
}
