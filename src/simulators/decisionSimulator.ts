/**
 * Decision Impact Simulator
 * Calculates how specific user decisions will impact their financial future and scores.
 */
import { generateWellnessScores } from '../scoring/wellnessScoring';

export const simulateDecision = (currentProfile, currentInvestments, currentGoals, simulationConfig) => {
  // Create deep copies to mutate for simulation
  const simProfile = JSON.parse(JSON.stringify(currentProfile));
  const simInvestments = JSON.parse(JSON.stringify(currentInvestments));
  const simGoals = JSON.parse(JSON.stringify(currentGoals));

  // Apply simulated changes
  if (simulationConfig.increaseSip) {
    simInvestments.totalSIP += simulationConfig.increaseSip;
  }
  
  if (simulationConfig.reduceExpenses) {
    simProfile.monthlyExpenses = Math.max(0, simProfile.monthlyExpenses - simulationConfig.reduceExpenses);
  }
  
  if (simulationConfig.repayDebt) {
    simProfile.debtEMI = Math.max(0, simProfile.debtEMI - simulationConfig.repayDebt);
  }
  
  if (simulationConfig.boostEmergency) {
    simProfile.emergencyFund += simulationConfig.boostEmergency;
  }

  // Calculate new scores based on simulated data
  const simulatedMetrics = generateWellnessScores(simProfile, simInvestments, simGoals);
  
  return {
    simulatedProfile: simProfile,
    simulatedInvestments: simInvestments,
    simulatedMetrics: simulatedMetrics
  };
};
