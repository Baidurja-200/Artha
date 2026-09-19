import { CreditCard, Expense } from '../types/finance';

export interface RewardLeakage {
  expenseId: string;
  description: string;
  category: string;
  amount: number;
  usedCardName: string;
  usedRate: number;
  betterCardName: string;
  betterRate: number;
  leakageAmount: number; // Potential rewards lost (monetary equivalent)
}

export interface RewardsAudit {
  totalRewardsEarned: number;
  overallRewardRate: number; // percentage
  leakages: RewardLeakage[];
  totalLeakageAmount: number;
  optimizedDistribution: {
    category: string;
    recommendedCardName: string;
    reason: string;
  }[];
}

export function auditRewards(creditCards: CreditCard[], expenses: Expense[]): RewardsAudit {
  const cardExpenses = expenses.filter((e) => e.paymentMethod === 'credit-card');
  const totalSpend = cardExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRewardsEarned = creditCards.reduce((sum, c) => sum + c.rewardEarned, 0);

  // Overall rate: total reward equivalent / total spend
  // Note: rewardEarned is absolute, but rate might be points. Let's assume 1 point = 1 INR or equivalent points cash value.
  const overallRewardRate = totalSpend > 0 ? (totalRewardsEarned / totalSpend) * 100 : 0;

  // Let's define the optimal card for each category based on card specifications:
  // Card 1: HDFC Regalia Gold (2.6%) -> Best for 'travel', 'entertainment', 'food', 'rent', and 'other'
  // Card 2: Amazon Pay ICICI (2.0%) -> Best for 'shopping', 'utilities', 'subscriptions'
  // Card 3: OneCard (1.0%) -> Worst for everything, but RuPay or low limit card backup
  const findOptimalCardForCategory = (category: string, cards: CreditCard[]): CreditCard | null => {
    if (cards.length === 0) return null;

    // Define rules or inspect rates
    // To make it dynamic, let's map:
    // HDFC Regalia gets 2.6% generally but travel/entertainment is premium
    // Amazon Pay gets 2.0% generally but shopping/utilities is premium
    // OneCard gets 1.0% generally.
    let bestCard = cards[0];
    let maxRate = -1;

    for (const card of cards) {
      let rate = card.rewardRate;
      
      // Category overrides for mock intelligence
      if (card.name.toLowerCase().includes('amazon') || card.bank.toLowerCase().includes('icici')) {
        if (category === 'shopping' || category === 'utilities' || category === 'subscriptions') {
          rate = 5.0; // 5% on Amazon/shopping/utilities
        } else {
          rate = 1.0;
        }
      } else if (card.name.toLowerCase().includes('regalia') || card.bank.toLowerCase().includes('hdfc')) {
        if (category === 'travel' || category === 'entertainment' || category === 'food') {
          rate = 4.0; // 4% on travel/dining
        } else {
          rate = 1.33; // 4 points per 150 = 2.66%, let's say points value is 1.33% cash
        }
      } else {
        // OneCard
        rate = 1.0;
      }

      if (rate > maxRate) {
        maxRate = rate;
        bestCard = card;
      }
    }

    return bestCard;
  };

  const getCardCategoryRate = (card: CreditCard, category: string): number => {
    if (card.name.toLowerCase().includes('amazon') || card.bank.toLowerCase().includes('icici')) {
      if (category === 'shopping' || category === 'utilities' || category === 'subscriptions') {
        return 5.0;
      }
      return 1.0;
    } else if (card.name.toLowerCase().includes('regalia') || card.bank.toLowerCase().includes('hdfc')) {
      if (category === 'travel' || category === 'entertainment' || category === 'food') {
        return 4.0;
      }
      return 1.33;
    }
    return 1.0; // OneCard
  };

  const leakages: RewardLeakage[] = [];
  let totalLeakageAmount = 0;

  cardExpenses.forEach((exp) => {
    if (!exp.cardId) return;
    const usedCard = creditCards.find((c) => c.id === exp.cardId);
    if (!usedCard) return;

    const usedRate = getCardCategoryRate(usedCard, exp.category);
    const optimalCard = findOptimalCardForCategory(exp.category, creditCards);

    if (optimalCard && optimalCard.id !== usedCard.id) {
      const optimalRate = getCardCategoryRate(optimalCard, exp.category);
      if (optimalRate > usedRate) {
        const potentialLost = (exp.amount * (optimalRate - usedRate)) / 100;
        leakages.push({
          expenseId: exp.id,
          description: exp.description,
          category: exp.category,
          amount: exp.amount,
          usedCardName: usedCard.name,
          usedRate,
          betterCardName: optimalCard.name,
          betterRate: optimalRate,
          leakageAmount: potentialLost,
        });
        totalLeakageAmount += potentialLost;
      }
    }
  });

  const categoriesToAudit = ['shopping', 'travel', 'food', 'utilities', 'entertainment'];
  const optimizedDistribution = categoriesToAudit.map((cat) => {
    const opt = findOptimalCardForCategory(cat, creditCards);
    let reason = '';
    if (opt?.name.includes('Regalia')) {
      reason = 'Offers 4.0% points yield on premium travel & dining.';
    } else if (opt?.name.includes('Amazon')) {
      reason = 'Offers 5.0% cashback rate on Amazon shopping & core utility payments.';
    } else {
      reason = 'General 1.0% cashback on all transactions.';
    }
    return {
      category: cat,
      recommendedCardName: opt ? opt.name : 'N/A',
      reason,
    };
  });

  return {
    totalRewardsEarned,
    overallRewardRate,
    leakages,
    totalLeakageAmount,
    optimizedDistribution,
  };
}
