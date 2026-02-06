import React, { useState } from 'react';
import type { Pair, View } from '@/types';
import { PAIRS } from '@/constants/pairs';
import {
  Sidebar,
  Header,
  Dashboard,
  TechnicalAnalysis,
  PriceProjection,
  WeeklyForecast,
  EconomicCalendar,
  NewsFeed,
  TelegramSettings,
  SignalHistory,
  StrategyV3,
  RiskManagement,
  Community,
} from '@/components/prisma';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [selectedPair, setSelectedPair] = useState<Pair>(PAIRS[0]);

  const handleSelectPair = (pair: Pair) => {
    setSelectedPair(pair);
    // Navigate to TechnicalAnalysis when selecting a pair from non-pair views
    if (['Dashboard', 'Community', 'EconomicCalendar', 'NewsFeed', 'TelegramSettings', 'SignalHistory', 'StrategyV3', 'RiskManagement'].includes(currentView)) {
      setCurrentView('TechnicalAnalysis');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard setSelectedPair={handleSelectPair} />;
      case 'Community':
        return <Community />;
      case 'TechnicalAnalysis':
        return <TechnicalAnalysis pair={selectedPair} />;
      case 'PriceProjection':
        return <PriceProjection pair={selectedPair} />;
      case 'WeeklyForecast':
        return <WeeklyForecast pair={selectedPair} />;
      case 'EconomicCalendar':
        return <EconomicCalendar />;
      case 'NewsFeed':
        return <NewsFeed />;
      case 'TelegramSettings':
        return <TelegramSettings />;
      case 'SignalHistory':
        return <SignalHistory />;
      case 'StrategyV3':
        return <StrategyV3 />;
      case 'RiskManagement':
        return <RiskManagement />;
      default:
        return <Dashboard setSelectedPair={handleSelectPair} />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedPair={selectedPair}
        setSelectedPair={handleSelectPair}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
