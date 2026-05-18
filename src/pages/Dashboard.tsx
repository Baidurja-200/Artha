import React from 'react';
import { Link } from 'react-router-dom';
import useFinanceStore from '../store/useFinanceStore';
import WellnessScore from '../components/dashboard/WellnessScore';
import FinancialTimeline from '../components/dashboard/FinancialTimeline';
import PriorityStack from '../components/dashboard/PriorityStack';
import DecisionSimulator from '../components/dashboard/DecisionSimulator';
import MarketOverview from '../components/dashboard/MarketOverview';
import FinanceNews from '../components/dashboard/FinanceNews';
import AIStockAdvisor from '../components/dashboard/AIStockAdvisor';
import SEO from '../components/common/SEO';
import { Wallet, PiggyBank, Target, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { profile, investments } = useFinanceStore();
  const netWorth = (investments.equity + investments.debt + profile.emergencyFund) - profile.debtEMI;

  // Machine-readable summary for future AI assistants
  const aiMachineDashboardProfile = {
    netWorth,
    totalInvestments: investments.equity + investments.debt,
    monthlySIPs: investments.totalSIP
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-7xl py-10 space-y-10"
      role="main"
      data-dashboard-profile={JSON.stringify(aiMachineDashboardProfile)}
    >
      <SEO 
        title="Dashboard"
        description="Your luxury wealth operating system. Track your estimated Indian net worth, review mutual fund investments, evaluate personal finance wellness index, and analyze active SIPs."
        keywords="wealth management dashboard, personal finance Indian investor, estimated net worth, automated budgeting"
      />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-2">Hello, Investor</h1>
          <p className="text-gray-400">Here is your wealth overview for today.</p>
        </div>
        <Link 
          to="/profile" 
          className="text-gold-400 hover:text-gold-300 text-sm font-medium border border-gold-500/30 px-4 py-2 rounded-lg bg-gold-500/5 hover:bg-gold-500/10 transition-colors"
          aria-label="Edit your investor profile settings"
        >
          Edit Profile
        </Link>
      </header>

      {/* Wellness Score & Timeline Section */}
      <section className="space-y-6" aria-label="Financial Wellness Diagnostics">
        <WellnessScore />
        <FinancialTimeline />
      </section>

      {/* Decision Engine Section */}
      <section className="space-y-6 pt-6 border-t border-white/5" aria-label="Calm Decision Intelligence">
        <PriorityStack />
        <DecisionSimulator />
      </section>

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Key Wealth Indices">
        <article className="glass-card p-6 flex items-start gap-4" aria-label="Estimated Net Worth metric">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Wallet className="text-gold-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm text-gray-400 font-medium mb-1">Estimated Net Worth</h2>
            <p className="text-2xl font-bold text-white">₹ {netWorth.toLocaleString('en-IN')}</p>
          </div>
        </article>

        <article className="glass-card p-6 flex items-start gap-4" aria-label="Total Investments metric">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <PiggyBank className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm text-gray-400 font-medium mb-1">Total Investments</h2>
            <p className="text-2xl font-bold text-white">₹ {(investments.equity + investments.debt).toLocaleString('en-IN')}</p>
          </div>
        </article>

        <article className="glass-card p-6 flex items-start gap-4" aria-label="Monthly SIPs metric">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Target className="text-green-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm text-gray-400 font-medium mb-1">Monthly SIPs</h2>
            <p className="text-2xl font-bold text-white">₹ {investments.totalSIP.toLocaleString('en-IN')}</p>
          </div>
        </article>
      </section>

      {/* Market Overview */}
      <section className="pt-6 border-t border-white/5" aria-label="Indian Market Indexes">
        <MarketOverview />
      </section>

      {/* News & AI Advisor */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5" aria-label="Curated Intelligence & Insights">
        <div className="lg:col-span-2">
          <FinanceNews />
        </div>
        <div>
          <AIStockAdvisor />
        </div>
      </section>

      {/* Financial Intelligence Suite */}
      <section className="pt-6 border-t border-white/5" aria-label="Financial Intelligence Modules">
        <h2 className="heading-3 mb-6">Financial Intelligence Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/financial-health" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Health Engine to stress-test your finance scores"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Health Engine</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Diagnostic score dials with real-time reactive parameter stress-testing.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Analyze Health <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            to="/expense-analysis" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Expense Engine to upload statements or log items"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Expense Engine</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Manual ledger logger and automatic rule-based bank CSV sheet parser.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Track Spending <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            to="/cash-flow" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Cash Flow Analyzer to check runway breathing room"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Cash Flow Analyzer</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Evaluate recurring living, debt, and SIP outflows vs active inflows.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Verify Runway <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            to="/budgeting" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Budget Assistant to plan 50/30/20 framework"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Budget Assistant</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Interactive 50/30/20 rule allocation targets and automated progress trackers.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Configure Budgets <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            to="/insights" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Decision Insights to read monthly briefing priorities"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Decision Insights</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Ranked priority stack, supportive stress gauges, and monthly briefings.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Read Briefings <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link 
            to="/tracking" 
            className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40"
            aria-label="Open Progress Tracking to check net worth history"
          >
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Progress Tracking</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Review historical monthly snapshots and metrics comparison tables.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Check History <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pt-6 border-t border-white/5" aria-label="SIP and Tax Calculators">
        <h2 className="heading-3 mb-6">Quick Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/calculators" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">SIP Calculator</span>
          </Link>
          <Link to="/tax-planning" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Tax Planner</span>
          </Link>
          <Link to="/portfolio-analysis" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Portfolio Analysis</span>
          </Link>
          <Link to="/risk" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Risk Profiler</span>
          </Link>
        </div>
      </section>
      
    </main>
  );
};

export default Dashboard;
