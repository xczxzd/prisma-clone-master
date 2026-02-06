import React from 'react';
import type { CommunityTrade, TopTrader } from '@/types';
import { PAIRS } from '@/constants/pairs';
import { HeartIcon, ChatIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

const mockTopTraders: TopTrader[] = [
  { rank: 1, name: 'CryptoWhale_BR', avatarUrl: '', weeklyProfit: 847.5 },
  { rank: 2, name: 'SmartMoney_Pro', avatarUrl: '', weeklyProfit: 623.2 },
  { rank: 3, name: 'Baleia_Anônima', avatarUrl: '', weeklyProfit: 512.8 },
  { rank: 4, name: 'TradingMaster', avatarUrl: '', weeklyProfit: 489.3 },
  { rank: 5, name: 'InstitucionalBR', avatarUrl: '', weeklyProfit: 421.1 },
];

const mockTrades: CommunityTrade[] = [
  {
    id: '1',
    user: { name: 'CryptoWhale_BR', avatarUrl: '' },
    pair: PAIRS[0],
    direction: 'LONG',
    profit: 15.7,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 124,
    comments: 23,
  },
  {
    id: '2',
    user: { name: 'SmartMoney_Pro', avatarUrl: '' },
    pair: PAIRS[1],
    direction: 'SHORT',
    profit: 8.3,
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    likes: 89,
    comments: 15,
  },
  {
    id: '3',
    user: { name: 'Baleia_Anônima', avatarUrl: '' },
    pair: PAIRS[3],
    direction: 'LONG',
    profit: 23.4,
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    likes: 256,
    comments: 45,
  },
];

const formatTimeAgo = (date: Date): string => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const TopTraderCard: React.FC<{ trader: TopTrader }> = ({ trader }) => (
  <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
      trader.rank === 1 ? 'bg-prisma-yellow text-black' :
      trader.rank === 2 ? 'bg-gray-300 text-black' :
      trader.rank === 3 ? 'bg-amber-700 text-white' :
      'bg-secondary text-muted-foreground'
    }`}>
      #{trader.rank}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-foreground text-sm">{trader.name}</p>
    </div>
    <p className="text-prisma-green font-mono font-bold">+{trader.weeklyProfit.toFixed(1)}%</p>
  </div>
);

const TradeCard: React.FC<{ trade: CommunityTrade }> = ({ trade }) => (
  <div className="prisma-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold">{trade.user.name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-foreground">{trade.user.name}</p>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(trade.timestamp)} atrás</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full font-semibold text-sm ${
        trade.direction === 'LONG' ? 'bg-prisma-green/20 text-prisma-green' : 'bg-prisma-red/20 text-prisma-red'
      }`}>
        {trade.direction === 'LONG' ? <ArrowUpIcon className="w-4 h-4 inline mr-1" /> : <ArrowDownIcon className="w-4 h-4 inline mr-1" />}
        {trade.direction}
      </div>
    </div>

    <div className="flex items-center justify-between py-3 border-t border-b border-border">
      <div>
        <p className="text-sm text-muted-foreground">Par</p>
        <p className="font-bold text-foreground">{trade.pair.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Lucro</p>
        <p className={`font-bold text-lg ${trade.profit >= 0 ? 'text-prisma-green' : 'text-prisma-red'}`}>
          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(1)}%
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between mt-3 text-muted-foreground">
      <button className="flex items-center space-x-2 hover:text-prisma-red transition-colors">
        <HeartIcon className="w-5 h-5" />
        <span className="text-sm">{trade.likes}</span>
      </button>
      <button className="flex items-center space-x-2 hover:text-primary transition-colors">
        <ChatIcon className="w-5 h-5" />
        <span className="text-sm">{trade.comments}</span>
      </button>
    </div>
  </div>
);

export const Community: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Comunidade</h2>
          <p className="text-muted-foreground">Acompanhe os melhores traders</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-3 w-3 rounded-full bg-prisma-green animate-ping"></div>
            <div className="h-2 w-2 rounded-full bg-prisma-green"></div>
          </div>
          <span className="text-sm text-muted-foreground">1,247 traders online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Traders */}
        <div className="lg:col-span-1">
          <div className="prisma-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Top Traders da Semana</h3>
            <div className="space-y-2">
              {mockTopTraders.map((trader) => (
                <TopTraderCard key={trader.rank} trader={trader} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">📈 Trades Recentes</h3>
          <div className="space-y-4">
            {mockTrades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
