// HTF Bias: combina EMA50/EMA200 + estrutura
import type { FCandle } from '@/market/binanceFutures';
import { analyzeStructure } from './marketStructure';

export type Bias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

function ema(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] ?? 0;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export interface HTFBiasResult {
  bias: Bias;
  ema50: number;
  ema200: number;
  trend: 'BULL' | 'BEAR' | 'RANGE';
  strength: number; // 0..1
}

export function getHTFBias(candles: FCandle[]): HTFBiasResult {
  if (candles.length < 200) return { bias: 'NEUTRAL', ema50: 0, ema200: 0, trend: 'RANGE', strength: 0 };
  const closes = candles.map(c => c.close);
  const e50 = ema(closes, 50);
  const e200 = ema(closes, 200);
  const struct = analyzeStructure(candles);
  const price = closes[closes.length - 1];

  let bias: Bias = 'NEUTRAL';
  let strength = 0;
  if (price > e50 && e50 > e200 && struct.trend === 'BULL') { bias = 'BULLISH'; strength = 1; }
  else if (price > e50 && e50 > e200) { bias = 'BULLISH'; strength = 0.7; }
  else if (price < e50 && e50 < e200 && struct.trend === 'BEAR') { bias = 'BEARISH'; strength = 1; }
  else if (price < e50 && e50 < e200) { bias = 'BEARISH'; strength = 0.7; }
  else strength = 0.3;

  return { bias, ema50: e50, ema200: e200, trend: struct.trend, strength };
}

// Anti-conflito: dadas H4 e H1, retorna direção permitida.
export function allowedDirection(h4: HTFBiasResult, h1: HTFBiasResult): 'LONG' | 'SHORT' | 'NONE' {
  if (h4.bias === 'BULLISH' && h1.bias === 'BULLISH') return 'LONG';
  if (h4.bias === 'BEARISH' && h1.bias === 'BEARISH') return 'SHORT';
  // H4 manda contra H1 neutro
  if (h4.bias === 'BULLISH' && h1.bias === 'NEUTRAL') return 'LONG';
  if (h4.bias === 'BEARISH' && h1.bias === 'NEUTRAL') return 'SHORT';
  return 'NONE';
}
