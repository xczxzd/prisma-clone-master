import React from 'react';
import type { NewsItem } from '@/types';

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'BlackRock aumenta posição em Bitcoin ETF em $500M',
    source: 'Bloomberg',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    sentiment: 'Bullish',
    recommendation: 'Institucionais continuam acumulando. Manter posições longas.',
    affectedAssets: ['BTC', 'ETH'],
  },
  {
    id: '2',
    title: 'SEC adia decisão sobre ETF de Ethereum para Q2 2024',
    source: 'CoinDesk',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    sentiment: 'Neutral',
    recommendation: 'Volatilidade esperada. Aguardar confirmação de tendência.',
    affectedAssets: ['ETH'],
  },
  {
    id: '3',
    title: 'Binance registra maior saída de BTC em 6 meses',
    source: 'Glassnode',
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
    sentiment: 'Bullish',
    recommendation: 'Sinal de acumulação institucional. Baleias movendo para cold storage.',
    affectedAssets: ['BTC', 'BNB'],
  },
  {
    id: '4',
    title: 'Fed mantém taxas de juros, sinaliza possíveis cortes em 2024',
    source: 'Reuters',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    sentiment: 'Bullish',
    recommendation: 'Ambiente favorável para ativos de risco. Considerar aumentar exposição.',
    affectedAssets: ['BTC', 'ETH', 'SOL'],
  },
  {
    id: '5',
    title: 'Solana sofre nova interrupção de rede por 5 horas',
    source: 'The Block',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    sentiment: 'Bearish',
    recommendation: 'Reduzir exposição temporariamente. Aguardar estabilização.',
    affectedAssets: ['SOL'],
  },
];

const SentimentBadge = ({ sentiment }: { sentiment: NewsItem['sentiment'] }) => {
  const colors = {
    Bullish: 'bg-prisma-green/20 text-prisma-green border-prisma-green/30',
    Bearish: 'bg-prisma-red/20 text-prisma-red border-prisma-red/30',
    Neutral: 'bg-prisma-yellow/20 text-prisma-yellow border-prisma-yellow/30',
  };

  const icons = {
    Bullish: '🟢',
    Bearish: '🔴',
    Neutral: '🟡',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[sentiment]}`}>
      {icons[sentiment]} {sentiment}
    </span>
  );
};

const formatTimeAgo = (date: Date): string => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
};

export const NewsFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Feed de Notícias</h2>
          <p className="text-muted-foreground">Análise de sentimento em tempo real</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-3 w-3 rounded-full bg-prisma-green animate-ping"></div>
            <div className="h-2 w-2 rounded-full bg-prisma-green"></div>
          </div>
          <span className="text-sm text-muted-foreground">Atualizado em tempo real</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockNews.map((news) => (
          <div key={news.id} className="prisma-card hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {news.title}
                </h3>
                <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(news.timestamp)}</span>
                </div>
              </div>
              <SentimentBadge sentiment={news.sentiment} />
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 mt-3">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">📊 Análise PRISMA:</span>{' '}
                {news.recommendation}
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-muted-foreground">Ativos afetados:</span>
              {news.affectedAssets.map((asset) => (
                <span
                  key={asset}
                  className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded"
                >
                  {asset}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
