// Confluence Engine: une todos os engines puros em um veredicto institucional.
import type { FCandle, OIPoint, FundingPoint } from '@/market/binanceFutures';
import { getHTFBias, allowedDirection } from '@/engine/htfBias';
import { detectRegime } from '@/engine/regimeEngine';
import { detectDisplacement } from '@/engine/displacement';
import { atr, isExpansion } from '@/engine/atrEngine';
import { nearestUnfilledFVG } from '@/engine/fvgEngine';
import { detectSweep } from '@/liquidity/sweepDetector';
import { computeInstitutionalScore } from '@/engine/institutionalScore';
import { analyzeStructure } from '@/engine/marketStructure';

export interface ConfluenceVerdict {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'NONE';
  score: number;
  grade: 'WEAK' | 'MEDIUM' | 'STRONG' | 'PREMIUM';
  regime: string;
  tradable: boolean;
  reason: string[];
  factors: { name: string; weight: number; hit: boolean }[];
  context: {
    price: number;
    atr: number;
    htf4h: string;
    htf1h: string;
    structure: string;
    sweep: { dir: 'BULL' | 'BEAR' | null; rej: number };
    fvg?: { type: 'BULL' | 'BEAR'; top: number; bottom: number };
    oiChangePct?: number;
    funding?: number;
  };
}

export interface ConfluenceInput {
  symbol: string;
  h4: FCandle[];
  h1: FCandle[];
  m15: FCandle[];
  m5?: FCandle[];
  oi?: OIPoint[];
  funding?: FundingPoint[];
}

export function evaluateConfluence(inp: ConfluenceInput): ConfluenceVerdict {
  const reason: string[] = [];
  const h4Bias = getHTFBias(inp.h4);
  const h1Bias = getHTFBias(inp.h1);
  const allowed = allowedDirection(h4Bias, h1Bias);

  const regime = detectRegime(inp.m15);
  const struct = analyzeStructure(inp.m15);
  const sweep = detectSweep(inp.m15);
  const disp = detectDisplacement(inp.m15);
  const a = atr(inp.m15, 14);
  const expansion = isExpansion(inp.m15);
  const last = inp.m15[inp.m15.length - 1];

  // Direção candidata
  let direction: 'LONG' | 'SHORT' | 'NONE' = 'NONE';
  if (sweep.detected && sweep.direction === 'BULL') direction = 'LONG';
  else if (sweep.detected && sweep.direction === 'BEAR') direction = 'SHORT';
  else if (disp.detected && disp.direction === 'UP') direction = 'LONG';
  else if (disp.detected && disp.direction === 'DOWN') direction = 'SHORT';
  else if (struct.bos === 'BULL') direction = 'LONG';
  else if (struct.bos === 'BEAR') direction = 'SHORT';

  // Anti-conflito HTF
  if (allowed !== 'NONE' && direction !== 'NONE' && direction !== allowed) {
    reason.push(`Bloqueado: ${direction} contra HTF ${allowed}`);
    direction = 'NONE';
  }
  if (allowed === 'NONE' && direction !== 'NONE') {
    reason.push('HTF 4H/1H não alinhados — operando sem viés institucional');
  }

  // OI / Funding
  const oiArr = inp.oi ?? [];
  let oiChangePct = 0;
  if (oiArr.length >= 5) {
    const a0 = oiArr[oiArr.length - 5].sumOpenInterest;
    const a1 = oiArr[oiArr.length - 1].sumOpenInterest;
    if (a0) oiChangePct = ((a1 - a0) / a0) * 100;
  }
  const fundingNow = inp.funding?.[inp.funding.length - 1]?.fundingRate ?? 0;
  const fundingExtreme = Math.abs(fundingNow) > 0.0005; // 0.05%

  // FVG
  const fvgDir = direction === 'LONG' ? 'BULL' : direction === 'SHORT' ? 'BEAR' : null;
  const fvg = fvgDir ? nearestUnfilledFVG(inp.m15, fvgDir) : null;

  // Volume institucional: candle atual > média*1.8
  const vols = inp.m15.slice(-20).map(c => c.volume);
  const meanVol = vols.reduce((a, b) => a + b, 0) / vols.length;
  const volInst = last.volume > meanVol * 1.8;

  // OI alinhado: LONG precisa OI subindo, SHORT idem (interesse novo)
  const oiAligned = direction === 'LONG' ? oiChangePct > 0.5 :
                    direction === 'SHORT' ? oiChangePct > 0.5 : false;

  const inputs = {
    htfAligned: allowed !== 'NONE' && direction === allowed,
    sweepConfirmed: sweep.detected && sweep.rejectionStrength > 0.4,
    atrExpansion: expansion,
    oiAligned,
    fundingExtreme,
    volumeInstitutional: volInst,
    fvgValid: !!fvg,
    displacement: disp.detected,
  };
  const score = computeInstitutionalScore(inputs);

  if (!regime.tradable) reason.push(`Regime ${regime.regime} não operável`);
  if (sweep.detected) reason.push(`Sweep ${sweep.direction} rej=${sweep.rejectionStrength.toFixed(2)}`);
  if (disp.detected) reason.push(`Displacement ${disp.direction}`);
  if (struct.bos) reason.push(`BOS ${struct.bos}`);
  if (struct.choch) reason.push(`CHOCH ${struct.choch}`);
  if (fundingExtreme) reason.push(`Funding ${(fundingNow * 100).toFixed(3)}%`);

  return {
    symbol: inp.symbol,
    direction,
    score: score.score,
    grade: score.grade,
    regime: regime.regime,
    tradable: regime.tradable && direction !== 'NONE',
    reason,
    factors: score.factors,
    context: {
      price: last.close,
      atr: a,
      htf4h: h4Bias.bias,
      htf1h: h1Bias.bias,
      structure: struct.trend,
      sweep: { dir: sweep.direction, rej: sweep.rejectionStrength },
      fvg: fvg ? { type: fvg.type, top: fvg.top, bottom: fvg.bottom } : undefined,
      oiChangePct,
      funding: fundingNow,
    },
  };
}
