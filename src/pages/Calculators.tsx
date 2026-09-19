import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateSipProjection } from '../services/analyticsEngine';
import { BookOpen, Info } from 'lucide-react';
import SEO from '../components/common/SEO';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const SIPCalculator = () => {
  const [investment, setInvestment] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { totalInvested, wealthGained: totalReturns, futureValue } = calculateSipProjection(investment, years, rate);
  const monthlyRate = rate / 12 / 100;

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
  const COLORS = ['#3b82f6', '#d4af37'];

  // Machine-readable data object for future AI agents
  const aiMachineSipProfile = {
    monthlySIPAmount: investment,
    expectedReturnRatePA: rate,
    timeTenureYears: years,
    totalInvestedRupees: totalInvested,
    estimatedReturnsRupees: totalReturns,
    projectedFutureValueRupees: futureValue
  };

  // Structured plain-text description for Recharts AreaChart
  const getAreaChartDescription = () => {
    return `SIP progressive growth AreaChart over ${years} years. Final principal invested stands at ₹${totalInvested.toLocaleString('en-IN')}, generating ₹${totalReturns.toLocaleString('en-IN')} in estimated compound returns, reaching a total value of ₹${futureValue.toLocaleString('en-IN')}.`;
  };

  // Structured plain-text description for Recharts PieChart
  const getPieChartDescription = () => {
    const returnsPercentage = futureValue > 0 ? (totalReturns / futureValue) * 100 : 0;
    return `SIP distribution PieChart: Principal invested constitutes ${Math.round(100 - returnsPercentage)}% of total value, while estimated compound interest captures ${Math.round(returnsPercentage)}%.`;
  };

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      data-sip-profile={JSON.stringify(aiMachineSipProfile)}
    >
      {/* Inputs */}
      <aside className="space-y-6" aria-label="SIP inputs parameters">
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="sip-monthly-slider" className="label-text">Monthly Investment</label>
            <span className="text-gold-400 font-medium">{formatCurrency(investment)}</span>
          </div>
          <input 
            id="sip-monthly-slider"
            type="range" 
            min="500" 
            max="100000" 
            step="500" 
            value={investment} 
            onChange={(e) => setInvestment(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="SIP Monthly Investment amount slider"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="sip-rate-slider" className="label-text">Expected Return Rate (p.a)</label>
            <span className="text-gold-400 font-medium">{rate}%</span>
          </div>
          <input 
            id="sip-rate-slider"
            type="range" 
            min="5" 
            max="30" 
            step="0.5" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="SIP Expected return rate slider"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="sip-years-slider" className="label-text">Time Period</label>
            <span className="text-gold-400 font-medium">{years} Years</span>
          </div>
          <input 
            id="sip-years-slider"
            type="range" 
            min="1" 
            max="40" 
            step="1" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="SIP tenure time period slider in years"
          />
        </div>

        <article className="bg-dark-800 p-6 rounded-2xl border border-white/5 mt-8" aria-label="SIP returns projection outputs">
          <div className="grid grid-cols-2 gap-4 text-sm" role="status">
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
        </article>
      </aside>

      {/* Chart */}
      <section className="flex flex-col gap-6" aria-label="SIP progression visual charts">
        <article className="h-64 w-full bg-dark-900/50 rounded-xl p-4 border border-white/5 flex flex-col justify-between" aria-label="SIP progressive line chart">
          <div className="h-44 w-full">
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
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Area type="monotone" dataKey="Total" stroke="#d4af37" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="Invested" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInvested)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <p className="sr-only" aria-live="polite">
            {getAreaChartDescription()}
          </p>
          <div className="w-full text-left">
            <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 px-2 py-1 rounded border border-white/5">
              <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-400">Interpretation:</strong> {getAreaChartDescription()}
              </span>
            </span>
          </div>
        </article>
        
        <article className="h-48 w-full flex items-center justify-center bg-dark-900/50 rounded-xl p-4 border border-white/5" aria-label="SIP allocation ratio chart">
          <div className="h-full w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 w-1/3 pr-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" aria-hidden="true"></span><span className="text-xs text-gray-400 font-semibold uppercase">Invested</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gold-500" aria-hidden="true"></span><span className="text-xs text-gray-400 font-semibold uppercase">Returns</span></div>
          </div>
          
          <p className="sr-only" aria-live="polite">
            {getPieChartDescription()}
          </p>
        </article>
      </section>
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

  // Machine-readable data object for future AI agents
  const aiMachineEmiProfile = {
    loanPrincipalAmount: principal,
    annualInterestRatePercent: rate,
    tenureYears: years,
    monthlyEmiPayable: emi,
    totalInterestAccrued: totalInterest,
    totalAmountRepayable: totalAmount
  };

  // Structured plain-text description for Recharts PieChart
  const getEmiChartDescription = () => {
    const interestPercentage = totalAmount > 0 ? (totalInterest / totalAmount) * 100 : 0;
    return `EMI interest distribution PieChart: Principal borrowed constitutes ${Math.round(100 - interestPercentage)}% (₹${principal.toLocaleString('en-IN')}) of total repayment, while the bank's compound interest charge absorbs a staggering ${Math.round(interestPercentage)}% (₹${totalInterest.toLocaleString('en-IN')}) of your lifetime outlays.`;
  };

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      data-emi-profile={JSON.stringify(aiMachineEmiProfile)}
    >
      <aside className="space-y-6" aria-label="EMI input parameters">
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="emi-principal-slider" className="label-text">Loan Amount</label>
            <span className="text-gold-400 font-medium">{formatCurrency(principal)}</span>
          </div>
          <input 
            id="emi-principal-slider"
            type="range" 
            min="100000" 
            max="50000000" 
            step="100000" 
            value={principal} 
            onChange={(e) => setPrincipal(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="Loan Principal Borrowed amount slider"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="emi-rate-slider" className="label-text">Interest Rate (p.a)</label>
            <span className="text-gold-400 font-medium">{rate}%</span>
          </div>
          <input 
            id="emi-rate-slider"
            type="range" 
            min="5" 
            max="20" 
            step="0.1" 
            value={rate} 
            onChange={(e) => setRate(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="Annual Interest Rate percentage slider"
          />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="emi-years-slider" className="label-text">Loan Tenure</label>
            <span className="text-gold-400 font-medium">{years} Years</span>
          </div>
          <input 
            id="emi-years-slider"
            type="range" 
            min="1" 
            max="30" 
            step="1" 
            value={years} 
            onChange={(e) => setYears(Number(e.target.value))} 
            className="w-full accent-gold-500"
            aria-label="Loan tenure tenure slider in years"
          />
        </div>

        <article className="bg-dark-800 p-6 rounded-2xl border border-white/5 mt-8" aria-label="EMI calculation output metrics">
          <div className="grid grid-cols-2 gap-4 text-sm" role="status">
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
        </article>
      </aside>
      
      <section className="flex flex-col gap-6" aria-label="EMI visual distribution chart">
        <article className="h-64 w-full flex items-center justify-center bg-dark-900/50 rounded-xl p-4 border border-white/5" aria-label="EMI principal vs interest pie chart">
          <div className="h-full w-2/3">
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
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-4 w-1/3 pr-4">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-500" aria-hidden="true"></span><span className="text-xs text-gray-300 font-semibold uppercase">Principal</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500" aria-hidden="true"></span><span className="text-xs text-gray-300 font-semibold uppercase">Interest</span></div>
          </div>

          <p className="sr-only" aria-live="polite">
            {getEmiChartDescription()}
          </p>
        </article>
        
        <div className="w-full text-left">
          <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
            <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong className="text-gray-400">Interpretation:</strong> {getEmiChartDescription()}
            </span>
          </span>
        </div>
      </section>
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
    <main 
      className="container mx-auto px-6 max-w-5xl py-12 space-y-10 bg-dark-950 text-white"
      role="main"
    >
      <SEO 
        title="Financial Calculators"
        description="Plan your investments and loans with precision. Access the SIP returns simulator and EMI loan repayment calculator with interactive sliders."
        keywords="SIP calculator India, mutual fund SIP return calculator, loan EMI calculator, home loan emi, wealth projection simulator"
      />

      <header className="mb-10">
        <h1 className="heading-2 mb-4">Financial Calculators</h1>
        <p className="text-gray-400">Plan your investments and loans with precision.</p>
      </header>

      <section className="glass-panel p-6 md:p-10" aria-label="Interactive Calculators Suite">
        {/* Tabs list (Accessible tablist) */}
        <nav 
          role="tablist" 
          aria-label="Financial tools selector"
          className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`calc-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 font-semibold shadow' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div 
          id={`calc-panel-${activeTab}`}
          role="tabpanel"
          className="animate-fade-in"
        >
          {activeTab === 'sip' && <SIPCalculator />}
          {activeTab === 'emi' && <EMICalculator />}
        </div>
      </section>

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Compounding and Debt guidelines">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> Capital Compounding & Loan Structure Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. The Rule of 72 Compounding Math</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The **Rule of 72** is a fast shortcut to calculate when your money doubles under compound growth. Divide 72 by your expected annual return rate. At a standard NIFTY index yield of **12% per annum**, your capital doubles systematically every **6 years** (72 / 12 = 6).
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Front-loaded Home Loan EMIs</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Standard bank loan EMIs are heavily **front-loaded with interest**. In the first 5 to 7 years of a 20-year home loan, **up to 80% of your monthly EMI cash** is absorbed by interest charges, while only 20% pays down actual borrowed principal. This is why early prepayments save massive interest.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Prudent Loan Pre-payment Speed</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Prepaying just **one extra EMI principal value once a year** (or raising your monthly EMI by 5% yearly) reduces the tenure of a 20-year home loan by **nearly 4.5 years**, saving lakhs of rupees in interest drag and immediately boosting your overall Financial Wellness Score.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default Calculators;
