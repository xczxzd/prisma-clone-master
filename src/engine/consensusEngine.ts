// Consensus Engine: gate final que une score institucional + orderflow + whale + squeeze + OI/funding.
import type { ConfluenceVerdict } from '@/core/confluenceEngine';
import type { WhaleStats } from './whaleEngine';
import type { SqueezeAnalysis } from './squeezeEngine';
import type { OIAnalysis } from './oiEngine';
import type { FundingAnalysis } from './fundingEngine';
import type { AggressionStats } from '@/orderflow/aggression';

export interface ConsensusVote {
  factor: string;
  vote: 'LONG' | 'SHORT' | 'NEUTRAL';
  weight: number;
  note?: string;
}

export interface ConsensusResult {
  direction: 'LONG' | 'SHORT' | 'NONE';
  alignment: number;   // 0-100 — % de força alinhada na direção
  votes: ConsensusVote[];
  approved: boolean;
}

export interface ConsensusInput {
  verdict: ConfluenceVerdict;
  whales?: WhaleStats;
  squeeze?: SqueezeAnalysis;
  oi?: OIAnalysis;
  funding?: FundingAnalysis;
  aggression?: AggressionStats;
  cumDelta?: number;
  minScore?: number;
  minAlignment?: number;
}

export function evaluateConsensus(inp: ConsensusInput): ConsensusResult {
  const votes: ConsensusVote[] = [];
  const minScore = inp.minScore ?? 80;
  const minAlignment = inp.minAlignment ?? 65;

  // Voto base: institutional verdict
  votes.push({
    factor: 'Institutional Score',
    vote: inp.verdict.direction === 'NONE' ? 'NEUTRAL' : inp.verdict.direction,
    weight: 35,
    note: `Score ${inp.verdict.score} (${inp.verdict.grade})`,
  });

  // Whales
  if (inp.whales) {
    const dom = inp.whales.dominantSide;
    votes.push({
      factor: 'Whale flow',
      vote: dom === 'BUY' ? 'LONG' : dom === 'SELL' ? 'SHORT' : 'NEUTRAL',
      weight: 15,
      note: `Δ ${(inp.whales.delta / 1000).toFixed(0)}k USD`,
    });
  }

  // Aggression
  if (inp.aggression) {
    const d = inp.aggression.dominantSide;
    votes.push({
      factor: 'Aggression',
      vote: d === 'BUY' ? 'LONG' : d === 'SELL' ? 'SHORT' : 'NEUTRAL',
      weight: 10,
      note: `${(inp.aggression.ratio * 100).toFixed(1)}% buy`,
    });
  }

  // Cumulative Delta
  if (typeof inp.cumDelta === 'number') {
    votes.push({
      factor: 'Cum Delta',
      vote: inp.cumDelta > 0 ? 'LONG' : inp.cumDelta < 0 ? 'SHORT' : 'NEUTRAL',
      weight: 10,
      note: `${inp.cumDelta.toFixed(2)}`,
    });
  }

  // OI
  if (inp.oi) {
    let v: ConsensusVote['vote'] = 'NEUTRAL';
    if (inp.oi.divergence === 'CONFIRMED_LONG') v = 'LONG';
    else if (inp.oi.divergence === 'CONFIRMED_SHORT') v = 'SHORT';
    else if (inp.oi.divergence === 'BULL_TRAP') v = 'SHORT';
    else if (inp.oi.divergence === 'BEAR_TRAP') v = 'LONG';
    votes.push({ factor: 'Open Interest', vote: v, weight: 10, note: inp.oi.interpretation });
  }

  // Funding contrarian
  if (inp.funding && inp.funding.contrarian !== 'NONE') {
    votes.push({
      factor: 'Funding contrarian',
      vote: inp.funding.contrarian,
      weight: 8,
      note: inp.funding.interpretation,
    });
  }

  // Squeeze
  if (inp.squeeze && inp.squeeze.type !== 'NONE') {
    votes.push({
      factor: 'Squeeze',
      vote: inp.squeeze.type === 'SHORT_SQUEEZE' ? 'LONG' : 'SHORT',
      weight: 12,
      note: `${inp.squeeze.type} ${inp.squeeze.probability.toFixed(0)}%`,
    });
  }

  // Alinhamento
  const totalWeight = votes.reduce((a, v) => a + v.weight, 0);
  const longW = votes.filter(v => v.vote === 'LONG').reduce((a, v) => a + v.weight, 0);
  const shortW = votes.filter(v => v.vote === 'SHORT').reduce((a, v) => a + v.weight, 0);
  const direction: ConsensusResult['direction'] = longW > shortW ? 'LONG' : shortW > longW ? 'SHORT' : 'NONE';
  const alignment = totalWeight > 0 ? (Math.max(longW, shortW) / totalWeight) * 100 : 0;

  const approved =
    direction !== 'NONE' &&
    inp.verdict.score >= minScore &&
    alignment >= minAlignment &&
    (inp.verdict.direction === direction || inp.verdict.direction === 'NONE');

  return { direction, alignment, votes, approved };
}
