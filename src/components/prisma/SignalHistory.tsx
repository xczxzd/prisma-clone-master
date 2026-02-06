import React from 'react';
import type { Signal } from '@/types';
import { PAIRS, formatPriceString } from '@/constants/pairs';

// Generate mock signal history
const generateMockHistory = (): Signal[] => {
  const statuses: Signal['status'][] = ['VITÓRIA', 'VITÓRIA', 'VITÓRIA', 'DERROTA', 'VITÓRIA', 'DERROTA', 'VITÓRIA', 'VITÓRIA'];
  
  return statuses.map((status, index) => {
    const pair = PAIRS[index % PAIRS.length];
    const isLong = Math.random() > 0.5;
    const basePrice = pair.id.includes('BTC') ? 65000 : pair.id.includes('ETH') ? 3200 : 100;
    const entry = basePrice + Math.random() * 1000;
    
    return {
      id: `history-${index}`,
      pair,
      direction: isLong ? 'LONG' : 'SHORT',
      confidence: Math.floor(Math.random() * 15) + 85,
      timeframe: ['5m', '15m', '1H', '4H'][Math.floor(Math.random() * 4)] as Signal['timeframe'],
      entry,
      stopLoss: isLong ? entry * 0.98 : entry * 1.02,
      takeProfit: {
        level1: isLong ? entry * 1.02 : entry * 0.98,
        level2: isLong ? entry * 1.04 : entry * 0.96,
        level3: isLong ? entry * 1.06 : entry * 0.94,
      },
      timestamp: new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 24),
      status,
      result: status === 'VITÓRIA' ? Math.random() * 10 + 2 : -(Math.random() * 3 + 1),
      strategyName: ['Mitigação de Order Block', 'Liquidity Sweep', 'Wyckoff Spring'][Math.floor(Math.random() * 3)],
      riskRewardRatio: `1:${Math.floor(Math.random() * 3) + 3}`,
    };
  });
};

export const SignalHistory: React.FC = () => {
  const signals = generateMockHistory();
  const wins = signals.filter((s) => s.status === 'VITÓRIA').length;
  const winRate = ((wins / signals.length) * 100).toFixed(1);
  const totalProfit = signals.reduce((acc, s) => acc + (s.result || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Histórico de Sinais</h2>
          <p className="text-muted-foreground">Performance dos sinais anteriores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Total de Sinais</p>
          <p className="text-2xl font-bold text-foreground mt-1">{signals.length}</p>
        </div>
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Vitórias</p>
          <p className="text-2xl font-bold text-prisma-green mt-1">{wins}</p>
        </div>
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Win Rate</p>
          <p className="text-2xl font-bold text-primary mt-1">{winRate}%</p>
        </div>
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Lucro Total</p>
          <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-prisma-green' : 'text-prisma-red'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Signal List */}
      <div className="prisma-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Par</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Direção</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Entrada</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estratégia</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Resultado</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((signal) => (
                <tr key={signal.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">{signal.pair.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${signal.direction === 'LONG' ? 'text-prisma-green' : 'text-prisma-red'}`}>
                      {signal.direction}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-foreground">
                    ${formatPriceString(signal.pair.id, signal.entry)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {signal.strategyName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      signal.status === 'VITÓRIA'
                        ? 'bg-prisma-green/20 text-prisma-green'
                        : 'bg-prisma-red/20 text-prisma-red'
                    }`}>
                      {signal.status}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-semibold ${
                    (signal.result || 0) >= 0 ? 'text-prisma-green' : 'text-prisma-red'
                  }`}>
                    {(signal.result || 0) >= 0 ? '+' : ''}{signal.result?.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                    {signal.timestamp.toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
