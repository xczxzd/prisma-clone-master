import { useEffect, useState } from 'react';
import { fetchTicker, fetchTickers, fetchKlines, calcWilliamsR, detectWMPattern, calcVolumeProfile, type BinanceTicker, type Kline } from '@/services/binanceApi';

// Hook: ticker único com auto-refresh
export function usePrice(symbol: string, intervalMs = 5000) {
  const [ticker, setTicker] = useState<BinanceTicker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const t = await fetchTicker(symbol);
      if (alive) {
        setTicker(t);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [symbol, intervalMs]);

  return { ticker, loading };
}

// Hook: múltiplos tickers (batch)
export function usePrices(symbols: string[], intervalMs = 10000) {
  const [tickers, setTickers] = useState<Record<string, BinanceTicker>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbols.length) return;
    let alive = true;
    const key = symbols.join(',');
    const load = async () => {
      const t = await fetchTickers(symbols);
      if (alive) {
        setTickers(t);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [symbols.join(','), intervalMs]);

  return { tickers, loading };
}

// Hook: klines + williamsR + W/M + volume profile (análise completa)
export function useMarketAnalysis(symbol: string, interval = '15m') {
  const [data, setData] = useState<{
    klines: Kline[];
    williamsR: number;
    pattern: 'W' | 'M' | 'NEUTRAL';
    zone: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
    volumeProfile: ReturnType<typeof calcVolumeProfile>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const klines = await fetchKlines(symbol, interval, 100);
      if (!alive || !klines.length) { setLoading(false); return; }
      const wr = calcWilliamsR(klines, 7);
      const pattern = detectWMPattern(klines, 7);
      const zone: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' =
        wr > -20 ? 'OVERBOUGHT' : wr < -80 ? 'OVERSOLD' : 'NEUTRAL';
      const volumeProfile = calcVolumeProfile(klines);
      setData({ klines, williamsR: wr, pattern, zone, volumeProfile });
      setLoading(false);
    };
    load();
    const id = setInterval(load, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [symbol, interval]);

  return { data, loading };
}
