import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set, get) => ({
      // State
      profile: {
        monthlyIncome: 150000,
        monthlyExpenses: 60000,
        debtEMI: 15000,
        emergencyFund: 180000, // 3 months
      },
      investments: {
        totalSIP: 20000,
        equity: 500000,
        debt: 150000,
      },
      goals: [
        { id: 1, name: 'Retirement', target: 50000000, current: 650000, timelineYears: 20 },
      ],

      // Actions
      updateProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { id: Date.now(), ...goal }]
      })),

      // Derived/Computed Logic (The Engine)
      getWellnessMetrics: () => {
        const { profile } = get();
        
        // 1. Emergency Preparedness Score
        const monthlyExpenses = profile.monthlyExpenses || 1;
        const emergencyMonths = profile.emergencyFund / monthlyExpenses;
        const emergencyScore = Math.min(Math.round((emergencyMonths / 6) * 100), 100);
        
        const emergencyPreparedness = {
          title: "Emergency Preparedness",
          score: emergencyScore,
          why: "Measures your ability to survive sudden income loss or unexpected large expenses without taking on high-interest debt.",
          risk: emergencyMonths < 3 ? "High Risk: A single medical or job emergency could force you into a debt trap." : "Low Risk: You have enough buffer to ride out typical financial shocks.",
          insight: `You currently have ${emergencyMonths.toFixed(1)} months of runway. The gold standard is 6 months.`,
          suggestion: emergencyMonths < 6 ? `Automate a transfer of ₹${Math.round(profile.monthlyIncome * 0.05).toLocaleString('en-IN')} monthly into a liquid fund until you reach ₹${(monthlyExpenses * 6).toLocaleString('en-IN')}.` : "Maintain this balance in a high-yield savings account or liquid mutual fund."
        };

        // 2. Debt Health Score
        const dti = profile.monthlyIncome > 0 ? (profile.debtEMI / profile.monthlyIncome) * 100 : 0;
        const debtScore = Math.max(100 - Math.round(dti * 2), 0); // 50% DTI = 0 score
        
        const debtHealth = {
          title: "Debt Health",
          score: debtScore,
          why: "Evaluates how much of your monthly income is consumed by past borrowing, indicating your freedom to build future wealth.",
          risk: dti > 40 ? "Critical Risk: High debt obligations leave little room for wealth compounding and increase default probability." : "Controlled Risk: Debt is manageable and not eating into your core wealth generation.",
          insight: `Your Debt-to-Income (DTI) ratio is ${Math.round(dti)}%. Ideally, it should be kept below 30%.`,
          suggestion: dti > 30 ? "Implement the debt avalanche method: aggressively pay off high-interest unsecured loans (credit cards, personal loans) first." : "Your debt is under control. Ensure you prepay expensive loans whenever you get an annual bonus."
        };

        // 3. Savings Sustainability Score
        const totalSavings = profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI;
        const savingsRate = profile.monthlyIncome > 0 ? (totalSavings / profile.monthlyIncome) * 100 : 0;
        const savingsScore = Math.min(Math.round((savingsRate / 30) * 100), 100); // 30% is 100 score
        
        const savingsSustainability = {
          title: "Savings Sustainability",
          score: savingsScore,
          why: "Tracks your ability to consistently retain a portion of your income. It is the fundamental fuel for all your investments.",
          risk: savingsRate < 10 ? "Severe Risk: Stagnant wealth creation. Inflation will drastically reduce your future purchasing power." : "Low Risk: You are successfully converting active income into long-term wealth.",
          insight: `You are saving ${Math.round(savingsRate)}% of your income. The 50/30/20 rule dictates a minimum 20% savings rate.`,
          suggestion: savingsRate < 20 ? "Audit your discretionary expenses. Try cutting down subscriptions or dining out by 10% next month." : "Great savings discipline! Consider increasing your SIP allocations proportionately with your annual appraisals."
        };

        // 4. Investment Readiness Score
        const investmentReadinessScore = Math.round((emergencyScore * 0.6) + (debtScore * 0.4));
        
        const investmentReadiness = {
          title: "Investment Readiness",
          score: investmentReadinessScore,
          why: "Determines if your financial foundation is solid enough to expose your money to market volatility.",
          risk: investmentReadinessScore < 50 ? "High Risk: Investing heavily now means you might be forced to withdraw at a loss during an emergency." : "Low Risk: Strong foundation allows you to stay invested long-term without panic selling.",
          insight: investmentReadinessScore < 70 ? "Your foundation needs strengthening before starting aggressive equity SIPs." : "You are structurally ready to deploy capital into high-growth equity markets.",
          suggestion: investmentReadinessScore < 50 ? "Pause new equity investments. Redirect that capital to clear bad debt and build your emergency fund first." : "Start exploring Nifty 50 Index funds or Flexi Cap funds for long-term wealth generation."
        };

        // 5. Overall Financial Wellness Score
        const overallScoreValue = Math.round((emergencyScore + debtScore + savingsScore + investmentReadinessScore) / 4);
        
        const financialWellness = {
          title: "Financial Wellness",
          score: overallScoreValue,
          why: "The ultimate macroeconomic indicator of your personal financial ecosystem.",
          risk: overallScoreValue < 60 ? "Vulnerable: Your finances require immediate restructuring." : "Resilient: You are on a stable path to financial independence.",
          insight: "This is a weighted aggregation of your debt, savings, emergency buffer, and investment readiness.",
          suggestion: "Review this score quarterly. The goal is consistent progress, not immediate perfection."
        };

        return {
          overallScore: overallScoreValue, // Kept for backward compatibility
          detailedScores: [
            financialWellness,
            investmentReadiness,
            emergencyPreparedness,
            debtHealth,
            savingsSustainability
          ]
        };
      },

      getSmartInsights: () => {
        const metrics = get().getWellnessMetrics();
        const { investments, profile } = get();
        const insights = [];

        if (metrics.overallScore > 80) {
          insights.push({ id: 1, type: 'success', title: 'Strong Financial Position', text: "Your overall financial health is exceptional. You are perfectly positioned for aggressive wealth compounding." });
        } else if (metrics.overallScore < 50) {
          insights.push({ id: 2, type: 'warning', title: 'Attention Needed', text: "Your financial wellness needs attention. Focus on building an emergency corpus and reducing debt before investing in equity." });
        }

        if (metrics.detailedScores[2].score < 50) {
          insights.push({ id: 3, type: 'critical', title: 'Low Emergency Reserve', text: metrics.detailedScores[2].insight });
        }

        if (investments.totalSIP < (profile.monthlyIncome * 0.1)) {
          insights.push({ id: 4, type: 'warning', title: 'Sub-optimal Investing', text: "You are allocating less than 10% of your income to long-term SIPs. Consider stepping this up to combat inflation." });
        } else {
          insights.push({ id: 5, type: 'success', title: 'Excellent SIP Discipline', text: "Your SIP contributions are well above average. Consistency is the key to compounding." });
        }

        return insights;
      }
    }),
    {
      name: 'artha-finance-memory', // LocalStorage persistence
    }
  )
);

export default useFinanceStore;
