export interface AllocationItem {
  category: string;
  percentage: number;
  description: string;
}

export interface PortfolioAllocationResult {
  allocations: AllocationItem[];
  riskProfileName: string;
  reasoning: string;
}

export const getSuggestedAllocation = (
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  ageGroup: 'young' | 'mid' | 'retired',
  primaryGoal: 'retirement' | 'wealth' | 'tax' | 'emergency'
): PortfolioAllocationResult => {
  // Base allocation models
  if (primaryGoal === 'emergency') {
    return {
      riskProfileName: 'Liquid Shield',
      reasoning: 'Emergency savings require 100% immediate liquidity and capital preservation. Equities are high-risk for short timelines.',
      allocations: [
        { category: 'Debt & Liquid Funds', percentage: 100, description: 'Direct liquid schemes with T+1 redemption speed and negligible downside volatility.' }
      ]
    };
  }

  if (riskProfile === 'conservative' || ageGroup === 'retired') {
    return {
      riskProfileName: 'Capital Preserver',
      reasoning: 'Prioritizes downside protection and steady cash flow while capturing lightweight broad index appreciation to beat inflation.',
      allocations: [
        { category: 'Debt & Liquid Funds', percentage: 50, description: 'Stabilizes capital and provides liquid safety buffers against equity swings.' },
        { category: 'Index Funds', percentage: 30, description: 'Captures the returns of India\'s top 50 blue-chip companies passively.' },
        { category: 'Flexi Cap Funds', percentage: 20, description: 'Provides active oversight to pivot allocations dynamically across larger caps.' }
      ]
    };
  }

  if (riskProfile === 'aggressive') {
    return {
      riskProfileName: 'High-Velocity Compounder',
      reasoning: 'Designed to outpace long-term inflation through diversified exposure to mid and small caps. Best suited for investment horizons of 7+ years.',
      allocations: [
        { category: 'Index Funds', percentage: 30, description: 'Low-cost core equity anchor following Nifty 50 or Sensex.' },
        { category: 'Flexi Cap Funds', percentage: 30, description: 'Dynamic equity layer that moves cash freely across capitalization bands.' },
        { category: 'Mid & Small Cap', percentage: 30, description: 'High-growth sector exposure with heightened volatility for high-return profiles.' },
        { category: 'Debt & Liquid Funds', percentage: 10, description: 'Dry powder cushion to buy future market dips or cover liquid margins.' }
      ]
    };
  }

  // Default: Moderate risk profile
  return {
    riskProfileName: 'Balanced Wealth Creator',
    reasoning: 'Offers a harmonious blend of low-cost passive indices, active capitalization flex-strategies, and low-volatility debt instruments.',
    allocations: [
      { category: 'Index Funds', percentage: 40, description: 'Foundational passive core capturing large-cap blue-chip trends.' },
      { category: 'Flexi Cap Funds', percentage: 30, description: 'Active managers seeking dynamic mispricing opportunities across cap sizes.' },
      { category: 'Mid & Small Cap', percentage: 15, description: 'Moderate allocation to high-alpha growth equities.' },
      { category: 'Debt & Liquid Funds', percentage: 15, description: 'Volatility shock-absorber and regular interest income yield.' }
    ]
  };
};
