import React, { useState, useMemo } from 'react';
import type { NewsItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const generateTodayNews = (): NewsItem[] => {
  const today = new Date();
  const todayStr = today.toLocaleDateString('pt-BR');
  const minAgo = (m: number) => new Date(Date.now() - 1000 * 60 * m);

  return [
    { id: '1', title: `[${todayStr}] Fed sinaliza manutenção de taxas — mercado reage positivamente`, source: 'Reuters', timestamp: minAgo(15), sentiment: 'Bullish', recommendation: 'Ambiente favorável para ativos de risco. Baleias acumulando BTC e ETH.', affectedAssets: ['BTC', 'ETH', 'SOL'] },
    { id: '2', title: `[${todayStr}] Dados de emprego dos EUA acima do esperado`, source: 'Bloomberg', timestamp: minAgo(35), sentiment: 'Neutral', recommendation: 'Dados mistos. Volatilidade no curto prazo.', affectedAssets: ['BTC', 'XRP', 'ADA'] },
    { id: '3', title: `[${todayStr}] Binance registra volume recorde em futuros de BTC`, source: 'CoinDesk', timestamp: minAgo(55), sentiment: 'Bullish', recommendation: 'Volume institucional crescente. Smart Money posicionando para alta.', affectedAssets: ['BTC', 'BNB'] },
    { id: '4', title: `[${todayStr}] SEC abre consulta pública sobre regulação de DeFi`, source: 'The Block', timestamp: minAgo(80), sentiment: 'Bearish', recommendation: 'Incerteza regulatória. Tokens DeFi sob pressão.', affectedAssets: ['UNI', 'AAVE', 'LINK', 'CRV'] },
    { id: '5', title: `[${todayStr}] BlackRock aumenta posição em ETF de Ethereum`, source: 'Bloomberg', timestamp: minAgo(105), sentiment: 'Bullish', recommendation: 'Acumulação institucional. ETH pode liderar rally.', affectedAssets: ['ETH', 'OP', 'ARB'] },
    { id: '6', title: `[${todayStr}] On-chain: Baleias movem 50K BTC para cold storage`, source: 'Glassnode', timestamp: minAgo(140), sentiment: 'Bullish', recommendation: 'Retirada massiva = menos pressão vendedora. Muito bullish.', affectedAssets: ['BTC'] },
    { id: '7', title: `[${todayStr}] Solana ultrapassa Ethereum em transações diárias`, source: 'Messari', timestamp: minAgo(170), sentiment: 'Bullish', recommendation: 'Crescimento on-chain. SOL e ecossistema valorizando.', affectedAssets: ['SOL', 'JUP', 'BONK', 'WIF'] },
    { id: '8', title: `[${todayStr}] Tokens de IA em alta após parceria Nvidia + crypto`, source: 'CoinTelegraph', timestamp: minAgo(210), sentiment: 'Bullish', recommendation: 'Narrativa IA forte. FET/RNDR/TAO com upside.', affectedAssets: ['FET', 'RNDR', 'TAO', 'WLD'] },
    { id: '9', title: `[${todayStr}] CPI dos EUA divulgado hoje às 09:30 (horário Brasília)`, source: 'Investing', timestamp: minAgo(20), sentiment: 'Neutral', recommendation: '⚠️ EVENTO DE ALTO IMPACTO - Evitar entradas 30min antes/depois.', affectedAssets: ['BTC', 'ETH'] },
    { id: '10', title: `[${todayStr}] Whale alert: 12.500 BTC movidos de Coinbase para wallet desconhecida`, source: 'Whale Alert', timestamp: minAgo(8), sentiment: 'Bullish', recommendation: 'Saída de exchange = acumulação institucional silenciosa.', affectedAssets: ['BTC'] },
    { id: '11', title: `[${todayStr}] Funding rate de BTC perpétuo virou negativo nas últimas 4h`, source: 'Coinglass', timestamp: minAgo(45), sentiment: 'Bullish', recommendation: 'Excesso de short = squeeze provável. Long bias.', affectedAssets: ['BTC', 'ETH'] },
    { id: '12', title: `[${todayStr}] Open Interest em ETH atinge máxima histórica`, source: 'Coinglass', timestamp: minAgo(95), sentiment: 'Neutral', recommendation: 'Alavancagem alta = volatilidade extrema esperada.', affectedAssets: ['ETH'] },
  ];
};

const SentimentBadge = ({ sentiment }: { sentiment: NewsItem['sentiment'] }) => {
  const colors = {
    Bullish: 'bg-prisma-green/20 text-prisma-green border-prisma-green/30',
    Bearish: 'bg-prisma-red/20 text-prisma-red border-prisma-red/30',
    Neutral: 'bg-prisma-yellow/20 text-prisma-yellow border-prisma-yellow/30',
  };

  const icons = { Bullish: '🟢', Bearish: '🔴', Neutral: '🟡' };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[sentiment]}`}>
      {icons[sentiment]} {sentiment}
    </span>
  );
};

// Market Impact indicator
const MarketImpact = ({ sentiment, assets }: { sentiment: NewsItem['sentiment']; assets: string[] }) => {
  const impactLevel = sentiment === 'Bullish' ? 'ALTO' : sentiment === 'Bearish' ? 'ALTO' : 'MÉDIO';
  const impactColor = sentiment === 'Bullish' ? 'text-prisma-green' : sentiment === 'Bearish' ? 'text-prisma-red' : 'text-prisma-yellow';
  
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground">Impacto no Mercado:</span>
      <span className={`text-xs font-bold ${impactColor}`}>
        {impactLevel}
      </span>
      <div className="flex gap-1 ml-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              (sentiment === 'Bullish' || sentiment === 'Bearish') || i <= 2
                ? sentiment === 'Bullish' ? 'bg-prisma-green' : sentiment === 'Bearish' ? 'bg-prisma-red' : 'bg-prisma-yellow'
                : 'bg-secondary'
            }`}
          />
        ))}
      </div>
    </div>
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
  const [news] = useState<NewsItem[]>(generateTodayNews());
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'Bullish' | 'Bearish' | 'Neutral'>('all');
  const [assetFilter, setAssetFilter] = useState<string>('');

  const filteredNews = useMemo(() => news.filter(n => {
    if (filter !== 'all' && n.sentiment !== filter) return false;
    if (assetFilter && !n.affectedAssets.some(a => a.toLowerCase().includes(assetFilter.toLowerCase()))) return false;
    return true;
  }), [news, filter, assetFilter]);

  const generateAISummary = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: {
          pair: 'NEWS_SUMMARY',
          newsHeadlines: news.map(n => `[${n.sentiment}] ${n.title}`).join('\n'),
          priceData: { current: 0 },
          indicators: {},
        },
      });
      if (error) throw error;
      setAiSummary(data?.analysis || 'Resumo gerado com sucesso.');
      toast.success('Resumo IA das notícias gerado!');
    } catch {
      toast.error('Erro ao gerar resumo IA.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const bullishCount = news.filter(n => n.sentiment === 'Bullish').length;
  const bearishCount = news.filter(n => n.sentiment === 'Bearish').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">📰 Notícias de Hoje</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-prisma-green font-bold">{bullishCount} 🟢</span>
            <span className="text-prisma-red font-bold">{bearishCount} 🔴</span>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute h-3 w-3 rounded-full bg-prisma-green animate-ping"></div>
            <div className="h-2 w-2 rounded-full bg-prisma-green"></div>
          </div>
          <span className="text-sm text-muted-foreground">Tempo real</span>
        </div>
      </div>

      {/* Market Sentiment Overview */}
      <div className="prisma-card gradient-purple border border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground font-display">Sentimento do Mercado Hoje</h3>
          <Button onClick={generateAISummary} disabled={isLoadingAI} size="sm" className="bg-primary hover:bg-primary/80">
            {isLoadingAI ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : '🤖'}
            Resumo IA
          </Button>
        </div>
        <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-prisma-green/60 rounded-l-full"
            style={{ width: `${(bullishCount / news.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Bullish {Math.round((bullishCount / news.length) * 100)}%</span>
          <span>Bearish {Math.round((bearishCount / news.length) * 100)}%</span>
        </div>
        {aiSummary && (
          <pre className="mt-3 whitespace-pre-wrap text-sm text-foreground/90 bg-secondary/50 p-3 rounded-lg font-mono max-h-40 overflow-auto">
            {aiSummary}
          </pre>
        )}
      </div>

      {/* News List */}
      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="prisma-card hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer font-display">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">{item.source}</span>
                  <span>•</span>
                  <span className="font-mono">{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
              <SentimentBadge sentiment={item.sentiment} />
            </div>

            <div className="bg-secondary/50 rounded-lg p-3 mt-3">
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">📊 Análise PRISMA:</span>{' '}
                {item.recommendation}
              </p>
            </div>

            <MarketImpact sentiment={item.sentiment} assets={item.affectedAssets} />

            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-muted-foreground">Ativos afetados:</span>
              {item.affectedAssets.map((asset) => (
                <span key={asset} className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded font-mono">
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
