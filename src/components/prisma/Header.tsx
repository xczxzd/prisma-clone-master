import React, { useState, useEffect } from 'react';
import { PrismaLogo } from './Icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="glass rounded-lg p-3 border border-border/50">
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-bold font-mono text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass border-b border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <PrismaLogo className="w-10 h-10 float" />
          <div>
            <h1 className="text-xl font-bold font-display text-gradient">PRISMA IA</h1>
            <p className="text-xs text-muted-foreground">Motor de Análise Técnica</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-3 w-3 rounded-full bg-prisma-green animate-ping"></div>
              <div className="h-2 w-2 rounded-full bg-prisma-green"></div>
            </div>
            <span className="text-sm text-prisma-green font-medium">Ativo</span>
          </div>
          {/* Clock */}
          <div className="font-mono text-lg text-primary font-bold">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="📊" title="Sinais Hoje" value="24" />
        <StatCard icon="🎯" title="Taxa de Acerto" value="87.3%" />
        <StatCard icon="⚡" title="Último Sinal" value="BTC LONG" />
        <StatCard icon="⏱️" title="Tempo Ativo" value="12h 34m" />
      </div>
    </header>
  );
};
