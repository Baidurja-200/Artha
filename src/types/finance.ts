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
}
