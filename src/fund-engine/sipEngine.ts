export interface SipProjectionInputs {
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  timeHorizonYears: number;
  expectedInflationRate: number;
}

export interface SipProjectionResult {
  totalInvested: number;
  nominalWealth: number;
  realWealth: number; // Inflation-adjusted purchasing power
  estimatedWealthGain: number;
  estimatedRealGain: number;
  retirementCorpusCoverage: number; // percentage of a target ₹2 Crore retirement benchmark
  goalTimelineMonths: number;
}

export const calculateSipProjection = (
  inputs: SipProjectionInputs
): SipProjectionResult => {
  const { monthlyInvestment, expectedAnnualReturn, timeHorizonYears, expectedInflationRate } = inputs;
  
  const totalMonths = timeHorizonYears * 12;
  const monthlyNominalReturnRate = expectedAnnualReturn / 12 / 100;
  
  // Real return rate = (1 + nominal) / (1 + inflation) - 1
  const realAnnualReturnRate = ((1 + expectedAnnualReturn / 100) / (1 + expectedInflationRate / 100) - 1) * 100;
  const monthlyRealReturnRate = realAnnualReturnRate / 12 / 100;

  // Formula for Future Value of an Ordinary Annuity: P * [((1 + r)^n - 1) / r] * (1 + r)
  let nominalWealth = 0;
  let realWealth = 0;

  if (monthlyNominalReturnRate > 0) {
    nominalWealth = monthlyInvestment * 
      ((Math.pow(1 + monthlyNominalReturnRate, totalMonths) - 1) / monthlyNominalReturnRate) * 
      (1 + monthlyNominalReturnRate);
  } else {
    nominalWealth = monthlyInvestment * totalMonths;
  }

  if (monthlyRealReturnRate > 0) {
    realWealth = monthlyInvestment * 
      ((Math.pow(1 + monthlyRealReturnRate, totalMonths) - 1) / monthlyRealReturnRate) * 
      (1 + monthlyRealReturnRate);
  } else {
    realWealth = monthlyInvestment * totalMonths;
  }

  const totalInvested = monthlyInvestment * totalMonths;
  const estimatedWealthGain = Math.max(0, nominalWealth - totalInvested);
  const estimatedRealGain = Math.max(0, realWealth - totalInvested);

  // Target retirement benchmark of ₹2 Crore (₹20,000,000)
  const targetBenchmark = 20000000;
  const retirementCorpusCoverage = (realWealth / targetBenchmark) * 100;

  return {
    totalInvested,
    nominalWealth: Math.round(nominalWealth),
    realWealth: Math.round(realWealth),
    estimatedWealthGain: Math.round(estimatedWealthGain),
    estimatedRealGain: Math.round(estimatedRealGain),
    retirementCorpusCoverage,
    goalTimelineMonths: totalMonths
  };
};
