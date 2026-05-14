import React from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { generatePriorityStack } from '../../decision-engine/priorityStack';
import { analyzeTradeoffs } from '../../decision-engine/tradeoffAnalyzer';
import { Target, AlertCircle, ArrowRight, Zap } from 'lucide-react';

const PriorityStack = () => {
  const { profile, investments, getWellnessMetrics } = useFinanceStore();
  const metrics = getWellnessMetrics();

  const tradeoffs = analyzeTradeoffs(profile, investments, metrics);
  const priorities = generatePriorityStack(metrics, profile, tradeoffs);

  return (
    <div className="space-y-6">
      
      {/* Priority Stack */}
      <div className="glass-card p-6 border-gold-500/10">
        <div className="mb-6">
          <h3 className="heading-3 flex items-center gap-2">
            <Target className="text-gold-400" /> Financial Priority Stack
          </h3>
          <p className="text-sm text-gray-400 mt-1">Dynamically ranked actions based on your current financial structure.</p>
        </div>

        <div className="space-y-4">
          {priorities.map((priority, idx) => (
            <div key={priority.id} className="relative bg-dark-900/50 border border-white/5 rounded-2xl p-5 overflow-hidden group hover:border-gold-500/30 transition-colors">
              {/* Rank Badge */}
              <div className="absolute top-0 right-0 bg-dark-800 text-gray-500 text-xs font-bold px-3 py-1 rounded-bl-lg border-b border-l border-white/5 group-hover:text-gold-400 group-hover:border-gold-500/30 transition-colors">
                PRIORITY {priority.rank}
              </div>

              <h4 className="text-lg font-bold text-white mb-3 pr-20">{priority.title}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Why this matters</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{priority.why}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Financial Impact</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{priority.impact}</p>
                </div>
              </div>

              <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 flex items-start gap-3">
                <ArrowRight className="text-gold-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-200 font-medium">{priority.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tradeoff Analyzer */}
      {tradeoffs.length > 0 && (
        <div className="glass-card p-6 border-red-500/10">
          <div className="mb-6">
            <h3 className="heading-3 flex items-center gap-2">
              <Zap className="text-red-400" /> Financial Tradeoff Analysis
            </h3>
            <p className="text-sm text-gray-400 mt-1">Evaluate the opportunity costs of your current structural decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tradeoffs.map(tradeoff => (
              <div key={tradeoff.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
                <h4 className="text-md font-bold text-red-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> {tradeoff.title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">{tradeoff.tradeoff}</p>
                <p className="text-xs text-gray-400 leading-relaxed mb-3 italic">{tradeoff.impact}</p>
                <div className="text-sm text-white font-medium bg-dark-800 p-2 rounded border border-white/5">
                  Action: {tradeoff.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PriorityStack;
