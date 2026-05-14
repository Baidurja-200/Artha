import React from 'react';
import { Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const OverlapAnalyzer = () => {
  // Mock Data for Demo
  const mockOverlapData = [
    { name: 'HDFC Bank', value: 9.5 },
    { name: 'Reliance', value: 8.2 },
    { name: 'ICICI Bank', value: 7.8 },
    { name: 'Infosys', value: 5.4 },
    { name: 'Others', value: 69.1 }
  ];
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#374151'];

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="p-3 bg-dark-800 rounded-xl"><Layers className="text-purple-400" /></div>
        <div>
          <h2 className="heading-3">Portfolio Overlap Analyzer</h2>
          <p className="text-sm text-gray-400">Discover hidden redundancies in your mutual fund holdings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Underlying Stock Concentration</h3>
          <p className="text-sm text-gray-400 mb-6">
            If you own multiple Flexi Cap or Large Cap funds, they likely invest in the exact same top 10 stocks. This creates hidden concentration risk.
          </p>

          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-1">High Overlap Detected</h4>
                <p className="text-xs text-gray-300">Your portfolio has high overlap in banking holdings. 17.3% of your total mutual fund investment is just in HDFC & ICICI Bank.</p>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-1">Good AMC Diversification</h4>
                <p className="text-xs text-gray-300">You have spread your investments across 4 different Asset Management Companies (AMCs).</p>
              </div>
            </div>
          </div>
          
          <button className="btn-secondary w-full mt-6">Upload CAS (PDF/CSV) for Real Analysis</button>
        </div>

        <div className="h-64 flex flex-col items-center justify-center bg-dark-900/50 rounded-xl border border-white/5 p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Aggregated Top Holdings</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockOverlapData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {mockOverlapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
    </div>
  );
};

export default OverlapAnalyzer;
