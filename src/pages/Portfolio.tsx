import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Upload, Plus, Trash2, AlertTriangle, ShieldCheck, Lightbulb, 
  RefreshCw, Key, Sparkles, TrendingUp, TrendingDown, Send, 
  ChevronRight, ArrowUpRight, ArrowDownRight, CheckCircle2, 
  SlidersHorizontal, MessageSquare, Info, BookOpen
} from 'lucide-react';
import { Holding, HoldingWithLiveData } from '../types/finance';
import { 
  getStockQuote, getBatchStockQuotes, getApiSettings, 
  sanitizeSymbol, StockQuote 
} from '../services/stockPriceService';
import { 
  generatePortfolioAnalysis, chatWithPortfolioAdvisor, 
  AiAnalysisResult, ChatMessage, PortfolioContext 
} from '../services/geminiService';
import { ApiKeyModal } from '../components/portfolio/ApiKeyModal';
import LiveAnalysisCard from '../components/portfolio/LiveAnalysisCard';
import SEO from '../components/common/SEO';

const COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const formatDecimal = (val: number) => 
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

const initialPortfolioData: Holding[] = [
  { id: 1, symbol: 'HDFCBANK', sector: 'Financials', quantity: 100, avgPrice: 1520, currentPrice: 1530 },
  { id: 2, symbol: 'RELIANCE', sector: 'Energy', quantity: 50, avgPrice: 1240, currentPrice: 1226.4 },
  { id: 3, symbol: 'INFY', sector: 'IT', quantity: 120, avgPrice: 1480, currentPrice: 1051.4 },
  { id: 4, symbol: 'TCS', sector: 'IT', quantity: 25, avgPrice: 2050, currentPrice: 2105 },
  { id: 5, symbol: 'ITC', sector: 'FMCG', quantity: 400, avgPrice: 420, currentPrice: 425 },
];

const POPULAR_TICKERS = ['SBIN', 'ICICIBANK', 'TATAMOTORS', 'HUL', 'BHARTIARTL', 'LT'];

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Holding[]>(() => {
    const saved = localStorage.getItem('artha_user_portfolio');
    return saved ? JSON.parse(saved) : initialPortfolioData;
  });

  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loadingQuotes, setLoadingQuotes] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // New Stock Form
  const [newStock, setNewStock] = useState({ symbol: '', sector: 'Financials', quantity: '', avgPrice: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Diagnostic State
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Interactive AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Save portfolio to local storage
  useEffect(() => {
    localStorage.setItem('artha_user_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Fetch real-time quotes on mount & portfolio change
  const refreshLivePrices = async (force = false) => {
    if (portfolio.length === 0) return;
    setLoadingQuotes(true);
    try {
      const symbols = portfolio.map(p => p.symbol);
      const fetchedQuotes = await getBatchStockQuotes(symbols, force);
      setQuotes(fetchedQuotes);

      // Update portfolio holdings with current prices
      setPortfolio(prev => prev.map(holding => {
        const quote = fetchedQuotes[sanitizeSymbol(holding.symbol)];
        if (quote) {
          return {
            ...holding,
            currentPrice: quote.currentPrice,
            nsePrice: quote.nsePrice,
            bsePrice: quote.bsePrice,
            dayChange: quote.dayChange,
            dayChangePercent: quote.dayChangePercent,
            previousClose: quote.previousClose,
            high52w: quote.high52w,
            low52w: quote.low52w,
            lastUpdated: quote.lastUpdated
          };
        }
        return holding;
      }));

      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to refresh stock quotes:', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    refreshLivePrices(false);
  }, []);

  // Handle adding a new stock
  const handleAddStock = async () => {
    if (newStock.symbol && newStock.quantity && newStock.avgPrice) {
      const cleanSym = sanitizeSymbol(newStock.symbol);
      const tempId = Date.now();
      const quantity = Number(newStock.quantity);
      const avgPrice = Number(newStock.avgPrice);

      // Add with temporary price, then fetch live quote
      const newItem: Holding = {
        id: tempId,
        symbol: cleanSym,
        sector: newStock.sector,
        quantity,
        avgPrice,
        currentPrice: avgPrice, // default until fetched
      };

      setPortfolio(prev => [...prev, newItem]);
      setNewStock({ symbol: '', sector: 'Financials', quantity: '', avgPrice: '' });

      // Fetch live quote for this new stock immediately
      try {
        const quote = await getStockQuote(cleanSym, true);
        setQuotes(prev => ({ ...prev, [cleanSym]: quote }));
        setPortfolio(prev => prev.map(item => item.id === tempId ? {
          ...item,
          currentPrice: quote.currentPrice,
          nsePrice: quote.nsePrice,
          bsePrice: quote.bsePrice,
          dayChange: quote.dayChange,
          dayChangePercent: quote.dayChangePercent,
          previousClose: quote.previousClose,
        } : item));
      } catch (err) {
        console.warn('Could not fetch quote for new stock:', err);
      }
    }
  };

  const handleRemoveStock = (id: number) => {
    setPortfolio(portfolio.filter(stock => stock.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      const newItems: Holding[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [symbol, sector, quantity, avgPrice] = lines[i].split(',').map(item => item.trim());
        if (symbol && quantity && avgPrice) {
          newItems.push({
            id: Date.now() + i,
            symbol: sanitizeSymbol(symbol),
            sector: sector || 'Others',
            quantity: Number(quantity),
            avgPrice: Number(avgPrice),
            currentPrice: Number(avgPrice)
          });
        }
      }

      if (newItems.length > 0) {
        setPortfolio(prev => [...prev, ...newItems]);
        refreshLivePrices(true);
      } else {
        alert("Could not parse CSV. Please ensure the format is: Symbol, Sector, Quantity, AvgPrice");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Calculations based on Real-Time Market Prices
  const getInvestedValue = (stock: Holding) => stock.quantity * stock.avgPrice;
  const getCurrentValue = (stock: Holding) => stock.quantity * (stock.currentPrice || stock.avgPrice);
  const getStockPnl = (stock: Holding) => getCurrentValue(stock) - getInvestedValue(stock);
  const getStockPnlPercent = (stock: Holding) => {
    const invested = getInvestedValue(stock);
    return invested > 0 ? (getStockPnl(stock) / invested) * 100 : 0;
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + getInvestedValue(item), 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => sum + getCurrentValue(item), 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Today's Return based on dayChange
  const todayPnl = portfolio.reduce((sum, item) => {
    const change = item.dayChange || 0;
    return sum + (item.quantity * change);
  }, 0);
  const todayPnlPercent = (totalCurrentValue - todayPnl) > 0 ? (todayPnl / (totalCurrentValue - todayPnl)) * 100 : 0;

  // Sector Aggregation using Current Valuation
  const sectorDataMap = portfolio.reduce((acc, stock) => {
    const value = getCurrentValue(stock);
    const normalizedAllocation = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
    acc[stock.sector] = (acc[stock.sector] || 0) + normalizedAllocation;
    return acc;
  }, {} as Record<string, number>);

  const sectorData = Object.entries(sectorDataMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
    .sort((a, b) => b.value - a.value);

  // Concentration Risk Check
  const highestSector = sectorData[0] || { name: 'None', value: 0 };
  const highestStock = [...portfolio].sort((a, b) => getCurrentValue(b) - getCurrentValue(a))[0] || { symbol: 'None', quantity: 0, avgPrice: 0 };
  const normalizedHighestStockAlloc = totalCurrentValue > 0 ? (getCurrentValue(highestStock) / totalCurrentValue) * 100 : 0;

  // Missing Sectors
  const ALL_SECTORS = ['Financials', 'IT', 'Energy', 'FMCG', 'Auto', 'Pharma'];
  const userSectors = Object.keys(sectorDataMap);
  const missingSectors = ALL_SECTORS.filter(s => !userSectors.includes(s));

  // Build Portfolio Context for Gemini LLM
  const buildPortfolioContext = (): PortfolioContext => {
    return {
      holdings: portfolio.map(h => {
        const invested = getInvestedValue(h);
        const current = getCurrentValue(h);
        const pnl = current - invested;
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
        const alloc = totalCurrentValue > 0 ? (current / totalCurrentValue) * 100 : 0;
        return {
          symbol: h.symbol,
          sector: h.sector,
          quantity: h.quantity,
          avgPrice: h.avgPrice,
          currentPrice: h.currentPrice || h.avgPrice,
          investedValue: invested,
          currentValue: current,
          pnl,
          pnlPercent,
          dayChangePercent: h.dayChangePercent,
          allocationPercent: alloc,
          nsePrice: h.nsePrice,
          bsePrice: h.bsePrice,
          spreadDiff: h.nsePrice && h.bsePrice ? Math.abs(h.bsePrice - h.nsePrice) : undefined,
        };
      }),
      totalInvested,
      totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      todayPnl,
      sectorAllocation: sectorDataMap,
      highestSector,
      highestStock: { symbol: highestStock.symbol, value: normalizedHighestStockAlloc }
    };
  };

  // Run AI Portfolio Diagnostic
  const handleRunAiDiagnostic = async () => {
    if (portfolio.length === 0) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const context = buildPortfolioContext();
      const result = await generatePortfolioAnalysis(context);
      setAiAnalysis(result);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Send message in interactive chat
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newHistory: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: userText, timestamp: new Date().toLocaleTimeString('en-IN') }
    ];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const context = buildPortfolioContext();
      const reply = await chatWithPortfolioAdvisor(newHistory, userText, context);
      setChatMessages([
        ...newHistory,
        { role: 'assistant', content: reply, timestamp: new Date().toLocaleTimeString('en-IN') }
      ]);
    } catch (err: any) {
      setChatMessages([
        ...newHistory,
        { role: 'assistant', content: `⚠️ Error: ${err.message || 'Could not reach FinSight AI.'}` }
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const settings = getApiSettings();

  const enrichedHoldings: HoldingWithLiveData[] = useMemo(() => {
    return portfolio.map((stock) => {
      const investedValue = stock.quantity * stock.avgPrice;
      const currentPrice = stock.currentPrice || stock.avgPrice;
      const currentValue = stock.quantity * currentPrice;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      return {
        ...stock,
        investedValue,
        currentPrice,
        currentValue,
        pnl,
        pnlPercent,
        dayChange: stock.dayChange,
        dayChangePercent: stock.dayChangePercent,
      };
    });
  }, [portfolio]);

  return (
    <main className="container mx-auto px-4 lg:px-6 max-w-7xl py-8 space-y-8" role="main">
      <SEO
        title="Portfolio Analysis"
        description="Analyze your Indian stock portfolio with live market prices, real-time P&L tracking, and AI-powered recommendations."
        keywords="portfolio analyser India, live stock prices, stock P&L tracker, equity valuation, portfolio recommendations"
      />
      
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading-2">Portfolio Analyzer</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live NSE & BSE Feed
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Real-time market valuation, exchange spread comparison, and AI risk analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => refreshLivePrices(true)}
            disabled={loadingQuotes}
            className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2"
            title="Fetch latest prices from NSE and BSE"
          >
            <RefreshCw size={14} className={loadingQuotes ? 'animate-spin text-gold-400' : ''} />
            <span>{loadingQuotes ? 'Updating...' : 'Refresh Prices'}</span>
            {lastUpdated && <span className="text-gray-500 text-[10px]">({lastUpdated})</span>}
          </button>

          {/* Settings & API Key Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2 hover:border-gold-500/40"
            title="Configure Gemini LLM and BSE/NSE API keys"
          >
            <Key size={14} className="text-gold-400" />
            <span>API & AI Keys</span>
          </button>

          {/* Run AI Analysis Button */}
          <button
            onClick={handleRunAiDiagnostic}
            disabled={loadingAi || portfolio.length === 0}
            className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2 font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
          >
            <Sparkles size={14} />
            <span>{loadingAi ? 'Analyzing...' : 'AI Portfolio Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Current Value */}
        <div className="glass-panel p-5 border-gold-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl"></div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Current Portfolio Value</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-gold-400">{formatCurrency(totalCurrentValue)}</h2>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Real-time CMP Valuation ({settings.preferredExchange})
          </div>
        </div>

        {/* Total Invested */}
        <div className="glass-panel p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Total Invested Capital</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">{formatCurrency(totalInvested)}</h2>
          <div className="mt-2 text-xs text-gray-400">
            Across {portfolio.length} stock holdings
          </div>
        </div>

        {/* Overall Unrealized P&L */}
        <div className="glass-panel p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Overall Unrealized Return</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-2xl lg:text-3xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              totalPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {totalPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {totalPnl >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">Total profit/loss since entry</div>
        </div>

        {/* Today's Gain/Loss */}
        <div className="glass-panel p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Today's Day Movement</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-2xl lg:text-3xl font-bold ${todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {todayPnl >= 0 ? '+' : ''}{formatCurrency(todayPnl)}
            </h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              todayPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {todayPnl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {todayPnl >= 0 ? '+' : ''}{todayPnlPercent.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">Based on previous market close</div>
        </div>

      </div>

      {/* Main Grid: Holdings & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Holdings & Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="heading-3">Your Equity Holdings</h3>
                <p className="text-xs text-gray-400">Live prices auto-compared between NSE and BSE</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-gold-400"></span>
                Primary: <strong className="text-white">{settings.preferredExchange}</strong>
              </div>
            </div>

            {/* Add Stock Inputs */}
            <div className="p-4 bg-dark-950/60 rounded-2xl border border-white/5 space-y-3 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input 
                  type="text" 
                  placeholder="Symbol (e.g. SBIN)" 
                  className="input-field text-sm py-2"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                />
                <select 
                  className="input-field text-sm py-2"
                  value={newStock.sector}
                  onChange={(e) => setNewStock({...newStock, sector: e.target.value})}
                >
                  <option>Financials</option>
                  <option>IT</option>
                  <option>Energy</option>
                  <option>FMCG</option>
                  <option>Auto</option>
                  <option>Pharma</option>
                  <option>Metals</option>
                  <option>Others</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  className="input-field text-sm py-2"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                />
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Avg Price" 
                    className="input-field text-sm py-2"
                    value={newStock.avgPrice}
                    onChange={(e) => setNewStock({...newStock, avgPrice: e.target.value})}
                  />
                  <button 
                    onClick={handleAddStock}
                    className="bg-gold-500 hover:bg-gold-400 text-dark-900 rounded-xl px-3 flex items-center justify-center transition-all flex-shrink-0"
                    title="Add Stock"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Quick Popular Stock Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-gray-500">
                <span>Quick Add:</span>
                {POPULAR_TICKERS.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setNewStock({ ...newStock, symbol: sym })}
                    className="px-2 py-0.5 rounded bg-dark-800 hover:bg-gold-500/20 hover:text-gold-400 transition-colors"
                  >
                    +{sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Holdings Table */}
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {portfolio.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p>No holdings added yet.</p>
                  <p className="text-xs mt-1">Add stocks above or upload a CSV to get live quotes.</p>
                </div>
              )}

              {portfolio.map(stock => {
                const invested = getInvestedValue(stock);
                const currentVal = getCurrentValue(stock);
                const pnl = currentVal - invested;
                const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
                const weight = totalCurrentValue > 0 ? (currentVal / totalCurrentValue) * 100 : 0;
                const dayChangePct = stock.dayChangePercent || 0;

                // Spread calculation between NSE and BSE
                const hasBoth = stock.nsePrice && stock.bsePrice;
                const spreadDiff = hasBoth ? Math.round(Math.abs(stock.bsePrice! - stock.nsePrice!) * 100) / 100 : 0;

                return (
                  <div 
                    key={stock.id} 
                    className="p-4 bg-dark-900/70 hover:bg-dark-900 rounded-2xl border border-white/5 hover:border-gold-500/20 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base tracking-wide">{stock.symbol}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-800 text-gray-300 border border-white/5">
                            {stock.sector}
                          </span>
                          <span className="text-xs text-gray-400">
                            {stock.quantity} shares @ ₹{stock.avgPrice}
                          </span>
                        </div>

                        {/* Live Price Tag with Day Movement */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs">
                          <span className="font-semibold text-gold-400 flex items-center gap-1">
                            CMP: ₹{formatDecimal(stock.currentPrice || stock.avgPrice)}
                          </span>

                          <span className={`text-[11px] font-medium flex items-center ${
                            dayChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {dayChangePct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {dayChangePct >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}% Today
                          </span>

                          {/* NSE & BSE Price Comparison */}
                          {hasBoth && (
                            <span className="text-[11px] text-gray-500 border-l border-white/10 pl-2">
                              NSE: ₹{stock.nsePrice} | BSE: ₹{stock.bsePrice}
                              {spreadDiff > 0 && (
                                <span className="ml-1 text-gold-400/80 font-mono">
                                  (Spread: ₹{spreadDiff})
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial Value & PnL */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-white text-sm">{formatCurrency(currentVal)}</div>
                          <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                            pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercent.toFixed(1)}%)
                          </div>
                          <div className="text-[10px] text-gray-500">{weight.toFixed(1)}% of total</div>
                        </div>

                        <button 
                          onClick={() => handleRemoveStock(stock.id)} 
                          className="text-red-400/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Remove holding"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CSV Import */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2.5"
              >
                <Upload size={14} /> Import Holdings from CSV 
                <span className="text-gray-500 text-[11px] ml-1">(Format: Symbol, Sector, Qty, Price)</span>
              </button>
            </div>

          </div>

          {/* Exchange Spread & Arbitrage Notice */}
          <div className="glass-panel p-5 border-white/5 bg-dark-950/40">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info size={14} className="text-gold-400" /> Exchange Execution & Arbitrage Watch
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Indian equities trade concurrently on both <strong>NSE</strong> and <strong>BSE</strong>. Minor price divergences frequently occur due to order flow and liquidity imbalances. Artha continuously compares both books to help you target optimal limit order executions.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Visuals & AI Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Diagnostic Results Card */}
          <div className="glass-panel p-6 border-gold-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-gold-400" size={20} />
                <h3 className="text-lg font-bold text-white">FinSight AI Portfolio Audit</h3>
              </div>

              {aiAnalysis && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gold-500/10 border border-gold-500/30">
                  <span className="text-xs text-gray-400">Score:</span>
                  <span className="font-bold text-gold-400 text-sm">{aiAnalysis.score}/100</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-semibold">
                    {aiAnalysis.scoreGrade}
                  </span>
                </div>
              )}
            </div>

            {loadingAi ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-gold-400 mx-auto" />
                <p className="text-sm text-gray-300 font-medium">Analyzing real-time NSE/BSE tick data...</p>
                <p className="text-xs text-gray-500">Evaluating sector exposure, valuation risk, and rebalancing priorities</p>
              </div>
            ) : aiError ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={15} /> AI Analysis Error
                </div>
                <p>{aiError}</p>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-gold-400 underline font-semibold mt-1"
                >
                  Verify your Gemini API Key in Settings
                </button>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-dark-950/70 rounded-xl border border-white/5 text-xs text-gray-300 leading-relaxed">
                  <span className="text-gold-400 font-semibold block mb-1">Executive Summary</span>
                  {aiAnalysis.summary}
                </div>

                <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar text-xs text-gray-300 space-y-2 prose prose-invert prose-sm">
                  <div className="whitespace-pre-line leading-relaxed font-sans">
                    {aiAnalysis.fullMarkdown}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] text-gray-500">Updated at {aiAnalysis.timestamp}</span>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 text-gold-400 hover:text-gold-300"
                  >
                    <MessageSquare size={13} /> Ask FinSight AI
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="p-3 w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 mx-auto flex items-center justify-center text-gold-400">
                  <Sparkles size={24} />
                </div>
                <p className="text-sm font-medium text-white">Generate Instant AI Diagnostic</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Click the button above to run our Google Gemini analysis engine on your live market positions.
                </p>
                <button
                  onClick={handleRunAiDiagnostic}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Run Analysis Now
                </button>
              </div>
            )}
          </div>

          {/* Sector Allocation Pie Chart */}
          <div className="glass-card p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sector Allocation</h4>
              <span className="text-[11px] text-gold-400 font-medium">By Live Market Value</span>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {sectorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{ backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Sector Tags */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {sectorData.slice(0, 4).map((sec, idx) => (
                <div key={sec.name} className="flex items-center gap-1 text-[11px] text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{sec.name} ({sec.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Breakdown Bar Chart */}
          <div className="glass-card p-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Concentration Breakdown
            </h4>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={80} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{ backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#d4af37" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actionable Rebalancing / Gap Recommendations */}
          <div className="glass-card p-6 border-gold-500/20">
            <h3 className="text-base font-semibold mb-3 text-white flex items-center gap-2">
              <Lightbulb className="text-gold-400" size={18} /> Gap Analysis & Diversification
            </h3>
            
            {missingSectors.length > 0 ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-xs">
                  Your portfolio is currently missing exposure to <strong>{missingSectors.slice(0, 2).join(' and ')}</strong>.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {missingSectors.slice(0, 2).map((sec) => (
                    <div key={sec} className="bg-dark-900/60 p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">Missing</span>
                      <p className="text-white text-xs font-semibold mt-0.5">{sec}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Consider Nifty {sec} ETF / Top Bluechip</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-xs">
                Your portfolio holds coverage across the primary Indian market sectors. Ensure individual stock weights remain under 20-25% to avoid single-company risk.
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-400">Questions about your allocation?</span>
              <button
                onClick={() => setIsChatOpen(true)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                Chat with FinSight AI <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Live Analysis & Recommendations */}
      {portfolio.length > 0 && (
        <section aria-label="Live AI portfolio analysis and recommendations">
          <LiveAnalysisCard
            holdings={enrichedHoldings}
            totalCurrentValue={totalCurrentValue}
            totalInvestedValue={totalInvested}
          />
        </section>
      )}

      {/* Educational Guide Section */}
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

      {/* Interactive AI Chat Drawer / Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl h-[85vh] sm:h-[650px] bg-dark-900 border border-gold-500/30 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">FinSight AI Advisor</h3>
                  <p className="text-[11px] text-gray-400">Grounded in your live {portfolio.length} stock holdings</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <div className="p-3 w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center">
                    <MessageSquare size={22} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">What would you like to know?</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Ask anything about your Indian portfolio: risk hedging, whether to exit or add a stock, or where to invest next.
                  </p>
                  <div className="flex flex-col gap-2 max-w-sm mx-auto pt-2">
                    {[
                      "Should I trim INFY or hold for long term?",
                      "How can I reduce my Financials concentration?",
                      "Is my portfolio safe against an inflation spike?"
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(q);
                        }}
                        className="text-left text-xs p-2.5 rounded-xl bg-dark-800/80 hover:bg-gold-500/10 text-gray-300 hover:text-gold-400 border border-white/5 transition-colors"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gold-500 text-dark-900 font-medium'
                      : 'bg-dark-800/90 text-gray-200 border border-white/5 whitespace-pre-line'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-gold-400 p-2">
                  <RefreshCw size={13} className="animate-spin" />
                  FinSight AI is thinking...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-white/10 bg-dark-950/90 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Ask about your holdings, valuation risk, or next SIP..."
                className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => refreshLivePrices(true)}
      />

    </main>
  );
};

export default Portfolio;
