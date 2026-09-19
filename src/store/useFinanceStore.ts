import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateWellnessScores } from '../scoring/wellnessScoring';
import { generateSmartInsights } from '../insights/insightGenerator';
import { UserProfile, NetWorthEntry, Expense, Budget, Goal, CreditCard, CreditEMI, CreditRepayment } from '../types/finance';

// New Modular Engines
import { analyzeStabilityAndStress, StabilityMetrics } from '../financial-health/stabilityEngine';
import { generateCashFlowForecast, CashFlowForecast } from '../forecast-engine/forecaster';
import { analyzeFinancialBehavior, BehaviorAnalysis } from '../behavior-engine/behaviorAnalyzer';
import { generatePersonalizedPriorities, DynamicPriority } from '../priority-engine/personalization';
import { analyzeTransactions, TransactionObservation } from '../transaction-engine/analyzer';
import { calculateFinancialMomentum, generateExplainableInsights, MomentumMetrics, ReusableInsight } from '../insights/explainableInsights';


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
  
  // Credit state variables
  creditCards: CreditCard[];
  creditEMIs: CreditEMI[];
  creditRepayments: CreditRepayment[];
  
  // Credit Actions
  addCreditCard: (card: Omit<CreditCard, 'id' | 'rewardEarned'>) => void;
  deleteCreditCard: (id: string) => void;
  updateCreditCard: (id: string, updatedCard: Partial<CreditCard>) => void;
  addCreditEMI: (emi: Omit<CreditEMI, 'id'>) => void;
  deleteCreditEMI: (id: string) => void;
  addCreditRepayment: (repayment: Omit<CreditRepayment, 'id'>) => void;
  updateCreditRepayment: (id: string, updatedRepayment: Partial<CreditRepayment>) => void;

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
  getStabilityMetrics: () => StabilityMetrics;
  getCashFlowForecast: (projectionMonths?: number) => CashFlowForecast;
  getBehaviorAnalysis: () => BehaviorAnalysis;
  getPersonalizedPriorities: () => DynamicPriority[];
  getTransactionObservations: () => TransactionObservation[];
  getFinancialMomentum: () => MomentumMetrics;
  getExplainableInsights: () => ReusableInsight[];
  recordMonthlySnapshot: () => void;
}

const getInitialExpenses = (): Expense[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  return [
    { id: '1', amount: 25000, category: 'rent', date: `${year}-${month}-01`, description: 'Flat Rent Payment', paymentMethod: 'bank' },
    { id: '2', amount: 3200, category: 'food', date: `${year}-${month}-03`, description: 'Swiggy & Zomato Delivery', paymentMethod: 'credit-card', cardId: 'card-2' },
    { id: '3', amount: 2400, category: 'utilities', date: `${year}-${month}-05`, description: 'Electricity & Wifi Bill', paymentMethod: 'bank' },
    { id: '4', amount: 5600, category: 'shopping', date: `${year}-${month}-08`, description: 'Myntra & Amazon Clothes', paymentMethod: 'credit-card', cardId: 'card-3' },
    { id: '5', amount: 649, category: 'subscriptions', date: `${year}-${month}-10`, description: 'Netflix Premium', paymentMethod: 'credit-card', cardId: 'card-1' },
    { id: '6', amount: 1800, category: 'travel', date: `${year}-${month}-12`, description: 'Uber & Fuel Expenses', paymentMethod: 'credit-card', cardId: 'card-3' },
    { id: '7', amount: 1500, category: 'healthcare', date: `${year}-${month}-14`, description: 'Apollo Pharmacy & Consult', paymentMethod: 'cash' },
    { id: '8', amount: 15000, category: 'EMI/debt', date: `${year}-${month}-01`, description: 'HDFC Car Loan EMI', paymentMethod: 'bank' },
    { id: '9', amount: 20000, category: 'investments', date: `${year}-${month}-05`, description: 'Mutual Fund SIP Transfer', paymentMethod: 'bank' },
    { id: '10', amount: 3500, category: 'entertainment', date: `${year}-${month}-15`, description: 'PVR Movie & Dining Out', paymentMethod: 'credit-card', cardId: 'card-1' }
  ];
};

// Referential cache structure to avoid redundant calculations on identical state
const memoCache: Record<string, {
  deps: any[];
  val: any;
}> = {};

const memoize = <T>(key: string, deps: any[], fn: () => T): T => {
  const cached = memoCache[key];
  if (
    cached &&
    cached.deps.length === deps.length &&
    cached.deps.every((d, i) => d === deps[i])
  ) {
    return cached.val;
  }
  const val = fn();
  memoCache[key] = { deps, val };
  return val;
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

      creditCards: [
        {
          id: 'card-1',
          name: 'Regalia Gold',
          bank: 'HDFC Bank',
          limit: 500000,
          currentBalance: 42000,
          dueDate: '20',
          statementDate: '05',
          rewardType: 'points',
          rewardRate: 2.6,
          rewardEarned: 12400,
          cardType: 'visa'
        },
        {
          id: 'card-2',
          name: 'Amazon Pay Card',
          bank: 'ICICI Bank',
          limit: 300000,
          currentBalance: 15000,
          dueDate: '15',
          statementDate: '25',
          rewardType: 'cashback',
          rewardRate: 2.0,
          rewardEarned: 8500,
          cardType: 'visa'
        },
        {
          id: 'card-3',
          name: 'OneCard',
          bank: 'SBI Cards',
          limit: 150000,
          currentBalance: 35000,
          dueDate: '02',
          statementDate: '18',
          rewardType: 'points',
          rewardRate: 1.0,
          rewardEarned: 3200,
          cardType: 'visa'
        }
      ],

      creditEMIs: [
        {
          id: 'emi-1',
          cardId: 'card-1',
          description: 'MacBook Pro Purchase',
          monthlyAmount: 8500,
          remainingMonths: 6,
          totalAmount: 51000
        },
        {
          id: 'emi-2',
          cardId: 'card-3',
          description: 'iPhone 15 Pro Max',
          monthlyAmount: 6200,
          remainingMonths: 4,
          totalAmount: 24800
        }
      ],

      creditRepayments: [
        { id: 'rep-1', cardId: 'card-1', billingMonth: '2026-01', amountDue: 35000, amountPaid: 35000, paidDate: '2026-01-18', status: 'ontime' },
        { id: 'rep-2', cardId: 'card-2', billingMonth: '2026-01', amountDue: 12000, amountPaid: 12000, paidDate: '2026-01-14', status: 'ontime' },
        { id: 'rep-3', cardId: 'card-3', billingMonth: '2026-01', amountDue: 25000, amountPaid: 25000, paidDate: '2026-01-01', status: 'ontime' },
        
        { id: 'rep-4', cardId: 'card-1', billingMonth: '2026-02', amountDue: 40000, amountPaid: 40000, paidDate: '2026-02-18', status: 'ontime' },
        { id: 'rep-5', cardId: 'card-2', billingMonth: '2026-02', amountDue: 18000, amountPaid: 18000, paidDate: '2026-02-13', status: 'ontime' },
        { id: 'rep-6', cardId: 'card-3', billingMonth: '2026-02', amountDue: 28000, amountPaid: 28000, paidDate: '2026-02-02', status: 'ontime' },
        
        { id: 'rep-7', cardId: 'card-1', billingMonth: '2026-03', amountDue: 45000, amountPaid: 45000, paidDate: '2026-03-19', status: 'ontime' },
        { id: 'rep-8', cardId: 'card-2', billingMonth: '2026-03', amountDue: 14000, amountPaid: 14000, paidDate: '2026-03-12', status: 'ontime' },
        { id: 'rep-9', cardId: 'card-3', billingMonth: '2026-03', amountDue: 32000, amountPaid: 15000, paidDate: '2026-03-02', status: 'partial' },
        
        { id: 'rep-10', cardId: 'card-1', billingMonth: '2026-04', amountDue: 30000, amountPaid: 30000, paidDate: '2026-04-18', status: 'ontime' },
        { id: 'rep-11', cardId: 'card-2', billingMonth: '2026-04', amountDue: 11000, amountPaid: 11000, paidDate: '2026-04-14', status: 'ontime' },
        { id: 'rep-12', cardId: 'card-3', billingMonth: '2026-04', amountDue: 35000, amountPaid: 35000, paidDate: '2026-04-01', status: 'ontime' }
      ],

      // Actions
      addCreditCard: (card) => set((state) => ({
        creditCards: [...state.creditCards, { ...card, id: `card-${Date.now()}`, rewardEarned: 0 }]
      })),

      deleteCreditCard: (id) => set((state) => ({
        creditCards: state.creditCards.filter(c => c.id !== id),
        creditEMIs: state.creditEMIs.filter(e => e.cardId !== id),
        creditRepayments: state.creditRepayments.filter(r => r.cardId !== id)
      })),

      updateCreditCard: (id, updatedCard) => set((state) => ({
        creditCards: state.creditCards.map(c => c.id === id ? { ...c, ...updatedCard } : c)
      })),

      addCreditEMI: (emi) => set((state) => ({
        creditEMIs: [...state.creditEMIs, { ...emi, id: `emi-${Date.now()}` }]
      })),

      deleteCreditEMI: (id) => set((state) => ({
        creditEMIs: state.creditEMIs.filter(e => e.id !== id)
      })),

      addCreditRepayment: (repayment) => set((state) => {
        const id = `rep-${Date.now()}`;
        const updatedCards = state.creditCards.map(c => {
          if (c.id === repayment.cardId) {
            const newBal = Math.max(0, c.currentBalance - repayment.amountPaid);
            const addedRewards = Math.round(repayment.amountPaid * (c.rewardRate / 100));
            return {
              ...c,
              currentBalance: newBal,
              rewardEarned: c.rewardEarned + addedRewards
            };
          }
          return c;
        });

        const card = state.creditCards.find(c => c.id === repayment.cardId);
        const cardName = card ? card.name : 'Credit Card';
        const newExpense: Expense = {
          id: `exp-rep-${Date.now()}`,
          amount: repayment.amountPaid,
          category: 'EMI/debt',
          date: repayment.paidDate || new Date().toISOString().split('T')[0],
          description: `Repayment: ${cardName} (${repayment.billingMonth})`,
          paymentMethod: 'bank'
        };

        return {
          creditRepayments: [...state.creditRepayments, { ...repayment, id }],
          creditCards: updatedCards,
          expenses: [newExpense, ...state.expenses]
        };
      }),

      updateCreditRepayment: (id, updatedRepayment) => set((state) => ({
        creditRepayments: state.creditRepayments.map(r => r.id === id ? { ...r, ...updatedRepayment } : r)
      })),

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
        return memoize('wellnessMetrics', [profile, investments, goals], () =>
          generateWellnessScores(profile, investments, goals)
        );
      },

      getSmartInsights: () => {
        const { profile, investments, goals } = get();
        const metrics = get().getWellnessMetrics();
        return memoize('smartInsights', [profile, investments, goals, metrics], () =>
          generateSmartInsights(metrics, profile, investments)
        );
      },

      getStabilityMetrics: () => {
        const { profile, investments, expenses } = get();
        return memoize('stabilityMetrics', [profile, investments, expenses], () =>
          analyzeStabilityAndStress(profile, investments, expenses)
        );
      },

      getCashFlowForecast: (projectionMonths = 6) => {
        const { profile, investments, expenses } = get();
        return memoize(`cashFlowForecast-${projectionMonths}`, [profile, investments, expenses, projectionMonths], () =>
          generateCashFlowForecast(profile, investments, expenses, projectionMonths)
        );
      },

      getBehaviorAnalysis: () => {
        const { profile, investments, expenses, trackingHistory, budget } = get();
        return memoize('behaviorAnalysis', [profile, investments, expenses, trackingHistory, budget], () =>
          analyzeFinancialBehavior(profile, investments, expenses, trackingHistory, budget)
        );
      },

      getPersonalizedPriorities: () => {
        const { profile, investments, goals, expenses } = get();
        const stability = get().getStabilityMetrics();
        const behavior = get().getBehaviorAnalysis();
        const forecast = get().getCashFlowForecast();
        return memoize('personalizedPriorities', [profile, investments, goals, expenses, stability, behavior, forecast], () =>
          generatePersonalizedPriorities(profile, investments, goals, expenses, stability, behavior, forecast)
        );
      },

      getTransactionObservations: () => {
        const { expenses, profile } = get();
        return memoize('transactionObservations', [expenses, profile], () =>
          analyzeTransactions(expenses, profile)
        );
      },

      getFinancialMomentum: () => {
        const { profile, investments, trackingHistory } = get();
        return memoize('financialMomentum', [profile, investments, trackingHistory], () =>
          calculateFinancialMomentum(profile, investments, trackingHistory)
        );
      },

      getExplainableInsights: () => {
        const { profile, investments, goals, expenses } = get();
        return memoize('explainableInsights', [profile, investments, goals, expenses], () =>
          generateExplainableInsights(profile, investments, goals, expenses)
        );
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
