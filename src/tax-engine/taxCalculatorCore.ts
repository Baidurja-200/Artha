import { 
  FY2025_26_OLD_REGIME, 
  FY2025_26_NEW_REGIME, 
  CESS_RATE, 
  TaxSlab 
} from './taxSlabs';
import { 
  TaxInputs, 
  calculateDeductions, 
  DeductionsBreakdown 
} from './deductionEngine';
import { 
  calculateSection87ARebate 
} from './rebateEngine';

export interface SlabBreakdown {
  slabDescription: string;
  rate: number;
  taxableAmountInSlab: number;
  taxAmountInSlab: number;
}

export interface TaxCalculationBreakdown {
  grossIncome: number;
  deductions: DeductionsBreakdown;
  taxableIncome: number;
  slabTax: number;
  slabDetails: SlabBreakdown[];
  rebateApplied: number;
  rebateExplanation: string;
  cess: number;
  finalTax: number;
  effectiveTaxRate: number;
}

export const calculateSlabTax = (
  taxableIncome: number,
  slabs: TaxSlab[]
): { totalTax: number; details: SlabBreakdown[] } => {
  let totalTax = 0;
  const details: SlabBreakdown[] = [];

  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const slabMax = slab.max === Infinity ? taxableIncome : slab.max;
      const taxableAmountInSlab = Math.min(taxableIncome, slabMax) - slab.min;
      const taxAmountInSlab = taxableAmountInSlab * slab.rate;
      totalTax += taxAmountInSlab;

      const minStr = (slab.min / 100000).toFixed(1) + "L";
      const maxStr = slab.max === Infinity ? "above" : (slab.max / 100000).toFixed(1) + "L";
      const slabDescription = `${minStr} to ${maxStr}`;

      details.push({
        slabDescription,
        rate: slab.rate * 100,
        taxableAmountInSlab,
        taxAmountInSlab
      });
    }
  }

  return { totalTax, details };
};

export const calculateTaxBreakdown = (
  inputs: TaxInputs,
  isNewRegime: boolean
): TaxCalculationBreakdown => {
  const config = isNewRegime ? FY2025_26_NEW_REGIME : FY2025_26_OLD_REGIME;

  // Step 1 & 2: Gross Income & Deductions
  const deductions = calculateDeductions(inputs, isNewRegime, config.standardDeductionSalaried);

  // Step 3: Taxable Income
  const taxableIncome = Math.max(0, inputs.grossIncome - deductions.totalDeductions);

  // Step 4: Slab-wise Tax Calculation
  const { totalTax: slabTax, details: slabDetails } = calculateSlabTax(taxableIncome, config.slabs);

  // Step 5: Apply Section 87A Rebate (with marginal relief)
  const { rebateApplied, explanation: rebateExplanation } = calculateSection87ARebate(
    taxableIncome,
    slabTax,
    isNewRegime,
    config.rebateIncomeLimit,
    config.maxRebateAmount
  );

  const taxPostRebate = Math.max(0, slabTax - rebateApplied);

  // Step 6: Apply Health & Education Cess (4%)
  const cess = taxPostRebate * CESS_RATE;

  // Step 7: Final Tax Liability
  const finalTax = taxPostRebate + cess;

  const effectiveTaxRate = inputs.grossIncome > 0 ? (finalTax / inputs.grossIncome) * 100 : 0;

  return {
    grossIncome: inputs.grossIncome,
    deductions,
    taxableIncome,
    slabTax,
    slabDetails,
    rebateApplied,
    rebateExplanation,
    cess,
    finalTax,
    effectiveTaxRate
  };
};
