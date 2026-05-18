import React, { useState, useRef } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Upload, AlertCircle, AlertTriangle, CheckCircle, Receipt, Search, Filter, Info, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Expense } from '../types/finance';
import { parseBankStatementText } from '../transaction-engine/analyzer';

const CATEGORIES = [
  'food', 'rent', 'travel', 'shopping', 'subscriptions', 
  'utilities', 'healthcare', 'EMI/debt', 'investments', 'entertainment'
];

const CATEGORY_COLORS: Record<string, string> = {
  food: '#fb923c',        // Orange
  rent: '#fbbf24',        // Amber/Gold
  travel: '#38bdf8',      // Sky Blue
  shopping: '#f472b6',    // Pink
  subscriptions: '#a78bfa', // Purple
  utilities: '#2dd4bf',   // Teal
  healthcare: '#f87171',  // Light Red
  'EMI/debt': '#ef4444',   // Deep Red
  investments: '#4ade80',  // Emerald Green
  entertainment: '#e879f9' // Fuchsia
};

const ExpenseEngine = () => {
  const { expenses, profile, addExpense, deleteExpense, uploadExpenses, clearExpenses, getTransactionObservations } = useFinanceStore();
  
  // Unstructured statement paste state
  const [uploadTab, setUploadTab] = useState<'csv' | 'text'>('csv');
  const [pastedText, setPastedText] = useState('');
  
  // Local form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // CSV parsing state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Array<Omit<Expense, 'id'>>>([]);
  const [csvError, setCsvError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute stats
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Group by category
  const categoryStats = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Format data for Recharts Pie Chart
  const chartData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#9ca3af'
  })).sort((a, b) => b.value - a.value);

  // Auto-categorization rules
  const autoCategorize = (desc: string, catFromCsv: string): string => {
    const d = desc.toLowerCase();
    const c = catFromCsv.toLowerCase();
    
    // Check if category is already one of the standard ones
    if (CATEGORIES.includes(c)) return c;
    if (c === 'rent' || c === 'flat') return 'rent';
    if (c === 'dining' || c === 'swiggy' || c === 'zomato' || c === 'grocery') return 'food';
    if (c === 'uber' || c === 'travel' || c === 'taxi' || c === 'fuel' || c === 'ola') return 'travel';
    if (c === 'netflix' || c === 'spotify' || c === 'subscription' || c === 'amazon prime') return 'subscriptions';
    if (c === 'electricity' || c === 'wifi' || c === 'bescom' || c === 'jio' || c === 'airtel') return 'utilities';
    if (c === 'medical' || c === 'doctor' || c === 'pharmacy' || c === 'apollo') return 'healthcare';
    if (c === 'emi' || c === 'loan' || c === 'debt') return 'EMI/debt';
    if (c === 'sip' || c === 'invest' || c === 'mutual fund' || c === 'stocks') return 'investments';
    if (c === 'movie' || c === 'theater' || c === 'pvr' || c === 'gaming' || c === 'pub') return 'entertainment';

    // Now scan description
    if (d.includes('swiggy') || d.includes('zomato') || d.includes('restaurant') || d.includes('food') || d.includes('groceries') || d.includes('blinkit') || d.includes('instamart')) return 'food';
    if (d.includes('rent') || d.includes('landlord')) return 'rent';
    if (d.includes('uber') || d.includes('ola') || d.includes('petrol') || d.includes('fuel') || d.includes('travel') || d.includes('flight') || d.includes('train')) return 'travel';
    if (d.includes('amazon') || d.includes('myntra') || d.includes('ajio') || d.includes('shopping') || d.includes('flipkart') || d.includes('clothing')) return 'shopping';
    if (d.includes('netflix') || d.includes('prime') || d.includes('spotify') || d.includes('subscription') || d.includes('youtube')) return 'subscriptions';
    if (d.includes('bescom') || d.includes('electricity') || d.includes('water') || d.includes('gas') || d.includes('wifi') || d.includes('broadband') || d.includes('recharge') || d.includes('mobile')) return 'utilities';
    if (d.includes('apollo') || d.includes('hospital') || d.includes('pharmeasy') || d.includes('doctor') || d.includes('health') || d.includes('medical') || d.includes('pharmacy')) return 'healthcare';
    if (d.includes('emi') || d.includes('loan') || d.includes('hdfc') || d.includes('sbi') || d.includes('debt') || d.includes('interest')) return 'EMI/debt';
    if (d.includes('sip') || d.includes('mutual fund') || d.includes('zerodha') || d.includes('groww') || d.includes('invest') || d.includes('shares')) return 'investments';
    if (d.includes('movie') || d.includes('pvr') || d.includes('bookmyshow') || d.includes('concert') || d.includes('pub') || d.includes('beer') || d.includes('entertainment')) return 'entertainment';

    return 'shopping'; // default fallback
  };

  // CSV Parsing
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setCsvError('The CSV file appears to be empty or lacks headers.');
          return;
        }

        // Standard format: date,amount,category,description
        const headers = lines[0].toLowerCase().split(',');
        const parsedRows: Array<Omit<Expense, 'id'>> = [];

        // Identify column indices
        const dateIdx = headers.findIndex(h => h.trim().includes('date'));
        const amountIdx = headers.findIndex(h => h.trim().includes('amount'));
        const catIdx = headers.findIndex(h => h.trim().includes('category'));
        const descIdx = headers.findIndex(h => h.trim().includes('description') || h.trim().includes('memo') || h.trim().includes('narrative'));

        if (dateIdx === -1 || amountIdx === -1) {
          setCsvError('Could not find mandatory columns: "date" and "amount". Please use a format like: date,amount,category,description');
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Basic comma split (handles quotes roughly or assumes simple commas)
          const cols = line.split(',');
          if (cols.length < Math.max(dateIdx, amountIdx) + 1) continue;

          const dateStr = cols[dateIdx]?.trim();
          const amtVal = Number(cols[amountIdx]?.trim());
          const catStr = catIdx !== -1 ? cols[catIdx]?.trim() : 'other';
          const descStr = descIdx !== -1 ? cols[descIdx]?.trim() : 'CSV Import';

          if (isNaN(amtVal) || !dateStr) continue;

          // Parse and sanitize date
          let formattedDate = new Date().toISOString().split('T')[0];
          try {
            const tempD = new Date(dateStr);
            if (!isNaN(tempD.getTime())) {
              formattedDate = tempD.toISOString().split('T')[0];
            }
          } catch(err) {}

          const resolvedCategory = autoCategorize(descStr, catStr);

          parsedRows.push({
            amount: amtVal,
            category: resolvedCategory,
            date: formattedDate,
            description: descStr || `${resolvedCategory} expense`
          });
        }

        if (parsedRows.length === 0) {
          setCsvError('No valid rows could be parsed. Check that amounts are numeric.');
        } else {
          setCsvPreview(parsedRows);
        }
      } catch (err) {
        setCsvError('Error reading file. Please make sure it is a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = () => {
    if (csvPreview.length === 0) return;
    uploadExpenses(csvPreview);
    setCsvPreview([]);
    setCsvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0 || !description.trim()) return;

    addExpense({
      amount: amt,
      category,
      description: description.trim(),
      date
    });

    setAmount('');
    setDescription('');
  };

  // Handle pasted statement text parse
  const handleParsePastedText = () => {
    setCsvError('');
    if (!pastedText.trim()) {
      setCsvError('Please paste some bank statement text first.');
      return;
    }
    const parsed = parseBankStatementText(pastedText);
    if (parsed.length === 0) {
      setCsvError('Could not parse any transactions. Ensure lines contain dates and rupee amounts.');
    } else {
      setCsvPreview(parsed);
      setPastedText('');
    }
  };

  // Overspending alerts logic
  const checkOverspending = () => {
    const alerts = [];
    const monthlyLimit = profile.monthlyExpenses;

    // Total expense overflow
    if (totalSpent > monthlyLimit) {
      alerts.push({
        type: 'danger',
        text: `Total monthly spend (₹${totalSpent.toLocaleString('en-IN')}) has exceeded your target budget limit of ₹${monthlyLimit.toLocaleString('en-IN')} by ₹${(totalSpent - monthlyLimit).toLocaleString('en-IN')}!`
      });
    } else if (totalSpent > monthlyLimit * 0.85) {
      alerts.push({
        type: 'warning',
        text: `Warning: Total spend represents ${Math.round((totalSpent / monthlyLimit) * 100)}% of your monthly budget. You have ₹${(monthlyLimit - totalSpent).toLocaleString('en-IN')} left.`
      });
    }

    // Category overspending checks
    const foodLimit = 10000;
    if (categoryStats['food'] > foodLimit) {
      alerts.push({
        type: 'warning',
        text: `Discretionary alert: Food & Dining out (₹${categoryStats['food'].toLocaleString('en-IN')}) exceeds the ₹${foodLimit.toLocaleString('en-IN')} recommended monthly benchmark. Consider home cooking to save.`
      });
    }

    const shoppingLimit = 15000;
    if (categoryStats['shopping'] > shoppingLimit) {
      alerts.push({
        type: 'warning',
        text: `Lifestyle alert: Shopping expenditure (₹${categoryStats['shopping'].toLocaleString('en-IN')}) is high. Pacing lifestyle buying increases long-term wealth compounding.`
      });
    }

    return alerts;
  };

  const overspendAlerts = checkOverspending();

  // Filtered expense ledger list
  const filteredLedger = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Machine-readable profile for future AI copilots
  const aiMachineExpensesProfile = {
    totalItemsLogged: expenses.length,
    netSpentThisMonth: totalSpent,
    monthlyExpenseCap: profile.monthlyExpenses,
    topCategories: chartData.map(c => ({ category: c.name, amount: c.value, sharePct: Math.round((c.value/totalSpent)*100) })),
    budgetLimitRemaining: Math.max(0, profile.monthlyExpenses - totalSpent),
    hasTriggeredAlerts: overspendAlerts.length > 0
  };

  // Structured plain-text description for Recharts Pie Chart
  const getChartDescription = () => {
    if (chartData.length === 0) return 'No spending data has been recorded for this month.';
    const topCat = chartData[0];
    const topPct = Math.round((topCat.value / (totalSpent || 1)) * 100);
    return `This visual chart displays a percentage breakdown of your expenses. You have logged ₹${totalSpent.toLocaleString('en-IN')} in outflows. Your single highest category of expenditure is "${topCat.name}" which consumes ₹${topCat.value.toLocaleString('en-IN')}, representing ${topPct}% of your total outlays.`;
  };

  return (
    <main 
      className="min-h-screen bg-dark-950 text-white pb-20"
      role="main"
      data-expenses-profile={JSON.stringify(aiMachineExpensesProfile)}
    >
      <SEO 
        title="Expense Analysis Engine"
        description="Track your monthly outlays manually or upload bank CSV sheets. Auto-categorize spending into standard Indian budgeting buckets with graphical share metrics."
        keywords="expense ledger, bulk CSV uploader, bank statement parser, dining out budget, shopping tracker, Indian investor"
      />
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
          <div>
            <h1 className="heading-2">Expense Analysis Engine</h1>
            <p className="text-gray-400">Log, categorize, and visualizes your outflows to eliminate cash drain.</p>
          </div>
          <button 
            onClick={clearExpenses}
            className="text-xs text-gray-500 hover:text-red-400 font-medium transition-colors"
            aria-label="Delete all transactions in ledger"
          >
            Clear Ledger
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Entry and CSV Parsers */}
          <aside className="lg:col-span-4 space-y-6" aria-label="Transaction Entry Tools">
            
            {/* Manual entry card */}
            <section className="glass-card p-6 border-white/5" aria-label="Manual Transaction Logger">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Receipt className="text-gold-400" /> Log Single Transaction
              </h2>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tx-amount" className="text-xs text-gray-400 font-medium block mb-1">Amount (₹)</label>
                  <input 
                    id="tx-amount"
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="input-field text-sm py-2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tx-date" className="text-xs text-gray-400 font-medium block mb-1">Date</label>
                  <input 
                    id="tx-date"
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field text-sm py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tx-category" className="text-xs text-gray-400 font-medium block mb-1">Standard Category</label>
                  <select 
                    id="tx-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tx-desc" className="text-xs text-gray-400 font-medium block mb-1">Description / Memo</label>
                  <input 
                    id="tx-desc"
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Swiggy Lunch with friends"
                    className="input-field text-sm py-2"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={16} /> Log Expense
                </button>
              </form>
            </section>

            {/* Bank Statement Parser & Importer */}
            <section className="glass-card p-6 border-white/5 space-y-4 animate-fade-in" aria-label="Statement Importer">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="text-gold-400 w-4 h-4" /> Bank Statement Parser
                </h2>
                <div className="flex gap-1.5 bg-dark-900 p-0.5 rounded-lg border border-white/5 text-[10px] font-semibold">
                  <button 
                    type="button"
                    onClick={() => { setUploadTab('csv'); setCsvPreview([]); }}
                    className={`px-2.5 py-1 rounded transition-colors ${uploadTab === 'csv' ? 'bg-gold-500/10 text-gold-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    CSV File
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setUploadTab('text'); setCsvPreview([]); }}
                    className={`px-2.5 py-1 rounded transition-colors ${uploadTab === 'text' ? 'bg-gold-500/10 text-gold-400 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    Text Paste
                  </button>
                </div>
              </div>

              {uploadTab === 'csv' ? (
                <div className="space-y-4">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Upload bank CSV sheets. Artha parses entries and matches description tags to standard categories.
                  </p>

                  <div 
                    className="border border-dashed border-white/10 hover:border-gold-500/30 rounded-xl p-4 text-center cursor-pointer transition-colors relative"
                    role="button"
                    aria-label="Upload CSV file button"
                  >
                    <input 
                      id="csv-file-input"
                      type="file" 
                      accept=".csv"
                      onChange={handleCsvChange}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Choose banking CSV sheet to parse"
                    />
                    <Upload className="w-6 h-6 mx-auto text-gray-500 mb-1" aria-hidden="true" />
                    <span className="text-[11px] text-gray-300 font-medium block">
                      {csvFile ? csvFile.name : 'Choose CSV file'}
                    </span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">
                      Format: date, amount, category, description
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Paste raw text or bank SMS alerts. Artha will dynamically isolate dates, categories, and rupee values!
                  </p>
                  
                  <textarea 
                    rows={4}
                    placeholder="e.g. 18/05/2026 UPI/Zomato/92340283 ₹3,200&#10;17/05/2026 ATM WDL ₹5,000"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="input-field text-xs p-3 font-mono leading-relaxed h-28"
                  />

                  <button 
                    type="button" 
                    onClick={handleParsePastedText}
                    className="btn-primary w-full text-[11px] py-2 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} /> Extract & Parse Statement
                  </button>
                </div>
              )}

              {csvError && (
                <div 
                  className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-[11px] flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{csvError}</span>
                </div>
              )}

              {csvPreview.length > 0 && (
                <div className="space-y-3 animate-fade-in" role="status">
                  <div className="p-3 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>Parsed {csvPreview.length} items. Ready to import!</span>
                  </div>

                  <button 
                    onClick={handleImportCsv}
                    className="btn-primary w-full text-xs py-2 bg-green-600 hover:bg-green-700"
                  >
                    Confirm & Bulk Import
                  </button>
                </div>
              )}
            </section>

          </aside>

          {/* Right Column: Visual analytics, overspending warnings, ledger */}
          <section className="lg:col-span-8 space-y-6" aria-label="Spending Diagnostics & Analytics">
            
            {/* Split row: Recharts breakdown & Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Visual Pie */}
              <article className="md:col-span-6 glass-card p-5 border-white/5 flex flex-col justify-between items-center h-80">
                <div className="w-full text-left">
                  <h3 className="text-sm font-bold text-gray-300">Category Share</h3>
                  <p className="text-xs text-gray-500">Based on total logged expenses: ₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>

                <div className="w-full h-48 relative" aria-label="Visual breakdown pie chart">
                  {chartData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                      Log expenses to see breakdown.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsPie>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1e', borderColor: '#333', borderRadius: '12px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                          formatter={(value) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                        />
                      </ReChartsPie>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {/* Explainable Text Caption for SEO and AI screen readers */}
                <p className="sr-only" aria-live="polite">
                  {getChartDescription()}
                </p>
                <div className="w-full text-left mt-2">
                  <span className="text-[10px] text-gray-500 flex items-start gap-1 font-medium leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                    <Info size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-gray-400">Interpretation:</strong> {getChartDescription()}
                    </span>
                  </span>
                </div>
              </article>

              {/* Progress Bars Category lists */}
              <article className="md:col-span-6 glass-card p-5 border-white/5 h-80 overflow-y-auto space-y-3 scrollbar-hide">
                <h3 className="text-sm font-bold text-gray-300">Category Outlays</h3>
                {chartData.length === 0 ? (
                  <div className="text-xs text-gray-500 h-full flex items-center justify-center">
                    No transactions registered.
                  </div>
                ) : (
                  chartData.map((c) => {
                    const pct = Math.round((c.value / totalSpent) * 100);
                    return (
                      <div key={c.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-300 capitalize">{c.name}</span>
                          <span className="text-gray-400">
                            ₹ {c.value.toLocaleString('en-IN')} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: c.color, width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </article>

            </div>

            {/* Overspending alerts display */}
            {overspendAlerts.length > 0 && (
              <div className="space-y-2.5" role="alert">
                {overspendAlerts.map((alert, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border flex items-start gap-3 text-sm animate-fade-in ${
                      alert.type === 'danger' 
                        ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                        : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{alert.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Transaction Intelligence Diagnostics */}
            {(() => {
              const observations = getTransactionObservations();
              if (observations.length === 0) return null;

              return (
                <section className="space-y-3" aria-label="Transaction Anomalies & Insights">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Transaction Intelligence Diagnostics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {observations.map((obs) => (
                      <div 
                        key={obs.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-sm hover:border-gold-500/20 transition-all ${
                          obs.severity === 'critical' 
                            ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                            : obs.severity === 'warning'
                            ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            {obs.severity === 'critical' ? '🚨' : obs.severity === 'warning' ? '⚠️' : 'ℹ️'} {obs.title}
                          </span>
                          <p className="text-xs text-gray-300 leading-relaxed">{obs.description}</p>
                          <p className="text-[10px] text-gray-400 leading-relaxed italic"><span className="font-semibold not-italic">Impact:</span> {obs.impact}</p>
                        </div>
                        <div className="bg-dark-950/40 p-2.5 rounded-lg border border-white/5 text-[10px] text-gold-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-auto">
                          <ArrowRight size={10} /> Rec: {obs.actionableStep}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Search, filters, Ledger list table */}
            <article className="glass-card border-white/5 overflow-hidden">
              <div className="p-4 bg-dark-900/40 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                  Expense Ledger <span className="text-xs text-gray-500 font-normal">({filteredLedger.length} items logged)</span>
                </h3>

                <div className="flex w-full md:w-auto gap-3 items-center">
                  {/* Search */}
                  <div className="relative flex-1 md:flex-initial">
                    <label htmlFor="search-tx-input" className="sr-only">Search transactions by description</label>
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <input 
                      id="search-tx-input"
                      type="text"
                      placeholder="Search memo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-9 py-1.5 text-xs w-full md:w-44"
                    />
                  </div>

                  {/* Filter category */}
                  <div className="relative">
                    <label htmlFor="filter-tx-select" className="sr-only">Filter transactions by category</label>
                    <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <select
                      id="filter-tx-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="input-field pl-9 py-1.5 text-xs w-full md:w-36 bg-dark-900"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Ledger list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-dark-900/60 text-xs text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Memo / Description</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                          No matching transactions registered in ledger.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((e) => (
                        <tr key={e.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3.5 text-xs text-gray-400 font-medium whitespace-nowrap">
                            {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5 text-white font-semibold whitespace-nowrap overflow-hidden max-w-xs truncate" title={e.description}>
                            {e.description}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded border capitalize"
                              style={{ 
                                color: CATEGORY_COLORS[e.category] || '#9ca3af',
                                borderColor: `${CATEGORY_COLORS[e.category] || '#9ca3af'}30`,
                                backgroundColor: `${CATEGORY_COLORS[e.category] || '#9ca3af'}08`
                              }}
                            >
                              {e.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-white whitespace-nowrap">
                            ₹ {e.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button 
                              onClick={() => deleteExpense(e.id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete Item"
                              aria-label={`Remove transaction for ${e.description}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </article>

          </section>

        </div>

        {/* Structured Static Educational Guide Section */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Budgeting and Ledger Educational Guide">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Accounting and Tracking Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Psychology of Discretionary Wants</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Discretionary Wants (food delivery ordering, shopping, high-end travel) represent the largest leakages in an investor’s cashflow. Unlike fixed Needs (rent, EMI) which are structural, Wants can be dialed back. Regularly tracking these outlays creates behavioral friction, immediately reducing unnecessary overspending.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Automated Accounting Benefits</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Manual transaction logging, while accurate, suffers from human friction and skipped logs. Standard banking CSV parsing completely automates this lifecycle. Reviewing parsed items allows you to run aggregate audits on your statement, surfacing hidden subscription fees or credit drag errors.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. Direct Compounding Link</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Saving is not about restriction; it is about allocating resources. Shifting just ₹5,000 monthly from a low-value Want category (like unwatched subscriptions) into an equity Systematic Investment Plan (SIP) compounding at 12% results in a buffer of over **₹11.5 Lakhs** across a 10-year horizon.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default ExpenseEngine;
