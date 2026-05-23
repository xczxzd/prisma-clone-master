// Imbalance: desequilíbrios significativos buy vs sell por bucket.
import type { DeltaBucket } from './deltaEngine';

export interface ImbalanceEvent {
  bucket: DeltaBucket;
  side: 'BUY' | 'SELL';
  ratio: number;
  severity: 'MEDIUM' | 'STRONG' | 'EXTREME';
}

export function detectImbalances(buckets: DeltaBucket[], threshold = 3): ImbalanceEvent[] {
  const out: ImbalanceEvent[] = [];
  for (const b of buckets) {
    const total = b.buyVol + b.sellVol;
    if (total === 0) continue;
    const big = Math.max(b.buyVol, b.sellVol);
    const small = Math.min(b.buyVol, b.sellVol);
    const ratio = small === 0 ? big : big / small;
    if (ratio >= threshold) {
      const side = b.buyVol > b.sellVol ? 'BUY' : 'SELL';
      let severity: ImbalanceEvent['severity'] = 'MEDIUM';
      if (ratio >= 10) severity = 'EXTREME';
      else if (ratio >= 5) severity = 'STRONG';
      out.push({ bucket: b, side, ratio, severity });
    }
  }
  return out;
}
