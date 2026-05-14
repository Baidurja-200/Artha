import React, { useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Upload, Plus, Trash2, AlertTriangle, ShieldCheck, Lightbulb, ExternalLink } from 'lucide-react';

const COLORS = ['#D4AF37', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const initialPortfolio = [
  { id: 1, symbol: 'HDFCBANK', sector: 'Financials', quantity: 100, avgPrice: 1520 },
  { id: 2, symbol: 'RELIANCE', sector: 'Energy', quantity: 50, avgPrice: 2950 },
  { id: 3, symbol: 'INFY', sector: 'IT', quantity: 120, avgPrice: 1480 },
  { id: 4, symbol: 'TCS', sector: 'IT', quantity: 25, avgPrice: 3950 },
  { id: 5, symbol: 'ITC', sector: 'FMCG', quantity: 400, avgPrice: 420 },
];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [newStock, setNewStock] = useState({ symbol: '', sector: 'Financials', quantity: '', avgPrice: '' });
  const fileInputRef = useRef(null);

  const handleAddStock = () => {
    if (newStock.symbol && newStock.quantity && newStock.avgPrice) {
      setPortfolio([...portfolio, { 
        ...newStock, 
        id: Date.now(), 
        quantity: Number(newStock.quantity),
        avgPrice: Number(newStock.avgPrice)
      }]);
      setNewStock({ symbol: '', sector: 'Financials', quantity: '', avgPrice: '' });
    }
  };

  const handleRemoveStock = (id) => {
    setPortfolio(portfolio.filter(stock => stock.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      const newItems = [];
      // Assuming CSV format: Symbol, Sector, Quantity, AvgPrice
      // Start from index 1 to skip headers
      for (let i = 1; i < lines.length; i++) {
        const [symbol, sector, quantity, avgPrice] = lines[i].split(',').map(item => item.trim());
        if (symbol && quantity && avgPrice) {
          newItems.push({
            id: Date.now() + i,
            symbol: symbol.toUpperCase(),
            sector: sector || 'Others',
            quantity: Number(quantity),
            avgPrice: Number(avgPrice)
          });
        }
      }

      if (newItems.length > 0) {
        setPortfolio([...portfolio, ...newItems]);
      } else {
        alert("Could not parse CSV. Please ensure the format is: Symbol, Sector, Quantity, AvgPrice");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  // Analysis Logic
  const getStockValue = (stock) => stock.quantity * stock.avgPrice;
  const totalValue = portfolio.reduce((sum, item) => sum + getStockValue(item), 0);
  
  // Sector Aggregation
  const sectorDataMap = portfolio.reduce((acc, stock) => {
    const value = getStockValue(stock);
    const normalizedAllocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
    acc[stock.sector] = (acc[stock.sector] || 0) + normalizedAllocation;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Concentration Risk Check
  const highestSector = sectorData[0] || { name: 'None', value: 0 };
  const highestStock = [...portfolio].sort((a, b) => getStockValue(b) - getStockValue(a))[0] || { symbol: 'None', quantity: 0, avgPrice: 0 };
  
  const normalizedHighestStockAlloc = totalValue > 0 ? (getStockValue(highestStock) / totalValue) * 100 : 0;

  // Investment Recommendations Logic
  const ALL_SECTORS = ['Financials', 'IT', 'Energy', 'FMCG', 'Auto', 'Pharma'];
  const userSectors = Object.keys(sectorDataMap);
  const missingSectors = ALL_SECTORS.filter(s => !userSectors.includes(s));
  
  const sectorStockMap = {
    'Financials': [{ sym: 'ICICIBANK', name: 'ICICI Bank' }, { sym: 'SBIN', name: 'State Bank of India' }],
    'IT': [{ sym: 'HCLTECH', name: 'HCL Tech' }, { sym: 'WIPRO', name: 'Wipro' }],
    'Energy': [{ sym: 'ONGC', name: 'ONGC' }, { sym: 'TATAPOWER', name: 'Tata Power' }],
    'FMCG': [{ sym: 'HUL', name: 'Hindustan Unilever' }, { sym: 'NESTLEIND', name: 'Nestle India' }],
    'Auto': [{ sym: 'TATAMOTORS', name: 'Tata Motors' }, { sym: 'M&M', name: 'Mahindra & Mahindra' }],
    'Pharma': [{ sym: 'SUNPHARMA', name: 'Sun Pharma' }, { sym: 'CIPLA', name: 'Cipla' }]
  };

  const getRecommendations = () => {
    let recs = [];
    missingSectors.slice(0, 2).forEach(sector => {
      recs.push({ sector, suggestion: sectorStockMap[sector][0] });
    });
    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="container mx-auto px-6 max-w-7xl py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="heading-2 mb-4">Portfolio Analyzer</h1>
        <p className="text-gray-400">Discover hidden risks, sector concentrations, and optimization opportunities in your Indian equity portfolio.</p>
        <div className="mt-4 inline-block px-6 py-3 rounded-2xl bg-dark-800 border border-gold-500/20 shadow-gold">
          <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
          <h2 className="text-3xl font-bold text-gold-400">{formatCurrency(totalValue)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Entry */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="heading-3 mb-6">Your Holdings</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Symbol (e.g. SBI)" 
                className="input-field"
                value={newStock.symbol}
                onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
              />
              <select 
                className="input-field"
                value={newStock.sector}
                onChange={(e) => setNewStock({...newStock, sector: e.target.value})}
              >
                <option>Financials</option>
                <option>IT</option>
                <option>Energy</option>
                <option>FMCG</option>
                <option>Auto</option>
                <option>Pharma</option>
                <option>Others</option>
              </select>
              <input 
                type="number" 
                placeholder="Quantity" 
                className="input-field"
                value={newStock.quantity}
                onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Avg Price" 
                  className="input-field"
                  value={newStock.avgPrice}
                  onChange={(e) => setNewStock({...newStock, avgPrice: e.target.value})}
                />
                <button 
                  onClick={handleAddStock}
                  className="bg-gold-500 hover:bg-gold-400 text-dark-900 rounded-xl px-3 flex items-center justify-center transition-colors"
                  title="Add Stock"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {portfolio.length === 0 && <p className="text-gray-500 text-center py-4">No holdings added yet.</p>}
              {portfolio.map(stock => {
                const val = getStockValue(stock);
                const percentage = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
                
                return (
                  <div key={stock.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-lg border border-white/5">
                    <div>
                      <div className="font-semibold text-white">{stock.symbol} <span className="text-gray-500 text-xs font-normal">({stock.quantity} units)</span></div>
                      <div className="text-xs text-gray-500">{stock.sector} • Avg: ₹{stock.avgPrice}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-white">{formatCurrency(val)}</div>
                        <div className="text-xs text-gold-400">{percentage}% of total</div>
                      </div>
                      <button onClick={() => handleRemoveStock(stock.id)} className="text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-3"
              >
                <Upload size={16} /> Upload CSV 
                <span className="text-xs text-gray-500 font-normal ml-2">(Format: Symbol, Sector, Qty, Price)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Analysis */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Insights Generator */}
          <div className="glass-panel p-6 border-gold-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl"></div>
             <h3 className="text-xl font-semibold mb-4 text-white">AI Portfolio Insights</h3>
             
             <div className="space-y-4">
               {highestSector.value > 40 ? (
                 <div className="flex items-start gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                   <AlertTriangle className="text-red-400 flex-shrink-0" />
                   <div>
                     <h4 className="font-medium text-red-400 mb-1">High Sector Concentration</h4>
                     <p className="text-sm text-gray-300">Your portfolio is heavily concentrated in <strong>{highestSector.name} ({highestSector.value.toFixed(1)}%)</strong>. A downturn in this sector could severely impact your overall wealth.</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-start gap-3 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                   <ShieldCheck className="text-green-400 flex-shrink-0" />
                   <div>
                     <h4 className="font-medium text-green-400 mb-1">Good Sector Diversification</h4>
                     <p className="text-sm text-gray-300">Your sector allocation looks balanced. No single sector dominates more than 40% of your holdings.</p>
                   </div>
                 </div>
               )}

               {normalizedHighestStockAlloc > 20 && (
                 <div className="flex items-start gap-3 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                   <AlertTriangle className="text-yellow-400 flex-shrink-0" />
                   <div>
                     <h4 className="font-medium text-yellow-400 mb-1">Single Stock Risk</h4>
                     <p className="text-sm text-gray-300"><strong>{highestStock.symbol}</strong> makes up {normalizedHighestStockAlloc.toFixed(1)}% of your portfolio value. Consider trimming to reduce company-specific risk.</p>
                   </div>
                 </div>
               )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="glass-card p-6 h-80 flex flex-col items-center">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Sector Allocation</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `${value.toFixed(1)}%`}
                    contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="glass-card p-6 h-80">
              <h4 className="text-sm font-semibold text-gray-400 mb-4">Allocation Breakdown</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value) => `${value.toFixed(1)}%`}
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Recommendations */}
          <div className="glass-card p-6 border-gold-500/30">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Lightbulb className="text-gold-400" /> Actionable Advice: Where to Invest Next?
            </h3>
            
            {recommendations.length > 0 ? (
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 text-sm">Based on real-time portfolio gap analysis, you are completely missing exposure to the following key sectors:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                      <span className="text-xs text-gold-400 uppercase tracking-widest font-semibold block mb-1">Missing: {rec.sector}</span>
                      <p className="text-white font-medium mb-1">Consider: {rec.suggestion.sym}</p>
                      <p className="text-xs text-gray-500">{rec.suggestion.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm mb-6">Your portfolio covers all major market sectors perfectly. Consider increasing allocation in your top performers based on upcoming quarterly results.</p>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">Want a deep fundamental analysis of these stocks?</div>
              <a 
                href="https://chatgpt.com/g/g-h3p4eYl9e-artha" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm py-2.5 px-5 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
              >
                Chat with Artha AI <ExternalLink size={16} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Portfolio;
