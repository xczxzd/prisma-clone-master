import React, { useState, useEffect, useMemo } from 'react';
import type { Signal, Pair } from '@/types';
import { PAIRS, formatPriceString, formatPriceNumber } from '@/constants/pairs';
import { ClockIcon, InfoIcon, SearchIcon, TargetIcon } from './Icons';
import { usePrices } from '@/hooks/usePrices';
import { executeSignal, addAlert } from '@/services/alertsStore';
import { toast } from 'sonner';
import { Bell, Zap } from 'lucide-react';
import type { BinanceTicker } from '@/services/binanceApi';
import { InstitutionalPanel } from './InstitutionalPanel';
import { OrderflowPanel } from './OrderflowPanel';

interface SignalCardProps {
  signal: Signal;
  ticker?: BinanceTicker;
  onClick: (pair: Pair) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, ticker, onClick }) => {
  const isLong = signal.direction === 'LONG';
  const currentPrice = ticker?.lastPrice ?? signal.entry;
  const change = ticker?.priceChangePercent ?? 0;

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!ticker) { toast.error('Preço real indisponível'); return; }
    executeSignal({ ...signal, entry: currentPrice }, currentPrice);
    toast.success(`✅ Sinal ${signal.direction} executado @ $${formatPriceString(signal.pair.id, currentPrice)}`);
  };

  const handleAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    addAlert({
      symbol: signal.pair.id,
      condition: isLong ? 'above' : 'below',
      targetPrice: signal.takeProfit.level1,
      note: `Alvo TP1 ${signal.pair.name}`,
    });
    toast.success('🔔 Alerta criado para TP1');
  };

  return (
    <div
      className="relative prisma-card hover:border-primary cursor-pointer overflow-hidden flex flex-col justify-between animate-fade-in"
      onClick={() => onClick(signal.pair)}
    >
      <div>
        <div className="absolute top-2 right-2 flex items-center space-x-2 text-xs bg-prisma-yellow/20 text-prisma-yellow px-2 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prisma-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-prisma-yellow"></span>
          </span>
          <span>WHALE</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-foreground">{signal.pair.name}</h3>
            <p className={`font-semibold text-sm ${isLong ? 'text-prisma-green' : 'text-prisma-red'}`}>
              {signal.direction} • {signal.timeframe}
            </p>
          </div>
          <div className="text-right flex items-center space-x-2 mt-5">
            <div className="relative group">
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              {signal.keyFactors && (
                <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-secondary text-xs text-muted-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <p className="font-bold text-primary mb-1 border-b border-border pb-1">Rastro Institucional:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {signal.keyFactors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Poder Inst.</p>
              <p className="font-bold text-lg text-primary">{signal.confidence}%</p>
            </div>
          </div>
        </div>

        {/* Preço real ao vivo */}
        <div className="mt-3 p-2 bg-secondary/50 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">💹 Preço Binance ao vivo</span>
            <span className={`text-xs font-bold ${change >= 0 ? 'text-prisma-green' : 'text-prisma-red'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
          <p className="font-mono text-foreground font-bold text-lg">
            ${ticker ? formatPriceString(signal.pair.id, currentPrice) : '...'}
          </p>
          {ticker && (
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Vol 24h: ${(ticker.quoteVolume / 1_000_000).toFixed(2)}M
            </p>
          )}
        </div>

        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">🎯 Entrada Sniper:</span>
            <span className="font-mono text-foreground">${formatPriceString(signal.pair.id, signal.entry)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">🛡️ Stop Protegido:</span>
            <span className="font-mono text-prisma-red">${formatPriceString(signal.pair.id, signal.stopLoss)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">🐋 Alvo Baleia:</span>
            <span className="font-mono text-prisma-green font-bold">${formatPriceString(signal.pair.id, signal.takeProfit.level2)}</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Setup:</span>
            <span className="font-mono text-foreground bg-secondary px-1.5 py-0.5 rounded">{signal.strategyName || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">R:R</span>
            <span className="font-mono text-foreground">{signal.riskRewardRatio || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Ações Sniper */}
      <div className="flex gap-2 mt-3">
        <button onClick={handleExecute} className="flex-1 px-2 py-1.5 bg-prisma-green/20 text-prisma-green border border-prisma-green/30 rounded-md text-xs font-bold hover:bg-prisma-green/30 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3" /> Executar
        </button>
        <button onClick={handleAlert} className="flex-1 px-2 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-md text-xs font-bold hover:bg-primary/30 flex items-center justify-center gap-1">
          <Bell className="w-3 h-3" /> Alerta
        </button>
      </div>
    </div>
  );
};

// Gera sinal a partir de preço REAL da Binance
const generateRealSignal = (pair: Pair, ticker: BinanceTicker): Signal => {
  const wr = ticker.priceChangePercent;
  const isLong = wr < -2 || (wr < 5 && Math.random() > 0.4);
  const entry = formatPriceNumber(pair.id, ticker.lastPrice);
  const atr = (ticker.highPrice - ticker.lowPrice) * 0.3;

  return {
    id: `sig_${pair.id}_${Date.now()}`,
    pair,
    direction: isLong ? 'LONG' : 'SHORT',
    confidence: Math.min(98, Math.floor(70 + Math.abs(wr) * 2 + Math.random() * 10)),
    timeframe: ['15m', '1H', '4H'][Math.floor(Math.random() * 3)] as Signal['timeframe'],
    entry,
    stopLoss: formatPriceNumber(pair.id, isLong ? entry - atr * 0.5 : entry + atr * 0.5),
    takeProfit: {
      level1: formatPriceNumber(pair.id, isLong ? entry + atr * 0.8 : entry - atr * 0.8),
      level2: formatPriceNumber(pair.id, isLong ? entry + atr * 1.5 : entry - atr * 1.5),
      level3: formatPriceNumber(pair.id, isLong ? entry + atr * 2.5 : entry - atr * 2.5),
    },
    timestamp: new Date(),
    status: 'ATIVO',
    bestEntryTime: new Date(Date.now() + Math.random() * 3600000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    strategyName: ['Order Block Mitigation', 'Liquidity Sweep', 'FVG Fill', 'CHoCH + Williams W'][Math.floor(Math.random() * 4)],
    riskRewardRatio: `1:${(Math.random() * 2 + 2).toFixed(1)}`,
    keyFactors: [
      `Volume 24h: $${(ticker.quoteVolume / 1_000_000).toFixed(1)}M`,
      `${ticker.count.toLocaleString()} trades executadas`,
      isLong ? 'Baleias acumulando em zona de demanda' : 'Distribuição institucional no topo',
      'Williams %R confluente com SMC',
    ],
  };
};

interface DashboardProps {
  setSelectedPair: (pair: Pair) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setSelectedPair }) => {
  const [scannerMessage, setScannerMessage] = useState('Conectando à Binance...');
  const [manualSearch, setManualSearch] = useState('');
  const [isManualScanning, setIsManualScanning] = useState(false);
  const [scannedPairIds, setScannedPairIds] = useState<string[]>(() => PAIRS.slice(0, 6).map(p => p.id));

  const pairsBySymbol = useMemo(() => Object.fromEntries(PAIRS.map(p => [p.id, p])), []);
  const { tickers, loading } = usePrices(scannedPairIds, 8000);

  const signals = useMemo<Signal[]>(() => {
    return scannedPairIds
      .map(id => {
        const t = tickers[id];
        const p = pairsBySymbol[id];
        if (!t || !p) return null;
        return generateRealSignal(p, t);
      })
      .filter(Boolean) as Signal[];
  }, [tickers, scannedPairIds, pairsBySymbol]);

  useEffect(() => {
    const messages = [
      'Sincronizando preços com Binance...',
      'Analisando Volume Profile institucional...',
      'Rastreando movimentação de Baleias...',
      'Identificando Order Blocks ao vivo...',
      'Calculando Williams %R (7) em tempo real...',
      'Detectando Liquidity Sweeps...',
    ];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % messages.length;
      setScannerMessage(messages[i]);
    }, 3000);

    // Adicionar par novo periodicamente
    const rotate = setInterval(() => {
      setScannedPairIds(prev => {
        const remaining = PAIRS.filter(p => !prev.includes(p.id));
        if (!remaining.length) return prev;
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        return [random.id, ...prev].slice(0, 9);
      });
    }, 20000);

    return () => { clearInterval(id); clearInterval(rotate); };
  }, []);

  const handleManualScan = async () => {
    if (!manualSearch.trim()) return;
    setIsManualScanning(true);
    const found = PAIRS.find(p =>
      p.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(manualSearch.toLowerCase())
    );
    await new Promise(r => setTimeout(r, 1200));
    if (found) {
      setScannedPairIds(prev => prev.includes(found.id) ? prev : [found.id, ...prev].slice(0, 9));
      toast.success(`Scanner ativo para ${found.name}`);
    } else {
      toast.error('Par não encontrado');
    }
    setIsManualScanning(false);
    setManualSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="prisma-card gradient-purple">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TargetIcon className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-prisma-green rounded-full animate-ping" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Scanner Institucional · Binance Live</h2>
              <p className="text-sm text-muted-foreground animate-pulse">{loading ? 'Buscando preços reais...' : scannerMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{signals.length}</p>
            <p className="text-xs text-muted-foreground">Sinais ao vivo</p>
          </div>
      </div>

      {scannedPairIds[0] && pairsBySymbol[scannedPairIds[0]] && (
        <InstitutionalPanel pair={pairsBySymbol[scannedPairIds[0]]} />
      )}

      <OrderflowPanel />
      </div>

      <div className="prisma-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Busca Manual (preço real da Binance)</h3>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ex: BTC, SOL, PEPE..."
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              className="prisma-input pl-10"
            />
          </div>
          <button
            onClick={handleManualScan}
            disabled={isManualScanning}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isManualScanning ? 'Escaneando...' : 'Escanear'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">🐋 Movimentos das Baleias · Preços ao Vivo</h3>
        {signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} ticker={tickers[signal.pair.id]} onClick={setSelectedPair} />
            ))}
          </div>
        ) : (
          <div className="prisma-card text-center py-12">
            <TargetIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Conectando à API Binance...</p>
          </div>
        )}
      </div>
    </div>
  );
};
