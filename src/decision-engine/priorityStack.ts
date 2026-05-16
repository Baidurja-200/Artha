/**
 * Financial Priority Stack Engine
 * Generates a ranked stack of the MOST IMPORTANT financial actions.
 */

export const generatePriorityStack = (metrics, profile, tradeoffs) => {
  const { detailedScores } = metrics;
  const priorities = [];

  const emergency = detailedScores.find(s => s.id === 'emergency');
  const debt = detailedScores.find(s => s.id === 'debt');
  const savings = detailedScores.find(s => s.id === 'savings');
  const goals = detailedScores.find(s => s.id === 'goals');

  // Emergency is almost always Priority 1 if critically low
  if (emergency.score < 50) {
    priorities.push({
      id: 'priority_emergency',
      rank: priorities.length + 1,
      title: 'Strengthen Emergency Fund',
      why: 'A weak safety net is the single biggest threat to long-term wealth compounding.',
      impact: 'Reduces the likelihood of panic-selling equities or taking high-interest personal loans during a crisis.',
      action: emergency.suggestion
    });
  }

  // Debt is Priority 2 if high
  if (debt.score < 60) {
    priorities.push({
      id: 'priority_debt',
      rank: priorities.length + 1,
      title: 'Reduce Unnecessary Debt Burden',
      why: 'High Debt-to-Income (DTI) ratio restricts cash flow and limits your investable surplus.',
      impact: 'Lowering debt immediately provides a "risk-free return" equivalent to your loan interest rate.',
      action: debt.suggestion
    });
  }

  // Savings / Cash Flow
  if (savings.score < 60) {
    priorities.push({
      id: 'priority_savings',
      rank: priorities.length + 1,
      title: 'Optimize Savings Rate',
      why: 'Your current lifestyle expenses are leaving too little surplus for wealth generation.',
      impact: 'A higher savings rate exponentially accelerates your timeline to financial independence.',
      action: savings.suggestion
    });
  }

  // Tax Optimization
  if (!profile.tax80c || profile.tax80c < 150000) {
    priorities.push({
      id: 'priority_tax',
      rank: priorities.length + 1,
      title: 'Optimize Tax-Saving Investments',
      why: 'Unused 80C limits mean you are paying unnecessary taxes to the government instead of compounding wealth.',
      impact: 'Maxing out 80C (₹1.5L) can save you up to ₹46,800 annually in taxes (at 30% bracket), which can be reinvested.',
      action: 'Allocate surplus into ELSS Mutual Funds or PPF before the financial year ends.'
    });
  }

  // Goal Funding
  if (goals && goals.score < 80) {
    priorities.push({
      id: 'priority_goals',
      rank: priorities.length + 1,
      title: 'Increase Retirement/Goal SIP Allocation',
      why: 'Current mathematical projections indicate a shortfall for your defined life goals.',
      impact: 'Stepping up your SIPs now utilizes the power of compounding to effortlessly bridge the gap.',
      action: goals.suggestion
    });
  }

  // If everything is perfect, provide a maintenance priority
  if (priorities.length === 0) {
    priorities.push({
      id: 'priority_maintain',
      rank: 1,
      title: 'Maintain Current Trajectory',
      why: 'Your financial structure is highly optimized with strong reserves, low debt, and aggressive investments.',
      impact: 'Staying the course prevents behavioral mistakes like performance chasing or market timing.',
      action: 'Automate your investments, review your portfolio annually, and ignore short-term market noise.'
    });
  }

  // Re-index ranks
  return priorities.map((p, i) => ({ ...p, rank: i + 1 }));
};
