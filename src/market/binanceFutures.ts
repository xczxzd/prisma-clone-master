// Cliente Binance Futures (fapi) — somente dados reais. Sem mock.
const FAPI = 'https://fapi.binance.com';

export interface FCandle {
  openTime: number;
  open: number; high: number; low: number; close: number;
  volume: number; quoteVolume: number;
  closeTime: number;
  takerBuyVolume: number; takerBuyQuote: number;
  trades: number;
}

export interface FTicker24h {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  highPrice: number;
  lowPrice: number;
}

export interface OIPoint { timestamp: number; sumOpenInterest: number; sumOpenInterestValue: number }
export interface FundingPoint { symbol: string; fundingRate: number; fundingTime: number }
export interface LSRPoint { symbol: string; longShortRatio: number; longAccount: number; shortAccount: number; timestamp: number }

async function safeJson(url: string, init?: RequestInit) {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`fapi ${r.status}: ${url}`);
  return r.json();
}

export async function getKlines(symbol: string, interval: string, limit = 200): Promise<FCandle[]> {
  const data = await safeJson(`${FAPI}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  return (data as any[]).map(k => ({
    openTime: k[0], open: +k[1], high: +k[2], low: +k[3], close: +k[4],
    volume: +k[5], closeTime: k[6], quoteVolume: +k[7],
    trades: k[8], takerBuyVolume: +k[9], takerBuyQuote: +k[10],
  }));
}

export async function getTicker24h(symbol: string): Promise<FTicker24h> {
  const t = await safeJson(`${FAPI}/fapi/v1/ticker/24hr?symbol=${symbol}`);
  return {
    symbol: t.symbol,
    lastPrice: +t.lastPrice,
    priceChangePercent: +t.priceChangePercent,
    volume: +t.volume,
    quoteVolume: +t.quoteVolume,
    highPrice: +t.highPrice,
    lowPrice: +t.lowPrice,
  };
}

export async function getAllTickers24h(): Promise<FTicker24h[]> {
  const arr = await safeJson(`${FAPI}/fapi/v1/ticker/24hr`);
  return (arr as any[]).map(t => ({
    symbol: t.symbol,
    lastPrice: +t.lastPrice,
    priceChangePercent: +t.priceChangePercent,
    volume: +t.volume,
    quoteVolume: +t.quoteVolume,
    highPrice: +t.highPrice,
    lowPrice: +t.lowPrice,
  }));
}

export async function getOpenInterestHist(symbol: string, period = '5m', limit = 30): Promise<OIPoint[]> {
  const arr = await safeJson(`${FAPI}/futures/data/openInterestHist?symbol=${symbol}&period=${period}&limit=${limit}`);
  return (arr as any[]).map(o => ({
    timestamp: o.timestamp,
    sumOpenInterest: +o.sumOpenInterest,
    sumOpenInterestValue: +o.sumOpenInterestValue,
  }));
}

export async function getFundingRate(symbol: string, limit = 5): Promise<FundingPoint[]> {
  const arr = await safeJson(`${FAPI}/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`);
  return (arr as any[]).map(f => ({
    symbol: f.symbol, fundingRate: +f.fundingRate, fundingTime: f.fundingTime,
  }));
}

export async function getLongShortRatio(symbol: string, period = '5m', limit = 10): Promise<LSRPoint[]> {
  const arr = await safeJson(`${FAPI}/futures/data/globalLongShortAccountRatio?symbol=${symbol}&period=${period}&limit=${limit}`);
  return (arr as any[]).map(l => ({
    symbol: l.symbol,
    longShortRatio: +l.longShortRatio,
    longAccount: +l.longAccount,
    shortAccount: +l.shortAccount,
    timestamp: l.timestamp,
  }));
}

export async function getExchangeSymbols(): Promise<string[]> {
  const info = await safeJson(`${FAPI}/fapi/v1/exchangeInfo`);
  return (info.symbols as any[])
    .filter(s => s.status === 'TRADING' && s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT')
    .map(s => s.symbol);
}
