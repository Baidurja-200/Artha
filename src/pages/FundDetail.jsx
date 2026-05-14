import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, AlertTriangle, User, Briefcase, Plus } from 'lucide-react';
import { useMutualFunds } from '../hooks/useMutualFunds';

const FundDetail = () => {
  const { id } = useParams();
  const { useFundDetails } = useMutualFunds();
  const { data: fund, isLoading: loading, error } = useFundDetails(id);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('3Y');

  useEffect(() => {
    if (fund && fund.history) {
      processChartData(fund.history, timeframe);
    }
  }, [fund, timeframe]);

  const processChartData = (history, range) => {
    if (!history) return;
    
    // History comes sorted newest first from our service usually, or we ensure it.
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

    // Subsample for performance if too many points (Recharts struggles with >1000 points)
    const step = Math.ceil(filtered.length / 100);
    const sampled = filtered.filter((_, i) => i % step === 0 || i === filtered.length - 1);

    setChartData(sampled.map(i => ({
      date: i.date,
      NAV: parseFloat(i.nav)
    })));
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    processChartData(fund.history, tf);
  };

  if (loading || !fund) {
    return <div className="container mx-auto px-6 py-20 text-center text-gold-400">Loading fund details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-20 text-center text-red-400">Failed to fetch fund details.</div>;
  }

  return (
    <div className="container mx-auto px-6 max-w-5xl py-8 space-y-8">
      
      {/* Header */}
      <div>
        <Link to="/mutual-funds" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Explorer
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-dark-700 text-gray-300">{fund.category}</span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-orange-400/10 text-orange-400 border border-orange-400/20">{fund.risk} Risk</span>
            </div>
            <h1 className="heading-2">{fund.schemeName}</h1>
            <p className="text-gray-400 mt-2">Fund House: {fund.fund_house}</p>
          </div>
          
          <div className="text-right glass-card px-6 py-4 border-gold-500/30">
            <p className="text-sm text-gray-400 mb-1">Current NAV</p>
            <div className="text-3xl font-display font-bold text-white">₹{parseFloat(fund.currentNav).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">3Y CAGR</p>
          <div className={`text-xl font-bold flex items-center gap-1 ${fund.cagr3Y > 0 ? 'text-green-400' : 'text-gray-300'}`}>
            {fund.cagr3Y !== 'N/A' ? `${fund.cagr3Y}%` : 'N/A'} {fund.cagr3Y > 0 && <TrendingUp size={16} />}
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">1Y Return</p>
          <div className={`text-xl font-bold flex items-center gap-1 ${fund.return1Y > 0 ? 'text-green-400' : 'text-gray-300'}`}>
            {fund.return1Y !== 'N/A' ? `${fund.return1Y}%` : 'N/A'} {fund.return1Y > 0 && <TrendingUp size={16} />}
          </div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Expense Ratio</p>
          <div className="text-xl font-bold text-white">{fund.expenseRatio}%</div>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AUM Size</p>
          <div className="text-xl font-bold text-white">{fund.aum}</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-panel p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="heading-3">NAV Performance</h3>
          <div className="flex bg-dark-800 rounded-lg p-1 border border-white/5">
            {['1Y', '3Y', '5Y', 'MAX'].map(tf => (
              <button 
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-4 py-1 text-sm rounded-md transition-all ${timeframe === tf ? 'bg-dark-600 text-gold-400 shadow' : 'text-gray-400 hover:text-white'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-80 w-full">
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
      </div>

      {/* Deep Dive Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Info Box */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-4">Fund Overview</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Investment Objective</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Suitable for moderate-risk investors. Historically strong performer in the {fund.category} category. Aims to provide long-term capital appreciation by investing predominantly in equity and equity related instruments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <User className="text-gold-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Fund Manager</p>
                <p className="text-sm text-gray-400">{fund.manager}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-red-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Risk Profile</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Rated as <strong>{fund.risk}</strong> risk. Subject to market risks. Please read all scheme related documents carefully before investing. Past performance is not indicative of future returns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Box */}
        <div className="glass-card p-6 md:p-8 flex flex-col justify-between border-gold-500/20 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/10 blur-[60px] rounded-full pointer-events-none"></div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Invest?</h3>
            <p className="text-sm text-gray-400 mb-6">Start a Systematic Investment Plan (SIP) or make a one-time lumpsum investment.</p>
            
            <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 mb-6">
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
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={18} /> Add to Watchlist
            </button>
            <button className="btn-secondary w-full">
              Simulate Returns
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FundDetail;
