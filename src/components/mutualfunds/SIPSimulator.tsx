import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Lightbulb, Target } from 'lucide-react';
import { calculateSipProjection } from '../../fund-engine/sipEngine';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const SIPSimulator = () => {
  const [monthlySip, setMonthlySip] = useState(5000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);

  const { 
    totalInvested: invested, 
    nominalWealth: futureValue, 
    realWealth: inflationAdjusted, 
    estimatedWealthGain: estReturns, 
    retirementCorpusCoverage 
  } = calculateSipProjection({
    monthlyInvestment: monthlySip,
    expectedAnnualReturn: expectedReturn,
    timeHorizonYears: years,
    expectedInflationRate: inflation
  });

  // Generate Compound Curve Data
  const generateChartData = () => {
    const data = [];
    const monthlyRate = expectedReturn / 12 / 100;
    
    // Real return rate = (1 + nominal) / (1 + inflation) - 1
    const realAnnualReturnRate = ((1 + expectedReturn / 100) / (1 + inflation / 100) - 1) * 100;
    const monthlyRealRate = realAnnualReturnRate / 12 / 100;

    for (let i = 1; i <= years; i++) {
      const months = i * 12;
      const inv = monthlySip * months;
      
      const fv = monthlyRate > 0 
        ? monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        : inv;
        
      const realVal = monthlyRealRate > 0
        ? monthlySip * ((Math.pow(1 + monthlyRealRate, months) - 1) / monthlyRealRate) * (1 + monthlyRealRate)
        : inv;

      data.push({
        year: `Yr ${i}`,
        Invested: Math.round(inv),
        'Estimated Corpus': Math.round(fv),
        'Real Wealth (Inflation Adjusted)': Math.round(realVal)
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const getInsightText = () => {
    const coveragePercent = Math.round(retirementCorpusCoverage);
    return `At your current monthly SIP contribution of ${formatCurrency(monthlySip)}, you will invest ${formatCurrency(invested)} and amass an estimated total corpus of ${formatCurrency(futureValue)} in ${years} years. However, when adjusted for a steady ${inflation}% annual inflation rate, the real purchasing power of your money stands at ${formatCurrency(inflationAdjusted)}. This covers roughly ${coveragePercent}% of a target ₹2 Crore retirement benchmark, underscoring the critical power of compound real returns.`;
  };

  return (
    <div className="glass-card p-6 border-white/10">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
        <div className="p-3 bg-dark-800 rounded-xl"><Calculator className="text-gold-400" /></div>
        <div>
          <h2 className="heading-3">Advanced SIP & Inflation Simulator</h2>
          <p className="text-sm text-gray-400">See how mutual fund compounding creates real wealth over time when adjusted for inflation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Monthly Investment</label>
              <span className="font-bold text-gold-400">{formatCurrency(monthlySip)}</span>
            </div>
            <input type="range" min="500" max="100000" step="500" className="w-full range-slider" value={monthlySip} onChange={(e) => setMonthlySip(Number(e.target.value))} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Time Period (Years)</label>
              <span className="font-bold text-gold-400">{years} Yrs</span>
            </div>
            <input type="range" min="1" max="40" step="1" className="w-full range-slider" value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Expected Return (%)</label>
              <span className="font-bold text-gold-400">{expectedReturn}%</span>
            </div>
            <input type="range" min="5" max="30" step="0.5" className="w-full range-slider" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} />
            <p className="text-[10px] text-gray-500 mt-1">Historically, equity funds average 10-14% over the long term.</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Inflation Assumption (%)</label>
              <span className="font-bold text-red-400">{inflation}%</span>
            </div>
            <input type="range" min="2" max="10" step="0.5" className="w-full range-slider" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Invested Amount</p>
              <p className="text-xl font-bold text-white mt-1">{formatCurrency(invested)}</p>
            </div>
            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Est. Returns</p>
              <p className="text-xl font-bold text-gold-400 mt-1">{formatCurrency(estReturns)}</p>
            </div>
            
            <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 col-span-2 text-center bg-gradient-to-r from-dark-900 to-dark-800 border-gold-500/20">
              <p className="text-sm text-gray-400 uppercase tracking-wide">Total Estimated Corpus</p>
              <p className="text-4xl font-display font-bold text-gold-400 mt-2 shadow-gold-text">{formatCurrency(futureValue)}</p>
              <p className="text-xs text-gray-500 mt-2">Inflation Adjusted (Real Purchasing Power): <span className="text-gray-300 font-bold">{formatCurrency(inflationAdjusted)}</span></p>
            </div>
            
            <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start mt-2">
              <Lightbulb className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300 leading-relaxed">{getInsightText()}</p>
            </div>
          </div>

          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} stroke="#6b7280" fontSize={12} tickLine={false} />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" name="Invested" dataKey="Invested" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInv)" />
                <Area type="monotone" name="Real Wealth (Adjusted)" dataKey="Real Wealth (Inflation Adjusted)" stroke="#10b981" fillOpacity={1} fill="url(#colorReal)" />
                <Area type="monotone" name="Estimated Corpus" dataKey="Estimated Corpus" stroke="#D4AF37" fillOpacity={1} fill="url(#colorWealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPSimulator;
