
-- Telegram config (single-row pattern, but allow multiple device-bound configs in future)
CREATE TABLE public.telegram_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE DEFAULT 'default',
  bot_token TEXT,
  chat_id TEXT,
  auto_mode BOOLEAN NOT NULL DEFAULT false,
  notify_signals BOOLEAN NOT NULL DEFAULT true,
  notify_whales BOOLEAN NOT NULL DEFAULT true,
  notify_prices BOOLEAN NOT NULL DEFAULT true,
  notify_news BOOLEAN NOT NULL DEFAULT true,
  scan_interval_sec INTEGER NOT NULL DEFAULT 300,
  watched_pairs TEXT[] NOT NULL DEFAULT ARRAY['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.telegram_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL DEFAULT 'default',
  symbol TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above','below')),
  target_price NUMERIC NOT NULL,
  note TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.telegram_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL DEFAULT 'default',
  type TEXT NOT NULL,
  message TEXT,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.telegram_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL DEFAULT 'default',
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('LONG','SHORT')),
  entry NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  tp1 NUMERIC NOT NULL,
  tp2 NUMERIC NOT NULL,
  tp3 NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  strategy TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  sent_telegram BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tg_alerts_device ON public.telegram_alerts(device_id, enabled);
CREATE INDEX idx_tg_logs_device_time ON public.telegram_logs(device_id, created_at DESC);
CREATE INDEX idx_tg_signals_device_time ON public.telegram_signals(device_id, created_at DESC);

ALTER TABLE public.telegram_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_all_config" ON public.telegram_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_alerts" ON public.telegram_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_logs" ON public.telegram_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_all_signals" ON public.telegram_signals FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_telegram_config_updated
BEFORE UPDATE ON public.telegram_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
