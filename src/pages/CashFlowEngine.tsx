import React, { useState } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PiggyBank, ShieldCheck, Heart, Sparkles, TrendingUp, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';

const CashFlowEngine = () => {
  const { profile, investments } = useFinanceStore();
  
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

  return (
    <div className="min-h-screen bg-dark-950 text-white pb-20">
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Cash Flow & Savings Analyzer</h1>
          <p className="text-gray-400">Analyze your monthly structural surplus, sustainability of spending, and capital breathing room.</p>
        </div>

        {/* Top visual metrics split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Stacked Bar Chart Inflows vs Outflows */}
          <div className="lg:col-span-6 glass-card p-6 border-white/5 flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Inflow vs Allocation Stack</h3>
              <p className="text-xs text-gray-500 mt-1">See how much of your hard-earned income is directed to wealth generation vs lifestyle expenses.</p>
            </div>

            <div className="w-full h-72">
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
          </div>

          {/* Right Column: Diagnostic & Surplus analysis */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Core numbers dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="glass-card p-5 border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Monthly Surplus (Cash left)</p>
                <h3 className="text-2xl font-bold text-white">₹ {monthlySurplus.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Active income minus living expenses and loan commitments. Represents your core saving power.
                </p>
              </div>

              <div className="glass-card p-5 border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active Savings Rate</p>
                <h3 className="text-2xl font-bold text-gold-400">{Math.round(savingsRate)}%</h3>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Percentage of active earnings retained. Standard personal finance recommends saving at least 20%.
                </p>
              </div>

              <div className="glass-card p-5 border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">SIP Wealth Commitment</p>
                <h3 className="text-2xl font-bold text-blue-400">₹ {totalSIP.toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Amount automated into mutual fund compounding. Represents your wealth-creation momentum.
                </p>
              </div>

              <div className="glass-card p-5 border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Idle Monthly Cash</p>
                <h3 className={`text-2xl font-bold ${cashRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹ {cashRemaining.toLocaleString('en-IN')}
                </h3>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Cash left after living expenses, EMIs, and SIP commitments. Safe but losing purchasing power to inflation.
                </p>
              </div>

            </div>

            {/* Savings Sustainability Analysis */}
            <div className="glass-card p-6 border-white/5 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <PiggyBank className="text-gold-400" /> Savings Sustainability Insight
              </h3>
              
              <div className={`p-4 border rounded-2xl space-y-2 leading-relaxed ${sustainability.color}`}>
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
            </div>

          </div>

        </div>

        {/* Financial Flexibility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-white/5">
          
          {/* Left Column: Fixed vs Flexible description */}
          <div className="lg:col-span-7 glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-gold-400" /> Capital Flexibility Indicator
            </h3>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 font-medium">Flexibility Grade:</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${flexibility.badgeColor}`}>
                {flexibility.label}
              </span>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              {flexibility.text}
            </p>

            <div className="p-4 bg-dark-900/60 rounded-xl border border-white/5 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-gold-400" /> Key Freedom Tip
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {flexibility.tip}
              </p>
            </div>
          </div>

          {/* Right Column: New Commitment Impact Simulator */}
          <div className="lg:col-span-5 glass-card p-6 border-white/5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-gold-400" /> Commitments Stress Simulator
              </h3>
              <p className="text-xs text-gray-400 mt-1">Simulate the cash flow impact of a new car EMI or SIP upgrade before signing up.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Add New Loan EMI (₹)</label>
                <input 
                  type="number"
                  placeholder="e.g. 12000"
                  value={newEMI}
                  onChange={(e) => setNewEMI(e.target.value)}
                  className="input-field text-xs py-1.5"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1">Add New SIP Commit (₹)</label>
                <input 
                  type="number"
                  placeholder="e.g. 5000"
                  value={newSip}
                  onChange={(e) => setNewSip(e.target.value)}
                  className="input-field text-xs py-1.5"
                  min="0"
                />
              </div>
            </div>

            {/* Sim Preview */}
            <div className="p-4 bg-dark-900 rounded-xl border border-white/5 text-xs space-y-2">
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
          </div>

        </div>

      </div>
    </div>
  );
};

export default CashFlowEngine;
