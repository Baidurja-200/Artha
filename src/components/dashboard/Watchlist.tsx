import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useLocalStorage('artha_watchlist_v2', [
    { id: 1, symbol: 'INFY', price: 1095.40, change: -0.8 },
    { id: 2, symbol: 'HDFCBANK', price: 769.55, change: 1.8 },
    { id: 3, symbol: 'RELIANCE', price: 1362.80, change: 2.4 }
  ]);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    
    // Mock getting data
    const mockPrice = Math.floor(Math.random() * 5000) + 100;
    const mockChange = (Math.random() * 5) - 2.5;
    
    setWatchlist([...watchlist, {
      id: Date.now(),
      symbol: newSymbol.toUpperCase(),
      price: mockPrice,
      change: mockChange
    }]);
    setNewSymbol('');
  };

  const handleRemove = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-white">Watchlist</h3>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Add Symbol (e.g. TCS)" 
          className="input-field flex-1"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
        />
        <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-dark-900 rounded-xl px-4 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {watchlist.map(stock => (
          <div key={stock.id} className="flex justify-between items-center bg-dark-900/50 p-3 rounded-xl border border-white/5 group">
            <span className="font-semibold text-gray-200">{stock.symbol}</span>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white text-sm">₹{stock.price.toFixed(2)}</div>
                <div className={`text-xs flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(stock.change).toFixed(2)}%
                </div>
              </div>
              <button 
                onClick={() => handleRemove(stock.id)}
                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {watchlist.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Your watchlist is empty.
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
