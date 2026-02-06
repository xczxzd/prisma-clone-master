import React from 'react';
import type { EconomicEvent } from '@/types';

const mockEvents: EconomicEvent[] = [
  { id: '1', time: '08:30', currency: 'USD', event: 'Non-Farm Payrolls', impact: 'High', actual: '275K', forecast: '200K', previous: '353K' },
  { id: '2', time: '10:00', currency: 'USD', event: 'ISM Manufacturing PMI', impact: 'High', actual: '47.8', forecast: '49.5', previous: '49.1' },
  { id: '3', time: '14:00', currency: 'USD', event: 'FOMC Statement', impact: 'High', actual: '-', forecast: '-', previous: '-' },
  { id: '4', time: '08:00', currency: 'EUR', event: 'CPI (YoY)', impact: 'High', actual: '2.6%', forecast: '2.5%', previous: '2.8%' },
  { id: '5', time: '09:30', currency: 'GBP', event: 'GDP (QoQ)', impact: 'Medium', actual: '0.2%', forecast: '0.1%', previous: '-0.1%' },
  { id: '6', time: '21:30', currency: 'AUD', event: 'Employment Change', impact: 'Medium', actual: '15.3K', forecast: '25.0K', previous: '500' },
  { id: '7', time: '03:00', currency: 'CNY', event: 'Trade Balance', impact: 'Medium', actual: '$125B', forecast: '$100B', previous: '$75B' },
  { id: '8', time: '11:00', currency: 'USD', event: 'Crude Oil Inventories', impact: 'Low', actual: '-2.5M', forecast: '+1.0M', previous: '+3.5M' },
];

const ImpactBadge = ({ impact }: { impact: EconomicEvent['impact'] }) => {
  const colors = {
    High: 'bg-prisma-red/20 text-prisma-red border-prisma-red/30',
    Medium: 'bg-prisma-yellow/20 text-prisma-yellow border-prisma-yellow/30',
    Low: 'bg-prisma-green/20 text-prisma-green border-prisma-green/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[impact]}`}>
      {impact}
    </span>
  );
};

export const EconomicCalendar: React.FC = () => {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Calendário Econômico</h2>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-prisma-red/20 text-prisma-red rounded-full text-xs font-medium">Alto Impacto</span>
          <span className="px-3 py-1 bg-prisma-yellow/20 text-prisma-yellow rounded-full text-xs font-medium">Médio</span>
          <span className="px-3 py-1 bg-prisma-green/20 text-prisma-green rounded-full text-xs font-medium">Baixo</span>
        </div>
      </div>

      <div className="prisma-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Hora</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Moeda</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Evento</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Impacto</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Atual</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Previsto</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Anterior</th>
              </tr>
            </thead>
            <tbody>
              {mockEvents.map((event) => (
                <tr key={event.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm text-foreground">{event.time}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-primary">{event.currency}</span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{event.event}</td>
                  <td className="py-3 px-4 text-center">
                    <ImpactBadge impact={event.impact} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-foreground">{event.actual}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">{event.forecast}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">{event.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="prisma-card gradient-purple">
        <h3 className="text-lg font-semibold text-foreground mb-2">💡 Dica PRISMA IA</h3>
        <p className="text-muted-foreground">
          Eventos de alto impacto como <span className="text-primary font-semibold">FOMC Statement</span> e{' '}
          <span className="text-primary font-semibold">Non-Farm Payrolls</span> frequentemente causam alta
          volatilidade. As baleias costumam posicionar-se antes desses eventos. Monitore o fluxo institucional
          nas horas que antecedem.
        </p>
      </div>
    </div>
  );
};
