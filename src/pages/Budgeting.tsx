import React, { useState } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { Target, PiggyBank, Smile, Lightbulb, TrendingUp, Sparkles, HelpCircle, Compass, BookOpen } from 'lucide-react';

const Budgeting = () => {
  const { expenses, profile, budget, updateBudget, investments } = useFinanceStore();

  // Local state for interactive budget sliders
  const [needsPct, setNeedsPct] = useState(budget.needsLimit || 50);
  const [wantsPct, setWantsPct] = useState(budget.wantsLimit || 30);
  const [savingsPct, setSavingsPct] = useState(budget.savingsLimit || 20);

  const monthlyIncome = profile.monthlyIncome || 1;
  const totalSIP = investments?.totalSIP || profile.currentSIPs || 0;

  // Sync sliders to ensure they total 100%
  const handleSliderChange = (bucket: 'needs' | 'wants' | 'savings', value: number) => {
    let newNeeds = needsPct;
    let newWants = wantsPct;
    let newSavings = savingsPct;

    if (bucket === 'needs') {
      newNeeds = value;
      // Distribute remaining 100 - newNeeds among wants and savings
      const rem = 100 - newNeeds;
      const ratio = wantsPct / (wantsPct + savingsPct || 1);
      newWants = Math.round(rem * ratio);
      newSavings = 100 - newNeeds - newWants;
    } else if (bucket === 'wants') {
      newWants = value;
      const rem = 100 - newWants;
      const ratio = needsPct / (needsPct + savingsPct || 1);
      newNeeds = Math.round(rem * ratio);
      newSavings = 100 - newWants - newNeeds;
    } else {
      newSavings = value;
      const rem = 100 - newSavings;
      const ratio = needsPct / (needsPct + wantsPct || 1);
      newNeeds = Math.round(rem * ratio);
      newWants = 100 - newSavings - newNeeds;
    }

    // Sanitize to sum to exactly 100
    if (newNeeds + newWants + newSavings !== 100) {
      newSavings = 100 - newNeeds - newWants;
    }

    setNeedsPct(newNeeds);
    setWantsPct(newWants);
    setSavingsPct(newSavings);

    // Persist in store
    updateBudget({
      needsLimit: newNeeds,
      wantsLimit: newWants,
      savingsLimit: newSavings
    });
  };

  // Map logged expenses into the 3 buckets
  const needsCategories = ['rent', 'utilities', 'healthcare', 'EMI/debt'];
  const wantsCategories = ['food', 'travel', 'shopping', 'subscriptions', 'entertainment'];
  
  const spentNeeds = expenses
    .filter(e => needsCategories.includes(e.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const spentWants = expenses
    .filter(e => wantsCategories.includes(e.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // In standard 50/30/20, investments (SIPs) and manual savings logged count toward Savings
  const spentSavings = expenses
    .filter(e => e.category === 'investments')
    .reduce((acc, curr) => acc + curr.amount, 0) + totalSIP;

  // Targets in Rupees
  const needsTarget = Math.round((needsPct / 100) * monthlyIncome);
  const wantsTarget = Math.round((wantsPct / 100) * monthlyIncome);
  const savingsTarget = Math.round((savingsPct / 100) * monthlyIncome);

  // Percentages used
  const needsUsedPct = Math.round((spentNeeds / (needsTarget || 1)) * 100);
  const wantsUsedPct = Math.round((spentWants / (wantsTarget || 1)) * 100);
  const savingsUsedPct = Math.round((spentSavings / (savingsTarget || 1)) * 100);

  // Generate Personalized suggestions
  const getSuggestions = () => {
    const suggestions = [];

    // Needs feedback
    if (needsPct > 55) {
      suggestions.push({
        title: 'High Needs Commitment',
        type: 'warning',
        text: `Your budget allocates ${needsPct}% to essential needs. This leaves very little room for lifestyle enjoyment or savings. This is typically driven by high EMI commitments or high house rent.`,
        tip: 'Consider refinancing high-rate loans or prepaying card EMIs to free up cash. Avoid taking any fresh recurring expenses.'
      });
    } else if (spentNeeds > needsTarget) {
      suggestions.push({
        title: 'Needs Budget Overrun',
        type: 'danger',
        text: `Your actual Needs spending (₹${spentNeeds.toLocaleString('en-IN')}) has exceeded your target limit of ₹${needsTarget.toLocaleString('en-IN')}.`,
        tip: 'Check your electricity, mobile, and wifi bills. Ensure you prepay annual insurance dues in bulk rather than piling up monthly fees.'
      });
    }

    // Wants feedback
    const remainingWants = wantsTarget - spentWants;
    if (spentWants > wantsTarget) {
      suggestions.push({
        title: 'Wants Budget Overflowing',
        type: 'danger',
        text: `You have spent ₹${Math.abs(remainingWants).toLocaleString('en-IN')} over your discretionary Wants budget this month.`,
        tip: 'Pause non-essential online retail shopping, Swiggy, and cinema dining. Try a "low-spend weekend" to re-establish your baseline.'
      });
    } else if (remainingWants > wantsTarget * 0.4 && spentWants > 0) {
      suggestions.push({
        title: 'Discretionary Surplus Available',
        type: 'success',
        text: `Superb discipline! You have ₹${remainingWants.toLocaleString('en-IN')} remaining in your Wants budget. You are successfully living well below your means.`,
        tip: 'You could safely redirect half of this unspent surplus into stepping up your SIP investments to let compounding build future wealth.'
      });
    }

    // Savings feedback
    if (spentSavings >= savingsTarget) {
      suggestions.push({
        title: 'Elite Wealth Accumulation Achieved',
        type: 'success',
        text: `Outstanding! You have met and exceeded your wealth-saving goal of ₹${savingsTarget.toLocaleString('en-IN')} (achieved ₹${spentSavings.toLocaleString('en-IN')}).`,
        tip: 'Keep up this beautiful momentum! Check if these savings are compounding in high-quality mutual funds rather than sitting idle.'
      });
    } else {
      suggestions.push({
        title: 'Savings Pace is Lagging',
        type: 'warning',
        text: `Your current monthly savings & investments (₹${spentSavings.toLocaleString('en-IN')}) are short of your target goal by ₹${(savingsTarget - spentSavings).toLocaleString('en-IN')}.`,
        tip: 'Automate a fixed transfer to your mutual fund SIP on salary day itself. Treating investments as a mandatory "bill" ensures you invest before spending.'
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  // Machine-readable data object for future AI agents
  const aiMachineBudgetingProfile = {
    income: monthlyIncome,
    allocatedNeedsPct: needsPct,
    allocatedWantsPct: wantsPct,
    allocatedSavingsPct: savingsPct,
    rupeeNeedsTarget: needsTarget,
    rupeeWantsTarget: wantsTarget,
    rupeeSavingsTarget: savingsTarget,
    spentNeeds,
    spentWants,
    spentSavings,
    needsProgressPct: needsUsedPct,
    wantsProgressPct: wantsUsedPct,
    savingsProgressPct: savingsUsedPct,
    activeSuggestionsCount: suggestions.length
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-budgeting-profile={JSON.stringify(aiMachineBudgetingProfile)}
    >
      <SEO 
        title="Budget Assistant"
        description="Configure your personalized 50/30/20 target framework, track real-time Needs vs Wants outlays, and gain human-friendly budgeting suggestions."
        keywords="budget tracking, needs vs wants, 50 30 20 rule, savings rate goals, compounding mutual funds"
      />
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="border-b border-white/5 pb-6">
          <h1 className="heading-2">Smart Budgeting Assistant</h1>
          <p className="text-gray-400">Configure your target allocations, map active outlays, and unlock stress-free cash management.</p>
        </header>

        {/* Budget Allocation Configurator split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 50/30/20 Slider Matrix */}
          <section className="lg:col-span-5 glass-card p-6 border-white/5 space-y-6 h-fit sticky top-28" aria-label="Interactive Allocation Controls">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="text-gold-400" /> Allocation Target Matrix
              </h2>
              <p className="text-xs text-gray-500 mt-1">Adjust sliders to customize your framework. Standard practice recommends the 50/30/20 rule.</p>
            </div>

            <div className="space-y-6">
              {/* Needs Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label htmlFor="budget-needs-slider" className="text-gray-300 font-semibold flex items-center gap-1.5">
                    <Target size={15} className="text-gold-400" /> Needs Target
                  </label>
                  <span className="text-gold-400 font-bold">{needsPct}% (₹{needsTarget.toLocaleString('en-IN')})</span>
                </div>
                <input 
                  id="budget-needs-slider"
                  type="range"
                  min="20"
                  max="80"
                  value={needsPct}
                  onChange={(e) => handleSliderChange('needs', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Target Needs allocation percentage"
                />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Rent, house EMIs, utilities, groceries, healthcare. Fixed mandatory overheads.
                </p>
              </div>

              {/* Wants Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label htmlFor="budget-wants-slider" className="text-gray-300 font-semibold flex items-center gap-1.5">
                    <Smile size={15} className="text-blue-400" /> Wants Target
                  </label>
                  <span className="text-blue-400 font-bold">{wantsPct}% (₹{wantsTarget.toLocaleString('en-IN')})</span>
                </div>
                <input 
                  id="budget-wants-slider"
                  type="range"
                  min="10"
                  max="60"
                  value={wantsPct}
                  onChange={(e) => handleSliderChange('wants', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Target Wants allocation percentage"
                />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Dining out, Swiggy, shopping, travel, subscriptions, movies. Lifestyle & discretionary.
                </p>
              </div>

              {/* Savings Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label htmlFor="budget-savings-slider" className="text-gray-300 font-semibold flex items-center gap-1.5">
                    <PiggyBank size={15} className="text-green-400" /> Savings Target
                  </label>
                  <span className="text-green-400 font-bold">{savingsPct}% (₹{savingsTarget.toLocaleString('en-IN')})</span>
                </div>
                <input 
                  id="budget-savings-slider"
                  type="range"
                  min="10"
                  max="60"
                  value={savingsPct}
                  onChange={(e) => handleSliderChange('savings', Number(e.target.value))}
                  className="w-full accent-gold-500"
                  aria-label="Target Savings allocation percentage"
                />
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Mutual Fund SIPs, emergency fund reserve top-ups, tax investments. Raw wealth building.
                </p>
              </div>
            </div>

            {/* Sum check validator */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center text-xs text-gray-400 font-medium">
              Total Budget Allocation: <span className="text-white font-bold">{needsPct + wantsPct + savingsPct}%</span>
            </div>
          </section>

          {/* Right Column: Bucket Progress Cards */}
          <section className="lg:col-span-7 space-y-6" aria-label="Bucket Progress Metrics">
            
            {/* The 3 Progress Cards */}
            <div className="space-y-5">
              
              {/* Bucket 1: Needs */}
              <article className="glass-card p-5 border-white/5 space-y-3" aria-label="Needs Target Tracker">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      Needs: Essential Bills
                    </h3>
                    <p className="text-xs text-gray-500">Rent, EMIs, Utilities, Pharmacy</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium block">Spent vs Budget:</span>
                    <span className="text-sm font-bold text-white">
                      ₹ {spentNeeds.toLocaleString('en-IN')} / ₹ {needsTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        needsUsedPct > 100 ? 'bg-red-500' : needsUsedPct > 85 ? 'bg-yellow-500' : 'bg-gold-500'
                      }`}
                      style={{ width: `${Math.min(needsUsedPct, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400" role="status">
                    <span>{needsUsedPct}% Used</span>
                    <span>
                      {needsTarget - spentNeeds >= 0 
                        ? `₹ ${(needsTarget - spentNeeds).toLocaleString('en-IN')} remaining` 
                        : `₹ ${Math.abs(needsTarget - spentNeeds).toLocaleString('en-IN')} over budget`
                      }
                    </span>
                  </div>
                </div>
              </article>

              {/* Bucket 2: Wants */}
              <article className="glass-card p-5 border-white/5 space-y-3" aria-label="Wants Target Tracker">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      Wants: Discretionary Lifestyle
                    </h3>
                    <p className="text-xs text-gray-500">Food, Shopping, Travel, Entertainment</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium block">Spent vs Budget:</span>
                    <span className="text-sm font-bold text-white">
                      ₹ {spentWants.toLocaleString('en-IN')} / ₹ {wantsTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        wantsUsedPct > 100 ? 'bg-red-500' : wantsUsedPct > 85 ? 'bg-yellow-500' : 'bg-blue-400'
                      }`}
                      style={{ width: `${Math.min(wantsUsedPct, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400" role="status">
                    <span>{wantsUsedPct}% Used</span>
                    <span>
                      {wantsTarget - spentWants >= 0 
                        ? `₹ ${(wantsTarget - spentWants).toLocaleString('en-IN')} remaining` 
                        : `₹ ${Math.abs(wantsTarget - spentWants).toLocaleString('en-IN')} over budget`
                      }
                    </span>
                  </div>
                </div>
              </article>

              {/* Bucket 3: Savings */}
              <article className="glass-card p-5 border-white/5 space-y-3" aria-label="Savings Target Tracker">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      Savings & Long-term Wealth
                    </h3>
                    <p className="text-xs text-gray-500">Mutual Fund SIPs, Emergency Reserves, PPF/ELSS</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium block">Saved vs Target:</span>
                    <span className="text-sm font-bold text-white">
                      ₹ {spentSavings.toLocaleString('en-IN')} / ₹ {savingsTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        savingsUsedPct >= 100 ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.min(savingsUsedPct, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400" role="status">
                    <span>{savingsUsedPct}% Achieved</span>
                    <span>
                      {savingsTarget - spentSavings > 0 
                        ? `₹ ${(savingsTarget - spentSavings).toLocaleString('en-IN')} shortfall` 
                        : `Target Fully Secured! (+₹${(spentSavings - savingsTarget).toLocaleString('en-IN')})`
                      }
                    </span>
                  </div>
                </div>
              </article>

            </div>

            {/* Smart Advisor Suggestions */}
            <article className="glass-card p-6 border-white/5 space-y-4" aria-label="Personalized Allocation Advice">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <Lightbulb className="text-gold-400" /> Smart Budgeting Advisor
              </h2>
              
              <div className="space-y-3">
                {suggestions.map((sug, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border flex flex-col gap-2 animate-fade-in ${
                      sug.type === 'danger' 
                        ? 'bg-red-500/5 border-red-500/10' 
                        : sug.type === 'warning'
                        ? 'bg-yellow-500/5 border-yellow-500/10'
                        : 'bg-green-500/5 border-green-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className={sug.type === 'danger' ? 'text-red-400' : sug.type === 'warning' ? 'text-yellow-400' : 'text-green-400'} aria-hidden="true" />
                      <h3 className="text-sm font-bold text-white">{sug.title}</h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {sug.text}
                    </p>
                    <div className="p-2 bg-dark-900 rounded-lg text-xs text-gray-400 font-medium">
                      <span className="text-gold-400 font-semibold">Actionable Tip:</span> {sug.tip}
                    </div>
                  </div>
                ))}
              </div>
            </article>

          </section>

        </div>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Budgeting Frameworks Educational Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Budgeting and Cash Management Frameworks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. The 50/30/20 Budgeting Rule</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The 50/30/20 budget framework divides active net monthly paycheck income into: exactly **50% for core living Needs** (fixed bills, rent, EMIs), **30% for discretionary Wants** (dining out, entertainment), and **20% for future Savings** (compounding SIPs, emergency cash). It represents a simple, non-aggressive guide to ensure savings discipline.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Essential Needs vs Discretionary Wants</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Classifying expenses is critical. A "Need" is any outflow that causes immediate physical or financial survival issues if unpaid (electricity, home loan repayments, basic medicines). A "Want" is any discretionary outflow that can be skipped for a month without severe physical issues. Classifying items strictly prevents overrunning limits.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Automating the Savings Target</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Human willpower is finite. Attempting to "save what is left at the end of the month" usually results in zero savings due to lifestyle inflation. The "Pay Yourself First" method overrides this by automating a fixed **20% savings SIP** to execute the day salary arrives, ensuring you invest before lifestyle spending occurs.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default Budgeting;
