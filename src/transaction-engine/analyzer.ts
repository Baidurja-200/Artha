import { Expense, UserProfile } from '../types/finance';

export interface TransactionObservation {
  id: string;
  type: 'subscription' | 'inflation' | 'spike' | 'emi' | 'anomaly' | 'irregular_savings';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: string;
  actionableStep: string;
}

export const analyzeTransactions = (
  expenses: Expense[],
  profile: UserProfile
): TransactionObservation[] => {
  const observations: TransactionObservation[] = [];
  const monthlyIncome = profile.monthlyIncome || 1;
  
  if (expenses.length === 0) {
    return [];
  }

  // Group by category to find averages
  const categorySpends: Record<string, number[]> = {};
  expenses.forEach(e => {
    const cat = e.category.toLowerCase();
    if (!categorySpends[cat]) {
      categorySpends[cat] = [];
    }
    categorySpends[cat].push(e.amount);
  });

  // 1. Detect Spending Spikes
  // Any single transaction exceeding 10% of monthly income OR 3 times the average for its category (for categories with > 2 transactions)
  expenses.forEach(e => {
    const cat = e.category.toLowerCase();
    // Skip investments/rent/EMI as they are inherently high and regular
    if (['rent', 'investments', 'emi/debt'].includes(cat)) return;

    const isSalarySpike = e.amount > monthlyIncome * 0.1;
    const catAmounts = categorySpends[cat] || [];
    
    if (catAmounts.length >= 3) {
      const totalCat = catAmounts.reduce((a, b) => a + b, 0);
      const avgCat = totalCat / catAmounts.length;
      
      if (e.amount > avgCat * 3 && isSalarySpike) {
        observations.push({
          id: `spike_${e.id}`,
          type: 'spike',
          severity: 'warning',
          title: `Large Spending Spike: ${e.description}`,
          description: `A single outflow of ₹${e.amount.toLocaleString('en-IN')} was logged under "${e.category}" on ${e.date}. This is 3x higher than your usual ${e.category} spending.`,
          impact: 'Sudden high-ticket discretionary outlays reduce liquid cash flow, triggering temporary budget shocks.',
          actionableStep: 'Audit this purchase. For large discretionary spending, try to plan 1-2 months in advance rather than buying impulsively.'
        });
      }
    } else if (isSalarySpike) {
      observations.push({
        id: `spike_salary_${e.id}`,
        type: 'spike',
        severity: 'info',
        title: `Significant Outflow Logged: ${e.description}`,
        description: `Logged a single charge of ₹${e.amount.toLocaleString('en-IN')} on ${e.date}, representing ${Math.round((e.amount / monthlyIncome) * 100)}% of your monthly income.`,
        impact: 'Large lump-sum outlays immediately depress your cash-flow surplus for the active month.',
        actionableStep: 'Keep an eye on unallocated cash remaining to ensure your automated wealth SIPs debit successfully.'
      });
    }
  });

  // 2. Detect Recurring Subscriptions
  // Look for keywords in description
  const subKeywords = ['netflix', 'spotify', 'prime', 'youtube premium', 'icloud', 'adobe', 'canva', 'gsuite', 'jiofiber', 'airtel black', 'gym', 'membership', 'sub', 'renew'];
  const subscriptions = expenses.filter(e => {
    const desc = e.description.toLowerCase();
    return subKeywords.some(k => desc.includes(k)) || e.category.toLowerCase() === 'subscriptions';
  });

  const totalSubSpend = subscriptions.reduce((acc, e) => acc + e.amount, 0);
  const subToSavingsRatio = totalSubSpend / (profile.monthlyIncome * 0.2 || 1); // standard 20% savings target

  if (subscriptions.length > 0) {
    if (totalSubSpend > 3000 || subToSavingsRatio > 0.15) {
      observations.push({
        id: 'sub_spikes',
        type: 'subscription',
        severity: 'warning',
        title: 'Elevated Subscription Cash Drain',
        description: `You are paying ₹${totalSubSpend.toLocaleString('en-IN')} monthly across ${subscriptions.length} recurring subscriptions (${subscriptions.map(s => s.description.split(' ')[0]).join(', ')}). This consumes ${Math.round(subToSavingsRatio * 100)}% of your target monthly savings rate.`,
        impact: 'Recurring small subscriptions create a "stealth leak" that quietly reduces your investable wealth compounding without your active notice.',
        actionableStep: 'Perform a subscription audit. Actively cancel any platform you have not utilized in the last 30 days. Re-subscribe only when needed.'
      });
    } else {
      observations.push({
        id: 'sub_info',
        type: 'subscription',
        severity: 'info',
        title: `Active Subscriptions: ${subscriptions.length} Items Detected`,
        description: `Your subscription bills sum to ₹${totalSubSpend.toLocaleString('en-IN')} monthly. Your automated baseline is well-controlled.`,
        impact: 'Controlled subscription baselines keep your fixed structural overheads beautifully low.',
        actionableStep: 'Keep subscriptions on card auto-debit alerts so you instantly catch any sneaky price increases.'
      });
    }
  }

  // 3. Detect Recurring EMI Patterns
  // Scan expenses for items on specific dates with "EMI", "loan", or category "EMI/debt"
  const emiItems = expenses.filter(e => 
    e.description.toLowerCase().includes('emi') || 
    e.description.toLowerCase().includes('loan') || 
    e.category.toLowerCase() === 'emi/debt'
  );

  const totalEMISpend = emiItems.reduce((acc, e) => acc + e.amount, 0);
  if (emiItems.length > 0) {
    // If EMI spend doesn't match profile.debtEMI, flag it
    const profileEMI = profile.debtEMI || 0;
    if (totalEMISpend > profileEMI * 1.1) {
      observations.push({
        id: 'emi_drift',
        type: 'emi',
        severity: 'warning',
        title: 'Undocumented EMI Commitments Detected',
        description: `Your parsed transactions indicate ₹${totalEMISpend.toLocaleString('en-IN')} in active EMI outflows, which is higher than the ₹${profileEMI.toLocaleString('en-IN')} stated in your profile settings.`,
        impact: 'Undocumented EMI commitments create gaps in your automated decision engine planning, throwing off goal trajectories.',
        actionableStep: 'Update your Profile settings to accurately reflect your true active loan EMI obligations.'
      });
    }
  }

  // 4. Lifestyle Inflation & Rising Discretionary Expenses
  // Let's analyze month-on-month changes in wants spends
  const expensesByMonth: Record<string, number> = {};
  expenses.forEach(e => {
    if (['food', 'shopping', 'entertainment', 'travel'].includes(e.category.toLowerCase())) {
      const month = e.date.substring(0, 7);
      expensesByMonth[month] = (expensesByMonth[month] || 0) + e.amount;
    }
  });

  const months = Object.keys(expensesByMonth).sort();
  if (months.length >= 3) {
    const lastMonth = expensesByMonth[months[months.length - 1]];
    const prevMonth = expensesByMonth[months[months.length - 2]];
    const threeMonthsAgo = expensesByMonth[months[months.length - 3]];
    
    if (lastMonth > prevMonth && prevMonth > threeMonthsAgo) {
      observations.push({
        id: 'lifestyle_inflation',
        type: 'inflation',
        severity: 'warning',
        title: 'Consecutive Discretionary Spend Rises',
        description: `Your discretionary wants spending has increased steadily over the last 3 months (from ₹${threeMonthsAgo.toLocaleString('en-IN')} to ₹${lastMonth.toLocaleString('en-IN')}).`,
        impact: 'Steady rises in lifestyle spends represent lifestyle inflation, which slowly eats away at your wealth compounding speed.',
        actionableStep: 'Adopt a "Lifestyle Cap" for the upcoming month. Set a firm discretionary wants budget and freeze shopping apps once it is reached.'
      });
    }
  }

  // 5. Unusual Spending Behavior (Anomaly)
  // Transactions logged at odd categories, or excessive entertainment values
  const entertainmentSpends = expenses.filter(e => e.category.toLowerCase() === 'entertainment');
  const totalEntSpend = entertainmentSpends.reduce((acc, e) => acc + e.amount, 0);
  
  if (totalEntSpend > monthlyIncome * 0.15) {
    observations.push({
      id: 'ent_anomaly',
      type: 'anomaly',
      severity: 'warning',
      title: 'Unusually High Entertainment Outlays',
      description: `Your PVR movies, dining out, and leisure spending (₹${totalEntSpend.toLocaleString('en-IN')}) consumes over 15% of monthly salary.`,
      impact: 'High-frequency leisure leaks leave very little unallocated cash to capitalize on market dips.',
      actionableStep: 'Moderate your dining out habits. Try cooking at home or planning low-cost group activities next weekend.'
    });
  }

  return observations;
};
export const parseBankStatementText = (text: string): Array<Omit<Expense, 'id'>> => {
  const parsedExpenses: Array<Omit<Expense, 'id'>> = [];
  const lines = text.split('\n');

  lines.forEach(line => {
    // Look for standard UPI / Bank narrative lines
    // E.g., "18/05/2026 UPI/Zomato/92340283 ₹3,200" or similar
    // Or just tab-separated lines containing amount, date, and description
    const cleanLine = line.trim();
    if (!cleanLine) return;

    // Regex to match Indian rupee numbers like 5,000 or 500 or 12,000.00
    const amtMatch = cleanLine.match(/(?:₹|Rs\.?|INR)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
    const dateMatch = cleanLine.match(/(\d{2}[-/.]\d{2}[-/.]\d{2,4})/);
    
    if (amtMatch && dateMatch) {
      const amountStr = amtMatch[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      const dateStr = dateMatch[1];
      
      // Parse date to YYYY-MM-DD
      let date = new Date().toISOString().split('T')[0];
      try {
        const parts = dateStr.split(/[-/.]/);
        if (parts.length === 3) {
          const day = parts[0];
          const month = parts[1];
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } catch (err) {}

      // Extract description: everything except date and amount
      let description = cleanLine
        .replace(dateMatch[0], '')
        .replace(amtMatch[0], '')
        .replace(/(?:₹|Rs\.?|INR)/g, '')
        .trim();

      if (!description) {
        description = 'Bank Statement Entry';
      }

      // Resolve category
      let category = 'shopping'; // default
      const descLower = description.toLowerCase();

      if (descLower.includes('swiggy') || descLower.includes('zomato') || descLower.includes('blinkit') || descLower.includes('instamart') || descLower.includes('food') || descLower.includes('dining')) {
        category = 'food';
      } else if (descLower.includes('uber') || descLower.includes('ola') || descLower.includes('petrol') || descLower.includes('travel') || descLower.includes('fuel')) {
        category = 'travel';
      } else if (descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('prime') || descLower.includes('youtube')) {
        category = 'subscriptions';
      } else if (descLower.includes('emi') || descLower.includes('loan') || descLower.includes('hdfc') || descLower.includes('sbi')) {
        category = 'EMI/debt';
      } else if (descLower.includes('rent') || descLower.includes('landlord')) {
        category = 'rent';
      } else if (descLower.includes('sip') || descLower.includes('mutual fund') || descLower.includes('zerodha') || descLower.includes('groww')) {
        category = 'investments';
      } else if (descLower.includes('electricity') || descLower.includes('wifi') || descLower.includes('mobile') || descLower.includes('bill')) {
        category = 'utilities';
      } else if (descLower.includes('pvr') || descLower.includes('movie') || descLower.includes('pub') || descLower.includes('poker') || descLower.includes('dining out')) {
        category = 'entertainment';
      } else if (descLower.includes('apollo') || descLower.includes('medical') || descLower.includes('hospital') || descLower.includes('doctor')) {
        category = 'healthcare';
      }

      if (amount > 0) {
        parsedExpenses.push({
          amount,
          category,
          date,
          description
        });
      }
    }
  });

  return parsedExpenses;
};
