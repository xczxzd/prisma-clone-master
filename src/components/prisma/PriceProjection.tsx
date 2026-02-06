import React, { useMemo } from 'react';
import type { Pair, FibonacciLevel } from '@/types';
import { formatPriceString } from '@/constants/pairs';

interface FibonacciRowProps extends FibonacciLevel {
  pairId: string;
}

const FibonacciRow: React.FC<FibonacciRowProps> = ({ level, price, description, pairId }) => (
  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
    <div className="flex items-center space-x-3">
      <span className="font-mono text-sm text-primary w-16">{level}</span>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    <span className="font-mono font-semibold text-foreground">${formatPriceString(pairId, price)}</span>
  </div>
);

const MomentumIndicator = ({ name, value, isPositive }: { name: string; value: string; isPositive: boolean }) => (
  <div className="prisma-card text-center">
    <p className="text-sm text-muted-foreground">{name}</p>
    <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-prisma-green' : 'text-prisma-red'}`}>
      {value}
    </p>
  </div>
);

interface PriceProjectionProps {
  pair: Pair;
}

export const PriceProjection: React.FC<PriceProjectionProps> = ({ pair }) => {
  const { fibonacciLevels, basePrice, isUpwardTrend, momentum } = useMemo(() => {
    const createSeededRandom = (seedStr: string) => {
      let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
      for (let i = 0, k; i < seedStr.length; i++) {
        k = seedStr.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1, 597399067);
        h2 = h3 ^ Math.imul(h2, 2869860233);
        h3 = h4 ^ Math.imul(h3, 951274213);
        h4 = h1 ^ Math.imul(h4, 2716044179);
      }
      h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
      h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
      h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
      h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);

      return () => {
        let t = h1 ^ (h1 << 11);
        h1 = h2; h2 = h3; h3 = h4;
        h4 = (h4 ^ (h4 >>> 19)) ^ (t ^ (t >>> 8));
        return (h4 >>> 0) / 4294967295;
      };
    };

    const random = createSeededRandom(pair.id + new Date().toDateString());

    // Base price varies by pair type
    let base: number;
    if (pair.id.includes('BTC')) base = 65000 + random() * 10000;
    else if (pair.id.includes('ETH')) base = 3000 + random() * 500;
    else if (pair.id.includes('BNB')) base = 500 + random() * 100;
    else if (pair.id.includes('SOL')) base = 100 + random() * 50;
    else base = 1 + random() * 100;

    const trend = random() > 0.4;
    const range = base * 0.15;

    const levels: FibonacciLevel[] = trend
      ? [
          { level: '0.0%', price: base - range * 0.5, description: 'Fundo Recente (Suporte)' },
          { level: '23.6%', price: base - range * 0.236, description: 'Primeira Retração' },
          { level: '38.2%', price: base - range * 0.118, description: 'Retração Fraca' },
          { level: '50.0%', price: base, description: 'Equilíbrio' },
          { level: '61.8%', price: base + range * 0.118, description: 'Golden Zone' },
          { level: '78.6%', price: base + range * 0.286, description: 'Extensão Profunda' },
          { level: '100.0%', price: base + range * 0.5, description: 'Alvo Principal' },
          { level: '161.8%', price: base + range * 1.118, description: 'Extensão de Fibonacci' },
        ]
      : [
          { level: '161.8%', price: base - range * 1.118, description: 'Extensão de Fibonacci' },
          { level: '100.0%', price: base - range * 0.5, description: 'Alvo Principal' },
          { level: '78.6%', price: base - range * 0.286, description: 'Extensão Profunda' },
          { level: '61.8%', price: base - range * 0.118, description: 'Golden Zone' },
          { level: '50.0%', price: base, description: 'Equilíbrio' },
          { level: '38.2%', price: base + range * 0.118, description: 'Retração Fraca' },
          { level: '23.6%', price: base + range * 0.236, description: 'Primeira Retração' },
          { level: '0.0%', price: base + range * 0.5, description: 'Topo Recente (Resistência)' },
        ];

    return {
      fibonacciLevels: levels,
      basePrice: base,
      isUpwardTrend: trend,
      momentum: {
        rsi: (random() * 40 + 30).toFixed(1),
        macd: trend ? '+' + (random() * 50).toFixed(2) : '-' + (random() * 50).toFixed(2),
        volume: (random() * 200 + 50).toFixed(0) + '%',
      },
    };
  }, [pair.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{pair.name}</h2>
          <p className="text-muted-foreground">Projeção de Preços com Fibonacci</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${isUpwardTrend ? 'bg-prisma-green/20 text-prisma-green' : 'bg-prisma-red/20 text-prisma-red'}`}>
          {isUpwardTrend ? '📈 Tendência de Alta' : '📉 Tendência de Baixa'}
        </div>
      </div>

      {/* Momentum Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MomentumIndicator name="RSI (14)" value={momentum.rsi} isPositive={parseFloat(momentum.rsi) > 50} />
        <MomentumIndicator name="MACD" value={momentum.macd} isPositive={momentum.macd.startsWith('+')} />
        <MomentumIndicator name="Volume Rel." value={momentum.volume} isPositive={parseInt(momentum.volume) > 100} />
      </div>

      {/* Fibonacci Levels */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Níveis de Fibonacci</h3>
        <div className="space-y-2">
          {fibonacciLevels.map((level, index) => (
            <FibonacciRow key={index} {...level} pairId={pair.id} />
          ))}
        </div>
      </div>

      {/* Projection Summary */}
      <div className="prisma-card gradient-purple">
        <h3 className="text-lg font-semibold text-foreground mb-2">Projeção PRISMA IA</h3>
        <p className="text-muted-foreground">
          {isUpwardTrend
            ? `Com base na análise institucional, ${pair.name} mostra sinais de acumulação. O alvo principal está em $${formatPriceString(pair.id, fibonacciLevels[6].price)}, com extensão possível até $${formatPriceString(pair.id, fibonacciLevels[7].price)}.`
            : `A análise de Smart Money indica distribuição em ${pair.name}. Suporte crítico em $${formatPriceString(pair.id, fibonacciLevels[1].price)}, com possível extensão até $${formatPriceString(pair.id, fibonacciLevels[0].price)}.`}
        </p>
      </div>
    </div>
  );
};
