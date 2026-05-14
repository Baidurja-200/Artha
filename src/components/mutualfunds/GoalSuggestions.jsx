import React, { useState } from 'react';
import { Target, TrendingUp, Shield, Umbrella, ArrowRight } from 'lucide-react';

const goals = [
  {
    id: 'retirement',
    title: 'Retirement (15+ Years)',
    icon: <Umbrella className="text-purple-400" />,
    categories: ['Index Funds', 'Flexi Cap'],
    risk: 'Moderate to High',
    rationale: 'Long time horizon allows you to ride out market volatility. Index funds provide broad market growth, while Flexi Cap managers can adapt to changing market conditions.'
  },
  {
    id: 'tax',
    title: 'Tax Saving (Under 80C)',
    icon: <Shield className="text-green-400" />,
    categories: ['ELSS Funds'],
    risk: 'High',
    rationale: 'ELSS is the only mutual fund category eligible for ₹1.5L tax deduction under Section 80C. Comes with a mandatory 3-year lock-in period.'
  },
  {
    id: 'short',
    title: 'Short Term (1-3 Years)',
    icon: <Target className="text-blue-400" />,
    categories: ['Debt Funds', 'Liquid Funds'],
    risk: 'Low',
    rationale: 'Capital preservation is key for short-term goals. Equity is too volatile for this timeframe. Liquid and short-duration debt funds offer stability.'
  },
  {
    id: 'wealth',
    title: 'Wealth Creation (7-15 Years)',
    icon: <TrendingUp className="text-gold-400" />,
    categories: ['Flexi Cap', 'Mid Cap', 'Index Funds'],
    risk: 'High',
    rationale: 'Mid Caps offer higher growth potential over a 7+ year horizon. Combining them with stable Index/Flexi cap funds creates a balanced growth portfolio.'
  }
];

const GoalSuggestions = ({ onExplore }) => {
  const [activeGoal, setActiveGoal] = useState(goals[0]);

  return (
    <div className="glass-card border-gold-500/20 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="heading-3 mb-2">Goal-Based Suggestions</h2>
        <p className="text-gray-400 text-sm">Select your financial goal to see suitable mutual fund categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Goals List */}
        <div className="md:col-span-5 space-y-3">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setActiveGoal(goal)}
              className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all ${
                activeGoal.id === goal.id 
                  ? 'bg-dark-700 border border-gold-500/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                  : 'bg-dark-900/50 border border-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center border border-white/5">
                {goal.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">{goal.title}</h4>
              </div>
            </button>
          ))}
        </div>

        {/* Suggestion Details */}
        <div className="md:col-span-7">
          <div className="bg-dark-800/80 rounded-2xl p-6 border border-white/10 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-xl font-bold text-white mb-6">Suggested Categories</h3>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {activeGoal.categories.map((cat, idx) => (
                <span key={idx} className="px-4 py-2 bg-dark-900 rounded-lg border border-gold-500/30 text-gold-400 font-medium text-sm">
                  {cat}
                </span>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Why these fit</p>
                <p className="text-gray-300 leading-relaxed text-sm">{activeGoal.rationale}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk Level</p>
                <div className="inline-block px-3 py-1 bg-dark-900 rounded text-sm text-gray-300 border border-white/5">
                  {activeGoal.risk}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button 
                onClick={() => onExplore && onExplore(activeGoal.categories[0])}
                className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
              >
                Explore {activeGoal.categories[0]} <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default GoalSuggestions;
