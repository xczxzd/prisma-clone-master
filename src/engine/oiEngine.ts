// OI Engine: análise de Open Interest realtime + divergência preço/OI.
import type { OIPoint, FCandle } from '@/market/binanceFutures';

export interface OIAnalysis {
  current: number;
  changePct: number;        // change % na janela
  trend: 'RISING' | 'FALLING' | 'FLAT';
  divergence: 'NONE' | 'BULL_TRAP' | 'BEAR_TRAP' | 'CONFIRMED_LONG' | 'CONFIRMED_SHORT';
  interpretation: string;
}

export function analyzeOI(oi: OIPoint[], candles: FCandle[]): OIAnalysis {
  if (oi.length < 2 || candles.length < 2) {
    return { current: oi[oi.length - 1]?.sumOpenInterest ?? 0, changePct: 0, trend: 'FLAT', divergence: 'NONE', interpretation: 'Sem dados suficientes' };
  }
  const first = oi[0].sumOpenInterest;
  const last = oi[oi.length - 1].sumOpenInterest;
  const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
  const trend: OIAnalysis['trend'] = changePct > 0.5 ? 'RISING' : changePct < -0.5 ? 'FALLING' : 'FLAT';

  const priceFirst = candles[0].close;
  const priceLast = candles[candles.length - 1].close;
  const priceChangePct = ((priceLast - priceFirst) / priceFirst) * 100;

  let divergence: OIAnalysis['divergence'] = 'NONE';
  let interpretation = 'Preço e OI alinhados';
  if (priceChangePct > 0.3 && trend === 'RISING') { divergence = 'CONFIRMED_LONG'; interpretation = 'Preço sobe com OI subindo — novo dinheiro long'; }
  else if (priceChangePct < -0.3 && trend === 'RISING') { divergence = 'CONFIRMED_SHORT'; interpretation = 'Preço cai com OI subindo — novo dinheiro short'; }
  else if (priceChangePct > 0.3 && trend === 'FALLING') { divergence = 'BULL_TRAP'; interpretation = 'Preço sobe mas OI caindo — short covering, possível bull trap'; }
  else if (priceChangePct < -0.3 && trend === 'FALLING') { divergence = 'BEAR_TRAP'; interpretation = 'Preço cai mas OI caindo — long liquidations, possível bear trap'; }

  return { current: last, changePct, trend, divergence, interpretation };
}
