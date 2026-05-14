import { calculateGoalReadiness } from '../services/analyticsEngine';

/**
 * Core Scoring Engine for Artha Financial OS
 * Analyzes the entire financial profile and generates 6 actionable scores.
 */
export const generateWellnessScores = (profile, investments, goals) => {
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const monthlyIncome = profile.monthlyIncome || 1;
  
  // 1. Emergency Preparedness Score
  const emergencyMonths = profile.emergencyFund / monthlyExpenses;
  const emergencyScore = Math.min(Math.round((emergencyMonths / 6) * 100), 100);
  
  const emergencyPreparedness = {
    id: 'emergency',
    title: "Emergency Preparedness",
    score: emergencyScore,
    why: "Measures your ability to survive sudden income loss or unexpected large expenses without taking on high-interest debt.",
    risk: emergencyMonths < 3 ? "High Risk: A single medical or job emergency could force you into a debt trap." : "Low Risk: You have enough buffer to ride out typical financial shocks.",
    insight: `You currently have ${emergencyMonths.toFixed(1)} months of runway. The gold standard is 6 months.`,
    suggestion: emergencyMonths < 6 ? `Automate a transfer of ₹${Math.round(monthlyIncome * 0.05).toLocaleString('en-IN')} monthly into a liquid fund until you reach ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.` : "Maintain this balance in a high-yield savings account or liquid mutual fund."
  };

  // 2. Debt Health Score
  const dti = (profile.debtEMI / monthlyIncome) * 100;
  const debtScore = Math.max(100 - Math.round(dti * 2), 0); // 50% DTI = 0 score
  
  const debtHealth = {
    id: 'debt',
    title: "Debt Health",
    score: debtScore,
    why: "Evaluates how much of your monthly income is consumed by past borrowing, indicating your freedom to build future wealth.",
    risk: dti > 40 ? "Critical Risk: High debt obligations leave little room for wealth compounding and increase default probability." : "Controlled Risk: Debt is manageable and not eating into your core wealth generation.",
    insight: `Your Debt-to-Income (DTI) ratio is ${Math.round(dti)}%. Ideally, it should be kept below 30%.`,
    suggestion: dti > 30 ? "Implement the debt avalanche method: aggressively pay off high-interest unsecured loans (credit cards, personal loans) first." : "Your debt is under control. Ensure you prepay expensive loans whenever you get an annual bonus."
  };

  // 3. Savings Sustainability Score
  const totalSavings = monthlyIncome - monthlyExpenses - profile.debtEMI;
  const savingsRate = (totalSavings / monthlyIncome) * 100;
  const savingsScore = Math.min(Math.round((savingsRate / 30) * 100), 100); // 30% is 100 score
  
  const savingsSustainability = {
    id: 'savings',
    title: "Savings Sustainability",
    score: savingsScore,
    why: "Tracks your ability to consistently retain a portion of your income. It is the fundamental fuel for all your investments.",
    risk: savingsRate < 10 ? "Severe Risk: Stagnant wealth creation. Inflation will drastically reduce your future purchasing power." : "Low Risk: You are successfully converting active income into long-term wealth.",
    insight: `You are saving ${Math.round(savingsRate)}% of your income. The 50/30/20 rule dictates a minimum 20% savings rate.`,
    suggestion: savingsRate < 20 ? "Audit your discretionary expenses. Try cutting down subscriptions or dining out by 10% next month." : "Great savings discipline! Consider increasing your SIP allocations proportionately with your annual appraisals."
  };

  // 4. Goal Readiness Score
  let goalReadinessScore = 0;
  let goalInsight = "Set up financial goals to track your readiness.";
  let goalSuggestion = "Define a retirement or wealth creation target in your profile.";
  
  if (goals && goals.length > 0) {
    // We average the readiness probability of all active goals
    const goalScores = goals.map(g => {
      // Find matching SIP allocations for this goal if we had mapped them, else assume totalSIP is spread.
      // For simplicity in this macro engine, we evaluate the primary goal.
      const readiness = calculateGoalReadiness(g.target, g.current, investments.totalSIP, g.timelineYears, 12);
      return readiness.readinessProbability;
    });
    
    goalReadinessScore = Math.round(goalScores.reduce((a, b) => a + b, 0) / goalScores.length);
    goalInsight = `Your current investments and SIPs put you at a ${goalReadinessScore}% probability of hitting your defined goals on time.`;
    goalSuggestion = goalReadinessScore < 80 ? "You may need to step-up your SIP contributions by 10-15% annually to bridge the shortfall." : "You are completely on track. Keep compounding!";
  }

  const goalReadiness = {
    id: 'goals',
    title: "Goal Readiness",
    score: goalReadinessScore,
    why: "Measures the mathematical probability of achieving your life goals (like retirement) based on current compounding trajectories.",
    risk: goalReadinessScore < 50 ? "High Risk: A significant shortfall is projected. You risk running out of capital during retirement." : "Low Risk: The mathematical trajectory points towards successful goal completion.",
    insight: goalInsight,
    suggestion: goalSuggestion
  };

  // 5. Investment Readiness Score
  // Needs strong emergency and low debt
  const investmentReadinessScore = Math.round((emergencyScore * 0.5) + (debtScore * 0.5));
  
  const investmentReadiness = {
    id: 'investment',
    title: "Investment Readiness",
    score: investmentReadinessScore,
    why: "Determines if your financial foundation is solid enough to expose your money to market volatility.",
    risk: investmentReadinessScore < 50 ? "High Risk: Investing heavily now means you might be forced to withdraw at a loss during an emergency." : "Low Risk: Strong foundation allows you to stay invested long-term without panic selling.",
    insight: investmentReadinessScore < 70 ? "Your foundation needs strengthening before starting aggressive equity SIPs." : "You are structurally ready to deploy capital into high-growth equity markets.",
    suggestion: investmentReadinessScore < 50 ? "Pause new equity investments. Redirect that capital to clear bad debt and build your emergency fund first." : "Start exploring Nifty 50 Index funds or Flexi Cap funds for long-term wealth generation."
  };

  // 6. Overall Financial Wellness Score
  // Weighted aggregation: Goals and Savings are growth; Emergency and Debt are defense.
  const overallScoreValue = Math.round((emergencyScore + debtScore + savingsScore + investmentReadinessScore + goalReadinessScore) / 5);
  
  const financialWellness = {
    id: 'overall',
    title: "Financial Wellness",
    score: overallScoreValue,
    why: "The ultimate macroeconomic indicator of your personal financial ecosystem.",
    risk: overallScoreValue < 60 ? "Vulnerable: Your finances require immediate restructuring." : "Resilient: You are on a stable path to financial independence.",
    insight: "This is a weighted aggregation of your debt, savings, emergency buffer, goal trajectory, and investment readiness.",
    suggestion: "Review this score quarterly. The goal is consistent progress, not immediate perfection."
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
