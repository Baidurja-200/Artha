import { CreditCard, CreditEMI, CreditRepayment, UserProfile } from '../types/finance';

export interface CreditInsight {
  id: string;
  type: 'warning' | 'tip' | 'positive' | 'info';
  title: string;
  what: string; // Detail description
  why: string; // Explaining context
  action: string; // Next steps
}

export function generateCreditInsights(
  creditCards: CreditCard[],
  creditEMIs: CreditEMI[],
  repayments: CreditRepayment[],
  profile: UserProfile
): CreditInsight[] {
  const insights: CreditInsight[] = [];

  // 1. Check upcoming card dues (Within next 7 days)
  const today = new Date();
  const currentDay = today.getDate();

  creditCards.forEach((card) => {
    const dueDay = parseInt(card.dueDate, 10);
    if (!isNaN(dueDay) && card.currentBalance > 0) {
      let daysRemaining = dueDay - currentDay;
      if (daysRemaining < 0) {
        // Assume next month's due date
        daysRemaining += 30; // Approximation
      }

      if (daysRemaining <= 7 && daysRemaining >= 0) {
        insights.push({
          id: `due-${card.id}`,
          type: daysRemaining <= 3 ? 'warning' : 'info',
          title: `Upcoming Bill Due: ${card.bank} ${card.name}`,
          what: `An amount of ₹${card.currentBalance.toLocaleString('en-IN')} is due in ${daysRemaining} days (Due Date: Day ${card.dueDate}).`,
          why: `Late payments attract high finance charges (~42% APR) and negatively impact your payment history metric, which represents 35% of your credit score.`,
          action: `Set up an immediate transfer of ₹${card.currentBalance.toLocaleString('en-IN')} before the due date, or enable Auto-pay.`
        });
      }
    }
  });

  // 2. Check for high utilization on any card
  creditCards.forEach((card) => {
    const utilization = card.limit > 0 ? (card.currentBalance / card.limit) * 100 : 0;
    if (utilization > 30) {
      insights.push({
        id: `util-${card.id}`,
        type: utilization > 50 ? 'warning' : 'tip',
        title: `High Utilization on ${card.name}`,
        what: `Your current utilization on ${card.name} is ${utilization.toFixed(1)}% (₹${card.currentBalance.toLocaleString('en-IN')} out of ₹${card.limit.toLocaleString('en-IN')}).`,
        why: `Exceeding 30% utilization on individual cards flags you as a higher credit risk to bureaus, dragging down your credit score even if you pay in full.`,
        action: `Pay off a portion (₹${Math.round(card.currentBalance - card.limit * 0.3).toLocaleString('en-IN')}) before the statement date (${card.statementDate}th) to report a lower balance.`
      });
    }
  });

  // 3. Check for recent payment issues (e.g. SBI OneCard is partial in seed data)
  const problematicRepayments = repayments.filter(r => r.status === 'partial' || r.status === 'late' || r.status === 'unpaid');
  if (problematicRepayments.length > 0) {
    const recentProblem = repayments[repayments.length - 1]; // Let's take the most recent
    const card = creditCards.find(c => c.id === recentProblem.cardId);
    
    if (recentProblem && (recentProblem.status === 'partial' || recentProblem.status === 'unpaid')) {
      const cardLabel = card ? `${card.bank} ${card.name}` : 'Credit Card';
      insights.push({
        id: `repay-problem-${recentProblem.id}`,
        type: 'warning',
        title: `Lapsed Status: ${cardLabel}`,
        what: `Your repayment for billing month ${recentProblem.billingMonth} is marked as '${recentProblem.status}' with ₹${(recentProblem.amountDue - recentProblem.amountPaid).toLocaleString('en-IN')} remaining unpaid.`,
        why: `Unpaid/partial balances trigger revolving credit interest calculations instantly, and late statuses are reported to CIBIL/Experian after 30 days.`,
        action: `Clear the outstanding ₹${(recentProblem.amountDue - recentProblem.amountPaid).toLocaleString('en-IN')} immediately to stop interest compounding and repair your record.`
      });
    }
  }

  // 4. Overall EMI Burden & Cash Flow Impact
  const totalEMIAmount = creditEMIs.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const emiToIncomeRatio = profile.monthlyIncome > 0 ? (totalEMIAmount / profile.monthlyIncome) * 100 : 0;
  
  if (emiToIncomeRatio > 15) {
    insights.push({
      id: `emi-burden`,
      type: emiToIncomeRatio > 25 ? 'warning' : 'tip',
      title: `Elevated EMI Commitment`,
      what: `Your credit card EMIs consume ₹${totalEMIAmount.toLocaleString('en-IN')} per month, which represents ${emiToIncomeRatio.toFixed(1)}% of your monthly income.`,
      why: `High fixed commitments squeeze your monthly disposable income, leaving less room for mutual fund SIPs, equity investments, and emergency runway allocations.`,
      action: `Avoid converting new credit card transactions to EMIs. Plan to close existing tenures early if pre-closure charges are negligible.`
    });
  } else if (totalEMIAmount > 0) {
    insights.push({
      id: `emi-ok`,
      type: 'positive',
      title: `EMI Commitment Under Control`,
      what: `Your monthly card EMIs total ₹${totalEMIAmount.toLocaleString('en-IN')} (${emiToIncomeRatio.toFixed(1)}% of income).`,
      why: `Keeping fixed debt commitments below 15% preserves your cash flow flexibility and allows you to invest aggressively.`,
      action: `Maintain this discipline. Prioritize direct debit payments for smaller goods instead of choosing interest-bearing EMIs.`
    });
  }

  // 5. Reward Yield positive feedback
  const totalRewards = creditCards.reduce((sum, c) => sum + c.rewardEarned, 0);
  if (totalRewards > 15000) {
    insights.push({
      id: 'rewards-pro',
      type: 'positive',
      title: `Outstanding Reward Optimization`,
      what: `You have accumulated ₹${totalRewards.toLocaleString('en-IN')} in rewards and cashback.`,
      why: `Optimizing card categories shows high financial acumen and allows you to discount lifestyle expenditures via rewards yield.`,
      action: `Keep auditing category leakages. Remember to redeem expiring reward points periodically.`
    });
  }

  return insights;
}
