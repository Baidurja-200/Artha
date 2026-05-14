/**
 * Dynamic Personalized Insights Engine
 * Generates contextual, explainable, and prioritized financial observations.
 */

export const generateSmartInsights = (metrics, profile, investments) => {
  const insights = [];

  // 1. Evaluate Emergency Preparedness
  const emergency = metrics.detailedScores.find(s => s.id === 'emergency');
  if (emergency.score < 50) {
    insights.push({
      id: 'insight_emergency',
      priority: 1, // Highest priority
      type: 'critical',
      title: 'Prioritize Emergency Preparedness',
      text: `Your emergency reserve is dangerously low at ${emergency.insight.split(' ')[4]} months. A sudden medical or job disruption could force you into high-interest debt. Prioritize building this to 6 months before making any further equity investments.`
    });
  } else if (emergency.score >= 100) {
    insights.push({
      id: 'insight_emergency_good',
      priority: 5,
      type: 'success',
      title: 'Solid Emergency Buffer',
      text: `Your emergency fund strength is excellent. Since you have over 6 months of runway, you can safely direct all future surplus into high-growth investments.`
    });
  }

  // 2. Evaluate Debt
  const debt = metrics.detailedScores.find(s => s.id === 'debt');
  if (debt.score < 40) {
    insights.push({
      id: 'insight_debt',
      priority: 2,
      type: 'danger',
      title: 'Debt Burden is Limiting Wealth Creation',
      text: `Your debt consumes ${debt.insight.split(' ')[5]} of your income. This severely restricts your ability to compound wealth. Consider utilizing the 'debt avalanche' method to clear high-interest obligations immediately.`
    });
  }

  // 3. Evaluate Savings Sustainability
  const savings = metrics.detailedScores.find(s => s.id === 'savings');
  if (savings.score < 50) {
    insights.push({
      id: 'insight_savings',
      priority: 3,
      type: 'warning',
      title: 'Savings Rate Needs Optimization',
      text: `You are saving only ${savings.insight.split(' ')[3]} of your income. To achieve financial independence in India, a savings rate of at least 20-30% is necessary to outpace inflation.`
    });
  }

  // 4. Evaluate SIP / Investment Growth
  const sipRatio = (investments.totalSIP / profile.monthlyIncome) * 100;
  if (sipRatio < 10 && savings.score >= 50) {
    insights.push({
      id: 'insight_sip_low',
      priority: 4,
      type: 'warning',
      title: 'Underutilizing Investable Surplus',
      text: `You have a healthy savings rate, but your SIP allocations are only ${sipRatio.toFixed(1)}% of your income. Cash sitting in savings accounts loses purchasing power to inflation. Consider stepping up your SIPs.`
    });
  } else if (sipRatio >= 20) {
    insights.push({
      id: 'insight_sip_high',
      priority: 5,
      type: 'success',
      title: 'Aggressive Wealth Compounding',
      text: `You are directing an impressive ${sipRatio.toFixed(1)}% of your income into SIPs. This aggressive stance will significantly shorten your timeline to financial independence.`
    });
  }

  // 5. Goal Readiness
  const goals = metrics.detailedScores.find(s => s.id === 'goals');
  if (goals && goals.score < 60) {
    insights.push({
      id: 'insight_goals',
      priority: 2,
      type: 'warning',
      title: 'Goals Are Underfunded',
      text: `At your current investment pace, your defined targets may fall short. Consider increasing your SIP contributions by 10-15% annually to bridge the gap and combat inflation.`
    });
  }

  // Tax observation (Mocked for now since profile doesn't have 80c field yet, assuming a standard check)
  if (!profile.tax80c || profile.tax80c < 150000) {
    insights.push({
      id: 'insight_tax',
      priority: 4,
      type: 'info',
      title: 'Tax Optimization Opportunity',
      text: `You are underutilizing available Section 80C tax-saving opportunities. Consider allocating up to ₹1.5L in ELSS Mutual Funds to save tax while building equity wealth.`
    });
  }

  // Sort by priority (1 is highest)
  insights.sort((a, b) => a.priority - b.priority);

  return insights;
};
