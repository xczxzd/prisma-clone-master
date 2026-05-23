// Stream manager: subscribe helpers por símbolo/timeframe.
import { wsManager } from './websocketManager';
import { bus, EV } from '@/core/eventBus';

export interface AggTrade {
  symbol: string; price: number; qty: number; quote: number;
  isBuyerMaker: boolean; tradeTime: number; tradeId: number;
}

export interface KlineTick {
  symbol: string; interval: string;
  openTime: number; closeTime: number;
  open: number; high: number; low: number; close: number;
  volume: number; quoteVolume: number;
  trades: number; takerBuyVolume: number; takerBuyQuote: number;
  isClosed: boolean;
}

export interface ForceOrder {
  symbol: string; side: 'BUY' | 'SELL';
  price: number; origQty: number; executedQty: number;
  averagePrice: number; orderStatus: string; tradeTime: number;
}

export function subscribeAggTrade(symbol: string, cb: (t: AggTrade) => void) {
  const stream = `${symbol.toLowerCase()}@aggTrade`;
  return wsManager.subscribe(stream, (d) => {
    const t: AggTrade = {
      symbol: d.s, price: +d.p, qty: +d.q, quote: +d.p * +d.q,
      isBuyerMaker: !!d.m, tradeTime: d.T, tradeId: d.a,
    };
    cb(t);
    bus.emit(EV.TICK, t);
  });
}

export function subscribeKline(symbol: string, interval: string, cb: (k: KlineTick) => void) {
  const stream = `${symbol.toLowerCase()}@kline_${interval}`;
  return wsManager.subscribe(stream, (d) => {
    const k = d.k;
    const tick: KlineTick = {
      symbol: d.s, interval: k.i,
      openTime: k.t, closeTime: k.T,
      open: +k.o, high: +k.h, low: +k.l, close: +k.c,
      volume: +k.v, quoteVolume: +k.q,
      trades: k.n, takerBuyVolume: +k.V, takerBuyQuote: +k.Q,
      isClosed: !!k.x,
    };
    cb(tick);
    bus.emit(EV.CANDLE, tick);
  });
}

export function subscribeForceOrder(symbol: string, cb: (f: ForceOrder) => void) {
  const stream = `${symbol.toLowerCase()}@forceOrder`;
  return wsManager.subscribe(stream, (d) => {
    const o = d.o;
    const f: ForceOrder = {
      symbol: o.s, side: o.S, price: +o.p, origQty: +o.q,
      executedQty: +o.z, averagePrice: +o.ap, orderStatus: o.X, tradeTime: o.T,
    };
    cb(f);
    bus.emit('liquidation', f);
  });
}

export function subscribeMarkPrice(symbol: string, cb: (p: { price: number; fundingRate: number; nextFundingTime: number }) => void) {
  const stream = `${symbol.toLowerCase()}@markPrice@1s`;
  return wsManager.subscribe(stream, (d) => {
    cb({ price: +d.p, fundingRate: +d.r, nextFundingTime: d.T });
  });
}
