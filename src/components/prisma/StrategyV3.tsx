import React, { useMemo } from 'react';
import { CheckIcon, XIcon } from './Icons';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ChecklistItemType {
  text: string;
  checked: boolean;
  category: 'trend' | 'momentum' | 'williams' | 'confluence' | 'risk';
  importance: 'critical' | 'high' | 'medium';
}

// Simulated Williams %R value for demonstration
const getWilliamsRData = () => {
  const value = Math.random() * 100 - 100; // -100 to 0
  let zone: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' = 'NEUTRAL';
  let pattern: 'W' | 'M' | 'NEUTRAL' = 'NEUTRAL';
  
  if (value < -80) {
    zone = 'OVERSOLD';
    pattern = Math.random() > 0.5 ? 'W' : 'NEUTRAL';
  } else if (value > -20) {
    zone = 'OVERBOUGHT';
    pattern = Math.random() > 0.5 ? 'M' : 'NEUTRAL';
  }

  return { value, zone, pattern };
};

const checklistItems: ChecklistItemType[] = [
  // Trend Analysis
  { text: 'Tendência confirmada? (EMA50 vs EMA200)', checked: true, category: 'trend', importance: 'critical' },
  { text: 'Força adequada? (ADX > 25)', checked: true, category: 'trend', importance: 'high' },
  { text: 'Direção confirmada? (MACD cruzando)', checked: true, category: 'momentum', importance: 'high' },
  
  // Williams %R - NEW FILTERS
  { text: '📊 Williams %R (7) em zona extrema? (-80 ou -20)', checked: true, category: 'williams', importance: 'critical' },
  { text: '📈 Padrão W formado na zona sobrevendida? (COMPRA)', checked: true, category: 'williams', importance: 'critical' },
  { text: '📉 Padrão M formado na zona sobrecomprada? (VENDA)', checked: false, category: 'williams', importance: 'critical' },
  
  // Momentum & Oscillators
  { text: 'RSI em zona operacional? (30-70)', checked: true, category: 'momentum', importance: 'high' },
  { text: 'Bollinger confirmando? (preço nas bandas)', checked: false, category: 'momentum', importance: 'medium' },
  
  // Volume & Structure
  { text: 'Volume acima da média? (força confirmada)', checked: true, category: 'confluence', importance: 'high' },
  { text: 'Padrão de Price Action? (configuração da vela)', checked: true, category: 'confluence', importance: 'high' },
  { text: 'Rompimento de estrutura? (quebra de nível)', checked: false, category: 'confluence', importance: 'medium' },
  { text: 'Confluência de níveis? (Fibonacci + Suporte)', checked: true, category: 'confluence', importance: 'high' },
  
  // Risk Management
  { text: 'Stop Loss definido? (-1 USD fixo)', checked: true, category: 'risk', importance: 'critical' },
  { text: 'Take Profit calculado? (R/R 1:3 mínimo)', checked: true, category: 'risk', importance: 'critical' },
  { text: 'Posição dentro do limite? (2% do capital)', checked: true, category: 'risk', importance: 'critical' },
  { text: 'Sem notícias de alto impacto?', checked: true, category: 'risk', importance: 'medium' },
];

interface ChecklistItemProps {
  item: ChecklistItemType;
}

const getCategoryIcon = (category: ChecklistItemType['category']) => {
  switch (category) {
    case 'williams':
      return '📊';
    case 'trend':
      return '📈';
    case 'momentum':
      return '⚡';
    case 'confluence':
      return '🎯';
    case 'risk':
      return '🛡️';
    default:
      return '•';
  }
};

const getImportanceBadge = (importance: ChecklistItemType['importance']) => {
  switch (importance) {
    case 'critical':
      return <span className="text-xs px-1.5 py-0.5 bg-prisma-red/20 text-prisma-red rounded">CRÍTICO</span>;
    case 'high':
      return <span className="text-xs px-1.5 py-0.5 bg-prisma-yellow/20 text-prisma-yellow rounded">ALTO</span>;
    default:
      return null;
  }
};

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item }) => (
  <li className={`flex items-center space-x-3 p-3 rounded-md transition-all ${
    item.category === 'williams' 
      ? 'bg-primary/10 border border-primary/30' 
      : 'bg-secondary/50'
  }`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.checked ? 'bg-prisma-green' : 'bg-prisma-red'}`}>
      {item.checked ? (
        <CheckIcon className="w-3 h-3 text-white" />
      ) : (
        <XIcon className="w-3 h-3 text-white" />
      )}
    </div>
    <span className={`text-sm flex-1 ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
      {item.text}
    </span>
    {getImportanceBadge(item.importance)}
  </li>
);

export const StrategyV3: React.FC = () => {
  const williamsR = useMemo(() => getWilliamsRData(), []);
  
  const checkedCount = checklistItems.filter((item) => item.checked).length;
  const criticalCount = checklistItems.filter((item) => item.importance === 'critical' && item.checked).length;
  const totalCritical = checklistItems.filter((item) => item.importance === 'critical').length;
  const percentage = ((checkedCount / checklistItems.length) * 100).toFixed(0);

  const williamsRItems = checklistItems.filter(item => item.category === 'williams');
  const otherItems = checklistItems.filter(item => item.category !== 'williams');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Estratégia V3 + Williams %R</h2>
          <p className="text-muted-foreground">Checklist de validação com filtro Williams %R (7)</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{percentage}%</p>
          <p className="text-sm text-muted-foreground">Critérios atendidos</p>
        </div>
      </div>

      {/* Williams %R Status Card */}
      <div className={`prisma-card border-2 ${
        williamsR.zone === 'OVERSOLD' && williamsR.pattern === 'W' 
          ? 'border-prisma-green bg-prisma-green/10' 
          : williamsR.zone === 'OVERBOUGHT' && williamsR.pattern === 'M'
          ? 'border-prisma-red bg-prisma-red/10'
          : 'border-primary/30 bg-primary/5'
      }`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">📊</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">Williams %R (7) - Filtro Principal</h3>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Valor Atual</p>
                <p className="text-2xl font-mono text-primary">{williamsR.value.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zona</p>
                <p className={`text-lg font-bold ${
                  williamsR.zone === 'OVERSOLD' ? 'text-prisma-green' : 
                  williamsR.zone === 'OVERBOUGHT' ? 'text-prisma-red' : 
                  'text-muted-foreground'
                }`}>{williamsR.zone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Padrão</p>
                <p className={`text-lg font-bold ${
                  williamsR.pattern === 'W' ? 'text-prisma-green' : 
                  williamsR.pattern === 'M' ? 'text-prisma-red' : 
                  'text-muted-foreground'
                }`}>{williamsR.pattern !== 'NEUTRAL' ? williamsR.pattern : '-'}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            {williamsR.zone === 'OVERSOLD' && williamsR.pattern === 'W' ? (
              <div className="flex items-center gap-2 text-prisma-green">
                <TrendingUp className="w-8 h-8" />
                <span className="text-xl font-bold">COMPRA</span>
              </div>
            ) : williamsR.zone === 'OVERBOUGHT' && williamsR.pattern === 'M' ? (
              <div className="flex items-center gap-2 text-prisma-red">
                <TrendingDown className="w-8 h-8" />
                <span className="text-xl font-bold">VENDA</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-prisma-yellow">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-xl font-bold">AGUARDAR</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-foreground">
            {williamsR.zone === 'OVERSOLD' && williamsR.pattern === 'W' 
              ? '🟢 SINAL FORTE: Williams %R formou padrão "W" na zona sobrevendida - Alta probabilidade de reversão para CIMA!'
              : williamsR.zone === 'OVERBOUGHT' && williamsR.pattern === 'M'
              ? '🔴 SINAL FORTE: Williams %R formou padrão "M" na zona sobrecomprada - Alta probabilidade de reversão para BAIXO!'
              : williamsR.zone === 'OVERSOLD'
              ? '⚠️ Williams %R na zona sobrevendida - Aguardando formação do padrão "W" para confirmação de compra'
              : williamsR.zone === 'OVERBOUGHT'
              ? '⚠️ Williams %R na zona sobrecomprada - Aguardando formação do padrão "M" para confirmação de venda'
              : '➡️ Williams %R em zona neutra - Sem sinal de reversão no momento. Aguarde o preço entrar nas zonas extremas.'
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="prisma-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Validação da Entrada</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Críticos: <span className={criticalCount === totalCritical ? 'text-prisma-green' : 'text-prisma-red'}>{criticalCount}/{totalCritical}</span>
            </span>
            <span className="text-sm text-muted-foreground">Total: {checkedCount}/{checklistItems.length}</span>
          </div>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-prisma-green transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className={`text-sm mt-2 ${parseInt(percentage) >= 80 && criticalCount === totalCritical ? 'text-prisma-green' : 'text-prisma-yellow'}`}>
          {parseInt(percentage) >= 80 && criticalCount === totalCritical
            ? '✅ Entrada validada! Todos os critérios principais e Williams %R confirmados.'
            : criticalCount < totalCritical
            ? '🚫 Critérios CRÍTICOS não atendidos. Entrada NÃO recomendada!'
            : '⚠️ Aguarde mais confluências antes de entrar.'}
        </p>
      </div>

      {/* Williams %R Checklist */}
      <div className="prisma-card border border-primary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          📊 Filtros Williams %R (7)
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">NOVO</span>
        </h3>
        <ul className="space-y-2">
          {williamsRItems.map((item, index) => (
            <ChecklistItem key={`williams-${index}`} item={item} />
          ))}
        </ul>
      </div>

      {/* Other Checklist Items */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">📋 Checklist Completo de Entrada</h3>
        <ul className="space-y-2">
          {otherItems.map((item, index) => (
            <ChecklistItem key={index} item={item} />
          ))}
        </ul>
      </div>

      {/* Strategy Description */}
      <div className="prisma-card gradient-purple">
        <h3 className="text-lg font-semibold text-foreground mb-3">📚 Sobre a Estratégia V3 + Williams %R</h3>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            A Estratégia V3 combina <span className="text-primary font-semibold">Smart Money Concepts</span> com
            o <span className="text-primary font-semibold">Williams %R (7)</span> para máxima precisão nas entradas.
          </p>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="font-semibold text-foreground mb-2">🎯 Como usar o Williams %R (7):</p>
            <ul className="space-y-1">
              <li>• <span className="text-prisma-green">Padrão W na zona sobrevendida</span> = Mercado pode começar a SUBIR</li>
              <li>• <span className="text-prisma-red">Padrão M na zona sobrecomprada</span> = Mercado pode começar a CAIR</li>
              <li>• Zona sobrevendida: abaixo de -80 | Zona sobrecomprada: acima de -20</li>
            </ul>
          </div>
          <p>
            <strong className="text-foreground">Regra de Ouro:</strong> Só entre quando o Williams %R confirmar E pelo menos{' '}
            <span className="text-prisma-green font-semibold">80%</span> dos critérios forem atendidos.
          </p>
          <p>
            <strong className="text-foreground">Gestão de Risco:</strong> Máximo de 2% do capital por operação.
            Stop Loss sempre definido antes da entrada.
          </p>
        </div>
      </div>
    </div>
  );
};
