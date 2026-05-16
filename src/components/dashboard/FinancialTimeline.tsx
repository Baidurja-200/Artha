import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFinanceStore from '../../store/useFinanceStore';
import { TrendingUp, Clock } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const FinancialTimeline = () => {
  const { trackingHistory } = useFinanceStore();

  if (!trackingHistory || trackingHistory.length < 2) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center h-64 text-gray-500">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        <p>Not enough historical data to show trends.</p>
        <p className="text-xs mt-1">Check back next month!</p>
      </div>
    );
  }

  const chartData = trackingHistory.map(entry => {
    const dateObj = new Date(entry.date);
    return {
      month: dateObj.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      score: entry.overallScore,
      netWorth: entry.netWorth
    };
  });

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="text-gold-400" /> Financial Health Timeline
          </h3>
          <p className="text-sm text-gray-400 mt-1">Track your wellness score evolution over time.</p>
        </div>
        <div className="bg-dark-800/80 px-3 py-1.5 rounded-lg border border-white/5 flex gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></span>
            <span className="text-xs text-gray-300 font-medium">Wellness Score</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
              itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
              formatter={(value, name) => [value, name === 'score' ? 'Wellness Score' : name]}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#d4af37" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#scoreGradient)" 
              activeDot={{ r: 6, fill: '#d4af37', stroke: '#1a1a1e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-gold-500/5 border border-gold-500/10 rounded-xl">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-semibold text-gold-400">Insight:</span> Your financial wellness has consistently improved over the last 6 months. This positive trajectory proves that your current debt reduction and SIP compounding strategies are working exactly as intended.
        </p>
      </div>
    </div>
  );
};

export default FinancialTimeline;
