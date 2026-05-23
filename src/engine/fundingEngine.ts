// Funding Engine: detecção de funding extremos e contrarian signals.
import type { FundingPoint } from '@/market/binanceFutures';

export interface FundingAnalysis {
  current: number;
  currentPct: number;
  avg8h: number;
  extreme: boolean;
  bias: 'LONG_HEAVY' | 'SHORT_HEAVY' | 'NEUTRAL';
  contrarian: 'LONG' | 'SHORT' | 'NONE';
  interpretation: string;
}

const EXTREME_HIGH = 0.0005;   // 0.05%
const EXTREME_VERY = 0.001;    // 0.10%

export function analyzeFunding(funding: FundingPoint[]): FundingAnalysis {
  const last = funding[funding.length - 1]?.fundingRate ?? 0;
  const avg = funding.length ? funding.reduce((a, f) => a + f.fundingRate, 0) / funding.length : 0;
  const abs = Math.abs(last);
  const extreme = abs >= EXTREME_HIGH;
  let bias: FundingAnalysis['bias'] = 'NEUTRAL';
  if (last >= EXTREME_HIGH) bias = 'LONG_HEAVY';
  else if (last <= -EXTREME_HIGH) bias = 'SHORT_HEAVY';

  // Contrarian: funding muito positivo → muitos longs pagando → mercado pode reverter para baixo
  let contrarian: FundingAnalysis['contrarian'] = 'NONE';
  if (last >= EXTREME_VERY) contrarian = 'SHORT';
  else if (last <= -EXTREME_VERY) contrarian = 'LONG';

  const interpretation = extreme
    ? `Funding extremo ${(last * 100).toFixed(3)}% — ${bias === 'LONG_HEAVY' ? 'longs sobrecarregados' : 'shorts sobrecarregados'}`
    : `Funding neutro ${(last * 100).toFixed(4)}%`;

  return { current: last, currentPct: last * 100, avg8h: avg, extreme, bias, contrarian, interpretation };
}
