import React, { useState, useRef, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Upload, Plus, Trash2, Lightbulb, ExternalLink,
  BookOpen, Info, RefreshCw, WifiOff, TrendingUp, TrendingDown,
  Wallet, BarChart3, Award, AlertCircle,
} from 'lucide-react';
import { Holding, HoldingWithLiveData } from '../types/finance';
import { useStockPrices } from '../services/stockPriceService';
import LiveAnalysisCard from '../components/portfolio/LiveAnalysisCard';
import SEO from '../components/common/SEO';

const COLORS = ['#D4AF37', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const initialPortfolio: Holding[] = [
  { id: 1, symbol: 'HDFCBANK', sector: 'Financials', quantity: 100, avgPrice: 1520 },
  { id: 2, symbol: 'RELIANCE', sector: 'Energy', quantity: 50, avgPrice: 2950 },
  { id: 3, symbol: 'INFY', sector: 'IT', quantity: 120, avgPrice: 1480 },
  { id: 4, symbol: 'TCS', sector: 'IT', quantity: 25, avgPrice: 3950 },
  { id: 5, symbol: 'ITC', sector: 'FMCG', quantity: 400, avgPrice: 420 },
];

const ALL_SECTORS = ['Financials', 'IT', 'Energy', 'FMCG', 'Auto', 'Pharma'];

const sectorStockMap: Record<string, Array<{ sym: string; name: string }>> = {
  'Financials': [{ sym: 'ICICIBANK', name: 'ICICI Bank' }, { sym: 'SBIN', name: 'State Bank of India' }],
  'IT': [{ sym: 'HCLTECH', name: 'HCL Tech' }, { sym: 'WIPRO', name: 'Wipro' }],
  'Energy': [{ sym: 'ONGC', name: 'ONGC' }, { sym: 'TATAPOWER', name: 'Tata Power' }],
  'FMCG': [{ sym: 'HUL', name: 'Hindustan Unilever' }, { sym: 'NESTLEIND', name: 'Nestle India' }],
  'Auto': [{ sym: 'TATAMOTORS', name: 'Tata Motors' }, { sym: 'M&M', name: 'Mahindra & Mahindra' }],
  'Pharma': [{ sym: 'SUNPHARMA', name: 'Sun Pharma' }, { sym: 'CIPLA', name: 'Cipla' }],
};

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [newStock, setNewStock] = useState({ symbol: '', sector: 'Financials', quantity: '', amountInvested: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Live Price Fetching ────────────────────────────────────
  const symbols = useMemo(() => portfolio.map((s) => s.symbol), [portfolio]);
  const {
    data: priceData,
    isLoading: pricesLoading,
    isFetching: pricesFetching,
    isError: pricesError,
    dataUpdatedAt,
    refetch,
  } = useStockPrices(symbols);

  const isLive = !!priceData && !pricesError;

  // ─── Enriched Holdings with Live Data ───────────────────────
  const enrichedHoldings: HoldingWithLiveData[] = useMemo(() => {
    return portfolio.map((stock) => {
      const investedValue = stock.quantity * stock.avgPrice;
      const livePrice = priceData?.[stock.symbol.toUpperCase()];

      if (livePrice) {
        const currentValue = stock.quantity * livePrice.currentPrice;
        const pnl = currentValue - investedValue;
        const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
        return {
          ...stock,
          investedValue,
          currentPrice: livePrice.currentPrice,
          currentValue,
          pnl,
          pnlPercent,
          dayChange: livePrice.change,
          dayChangePercent: livePrice.changePercent,
        };
      }

      return { ...stock, investedValue };
    });
  }, [portfolio, priceData]);

  // ─── Computed Metrics ───────────────────────────────────────
  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalCurrent = enrichedHoldings.reduce(
    (sum, h) => sum + (h.currentValue ?? h.investedValue),
    0
  );
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const bestPerformer = [...enrichedHoldings].sort(
    (a, b) => (b.pnlPercent ?? 0) - (a.pnlPercent ?? 0)
  )[0];
  const worstPerformer = [...enrichedHoldings].sort(
    (a, b) => (a.pnlPercent ?? 0) - (b.pnlPercent ?? 0)
  )[0];

  // ─── Sector Data ────────────────────────────────────────────
  const sectorDataMap = enrichedHoldings.reduce((acc: Record<string, number>, stock) => {
    const value = stock.currentValue ?? stock.investedValue;
    const normalizedAllocation = totalCurrent > 0 ? (value / totalCurrent) * 100 : 0;
    acc[stock.sector] = (acc[stock.sector] || 0) + normalizedAllocation;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const userSectors = Object.keys(sectorDataMap);
  const missingSectors = ALL_SECTORS.filter((s) => !userSectors.includes(s));

  const recommendations = missingSectors.slice(0, 2).map((sector) => ({
    sector,
    suggestion: sectorStockMap[sector][0],
  }));

  // ─── Handlers ───────────────────────────────────────────────
  const handleAddStock = () => {
    if (newStock.symbol && newStock.quantity && newStock.amountInvested) {
      const qty = Number(newStock.quantity);
      const totalInv = Number(newStock.amountInvested);
      const computedAvgPrice = qty > 0 ? totalInv / qty : 0;
      setPortfolio([
        ...portfolio,
        {
          symbol: newStock.symbol,
          sector: newStock.sector,
          id: Date.now(),
          quantity: qty,
          avgPrice: Math.round(computedAvgPrice * 100) / 100,
        },
      ]);
      setNewStock({ symbol: '', sector: 'Financials', quantity: '', amountInvested: '' });
    }
  };

  const handleRemoveStock = (id: number) => {
    setPortfolio(portfolio.filter((stock) => stock.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim() !== '');

      const newItems: Holding[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [symbol, sector, quantity, avgPrice] = lines[i].split(',').map((item) => item.trim());
        if (symbol && quantity && avgPrice) {
          newItems.push({
            id: Date.now() + i,
            symbol: symbol.toUpperCase(),
            sector: sector || 'Others',
            quantity: Number(quantity),
            avgPrice: Number(avgPrice),
          });
        }
      }

      if (newItems.length > 0) {
        setPortfolio([...portfolio, ...newItems]);
      } else {
        alert('Could not parse CSV. Please ensure the format is: Symbol, Sector, Quantity, AvgPrice');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── Time Since Last Update ─────────────────────────────────
  const getTimeSinceUpdate = () => {
    if (!dataUpdatedAt) return '';
    const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  // ─── Chart Description Helpers ──────────────────────────────
  const getPieChartDescription = () =>
    `Visual PieChart of your Sector Allocation: total equity valuation is ₹${totalCurrent.toLocaleString('en-IN')} spread over ${portfolio.length} holdings.`;

  const getBarChartDescription = () =>
    `Visual BarChart: ${sectorData.map((s) => `${s.name} captures ${s.value.toFixed(1)}%`).join(', ')}.`;

  return (
    <main
      className="container mx-auto px-6 max-w-7xl py-12 space-y-10 bg-dark-950 text-white"
      role="main"
    >
      <SEO
        title="Portfolio Analysis"
        description="Analyze your Indian stock portfolio with live market prices, real-time P&L tracking, and AI-powered buy/hold/sell recommendations."
        keywords="portfolio analyser India, live stock prices, stock P&L tracker, equity valuation, portfolio recommendations"
      />

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="heading-2">Portfolio Analyzer</h1>
        <p className="text-gray-400">
          Live NSE prices, real-time P&L, and AI-powered portfolio recommendations.
        </p>

        {/* Live Status Indicator */}
        <div className="flex items-center justify-center gap-3 mt-2">
          {pricesLoading ? (
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw size={12} className="animate-spin" />
              Fetching live prices…
            </span>
          ) : isLive ? (
            <span className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live · Updated {getTimeSinceUpdate()}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs text-amber-400">
              <WifiOff size={12} />
              Using invested values (live data unavailable)
            </span>
          )}
          <button
            onClick={() => { refetch(); }}
            disabled={pricesFetching}
            className={`text-xs transition-colors flex items-center gap-1 px-3 py-1 rounded-lg border ${
              pricesFetching
                ? 'text-gray-600 border-white/5 cursor-wait'
                : 'text-gray-400 hover:text-gold-400 hover:border-gold-500/30 border-white/10'
            }`}
            title="Refresh prices"
          >
            <RefreshCw size={11} className={pricesFetching ? 'animate-spin' : ''} />
            {pricesFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* ─── Summary Cards ──────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" aria-label="Portfolio summary metrics">
        {/* Total Invested */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wallet size={14} className="text-gray-500" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Invested</span>
          </div>
          <span className="text-lg font-bold text-white">{formatCurrency(totalInvested)}</span>
        </div>

        {/* Current Value */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BarChart3 size={14} className="text-gray-500" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Current</span>
          </div>
          <span className={`text-lg font-bold ${isLive ? 'text-gold-400' : 'text-gray-400'}`}>
            {formatCurrency(totalCurrent)}
          </span>
        </div>

        {/* Total P&L */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {totalPnl >= 0 ? (
              <TrendingUp size={14} className="text-emerald-500" aria-hidden="true" />
            ) : (
              <TrendingDown size={14} className="text-red-500" aria-hidden="true" />
            )}
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">P&L</span>
          </div>
          <span className={`text-lg font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
          </span>
        </div>

        {/* Return % */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Return %</span>
          </div>
          <span className={`text-lg font-bold ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
          </span>
        </div>

        {/* Best Performer */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Award size={14} className="text-emerald-500" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Best</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">{bestPerformer?.symbol ?? '-'}</span>
          {bestPerformer?.pnlPercent !== undefined && (
            <span className="text-[10px] text-emerald-500 block">
              +{bestPerformer.pnlPercent.toFixed(1)}%
            </span>
          )}
        </div>

        {/* Worst Performer */}
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle size={14} className="text-red-500" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Worst</span>
          </div>
          <span className="text-sm font-bold text-red-400">{worstPerformer?.symbol ?? '-'}</span>
          {worstPerformer?.pnlPercent !== undefined && (
            <span className="text-[10px] text-red-500 block">
              {worstPerformer.pnlPercent.toFixed(1)}%
            </span>
          )}
        </div>
      </section>

      {/* ─── Main Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Col: Holdings Entry ─────────────────────── */}
        <aside className="lg:col-span-5 space-y-6" aria-label="Add or import stock holdings">
          <div className="glass-panel p-6">
            <h2 className="heading-3 mb-6">Your Holdings</h2>

            {/* Add Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-6" role="form" aria-label="Add new holding form">
              <div>
                <label htmlFor="pf-symbol-input" className="sr-only">Stock ticker symbol</label>
                <input
                  id="pf-symbol-input"
                  type="text"
                  placeholder="Symbol (e.g. SBI)"
                  className="input-field"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  aria-label="Stock Symbol ticker"
                />
              </div>
              <div>
                <label htmlFor="pf-sector-select" className="sr-only">Sector classification</label>
                <select
                  id="pf-sector-select"
                  className="input-field"
                  value={newStock.sector}
                  onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
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
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  aria-label="Stock shares quantity"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <label htmlFor="pf-invested-input" className="sr-only">Total amount invested in this stock</label>
                <input
                  id="pf-invested-input"
                  type="number"
                  placeholder="Amount Invested (₹ total)"
                  className="input-field flex-1"
                  value={newStock.amountInvested}
                  onChange={(e) => setNewStock({ ...newStock, amountInvested: e.target.value })}
                  aria-label="Total amount invested"
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

            {/* Holdings List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" role="log" aria-label="Current stock holdings list">
              {portfolio.length === 0 && (
                <p className="text-gray-500 text-center py-4">No holdings added yet.</p>
              )}

              {/* Column Headers */}
              {portfolio.length > 0 && (
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider border-b border-white/5">
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-2 text-right">Invested</div>
                  <div className="col-span-2 text-right">Avg Cost</div>
                  <div className="col-span-2 text-right">Curr. Price</div>
                  <div className="col-span-2 text-right">Curr. Value</div>
                  <div className="col-span-1 text-right">P&L</div>
                  <div className="col-span-1" />
                </div>
              )}

              {enrichedHoldings.map((stock) => {
                const currentValue = stock.currentValue ?? stock.investedValue;
                const pnl = stock.pnl ?? 0;
                const pnlPercent = stock.pnlPercent ?? 0;
                const hasLiveData = stock.currentPrice !== undefined;
                const isProfitable = pnl >= 0;

                return (
                  <article
                    key={stock.id}
                    className="grid grid-cols-12 gap-2 items-center p-3 bg-dark-900/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                    aria-label={`Holding details for ${stock.symbol}`}
                  >
                    {/* Stock Info */}
                    <div className="col-span-2">
                      <div className="font-semibold text-white text-sm">{stock.symbol}</div>
                      <div className="text-[10px] text-gray-500">
                        {stock.sector} · {stock.quantity} qty
                      </div>
                    </div>

                    {/* Invested Amount */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs text-gray-400">{formatCurrency(stock.investedValue)}</span>
                    </div>

                    {/* Avg Cost Per Share */}
                    <div className="col-span-2 text-right">
                      <span className="text-xs text-gray-500">₹{stock.avgPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-gray-600 block">per share</span>
                    </div>

                    {/* Current Price */}
                    <div className="col-span-2 text-right">
                      {pricesLoading ? (
                        <div className="h-3 w-12 ml-auto bg-dark-800 rounded animate-pulse" />
                      ) : hasLiveData ? (
                        <div>
                          <span className="text-xs text-white font-medium">
                            ₹{stock.currentPrice!.toLocaleString('en-IN')}
                          </span>
                          {stock.dayChangePercent !== undefined && (
                            <span
                              className={`text-[9px] block ${stock.dayChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                            >
                              {stock.dayChangePercent >= 0 ? '▲' : '▼'}{' '}
                              {Math.abs(stock.dayChangePercent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600">—</span>
                      )}
                    </div>

                    {/* Current Total Value */}
                    <div className="col-span-2 text-right">
                      {hasLiveData ? (
                        <span className="text-xs font-medium text-white">
                          {formatCurrency(currentValue)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">{formatCurrency(stock.investedValue)}</span>
                      )}
                    </div>

                    {/* P&L */}
                    <div className="col-span-1 text-right">
                      {hasLiveData ? (
                        <div>
                          <span
                            className={`text-[10px] font-semibold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}
                          >
                            {isProfitable ? '+' : ''}{pnlPercent.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600">—</span>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveStock(stock.id as number)}
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${stock.symbol} holding`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* CSV Upload */}
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

        {/* ─── Right Col: Charts + Sector Recommendations ──── */}
        <section className="lg:col-span-7 space-y-6" aria-label="Portfolio analysis and charts">
          {/* Charts Row */}
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
                      {sectorData.map((_entry, index) => (
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
              <p className="sr-only" aria-live="polite">{getPieChartDescription()}</p>
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
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="sr-only" aria-live="polite">{getBarChartDescription()}</p>
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

          {/* Sector Gap Recommendations */}
          <article className="glass-card p-6 border-gold-500/30" aria-label="Investment sector advice recommendations">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Lightbulb className="text-gold-400" aria-hidden="true" /> Where to Invest Next?
            </h3>

            {recommendations.length > 0 ? (
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 text-sm">
                  Based on real-time portfolio gap analysis, you are missing exposure to these key sectors:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                      <span className="text-xs text-gold-400 uppercase tracking-widest font-semibold block mb-1">
                        Missing: {rec.sector}
                      </span>
                      <p className="text-white font-medium mb-1">Consider: {rec.suggestion.sym}</p>
                      <p className="text-xs text-gray-500">{rec.suggestion.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm mb-6">
                Your portfolio covers all major market sectors. Consider increasing allocation in top performers.
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Want a deep fundamental analysis of these stocks?</span>
              <a
                href="https://chatgpt.com/g/g-69955fc5ad588191a13c013623cb1fd9-artha"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm py-2.5 px-5 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all"
                aria-label="Open chat with Artha ChatGPT AI stock analyst (opens in a new tab)"
              >
                Chat with Artha AI <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </section>
      </div>

      {/* ─── Live Analysis & Recommendations ────────────────── */}
      {portfolio.length > 0 && (
        <section aria-label="Live AI portfolio analysis and recommendations">
          <LiveAnalysisCard
            holdings={enrichedHoldings}
            totalCurrentValue={totalCurrent}
            totalInvestedValue={totalInvested}
          />
        </section>
      )}

      {/* ─── Educational Guide Section ──────────────────────── */}
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
              Operating with a <strong>sector allocation over 40%</strong> constitutes high concentration risk. Sectors like Financials or Energy are cyclical. A severe credit tightening cycle or crude oil commodity swing will wipe out massive portfolio values if your allocation lacks defensive FMCG or IT anchors.
            </p>
          </article>
          <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">3. Single Stock Company-Specific Volatility</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Holding <strong>more than 20% of your net portfolio in a single company</strong> (e.g. HDFC Bank, Reliance) exposes you to critical company-specific risk (corporate governance failures, top leadership changes). Keeping single equity allocations below 10% is standard prudent risk practice.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Portfolio;
