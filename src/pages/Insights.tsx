import React, { useState } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { generateSmartInsights, getFinancialStressScore, getTopPriorities } from '../insights/insightGenerator';
import { Target, AlertTriangle, AlertCircle, Heart, Lightbulb, TrendingUp, Calendar, Zap, ArrowRight, ShieldAlert, Sparkles, BookOpen, Info } from 'lucide-react';

const Insights = () => {
  const { profile, investments, getWellnessMetrics, expenses } = useFinanceStore();
  const metrics = getWellnessMetrics();
  
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Generate intelligence outputs
  const stressInfo = getFinancialStressScore(profile, investments, metrics);
  const priorities = getTopPriorities(metrics, profile, investments, expenses);
  const smartInsights = generateSmartInsights(metrics, profile, investments, expenses);

  // Calculate monthly stats for review
  const monthlyIncome = profile.monthlyIncome || 1;
  const monthlyExpenses = profile.monthlyExpenses || 0;
  const debtEMI = profile.debtEMI || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;
  
  // Calculate total logged expenses
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Format Recharts/dial offset for stress score
  const stressOffset = 440 - (440 * stressInfo.score) / 100;

  // Machine-readable data object for future AI agents
  const aiMachineInsightsProfile = {
    stressScore: stressInfo.score,
    stressLevel: stressInfo.label,
    topPriorityIssues: priorities.map(p => ({ title: p.title, issue: p.issue, solution: p.solution })),
    netSmartInsightsCount: smartInsights.length,
    savingsRatePercentage: Math.round(savingsRate),
    debtToIncomeRatio: Math.round((debtEMI / monthlyIncome) * 100)
  };

  // Structured plain-text description for the Stress Gauge
  const getStressDescription = () => {
    return `Financial Stress Indicator reads ${stressInfo.score}% (${stressInfo.label} vulnerability level). Description: ${stressInfo.why}`;
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-insights-profile={JSON.stringify(aiMachineInsightsProfile)}
    >
      <SEO 
        title="Decision Insights"
        description="Explore explainable personal finance insights, ranked priorities, monthly briefings, and color-coded financial stress diagnostics."
        keywords="decision intelligence tools, monthly financial reviews, debt avalanche, financial stress indicator, priority stack"
      />
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Decision Intelligence Hub</h1>
          <p className="text-gray-400">Unlock explainable observations, supportive stress diagnostics, and ranked prioritizations.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stress Indicator & Monthly Review */}
          <section className="lg:col-span-5 space-y-6" aria-label="Financial Stress & Monthly Summary">
            
            {/* Financial Stress Indicator */}
            <article className="glass-card p-6 border-white/5 space-y-4" aria-label="Financial Stress Diagnostics">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="text-gold-400" /> Financial Stress Indicator
                </h2>
                <p className="text-xs text-gray-500 mt-1">Evaluates structural vulnerabilities using debt EMI ratio, runway, and cash buffer.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-dark-900/60 rounded-2xl border border-white/5">
                {/* Radial Gauge */}
                <div className="relative w-28 h-28 flex-shrink-0" aria-label={`Stress score dial reading ${stressInfo.score}%`}>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                    <circle cx="80" cy="80" r="70" className="stroke-dark-800" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      className="stroke-red-500 transition-all duration-700 ease-out" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round"
                      style={{ 
                        strokeDasharray: 440,
                        strokeDashoffset: stressOffset,
                        stroke: stressInfo.score < 25 ? '#10b981' : stressInfo.score < 50 ? '#3b82f6' : stressInfo.score < 75 ? '#fbbf24' : '#ef4444'
                      }} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stressInfo.score}%</span>
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${stressInfo.color}`}>
                      {stressInfo.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-1" role="status">
                  <span className="text-xs text-gray-500 font-semibold block uppercase">Vulnerability diagnostic:</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {stressInfo.why}
                  </p>
                </div>
              </div>
              
              {/* Screen reader caption */}
              <p className="sr-only">
                {getStressDescription()}
              </p>
              <div className="w-full text-left">
                <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                  <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-gray-400">Interpretation:</strong> {getStressDescription()}
                  </span>
                </span>
              </div>

              <div className="p-3.5 bg-gold-500/5 border border-gold-500/10 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-gold-400 flex items-center gap-1.5">
                  <Heart size={13} /> Supportive Guidance:
                </span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {stressInfo.tip}
                </p>
              </div>
            </article>

            {/* Monthly Financial Review System */}
            <article className="glass-card p-6 border-white/5 space-y-4" aria-label="Monthly Executive Review Briefing">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="text-gold-400" /> Monthly Financial Review
                </h2>
                <span className="text-[10px] text-gold-400 font-semibold bg-gold-500/10 px-2.5 py-0.5 rounded border border-gold-500/20" role="status">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                A short, readable, actionable assessment of this month's financial behavior compared to standard targets.
              </p>

              <div className="space-y-3.5">
                {/* 1. Spending Changes */}
                <section className="flex gap-3 items-start bg-dark-900/50 p-3 rounded-xl border border-white/5 text-xs" aria-label="Review: Spending">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gold-400 font-bold" aria-hidden="true">1</div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-white block">Monthly Spending Discipline</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Actual logged expenses stand at ₹{totalSpent.toLocaleString('en-IN')}. 
                      {totalSpent > monthlyExpenses 
                        ? ` You have exceeded your regular budget target of ₹${monthlyExpenses.toLocaleString('en-IN')} by ₹${(totalSpent - monthlyExpenses).toLocaleString('en-IN')}. Focus on lifestyle Wants to trim outlays.`
                        : ` You are comfortably operating within your ₹${monthlyExpenses.toLocaleString('en-IN')} living target. Excellent restraint!`
                      }
                    </p>
                  </div>
                </section>

                {/* 2. Savings Rate */}
                <section className="flex gap-3 items-start bg-dark-900/50 p-3 rounded-xl border border-white/5 text-xs" aria-label="Review: Savings">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gold-400 font-bold" aria-hidden="true">2</div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-white block">Savings Rate Consistency</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Your current monthly surplus is ₹{monthlySurplus.toLocaleString('en-IN')}, representing an active savings rate of {Math.round(savingsRate)}%. 
                      {savingsRate >= 20 
                        ? ' Your savings rate is healthy, successfully providing the raw fuel to outpace inflation.'
                        : ' Your rate is below the 20% safe zone. Lifestyle inflation or loan debt is reducing savings sustainability.'
                      }
                    </p>
                  </div>
                </section>

                {/* 3. Debt changes */}
                <section className="flex gap-3 items-start bg-dark-900/50 p-3 rounded-xl border border-white/5 text-xs" aria-label="Review: Debt">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gold-400 font-bold" aria-hidden="true">3</div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-white block">Debt Commitment Status</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Loan commitments absorb ₹{debtEMI.toLocaleString('en-IN')} monthly. Your Debt-to-Income ratio is {Math.round((debtEMI / monthlyIncome) * 100)}%. 
                      {debtEMI > 0 
                        ? ' Keeping outstanding credit balances flat and making pre-payments will raise your overall Wellness Score.'
                        : ' Outstanding! You enjoy 100% protection from interest rate hikes and credit drags.'
                      }
                    </p>
                  </div>
                </section>

                {/* 4. Investment Consistency */}
                <section className="flex gap-3 items-start bg-dark-900/50 p-3 rounded-xl border border-white/5 text-xs" aria-label="Review: Investments">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-gold-400 font-bold" aria-hidden="true">4</div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-white block">Wealth SIP Momentum</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Automated SIP investments compound ₹{totalSIP.toLocaleString('en-IN')} monthly. 
                      {totalSIP > 0 
                        ? ' This systematic commitment guarantees you are buying index and equity assets regularly, successfully averaging out market volatility.'
                        : ' You have no active SIPs. Bank savings yield 3%, while inflation runs at 6%. We recommend automating a basic index mutual fund SIP.'
                      }
                    </p>
                  </div>
                </section>
              </div>
            </article>

          </section>

          {/* Right Column: Priorities and Explainable Insights */}
          <section className="lg:col-span-7 space-y-6" aria-label="Action Priorities & Diagnostic breakdown">
            
            {/* Dynamic Priorities Stack */}
            <article className="glass-card p-6 border-gold-500/10 space-y-4" aria-label="Ranked Priorities Stack">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="text-gold-400" /> Calm Financial Priority Stack
                </h2>
                <p className="text-xs text-gray-500 mt-1">We analyzed your overall variables. Renders only the top 1-3 items to focus on what matters most.</p>
              </div>

              <div className="space-y-3.5">
                {priorities.map((prio, idx) => (
                  <div 
                    key={prio.id} 
                    className={`border rounded-2xl p-5 relative overflow-hidden group hover:border-gold-500/30 transition-all ${prio.color}`}
                  >
                    <div className="absolute top-0 right-0 bg-dark-900/80 text-[10px] text-gray-400 font-bold px-3 py-1 rounded-bl-lg border-b border-l border-white/5 group-hover:text-gold-400 transition-colors">
                      PRIORITY {idx + 1}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${prio.badgeColor}`} role="status">
                        {prio.importance}
                      </span>
                      <h3 className="text-base font-bold text-white">{prio.title}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-0.5">The Issue</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{prio.issue}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-0.5">Why it matters</span>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {prio.id === 'prio_emergency' 
                            ? 'Without a solid runway, job disruption forces forced liquidations of investments at a loss.'
                            : prio.id === 'prio_debt'
                            ? 'High loan commitments drain monthly cash surplus and restrict future investing speed.'
                            : 'Failing to retain surplus cash means inflation is actively eroding your wealth.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-start gap-2.5">
                      <ArrowRight size={15} className="text-gold-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gold-200 font-medium leading-relaxed">
                        <span className="font-semibold text-gold-400">Action:</span> {prio.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Smart Explainable Insights */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="text-gold-400" /> Explainable Diagnostic Insights
              </h2>

              <div className="space-y-3">
                {smartInsights.map((insight) => {
                  const isExpanded = expandedInsight === insight.id;
                  
                  return (
                    <article 
                      key={insight.id} 
                      className="glass-card border border-white/5 overflow-hidden transition-all duration-300"
                    >
                      <button 
                        onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                        aria-expanded={isExpanded}
                        aria-controls={`insight-expand-${insight.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            insight.type === 'critical' || insight.type === 'danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                            insight.type === 'warning' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          }`} aria-hidden="true"></span>
                          <span className="text-sm font-semibold text-white">{insight.title}</span>
                        </div>
                        <span className="text-xs text-gold-400 font-semibold underline">
                          {isExpanded ? 'Hide Details' : 'Explain'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div 
                          id={`insight-expand-${insight.id}`}
                          className="p-4 pt-0 border-t border-white/5 bg-dark-900/30 space-y-4 animate-fade-in"
                        >
                          <p className="text-xs text-gray-300 leading-relaxed mt-3">
                            {insight.text}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">What it means:</h4>
                              <p className="text-gray-300 leading-relaxed">{insight.what}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">Why it matters:</h4>
                              <p className="text-gray-300 leading-relaxed">{insight.why}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-gold-500/5 border border-gold-500/10 rounded-xl text-xs">
                            <span className="font-semibold text-gold-400 flex items-center gap-1 mb-1">
                              <Sparkles size={12} /> Recommended Action helps:
                            </span>
                            <p className="text-gray-200 leading-relaxed">{insight.action}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

          </section>

        </div>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Decision Intelligence Educational Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Decision Intelligence and Priority Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Debt Avalanche vs Debt Snowball</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Aggressive loan repayment is key. The **Debt Avalanche method** ranks outstanding credit liabilities by interest rate, prepaying the highest-cost debt first (credit card credit balances at 24%+). The **Debt Snowball method** ranks them by size, prepaying the smallest loan balance first to secure immediate behavioral wins.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Debt-to-Income (DTI) Danger Levels</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Debt-to-Income (DTI) represents the percentage of monthly paycheck cash absorbed by mandatory debt EMIs. Operating at a **DTI below 20%** is healthy. Operative levels between **20% and 40%** require cautious budgeting, while **levels over 40% represent a Critical credit trap** that constricts flexibility.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Behavioral Cashflow Psychology</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Financial wellness is not driven by complex mathematics; it is driven by consistent habits. Renders only the top **1-3 priority focus items** prevents information overload, allowing you to ignore short-term market noise and make calm, structured structural decisions.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Insights;
