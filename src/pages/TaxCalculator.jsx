import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const TaxCalculator = () => {
  const [income, setIncome] = useState(1500000);
  const [hra, setHra] = useState(0);
  const [deduction80c, setDeduction80c] = useState(150000);
  const [deduction80d, setDeduction80d] = useState(25000);
  const [homeLoanInt, setHomeLoanInt] = useState(200000);
  const [otherDeductions, setOtherDeductions] = useState(50000);

  // Standard deduction
  const standardDeduction = 50000;

  // Calculate Old Regime Tax
  const calculateOldTax = () => {
    let taxable = income - standardDeduction - hra - Math.min(deduction80c, 150000) - deduction80d - Math.min(homeLoanInt, 200000) - otherDeductions;
    if (taxable <= 250000) return 0;
    if (taxable <= 500000) return 0; // Rebate u/s 87A

    let tax = 0;
    if (taxable > 1000000) {
      tax += (taxable - 1000000) * 0.3;
      tax += 500000 * 0.2;
      tax += 250000 * 0.05;
    } else if (taxable > 500000) {
      tax += (taxable - 500000) * 0.2;
      tax += 250000 * 0.05;
    } else {
      tax += (taxable - 250000) * 0.05;
    }
    return tax * 1.04; // 4% cess
  };

  // Calculate New Regime Tax (FY 2023-24 onwards)
  const calculateNewTax = () => {
    let taxable = income - standardDeduction; // New regime allows standard deduction now
    if (taxable <= 700000) return 0; // Rebate u/s 87A

    let tax = 0;
    if (taxable > 1500000) {
      tax += (taxable - 1500000) * 0.3;
      taxable = 1500000;
    }
    if (taxable > 1200000) {
      tax += (taxable - 1200000) * 0.2;
      taxable = 1200000;
    }
    if (taxable > 900000) {
      tax += (taxable - 900000) * 0.15;
      taxable = 900000;
    }
    if (taxable > 600000) {
      tax += (taxable - 600000) * 0.1;
      taxable = 600000;
    }
    if (taxable > 300000) {
      tax += (taxable - 300000) * 0.05;
    }
    return tax * 1.04; // 4% cess
  };

  const oldTax = calculateOldTax();
  const newTax = calculateNewTax();
  const savings = Math.abs(oldTax - newTax);
  const recommendedRegime = oldTax < newTax ? 'Old Regime' : 'New Regime';

  const chartData = [
    {
      name: 'Tax Comparison',
      'Old Regime': oldTax,
      'New Regime': newTax,
    }
  ];

  return (
    <div className="container mx-auto px-6 max-w-5xl py-12">
      <div className="mb-10 text-center">
        <h1 className="heading-2 mb-4">Indian Income Tax Calculator</h1>
        <p className="text-gray-400">Compare Old vs New tax regimes and optimize your taxes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6 glass-panel p-6 md:p-8">
          <h3 className="heading-3 mb-6">Income & Deductions</h3>
          
          <div>
            <label className="label-text">Gross Annual Income</label>
            <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="input-field text-lg font-bold text-gold-400" />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Exemptions & Deductions (Old Regime)</h4>
            <div>
              <label className="label-text flex justify-between">HRA Exemption <span>{formatCurrency(hra)}</span></label>
              <input type="range" min="0" max="500000" step="10000" value={hra} onChange={(e) => setHra(Number(e.target.value))} />
            </div>
            <div>
              <label className="label-text flex justify-between">80C (LIC, EPF, PPF, ELSS) <span>{formatCurrency(deduction80c)}</span></label>
              <input type="range" min="0" max="150000" step="5000" value={deduction80c} onChange={(e) => setDeduction80c(Number(e.target.value))} />
            </div>
            <div>
              <label className="label-text flex justify-between">80D (Health Insurance) <span>{formatCurrency(deduction80d)}</span></label>
              <input type="range" min="0" max="100000" step="5000" value={deduction80d} onChange={(e) => setDeduction80d(Number(e.target.value))} />
            </div>
            <div>
              <label className="label-text flex justify-between">Home Loan Interest (Sec 24) <span>{formatCurrency(homeLoanInt)}</span></label>
              <input type="range" min="0" max="200000" step="10000" value={homeLoanInt} onChange={(e) => setHomeLoanInt(Number(e.target.value))} />
            </div>
            <div>
              <label className="label-text flex justify-between">Other Deductions (NPS, etc.) <span>{formatCurrency(otherDeductions)}</span></label>
              <input type="range" min="0" max="500000" step="10000" value={otherDeductions} onChange={(e) => setOtherDeductions(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Recommendation Card */}
          <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-dark-800 to-dark-900 border-gold-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-gray-400 font-medium mb-2">Recommended Regime</h3>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gold-400">{recommendedRegime}</h2>
              <CheckCircle2 className="text-green-400 w-8 h-8" />
            </div>
            
            <p className="text-gray-300 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-400" />
              You save <strong className="text-white mx-1">{formatCurrency(savings)}</strong> by choosing the {recommendedRegime}.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`glass-card p-6 border-t-4 ${recommendedRegime === 'Old Regime' ? 'border-t-green-500' : 'border-t-dark-700'}`}>
              <h4 className="text-gray-400 font-medium mb-2">Old Regime Tax</h4>
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(oldTax)}</div>
              <div className="text-sm text-gray-500">Effective Rate: {((oldTax / income) * 100).toFixed(1)}%</div>
            </div>
            <div className={`glass-card p-6 border-t-4 ${recommendedRegime === 'New Regime' ? 'border-t-green-500' : 'border-t-dark-700'}`}>
              <h4 className="text-gray-400 font-medium mb-2">New Regime Tax</h4>
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(newTax)}</div>
              <div className="text-sm text-gray-500">Effective Rate: {((newTax / income) * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Old Regime" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40} />
                <Bar dataKey="New Regime" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
