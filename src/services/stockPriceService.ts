import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { StockPriceData } from '../types/finance';

/**
 * Uses the Vite dev proxy at /api/yahoo which forwards to
 * https://query1.finance.yahoo.com, bypassing CORS.
 */
const YAHOO_PROXY = '/api/yahoo';

/**
 * Fetches live stock price data for a single NSE-listed symbol.
 * Appends .NS suffix for National Stock Exchange tickers.
 */
export async function fetchStockPrice(symbol: string): Promise<StockPriceData> {
  const cleanSymbol = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
  const url = `${YAHOO_PROXY}/v8/finance/chart/${cleanSymbol}.NS?interval=1d&range=1d`;

  const response = await axios.get(url, { timeout: 15000 });
  const result = response.data?.chart?.result?.[0];

  if (!result) {
    throw new Error(`No data found for ${cleanSymbol}`);
  }

  const meta = result.meta;
  const quote = result.indicators?.quote?.[0];

  const currentPrice = meta.regularMarketPrice ?? 0;
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
  const change = currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  const highs = quote?.high?.filter((v: number | null) => v !== null) ?? [];
  const lows = quote?.low?.filter((v: number | null) => v !== null) ?? [];
  const dayHigh = highs.length > 0 ? Math.max(...highs) : currentPrice;
  const dayLow = lows.length > 0 ? Math.min(...lows) : currentPrice;

  return {
    symbol: cleanSymbol,
    currentPrice: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    dayHigh: Math.round(dayHigh * 100) / 100,
    dayLow: Math.round(dayLow * 100) / 100,
    name: meta.longName || meta.shortName || cleanSymbol,
  };
}

/**
 * Fetches live prices for multiple symbols in parallel.
 * Uses Promise.allSettled so one failure doesn't block others.
 */
export async function fetchMultipleStockPrices(
  symbols: string[]
): Promise<Record<string, StockPriceData>> {
  const results = await Promise.allSettled(symbols.map(fetchStockPrice));

  const priceMap: Record<string, StockPriceData> = {};

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      priceMap[symbols[index].toUpperCase()] = result.value;
    } else {
      console.warn(`Failed to fetch ${symbols[index]}:`, result.reason?.message);
    }
  });

  return priceMap;
}

/**
 * React Query hook that fetches and caches live stock prices.
 * Auto-refetches every 2 minutes. Only runs when symbols array is non-empty.
 */
export function useStockPrices(symbols: string[]) {
  return useQuery({
    queryKey: ['stockPrices', ...symbols.sort()],
    queryFn: () => fetchMultipleStockPrices(symbols),
    enabled: symbols.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Auto refetch every 2 min
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
