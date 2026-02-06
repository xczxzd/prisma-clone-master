import React, { useState, useEffect } from 'react';
import type { Signal, Pair } from '@/types';
import { PAIRS, formatPriceString, formatPriceNumber } from '@/constants/pairs';
import { ClockIcon, InfoIcon, SearchIcon, TargetIcon } from './Icons';

interface SignalCardProps {
  signal: Signal;
  onClick: (pair: Pair) => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onClick }) => {
  const isLong = signal.direction === 'LONG';

  return (
    <div
      className="relative prisma-card hover:border-primary cursor-pointer overflow-hidden flex flex-col justify-between animate-fade-in"
      onClick={() => onClick(signal.pair)}
    >
      <div>
        {/* Whale Alert Badge */}
        <div className="absolute top-2 right-2 flex items-center space-x-2 text-xs bg-prisma-yellow/20 text-prisma-yellow px-2 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prisma-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-prisma-yellow"></span>
          </span>
          <span>WHALE ALERT</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-foreground">{signal.pair.name}</h3>
            <p className={`font-semibold text-sm ${isLong ? 'text-prisma-green' : 'text-prisma-red'}`}>
              {signal.direction}
            </p>
          </div>
          <div className="text-right flex items-center space-x-2">
            <div className="relative group">
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              {signal.keyFactors && (
                <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-secondary text-xs text-muted-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <p className="font-bold text-primary mb-1 border-b border-border pb-1">
                    Rastro Institucional:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {signal.keyFactors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
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

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entrada Sniper:</span>
            <span className="font-mono text-foreground">
              ${formatPriceString(signal.pair.id, signal.entry)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stop Protegido:</span>
            <span className="font-mono text-prisma-red">
              ${formatPriceString(signal.pair.id, signal.stopLoss)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Alvo da Baleia:</span>
            <span className="font-mono text-prisma-green font-bold">
              ${formatPriceString(signal.pair.id, signal.takeProfit.level2)}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Setup:</span>
            <span className="font-mono text-foreground font-semibold bg-secondary px-2 py-0.5 rounded-md text-xs truncate">
              {signal.strategyName || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Risco/Retorno:</span>
            <span className="font-mono text-foreground font-semibold">
              {signal.riskRewardRatio || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Timeframe:</span>
            <span className="font-mono text-foreground font-semibold bg-secondary px-2 py-0.5 rounded-md">
              {signal.timeframe}
            </span>
          </div>
          {signal.bestEntryTime && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center space-x-1.5">
                <ClockIcon className="h-4 w-4" />
                <span>Hora do Pump/Dump:</span>
              </span>
              <span className="font-mono text-primary font-bold text-base animate-pulse">
                {signal.bestEntryTime}
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="text-right text-xs text-muted-foreground mt-3 self-end">
        {signal.timestamp.toLocaleTimeString()}
      </p>
    </div>
  );
};

// Generate mock signals
const generateMockSignal = (pair: Pair): Signal => {
  const isLong = Math.random() > 0.5;
  const basePrice = Math.random() * 50000 + 1000;
  const entry = formatPriceNumber(pair.id, basePrice);
  const moveSize = basePrice * (Math.random() * 0.05 + 0.02);
  
  return {
    id: `signal-${Date.now()}-${pair.id}`,
    pair,
    direction: isLong ? 'LONG' : 'SHORT',
    confidence: Math.floor(Math.random() * 15) + 85,
    timeframe: ['5m', '15m', '1H', '4H'][Math.floor(Math.random() * 4)] as Signal['timeframe'],
    entry,
    stopLoss: formatPriceNumber(pair.id, isLong ? entry - moveSize * 0.3 : entry + moveSize * 0.3),
    takeProfit: {
      level1: formatPriceNumber(pair.id, isLong ? entry + moveSize * 0.5 : entry - moveSize * 0.5),
      level2: formatPriceNumber(pair.id, isLong ? entry + moveSize : entry - moveSize),
      level3: formatPriceNumber(pair.id, isLong ? entry + moveSize * 1.5 : entry - moveSize * 1.5),
    },
    timestamp: new Date(),
    status: 'ATIVO',
    bestEntryTime: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    strategyName: ['Mitigação de Order Block', 'Liquidity Sweep', 'Wyckoff Spring', 'FVG Fill'][Math.floor(Math.random() * 4)],
    riskRewardRatio: `1:${Math.floor(Math.random() * 4) + 3}`,
    keyFactors: [
      'Acumulação de Baleias detectada',
      'Varejo preso no topo',
      'Gap de Valor Justo (FVG)',
      'Stop Hunt confirmado',
    ].slice(0, Math.floor(Math.random() * 3) + 2),
  };
};

interface DashboardProps {
  setSelectedPair: (pair: Pair) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setSelectedPair }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [scannerMessage, setScannerMessage] = useState('Conectando aos nodes da Blockchain...');
  const [manualSearch, setManualSearch] = useState('');
  const [isManualScanning, setIsManualScanning] = useState(false);

  // Auto scanner
  useEffect(() => {
    const messages = [
      'Conectando aos nodes da Blockchain...',
      'Analisando Volume Profile institucional...',
      'Rastreando movimentação de Baleias...',
      'Identificando Order Blocks...',
      'Detectando Liquidity Sweeps...',
      'Processando dados de Smart Money...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setScannerMessage(messages[messageIndex]);
    }, 3000);

    // Generate initial signals
    const initialSignals = PAIRS.slice(0, 3).map(generateMockSignal);
    setSignals(initialSignals);

    // Periodically add new signals
    const signalInterval = setInterval(() => {
      const randomPair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
      const newSignal = generateMockSignal(randomPair);
      setSignals((prev) => [newSignal, ...prev].slice(0, 10));
    }, 15000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(signalInterval);
    };
  }, []);

  const handleManualScan = async () => {
    if (!manualSearch.trim()) return;
    
    setIsManualScanning(true);
    const foundPair = PAIRS.find(
      (p) => p.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
             p.id.toLowerCase().includes(manualSearch.toLowerCase())
    );

    // Simulate scanning
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (foundPair) {
      const newSignal = generateMockSignal(foundPair);
      setSignals((prev) => [newSignal, ...prev].slice(0, 10));
    }

    setIsManualScanning(false);
    setManualSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Scanner Status */}
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
              <h2 className="text-lg font-bold text-foreground">Scanner Institucional</h2>
              <p className="text-sm text-muted-foreground animate-pulse">{scannerMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{signals.length}</p>
            <p className="text-xs text-muted-foreground">Sinais Ativos</p>
          </div>
        </div>
      </div>

      {/* Manual Search */}
      <div className="prisma-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Busca Manual</h3>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar par específico (ex: BTC, SOL)..."
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

      {/* Signals Grid */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          🐋 Movimentos das Baleias Detectados
        </h3>
        {signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} onClick={setSelectedPair} />
            ))}
          </div>
        ) : (
          <div className="prisma-card text-center py-12">
            <TargetIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aguardando detecção de movimentos institucionais...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
