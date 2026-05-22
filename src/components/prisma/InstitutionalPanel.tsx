// Painel institucional — Fase 1: mostra verdict + sinal real do pipeline.
import { useInstitutionalSignal } from '@/hooks/useInstitutionalSignal';
import type { Pair } from '@/types';

interface Props { pair: Pair }

function fmt(n: number, d = 4) { return Number.isFinite(n) ? n.toFixed(d) : '—'; }

export function InstitutionalPanel({ pair }: Props) {
  const symbol = pair.id.toUpperCase();
  const { verdict, signal, loading, error, refresh } = useInstitutionalSignal(symbol, 80, 60000);

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary/80">Engine Institucional</div>
          <div className="font-mono text-lg">{symbol} · 15m</div>
        </div>
        <button
          onClick={refresh}
          className="text-xs px-3 py-1 rounded-md border border-primary/40 hover:bg-primary/10 transition"
        >
          {loading ? 'Analisando…' : 'Recalcular'}
        </button>
      </div>

      {error && <div className="text-xs text-destructive">Erro: {error}</div>}

      {verdict && (
        <>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <Cell label="Score" value={`${verdict.score}/100`} accent={verdict.score >= 80} />
            <Cell label="Grade" value={verdict.grade} accent={verdict.grade === 'PREMIUM'} />
            <Cell label="Direção" value={verdict.direction} accent={verdict.direction !== 'NONE'} />
            <Cell label="Regime" value={verdict.regime} />
            <Cell label="HTF 4H" value={verdict.context.htf4h} />
            <Cell label="HTF 1H" value={verdict.context.htf1h} />
            <Cell label="Estrutura" value={verdict.context.structure} />
            <Cell label="ATR" value={fmt(verdict.context.atr)} />
          </div>

          <div className="space-y-1">
            <div className="text-[11px] uppercase text-muted-foreground tracking-wider">Confluência institucional (8 fatores)</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {verdict.factors.map(f => (
                <div key={f.name} className={`flex items-center justify-between px-2 py-1 rounded border ${f.hit ? 'border-primary/50 bg-primary/10' : 'border-border/40 opacity-60'}`}>
                  <span>{f.hit ? '✓' : '·'} {f.name}</span>
                  <span className="font-mono">{f.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {verdict.reason.length > 0 && (
            <div className="text-[11px] text-muted-foreground">
              {verdict.reason.map((r, i) => <div key={i}>• {r}</div>)}
            </div>
          )}
        </>
      )}

      {signal ? (
        <div className="rounded-lg border border-primary/60 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold tracking-wide text-primary">SINAL {signal.direction} · {signal.grade}</span>
            <span className="font-mono text-xs">score {signal.score}</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs font-mono">
            <Cell label="Entrada" value={fmt(signal.entry)} />
            <Cell label="Stop" value={fmt(signal.stopLoss)} accent />
            <Cell label="TP1" value={fmt(signal.tp1)} />
            <Cell label="TP2" value={fmt(signal.tp2)} />
            <Cell label="TP3" value={fmt(signal.tp3)} />
          </div>
        </div>
      ) : (
        !loading && verdict && (
          <div className="text-xs text-muted-foreground italic">
            Nenhum sinal institucional acima do limiar (score ≥ 80). Aguardando setup.
          </div>
        )
      )}
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded border px-2 py-1 ${accent ? 'border-primary/60 bg-primary/10' : 'border-border/40'}`}>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}
