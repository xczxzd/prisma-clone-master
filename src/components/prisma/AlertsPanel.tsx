import React, { useEffect, useState } from 'react';
import { getAlerts, removeAlert, markAlertTriggered, getExecutions, updateExecutionPrice, type PriceAlert, type SignalExecution } from '@/services/alertsStore';
import { usePrices } from '@/hooks/usePrices';
import { formatPriceString } from '@/constants/pairs';
import { Bell, Trash2, Zap, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(getAlerts());
  const [executions, setExecutions] = useState<SignalExecution[]>(getExecutions());

  const symbols = Array.from(new Set([
    ...alerts.filter(a => !a.triggered).map(a => a.symbol),
    ...executions.filter(e => e.status === 'OPEN' || e.status.startsWith('TP')).map(e => e.pairId),
  ]));

  const { tickers } = usePrices(symbols, 5000);

  // Verifica alertas e atualiza execuções
  useEffect(() => {
    alerts.forEach(a => {
      if (a.triggered) return;
      const t = tickers[a.symbol];
      if (!t) return;
      const hit = a.condition === 'above' ? t.lastPrice >= a.targetPrice : t.lastPrice <= a.targetPrice;
      if (hit) {
        markAlertTriggered(a.id);
        toast.success(`🔔 ALERTA: ${a.symbol} ${a.condition === 'above' ? '≥' : '≤'} $${a.targetPrice}`, { duration: 8000 });
        setAlerts(getAlerts());
      }
    });
    executions.forEach(e => {
      const t = tickers[e.pairId];
      if (t) updateExecutionPrice(e.id, t.lastPrice);
    });
    setExecutions(getExecutions());
  }, [tickers]);

  const handleRemoveAlert = (id: string) => {
    removeAlert(id);
    setAlerts(getAlerts());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-display">🔔 Alertas & Execuções</h2>
        <p className="text-muted-foreground">Monitoramento ao vivo com preços reais da Binance</p>
      </div>

      {/* Execuções Ativas */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Sinais Executados ({executions.length})
        </h3>
        {executions.length === 0 ? (
          <div className="prisma-card text-center py-8 text-muted-foreground">
            Nenhum sinal executado ainda. Clique em "Executar" em um sinal no Dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {executions.map(e => {
              const isLong = e.direction === 'LONG';
              const inProfit = (e.pnlPercent ?? 0) >= 0;
              const statusColor =
                e.status === 'STOPPED' ? 'text-prisma-red' :
                e.status.startsWith('TP') ? 'text-prisma-green' :
                'text-prisma-yellow';
              return (
                <div key={e.id} className="prisma-card border border-primary/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-foreground">{e.pairName}</p>
                      <p className={`text-sm font-bold flex items-center gap-1 ${isLong ? 'text-prisma-green' : 'text-prisma-red'}`}>
                        {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {e.direction} · {e.strategy}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-secondary ${statusColor}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Entrada:</span> <span className="font-mono">${formatPriceString(e.pairId, e.entry)}</span></div>
                    <div><span className="text-muted-foreground">Atual:</span> <span className="font-mono">${e.currentPrice ? formatPriceString(e.pairId, e.currentPrice) : '...'}</span></div>
                    <div><span className="text-muted-foreground">🛡️ SL:</span> <span className="font-mono text-prisma-red">${formatPriceString(e.pairId, e.stopLoss)}</span></div>
                    <div><span className="text-muted-foreground">🎯 TP2:</span> <span className="font-mono text-prisma-green">${formatPriceString(e.pairId, e.tp2)}</span></div>
                  </div>
                  <div className={`mt-2 text-center py-2 rounded-lg ${inProfit ? 'bg-prisma-green/10' : 'bg-prisma-red/10'}`}>
                    <span className={`text-lg font-bold font-mono ${inProfit ? 'text-prisma-green' : 'text-prisma-red'}`}>
                      {inProfit ? '+' : ''}{(e.pnlPercent ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Alertas de Preço */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Alertas de Preço ({alerts.length})
        </h3>
        {alerts.length === 0 ? (
          <div className="prisma-card text-center py-8 text-muted-foreground">
            Nenhum alerta criado. Use o botão "Alerta" em um sinal para começar.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => {
              const t = tickers[a.symbol];
              const current = t?.lastPrice;
              return (
                <div key={a.id} className="prisma-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {a.triggered ? (
                      <CheckCircle2 className="w-5 h-5 text-prisma-green" />
                    ) : (
                      <Bell className="w-5 h-5 text-primary animate-pulse" />
                    )}
                    <div>
                      <p className="font-bold text-foreground">{a.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.condition === 'above' ? '≥' : '≤'} ${a.targetPrice} {a.note && `· ${a.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {current !== undefined && (
                      <span className="font-mono text-sm text-foreground">
                        Agora: ${formatPriceString(a.symbol, current)}
                      </span>
                    )}
                    <button onClick={() => handleRemoveAlert(a.id)} className="p-2 rounded hover:bg-destructive/20 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
