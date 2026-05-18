import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Compass, Calculator, Target, BarChart2 } from 'lucide-react';
import { useMutualFunds } from '../hooks/useMutualFunds';
import FundCard from '../components/mutualfunds/FundCard';
import SIPSimulator from '../components/mutualfunds/SIPSimulator';
import GoalSuggestions from '../components/mutualfunds/GoalSuggestions';
import ELSSModule from '../components/mutualfunds/ELSSModule';
import FundCompare from '../components/mutualfunds/FundCompare';
import OverlapAnalyzer from '../components/mutualfunds/OverlapAnalyzer';
import PortfolioPlanner from '../components/mutualfunds/PortfolioPlanner';
import SEO from '../components/common/SEO';

const CATEGORIES = ['All', 'Index Funds', 'Flexi Cap', 'Large Cap', 'Mid Cap', 'Small Cap', 'ELSS', 'Debt Funds'];
const RISKS = ['All', 'Low', 'Moderate', 'High', 'Very High'];
const TABS = [
  { id: 'explorer', label: 'Fund Explorer', icon: <Compass size={18} /> },
  { id: 'sip', label: 'SIP Simulator', icon: <Calculator size={18} /> },
  { id: 'goals', label: 'Goals & Tax', icon: <Target size={18} /> },
  { id: 'analytics', label: 'Analytics Tools', icon: <BarChart2 size={18} /> },
];

const MutualFunds = () => {
  const { useSearchFunds, useTopFunds } = useMutualFunds();
  const [activeTab, setActiveTab] = useState('explorer');
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeRisk, setActiveRisk] = useState('All');
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: topFunds = { indexFunds: [], flexiCap: [], largeCap: [], midCap: [], smallCap: [], taxSaving: [], debtFunds: [] }, isLoading: loading } = useTopFunds();
  const { data: searchResults = [], isFetching: isSearching } = useSearchFunds(debouncedQuery);

  const filterResults = (funds: any[]) => {
    if (!funds) return [];
    return funds.filter(fund => {
      const matchCategory = activeCategory === 'All' || fund.category === activeCategory;
      const matchRisk = activeRisk === 'All' || fund.risk === activeRisk;
      return matchCategory && matchRisk;
    });
  };

  const filteredSearchResults = filterResults(searchResults);

  const renderFundSection = (title: string, description: string, data: any[]) => {
    const filtered = filterResults(data);
    if (!filtered || filtered.length === 0) return null;
    return (
      <section className="space-y-4">
        <div>
          <h2 className="heading-3 mb-1">{title}</h2>
          {description && <p className="text-sm text-gray-400 leading-relaxed">{description}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(fund => <FundCard key={fund.schemeCode} fund={fund} />)}
        </div>
      </section>
    );
  };

  // Structured machine-readable details for AI
  const aiMachineFundsProfile = {
    activeModule: activeTab,
    selectedCategoryFilter: activeCategory,
    selectedRiskFilter: activeRisk,
    hasActiveSearchQuery: debouncedQuery.length >= 3,
    explorerCategoriesCount: CATEGORIES.length
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-7xl py-12 space-y-12 bg-dark-950 text-white"
      role="main"
      data-funds-explorer={JSON.stringify(aiMachineFundsProfile)}
    >
      <SEO 
        title="Mutual Fund Explorer"
        description="Research, compare, and simulate Indian mutual funds. Access index funds, flexi-caps, ELSS tax savings, and run portfolio overlap analysis."
        keywords="mutual funds explorer India, direct mutual funds, index funds vs large cap, SIP simulators, ELSS tax saving calculator, portfolio overlap analyser"
      />
      
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="heading-2">Mutual Fund Intelligence</h1>
        <p className="text-gray-400 text-lg">
          Research, compare, and simulate mutual funds to build a historically resilient, goal-oriented portfolio.
        </p>
      </header>

      {/* Tabs Navigation (Accessible Tablist) */}
      <nav 
        role="tablist" 
        aria-label="Mutual Fund intelligence modules"
        className="flex overflow-x-auto custom-scrollbar justify-start md:justify-center border-b border-white/10"
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`mf-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-gold-400 border-gold-400 bg-gold-400/5 font-semibold' 
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      {/* TABS CONTENT */}
      <div 
        id={`mf-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`mf-tab-${activeTab}`}
      >
        
        {/* 1. EXPLORER TAB */}
        {activeTab === 'explorer' && (
          <div className="space-y-12 animate-fade-in">
            {/* Search Area */}
            <div className="relative max-w-2xl mx-auto">
              <label htmlFor="mf-search-input" className="sr-only">Search mutual funds by scheme name</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
              <input 
                id="mf-search-input"
                type="text" 
                placeholder="Search funds by name (e.g. Parag Parikh, SBI Nifty)" 
                className="w-full bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold-500/50 shadow-glass transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Filter Section */}
            <aside className="glass-panel p-6" aria-label="Fund Filters">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex items-center gap-2 text-gray-400 font-medium whitespace-nowrap">
                  <Filter size={18} aria-hidden="true" /> Filters:
                </div>
                
                <div className="flex-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                  <div className="flex gap-2" role="group" aria-label="Category filter options">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                          activeCategory === cat 
                            ? 'bg-gold-500 text-dark-900 font-semibold shadow-sm' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                        aria-pressed={activeCategory === cat}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mf-risk-select" className="sr-only">Filter by risk rating level</label>
                  <select 
                    id="mf-risk-select"
                    className="bg-dark-700 text-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none border border-transparent focus:border-gold-500/30"
                    value={activeRisk}
                    onChange={(e) => setActiveRisk(e.target.value)}
                  >
                    {RISKS.map(r => <option key={r} value={r}>{r === 'All' ? 'Any Risk' : `${r} Risk`}</option>)}
                  </select>
                </div>
              </div>
            </aside>

            {debouncedQuery.length >= 3 ? (
              <section className="space-y-6">
                <h2 className="heading-3">Search Results</h2>
                {isSearching ? (
                  <div className="text-center text-gold-400 py-10" role="status">Searching the database...</div>
                ) : filteredSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredSearchResults.map(fund => <FundCard key={fund.schemeCode} fund={fund} />)}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10 glass-card" role="status">No funds found matching your criteria.</div>
                )}
              </section>
            ) : (
              <div className="space-y-12">
                {renderFundSection('Index Funds', 'Passive trackers copying major market indexes for low expense fees.', topFunds.indexFunds)}
                {renderFundSection('Flexi Cap', 'Adaptive, manager-led multi-cap funds dynamically investing in top Indian sectors.', topFunds.flexiCap)}
                {renderFundSection('Large Cap', 'Invests in massive blue-chip leaders to ensure moderate volatility compounding.', topFunds.largeCap)}
                {renderFundSection('Mid & Small Cap', 'Focused high-growth sector allocations suited for aggressive timelines.', [...(topFunds.midCap || []), ...(topFunds.smallCap || [])])}
                {renderFundSection('Tax Saving (ELSS)', 'Provides statutory Section 80C exemptions with only a 3-year lock-in.', topFunds.taxSaving)}
                {renderFundSection('Debt & Liquid', 'Low asset risk instruments built for emergency reserve and dry powder caches.', topFunds.debtFunds)}
              </div>
            )}

            {/* Static Educational Section inside Explorer */}
            <section className="border-t border-white/5 pt-16" aria-label="Mutual Fund Classifications Guide">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-blue-500/10" aria-hidden="true"><BookOpen className="text-blue-400 w-6 h-6" /></div>
                <h2 className="heading-3">Topical Mutual Fund Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="glass-card p-6 border-l-4 border-l-blue-500 space-y-2">
                  <h3 className="text-white font-semibold">1. Passive Index Investing</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Index funds passively replicate broad market benchmarks (like NIFTY 50 or SENSEX) instead of paying active fund managers. Passivity lowers annual **Expense Ratios** to 0.1-0.3%, ensuring investors capture 99% of raw benchmark yields, beating most active managers over 10+ years.
                  </p>
                </article>
                <article className="glass-card p-6 border-l-4 border-l-gold-500 space-y-2">
                  <h3 className="text-white font-semibold">2. The Role of ELSS Schemes</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Equity Linked Savings Schemes (ELSS) are unique tax-saver mutual funds. Under Section 80C, allocations up to ₹1.5 Lakhs are tax-exempt. Notably, ELSS features a **3-year lock-in period**, which is the shortest among all 80C options (compared to PPF's 15 years or Tax Saver FDs' 5 years).
                  </p>
                </article>
                <article className="glass-card p-6 border-l-4 border-l-green-500 space-y-2">
                  <h3 className="text-white font-semibold">3. Direct vs Regular cost impacts</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Regular plans route through distributors, paying them **0.5% to 1.5% commission** annually out of your money, while **Direct plans** have zero commission. Over a 25-year compounding SIP horizon, that tiny 1% commission difference results in a **-20% drop in final total wealth**.
                  </p>
                </article>
              </div>
            </section>
          </div>
        )}

        {/* 2. SIP SIMULATOR TAB */}
        {activeTab === 'sip' && (
          <section className="animate-fade-in" aria-label="SIP Projections Tool">
            <SIPSimulator />
          </section>
        )}

        {/* 3. GOALS & TAX TAB */}
        {activeTab === 'goals' && (
          <section className="space-y-12 animate-fade-in" aria-label="Goals and Tax optimization">
            <GoalSuggestions onExplore={(category) => {
              setActiveCategory(category);
              setActiveTab('explorer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} />
            <ELSSModule />
          </section>
        )}

        {/* 4. ANALYTICS TOOLS TAB */}
        {activeTab === 'analytics' && (
          <section className="space-y-12 animate-fade-in" aria-label="Advanced analytics tools">
            <PortfolioPlanner />
            <FundCompare />
            <OverlapAnalyzer />
          </section>
        )}

      </div>
    </main>
  );
};

export default MutualFunds;
