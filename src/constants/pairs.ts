import type { Pair } from '@/types';

export const PAIRS: Pair[] = [
  // Criptomoedas Principais
  { id: 'BTCUSDT', name: 'BTC/USDT', group: 'Criptomoedas Principais' },
  { id: 'ETHUSDT', name: 'ETH/USDT', group: 'Criptomoedas Principais' },
  { id: 'BNBUSDT', name: 'BNB/USDT', group: 'Criptomoedas Principais' },
  { id: 'SOLUSDT', name: 'SOL/USDT', group: 'Criptomoedas Principais' },
  { id: 'XRPUSDT', name: 'XRP/USDT', group: 'Criptomoedas Principais' },
  { id: 'ADAUSDT', name: 'ADA/USDT', group: 'Criptomoedas Principais' },
  { id: 'DOGEUSDT', name: 'DOGE/USDT', group: 'Criptomoedas Principais' },
  { id: 'TRXUSDT', name: 'TRX/USDT', group: 'Criptomoedas Principais' },
  { id: 'TONUSDT', name: 'TON/USDT', group: 'Criptomoedas Principais' },
  { id: 'LTCUSDT', name: 'LTC/USDT', group: 'Criptomoedas Principais' },

  // Layer 1 / Layer 2
  { id: 'AVAXUSDT', name: 'AVAX/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'DOTUSDT', name: 'DOT/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'MATICUSDT', name: 'MATIC/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'ATOMUSDT', name: 'ATOM/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'NEARUSDT', name: 'NEAR/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'OPUSDT', name: 'OP/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'ARBUSDT', name: 'ARB/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'SUIUSDT', name: 'SUI/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'SEIUSDT', name: 'SEI/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'APTUSDT', name: 'APT/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'INJUSDT', name: 'INJ/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'TIAUSDT', name: 'TIA/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'STXUSDT', name: 'STX/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'MANTAUSDT', name: 'MANTA/USDT', group: 'Layer 1 / Layer 2' },
  { id: 'JUPUSDT', name: 'JUP/USDT', group: 'Layer 1 / Layer 2' },

  // DeFi
  { id: 'LINKUSDT', name: 'LINK/USDT', group: 'DeFi' },
  { id: 'UNIUSDT', name: 'UNI/USDT', group: 'DeFi' },
  { id: 'AAVEUSDT', name: 'AAVE/USDT', group: 'DeFi' },
  { id: 'LDOUSDT', name: 'LDO/USDT', group: 'DeFi' },
  { id: 'MKRUSDT', name: 'MKR/USDT', group: 'DeFi' },
  { id: 'SNXUSDT', name: 'SNX/USDT', group: 'DeFi' },
  { id: 'RUNEUSDT', name: 'RUNE/USDT', group: 'DeFi' },
  { id: 'CRVUSDT', name: 'CRV/USDT', group: 'DeFi' },
  { id: 'COMPUSDT', name: 'COMP/USDT', group: 'DeFi' },
  { id: 'PENDLEUSDT', name: 'PENDLE/USDT', group: 'DeFi' },
  { id: 'JUPUSDT', name: 'JUP/USDT', group: 'DeFi' },
  { id: 'ENAUSDT', name: 'ENA/USDT', group: 'DeFi' },

  // IA / AI
  { id: 'FETUSDT', name: 'FET/USDT', group: 'Inteligência Artificial' },
  { id: 'RNDRUSDT', name: 'RNDR/USDT', group: 'Inteligência Artificial' },
  { id: 'TAOUSDT', name: 'TAO/USDT', group: 'Inteligência Artificial' },
  { id: 'WLDUSDT', name: 'WLD/USDT', group: 'Inteligência Artificial' },
  { id: 'ARKMUSDT', name: 'ARKM/USDT', group: 'Inteligência Artificial' },

  // Metaverso e Jogos
  { id: 'AXSUSDT', name: 'AXS/USDT', group: 'Metaverso e Jogos' },
  { id: 'SANDUSDT', name: 'SAND/USDT', group: 'Metaverso e Jogos' },
  { id: 'MANAUSDT', name: 'MANA/USDT', group: 'Metaverso e Jogos' },
  { id: 'IMXUSDT', name: 'IMX/USDT', group: 'Metaverso e Jogos' },
  { id: 'GABORUSDT', name: 'GALA/USDT', group: 'Metaverso e Jogos' },
  { id: 'PIXELUSDT', name: 'PIXEL/USDT', group: 'Metaverso e Jogos' },

  // Meme Coins
  { id: 'SHIBUSDT', name: 'SHIB/USDT', group: 'Meme Coins' },
  { id: 'PEPEUSDT', name: 'PEPE/USDT', group: 'Meme Coins' },
  { id: 'BONKUSDT', name: 'BONK/USDT', group: 'Meme Coins' },
  { id: 'WIFUSDT', name: 'WIF/USDT', group: 'Meme Coins' },
  { id: 'FLOKIUSDT', name: 'FLOKI/USDT', group: 'Meme Coins' },
  { id: 'MEMEUSDT', name: 'MEME/USDT', group: 'Meme Coins' },

  // Infraestrutura
  { id: 'FILUSDT', name: 'FIL/USDT', group: 'Infraestrutura' },
  { id: 'ARUSDT', name: 'AR/USDT', group: 'Infraestrutura' },
  { id: 'GRTUSDT', name: 'GRT/USDT', group: 'Infraestrutura' },
  { id: 'ICPUSDT', name: 'ICP/USDT', group: 'Infraestrutura' },
  { id: 'HBARUSDT', name: 'HBAR/USDT', group: 'Infraestrutura' },
  { id: 'VETUSDT', name: 'VET/USDT', group: 'Infraestrutura' },
  { id: 'ALGOUSDT', name: 'ALGO/USDT', group: 'Infraestrutura' },
  { id: 'XLMUSDT', name: 'XLM/USDT', group: 'Infraestrutura' },
  { id: 'EOSUSDT', name: 'EOS/USDT', group: 'Infraestrutura' },
  { id: 'XTZUSDT', name: 'XTZ/USDT', group: 'Infraestrutura' },
  { id: 'EGLDUSDT', name: 'EGLD/USDT', group: 'Infraestrutura' },
  { id: 'FTMUSDT', name: 'FTM/USDT', group: 'Infraestrutura' },
];

export const getPairPriceDecimals = (pairId: string): number => {
  if (pairId === 'SHIBUSDT') return 8;
  if (pairId === 'PEPEUSDT') return 7;
  if (['BONKUSDT', 'FLOKIUSDT'].includes(pairId)) return 6;
  if (['DOGEUSDT', 'MEMEUSDT'].includes(pairId)) return 5;

  if ([
    'ADAUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'NEARUSDT', 'OPUSDT',
    'ARBUSDT', 'SUIUSDT', 'SEIUSDT', 'FETUSDT', 'RNDRUSDT',
    'WIFUSDT', 'IMXUSDT', 'RUNEUSDT', 'UNIUSDT', 'AAVEUSDT',
    'TRXUSDT', 'APTUSDT', 'INJUSDT', 'TIAUSDT', 'STXUSDT', 'MANTAUSDT',
    'JUPUSDT', 'CRVUSDT', 'COMPUSDT', 'PENDLEUSDT', 'ENAUSDT',
    'WLDUSDT', 'ARKMUSDT', 'PIXELUSDT', 'GRTUSDT', 'VETUSDT',
    'ALGOUSDT', 'XLMUSDT', 'EOSUSDT', 'XTZUSDT',
  ].includes(pairId)) return 4;

  if (['AVAXUSDT', 'SANDUSDT', 'MANAUSDT', 'DOTUSDT', 'ATOMUSDT', 'FILUSDT', 'ARUSDT', 'ICPUSDT', 'HBARUSDT', 'FTMUSDT', 'EGLDUSDT'].includes(pairId)) return 3;

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
