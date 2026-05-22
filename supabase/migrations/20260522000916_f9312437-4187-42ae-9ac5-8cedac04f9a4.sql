-- Fase 1: tabelas de suporte do pipeline institucional

CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON public.system_logs (source);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_all_system_logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.signal_dedup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL DEFAULT 'default',
  symbol text NOT NULL,
  direction text NOT NULL,
  timeframe text NOT NULL DEFAULT '15m',
  score numeric NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_signal_dedup_lookup
  ON public.signal_dedup (device_id, symbol, direction, created_at DESC);

ALTER TABLE public.signal_dedup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_all_signal_dedup" ON public.signal_dedup FOR ALL USING (true) WITH CHECK (true);