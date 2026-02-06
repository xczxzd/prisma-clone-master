import React, { useState } from 'react';

export const RiskManagement: React.FC = () => {
  const [capital, setCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(65000);
  const [stopLoss, setStopLoss] = useState(63500);

  const riskAmount = capital * (riskPercent / 100);
  const priceDiff = Math.abs(entryPrice - stopLoss);
  const positionSize = priceDiff > 0 ? riskAmount / priceDiff : 0;
  const positionValue = positionSize * entryPrice;
  const leverage = positionValue / capital;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Risco</h2>
          <p className="text-muted-foreground">Calculadora de posição e risco</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="prisma-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Parâmetros</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Capital Total (USD)
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                className="prisma-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Risco por Trade (%)
              </label>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                className="prisma-input"
                min="0.1"
                max="10"
                step="0.1"
              />
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRiskPercent(val)}
                    className={`px-3 py-1 rounded text-sm ${
                      riskPercent === val
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Preço de Entrada (USD)
              </label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="prisma-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Stop Loss (USD)
              </label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="prisma-input"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="prisma-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resultados</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Risco em USD</p>
                <p className="text-2xl font-bold text-prisma-red">${riskAmount.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Tamanho da Posição</p>
                <p className="text-2xl font-bold text-primary">{positionSize.toFixed(6)}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor da Posição</p>
                <p className="text-2xl font-bold text-foreground">${positionValue.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Alavancagem</p>
                <p className={`text-2xl font-bold ${leverage > 10 ? 'text-prisma-red' : leverage > 5 ? 'text-prisma-yellow' : 'text-prisma-green'}`}>
                  {leverage.toFixed(1)}x
                </p>
              </div>
            </div>
          </div>

          <div className="prisma-card gradient-purple">
            <h3 className="text-lg font-semibold text-foreground mb-2">⚠️ Aviso de Risco</h3>
            <p className="text-muted-foreground text-sm">
              {leverage > 10
                ? '🔴 Alavancagem muito alta! Considere reduzir o tamanho da posição ou aumentar a distância do stop.'
                : leverage > 5
                ? '🟡 Alavancagem moderada. Certifique-se de que está confortável com este nível de exposição.'
                : '🟢 Alavancagem conservadora. Boa gestão de risco!'}
            </p>
          </div>

          <div className="prisma-card">
            <h3 className="text-lg font-semibold text-foreground mb-3">📊 Regras de Ouro</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <span className="text-prisma-green">✓</span>
                <span>Nunca arrisque mais de 2% por trade</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-prisma-green">✓</span>
                <span>Sempre defina stop loss antes de entrar</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-prisma-green">✓</span>
                <span>Mantenha alavancagem abaixo de 5x</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-prisma-green">✓</span>
                <span>Busque R/R mínimo de 1:3</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
