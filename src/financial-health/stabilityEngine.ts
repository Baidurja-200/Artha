import { UserProfile, Expense } from '../types/finance';

export interface StabilityMetrics {
  stabilityScore: number;
  stressScore: number;
  indicators: {
    emergencyResilience: {
      score: number;
      label: 'Fragile' | 'Vulnerable' | 'Stable' | 'Bulletproof';
      description: string;
      runwayMonths: number;
    };
    debtPressure: {
      score: number;
      label: 'Negligible' | 'Manageable' | 'Burdensome' | 'Critical';
      ratioPct: number;
      description: string;
    };
    savingsSustainability: {
      score: number;
      label: 'Depleting' | 'Low Savings' | 'Sustainable' | 'Elite Compounding';
      ratePct: number;
      description: string;
    };
    cashFlowHealth: {
      score: number;
      label: 'Negative Surplus' | 'Tight Surplus' | 'Comfortable Surplus' | 'Excellent Runway';
      cashRemaining: number;
      description: string;
    };
  };
  stressFactors: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'mild';
    title: string;
    description: string;
    impact: string;
    mitigation: string;
  }>;
}

export const analyzeStabilityAndStress = (
  profile: UserProfile & { debtEMI?: number; tax80c?: number; insuranceCoverage?: number },
  investments: { totalSIP: number; equity: number; debt: number },
  expenses: Expense[] = []
): StabilityMetrics => {
  const monthlyIncome = profile.monthlyIncome || 1;
  const monthlyExpenses = profile.monthlyExpenses || 1;
  const debtEMI = profile.debtEMI || 0;
  const emergencyFund = profile.emergencyFund || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // 1. Emergency Resilience
  const runwayMonths = emergencyFund / monthlyExpenses;
  const emergencyScore = Math.min(Math.round((runwayMonths / 6) * 100), 100);
  let emergencyLabel: 'Fragile' | 'Vulnerable' | 'Stable' | 'Bulletproof' = 'Fragile';
  let emergencyDesc = '';

  if (runwayMonths >= 6) {
    emergencyLabel = 'Bulletproof';
    emergencyDesc = 'You have a complete 6-month buffer, shielding your equity assets and daily lifestyle from sudden shocks.';
  } else if (runwayMonths >= 3) {
    emergencyLabel = 'Stable';
    emergencyDesc = 'You can survive 3-5 months of income disruption, but are partially exposed to protracted setbacks.';
  } else if (runwayMonths >= 1) {
    emergencyLabel = 'Vulnerable';
    emergencyDesc = 'A minor medical bump or brief job gap could force you to dissolve equity SIPs at a loss.';
  } else {
    emergencyLabel = 'Fragile';
    emergencyDesc = 'Less than 1 month of safety runway. Any minor emergency is highly likely to trigger high-cost debt cycles.';
  }

  // 2. Debt Pressure
  const dti = (debtEMI / monthlyIncome) * 100;
  const debtScore = Math.max(0, 100 - Math.round(dti * 2.2));
  let debtLabel: 'Negligible' | 'Manageable' | 'Burdensome' | 'Critical' = 'Negligible';
  let debtDesc = '';

  if (dti > 40) {
    debtLabel = 'Critical';
    debtDesc = `Over 40% (${Math.round(dti)}%) of your hard-earned income goes back to the banks. This is a massive drag on wealth.`;
  } else if (dti > 20) {
    debtLabel = 'Burdensome';
    debtDesc = `Debt takes up a notable ${Math.round(dti)}% of monthly cash flow, slowing down your equity mutual fund SIP contributions.`;
  } else if (dti > 0) {
    debtLabel = 'Manageable';
    debtDesc = `Low debt obligations (${Math.round(dti)}% DTI) keep your monthly finances highly flexible.`;
  } else {
    debtLabel = 'Negligible';
    debtDesc = 'Zero active EMIs. You retain 100% of your earnings to compound your own future, not the bank\'s ledger.';
  }

  // 3. Savings Sustainability
  const surplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (surplus / monthlyIncome) * 100;
  const savingsScore = Math.max(0, Math.min(Math.round((savingsRate / 30) * 100), 100)); // 30% savings rate is 100 score
  let savingsLabel: 'Depleting' | 'Low Savings' | 'Sustainable' | 'Elite Compounding' = 'Low Savings';
  let savingsDesc = '';

  if (savingsRate >= 35) {
    savingsLabel = 'Elite Compounding';
    savingsDesc = 'You save a highly elite portion of income, creating extreme wealth building speeds.';
  } else if (savingsRate >= 20) {
    savingsLabel = 'Sustainable';
    savingsDesc = 'You save a healthy, standard portion of salary, keeping you on a secure path to long-term goals.';
  } else if (savingsRate > 0) {
    savingsLabel = 'Low Savings';
    savingsDesc = 'You are saving, but at a rate vulnerable to price spikes and inflation. Bridge the gaps by auditing discretionary bills.';
  } else {
    savingsLabel = 'Depleting';
    savingsDesc = 'Your outlays exceed or equal your inflows. You are actively eroding your safety buffers each passing week.';
  }

  // 4. Cash Flow Health
  const cashRemaining = surplus - totalSIP;
  const cashFlowScore = surplus > 0 ? (cashRemaining >= 0 ? 100 : Math.max(0, 100 + Math.round((cashRemaining / monthlyIncome) * 100))) : 0;
  let cashFlowLabel: 'Negative Surplus' | 'Tight Surplus' | 'Comfortable Surplus' | 'Excellent Runway' = 'Tight Surplus';
  let cashFlowDesc = '';

  if (cashRemaining > monthlyIncome * 0.2) {
    cashFlowLabel = 'Excellent Runway';
    cashFlowDesc = 'Large unallocated cash reserves. High freedom, but be mindful of cash drag losing to inflation.';
  } else if (cashRemaining >= 0) {
    cashFlowLabel = 'Comfortable Surplus';
    cashFlowDesc = 'Healthy cash flows that fully fund living, EMIs, and SIP commitments, with a calm safety layer left.';
  } else if (surplus > 0) {
    cashFlowLabel = 'Tight Surplus';
    cashFlowDesc = 'Your SIP automated investments are currently consuming part of your cash baseline. Very tight unallocated cash.';
  } else {
    cashFlowLabel = 'Negative Surplus';
    cashFlowDesc = 'Cash flow is negative. You are actively living beyond your means, financed by cash depletion or high-interest loans.';
  }

  // Aggregate Scores
  const stabilityScore = Math.round(
    emergencyScore * 0.35 +
    debtScore * 0.25 +
    savingsScore * 0.25 +
    cashFlowScore * 0.15
  );

  const stressScore = Math.round(100 - stabilityScore);

  // Generate actionable Stress Factors (Stress Engine)
  const stressFactors: StabilityMetrics['stressFactors'] = [];

  if (runwayMonths < 3) {
    stressFactors.push({
      id: 'stress_emergency',
      severity: runwayMonths < 1.5 ? 'critical' : 'warning',
      title: 'Vulnerable Cash Buffer',
      description: `Emergency funds cover only ${runwayMonths.toFixed(1)} months of living costs.`,
      impact: 'A sudden layoff or medical bill will immediately break your financial flow and force expensive borrowing.',
      mitigation: `Set aside ₹${Math.round(monthlyIncome * 0.1).toLocaleString('en-IN')} right after payday into a liquid fund until your buffer reaches ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.`
    });
  }

  if (dti > 30) {
    stressFactors.push({
      id: 'stress_debt',
      severity: dti > 45 ? 'critical' : 'warning',
      title: 'Elevated EMI Repayments',
      description: `EMIs swallow ${Math.round(dti)}% of your gross earnings.`,
      impact: 'Severely reduces your monthly investable surplus, locking your active income into rigid loan obligations.',
      mitigation: 'Freeze all new EMI plans (credit cards/lifestyle shopping) and use your bonuses to prepay highest-interest debts first.'
    });
  }

  if (savingsRate < 15) {
    stressFactors.push({
      id: 'stress_savings',
      severity: savingsRate <= 0 ? 'critical' : 'warning',
      title: 'Low Wealth Accumulation Speed',
      description: `You save only ${Math.round(Math.max(0, savingsRate))}% of monthly earnings.`,
      impact: 'Your wealth compounding speed is slower than domestic inflation, eroding future purchasing power.',
      mitigation: 'Audit your subscription lists and restaurant orders. Commit to saving just 5% more next month by setting it aside first.'
    });
  }

  if (cashRemaining < 0) {
    stressFactors.push({
      id: 'stress_cashflow',
      severity: surplus <= 0 ? 'critical' : 'warning',
      title: 'Unallocated Cash Deficit',
      description: `SIP commitments and bills exceed active income by ₹${Math.abs(cashRemaining).toLocaleString('en-IN')}.`,
      impact: 'Forces you to draw down your emergency bank balance just to meet monthly equity SIPs.',
      mitigation: 'Reduce or pause aggressive SIPs slightly until emergency balances are secure, or trim discretionary shopping.'
    });
  }

  // Fallback stress factor if everything is healthy
  if (stressFactors.length === 0) {
    stressFactors.push({
      id: 'stress_none',
      severity: 'mild',
      title: 'Subtle Cash Drag',
      description: 'Your structural parameters are highly stable, leaving over 15% unallocated monthly cash.',
      impact: 'While safe, leaving large unallocated sums inside standard savings accounts loses purchasing power to inflation.',
      mitigation: 'Automate a new index fund SIP or high-yield recurring deposit to put your extra cash surplus to work.'
    });
  }

  return {
    stabilityScore,
    stressScore,
    indicators: {
      emergencyResilience: {
        score: emergencyScore,
        label: emergencyLabel,
        description: emergencyDesc,
        runwayMonths
      },
      debtPressure: {
        score: debtScore,
        label: debtLabel,
        ratioPct: dti,
        description: debtDesc
      },
      savingsSustainability: {
        score: savingsScore,
        label: savingsLabel,
        ratePct: savingsRate,
        description: savingsDesc
      },
      cashFlowHealth: {
        score: cashFlowScore,
        label: cashFlowLabel,
        cashRemaining,
        description: cashFlowDesc
      }
    },
    stressFactors
  };
};
