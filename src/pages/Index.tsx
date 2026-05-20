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
  AlertsPanel,
} from '@/components/prisma';
import { AnalysisModal } from '@/components/prisma/AnalysisModal';
const bgCircuit = '/images/bg-circuit.jpg';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [selectedPair, setSelectedPair] = useState<Pair>(PAIRS[0]);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisPair, setAnalysisPair] = useState<Pair>(PAIRS[0]);

  const handleSelectPair = (pair: Pair) => {
    setSelectedPair(pair);
    if (['Dashboard', 'Community', 'EconomicCalendar', 'NewsFeed', 'TelegramSettings', 'SignalHistory', 'StrategyV3', 'RiskManagement', 'Alerts'].includes(currentView)) {
      setCurrentView('TechnicalAnalysis');
    }
  };

  const handleAnalyze = (pair: Pair) => {
    setAnalysisPair(pair);
    setAnalysisModalOpen(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard setSelectedPair={handleSelectPair} />;
      case 'Community':
        return <Community />;
      case 'TechnicalAnalysis':
        return <TechnicalAnalysis pair={selectedPair} onAnalyze={handleAnalyze} />;
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
      case 'Alerts':
        return <AlertsPanel />;
      default:
        return <Dashboard setSelectedPair={handleSelectPair} />;
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden font-display">
      {/* Circuit board background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${bgCircuit})` }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      {/* Purple glow blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl z-0" />

      {/* Content */}
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedPair={selectedPair}
          setSelectedPair={handleSelectPair}
          onAnalyze={handleAnalyze}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        pair={analysisPair}
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
      />
    </div>
  );
};

export default Index;
