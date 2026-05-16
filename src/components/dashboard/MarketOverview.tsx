import React from 'react';
import { TrendingUp, TrendingDown, Clock, Globe } from 'lucide-react';
import { useMarketOverview } from '../../services/marketApi';

const MarketOverview = () => {
  const { data: indices = [], isLoading, error } = useMarketOverview();
  
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="heading-3 flex items-center gap-2">
          <Globe className="text-blue-400 w-5 h-5" /> Global Crypto Markets
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} /> 
          Live updates via CoinGecko
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {isLoading ? (
          // Skeleton Loaders
          [...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-3 w-16 bg-white/10 rounded mb-3"></div>
              <div className="h-6 w-24 bg-white/10 rounded mb-2"></div>
              <div className="h-4 w-12 bg-white/10 rounded"></div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-5 text-sm text-red-400 p-4 glass-card border-red-500/20 text-center">
            Failed to load market data. Please try again later.
          </div>
        ) : (
          indices.map((idx, i) => (
            <div key={i} className="glass-card p-4 hover:bg-dark-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                {idx.image && <img src={idx.image} alt={idx.name} className="w-4 h-4" />}
                <h4 className="text-gray-400 text-xs font-semibold tracking-wider">{idx.name}</h4>
              </div>
              <div className="text-lg font-bold text-white mb-2 font-display">₹{formatCurrency(idx.value)}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${idx.percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {idx.percent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(idx.percent).toFixed(2)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketOverview;
