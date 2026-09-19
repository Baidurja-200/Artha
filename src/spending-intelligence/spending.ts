import { Expense } from '../types/finance';

export interface SpendingCategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface CreditSubscription {
  id: string;
  description: string;
  amount: number;
  date: string;
  cardId?: string;
}

export interface SpendingIntelligence {
  cardExpenses: Expense[];
  totalCreditSpend: number;
  categories: SpendingCategorySummary[];
  subscriptions: CreditSubscription[];
  spendingSpikes: {
    description: string;
    amount: number;
    avgForCategory: number;
    excessPercentage: number;
  }[];
}

export function analyzeCreditSpending(expenses: Expense[]): SpendingIntelligence {
  const cardExpenses = expenses.filter((e) => e.paymentMethod === 'credit-card');
  const totalCreditSpend = cardExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryMap: { [key: string]: number } = {};
  cardExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const categories = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    amount: categoryMap[cat],
    percentage: totalCreditSpend > 0 ? (categoryMap[cat] / totalCreditSpend) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Subscriptions
  const subscriptions = cardExpenses
    .filter((e) => e.category === 'subscriptions')
    .map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      date: e.date,
      cardId: e.cardId,
    }));

  // Detect spending spikes
  // Compute typical average sizes for category (mock or baseline)
  // Let's compare transaction size against standard benchmarks for discretionary spend
  const benchmarks: { [key: string]: number } = {
    food: 1200,
    shopping: 3500,
    travel: 2000,
    entertainment: 2500,
  };

  const spendingSpikes: SpendingIntelligence['spendingSpikes'] = [];
  cardExpenses.forEach((e) => {
    const limit = benchmarks[e.category];
    if (limit && e.amount > limit * 1.5) {
      spendingSpikes.push({
        description: e.description,
        amount: e.amount,
        avgForCategory: limit,
        excessPercentage: ((e.amount - limit) / limit) * 100,
      });
    }
  });

  return {
    cardExpenses,
    totalCreditSpend,
    categories,
    subscriptions,
    spendingSpikes: spendingSpikes.sort((a, b) => b.amount - a.amount),
  };
}
