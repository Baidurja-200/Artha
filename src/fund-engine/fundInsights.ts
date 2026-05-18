export interface CurationDetail {
  whyThisFund: string;
  bestFor: string;
  idealHorizon: string;
  expectedVolatility: 'Low' | 'Moderate' | 'High' | 'Very High';
  volatilityExplanation: string;
  riskExplanation: string;
  goalMapping: string[];
  suitabilityInsights: string;
  consistencyRating: 'Consistent Performer' | 'High Alpha Volatility' | 'Liquid Safety';
}

const INSIGHTS_DB: Record<string, CurationDetail> = {
  // Index Funds
  '120503': {
    whyThisFund: 'Passively captures raw index gains of India\'s largest 50 companies with a rock-bottom expense ratio of 0.20%. No active fund manager risk.',
    bestFor: 'Beginners looking for direct long-term equity growth without complexity.',
    idealHorizon: '5+ years',
    expectedVolatility: 'High',
    volatilityExplanation: 'Will fluctuate in direct alignment with the Nifty 50 index, but historically recovers steadily.',
    riskExplanation: 'High equity exposure. Short-term downside is possible, but provides highly transparent long-term returns.',
    goalMapping: ['wealth creation', 'retirement', 'child education'],
    suitabilityInsights: 'Excellent core anchor for long-term equity portfolios; not suitable for emergency reserves.',
    consistencyRating: 'Consistent Performer'
  },
  '147703': {
    whyThisFund: 'Broad large-cap exposure tracking Nifty 50 with exact tracking efficiency and negligible cash drag.',
    bestFor: 'Passive-first investors seeking stable blue-chip accumulation.',
    idealHorizon: '5+ years',
    expectedVolatility: 'High',
    volatilityExplanation: 'Identical market correlation with large-cap indexes. Negligible tracking error.',
    riskExplanation: 'Fully correlated to the broader market, offering solid large-cap security with minimal manager drag.',
    goalMapping: ['wealth creation', 'retirement'],
    suitabilityInsights: 'Excellent low-cost foundation for wealth building.',
    consistencyRating: 'Consistent Performer'
  },
  '118989': {
    whyThisFund: 'HDFC Index Nifty 50 is a massive, trusted passive scheme backed by strong structural liquidity.',
    bestFor: 'Highly conservative equity investors seeking reliable index replication.',
    idealHorizon: '5+ years',
    expectedVolatility: 'High',
    volatilityExplanation: 'Resilient long-term benchmark tracker with extreme liquidity buffers.',
    riskExplanation: 'Subject to macro market corrections, but recovers quickly alongside national GDP expansion.',
    goalMapping: ['wealth creation', 'retirement', 'home purchase'],
    suitabilityInsights: 'Highly reliable passive entry point for wealth creators.',
    consistencyRating: 'Consistent Performer'
  },
  // Flexi Cap
  '119551': {
    whyThisFund: 'Globally diversified flexi-cap that dynamically shifts allocations across large, mid, and small cap sectors, with international exposure for currency hedging.',
    bestFor: 'Investors seeking a single, highly active, and adaptive equity fund manager.',
    idealHorizon: '7+ years',
    expectedVolatility: 'Moderate',
    volatilityExplanation: 'Active downside protection strategies historically lead to lower drawdowns during market corrections.',
    riskExplanation: 'Active fund manager risk, but mitigated by highly selective equity picks and strong cash allocations.',
    goalMapping: ['wealth creation', 'retirement', 'child education'],
    suitabilityInsights: 'Best-in-class multi-cap compounder with strong downside resilience.',
    consistencyRating: 'Consistent Performer'
  },
  '122639': {
    whyThisFund: 'HDFC Flexi Cap is a legacy active compounder with a highly aggressive allocation profile.',
    bestFor: 'Aggressive wealth accumulators with a long investment window.',
    idealHorizon: '7+ years',
    expectedVolatility: 'High',
    volatilityExplanation: 'Exhibits sharp swings during market highs but generates significant alpha outperformance.',
    riskExplanation: 'Subject to sector shifts, requiring strong holding discipline during temporary underperformance phases.',
    goalMapping: ['wealth creation', 'retirement'],
    suitabilityInsights: 'Perfect for long-term target goals like child education or home purchase.',
    consistencyRating: 'High Alpha Volatility'
  },
  // Large Cap
  '120828': {
    whyThisFund: 'Focuses strictly on high-quality blue chips with low tracking error and strong corporate governance oversight.',
    bestFor: 'Moderate risk investors seeking equity returns with lower volatility.',
    idealHorizon: '5+ years',
    expectedVolatility: 'Moderate',
    volatilityExplanation: 'Low downside volatility compared to mid-caps due to large-cap sector stability.',
    riskExplanation: 'Moderate equity risk. Highly resilient during credit freezes or economic slowdowns.',
    goalMapping: ['wealth creation', 'home purchase'],
    suitabilityInsights: 'Highly suited for medium-to-long term goals where principal security is moderately valued.',
    consistencyRating: 'Consistent Performer'
  },
  '119062': {
    whyThisFund: 'Mirae Asset Large Cap / ICICI Bluechip represents highly resilient large-cap structures.',
    bestFor: 'Moderate investors looking for steady, low-stress capital compounding.',
    idealHorizon: '5+ years',
    expectedVolatility: 'Moderate',
    volatilityExplanation: 'Extremely resilient to sudden down-swings, acting as a structural portfolio cushion.',
    riskExplanation: 'Low active manager risk; follows large-cap growth trends closely.',
    goalMapping: ['wealth creation', 'home purchase', 'retirement'],
    suitabilityInsights: 'Perfect for investors seeking stable equity exposure with low anxiety levels.',
    consistencyRating: 'Consistent Performer'
  },
  // Mid & Small Cap
  '146503': {
    whyThisFund: 'Quant / Nippon Small Cap is an aggressive mid/small-cap giant capturing fast-growing emerging enterprises.',
    bestFor: 'Aggressive investors who can tolerate heavy 20-30% market drawdowns for immense compounding.',
    idealHorizon: '10+ years',
    expectedVolatility: 'Very High',
    volatilityExplanation: 'High volatility; experiences extreme short-term fluctuations but generates market-beating alpha long-term.',
    riskExplanation: 'High capital risk in localized cycles, requiring absolute long-term holding discipline.',
    goalMapping: ['wealth creation', 'passive investing'],
    suitabilityInsights: 'Only suitable for small percentages of total net worth to boost alpha compounding.',
    consistencyRating: 'High Alpha Volatility'
  },
  // ELSS
  '118272': {
    whyThisFund: 'Mirae/Quant ELSS offers a highly tax-efficient wealth engine with Section 80C benefits and the shortest 3-year lock-in.',
    bestFor: 'Tax planning normal salaried investors who want equity exposure with tax exemptions.',
    idealHorizon: '3-5 years',
    expectedVolatility: 'High',
    volatilityExplanation: 'Lock-in period naturally enforces holding discipline, helping investors ride out short-term fluctuations.',
    riskExplanation: 'Mandatory 3-year lock-in prevents premature redemptions, ensuring you capture compound returns.',
    goalMapping: ['tax saving', 'wealth creation'],
    suitabilityInsights: 'Highly optimal for regular tax-saving planning under Section 80C.',
    consistencyRating: 'Consistent Performer'
  },
  // Liquid & Debt
  '120586': {
    whyThisFund: 'SBI Liquid/Liquid Debt yields predictable interest income with near-zero principal volatility. Extreme security.',
    bestFor: 'Investors storing emergency buffers or seeking near-cash parking options.',
    idealHorizon: '1-6 months',
    expectedVolatility: 'Low',
    volatilityExplanation: 'Fluctuates minimally. Earns steady, daily interest payouts on highly secure treasury bills.',
    riskExplanation: 'Near-zero default risk. Perfect capital shield against equity market crashes.',
    goalMapping: ['emergency reserve'],
    suitabilityInsights: 'Highly recommended for holding 100% of your immediate emergency reserve.',
    consistencyRating: 'Liquid Safety'
  }
};

export const getFundInsights = (schemeCode: string, fundName: string): CurationDetail => {
  const custom = INSIGHTS_DB[schemeCode];
  if (custom) return custom;

  // Dynamic fallback for other search results
  const name = fundName.toLowerCase();
  let whyThisFund = 'Active Indian mutual fund capturing localized growth opportunities.';
  let bestFor = 'Investors seeking broad capitalization growth in emerging Indian industries.';
  let idealHorizon = '5+ years';
  let expectedVolatility: 'Low' | 'Moderate' | 'High' | 'Very High' = 'High';
  let volatilityExplanation = 'Subject to macro market trends and localized index changes.';
  let riskExplanation = 'Standard market risks apply. Moderate to high capital swings during cycle shifts.';
  let goalMapping = ['wealth creation'];
  let suitabilityInsights = 'Suitable for medium-to-long term capital compounding.';
  let consistencyRating: 'Consistent Performer' | 'High Alpha Volatility' | 'Liquid Safety' = 'Consistent Performer';

  if (name.includes('index')) {
    whyThisFund = 'Passively replicates benchmark index returns, eliminating high active manager costs and active manager risk.';
    bestFor = 'Investors seeking low-cost, worry-free long-term compounding.';
    idealHorizon = '5+ years';
    expectedVolatility = 'High';
    volatilityExplanation = 'Fluctuates exactly in tandem with index movements.';
    riskExplanation = 'Highly correlated to the broader market, offering solid long-term passive results.';
    goalMapping = ['wealth creation', 'retirement'];
    suitabilityInsights = 'Perfect passive foundation for young long-term investors.';
  } else if (name.includes('liquid') || name.includes('treasury')) {
    whyThisFund = 'Parks capital in low-risk treasury instruments for immediate liquidity and safety.';
    bestFor = 'Investors parking emergency reserves or short-term lump sums.';
    idealHorizon = '1-6 months';
    expectedVolatility = 'Low';
    volatilityExplanation = 'Minimal fluctuations with near-zero downside risk.';
    riskExplanation = 'Highly secure, investing in government debt bills with low credit exposure.';
    goalMapping = ['emergency reserve'];
    suitabilityInsights = 'Perfect for emergency runway safety and immediate cash access.';
    consistencyRating = 'Liquid Safety';
  } else if (name.includes('debt') || name.includes('bond')) {
    whyThisFund = 'Invests in secure corporate debentures and commercial papers to generate steady returns.';
    bestFor = 'Conservative investors looking for regular income and low asset risk.';
    idealHorizon = '1-3 years';
    expectedVolatility = 'Moderate';
    volatilityExplanation = 'Affected by interest rate movements, but structurally stable.';
    riskExplanation = 'Low-to-moderate risk depending on issuer credit rating quality.';
    goalMapping = ['emergency reserve', 'home purchase'];
    suitabilityInsights = 'Excellent alternative to low-yield savings accounts or fixed deposits.';
  } else if (name.includes('small cap')) {
    whyThisFund = 'Captures aggressive compound cycles of dynamic, fast-scaling small enterprises.';
    bestFor = 'Aggressive investors targeting high long-term alpha gains.';
    idealHorizon = '7-10+ years';
    expectedVolatility = 'Very High';
    volatilityExplanation = 'Experiences steep short-term drops but delivers exponential long-term expansion.';
    riskExplanation = 'High capital risk. Holding discipline is mandatory to survive sharp corrections.';
    goalMapping = ['wealth creation', 'passive investing'];
    suitabilityInsights = 'Excellent booster component for high-risk portfolios.';
    consistencyRating = 'High Alpha Volatility';
  } else if (name.includes('tax') || name.includes('elss')) {
    whyThisFund = 'Generates tax-free compounding under Section 80C with a fast 3-year lock-in period.';
    bestFor = 'Salaried individuals looking for direct tax shelter and long-term equity upside.';
    idealHorizon = '3-5 years';
    expectedVolatility = 'High';
    volatilityExplanation = 'Volatile but structured. 3-year lock-in keeps you focused on long-term compound rules.';
    riskExplanation = 'High equity risk, but lock-in reduces emotional panic selling during crashes.';
    goalMapping = ['tax saving', 'wealth creation'];
    suitabilityInsights = 'Excellent choice for mandatory tax-saving allocations.';
  }

  return {
    whyThisFund,
    bestFor,
    idealHorizon,
    expectedVolatility,
    volatilityExplanation,
    riskExplanation,
    goalMapping,
    suitabilityInsights,
    consistencyRating
  };
};
