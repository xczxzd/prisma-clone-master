// Hook que consome WS aggTrade + forceOrder e expõe métricas realtime de orderflow / whales / liquidações.
import { useEffect, useRef, useState } from 'react';
import { subscribeAggTrade, subscribeForceOrder, type AggTrade, type ForceOrder } from '@/realtime/streamManager';
import { DeltaEngine } from '@/orderflow/deltaEngine';
import { aggressionFromTrades, type AggressionStats } from '@/orderflow/aggression';
import { detectImbalances, type ImbalanceEvent } from '@/orderflow/imbalance';
import { scanWhales, type WhaleHit } from '@/engine/whaleEngine';

export interface RealtimeFlow {
  symbol: string;
  lastPrice: number;
  cumDelta: number;
  deltaWindow: number;
  aggression: AggressionStats | null;
  imbalances: ImbalanceEvent[];
  whales: WhaleHit[];
  liquidations: ForceOrder[];
  tradesPerSec: number;
  lastUpdate: number;
}

const TRADE_BUFFER = 2000;
const WHALE_MIN_USD = 100_000;

export function useRealtimeFlow(symbol: string | null) {
  const [state, setState] = useState<RealtimeFlow | null>(null);
  const tradesRef = useRef<AggTrade[]>([]);
  const liqRef = useRef<ForceOrder[]>([]);
  const engineRef = useRef<DeltaEngine>(new DeltaEngine(1000, 600));
  const symbolRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);
  const tickWindowStart = useRef(Date.now());

  useEffect(() => {
    if (!symbol) return;
    // reset
    tradesRef.current = [];
    liqRef.current = [];
    engineRef.current = new DeltaEngine(1000, 600);
    symbolRef.current = symbol;
    tickCountRef.current = 0;
    tickWindowStart.current = Date.now();

    const offTrade = subscribeAggTrade(symbol, (t) => {
      tradesRef.current.push(t);
      if (tradesRef.current.length > TRADE_BUFFER) tradesRef.current.shift();
      engineRef.current.push(t);
      tickCountRef.current++;
    });
    const offLiq = subscribeForceOrder(symbol, (f) => {
      liqRef.current.unshift(f);
      if (liqRef.current.length > 50) liqRef.current.pop();
    });

    intervalRef.current = window.setInterval(() => {
      const trades = tradesRef.current;
      if (trades.length === 0) {
        setState({
          symbol, lastPrice: 0, cumDelta: 0, deltaWindow: 0,
          aggression: null, imbalances: [], whales: [], liquidations: liqRef.current.slice(0, 10),
          tradesPerSec: 0, lastUpdate: Date.now(),
        });
        return;
      }
      const recent = trades.slice(-500);
      const ag = aggressionFromTrades(recent);
      const buckets = engineRef.current.getBuckets();
      const imb = detectImbalances(buckets.slice(-60), 3);
      const whaleStats = scanWhales(trades, WHALE_MIN_USD);
      const elapsed = Math.max(1, (Date.now() - tickWindowStart.current) / 1000);
      const tps = tickCountRef.current / elapsed;
      // Resetar janela a cada 30s
      if (elapsed > 30) { tickCountRef.current = 0; tickWindowStart.current = Date.now(); }

      setState({
        symbol,
        lastPrice: trades[trades.length - 1].price,
        cumDelta: engineRef.current.cumulativeDelta(),
        deltaWindow: engineRef.current.windowDelta(60_000),
        aggression: ag,
        imbalances: imb.slice(-8),
        whales: whaleStats.hits.slice(-12).reverse(),
        liquidations: liqRef.current.slice(0, 10),
        tradesPerSec: tps,
        lastUpdate: Date.now(),
      });
    }, 1000);

    return () => {
      offTrade();
      offLiq();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol]);

  return state;
}
