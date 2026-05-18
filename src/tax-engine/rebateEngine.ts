export interface RebateResult {
  rebateApplied: number;
  explanation: string;
}

export const calculateSection87ARebate = (
  taxableIncome: number,
  preRebateTax: number,
  isNewRegime: boolean,
  rebateIncomeLimit: number,
  maxRebateAmount: number
): RebateResult => {
  // If no tax calculated, no rebate
  if (preRebateTax <= 0) {
    return { rebateApplied: 0, explanation: "No tax liability generated; no rebate required." };
  }

  // Case 1: Taxable Income is strictly within the rebate threshold
  if (taxableIncome <= rebateIncomeLimit) {
    const rebate = Math.min(preRebateTax, maxRebateAmount);
    return {
      rebateApplied: rebate,
      explanation: `Section 87A rebate of ${rebate.toLocaleString("en-IN")} fully offsets your calculated tax of ${preRebateTax.toLocaleString("en-IN")} because your taxable income is under the ${rebateIncomeLimit.toLocaleString("en-IN")} threshold.`
    };
  }

  // Case 2: Marginal Relief check for New Tax Regime (Budget 2025 threshold of 12 Lakhs)
  if (isNewRegime) {
    const excessIncome = taxableIncome - rebateIncomeLimit;
    if (preRebateTax > excessIncome) {
      const rebate = preRebateTax - excessIncome;
      return {
        rebateApplied: rebate,
        explanation: `Section 87A Marginal Relief applied! Your tax is capped at the excess income over ₹12 Lakhs (₹${excessIncome.toLocaleString("en-IN")}), saving you ₹${rebate.toLocaleString("en-IN")} in tax cliff drag.`
      };
    }
  }

  // Case 3: Marginal Relief check for Old Tax Regime (threshold of 5 Lakhs)
  if (!isNewRegime) {
    const excessIncome = taxableIncome - rebateIncomeLimit;
    if (preRebateTax > excessIncome) {
      const rebate = preRebateTax - excessIncome;
      return {
        rebateApplied: rebate,
        explanation: `Section 87A Marginal Relief applied! Your tax is capped at the excess income over ₹5 Lakhs (₹${excessIncome.toLocaleString("en-IN")}), saving you ₹${rebate.toLocaleString("en-IN")}.`
      };
    }
  }

  return {
    rebateApplied: 0,
    explanation: `Your taxable income exceeds the Section 87A rebate limit of ${rebateIncomeLimit.toLocaleString("en-IN")}, meaning no rebate is available.`
  };
};
