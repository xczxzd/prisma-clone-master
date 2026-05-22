// EventBus institucional simples — pub/sub tipado.
type Handler<T = any> = (payload: T) => void;

class EventBus {
  private map = new Map<string, Set<Handler>>();
  on<T = any>(event: string, h: Handler<T>) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(h as Handler);
    return () => this.off(event, h);
  }
  off(event: string, h: Handler) { this.map.get(event)?.delete(h); }
  emit<T = any>(event: string, payload: T) {
    this.map.get(event)?.forEach(h => { try { h(payload); } catch (e) { console.error('[bus]', event, e); } });
  }
}
export const bus = new EventBus();

export const EV = {
  CANDLE: 'candle',
  TICK: 'tick',
  SIGNAL: 'signal',
  SWEEP: 'sweep',
  WHALE: 'whale',
  REGIME: 'regime',
  ERROR: 'error',
} as const;
