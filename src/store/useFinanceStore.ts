import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWellnessScores } from '../scoring/wellnessScoring';
import { generateSmartInsights } from '../insights/insightGenerator';
import { UserProfile, NetWorthEntry, Expense, Budget, Goal } from '../types/finance';

interface FinanceState {
  profile: UserProfile & { debtEMI: number; tax80c: number; insuranceCoverage: number };
  investments: {
    totalSIP: number;
    equity: number;
    debt: number;
  };
  goals: Goal[];
  expenses: Expense[];
  budget: Budget;
  trackingHistory: NetWorthEntry[];
  updateProfile: (newProfile: Partial<FinanceState['profile']>) => void;
  updateInvestments: (newInvestments: Partial<FinanceState['investments']>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: number) => void;
  updateGoal: (id: number, updatedGoal: Partial<Goal>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  uploadExpenses: (newExpenses: Array<Omit<Expense, 'id'>>) => void;
  clearExpenses: () => void;
  updateBudget: (newBudget: Partial<Budget>) => void;
  getWellnessMetrics: () => any;
  getSmartInsights: () => any;
  recordMonthlySnapshot: () => void;
}

const getInitialExpenses = (): Expense[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  return [
    { id: '1', amount: 25000, category: 'rent', date: `${year}-${month}-01`, description: 'Flat Rent Payment' },
    { id: '2', amount: 3200, category: 'food', date: `${year}-${month}-03`, description: 'Swiggy & Zomato Delivery' },
    { id: '3', amount: 2400, category: 'utilities', date: `${year}-${month}-05`, description: 'Electricity & Wifi Bill' },
    { id: '4', amount: 5600, category: 'shopping', date: `${year}-${month}-08`, description: 'Myntra & Amazon Clothes' },
    { id: '5', amount: 649, category: 'subscriptions', date: `${year}-${month}-10`, description: 'Netflix Premium' },
    { id: '6', amount: 1800, category: 'travel', date: `${year}-${month}-12`, description: 'Uber & Fuel Expenses' },
    { id: '7', amount: 1500, category: 'healthcare', date: `${year}-${month}-14`, description: 'Apollo Pharmacy & Consult' },
    { id: '8', amount: 15000, category: 'EMI/debt', date: `${year}-${month}-01`, description: 'HDFC Car Loan EMI' },
    { id: '9', amount: 20000, category: 'investments', date: `${year}-${month}-05`, description: 'Mutual Fund SIP Transfer' },
    { id: '10', amount: 3500, category: 'entertainment', date: `${year}-${month}-15`, description: 'PVR Movie & Dining Out' }
  ];
};

const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      // State
      profile: {
        name: 'Rahul Sharma',
        age: 28, // Used for life-stage intelligence
        monthlyIncome: 150000,
        monthlyExpenses: 60000,
        existingSavings: 500000,
        emergencyFund: 180000, // 3 months
        existingInvestments: 650000,
        currentSIPs: 20000,
        loans: 1500000,
        investmentExperience: 'Intermediate',
        financialGoals: 'Retirement, Wealth Creation',
        investmentHorizon: 'Long Term (7-15 Years)',
        debtEMI: 15000,
        tax80c: 50000,
        insuranceCoverage: 5000000,
      },
      investments: {
        totalSIP: 20000,
        equity: 500000,
        debt: 150000,
      },
      goals: [
        { id: 1, name: 'Retirement Corpus', category: 'retirement', target: 50000000, current: 650000, timelineYears: 20 },
        { id: 2, name: 'Emergency Runway', category: 'emergency', target: 360000, current: 180000, timelineYears: 2 }
      ],
      expenses: getInitialExpenses(),
      budget: {
        needsLimit: 50,
        wantsLimit: 30,
        savingsLimit: 20
      },
      trackingHistory: [
        { date: '2025-11-01T00:00:00.000Z', overallScore: 45, netWorth: 400000, emergencyScore: 30, debtScore: 80, savingsScore: 40, investmentScore: 45 },
        { date: '2025-12-01T00:00:00.000Z', overallScore: 50, netWorth: 450000, emergencyScore: 35, debtScore: 80, savingsScore: 45, investmentScore: 50 },
        { date: '2026-01-01T00:00:00.000Z', overallScore: 58, netWorth: 520000, emergencyScore: 45, debtScore: 80, savingsScore: 55, investmentScore: 55 },
        { date: '2026-02-01T00:00:00.000Z', overallScore: 65, netWorth: 600000, emergencyScore: 50, debtScore: 80, savingsScore: 65, investmentScore: 60 },
        { date: '2026-03-01T00:00:00.000Z', overallScore: 72, netWorth: 710000, emergencyScore: 55, debtScore: 80, savingsScore: 75, investmentScore: 65 },
        { date: '2026-04-01T00:00:00.000Z', overallScore: 78, netWorth: 830000, emergencyScore: 60, debtScore: 80, savingsScore: 80, investmentScore: 70 }
      ], // Array of monthly snapshots

      // Actions
      updateProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

      updateInvestments: (newInvestments) => set((state) => ({
        investments: { ...state.investments, ...newInvestments }
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { id: Date.now(), ...goal }]
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      updateGoal: (id, updatedGoal) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
      })),

      addExpense: (expense) => set((state) => ({
        expenses: [{ id: Date.now().toString(), ...expense }, ...state.expenses]
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      uploadExpenses: (newExpenses) => set((state) => {
        const parsed = newExpenses.map((e, index) => ({
          id: `upload-${Date.now()}-${index}`,
          ...e
        }));
        return { expenses: [...parsed, ...state.expenses] };
      }),

      clearExpenses: () => set({ expenses: [] }),

      updateBudget: (newBudget) => set((state) => ({
        budget: { ...state.budget, ...newBudget }
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
        
        // Find individual scores from metrics.detailedScores
        const emergencyScore = metrics.detailedScores.find((s: any) => s.id === 'emergency')?.score || 50;
        const debtScore = metrics.detailedScores.find((s: any) => s.id === 'debt')?.score || 50;
        const savingsScore = metrics.detailedScores.find((s: any) => s.id === 'savings')?.score || 50;
        const investmentScore = metrics.detailedScores.find((s: any) => s.id === 'investment')?.score || 50;

        const snapshot = {
          date: new Date().toISOString(),
          overallScore: metrics.overallScore,
          emergencyMonths: profile.emergencyFund / (profile.monthlyExpenses || 1),
          savingsRate: ((profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI) / profile.monthlyIncome) * 100,
          debtToIncome: (profile.debtEMI / profile.monthlyIncome) * 100,
          netWorth: investments.equity + investments.debt + profile.emergencyFund - (profile.debtEMI * 12), // Rough estimate
          emergencyScore,
          debtScore,
          savingsScore,
          investmentScore
        };
        
        // Prevent duplicate snapshots for the same month
        const lastSnapshot = trackingHistory[trackingHistory.length - 1];
        if (lastSnapshot && new Date(lastSnapshot.date).getMonth() === new Date().getMonth()) {
          // Overwrite the last snapshot with the current updated values rather than just returning, so it updates in real time!
          set((state) => ({
            trackingHistory: [...state.trackingHistory.slice(0, -1), snapshot]
          }));
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
