// Squeeze Engine: detecta short squeeze / long squeeze a partir de OI + price + funding.
import type { OIPoint, FCandle, FundingPoint } from '@/market/binanceFutures';

export interface SqueezeAnalysis {
  type: 'SHORT_SQUEEZE' | 'LONG_SQUEEZE' | 'NONE';
  probability: number; // 0-100
  reason: string[];
}

export function detectSqueeze(candles: FCandle[], oi: OIPoint[], funding: FundingPoint[]): SqueezeAnalysis {
  if (candles.length < 10 || oi.length < 5) {
    return { type: 'NONE', probability: 0, reason: ['Dados insuficientes'] };
  }
  const last = candles[candles.length - 1].close;
  const prev = candles[candles.length - 10].close;
  const pricePct = ((last - prev) / prev) * 100;

  const oiFirst = oi[0].sumOpenInterest;
  const oiLast = oi[oi.length - 1].sumOpenInterest;
  const oiPct = oiFirst > 0 ? ((oiLast - oiFirst) / oiFirst) * 100 : 0;

  const fundingNow = funding[funding.length - 1]?.fundingRate ?? 0;

  const reason: string[] = [];
  let type: SqueezeAnalysis['type'] = 'NONE';
  let prob = 0;

  // Short squeeze: preço subindo forte + OI caindo (shorts fechando) + funding negativo prévio
  if (pricePct > 1.5 && oiPct < -1) {
    type = 'SHORT_SQUEEZE';
    prob = Math.min(100, Math.abs(pricePct) * 10 + Math.abs(oiPct) * 8);
    reason.push(`Preço +${pricePct.toFixed(2)}%`, `OI ${oiPct.toFixed(2)}%`);
    if (fundingNow < 0) { prob += 10; reason.push(`Funding negativo ${(fundingNow * 100).toFixed(3)}%`); }
  }
  // Long squeeze: preço caindo forte + OI caindo (longs liquidando) + funding positivo prévio
  else if (pricePct < -1.5 && oiPct < -1) {
    type = 'LONG_SQUEEZE';
    prob = Math.min(100, Math.abs(pricePct) * 10 + Math.abs(oiPct) * 8);
    reason.push(`Preço ${pricePct.toFixed(2)}%`, `OI ${oiPct.toFixed(2)}%`);
    if (fundingNow > 0) { prob += 10; reason.push(`Funding positivo ${(fundingNow * 100).toFixed(3)}%`); }
  }

  return { type, probability: Math.min(100, prob), reason };
}
