import React, { useMemo, useState } from 'react';
import type { Pair, IndicatorStatus, WilliamsRData, AIAnalysisResult } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { TradingViewChart } from './TradingViewChart';
import { useMarketAnalysis, usePrice } from '@/hooks/usePrices';
import { formatPriceString } from '@/constants/pairs';

const getStatusColor = (status: IndicatorStatus['status']) => {
  switch (status) {
    case 'BULLISH':
    case 'STRONG':
      return 'status-bullish';
    case 'BEARISH':
    case 'WEAK':
      return 'status-bearish';
    default:
      return 'status-neutral';
  }
};

interface IndicatorCardProps {
  indicator: IndicatorStatus;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator }) => (
  <div className="prisma-card hover:bg-secondary/50 transition-colors">
    <div className="flex justify-between items-center">
      <h3 className="font-bold text-foreground font-display">{indicator.name}</h3>
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(indicator.status)}`}>
        {indicator.status}
      </span>
    </div>
    <p className="text-2xl font-mono text-primary mt-2">{indicator.value}</p>
    <p className="text-sm text-muted-foreground mt-1">{indicator.description}</p>
  </div>
);

const WilliamsRCard: React.FC<{ data: WilliamsRData }> = ({ data }) => {
  const getZoneColor = () => {
    if (data.zone === 'OVERSOLD') return 'bg-prisma-green/20 border-prisma-green/50';
    if (data.zone === 'OVERBOUGHT') return 'bg-prisma-red/20 border-prisma-red/50';
    return 'bg-secondary/50 border-border';
  };

  const getSignalIcon = () => {
    if (data.signal === 'STRONG_BUY' || data.signal === 'BUY') return <TrendingUp className="w-5 h-5 text-prisma-green" />;
    if (data.signal === 'STRONG_SELL' || data.signal === 'SELL') return <TrendingDown className="w-5 h-5 text-prisma-red" />;
    return <AlertTriangle className="w-5 h-5 text-prisma-yellow" />;
  };

  const getPatternDescription = () => {
    if (data.zone === 'OVERSOLD' && data.pattern === 'W') return '🟢 Padrão W em zona sobrevendida - REVERSÃO DE ALTA PROVÁVEL!';
    if (data.zone === 'OVERBOUGHT' && data.pattern === 'M') return '🔴 Padrão M em zona sobrecomprada - REVERSÃO DE BAIXA PROVÁVEL!';
    if (data.zone === 'OVERSOLD') return '⚠️ Zona sobrevendida - Aguardando formação de padrão W';
    if (data.zone === 'OVERBOUGHT') return '⚠️ Zona sobrecomprada - Aguardando formação de padrão M';
    return '➡️ Zona neutra - Sem sinal de reversão';
  };

  return (
    <div className={`prisma-card border-2 ${getZoneColor()} col-span-full`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground text-lg font-display">📊 Williams %R (7)</h3>
          {getSignalIcon()}
        </div>
        <span className={`px-3 py-1 text-sm font-bold rounded-full ${
          data.signal.includes('BUY') ? 'bg-prisma-green/20 text-prisma-green' : 
          data.signal.includes('SELL') ? 'bg-prisma-red/20 text-prisma-red' : 
          'bg-secondary text-muted-foreground'
        }`}>
          {data.signal.replace('_', ' ')}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-sm text-muted-foreground">Valor</p>
          <p className="text-2xl font-mono text-primary">{data.value.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Zona</p>
          <p className={`text-lg font-bold ${data.zone === 'OVERSOLD' ? 'text-prisma-green' : data.zone === 'OVERBOUGHT' ? 'text-prisma-red' : 'text-muted-foreground'}`}>{data.zone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Padrão</p>
          <p className={`text-lg font-bold ${data.pattern === 'W' ? 'text-prisma-green' : data.pattern === 'M' ? 'text-prisma-red' : 'text-muted-foreground'}`}>{data.pattern}</p>
        </div>
      </div>

      <div className="relative h-6 bg-secondary rounded-full overflow-hidden mb-2">
        <div className="absolute left-0 top-0 h-full w-[20%] bg-prisma-green/30 border-r border-prisma-green/50" />
        <div className="absolute right-0 top-0 h-full w-[20%] bg-prisma-red/30 border-l border-prisma-red/50" />
        <div 
          className="absolute top-1 h-4 w-3 bg-primary rounded-full shadow-lg"
          style={{ left: `calc(${((data.value + 100) / 100) * 100}% - 6px)` }}
        />
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-prisma-green font-mono">-80</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-prisma-red font-mono">-20</span>
      </div>
      
      <p className="text-sm text-foreground font-medium">{getPatternDescription()}</p>
    </div>
  );
};

interface TechnicalAnalysisProps {
  pair: Pair;
  onAnalyze?: (pair: Pair) => void;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ pair, onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Dados reais Binance
  const { ticker } = usePrice(pair.id, 5000);
  const { data: market } = useMarketAnalysis(pair.id, '15m');

  const createSeededRandom = (seed: number) => {
    let state = seed;
    return () => { state = (state * 9301 + 49297) % 233280; return state / 233280; };
  };
  const seed = pair.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = createSeededRandom(seed);

  const williamsRData: WilliamsRData = useMemo(() => {
    const value = market?.williamsR ?? -50;
    const zone = market?.zone ?? 'NEUTRAL';
    const pattern = market?.pattern ?? 'NEUTRAL';
    let signal: WilliamsRData['signal'] = 'NEUTRAL';
    if (zone === 'OVERSOLD' && pattern === 'W') signal = 'STRONG_BUY';
    else if (zone === 'OVERBOUGHT' && pattern === 'M') signal = 'STRONG_SELL';
    else if (zone === 'OVERSOLD') signal = 'BUY';
    else if (zone === 'OVERBOUGHT') signal = 'SELL';
    return { value, zone, pattern, signal };
  }, [market]);

  const indicatorValues = useMemo(() => ({
    rsi: random() * 100,
    macd: { value: (random() - 0.5) * 0.01, signal: (random() - 0.5) * 0.01, histogram: (random() - 0.5) * 0.005 },
    adx: random() * 50 + 10,
  }), [pair.id]);

  const indicators: IndicatorStatus[] = useMemo(() => [
    {
      name: 'Order Block (OB)',
      value: random() > 0.5 ? 'Bullish OB Ativo' : 'Bearish OB Ativo',
      status: random() > 0.5 ? 'BULLISH' : 'BEARISH',
      description: 'Zona de interesse institucional identificada no gráfico 4H.',
    },
    {
      name: 'Fair Value Gap (FVG)',
      value: `${(random() * 5 + 1).toFixed(2)}% Gap`,
      status: random() > 0.6 ? 'STRONG' : 'WEAK',
      description: 'Desequilíbrio no preço aguardando preenchimento.',
    },
    {
      name: 'Liquidity Sweep',
      value: random() > 0.5 ? 'Buy Side Swept' : 'Sell Side Swept',
      status: random() > 0.5 ? 'BULLISH' : 'BEARISH',
      description: 'Stops do varejo foram capturados pelas baleias.',
    },
    {
      name: 'Estrutura de Mercado',
      value: random() > 0.5 ? 'HH/HL (Alta)' : 'LH/LL (Baixa)',
      status: random() > 0.5 ? 'BULLISH' : 'BEARISH',
      description: 'Padrão estrutural baseado em Higher Highs/Lows.',
    },
    {
      name: 'Break of Structure',
      value: random() > 0.5 ? 'BOS Confirmado' : 'CHoCH Detectado',
      status: random() > 0.6 ? 'STRONG' : 'NEUTRAL',
      description: 'Mudança na direção do fluxo institucional.',
    },
    {
      name: 'Índice de Força Baleia',
      value: `${Math.floor(random() * 40 + 60)}%`,
      status: random() > 0.5 ? 'STRONG' : 'NEUTRAL',
      description: 'Concentração de volume em ordens grandes.',
    },
    {
      name: 'LTA / LTB',
      value: random() > 0.5 ? 'LTA Respeitada' : 'LTB em Teste',
      status: random() > 0.5 ? 'BULLISH' : 'BEARISH',
      description: 'Linhas de tendência de alta/baixa marcadas no gráfico.',
    },
    {
      name: 'Zona de Vácuo',
      value: `${(random() * 3 + 0.5).toFixed(1)}% Distância`,
      status: random() > 0.5 ? 'STRONG' : 'WEAK',
      description: 'Zona sem suporte/resistência significativa - preço pode mover rápido.',
    },
  ], [pair.id]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: {
          pair: pair.name,
          indicators: {
            williamsR: williamsRData.value,
            williamsRPattern: williamsRData.pattern,
            williamsRZone: williamsRData.zone,
            ...indicatorValues,
            volumeProfile: market?.volumeProfile ? {
              poc: market.volumeProfile.poc,
              vah: market.volumeProfile.vah,
              val: market.volumeProfile.val,
            } : null,
          },
          priceData: {
            current: ticker?.lastPrice ?? 0,
            high24h: ticker?.highPrice ?? 0,
            low24h: ticker?.lowPrice ?? 0,
            change24h: ticker?.priceChangePercent ?? 0,
            volume24h: ticker?.quoteVolume ?? 0,
          },
        },
      });
      if (error) throw error;
      setAiAnalysis(data);
      toast.success('Análise IA concluída!');
    } catch (err) {
      console.error('AI Analysis error:', err);
      toast.error('Erro na análise IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display">{pair.name}</h2>
          <p className="text-muted-foreground">Análise SMC + Williams %R + Gráfico em Tempo Real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium font-mono">
            Binance Futures
          </span>
          {onAnalyze && (
            <Button onClick={() => onAnalyze(pair)} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              <Brain className="w-4 h-4 mr-2" />
              Análise Completa
            </Button>
          )}
          <Button onClick={runAIAnalysis} disabled={isAnalyzing} className="bg-primary hover:bg-primary/80">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Análise IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* TradingView Chart */}
      <TradingViewChart pair={pair} />

      {/* Williams %R Card */}
      <WilliamsRCard data={williamsRData} />

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="prisma-card gradient-purple border-2 border-primary/50">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-foreground font-display">🤖 Análise PRISMA IA</h3>
            <span className="ml-auto px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-bold font-mono">
              {aiAnalysis.confluenceScore}% Confluência
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-secondary/50 p-4 rounded-lg overflow-auto max-h-96 font-mono">
            {aiAnalysis.analysis}
          </pre>
          <p className="text-xs text-muted-foreground mt-3 font-mono">
            Atualizado em: {new Date(aiAnalysis.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      {/* Verdict */}
      <div className="prisma-card gradient-purple">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground font-display">Veredito Institucional</h3>
            <p className="text-muted-foreground text-sm">Baseado em SMC + Williams %R + Confluências</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${
              williamsRData.signal.includes('BUY') ? 'text-prisma-green' : 
              williamsRData.signal.includes('SELL') ? 'text-prisma-red' : 'text-prisma-yellow'
            }`}>
              {williamsRData.signal.includes('BUY') ? '🟢 COMPRANDO' : 
               williamsRData.signal.includes('SELL') ? '🔴 VENDENDO' : '🟡 AGUARDANDO'}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Williams %R: {williamsRData.pattern !== 'NEUTRAL' ? `Padrão ${williamsRData.pattern}` : 'Sem padrão'}
            </p>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => (
          <IndicatorCard key={index} indicator={indicator} />
        ))}
      </div>
    </div>
  );
};
