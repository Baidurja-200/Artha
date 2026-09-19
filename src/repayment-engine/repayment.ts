import { CreditRepayment } from '../types/finance';

export interface RepaymentMetrics {
  totalBills: number;
  onTimeCount: number;
  lateCount: number;
  partialCount: number;
  unpaidCount: number;
  onTimeRate: number; // percentage (0-100)
  streakMonths: number;
  disciplineScore: number; // 0-100 metric based on status
  reliabilityStatus: 'stellar' | 'good' | 'impaired' | 'critical';
  missedPaymentsHistory: CreditRepayment[];
}

export function analyzeRepayments(repayments: CreditRepayment[]): RepaymentMetrics {
  if (repayments.length === 0) {
    return {
      totalBills: 0,
      onTimeCount: 0,
      lateCount: 0,
      partialCount: 0,
      unpaidCount: 0,
      onTimeRate: 100,
      streakMonths: 0,
      disciplineScore: 100,
      reliabilityStatus: 'stellar',
      missedPaymentsHistory: [],
    };
  }

  const totalBills = repayments.length;
  let onTimeCount = 0;
  let lateCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  repayments.forEach((r) => {
    switch (r.status) {
      case 'ontime':
        onTimeCount++;
        break;
      case 'late':
        lateCount++;
        break;
      case 'partial':
        partialCount++;
        break;
      case 'unpaid':
        unpaidCount++;
        break;
    }
  });

  const onTimeRate = (onTimeCount / totalBills) * 100;

  // Calculate streak: sort repayments by date/billingMonth descending and count consecutive 'ontime' payments
  // We want to group repayments by month. Let's group repayments by billingMonth.
  const monthlyRepayments = [...repayments].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
  
  let streakMonths = 0;
  for (const rep of monthlyRepayments) {
    if (rep.status === 'ontime') {
      streakMonths++;
    } else {
      break;
    }
  }

  // Calculate a discipline score (max 100)
  // Penalties: ontime = 0 penalty, late = 15 points penalty, partial = 25 points penalty, unpaid = 45 points penalty
  // Weighted average penalty
  let totalPenalty = 0;
  repayments.forEach((r) => {
    if (r.status === 'late') totalPenalty += 15;
    if (r.status === 'partial') totalPenalty += 25;
    if (r.status === 'unpaid') totalPenalty += 45;
  });
  
  // Normalize penalty over the number of bills, but cap minimum at 10 to keep it realistic if there's any missed payment
  const avgPenalty = totalBills > 0 ? totalPenalty / totalBills : 0;
  let disciplineScore = Math.max(0, 100 - avgPenalty * 1.5);
  
  // If there are unpaid bills, cap the discipline score
  if (unpaidCount > 0) {
    disciplineScore = Math.min(disciplineScore, 50);
  }
  if (partialCount > 0 || lateCount > 0) {
    disciplineScore = Math.min(disciplineScore, 85);
  }

  let reliabilityStatus: 'stellar' | 'good' | 'impaired' | 'critical' = 'stellar';
  if (disciplineScore >= 95) {
    reliabilityStatus = 'stellar';
  } else if (disciplineScore >= 80) {
    reliabilityStatus = 'good';
  } else if (disciplineScore >= 60) {
    reliabilityStatus = 'impaired';
  } else {
    reliabilityStatus = 'critical';
  }

  const missedPaymentsHistory = repayments.filter(r => r.status !== 'ontime');

  return {
    totalBills,
    onTimeCount,
    lateCount,
    partialCount,
    unpaidCount,
    onTimeRate,
    streakMonths,
    disciplineScore,
    reliabilityStatus,
    missedPaymentsHistory,
  };
}
