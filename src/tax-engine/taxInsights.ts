import { TaxCalculationBreakdown } from './taxCalculatorCore';

export interface TaxInsightItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  actionableStep: string;
}

export interface TaxRegimeRecommendation {
  recommendedRegime: 'Old Regime' | 'New Regime';
  savingsAmount: number;
  reasoning: string;
  insights: TaxInsightItem[];
}

export const generateTaxInsights = (
  oldBreakdown: TaxCalculationBreakdown,
  newBreakdown: TaxCalculationBreakdown,
  hra: number,
  deduction80c: number,
  deduction80d: number,
  homeLoanInterest: number,
  otherDeductions: number
): TaxRegimeRecommendation => {
  const oldTax = oldBreakdown.finalTax;
  const newTax = newBreakdown.finalTax;
  const savingsAmount = Math.abs(oldTax - newTax);
  const recommendedRegime = oldTax < newTax ? 'Old Regime' : 'New Regime';

  // 1. Generate explanation reasoning
  let reasoning = '';
  const totalOldExemptions = oldBreakdown.deductions.totalDeductions;
  
  if (recommendedRegime === 'New Regime') {
    if (newBreakdown.grossIncome - newBreakdown.deductions.standardDeduction <= 1200000) {
      reasoning = `The New Tax Regime is highly optimal for you because your taxable income after standard deduction is under the ₹12,00,000 threshold. Under Section 87A, you qualify for a 100% tax rebate, reducing your net tax liability to ₹0!`;
    } else {
      reasoning = `The New Tax Regime is more beneficial because your declared exemptions (₹${totalOldExemptions.toLocaleString('en-IN')}) are below the financial break-even threshold. The New regime's lower slab tax rates, combined with a higher ₹75,000 standard deduction, offset the removal of traditional deductions.`;
    }
  } else {
    reasoning = `The Old Tax Regime is more beneficial because your high exemptions (₹${totalOldExemptions.toLocaleString('en-IN')}, including HRA, 80C, or Home Loan interest) significantly compress your taxable income. This compression offsets the higher slab rates of the Old Regime, saving you ₹${savingsAmount.toLocaleString('en-IN')} annually.`;
  }

  // 2. Generate active tax optimization insights
  const insights: TaxInsightItem[] = [];

  // 80C underutilization check
  const max80C = 150000;
  if (deduction80c < max80C) {
    const gap = max80C - deduction80c;
    insights.push({
      id: 'opt_80c',
      title: 'Section 80C Limit Underutilized',
      description: `You have declared ₹${deduction80c.toLocaleString('en-IN')} under Section 80C. You are underutilizing the tax-saving limit by ₹${gap.toLocaleString('en-IN')}.`,
      impact: `Under the Old Regime, filling this gap can reduce your taxable income by another ₹${gap.toLocaleString('en-IN')}, potentially saving you up to ₹${(gap * 0.3).toLocaleString('en-IN')} depending on your tax slab.`,
      actionableStep: `Allocate ₹${gap.toLocaleString('en-IN')} into PPF, ELSS tax-saver mutual funds, or tax-saving FDs to maximize your deduction shield.`
    });
  }

  // 80D underutilization check
  const standard80D = 25000;
  if (deduction80d < standard80D) {
    const gap = standard80D - deduction80d;
    insights.push({
      id: 'opt_80d',
      title: 'Health Insurance Rebate Capacity',
      description: `Your declared health insurance premiums under Section 80D are ₹${deduction80d.toLocaleString('en-IN')}. The basic limit for self and family is ₹25,000.`,
      impact: `Claiming up to the ₹25,000 benchmark saves taxable income from medical expenditures.`,
      actionableStep: `Consider taking a comprehensive medical cover for yourself and family to claim the remaining ₹${gap.toLocaleString('en-IN')} premium deduction.`
    });
  }

  // National Pension Scheme (NPS) 80CCD(1B) extra rebate check
  insights.push({
    id: 'opt_nps',
    title: 'Additional NPS Savings Option',
    description: `Section 80CCD(1B) allows an exclusive deduction of up to ₹50,000 for National Pension Scheme (NPS) contributions, which is completely over and above the ₹1.5 Lakhs Section 80C cap.`,
    impact: `Contributing ₹50,000 to NPS reduces taxable income further under the Old Regime, translating to net cash savings of up to ₹15,600 (at 30% slab + cess).`,
    actionableStep: `Open an NPS Tier-1 account and allocate up to ₹50,000 specifically to claim this separate tax shield.`
  });

  // New Tax Regime optimization tips
  if (recommendedRegime === 'New Regime') {
    insights.push({
      id: 'opt_new_regime',
      title: 'Hassle-Free Wealth Compounding',
      description: `Under the New Tax Regime, you pay low tax rates without locking capital into lock-in tax products (like 3-year ELSS or 15-year PPF).`,
      impact: `You retain complete liquidity and can invest freely in global indices, flexi-cap funds, or digital gold based on goals, not tax deadlines.`,
      actionableStep: `Redirect your cash flow into goal-based Systematic Investment Plans (SIPs) without being constrained by tax lock-in mandates.`
    });
  }

  return {
    recommendedRegime,
    savingsAmount,
    reasoning,
    insights
  };
};
