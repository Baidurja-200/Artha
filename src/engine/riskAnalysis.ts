/**
 * Intelligent Risk Analysis Engine
 * Calculates risk capacity based on actual financial data, not just questionnaires.
 */
export const calculateRiskCapacity = (profile, metrics) => {
  const { detailedScores } = metrics;
  
  const emergencyScore = detailedScores.find(s => s.id === 'emergency')?.score || 0;
  const debtScore = detailedScores.find(s => s.id === 'debt')?.score || 0;
  const savingsScore = detailedScores.find(s => s.id === 'savings')?.score || 0;

  // Weighted Risk Capacity Math
  // Strong emergency and low debt means high risk capacity.
  const riskCapacityScore = Math.round((emergencyScore * 0.4) + (debtScore * 0.3) + (savingsScore * 0.3));
  
  let classification = "";
  let rationale = "";
  let equityAllocation = 0;
  let debtAllocation = 0;

  if (riskCapacityScore > 80) {
    classification = "High Structural Risk Capacity";
    equityAllocation = 85;
    debtAllocation = 15;
    rationale = `Your strong emergency reserve (Score: ${emergencyScore}) and excellent debt management (Score: ${debtScore}) provide a formidable safety net. Because a sudden job loss or market crash will not force you to liquidate investments, your portfolio is structurally capable of absorbing high market volatility. You can afford heavy exposure to Mid and Small Cap equities for long-term alpha generation.`;
  } else if (riskCapacityScore > 50) {
    classification = "Moderate Structural Risk Capacity";
    equityAllocation = 60;
    debtAllocation = 40;
    rationale = `While your savings rate is healthy, your current debt levels or emergency runway indicate that extreme market drawdowns could cause liquidity issues. We recommend a balanced approach with a solid base of Index Funds and Debt Mutual Funds to cushion volatility while still beating inflation.`;
  } else {
    classification = "Low Structural Risk Capacity";
    equityAllocation = 30;
    debtAllocation = 70;
    rationale = `Your current financial foundation is vulnerable. With low emergency reserves or high debt obligations, market volatility poses a direct threat to your livelihood. Capital preservation must be your priority. Focus on liquid funds, FD replacements, and clearing expensive loans before aggressively buying equity.`;
  }

  return {
    score: riskCapacityScore,
    classification,
    rationale,
    suggestedAllocation: {
      equity: equityAllocation,
      debt: debtAllocation
    }
  };
};
