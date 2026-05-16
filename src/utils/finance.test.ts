import { describe, it, expect } from 'vitest';
import { 
  calculateSIPMaturityValue, 
  calculateAbsoluteReturn, 
  classifyTax, 
  calculateXIRR 
} from './finance';

describe('Financial Utilities', () => {
  
  describe('calculateSIPMaturityValue', () => {
    it('calculates correct maturity for 10k SIP at 12% for 10 years', () => {
      const result = calculateSIPMaturityValue(10000, 12, 10);
      // Roughly 23.23 Lakhs
      expect(result).toBeGreaterThan(2300000);
      expect(result).toBeLessThan(2330000);
    });

    it('returns principal sum if interest is 0', () => {
      const result = calculateSIPMaturityValue(1000, 0, 1);
      expect(result).toBe(12000);
    });
  });

  describe('calculateAbsoluteReturn', () => {
    it('calculates 50% return correctly', () => {
      expect(calculateAbsoluteReturn(1000, 1500)).toBe(50);
    });

    it('calculates negative return correctly', () => {
      expect(calculateAbsoluteReturn(1000, 800)).toBe(-20);
    });
  });

  describe('classifyTax', () => {
    it('classifies Equity as LTCG if held for 1 year', () => {
      const pDate = new Date('2023-01-01');
      const sDate = new Date('2024-01-01');
      expect(classifyTax(pDate, sDate, 'EQUITY')).toBe('LTCG');
    });

    it('classifies Equity as STCG if held for less than 1 year', () => {
      const pDate = new Date('2023-01-01');
      const sDate = new Date('2023-12-31');
      expect(classifyTax(pDate, sDate, 'EQUITY')).toBe('STCG');
    });

    it('classifies Debt as LTCG only after 3 years', () => {
      const pDate = new Date('2020-01-01');
      const sDate = new Date('2023-01-01');
      expect(classifyTax(pDate, sDate, 'DEBT')).toBe('LTCG');
    });

    it('classifies Debt as STCG if held for 2 years', () => {
      const pDate = new Date('2020-01-01');
      const sDate = new Date('2022-01-01');
      expect(classifyTax(pDate, sDate, 'DEBT')).toBe('STCG');
    });
  });

  describe('calculateXIRR', () => {
    it('calculates XIRR correctly for simple cash flow', () => {
      const payments = [-1000, 1100]; // 1000 invested, 1100 returned after 1 year
      const dates = [new Date('2023-01-01'), new Date('2024-01-01')];
      expect(calculateXIRR(payments, dates)).toBe(10);
    });

    it('calculates XIRR for irregular intervals', () => {
      const payments = [-10000, -10000, 25000];
      const dates = [
        new Date('2023-01-01'), 
        new Date('2023-07-01'), 
        new Date('2024-01-01')
      ];
      const result = calculateXIRR(payments, dates);
      expect(result).toBeGreaterThan(0);
    });
  });
});
