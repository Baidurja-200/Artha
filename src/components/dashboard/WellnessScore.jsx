import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

const WellnessScore = ({ profileData }) => {
  const [score, setScore] = useState(0);
  const [category, setCategory] = useState({ label: 'Analyzing...', color: 'text-gray-400' });
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!profileData) return;

    let newScore = 100;
    const newInsights = [];

    // 1. Overall Status
    const savingsRatio = (profileData.monthlyIncome - profileData.monthlyExpenses) / profileData.monthlyIncome;
    if (savingsRatio >= 0.2) {
      newInsights.push({ type: 'success', text: 'Your finances are strongly investment-ready.' });
    } else if (savingsRatio < 0.1) {
      newScore -= 15;
      newInsights.push({ type: 'warning', text: 'Cash flow is tight. Reduce discretionary expenses to become investment-ready.' });
    } else {
      newScore -= 5;
      newInsights.push({ type: 'info', text: 'Finances are stable, but optimizing savings will accelerate wealth creation.' });
    }

    // 2. Emergency Preparedness
    const monthlyExpenses = profileData.monthlyExpenses || 1;
    const emergencyMonths = profileData.emergencyFund / monthlyExpenses;
    const emergencyPreparedness = Math.min(100, Math.round((emergencyMonths / 6) * 100));
    
    if (emergencyMonths < 3) {
      newScore -= 20;
      newInsights.push({ type: 'danger', text: `Emergency preparedness: ${emergencyPreparedness}%. High risk to investments.` });
    } else if (emergencyMonths >= 6) {
      newInsights.push({ type: 'success', text: `Emergency preparedness: ${emergencyPreparedness}%. Extremely resilient.` });
    } else {
      newScore -= 10;
      newInsights.push({ type: 'warning', text: `Emergency preparedness: ${emergencyPreparedness}%. Nearing safe levels.` });
    }

    // 3. Debt Burden
    const annualIncome = profileData.monthlyIncome * 12;
    if (profileData.loans > annualIncome * 2) {
      newScore -= 15;
      newInsights.push({ type: 'danger', text: 'Debt burden: Critical. Focus heavily on loan amortization.' });
    } else if (profileData.loans > 0) {
      newInsights.push({ type: 'info', text: 'Debt burden: Moderate. Manageable within current cash flow.' });
    } else {
      newInsights.push({ type: 'success', text: 'Debt burden: Zero. Optimal leverage state.' });
    }

    // 4. Investment Sustainability
    const investmentRatio = profileData.currentSIPs / profileData.monthlyIncome;
    if (investmentRatio < 0.05) {
      newScore -= 15;
      newInsights.push({ type: 'warning', text: 'Investment sustainability: Weak. Increase SIP allocations.' });
    } else if (investmentRatio > 0.15) {
      newInsights.push({ type: 'success', text: 'Investment sustainability: Strong. Excellent compounding trajectory.' });
    } else {
      newInsights.push({ type: 'info', text: 'Investment sustainability: Moderate. Consistent but room to grow.' });
    }

    // Determine Category
    if (newScore >= 80) setCategory({ label: 'Excellent', color: 'text-green-400' });
    else if (newScore >= 60) setCategory({ label: 'Healthy', color: 'text-blue-400' });
    else if (newScore >= 40) setCategory({ label: 'Improving', color: 'text-yellow-400' });
    else setCategory({ label: 'At Risk', color: 'text-red-400' });

    setScore(Math.max(0, newScore));
    setInsights(newInsights);
    
    // Set CSS variable for circular progress animation
    const offset = 440 - (440 * newScore) / 100;
    document.documentElement.style.setProperty('--score-offset', offset);

  }, [profileData]);

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="text-yellow-400 w-5 h-5 flex-shrink-0" />;
      case 'danger': return <AlertTriangle className="text-red-400 w-5 h-5 flex-shrink-0" />;
      default: return <Info className="text-blue-400 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row gap-8 items-center">
      
      {/* Circular Score Meter */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" className="stroke-dark-700" strokeWidth="12" fill="none" />
          <circle 
            cx="80" cy="80" r="70" 
            className="stroke-gold-500 animate-score-fill" 
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

      {/* Insights */}
      <div className="flex-1 w-full">
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <TrendingUp className="text-gold-400" /> Wellness Insights
        </h3>
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-dark-900/50 p-3 rounded-xl border border-white/5">
              {getIcon(insight.type)}
              <span className="text-sm text-gray-300 leading-snug">{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessScore;
