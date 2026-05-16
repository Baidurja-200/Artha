/**
 * Financial Momentum Tracker
 * Tracks velocity of improvement, generating momentum indicators.
 */

export const analyzeMomentum = (history) => {
  if (!history || history.length < 2) {
    return {
      hasMomentum: false,
      insight: "Keep tracking your finances monthly to unlock momentum insights."
    };
  }

  // Look at last 3 to 6 months
  const recentHistory = history.slice(-6);
  const oldest = recentHistory[0];
  const newest = recentHistory[recentHistory.length - 1];

  const scoreDiff = newest.overallScore - oldest.overallScore;
  const netWorthDiff = newest.netWorth - oldest.netWorth;
  
  let insight = "";
  let velocityCategory = "Stable";

  if (scoreDiff > 10) {
    velocityCategory = "High Momentum";
    insight = `Your financial health is accelerating! Your wellness score improved by ${scoreDiff} points over the last few months. This rapid velocity indicates highly effective debt reduction and savings discipline.`;
  } else if (scoreDiff > 0) {
    velocityCategory = "Positive Momentum";
    insight = `Your financial health improved steadily by ${scoreDiff} points recently. Consistency is key, and you are building a solid foundation.`;
  } else if (scoreDiff < -10) {
    velocityCategory = "Negative Momentum";
    insight = `Your wellness score dropped by ${Math.abs(scoreDiff)} points recently. Review your recent expenses or debt additions to correct the trajectory before it impacts your long-term compounding.`;
  } else {
    velocityCategory = "Stable";
    insight = "Your financial health has remained relatively stable recently. To break out into higher growth, consider optimizing your tax-saving strategies or stepping up your SIPs.";
  }

  return {
    hasMomentum: true,
    velocityCategory,
    scoreDiff,
    netWorthDiff,
    insight
  };
};
