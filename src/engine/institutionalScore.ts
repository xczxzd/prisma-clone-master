// Institutional Score — pesos exatos do prompt master
export interface ScoreInputs {
  htfAligned: boolean;       // 25
  sweepConfirmed: boolean;   // 20
  atrExpansion: boolean;     // 15
  oiAligned: boolean;        // 10
  fundingExtreme: boolean;   // 10
  volumeInstitutional: boolean; // 10
  fvgValid: boolean;         // 5
  displacement: boolean;     // 5
}

export interface ScoreResult {
  score: number;
  grade: 'WEAK' | 'MEDIUM' | 'STRONG' | 'PREMIUM';
  factors: { name: string; weight: number; hit: boolean }[];
}

const WEIGHTS: Array<{ key: keyof ScoreInputs; weight: number; name: string }> = [
  { key: 'htfAligned',           weight: 25, name: 'HTF alinhado (4H+1H)' },
  { key: 'sweepConfirmed',       weight: 20, name: 'Liquidity Sweep' },
  { key: 'atrExpansion',         weight: 15, name: 'ATR Expansion' },
  { key: 'oiAligned',            weight: 10, name: 'Open Interest alinhado' },
  { key: 'fundingExtreme',       weight: 10, name: 'Funding extremo' },
  { key: 'volumeInstitutional',  weight: 10, name: 'Volume institucional' },
  { key: 'fvgValid',             weight: 5,  name: 'FVG válido' },
  { key: 'displacement',         weight: 5,  name: 'Displacement' },
];

export function computeInstitutionalScore(inputs: ScoreInputs): ScoreResult {
  let score = 0;
  const factors = WEIGHTS.map(w => {
    const hit = !!inputs[w.key];
    if (hit) score += w.weight;
    return { name: w.name, weight: w.weight, hit };
  });
  const grade: ScoreResult['grade'] =
    score >= 85 ? 'PREMIUM' : score >= 70 ? 'STRONG' : score >= 50 ? 'MEDIUM' : 'WEAK';
  return { score, grade, factors };
}
