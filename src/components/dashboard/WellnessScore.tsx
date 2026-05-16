import React, { useEffect, useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { AlertTriangle, CheckCircle, Info, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const WellnessScore = () => {
  const { getWellnessMetrics, getSmartInsights } = useFinanceStore();
  const metrics = getWellnessMetrics();
  const insightsList = getSmartInsights();
  
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState({ label: 'Analyzing...', color: 'text-gray-400' });
  const [insights, setInsights] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    let newScore = metrics.overallScore;
    
    // Determine Category
    if (newScore >= 80) setCategory({ label: 'Excellent', color: 'text-green-400' });
    else if (newScore >= 60) setCategory({ label: 'Healthy', color: 'text-blue-400' });
    else if (newScore >= 40) setCategory({ label: 'Improving', color: 'text-yellow-400' });
    else setCategory({ label: 'At Risk', color: 'text-red-400' });

    setScore(Math.max(0, newScore));
    setInsights(insightsList);
    
    // Set CSS variable for circular progress animation
    const offset = 440 - (440 * newScore) / 100;
    document.documentElement.style.setProperty('--score-offset', offset);

  }, [metrics.overallScore, insightsList]);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="text-yellow-400 w-5 h-5 flex-shrink-0" />;
      case 'danger': return <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />;
      case 'critical': return <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />;
      default: return <Info className="text-blue-400 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Main Score */}
      <div className="glass-card p-6 flex flex-col md:flex-row gap-8 items-center border-gold-500/10">
        {/* Circular Score Meter */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" className="stroke-dark-700" strokeWidth="12" fill="none" />
            <circle 
              cx="80" cy="80" r="70" 
              className="stroke-gold-500 animate-score-fill transition-all duration-1000 ease-out" 
              strokeWidth="12" 
              fill="none" 
              strokeLinecap="round"
              style={{ 
                strokeDasharray: 440,
                strokeDashoffset: 'var(--score-offset)'
              }} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-bold text-white">{score}</span>
            <span className={`text-sm font-medium mt-1 ${category.color}`}>{category.label}</span>
          </div>
        </div>

        {/* Global Insights */}
        <div className="flex-1 w-full">
          <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <TrendingUp className="text-gold-400" /> Overall Wealth Insights
          </h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-dark-900/50 p-3 rounded-xl border border-white/5">
                {getIcon(insight.type)}
                <span className="text-sm text-gray-300 leading-snug">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed 5 Scores Breakdown */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="heading-3 mt-4">Detailed Financial Health Breakdown</h3>
        {metrics.detailedScores.map((detail, idx) => {
          const isExpanded = expandedIndex === idx;
          const scoreColor = detail.score >= 80 ? 'text-green-400' : detail.score >= 60 ? 'text-blue-400' : detail.score >= 40 ? 'text-yellow-400' : 'text-red-400';
          const bgScoreColor = detail.score >= 80 ? 'bg-green-400/10' : detail.score >= 60 ? 'bg-blue-400/10' : detail.score >= 40 ? 'bg-yellow-400/10' : 'bg-red-400/10';

          return (
            <div key={idx} className="glass-card border border-white/5 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${bgScoreColor} ${scoreColor}`}>
                    {detail.score}
                  </div>
                  <h4 className="text-lg font-semibold text-white text-left">{detail.title}</h4>
                </div>
                {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>
              
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-white/5 bg-dark-900/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Why this matters</p>
                      <p className="text-sm text-gray-300 leading-relaxed mb-4">{detail.why}</p>
                      
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Risk Analysis</p>
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-gray-300 leading-relaxed">
                        {detail.risk}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Current Insight</p>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-gray-300 leading-relaxed mb-4">
                        {detail.insight}
                      </div>
                      
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Actionable Suggestion</p>
                      <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg text-sm text-gray-300 leading-relaxed">
                        <TrendingUp className="inline-block w-4 h-4 mr-2 text-gold-400" />
                        {detail.suggestion}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WellnessScore;
