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

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedPair: Pair;
  setSelectedPair: (pair: Pair) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  selectedPair,
  setSelectedPair,
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
    <aside className="w-72 bg-card flex flex-col h-full border-r border-border">
      {/* Logo */}
      <div className="p-4 flex items-center space-x-3 border-b border-border">
        <PrismaLogo className="w-10 h-10 text-primary animate-pulse" />
        <h1 className="text-xl font-bold text-foreground">PRISMA IA</h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 border-b border-border">
        <NavLink
          Icon={HomeIcon}
          label="Dashboard"
          isActive={currentView === 'Dashboard'}
          onClick={() => setCurrentView('Dashboard')}
        />
        <NavLink
          Icon={UserGroupIcon}
          label="Comunidade"
          isActive={currentView === 'Community'}
          onClick={() => setCurrentView('Community')}
        />
        <NavLink
          Icon={ChartBarIcon}
          label="Análise Técnica"
          isActive={currentView === 'TechnicalAnalysis'}
          onClick={() => setCurrentView('TechnicalAnalysis')}
        />
        <NavLink
          Icon={TrendingUpIcon}
          label="Projeção de Preços"
          isActive={currentView === 'PriceProjection'}
          onClick={() => setCurrentView('PriceProjection')}
        />
        <NavLink
          Icon={SparklesIcon}
          label="Previsão Semanal IA"
          isActive={currentView === 'WeeklyForecast'}
          onClick={() => setCurrentView('WeeklyForecast')}
        />
        <NavLink
          Icon={ShieldCheckIcon}
          label="Gestão de Risco"
          isActive={currentView === 'RiskManagement'}
          onClick={() => setCurrentView('RiskManagement')}
        />
        <NavLink
          Icon={CalendarIcon}
          label="Calendário Econômico"
          isActive={currentView === 'EconomicCalendar'}
          onClick={() => setCurrentView('EconomicCalendar')}
        />
        <NavLink
          Icon={NewspaperIcon}
          label="Feed de Notícias"
          isActive={currentView === 'NewsFeed'}
          onClick={() => setCurrentView('NewsFeed')}
        />
        <NavLink
          Icon={PaperAirplaneIcon}
          label="Integração Telegram"
          isActive={currentView === 'TelegramSettings'}
          onClick={() => setCurrentView('TelegramSettings')}
        />
        <NavLink
          Icon={CollectionIcon}
          label="Histórico de Sinais"
          isActive={currentView === 'SignalHistory'}
          onClick={() => setCurrentView('SignalHistory')}
        />
        <NavLink
          Icon={CogIcon}
          label="Estratégia V3"
          isActive={currentView === 'StrategyV3'}
          onClick={() => setCurrentView('StrategyV3')}
        />
      </nav>

      {/* Pairs List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Pares Binance
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {group}
              </h3>
              <div className="space-y-1">
                {pairs.map((pair) => (
                  <button
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      selectedPair.id === pair.id
                        ? 'bg-primary/20 text-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {pair.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
