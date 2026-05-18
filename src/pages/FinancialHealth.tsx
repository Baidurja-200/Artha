import React, { useState } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { Target, TrendingUp, Info, HelpCircle, ShieldAlert, ArrowRight, Plus, Trash2, Calendar, IndianRupee, BookOpen } from 'lucide-react';
import { calculateGoalReadiness } from '../services/analyticsEngine';

const FinancialHealth = () => {
  const { 
    profile, 
    investments, 
    goals, 
    updateProfile, 
    updateInvestments, 
    addGoal, 
    deleteGoal,
    getWellnessMetrics,
    getStabilityMetrics
  } = useFinanceStore();

  const metrics = getWellnessMetrics();
  const overallScore = metrics.overallScore;

  // Local state for expanded health cards
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Local state for adding a new goal
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'retirement',
    target: 1000000,
    current: 50000,
    timelineYears: 10
  });

  // Interpret Overall Score
  const getScoreCategory = (s: number) => {
    if (s >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    if (s >= 60) return { label: 'Healthy & Stable', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (s >= 40) return { label: 'Improving', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Vulnerable / At Risk', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const scoreCat = getScoreCategory(overallScore);

  // Handle slider modifications
  const handleProfileChange = (field: string, val: number) => {
    updateProfile({ [field]: val });
    
    // Auto-update totalSIP if currentSIPs is changed, and vice versa
    if (field === 'currentSIPs') {
      updateInvestments({ totalSIP: val });
    }
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name.trim()) return;
    addGoal(newGoal);
    setNewGoal({
      name: '',
      category: 'retirement',
      target: 1000000,
      current: 50000,
      timelineYears: 10
    });
    setShowAddGoal(false);
  };

  // Recharts/circular meter offset
  const scoreOffset = 440 - (440 * overallScore) / 100;

  // Structured machine-readable object for future AI assistants
  const aiMachineProfile = {
    overallIndex: overallScore,
    classification: scoreCat.label,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses,
    debtEMI: profile.debtEMI,
    emergencyReserve: profile.emergencyFund,
    equitySIP: investments?.totalSIP || profile.currentSIPs,
    tax80cAllocated: profile.tax80c,
    emergencyMonthsRunway: profile.emergencyFund / (profile.monthlyExpenses || 1),
    debtToIncomeRatio: (profile.debtEMI / (profile.monthlyIncome || 1)) * 100,
    goalsCount: goals.length
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-financial-profile={JSON.stringify(aiMachineProfile)}
    >
      <SEO 
        title="Financial Health Engine"
        description="Evaluate and stress-test your overall personal financial health score in real-time. Calculate emergency runways, debt load ratios, and inflation-aware compounding milestones."
        keywords="financial health index, emergency fund calculator, debt load ratio, personal finance India, SIP compounding calculators, inflation goals"
      />
      
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="heading-2">Financial Health Engine</h1>
            <p className="text-gray-400">Evaluate, stress-test, and align your finances with absolute clarity.</p>
          </div>
          <div 
            className={`px-4 py-2 rounded-xl border ${scoreCat.bg} flex items-center gap-2`}
            role="status"
            aria-live="polite"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-300">
              Wellness Index: <span className={scoreCat.color}>{overallScore}/100</span> ({scoreCat.label})
            </span>
          </div>
        </header>

        {/* Top Split Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Inputs Panel */}
          <section className="lg:col-span-5 glass-card p-6 border-white/5 space-y-6 h-fit sticky top-28" aria-label="Interactive Simulator Parameters">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-gold-400" /> Interactive Cashflow Simulator
              </h2>
              <p className="text-xs text-gray-400 mt-1">Slide or edit numbers to see your scores adjust instantly.</p>
            </div>

            <div className="space-y-5">
              {/* Income */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="salary-slider" className="text-gray-300 font-medium flex items-center gap-1.5">
                    Monthly Inflow (Salary/Business)
                  </label>
                  <span className="text-gold-400 font-bold text-base">
                    ₹ {profile.monthlyIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="salary-slider"
                  type="range" 
                  min="20000" 
                  max="500000" 
                  step="5000"
                  value={profile.monthlyIncome} 
                  onChange={(e) => handleProfileChange('monthlyIncome', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Monthly Salary Inflow"
                />
              </div>

              {/* Core Living Expenses */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="expenses-slider" className="text-gray-300 font-medium">Monthly Living Expenses</label>
                  <span className="text-gold-400 font-bold text-base">
                    ₹ {profile.monthlyExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="expenses-slider"
                  type="range" 
                  min="10000" 
                  max="300000" 
                  step="2000"
                  value={profile.monthlyExpenses} 
                  onChange={(e) => handleProfileChange('monthlyExpenses', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Monthly Living Expenses"
                />
              </div>

              {/* Debt EMI */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="emi-slider" className="text-gray-300 font-medium">Monthly Debt/EMI Commitments</label>
                  <span className="text-red-400 font-bold text-base">
                    ₹ {profile.debtEMI.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="emi-slider"
                  type="range" 
                  min="0" 
                  max="150000" 
                  step="1000"
                  value={profile.debtEMI} 
                  onChange={(e) => handleProfileChange('debtEMI', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Monthly Debt Repayments"
                />
              </div>

              {/* Emergency Reserve */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="reserve-slider" className="text-gray-300 font-medium">Emergency Reserve (Liquid Cash/FD)</label>
                  <span className="text-green-400 font-bold text-base">
                    ₹ {profile.emergencyFund.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="reserve-slider"
                  type="range" 
                  min="0" 
                  max="1000000" 
                  step="10000"
                  value={profile.emergencyFund} 
                  onChange={(e) => handleProfileChange('emergencyFund', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Emergency cash buffers"
                />
                <p className="text-[10px] text-gray-500 italic">
                  Covers approx. {(profile.emergencyFund / (profile.monthlyExpenses || 1)).toFixed(1)} months of expenses.
                </p>
              </div>

              {/* SIP Investments */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="sip-slider" className="text-gray-300 font-medium">Monthly Equity SIP Contributions</label>
                  <span className="text-blue-400 font-bold text-base">
                    ₹ {(investments?.totalSIP || profile.currentSIPs).toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="sip-slider"
                  type="range" 
                  min="0" 
                  max="150000" 
                  step="1000"
                  value={investments?.totalSIP || profile.currentSIPs} 
                  onChange={(e) => handleProfileChange('currentSIPs', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Systematic equity investments"
                />
              </div>

              {/* Tax Savings 80C */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label htmlFor="tax-slider" className="text-gray-300 font-medium">Section 80C Tax-Saving Investments</label>
                  <span className="text-purple-400 font-bold text-base">
                    ₹ {profile.tax80c.toLocaleString('en-IN')}
                  </span>
                </div>
                <input 
                  id="tax-slider"
                  type="range" 
                  min="0" 
                  max="150000" 
                  step="5000"
                  value={profile.tax80c} 
                  onChange={(e) => handleProfileChange('tax80c', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Section 80C tax allocations"
                />
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="p-4 bg-dark-900/80 rounded-2xl border border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Monthly Income:</span>
                <span className="text-white font-medium">₹ {profile.monthlyIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Expenses + EMIs + SIPs:</span>
                <span className="text-white font-medium">
                  ₹ {(profile.monthlyExpenses + profile.debtEMI + (investments?.totalSIP || profile.currentSIPs)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-px bg-white/5 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-semibold">Net Cash Surplus:</span>
                <span className={`font-bold ${profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹ {(profile.monthlyIncome - profile.monthlyExpenses - profile.debtEMI).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

          </section>

          {/* Right Column: Diagnostic Dashboard & Detailed Scores */}
          <section className="lg:col-span-7 space-y-8" aria-label="Financial Diagnostic Summary">
            
            {/* Top Score Radial Card */}
            <article className="glass-card p-6 flex flex-col md:flex-row gap-8 items-center border-gold-500/10">
              <div className="relative w-40 h-40 flex-shrink-0" aria-label={`Visual score dial representing ${overallScore} out of 100`}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                  <circle cx="80" cy="80" r="70" className="stroke-dark-800" strokeWidth="12" fill="none" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    className="stroke-gold-500 transition-all duration-700 ease-out" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeLinecap="round"
                    style={{ 
                      strokeDasharray: 440,
                      strokeDashoffset: scoreOffset
                    }} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-bold text-white">{overallScore}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Health Score</span>
                </div>
              </div>

              <div className="flex-1 w-full text-center md:text-left space-y-3">
                <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  What does this mean?
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {metrics.detailedScores[0]?.what}
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-400 leading-relaxed italic">
                  <span className="font-semibold text-gold-400 not-italic block mb-1">Why it matters:</span>
                  {metrics.detailedScores[0]?.why}
                </div>
              </div>
            </article>

            {/* Stability & Stress Engine Gauges */}
            {(() => {
              const stability = getStabilityMetrics();
              const stabilityCat = stability.stabilityScore >= 80 ? 'Bulletproof' : stability.stabilityScore >= 60 ? 'Stable' : stability.stabilityScore >= 40 ? 'Vulnerable' : 'Fragile';
              const stabilityColor = stability.stabilityScore >= 80 ? 'text-green-400' : stability.stabilityScore >= 60 ? 'text-blue-400' : stability.stabilityScore >= 40 ? 'text-yellow-400' : 'text-red-400';

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <article className="glass-card p-5 border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Financial Stability Score</h3>
                      <p className="text-2xl font-bold text-white">{stability.stabilityScore}/100</p>
                      <p className="text-xs text-gray-400 mt-1">Status: <span className={`font-semibold ${stabilityColor}`}>{stabilityCat}</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-gold-400">
                      {stability.stabilityScore}
                    </div>
                  </article>

                  <article className="glass-card p-5 border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Active Stress Load</h3>
                      <p className="text-2xl font-bold text-white">{stability.stressScore}/100</p>
                      <p className="text-xs text-gray-400 mt-1">Strain Level: <span className={`font-semibold ${stability.stressScore >= 50 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>{stability.stressScore >= 50 ? 'Elevated' : 'Low / Relaxed'}</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-red-400">
                      {stability.stressScore}
                    </div>
                  </article>

                  {/* Stress Factors Warning Blocks */}
                  {stability.stressFactors.length > 0 && (
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Stability Stress Indicators</h3>
                      {stability.stressFactors.map((factor) => (
                        <div 
                          key={factor.id} 
                          className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 text-sm ${
                            factor.severity === 'critical' 
                              ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                              : factor.severity === 'warning'
                              ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                          }`}
                        >
                          <div className="space-y-1 md:max-w-[70%]">
                            <span className="font-bold flex items-center gap-1.5">
                              {factor.severity === 'critical' ? '🚨' : factor.severity === 'warning' ? '⚠️' : 'ℹ️'} {factor.title}
                            </span>
                            <p className="text-xs text-gray-300 leading-relaxed"><span className="font-semibold text-gray-400">Issue:</span> {factor.description}</p>
                            <p className="text-xs text-gray-300 leading-relaxed"><span className="font-semibold text-gray-400">Risk impact:</span> {factor.impact}</p>
                          </div>
                          <div className="bg-dark-950/40 p-3 rounded-lg border border-white/5 text-xs text-white h-fit my-auto">
                            <span className="font-semibold text-gold-400 block mb-0.5">Mitigation action:</span>
                            {factor.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Detailed Health Accordions */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-gold-400" /> Five Pillars of Financial Health
              </h2>
              
              {metrics.detailedScores.slice(1).map((detail: any, idx: number) => {
                const index = idx + 1; // since overall score is index 0
                const isExpanded = expandedIndex === index;
                const scoreVal = detail.score;
                
                const scoreColor = scoreVal >= 80 ? 'text-green-400' : scoreVal >= 60 ? 'text-blue-400' : scoreVal >= 40 ? 'text-yellow-400' : 'text-red-400';
                const bgScoreColor = scoreVal >= 80 ? 'bg-green-400/10' : scoreVal >= 60 ? 'bg-blue-400/10' : scoreVal >= 40 ? 'bg-yellow-400/10' : 'bg-red-400/10';

                return (
                  <article key={detail.id} className="glass-card border border-white/5 overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-white/5 transition-colors"
                      aria-expanded={isExpanded}
                      aria-controls={`pillar-detail-${detail.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${bgScoreColor} ${scoreColor}`}>
                          {scoreVal}
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-white text-left">{detail.title}</h3>
                      </div>
                      <span className="text-xs text-gold-400 font-semibold underline">
                        {isExpanded ? 'Hide' : 'Explain'}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div 
                        id={`pillar-detail-${detail.id}`}
                        className="p-5 pt-0 border-t border-white/5 bg-dark-900/30 space-y-4 animate-fade-in"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">What it means</h4>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">{detail.what}</p>
                            
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Why it matters</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{detail.why}</p>
                          </div>

                          <div>
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Diagnostic Risk</h4>
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-sm text-gray-300 mb-4 leading-relaxed">
                              {detail.risk}
                            </div>
                            
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Actionable Improvement</h4>
                            <div className="p-3 bg-gold-500/5 border border-gold-500/10 rounded-xl text-sm text-gray-200 leading-relaxed">
                              <TrendingUp className="inline-block w-4 h-4 mr-2 text-gold-400" />
                              {detail.suggestion}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

          </section>

        </div>

        {/* Goal Planning & Readiness Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Goal Readiness & Planning Engine">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="heading-3 flex items-center gap-2">
                <Target className="text-gold-400" /> Goal Readiness & Planning Engine
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Project long-term compound trajectories adjusted for 6% Indian inflation.
              </p>
            </div>
            <button 
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 whitespace-nowrap"
              aria-expanded={showAddGoal}
            >
              <Plus size={16} /> Plan New Goal
            </button>
          </div>

          {/* Add Goal Dialog Form */}
          {showAddGoal && (
            <form onSubmit={handleAddGoalSubmit} className="glass-card p-6 border-gold-500/20 max-w-2xl animate-fade-in space-y-4">
              <h3 className="text-md font-bold text-white">Define A New Financial Milestone</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="goal-name" className="text-xs text-gray-400 font-medium block mb-1">Goal Name</label>
                  <input 
                    id="goal-name"
                    type="text" 
                    placeholder="e.g. Children's Higher Education" 
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="input-field py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="goal-category" className="text-xs text-gray-400 font-medium block mb-1">Goal Category</label>
                  <select 
                    id="goal-category"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="input-field py-2 text-sm"
                  >
                    <option value="retirement">Retirement Corpus</option>
                    <option value="house">House Purchase</option>
                    <option value="emergency">Emergency Reserve</option>
                    <option value="education">Education Fund</option>
                    <option value="wealth">General Wealth Creation</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goal-target" className="text-xs text-gray-400 font-medium block mb-1">Target Amount (₹ today's cost)</label>
                  <input 
                    id="goal-target"
                    type="number" 
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({...newGoal, target: Number(e.target.value)})}
                    className="input-field py-2 text-sm"
                    min="10000"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="goal-current" className="text-xs text-gray-400 font-medium block mb-1">Current Dedicated Corpus (₹)</label>
                  <input 
                    id="goal-current"
                    type="number" 
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({...newGoal, current: Number(e.target.value)})}
                    className="input-field py-2 text-sm"
                    min="0"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="goal-timeline" className="text-xs text-gray-400 font-medium block mb-1">Timeline to Reach Goal ({newGoal.timelineYears} years)</label>
                  <input 
                    id="goal-timeline"
                    type="range" 
                    min="1" 
                    max="40" 
                    value={newGoal.timelineYears}
                    onChange={(e) => setNewGoal({...newGoal, timelineYears: Number(e.target.value)})}
                    className="w-full accent-gold-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowAddGoal(false)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Calculate & Add
                </button>
              </div>
            </form>
          )}

          {/* Goals List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.length === 0 ? (
              <div className="col-span-2 glass-card p-10 text-center text-gray-500 border-white/5 space-y-3">
                <Target className="w-12 h-12 mx-auto opacity-30 text-gold-400" />
                <p className="text-base font-semibold text-gray-300">No active goals planned yet.</p>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Defining your goals allows Artha to project compound wealth trajectories and pinpoint monthly savings shortfalls.
                </p>
                <button 
                  onClick={() => setShowAddGoal(true)}
                  className="btn-primary text-xs py-2 px-4 mt-2"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              goals.map((g) => {
                const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;
                // Distribute SIP across all goals equally for basic macro projection
                const distributedSIP = totalSIP / goals.length;
                const cagr = g.category === 'emergency' ? 6 : 12; // 6% real returns for liquid, 12% for equity
                
                const projection = calculateGoalReadiness(g.target, g.current, distributedSIP, g.timelineYears, cagr);
                
                const currentPercent = Math.round((g.current / g.target) * 100);
                const projectedPercent = projection.readinessProbability;

                return (
                  <article key={g.id} className="glass-card p-6 border-white/5 space-y-4 hover:border-gold-500/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                            {g.category}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1.5">{g.name}</h3>
                        </div>
                        <button 
                          onClick={() => deleteGoal(g.id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          title="Remove Goal"
                          aria-label={`Delete ${g.name} goal`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs mt-3 bg-dark-900/50 p-3 rounded-xl border border-white/5">
                        <div>
                          <p className="text-gray-500">Target Cost:</p>
                          <p className="font-bold text-sm text-white">₹ {g.target.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time remaining:</p>
                          <p className="font-bold text-sm text-white">{g.timelineYears} Years</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Dedicated:</p>
                          <p className="font-bold text-sm text-green-400">₹ {g.current.toLocaleString('en-IN')} ({currentPercent}%)</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Allocated Monthly SIP:</p>
                          <p className="font-bold text-sm text-blue-400">₹ {Math.round(distributedSIP).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-3 mt-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400 font-medium">Projected Goal Funding Probability:</span>
                          <span className={`font-bold ${projectedPercent >= 85 ? 'text-green-400' : projectedPercent >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
                            {projectedPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              projectedPercent >= 85 ? 'bg-green-400' : projectedPercent >= 60 ? 'bg-blue-400' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${projectedPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Info size={12} className="text-gold-400" />
                          <span className="font-semibold text-gray-300">Shortfall Diagnostic:</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {projection.shortfall > 0 
                            ? `At the current compounding speed, you are projected to face an inflation-adjusted shortfall of ₹${projection.shortfall.toLocaleString('en-IN')}.` 
                            : `Outstanding! Compounding will comfortably bridge your needs. You are projected to exceed this goal.`}
                        </p>
                        {projection.shortfall > 0 && (
                          <div className="text-[10px] text-gold-400 font-medium mt-1">
                            Action: Increase SIP by ₹{projection.requiredExtraSip.toLocaleString('en-IN')}/month to clear the gap.
                          </div>
                        )}
                      </div>

                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Financial Wellness Educational Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Topical Financial Wellness Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Emergency Buffer Logic</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                An emergency buffer is your capital shield against life’s shocks (medical emergencies, unexpected job separations). Standard guidelines recommend storing exactly **6 months** of mandatory living expenses inside highly liquid deposits (Fds, liquid mutual funds) instead of investing them in volatile equities.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Indian Inflation and Real Yields</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                In India, structural inflation hovers around **5% to 6%** annually. Holding idle cash in a standard savings account yielding 3% translates into a net wealth decline of **-3% in purchasing power** annually. Achieving true compounding requires investing surplus capital in diversified assets returning 10-12%.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Systematically Pacing Debt</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Debt is a high-cost drag on cash flow. When monthly EMI commitments swallow over **35-40%** of your inflow, you are operating in a vulnerable state (high DTI). Unsecured debt (credit card EMIs, personal loans) charging 14-20% interest should be aggressively prepaid before equity allocation.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default FinancialHealth;
