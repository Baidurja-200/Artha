/**
 * Dynamic Personalized Insights Engine for Artha
 * Generates contextual, explainable, and prioritized financial observations.
 */

export interface IntelligentInsight {
  id: string;
  priority: number; // 1 is highest, 5 is lowest
  type: 'critical' | 'danger' | 'warning' | 'success' | 'info';
  title: string;
  text: string;
  what: string;
  why: string;
  action: string;
}

export const generateSmartInsights = (metrics: any, profile: any, investments: any, expenses: any[] = []): IntelligentInsight[] => {
  const insights: IntelligentInsight[] = [];
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;

  // 1. Evaluate Emergency Preparedness
  const emergency = metrics.detailedScores.find((s: any) => s.id === 'emergency');
  const emergencyMonths = emergencyFund / monthlyExpenses;
  
  if (emergencyMonths < 3) {
    insights.push({
      id: 'insight_emergency_low',
      priority: 1, // Highest
      type: 'critical',
      title: 'Prioritize Building Your Emergency Fund',
      text: `Your emergency reserve covers only ${emergencyMonths.toFixed(1)} months of expenses. A minor medical issue or a job change could force you into borrowing expensive money.`,
      what: "A runway of cash to protect you from life's unexpected events.",
      why: "Without it, emergencies will undo all your investment progress and drag you into high-interest debt traps.",
      action: `Set up an automated deposit of ₹${Math.round(monthlyIncome * 0.08).toLocaleString('en-IN')} right after salary day into a liquid mutual fund until your fund reaches ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.`
    });
  } else if (emergencyMonths < 6) {
    insights.push({
      id: 'insight_emergency_mid',
      priority: 3,
      type: 'warning',
      title: 'Strengthen Your Safety Net',
      text: `You have ${emergencyMonths.toFixed(1)} months of buffer. You are partially protected, but reaching a full 6 months is the golden standard.`,
      what: "A robust safety cushion for maximum peace of mind.",
      why: "A 6-month buffer gives you the confidence to take career leaps or invest in the stock market without fear.",
      action: "Redirect a small part of your monthly surplus to top up your emergency runway."
    });
  } else {
    insights.push({
      id: 'insight_emergency_good',
      priority: 5,
      type: 'success',
      title: 'Solid Emergency Foundation',
      text: `Outstanding! Your emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses. You are highly protected against financial shocks.`,
      what: "A bulletproof financial armor.",
      why: "You have successfully eliminated the need to take expensive loans or sell investments at a loss when emergencies hit.",
      action: "Keep this money parked safely, and focus 100% of your remaining surplus on growing your wealth through SIPs."
    });
  }

  // 2. Evaluate Debt Obligations
  const dti = (debtEMI / monthlyIncome) * 100;
  if (dti > 40) {
    insights.push({
      id: 'insight_debt_high',
      priority: 1,
      type: 'danger',
      title: 'Heavy Loan EMI Burden',
      text: `${Math.round(dti)}% of your salary is consumed by loan repayments. This leaves very little cash to invest and compound your own wealth.`,
      what: "Your Debt-to-Income (DTI) ratio, representing monthly loan commitments.",
      why: "When EMIs consume over 40% of your paycheck, you are working for the bank rather than growing your own asset base.",
      action: "Use the 'debt avalanche' method: aggressively prepay high-interest unsecured loans (like credit cards or personal loans) and freeze any new EMI purchases."
    });
  } else if (dti > 20) {
    insights.push({
      id: 'insight_debt_mid',
      priority: 3,
      type: 'warning',
      title: 'Moderate Debt Commitments',
      text: `Your EMI commitments swallow ${Math.round(dti)}% of your income. While manageable, it restricts your wealth-building speed.`,
      what: "A moderate loan burden that should be monitored.",
      why: "Keeping EMIs low allows you to redirect more surplus into high-yielding mutual fund SIPs that beat inflation.",
      action: "Commit to making a 10% loan prepayment annually whenever you get a bonus or increment."
    });
  } else {
    insights.push({
      id: 'insight_debt_low',
      priority: 5,
      type: 'success',
      title: 'Healthy Debt-Free Lifestyle',
      text: `Excellent! Your EMI obligations take up less than 15% of your income. You enjoy high financial breathing room.`,
      what: "A highly flexible and low-debt cash flow state.",
      why: "Low debt obligations mean your active income remains yours to save, spend, and invest as you please.",
      action: "Maintain this freedom! Avoid zero-cost EMIs for lifestyle shopping that trick you into long commitments."
    });
  }

  // 3. Evaluate Savings Consistency
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;
  
  if (savingsRate < 15) {
    insights.push({
      id: 'insight_savings_low',
      priority: 2,
      type: 'danger',
      title: 'Low Monthly Savings Rate',
      text: `You save only ${Math.round(Math.max(0, savingsRate))}% of your income. In India's fast-growing economy, keeping less than 15% makes it tough to outpace inflation.`,
      what: "The share of income left after living costs and EMIs.",
      why: "Savings are the raw seeds of wealth. You can't plant or harvest a tree if you consume all your seeds every month.",
      action: "Audit your discretionary categories (like dining out or subscription fees). Automate a 20% savings rule right on pay day before you start spending."
    });
  } else if (savingsRate >= 30) {
    insights.push({
      id: 'insight_savings_excellent',
      priority: 5,
      type: 'success',
      title: 'Superb Wealth Accumulation',
      text: `You keep a fantastic ${Math.round(savingsRate)}% of your monthly paycheck. You are building future wealth at an elite speed.`,
      what: "A powerful savings accumulation rate.",
      why: "Saving 30%+ of your income places you on a highly sustainable path to early financial independence.",
      action: "Continue this excellent savings discipline, and make sure this cash is invested rather than sitting lazy in a savings bank account."
    });
  }

  // 4. Evaluate SIP Allocation
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;
  const sipRatio = (totalSIP / monthlyIncome) * 100;
  
  if (sipRatio < 10 && savingsRate >= 20) {
    insights.push({
      id: 'insight_sip_underutilized',
      priority: 3,
      type: 'warning',
      title: 'Idle Cash: Underutilizing SIP Wealth Compounders',
      text: `You have a healthy savings rate, but only ${sipRatio.toFixed(1)}% of your income is allocated to automated SIPs. Sitting on idle cash in bank accounts loses value to inflation.`,
      what: "Automated Systematic Investment Plans (SIPs).",
      why: "Bank accounts yield only 3-4% interest while inflation runs at 6%. Regular equity mutual fund SIPs are crucial to grow your purchasing power over time.",
      action: "Deploy ₹10,000 more of your idle monthly surplus into diversified mutual funds through automated monthly SIPs."
    });
  }

  // 5. Evaluate Tax Optimization
  const tax80c = profile.tax80c || 0;
  if (tax80c < 150000) {
    insights.push({
      id: 'insight_tax_save',
      priority: 4,
      type: 'info',
      title: 'Unclaimed Tax Savings (Sec 80C)',
      text: `You have claimed ₹${tax80c.toLocaleString('en-IN')} in tax deductions under Section 80C. You can claim up to ₹1.5L, saving thousands in annual taxes.`,
      what: "Tax-saving provisions under Section 80C of the Income Tax Act.",
      why: "Failing to optimize this means you are paying unnecessary income tax that could instead be compounding in high-growth ELSS funds.",
      action: `Invest the remaining shortfall of ₹${(150000 - tax80c).toLocaleString('en-IN')} in ELSS (Equity Linked Savings Scheme) mutual funds, which have the shortest lock-in period of 3 years.`
    });
  }

  // Sort by priority (1 = highest)
  insights.sort((a, b) => a.priority - b.priority);
  return insights;
};

/**
 * Calculates a supportive, realistic Financial Stress Score (0-100)
 */
export const getFinancialStressScore = (profile: any, investments: any, metrics: any) => {
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;
  
  // 1. Debt impact (DTI) - up to 40 points
  const dti = (debtEMI / monthlyIncome) * 100;
  const debtPoints = Math.min((dti / 50) * 40, 40); // 50% DTI gives max 40 points

  // 2. Emergency reserves impact - up to 35 points
  const emergencyMonths = emergencyFund / monthlyExpenses;
  let emergencyPoints = 35;
  if (emergencyMonths >= 6) {
    emergencyPoints = 0;
  } else if (emergencyMonths >= 3) {
    emergencyPoints = 15;
  } else if (emergencyMonths >= 1) {
    emergencyPoints = 25;
  }

  // 3. Surplus breathing room impact - up to 25 points
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const surplusRate = (monthlySurplus / monthlyIncome) * 100;
  let surplusPoints = 25;
  if (surplusRate >= 30) {
    surplusPoints = 0;
  } else if (surplusRate >= 15) {
    surplusPoints = 10;
  } else if (surplusRate >= 5) {
    surplusPoints = 18;
  }

  const score = Math.round(debtPoints + emergencyPoints + surplusPoints);
  
  let label = "Low";
  let color = "text-green-400";
  let why = "Your financial safety nets are high, and your debt is low. You have great flexibility and little to worry about.";
  let tip = "Continue building your equity portfolio. You can safely lock up savings for 5+ years because you have solid buffers.";

  if (score >= 75) {
    label = "Critical";
    color = "text-red-500 font-bold";
    why = "High EMI debt combined with low emergency reserves creates severe financial vulnerability during any sudden cash-flow stop.";
    tip = "Pause all equity investing immediately. Negotiate lower interest rates, or sell non-core assets to pay off high-cost credit cards, and aggressively build a 3-month basic cash cushion.";
  } else if (score >= 45) {
    label = "Moderate";
    color = "text-yellow-400";
    why = "Your finances are mostly stable, but a high EMI or an underfunded emergency reserve creates moderate underlying pressure.";
    tip = "Aim to restructure your monthly expenses. Avoid taking new car or lifestyle loans, and direct any bonus or salary increments strictly to prepay loans and boost emergency savings.";
  } else if (score >= 20) {
    label = "Mild";
    color = "text-blue-400";
    why = "Your cash flow is healthy, though minor improvements in emergency funds or loan repayments will make your posture bulletproof.";
    tip = "Commit to saving just 5% more of your salary and direct it to your emergency reserve to reach the recommended 6-month buffer.";
  }

  return {
    score,
    label,
    color,
    why,
    tip
  };
};

/**
 * Dynamically identifies the top 1 to 3 MOST critical priorities
 */
export const getTopPriorities = (metrics: any, profile: any, investments: any, expenses: any[] = []) => {
  const priorities = [];
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const debtEMI = profile.debtEMI || 0;
  const monthlyIncome = profile.monthlyIncome || 1;
  const emergencyFund = profile.emergencyFund || 0;

  // Priority 1: Emergency Fund under 3 months
  const emergencyMonths = emergencyFund / monthlyExpenses;
  if (emergencyMonths < 3) {
    priorities.push({
      id: 'prio_emergency',
      importance: 'Critical',
      color: 'border-red-500/30 bg-red-500/5',
      badgeColor: 'bg-red-400/10 text-red-400',
      title: 'Dangerously Weak Emergency Buffer',
      issue: `Your reserve covers only ${emergencyMonths.toFixed(1)} months of expenses.`,
      solution: `Temporarily stop other investments. Transfer ₹${Math.round(monthlyIncome * 0.1).toLocaleString('en-IN')} monthly into liquid assets until you hit ₹${(monthlyExpenses * 3).toLocaleString('en-IN')}.`
    });
  }

  // Priority 2: Debt DTI > 35%
  const dti = (debtEMI / monthlyIncome) * 100;
  if (dti > 35) {
    priorities.push({
      id: 'prio_debt',
      importance: 'High Concern',
      color: 'border-orange-500/30 bg-orange-500/5',
      badgeColor: 'bg-orange-400/10 text-orange-400',
      title: 'Heavy Monthly EMI Obligations',
      issue: `Loans consume ${Math.round(dti)}% of your monthly cash inflows.`,
      solution: "Stop all credit shopping, credit-card EMIs, and use the debt avalanche method to prepay the highest interest unsecured loans."
    });
  }

  // Priority 3: Low Savings Rate
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;
  if (savingsRate < 15) {
    priorities.push({
      id: 'prio_savings',
      importance: 'Action Required',
      color: 'border-yellow-500/30 bg-yellow-500/5',
      badgeColor: 'bg-yellow-400/10 text-yellow-400',
      title: 'Vulnerable Savings Rate',
      issue: `You are saving only ${Math.round(Math.max(0, savingsRate))}% of your monthly income.`,
      solution: "Review discretionary wants (dining out and shopping) and cut them by 10%. Auto-save your 20% target on paycheck day."
    });
  }

  // Priority 4: Low SIP Rate
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;
  const sipRatio = (totalSIP / monthlyIncome) * 100;
  if (sipRatio < 10 && savingsRate >= 20 && priorities.length < 3) {
    priorities.push({
      id: 'prio_sip',
      importance: 'Growth Opportunity',
      color: 'border-blue-500/30 bg-blue-500/5',
      badgeColor: 'bg-blue-400/10 text-blue-400',
      title: 'Underinvested Idle Cash',
      issue: `You save well, but only ${sipRatio.toFixed(1)}% of income goes into automated SIPs.`,
      solution: "Uninvested savings lose value. Automate a new ₹5,000 index fund SIP using your idle cash."
    });
  }

  // Return up to 3 priorities
  return priorities.slice(0, 3);
};
