import React, { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { simulateDecision } from '../../simulators/decisionSimulator';
import { Sliders, ArrowRight, TrendingUp } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const DecisionSimulator = () => {
  const { profile, investments, goals, getWellnessMetrics } = useFinanceStore();
  const currentMetrics = getWellnessMetrics();

  const [simConfig, setSimConfig] = useState({
    increaseSip: 0,
    reduceExpenses: 0,
    repayDebt: 0
  });

  const { simulatedMetrics } = simulateDecision(profile, investments, goals, simConfig);
  
  const currentOverall = currentMetrics.overallScore;
  const simOverall = simulatedMetrics.overallScore;
  const scoreDiff = simOverall - currentOverall;

  const handleReset = () => {
    setSimConfig({ increaseSip: 0, reduceExpenses: 0, repayDebt: 0 });
  };

  return (
    <div className="glass-card p-6 border-blue-500/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="mb-6">
        <h3 className="heading-3 flex items-center gap-2">
          <Sliders className="text-blue-400" /> Decision Impact Simulator
        </h3>
        <p className="text-sm text-gray-400 mt-1">Simulate financial decisions to see their projected impact on your wealth trajectory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300 font-medium">Increase Monthly SIP by</label>
              <span className="text-gold-400 font-bold">+{formatCurrency(simConfig.increaseSip)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="50000" step="1000" 
              value={simConfig.increaseSip} 
              onChange={(e) => setSimConfig({...simConfig, increaseSip: Number(e.target.value)})}
              className="w-full accent-gold-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300 font-medium">Reduce Monthly Expenses by</label>
              <span className="text-blue-400 font-bold">-{formatCurrency(simConfig.reduceExpenses)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="30000" step="1000" 
              value={simConfig.reduceExpenses} 
              onChange={(e) => setSimConfig({...simConfig, reduceExpenses: Number(e.target.value)})}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300 font-medium">Extra Monthly Debt Repayment</label>
              <span className="text-green-400 font-bold">+{formatCurrency(simConfig.repayDebt)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="50000" step="1000" 
              value={simConfig.repayDebt} 
              onChange={(e) => setSimConfig({...simConfig, repayDebt: Number(e.target.value)})}
              className="w-full accent-green-500"
            />
          </div>
          
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-white transition-colors">
            Reset Simulator
          </button>
        </div>

        {/* Results */}
        <div className="bg-dark-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Projected Wellness Score</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-bold text-gray-500">{currentOverall}</span>
              <ArrowRight className="text-gray-600" />
              <span className={`text-5xl font-display font-bold ${scoreDiff > 0 ? 'text-green-400 shadow-green-text' : 'text-white'}`}>
                {simOverall}
              </span>
            </div>
            {scoreDiff > 0 && (
              <p className="text-sm text-green-400 mt-2 font-medium flex items-center justify-center gap-1">
                <TrendingUp size={14} /> +{scoreDiff} Point Improvement
              </p>
            )}
          </div>

          <div className="space-y-3">
            {simulatedMetrics.detailedScores.map(score => {
              const currentDetail = currentMetrics.detailedScores.find(s => s.id === score.id);
              const diff = score.score - (currentDetail?.score || 0);
              
              if (diff <= 0) return null;
              
              return (
                <div key={score.id} className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                  <span className="text-gray-300">{score.title}</span>
                  <span className="text-green-400 font-bold">+{diff}</span>
                </div>
              );
            })}
          </div>

          {scoreDiff > 0 && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="font-semibold text-green-400">Impact Analysis:</span> By making these changes, you significantly accelerate your wealth compounding while reducing structural financial risk.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DecisionSimulator;
