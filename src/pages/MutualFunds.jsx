import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Compass, Calculator, Target, BarChart2 } from 'lucide-react';
import { useMutualFunds } from '../hooks/useMutualFunds';
import FundCard from '../components/mutualfunds/FundCard';
import SIPSimulator from '../components/mutualfunds/SIPSimulator';
import GoalSuggestions from '../components/mutualfunds/GoalSuggestions';
import ELSSModule from '../components/mutualfunds/ELSSModule';
import FundCompare from '../components/mutualfunds/FundCompare';
import OverlapAnalyzer from '../components/mutualfunds/OverlapAnalyzer';

const CATEGORIES = ['All', 'Index Funds', 'Flexi Cap', 'Large Cap', 'Mid Cap', 'Small Cap', 'ELSS', 'Debt Funds'];
const RISKS = ['All', 'Low', 'Moderate', 'High', 'Very High'];
const TABS = [
  { id: 'explorer', label: 'Fund Explorer', icon: <Compass size={18} /> },
  { id: 'sip', label: 'SIP Simulator', icon: <Calculator size={18} /> },
  { id: 'goals', label: 'Goals & Tax', icon: <Target size={18} /> },
  { id: 'analytics', label: 'Analytics Tools', icon: <BarChart2 size={18} /> },
];

const MutualFunds = () => {
  const { searchFunds, getTopFunds, loading } = useMutualFunds();
  const [activeTab, setActiveTab] = useState('explorer');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeRisk, setActiveRisk] = useState('All');
  
  const [searchResults, setSearchResults] = useState([]);
  const [topFunds, setTopFunds] = useState({ 
    indexFunds: [], flexiCap: [], largeCap: [], midCap: [], smallCap: [], taxSaving: [], debtFunds: [] 
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchTop = async () => {
      const data = await getTopFunds();
      if (data) setTopFunds(data);
    };
    fetchTop();
  }, [getTopFunds]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchFunds(searchQuery);
        setSearchResults(results);
      } else {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchFunds]);

  const filterResults = (funds) => {
    if (!funds) return [];
    return funds.filter(fund => {
      const matchCategory = activeCategory === 'All' || fund.category === activeCategory;
      const matchRisk = activeRisk === 'All' || fund.risk === activeRisk;
      return matchCategory && matchRisk;
    });
  };

  const filteredSearchResults = filterResults(searchResults);

  const renderFundSection = (title, description, data) => {
    const filtered = filterResults(data);
    if (!filtered || filtered.length === 0) return null;
    return (
      <section>
        <div className="mb-6">
          <h2 className="heading-3 mb-1">{title}</h2>
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(fund => <FundCard key={fund.schemeCode} fund={fund} />)}
        </div>
      </section>
    );
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="heading-2">Mutual Fund Intelligence</h1>
        <p className="text-gray-400 text-lg">
          Research, compare, and simulate mutual funds to build a historically resilient, goal-oriented portfolio.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-gold-400 border-gold-400 bg-gold-400/5' 
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      
      {/* 1. EXPLORER TAB */}
      {activeTab === 'explorer' && (
        <div className="space-y-12 animate-fade-in">
          {/* Search Area */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search funds by name (e.g. Parag Parikh, SBI Nifty)" 
              className="w-full bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold-500/50 shadow-glass transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex items-center gap-2 text-gray-400 font-medium whitespace-nowrap">
                <Filter size={18} /> Filters:
              </div>
              
              <div className="flex-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                <div className="flex gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                        activeCategory === cat ? 'bg-gold-500 text-dark-900 font-semibold' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <select 
                  className="bg-dark-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none border border-transparent focus:border-gold-500/30"
                  value={activeRisk}
                  onChange={(e) => setActiveRisk(e.target.value)}
                >
                  {RISKS.map(r => <option key={r} value={r}>{r === 'All' ? 'Any Risk' : `${r} Risk`}</option>)}
                </select>
              </div>
            </div>
          </div>

          {isSearching ? (
            <section>
              <h2 className="heading-3 mb-6">Search Results</h2>
              {loading ? (
                <div className="text-center text-gold-400 py-10">Searching the database...</div>
              ) : filteredSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredSearchResults.map(fund => <FundCard key={fund.schemeCode} fund={fund} />)}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10 glass-card">No funds found matching your criteria.</div>
              )}
            </section>
          ) : (
            <div className="space-y-12">
              {renderFundSection('Index Funds', 'Popular long-term category tracking broad markets.', topFunds.indexFunds)}
              {renderFundSection('Flexi Cap', 'Dynamic allocation across large, mid, and small caps.', topFunds.flexiCap)}
              {renderFundSection('Large Cap', 'Invests in top 100 blue-chip companies for stable growth.', topFunds.largeCap)}
              {renderFundSection('Mid & Small Cap', 'High growth potential for aggressive risk appetite.', [...(topFunds.midCap || []), ...(topFunds.smallCap || [])])}
              {renderFundSection('Tax Saving (ELSS)', 'Performers that offer Section 80C tax benefits (3-year lock-in).', topFunds.taxSaving)}
              {renderFundSection('Debt & Liquid', 'Low volatility for capital preservation.', topFunds.debtFunds)}
            </div>
          )}

          <section className="border-t border-white/5 pt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-blue-500/10"><BookOpen className="text-blue-400 w-6 h-6" /></div>
              <h2 className="heading-3">Market Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <h4 className="text-white font-semibold mb-2">Why Index Funds?</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Index funds passively track market indices like NIFTY 50. They generally provide lower expense ratios and are suitable for moderate-risk investors seeking market-linked returns.</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-gold-500">
                <h4 className="text-white font-semibold mb-2">The Power of ELSS</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Equity Linked Savings Schemes combine tax saving (up to ₹1.5L under 80C) with equity exposure. They have the shortest lock-in period (3 years).</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-green-500">
                <h4 className="text-white font-semibold mb-2">Role of Debt Funds</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Debt funds invest in fixed-income securities. They are commonly used for lower volatility goals or short-term horizons where capital preservation is prioritized.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 2. SIP SIMULATOR TAB */}
      {activeTab === 'sip' && (
        <div className="animate-fade-in">
          <SIPSimulator />
        </div>
      )}

      {/* 3. GOALS & TAX TAB */}
      {activeTab === 'goals' && (
        <div className="space-y-12 animate-fade-in">
          <GoalSuggestions onExplore={(category) => {
            setActiveCategory(category);
            setActiveTab('explorer');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
          <ELSSModule />
        </div>
      )}

      {/* 4. ANALYTICS TOOLS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-12 animate-fade-in">
          <FundCompare />
          <OverlapAnalyzer />
        </div>
      )}

    </div>
  );
};

export default MutualFunds;
