// Sistema local de alertas e execução de sinais (localStorage)
import type { Signal } from '@/types';

const ALERTS_KEY = 'prisma_alerts_v1';
const EXEC_KEY = 'prisma_executions_v1';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  note?: string;
  createdAt: number;
  triggered?: boolean;
  triggeredAt?: number;
}

export interface SignalExecution {
  id: string;
  signalId: string;
  pairId: string;
  pairName: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  confidence: number;
  strategy?: string;
  executedAt: number;
  status: 'OPEN' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'STOPPED';
  currentPrice?: number;
  pnlPercent?: number;
}

export function getAlerts(): PriceAlert[] {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); } catch { return []; }
}
export function saveAlerts(a: PriceAlert[]) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(a));
}
export function addAlert(a: Omit<PriceAlert, 'id' | 'createdAt'>): PriceAlert {
  const alert: PriceAlert = { ...a, id: `alert_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, createdAt: Date.now() };
  const all = getAlerts();
  all.unshift(alert);
  saveAlerts(all);
  return alert;
}
export function removeAlert(id: string) {
  saveAlerts(getAlerts().filter(a => a.id !== id));
}
export function markAlertTriggered(id: string) {
  const all = getAlerts().map(a => a.id === id ? { ...a, triggered: true, triggeredAt: Date.now() } : a);
  saveAlerts(all);
}

export function getExecutions(): SignalExecution[] {
  try { return JSON.parse(localStorage.getItem(EXEC_KEY) || '[]'); } catch { return []; }
}
export function saveExecutions(e: SignalExecution[]) {
  localStorage.setItem(EXEC_KEY, JSON.stringify(e));
}
export function executeSignal(signal: Signal, currentPrice: number): SignalExecution {
  const exec: SignalExecution = {
    id: `exec_${Date.now()}`,
    signalId: signal.id,
    pairId: signal.pair.id,
    pairName: signal.pair.name,
    direction: signal.direction,
    entry: currentPrice,
    stopLoss: signal.stopLoss,
    tp1: signal.takeProfit.level1,
    tp2: signal.takeProfit.level2,
    tp3: signal.takeProfit.level3,
    confidence: signal.confidence,
    strategy: signal.strategyName,
    executedAt: Date.now(),
    status: 'OPEN',
    currentPrice,
    pnlPercent: 0,
  };
  const all = getExecutions();
  all.unshift(exec);
  saveExecutions(all);
  return exec;
}
export function updateExecutionPrice(id: string, price: number) {
  const all = getExecutions().map(e => {
    if (e.id !== id) return e;
    const pnl = e.direction === 'LONG'
      ? ((price - e.entry) / e.entry) * 100
      : ((e.entry - price) / e.entry) * 100;
    let status = e.status;
    if (e.direction === 'LONG') {
      if (price <= e.stopLoss) status = 'STOPPED';
      else if (price >= e.tp3) status = 'TP3_HIT';
      else if (price >= e.tp2) status = 'TP2_HIT';
      else if (price >= e.tp1) status = 'TP1_HIT';
    } else {
      if (price >= e.stopLoss) status = 'STOPPED';
      else if (price <= e.tp3) status = 'TP3_HIT';
      else if (price <= e.tp2) status = 'TP2_HIT';
      else if (price <= e.tp1) status = 'TP1_HIT';
    }
    return { ...e, currentPrice: price, pnlPercent: pnl, status };
  });
  saveExecutions(all);
}
