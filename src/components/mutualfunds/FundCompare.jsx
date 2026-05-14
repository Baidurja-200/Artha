import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, Plus, X, Search } from 'lucide-react';
import { useMutualFunds } from '../../hooks/useMutualFunds';

const FundCompare = () => {
  const { useSearchFunds } = useMutualFunds();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedFunds, setSelectedFunds] = useState([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [] } = useSearchFunds(debouncedQuery);
  const searchResults = results.slice(0, 5);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const addFund = (fund) => {
    if (selectedFunds.length >= 3) {
      alert('You can compare a maximum of 3 funds at a time.');
      return;
    }
    if (!selectedFunds.find(f => f.schemeCode === fund.schemeCode)) {
      // Add mock data for comparison metrics if not present
      const fundWithMetrics = {
        ...fund,
        cagr3y: parseFloat((Math.random() * (25 - 10) + 10).toFixed(2)),
        volatility: parseFloat((Math.random() * (15 - 8) + 8).toFixed(2)),
      };
      setSelectedFunds([...selectedFunds, fundWithMetrics]);
    }
    setQuery('');
  };

  const removeFund = (code) => {
    setSelectedFunds(selectedFunds.filter(f => f.schemeCode !== code));
  };

  // Prepare chart data
  const chartData = selectedFunds.length > 0 ? [
    {
      metric: '3Y CAGR (%)',
      ...selectedFunds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.cagr3y }), {})
    },
    {
      metric: 'Expense Ratio (%)',
      ...selectedFunds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: parseFloat(fund.expenseRatio) }), {})
    },
    {
      metric: 'Volatility (%)',
      ...selectedFunds.reduce((acc, fund, i) => ({ ...acc, [`fund${i}`]: fund.volatility }), {})
    }
  ] : [];

  const CHART_COLORS = ['#D4AF37', '#3b82f6', '#10b981'];

  return (
    <div className="glass-card border-white/10 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="p-3 bg-dark-800 rounded-xl"><Scale className="text-gold-400" /></div>
        <div>
          <h2 className="heading-3">Mutual Fund Comparison Tool</h2>
          <p className="text-sm text-gray-400">Compare up to 3 funds side-by-side to make informed decisions.</p>
        </div>
      </div>

      {/* Search & Add */}
      <div className="relative mb-8 max-w-lg">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search to add funds..."
              className="w-full bg-dark-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold-500/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-dark-700 px-4 rounded-lg text-sm hover:bg-dark-600 transition-colors">Search</button>
        </form>

        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-dark-800 border border-white/10 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto custom-scrollbar">
            {searchResults.map(fund => (
              <button
                key={fund.schemeCode}
                onClick={() => addFund(fund)}
                className="w-full text-left p-3 hover:bg-white/5 text-sm flex justify-between items-center border-b border-white/5 last:border-0"
              >
                <span className="truncate pr-4">{fund.schemeName}</span>
                <Plus size={16} className="text-gold-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Funds Table / Grid */}
      {selectedFunds.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedFunds.map((fund, idx) => (
              <div key={fund.schemeCode} className="bg-dark-900/50 p-4 rounded-xl border border-white/5 relative">
                <button 
                  onClick={() => removeFund(fund.schemeCode)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="w-8 h-8 rounded bg-dark-800 mb-3 flex items-center justify-center font-bold text-xs" style={{color: CHART_COLORS[idx]}}>
                  F{idx+1}
                </div>
                <h4 className="font-semibold text-white text-sm mb-1 pr-6 truncate" title={fund.schemeName}>{fund.schemeName}</h4>
                <p className="text-xs text-gray-400">{fund.category} • {fund.risk} Risk</p>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">AUM</span>
                    <span className="text-white">{fund.aum}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Comparison */}
          {selectedFunds.length > 1 && (
            <div className="bg-dark-900/30 p-6 rounded-xl border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-6 text-center">Performance & Metric Comparison</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="metric" stroke="#6b7280" fontSize={12} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '8px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    {selectedFunds.map((fund, idx) => (
                      <Bar 
                        key={fund.schemeCode} 
                        dataKey={`fund${idx}`} 
                        name={`F${idx+1}`} 
                        fill={CHART_COLORS[idx]} 
                        radius={[4, 4, 0, 0]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-900/30 rounded-xl border border-dashed border-white/10">
          <Scale className="mx-auto text-gray-600 w-10 h-10 mb-3" />
          <p className="text-gray-400">Search and add funds above to start comparing.</p>
        </div>
      )}

    </div>
  );
};

export default FundCompare;
