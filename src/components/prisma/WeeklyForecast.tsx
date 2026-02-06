import React from 'react';
import type { Pair } from '@/types';

interface WeeklyForecastProps {
  pair: Pair;
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ pair }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{pair.name}</h2>
          <p className="text-muted-foreground">Previsão Semanal com IA</p>
        </div>
        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
          Powered by AI
        </span>
      </div>

      <div className="prisma-card gradient-purple">
        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📊 Análise Institucional Semanal - {pair.name}
          </h3>
          
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="text-foreground font-semibold">1. Rastro das Baleias (Fluxo Institucional)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Grandes ordens de compra detectadas na zona de $60,000-$62,000</li>
                <li>Acumulação silenciosa identificada nas últimas 72 horas</li>
                <li>Volume institucional 45% acima da média semanal</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold">2. Piscinas de Liquidez (Liquidity Pools)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Stops do varejo concentrados em $58,500 (abaixo)</li>
                <li>Zona de liquidez superior em $68,200</li>
                <li>Probabilidade de "stop hunt" antes do movimento principal</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold">3. Blocos de Ordens (Order Blocks)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Order Block bullish em $59,800-$60,500 (zona de demanda)</li>
                <li>Order Block bearish em $67,000-$68,000 (zona de oferta)</li>
                <li>Mitigação esperada antes da continuação</li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold">4. Gatilho Sniper (Estratégia)</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Padrão: Wyckoff Spring em formação</li>
                <li>Entrada ideal: Após sweep da liquidez em $58,500</li>
                <li>Confirmação: Candle de absorção no 1H</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h4 className="text-primary font-bold">5. Veredito Institucional</h4>
              <p className="text-lg mt-2">
                🐋 As baleias estão <span className="text-prisma-green font-bold">ACUMULANDO</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Nível de confiança na leitura: <span className="text-primary font-semibold">87%</span>
              </p>
            </div>
          </div>

          <p className="text-center text-primary font-semibold mt-6">
            ✨ Prisma IA: Rastreando os Gigantes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Probabilidade Alta</p>
          <p className="text-2xl font-bold text-prisma-green mt-1">📈 65%</p>
          <p className="text-xs text-muted-foreground">Movimento para cima</p>
        </div>
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Alvo Principal</p>
          <p className="text-2xl font-bold text-primary mt-1">$68,500</p>
          <p className="text-xs text-muted-foreground">Zona de realização</p>
        </div>
        <div className="prisma-card text-center">
          <p className="text-sm text-muted-foreground">Invalidação</p>
          <p className="text-2xl font-bold text-prisma-red mt-1">$57,200</p>
          <p className="text-xs text-muted-foreground">Stop institucional</p>
        </div>
      </div>
    </div>
  );
};
