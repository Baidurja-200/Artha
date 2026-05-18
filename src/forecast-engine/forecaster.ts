import { UserProfile, Expense } from '../types/finance';

export interface ForecastPeriod {
  monthName: string;
  projectedExpenses: number;
  projectedSurplus: number;
  projectedSIPAffordability: number;
  stressFactor: number; // 0 to 100
}

export interface CashFlowForecast {
  averageMonthlyExpenses: number;
  expenseTrendPct: number; // Monthly rate of change based on history
  sustainabilityMonths: number; // How many months surplus remains positive
  forecastTimeline: ForecastPeriod[];
  insights: {
    title: string;
    description: string;
    impact: string;
    advice: string;
  }[];
}

export const generateCashFlowForecast = (
  profile: UserProfile & { debtEMI?: number },
  investments: { totalSIP: number },
  expenses: Expense[] = [],
  projectionMonths: number = 6
): CashFlowForecast => {
  const monthlyIncome = profile.monthlyIncome || 1;
  const debtEMI = profile.debtEMI || 0;
  const currentSIP = investments?.totalSIP || profile.currentSIPs || 0;
  const baseExpenses = profile.monthlyExpenses || 0;

  // 1. Calculate historical average expenses & trend
  // Let's analyze expenses in the ledger.
  // Group expenses by year-month to calculate moving averages.
  const expensesByMonth: Record<string, number> = {};
  
  expenses.forEach(e => {
    // skip investments and EMIs from manual ledger to prevent double-counting if they are logged
    if (['investments', 'EMI/debt'].includes(e.category.toLowerCase())) return;
    
    try {
      const monthKey = e.date.substring(0, 7); // YYYY-MM
      expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + e.amount;
    } catch (err) {}
  });

  const sortedMonths = Object.keys(expensesByMonth).sort();
  let averageMonthlyExpenses = baseExpenses;
  let expenseTrendPct = 1.2; // default: 1.2% lifestyle inflation month-on-month

  if (sortedMonths.length >= 2) {
    const totalLogged = sortedMonths.reduce((acc, m) => acc + expensesByMonth[m], 0);
    averageMonthlyExpenses = Math.round(totalLogged / sortedMonths.length);

    // Calculate basic trend (simple linear regression or first/last month difference)
    const firstMonthVal = expensesByMonth[sortedMonths[0]];
    const lastMonthVal = expensesByMonth[sortedMonths[sortedMonths.length - 1]];
    if (firstMonthVal > 0 && sortedMonths.length > 1) {
      const totalGrowth = (lastMonthVal - firstMonthVal) / firstMonthVal;
      expenseTrendPct = (totalGrowth / sortedMonths.length) * 100;
      // Cap inflation between -5% and +10% MoM to keep it realistic
      expenseTrendPct = Math.max(-5, Math.min(10, expenseTrendPct));
    }
  }

  // 2. Build Forecast Timeline
  const forecastTimeline: ForecastPeriod[] = [];
  const currentDate = new Date();
  
  let projectedExpenses = averageMonthlyExpenses;
  let surplusPositiveCount = 0;
  let totalProjectedDeficit = 0;

  for (let i = 1; i <= projectionMonths; i++) {
    const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthName = futureDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

    // Compound the expenses by the trend rate
    projectedExpenses = Math.round(projectedExpenses * (1 + expenseTrendPct / 100));
    
    const projectedSurplus = monthlyIncome - projectedExpenses - debtEMI;
    if (projectedSurplus > 0) {
      surplusPositiveCount++;
    } else {
      totalProjectedDeficit += Math.abs(projectedSurplus);
    }

    // Affordability representing how much SIP is safe (leaving a 15% safety buffer in cash)
    const projectedSIPAffordability = Math.max(0, Math.round(projectedSurplus - monthlyIncome * 0.15));

    // Stress Factor: rises if surplus declines relative to income
    const surplusRate = (projectedSurplus / monthlyIncome) * 100;
    const stressFactor = Math.max(0, Math.min(100, Math.round((1 - (surplusRate / 30)) * 100)));

    forecastTimeline.push({
      monthName,
      projectedExpenses,
      projectedSurplus,
      projectedSIPAffordability,
      stressFactor
    });
  }

  // 3. Determine Sustainability Months
  const sustainabilityMonths = surplusPositiveCount;

  // 4. Generate Explainable Forecast Insights
  const insights: CashFlowForecast['insights'] = [];

  // Insight on Expense Pressure
  if (expenseTrendPct > 2) {
    insights.push({
      title: 'Accelerating Lifestyle Inflation',
      description: `Discretionary expenses are growing at an estimated ${expenseTrendPct.toFixed(1)}% month-on-month based on recent transactions.`,
      impact: `At this rate, your monthly expenses will expand from ₹${averageMonthlyExpenses.toLocaleString('en-IN')} to ₹${forecastTimeline[projectionMonths - 1].projectedExpenses.toLocaleString('en-IN')} in 6 months, compressing your investable surplus.`,
      advice: 'Review subscription renewals, restaurant dining, and high-frequency UPI spends. Try to freeze discretionary limits next month.'
    });
  } else if (expenseTrendPct < 0) {
    insights.push({
      title: 'Positive Expenditure Control',
      description: `Your discretionary spending is on a downward trend of ${Math.abs(expenseTrendPct).toFixed(1)}% month-on-month.`,
      impact: `This beautiful savings discipline is steadily freeing up cash. Your projected surplus will rise to ₹${forecastTimeline[projectionMonths - 1].projectedSurplus.toLocaleString('en-IN')} by ${forecastTimeline[projectionMonths - 1].monthName}.`,
      advice: 'Excellent! Redirect this newly unlocked surplus into your monthly wealth mutual fund SIPs immediately to put the cash to work.'
    });
  } else {
    insights.push({
      title: 'Stable Expense Trajectory',
      description: 'Your discretionary spending is highly stable, growing at a normal organic inflation rate.',
      impact: `You are maintaining a predictable surplus of around ₹${forecastTimeline[0].projectedSurplus.toLocaleString('en-IN')} monthly over the next 6 months.`,
      advice: 'Continue automated SIPs. You are in a perfect position to execute annual step-up SIP increases of 10%.'
    });
  }

  // Insight on Surplus Sustainability & Investment Affordability
  const endPeriod = forecastTimeline[projectionMonths - 1];
  const activeSipHealthy = endPeriod.projectedSIPAffordability >= currentSIP;

  if (!activeSipHealthy) {
    insights.push({
      title: 'Potential SIP Affordability Pressure',
      description: `Projected future surplus (₹${endPeriod.projectedSurplus.toLocaleString('en-IN')}) will not fully support your active SIP commitment of ₹${currentSIP.toLocaleString('en-IN')} while maintaining a safe cash buffer.`,
      impact: 'You may have to draw down emergency funds or bank balances in future months to cover SIP debits, creating cash flow friction.',
      advice: 'Pause all non-essential retail EMIs, or review whether you should moderately adjust some aggressive SIP allocations until backup savings are filled.'
    });
  } else {
    insights.push({
      title: 'Strong Investment Affordability Runway',
      description: `Your forecasted surplus is highly resilient. You can comfortably sustain your active ₹${currentSIP.toLocaleString('en-IN')} SIP, and can afford to invest up to ₹${endPeriod.projectedSIPAffordability.toLocaleString('en-IN')} monthly.`,
      impact: 'Zero emergency buffer drawdown risks. Your wealth building pipeline has immense breathing room to compounding.',
      advice: 'Consider creating a New Goal or setting up an automated Step-Up SIP of ₹2,500 to compress your timeline to early retirement.'
    });
  }

  // Insight on Debt Sustainability
  const dti = (debtEMI / monthlyIncome) * 100;
  if (dti > 35) {
    insights.push({
      title: 'Vulnerable Debt Sustainability',
      description: `Fixed EMI commitments ingest ${Math.round(dti)}% of monthly inflows.`,
      impact: 'Any slight reduction in income or increase in living costs will immediately trigger cash flow strain due to rigid loan timelines.',
      advice: 'Avoid credit cards, consumer zero-interest schemes, or personal loans. Dedicate all quarterly or annual bonus windfalls to prepayment.'
    });
  }

  return {
    averageMonthlyExpenses,
    expenseTrendPct,
    sustainabilityMonths,
    forecastTimeline,
    insights
  };
};
