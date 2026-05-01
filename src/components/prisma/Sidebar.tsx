import React, { useState } from 'react';
import type { Pair, View } from '@/types';
import { PAIRS } from '@/constants/pairs';
import { NavLink } from './NavLink';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrendingUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarIcon,
  NewspaperIcon,
  PaperAirplaneIcon,
  CollectionIcon,
  CogIcon,
  PrismaLogo,
} from './Icons';
import { Brain } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedPair: Pair;
  setSelectedPair: (pair: Pair) => void;
  onAnalyze?: (pair: Pair) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  selectedPair,
  setSelectedPair,
  onAnalyze,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const groupedPairs = PAIRS.reduce((acc, pair) => {
    (acc[pair.group] = acc[pair.group] || []).push(pair);
    return acc;
  }, {} as Record<string, Pair[]>);

  const filteredPairs = Object.entries(groupedPairs)
    .map(([group, pairs]) => {
      const filtered = pairs.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { group, pairs: filtered };
    })
    .filter((g) => g.pairs.length > 0);

  return (
    <aside className="w-72 glass flex flex-col h-full border-r border-border/50">
      {/* Logo */}
      <div className="p-4 flex items-center space-x-3 border-b border-border/50">
        <PrismaLogo className="w-10 h-10 float" />
        <h1 className="text-xl font-bold font-display text-gradient">PRISMA IA</h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 border-b border-border/50">
        <NavLink Icon={HomeIcon} label="Dashboard" isActive={currentView === 'Dashboard'} onClick={() => setCurrentView('Dashboard')} />
        <NavLink Icon={UserGroupIcon} label="Comunidade" isActive={currentView === 'Community'} onClick={() => setCurrentView('Community')} />
        <NavLink Icon={ChartBarIcon} label="Análise Técnica" isActive={currentView === 'TechnicalAnalysis'} onClick={() => setCurrentView('TechnicalAnalysis')} />
        <NavLink Icon={TrendingUpIcon} label="Projeção de Preços" isActive={currentView === 'PriceProjection'} onClick={() => setCurrentView('PriceProjection')} />
        <NavLink Icon={SparklesIcon} label="Previsão Semanal IA" isActive={currentView === 'WeeklyForecast'} onClick={() => setCurrentView('WeeklyForecast')} />
        <NavLink Icon={ShieldCheckIcon} label="Gestão de Risco" isActive={currentView === 'RiskManagement'} onClick={() => setCurrentView('RiskManagement')} />
        <NavLink Icon={CalendarIcon} label="Calendário Econômico" isActive={currentView === 'EconomicCalendar'} onClick={() => setCurrentView('EconomicCalendar')} />
        <NavLink Icon={NewspaperIcon} label="Feed de Notícias" isActive={currentView === 'NewsFeed'} onClick={() => setCurrentView('NewsFeed')} />
        <NavLink Icon={PaperAirplaneIcon} label="Integração Telegram" isActive={currentView === 'TelegramSettings'} onClick={() => setCurrentView('TelegramSettings')} />
        <NavLink Icon={CollectionIcon} label="Histórico de Sinais" isActive={currentView === 'SignalHistory'} onClick={() => setCurrentView('SignalHistory')} />
        <NavLink Icon={CogIcon} label="Estratégia V3" isActive={currentView === 'StrategyV3'} onClick={() => setCurrentView('StrategyV3')} />
      </nav>

      {/* Pairs List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-display">
          Pares Binance ({PAIRS.length})
        </h2>
        <input
          type="text"
          placeholder="Buscar par..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="prisma-input mb-4"
        />
        <div className="space-y-4">
          {filteredPairs.map(({ group, pairs }) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 font-display">
                {group}
              </h3>
              <div className="space-y-1">
                {pairs.map((pair) => (
                  <div
                    key={pair.id}
                    className={`flex items-center justify-between rounded-md text-sm transition-colors duration-200 ${
                      selectedPair.id === pair.id
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedPair(pair)}
                      className="flex-1 text-left px-3 py-2"
                    >
                      {pair.name}
                    </button>
                    {/* Analyze button on each pair */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPair(pair);
                        onAnalyze?.(pair);
                      }}
                      className="p-1.5 mr-1 rounded hover:bg-primary/20 transition-colors"
                      title="Analisar"
                    >
                      <Brain className="w-3.5 h-3.5 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
