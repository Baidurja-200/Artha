import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { ChevronRight, ChevronLeft, Save, CheckCircle, BookOpen } from 'lucide-react';
import SEO from '../components/common/SEO';

const initialProfileState = {
  name: '',
  age: 30,
  monthlyIncome: 100000,
  monthlyExpenses: 50000,
  existingSavings: 500000,
  emergencyFund: 200000,
  existingInvestments: 300000,
  currentSIPs: 15000,
  loans: 0,
  investmentExperience: 'Intermediate',
  financialGoals: 'Retirement, Wealth Creation',
  investmentHorizon: '10+ Years'
};

const Profile = () => {
  const [profileData, setProfileData] = useLocalStorage('artha_user_profile', initialProfileState);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/dashboard');
    }, 1500);
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Machine-readable data object for future AI agents
  const aiMachineProfileForm = {
    currentWizardStep: step,
    wizardTotalSteps: 3,
    experienceLevel: profileData.investmentExperience,
    horizon: profileData.investmentHorizon
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-3xl py-12 space-y-10 bg-dark-950 text-white"
      role="main"
      data-profile-form={JSON.stringify(aiMachineProfileForm)}
    >
      <SEO 
        title="Investor Profile"
        description="Configure your personal income, monthly expenses, existing savings, and primary financial goals in the Artha Wealth platform."
        keywords="investor profile setup, personal wealth details, monthly budgeting parameters, financial targets setup"
      />

      <header className="text-center">
        <h1 className="heading-2 mb-4">Financial Profile</h1>
        <p className="text-gray-400">Complete your profile parameters to unlock personalized intelligence insights and recommendations.</p>
      </header>

      {/* Progress Bar */}
      <section className="mb-10" aria-label="Wizard progression meter">
        <div className="flex justify-between mb-2 text-sm" role="status">
          <span className={step >= 1 ? 'text-gold-400 font-semibold' : 'text-gray-500'}>1. Basic Info</span>
          <span className={step >= 2 ? 'text-gold-400 font-semibold' : 'text-gray-500'}>2. Financials</span>
          <span className={step >= 3 ? 'text-gold-400 font-semibold' : 'text-gray-500'}>3. Goals</span>
        </div>
        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden" aria-hidden="true">
          <div 
            className="h-full bg-gradient-gold transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </section>

      <section className="glass-panel p-8 md:p-10 relative overflow-hidden" aria-label="Profile wizard form inputs">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="heading-3 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="pf-name-input" className="label-text">Full Name</label>
                <input 
                  id="pf-name-input"
                  type="text" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleInputChange} 
                  className="input-field"
                  placeholder="Rahul Sharma"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="pf-age-slider" className="label-text">Age ({profileData.age} years)</label>
                <input 
                  id="pf-age-slider"
                  type="range" 
                  name="age" 
                  min="18" max="80" 
                  value={profileData.age} 
                  onChange={handleInputChange} 
                  className="w-full accent-gold-500"
                  aria-label="Your current age"
                />
              </div>
              <div>
                <label htmlFor="pf-experience-select" className="label-text">Investment Experience</label>
                <select 
                  id="pf-experience-select"
                  name="investmentExperience" 
                  value={profileData.investmentExperience} 
                  onChange={handleInputChange}
                  className="input-field font-semibold text-white bg-dark-800"
                >
                  <option value="Beginner">Beginner (Just starting out)</option>
                  <option value="Intermediate">Intermediate (Have some mutual funds/stocks)</option>
                  <option value="Expert">Expert (Active trader / direct equity investor)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Financials */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="heading-3 mb-6">Current Financials (₹)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pf-income-input" className="label-text">Monthly Income</label>
                <input 
                  id="pf-income-input"
                  type="number" 
                  name="monthlyIncome" 
                  value={profileData.monthlyIncome} 
                  onChange={handleInputChange} 
                  className="input-field text-gold-400 font-bold" 
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="pf-expenses-input" className="label-text">Monthly Expenses</label>
                <input 
                  id="pf-expenses-input"
                  type="number" 
                  name="monthlyExpenses" 
                  value={profileData.monthlyExpenses} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="pf-savings-input" className="label-text">Existing Savings (Bank/FD)</label>
                <input 
                  id="pf-savings-input"
                  type="number" 
                  name="existingSavings" 
                  value={profileData.existingSavings} 
                  onChange={handleInputChange} 
                  className="input-field" 
                />
              </div>
              <div>
                <label htmlFor="pf-emergency-input" className="label-text">Emergency Fund</label>
                <input 
                  id="pf-emergency-input"
                  type="number" 
                  name="emergencyFund" 
                  value={profileData.emergencyFund} 
                  onChange={handleInputChange} 
                  className="input-field text-green-400 font-semibold" 
                />
              </div>
              <div>
                <label htmlFor="pf-investments-input" className="label-text">Total Investments (MF/Stocks)</label>
                <input 
                  id="pf-investments-input"
                  type="number" 
                  name="existingInvestments" 
                  value={profileData.existingInvestments} 
                  onChange={handleInputChange} 
                  className="input-field" 
                />
              </div>
              <div>
                <label htmlFor="pf-sip-input" className="label-text">Current Monthly SIPs</label>
                <input 
                  id="pf-sip-input"
                  type="number" 
                  name="currentSIPs" 
                  value={profileData.currentSIPs} 
                  onChange={handleInputChange} 
                  className="input-field" 
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="pf-loans-input" className="label-text">Total Outstanding Loans/Debt</label>
                <input 
                  id="pf-loans-input"
                  type="number" 
                  name="loans" 
                  value={profileData.loans} 
                  onChange={handleInputChange} 
                  className="input-field text-red-400 font-semibold" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="heading-3 mb-6">Goals & Horizon</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="pf-goals-input" className="label-text">Primary Financial Goals</label>
                <input 
                  id="pf-goals-input"
                  type="text" 
                  name="financialGoals" 
                  value={profileData.financialGoals} 
                  onChange={handleInputChange} 
                  className="input-field"
                  placeholder="e.g., House, Retirement, Child Education"
                />
              </div>
              <div>
                <label htmlFor="pf-horizon-select" className="label-text">Investment Horizon</label>
                <select 
                  id="pf-horizon-select"
                  name="investmentHorizon" 
                  value={profileData.investmentHorizon} 
                  onChange={handleInputChange}
                  className="input-field font-semibold text-white bg-dark-800"
                >
                  <option value="Short Term (< 3 Years)">Short Term (&lt; 3 Years)</option>
                  <option value="Medium Term (3-7 Years)">Medium Term (3-7 Years)</option>
                  <option value="Long Term (7-15 Years)">Long Term (7-15 Years)</option>
                  <option value="Very Long Term (15+ Years)">Very Long Term (15+ Years)</option>
                </select>
              </div>
            </div>

            {/* Success Overlay */}
            {saved && (
              <div 
                className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in rounded-3xl"
                role="status"
              >
                <CheckCircle className="w-16 h-16 text-gold-500 mb-4 animate-bounce" aria-hidden="true" />
                <h3 className="text-2xl font-bold text-white">Profile Saved!</h3>
                <p className="text-gray-400 mt-2">Generating your diagnostics and insights...</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-white/5 flex justify-between">
          <button 
            onClick={prevStep}
            className={`btn-secondary flex items-center gap-2 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={step === 1}
            aria-label="Go back to previous step"
          >
            <ChevronLeft size={18} aria-hidden="true" /> Back
          </button>
          
          {step < 3 ? (
            <button 
              onClick={nextStep} 
              className="btn-primary flex items-center gap-2"
              aria-label="Go to next step in form wizard"
            >
              Next Step <ChevronRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              className="btn-primary flex items-center gap-2"
              aria-label="Save parameters and calculate wellness scores"
            >
              Save & Analyze <Save size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Investor Profile Setup Philosophy Guide">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> Defining Your Wealth Baseline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Defining Emergency Runway</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Before choosing stock or mutual fund allocations, building an **emergency cash runway** of exactly **6 months of monthly living costs** is mandatory. This emergency FD protects your active compounding investments from forced panic liquidation during job loss or health disruptions.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Prudent Savings Target Baselines</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Standard personal financial planning recommends saving **at least 20% of net monthly income**. High-performing savers targeting early retirement strive for a **50% savings rate**, systematically moving surplus paycheck cash directly into passive NIFTY index SIPs.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Setting Prudent Horizons</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Aligning investment assets with timeline horizons prevents capital losses. Short-term goals under 3 years belong exclusively in low-volatility Debt funds/FDs. Only capital with a **long-term horizon over 7 years** belongs in compounding equity mutual funds and stocks.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default Profile;
