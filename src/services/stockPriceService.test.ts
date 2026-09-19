import { describe, it, expect } from 'vitest';
import { sanitizeSymbol, getApiSettings } from './stockPriceService';

describe('Stock Price Service Utilities', () => {
  it('correctly sanitizes NSE and BSE ticker symbols', () => {
    expect(sanitizeSymbol('reliance.ns')).toBe('RELIANCE');
    expect(sanitizeSymbol('TCS.BO')).toBe('TCS');
    expect(sanitizeSymbol('infy.bse')).toBe('INFY');
    expect(sanitizeSymbol('HDFCBANK.NSE')).toBe('HDFCBANK');
    expect(sanitizeSymbol('  sbin  ')).toBe('SBIN');
  });

  it('provides sensible default API settings with free direct feed', () => {
    const settings = getApiSettings();
    expect(settings).toBeDefined();
    expect(settings.dataProvider).toBe('free-direct');
    expect(settings.preferredExchange).toBe('NSE');
    expect(typeof settings.geminiApiKey).toBe('string');
  });
});
