import React, { useState } from 'react';
import { ShieldCheck, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ELSSModule = () => {
  const [investment, setInvestment] = useState(150000);
  const taxBracket = 0.312; // 30% + cess

  const taxSaved = investment * taxBracket;

  return (
    <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-dark-900 to-green-900/10 border-green-500/20">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="p-3 bg-dark-800 rounded-xl"><ShieldCheck className="text-green-400" /></div>
        <div>
          <h2 className="heading-3">ELSS Tax Saving Hub</h2>
          <p className="text-sm text-gray-400">Save tax under Section 80C while building long-term wealth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Estimate Your Tax Savings</h3>
            <p className="text-sm text-gray-400 mb-4">Invest up to ₹1.5 Lakhs annually to maximize your deductions.</p>
            
            <div className="mb-2 flex justify-between">
              <label className="text-sm text-gray-300">Annual ELSS Investment</label>
              <span className="text-white font-bold font-display">₹{investment.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="10000" 
              max="150000" 
              step="5000" 
              value={investment} 
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full range-slider"
            />
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <p className="text-sm text-green-400/80 uppercase tracking-wide font-semibold mb-1">Estimated Tax Saved (Highest Bracket)</p>
            <p className="text-4xl font-bold font-display text-green-400 shadow-green-text">
              ₹{taxSaved.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-dark-900/60 p-5 rounded-xl border border-white/5">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Info size={16} className="text-gold-400" /> Lowest Lock-in Period
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              ELSS funds have a mandatory lock-in period of just 3 years. This is the shortest among all 80C options like PPF (15 years), Tax Saving FD (5 years), or NSC (5 years).
            </p>
          </div>

          <div className="bg-dark-900/60 p-5 rounded-xl border border-white/5">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Info size={16} className="text-gold-400" /> Equity Returns
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Unlike traditional fixed-income tax savers, ELSS invests predominantly in equities, making it highly suitable for long-term wealth creation capable of beating inflation.
            </p>
          </div>

          <Link to="/tax-planning" className="btn-secondary w-full flex items-center justify-center gap-2 mt-4">
            Go to Advanced Tax Calculator <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ELSSModule;
