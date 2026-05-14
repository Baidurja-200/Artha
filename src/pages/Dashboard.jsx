import React from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import WellnessScore from '../components/dashboard/WellnessScore';
import MarketOverview from '../components/dashboard/MarketOverview';
import FinanceNews from '../components/dashboard/FinanceNews';
import AIStockAdvisor from '../components/dashboard/AIStockAdvisor';
import { Wallet, PiggyBank, Target, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [profileData] = useLocalStorage('artha_user_profile', null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (!profileData) {
    return (
      <div className="container mx-auto px-6 max-w-7xl py-20 text-center">
        <h2 className="heading-2 mb-6">Welcome to Artha</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
          To provide you with personalized insights, we need to understand your current financial standing.
        </p>
        <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
          Complete Profile Setup <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const netWorth = profileData.existingSavings + profileData.existingInvestments + profileData.emergencyFund - profileData.loans;

  return (
    <div className="container mx-auto px-6 max-w-7xl py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-2">Hello, {profileData.name.split(' ')[0] || 'Investor'}</h1>
          <p className="text-gray-400">Here is your wealth overview for today.</p>
        </div>
        <Link to="/profile" className="text-gold-400 hover:text-gold-300 text-sm font-medium border border-gold-500/30 px-4 py-2 rounded-lg bg-gold-500/5 hover:bg-gold-500/10 transition-colors">
          Edit Profile
        </Link>
      </div>

      {/* Wellness Score Section */}
      <section>
        <WellnessScore profileData={profileData} />
      </section>

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="text-gold-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Estimated Net Worth</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(netWorth)}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Total Investments</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(profileData.existingInvestments + profileData.existingSavings)}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <Target className="text-green-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Monthly SIPs</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(profileData.currentSIPs)}</h3>
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
