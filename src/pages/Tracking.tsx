import React from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { History, TrendingUp, TrendingDown, ArrowUpRight, Award, IndianRupee, ShieldAlert, Sparkles, BookOpen, Info } from 'lucide-react';

const Tracking = () => {
  const { trackingHistory, profile } = useFinanceStore();

  // Map store history to local history with all necessary properties populated (handling fallback values gracefully)
  const history = (trackingHistory || []).map(entry => {
    const dateObj = new Date(entry.date);
    const month = dateObj.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    
    // Calculate fallback values for old hardcoded snapshots
    const savingsRate = entry.savingsRate !== undefined 
      ? entry.savingsRate 
      : ((profile.monthlyIncome - profile.monthlyExpenses - (profile.debtEMI || 0)) / (profile.monthlyIncome || 1)) * 100;
      
    const debtEMI = profile.debtEMI || 0;
    
    const runwayMonths = entry.emergencyMonths !== undefined 
      ? entry.emergencyMonths 
      : (profile.emergencyFund / (profile.monthlyExpenses || 1));
      
    return {
      month,
      netWorth: entry.netWorth,
      wellnessScore: entry.overallScore || 0,
      savingsRate: Math.max(0, savingsRate),
      debtEMI,
      runwayMonths: runwayMonths || 0
    };
  });

  // If history is empty, fall back safely
  const currentEntry = history[history.length - 1] || { netWorth: 0, wellnessScore: 0, savingsRate: 0, debtEMI: 0, runwayMonths: 0 };
  const firstEntry = history[0] || { netWorth: 0, wellnessScore: 0, savingsRate: 0, debtEMI: 0, runwayMonths: 0 };

  // Shifts calculations
  const netWorthShift = currentEntry.netWorth - firstEntry.netWorth;
  const scoreShift = currentEntry.wellnessScore - firstEntry.wellnessScore;

  // Custom colors matching the gold dark luxury theme
  const colors = {
    gold: '#d4af37',
    goldGlow: '#d4af3730',
    blue: '#3b82f6',
    blueGlow: '#3b82f630',
    green: '#10b981',
    red: '#ef4444'
  };

  // Machine-readable data object for future AI agents
  const aiMachineTrackingProfile = {
    historyLength: history.length,
    netWorthTrend: history.map(h => ({ month: h.month, netWorth: h.netWorth })),
    wellnessTrend: history.map(h => ({ month: h.month, score: h.wellnessScore })),
    netWorthShiftRupees: netWorthShift,
    wellnessScoreShiftPoints: scoreShift,
    currentEmergencyRunwayMonths: currentEntry.runwayMonths || 0
  };

  // Structured plain-text description for Recharts AreaChart
  const getNetWorthChartDescription = () => {
    if (history.length < 2) return 'Insufficient historical entries to project trend line.';
    return `This 6-month historical AreaChart displays your Net Worth trajectory, starting at ₹${firstEntry.netWorth.toLocaleString('en-IN')} in ${firstEntry.month} and shifting to ₹${currentEntry.netWorth.toLocaleString('en-IN')} in ${currentEntry.month}, representing a total shift of ₹${netWorthShift.toLocaleString('en-IN')}.`;
  };

  // Structured plain-text description for Recharts LineChart
  const getWellnessChartDescription = () => {
    if (history.length < 2) return 'Insufficient historical entries to project trend line.';
    const trendWord = scoreShift >= 0 ? 'increase' : 'decrease';
    return `This 6-month historical LineChart displays your overall Wellness Index progression, starting at ${firstEntry.wellnessScore} points in ${firstEntry.month} and moving to ${currentEntry.wellnessScore} points in ${currentEntry.month}, representing a net ${trendWord} of ${Math.abs(scoreShift)} score points.`;
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-tracking-profile={JSON.stringify(aiMachineTrackingProfile)}
    >
      <SEO 
        title="Progress Tracking"
        description="Analyze 6-month historical snapshots of your wealth, debt reduction speed, wellness scores, and compare relative performance shifts."
        keywords="wealth trends, net worth tracker, compounding history, systematic savings consistency, historical finance"
      />
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Historical Progress Tracking</h1>
          <p className="text-gray-400">Review 6-month historical snapshots of your net worth growth, debt reduction, and wellness score trends.</p>
        </header>

        {/* Top Summary Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Shifts Overview">
          
          <article className="glass-card p-5 border-white/5 space-y-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Net Worth Shift (6mo)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ₹ {netWorthShift >= 0 ? '+' : ''}{netWorthShift.toLocaleString('en-IN')}
              </span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${netWorthShift >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netWorthShift >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {netWorthShift >= 0 ? 'Growth' : 'Decline'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Total shift in dedicated investments, emergency fund, and cash surplus minus EMI debts.
            </p>
          </article>

          <article className="glass-card p-5 border-white/5 space-y-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Wellness Index Change</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gold-400">
                {scoreShift >= 0 ? '+' : ''}{scoreShift} pts
              </span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${scoreShift >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {scoreShift >= 0 ? 'Improved' : 'Shifted'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Diagnostic index progression. Measures cashflow stability, safety margins, and DTI drops.
            </p>
          </article>

          <article className="glass-card p-5 border-white/5 space-y-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Debt EMI Commitments</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ₹ {currentEntry.debtEMI.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ month</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Active loan EMI outlays. A falling trend represents debt pre-payment speed.
            </p>
          </article>

          <article className="glass-card p-5 border-white/5 space-y-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Savings Rate Trend</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-400">
                {Math.round(currentEntry.savingsRate)}%
              </span>
              <span className="text-xs text-gray-400 font-medium">retained</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Percentage of monthly salary successfully transferred into compound investments.
            </p>
          </article>

        </div>

        {/* Charts Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Net Worth AreaChart */}
          <section className="lg:col-span-6 glass-card p-6 border-white/5 flex flex-col justify-between h-[450px]" aria-label="Net Worth Progression">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <IndianRupee className="text-gold-400" /> Net Worth Progression Trend
              </h2>
              <p className="text-xs text-gray-500 mt-1">Tracks the compounding trajectory of net liquid assets and investments over 6 months.</p>
            </div>

            <div className="w-full h-72" aria-label="Visual Area Chart Net Worth progression">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.gold} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={colors.gold} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Net Worth']}
                  />
                  <Area type="monotone" dataKey="netWorth" stroke={colors.gold} strokeWidth={2.5} fillOpacity={1} fill="url(#colorNetWorth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Screen reader caption */}
            <p className="sr-only" aria-live="polite">
              {getNetWorthChartDescription()}
            </p>
            <div className="w-full text-left mt-2">
              <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-400">Visual Interpretation:</strong> {getNetWorthChartDescription()}
                </span>
              </span>
            </div>
          </section>

          {/* Right Column: Wellness Index LineChart */}
          <section className="lg:col-span-6 glass-card p-6 border-white/5 flex flex-col justify-between h-[450px]" aria-label="Wellness Index Trend">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="text-gold-400" /> Wellness Index Progression Trend
              </h2>
              <p className="text-xs text-gray-500 mt-1">Tracks your reactive financial health score as parameters adjust over time.</p>
            </div>

            <div className="w-full h-72" aria-label="Visual Line Chart Wellness progression">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [`${value} Points`, 'Wellness Index']}
                  />
                  <Line type="monotone" dataKey="wellnessScore" stroke={colors.blue} strokeWidth={3} dot={{ stroke: colors.blue, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Screen reader caption */}
            <p className="sr-only" aria-live="polite">
              {getWellnessChartDescription()}
            </p>
            <div className="w-full text-left mt-2">
              <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-400">Visual Interpretation:</strong> {getWellnessChartDescription()}
                </span>
              </span>
            </div>
          </section>

        </div>

        {/* Historical Snapshot Comparison Table */}
        <section className="glass-card border-white/5 overflow-hidden" aria-label="Historical Monthly Snapshot Database">
          <div className="p-4 bg-dark-900/40 border-b border-white/5">
            <h2 className="text-md font-bold text-white flex items-center gap-1.5">
              <History className="text-gold-400" /> Historical Snapshot Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-1">Review raw data log points representing your historical monthly performance snapshots.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-900/60 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-right">Net Worth</th>
                  <th className="px-5 py-3 text-center">Wellness Index</th>
                  <th className="px-5 py-3 text-right">Savings Rate</th>
                  <th className="px-5 py-3 text-right">Monthly EMI Debt</th>
                  <th className="px-5 py-3 text-center">Emergency Runway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {history.map((h) => {
                  const scoreColor = h.wellnessScore >= 80 ? 'text-green-400' : h.wellnessScore >= 60 ? 'text-blue-400' : h.wellnessScore >= 40 ? 'text-yellow-400' : 'text-red-400';
                  
                  return (
                    <tr key={h.month} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 text-white font-bold whitespace-nowrap">
                        {h.month}
                      </td>
                      <td className="px-5 py-3.5 text-right text-white font-bold whitespace-nowrap">
                        ₹ {h.netWorth.toLocaleString('en-IN')}
                      </td>
                      <td className={`px-5 py-3.5 text-center font-bold whitespace-nowrap ${scoreColor}`}>
                        {h.wellnessScore} / 100
                      </td>
                      <td className="px-5 py-3.5 text-right text-blue-400 whitespace-nowrap">
                        {Math.round(h.savingsRate)}%
                      </td>
                      <td className="px-5 py-3.5 text-right text-red-400 whitespace-nowrap">
                        ₹ {h.debtEMI.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-center text-gray-300 whitespace-nowrap">
                        {h.runwayMonths.toFixed(1)} Months
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Progress Tracking Principles Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Capital Progression and Net Worth Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Understanding Net Worth</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Net Worth is the true benchmark of absolute wealth. Computed simply as: **Total Assets** (mutual funds, stock investments, EPF, emergency FD, gold) minus **Total Liabilities** (unsecured credit card balances, home loans, car loans). Tracking Net Worth monthly highlights genuine asset building over vanity salaries.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Compound Growth Hockey-Stick Pattern</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Wealth compounding is non-linear. Across the initial **1 to 5 years**, growth appears slow and underwhelming because interest works on small base values. Around **year 8 to 10**, compounding velocity shifts in a **"hockey-stick" pattern**, where interest generates massive interest, vastly outstripping active monthly deposits.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Disregarding Short-term Market Noise</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Equity markets are volatile in the short term. Reviewing net worth fluctuations daily causes behavioral anxiety, leading to panic selling. The key to long-term compounding is looking at **6-month or yearly trend vectors**. Consistent monthly tracking provides historical context, proving that systematic saving always wins.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Tracking;
