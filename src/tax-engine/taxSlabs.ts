export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
}

export interface TaxRegimeConfig {
  slabs: TaxSlab[];
  standardDeductionSalaried: number;
  rebateIncomeLimit: number;
  maxRebateAmount: number;
}

export const FY2025_26_OLD_REGIME: TaxRegimeConfig = {
  slabs: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  standardDeductionSalaried: 50000,
  rebateIncomeLimit: 500000,
  maxRebateAmount: 12500 // 5% of (5,00,000 - 2,5,0000)
};

export const FY2025_26_NEW_REGIME: TaxRegimeConfig = {
  slabs: [
    { min: 0, max: 400000, rate: 0 },
    { min: 400000, max: 800000, rate: 0.05 },
    { min: 800000, max: 1200000, rate: 0.10 },
    { min: 1200000, max: 1600000, rate: 0.15 },
    { min: 1600000, max: 2000000, rate: 0.20 },
    { min: 2000000, max: 2400000, rate: 0.25 },
    { min: 2400000, max: Infinity, rate: 0.30 }
  ],
  standardDeductionSalaried: 75000,
  rebateIncomeLimit: 1200000, // Section 87A rebate for taxable income up to 12 Lakhs
  maxRebateAmount: 60000 // 5% of (8L-4L) + 10% of (12L-8L) = 20,000 + 40,000 = 60,000
};

export const CESS_RATE = 0.04; // 4% Health and Education Cess
