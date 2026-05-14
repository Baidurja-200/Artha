/**
 * Financial Tradeoff Analyzer
 * Evaluates opportunity costs and risks associated with current allocations.
 */

export const analyzeTradeoffs = (profile, investments, metrics) => {
  const tradeoffs = [];
  const { detailedScores } = metrics;

  const emergencyScore = detailedScores.find(s => s.id === 'emergency')?.score || 0;
  const debtScore = detailedScores.find(s => s.id === 'debt')?.score || 0;
  const sipRatio = profile.monthlyIncome > 0 ? (investments.totalSIP / profile.monthlyIncome) * 100 : 0;
  const dti = profile.monthlyIncome > 0 ? (profile.debtEMI / profile.monthlyIncome) * 100 : 0;

  // Tradeoff 1: Aggressive investing with weak emergency buffer
  if (sipRatio > 15 && emergencyScore < 50) {
    tradeoffs.push({
      id: 'tradeoff_emergency_sip',
      title: 'High SIP vs. Low Liquidity',
      tradeoff: 'Aggressive investing without emergency reserves may increase financial stress.',
      impact: 'Opportunity Cost: While you are compounding wealth, a sudden emergency could force you to sell your mutual funds at a loss during a market dip, destroying years of returns.',
      action: 'Divert 50% of your current SIPs into a liquid fund until you reach a 6-month runway.'
    });
  }

  // Tradeoff 2: High Debt vs investing
  if (dti > 30 && sipRatio > 5) {
    tradeoffs.push({
      id: 'tradeoff_debt_sip',
      title: 'Debt Interest vs. Investment Returns',
      tradeoff: 'Paying home/personal loan EMIs while simultaneously investing means your net returns are reduced by your loan interest.',
      impact: 'Risk Implication: If your loan interest rate (e.g. 11%) is higher than your post-tax portfolio returns, you are mathematically losing money every month.',
      action: 'Consider pausing voluntary investments to pre-pay any unsecured, high-interest debt first.'
    });
  }

  // Tradeoff 3: Low SIP vs High Savings (Cash Drag)
  const totalSavings = profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI;
  const savingsRate = (totalSavings / profile.monthlyIncome) * 100;
  
  if (savingsRate > 25 && sipRatio < 10) {
    tradeoffs.push({
      id: 'tradeoff_cash_drag',
      title: 'High Cash Savings vs. Inflation',
      tradeoff: 'Holding too much cash in savings accounts creates a "cash drag" on your net worth.',
      impact: 'Opportunity Cost: With 6% inflation, uninvested cash loses purchasing power. You are paying a hidden tax on your surplus wealth.',
      action: 'Gradually increase your equity SIPs to match your actual savings surplus.'
    });
  }

  return tradeoffs;
};
