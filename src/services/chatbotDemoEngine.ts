import useFinanceStore from '../store/useFinanceStore';
import { computeCreditHealth } from '../credit-health/engine';
import { analyzeCreditUtilization } from '../utilization-engine/utilization';
import { analyzeRepayments } from '../repayment-engine/repayment';
import { auditRewards } from '../reward-analysis/rewards';

export interface ChatbotDemoResponse {
  text: string;
  chips: string[];
  metrics?: { label: string; value: string; status?: 'success' | 'warning' | 'error' | 'info' }[];
}

export function generateDemoResponse(query: string): ChatbotDemoResponse {
  const cleanQuery = query.toLowerCase().trim();
  const state = useFinanceStore.getState();

  const { profile, creditCards, creditEMIs, creditRepayments, investments, goals, expenses } = state;
  const healthReport = computeCreditHealth(creditCards, creditEMIs, creditRepayments, profile, expenses);
  const utilization = analyzeCreditUtilization(creditCards);
  const repayments = analyzeRepayments(creditRepayments);
  const rewardAudit = auditRewards(creditCards, expenses);

  const totalInvestments = investments.equity + investments.debt;
  const equityPct = totalInvestments > 0 ? (investments.equity / totalInvestments) * 100 : 0;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = profile.monthlyIncome > 0 ? ((profile.monthlyIncome - totalExpenses) / profile.monthlyIncome) * 100 : 0;

  // --- TOPIC 1: GENERAL PERSONAL FINANCE RULES & FORMULAS ---
  if (cleanQuery.includes('rule of 72') || cleanQuery.includes('double my money')) {
    return {
      text: `The **Rule of 72** is a quick formula to estimate the number of years required to double your investment at a fixed annual rate of interest.

### The Formula:
$$\\text{Years to Double} = \\frac{72}{\\text{Interest Rate}}$$

### Examples:
- At **6% interest** (standard Fixed Deposit rate), your money will double in:  
  $72 / 6 = \\mathbf{12 \\text{ years}}$.
- At **12% interest** (long-term average direct index fund returns), your money will double in:  
  $72 / 12 = \\mathbf{6 \\text{ years}}$.
- At **15% interest** (aggressive equity mutual fund returns), your money will double in:  
  $72 / 15 = \\mathbf{4.8 \\text{ years}}$.

💡 *Note: This rule assumes interest compounds annually and no additional capital is added.*`,
      chips: ['What is compound interest?', 'Show my emergency runway', 'Explain 50/30/20 rule', 'Analyze my portfolio']
    };
  }

  if (cleanQuery.includes('50/30/20') || cleanQuery.includes('rule of budgeting')) {
    return {
      text: `The **50/30/20 Rule** is a straightforward budgeting method to allocate your post-tax income:

- **50% Needs**: Core obligations (Rent, Home Loan EMI, Utilities, Insurance, Groceries).
- **30% Wants**: Discretionary spending (Dining out, travel, gadgets, movies, shopping).
- **20% Savings/Investments**: Building your future (SIPs, PPF, emergency fund additions).

### Audit of your local budget (Rahul's state):
- **Income**: ₹${profile.monthlyIncome.toLocaleString('en-IN')}/month
- **Logged Expenses**: ₹${totalExpenses.toLocaleString('en-IN')} this month
- **Your Savings Rate**: **${savingsRate.toFixed(1)}%**

${
  savingsRate >= 20 
    ? `✅ **Excellent!** Your current savings rate is **${savingsRate.toFixed(0)}%**, exceeding the 20% rule of thumb.` 
    : `💡 **Advisory**: You are saving **${savingsRate.toFixed(0)}%** of your income. Look to prune discretionary expenses (e.g. food apps, subscription creep) to hit the 20% mark.`
}`,
      chips: ['Scan my subscriptions', 'Am I spending too much?', 'List recent transactions', 'Analyze my portfolio'],
      metrics: [
        { label: 'Logged Income', value: `₹${(profile.monthlyIncome / 1000).toFixed(0)}k`, status: 'success' },
        { label: 'Actual Expenses', value: `₹${(totalExpenses / 1000).toFixed(0)}k`, status: 'warning' },
        { label: 'Savings Rate', value: `${savingsRate.toFixed(0)}%`, status: savingsRate >= 20 ? 'success' : 'warning' }
      ]
    };
  }

  if (cleanQuery.includes('compound interest') || cleanQuery.includes('compounding')) {
    return {
      text: `**Compound Interest** is the interest earned on your initial principal plus the accumulated interest from previous periods. Einstein famously called it the "8th Wonder of the World."

### The Key Pillars:
1. **Time ($n$)**: The longer you stay invested, the exponential curve takes over.
2. **Frequency ($m$)**: Monthly compounding yields slightly more than quarterly or annual compounding.
3. **Consistency**: Automating systematic investments (SIPs) ensures you buy both market highs and lows.

### Visualizing Compounding over 20 years:
If you invest **₹10,000/month** at **12% CAGR**:
- Total Invested: ₹24,00,000
- Wealth Gained: ₹75,91,479
- **Total Portfolio Value**: **₹99,91,479 (almost 1 Crore!)**

*The key takeaway is that the growth in the last 5 years is typically greater than the entire growth in the first 15 years.*`,
      chips: ['What is the Rule of 72?', 'Analyze my mutual funds', 'Audit my investments', 'Should I increase my SIP?']
    };
  }

  // --- TOPIC 2: MUTUAL FUNDS & INVESTING ---
  if (cleanQuery.includes('direct vs regular') || cleanQuery.includes('mutual fund commission')) {
    return {
      text: `### Direct vs. Regular Mutual Funds

The fundamental difference lies in **commission fees** paid to agents or brokers.

*   **Regular Funds**: Include a recurring distributor commission (typically **0.5% to 1.5%** annually) built into the fund's Expense Ratio.
*   **Direct Funds**: Have zero commission fees. You buy directly from the AMC. This difference gets added directly to your Net Asset Value (NAV).

### Long-Term Impact:
While a 1% commission difference sounds negligible, over a 20-year investment horizon:
- A regular fund with 1% higher expense ratio will eat up **roughly 20% to 25% of your final accumulated corpus**!
- For a ₹10,000/month SIP, going **Direct** could save you over **₹15 Lakhs** in fees.

✅ *Artha recommendation: Always invest in **Direct Plans** (marked with "Direct" in the scheme name) to maximize long-term compounding.*`,
      chips: ['Analyze my portfolio', 'What is an ELSS?', 'What is a good SIP return?', 'Audit my investments']
    };
  }

  if (cleanQuery.includes('index fund') || cleanQuery.includes('passive invest')) {
    return {
      text: `An **Index Fund** is a mutual fund or ETF that tracks a specific index, like the **NIFTY 50** or **SENSEX**, by purchasing the exact same stocks in the exact same proportion.

### Pros:
- **Low Cost**: Ultra-low Expense Ratios (often **0.1% to 0.2%** vs 1.5% for active funds).
- **No Manager Risk**: Eliminates the risk of a fund manager making poor stock picks.
- **Outperformance**: Studies show ~80% of active large-cap mutual funds fail to beat their benchmark index over a 5-10 year period.

💡 *Artha Tip: For core equity allocations, index funds are the most reliable, tax-efficient, and low-stress entry point for retail investors.*`,
      chips: ['Direct vs Regular funds', 'Equity vs Debt allocations', 'Calculate my retirement target', 'Analyze my portfolio']
    };
  }

  // --- TOPIC 3: INDIAN TAX CODE (80C, OLD VS NEW) ---
  if (cleanQuery.includes('80c') || cleanQuery.includes('tax deduction') || cleanQuery.includes('elss')) {
    const tax80c = profile.tax80c || 0;
    const remaining80c = Math.max(0, 150000 - tax80c);

    return {
      text: `### Section 80C Tax Deductions (Old Tax Regime)

Under Section 80C, you can deduct up to **₹1,50,000** from your taxable income annually by investing in qualifying instruments.

### Key 80C Instruments:
1. **ELSS (Equity Linked Savings Scheme)**: Mutual funds with a **3-year lock-in** (shortest among all 80C options) and equity exposure.
2. **PPF (Public Provident Fund)**: Risk-free sovereign backing, currently yielding **7.1% tax-free** (15-year lock-in).
3. **EPF / VPF**: Salaried employees' mandatory retirement contributions.
4. **NPS (National Pension System)**: Pension fund.
5. **SSY (Sukanya Samriddhi Yojana)**: For girl children.

### Your Section 80C Tracker:
- **Logged Deductions**: ₹${tax80c.toLocaleString('en-IN')}
- **Remaining Window**: ₹${remaining80c.toLocaleString('en-IN')}
${
  remaining80c > 0 
    ? `⚠️ **Action**: You have **₹${remaining80c.toLocaleString('en-IN')}** in tax-saving opportunities. Consider putting this in ELSS funds or PPF.` 
    : `✅ **Outstanding**: Your 80C is fully maximized!`
}`,
      chips: ['New vs Old regime', 'Should I invest in PPF?', 'Audit my investments', 'How is my budget looking?'],
      metrics: [
        { label: '80C Claimed', value: `₹${(tax80c / 1000).toFixed(0)}k`, status: tax80c >= 150000 ? 'success' : 'warning' },
        { label: 'Unused Limit', value: `₹${(remaining80c / 1000).toFixed(0)}k`, status: remaining80c > 0 ? 'warning' : 'success' }
      ]
    };
  }

  if (cleanQuery.includes('regime') || cleanQuery.includes('old vs new tax')) {
    const annualIncome = profile.monthlyIncome * 12;
    return {
      text: `### Old vs. New Tax Regime Slabs (FY 2025-26)

India currently has two parallel income tax structures:

| Income Slab | Old Regime Rates (with deductions) | New Regime Slabs (default structure) |
|---|---|---|
| Up to ₹3 Lakhs | 0% | 0% |
| ₹3L - ₹6 Lakhs | 5% (Rebate up to 5L) | 5% (Rebate up to 7L) |
| ₹6L - ₹9 Lakhs | 20% | 10% |
| ₹9L - ₹12 Lakhs | 20% | 15% |
| ₹12L - ₹15 Lakhs | 30% | 20% |
| Above ₹15 Lakhs | 30% | 30% |

### Key Differences:
- **Old Regime**: Higher tax rates but allows you to claim deductions (80C, 80D, HRA rent, home loan interest, LTA).
- **New Regime**: Lower tax rates but eliminates almost all exemptions/deductions (except standard deduction of ₹75,000).

### Diagnostic for Rahul (₹${annualIncome.toLocaleString('en-IN')}/year):
If your total exemptions (80C + 80D + HRA + Home Loan) exceed **₹3.75 Lakhs**, the **Old Regime** will likely save you more tax. Otherwise, the **New Regime** is simpler and cheaper.`,
      chips: ['Deductions under 80C', 'Calculate my monthly tax liability', 'Analyze my portfolio', 'How to save tax?']
    };
  }

  // --- TOPIC 4: CREDIT AND CIBIL HEALTH ---
  if (cleanQuery.includes('cibil') || cleanQuery.includes('credit score') || cleanQuery.includes('cibil vs experian')) {
    return {
      text: `### Credit Score Brackets (CIBIL / Experian)

Your credit score is a 3-digit rating (300 to 900) representing your borrow reliability.

| Score Range | Rating | Impact on Borrowing |
|---|---|---|
| **780 - 900** | Excellent | Super-fast approval, lowest interest rates on loans. |
| **720 - 779** | Good | Easily approved for premium cards and home loans. |
| **650 - 719** | Fair | Standard approvals; interest rates may be loaded. |
| **300 - 649** | Poor | Approvals rejected; flagged as default risk. |

### Your Local Simulated Profile:
- **Current Score**: **${healthReport.creditScore} (${healthReport.creditRating})**
- **Utilization Rate**: **${utilization.overallUtilization.toFixed(1)}%**
- **On-time Repayments**: **${repayments.onTimeRate.toFixed(0)}%** over **${repayments.totalBills} billing cycles**.
- **Active Credit EMIs**: **${creditEMIs.length} active EMIs** (Totaling ₹${creditEMIs.reduce((s, e) => s + e.monthlyAmount, 0).toLocaleString('en-IN')}/month).`,
      chips: ['Audit my rewards leakage', 'How is my credit stress score?', 'Show my active credit EMIs', 'Audit my spending'],
      metrics: [
        { label: 'Score Index', value: `${healthReport.creditScore}`, status: healthReport.creditScore >= 745 ? 'success' : healthReport.creditScore >= 660 ? 'warning' : 'error' },
        { label: 'Util Ratio', value: `${utilization.overallUtilization.toFixed(1)}%`, status: utilization.overallUtilization <= 30 ? 'success' : 'warning' }
      ]
    };
  }

  // --- TOPIC 5: DYNAMIC USER CONTEXT INQUIRIES ---
  if (cleanQuery.includes('my portfolio') || cleanQuery.includes('my investments') || cleanQuery.includes('allocation')) {
    const equityPct = totalInvestments > 0 ? (investments.equity / totalInvestments) * 100 : 0;
    const debtPct = totalInvestments > 0 ? (investments.debt / totalInvestments) * 100 : 0;
    
    return {
      text: `### In-App Portfolio Allocation for ${profile.name}

- **Total Assets**: **₹${totalInvestments.toLocaleString('en-IN')}**
- **Equity Segment**: **₹${investments.equity.toLocaleString('en-IN')} (${equityPct.toFixed(0)}%)**
- **Debt Segment**: **₹${investments.debt.toLocaleString('en-IN')} (${debtPct.toFixed(0)}%)**
- **Monthly SIP Commitments**: **₹${investments.totalSIP.toLocaleString('en-IN')}/month**

### Review:
Given your age is **${profile.age}**, your asset profile is heavily growth-focused. This allocation fits aggressive wealth compounding timelines of 7+ years. Ensure you keep at least **6 months of emergency expenses** in your liquid debt segment to avoid having to cash out equities during market corrections.`,
      chips: ['Explain asset allocation', 'Compare equity vs debt funds', 'Show my active goals', 'What is compound interest?'],
      metrics: [
        { label: 'Equity Exposure', value: `${equityPct.toFixed(0)}%`, status: 'info' },
        { label: 'Debt Exposure', value: `${debtPct.toFixed(0)}%`, status: 'info' },
        { label: 'SIP Index', value: `₹${(investments.totalSIP / 1000).toFixed(0)}k`, status: 'success' }
      ]
    };
  }

  if (cleanQuery.includes('goals') || cleanQuery.includes('my targets')) {
    if (goals.length === 0) {
      return {
        text: `You do not have any active financial goals defined in your profile. Setting targets is crucial to guide your asset allocation!`,
        chips: ['How is my portfolio?', 'Show my budget breakdown', 'Rule of 72']
      };
    }

    let text = `Here are your active **Financial Goal Trackers**:\n\n`;
    goals.forEach(g => {
      const progress = (g.current / g.target) * 100;
      text += `- **${g.name}** (${g.category.toUpperCase()}):\n  Target: ₹${g.target.toLocaleString('en-IN')} | Accumulation: ₹${g.current.toLocaleString('en-IN')} (**${progress.toFixed(0)}% completed**, Target Year: +${g.timelineYears} years)\n`;
    });

    return {
      text,
      chips: ['Audit my portfolio', 'Should I increase my SIP?', 'Show my emergency runway']
    };
  }

  // --- GENERAL FALLBACK ENGINE ---
  let text = `I am **Artha AI** (Demo Mode), your personal financial intelligence assistant. I can answer general finance inquiries or help analyze your active dashboard data.\n\n`;
  text += `**I can assist you with:**\n`;
  text += `1. **General Financial Rules**: *"What is the Rule of 72?"*, *"How does compound interest work?"*, or *"Explain the 50/30/20 budget rule"*.\n`;
  text += `2. **Mutual Funds & Investing**: *"Direct vs Regular plans"*, *"What is an index fund?"*, or *"Analyze my portfolio"*.\n`;
  text += `3. **Tax Planning & Code**: *"Exemptions under 80C"*, *"Explain ELSS funds"*, or *"New vs Old tax slabs"*.\n`;
  text += `4. **Credit Cards & Scores**: *"Brackets for credit scores"*, *"List active EMIs"*, or *"How is my credit health?"*.\n\n`;
  text += `Feel free to type any personal finance questions!`;

  return {
    text,
    chips: ['What is the Rule of 72?', 'Explain the 50/30/20 budget rule', 'New vs Old tax slabs', 'Analyze my portfolio']
  };
}
