// Serviço de preços reais Binance (API pública, sem chave)
// Endpoint: https://api.binance.com/api/v3/ticker/24hr

export interface BinanceTicker {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;       // base asset volume (ex: BTC)
  quoteVolume: number;  // quote asset volume (USDT) - este é o "volume" em USD
  openPrice: number;
  count: number;        // número de trades
}

const BASE = 'https://api.binance.com/api/v3';

export async function fetchTicker(symbol: string): Promise<BinanceTicker | null> {
  try {
    const res = await fetch(`${BASE}/ticker/24hr?symbol=${symbol}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    return {
      symbol: d.symbol,
      lastPrice: parseFloat(d.lastPrice),
      priceChangePercent: parseFloat(d.priceChangePercent),
      highPrice: parseFloat(d.highPrice),
      lowPrice: parseFloat(d.lowPrice),
      volume: parseFloat(d.volume),
      quoteVolume: parseFloat(d.quoteVolume),
      openPrice: parseFloat(d.openPrice),
      count: parseInt(d.count, 10),
    };
  } catch (e) {
    console.error('[binance] fetchTicker error', symbol, e);
    return null;
  }
}

export async function fetchTickers(symbols: string[]): Promise<Record<string, BinanceTicker>> {
  try {
    const param = encodeURIComponent(JSON.stringify(symbols));
    const res = await fetch(`${BASE}/ticker/24hr?symbols=${param}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arr = await res.json();
    const map: Record<string, BinanceTicker> = {};
    for (const d of arr) {
      map[d.symbol] = {
        symbol: d.symbol,
        lastPrice: parseFloat(d.lastPrice),
        priceChangePercent: parseFloat(d.priceChangePercent),
        highPrice: parseFloat(d.highPrice),
        lowPrice: parseFloat(d.lowPrice),
        volume: parseFloat(d.volume),
        quoteVolume: parseFloat(d.quoteVolume),
        openPrice: parseFloat(d.openPrice),
        count: parseInt(d.count, 10),
      };
    }
    return map;
  } catch (e) {
    console.error('[binance] fetchTickers error', e);
    return {};
  }
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
}

export async function fetchKlines(symbol: string, interval = '15m', limit = 100): Promise<Kline[]> {
  try {
    const res = await fetch(`${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arr = await res.json();
    return arr.map((k: any[]) => ({
      openTime: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      closeTime: k[6],
      quoteVolume: parseFloat(k[7]),
      trades: parseInt(k[8], 10),
    }));
  } catch (e) {
    console.error('[binance] fetchKlines error', symbol, e);
    return [];
  }
}

// Williams %R calculado a partir dos klines reais
export function calcWilliamsR(klines: Kline[], period = 7): number {
  if (klines.length < period) return -50;
  const recent = klines.slice(-period);
  const highestHigh = Math.max(...recent.map(k => k.high));
  const lowestLow = Math.min(...recent.map(k => k.low));
  const close = recent[recent.length - 1].close;
  if (highestHigh === lowestLow) return -50;
  return ((highestHigh - close) / (highestHigh - lowestLow)) * -100;
}

// Detecta padrão W (fundo duplo na zona sobrevendida) ou M (topo duplo na zona sobrecomprada)
export function detectWMPattern(klines: Kline[], period = 7): 'W' | 'M' | 'NEUTRAL' {
  if (klines.length < period * 3) return 'NEUTRAL';
  const wrValues: number[] = [];
  for (let i = period; i <= klines.length; i++) {
    wrValues.push(calcWilliamsR(klines.slice(0, i), period));
  }
  const last = wrValues.slice(-15);
  if (last.length < 10) return 'NEUTRAL';

  // padrão W: dois fundos abaixo de -80 com pico no meio acima de -50
  const lows = last.filter(v => v < -80).length;
  const highs = last.filter(v => v > -20).length;
  const mid = last[Math.floor(last.length / 2)];

  if (lows >= 2 && mid > -60 && last[last.length - 1] > -70) return 'W';
  if (highs >= 2 && mid < -40 && last[last.length - 1] < -30) return 'M';
  return 'NEUTRAL';
}

// Volume profile simplificado: agrupa volume por níveis de preço (POC = ponto de maior volume)
export function calcVolumeProfile(klines: Kline[], buckets = 20) {
  if (!klines.length) return { poc: 0, vah: 0, val: 0, levels: [] };
  const high = Math.max(...klines.map(k => k.high));
  const low = Math.min(...klines.map(k => k.low));
  const step = (high - low) / buckets;
  const levels = Array.from({ length: buckets }, (_, i) => ({
    price: low + step * i + step / 2,
    volume: 0,
  }));
  for (const k of klines) {
    const mid = (k.high + k.low) / 2;
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor((mid - low) / step)));
    levels[idx].volume += k.quoteVolume;
  }
  const sorted = [...levels].sort((a, b) => b.volume - a.volume);
  const poc = sorted[0].price;
  // Value Area High/Low (70% volume aproximado)
  const total = levels.reduce((s, l) => s + l.volume, 0);
  let acc = 0;
  const inVA = new Set<number>();
  for (const l of sorted) {
    if (acc >= total * 0.7) break;
    inVA.add(l.price);
    acc += l.volume;
  }
  const vaPrices = Array.from(inVA);
  return {
    poc,
    vah: Math.max(...vaPrices),
    val: Math.min(...vaPrices),
    levels,
  };
}
