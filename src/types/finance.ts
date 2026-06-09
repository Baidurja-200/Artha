export interface Holding {
  id: number;
  symbol: string;
  sector: string;
  quantity: number;
  avgPrice: number;
}

export interface StockPriceData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  name: string;
}

export interface HoldingWithLiveData extends Holding {
  currentPrice?: number;
  currentValue?: number;
  investedValue: number;
  pnl?: number;
  pnlPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
}

export interface SIPPlan {
  monthlyInvestment: number;
  expectedReturnRate: number;
  tenureYears: number;
}

export interface MutualFund {
  schemeCode: string;
  schemeName: string;
  category: string;
  risk: string;
  nav: number;
  returns?: {
    '1y'?: number;
    '3y'?: number;
    '5y'?: number;
  };
}

export interface NetWorthEntry {
  date: string;
  overallScore: number;
  netWorth: number;
  emergencyMonths?: number;
  savingsRate?: number;
  debtToIncome?: number;
  investmentScore?: number;
  savingsScore?: number;
  debtScore?: number;
  emergencyScore?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  emergencyFund: number;
  existingInvestments: number;
  currentSIPs: number;
  loans: number;
  investmentExperience: string;
  financialGoals: string;
  investmentHorizon: string;
  debtEMI?: number;
  tax80c?: number;
  insuranceCoverage?: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'food' | 'rent' | 'travel' | 'shopping' | 'subscriptions' | 'utilities' | 'healthcare' | 'EMI/debt' | 'investments' | 'entertainment' | string;
  date: string;
  description: string;
  paymentMethod?: 'cash' | 'bank' | 'credit-card';
  cardId?: string;
}

export interface Budget {
  needsLimit: number; // in percentage, e.g., 50
  wantsLimit: number; // in percentage, e.g., 30
  savingsLimit: number; // in percentage, e.g., 20
}

export interface Goal {
  id: number;
  name: string;
  category: 'retirement' | 'house' | 'emergency' | 'education' | 'wealth' | string;
  target: number;
  current: number;
  timelineYears: number;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  currentBalance: number;
  dueDate: string; // Day of month or specific date string, we will store e.g. "15" or YYYY-MM-DD
  statementDate: string; // Day of month or specific date string, we will store e.g. "1" or YYYY-MM-DD
  rewardType: 'cashback' | 'points' | 'miles';
  rewardRate: number; // e.g. 1.5%
  rewardEarned: number;
  cardType: 'visa' | 'mastercard' | 'rupay' | 'amex';
}

export interface CreditEMI {
  id: string;
  cardId: string;
  description: string;
  monthlyAmount: number;
  remainingMonths: number;
  totalAmount: number;
}

export interface CreditRepayment {
  id: string;
  cardId: string;
  billingMonth: string; // "2026-05"
  amountDue: number;
  amountPaid: number;
  paidDate: string;
  status: 'ontime' | 'late' | 'partial' | 'unpaid';
}

