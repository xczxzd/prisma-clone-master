export interface Pair {
  id: string;
  name: string;
  group: string;
}

export interface Signal {
  id: string;
  pair: Pair;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  timeframe: '5m' | '15m' | '1H' | '4H';
  entry: number;
  stopLoss: number;
  takeProfit: {
    level1: number;
    level2: number;
    level3: number;
  };
  timestamp: Date;
  status: 'ATIVO' | 'VITÓRIA' | 'DERROTA' | 'MONITORANDO';
  result?: number;
  bestEntryTime?: string;
  strategyName?: string;
  riskRewardRatio?: string;
  keyFactors?: string[];
}

export type View = 
  | 'Dashboard' 
  | 'Community' 
  | 'TechnicalAnalysis' 
  | 'PriceProjection' 
  | 'WeeklyForecast' 
  | 'EconomicCalendar' 
  | 'NewsFeed' 
  | 'TelegramSettings' 
  | 'SignalHistory' 
  | 'StrategyV3' 
  | 'RiskManagement';

export interface IndicatorStatus {
  name: string;
  value: string;
  status: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'STRONG' | 'WEAK';
  description: string;
}

export interface FibonacciLevel {
  level: string;
  price: number;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  recommendation: string;
  affectedAssets: string[];
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface CommunityTrade {
  id: string;
  user: {
    name: string;
    avatarUrl: string;
  };
  pair: Pair;
  direction: 'LONG' | 'SHORT';
  profit: number;
  timestamp: Date;
  likes: number;
  comments: number;
}

export interface TopTrader {
  rank: number;
  name: string;
  avatarUrl: string;
  weeklyProfit: number;
}
