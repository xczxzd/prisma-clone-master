import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive }) => (
  <div className="prisma-card">
    <p className="text-sm text-muted-foreground">{title}</p>
    <div className="flex items-baseline space-x-2">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      {change && (
        <p className={`text-sm font-medium ${isPositive ? 'text-prisma-green' : 'text-prisma-red'}`}>
          {isPositive ? '+' : ''}{change}
        </p>
      )}
    </div>
  </div>
);

export const Header: React.FC = () => {
  // Mock data - em um app real, viria de uma API
  const balance = '$10,847.32';
  const pnlToday = '234.56';
  const winRate = '87.3%';

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Saldo Total" value={balance} />
        <StatCard title="P&L Hoje" value={`$${pnlToday}`} change="782% META" isPositive={true} />
        <StatCard title="Win Rate" value={winRate} />
        <div className="prisma-card flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-3 w-3 rounded-full bg-prisma-green animate-ping"></div>
              <div className="h-2 w-2 rounded-full bg-prisma-green"></div>
            </div>
            <p className="text-lg font-semibold text-prisma-green">Escaneando...</p>
          </div>
        </div>
      </div>
    </header>
  );
};
