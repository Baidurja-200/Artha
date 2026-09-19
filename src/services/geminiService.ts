/**
 * Gemini LLM Portfolio Advisor Service
 * 
 * Directly connects to Google's Gemini models using the user's free API key.
 * Provides deep real-time portfolio analysis, sector risk audits, and conversational advisory.
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

// Recommended Gemini models in priority order
const MODEL_PRIORITIES = [
  'gemini-1.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-1.5-pro'
];

/**
 * Test whether a Gemini API key is active and valid
 */
export async function testGeminiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Invalid API Key format.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: err?.error?.message || `Failed to verify key (HTTP ${response.status})` 
      };
    }
    const data = await response.json();
    if (data && Array.isArray(data.models) && data.models.length > 0) {
      return { success: true, message: `Connected! Found ${data.models.length} available Gemini models.` };
    }
    return { success: false, message: 'API key verified, but no models found.' };
  } catch (error: any) {
    return { success: false, message: `Network error verifying key: ${error.message || error}` };
  }
}

/**
 * Calls Gemini REST API to generate text
 */
async function callGeminiApi(apiKey: string, prompt: string, systemInstruction?: string): Promise<string> {
  const key = apiKey.trim();
  let lastError: any = null;

  for (const modelName of MODEL_PRIORITIES) {
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
          maxOutputTokens: 2500,
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
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt with ${modelName} failed, trying next model:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini models failed to generate content.');
}

/**
 * Generate in-depth Portfolio Diagnosis using Gemini
 */
export async function generatePortfolioAnalysis(context: PortfolioContext): Promise<AiAnalysisResult> {
  const settings = getApiSettings();
  const apiKey = settings.geminiApiKey;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please open Settings to add your key.');
  }

  const holdingsSummary = context.holdings.map((h, i) => 
    `${i + 1}. **${h.symbol}** (${h.sector})
   - Qty: ${h.quantity} shares | Buy Avg: ₹${h.avgPrice.toLocaleString('en-IN')}
   - Live CMP: ₹${h.currentPrice.toLocaleString('en-IN')} ${h.nsePrice && h.bsePrice ? `(NSE: ₹${h.nsePrice}, BSE: ₹${h.bsePrice})` : ''}
   - Invested: ₹${h.investedValue.toLocaleString('en-IN')} | Current Value: ₹${h.currentValue.toLocaleString('en-IN')}
   - P&L: ${h.pnl >= 0 ? '+' : ''}₹${h.pnl.toLocaleString('en-IN')} (${h.pnlPercent.toFixed(2)}%)
   - Weight in Portfolio: ${h.allocationPercent.toFixed(1)}%`
  ).join('\n\n');

  const sectorSummary = Object.entries(context.sectorAllocation)
    .map(([sec, pct]) => `- ${sec}: ${pct.toFixed(1)}%`)
    .join('\n');

  const systemPrompt = `You are FinSight AI, a premier Indian Portfolio Risk Manager and SEBI-registered Chief Investment Strategist.
Your goal is to provide institutional-grade, data-driven analysis of Indian equity portfolios.

CORE RULES:
1. Ground every comment strictly in the actual numbers provided (CMP, P&L, sector weights).
2. Follow Indian market regulations: remind that Indian exchanges do not allow fractional shares.
3. Highlight exchange arbitrage: if BSE and NSE prices differ, note the spread and recommend execution venue.
4. For budgets or gaps under ₹5,000, recommend Nifty 50 or Next 50 Index SIPs over buying single high-priced stocks.
5. No speculative hype (avoid "multibagger" or "rocket"). Use professional terminology: "defensive moat", "cyclical headwinds", "valuation stretched", "healthy margin of safety".
6. Always start with a Portfolio Health Score (0 to 100) and Grade.`;

  const userPrompt = `Please analyze this Indian Equity Portfolio based on REAL-TIME market data:

### PORTFOLIO OVERVIEW:
- Total Invested Capital: ₹${context.totalInvested.toLocaleString('en-IN')}
- Total Current Valuation: ₹${context.totalCurrentValue.toLocaleString('en-IN')}
- Overall Unrealized P&L: ${context.totalPnl >= 0 ? '+' : ''}₹${context.totalPnl.toLocaleString('en-IN')} (${context.totalPnlPercent.toFixed(2)}%)
- Today's Day Movement: ₹${context.todayPnl.toLocaleString('en-IN')}
- Top Sector: ${context.highestSector.name} (${context.highestSector.value.toFixed(1)}%)
- Top Single Stock: ${context.highestStock.symbol} (${context.highestStock.value.toFixed(1)}%)

### SECTOR ALLOCATIONS:
${sectorSummary}

### INDIVIDUAL HOLDINGS (WITH LIVE NSE/BSE PRICES):
${holdingsSummary}

---

Please provide a structured, beautiful, and deeply actionable audit in GitHub markdown format covering:
1. **Portfolio Health Score**: [Score]/100 and Rating (e.g., "84/100 (Resilient Growth)").
2. **Executive Summary**: 2-3 sentences on overall asset quality, balance, and risk profile.
3. **Winners & Laggards Diagnosis**: Which stocks are carrying the returns vs which are dragging, analyzing current valuation risk vs entry price.
4. **Sector Concentration & Gap Analysis**: Evaluate the sector distribution against benchmark Indian indices (like NIFTY 50). Mention if any single sector exceeds 35-40% or if critical growth/defensive sectors are missing.
5. **Exchange & Execution Insights**: Any observed spread between NSE and BSE prices, and best practice for limit orders.
6. **Actionable Rebalancing Plan**: Step-by-step recommendations:
   - What to Hold / Accumulate
   - What to Trim or Protect with Stop-Loss
   - Next Best Deployment (specific sectors or index funds to complement existing risk)
7. **Risk Checklist**: A concise table or bullet list of top 3 vulnerabilities to watch in the current macro environment.`;

  const responseText = await callGeminiApi(apiKey, userPrompt, systemPrompt);

  // Extract score from text if present
  let score = 78;
  let scoreGrade = 'Solid';
  const scoreMatch = responseText.match(/(\d{2,3})\s*\/\s*100/);
  if (scoreMatch) {
    score = Math.min(100, Math.max(10, parseInt(scoreMatch[1], 10)));
  }

  if (score >= 85) scoreGrade = 'Outstanding';
  else if (score >= 75) scoreGrade = 'Resilient';
  else if (score >= 60) scoreGrade = 'Moderate Risk';
  else scoreGrade = 'Needs Rebalancing';

  // Extract 2-sentence summary
  const summaryMatch = responseText.match(/Executive Summary[:\s*#]+([\s\S]*?)(?=\n#{2,3}|\n\*\*Winners|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim().split('\n')[0] : 'Comprehensive AI diagnostic generated from live Indian market data.';

  return {
    score,
    scoreGrade,
    summary,
    fullMarkdown: responseText,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Interactive Q&A with FinSight AI regarding the user's specific portfolio
 */
export async function chatWithPortfolioAdvisor(
  history: ChatMessage[],
  newMessage: string,
  context: PortfolioContext
): Promise<string> {
  const settings = getApiSettings();
  const apiKey = settings.geminiApiKey;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const holdingsBrief = context.holdings
    .map(h => `${h.symbol} (${h.quantity} units, CMP: ₹${h.currentPrice}, P&L: ${h.pnlPercent.toFixed(1)}%)`)
    .join(', ');

  const systemInstruction = `You are FinSight AI, a helpful, savvy financial copilot for Indian investors.
The user is asking questions about their equity portfolio.
Current Portfolio Holdings: ${holdingsBrief}
Total Value: ₹${context.totalCurrentValue.toLocaleString('en-IN')}, P&L: ₹${context.totalPnl.toLocaleString('en-IN')} (${context.totalPnlPercent.toFixed(1)}%).
Keep your responses crisp, direct, highly relevant to Indian equities (NSE/BSE), and practical.`;

  // Build conversational prompt
  const recentHistory = history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'FinSight AI'}: ${m.content}`).join('\n\n');
  const fullPrompt = `${recentHistory ? `${recentHistory}\n\n` : ''}User: ${newMessage}\n\nFinSight AI:`;

  return await callGeminiApi(apiKey, fullPrompt, systemInstruction);
}
