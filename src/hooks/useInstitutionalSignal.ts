// Hook React para rodar o pipeline institucional sob demanda / em intervalo
import { useEffect, useState, useCallback } from 'react';
import { runPipeline, type InstitutionalSignal } from '@/core/signalPipeline';
import type { ConfluenceVerdict } from '@/core/confluenceEngine';

export function useInstitutionalSignal(symbol: string, minScore = 80, intervalMs = 60000) {
  const [verdict, setVerdict] = useState<ConfluenceVerdict | null>(null);
  const [signal, setSignal] = useState<InstitutionalSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      setError(null);
      const r = await runPipeline(symbol, { minScore });
      setVerdict(r.verdict);
      setSignal(r.signal);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [symbol, minScore]);

  useEffect(() => {
    let alive = true;
    run();
    const id = setInterval(() => { if (alive) run(); }, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [run, intervalMs]);

  return { verdict, signal, loading, error, refresh: run };
}
