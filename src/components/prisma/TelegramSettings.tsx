import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PaperAirplaneIcon, CheckIcon } from './Icons';

const DEVICE_ID = (() => {
  let id = localStorage.getItem('prisma_device_id');
  if (!id) { id = `dev_${Math.random().toString(36).slice(2, 10)}`; localStorage.setItem('prisma_device_id', id); }
  return id;
})();

interface Config {
  id?: string;
  bot_token: string;
  chat_id: string;
  auto_mode: boolean;
  notify_signals: boolean;
  notify_whales: boolean;
  notify_prices: boolean;
  notify_news: boolean;
  scan_interval_sec: number;
  watched_pairs: string[];
}

interface Alert {
  id: string; symbol: string; condition: 'above' | 'below';
  target_price: number; note?: string; enabled: boolean; triggered: boolean;
  triggered_at?: string; created_at: string;
}

interface Log {
  id: string; type: string; message: string; status: string; created_at: string;
}

const DEFAULT_CFG: Config = {
  bot_token: '', chat_id: '', auto_mode: false,
  notify_signals: true, notify_whales: true, notify_prices: true, notify_news: true,
  scan_interval_sec: 300,
  watched_pairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'],
};

export const TelegramSettings: React.FC = () => {
  const [cfg, setCfg] = useState<Config>(DEFAULT_CFG);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [newAlert, setNewAlert] = useState({ symbol: 'BTCUSDT', condition: 'above' as 'above' | 'below', target_price: '', note: '' });
  const [pairsInput, setPairsInput] = useState('');
  const runnerRef = useRef<number | null>(null);

  // load
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('telegram_config').select('*').eq('device_id', DEVICE_ID).maybeSingle();
      if (data) { setCfg(data as any); setPairsInput((data.watched_pairs || []).join(',')); }
      else setPairsInput(DEFAULT_CFG.watched_pairs.join(','));
      const { data: al } = await supabase.from('telegram_alerts').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false });
      setAlerts((al as any) || []);
      const { data: lg } = await supabase.from('telegram_logs').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(50);
      setLogs((lg as any) || []);
    })();
  }, []);

  // auto runner loop (client triggers edge function on interval)
  useEffect(() => {
    if (runnerRef.current) { clearInterval(runnerRef.current); runnerRef.current = null; }
    if (!cfg.auto_mode || !cfg.bot_token || !cfg.chat_id) return;
    const tick = async () => {
      const { data, error } = await supabase.functions.invoke('telegram-auto-runner', { body: { device_id: DEVICE_ID } });
      if (error) console.error('[auto-runner]', error);
      else console.log('[auto-runner]', data);
      const { data: lg } = await supabase.from('telegram_logs').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(50);
      setLogs((lg as any) || []);
      const { data: al } = await supabase.from('telegram_alerts').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false });
      setAlerts((al as any) || []);
    };
    tick();
    runnerRef.current = window.setInterval(tick, Math.max(60, cfg.scan_interval_sec) * 1000);
    return () => { if (runnerRef.current) clearInterval(runnerRef.current); };
  }, [cfg.auto_mode, cfg.bot_token, cfg.chat_id, cfg.scan_interval_sec]);

  const save = async () => {
    setSaving(true);
    const payload = {
      ...cfg,
      device_id: DEVICE_ID,
      watched_pairs: pairsInput.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
    };
    const { error } = await supabase.from('telegram_config').upsert(payload, { onConflict: 'device_id' });
    setSaving(false);
    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' as any });
    else toast({ title: 'Configuração salva', description: 'Telegram pronto.' });
  };

  const sendTest = async () => {
    setTesting(true);
    const { data, error } = await supabase.functions.invoke('telegram-send', {
      body: { device_id: DEVICE_ID, message: '✅ <b>PRISMA IA</b> conectado!\nVocê receberá sinais, alertas e notícias automaticamente.', log_type: 'test' },
    });
    setTesting(false);
    if (error || !data?.ok) toast({ title: 'Falha no teste', description: error?.message || data?.error, variant: 'destructive' as any });
    else toast({ title: '✅ Mensagem enviada', description: 'Verifique seu Telegram.' });
    const { data: lg } = await supabase.from('telegram_logs').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(50);
    setLogs((lg as any) || []);
  };

  const runNow = async () => {
    toast({ title: '🚀 Executando varredura...' });
    const { data, error } = await supabase.functions.invoke('telegram-auto-runner', { body: { device_id: DEVICE_ID } });
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' as any });
    else toast({ title: '✅ Varredura concluída', description: `Sinais: ${data?.generated || 0} | Alertas: ${data?.alerts || 0}` });
    const { data: lg } = await supabase.from('telegram_logs').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false }).limit(50);
    setLogs((lg as any) || []);
  };

  const addAlert = async () => {
    const price = parseFloat(newAlert.target_price);
    if (!newAlert.symbol || !price) return toast({ title: 'Preencha símbolo e preço alvo', variant: 'destructive' as any });
    const { error } = await supabase.from('telegram_alerts').insert({
      device_id: DEVICE_ID, symbol: newAlert.symbol.toUpperCase(),
      condition: newAlert.condition, target_price: price, note: newAlert.note,
    });
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' as any });
    setNewAlert({ symbol: 'BTCUSDT', condition: 'above', target_price: '', note: '' });
    const { data: al } = await supabase.from('telegram_alerts').select('*').eq('device_id', DEVICE_ID).order('created_at', { ascending: false });
    setAlerts((al as any) || []);
  };

  const removeAlert = async (id: string) => {
    await supabase.from('telegram_alerts').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const ready = !!cfg.bot_token && !!cfg.chat_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integração Telegram</h2>
          <p className="text-muted-foreground">Sinais, alertas e notícias 24/7 no seu chat</p>
        </div>
        {ready && (
          <div className="flex items-center gap-2 px-3 py-1 bg-prisma-green/20 rounded-full">
            <CheckIcon className="h-4 w-4 text-prisma-green" />
            <span className="text-prisma-green text-sm font-medium">{cfg.auto_mode ? 'AUTO ATIVO' : 'Conectado'}</span>
          </div>
        )}
      </div>

      {/* Bot config */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold mb-4">Configuração do Bot</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Bot Token</label>
            <input type="password" placeholder="123456:ABC-..." value={cfg.bot_token}
              onChange={e => setCfg({ ...cfg, bot_token: e.target.value })} className="prisma-input" />
            <p className="text-xs text-muted-foreground mt-1">Obtenha em @BotFather</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Chat ID</label>
            <input type="text" placeholder="123456789" value={cfg.chat_id}
              onChange={e => setCfg({ ...cfg, chat_id: e.target.value })} className="prisma-input" />
            <p className="text-xs text-muted-foreground mt-1">Use @userinfobot</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={save} disabled={saving}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
            <button onClick={sendTest} disabled={!ready || testing}
              className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="h-4 w-4" /> {testing ? 'Enviando...' : 'Testar'}
            </button>
          </div>
        </div>
      </div>

      {/* Auto mode */}
      <div className="prisma-card gradient-purple">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">🤖 Modo Automático 24/7</h3>
            <p className="text-sm text-muted-foreground">PRISMA varre o mercado e envia tudo no Telegram sozinho</p>
          </div>
          <button onClick={() => setCfg({ ...cfg, auto_mode: !cfg.auto_mode })}
            disabled={!ready}
            className={`w-14 h-7 rounded-full transition-colors ${cfg.auto_mode ? 'bg-prisma-green' : 'bg-border'} disabled:opacity-40`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${cfg.auto_mode ? 'translate-x-7' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Intervalo de varredura (segundos)</label>
            <input type="number" min={60} value={cfg.scan_interval_sec}
              onChange={e => setCfg({ ...cfg, scan_interval_sec: parseInt(e.target.value) || 300 })}
              className="prisma-input" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Pares monitorados (vírgula)</label>
            <input type="text" value={pairsInput} onChange={e => setPairsInput(e.target.value)}
              placeholder="BTCUSDT,ETHUSDT" className="prisma-input" />
          </div>
        </div>
        <button onClick={runNow} disabled={!ready}
          className="mt-4 w-full px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 disabled:opacity-50">
          ⚡ Executar varredura agora
        </button>
      </div>

      {/* Notifications */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold mb-4">Notificações</h3>
        <div className="space-y-2">
          {([
            ['notify_signals', '🎯 Sinais automáticos', 'SMC + Williams %R com SL/TPs validados'],
            ['notify_prices', '🔔 Alertas de preço', 'Quando alvos por ativo são atingidos'],
            ['notify_whales', '🐋 Movimentos institucionais', 'Whale tracking'],
            ['notify_news', '📰 Notícias relevantes', 'Sentimento de mercado'],
          ] as const).map(([k, label, desc]) => (
            <div key={k} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button onClick={() => setCfg({ ...cfg, [k]: !cfg[k] } as Config)}
                className={`w-12 h-6 rounded-full transition-colors ${cfg[k] ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${cfg[k] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Per-asset alerts */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold mb-4">🔔 Alertas por Ativo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <input className="prisma-input" placeholder="BTCUSDT" value={newAlert.symbol}
            onChange={e => setNewAlert({ ...newAlert, symbol: e.target.value })} />
          <select className="prisma-input" value={newAlert.condition}
            onChange={e => setNewAlert({ ...newAlert, condition: e.target.value as any })}>
            <option value="above">Acima de</option>
            <option value="below">Abaixo de</option>
          </select>
          <input className="prisma-input" type="number" placeholder="Preço alvo" value={newAlert.target_price}
            onChange={e => setNewAlert({ ...newAlert, target_price: e.target.value })} />
          <button onClick={addAlert} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium">+ Adicionar</button>
        </div>
        <input className="prisma-input mb-3" placeholder="Nota (opcional)" value={newAlert.note}
          onChange={e => setNewAlert({ ...newAlert, note: e.target.value })} />
        <div className="space-y-2 max-h-72 overflow-auto">
          {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta criado.</p>}
          {alerts.map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="text-sm">
                <span className="font-mono font-semibold">{a.symbol}</span>{' '}
                <span className="text-muted-foreground">{a.condition === 'above' ? '🚀 ≥' : '📉 ≤'}</span>{' '}
                <span className="font-mono">{a.target_price}</span>
                {a.triggered && <span className="ml-2 text-xs text-prisma-green">✅ Disparado</span>}
                {a.note && <p className="text-xs text-muted-foreground mt-1">{a.note}</p>}
              </div>
              <button onClick={() => removeAlert(a.id)} className="text-destructive text-sm hover:underline">Remover</button>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold mb-4">📜 Histórico & Logs</h3>
        <div className="space-y-1 max-h-80 overflow-auto font-mono text-xs">
          {logs.length === 0 && <p className="text-muted-foreground text-center py-4">Sem registros ainda.</p>}
          {logs.map(l => (
            <div key={l.id} className={`p-2 rounded ${l.status === 'ok' ? 'bg-secondary/40' : 'bg-destructive/10 text-destructive'}`}>
              <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString('pt-BR')}</span>{' '}
              <span className="text-primary">[{l.type}]</span> {l.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
