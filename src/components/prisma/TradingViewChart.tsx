import React, { useEffect, useRef, useState } from 'react';
import type { Pair } from '@/types';
import { MaximizeIcon, MinimizeIcon } from './Icons';

interface TradingViewChartProps {
  pair: Pair;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ pair }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const symbol = `BINANCE:${pair.id}`;

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '1',
      timezone: 'America/Sao_Paulo',
      theme: 'dark',
      style: '1',
      locale: 'br',
      backgroundColor: 'rgba(15, 10, 25, 1)',
      gridColor: 'rgba(100, 50, 150, 0.06)',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_side_toolbar: false,
      studies: [
        'Volume@tv-basicstudies',
        'WilliamsR@tv-basicstudies',
      ],
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': 'hsl(145, 70%, 45%)',
        'mainSeriesProperties.candleStyle.downColor': 'hsl(0, 72%, 55%)',
        'mainSeriesProperties.candleStyle.borderUpColor': 'hsl(145, 70%, 45%)',
        'mainSeriesProperties.candleStyle.borderDownColor': 'hsl(0, 72%, 55%)',
        'mainSeriesProperties.candleStyle.wickUpColor': 'hsl(145, 70%, 45%)',
        'mainSeriesProperties.candleStyle.wickDownColor': 'hsl(0, 72%, 55%)',
      },
    });
    
    containerRef.current.appendChild(script);
  }, [symbol]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-secondary/80 hover:bg-primary/30 border border-border transition-colors"
        title={isFullscreen ? 'Minimizar' : 'Tela Cheia'}
      >
        {isFullscreen ? (
          <MinimizeIcon className="w-5 h-5 text-foreground" />
        ) : (
          <MaximizeIcon className="w-5 h-5 text-foreground" />
        )}
      </button>
      
      <div
        ref={containerRef}
        className={`tradingview-widget-container ${isFullscreen ? 'h-screen w-screen' : 'h-[500px] w-full'} rounded-lg overflow-hidden border border-border`}
      />
    </div>
  );
};
