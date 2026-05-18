import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, AlertTriangle, User, Briefcase, Plus, BookOpen, Info } from 'lucide-react';
import { useMutualFunds } from '../hooks/useMutualFunds';
import SEO from '../components/common/SEO';

const FundDetail = () => {
  const { id } = useParams();
  const { useFundDetails } = useMutualFunds();
  const { data: fund, isLoading: loading, error } = useFundDetails(id);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('3Y');

  useEffect(() => {
    if (fund && fund.history) {
      processChartData(fund.history, timeframe);
    }
  }, [fund, timeframe]);

  const processChartData = (history: any[], range: string) => {
    if (!history) return;
    
    let years = 1;
    if (range === '3Y') years = 3;
    if (range === '5Y') years = 5;
    if (range === 'MAX') years = 50;

    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() - years);

    const filtered = history.filter(item => {
      const parts = item.date.split('-');
      const date = new Date(parts[2], parts[1]-1, parts[0]);
      return date >= targetDate;
    }).reverse(); // Reverse for chart (oldest to newest)

    const step = Math.ceil(filtered.length / 100);
    const sampled = filtered.filter((_, i) => i % step === 0 || i === filtered.length - 1);

    setChartData(sampled.map(i => ({
      date: i.date,
      NAV: parseFloat(i.nav)
    })));
  };

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    if (fund && fund.history) {
      processChartData(fund.history, tf);
    }
  };

  if (loading || !fund) {
    return <div className="container mx-auto px-6 py-20 text-center text-gold-400 font-semibold" role="status">Loading fund details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-20 text-center text-red-400 font-semibold" role="alert">Failed to fetch fund details.</div>;
  }

  // Machine-readable data for future AI assistants
  const aiMachineFundDetailProfile = {
    schemeCode: fund.schemeCode,
    schemeName: fund.schemeName,
    category: fund.category,
    risk: fund.risk,
    currentNav: parseFloat(fund.currentNav),
    cagr3Y: fund.cagr3Y,
    expenseRatioPercent: fund.expenseRatio,
    aum: fund.aum,
    manager: fund.manager,
    minimumSip: fund.minSip
  };

  // Structured plain-text description of the NAV performance
  const getNavDescription = () => {
    if (chartData.length < 2) return 'Insufficient historical data to calculate trends.';
    return `${fund.schemeName} NAV performance AreaChart over a ${timeframe} timeframe. Starting NAV value was ₹${chartData[0]?.NAV.toFixed(2)} on ${chartData[0]?.date} and shifted to ₹${chartData[chartData.length - 1]?.NAV.toFixed(2)} on ${chartData[chartData.length - 1]?.date}. The fund's 3-year CAGR stands at ${fund.cagr3Y}%.`;
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-5xl py-8 space-y-8 bg-dark-950 text-white"
      role="main"
      data-fund-profile={JSON.stringify(aiMachineFundDetailProfile)}
    >
      <SEO 
        title={`${fund.schemeName} NAV & Analysis`}
        description={`Analyze ${fund.schemeName} NAV performance, CAGR returns, direct expense ratios, and volatility diagnostics.`}
        keywords={`${fund.schemeName} NAV today, ${fund.schemeName} cagr, ${fund.category} cagr returns, mutual fund expense ratio`}
      />

      {/* Header Navigation */}
      <header>
        <Link 
          to="/mutual-funds" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 transition-colors font-medium text-sm"
          aria-label="Back to Mutual Fund explorer"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Explorer
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex gap-2 mb-2" role="status">
              <span className="text-xs font-medium px-2 py-1 rounded bg-dark-700 text-gray-300">{fund.category}</span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-orange-400/10 text-orange-400 border border-orange-400/20">{fund.risk} Risk</span>
            </div>
            <h1 className="heading-2">{fund.schemeName}</h1>
            <p className="text-gray-400 mt-2 text-sm">Fund House: {fund.fund_house}</p>
          </div>
          
          <div className="text-right glass-card px-6 py-4 border-gold-500/30" role="status" aria-label="Current Net Asset Value">
            <span className="text-sm text-gray-400 mb-1 block">Current NAV</span>
            <span className="text-3xl font-display font-bold text-white">₹{parseFloat(fund.currentNav).toFixed(2)}</span>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Key Fund Performance Variables">
        <article className="glass-card p-4">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-1">3Y CAGR</h2>
          <p className={`text-xl font-bold flex items-center gap-1 ${fund.cagr3Y > 0 ? 'text-green-400' : 'text-gray-300'}`}>
            {fund.cagr3Y !== 'N/A' ? `${fund.cagr3Y}%` : 'N/A'} {fund.cagr3Y > 0 && <TrendingUp size={16} aria-hidden="true" />}
          </p>
        </article>
        <article className="glass-card p-4">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-1">1Y Return</h2>
          <p className={`text-xl font-bold flex items-center gap-1 ${fund.return1Y > 0 ? 'text-green-400' : 'text-gray-300'}`}>
            {fund.return1Y !== 'N/A' ? `${fund.return1Y}%` : 'N/A'} {fund.return1Y > 0 && <TrendingUp size={16} aria-hidden="true" />}
          </p>
        </article>
        <article className="glass-card p-4">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-1">Expense Ratio</h2>
          <p className="text-xl font-bold text-white">{fund.expenseRatio}%</p>
        </article>
        <article className="glass-card p-4">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-1">AUM Size</h2>
          <p className="text-xl font-bold text-white">{fund.aum}</p>
        </article>
      </section>

      {/* Chart Section */}
      <section className="glass-panel p-6 md:p-8 flex flex-col justify-between" aria-label="NAV Performance Graph">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-3">NAV Performance Timeline</h2>
          <nav className="flex bg-dark-800 rounded-lg p-1 border border-white/5" role="group" aria-label="Chart time range selection">
            {['1Y', '3Y', '5Y', 'MAX'].map(tf => (
              <button 
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-4 py-1 text-sm rounded-md transition-all ${timeframe === tf ? 'bg-dark-600 text-gold-400 shadow font-semibold' : 'text-gray-400 hover:text-white'}`}
                aria-pressed={timeframe === tf}
              >
                {tf}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="h-80 w-full" aria-label="Visual NAV Performance Area Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis domain={['auto', 'auto']} stroke="#6b7280" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v.toFixed(0)}`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="NAV" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorNav)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Screen reader caption */}
        <p className="sr-only" aria-live="polite">
          {getNavDescription()}
        </p>
        <div className="w-full text-left mt-2">
          <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
            <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-gray-400">Interpretation:</strong> {getNavDescription()}
            </span>
          </span>
        </div>
      </section>

      {/* Deep Dive Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Info Box */}
        <section className="glass-card p-6 md:p-8 space-y-6" aria-label="Objective and Manager Overview">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Fund Overview</h2>
          
          <div className="space-y-4">
            <article className="flex items-start gap-4" aria-label="Investment target explanation">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Briefcase className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Investment Objective</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Suitable for moderate-risk investors. Historically strong performer in the {fund.category} category. Aims to provide long-term capital appreciation by investing predominantly in equity and equity related instruments.
                </p>
              </div>
            </article>

            <article className="flex items-start gap-4" aria-label="Manager information">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <User className="text-gold-400 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Fund Manager</h3>
                <p className="text-sm text-gray-400">{fund.manager}</p>
              </div>
            </article>

            <article className="flex items-start gap-4" aria-label="Scheme risk profile disclaimer">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <AlertTriangle className="text-red-400 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Risk Profile</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Rated as <strong>{fund.risk}</strong> risk. Subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future returns.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Action Box */}
        <section className="glass-card p-6 md:p-8 flex flex-col justify-between border-gold-500/20 relative overflow-hidden" aria-label="Investment Actions and constraints">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/10 blur-[60px] rounded-full pointer-events-none" aria-hidden="true"></div>
          
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Ready to Invest?</h2>
            <p className="text-sm text-gray-400 mb-6">Start a Systematic Investment Plan (SIP) or make a one-time lumpsum investment.</p>
            
            <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 mb-6" role="status">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Minimum SIP Amount</span>
                <span className="text-white font-medium">₹{fund.minSip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Exit Load</span>
                <span className="text-white font-medium">1% before 1 Year</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="btn-primary w-full flex items-center justify-center gap-2" aria-label={`Add ${fund.schemeName} to watchlist`}>
              <Plus size={18} aria-hidden="true" /> Add to Watchlist
            </button>
            <Link to="/mutual-funds" className="btn-secondary w-full block text-center py-3" aria-label="Navigate to simulated returns tools">
              Simulate Returns
            </Link>
          </div>
        </section>

      </div>

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="NAV and Mutual Fund performance guidelines">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> NAV Performance and Expense Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Defining Net Asset Value (NAV)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Net Asset Value (NAV) represents the unit market value of a mutual fund scheme. Calculated at the close of every business day by subtracting fund liabilities from total assets and dividing by outstanding units. A high NAV simply means the fund has historically compounded longer; it does not indicate "expensive" pricing.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Expense Ratios and CAGR</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The **Expense Ratio** is the annual operational cost charged by the fund, deducted daily from NAV. A lower expense ratio directly raises CAGR. Compound Annual Growth Rate (CAGR) measures the geometric mean return of the scheme, providing the best long-term indicator of compounding speed.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Exit Loads and Lock-ins</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              An **Exit Load** is a redemption penalty (usually 1%) charged if you liquidate units before a standard threshold (typically 365 days) to discourage speculative trading. ELSS funds have no exit loads, but feature a strict statutory **3-year lock-in period** that halts all redemption.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default FundDetail;
