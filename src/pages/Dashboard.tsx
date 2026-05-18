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
import { Wallet, PiggyBank, Target, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { profile, investments } = useFinanceStore();
  const netWorth = (investments.equity + investments.debt + profile.emergencyFund) - profile.debtEMI;


  return (
    <div className="container mx-auto px-6 max-w-7xl py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-2">Hello, Investor</h1>
          <p className="text-gray-400">Here is your wealth overview for today.</p>
        </div>
        <Link to="/profile" className="text-gold-400 hover:text-gold-300 text-sm font-medium border border-gold-500/30 px-4 py-2 rounded-lg bg-gold-500/5 hover:bg-gold-500/10 transition-colors">
          Edit Profile
        </Link>
      </div>

      {/* Wellness Score & Timeline Section */}
      <section className="space-y-6">
        <WellnessScore />
        <FinancialTimeline />
      </section>

      {/* Decision Engine Section */}
      <section className="space-y-6 pt-6 border-t border-white/5">
        <PriorityStack />
        <DecisionSimulator />
      </section>

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="text-gold-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Estimated Net Worth</p>
            <h3 className="text-2xl font-bold text-white">₹ {netWorth.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Total Investments</p>
            <h3 className="text-2xl font-bold text-white">₹ {(investments.equity + investments.debt).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Target className="text-green-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Monthly SIPs</p>
            <h3 className="text-2xl font-bold text-white">₹ {investments.totalSIP.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="pt-6 border-t border-white/5">
        <MarketOverview />
      </section>

      {/* News & AI Advisor */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
        <div className="lg:col-span-2">
          <FinanceNews />
        </div>
        <div>
          <AIStockAdvisor />
        </div>
      </section>

      {/* Financial Intelligence Suite */}
      <section className="pt-6 border-t border-white/5">
        <h2 className="heading-3 mb-6">Financial Intelligence Suite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/financial-health" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Health Engine</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Diagnostic score dials with real-time reactive parameter stress-testing.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Analyze Health <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/expense-engine" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Expense Engine</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Manual ledger logger and automatic rule-based bank CSV sheet parser.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Track Spending <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/cashflow-engine" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Cash Flow Analyzer</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Evaluate recurring living, debt, and SIP outflows vs active inflows.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Verify Runway <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/budgeting" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Budget Assistant</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Interactive 50/30/20 rule allocation targets and automated progress trackers.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Configure Budgets <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/insights" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Decision Insights</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Ranked priority stack, supportive stress gauges, and monthly briefings.
              </p>
            </div>
            <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
              Read Briefings <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link to="/tracking" className="glass-card p-6 hover:bg-dark-800/80 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col justify-between h-40">
            <div>
              <h4 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">Progress Tracking</h4>
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
      <section className="pt-6 border-t border-white/5">
        <h2 className="heading-3 mb-6">Quick Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/calculators" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">SIP Calculator</span>
          </Link>
          <Link to="/tax" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Tax Planner</span>
          </Link>
          <Link to="/portfolio" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Portfolio Analysis</span>
          </Link>
          <Link to="/risk" className="glass-card p-4 hover:bg-dark-800/80 transition-colors text-center group">
            <span className="block text-gray-300 font-medium group-hover:text-gold-400 transition-colors">Risk Profiler</span>
          </Link>
        </div>
      </section>
      
    </div>
  );
};

export default Dashboard;

