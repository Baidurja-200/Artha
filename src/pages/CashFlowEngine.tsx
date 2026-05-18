import React, { useState } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PiggyBank, ShieldCheck, Heart, Sparkles, TrendingUp, AlertTriangle, ArrowRight, IndianRupee, BookOpen, Info } from 'lucide-react';

const CashFlowEngine = () => {
  const { profile, investments, getCashFlowForecast } = useFinanceStore();
  
  // Local commitment calculator state
  const [newEMI, setNewEMI] = useState('');
  const [newSip, setNewSip] = useState('');

  const monthlyIncome = profile.monthlyIncome || 1;
  const monthlyExpenses = profile.monthlyExpenses || 0;
  const debtEMI = profile.debtEMI || 0;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // Primary Cash Flow Variables
  const monthlySurplus = monthlyIncome - monthlyExpenses - debtEMI;
  const savingsRate = (monthlySurplus / monthlyIncome) * 100;
  const cashRemaining = monthlySurplus - totalSIP;

  // Set up Recharts data for Stacked Inflows vs Outflows
  const chartData = [
    {
      name: 'Monthly Cash Inflow',
      'Active Salary / Income': monthlyIncome,
      amt: monthlyIncome
    },
    {
      name: 'Cash Allocations',
      'Living Expenses': monthlyExpenses,
      'Debt EMIs': debtEMI,
      'SIP Investments': totalSIP,
      'Remaining Surplus (Cash)': Math.max(0, cashRemaining),
      amt: monthlyIncome
    }
  ];

  // Custom colors matching the gold dark luxury theme
  const colors = {
    income: '#d4af37',      // Gold
    expenses: '#374151',    // Dark grey
    emi: '#ef4444',         // Red
    sip: '#3b82f6',         // Blue
    surplus: '#10b981'      // Emerald green
  };

  // Generate Savings Sustainability Insights
  const getSustainabilityInsight = () => {
    if (savingsRate < 10) {
      return {
        status: 'Critical / High Vulnerability',
        color: 'text-red-400 border-red-500/20 bg-red-500/5',
        text: 'Your current spending and loan obligations consume nearly your entire salary. This high-consumption behavior leaves zero buffer, meaning a minor salary delay or emergency will trigger a debt cycle, and your timeline for goal completion is severely set back.',
        advice: 'Pause all non-essential shopping immediately. Try adopting a cash diet for a month, prepay your smallest loan to clear an EMI, and auto-transfer 10% of your next salary to savings the hour you are paid.'
      };
    }
    if (savingsRate < 20) {
      return {
        status: 'Tight / Moderate Risk',
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
        text: 'You maintain a modest savings rate, but you are vulnerable to inflation. Price rises in medical, rental, or child schooling costs in India could easily wipe out your current surplus, forcing you to slow down your wealth SIPs.',
        advice: 'Try auditing your utility bills, subscription bills, and dining deliveries. Trim ₹3,000 from discretionary habits and redirect it to your emergency fund or long-term investments.'
      };
    }
    if (savingsRate < 35) {
      return {
        status: 'Healthy & Sustainable',
        color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        text: 'Your cash flow structure is highly resilient. You successfully save and invest over 20% of your earnings, which beats the traditional Indian household savings average. This ensures you are consistently building wealth without compromising your current lifestyle quality.',
        advice: 'Maintain this beautiful balance. You are in a perfect position to boost your SIP amount by 10% every time you get a salary increment.'
      };
    }
    return {
      status: 'Elite Wealth Compounding',
      color: 'text-green-400 border-green-500/20 bg-green-500/5',
      text: 'You are in the top tier of wealth builders. Retaining over 35% of income provides immense compounding velocity. You are rapidly compressing the years needed to achieve complete financial freedom and escape the active paycheck cycle.',
      advice: 'Ensure this surplus is put to work in diversified equity or debt assets rather than sitting in a low-interest bank account. Explore index mutual funds or flexi-cap options.'
    };
  };

  // Generate Financial Flexibility Indicators
  const getFlexibilityIndicator = () => {
    const fixedObligations = monthlyExpenses + debtEMI;
    const fixedRatio = (fixedObligations / monthlyIncome) * 100;

    if (fixedRatio > 70) {
      return {
        label: 'Highly Rigid (Low Freedom)',
        badgeColor: 'bg-red-400/10 text-red-400 border border-red-500/20',
        text: `Over ${Math.round(fixedRatio)}% of your active income is pre-committed to fixed bills and EMIs before the month even begins. This leaves you with very little "financial breathing room" to act on new opportunities, take career risks, or travel.`,
        tip: 'Focus on reducing fixed costs. Can you move to a slightly cheaper flat, or prepay outstanding EMI loans? Freeing up fixed overheads is the fastest way to buy peace of mind.'
      };
    }
    if (fixedRatio > 45) {
      return {
        label: 'Moderately Flexible',
        badgeColor: 'bg-yellow-400/10 text-yellow-400 border border-yellow-500/20',
        text: `Your fixed expenses eat up ${Math.round(fixedRatio)}% of your income. You have fair breathing room, but must be cautious about adding new commitments (like car loans or expensive gym memberships) that lock you into high recurring outflows.`,
        tip: 'Before signing up for new EMI plans or long rental leases, calculate their impact on your freedom. Prefer buying items outright rather than signing up for long-term EMIs.'
      };
    }
    return {
      label: 'High Flexibility (Complete Freedom)',
      badgeColor: 'bg-green-400/10 text-green-400 border border-green-500/20',
      text: `Outstanding! Less than 45% of your income is locked into fixed overheads. You have enormous control over your cash flow. If your active income were to drop by half, you could still survive comfortably without going into debt.`,
      tip: 'This flexibility is your superpower. Utilize this structural advantage to compound wealth aggressively or seed a startup fund.'
    };
  };

  const sustainability = getSustainabilityInsight();
  const flexibility = getFlexibilityIndicator();

  // commitment impact simulator
  const simNewEMI = Number(newEMI) || 0;
  const simNewSip = Number(newSip) || 0;
  const simRemainingSurplus = monthlySurplus - simNewEMI;
  const simSavingsRate = (simRemainingSurplus / monthlyIncome) * 100;
  const simCashRemaining = simRemainingSurplus - (totalSIP + simNewSip);

  // Machine-readable profile for AI scrapers
  const aiMachineCashflowProfile = {
    monthlyIncome,
    fixedLivingOutflow: monthlyExpenses,
    debtEMIOutflow: debtEMI,
    sipInvestOutflow: totalSIP,
    netBreathingRoom: monthlySurplus,
    activeSavingsRate: Math.round(savingsRate),
    unallocatedCashRemaining: cashRemaining,
    flexibilityLabel: flexibility.label,
    sustainabilityOutlook: sustainability.status
  };

  // Structured plain-text description for Recharts stacked bar
  const getChartDescription = () => {
    return `Inflow vs Allocation stacked chart: Your total active inflow is ₹${monthlyIncome.toLocaleString('en-IN')}. In contrast, your total allocations are: ₹${monthlyExpenses.toLocaleString('en-IN')} for core living expenses, ₹${debtEMI.toLocaleString('en-IN')} for loan EMIs, ₹${totalSIP.toLocaleString('en-IN')} for compounding SIPs, leaving ₹${Math.max(0, cashRemaining).toLocaleString('en-IN')} as unallocated liquid surplus.`;
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-cashflow-profile={JSON.stringify(aiMachineCashflowProfile)}
    >
      <SEO 
        title="Cash Flow & Savings Analyzer"
        description="Analyze active inflows, recurring outflows, EMIs, and SIP wealth-creation to calculate sustainability, flexibility, and test commitment additions."
        keywords="cash flow matching, cash drag, discretionary outflows, fixed overheads, commitment stress testing"
      />
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Cash Flow & Savings Analyzer</h1>
          <p className="text-gray-400">Analyze your monthly structural surplus, sustainability of spending, and capital breathing room.</p>
        </header>

        {/* Top visual metrics split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stacked Bar Chart Inflows vs Outflows */}
          <section className="lg:col-span-6 glass-card p-6 border-white/5 flex flex-col justify-between h-[450px]" aria-label="Visual Allocation Stack">
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Inflow vs Allocation Stack</h2>
              <p className="text-xs text-gray-500 mt-1">See how much of your hard-earned income is directed to wealth generation vs lifestyle expenses.</p>
            </div>

            <div className="w-full h-72" aria-label="Visual Bar Chart Allocation Stack">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value, name) => [`₹ ${Number(value).toLocaleString('en-IN')}`, name]}
                  />
                  {/* Left Bar: Income */}
                  <Bar dataKey="Active Salary / Income" stackId="a" fill={colors.income} radius={[8, 8, 0, 0]} barSize={50} />
                  
                  {/* Right Bar: Stacked allocations */}
                  <Bar dataKey="Living Expenses" stackId="b" fill={colors.expenses} barSize={50} />
                  <Bar dataKey="Debt EMIs" stackId="b" fill={colors.emi} barSize={50} />
                  <Bar dataKey="SIP Investments" stackId="b" fill={colors.sip} barSize={50} />
                  <Bar dataKey="Remaining Surplus (Cash)" stackId="b" fill={colors.surplus} radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom chart legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-dark-900/60 p-3 rounded-xl border border-white/5 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.income }}></span><span>Active Income</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.expenses }}></span><span>Core Living</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.emi }}></span><span>Loan EMIs</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.sip }}></span><span>Equity SIPs</span></div>
            </div>
            
            {/* Screen reader caption */}
            <p className="sr-only" aria-live="polite">
              {getChartDescription()}
            </p>
            <div className="w-full text-left mt-2">
              <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong className="text-gray-400">Visual Interpretation:</strong> {getChartDescription()}
                </span>
              </span>
            </div>
          </section>

          {/* Right Column: Diagnostic & Surplus analysis */}
          <section className="lg:col-span-6 space-y-6" aria-label="Breathing Room Analysis">
            
            {/* Core numbers dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <article className="glass-card p-5 border-white/5">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Monthly Surplus (Cash left)</h3>
                <p className="text-2xl font-bold text-white">₹ {monthlySurplus.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Active income minus living expenses and loan commitments. Represents your core saving power.
                </p>
              </article>

              <article className="glass-card p-5 border-white/5">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active Savings Rate</h3>
                <p className="text-2xl font-bold text-gold-400">{Math.round(savingsRate)}%</p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Percentage of active earnings retained. Standard personal finance recommends saving at least 20%.
                </p>
              </article>

              <article className="glass-card p-5 border-white/5">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">SIP Wealth Commitment</h3>
                <p className="text-2xl font-bold text-blue-400">₹ {totalSIP.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Amount automated into mutual fund compounding. Represents your wealth-creation momentum.
                </p>
              </article>

              <article className="glass-card p-5 border-white/5">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Idle Monthly Cash</h3>
                <p className={`text-2xl font-bold ${cashRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹ {cashRemaining.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Cash left after living expenses, EMIs, and SIP commitments. Safe but losing purchasing power to inflation.
                </p>
              </article>

            </div>

            {/* Savings Sustainability Analysis */}
            <article className="glass-card p-6 border-white/5 space-y-4" aria-label="Savings Outlook and Guidance">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <PiggyBank className="text-gold-400" /> Savings Sustainability Insight
              </h2>
              
              <div className={`p-4 border rounded-2xl space-y-2 leading-relaxed ${sustainability.color}`} role="status">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span>Current Outlook:</span>
                  <span>{sustainability.status}</span>
                </div>
                <p className="text-sm text-gray-200">
                  {sustainability.text}
                </p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-400 leading-relaxed">
                <span className="font-semibold text-gold-400 block mb-1">Human Advice:</span>
                {sustainability.advice}
              </div>
            </article>

          </section>

        </div>

        {/* Predictive Cash Flow Projections */}
        {(() => {
          const forecast = getCashFlowForecast(6);

          return (
            <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Predictive Cash Flow Projections">
              <div>
                <h2 className="heading-3 flex items-center gap-2">
                  <TrendingUp className="text-gold-400" /> 6-Month Predictive Cash Flow Forecast
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Forward-looking projections using a {forecast.expenseTrendPct.toFixed(1)}% MoM expense trend.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timeline Grid */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {forecast.forecastTimeline.map((item, index) => {
                      const stressColor = item.stressFactor > 75 ? 'text-red-400' : item.stressFactor > 50 ? 'text-yellow-400' : 'text-green-400';
                      
                      return (
                        <div key={index} className="bg-dark-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-gold-500/20 transition-colors">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{item.monthName}</span>
                          <div className="my-3">
                            <p className="text-[9px] text-gray-500 font-medium">Expenses</p>
                            <p className="text-xs font-semibold text-white">₹{item.projectedExpenses.toLocaleString('en-IN')}</p>
                            <p className="text-[9px] text-gray-500 font-medium mt-1">Surplus</p>
                            <p className={`text-xs font-semibold ${item.projectedSurplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ₹{item.projectedSurplus.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div>
                            <div className="w-full bg-dark-800 h-1 rounded-full overflow-hidden mb-1">
                              <div className={`h-full ${item.projectedSurplus >= 0 ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: `${Math.max(0, 100 - item.stressFactor)}%` }}></div>
                            </div>
                            <span className="text-[8px] text-gray-400">Stress: <span className={`font-semibold ${stressColor}`}>{item.stressFactor}%</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-gray-400 flex items-start gap-2 leading-relaxed">
                    <Info size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Forecasting Methodology:</strong> Projections calculate lifestyle inflation based on monthly discretionary fluctuations. It serves as an early-warning diagnostic mechanism to highlight weeks where active SIP debit allocations may suffer liquidity constraints.
                    </p>
                  </div>
                </div>

                {/* Forecaster Insights Column */}
                <div className="lg:col-span-5 space-y-4">
                  {forecast.insights.map((insight, idx) => (
                    <article key={idx} className="glass-card p-5 border-white/5 space-y-2 hover:border-gold-500/25 transition-colors">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles size={14} className="text-gold-400" /> {insight.title}
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{insight.description}</p>
                      <p className="text-xs text-gray-300 leading-relaxed bg-dark-950/50 p-2.5 rounded-lg border border-white/5">
                        <span className="font-semibold text-red-400 block mb-0.5">Impact:</span>
                        {insight.impact}
                      </p>
                      <div className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <ArrowRight size={10} /> Action: {insight.advice}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Financial Flexibility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-white/5">
          
          {/* Left Column: Fixed vs Flexible description */}
          <section className="lg:col-span-7 glass-card p-6 border-white/5 space-y-4" aria-label="Capital Flexibility Audit">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-gold-400" /> Capital Flexibility Indicator
            </h2>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-medium">Flexibility Grade:</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${flexibility.badgeColor}`} role="status">
                {flexibility.label}
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {flexibility.text}
            </p>

            <div className="p-4 bg-dark-900/60 rounded-xl border border-white/5 space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-gold-400" /> Key Freedom Tip
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {flexibility.tip}
              </p>
            </div>
          </section>

          {/* Right Column: New Commitment Impact Simulator */}
          <section className="lg:col-span-5 glass-card p-6 border-white/5 space-y-4" aria-label="Future Commitments Simulator">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-gold-400" /> Commitments Stress Simulator
              </h2>
              <p className="text-xs text-gray-400 mt-1">Simulate the cash flow impact of a new car EMI or SIP upgrade before signing up.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sim-emi" className="text-xs text-gray-400 font-medium block mb-1">Add New Loan EMI (₹)</label>
                <input 
                  id="sim-emi"
                  type="number"
                  placeholder="e.g. 12000"
                  value={newEMI}
                  onChange={(e) => setNewEMI(e.target.value)}
                  className="input-field text-xs py-1.5"
                  min="0"
                  aria-label="Simulated new loan monthly EMI amount"
                />
              </div>
              <div>
                <label htmlFor="sim-sip" className="text-xs text-gray-400 font-medium block mb-1">Add New SIP Commit (₹)</label>
                <input 
                  id="sim-sip"
                  type="number"
                  placeholder="e.g. 5000"
                  value={newSip}
                  onChange={(e) => setNewSip(e.target.value)}
                  className="input-field text-xs py-1.5"
                  min="0"
                  aria-label="Simulated new SIP commitment amount"
                />
              </div>
            </div>

            {/* Sim Preview */}
            <div className="p-4 bg-dark-900 rounded-xl border border-white/5 text-xs space-y-2" role="status" aria-live="polite">
              <div className="flex justify-between">
                <span className="text-gray-500">Simulated Savings Surplus:</span>
                <span className={`font-semibold ${simRemainingSurplus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹ {Math.max(0, simRemainingSurplus).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Simulated Savings Rate:</span>
                <span className="font-semibold text-white">
                  {Math.round(Math.max(0, simSavingsRate))}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Simulated Idle Cash:</span>
                <span className={`font-semibold ${simCashRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹ {simCashRemaining.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Stress evaluation */}
              <div className="h-px bg-white/5 my-2"></div>
              <div className="text-[10px] leading-relaxed text-gray-400">
                {simCashRemaining < 0 ? (
                  <span className="text-red-400 font-medium block">
                    🚨 Warning: This commitment will push your cash flow negative (₹{Math.abs(simCashRemaining).toLocaleString('en-IN')} shortfall). You would be forced to withdraw savings to survive.
                  </span>
                ) : simSavingsRate < 15 ? (
                  <span className="text-yellow-400 font-medium block">
                    ⚠️ Pushes savings rate to {Math.round(simSavingsRate)}% (under the 20% safe zone). You will be left with little room for unpredictable market events.
                  </span>
                ) : (
                  <span className="text-green-400 font-medium block">
                    ✅ Safe: Your cash flow remains resilient and comfortably supports this additional commitment!
                  </span>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Cashflow Management Principles Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Cash Flow matching and Balance Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Core Fixed Costs vs Variable Costs</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Core Fixed costs are recurring obligations that cannot be minimized in the short term (rent, home EMIs, basic food, child school fees). Keeping fixed costs below **50% of monthly income** guarantees long-term freedom. High fixed costs lock you in a rigidity trap, forcing career stagnation.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Hidden cash drag on savings accounts</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Many Indian salary earners maintain high cash surplus sitting passive inside savings bank accounts. Yielding a standard **3-4% interest**, this cash fails to beat the structural **6% inflation rate**. This results in a stealth reduction in your cash's true purchasing power, representing a cash-drag.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Pacing new commitments</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Before purchasing high-end cars or taking long apartment leases on credit, run a structural stress test. A new commitment should never depress your net savings rate under **15%**. Maintaining high breathing room is what allows you to survive career pauses, seed startups, or ride stock dips safely.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default CashFlowEngine;
