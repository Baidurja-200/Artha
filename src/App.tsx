import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Calculators from './pages/Calculators';
import TaxCalculator from './pages/TaxCalculator';
import Portfolio from './pages/Portfolio';
import RiskProfiler from './pages/RiskProfiler';
import MutualFunds from './pages/MutualFunds';
import FundDetail from './pages/FundDetail';
import FinancialHealth from './pages/FinancialHealth';
import CreditHealth from './pages/CreditHealth';
import ExpenseEngine from './pages/ExpenseEngine';
import CashFlowEngine from './pages/CashFlowEngine';
import Budgeting from './pages/Budgeting';
import Insights from './pages/Insights';
import Tracking from './pages/Tracking';

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
          <Route path="/expense-analysis" element={<ExpenseEngine />} />
          <Route path="/cash-flow" element={<CashFlowEngine />} />
          <Route path="/budgeting" element={<Budgeting />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/tracking" element={<Tracking />} />
        </Routes>
      </Layout>
    </Router>
    </QueryClientProvider>
  );
}

export default App;

