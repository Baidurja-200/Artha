import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateSipProjection } from '../services/analyticsEngine';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const SIPCalculator = () => {
  const [investment, setInvestment] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  // Calculation
  const { totalInvested, wealthGained: totalReturns, futureValue } = calculateSipProjection(investment, years, rate);
  const monthlyRate = rate / 12 / 100;

  // Chart Data
  const data = [];
  let currentInvested = 0;
  for (let i = 1; i <= years; i++) {
    currentInvested += investment * 12;
    const currentFV = investment * ((Math.pow(1 + monthlyRate, i * 12) - 1) / monthlyRate) * (1 + monthlyRate);
    data.push({
      year: `Year ${i}`,
      Invested: Math.round(currentInvested),
      Returns: Math.round(currentFV - currentInvested),
      Total: Math.round(currentFV)
    });
  }

  const pieData = [
    { name: 'Invested', value: totalInvested },
    { name: 'Est. Returns', value: Math.max(0, totalReturns) }
  ];
  const COLORS = ['#3b82f6', '#d4af37']; // Blue and Gold

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Inputs */}
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Monthly Investment</label>
            <span className="text-gold-400 font-medium">{formatCurrency(investment)}</span>
          </div>
          <input type="range" min="500" max="100000" step="500" value={investment} onChange={(e) => setInvestment(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Expected Return Rate (p.a)</label>
            <span className="text-gold-400 font-medium">{rate}%</span>
          </div>
          <input type="range" min="5" max="30" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Time Period</label>
            <span className="text-gold-400 font-medium">{years} Years</span>
          </div>
          <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-white/5 mt-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block mb-1">Total Invested</span>
              <span className="text-xl font-bold text-white">{formatCurrency(totalInvested)}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Est. Returns</span>
              <span className="text-xl font-bold text-green-400">{formatCurrency(totalReturns)}</span>
            </div>
            <div className="col-span-2 pt-4 border-t border-white/10">
              <span className="text-gray-400 block mb-1">Total Value</span>
              <span className="text-3xl font-display font-bold text-gold-400">{formatCurrency(futureValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex flex-col gap-6">
        <div className="h-64 w-full bg-dark-900/50 rounded-xl p-4 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="year" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="Total" stroke="#d4af37" fillOpacity={1} fill="url(#colorTotal)" />
              <Area type="monotone" dataKey="Invested" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInvested)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="h-48 w-full flex items-center justify-center bg-dark-900/50 rounded-xl p-4 border border-white/5">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-sm text-gray-400">Invested</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gold-500"></span><span className="text-sm text-gray-400">Returns</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EMICalculator = () => {
  const [principal, setPrincipal] = useState(5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const p = principal;
  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalAmount = emi * n;
  const totalInterest = totalAmount - p;

  const pieData = [
    { name: 'Principal', value: p },
    { name: 'Interest', value: totalInterest }
  ];
  const COLORS = ['#3b82f6', '#ef4444'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Loan Amount</label>
            <span className="text-gold-400 font-medium">{formatCurrency(principal)}</span>
          </div>
          <input type="range" min="100000" max="50000000" step="100000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Interest Rate (p.a)</label>
            <span className="text-gold-400 font-medium">{rate}%</span>
          </div>
          <input type="range" min="5" max="20" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="label-text">Loan Tenure</label>
            <span className="text-gold-400 font-medium">{years} Years</span>
          </div>
          <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-white/5 mt-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block mb-1">Principal Amount</span>
              <span className="text-xl font-bold text-white">{formatCurrency(p)}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Total Interest</span>
              <span className="text-xl font-bold text-red-400">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="col-span-2 pt-4 border-t border-white/10">
              <span className="text-gray-400 block mb-1">Monthly EMI</span>
              <span className="text-3xl font-display font-bold text-gold-400">{formatCurrency(emi)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-64 w-full flex items-center justify-center bg-dark-900/50 rounded-xl p-4 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-4 pl-4">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-500"></span><span className="text-gray-300">Principal</span></div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500"></span><span className="text-gray-300">Interest</span></div>
        </div>
      </div>
    </div>
  );
};

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('sip');

  const tabs = [
    { id: 'sip', label: 'SIP Calculator' },
    { id: 'emi', label: 'EMI Calculator' }
  ];

  return (
    <div className="container mx-auto px-6 max-w-5xl py-12">
      <div className="mb-10">
        <h1 className="heading-2 mb-4">Financial Calculators</h1>
        <p className="text-gray-400">Plan your investments and loans with precision.</p>
      </div>

      <div className="glass-panel p-6 md:p-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'sip' && <SIPCalculator />}
          {activeTab === 'emi' && <EMICalculator />}
        </div>
      </div>
    </div>
  );
};

export default Calculators;
