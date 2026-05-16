import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { ChevronRight, ChevronLeft, Save, CheckCircle } from 'lucide-react';

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

  const handleInputChange = (e) => {
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

  return (
    <div className="container mx-auto px-6 max-w-3xl py-12">
      <div className="mb-10 text-center">
        <h1 className="heading-2 mb-4">Financial Profile</h1>
        <p className="text-gray-400">Complete your profile to unlock personalized insights and recommendations.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          <span className={`text-sm ${step >= 1 ? 'text-gold-400' : 'text-gray-500'}`}>Basic Info</span>
          <span className={`text-sm ${step >= 2 ? 'text-gold-400' : 'text-gray-500'}`}>Financials</span>
          <span className={`text-sm ${step >= 3 ? 'text-gold-400' : 'text-gray-500'}`}>Goals</span>
        </div>
        <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-gold transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="glass-panel p-8 md:p-10 relative overflow-hidden">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="heading-3 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="label-text">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleInputChange} 
                  className="input-field"
                  placeholder="Rahul Sharma"
                />
              </div>
              <div>
                <label className="label-text">Age ({profileData.age} years)</label>
                <input 
                  type="range" 
                  name="age" 
                  min="18" max="80" 
                  value={profileData.age} 
                  onChange={handleInputChange} 
                />
              </div>
              <div>
                <label className="label-text">Investment Experience</label>
                <select 
                  name="investmentExperience" 
                  value={profileData.investmentExperience} 
                  onChange={handleInputChange}
                  className="input-field"
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
          <div className="animate-fade-in">
            <h2 className="heading-3 mb-6">Current Financials (₹)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text">Monthly Income</label>
                <input type="number" name="monthlyIncome" value={profileData.monthlyIncome} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Monthly Expenses</label>
                <input type="number" name="monthlyExpenses" value={profileData.monthlyExpenses} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Existing Savings (Bank/FD)</label>
                <input type="number" name="existingSavings" value={profileData.existingSavings} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Emergency Fund</label>
                <input type="number" name="emergencyFund" value={profileData.emergencyFund} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Total Investments (MF/Stocks)</label>
                <input type="number" name="existingInvestments" value={profileData.existingInvestments} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="label-text">Current Monthly SIPs</label>
                <input type="number" name="currentSIPs" value={profileData.currentSIPs} onChange={handleInputChange} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="label-text">Total Outstanding Loans/Debt</label>
                <input type="number" name="loans" value={profileData.loans} onChange={handleInputChange} className="input-field" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="heading-3 mb-6">Goals & Horizon</h2>
            <div className="space-y-6">
              <div>
                <label className="label-text">Primary Financial Goals</label>
                <input 
                  type="text" 
                  name="financialGoals" 
                  value={profileData.financialGoals} 
                  onChange={handleInputChange} 
                  className="input-field"
                  placeholder="e.g., House, Retirement, Child Education"
                />
              </div>
              <div>
                <label className="label-text">Investment Horizon</label>
                <select 
                  name="investmentHorizon" 
                  value={profileData.investmentHorizon} 
                  onChange={handleInputChange}
                  className="input-field"
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
              <div className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in rounded-3xl">
                <CheckCircle className="w-16 h-16 text-gold-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-white">Profile Saved!</h3>
                <p className="text-gray-400 mt-2">Generating your insights...</p>
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
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {step < 3 ? (
            <button onClick={nextStep} className="btn-primary flex items-center gap-2">
              Next Step <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              Save & Analyze <Save size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
