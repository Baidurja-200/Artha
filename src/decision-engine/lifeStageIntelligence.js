/**
 * Life-Stage Intelligence Layer
 * Adjusts recommendations and expectations based on the user's age and life stage.
 */

export const determineLifeStage = (age) => {
  if (age < 30) return 'Young Professional';
  if (age < 50) return 'Mid-Career';
  return 'Pre-Retirement';
};

export const getLifeStageFocus = (age) => {
  const stage = determineLifeStage(age);
  
  if (stage === 'Young Professional') {
    return {
      stage,
      primaryFocus: ['Emergency Fund', 'SIP Discipline', 'Insurance Awareness'],
      explanation: "In your 20s, the priority is building an unbreakable safety net and establishing a high savings rate early to maximize compounding over the next three decades."
    };
  }
  
  if (stage === 'Mid-Career') {
    return {
      stage,
      primaryFocus: ['Tax Optimization', 'Family Protection', 'Long-term Wealth Creation'],
      explanation: "During peak earning years, preventing lifestyle creep and aggressively maximizing 80C/NPS tax benefits is critical to accelerate your transition to financial independence."
    };
  }

  return {
    stage,
    primaryFocus: ['Risk Reduction', 'Capital Preservation', 'Retirement Readiness'],
    explanation: "As retirement approaches, capital preservation takes precedence over aggressive growth. Focus on shifting highly volatile equity into safer, income-generating debt instruments."
  };
};
