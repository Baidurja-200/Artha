/**
 * Artha Financial Utility Functions
 */

/**
 * Calculates the future value of a SIP (Systematic Investment Plan).
 * Formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 * @param monthlyInvestment Monthly investment amount (P)
 * @param annualRate Annual interest rate in percentage (R)
 * @param years Tenure in years (n / 12)
 */
export const calculateSIPMaturityValue = (
  monthlyInvestment: number,
  annualRate: number,
  years: number
): number => {
  const i = annualRate / 100 / 12;
  const n = years * 12;
  if (i === 0) return monthlyInvestment * n;
  return Math.round(
    monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
  );
};

/**
 * Calculates absolute returns percentage.
 * @param invested Principal amount
 * @param current Current value
 */
export const calculateAbsoluteReturn = (
  invested: number,
  current: number
): number => {
  if (invested === 0) return 0;
  return Number(((current - invested) / invested * 100).toFixed(2));
};

/**
 * Classifies tax based on holding period and asset type (Indian Tax Laws).
 * For simplicity: 
 * Equity: STCG if < 1 year, LTCG if >= 1 year.
 * Debt/Other: STCG if < 3 years, LTCG if >= 3 years.
 */
export const classifyTax = (
  purchaseDate: Date,
  sellDate: Date,
  assetType: 'EQUITY' | 'DEBT'
): 'STCG' | 'LTCG' => {
  const diffTime = Math.abs(sellDate.getTime() - purchaseDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (assetType === 'EQUITY') {
    return diffDays >= 365 ? 'LTCG' : 'STCG';
  } else {
    return diffDays >= 1095 ? 'LTCG' : 'STCG';
  }
};

/**
 * Calculates XIRR (Extended Internal Rate of Return) for irregular cash flows.
 * Uses Newton-Raphson method.
 */
export const calculateXIRR = (payments: number[], dates: Date[]): number => {
  if (payments.length !== dates.length || payments.length < 2) return 0;

  const xirrFunction = (rate: number) => {
    let result = 0;
    for (let i = 0; i < payments.length; i++) {
      const days = (dates[i].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      result += payments[i] / Math.pow(1 + rate, days / 365);
    }
    return result;
  };

  const xirrDerivative = (rate: number) => {
    let result = 0;
    for (let i = 0; i < payments.length; i++) {
      const days = (dates[i].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
      result -= (days / 365) * payments[i] / Math.pow(1 + rate, (days / 365) + 1);
    }
    return result;
  };

  let rate = 0.1; // Initial guess 10%
  for (let i = 0; i < 20; i++) {
    const f = xirrFunction(rate);
    const fPrime = xirrDerivative(rate);
    const nextRate = rate - f / fPrime;
    if (Math.abs(nextRate - rate) < 0.0001) return Number((nextRate * 100).toFixed(2));
    rate = nextRate;
  }

  return Number((rate * 100).toFixed(2));
};
