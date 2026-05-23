// Absorption: detecta absorção institucional — grande volume com pouco movimento de preço.
import type { AggTrade } from '@/realtime/streamManager';

export interface AbsorptionEvent {
  side: 'BID' | 'ASK';
  startMs: number;
  endMs: number;
  volume: number;
  priceRange: number;
  strength: number; // volume / priceRange (normalizado)
}

/**
 * Detecta absorção em janelas de ~5s: muita quantidade negociada,
 * mas preço variou pouco — sinal de iceberg/parede sendo comida.
 */
export function detectAbsorption(trades: AggTrade[], windowMs = 5000, minVolume = 0): AbsorptionEvent[] {
  if (trades.length < 20) return [];
  const events: AbsorptionEvent[] = [];
  let bucketStart = trades[0].tradeTime;
  let bucket: AggTrade[] = [];

  const flush = () => {
    if (bucket.length < 10) { bucket = []; return; }
    const vols = bucket.reduce((a, t) => a + t.qty, 0);
    if (vols < minVolume) { bucket = []; return; }
    const prices = bucket.map(t => t.price);
    const range = Math.max(...prices) - Math.min(...prices);
    if (range <= 0) { bucket = []; return; }
    // Razão de absorção: volume/range
    const strength = vols / range;
    // Considera absorção se range < 0.2% do preço médio
    const avg = prices.reduce((a, p) => a + p, 0) / prices.length;
    if (range / avg < 0.002 && vols > 0) {
      const buy = bucket.filter(t => !t.isBuyerMaker).reduce((a, t) => a + t.qty, 0);
      const sell = vols - buy;
      events.push({
        side: buy > sell ? 'BID' : 'ASK',
        startMs: bucket[0].tradeTime,
        endMs: bucket[bucket.length - 1].tradeTime,
        volume: vols, priceRange: range, strength,
      });
    }
    bucket = [];
  };

  for (const t of trades) {
    if (t.tradeTime - bucketStart > windowMs) { flush(); bucketStart = t.tradeTime; }
    bucket.push(t);
  }
  flush();
  return events;
}
