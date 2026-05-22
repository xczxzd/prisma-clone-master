// Signal Pipeline: dado um símbolo, busca dados reais, avalia confluência e emite sinal estruturado.
import { getKlines, getOpenInterestHist, getFundingRate } from '@/market/binanceFutures';
import { evaluateConfluence, type ConfluenceVerdict } from './confluenceEngine';
import { setCandles, setOI, setFunding } from './stateManager';
import { bus, EV } from './eventBus';

export interface InstitutionalSignal {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  timeframe: '15m';
  score: number;
  grade: ConfluenceVerdict['grade'];
  entry: number;
  stopLoss: number;
  tp1: number; tp2: number; tp3: number;
  riskReward: string;
  atr: number;
  reason: string[];
  factors: ConfluenceVerdict['factors'];
  context: ConfluenceVerdict['context'];
  createdAt: number;
}

export interface PipelineOptions {
  minScore?: number;
}

export async function runPipeline(symbol: string, opts: PipelineOptions = {}): Promise<{
  verdict: ConfluenceVerdict;
  signal: InstitutionalSignal | null;
}> {
  const minScore = opts.minScore ?? 80;

  const [h4, h1, m15, oi, funding] = await Promise.all([
    getKlines(symbol, '4h', 250),
    getKlines(symbol, '1h', 250),
    getKlines(symbol, '15m', 200),
    getOpenInterestHist(symbol, '5m', 30).catch(() => []),
    getFundingRate(symbol, 5).catch(() => []),
  ]);

  setCandles(symbol, '4h', h4);
  setCandles(symbol, '1h', h1);
  setCandles(symbol, '15m', m15);
  setOI(symbol, oi);
  setFunding(symbol, funding);

  const verdict = evaluateConfluence({ symbol, h4, h1, m15, oi, funding });

  if (!verdict.tradable || verdict.direction === 'NONE' || verdict.score < minScore) {
    return { verdict, signal: null };
  }

  const price = verdict.context.price;
  const a = verdict.context.atr || price * 0.005;
  const dir = verdict.direction;
  const sl = dir === 'LONG' ? price - a * 1.5 : price + a * 1.5;
  const tp1 = dir === 'LONG' ? price + a * 1.5 : price - a * 1.5;
  const tp2 = dir === 'LONG' ? price + a * 3 : price - a * 3;
  const tp3 = dir === 'LONG' ? price + a * 5 : price - a * 5;

  const signal: InstitutionalSignal = {
    id: `sig_${Date.now()}_${symbol}`,
    symbol,
    direction: dir,
    timeframe: '15m',
    score: verdict.score,
    grade: verdict.grade,
    entry: price,
    stopLoss: sl,
    tp1, tp2, tp3,
    riskReward: '1:1.5 / 1:3 / 1:5',
    atr: a,
    reason: verdict.reason,
    factors: verdict.factors,
    context: verdict.context,
    createdAt: Date.now(),
  };

  bus.emit(EV.SIGNAL, signal);
  return { verdict, signal };
}
