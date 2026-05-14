import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const SIPSimulator = () => {
  const [monthlySip, setMonthlySip] = useState(5000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflation, setInflation] = useState(6);

  const calculateSIP = () => {
    const months = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    const invested = monthlySip * months;
    
    // Future Value of SIP formula: P * (((1 + r)^n - 1) / r) * (1 + r)
    const futureValue = monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estReturns = futureValue - invested;
    
    // Inflation adjusted (Present Value)
    const inflationAdjusted = futureValue / Math.pow(1 + (inflation / 100), years);

    return { invested, estReturns, futureValue, inflationAdjusted };
  };

  const { invested, estReturns, futureValue, inflationAdjusted } = calculateSIP();

  // Generate Compound Curve Data
  const generateChartData = () => {
    const data = [];
    const monthlyRate = expectedReturn / 12 / 100;
    for (let i = 1; i <= years; i++) {
      const months = i * 12;
      const inv = monthlySip * months;
      const fv = monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      data.push({
        year: `Year ${i}`,
        Invested: Math.round(inv),
        Wealth: Math.round(fv)
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const pieData = [
    { name: 'Invested Amount', value: invested },
    { name: 'Est. Returns', value: estReturns }
  ];
  const COLORS = ['#3b82f6', '#D4AF37'];

  return (
    <div className="glass-card p-6 border-white/10">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
        <div className="p-3 bg-dark-800 rounded-xl"><Calculator className="text-gold-400" /></div>
        <div>
          <h2 className="heading-3">Advanced SIP Simulator</h2>
          <p className="text-sm text-gray-400">See how mutual fund compounding creates wealth over time.</p>
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
            <p className="text-[10px] text-gray-500 mt-1">Historically, equity funds average 10-14% over long term.</p>
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
              <p className="text-xs text-gray-500 mt-2">Inflation Adjusted (Real Value): <span className="text-gray-300">{formatCurrency(inflationAdjusted)}</span></p>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} stroke="#6b7280" fontSize={12} tickLine={false} />
                <RechartsTooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="Invested" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInv)" />
                <Area type="monotone" dataKey="Wealth" stroke="#D4AF37" fillOpacity={1} fill="url(#colorWealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPSimulator;
