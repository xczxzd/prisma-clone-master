// Binance Futures WebSocket Manager — multi-stream com auto-reconnect.
// Streams suportadas: kline, aggTrade, markPrice, forceOrder (liquidations).
import { bus, EV } from '@/core/eventBus';

type StreamHandler = (data: any) => void;

interface Subscription {
  stream: string;
  handlers: Set<StreamHandler>;
}

const WS_BASE = 'wss://fstream.binance.com/stream?streams=';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subs = new Map<string, Subscription>();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private lastMessageAt = 0;
  private connecting = false;
  private intentionallyClosed = false;

  subscribe(stream: string, handler: StreamHandler): () => void {
    const s = stream.toLowerCase();
    let sub = this.subs.get(s);
    if (!sub) {
      sub = { stream: s, handlers: new Set() };
      this.subs.set(s, sub);
      this.reconnect();
    }
    sub.handlers.add(handler);
    return () => this.unsubscribe(s, handler);
  }

  unsubscribe(stream: string, handler: StreamHandler) {
    const sub = this.subs.get(stream);
    if (!sub) return;
    sub.handlers.delete(handler);
    if (sub.handlers.size === 0) {
      this.subs.delete(stream);
      this.reconnect();
    }
  }

  private buildUrl(): string | null {
    if (this.subs.size === 0) return null;
    return WS_BASE + Array.from(this.subs.keys()).join('/');
  }

  private reconnect() {
    if (this.ws) {
      this.intentionallyClosed = true;
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    const url = this.buildUrl();
    if (!url) return;
    this.intentionallyClosed = false;
    this.connect(url);
  }

  private connect(url: string) {
    if (this.connecting) return;
    this.connecting = true;
    try {
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => {
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.lastMessageAt = Date.now();
        this.startHeartbeat();
        bus.emit('ws:open', { url });
      };
      ws.onmessage = (ev) => {
        this.lastMessageAt = Date.now();
        try {
          const msg = JSON.parse(ev.data);
          const stream = msg.stream as string | undefined;
          if (!stream) return;
          const sub = this.subs.get(stream);
          sub?.handlers.forEach(h => { try { h(msg.data); } catch (e) { console.error('[ws handler]', e); } });
        } catch (e) {
          console.error('[ws parse]', e);
        }
      };
      ws.onerror = (e) => { bus.emit(EV.ERROR, { src: 'ws', e }); };
      ws.onclose = () => {
        this.connecting = false;
        this.stopHeartbeat();
        if (this.intentionallyClosed) return;
        const delay = Math.min(30000, 1000 * Math.pow(1.6, this.reconnectAttempts++));
        this.reconnectTimer = window.setTimeout(() => {
          const u = this.buildUrl();
          if (u) this.connect(u);
        }, delay);
      };
    } catch (e) {
      this.connecting = false;
      console.error('[ws connect]', e);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (Date.now() - this.lastMessageAt > 60_000) {
        // Sem dados há 60s → forçar reconexão
        this.reconnect();
      }
    }, 15_000);
  }
  private stopHeartbeat() {
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
  }

  close() {
    this.intentionallyClosed = true;
    this.subs.clear();
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    try { this.ws?.close(); } catch {}
    this.ws = null;
  }
}

export const wsManager = new WebSocketManager();
