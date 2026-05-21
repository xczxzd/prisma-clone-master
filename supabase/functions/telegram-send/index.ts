import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { device_id = 'default', message, parse_mode = 'HTML', log_type = 'manual' } = await req.json();
    if (!message) throw new Error('message is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: cfg } = await supabase
      .from('telegram_config')
      .select('bot_token, chat_id')
      .eq('device_id', device_id)
      .maybeSingle();

    if (!cfg?.bot_token || !cfg?.chat_id) {
      throw new Error('Bot não configurado. Salve o Bot Token e Chat ID primeiro.');
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${cfg.bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: cfg.chat_id, text: message, parse_mode }),
    });
    const tgData = await tgRes.json();
    const ok = tgRes.ok && tgData.ok;

    await supabase.from('telegram_logs').insert({
      device_id,
      type: log_type,
      message: message.slice(0, 500),
      payload: tgData,
      status: ok ? 'ok' : 'error',
    });

    if (!ok) throw new Error(`Telegram: ${tgData.description || tgRes.status}`);

    return new Response(JSON.stringify({ ok: true, result: tgData.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[telegram-send]', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
