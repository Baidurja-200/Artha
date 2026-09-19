import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy load all page routes
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Calculators = lazy(() => import('./pages/Calculators'));
const TaxCalculator = lazy(() => import('./pages/TaxCalculator'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const RiskProfiler = lazy(() => import('./pages/RiskProfiler'));
const MutualFunds = lazy(() => import('./pages/MutualFunds'));
const FundDetail = lazy(() => import('./pages/FundDetail'));
const FinancialHealth = lazy(() => import('./pages/FinancialHealth'));
const CreditHealth = lazy(() => import('./pages/CreditHealth'));
const ChatbotDemo = lazy(() => import('./pages/ChatbotDemo'));
const ExpenseEngine = lazy(() => import('./pages/ExpenseEngine'));
const CashFlowEngine = lazy(() => import('./pages/CashFlowEngine'));
const Budgeting = lazy(() => import('./pages/Budgeting'));
const Insights = lazy(() => import('./pages/Insights'));
const Tracking = lazy(() => import('./pages/Tracking'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/Artha">
        <Layout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/tax-planning" element={<TaxCalculator />} />
              <Route path="/portfolio-analysis" element={<Portfolio />} />
              <Route path="/risk" element={<RiskProfiler />} />
              <Route path="/mutual-funds" element={<MutualFunds />} />
              <Route path="/mutual-funds/:id" element={<FundDetail />} />
              <Route path="/financial-health" element={<FinancialHealth />} />
              <Route path="/credit-health" element={<CreditHealth />} />
              <Route path="/chatbot-demo" element={<ChatbotDemo />} />
              <Route path="/expense-analysis" element={<ExpenseEngine />} />
              <Route path="/cash-flow" element={<CashFlowEngine />} />
              <Route path="/budgeting" element={<Budgeting />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/tracking" element={<Tracking />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

