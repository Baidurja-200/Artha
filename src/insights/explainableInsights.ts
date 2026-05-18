import { UserProfile, Expense, NetWorthEntry, Goal } from '../types/finance';

export interface MomentumMetrics {
  savingsStreakMonths: number;
  emergencyGrowthPct: number;
  debtReductionPct: number;
  investmentDisciplineScore: number; // 0 to 100
  overallImprovementPoints: number;
  progressNarrative: string;
  momentumIndicator: 'accelerating' | 'climbing' | 'flat' | 'descending';
}

export const calculateFinancialMomentum = (
  profile: UserProfile & { debtEMI?: number },
  investments: { totalSIP: number; equity: number; debt: number },
  trackingHistory: NetWorthEntry[] = []
): MomentumMetrics => {
  if (trackingHistory.length < 2) {
    return {
      savingsStreakMonths: 1,
      emergencyGrowthPct: 0,
      debtReductionPct: 0,
      investmentDisciplineScore: 70,
      overallImprovementPoints: 0,
      progressNarrative: "You have just initiated your Artha journey. Maintain steady SIP contributions next month to establish your first financial momentum streak!",
      momentumIndicator: 'climbing'
    };
  }

  // Sort tracking history by date
  const sortedHistory = [...trackingHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const latestSnapshot = sortedHistory[sortedHistory.length - 1];
  const previousSnapshot = sortedHistory[sortedHistory.length - 2];
  const earliestSnapshot = sortedHistory[0];

  // 1. Calculate overall improvement points
  const overallImprovementPoints = latestSnapshot.overallScore - earliestSnapshot.overallScore;

  // 2. Savings Streak
  // Calculate for how many consecutive snapshots the overallScore or savingsRate has improved or remained healthy
  let savingsStreakMonths = 0;
  for (let i = sortedHistory.length - 1; i >= 0; i--) {
    const snap = sortedHistory[i];
    const prev = sortedHistory[i - 1];
    
    if (prev) {
      const snapSavingsRate = snap.savingsRate || 0;
      const prevSavingsRate = prev.savingsRate || 0;
      
      if (snapSavingsRate >= 20 || snapSavingsRate > prevSavingsRate) {
        savingsStreakMonths++;
      } else {
        break; // streak broken
      }
    } else {
      // first month
      savingsStreakMonths++;
    }
  }
  
  // Ensure a minimum streak count of 1
  if (savingsStreakMonths === 0) savingsStreakMonths = 1;

  // 3. Emergency Growth
  const latestEmergencyScore = latestSnapshot.emergencyScore || 50;
  const earliestEmergencyScore = earliestSnapshot.emergencyScore || 50;
  const emergencyGrowthPct = latestEmergencyScore - earliestEmergencyScore;

  // 4. Debt Reduction
  const latestDebtScore = latestSnapshot.debtScore || 50;
  const earliestDebtScore = earliestSnapshot.debtScore || 50;
  const debtReductionPct = latestDebtScore - earliestDebtScore;

  // 5. Investment Discipline
  // High if SIP investments represent a stable or growing share of income
  const sipRatio = (investments.totalSIP / (profile.monthlyIncome || 1)) * 100;
  const investmentDisciplineScore = Math.min(100, Math.round((sipRatio / 20) * 100));

  // Determine Momentum Indicator
  let momentumIndicator: MomentumMetrics['momentumIndicator'] = 'flat';
  const scoreDiff = latestSnapshot.overallScore - previousSnapshot.overallScore;

  if (scoreDiff > 4) {
    momentumIndicator = 'accelerating';
  } else if (scoreDiff > 0) {
    momentumIndicator = 'climbing';
  } else if (scoreDiff < 0) {
    momentumIndicator = 'descending';
  }

  // 6. Generate Progress Narrative
  let progressNarrative = "";
  if (overallImprovementPoints > 15) {
    progressNarrative = `Outstanding wealth acceleration! Your overall financial wellness score has expanded by a huge ${overallImprovementPoints} points since starting. Your compounding pipelines are beautifully secure.`;
  } else if (overallImprovementPoints > 5) {
    progressNarrative = `Steady upward compounding! Your wellness index has climbed by ${overallImprovementPoints} points. Your consistent ${savingsStreakMonths}-month savings streak is creating robust resilience buffers.`;
  } else if (overallImprovementPoints >= 0) {
    progressNarrative = "You are maintaining a highly stable baseline. Focus on accelerating your emergency buffer and avoiding credit card EMIs to unlock high momentum.";
  } else {
    progressNarrative = "Your wealth buffers are experiencing minor pressure due to rising discretionary costs. Trim convenience spending next month to restore your climbing streak.";
  }

  return {
    savingsStreakMonths,
    emergencyGrowthPct,
    debtReductionPct,
    investmentDisciplineScore,
    overallImprovementPoints,
    progressNarrative,
    momentumIndicator
  };
};

export interface ReusableInsight {
  id: string;
  category: 'emergency' | 'debt' | 'savings' | 'goals' | 'investments';
  severity: 'critical' | 'warning' | 'positive' | 'info';
  title: string;
  
  // Explainability Core (Requirement #4)
  whatItMeans: string;
  whyItMatters: string;
  impactCreated: string;
  actionToImprove: string;
}

export const generateExplainableInsights = (
  profile: UserProfile & { debtEMI?: number; tax80c?: number },
  investments: { totalSIP: number; equity: number; debt: number },
  goals: Goal[],
  expenses: Expense[] = []
): ReusableInsight[] => {
  const insights: ReusableInsight[] = [];
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // 1. Emergency Preparedness
  const runwayMonths = emergencyFund / monthlyExpenses;
  if (runwayMonths < 3) {
    insights.push({
      id: 'exp_emergency_low',
      category: 'emergency',
      severity: 'critical',
      title: 'Dangerously Small Emergency Runway',
      whatItMeans: `Your backup cash buffer of ₹${emergencyFund.toLocaleString('en-IN')} covers only ${runwayMonths.toFixed(1)} months of standard monthly living outlays.`,
      whyItMatters: 'Without a 6-month shield, any sudden disruption will force you to dissolve high-performing mutual funds at a loss, or take high-cost loans.',
      impactCreated: 'Securing this shield immunizes your wealth-building portfolio from daily panic sales during stock market dips.',
      actionToImprove: `Auto-deposit ₹${Math.round(monthlyIncome * 0.1).toLocaleString('en-IN')} right after payday into a safe liquid fund until your buffer reaches ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.`
    });
  } else if (runwayMonths < 6) {
    insights.push({
      id: 'exp_emergency_mid',
      category: 'emergency',
      severity: 'warning',
      title: 'Strengthen Emergency Buffer to Gold Standard',
      whatItMeans: `You have ${runwayMonths.toFixed(1)} months of expenses saved. You are moderately protected but still partially exposed to protracted setbacks.`,
      whyItMatters: 'A bulletproof 6-month cash runway gives you the psychological peace of mind to take aggressive career risks or stay invested during recessions.',
      impactCreated: 'Climbing to the 6-month mark eliminates underlying stress and fully secures your structural stability.',
      actionToImprove: `Divert an extra ₹${Math.round(monthlyIncome * 0.05).toLocaleString('en-IN')} of your unallocated cash surplus to top up your backup reserve account.`
    });
  } else {
    insights.push({
      id: 'exp_emergency_high',
      category: 'emergency',
      severity: 'positive',
      title: 'Bulletproof Emergency Shield Active',
      whatItMeans: `Your reserve funds comfortably cover a full ${runwayMonths.toFixed(1)} months of living costs (₹${emergencyFund.toLocaleString('en-IN')}).`,
      whyItMatters: 'You have completely neutralized the threat of sudden layoffs or medical emergencies disrupting your long-term plans.',
      impactCreated: 'Provides an outstanding buffer, enabling you to dedicate 100% of your ongoing surplus to high-growth compounding SIPs.',
      actionToImprove: 'Keep these funds safe in high-liquidity accounts like flexi-FDs, and do not touch them for regular lifestyle desires.'
    });
  }

  // 2. Debt Burden
  const dti = (debtEMI / monthlyIncome) * 100;
  if (dti > 35) {
    insights.push({
      id: 'exp_debt_high',
      category: 'debt',
      severity: 'critical',
      title: 'Vulnerable Monthly Debt Commitment',
      whatItMeans: `Loan repayments swallow ${Math.round(dti)}% of your active monthly income (₹${debtEMI.toLocaleString('en-IN')} out of ₹${monthlyIncome.toLocaleString('en-IN')}).`,
      whyItMatters: 'EMIs represent rigid outflows that severely restrict your investable cash flow, tying your active labor to interest repayments.',
      impactCreated: 'Reducing this burden instantly increases your monthly surplus, equivalent to unlocking a risk-free return on capital.',
      actionToImprove: 'Adopt the debt avalanche method: aggressively prepay high-interest unsecured card loans, and avoid any new credit commitments.'
    });
  } else if (dti > 0) {
    insights.push({
      id: 'exp_debt_mid',
      category: 'debt',
      severity: 'warning',
      title: 'Low but Active EMI Overhead',
      whatItMeans: `Loan EMIs consume ${Math.round(dti)}% of your monthly cash inflows. You have fair breathing room but room for optimization.`,
      whyItMatters: 'Keeping EMIs low ensures that a temporary salary decline does not trigger severe liquidity pressure or late payment penalties.',
      impactCreated: 'Prepaying these debts frees up extra cash that can immediately be redirected into compounding mutual fund SIPs.',
      actionToImprove: 'Set aside 20% of any annual bonuses or performance increments to prepay outstanding car or personal loans early.'
    });
  } else {
    insights.push({
      id: 'exp_debt_none',
      category: 'debt',
      severity: 'positive',
      title: 'Total Interest Freedom Secured',
      whatItMeans: 'You have zero active EMI loan repayments or outstanding debt obligations logged.',
      whyItMatters: 'You retain 100% of your earnings to compound your own future wealth, completely avoiding bank interest drag.',
      impactCreated: 'Provides the absolute highest level of cash flow flexibility and personal freedom to take career leaps.',
      actionToImprove: 'Protect this state of freedom! Carefully ignore retail marketing tricks like "zero-cost EMIs" for non-essential buys.'
    });
  }

  // 3. Savings Rate
  const surplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (surplus / monthlyIncome) * 100;
  if (savingsRate < 15) {
    insights.push({
      id: 'exp_savings_low',
      category: 'savings',
      severity: 'critical',
      title: 'Unoptimized Monthly Net Savings Rate',
      whatItMeans: `You retain only ${Math.round(Math.max(0, savingsRate))}% of your paycheck as monthly savings surplus (₹${Math.max(0, surplus).toLocaleString('en-IN')}).`,
      whyItMatters: 'Retaining less than 15% in India\'s high-growth economy makes it difficult to outpace inflation, putting your future milestones at risk.',
      impactCreated: 'Boosting this rate ensures your active income is successfully transformed into high-yield compounding assets.',
      actionToImprove: 'Audit discretionary wants like hyper-convenience dining apps. Auto-debit a 20% savings target right on paycheck day.'
    });
  } else if (savingsRate >= 30) {
    insights.push({
      id: 'exp_savings_elite',
      category: 'savings',
      severity: 'positive',
      title: 'Elite Wealth Accumulation Active',
      whatItMeans: `You retain an outstanding ${Math.round(savingsRate)}% of your monthly gross income as savings surplus.`,
      whyItMatters: 'Retaining over 30% of income places you on the fast track to early retirement and complete financial independence.',
      impactCreated: 'Provides maximum wealth building velocity, compounding into large nest eggs far ahead of your peers.',
      actionToImprove: 'Maintain this beautiful habit. Ensure this surplus is put to work in index funds rather than sitting idle in bank accounts.'
    });
  }

  return insights;
};
