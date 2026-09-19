import { getFundInsights } from './fundInsights';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserHeldFund {
  schemeCode: string;
  schemeName: string;
  category: string;
  risk: string;
  expenseRatio: number | string;
  aum: string;
  type: string;
  monthlySIP: number;
  totalInvested: number;
  // Live data (populated after fetch)
  currentNav?: number;
  return1Y?: string;
  cagr3Y?: string;
  cagr5Y?: string;
  navHistory?: Array<{ date: string; nav: string }>;
}

export interface CriterionScore {
  name: string;
  score: number;    // 0-100
  weight: number;   // 0-1
  label: string;    // human readable assessment
  detail: string;   // explanation
}

export type Verdict = 'Keep' | 'Watch' | 'Exit';

export interface FundAnalysisResult {
  fund: UserHeldFund;
  compositeScore: number;
  verdict: Verdict;
  verdictReason: string;
  criteria: CriterionScore[];
  actionableAdvice: string;
}

export interface OverlapWarning {
  category: string;
  fundCount: number;
  funds: string[];
  suggestion: string;
}

export interface PortfolioGrade {
  grade: string;      // A+ to D
  label: string;
  color: string;
}

export interface PortfolioAnalysis {
  results: FundAnalysisResult[];
  overlapWarnings: OverlapWarning[];
  portfolioGrade: PortfolioGrade;
  totalInvested: number;
  totalSIP: number;
  categoryDistribution: Array<{ category: string; value: number; count: number }>;
  exitCandidates: FundAnalysisResult[];
  reallocationSuggestions: string[];
}

// ─── Scoring Functions ───────────────────────────────────────────────────────

/**
 * Score expense ratio (lower is better).
 * Index funds: 0.1-0.3 is excellent. Active: 0.5-1.0 is acceptable, >1.5 is poor.
 */
const scoreExpenseRatio = (expenseRatio: number, category: string): CriterionScore => {
  const er = Number(expenseRatio) || 0.8;
  let score: number;
  let label: string;

  const isPassive = category.toLowerCase().includes('index');

  if (isPassive) {
    if (er <= 0.15) { score = 100; label = 'Excellent'; }
    else if (er <= 0.25) { score = 90; label = 'Very Good'; }
    else if (er <= 0.40) { score = 70; label = 'Good'; }
    else if (er <= 0.60) { score = 50; label = 'Average'; }
    else { score = 25; label = 'Expensive for Index'; }
  } else {
    if (er <= 0.50) { score = 95; label = 'Exceptional'; }
    else if (er <= 0.80) { score = 85; label = 'Very Good'; }
    else if (er <= 1.20) { score = 65; label = 'Acceptable'; }
    else if (er <= 1.80) { score = 40; label = 'High'; }
    else { score = 15; label = 'Very Expensive'; }
  }

  return {
    name: 'Expense Ratio',
    score,
    weight: 0.20,
    label,
    detail: `Expense ratio of ${er.toFixed(2)}% — ${label.toLowerCase()} for ${isPassive ? 'passive index' : 'active'} funds.`
  };
};

/**
 * Score returns performance (3Y CAGR as primary, 1Y as secondary).
 */
const scoreReturns = (cagr3Y: string | undefined, return1Y: string | undefined, category: string): CriterionScore => {
  const cagr = parseFloat(cagr3Y || '0');
  const ret1y = parseFloat(return1Y || '0');

  // Use 3Y CAGR as primary, with 1Y as a fallback indicator
  const primaryReturn = !isNaN(cagr) && cagr !== 0 ? cagr : ret1y;

  let score: number;
  let label: string;

  const isDebt = category.toLowerCase().includes('debt') || category.toLowerCase().includes('liquid');

  if (isDebt) {
    if (primaryReturn >= 8) { score = 95; label = 'Outstanding'; }
    else if (primaryReturn >= 6.5) { score = 80; label = 'Very Good'; }
    else if (primaryReturn >= 5) { score = 65; label = 'Acceptable'; }
    else if (primaryReturn >= 3) { score = 45; label = 'Below Average'; }
    else { score = 25; label = 'Poor'; }
  } else {
    if (primaryReturn >= 20) { score = 95; label = 'Outstanding'; }
    else if (primaryReturn >= 15) { score = 85; label = 'Strong'; }
    else if (primaryReturn >= 12) { score = 70; label = 'Good'; }
    else if (primaryReturn >= 8) { score = 50; label = 'Average'; }
    else if (primaryReturn >= 4) { score = 30; label = 'Weak'; }
    else { score = 10; label = 'Very Weak'; }
  }

  return {
    name: 'Returns (3Y CAGR)',
    score,
    weight: 0.25,
    label,
    detail: `3Y CAGR of ${cagr.toFixed(1)}% — ${label.toLowerCase()} performance for ${isDebt ? 'debt' : 'equity'} category.`
  };
};

/**
 * Score risk-adjusted return using a simplified Sharpe-like ratio.
 * Uses NAV history standard deviation as a volatility proxy.
 */
const scoreRiskAdjusted = (cagr3Y: string | undefined, navHistory: Array<{ date: string; nav: string }> | undefined): CriterionScore => {
  const cagr = parseFloat(cagr3Y || '0');

  if (!navHistory || navHistory.length < 30) {
    return {
      name: 'Risk-Adjusted Return',
      score: 50,
      weight: 0.15,
      label: 'Insufficient Data',
      detail: 'Not enough NAV history to calculate risk-adjusted returns.'
    };
  }

  // Calculate monthly returns from NAV data (take last 36 months max)
  const recentNavs = navHistory.slice(0, Math.min(navHistory.length, 260)); // ~1 year of daily
  const monthlyNavs: number[] = [];
  for (let i = 0; i < recentNavs.length; i += 22) { // ~monthly sampling
    monthlyNavs.push(parseFloat(recentNavs[i].nav));
  }

  if (monthlyNavs.length < 3) {
    return {
      name: 'Risk-Adjusted Return',
      score: 50,
      weight: 0.15,
      label: 'Limited Data',
      detail: 'Limited NAV data for volatility analysis.'
    };
  }

  const monthlyReturns = monthlyNavs.slice(0, -1).map((nav, i) => {
    const nextNav = monthlyNavs[i + 1];
    return ((nav - nextNav) / nextNav) * 100;
  });

  const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
  const variance = monthlyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / monthlyReturns.length;
  const stdDev = Math.sqrt(variance);

  const sharpeProxy = stdDev > 0 ? cagr / stdDev : cagr;

  let score: number;
  let label: string;
  if (sharpeProxy >= 3) { score = 95; label = 'Excellent'; }
  else if (sharpeProxy >= 2) { score = 80; label = 'Very Good'; }
  else if (sharpeProxy >= 1.2) { score = 65; label = 'Good'; }
  else if (sharpeProxy >= 0.5) { score = 45; label = 'Average'; }
  else { score = 20; label = 'Poor'; }

  return {
    name: 'Risk-Adjusted Return',
    score,
    weight: 0.15,
    label,
    detail: `Volatility-adjusted efficiency ratio of ${sharpeProxy.toFixed(1)} — ${label.toLowerCase()} risk/reward profile.`
  };
};

/**
 * Score for category overlap (penalizes holding multiple funds in the same category).
 */
const scoreCategoryFit = (
  fund: UserHeldFund,
  allFunds: UserHeldFund[]
): CriterionScore => {
  const sameCategoryCount = allFunds.filter(f => f.category === fund.category).length;

  let score: number;
  let label: string;
  let detail: string;

  if (sameCategoryCount === 1) {
    score = 100;
    label = 'Unique';
    detail = `Only fund in the "${fund.category}" category — no redundancy detected.`;
  } else if (sameCategoryCount === 2) {
    score = 65;
    label = 'Minor Overlap';
    detail = `2 funds in "${fund.category}" — moderate category overlap. Consider if both provide distinct value.`;
  } else if (sameCategoryCount === 3) {
    score = 35;
    label = 'High Overlap';
    detail = `3 funds in "${fund.category}" — significant redundancy. Consider consolidating into the best performer.`;
  } else {
    score = 10;
    label = 'Severe Overlap';
    detail = `${sameCategoryCount} funds in "${fund.category}" — excessive overlap. This dilutes returns and increases tracking complexity.`;
  }

  return {
    name: 'Category Fit',
    score,
    weight: 0.15,
    label,
    detail
  };
};

/**
 * Score based on the fund's consistency rating from fundInsights.
 */
const scoreConsistency = (schemeCode: string, schemeName: string): CriterionScore => {
  const insights = getFundInsights(schemeCode, schemeName);
  const rating = insights.consistencyRating;

  let score: number;
  let label: string;

  switch (rating) {
    case 'Consistent Performer':
      score = 90;
      label = 'Consistent';
      break;
    case 'Liquid Safety':
      score = 85;
      label = 'Stable';
      break;
    case 'High Alpha Volatility':
      score = 55;
      label = 'Volatile';
      break;
    default:
      score = 60;
      label = 'Moderate';
  }

  return {
    name: 'Consistency',
    score,
    weight: 0.10,
    label,
    detail: `Rated as "${rating}" — ${label.toLowerCase()} return pattern over multiple market cycles.`
  };
};

/**
 * Score based on AUM size and fund manager quality (proxy from metadata).
 */
const scoreAUMStrength = (aum: string, type: string): CriterionScore => {
  // Parse AUM string like "45,000 Cr" to number
  const aumNum = parseFloat(aum.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;

  let score: number;
  let label: string;

  const isDebt = type.toLowerCase().includes('debt');

  if (isDebt) {
    // Debt funds benefit from high AUM (liquidity buffer)
    if (aumNum >= 50000) { score = 95; label = 'Massive Liquidity'; }
    else if (aumNum >= 20000) { score = 80; label = 'Very Liquid'; }
    else if (aumNum >= 5000) { score = 65; label = 'Adequate'; }
    else { score = 40; label = 'Small'; }
  } else {
    // Equity: Moderate AUM is best (not too small, not unwieldy)
    if (aumNum >= 10000 && aumNum <= 60000) { score = 90; label = 'Optimal Size'; }
    else if (aumNum >= 5000) { score = 75; label = 'Good Size'; }
    else if (aumNum >= 1000) { score = 55; label = 'Growing'; }
    else { score = 30; label = 'Very Small'; }
  }

  return {
    name: 'Fund Size & Stability',
    score,
    weight: 0.15,
    label,
    detail: `AUM of ₹${aum} — ${label.toLowerCase()} indicates ${score >= 70 ? 'strong investor confidence and liquidity' : 'potential liquidity or stability concerns'}.`
  };
};

// ─── Main Analysis Functions ─────────────────────────────────────────────────

/**
 * Analyze a single fund and produce a scored result.
 */
export const analyzeFund = (
  fund: UserHeldFund,
  allFunds: UserHeldFund[]
): FundAnalysisResult => {
  const criteria: CriterionScore[] = [
    scoreExpenseRatio(Number(fund.expenseRatio), fund.category),
    scoreReturns(fund.cagr3Y, fund.return1Y, fund.category),
    scoreRiskAdjusted(fund.cagr3Y, fund.navHistory),
    scoreCategoryFit(fund, allFunds),
    scoreConsistency(fund.schemeCode, fund.schemeName),
    scoreAUMStrength(fund.aum, fund.type)
  ];

  // Weighted composite score
  const compositeScore = Math.round(
    criteria.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  // Determine verdict
  let verdict: Verdict;
  let verdictReason: string;

  if (compositeScore >= 75) {
    verdict = 'Keep';
    verdictReason = 'Strong performer across multiple criteria. Continue holding and investing.';
  } else if (compositeScore >= 50) {
    verdict = 'Watch';
    verdictReason = 'Acceptable but has weaknesses. Monitor over the next 1-2 quarters before deciding.';
  } else {
    verdict = 'Exit';
    verdictReason = 'Underperforming on key metrics. Consider redeeming and reallocating to better alternatives.';
  }

  // Generate actionable advice
  const weakestCriterion = [...criteria].sort((a, b) => a.score - b.score)[0];
  const strongestCriterion = [...criteria].sort((a, b) => b.score - a.score)[0];

  let actionableAdvice = '';
  if (verdict === 'Exit') {
    actionableAdvice = `Weakest area: ${weakestCriterion.name} (${weakestCriterion.label}). ${weakestCriterion.detail} Consider switching this SIP to a higher-ranked fund in a different category.`;
  } else if (verdict === 'Watch') {
    actionableAdvice = `Monitor: ${weakestCriterion.name} is the weakest link (${weakestCriterion.label}). Strength: ${strongestCriterion.name} (${strongestCriterion.label}).`;
  } else {
    actionableAdvice = `Top strength: ${strongestCriterion.name} (${strongestCriterion.label}). This fund is a solid portfolio anchor.`;
  }

  return {
    fund,
    compositeScore,
    verdict,
    verdictReason,
    criteria,
    actionableAdvice
  };
};

/**
 * Detect overlap warnings across the portfolio.
 */
const detectOverlaps = (funds: UserHeldFund[]): OverlapWarning[] => {
  const categoryMap: Record<string, UserHeldFund[]> = {};
  funds.forEach(f => {
    if (!categoryMap[f.category]) categoryMap[f.category] = [];
    categoryMap[f.category].push(f);
  });

  const warnings: OverlapWarning[] = [];
  for (const [category, categoryFunds] of Object.entries(categoryMap)) {
    if (categoryFunds.length >= 2) {
      const suggestion = categoryFunds.length === 2
        ? `Consider keeping only the better-performing ${category} fund to reduce redundancy.`
        : `You have ${categoryFunds.length} ${category} funds. Consolidate into the top 1-2 performers to simplify your portfolio.`;

      warnings.push({
        category,
        fundCount: categoryFunds.length,
        funds: categoryFunds.map(f => f.schemeName),
        suggestion
      });
    }
  }

  return warnings.sort((a, b) => b.fundCount - a.fundCount);
};

/**
 * Calculate portfolio grade from average composite score.
 */
const getPortfolioGrade = (avgScore: number): PortfolioGrade => {
  if (avgScore >= 85) return { grade: 'A+', label: 'Exceptional Portfolio', color: '#10b981' };
  if (avgScore >= 75) return { grade: 'A', label: 'Strong Portfolio', color: '#22c55e' };
  if (avgScore >= 65) return { grade: 'B+', label: 'Good Portfolio', color: '#84cc16' };
  if (avgScore >= 55) return { grade: 'B', label: 'Decent Portfolio', color: '#eab308' };
  if (avgScore >= 45) return { grade: 'C', label: 'Needs Improvement', color: '#f97316' };
  if (avgScore >= 35) return { grade: 'D+', label: 'Weak Portfolio', color: '#ef4444' };
  return { grade: 'D', label: 'Critical Review Needed', color: '#dc2626' };
};

/**
 * Generate reallocation suggestions based on analysis results.
 */
const generateReallocationSuggestions = (
  results: FundAnalysisResult[],
  overlapWarnings: OverlapWarning[]
): string[] => {
  const suggestions: string[] = [];

  // Exit-based suggestions
  const exitFunds = results.filter(r => r.verdict === 'Exit');
  exitFunds.forEach(ef => {
    const sipText = ef.fund.monthlySIP > 0 ? `₹${ef.fund.monthlySIP.toLocaleString('en-IN')}/month SIP` : 'investment';
    suggestions.push(
      `Move your ${sipText} from ${ef.fund.schemeName.split(' ').slice(0, 4).join(' ')} to a higher-ranked fund — this fund scores only ${ef.compositeScore}/100.`
    );
  });

  // Overlap-based suggestions
  overlapWarnings.forEach(ow => {
    if (ow.fundCount >= 3) {
      suggestions.push(
        `You hold ${ow.fundCount} ${ow.category} funds. Consider consolidating into the top performer to reduce category redundancy and simplify tracking.`
      );
    }
  });

  // Category diversity suggestions
  const categories = results.map(r => r.fund.category);
  const uniqueCategories = [...new Set(categories)];
  const hasEquity = categories.some(c => !c.toLowerCase().includes('debt') && !c.toLowerCase().includes('liquid'));
  const hasDebt = categories.some(c => c.toLowerCase().includes('debt') || c.toLowerCase().includes('liquid'));

  if (hasEquity && !hasDebt && results.length >= 2) {
    suggestions.push(
      'Your portfolio is 100% equity. Consider adding a Debt or Liquid fund for stability and emergency coverage.'
    );
  }

  if (uniqueCategories.length === 1 && results.length >= 2) {
    suggestions.push(
      `All your funds are in "${uniqueCategories[0]}". Diversify across different categories (e.g., Index + Flexi Cap + Debt) for better risk management.`
    );
  }

  return suggestions;
};

/**
 * Run full portfolio analysis on all user-held funds.
 */
export const analyzePortfolio = (funds: UserHeldFund[]): PortfolioAnalysis => {
  if (funds.length === 0) {
    return {
      results: [],
      overlapWarnings: [],
      portfolioGrade: { grade: '-', label: 'No Funds Added', color: '#6b7280' },
      totalInvested: 0,
      totalSIP: 0,
      categoryDistribution: [],
      exitCandidates: [],
      reallocationSuggestions: []
    };
  }

  // Analyze each fund
  const results = funds
    .map(fund => analyzeFund(fund, funds))
    .sort((a, b) => b.compositeScore - a.compositeScore); // Best first

  // Portfolio-level metrics
  const totalInvested = funds.reduce((sum, f) => sum + f.totalInvested, 0);
  const totalSIP = funds.reduce((sum, f) => sum + f.monthlySIP, 0);

  // Category distribution
  const catMap: Record<string, { value: number; count: number }> = {};
  funds.forEach(f => {
    if (!catMap[f.category]) catMap[f.category] = { value: 0, count: 0 };
    catMap[f.category].value += f.totalInvested;
    catMap[f.category].count += 1;
  });
  const categoryDistribution = Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      value: totalInvested > 0 ? (data.value / totalInvested) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.value - a.value);

  // Overlaps
  const overlapWarnings = detectOverlaps(funds);

  // Portfolio grade
  const avgScore = results.reduce((sum, r) => sum + r.compositeScore, 0) / results.length;
  const portfolioGrade = getPortfolioGrade(avgScore);

  // Exit candidates
  const exitCandidates = results.filter(r => r.verdict === 'Exit');

  // Reallocation suggestions
  const reallocationSuggestions = generateReallocationSuggestions(results, overlapWarnings);

  return {
    results,
    overlapWarnings,
    portfolioGrade,
    totalInvested,
    totalSIP,
    categoryDistribution,
    exitCandidates,
    reallocationSuggestions
  };
};
