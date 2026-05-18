import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, AlertCircle, BookOpen, Info, ArrowRight } from 'lucide-react';
import SEO from '../components/common/SEO';

import { calculateTaxBreakdown } from '../tax-engine/taxCalculatorCore';
import { generateTaxInsights } from '../tax-engine/taxInsights';

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const TaxCalculator = () => {
  const [income, setIncome] = useState(1500000);
  const [hra, setHra] = useState(0);
  const [deduction80c, setDeduction80c] = useState(150000);
  const [deduction80d, setDeduction80d] = useState(25000);
  const [homeLoanInt, setHomeLoanInt] = useState(200000);
  const [otherDeductions, setOtherDeductions] = useState(50000);

  const inputs = {
    grossIncome: income,
    hra,
    deduction80c,
    deduction80d,
    homeLoanInterest: homeLoanInt,
    otherDeductions
  };

  const oldBreakdown = calculateTaxBreakdown(inputs, false);
  const newBreakdown = calculateTaxBreakdown(inputs, true);

  const rec = generateTaxInsights(
    oldBreakdown,
    newBreakdown,
    hra,
    deduction80c,
    deduction80d,
    homeLoanInt,
    otherDeductions
  );

  const oldTax = oldBreakdown.finalTax;
  const newTax = newBreakdown.finalTax;
  const savings = rec.savingsAmount;
  const recommendedRegime = rec.recommendedRegime;

  const chartData = [
    {
      name: 'Tax comparison',
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
      className="container mx-auto px-6 max-w-5xl py-12 space-y-10 animate-fade-in"
      role="main"
      data-tax-profile={JSON.stringify(aiMachineTaxProfile)}
    >
      <SEO 
        title="Tax Planner"
        description="Calculate and compare Indian Income Tax under Old vs New Tax Regimes for FY 2025-26. Optimize HRA, Section 80C, 80D, and Home Loan interest deductions."
        keywords="income tax calculator India, FY 2025-26 tax old vs new, AY 2026-27, HRA tax saving exemption, 80c deduction, home loan interest rebate"
      />

      <header className="text-center">
        <span className="text-[10px] bg-gold-500/10 text-gold-400 font-bold border border-gold-500/30 px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
          FY 2025-26 (AY 2026-27)
        </span>
        <h1 className="heading-2 mb-2">Indian Income Tax Decision Intelligence</h1>
        <p className="text-gray-400">Compare tax regimes under the latest Budget rules and discover dynamic optimization suggestions.</p>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tax-hra-slider" className="label-text mb-0">HRA Exemption</label>
                <input 
                  type="number" 
                  value={hra} 
                  onChange={(e) => setHra(Math.min(500000, Math.max(0, Number(e.target.value))))} 
                  className="bg-dark-900/60 border border-white/10 rounded px-2 py-0.5 text-xs text-gold-400 font-bold w-24 text-right focus:outline-none focus:border-gold-500"
                  aria-label="HRA Exemption value"
                />
              </div>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tax-80c-slider" className="label-text mb-0">80C (LIC, EPF, PPF, ELSS)</label>
                <input 
                  type="number" 
                  value={deduction80c} 
                  onChange={(e) => setDeduction80c(Math.min(150000, Math.max(0, Number(e.target.value))))} 
                  className="bg-dark-900/60 border border-white/10 rounded px-2 py-0.5 text-xs text-gold-400 font-bold w-24 text-right focus:outline-none focus:border-gold-500"
                  aria-label="Section 80C tax investments value"
                />
              </div>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tax-80d-slider" className="label-text mb-0">80D (Health Premium)</label>
                <input 
                  type="number" 
                  value={deduction80d} 
                  onChange={(e) => setDeduction80d(Math.min(100000, Math.max(0, Number(e.target.value))))} 
                  className="bg-dark-900/60 border border-white/10 rounded px-2 py-0.5 text-xs text-gold-400 font-bold w-24 text-right focus:outline-none focus:border-gold-500"
                  aria-label="Section 80D health deduction value"
                />
              </div>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tax-homeloan-slider" className="label-text mb-0">Home Loan Interest (Sec 24)</label>
                <input 
                  type="number" 
                  value={homeLoanInt} 
                  onChange={(e) => setHomeLoanInt(Math.min(200000, Math.max(0, Number(e.target.value))))} 
                  className="bg-dark-900/60 border border-white/10 rounded px-2 py-0.5 text-xs text-gold-400 font-bold w-24 text-right focus:outline-none focus:border-gold-500"
                  aria-label="Home loan interest deduction value"
                />
              </div>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tax-other-slider" className="label-text mb-0">Other Deductions (NPS, etc.)</label>
                <input 
                  type="number" 
                  value={otherDeductions} 
                  onChange={(e) => setOtherDeductions(Math.min(500000, Math.max(0, Number(e.target.value))))} 
                  className="bg-dark-900/60 border border-white/10 rounded px-2 py-0.5 text-xs text-gold-400 font-bold w-24 text-right focus:outline-none focus:border-gold-500"
                  aria-label="Other standard deductions value"
                />
              </div>
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl md:text-5xl font-display font-bold text-gold-400">{recommendedRegime}</span>
              <CheckCircle2 className="text-green-400 w-8 h-8" aria-hidden="true" />
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {rec.reasoning}
            </p>

            <p className="text-gray-300 flex items-center gap-2 text-sm" role="status">
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

          {/* Step-by-Step Tax Breakdown Grid */}
          <article className="glass-card p-6 md:p-8 space-y-4" aria-label="Step-by-Step Tax Comparison Breakdown">
            <div>
              <h3 className="text-md font-bold text-white">7-Step Transparent Tax Breakdown</h3>
              <p className="text-xs text-gray-500 mt-0.5">Compare exact tax calculation logic under both regimes side-by-side.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 uppercase font-semibold">
                    <th className="py-2.5">Calculation Step</th>
                    <th className="py-2.5 text-right">Old Regime</th>
                    <th className="py-2.5 text-right text-gold-400">New Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                  {/* Step 1 */}
                  <tr>
                    <td className="py-2.5">Step 1: Gross Annual Income</td>
                    <td className="py-2.5 text-right font-semibold text-white">{formatCurrency(income)}</td>
                    <td className="py-2.5 text-right font-semibold text-white">{formatCurrency(income)}</td>
                  </tr>
                  {/* Step 2 */}
                  <tr>
                    <td className="py-2.5">Step 2: Total Deductions / Exemptions</td>
                    <td className="py-2.5 text-right text-red-400">-{formatCurrency(oldBreakdown.deductions.totalDeductions)}</td>
                    <td className="py-2.5 text-right text-red-400">-{formatCurrency(newBreakdown.deductions.totalDeductions)}</td>
                  </tr>
                  <tr className="bg-white/5 text-[10px] text-gray-400">
                    <td className="py-1.5 pl-4">↳ Standard Deduction</td>
                    <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.standardDeduction)}</td>
                    <td className="py-1.5 text-right">-{formatCurrency(newBreakdown.deductions.standardDeduction)}</td>
                  </tr>
                  {oldBreakdown.deductions.hraExemption > 0 && (
                    <tr className="bg-white/5 text-[10px] text-gray-400">
                      <td className="py-1.5 pl-4">↳ HRA Exemption</td>
                      <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.hraExemption)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {oldBreakdown.deductions.sec80C > 0 && (
                    <tr className="bg-white/5 text-[10px] text-gray-400">
                      <td className="py-1.5 pl-4">↳ Section 80C</td>
                      <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.sec80C)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {oldBreakdown.deductions.sec80D > 0 && (
                    <tr className="bg-white/5 text-[10px] text-gray-400">
                      <td className="py-1.5 pl-4">↳ Section 80D (Health)</td>
                      <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.sec80D)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {oldBreakdown.deductions.homeLoanSec24 > 0 && (
                    <tr className="bg-white/5 text-[10px] text-gray-400">
                      <td className="py-1.5 pl-4">↳ Home Loan (Sec 24)</td>
                      <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.homeLoanSec24)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {oldBreakdown.deductions.otherDeductions > 0 && (
                    <tr className="bg-white/5 text-[10px] text-gray-400">
                      <td className="py-1.5 pl-4">↳ Other Deductions</td>
                      <td className="py-1.5 text-right">-{formatCurrency(oldBreakdown.deductions.otherDeductions)}</td>
                      <td className="py-1.5 text-right">-</td>
                    </tr>
                  )}
                  {/* Step 3 */}
                  <tr>
                    <td className="py-2.5">Step 3: Taxable Income</td>
                    <td className="py-2.5 text-right font-bold text-white">{formatCurrency(oldBreakdown.taxableIncome)}</td>
                    <td className="py-2.5 text-right font-bold text-gold-400">{formatCurrency(newBreakdown.taxableIncome)}</td>
                  </tr>
                  {/* Step 4 */}
                  <tr>
                    <td className="py-2.5">Step 4: Slab-wise Tax (Pre-Rebate)</td>
                    <td className="py-2.5 text-right">{formatCurrency(oldBreakdown.slabTax)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(newBreakdown.slabTax)}</td>
                  </tr>
                  {/* Step 5 */}
                  <tr>
                    <td className="py-2.5">Step 5: Sec 87A Rebate Applied</td>
                    <td className="py-2.5 text-right text-green-400">-{formatCurrency(oldBreakdown.rebateApplied)}</td>
                    <td className="py-2.5 text-right text-green-400">-{formatCurrency(newBreakdown.rebateApplied)}</td>
                  </tr>
                  {/* Step 6 */}
                  <tr>
                    <td className="py-2.5">Step 6: Health & Education Cess (4%)</td>
                    <td className="py-2.5 text-right">{formatCurrency(oldBreakdown.cess)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(newBreakdown.cess)}</td>
                  </tr>
                  {/* Step 7 */}
                  <tr className="border-t border-white/10 text-sm">
                    <td className="py-3 font-bold text-white">Step 7: Final Payable Tax</td>
                    <td className="py-3 text-right font-extrabold text-white">{formatCurrency(oldBreakdown.finalTax)}</td>
                    <td className="py-3 text-right font-extrabold text-gold-400">{formatCurrency(newBreakdown.finalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Rebate Explanation Banner */}
            {(oldBreakdown.rebateApplied > 0 || newBreakdown.rebateApplied > 0) && (
              <div className="p-3.5 bg-green-500/5 border border-green-500/20 rounded-xl text-[11px] text-green-400 leading-relaxed space-y-1">
                <span className="font-bold">📝 Rebate Calculations:</span>
                {oldBreakdown.rebateApplied > 0 && <p><strong>Old Regime:</strong> {oldBreakdown.rebateExplanation}</p>}
                {newBreakdown.rebateApplied > 0 && <p><strong>New Regime:</strong> {newBreakdown.rebateExplanation}</p>}
              </div>
            )}
          </article>

          {/* Tax Savings Opportunities */}
          {rec.insights.length > 0 && (
            <article className="glass-card p-6 md:p-8 space-y-4" aria-label="Tax Savings & Optimization Opportunities">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="text-gold-400 w-5 h-5" /> Tax Optimization Opportunities
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Custom, actionable pathways to legally minimize your tax liability.</p>
              </div>

              <div className="space-y-4">
                {rec.insights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:border-gold-500/20 transition-all text-xs">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      💡 {insight.title}
                    </span>
                    <p className="text-gray-300 leading-relaxed">{insight.description}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed italic"><span className="font-semibold not-italic">Tax Impact:</span> {insight.impact}</p>
                    <div className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                      <ArrowRight size={10} className="text-gold-400" /> Action: {insight.actionableStep}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

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

      {/* Light Disclaimer */}
      <footer className="text-[10px] text-gray-500 text-center leading-relaxed max-w-2xl mx-auto pt-6">
        <p>
          <strong>Disclaimer:</strong> Tax calculations and recommendations are illustrative estimates based on rules declared for FY 2025-26 (AY 2026-27). Actual liability may vary based on special income brackets (like long-term capital gains, surcharge triggers, or professional tax deductions). Consult a qualified tax professional before filing.
        </p>
      </footer>
      
    </main>
  );
};

export default TaxCalculator;
