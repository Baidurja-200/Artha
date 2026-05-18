import React, { useState } from 'react';
import { Target, Compass, Sparkles, Check, BookOpen, HelpCircle } from 'lucide-react';
import { getSuggestedAllocation } from '../../fund-engine/portfolioEngine';

const PortfolioPlanner = () => {
  const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [age, setAge] = useState<'young' | 'mid' | 'retired'>('young');
  const [goal, setGoal] = useState<'retirement' | 'wealth' | 'tax' | 'emergency'>('wealth');

  const { allocations, riskProfileName, reasoning } = getSuggestedAllocation(risk, age, goal);

  const riskOptions = [
    { id: 'conservative', label: 'Conservative (Low Risk)' },
    { id: 'moderate', label: 'Moderate (Balanced)' },
    { id: 'aggressive', label: 'Aggressive (High Return)' }
  ];

  const ageOptions = [
    { id: 'young', label: 'Young (Under 35)' },
    { id: 'mid', label: 'Mid-Career (35-55)' },
    { id: 'retired', label: 'Pre-Retirement / Retired' }
  ];

  const goalOptions = [
    { id: 'wealth', label: 'Wealth Creation' },
    { id: 'retirement', label: 'Long-Term Retirement' },
    { id: 'emergency', label: 'Emergency Safety Net' }
  ];

  // Beginner-friendly explanations database for categories
  const educationGuides = {
    'Index Funds': 'Passively tracks major stock market indexes like Nifty 50. Ultra-low fee ratios (0.1% - 0.2%). Simply mirrors index returns.',
    'Flexi Cap Funds': 'Active managers dynamically rotate your money across large, mid, and small businesses based on which sector has the best potential.',
    'Mid & Small Cap': 'Invests in fast-scaling, high-risk emerging enterprises. Volatile in short cycles, but delivers outstanding returns over 7+ years.',
    'Debt & Liquid Funds': 'Bridges safety gaps by investing in highly secure corporate debentures or treasury bills. Prevents loss of capital.'
  };

  return (
    <div className="glass-card p-6 md:p-8 border-white/10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-3 bg-dark-800 rounded-xl"><Sparkles className="text-gold-400" /></div>
        <div>
          <h2 className="heading-3">Beginner Portfolio Allocation Advisor</h2>
          <p className="text-sm text-gray-400">Answer 3 simple questions to receive a custom-tailored mutual fund asset allocation strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Controls Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Risk Preference */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">1. What is your risk appetite?</label>
            <div className="grid grid-cols-1 gap-2">
              {riskOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRisk(opt.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs text-left transition-all border font-medium flex items-center justify-between ${
                    risk === opt.id
                      ? 'bg-gold-400/10 border-gold-400 text-gold-400 font-semibold shadow-sm'
                      : 'bg-dark-800/40 border-white/5 text-gray-300 hover:bg-dark-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {risk === opt.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">2. What is your current age bracket?</label>
            <div className="grid grid-cols-1 gap-2">
              {ageOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAge(opt.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs text-left transition-all border font-medium flex items-center justify-between ${
                    age === opt.id
                      ? 'bg-gold-400/10 border-gold-400 text-gold-400 font-semibold shadow-sm'
                      : 'bg-dark-800/40 border-white/5 text-gray-300 hover:bg-dark-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {age === opt.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Type */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">3. What is your primary investment goal?</label>
            <div className="grid grid-cols-1 gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGoal(opt.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs text-left transition-all border font-medium flex items-center justify-between ${
                    goal === opt.id
                      ? 'bg-gold-400/10 border-gold-400 text-gold-400 font-semibold shadow-sm'
                      : 'bg-dark-800/40 border-white/5 text-gray-300 hover:bg-dark-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {goal === opt.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Output Section */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Strategy Profile Banner */}
          <div className="p-5 bg-gradient-to-br from-dark-800 to-dark-900 border border-gold-500/20 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Suggested Strategy Profile</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-400/10 text-gold-400 border border-gold-500/30">
                {riskProfileName}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              💡 {reasoning}
            </p>
          </div>

          {/* Asset Allocations Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Suggested Mutual Fund Allocations</h3>
            
            <div className="space-y-3">
              {allocations.map((alloc) => (
                <div key={alloc.category} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      📌 {alloc.category}
                    </span>
                    <span className="text-sm font-extrabold text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-500/20">
                      {alloc.percentage}%
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {alloc.description}
                  </p>
                  
                  {/* Category Guide */}
                  <div className="text-[10px] text-gray-400 leading-relaxed bg-dark-900/60 p-2 rounded-lg border border-white/5 mt-2 flex items-start gap-1">
                    <BookOpen size={10} className="text-gold-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-gray-300">Class Explainer:</strong> {educationGuides[alloc.category] || 'Mutual Fund category focusing on diversified Indian instruments.'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PortfolioPlanner;
