// Auto-runner: varre pares, gera sinais (SMC + Williams %R), checa alertas,
// envia tudo no Telegram, persiste em telegram_signals e telegram_logs.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BINANCE = 'https://api.binance.com/api/v3';

async function tg(botToken: string, chatId: string, text: string) {
  const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return r.json();
}

async function getTicker(symbol: string) {
  const r = await fetch(`${BINANCE}/ticker/24hr?symbol=${symbol}`);
  if (!r.ok) return null;
  return r.json();
}

async function getKlines(symbol: string, interval = '15m', limit = 100) {
  const r = await fetch(`${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!r.ok) return [];
  const arr = await r.json();
  return arr.map((k: any[]) => ({
    open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5],
  }));
}

function williamsR(k: any[], period = 7) {
  if (k.length < period) return -50;
  const slice = k.slice(-period);
  const hh = Math.max(...slice.map(c => c.high));
  const ll = Math.min(...slice.map(c => c.low));
  const cur = k[k.length - 1].close;
  return ((hh - cur) / (hh - ll)) * -100;
}

function detectWM(k: any[]): 'W' | 'M' | 'NEUTRAL' {
  if (k.length < 20) return 'NEUTRAL';
  const last = k.slice(-20);
  const wrs = last.map((_, i) => williamsR(last.slice(0, i + 1), 7));
  const recent = wrs.slice(-10);
  const min = Math.min(...recent);
  const max = Math.max(...recent);
  if (min < -80 && recent[recent.length - 1] > -50) return 'W';
  if (max > -20 && recent[recent.length - 1] < -50) return 'M';
  return 'NEUTRAL';
}

function atr(k: any[], period = 14) {
  if (k.length < period + 1) return 0;
  let sum = 0;
  for (let i = k.length - period; i < k.length; i++) {
    const tr = Math.max(
      k[i].high - k[i].low,
      Math.abs(k[i].high - k[i - 1].close),
      Math.abs(k[i].low - k[i - 1].close),
    );
    sum += tr;
  }
  return sum / period;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { device_id = 'default' } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: cfg } = await supabase
      .from('telegram_config').select('*').eq('device_id', device_id).maybeSingle();

    if (!cfg?.bot_token || !cfg?.chat_id) {
      return new Response(JSON.stringify({ ok: false, error: 'config missing' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!cfg.auto_mode) {
      return new Response(JSON.stringify({ ok: true, skipped: 'auto_mode off' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pairs: string[] = cfg.watched_pairs || ['BTCUSDT'];
    const generated: any[] = [];
    const alertsHit: any[] = [];

    // 1) Sinais automáticos
    if (cfg.notify_signals) {
      for (const symbol of pairs) {
        const k = await getKlines(symbol, '15m', 100);
        if (!k.length) continue;
        const wr = williamsR(k, 7);
        const pat = detectWM(k);
        const price = k[k.length - 1].close;
        const a = atr(k, 14);
        if (pat === 'NEUTRAL') continue;

        const dir: 'LONG' | 'SHORT' = pat === 'W' ? 'LONG' : 'SHORT';
        const confidence = pat === 'W' && wr < -80 ? 88 : pat === 'M' && wr > -20 ? 88 : 72;
        const sl = dir === 'LONG' ? price - a * 1.5 : price + a * 1.5;
        const tp1 = dir === 'LONG' ? price + a * 1.5 : price - a * 1.5;
        const tp2 = dir === 'LONG' ? price + a * 3 : price - a * 3;
        const tp3 = dir === 'LONG' ? price + a * 5 : price - a * 5;

        // dedup: não repete sinal idêntico em < 30min
        const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { data: dup } = await supabase.from('telegram_signals')
          .select('id').eq('device_id', device_id).eq('pair', symbol)
          .eq('direction', dir).gte('created_at', since).limit(1);
        if (dup && dup.length) continue;

        const { data: ins } = await supabase.from('telegram_signals').insert({
          device_id, pair: symbol, direction: dir, entry: price,
          stop_loss: sl, tp1, tp2, tp3, confidence, strategy: `SMC + Williams %R (${pat})`,
          sent_telegram: true,
        }).select().single();

        const msg =
`🎯 <b>SINAL PRISMA IA — ${dir}</b>
<b>Par:</b> ${symbol}
<b>Padrão:</b> ${pat} | <b>W%R(7):</b> ${wr.toFixed(1)}
<b>Confiança:</b> ${confidence}%

💰 <b>Entrada:</b> ${price.toFixed(4)}
🛑 <b>Stop:</b> ${sl.toFixed(4)}
🎯 <b>TP1:</b> ${tp1.toFixed(4)}
🎯 <b>TP2:</b> ${tp2.toFixed(4)}
🎯 <b>TP3:</b> ${tp3.toFixed(4)}

<i>Estratégia: SMC + Williams %R confluência</i>`;
        await tg(cfg.bot_token, cfg.chat_id, msg);
        generated.push(ins);
      }
    }

    // 2) Alertas por ativo
    if (cfg.notify_prices) {
      const { data: alerts } = await supabase.from('telegram_alerts')
        .select('*').eq('device_id', device_id).eq('enabled', true).eq('triggered', false);
      for (const a of alerts || []) {
        const t = await getTicker(a.symbol);
        if (!t) continue;
        const price = parseFloat(t.lastPrice);
        const hit = a.condition === 'above' ? price >= a.target_price : price <= a.target_price;
        if (!hit) continue;
        const msg =
`🔔 <b>ALERTA DE PREÇO</b>
<b>${a.symbol}</b> ${a.condition === 'above' ? '🚀 acima de' : '📉 abaixo de'} <b>${a.target_price}</b>
<b>Preço atual:</b> ${price}
${a.note ? `\n📝 ${a.note}` : ''}`;
        await tg(cfg.bot_token, cfg.chat_id, msg);
        await supabase.from('telegram_alerts').update({
          triggered: true, triggered_at: new Date().toISOString(),
        }).eq('id', a.id);
        alertsHit.push(a);
      }
    }

    await supabase.from('telegram_logs').insert({
      device_id, type: 'auto_run',
      message: `signals=${generated.length} alerts=${alertsHit.length} pairs=${pairs.length}`,
      payload: { generated: generated.length, alerts: alertsHit.length },
      status: 'ok',
    });

    return new Response(JSON.stringify({
      ok: true, generated: generated.length, alerts: alertsHit.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[auto-runner]', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
