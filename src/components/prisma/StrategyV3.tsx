import React from 'react';
import { CheckIcon, XIcon } from './Icons';

const checklistItems = [
  { text: 'Tendência confirmada? (EMA50 vs EMA200)', checked: true },
  { text: 'Força adequada? (ADX > 25)', checked: true },
  { text: 'Direção confirmada? (MACD cruzando)', checked: true },
  { text: 'RSI em zona operacional? (30-70)', checked: true },
  { text: 'Bollinger confirmando? (preço nas bandas)', checked: false },
  { text: 'Volume acima da média? (força confirmada)', checked: true },
  { text: 'Padrão de Price Action? (configuração da vela)', checked: true },
  { text: 'Rompimento de estrutura? (quebra de nível)', checked: false },
  { text: 'Confluência de níveis? (Fibonacci + Suporte)', checked: true },
  { text: 'Stop Loss definido? (-1 USD fixo)', checked: true },
  { text: 'Take Profit calculado? (R/R 1:3 mínimo)', checked: true },
  { text: 'Posição dentro do limite? (2% do capital)', checked: true },
  { text: 'Sem notícias de alto impacto?', checked: true },
];

interface ChecklistItemProps {
  text: string;
  checked: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ text, checked }) => (
  <li className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? 'bg-prisma-green' : 'bg-prisma-red'}`}>
      {checked ? (
        <CheckIcon className="w-3 h-3 text-white" />
      ) : (
        <XIcon className="w-3 h-3 text-white" />
      )}
    </div>
    <span className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{text}</span>
  </li>
);

export const StrategyV3: React.FC = () => {
  const checkedCount = checklistItems.filter((item) => item.checked).length;
  const percentage = ((checkedCount / checklistItems.length) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Estratégia V3</h2>
          <p className="text-muted-foreground">Checklist de validação de entrada</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{percentage}%</p>
          <p className="text-sm text-muted-foreground">Critérios atendidos</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="prisma-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Validação da Entrada</span>
          <span className="text-sm text-muted-foreground">{checkedCount}/{checklistItems.length}</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-prisma-green transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className={`text-sm mt-2 ${parseInt(percentage) >= 80 ? 'text-prisma-green' : 'text-prisma-yellow'}`}>
          {parseInt(percentage) >= 80
            ? '✅ Entrada validada! Todos os critérios principais foram atendidos.'
            : '⚠️ Entrada não recomendada. Aguarde mais confluências.'}
        </p>
      </div>

      {/* Checklist */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Checklist de Entrada</h3>
        <ul className="space-y-2">
          {checklistItems.map((item, index) => (
            <ChecklistItem key={index} text={item.text} checked={item.checked} />
          ))}
        </ul>
      </div>

      {/* Strategy Description */}
      <div className="prisma-card gradient-purple">
        <h3 className="text-lg font-semibold text-foreground mb-3">📋 Sobre a Estratégia V3</h3>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            A Estratégia V3 combina <span className="text-primary font-semibold">Smart Money Concepts</span> com
            análise técnica tradicional para identificar entradas de alta probabilidade.
          </p>
          <p>
            <strong className="text-foreground">Regra de Ouro:</strong> Só entre quando pelo menos{' '}
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
