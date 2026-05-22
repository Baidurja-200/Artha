import useFinanceStore from '../store/useFinanceStore';
import { computeCreditHealth } from '../credit-health/engine';
import { analyzeCreditUtilization } from '../utilization-engine/utilization';
import { analyzeRepayments } from '../repayment-engine/repayment';
import { auditRewards } from '../reward-analysis/rewards';
import { generateCreditInsights } from '../credit-insights/insights';

export interface AssistantResponse {
  text: string;
  category: 'credit' | 'portfolio' | 'budget' | 'tax' | 'cashflow' | 'general';
  chips: string[];
  metrics?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral'; status?: 'success' | 'warning' | 'error' | 'info' }[];
  table?: { headers: string[]; rows: string[][] };
}

export function generateAssistantResponse(query: string): AssistantResponse {
  const cleanQuery = query.toLowerCase().trim();
  const state = useFinanceStore.getState();
  
  const { profile, creditCards, creditEMIs, creditRepayments, investments, goals, expenses, budget } = state;
  const healthReport = computeCreditHealth(creditCards, creditEMIs, creditRepayments, profile, expenses);
  const utilization = analyzeCreditUtilization(creditCards);
  const repaymentMetrics = analyzeRepayments(creditRepayments);
  const rewardAudit = auditRewards(creditCards, expenses);
  const creditInsights = generateCreditInsights(creditCards, creditEMIs, creditRepayments, profile);

  // 1. INTENT: CREDIT HEALTH / CREDIT SCORE / CARDS / EMIs
  if (
    cleanQuery.includes('credit') ||
    cleanQuery.includes('score') ||
    cleanQuery.includes('cibil') ||
    cleanQuery.includes('card') ||
    cleanQuery.includes('emi') ||
    cleanQuery.includes('repay') ||
    cleanQuery.includes('utiliz') ||
    cleanQuery.includes('due')
  ) {
    const totalEMIs = creditEMIs.reduce((sum, e) => sum + e.monthlyAmount, 0);
    const activeAlerts = creditInsights.filter(i => i.type === 'warning');

    let text = `Based on your local credit profile, your **Simulated Credit Health Score is ${healthReport.creditScore} (${healthReport.creditRating})**. \n\n`;
    
    if (healthReport.creditScore >= 800) {
      text += `Your rating is **Excellent**. You have a stellar repayment record and maintain optimal credit utilization. You qualify for the lowest borrowing rates.\n\n`;
    } else if (healthReport.creditScore >= 720) {
      text += `Your rating is **Good**. Your habits are solid, though there is minor room for improvement in card utilization or debt ratios.\n\n`;
    } else {
      text += `Your credit score is **${healthReport.creditRating}**. Action is required to clear outstanding balances, lower utilization, and re-establish a consistent repayment history.\n\n`;
    }

    // Details on components
    text += `### Key Parameters Breakdowns:\n`;
    text += `- **Repayment Reliability**: Your payment status shows **${repaymentMetrics.onTimeRate.toFixed(0)}% on-time payments** across **${repaymentMetrics.totalBills} bills** with a **${repaymentMetrics.streakMonths}-month streak**.\n`;
    text += `- **Utilization Ratio**: You are using **${utilization.overallUtilization.toFixed(1)}%** of your total **₹${(utilization.totalLimit / 100000).toFixed(1)} Lakh limit** (₹${utilization.totalBalance.toLocaleString('en-IN')} outstanding).\n`;
    text += `- **Credit EMIs**: You have **${creditEMIs.length} active card EMIs** consuming **₹${totalEMIs.toLocaleString('en-IN')}/month**.\n\n`;

    if (activeAlerts.length > 0) {
      text += `⚠️ **Urgent Action Items**:\n`;
      activeAlerts.forEach(a => {
        text += `*   **${a.title}**: ${a.action}\n`;
      });
    } else {
      text += `✅ **No critical credit alerts**. Your payment discipline is excellent and utilization is in the green zone.`;
    }

    return {
      text,
      category: 'credit',
      chips: ['Audit my rewards leakage', 'How is my credit stress score?', 'List my active credit EMIs', 'Review credit recommendations'],
      metrics: [
        { label: 'Simulated Score', value: `${healthReport.creditScore}`, status: healthReport.creditScore >= 740 ? 'success' : healthReport.creditScore >= 650 ? 'warning' : 'error' },
        { label: 'Utilization Rate', value: `${utilization.overallUtilization.toFixed(1)}%`, status: utilization.overallUtilization <= 30 ? 'success' : utilization.overallUtilization <= 50 ? 'warning' : 'error' },
        { label: 'On-Time Rate', value: `${repaymentMetrics.onTimeRate.toFixed(0)}%`, status: repaymentMetrics.onTimeRate >= 95 ? 'success' : repaymentMetrics.onTimeRate >= 80 ? 'warning' : 'error' }
      ]
    };
  }

  // 2. INTENT: INVESTMENTS / PORTFOLIO / WEALTH / SIP
  if (
    cleanQuery.includes('invest') ||
    cleanQuery.includes('portfolio') ||
    cleanQuery.includes('sip') ||
    cleanQuery.includes('equity') ||
    cleanQuery.includes('debt') ||
    cleanQuery.includes('mutual fund') ||
    cleanQuery.includes('asset') ||
    cleanQuery.includes('wealth') ||
    cleanQuery.includes('stock')
  ) {
    const totalInvestments = investments.equity + investments.debt;
    const equityPct = totalInvestments > 0 ? (investments.equity / totalInvestments) * 100 : 0;
    const debtPct = totalInvestments > 0 ? (investments.debt / totalInvestments) * 100 : 0;

    let text = `Here is the comprehensive status of your **Investment Portfolio**: \n\n`;
    text += `### Asset Allocation Details:\n`;
    text += `- **Total In-App Assets**: **₹${totalInvestments.toLocaleString('en-IN')}**\n`;
    text += `- **Equity Exposure**: **₹${investments.equity.toLocaleString('en-IN')} (${equityPct.toFixed(1)}%)**\n`;
    text += `- **Debt Exposure**: **₹${investments.debt.toLocaleString('en-IN')} (${debtPct.toFixed(1)}%)**\n`;
    text += `- **Monthly SIP Commitment**: **₹${investments.totalSIP.toLocaleString('en-IN')}/month**\n\n`;

    // life-stage validation
    const targetEquity = Math.max(20, Math.min(90, 110 - profile.age)); // 110 - Age rule
    text += `### Asset Allocation Review:\n`;
    text += `Given your age is **${profile.age}**, a standard rule of thumb suggests an equity allocation of roughly **${targetEquity}%**. Your current allocation is at **${equityPct.toFixed(0)}% equity**. \n\n`;
    
    if (Math.abs(equityPct - targetEquity) <= 10) {
      text += `✅ **Your asset distribution is highly optimal** and matches your moderate-to-long-term growth horizon.\n\n`;
    } else if (equityPct > targetEquity) {
      text += `💡 **Allocation Tip**: You have a slightly aggressive stance compared to the age rule. Ensure you have a sufficient liquid debt runway to cover short-term shocks without liquidating volatile equities.\n\n`;
    } else {
      text += `💡 **Allocation Tip**: You have a highly conservative stance. Consider expanding your SIP index in diversified equity index funds to outpace inflation over the long run.\n\n`;
    }

    // Goals status
    if (goals.length > 0) {
      text += `### Active Goal Trackers:\n`;
      goals.forEach(g => {
        const progress = (g.current / g.target) * 100;
        text += `- **${g.name}**: ₹${g.current.toLocaleString('en-IN')} of ₹${g.target.toLocaleString('en-IN')} (**${progress.toFixed(0)}% complete**, timeline: ${g.timelineYears} yrs)\n`;
      });
    }

    return {
      text,
      category: 'portfolio',
      chips: ['Should I increase my SIP?', 'Show my emergency runway', 'Compare equity vs debt funds', 'Analyze my credit health'],
      metrics: [
        { label: 'Invested Assets', value: `₹${(totalInvestments / 100000).toFixed(2)}L`, status: 'success' },
        { label: 'Equity Allocation', value: `${equityPct.toFixed(0)}%`, status: 'info' },
        { label: 'Monthly SIP', value: `₹${(investments.totalSIP / 1000).toFixed(0)}k`, status: 'success' }
      ]
    };
  }

  // 3. INTENT: BUDGET / EXPENSE / SPENDING / CASH FLOW
  if (
    cleanQuery.includes('budget') ||
    cleanQuery.includes('expense') ||
    cleanQuery.includes('spend') ||
    cleanQuery.includes('saving') ||
    cleanQuery.includes('subscription') ||
    cleanQuery.includes('cash') ||
    cleanQuery.includes('outflow')
  ) {
    const netIncome = profile.monthlyIncome;
    // Calculate actual expenses from database this month
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savingsRate = netIncome > 0 ? ((netIncome - totalExpenses) / netIncome) * 100 : 0;
    
    // Categorize
    const categorySums: { [key: string]: number } = {};
    expenses.forEach(e => {
      categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
    });

    let text = `Here is your **Cash Flow & Budget Audit**: \n\n`;
    text += `### Income & Outflow Analysis:\n`;
    text += `- **Net Monthly Income**: **₹${netIncome.toLocaleString('en-IN')}**\n`;
    text += `- **Total Logged Outflows**: **₹${totalExpenses.toLocaleString('en-IN')}**\n`;
    text += `- **Current Savings Rate**: **${savingsRate.toFixed(1)}%** (Ideal: > 20%)\n\n`;

    // 50/30/20 rules
    text += `### 50/30/20 Budget Guidelines:\n`;
    const needsAmount = totalExpenses * 0.6; // Approximation
    const wantsAmount = totalExpenses * 0.4; // Approximation
    const needsPct = netIncome > 0 ? (needsAmount / netIncome) * 100 : 0;
    const wantsPct = netIncome > 0 ? (wantsAmount / netIncome) * 100 : 0;

    text += `- **Needs**: **${needsPct.toFixed(0)}%** (Limit: 50%)\n`;
    text += `- **Wants**: **${wantsPct.toFixed(0)}%** (Limit: 30%)\n`;
    text += `- **Savings**: **${savingsRate.toFixed(0)}%** (Target: 20%)\n\n`;

    if (savingsRate >= 20) {
      text += `✅ **Excellent savings discipline!** You are allocating over 20% of your earnings to investments and emergency reserves.\n\n`;
    } else {
      text += `💡 **Savings Boost Tip**: Your savings rate is below the recommended 20% threshold. Try reviewing your discretionary spending tags (e.g. food delivery, luxury shopping) to redirect at least 5% more into SIPs.\n\n`;
    }

    // Top Categories
    const topCats = Object.entries(categorySums)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topCats.length > 0) {
      text += `### Top Outflow Channels this Month:\n`;
      topCats.forEach(([cat, amt]) => {
        text += `- **${cat.toUpperCase()}**: ₹${amt.toLocaleString('en-IN')} (${((amt / totalExpenses) * 100).toFixed(0)}% of expenses)\n`;
      });
    }

    return {
      text,
      category: 'budget',
      chips: ['Show my subscription expenses', 'How is my emergency runway?', 'Am I spending too much?', 'List all recent transactions'],
      metrics: [
        { label: 'Actual Expenses', value: `₹${(totalExpenses / 1000).toFixed(1)}k`, status: totalExpenses > netIncome ? 'error' : 'warning' },
        { label: 'Savings Rate', value: `${savingsRate.toFixed(0)}%`, status: savingsRate >= 20 ? 'success' : 'warning' },
        { label: 'Emergency Fund', value: `₹${(profile.emergencyFund / 100000).toFixed(2)}L`, status: 'success' }
      ]
    };
  }

  // 4. INTENT: TAX PLANNING / 80C
  if (
    cleanQuery.includes('tax') ||
    cleanQuery.includes('80c') ||
    cleanQuery.includes('deduct') ||
    cleanQuery.includes('bracket') ||
    cleanQuery.includes('slab')
  ) {
    const annualIncome = profile.monthlyIncome * 12;
    const tax80c = profile.tax80c || 0;
    const remaining80c = Math.max(0, 150000 - tax80c);

    // Dynamic slab estimation (Indian Tax Code - New Regime vs Old Regime)
    let slabRate = '0%';
    if (annualIncome > 1500000) {
      slabRate = '30% (Old) / 20% (New)';
    } else if (annualIncome > 1200000) {
      slabRate = '20% (Old) / 15% (New)';
    } else if (annualIncome > 900000) {
      slabRate = '15% (Old) / 10% (New)';
    } else if (annualIncome > 600000) {
      slabRate = '10% (Old) / 5% (New)';
    } else {
      slabRate = '0%';
    }

    let text = `Here is your **Tax Planning & Deductions Audit**: \n\n`;
    text += `- **Estimated Annual Gross Income**: **₹${annualIncome.toLocaleString('en-IN')}**\n`;
    text += `- **Marginal Tax Slab Estimate**: **${slabRate}**\n`;
    text += `- **Logged Section 80C Contributions**: **₹${tax80c.toLocaleString('en-IN')}** out of ₹1,50,000 max limit.\n\n`;

    if (remaining80c > 0) {
      text += `⚠️ **Tax Saving Opportunity**:\n`;
      text += `You have **₹${remaining80c.toLocaleString('en-IN')}** of unused limits under Section 80C. Leaving this uninvested means you are paying unnecessary taxes. \n\n`;
      text += `**Recommended Actions to close the gap**:\n`;
      text += `1. **ELSS Mutual Funds**: Allocate the remaining ₹${remaining80c.toLocaleString('en-IN')} in tax-saver funds. This has the shortest lock-in (3 years) and high equity upside.\n`;
      text += `2. **Public Provident Fund (PPF)**: Guaranteed risk-free return of ~7.1% (exempt-exempt-exempt status).\n`;
      text += `3. **National Pension System (NPS)**: You can also save an *additional* ₹50,000 tax under Section 80CCD(1B) beyond 80C.\n`;
    } else {
      text += `✅ **Section 80C Fully Utilized!** You have maximized your ₹1.5 Lakh tax deductions. Excellent tax planning.`;
    }

    return {
      text,
      category: 'tax',
      chips: ['What is ELSS lock-in?', 'Calculate my monthly tax liability', 'Should I invest in PPF?', 'Audit my credit rewards'],
      metrics: [
        { label: '80C Investment', value: `₹${(tax80c / 1000).toFixed(0)}k`, status: tax80c >= 150000 ? 'success' : 'warning' },
        { label: 'Remaining 80C', value: `₹${(remaining80c / 1000).toFixed(0)}k`, status: remaining80c > 0 ? 'warning' : 'success' },
        { label: 'Marginal Slab', value: slabRate.split(' ')[0], status: 'info' }
      ]
    };
  }

  // 5. INTENT: REWARDS AUDIT / REWARDS LEAKAGE
  if (
    cleanQuery.includes('reward') ||
    cleanQuery.includes('leakage') ||
    cleanQuery.includes('cashback') ||
    cleanQuery.includes('point')
  ) {
    const totalEarned = rewardAudit.totalRewardsEarned;
    const leakageCount = rewardAudit.leakages.length;
    const leakageAmt = rewardAudit.totalLeakageAmount;

    let text = `Here is your **Credit Card Rewards Audit & Leakage Scan**: \n\n`;
    text += `- **Total In-App Rewards Accumulated**: **₹${totalEarned.toLocaleString('en-IN')}**\n`;
    text += `- **Overall Reward Yield Rate**: **${rewardAudit.overallRewardRate.toFixed(2)}%**\n`;
    text += `- **Detected Reward Leakage**: **₹${leakageAmt.toLocaleString('en-IN')}** across **${leakageCount} transactions**.\n\n`;

    if (leakageCount > 0) {
      text += `💡 **What is Reward Leakage?**\n`;
      text += `It represents potential cashback or points lost because a card with lower reward yield was used for a transaction where another card in your wallet offered a higher category multiplier. \n\n`;
      
      text += `### Key Leakage Instances:\n`;
      rewardAudit.leakages.slice(0, 3).forEach((l, index) => {
        text += `${index + 1}. **${l.description}** (${l.category.toUpperCase()}): Paid ₹${l.amount} with **${l.usedCardName}** (${l.usedRate}% rate). You *should* have used **${l.betterCardName}** (${l.betterRate}% rate). **Loss: ₹${l.leakageAmount.toFixed(1)}**.\n`;
      });

      text += `\n### Recommended Category Routing Guide:\n`;
      rewardAudit.optimizedDistribution.forEach(d => {
        text += `- **${d.category.toUpperCase()}**: Use **${d.recommendedCardName}** (${d.reason})\n`;
      });
    } else {
      text += `✅ **Perfect Card Routing!** No reward leakage was found. You are utilizing your credit cards at maximum category reward efficiency.`;
    }

    return {
      text,
      category: 'credit',
      chips: ['How is my credit health?', 'List my credit cards', 'Should I get a cashback card?', 'Show my budget breakdown'],
      metrics: [
        { label: 'Rewards Earned', value: `₹${totalEarned.toLocaleString('en-IN')}`, status: 'success' },
        { label: 'Reward Leakage', value: `₹${leakageAmt.toFixed(0)}`, status: leakageAmt > 0 ? 'warning' : 'success' },
        { label: 'Yield Rate', value: `${rewardAudit.overallRewardRate.toFixed(2)}%`, status: rewardAudit.overallRewardRate >= 2.0 ? 'success' : 'info' }
      ]
    };
  }

  // 6. DEFAULT / FALLBACK / GENERAL ASSISTANCE
  let text = `Hello **${profile.name}**! I am **Artha AI**, your local-first personal financial assistant. I analyze your profile data directly in the browser to give you safe, private, and actionable advisory tips.\n\n`;
  text += `Here are some things you can ask me about:\n`;
  text += `1. **Credit Health**: *"How is my credit score?"*, *"List my EMIs"*, or *"Analyze credit card utilization"*.\n`;
  text += `2. **Investment & Portfolio**: *"Audit my investments"*, *"Am I saving enough?"*, or *"Check my goals status"*.\n`;
  text += `3. **Budget & Cash Flow**: *"How much did I spend this month?"*, *"What is my savings rate?"*, or *"Scan my subscriptions"*.\n`;
  text += `4. **Tax Planner**: *"How to save tax?"*, *"What is my tax slab?"*, or *"Calculate remaining 80C limits"*.\n`;
  text += `5. **Reward Audit**: *"Scan for reward leakage"* or *"How to optimize my points"*.\n\n`;
  text += `What would you like to review first?`;

  return {
    text,
    category: 'general',
    chips: ['Analyze my credit health', 'Audit my investments', 'How is my budget looking?', 'How can I save tax?'],
    metrics: [
      { label: 'Net Worth Status', value: `₹${((investments.equity + investments.debt + profile.emergencyFund - totalEMIs * 6) / 100000).toFixed(2)}L`, status: 'success' },
      { label: 'Monthly Savings Rate', value: `${(((profile.monthlyIncome - expenses.reduce((s, e) => s + e.amount, 0)) / (profile.monthlyIncome || 1)) * 100).toFixed(0)}%`, status: 'success' }
    ]
  };
}

const totalEMIs = (creditEMIs: any[]) => creditEMIs.reduce((sum, e) => sum + e.monthlyAmount, 0);
