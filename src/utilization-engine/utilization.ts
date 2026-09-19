import { CreditCard } from '../types/finance';

export interface UtilizationMetrics {
  totalLimit: number;
  totalBalance: number;
  overallUtilization: number; // percentage (0-100)
  cardMetrics: {
    cardId: string;
    cardName: string;
    bank: string;
    limit: number;
    balance: number;
    utilization: number; // percentage
    status: 'good' | 'warning' | 'critical';
  }[];
  isExceededThreshold: boolean;
  status: 'excellent' | 'moderate' | 'high';
  warningMessage: string | null;
}

export function analyzeCreditUtilization(creditCards: CreditCard[]): UtilizationMetrics {
  if (creditCards.length === 0) {
    return {
      totalLimit: 0,
      totalBalance: 0,
      overallUtilization: 0,
      cardMetrics: [],
      isExceededThreshold: false,
      status: 'excellent',
      warningMessage: null,
    };
  }

  const totalLimit = creditCards.reduce((sum, c) => sum + c.limit, 0);
  const totalBalance = creditCards.reduce((sum, c) => sum + c.currentBalance, 0);
  const overallUtilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

  const cardMetrics = creditCards.map((card) => {
    const utilization = card.limit > 0 ? (card.currentBalance / card.limit) * 100 : 0;
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (utilization > 50) {
      status = 'critical';
    } else if (utilization > 30) {
      status = 'warning';
    }

    return {
      cardId: card.id,
      cardName: card.name,
      bank: card.bank,
      limit: card.limit,
      balance: card.currentBalance,
      utilization,
      status,
    };
  });

  const isExceededThreshold = overallUtilization > 30;
  
  let status: 'excellent' | 'moderate' | 'high' = 'excellent';
  let warningMessage: string | null = null;

  if (overallUtilization > 50) {
    status = 'high';
    warningMessage = `Critical overall utilization of ${overallUtilization.toFixed(1)}%. Maintain balances below 30% to prevent credit rating impact.`;
  } else if (overallUtilization > 30) {
    status = 'moderate';
    warningMessage = `Overall utilization is elevated at ${overallUtilization.toFixed(1)}%. We recommend keeping individual cards below 30%.`;
  } else {
    status = 'excellent';
  }

  return {
    totalLimit,
    totalBalance,
    overallUtilization,
    cardMetrics,
    isExceededThreshold,
    status,
    warningMessage,
  };
}
