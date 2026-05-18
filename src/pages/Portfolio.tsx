import React, { useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Upload, Plus, Trash2, AlertTriangle, ShieldCheck, Lightbulb, ExternalLink, BookOpen, Info } from 'lucide-react';
import { Holding } from '../types/finance';
import SEO from '../components/common/SEO';

const COLORS = ['#D4AF37', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const initialPortfolio: Holding[] = [
  { id: 1, symbol: 'HDFCBANK', sector: 'Financials', quantity: 100, avgPrice: 1520 },
  { id: 2, symbol: 'RELIANCE', sector: 'Energy', quantity: 50, avgPrice: 2950 },
  { id: 3, symbol: 'INFY', sector: 'IT', quantity: 120, avgPrice: 1480 },
  { id: 4, symbol: 'TCS', sector: 'IT', quantity: 25, avgPrice: 3950 },
  { id: 5, symbol: 'ITC', sector: 'FMCG', quantity: 400, avgPrice: 420 },
];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [newStock, setNewStock] = useState({ symbol: '', sector: 'Financials', quantity: '', avgPrice: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRemoveStock = (id: number) => {
    setPortfolio(portfolio.filter(stock => stock.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      const newItems: Holding[] = [];
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

  const getStockValue = (stock: Holding) => stock.quantity * stock.avgPrice;
  const totalValue = portfolio.reduce((sum, item) => sum + getStockValue(item), 0);
  
  const sectorDataMap = portfolio.reduce((acc: Record<string, number>, stock) => {
    const value = getStockValue(stock);
    const normalizedAllocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
    acc[stock.sector] = (acc[stock.sector] || 0) + normalizedAllocation;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const highestSector = sectorData[0] || { name: 'None', value: 0 };
  const highestStock = [...portfolio].sort((a, b) => getStockValue(b) - getStockValue(a))[0] || { symbol: 'None', quantity: 0, avgPrice: 0 };
  
  const normalizedHighestStockAlloc = totalValue > 0 ? (getStockValue(highestStock) / totalValue) * 100 : 0;

  const ALL_SECTORS = ['Financials', 'IT', 'Energy', 'FMCG', 'Auto', 'Pharma'];
  const userSectors = Object.keys(sectorDataMap);
  const missingSectors = ALL_SECTORS.filter(s => !userSectors.includes(s));
  
  const sectorStockMap: Record<string, Array<{ sym: string; name: string }>> = {
    'Financials': [{ sym: 'ICICIBANK', name: 'ICICI Bank' }, { sym: 'SBIN', name: 'State Bank of India' }],
    'IT': [{ sym: 'HCLTECH', name: 'HCL Tech' }, { sym: 'WIPRO', name: 'Wipro' }],
    'Energy': [{ sym: 'ONGC', name: 'ONGC' }, { sym: 'TATAPOWER', name: 'Tata Power' }],
    'FMCG': [{ sym: 'HUL', name: 'Hindustan Unilever' }, { sym: 'NESTLEIND', name: 'Nestle India' }],
    'Auto': [{ sym: 'TATAMOTORS', name: 'Tata Motors' }, { sym: 'M&M', name: 'Mahindra & Mahindra' }],
    'Pharma': [{ sym: 'SUNPHARMA', name: 'Sun Pharma' }, { sym: 'CIPLA', name: 'Cipla' }]
  };

  const getRecommendations = () => {
    let recs: Array<{ sector: string; suggestion: { sym: string; name: string } }> = [];
    missingSectors.slice(0, 2).forEach(sector => {
      recs.push({ sector, suggestion: sectorStockMap[sector][0] });
    });
    return recs;
  };

  const recommendations = getRecommendations();

  // Machine-readable data object for future AI agents
  const aiMachinePortfolioProfile = {
    totalValueRupees: totalValue,
    holdingsCount: portfolio.length,
    highestSectorAllocationName: highestSector.name,
    highestSectorAllocationPercentage: Math.round(highestSector.value),
    highestSingleStockAllocationSymbol: highestStock.symbol,
    highestSingleStockAllocationPercentage: Math.round(normalizedHighestStockAlloc),
    sectorAllocationList: sectorData.map(s => ({ sector: s.name, percent: Math.round(s.value) }))
  };

  // Structured plain-text description for Recharts PieChart
  const getPieChartDescription = () => {
    return `Visual PieChart of your Sector Allocation: total equity valuation is ₹${totalValue.toLocaleString('en-IN')} spread over ${portfolio.length} holdings. Your highest sector allocation is in ${highestSector.name} at ${highestSector.value.toFixed(1)}%.`;
  };

  // Structured plain-text description for Recharts BarChart
  const getBarChartDescription = () => {
    return `Visual BarChart representing Sector Allocation breakdown: ${sectorData.map(s => `${s.name} captures ${s.value.toFixed(1)}%`).join(', ')}.`;
  };

  return (
    <main 
      className="container mx-auto px-6 max-w-7xl py-12 space-y-10 bg-dark-950 text-white"
      role="main"
      data-portfolio-profile={JSON.stringify(aiMachinePortfolioProfile)}
    >
      <SEO 
        title="Portfolio Analysis"
        description="Analyze company sector concentration, single stock volatility risks, and calculate the estimated total valuation of your Indian stock holdings."
        keywords="portfolio analyser India, stock sector concentration, diversification advice, equity valuation, upload portfolio csv"
      />

      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="heading-2">Portfolio Analyzer</h1>
        <p className="text-gray-400">Discover hidden risks, sector concentrations, and optimization opportunities in your Indian equity portfolio.</p>
        <div className="mt-4 inline-block px-6 py-3 rounded-2xl bg-dark-800 border border-gold-500/20 shadow-gold" role="status" aria-label="Total portfolio valuation">
          <span className="text-sm text-gray-400 mb-1 block">Total Portfolio Value</span>
          <span className="text-3xl font-bold text-gold-400">{formatCurrency(totalValue)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Entry */}
        <aside className="lg:col-span-6 space-y-6" aria-label="Add or import stock holdings">
          <div className="glass-panel p-6">
            <h2 className="heading-3 mb-6">Your Holdings</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6" role="form" aria-label="Add new holding form">
              <div>
                <label htmlFor="pf-symbol-input" className="sr-only">Stock ticker symbol</label>
                <input 
                  id="pf-symbol-input"
                  type="text" 
                  placeholder="Symbol (e.g. SBI)" 
                  className="input-field"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  aria-label="Stock Symbol ticker"
                />
              </div>
              <div>
                <label htmlFor="pf-sector-select" className="sr-only">Sector classification</label>
                <select 
                  id="pf-sector-select"
                  className="input-field"
                  value={newStock.sector}
                  onChange={(e) => setNewStock({...newStock, sector: e.target.value})}
                  aria-label="Industry Sector classification"
                >
                  <option>Financials</option>
                  <option>IT</option>
                  <option>Energy</option>
                  <option>FMCG</option>
                  <option>Auto</option>
                  <option>Pharma</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf-quantity-input" className="sr-only">Quantity of units owned</label>
                <input 
                  id="pf-quantity-input"
                  type="number" 
                  placeholder="Quantity" 
                  className="input-field"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                  aria-label="Stock shares quantity"
                />
              </div>
              <div className="flex gap-2">
                <label htmlFor="pf-price-input" className="sr-only">Average buy price per unit</label>
                <input 
                  id="pf-price-input"
                  type="number" 
                  placeholder="Avg Price" 
                  className="input-field"
                  value={newStock.avgPrice}
                  onChange={(e) => setNewStock({...newStock, avgPrice: e.target.value})}
                  aria-label="Average share buy price"
                />
                <button 
                  onClick={handleAddStock}
                  className="bg-gold-500 hover:bg-gold-400 text-dark-900 rounded-xl px-3 flex items-center justify-center transition-colors"
                  title="Add Stock to ledger"
                  aria-label="Click to add stock to holdings table"
                >
                  <Plus size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar" role="log" aria-label="Current stock holdings list">
              {portfolio.length === 0 && <p className="text-gray-500 text-center py-4">No holdings added yet.</p>}
              {portfolio.map(stock => {
                const val = getStockValue(stock);
                const percentage = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
                
                return (
                  <article key={stock.id} className="flex justify-between items-center p-3 bg-dark-900/50 rounded-lg border border-white/5" aria-label={`Holding details for ${stock.symbol}`}>
                    <div>
                      <div className="font-semibold text-white">{stock.symbol} <span className="text-gray-500 text-xs font-normal">({stock.quantity} units)</span></div>
                      <div className="text-xs text-gray-500">{stock.sector} • Avg: ₹{stock.avgPrice}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-white">{formatCurrency(val)}</div>
                        <div className="text-xs text-gold-400">{percentage}% of total</div>
                      </div>
                      <button 
                        onClick={() => handleRemoveStock(stock.id as number)} 
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${stock.symbol} holding`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            
            <div className="mt-6">
              <label htmlFor="pf-csv-upload" className="sr-only">Upload holdings CSV sheet</label>
              <input 
                id="pf-csv-upload"
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-3"
                aria-label="Upload CSV statement showing symbol, sector, quantity, average price details"
              >
                <Upload size={16} aria-hidden="true" /> Upload CSV 
                <span className="text-xs text-gray-500 font-normal ml-2">(Format: Symbol, Sector, Qty, Price)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Col: Analysis */}
        <section className="lg:col-span-6 space-y-6" aria-label="AI Portfolio analysis insights">
          
          {/* Insights Generator */}
          <article className="glass-panel p-6 border-gold-500/20 relative overflow-hidden" aria-label="AI concentration diagnostics card">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl" aria-hidden="true"></div>
             <h2 className="text-xl font-semibold mb-4 text-white">AI Portfolio Insights</h2>
             
             <div className="space-y-4">
               {highestSector.value > 40 ? (
                 <div className="flex items-start gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20" role="alert">
                   <AlertTriangle className="text-red-400 flex-shrink-0" aria-hidden="true" />
                   <div>
                     <h3 className="font-medium text-red-400 mb-1">High Sector Concentration</h3>
                     <p className="text-sm text-gray-300">Your portfolio is heavily concentrated in <strong>{highestSector.name} ({highestSector.value.toFixed(1)}%)</strong>. A downturn in this sector could severely impact your overall wealth.</p>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-start gap-3 bg-green-500/10 p-4 rounded-xl border border-green-500/20" role="status">
                   <ShieldCheck className="text-green-400 flex-shrink-0" aria-hidden="true" />
                   <div>
                     <h3 className="font-medium text-green-400 mb-1">Good Sector Diversification</h3>
                     <p className="text-sm text-gray-300">Your sector allocation looks balanced. No single sector dominates more than 40% of your holdings.</p>
                   </div>
                 </div>
               )}

               {normalizedHighestStockAlloc > 20 && (
                 <div className="flex items-start gap-3 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20" role="alert">
                   <AlertTriangle className="text-yellow-400 flex-shrink-0" aria-hidden="true" />
                   <div>
                     <h3 className="font-medium text-yellow-400 mb-1">Single Stock Risk</h3>
                     <p className="text-sm text-gray-300"><strong>{highestStock.symbol}</strong> makes up {normalizedHighestStockAlloc.toFixed(1)}% of your portfolio value. Consider trimming to reduce company-specific risk.</p>
                   </div>
                 </div>
               )}
             </div>
          </article>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <article className="glass-card p-6 h-80 flex flex-col items-center justify-between" aria-label="Visual Sector Allocation Pie Chart">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Sector Allocation Chart</h3>
              <div className="w-full h-44">
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
                      formatter={(value) => `${Number(value).toFixed(1)}%`}
                      contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="sr-only" aria-live="polite">
                {getPieChartDescription()}
              </p>
              <div className="w-full text-left mt-1">
                <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                  <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-gray-400">Interpretation:</strong> {getPieChartDescription()}
                  </span>
                </span>
              </div>
            </article>

            {/* Bar Chart */}
            <article className="glass-card p-6 h-80 flex flex-col justify-between" aria-label="Visual Sector Allocation Bar Chart">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Allocation Breakdown</h3>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      formatter={(value) => `${Number(value).toFixed(1)}%`}
                      cursor={{fill: '#ffffff05'}}
                      contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="sr-only" aria-live="polite">
                {getBarChartDescription()}
              </p>
              <div className="w-full text-left mt-1">
                <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                  <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="text-gray-400">Interpretation:</strong> {getBarChartDescription()}
                  </span>
                </span>
              </div>
            </article>
          </div>

          {/* Investment Recommendations */}
          <article className="glass-card p-6 border-gold-500/30" aria-label="Investment sector advice recommendations">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Lightbulb className="text-gold-400" aria-hidden="true" /> Actionable Advice: Where to Invest Next?
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
              <span className="text-sm text-gray-400">Want a deep fundamental analysis of these stocks?</span>
              <a 
                href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm py-2.5 px-5 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
                aria-label="Open chat conversation with Artha ChatGPT AI stock analyst (opens in a new tab)"
              >
                Chat with Artha AI <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </article>

        </section>
      </div>

      {/* Structured Static Educational Guide Section */}
      <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Portfolio Diversification Principles Guide">
        <h2 className="heading-3 flex items-center gap-2">
          <BookOpen className="text-gold-400" /> Capital Allocation & Sector Diversification Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">1. Core Philosophy of Diversification</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Diversification is the only "free lunch" in investing. Spreading equity holdings across non-correlated sectors (like Financials, IT, Pharma, and FMCG) ensures that a standard regulatory or demand downturn in one sector is offset by defensive gains in other sectors.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">2. Sector Concentration Dangers</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Operating with a **sector allocation over 40%** constitutes high concentration risk. Sectors like Financials or Energy are cyclical. A severe credit tightening cycle or crude oil commodity swing will wipe out massive portfolio values if your allocation lacks defensive FMCG or IT anchors.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Single Stock Company-Specific Volatility</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Holding **more than 20% of your net portfolio in a single company** (e.g. HDFC Bank, Reliance) exposes you to critical company-specific risk (corporate governance failures, top leadership changes). Keeping single equity allocations below 10% is standard prudent risk practice.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default Portfolio;
