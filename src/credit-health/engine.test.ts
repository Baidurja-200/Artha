import { describe, it, expect } from 'vitest';
import { computeCreditHealth } from './engine';
import { analyzeCreditUtilization } from '../utilization-engine/utilization';
import { analyzeRepayments } from '../repayment-engine/repayment';
import { analyzeCreditSpending } from '../spending-intelligence/spending';
import { auditRewards } from '../reward-analysis/rewards';
import { generateCreditInsights } from '../credit-insights/insights';
import { CreditCard, CreditEMI, CreditRepayment, UserProfile, Expense } from '../types/finance';

describe('Credit Health Engine Calculations', () => {
  const mockProfile: UserProfile = {
    name: 'Test User',
    age: 30,
    monthlyIncome: 100000,
    monthlyExpenses: 40000,
    existingSavings: 200000,
    emergencyFund: 100000,
    existingInvestments: 300000,
    currentSIPs: 10000,
    loans: 0,
    investmentExperience: 'Intermediate',
    financialGoals: 'Wealth',
    investmentHorizon: 'Medium Term',
  };

  const mockCards: CreditCard[] = [
    {
      id: 'card-1',
      name: 'Regalia Gold',
      bank: 'HDFC Bank',
      limit: 100000,
      currentBalance: 20000, // 20% utilization
      dueDate: '20',
      statementDate: '05',
      rewardType: 'points',
      rewardRate: 2.6,
      rewardEarned: 1000,
      cardType: 'visa'
    },
    {
      id: 'card-2',
      name: 'Amazon Pay Card',
      bank: 'ICICI Bank',
      limit: 200000,
      currentBalance: 20000, // 10% utilization
      dueDate: '15',
      statementDate: '25',
      rewardType: 'cashback',
      rewardRate: 2.0,
      rewardEarned: 500,
      cardType: 'visa'
    }
  ];

  const mockEMIs: CreditEMI[] = [
    {
      id: 'emi-1',
      cardId: 'card-1',
      description: 'Test EMI',
      monthlyAmount: 5000,
      remainingMonths: 5,
      totalAmount: 25000
    }
  ];

  const mockRepayments: CreditRepayment[] = [
    { id: 'rep-1', cardId: 'card-1', billingMonth: '2026-03', amountDue: 10000, amountPaid: 10000, paidDate: '2026-03-15', status: 'ontime' },
    { id: 'rep-2', cardId: 'card-1', billingMonth: '2026-04', amountDue: 15000, amountPaid: 15000, paidDate: '2026-04-18', status: 'ontime' }
  ];

  const mockExpenses: Expense[] = [
    { id: 'e-1', amount: 5000, category: 'shopping', date: '2026-04-10', description: 'Amazon shopping', paymentMethod: 'credit-card', cardId: 'card-1' }, // Bad card choice for shopping
    { id: 'e-2', amount: 3000, category: 'travel', date: '2026-04-12', description: 'Flight booking', paymentMethod: 'credit-card', cardId: 'card-1' } // Correct card choice
  ];

  it('calculates credit utilization correctly', () => {
    const metrics = analyzeCreditUtilization(mockCards);
    expect(metrics.totalLimit).toBe(300000);
    expect(metrics.totalBalance).toBe(40000);
    expect(metrics.overallUtilization).toBeCloseTo(13.33);
    expect(metrics.isExceededThreshold).toBe(false);
  });

  it('calculates repayment streaks and discipline scores', () => {
    const metrics = analyzeRepayments(mockRepayments);
    expect(metrics.onTimeRate).toBe(100);
    expect(metrics.streakMonths).toBe(2);
    expect(metrics.disciplineScore).toBe(100);
  });

  it('audits rewards and identifies leakage', () => {
    const audit = auditRewards(mockCards, mockExpenses);
    // HDFC Regalia (used on shopping) yields 1.33%, Amazon Pay would yield 5%.
    // Leakage should be (5.0 - 1.33) * 5000 / 100 = 3.67% * 5000 / 100 = 183.5 rewards equivalent.
    expect(audit.leakages.length).toBeGreaterThan(0);
    expect(audit.totalLeakageAmount).toBeGreaterThan(0);
  });

  it('computes overall credit score and stress score', () => {
    const result = computeCreditHealth(mockCards, mockEMIs, mockRepayments, mockProfile, mockExpenses);
    expect(result.creditScore).toBeGreaterThanOrEqual(300);
    expect(result.creditScore).toBeLessThanOrEqual(900);
    expect(result.creditStressScore).toBeGreaterThanOrEqual(0);
    expect(result.creditStressScore).toBeLessThanOrEqual(100);
  });

  it('generates high quality explainable insights', () => {
    const insights = generateCreditInsights(mockCards, mockEMIs, mockRepayments, mockProfile);
    expect(insights.length).toBeGreaterThan(0);
    const hasEMIInsight = insights.some(ins => ins.id.startsWith('emi-'));
    expect(hasEMIInsight).toBe(true);
  });
});
