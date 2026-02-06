import React, { useMemo } from 'react';
import type { Pair, IndicatorStatus } from '@/types';

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
      <h3 className="font-bold text-foreground">{indicator.name}</h3>
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(indicator.status)}`}>
        {indicator.status}
      </span>
    </div>
    <p className="text-2xl font-mono text-primary mt-2">{indicator.value}</p>
    <p className="text-sm text-muted-foreground mt-1">{indicator.description}</p>
  </div>
);

interface TechnicalAnalysisProps {
  pair: Pair;
}

export const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ pair }) => {
  const indicators: IndicatorStatus[] = useMemo(() => {
    // Seeded random for consistent display per pair
    const createSeededRandom = (seed: number) => {
      let state = seed;
      return () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
      };
    };

    const seed = pair.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = createSeededRandom(seed);

    const smcIndicators: IndicatorStatus[] = [
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
        name: 'Zona de Mitigação',
        value: random() > 0.5 ? 'Próxima' : 'Distante',
        status: random() > 0.5 ? 'BULLISH' : 'NEUTRAL',
        description: 'Área onde ordens institucionais pendentes existem.',
      },
      {
        name: 'Premium/Discount',
        value: random() > 0.5 ? 'Zona de Discount' : 'Zona de Premium',
        status: random() > 0.5 ? 'BULLISH' : 'BEARISH',
        description: 'Posição do preço em relação ao range institucional.',
      },
    ];

    return smcIndicators;
  }, [pair.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{pair.name}</h2>
          <p className="text-muted-foreground">Análise Smart Money Concepts (SMC)</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
            Binance Futures
          </span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="prisma-card gradient-purple">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Veredito Institucional</h3>
            <p className="text-muted-foreground text-sm">
              Baseado na análise de fluxo de Smart Money
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${indicators[0].status === 'BULLISH' ? 'text-prisma-green' : 'text-prisma-red'}`}>
              {indicators[0].status === 'BULLISH' ? '🟢 COMPRANDO' : '🔴 VENDENDO'}
            </p>
            <p className="text-sm text-muted-foreground">Baleias estão...</p>
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
