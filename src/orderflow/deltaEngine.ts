// Delta Engine: acumula buy/sell delta a partir de aggTrades em janelas configuráveis.
import type { AggTrade } from '@/realtime/streamManager';

export interface DeltaBucket {
  startMs: number;
  endMs: number;
  buyVol: number;
  sellVol: number;
  delta: number;          // buy - sell
  cumDelta: number;       // delta acumulado desde início
  trades: number;
  vwap: number;
}

export class DeltaEngine {
  private bucketMs: number;
  private buckets: DeltaBucket[] = [];
  private cum = 0;
  private maxBuckets: number;
  private notional = 0;
  private vol = 0;

  constructor(bucketMs = 1000, maxBuckets = 600) {
    this.bucketMs = bucketMs;
    this.maxBuckets = maxBuckets;
  }

  push(t: AggTrade) {
    const bucketStart = Math.floor(t.tradeTime / this.bucketMs) * this.bucketMs;
    let last = this.buckets[this.buckets.length - 1];
    if (!last || last.startMs !== bucketStart) {
      last = {
        startMs: bucketStart, endMs: bucketStart + this.bucketMs,
        buyVol: 0, sellVol: 0, delta: 0, cumDelta: this.cum,
        trades: 0, vwap: t.price,
      };
      this.buckets.push(last);
      if (this.buckets.length > this.maxBuckets) this.buckets.shift();
    }
    // isBuyerMaker = true → trade SELL agressivo (taker vendeu)
    const buy = !t.isBuyerMaker ? t.qty : 0;
    const sell = t.isBuyerMaker ? t.qty : 0;
    last.buyVol += buy;
    last.sellVol += sell;
    last.delta = last.buyVol - last.sellVol;
    last.trades++;
    this.notional += t.price * t.qty;
    this.vol += t.qty;
    last.vwap = this.vol > 0 ? this.notional / this.vol : t.price;
    this.cum += (buy - sell);
    last.cumDelta = this.cum;
  }

  getBuckets(): DeltaBucket[] { return this.buckets.slice(); }
  cumulativeDelta(): number { return this.cum; }
  lastBucket(): DeltaBucket | null { return this.buckets[this.buckets.length - 1] ?? null; }

  /** Delta da janela mais recente (ms). */
  windowDelta(windowMs: number): number {
    const now = Date.now();
    return this.buckets
      .filter(b => b.endMs >= now - windowMs)
      .reduce((acc, b) => acc + b.delta, 0);
  }
}
