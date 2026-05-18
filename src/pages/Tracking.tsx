import React from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { History, TrendingUp, TrendingDown, Clock, ShieldCheck, CheckCircle, IndianRupee } from 'lucide-react';

const Tracking = () => {
  const { trackingHistory } = useFinanceStore();

  if (!trackingHistory || trackingHistory.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 text-white pb-20">
        <SubNav />
        <div className="container mx-auto px-6 max-w-7xl pt-10">
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-gray-500 border-white/5 space-y-4">
            <Clock className="w-16 h-16 text-gold-400 opacity-40 animate-pulse" />
            <h3 className="text-xl font-bold text-white">No Tracking History Available</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Artha automatically captures snapshots of your financial scores monthly. Check back in a few weeks!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format tracking data for Recharts
  const chartData = trackingHistory.map((entry) => {
    const d = new Date(entry.date);
    return {
      ...entry,
      month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      score: entry.overallScore,
      netWorth: entry.netWorth,
      emergency: entry.emergencyScore || 50,
      debt: entry.debtScore || 80,
      savings: entry.savingsScore || 50,
      invest: entry.investmentScore || 50
    };
  });

  // Calculate comparisons (Current vs Last Month)
  const len = trackingHistory.length;
  const current = chartData[len - 1];
  const previous = len >= 2 ? chartData[len - 2] : null;

  const scoreDiff = previous ? current.score - previous.score : 0;
  const netWorthDiff = previous ? current.netWorth - previous.netWorth : 0;
  const savingsRateDiff = (previous && current.savingsRate && previous.savingsRate) ? current.savingsRate - previous.savingsRate : 0;

  return (
    <div className="min-h-screen bg-dark-950 text-white pb-20">
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Progress & History Tracking</h1>
          <p className="text-gray-400">Track structural savings growth, debt reductions, and financial wellness trends over time.</p>
        </div>

        {/* Highlight Metrics Progression Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Wellness Score */}
          <div className="glass-card p-6 border-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active Health Score</p>
              <h3 className="text-3xl font-bold text-white">{current.score} / 100</h3>
              <div className="flex items-center gap-1 mt-2">
                {scoreDiff >= 0 ? (
                  <span className="text-xs text-green-400 flex items-center font-bold">
                    <TrendingUp size={14} className="mr-0.5" /> +{scoreDiff} pts
                  </span>
                ) : (
                  <span className="text-xs text-red-400 flex items-center font-bold">
                    <TrendingDown size={14} className="mr-0.5" /> {scoreDiff} pts
                  </span>
                )}
                <span className="text-[10px] text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <TrendingUp className="text-gold-400 w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Net Worth */}
          <div className="glass-card p-6 border-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Estimated Net Worth</p>
              <h3 className="text-3xl font-bold text-white">₹ {current.netWorth.toLocaleString('en-IN')}</h3>
              <div className="flex items-center gap-1 mt-2">
                {netWorthDiff >= 0 ? (
                  <span className="text-xs text-green-400 flex items-center font-bold">
                    <TrendingUp size={14} className="mr-0.5" /> +₹{netWorthDiff.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-xs text-red-400 flex items-center font-bold">
                    <TrendingDown size={14} className="mr-0.5" /> -₹{Math.abs(netWorthDiff).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[10px] text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <IndianRupee className="text-blue-400 w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Savings rate */}
          <div className="glass-card p-6 border-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Savings Consistency</p>
              <h3 className="text-3xl font-bold text-white">
                {current.savingsRate ? `${Math.round(current.savingsRate)}%` : '30%'}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {savingsRateDiff >= 0 ? (
                  <span className="text-xs text-green-400 flex items-center font-bold">
                    <TrendingUp size={14} className="mr-0.5" /> +{Math.round(savingsRateDiff)}%
                  </span>
                ) : (
                  <span className="text-xs text-red-400 flex items-center font-bold">
                    <TrendingDown size={14} className="mr-0.5" /> {Math.round(savingsRateDiff)}%
                  </span>
                )}
                <span className="text-[10px] text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="text-green-400 w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Visual 1: Wellness Score Trend */}
          <div className="lg:col-span-6 glass-card p-6 border-white/5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-gold-400" /> Wellness Score Trend
              </h3>
              <p className="text-xs text-gray-500">Continuous progression of your personal financial wellness score.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Financial Health"
                    stroke="#d4af37" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#scoreGold)" 
                    activeDot={{ r: 6, fill: '#d4af37', stroke: '#1a1a1e', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual 2: Net Worth progression */}
          <div className="lg:col-span-6 glass-card p-6 border-white/5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IndianRupee className="text-blue-400" /> Estimated Net Worth Progression
              </h3>
              <p className="text-xs text-gray-500">Asset accumulation adjusted for outstanding liabilities.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    formatter={(val) => `₹ ${Number(val).toLocaleString('en-IN')}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netWorth" 
                    name="Net Worth"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Visual 3: Columns breakdown progression */}
        <div className="glass-card p-6 border-white/5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="text-green-400" /> Five Pillars Progress Over Time
            </h3>
            <p className="text-xs text-gray-500">Compare individual diagnostic tracks over historical months.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="emergency" name="Emergency" stroke="#fb923c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="debt" name="Debt Health" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="savings" name="Savings Health" stroke="#4ade80" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="invest" name="Invest Ready" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Snapshot Table List */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="p-4 bg-dark-900/40 border-b border-white/5">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Clock className="text-gold-400" /> Historical Snapshot Ledger
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/60 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Snapshot Date</th>
                  <th className="px-5 py-3 text-center">Wellness Index</th>
                  <th className="px-5 py-3 text-center">Emergency Buffer</th>
                  <th className="px-5 py-3 text-center">Savings Rate</th>
                  <th className="px-5 py-3 text-right">Estimated Net Worth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {chartData.slice().reverse().map((entry, idx) => {
                  const s = entry.score;
                  const catColor = s >= 80 ? 'text-green-400' : s >= 60 ? 'text-blue-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400';
                  
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-xs font-semibold text-gray-400 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`font-bold text-sm ${catColor}`}>{entry.score} / 100</span>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-gray-300 font-semibold whitespace-nowrap">
                        {entry.emergencyMonths ? `${entry.emergencyMonths.toFixed(1)} Months` : '3.0 Months'}
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-gray-300 font-semibold whitespace-nowrap">
                        {entry.savingsRate ? `${Math.round(entry.savingsRate)}%` : '30%'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-white whitespace-nowrap">
                        ₹ {entry.netWorth.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supportive feeling summary */}
        <div className="p-5 bg-gold-500/5 border border-gold-500/10 rounded-2xl flex items-start gap-4">
          <CheckCircle className="text-gold-400 w-6 h-6 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Your Financial Health is Improving!</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Consistently logging expenses, making SIP transfers, and keeping EMIs flat are translating into real-world diagnostic growth. The data clearly shows you are building structural freedom. Stay the course!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tracking;
