import { UserProfile, Expense, Goal } from '../types/finance';
import { StabilityMetrics } from '../financial-health/stabilityEngine';
import { BehaviorAnalysis } from '../behavior-engine/behaviorAnalyzer';
import { CashFlowForecast } from '../forecast-engine/forecaster';

export interface DynamicPriority {
  id: string;
  rank: number;
  importance: 'Critical Priority' | 'High Concern' | 'Action Needed' | 'Growth Opportunity' | 'Maintenance';
  title: string;
  color: string; // border/bg style
  badgeColor: string;
  
  // Explainable Human-Like Breakdown (Requirement #4)
  whatItMeans: string;
  whyItMatters: string;
  impactCreated: string;
  actionToImprove: string;
}

export const generatePersonalizedPriorities = (
  profile: UserProfile & { debtEMI?: number },
  investments: { totalSIP: number; equity: number; debt: number },
  goals: Goal[],
  expenses: Expense[] = [],
  stability: StabilityMetrics,
  behavior: BehaviorAnalysis,
  forecast: CashFlowForecast
): DynamicPriority[] => {
  const priorities: DynamicPriority[] = [];
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // --- 1. Emergency Preparedness Priority ---
  const runwayMonths = emergencyFund / monthlyExpenses;
  if (runwayMonths < 3) {
    priorities.push({
      id: 'prio_emergency',
      rank: 0,
      importance: runwayMonths < 1.5 ? 'Critical Priority' : 'High Concern',
      title: 'Strengthen Your Fragile Emergency Buffer',
      color: 'border-red-500/30 bg-red-500/5 hover:border-red-500/50',
      badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/20',
      whatItMeans: `You currently hold only ${runwayMonths.toFixed(1)} months of emergency cash buffer in reserve (₹${emergencyFund.toLocaleString('en-IN')}) relative to your ₹${monthlyExpenses.toLocaleString('en-IN')} monthly expense baseline.`,
      whyItMatters: 'Without a 6-month buffer, any sudden life shock (medical crisis, salary delay, job loss) will force you to panic-sell compounding equity investments or slide into high-interest credit card debt.',
      impactCreated: 'Building this shield protects your peace of mind and keeps your long-term compounding investments running smoothly during market corrections.',
      actionToImprove: `Pause non-core investments temporarily. Set up an automated auto-transfer of ₹${Math.round(monthlyIncome * 0.1).toLocaleString('en-IN')} on payday to a separate Liquid Fund or flexi-FD until you reach ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.`
    });
  }

  // --- 2. Excessive Debt Burden Priority ---
  const dti = (debtEMI / monthlyIncome) * 100;
  if (dti > 35) {
    priorities.push({
      id: 'prio_debt',
      rank: 0,
      importance: dti > 45 ? 'Critical Priority' : 'High Concern',
      title: 'Reduce Rigid Debt EMI Obligations',
      color: 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50',
      badgeColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      whatItMeans: `Rigid loan EMIs consume ${Math.round(dti)}% of your monthly active income (₹${debtEMI.toLocaleString('en-IN')} out of ₹${monthlyIncome.toLocaleString('en-IN')}).`,
      whyItMatters: 'High DTI chokes your monthly investable surplus, meaning you are locked into a physical labor cycle to pay banks rather than compounding your own future.',
      impactCreated: 'Every loan you prepay unlocks immediate risk-free monthly breathing room and boosts your structural net savings rate.',
      actionToImprove: 'Freeze all shopping credit cards. Use the Debt Avalanche method: target the highest-interest loans first with any windfalls, and avoid all zero-interest EMIs.'
    });
  }

  // --- 3. Poor Savings Consistency Priority ---
  const surplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (surplus / monthlyIncome) * 100;
  if (savingsRate < 15 || behavior.savingsDisciplineScore < 60) {
    priorities.push({
      id: 'prio_savings',
      rank: 0,
      importance: 'Action Needed',
      title: 'Stabilize Fluctuate Savings Consistency',
      color: 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      whatItMeans: `You retain only ${Math.round(Math.max(0, savingsRate))}% of your monthly paycheck as savings surplus. This falls below the recommended 20% safe wealth baseline.`,
      whyItMatters: 'Savings represent the foundational raw fuel for compounding wealth. Earning a high salary is useless if you consume all seeds and leave nothing to plant.',
      impactCreated: 'Restructuring this discipline ensures that inflation does not steadily dissolve your future purchasing power.',
      actionToImprove: 'Set up an automated Save-First rule: auto-debit a minimum 20% target amount the morning your paycheck hits, and audit discretionary UPI subscriptions.'
    });
  }

  // --- 4. Weak Retirement / Goal Readiness Priority ---
  const retirementGoal = goals.find(g => g.category.toLowerCase() === 'retirement');
  const retirementSipRatio = totalSIP / (goals.length || 1);
  const retirementYears = retirementGoal ? retirementGoal.timelineYears : 25;
  const retirementCurrent = retirementGoal ? retirementGoal.current : 0;
  const retirementTarget = retirementGoal ? retirementGoal.target : 50000000;

  // Let's assume low readiness if target is high and current savings/SIPs are low
  const retirementProjectedFv = retirementCurrent * Math.pow(1.12, retirementYears) + 
    (retirementSipRatio * 12 * ((Math.pow(1.12, retirementYears) - 1) / 0.12));
  const retirementShortfall = retirementTarget - retirementProjectedFv;

  if (retirementShortfall > retirementTarget * 0.3) {
    priorities.push({
      id: 'prio_retirement',
      rank: 0,
      importance: 'Growth Opportunity',
      title: 'Bridge Retirement Funding Trajectory Shortfall',
      color: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50',
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      whatItMeans: `Your current mutual fund SIP speed is projected to create a shortfall of ₹${Math.round(retirementShortfall).toLocaleString('en-IN')} for your retirement target.`,
      whyItMatters: 'Inflation in India (average 6%) compounds rapidly. Delaying retirement SIP enhancements now dramatically increases the cost of funding in your later working years.',
      impactCreated: 'Stepping up your allocation utilizes the immense power of early compounding, cutting down your working tenure by several years.',
      actionToImprove: 'Set up an automated Step-Up SIP that increases your mutual fund contributions by 10% annually. This automatically aligns with salary rises without lifestyle creep.'
    });
  }

  // --- 5. Overspending Patterns Priority ---
  const wantsSpends = expenses.filter(e => 
    ['food', 'shopping', 'entertainment'].includes(e.category.toLowerCase())
  );
  const wantsTotal = wantsSpends.reduce((acc, e) => acc + e.amount, 0);
  const wantsPct = (wantsTotal / monthlyIncome) * 100;
  
  if (wantsPct > 35) {
    priorities.push({
      id: 'prio_overspending',
      rank: 0,
      importance: 'Action Needed',
      title: 'Contain Rising Discretionary Wants Spending',
      color: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50',
      badgeColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      whatItMeans: `Your Wants spending (dining, clothing, PVR visits) eats up ${Math.round(wantsPct)}% of gross salary, crossing the 30% wants limit.`,
      whyItMatters: 'Hyper-convenience ordering (Swiggy/Zomato/Blinkit) creates massive structural leaks that quietly drain cash before it can be put to productive use.',
      impactCreated: 'Limiting convenience spending keeps your cash flow highly liquid and flexible.',
      actionToImprove: 'Establish a weekly Wants cap. Shift food ordering to weekends only, and delete automated credit cards linked to delivery apps.'
    });
  }

  // --- 6. Unstable Cash Flow Priority ---
  const cashRemaining = surplus - totalSIP;
  if (cashRemaining < 0) {
    priorities.push({
      id: 'prio_cashflow',
      rank: 0,
      importance: 'Critical Priority',
      title: 'Resolve Cash Flow Investment Deficit',
      color: 'border-red-500/30 bg-red-500/5 hover:border-red-500/50',
      badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/20',
      whatItMeans: `Your recurring expenses and automated SIP debits exceed active income by ₹${Math.abs(cashRemaining).toLocaleString('en-IN')} monthly.`,
      whyItMatters: 'This structural deficit forces you to drain emergency bank balances to fulfill SIPs, which compromises emergency resilience.',
      impactCreated: 'Balancing your baseline ensures that investments are funded by surplus, not active capital depletion.',
      actionToImprove: 'Audit discretionary shopping, or temporarily restructure your mutual fund SIP timeline until emergency funds are refilled.'
    });
  }

  // Fallback: Maintenance
  if (priorities.length === 0) {
    priorities.push({
      id: 'prio_maintain',
      rank: 1,
      importance: 'Maintenance',
      title: 'Maintain Current Wealth Compounding Trajectory',
      color: 'border-green-500/30 bg-green-500/5 hover:border-green-500/50',
      badgeColor: 'bg-green-500/10 text-green-400 border border-green-500/20',
      whatItMeans: 'All core parameters (Emergency runway, Low Debt EMIs, High Savings, SIP alignment) are operating at elite levels.',
      whyItMatters: 'Consistency and patience are the ultimate superpowers in personal finance. Avoiding behavioral mistakes during market cycles is key.',
      impactCreated: 'A highly predictable, safe structure that allows you to ride out stock market corrections with total confidence.',
      actionToImprove: 'Set up annual automatic step-up rules, rebalance your asset allocation once a year, and ignore daily stock market fluctuations.'
    });
  }

  // Rank priorities based on importance severity
  const severityRank: Record<string, number> = {
    'Critical Priority': 1,
    'High Concern': 2,
    'Action Needed': 3,
    'Growth Opportunity': 4,
    'Maintenance': 5
  };

  const sortedPriorities = priorities.sort((a, b) => {
    return severityRank[a.importance] - severityRank[b.importance];
  });

  // Take the top 3 MOST critical priorities and assign ranks
  return sortedPriorities.slice(0, 3).map((p, index) => ({
    ...p,
    rank: index + 1
  }));
};
