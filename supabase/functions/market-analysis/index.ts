import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface IndicatorData {
  williamsR: number;
  williamsRPattern: 'W' | 'M' | 'NEUTRAL';
  williamsRZone: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  adx: number;
  ema50: number;
  ema200: number;
  bollinger: { upper: number; middle: number; lower: number };
  volume: { current: number; average: number };
}

interface AnalysisRequest {
  pair: string;
  indicators: IndicatorData;
  priceData?: {
    current: number;
    high24h: number;
    low24h: number;
    change24h: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { pair, indicators, priceData }: AnalysisRequest = await req.json();

    console.log(`Analyzing ${pair} with indicators:`, indicators);

    // Prepare Williams %R analysis
    const williamsRAnalysis = getWilliamsRAnalysis(indicators.williamsR, indicators.williamsRPattern, indicators.williamsRZone);
    
    // Build comprehensive analysis prompt
    const systemPrompt = `Você é o PRISMA IA, um analista institucional especializado em Smart Money Concepts (SMC) e análise técnica avançada para trading de criptomoedas.

Sua análise deve ser precisa, técnica e seguir os conceitos de:
- Order Blocks (OB)
- Fair Value Gap (FVG)
- Liquidity Sweeps
- Break of Structure (BOS)
- Change of Character (CHoCH)
- Williams %R para confirmação de reversão

IMPORTANTE SOBRE WILLIAMS %R:
- Quando Williams %R está SOBREVENDIDO (abaixo de -80) e forma padrão "W" = SINAL DE ALTA FORTE
- Quando Williams %R está SOBRECOMPRADO (acima de -20) e forma padrão "M" = SINAL DE BAIXA FORTE
- Williams %R período 7 é usado para identificar pontos de reversão de curto prazo

Responda SEMPRE em português brasileiro com análise técnica profissional.`;

    const userPrompt = `Analise o par ${pair} com os seguintes indicadores:

📊 WILLIAMS %R (7): ${indicators.williamsR.toFixed(2)}
- Zona: ${indicators.williamsRZone}
- Padrão: ${indicators.williamsRPattern}
${williamsRAnalysis}

📈 RSI (14): ${indicators.rsi.toFixed(2)}
📉 MACD: ${indicators.macd.value.toFixed(4)} | Sinal: ${indicators.macd.signal.toFixed(4)} | Histograma: ${indicators.macd.histogram.toFixed(4)}
💪 ADX: ${indicators.adx.toFixed(2)}
📊 EMA50: ${indicators.ema50.toFixed(4)} | EMA200: ${indicators.ema200.toFixed(4)}
📏 Bollinger: Upper ${indicators.bollinger.upper.toFixed(4)} | Middle ${indicators.bollinger.middle.toFixed(4)} | Lower ${indicators.bollinger.lower.toFixed(4)}
📊 Volume: ${indicators.volume.current.toFixed(2)} (Média: ${indicators.volume.average.toFixed(2)})

${priceData ? `
💰 PREÇO ATUAL: $${priceData.current.toFixed(4)}
📈 Alta 24h: $${priceData.high24h.toFixed(4)}
📉 Baixa 24h: $${priceData.low24h.toFixed(4)}
📊 Variação 24h: ${priceData.change24h.toFixed(2)}%
` : ''}

Forneça:
1. VEREDITO INSTITUCIONAL (COMPRA/VENDA/NEUTRO)
2. CONFLUÊNCIAS encontradas
3. NÍVEIS DE ENTRADA sugeridos
4. STOP LOSS e TAKE PROFIT
5. CONFIANÇA da análise (0-100%)
6. ALERTAS de risco`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Rate limits exceeded, please try again later.',
          analysis: null 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ 
          error: 'Payment required, please add funds to your workspace.',
          analysis: null 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices?.[0]?.message?.content || 'Análise não disponível';

    console.log(`Analysis completed for ${pair}`);

    // Calculate confluence score
    const confluenceScore = calculateConfluenceScore(indicators);

    return new Response(JSON.stringify({
      pair,
      analysis: analysisText,
      confluenceScore,
      indicators: {
        williamsR: {
          value: indicators.williamsR,
          zone: indicators.williamsRZone,
          pattern: indicators.williamsRPattern,
          signal: getWilliamsRSignal(indicators.williamsR, indicators.williamsRPattern, indicators.williamsRZone),
        },
        rsi: indicators.rsi,
        macd: indicators.macd,
        adx: indicators.adx,
        trend: indicators.ema50 > indicators.ema200 ? 'BULLISH' : 'BEARISH',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getWilliamsRAnalysis(value: number, pattern: string, zone: string): string {
  if (zone === 'OVERSOLD' && pattern === 'W') {
    return '🟢 SINAL FORTE DE ALTA: Williams %R em zona sobrevendida formando padrão "W" - Reversão de alta provável!';
  }
  if (zone === 'OVERBOUGHT' && pattern === 'M') {
    return '🔴 SINAL FORTE DE BAIXA: Williams %R em zona sobrecomprada formando padrão "M" - Reversão de baixa provável!';
  }
  if (zone === 'OVERSOLD') {
    return '⚠️ Williams %R em zona sobrevendida - Aguardando confirmação de padrão "W" para entrada';
  }
  if (zone === 'OVERBOUGHT') {
    return '⚠️ Williams %R em zona sobrecomprada - Aguardando confirmação de padrão "M" para saída';
  }
  return '➡️ Williams %R em zona neutra - Sem sinal de reversão no momento';
}

function getWilliamsRSignal(value: number, pattern: string, zone: string): 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' {
  if (zone === 'OVERSOLD' && pattern === 'W') return 'STRONG_BUY';
  if (zone === 'OVERBOUGHT' && pattern === 'M') return 'STRONG_SELL';
  if (zone === 'OVERSOLD') return 'BUY';
  if (zone === 'OVERBOUGHT') return 'SELL';
  return 'NEUTRAL';
}

function calculateConfluenceScore(indicators: IndicatorData): number {
  let score = 0;
  let factors = 0;

  // Williams %R confluence (weight: 15%)
  if (indicators.williamsRZone === 'OVERSOLD' && indicators.williamsRPattern === 'W') {
    score += 15;
  } else if (indicators.williamsRZone === 'OVERBOUGHT' && indicators.williamsRPattern === 'M') {
    score += 15;
  } else if (indicators.williamsRZone !== 'NEUTRAL') {
    score += 7;
  }
  factors++;

  // RSI confluence (weight: 12%)
  if (indicators.rsi < 30 || indicators.rsi > 70) {
    score += 12;
  } else if (indicators.rsi < 40 || indicators.rsi > 60) {
    score += 6;
  }
  factors++;

  // MACD confluence (weight: 13%)
  if (Math.sign(indicators.macd.histogram) !== Math.sign(indicators.macd.histogram - 0.001)) {
    score += 13;
  } else if (Math.abs(indicators.macd.histogram) > 0) {
    score += 8;
  }
  factors++;

  // ADX confluence (weight: 10%)
  if (indicators.adx > 25) {
    score += 10;
  } else if (indicators.adx > 20) {
    score += 5;
  }
  factors++;

  // EMA trend confluence (weight: 15%)
  const trendConfirmed = indicators.ema50 > indicators.ema200;
  score += trendConfirmed ? 15 : 0;
  factors++;

  // Volume confluence (weight: 10%)
  if (indicators.volume.current > indicators.volume.average * 1.5) {
    score += 10;
  } else if (indicators.volume.current > indicators.volume.average) {
    score += 5;
  }
  factors++;

  // Base score for having analysis
  score += 25;

  return Math.min(100, Math.round(score));
}
