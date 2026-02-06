import React, { useState } from 'react';
import { PaperAirplaneIcon, CheckIcon } from './Icons';

export const TelegramSettings: React.FC = () => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState({
    whaleAlerts: true,
    newSignals: true,
    priceAlerts: true,
    weeklyReports: false,
  });

  const handleConnect = () => {
    if (botToken && chatId) {
      setIsConnected(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integração Telegram</h2>
          <p className="text-muted-foreground">Configure alertas em tempo real</p>
        </div>
        {isConnected && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-prisma-green/20 rounded-full">
            <CheckIcon className="h-4 w-4 text-prisma-green" />
            <span className="text-prisma-green text-sm font-medium">Conectado</span>
          </div>
        )}
      </div>

      {/* Connection Settings */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuração do Bot</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Bot Token
            </label>
            <input
              type="password"
              placeholder="Cole o token do seu bot aqui"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="prisma-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Obtenha em @BotFather no Telegram
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Chat ID
            </label>
            <input
              type="text"
              placeholder="Seu Chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="prisma-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use @userinfobot para descobrir seu ID
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={!botToken || !chatId}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span>{isConnected ? 'Reconectar' : 'Conectar Bot'}</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="prisma-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificação</h3>
        <div className="space-y-4">
          {[
            { key: 'whaleAlerts', label: '🐋 Alertas de Baleia', description: 'Movimentos institucionais detectados' },
            { key: 'newSignals', label: '📊 Novos Sinais', description: 'Oportunidades de trading identificadas' },
            { key: 'priceAlerts', label: '💰 Alertas de Preço', description: 'Quando alvos são atingidos' },
            { key: 'weeklyReports', label: '📈 Relatórios Semanais', description: 'Resumo semanal de performance' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-primary'
                    : 'bg-border'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Message */}
      {isConnected && (
        <div className="prisma-card gradient-purple">
          <h3 className="text-lg font-semibold text-foreground mb-2">Testar Conexão</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Envie uma mensagem de teste para verificar se a integração está funcionando.
          </p>
          <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors">
            Enviar Mensagem de Teste
          </button>
        </div>
      )}
    </div>
  );
};
