import { calculateGoalReadiness } from '../services/analyticsEngine';

/**
 * Centralized Financial Health Engine for Artha
 * Evaluates user's financial variables (income, expenses, debt, SIP, tax, emergency fund)
 * and generates 6 non-technical, explainable wellness indicators.
 */
export const generateWellnessScores = (profile: any, investments: any, goals: any) => {
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const tax80c = profile.tax80c || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // 1. Emergency Preparedness Score
  const emergencyMonths = emergencyFund / monthlyExpenses;
  const emergencyScore = Math.min(Math.round((emergencyMonths / 6) * 100), 100);
  
  const emergencyPreparedness = {
    id: 'emergency',
    title: "Emergency Preparedness Score",
    score: emergencyScore,
    what: "Measures if you have enough backup savings to handle sudden job loss, medical crises, or major home repairs.",
    why: "Without this buffer, any sudden crisis will force you to borrow expensive money (credit cards, personal loans) and slide into debt.",
    risk: emergencyMonths < 3 
      ? "High Risk: You have less than 3 months of backup. A minor emergency could completely disrupt your financial life." 
      : "Secure: You have a comfortable cash runway to tackle unexpected bumps without stress.",
    insight: `Your emergency reserve covers ${emergencyMonths.toFixed(1)} months of expenses. The recommended standard is 6 months.`,
    suggestion: emergencyMonths < 6 
      ? `Try transferring ₹${Math.round(monthlyIncome * 0.05).toLocaleString('en-IN')} monthly into a safe liquid mutual fund until you reach ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.` 
      : "Excellent work! Keep this amount safe in a highly liquid savings account or flexi-FD, and do not touch it for lifestyle expenses."
  };

  // 2. Debt Health Score
  const dti = (debtEMI / monthlyIncome) * 100;
  // Excellent (DTI <= 15%): score 85-100, Manageable (DTI <= 30%): score 60-85, Warning (DTI <= 45%): score 30-60, Critical (DTI > 45%): score < 30
  const debtScore = Math.max(100 - Math.round(dti * 2.2), 0);
  
  const debtHealth = {
    id: 'debt',
    title: "Debt Health Score",
    score: debtScore,
    what: "Shows how much of your monthly earnings is swallowed up by loan repayments and credit card EMIs.",
    why: "High debt obligations choke your monthly savings. The less EMI you pay, the more money you keep to grow your own wealth.",
    risk: dti > 35 
      ? "Vulnerable: More than 35% of your income goes to EMIs. This severely limits your financial flexibility." 
      : "Comfortable: Your debt burden is light and within safe, manageable levels.",
    insight: `Your EMI-to-income ratio is ${Math.round(dti)}%. Ideally, keeping EMIs under 30% of your salary is considered very healthy.`,
    suggestion: dti > 30 
      ? "Focus on paying off your highest-interest debt first (like credit cards or personal loans) to free up cash. Avoid taking any fresh EMIs." 
      : "Your debt is well managed. Continue to prepay home or car loans whenever you receive annual bonuses or lump-sum windfalls."
  };

  // 3. Savings Health Score
  // Surplus = Income - Expenses - EMI
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;
  const savingsScore = Math.max(0, Math.min(Math.round((savingsRate / 30) * 100), 100)); // 30% savings rate is 100 score
  
  const savingsSustainability = {
    id: 'savings',
    title: "Savings Health Score",
    score: savingsScore,
    what: "Measures your ability to consistently retain a portion of your monthly paycheck.",
    why: "Savings are the raw fuel for building wealth. Earning well doesn't matter if you spend everything; keeping your money is what makes you wealthy.",
    risk: savingsRate < 15 
      ? "Warning: Your savings rate is low. Inflation is eroding your future purchasing power, making long-term goals harder to reach." 
      : "Strong: You are retaining a solid portion of your income, giving you great wealth-creation capacity.",
    insight: `You are saving ₹${Math.max(0, monthlySurplus).toLocaleString('en-IN')} (${Math.round(Math.max(0, savingsRate))}% of income) each month. Standard rule recommends saving at least 20%.`,
    suggestion: savingsRate < 20 
      ? "Review your monthly subscriptions and dining out costs. Aim to save just 5% more next month by setting that money aside the day you get paid." 
      : "Fantastic savings habit! Since your cash accumulation is strong, consider automating more of this surplus into long-term SIPs."
  };

  // 4. Goal Readiness Score
  let goalReadinessScore = 70; // fallback if no goals
  let goalInsight = "Set up specific financial goals (like buying a house or retirement) to track your exact readiness.";
  let goalSuggestion = "Add your major goals in the Goal Planner below to calculate your tailored funding trajectory.";
  
  if (goals && goals.length > 0) {
    const goalScores = goals.map((g: any) => {
      // expected return rates: Equity/General: 12%, Retirement/Long: 12%, Emergency: 6%
      const cagr = g.category === 'emergency' ? 6 : 12;
      const readiness = calculateGoalReadiness(g.target, g.current, totalSIP / goals.length, g.timelineYears, cagr);
      return readiness.readinessProbability;
    });
    
    goalReadinessScore = Math.round(goalScores.reduce((a: number, b: number) => a + b, 0) / goalScores.length);
    goalInsight = `Based on your current savings and SIPs, you have a ${goalReadinessScore}% probability of achieving your active goals on time.`;
    goalSuggestion = goalReadinessScore < 80 
      ? "To bridge the projected shortfall, try stepping up your SIP contributions by 10% each year, or delay your timeline by a year." 
      : "You are totally on track to hit your targets! Maintain your investment discipline.";
  }

  const goalReadiness = {
    id: 'goals',
    title: "Goal Readiness Score",
    score: goalReadinessScore,
    what: "Projects whether your current mutual fund investments and SIPs will grow enough to fund your future life goals.",
    why: "Ensures you don't fall short of large lump sums when milestones like children's higher education or retirement arrive.",
    risk: goalReadinessScore < 60 
      ? "High Shortfall: Your current investment speed is too slow for your future goals. You face a high risk of shortfall." 
      : "On Track: Your compounding speed matches your targets perfectly.",
    insight: goalInsight,
    suggestion: goalSuggestion
  };

  // 5. Investment Readiness Score
  // To invest safely in high-growth equity, you need a strong emergency buffer and manageable debt.
  const investmentScore = Math.round((emergencyScore * 0.6) + (debtScore * 0.4));
  
  const investmentReadiness = {
    id: 'investment',
    title: "Investment Readiness Score",
    score: investmentScore,
    what: "Assesses whether your financial foundation is stable enough to bear the ups and downs of the stock market.",
    why: "Investing in mutual funds or equity before building emergency funds is dangerous, as you might have to sell at a loss during a personal crisis.",
    risk: investmentScore < 50 
      ? "Weak Base: Your emergency fund is too small or loan burden is too high. Aggressive investing right now is highly risky." 
      : "Solid Base: You have a bulletproof backup and low debt, which means you can stay invested through market crashes.",
    insight: investmentScore < 75 
      ? "Your foundation needs strengthening (more emergency savings or clearing bad loans) before starting large equity SIPs." 
      : "You are structurally in a perfect position to build aggressive equity portfolios.",
    suggestion: investmentScore < 55 
      ? "Pause major equity investments temporarily. Put that cash into an emergency savings fund first, then restart your SIPs." 
      : "Start investing in diversified equity index funds or flexi-cap funds to let compounding grow your wealth over time."
  };

  // 6. Overall Financial Health Score
  // Weighted aggregation of all core parts.
  const overallScoreValue = Math.round((emergencyScore * 0.25) + (debtScore * 0.25) + (savingsScore * 0.25) + (investmentScore * 0.15) + (goalReadinessScore * 0.1));
  
  const financialWellness = {
    id: 'overall',
    title: "Financial Health Score",
    score: overallScoreValue,
    what: "The overall single metric that evaluates the strength, safety, and wealth-building power of your finances.",
    why: "Provides a birds-eye view of your financial life, showing if you are vulnerable to shocks or building lasting wealth.",
    risk: overallScoreValue < 50 
      ? "Vulnerable: Your finances are exposed to high risks. Immediate focus on savings and debt control is recommended." 
      : overallScoreValue < 75 
      ? "Stabile: You are doing well, but optimizing your investments and tax plans could put you in the elite wealth bracket." 
      : "Excellent: You are in an outstanding position. Keep up the great compounding habits!",
    insight: `Your overall Financial Health Score is ${overallScoreValue}/100. This is calculated by weighing your defense (emergency and debt) and your growth (savings and goals).`,
    suggestion: "Review this score monthly. Your objective is consistent steady improvement, not overnight perfection."
  };

  return {
    overallScore: overallScoreValue,
    detailedScores: [
      financialWellness,
      investmentReadiness,
      emergencyPreparedness,
      debtHealth,
      savingsSustainability,
      goalReadiness
    ]
  };
};
