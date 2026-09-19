import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ShieldAlert, ArrowRight, RotateCcw, BookOpen, Info } from 'lucide-react';
import SEO from '../components/common/SEO';

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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelectOption = (questionId: number, score: number) => {
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

  const profileResult = calculateProfile();

  // Machine-readable data object for future AI agents
  const aiMachineRiskProfile = {
    quizProgressPercentage: Math.round((currentStep / questions.length) * 100),
    answersProvided: answers,
    quizFinished: showResult,
    calculatedRiskCategory: showResult ? profileResult.type : 'In Progress',
    suggestedAllocationArray: showResult ? profileResult.allocation : []
  };

  // Structured plain-text description for Recharts PieChart
  const getPieChartDescription = () => {
    if (!showResult) return 'Quiz in progress. Suggestion will appear once complete.';
    return `Suggested Asset Allocation PieChart for ${profileResult.type} risk profile: ${profileResult.allocation.map(a => `${a.name} captures ${a.value}%`).join(', ')}. Description: ${profileResult.desc}`;
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-4xl py-12 space-y-10 bg-dark-950 text-white"
      role="main"
      data-risk-profile={JSON.stringify(aiMachineRiskProfile)}
    >
      <SEO 
        title="Risk Profiler Tool"
        description="Take Artha's interactive 4-step financial risk profiler. Discover your true risk tolerance index and get optimal asset allocation suggestions."
        keywords="risk profiler India, risk tolerance calculator, investment quiz India, personal asset allocation suggestions"
      />

      <header className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 mb-6" aria-hidden="true">
          <ShieldAlert className="w-8 h-8 text-gold-400" />
        </div>
        <h1 className="heading-2 mb-4">Investment Risk Profiler</h1>
        <p className="text-gray-400">Discover your true risk tolerance to build a portfolio that lets you sleep at night.</p>
      </header>

      {!showResult ? (
        <section className="glass-panel p-8 md:p-12 max-w-3xl mx-auto" aria-label="Active Risk Questionnaire">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2" role="status">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(((currentStep) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden" aria-hidden="true">
              <div 
                className="h-full bg-gold-500 transition-all duration-500"
                style={{ width: `${((currentStep) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="animate-fade-in" key={currentStep}>
            <h2 className="text-2xl font-medium text-white mb-8">{questions[currentStep].text}</h2>
            
            <div className="space-y-4" role="group" aria-label="Question choices">
              {questions[currentStep].options.map((option, index) => {
                const isSelected = answers[questions[currentStep].id] === option.score;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(questions[currentStep].id, option.score)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                      isSelected 
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400 font-semibold' 
                      : 'border-white/5 bg-dark-800/50 hover:bg-dark-700/50 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`Choice ${index + 1}: ${option.text}`}
                  >
                    <span className="text-lg">{option.text}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-gold-500' : 'border-gray-500 group-hover:border-white'
                    }`} aria-hidden="true">
                      {isSelected && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        <section className="animate-fade-in space-y-8" aria-label="Risk Diagnostics Results">
          
          <article className="glass-panel p-8 md:p-12 text-center relative overflow-hidden" aria-label="Result category assessment">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 ${profileResult.color.replace('text-', 'bg-')}`} aria-hidden="true"></div>
            
            <span className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-4 block">Your Profile</span>
            <h2 className={`text-5xl md:text-6xl font-display font-bold mb-6 ${profileResult.color}`}>{profileResult.type}</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10" role="status">
              {profileResult.desc}
            </p>
            
            <button 
              onClick={resetQuiz} 
              className="btn-secondary inline-flex items-center gap-2"
              aria-label="Click to clear results and retake the risk profiler quiz"
            >
              <RotateCcw size={16} aria-hidden="true" /> Retake Quiz
            </button>
          </article>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Suggested allocation chart */}
            <article className="glass-card p-8 flex flex-col justify-between" aria-label="Suggested Asset Allocation chart visualizer">
              <h3 className="heading-3 mb-6">Suggested Asset Allocation</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profileResult.allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {profileResult.allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={profileResult.chartColor[index % profileResult.chartColor.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Screen reader caption */}
              <p className="sr-only" aria-live="polite">
                {getPieChartDescription()}
              </p>
              <div className="w-full text-left mt-2">
                <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                  <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-gray-400">Interpretation:</strong> {getPieChartDescription()}
                  </span>
                </span>
              </div>
            </article>
            
            <article className="glass-card p-8 flex flex-col justify-center" aria-label="Suggested Allocation list details">
              <div className="space-y-4" role="list">
                {profileResult.allocation.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0" role="listitem">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: profileResult.chartColor[idx % profileResult.chartColor.length] }} aria-hidden="true"></span>
                      <span className="text-gray-300 font-medium">{item.name}</span>
                    </div>
                    <span className="text-xl font-bold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Asset Allocation & Risk Philosophy Guide">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> Capital Allocation & Risk Tolerance Philosophy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Risk Tolerance vs Risk Capacity</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              **Risk Tolerance** is your emotional capacity to stomach volatility (whether a 20% crash causes you panic). **Risk Capacity** is your financial ability to absorb drops based on timeline and surplus. Prudent planning demands aligning both: even an aggressive saver needs conservative allocations if their withdrawal horizon is under 2 years.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Standard Age-based Allocations</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              A standard rule of thumb for baseline asset allocation is the **"100 minus Age" rule**. This suggests the percentage of equity exposure you hold should be 100 minus your current age (e.g. a 30-year-old keeps 70% in equity index/midcaps, 30% in debt/gold). Prudent modern planners adjust this depending on active cashflows.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Systematically Rebalancing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              During an equity bull run, your equity allocation might organically swell from 60% to 75%, raising overall risk. **Portfolio Rebalancing** is the disciplined practice of periodically selling excess equity assets and buying lagging debt/gold once a year to bring allocations back to target baselines.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default RiskProfiler;
