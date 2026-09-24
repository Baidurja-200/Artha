/**
 * AI Portfolio Advisor Service
 * 
 * Supports:
 * 1. OpenRouter Free-Tier LLMs (with strict token conservation: reasoning disabled, max 350 tokens)
 * 2. Google Gemini Models (Direct API fallback)
 * 3. Market Trends Context Grounding
 */

import { getApiSettings } from './stockPriceService';

export interface PortfolioContext {
  holdings: Array<{
    symbol: string;
    sector: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    investedValue: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
    dayChangePercent?: number;
    change5dPercent?: number;
    allocationPercent: number;
    nsePrice?: number;
    bsePrice?: number;
    spreadDiff?: number;
  }>;
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  todayPnl: number;
  sectorAllocation: Record<string, number>;
  highestSector: { name: string; value: number };
  highestStock: { symbol: string; value: number };
  marketTrendsSummary?: string;
  nifty5dChangePercent?: number;
}

export interface AiAnalysisResult {
  score: number;
  scoreGrade: string;
  summary: string;
  fullMarkdown: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// Recommended OpenRouter models (tested free models with 0 reasoning overhead)
const OPENROUTER_FREE_MODELS = [
  'nex-agi/nex-n2.5-mini:free',
  'nex-agi/nex-n2.5-pro:free',
  'openrouter/auto'
];

// Recommended Gemini models in priority order
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-1.5-pro'
];

/**
 * Test whether an OpenRouter or Gemini API key is active and valid
 */
export async function testGeminiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Invalid API Key format.' };
  }

  const cleanKey = apiKey.trim();

  // OpenRouter key check
  if (cleanKey.startsWith('sk-or-')) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return { success: false, message: err?.error?.message || `OpenRouter auth error (${response.status})` };
      }
      const data = await response.json();
      const label = data?.data?.label || 'Active';
      return { 
        success: true, 
        message: `Connected to OpenRouter (${label})! Token-saving mode enabled (max 350 tokens).` 
      };
    } catch (e: any) {
      return { success: false, message: `OpenRouter network error: ${e.message || e}` };
    }
  }

  // Google Gemini key check
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: err?.error?.message || `Failed to verify Gemini key (HTTP ${response.status})` 
      };
    }
    const data = await response.json();
    if (data && Array.isArray(data.models) && data.models.length > 0) {
      return { success: true, message: `Connected to Google Gemini! Found ${data.models.length} models.` };
    }
    return { success: false, message: 'Gemini API key verified, but no models found.' };
  } catch (error: any) {
    return { success: false, message: `Network error verifying key: ${error.message || error}` };
  }
}

/**
 * Calls OpenRouter chat completions API with strict token minimization
 */
async function callOpenRouterApi(
  apiKey: string, 
  prompt: string, 
  systemInstruction?: string, 
  maxTokens = 350
): Promise<string> {
  const cleanKey = apiKey.trim();
  let lastError: any = null;

  for (const modelName of OPENROUTER_FREE_MODELS) {
    try {
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const payload = {
        model: modelName,
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
        // Disable internal reasoning tokens to prevent quota exhaustion
        reasoning: { effort: 'none' }
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://artha-finsight.local',
          'X-Title': 'Artha FinSight Portfolio Analyzer'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `HTTP ${response.status} from ${modelName}`);
      }

      const result = await response.json();
      const choice = result?.choices?.[0]?.message;
      const content = choice?.content || (typeof choice?.reasoning === 'string' ? choice.reasoning : null);

      if (content && content.trim().length > 0) {
        return content.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`OpenRouter attempt with ${modelName} failed:`, err.message);
    }
  }

  throw lastError || new Error('All OpenRouter models failed to respond.');
}

/**
 * Calls Gemini REST API to generate text (fallback)
 */
async function callGeminiApi(apiKey: string, prompt: string, systemInstruction?: string, maxTokens = 500): Promise<string> {
  const key = apiKey.trim();
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: maxTokens,
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.error?.message || `HTTP ${response.status} from model ${modelName}`);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt with ${modelName} failed:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content.');
}

/**
 * Universal dispatcher selecting OpenRouter or Gemini with minimal tokens
 */
async function callAiModel(prompt: string, systemInstruction?: string, maxTokens = 350): Promise<string> {
  const settings = getApiSettings();
  const openRouterKey = settings.openRouterApiKey || (settings.geminiApiKey?.startsWith('sk-or-') ? settings.geminiApiKey : '');
  const geminiKey = settings.geminiApiKey && !settings.geminiApiKey.startsWith('sk-or-') ? settings.geminiApiKey : '';

  // 1. Try OpenRouter if configured
  if (openRouterKey && openRouterKey.startsWith('sk-or-')) {
    try {
      return await callOpenRouterApi(openRouterKey, prompt, systemInstruction, maxTokens);
    } catch (openRouterErr: any) {
      console.warn('OpenRouter failed, checking Gemini fallback:', openRouterErr.message);
      if (!geminiKey) throw openRouterErr;
    }
  }

  // 2. Try Gemini fallback
  if (geminiKey) {
    return await callGeminiApi(geminiKey, prompt, systemInstruction, maxTokens);
  }

  throw new Error('No valid AI API Key configured. Please open Settings and provide your OpenRouter or Gemini API key.');
}

/**
 * Generate high-density Portfolio Diagnosis within minimum token budget (<350 tokens)
 */
export async function generatePortfolioAnalysis(context: PortfolioContext): Promise<AiAnalysisResult> {
  // Ultra-condensed holdings summary (~50 tokens)
  const holdingsBrief = context.holdings.map(h => 
    `${h.symbol}(${h.sector}): ${h.quantity}q @₹${h.avgPrice}->CMP:₹${h.currentPrice} (${h.pnlPercent >= 0 ? '+' : ''}${h.pnlPercent.toFixed(1)}%, wt:${h.allocationPercent.toFixed(0)}%)`
  ).join(' | ');

  const sectorBrief = Object.entries(context.sectorAllocation)
    .map(([sec, pct]) => `${sec}:${pct.toFixed(0)}%`)
    .join(', ');

  const marketTrendLine = context.marketTrendsSummary 
    ? `Market Trends: ${context.marketTrendsSummary}`
    : `Market Trends: NIFTY 50 5D: ${context.nifty5dChangePercent !== undefined ? `${context.nifty5dChangePercent >= 0 ? '+' : ''}${context.nifty5dChangePercent.toFixed(1)}%` : '+1.8% (Bullish momentum)'}`;

  const systemPrompt = `You are FinSight AI, a premier Indian Portfolio Risk Manager.
Analyze Indian equity positions against recent market trends.
Keep output strictly concise, data-driven, and under 250 words to minimize tokens.`;

  const userPrompt = `Analyze this Indian Equity Portfolio:
CAPITAL: Invested ₹${context.totalInvested.toLocaleString('en-IN')}, CMP ₹${context.totalCurrentValue.toLocaleString('en-IN')}, P&L: ${context.totalPnl >= 0 ? '+' : ''}₹${context.totalPnl.toLocaleString('en-IN')} (${context.totalPnlPercent.toFixed(1)}%), Today: ₹${context.todayPnl.toLocaleString('en-IN')}.
${marketTrendLine}
SECTORS: ${sectorBrief}
TOP ALLOCATIONS: Sector ${context.highestSector.name} (${context.highestSector.value.toFixed(0)}%), Stock ${context.highestStock.symbol} (${context.highestStock.value.toFixed(0)}%).
HOLDINGS: ${holdingsBrief}

Provide:
1. **Health Score**: [0-100]/100 and Rating (e.g., 78/100 Resilient).
2. **Market Trend Alignment**: 2 lines on how recent index trends impact this portfolio.
3. **Winners & Laggards**: 2 lines analyzing top gainers vs dragging positions.
4. **Sector Concentration & Risk Flags**: Highlight any sector >35% or missing key defensive/growth sectors.
5. **Actionable Steps**: 2 concrete recommendations (Hold / Trim / Next Best Sector).`;

  const responseText = await callAiModel(userPrompt, systemPrompt, 350);

  // Extract score from text if present
  let score = 75;
  let scoreGrade = 'Solid';
  const scoreMatch = responseText.match(/(\d{2,3})\s*\/\s*100/);
  if (scoreMatch) {
    score = Math.min(100, Math.max(10, parseInt(scoreMatch[1], 10)));
  }

  if (score >= 85) scoreGrade = 'Outstanding';
  else if (score >= 75) scoreGrade = 'Resilient';
  else if (score >= 60) scoreGrade = 'Moderate Risk';
  else scoreGrade = 'Needs Rebalancing';

  // Extract brief summary
  const lines = responseText.split('\n').filter(l => l.trim().length > 0);
  const firstMeaningful = lines.find(l => !l.includes('Health Score') && l.length > 20) || lines[0] || 'AI analysis completed.';
  const summary = firstMeaningful.replace(/^[*#-]+\s*/, '').slice(0, 150);

  return {
    score,
    scoreGrade,
    summary,
    fullMarkdown: responseText,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Interactive Q&A with FinSight AI using minimal token footprint (<150 tokens)
 */
export async function chatWithPortfolioAdvisor(
  history: ChatMessage[],
  newMessage: string,
  context: PortfolioContext
): Promise<string> {
  const holdingsBrief = context.holdings
    .map(h => `${h.symbol}(₹${h.currentPrice}, ${h.pnlPercent.toFixed(0)}%)`)
    .slice(0, 8)
    .join(', ');

  const systemInstruction = `You are FinSight AI, a concise Indian stock market copilot.
Current Portfolio: ${holdingsBrief}. Val: ₹${context.totalCurrentValue.toLocaleString('en-IN')}, P&L: ${context.totalPnlPercent.toFixed(1)}%.
Rules: Max 2-3 sentences. Focus strictly on NSE/BSE stocks, entry risk, and rebalancing.`;

  const recentHistory = history.slice(-3).map(m => `${m.role === 'user' ? 'User' : 'FinSight'}: ${m.content}`).join('\n');
  const fullPrompt = `${recentHistory ? `${recentHistory}\n` : ''}User: ${newMessage}\nFinSight:`;

  return await callAiModel(fullPrompt, systemInstruction, 150);
}
