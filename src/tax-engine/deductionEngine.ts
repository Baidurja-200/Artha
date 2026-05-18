export interface TaxInputs {
  grossIncome: number;
  hra: number;
  deduction80c: number;
  deduction80d: number;
  homeLoanInterest: number;
  otherDeductions: number;
}

export interface DeductionsBreakdown {
  standardDeduction: number;
  hraExemption: number;
  sec80C: number;
  sec80D: number;
  homeLoanSec24: number;
  otherDeductions: number;
  totalDeductions: number;
}

export const calculateDeductions = (
  inputs: TaxInputs,
  isNewRegime: boolean,
  standardDeductionSalaried: number
): DeductionsBreakdown => {
  if (isNewRegime) {
    // Under New Regime: ONLY standard deduction is allowed. Others are disallowed (zero).
    return {
      standardDeduction: standardDeductionSalaried,
      hraExemption: 0,
      sec80C: 0,
      sec80D: 0,
      homeLoanSec24: 0,
      otherDeductions: 0,
      totalDeductions: standardDeductionSalaried
    };
  }

  // Under Old Regime: standard deduction, HRA, 80C, 80D, Section 24, and others are allowed.
  const sec80CAllowed = Math.min(inputs.deduction80c, 150000);
  const homeLoanSec24Allowed = Math.min(inputs.homeLoanInterest, 200000);

  const totalDeductions =
    standardDeductionSalaried +
    inputs.hra +
    sec80CAllowed +
    inputs.deduction80d +
    homeLoanSec24Allowed +
    inputs.otherDeductions;

  return {
    standardDeduction: standardDeductionSalaried,
    hraExemption: inputs.hra,
    sec80C: sec80CAllowed,
    sec80D: inputs.deduction80d,
    homeLoanSec24: homeLoanSec24Allowed,
    otherDeductions: inputs.otherDeductions,
    totalDeductions
  };
};
