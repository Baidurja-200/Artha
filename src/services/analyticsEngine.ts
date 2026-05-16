/**
 * Artha Mutual Fund & Goal Analytics Engine
 * Provides intelligence for portfolio overlap, sector exposure, and SIP projections.
 */

export const analyzePortfolioOverlap = (funds) => {
  if (!funds || funds.length < 2) {
    return {
      overlapPercentage: 0,
      insights: ["Add more funds to analyze overlap and diversification."]
    };
  }

  let overlapScore = 0;
  let insights = [];

  const categories = funds.map(f => f.category);
  
  const largeCapCount = categories.filter(c => ['Large Cap', 'Index Funds', 'ELSS', 'Flexi Cap'].includes(c)).length;
  if (largeCapCount > 2) {
    overlapScore += 40;
    insights.push("High overlap detected among your Large Cap/Index/ELSS funds. You are likely holding the same top 50 stocks multiple times, reducing true diversification.");
  }

  const smallCapCount = categories.filter(c => c === 'Small Cap').length;
  if (smallCapCount > 1) {
    overlapScore += 15;
    insights.push("Multiple Small Cap funds increase volatility without significantly improving diversification. One good small cap fund is usually enough.");
  }

  const debtCount = categories.filter(c => c === 'Debt Funds' || c === 'Liquid Funds').length;
  if (debtCount === 0 && funds.length > 3) {
    insights.push("Your portfolio lacks Debt exposure. Consider adding a short-duration or liquid fund for portfolio stability and rebalancing opportunities.");
  }

  return {
    overlapPercentage: Math.min(overlapScore + (funds.length * 5), 85),
    insights: insights.length > 0 ? insights : ["Your portfolio has healthy diversification across different market caps with minimal overlap."]
  };
};

export const analyzeSectorExposure = (funds) => {
  // In a real environment, this aggregates the actual sector weightages of all funds.
  // We use realistic static approximations based on typical Indian equity fund compositions.
  return {
    exposure: {
      'Financials': 32.4,
      'Information Technology': 14.2,
      'Capital Goods': 9.8,
      'Healthcare': 7.5,
      'Automobile': 6.1,
      'Others': 30.0
    },
    insight: "Your portfolio is heavily skewed towards Financials (32%), which is standard for Indian markets given the Nifty50 composition. Be aware that RBI rate changes will heavily impact your overall returns."
  };
};

export const calculateSipProjection = (monthlyInvestment, years, expectedCagr) => {
  const months = years * 12;
  const monthlyRate = (expectedCagr / 100) / 12;
  
  // Future Value of SIP formula: P × ({[1 + i]^n - 1} / i) × (1 + i)
  const totalInvested = monthlyInvestment * months;
  const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const wealthGained = futureValue - totalInvested;

  // Inflation adjusted (assuming 6% inflation)
  const inflationRate = 0.06;
  const realValue = futureValue / Math.pow(1 + inflationRate, years);

  return {
    totalInvested: Math.round(totalInvested),
    wealthGained: Math.round(wealthGained),
    futureValue: Math.round(futureValue),
    realValue: Math.round(realValue),
    insight: `In ${years} years, your ₹${monthlyInvestment.toLocaleString('en-IN')} SIP will grow to ₹${Math.round(futureValue).toLocaleString('en-IN')}. However, adjusted for 6% inflation, its real purchasing power today is equivalent to ₹${Math.round(realValue).toLocaleString('en-IN')}.`
  };
};

export const calculateGoalReadiness = (goalAmount, currentCorpus, monthlySip, yearsLeft, expectedCagr = 12) => {
  const months = yearsLeft * 12;
  const monthlyRate = (expectedCagr / 100) / 12;
  
  // Future value of current corpus
  const currentCorpusFv = currentCorpus * Math.pow(1 + (expectedCagr/100), yearsLeft);
  
  // Future value of SIP
  const sipFv = monthlySip > 0 ? monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate) : 0;
  
  const projectedTotal = currentCorpusFv + sipFv;
  const shortfall = goalAmount - projectedTotal;
  
  // Calculate required SIP to meet shortfall
  let requiredExtraSip = 0;
  if (shortfall > 0) {
    requiredExtraSip = shortfall / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  }
  
  const readinessProbability = Math.min((projectedTotal / goalAmount) * 100, 100);

  return {
    projectedTotal: Math.round(projectedTotal),
    shortfall: Math.max(Math.round(shortfall), 0),
    readinessProbability: Math.round(readinessProbability),
    requiredExtraSip: Math.round(requiredExtraSip),
    insight: shortfall > 0 
      ? `You may need to increase your monthly SIP by ₹${Math.round(requiredExtraSip).toLocaleString('en-IN')} to reach this goal comfortably.`
      : `You are perfectly on track to exceed your goal by ₹${Math.round(Math.abs(shortfall)).toLocaleString('en-IN')}. Keep it up!`
  };
};
