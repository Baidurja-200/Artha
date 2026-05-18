import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, AlertCircle, BookOpen, Info } from 'lucide-react';
import SEO from '../components/common/SEO';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const TaxCalculator = () => {
  const [income, setIncome] = useState(1500000);
  const [hra, setHra] = useState(0);
  const [deduction80c, setDeduction80c] = useState(150000);
  const [deduction80d, setDeduction80d] = useState(25000);
  const [homeLoanInt, setHomeLoanInt] = useState(200000);
  const [otherDeductions, setOtherDeductions] = useState(50000);

  // Standard deduction
  const standardDeduction = 50000;

  // Calculate Old Regime Tax
  const calculateOldTax = () => {
    let taxable = income - standardDeduction - hra - Math.min(deduction80c, 150000) - deduction80d - Math.min(homeLoanInt, 200000) - otherDeductions;
    if (taxable <= 250000) return 0;
    if (taxable <= 500000) return 0; // Rebate u/s 87A

    let tax = 0;
    if (taxable > 1000000) {
      tax += (taxable - 1000000) * 0.3;
      tax += 500000 * 0.2;
      tax += 250000 * 0.05;
    } else if (taxable > 500000) {
      tax += (taxable - 500000) * 0.2;
      tax += 250000 * 0.05;
    } else {
      tax += (taxable - 250000) * 0.05;
    }
    return tax * 1.04; // 4% cess
  };

  // Calculate New Regime Tax (FY 2023-24 onwards)
  const calculateNewTax = () => {
    let taxable = income - standardDeduction; // New regime allows standard deduction now
    if (taxable <= 700000) return 0; // Rebate u/s 87A

    let tax = 0;
    if (taxable > 1500000) {
      tax += (taxable - 1500000) * 0.3;
      taxable = 1500000;
    }
    if (taxable > 1200000) {
      tax += (taxable - 1200000) * 0.2;
      taxable = 1200000;
    }
    if (taxable > 900000) {
      tax += (taxable - 900000) * 0.15;
      taxable = 900000;
    }
    if (taxable > 600000) {
      tax += (taxable - 600000) * 0.1;
      taxable = 600000;
    }
    if (taxable > 300000) {
      tax += (taxable - 300000) * 0.05;
    }
    return tax * 1.04; // 4% cess
  };

  const oldTax = calculateOldTax();
  const newTax = calculateNewTax();
  const savings = Math.abs(oldTax - newTax);
  const recommendedRegime = oldTax < newTax ? 'Old Regime' : 'New Regime';

  const chartData = [
    {
      name: 'Tax regimes comparison',
      'Old Regime': oldTax,
      'New Regime': newTax,
    }
  ];

  // Machine-readable data object for future AI agents
  const aiMachineTaxProfile = {
    grossAnnualIncome: income,
    hraExemption: hra,
    section80cAllocated: deduction80c,
    section80dAllocated: deduction80d,
    homeLoanInterestRebate: homeLoanInt,
    otherDeductions: otherDeductions,
    calculatedOldRegimeTax: oldTax,
    calculatedNewRegimeTax: newTax,
    netSavingsPossible: savings,
    optimalRegime: recommendedRegime
  };

  // Structured plain-text description for Recharts comparison chart
  const getChartDescription = () => {
    return `Old vs New Tax Regime bar chart: Gross Income is ₹${income.toLocaleString('en-IN')}. Under the Old Regime, your computed annual tax is ₹${Math.round(oldTax).toLocaleString('en-IN')}. Under the New Regime, your computed annual tax is ₹${Math.round(newTax).toLocaleString('en-IN')}. Choosing the ${recommendedRegime} saves you ₹${Math.round(savings).toLocaleString('en-IN')} annually.`;
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-5xl py-12 space-y-10"
      role="main"
      data-tax-profile={JSON.stringify(aiMachineTaxProfile)}
    >
      <SEO 
        title="Tax Planner"
        description="Calculate and compare Indian Income Tax under Old vs New Tax Regimes. Optimize HRA, Section 80C, 80D, and Home Loan interest deductions."
        keywords="income tax calculator India, FY 2023-24 tax old vs new, HRA tax saving exemption, 80c deduction, home loan interest rebate"
      />

      <header className="text-center">
        <h1 className="heading-2 mb-4">Indian Income Tax Planner</h1>
        <p className="text-gray-400">Compare Old vs New tax regimes and optimize your exemptions in real-time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <aside className="lg:col-span-5 space-y-6 glass-panel p-6 md:p-8" aria-label="Tax Exemption Parameters">
          <h2 className="heading-3 mb-6">Income & Deductions</h2>
          
          <div>
            <label htmlFor="tax-income-input" className="label-text">Gross Annual Income (₹)</label>
            <input 
              id="tax-income-input"
              type="number" 
              value={income} 
              onChange={(e) => setIncome(Number(e.target.value))} 
              className="input-field text-lg font-bold text-gold-400" 
              aria-label="Gross Annual Income in Rupees"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Exemptions & Deductions (Old Regime)</h3>
            
            <div>
              <label htmlFor="tax-hra-slider" className="label-text flex justify-between">HRA Exemption <span>{formatCurrency(hra)}</span></label>
              <input 
                id="tax-hra-slider"
                type="range" 
                min="0" 
                max="500000" 
                step="10000" 
                value={hra} 
                onChange={(e) => setHra(Number(e.target.value))} 
                className="w-full accent-gold-500"
                aria-label="House Rent Allowance Exemption"
              />
            </div>
            
            <div>
              <label htmlFor="tax-80c-slider" className="label-text flex justify-between">80C (LIC, EPF, PPF, ELSS) <span>{formatCurrency(deduction80c)}</span></label>
              <input 
                id="tax-80c-slider"
                type="range" 
                min="0" 
                max="150000" 
                step="5000" 
                value={deduction80c} 
                onChange={(e) => setDeduction80c(Number(e.target.value))} 
                className="w-full accent-gold-500"
                aria-label="Section 80C tax investments"
              />
            </div>
            
            <div>
              <label htmlFor="tax-80d-slider" className="label-text flex justify-between">80D (Health Insurance Premium) <span>{formatCurrency(deduction80d)}</span></label>
              <input 
                id="tax-80d-slider"
                type="range" 
                min="0" 
                max="100000" 
                step="5000" 
                value={deduction80d} 
                onChange={(e) => setDeduction80d(Number(e.target.value))} 
                className="w-full accent-gold-500"
                aria-label="Section 80D health insurance medical deductions"
              />
            </div>
            
            <div>
              <label htmlFor="tax-homeloan-slider" className="label-text flex justify-between">Home Loan Interest (Sec 24) <span>{formatCurrency(homeLoanInt)}</span></label>
              <input 
                id="tax-homeloan-slider"
                type="range" 
                min="0" 
                max="200000" 
                step="10000" 
                value={homeLoanInt} 
                onChange={(e) => setHomeLoanInt(Number(e.target.value))} 
                className="w-full accent-gold-500"
                aria-label="Home loan interest deduction rebate"
              />
            </div>
            
            <div>
              <label htmlFor="tax-other-slider" className="label-text flex justify-between">Other Deductions (NPS, etc.) <span>{formatCurrency(otherDeductions)}</span></label>
              <input 
                id="tax-other-slider"
                type="range" 
                min="0" 
                max="500000" 
                step="10000" 
                value={otherDeductions} 
                onChange={(e) => setOtherDeductions(Number(e.target.value))} 
                className="w-full accent-gold-500"
                aria-label="Other standard tax-saving deductions"
              />
            </div>
          </div>
        </aside>

        {/* Results Section */}
        <section className="lg:col-span-7 space-y-6" aria-label="Tax Comparison Results">
          
          {/* Recommendation Card */}
          <article className="glass-card p-6 md:p-8 bg-gradient-to-br from-dark-800 to-dark-900 border-gold-500/20 relative overflow-hidden" aria-label="Tax Recommendation Card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
            
            <h3 className="text-gray-400 font-medium mb-2">Recommended Regime</h3>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl md:text-5xl font-display font-bold text-gold-400">{recommendedRegime}</span>
              <CheckCircle2 className="text-green-400 w-8 h-8" aria-hidden="true" />
            </div>
            
            <p className="text-gray-300 flex items-center gap-2" role="status">
              <AlertCircle size={18} className="text-blue-400" aria-hidden="true" />
              <span>You save <strong className="text-white mx-1">{formatCurrency(savings)}</strong> by choosing the {recommendedRegime}.</span>
            </p>
          </article>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            <article className={`glass-card p-6 border-t-4 ${recommendedRegime === 'Old Regime' ? 'border-t-green-500' : 'border-t-dark-700'}`} aria-label="Old Tax Regime Details">
              <h3 className="text-gray-400 font-medium mb-2">Old Regime Tax</h3>
              <p className="text-3xl font-bold text-white mb-2">{formatCurrency(oldTax)}</p>
              <p className="text-sm text-gray-500">Effective Rate: {((oldTax / income) * 100).toFixed(1)}%</p>
            </article>
            <article className={`glass-card p-6 border-t-4 ${recommendedRegime === 'New Regime' ? 'border-t-green-500' : 'border-t-dark-700'}`} aria-label="New Tax Regime Details">
              <h3 className="text-gray-400 font-medium mb-2">New Regime Tax</h3>
              <p className="text-3xl font-bold text-white mb-2">{formatCurrency(newTax)}</p>
              <p className="text-sm text-gray-500">Effective Rate: {((newTax / income) * 100).toFixed(1)}%</p>
            </article>
          </div>

          {/* Chart */}
          <article className="glass-card p-6 h-72 flex flex-col justify-between" aria-label="Regime comparison graph visualizer">
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Old Regime" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
                  <Bar dataKey="New Regime" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Screen reader caption */}
            <p className="sr-only" aria-live="polite">
              {getChartDescription()}
            </p>
            <div className="w-full text-left">
              <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-400">Interpretation:</strong> {getChartDescription()}
                </span>
              </span>
            </div>
          </article>

        </section>
      </div>

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Indian Income Tax System Guidelines">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> Indian Income Tax Rules & Exemptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Section 80C Deduction Limits</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Under Section 80C of the Old Tax Regime, you can claim tax deductions up to exactly **₹1.5 Lakhs** per financial year. Common eligible investments include Employees' Provident Fund (EPF), Public Provident Fund (PPF), Equity Linked Savings Schemes (ELSS), Life Insurance premium outlays, and Principal repayment on Home Loans.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Section 80D Medical Cover</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Section 80D allows tax rebates on premiums paid for health insurance. You can claim up to **₹25,000** for self, spouse, and dependent children. An additional deduction of up to **₹25,000** (or **₹50,000** if senior citizens) can be claimed for health premiums paid for parents, offering critical tax shield protection.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Old vs New Tax Regimes</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The **Old Regime** offers higher tax slab rates but allows you to lower taxable income via exemptions (HRA, 80C, 80D, Sec 24 interest). The **New Regime** charges lower slab rates but removes nearly all standard deductions. If your total exemptions exceed ₹3.75 Lakhs, the Old Regime is typically optimal.
            </p>
          </article>
        </div>
      </section>
      
    </main>
  );
};

export default TaxCalculator;
