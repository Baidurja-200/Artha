import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWellnessScores } from '../scoring/wellnessScoring';
import { generateSmartInsights } from '../insights/insightGenerator';

const useFinanceStore = create(
  persist(
    (set, get) => ({
      // State
      profile: {
        age: 28, // Used for life-stage intelligence
        monthlyIncome: 150000,
        monthlyExpenses: 60000,
        debtEMI: 15000,
        emergencyFund: 180000, // 3 months
        tax80c: 50000,
        insuranceCoverage: 5000000,
      },
      investments: {
        totalSIP: 20000,
        equity: 500000,
        debt: 150000,
      },
      goals: [
        { id: 1, name: 'Retirement', target: 50000000, current: 650000, timelineYears: 20 },
      ],
      trackingHistory: [
        { date: '2025-11-01T00:00:00.000Z', overallScore: 45, netWorth: 400000 },
        { date: '2025-12-01T00:00:00.000Z', overallScore: 50, netWorth: 450000 },
        { date: '2026-01-01T00:00:00.000Z', overallScore: 58, netWorth: 520000 },
        { date: '2026-02-01T00:00:00.000Z', overallScore: 65, netWorth: 600000 },
        { date: '2026-03-01T00:00:00.000Z', overallScore: 72, netWorth: 710000 },
        { date: '2026-04-01T00:00:00.000Z', overallScore: 78, netWorth: 830000 }
      ], // Array of monthly snapshots

      // Actions
      updateProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { id: Date.now(), ...goal }]
      })),

      // Derived/Computed Logic (The Engine)
      getWellnessMetrics: () => {
        const { profile, investments, goals } = get();
        return generateWellnessScores(profile, investments, goals);
      },

      getSmartInsights: () => {
        const metrics = get().getWellnessMetrics();
        const { profile, investments } = get();
        return generateSmartInsights(metrics, profile, investments);
      },

      recordMonthlySnapshot: () => {
        const { profile, investments, getWellnessMetrics, trackingHistory } = get();
        const metrics = getWellnessMetrics();
        const snapshot = {
          date: new Date().toISOString(),
          overallScore: metrics.overallScore,
          emergencyMonths: profile.emergencyFund / (profile.monthlyExpenses || 1),
          savingsRate: ((profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI) / profile.monthlyIncome) * 100,
          debtToIncome: (profile.debtEMI / profile.monthlyIncome) * 100,
          netWorth: investments.equity + investments.debt + profile.emergencyFund - (profile.debtEMI * 12) // Rough estimate
        };
        
        // Prevent duplicate snapshots for the same month
        const lastSnapshot = trackingHistory[trackingHistory.length - 1];
        if (lastSnapshot && new Date(lastSnapshot.date).getMonth() === new Date().getMonth()) {
          return; 
        }

        set((state) => ({
          trackingHistory: [...state.trackingHistory, snapshot]
        }));
      }
    }),
    {
      name: 'artha-finance-memory', // LocalStorage persistence
    }
  )
);

export default useFinanceStore;
