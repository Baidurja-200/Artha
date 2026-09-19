import { UserProfile, Expense, NetWorthEntry, Budget } from '../types/finance';

export interface BehaviorFinding {
  id: string;
  severity: 'critical' | 'warning' | 'positive';
  title: string;
  finding: string;
  whyItMatters: string;
  psychologicalTrigger: string;
  actionableStep: string;
}

export interface BehaviorAnalysis {
  savingsDisciplineScore: number; // 0 to 100
  budgetingConsistencyScore: number; // 0 to 100
  debtDependencyScore: number; // 0 to 100 (high score means low dependency)
  investingConsistencyScore: number; // 0 to 100
  findings: BehaviorFinding[];
}

export const analyzeFinancialBehavior = (
  profile: UserProfile & { debtEMI?: number },
  investments: { totalSIP: number },
  expenses: Expense[] = [],
  trackingHistory: NetWorthEntry[] = [],
  budget: Budget = { needsLimit: 50, wantsLimit: 30, savingsLimit: 20 }
): BehaviorAnalysis => {
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;
  const targetWantsLimit = budget.wantsLimit / 100;
  const targetNeedsLimit = budget.needsLimit / 100;

  const findings: BehaviorFinding[] = [];

  // --- 1. SPENDING VOLATILITY & BUDGETING CONSISTENCY ---
  // Group discretionary expenses (shopping, food, entertainment, travel)
  const discretionaryExpenses = expenses.filter(e => 
    ['food', 'shopping', 'entertainment', 'travel'].includes(e.category.toLowerCase())
  );
  
  const totalDiscretionary = discretionaryExpenses.reduce((acc, e) => acc + e.amount, 0);
  const wantsRatio = totalDiscretionary / monthlyIncome;

  // Let's compute a mock volatility based on transaction date spread & sizes
  // If there are many high-value shopping transactions logged, volatility increases
  const shoppingSpends = expenses.filter(e => e.category.toLowerCase() === 'shopping');
  const hasSpikes = shoppingSpends.some(s => s.amount > monthlyIncome * 0.1); // spent >10% of salary on a single shopping item

  let budgetingScore = 85;
  if (wantsRatio > targetWantsLimit * 1.3) {
    budgetingScore -= 30;
    findings.push({
      id: 'behavior_overspending',
      severity: 'critical',
      title: 'Discretionary Overspending Patterns',
      finding: `Your wants spending consumes ${Math.round(wantsRatio * 100)}% of income, exceeding your defined budget target of ${budget.wantsLimit}%.`,
      whyItMatters: 'Overspending on temporary lifestyle wants permanently locks up capital that could otherwise compound into long-term safety nets.',
      psychologicalTrigger: 'Often fueled by "lifestyle inflation" and emotional impulses to match peer group spending habits.',
      actionableStep: 'Implement the 48-Hour Rule: Wait 48 hours before completing any non-essential purchase over ₹3,000 to cool off impulse desires.'
    });
  } else if (hasSpikes) {
    budgetingScore -= 15;
    findings.push({
      id: 'behavior_volatility',
      severity: 'warning',
      title: 'Spending Volatility Spikes',
      finding: 'Your spending volatility suggests inconsistent budgeting discipline, characterized by sudden high-value shopping items.',
      whyItMatters: 'Unpredictable spending peaks make it difficult to establish a stable monthly cash baseline, risking sudden emergency fund drawdowns.',
      psychologicalTrigger: 'Impulsive buying or "retail therapy" during periods of work stress.',
      actionableStep: 'Create a separate "Fun Fund" bank balance and transfer a fixed amount monthly. Once it is empty, freeze discretionary retail buys.'
    });
  } else {
    findings.push({
      id: 'behavior_budget_good',
      severity: 'positive',
      title: 'Resilient Budgeting Discipline',
      finding: 'Your transaction outlays are highly controlled and align beautifully within your target budget frameworks.',
      whyItMatters: 'Ensures a regular, predictable surplus that acts as the stable engine of your long-term compounding net worth.',
      psychologicalTrigger: 'Mindful spending habits and strong clarity on long-term vs short-term trade-offs.',
      actionableStep: 'Maintain this beautiful focus! Celebrate milestones without upgrading fixed life overheads.'
    });
  }

  // --- 2. SAVINGS CONSISTENCY ---
  // Evaluate the standard deviation of savings rate in historical monthly snapshots
  let savingsDisciplineScore = 80;
  let savingsFluctuation = false;
  
  if (trackingHistory.length >= 3) {
    const savingsRates = trackingHistory
      .map(h => h.savingsRate)
      .filter((r): r is number => r !== undefined);
      
    if (savingsRates.length >= 2) {
      const avgSavings = savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length;
      const variance = savingsRates.reduce((acc, r) => acc + Math.pow(r - avgSavings, 2), 0) / savingsRates.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 8) {
        savingsFluctuation = true;
        savingsDisciplineScore = Math.max(30, 90 - Math.round(stdDev * 4));
      }
    }
  }

  if (savingsFluctuation) {
    findings.push({
      id: 'behavior_savings_inconsistent',
      severity: 'warning',
      title: 'Inconsistent Savings Discipline',
      finding: 'Your historical savings rate fluctuates widely month-on-month, suggesting irregular savings behavior.',
      whyItMatters: 'Inconsistent savings delay the achievement of core long-term financial goals, as compounding requires regular fuel.',
      psychologicalTrigger: 'Saving "what is left" at the end of the month, rather than putting savings aside first (reactive vs proactive saving).',
      actionableStep: 'Adopt the "Save-First" methodology: Automate your target savings transfer to a separate account the morning your salary is credited.'
    });
  } else {
    const currentSurplus = monthlyIncome - profile.monthlyExpenses - debtEMI;
    const currentSavingsRate = (currentSurplus / monthlyIncome) * 100;
    if (currentSavingsRate >= 20) {
      findings.push({
        id: 'behavior_savings_solid',
        severity: 'positive',
        title: 'Bulletproof Savings Consistency',
        finding: 'You consistently maintain a highly stable, predictable monthly savings baseline above the 20% golden standard.',
        whyItMatters: 'Guarantees that your wealth-creation momentum remains uninterrupted across market cycles and short-term bumps.',
        psychologicalTrigger: 'Proactive habit formation and strong financial boundaries.',
        actionableStep: 'Consider increasing your automated investment contributions by 5% to harness compounding speeds even faster.'
      });
    }
  }

  // --- 3. DEBT DEPENDENCY ---
  const dti = (debtEMI / monthlyIncome) * 100;
  let debtDependencyScore = Math.max(0, 100 - Math.round(dti * 2));

  if (dti > 35) {
    findings.push({
      id: 'behavior_debt_dependency',
      severity: 'critical',
      title: 'Rising Debt Dependency Risk',
      finding: 'Your loan commitment levels represent a high dependency on debt to finance lifestyle or assets.',
      whyItMatters: 'High debt commitments tie your physical labor to banks, meaning you are forced to work active hours just to meet fixed interest overheads.',
      psychologicalTrigger: 'The illusion of "affordable EMIs" which makes high-ticket lifestyle items seem cheaper than they truly are.',
      actionableStep: 'Strictly freeze credit card use. Set up a physical card ban and transition all lifestyle shopping to pure debit payments.'
    });
  }

  // --- 4. INVESTING CONSISTENCY ---
  let investingConsistencyScore = 90;
  const sipRatio = (totalSIP / monthlyIncome) * 100;

  if (totalSIP === 0) {
    investingConsistencyScore = 10;
    findings.push({
      id: 'behavior_invest_none',
      severity: 'critical',
      title: 'Inactive Investment Pipelines',
      finding: 'You have zero active automated investments (SIPs) logged in your wealth structure.',
      whyItMatters: 'Holding all savings in liquid cash guarantees that inflation is stealthily depleting your true purchasing power.',
      psychologicalTrigger: 'Fear of stock market volatility or analysis paralysis when choosing the "perfect" mutual fund scheme.',
      actionableStep: 'Start with a simple, diversified Large Cap Index Fund SIP of just ₹2,000 to break the paralysis and form the investing habit.'
    });
  } else if (sipRatio < 10 && currentDiscretionary > totalSIP) {
    investingConsistencyScore = 60;
    findings.push({
      id: 'behavior_invest_unbalanced',
      severity: 'warning',
      title: 'Unbalanced Discretionary vs Growth Allocation',
      finding: 'Your active monthly wants spending exceeds your total compounding investment contributions.',
      whyItMatters: 'You are dedicating more resources to current short-term entertainment than to secure your future financial independence.',
      psychologicalTrigger: 'Hyperbolic Discounting: The cognitive tendency to value immediate rewards far more than future long-term wealth.',
      actionableStep: 'Adopt the Match Rule: Every time you buy an expensive lifestyle want, invest an equivalent amount into your mutual fund SIP.'
    });
  }

  return {
    savingsDisciplineScore,
    budgetingConsistencyScore: budgetingScore,
    debtDependencyScore,
    investingConsistencyScore,
    findings
  };
};
