import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';

const questions = [
  {
    id: 1,
    text: "What is your primary goal for investing?",
    options: [
      { text: "Preserve my capital, avoid any losses", score: 1 },
      { text: "Generate steady income with low risk", score: 2 },
      { text: "Grow wealth moderately over time", score: 3 },
      { text: "Maximize long-term growth, willing to take high risks", score: 4 }
    ]
  },
  {
    id: 2,
    text: "If your investment portfolio dropped 20% in one month, what would you do?",
    options: [
      { text: "Sell everything immediately to prevent further loss", score: 1 },
      { text: "Sell some portion and move to safer assets", score: 2 },
      { text: "Do nothing, wait for it to recover", score: 3 },
      { text: "Buy more, taking advantage of lower prices", score: 4 }
    ]
  },
  {
    id: 3,
    text: "When do you need to withdraw the majority of your invested money?",
    options: [
      { text: "Within the next 1-2 years", score: 1 },
      { text: "In 3-5 years", score: 2 },
      { text: "In 6-10 years", score: 3 },
      { text: "More than 10 years from now", score: 4 }
    ]
  },
  {
    id: 4,
    text: "How stable is your current and future income stream?",
    options: [
      { text: "Unstable / Freelance / High risk of job loss", score: 1 },
      { text: "Somewhat stable, but can fluctuate", score: 2 },
      { text: "Stable salaried job", score: 3 },
      { text: "Highly secure (Govt job, guaranteed pension, etc.)", score: 4 }
    ]
  }
];

const RiskProfiler = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleSelectOption = (questionId, score) => {
    setAnswers({ ...answers, [questionId]: score });
    
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResult(true);
      }
    }, 400);
  };

  const calculateProfile = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 35) {
      return {
        type: 'Conservative',
        color: 'text-blue-400',
        chartColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#1e3a8a'],
        desc: 'You prioritize capital preservation over high returns. You prefer stable, guaranteed income and cannot stomach market volatility.',
        allocation: [
          { name: 'Fixed Deposits/Bonds', value: 70 },
          { name: 'Large Cap Equity', value: 15 },
          { name: 'Gold', value: 10 },
          { name: 'Liquid Funds', value: 5 }
        ]
      };
    } else if (percentage <= 65) {
      return {
        type: 'Moderate',
        color: 'text-yellow-400',
        chartColor: ['#facc15', '#fef08a', '#eab308', '#854d0e'],
        desc: 'You seek a balance between growth and safety. You can handle some market fluctuations but want to limit your downside risk.',
        allocation: [
          { name: 'Large Cap Equity', value: 40 },
          { name: 'Fixed Deposits/Bonds', value: 30 },
          { name: 'Mid Cap Equity', value: 15 },
          { name: 'Gold', value: 10 },
          { name: 'Liquid Funds', value: 5 }
        ]
      };
    } else {
      return {
        type: 'Aggressive',
        color: 'text-red-400',
        chartColor: ['#ef4444', '#f87171', '#dc2626', '#7f1d1d'],
        desc: 'You are focused on maximizing long-term wealth creation. You understand that high returns come with high volatility and can stay invested during crashes.',
        allocation: [
          { name: 'Small/Mid Cap Equity', value: 40 },
          { name: 'Large Cap Equity', value: 40 },
          { name: 'International Equity', value: 10 },
          { name: 'Debt Funds/Bonds', value: 10 }
        ]
      };
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="container mx-auto px-6 max-w-4xl py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 mb-6">
          <ShieldAlert className="w-8 h-8 text-gold-400" />
        </div>
        <h1 className="heading-2 mb-4">Investment Risk Profiler</h1>
        <p className="text-gray-400">Discover your true risk tolerance to build a portfolio that lets you sleep at night.</p>
      </div>

      {!showResult ? (
        <div className="glass-panel p-8 md:p-12 max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(((currentStep) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gold-500 transition-all duration-500"
                style={{ width: `${((currentStep) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="animate-fade-in" key={currentStep}>
            <h3 className="text-2xl font-medium text-white mb-8">{questions[currentStep].text}</h3>
            
            <div className="space-y-4">
              {questions[currentStep].options.map((option, index) => {
                const isSelected = answers[questions[currentStep].id] === option.score;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(questions[currentStep].id, option.score)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400' 
                      : 'border-white/5 bg-dark-800/50 hover:bg-dark-700/50 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{option.text}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-gold-500' : 'border-gray-500 group-hover:border-white'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          {(() => {
            const profile = calculateProfile();
            return (
              <>
                <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden">
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 ${profile.color.replace('text-', 'bg-')}`}></div>
                  
                  <span className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-4 block">Your Profile</span>
                  <h2 className={`text-5xl md:text-6xl font-display font-bold mb-6 ${profile.color}`}>{profile.type}</h2>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
                    {profile.desc}
                  </p>
                  
                  <button onClick={resetQuiz} className="btn-secondary inline-flex items-center gap-2">
                    <RotateCcw size={16} /> Retake Quiz
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8">
                    <h3 className="heading-3 mb-6">Suggested Asset Allocation</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={profile.allocation}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {profile.allocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={profile.chartColor[index % profile.chartColor.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => `${value}%`}
                            contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="glass-card p-8 flex flex-col justify-center">
                    <div className="space-y-4">
                      {profile.allocation.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: profile.chartColor[idx % profile.chartColor.length] }}></span>
                            <span className="text-gray-300 font-medium">{item.name}</span>
                          </div>
                          <span className="text-xl font-bold text-white">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RiskProfiler;
