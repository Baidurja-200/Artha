export interface Holding {
  id: number;
  symbol: string;
  sector: string;
  quantity: number;
  avgPrice: number;
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
