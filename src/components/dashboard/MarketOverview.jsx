import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

const mockIndices = [
  { name: 'NIFTY 50', value: 23689.60, change: 277.00, percent: 1.18 },
  { name: 'SENSEX', value: 78900.20, change: 810.15, percent: 1.04 },
  { name: 'BANKNIFTY', value: 49850.75, change: 125.40, percent: 0.25 },
  { name: 'GOLD (10g)', value: 74250.00, change: -150.00, percent: -0.20 },
  { name: 'USD/INR', value: 83.55, change: 0.12, percent: 0.14 },
];

const MarketOverview = () => {
  const [indices, setIndices] = useState(mockIndices);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(index => {
        const volatility = index.value * 0.001;
        const changeAmount = (Math.random() - 0.5) * volatility;
        const newValue = index.value + changeAmount;
        const newChange = index.change + changeAmount;
        const newPercent = (newChange / (newValue - newChange)) * 100;
        
        return {
          ...index,
          value: newValue,
          change: newChange,
          percent: newPercent
        };
      }));
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN').format(val.toFixed(2));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="heading-3">Market Indices</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} /> 
          Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {indices.map((idx, i) => (
          <div key={i} className="glass-card p-4 hover:bg-dark-800/60 transition-colors">
            <h4 className="text-gray-400 text-xs font-semibold tracking-wider mb-1">{idx.name}</h4>
            <div className="text-lg font-bold text-white mb-2">{formatCurrency(idx.value)}</div>
            <div className={`flex items-center gap-1 text-sm font-medium ${idx.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {idx.percent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(idx.percent).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
