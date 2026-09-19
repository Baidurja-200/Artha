import { CreditCard, CreditEMI, CreditRepayment, UserProfile } from '../types/finance';
import { analyzeCreditUtilization } from '../utilization-engine/utilization';
import { analyzeRepayments } from '../repayment-engine/repayment';
import { analyzeCreditSpending } from '../spending-intelligence/spending';

export interface CreditHealthReport {
  creditScore: number;
  creditRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
  creditStressScore: number; // 0-100
  stressRating: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: {
    name: string;
    score: number; // 0-100
    impact: 'high' | 'medium' | 'low';
    description: string;
    status: 'excellent' | 'good' | 'fair' | 'critical';
  }[];
}

export function computeCreditHealth(
  creditCards: CreditCard[],
  creditEMIs: CreditEMI[],
  repayments: CreditRepayment[],
  profile: UserProfile,
  expenses: any[]
): CreditHealthReport {
  const utilization = analyzeCreditUtilization(creditCards);
  const repayment = analyzeRepayments(repayments);
  const spending = analyzeCreditSpending(expenses);

  // 1. Credit Score Calculation (300 to 900 CIBIL-like index)
  // Base score starting at 700
  let score = 700;

  // FACTOR A: Repayment Discipline (35% weight, range -200 to +100)
  let repaymentScoreContribution = 75; // Baseline
  if (repayment.totalBills > 0) {
    const onTimeRate = repayment.onTimeRate;
    if (onTimeRate === 100) {
      repaymentScoreContribution = 100;
      score += 80;
    } else if (onTimeRate >= 90) {
      repaymentScoreContribution = 80;
      score += 20;
    } else if (onTimeRate >= 75) {
      repaymentScoreContribution = 60;
      score -= 50;
    } else {
      repaymentScoreContribution = 40;
      score -= 120;
    }

    // Heavy penalties for active issues
    if (repayment.unpaidCount > 0) {
      score -= (repayment.unpaidCount * 60);
      repaymentScoreContribution = Math.max(10, repaymentScoreContribution - 40);
    }
    if (repayment.partialCount > 0) {
      score -= (repayment.partialCount * 35);
      repaymentScoreContribution = Math.max(20, repaymentScoreContribution - 20);
    }
  } else {
    // No history, neutral positive
    score += 30;
  }

  // FACTOR B: Utilization Ratio (30% weight, range -150 to +80)
  let utilizationScoreContribution = 85;
  const util = utilization.overallUtilization;
  if (util === 0) {
    // Low utilization is good, but 0% is slightly worse than 1-10% (thin file activity)
    score += 20;
    utilizationScoreContribution = 75;
  } else if (util <= 10) {
    score += 60;
    utilizationScoreContribution = 95;
  } else if (util <= 30) {
    score += 50;
    utilizationScoreContribution = 90;
  } else if (util <= 50) {
    score -= 40;
    utilizationScoreContribution = 60;
  } else {
    score -= 100;
    utilizationScoreContribution = 30;
  }

  // FACTOR C: Debt-to-Income / EMI Pressure (15% weight, range -80 to +40)
  let debtScoreContribution = 80;
  const totalEMIs = creditEMIs.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const income = profile.monthlyIncome || 1;
  const emiToIncome = (totalEMIs / income) * 100;

  if (emiToIncome === 0) {
    score += 30;
    debtScoreContribution = 100;
  } else if (emiToIncome <= 10) {
    score += 20;
    debtScoreContribution = 90;
  } else if (emiToIncome <= 20) {
    score -= 20;
    debtScoreContribution = 70;
  } else {
    score -= 60;
    debtScoreContribution = 40;
  }

  // FACTOR D: Spending Stability & Spikes (20% weight, range -60 to +30)
  let spendingScoreContribution = 85;
  const spikesCount = spending.spendingSpikes.length;
  if (spikesCount === 0) {
    score += 30;
    spendingScoreContribution = 100;
  } else if (spikesCount <= 2) {
    score += 10;
    spendingScoreContribution = 80;
  } else if (spikesCount <= 4) {
    score -= 20;
    spendingScoreContribution = 60;
  } else {
    score -= 50;
    spendingScoreContribution = 30;
  }

  // Clamp overall Credit Score between 300 and 900
  const finalCreditScore = Math.max(300, Math.min(900, Math.round(score)));

  // Score Rating
  let creditRating: CreditHealthReport['creditRating'] = 'Good';
  if (finalCreditScore >= 800) {
    creditRating = 'Excellent';
  } else if (finalCreditScore >= 740) {
    creditRating = 'Very Good';
  } else if (finalCreditScore >= 670) {
    creditRating = 'Good';
  } else if (finalCreditScore >= 580) {
    creditRating = 'Fair';
  } else {
    creditRating = 'Poor';
  }

  // 2. Credit Stress Score (0 to 100 index)
  // Higher utilization + higher EMIs + missed repayments = Higher Stress
  let stress = 0;
  
  // A. Utilization component: 40% weight (e.g. 50% utilization -> 20 stress points)
  stress += Math.min(40, (util / 100) * 40);

  // B. EMI component: 30% weight (e.g. emiToIncome > 30% -> 30 stress points)
  stress += Math.min(30, (emiToIncome / 30) * 30);

  // C. Repayment Lapses: 30% weight
  if (repayment.unpaidCount > 0) {
    stress += 30; // Maximum repayment stress
  } else if (repayment.partialCount > 0) {
    stress += 20;
  } else if (repayment.lateCount > 0) {
    stress += 10;
  }

  const creditStressScore = Math.round(Math.max(0, Math.min(100, stress)));

  // Stress Rating
  let stressRating: CreditHealthReport['stressRating'] = 'Low';
  if (creditStressScore > 75) {
    stressRating = 'Critical';
  } else if (creditStressScore > 45) {
    stressRating = 'High';
  } else if (creditStressScore > 20) {
    stressRating = 'Moderate';
  } else {
    stressRating = 'Low';
  }

  // Factor breakdown details
  const factors: CreditHealthReport['factors'] = [
    {
      name: 'Repayment Discipline',
      score: repaymentScoreContribution,
      impact: 'high',
      description: 'Measures consistency in paying statement balances before the official grace period expires.',
      status: repaymentScoreContribution >= 90 ? 'excellent' : repaymentScoreContribution >= 75 ? 'good' : repaymentScoreContribution >= 60 ? 'fair' : 'critical',
    },
    {
      name: 'Credit Utilization',
      score: utilizationScoreContribution,
      impact: 'high',
      description: 'Measures the proportion of available credit limits currently being occupied.',
      status: utilizationScoreContribution >= 90 ? 'excellent' : utilizationScoreContribution >= 75 ? 'good' : utilizationScoreContribution >= 60 ? 'fair' : 'critical',
    },
    {
      name: 'Debt Pressure',
      score: debtScoreContribution,
      impact: 'medium',
      description: 'Evaluates fixed credit EMI payments against your reported monthly household income.',
      status: debtScoreContribution >= 90 ? 'excellent' : debtScoreContribution >= 75 ? 'good' : debtScoreContribution >= 60 ? 'fair' : 'critical',
    },
    {
      name: 'Spending Stability',
      score: spendingScoreContribution,
      impact: 'low',
      description: 'Assesses variance in credit spending, flagging extreme discretionary spikes.',
      status: spendingScoreContribution >= 90 ? 'excellent' : spendingScoreContribution >= 75 ? 'good' : spendingScoreContribution >= 60 ? 'fair' : 'critical',
    },
  ];

  return {
    creditScore: finalCreditScore,
    creditRating,
    creditStressScore,
    stressRating,
    factors,
  };
}
