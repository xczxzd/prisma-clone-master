import type { Pair } from '@/types';

export const PAIRS: Pair[] = [
  // Criptomoedas Principais
  { id: 'BTCUSDT', name: 'BTC/USDT', group: 'Criptomoedas Principais' },
  { id: 'ETHUSDT', name: 'ETH/USDT', group: 'Criptomoedas Principais' },
  { id: 'BNBUSDT', name: 'BNB/USDT', group: 'Criptomoedas Principais' },
  { id: 'SOLUSDT', name: 'SOL/USDT', group: 'Criptomoedas Principais' },
  { id: 'XRPUSDT', name: 'XRP/USDT', group: 'Criptomoedas Principais' },

  // Layer 1 / Layer 2
  { id: 'ADAUSDT', name: 'ADA/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'AVAXUSDT', name: 'AVAX/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'DOTUSDT', name: 'DOT/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'MATICUSDT', name: 'MATIC/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'ATOMUSDT', name: 'ATOM/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'NEARUSDT', name: 'NEAR/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'OPUSDT', name: 'OP/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'ARBUSDT', name: 'ARB/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'SUIUSDT', name: 'SUI/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'SEIUSDT', name: 'SEI/USDT', group: 'Layer 1 / Layer 2' },

  // DeFi
  { id: 'LINKUSDT', name: 'LINK/USDT', group: 'DeFi' },
  { id: 'UNIUSDT', name: 'UNI/USDT', group: 'DeFi' },
  { id: 'AAVEUSDT', name: 'AAVE/USDT', group: 'DeFi' },
  { id: 'LDOUSDT', name: 'LDO/USDT', group: 'DeFi' },
  { id: 'MKRUSDT', name: 'MKR/USDT', group: 'DeFi' },
  { id: 'SNXUSDT', name: 'SNX/USDT', group: 'DeFi' },
  { id: 'RUNEUSDT', name: 'RUNE/USDT', group: 'DeFi' },

  // Metaverso e Jogos
  { id: 'AXSUSDT', name: 'AXS/USDT', group: 'Metaverso e Jogos' },
  { id: 'SANDUSDT', name: 'SAND/USDT', group: 'Metaverso e Jogos' },
  { id: 'MANAUSDT', name: 'MANA/USDT', group: 'Metaverso e Jogos' },
  { id: 'IMXUSDT', name: 'IMX/USDT', group: 'Metaverso e Jogos' },

  // IA / AI
  { id: 'FETUSDT', name: 'FET/USDT', group: 'Inteligência Artificial' },
  { id: 'AGIXUSDT', name: 'AGIX/USDT', group: 'Inteligência Artificial' },
  { id: 'OCEANUSDT', name: 'OCEAN/USDT', group: 'Inteligência Artificial' },
  { id: 'RNDRUSDT', name: 'RNDR/USDT', group: 'Inteligência Artificial' },

  // Meme Coins
  { id: 'DOGEUSDT', name: 'DOGE/USDT', group: 'Meme Coins' },
  { id: 'SHIBUSDT', name: 'SHIB/USDT', group: 'Meme Coins' },
  { id: 'PEPEUSDT', name: 'PEPE/USDT', group: 'Meme Coins' },
  { id: 'BONKUSDT', name: 'BONK/USDT', group: 'Meme Coins' },
  { id: 'WIFUSDT', name: 'WIF/USDT', group: 'Meme Coins' },
];

export const getPairPriceDecimals = (pairId: string): number => {
  // High precision (meme coins)
  if (pairId === 'SHIBUSDT') return 8;
  if (pairId === 'PEPEUSDT') return 7;
  if (pairId === 'BONKUSDT') return 6;
  if (pairId === 'DOGEUSDT') return 5;

  // 4 decimals (many altcoins)
  if ([
    'ADAUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'NEARUSDT', 'OPUSDT',
    'ARBUSDT', 'SUIUSDT', 'SEIUSDT', 'FETUSDT', 'AGIXUSDT', 'OCEANUSDT',
    'RNDRUSDT', 'WIFUSDT', 'IMXUSDT', 'RUNEUSDT', 'UNIUSDT', 'AAVEUSDT',
  ].includes(pairId)) return 4;

  // 3 decimals
  if (['AVAXUSDT', 'SANDUSDT', 'MANAUSDT', 'DOTUSDT', 'ATOMUSDT'].includes(pairId)) return 3;

  // Default to 2 decimals for major pairs
  return 2;
};

export const formatPriceNumber = (pairId: string, price: number): number => {
  const decimals = getPairPriceDecimals(pairId);
  return parseFloat(price.toFixed(decimals));
};

export const formatPriceString = (pairId: string, price: number): string => {
  const decimals = getPairPriceDecimals(pairId);
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
