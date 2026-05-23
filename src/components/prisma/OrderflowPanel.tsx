// Painel realtime de orderflow institucional — delta, whales, liquidações.
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, TrendingDown, Zap, Fish, Skull } from 'lucide-react';
import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT'];

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUsd = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}k` : `$${n.toFixed(0)}`;

export function OrderflowPanel() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const flow = useRealtimeFlow(symbol);

  const deltaPositive = (flow?.deltaWindow ?? 0) >= 0;
  const cumPositive = (flow?.cumDelta ?? 0) >= 0;

  return (
    <Card className="bg-card/60 border-primary/30 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            Orderflow Realtime
            {flow && <Badge variant="outline" className="text-xs">{flow.tradesPerSec.toFixed(1)} t/s</Badge>}
          </CardTitle>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SYMBOLS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="rounded-md border border-border/50 bg-background/40 p-2">
            <div className="text-[10px] text-muted-foreground uppercase">Preço</div>
            <div className="text-sm font-mono font-semibold">{flow ? fmt(flow.lastPrice, 2) : '—'}</div>
          </div>
          <div className="rounded-md border border-border/50 bg-background/40 p-2">
            <div className="text-[10px] text-muted-foreground uppercase">Δ 60s</div>
            <div className={`text-sm font-mono font-semibold flex items-center gap-1 ${deltaPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {deltaPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {flow ? fmt(flow.deltaWindow, 2) : '—'}
            </div>
          </div>
          <div className="rounded-md border border-border/50 bg-background/40 p-2">
            <div className="text-[10px] text-muted-foreground uppercase">Cum Δ</div>
            <div className={`text-sm font-mono font-semibold ${cumPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {flow ? fmt(flow.cumDelta, 2) : '—'}
            </div>
          </div>
          <div className="rounded-md border border-border/50 bg-background/40 p-2">
            <div className="text-[10px] text-muted-foreground uppercase">Agressão</div>
            <div className="text-sm font-mono font-semibold">
              {flow?.aggression
                ? `${(flow.aggression.ratio * 100).toFixed(0)}% ${flow.aggression.dominantSide}`
                : '—'}
            </div>
          </div>
        </div>

        {/* Whales + Liquidations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Fish className="h-3 w-3 text-cyan-400" /> Whale trades
            </div>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {flow && flow.whales.length > 0 ? flow.whales.map(w => (
                <div key={w.tradeTime + '-' + w.notional} className="flex items-center justify-between text-xs font-mono p-1.5 rounded border border-border/30 bg-background/30">
                  <Badge variant={w.side === 'BUY' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {w.side}
                  </Badge>
                  <span>{fmt(w.price, 2)}</span>
                  <span className={w.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>{fmtUsd(w.notional)}</span>
                </div>
              )) : <div className="text-xs text-muted-foreground italic">Aguardando whale activity…</div>}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Skull className="h-3 w-3 text-red-400" /> Liquidações
            </div>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {flow && flow.liquidations.length > 0 ? flow.liquidations.map((l, i) => (
                <div key={l.tradeTime + '-' + i} className="flex items-center justify-between text-xs font-mono p-1.5 rounded border border-border/30 bg-background/30">
                  <Badge variant={l.side === 'BUY' ? 'destructive' : 'default'} className="text-[10px] px-1.5 py-0">
                    {l.side === 'BUY' ? 'SHORT LIQ' : 'LONG LIQ'}
                  </Badge>
                  <span>{fmt(l.averagePrice || l.price, 2)}</span>
                  <span className="text-amber-400">{fmtUsd((l.averagePrice || l.price) * l.executedQty)}</span>
                </div>
              )) : <div className="text-xs text-muted-foreground italic">Sem liquidações recentes…</div>}
            </div>
          </div>
        </div>

        {/* Imbalances */}
        {flow && flow.imbalances.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-yellow-400" /> Imbalances recentes
            </div>
            <div className="flex flex-wrap gap-1">
              {flow.imbalances.map((im, i) => (
                <Badge key={i} variant="outline" className={`text-[10px] ${im.side === 'BUY' ? 'border-emerald-500/50 text-emerald-300' : 'border-red-500/50 text-red-300'}`}>
                  {im.side} ×{im.ratio.toFixed(1)} {im.severity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
