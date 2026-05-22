// StateManager: cache reativo de candles/OI/funding por (symbol, timeframe).
import type { FCandle, OIPoint, FundingPoint } from '@/market/binanceFutures';
import { bus, EV } from './eventBus';

interface SymbolState {
  candles: Record<string, FCandle[]>; // tf -> klines
  oi?: OIPoint[];
  funding?: FundingPoint[];
  updatedAt: number;
}

const state = new Map<string, SymbolState>();

export function setCandles(symbol: string, tf: string, candles: FCandle[]) {
  const s = state.get(symbol) ?? { candles: {}, updatedAt: 0 };
  s.candles[tf] = candles;
  s.updatedAt = Date.now();
  state.set(symbol, s);
  bus.emit(EV.CANDLE, { symbol, tf });
}

export function getCandles(symbol: string, tf: string): FCandle[] {
  return state.get(symbol)?.candles[tf] ?? [];
}

export function setOI(symbol: string, oi: OIPoint[]) {
  const s = state.get(symbol) ?? { candles: {}, updatedAt: 0 };
  s.oi = oi; state.set(symbol, s);
}
export function getOI(symbol: string): OIPoint[] { return state.get(symbol)?.oi ?? []; }

export function setFunding(symbol: string, f: FundingPoint[]) {
  const s = state.get(symbol) ?? { candles: {}, updatedAt: 0 };
  s.funding = f; state.set(symbol, s);
}
export function getFunding(symbol: string): FundingPoint[] { return state.get(symbol)?.funding ?? []; }

export function getSnapshot(symbol: string) { return state.get(symbol); }
