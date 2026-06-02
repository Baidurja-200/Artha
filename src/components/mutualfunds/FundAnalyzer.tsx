import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Eye, LogOut, ChevronDown, ChevronUp, ArrowRight, PieChart as PieChartIcon, Sparkles, BarChart3, Trash2, DollarSign, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useMutualFunds } from '../../hooks/useMutualFunds';
import { analyzePortfolio, UserHeldFund, FundAnalysisResult, PortfolioAnalysis } from '../../fund-engine/fundAnalyzer';

const CHART_COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// ─── Score Ring Component ────────────────────────────────────────────────────

const ScoreRing = ({ score, size = 64, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={getColor(score)}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.28}
        fontWeight="bold"
        className="transform rotate-90"
        style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
      >
        {score}
      </text>
    </svg>
  );
};

// ─── Verdict Badge Component ─────────────────────────────────────────────────

const VerdictBadge = ({ verdict }: { verdict: 'Keep' | 'Watch' | 'Exit' }) => {
  const config = {
    Keep: { icon: <CheckCircle size={14} />, bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400' },
    Watch: { icon: <Eye size={14} />, bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    Exit: { icon: <LogOut size={14} />, bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400' },
  };
  const c = config[verdict];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${c.bg} ${c.border} ${c.text}`}>
      {c.icon} {verdict}
    </span>
  );
};

// ─── Criterion Bar Component ─────────────────────────────────────────────────

const CriterionBar = ({ name, score, label }: { name: string; score: number; label: string }) => {
  const getBarColor = (s: number) => {
    if (s >= 75) return 'bg-green-500';
    if (s >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">{name}</span>
        <span className="text-white font-semibold">{score}<span className="text-gray-500 font-normal">/100</span> · <span className={score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}>{label}</span></span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// ─── Fund Result Card Component ──────────────────────────────────────────────

const FundResultCard = ({ result, rank, onRemove }: { result: FundAnalysisResult; rank: number; onRemove: (code: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  const rankBadgeColor = rank === 1
    ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400'
    : rank <= 3
      ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400'
      : 'from-white/5 to-white/[0.02] border-white/10 text-gray-400';

  return (
    <article className={`glass-card p-5 transition-all duration-300 hover:shadow-lg ${result.verdict === 'Exit' ? 'border-l-4 border-l-red-500/60' : result.verdict === 'Keep' ? 'border-l-4 border-l-green-500/40' : 'border-l-4 border-l-yellow-500/40'}`}>
      <div className="flex items-start gap-4">
        {/* Rank + Score */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rankBadgeColor} border flex items-center justify-center text-xs font-bold`}>
            #{rank}
          </div>
          <ScoreRing score={result.compositeScore} size={56} strokeWidth={4} />
        </div>

        {/* Fund Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm leading-snug line-clamp-2">{result.fund.schemeName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{result.fund.category} · {result.fund.risk} Risk · ₹{result.fund.aum} AUM</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <VerdictBadge verdict={result.verdict} />
              <button
                onClick={() => onRemove(result.fund.schemeCode)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1"
                title="Remove fund"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Investment details */}
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
            {result.fund.monthlySIP > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} className="text-gold-400" /> SIP: <strong className="text-white">₹{result.fund.monthlySIP.toLocaleString('en-IN')}/mo</strong>
              </span>
            )}
            {result.fund.totalInvested > 0 && (
              <span>Invested: <strong className="text-white">{formatCurrency(result.fund.totalInvested)}</strong></span>
            )}
            {result.fund.cagr3Y && result.fund.cagr3Y !== 'N/A' && (
              <span className="flex items-center gap-1">
                3Y CAGR: <strong className={parseFloat(result.fund.cagr3Y) > 0 ? 'text-green-400' : 'text-red-400'}>
                  {result.fund.cagr3Y}%
                </strong>
                {parseFloat(result.fund.cagr3Y) > 0 ? <TrendingUp size={12} className="text-green-400" /> : <TrendingDown size={12} className="text-red-400" />}
              </span>
            )}
          </div>

          {/* Verdict reason */}
          <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/5">
            💡 {result.actionableAdvice}
          </p>

          {/* Expand/Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Detailed Breakdown' : 'View Detailed Breakdown'}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 animate-fade-in">
              {result.criteria.map((c) => (
                <CriterionBar key={c.name} name={c.name} score={c.score} label={c.label} />
              ))}
              <div className="text-[10px] text-gray-500 pt-2 border-t border-white/5 space-y-1">
                {result.criteria.map(c => (
                  <p key={c.name}><strong className="text-gray-400">{c.name}:</strong> {c.detail}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ─── Main FundAnalyzer Component ─────────────────────────────────────────────

const FundAnalyzer = () => {
  const { useSearchFunds } = useMutualFunds();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [heldFunds, setHeldFunds] = useState<UserHeldFund[]>([]);
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Add-fund form state
  const [pendingFund, setPendingFund] = useState<any>(null);
  const [sipAmount, setSipAmount] = useState('5000');
  const [investedAmount, setInvestedAmount] = useState('100000');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [] } = useSearchFunds(debouncedQuery);

  // When funds change, re-analyze
  useEffect(() => {
    if (heldFunds.length > 0) {
      setIsAnalyzing(true);
      // Small delay for animation feel
      const timer = setTimeout(() => {
        const result = analyzePortfolio(heldFunds);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [heldFunds]);

  const handleSelectFund = (fund: any) => {
    setPendingFund(fund);
    setQuery('');
    setDebouncedQuery('');
  };

  const handleConfirmAdd = () => {
    if (!pendingFund) return;
    if (heldFunds.find(f => f.schemeCode === pendingFund.schemeCode)) {
      setPendingFund(null);
      return;
    }

    const newFund: UserHeldFund = {
      schemeCode: pendingFund.schemeCode,
      schemeName: pendingFund.schemeName,
      category: pendingFund.category || 'Flexi Cap',
      risk: pendingFund.risk || 'High',
      expenseRatio: pendingFund.expenseRatio || 0.8,
      aum: pendingFund.aum || '5,000 Cr',
      type: pendingFund.type || 'Equity',
      monthlySIP: parseInt(sipAmount) || 0,
      totalInvested: parseInt(investedAmount) || 0,
      // Mock some live data for the analysis (in production, this would come from API)
      cagr3Y: (Math.random() * (28 - 5) + 5).toFixed(2),
      return1Y: (Math.random() * (40 - (-10)) + (-10)).toFixed(2),
      currentNav: parseFloat((Math.random() * (500 - 20) + 20).toFixed(2)),
    };

    setHeldFunds(prev => [...prev, newFund]);
    setPendingFund(null);
    setSipAmount('5000');
    setInvestedAmount('100000');
  };

  const handleRemoveFund = useCallback((schemeCode: string) => {
    setHeldFunds(prev => prev.filter(f => f.schemeCode !== schemeCode));
  }, []);

  const displayResults = searchResults.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="glass-card p-6 md:p-8 border-gold-500/10">
        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
          <div className="p-3 bg-gradient-to-br from-gold-500/20 to-gold-600/10 rounded-xl border border-gold-500/20">
            <Activity className="text-gold-400" size={22} />
          </div>
          <div>
            <h2 className="heading-3">Analyze My Mutual Funds</h2>
            <p className="text-sm text-gray-400">Add your current holdings to get AI-powered rankings, exit recommendations, and portfolio health insights.</p>
          </div>
        </div>

        {/* ── Search & Add Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Column */}
          <div className="relative">
            <label htmlFor="analyzer-search" className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-2">Search & Add Your Funds</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                id="analyzer-search"
                type="text"
                placeholder="Search by fund name (e.g. SBI Nifty, Parag Parikh)..."
                className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Search Dropdown */}
            {displayResults.length > 0 && query.length >= 3 && (
              <div className="absolute top-full mt-2 w-full bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto custom-scrollbar">
                {displayResults.map((fund: any) => {
                  const alreadyAdded = heldFunds.some(f => f.schemeCode === fund.schemeCode);
                  return (
                    <button
                      key={fund.schemeCode}
                      onClick={() => !alreadyAdded && handleSelectFund(fund)}
                      className={`w-full text-left p-3 text-sm flex justify-between items-center border-b border-white/5 last:border-0 transition-colors ${alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}
                      disabled={alreadyAdded}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="truncate text-white font-medium">{fund.schemeName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{fund.category} · {fund.risk} Risk</p>
                      </div>
                      {alreadyAdded ? (
                        <span className="text-[10px] text-gray-500">Added</span>
                      ) : (
                        <Plus size={16} className="text-gold-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Fund Confirmation */}
          {pendingFund ? (
            <div className="bg-gold-400/5 border border-gold-500/20 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gold-400 uppercase tracking-wider font-bold mb-1">Adding Fund</p>
                  <p className="text-sm text-white font-semibold leading-snug">{pendingFund.schemeName}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{pendingFund.category} · {pendingFund.risk} Risk</p>
                </div>
                <button onClick={() => setPendingFund(null)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sip-input" className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Monthly SIP (₹)</label>
                  <input
                    id="sip-input"
                    type="number"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-gold-500/30"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label htmlFor="invested-input" className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Total Invested (₹)</label>
                  <input
                    id="invested-input"
                    type="number"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-gold-500/30"
                    placeholder="100000"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmAdd}
                className="w-full bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Plus size={16} /> Add to Portfolio Analysis
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-dark-900/30 rounded-xl border border-dashed border-white/10 p-6">
              {heldFunds.length === 0 ? (
                <>
                  <Sparkles className="text-gray-600 w-10 h-10 mb-3" />
                  <p className="text-gray-500 text-sm text-center">Search and add your mutual fund holdings to begin analysis.</p>
                  <p className="text-gray-600 text-xs mt-2">Add at least 2 funds for portfolio-level insights.</p>
                </>
              ) : (
                <>
                  <CheckCircle className="text-green-500/40 w-10 h-10 mb-3" />
                  <p className="text-gray-400 text-sm text-center"><strong className="text-white">{heldFunds.length} fund{heldFunds.length > 1 ? 's' : ''}</strong> added. Search to add more, or scroll down for results.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Currently Added Funds (Chips) ── */}
        {heldFunds.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Your Holdings ({heldFunds.length})</p>
            <div className="flex flex-wrap gap-2">
              {heldFunds.map(f => (
                <span key={f.schemeCode} className="inline-flex items-center gap-1.5 bg-dark-800 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300 group hover:border-red-500/30 transition-colors">
                  <span className="max-w-[200px] truncate">{f.schemeName.split(' ').slice(0, 3).join(' ')}</span>
                  <button
                    onClick={() => handleRemoveFund(f.schemeCode)}
                    className="text-gray-600 group-hover:text-red-400 transition-colors"
                    aria-label={`Remove ${f.schemeName}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Analysis Loading ── */}
      {isAnalyzing && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 bg-dark-800/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gold-500/20 shadow-gold">
            <div className="w-5 h-5 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gold-400 font-medium">Analyzing your portfolio...</span>
          </div>
        </div>
      )}

      {/* ── Analysis Results ── */}
      {analysis && !isAnalyzing && heldFunds.length > 0 && (
        <div className="space-y-8 animate-fade-in">

          {/* ── Portfolio Health Summary ── */}
          <div className="glass-card p-6 md:p-8 border-gold-500/10">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-gold-400" size={20} />
              <h3 className="heading-3">Portfolio Health Summary</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Portfolio Grade */}
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Portfolio Grade</p>
                <div
                  className="text-4xl font-black mb-1"
                  style={{ color: analysis.portfolioGrade.color }}
                >
                  {analysis.portfolioGrade.grade}
                </div>
                <p className="text-[10px] text-gray-400">{analysis.portfolioGrade.label}</p>
              </div>

              {/* Total Invested */}
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Total Invested</p>
                <div className="text-xl font-bold text-white mb-1">
                  {formatCurrency(analysis.totalInvested)}
                </div>
                <p className="text-[10px] text-gray-400">across {heldFunds.length} funds</p>
              </div>

              {/* Monthly SIP */}
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Total Monthly SIP</p>
                <div className="text-xl font-bold text-gold-400 mb-1">
                  {formatCurrency(analysis.totalSIP)}
                </div>
                <p className="text-[10px] text-gray-400">/month commitment</p>
              </div>

              {/* Issues */}
              <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Issues Found</p>
                <div className={`text-xl font-bold mb-1 ${analysis.exitCandidates.length > 0 ? 'text-red-400' : analysis.overlapWarnings.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {analysis.exitCandidates.length + analysis.overlapWarnings.length}
                </div>
                <p className="text-[10px] text-gray-400">
                  {analysis.exitCandidates.length} exit{analysis.exitCandidates.length !== 1 ? 's' : ''} · {analysis.overlapWarnings.length} overlap{analysis.overlapWarnings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Category Distribution */}
            {analysis.categoryDistribution.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <PieChartIcon size={14} className="text-gold-400" /> Category Distribution
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysis.categoryDistribution.map(d => ({ name: d.category, value: parseFloat(d.value.toFixed(1)) }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {analysis.categoryDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => `${value}%`}
                          contentStyle={{ backgroundColor: '#1a1a1e', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Allocation Breakdown</h4>
                  {analysis.categoryDistribution.map((cat, idx) => (
                    <div key={cat.category} className="flex items-center gap-3 p-2 bg-dark-900/30 rounded-lg">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{cat.category}</p>
                        <p className="text-[10px] text-gray-500">{cat.count} fund{cat.count > 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-white">{cat.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Overlap Warnings ── */}
          {analysis.overlapWarnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Layers size={14} className="text-yellow-400" /> Category Overlap Warnings
              </h3>
              {analysis.overlapWarnings.map((w) => (
                <div key={w.category} className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                      {w.fundCount} funds in "{w.category}"
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">{w.suggestion}</p>
                    <div className="flex flex-wrap gap-1">
                      {w.funds.map(name => (
                        <span key={name} className="text-[10px] bg-dark-800 border border-white/5 px-2 py-0.5 rounded-full text-gray-400 truncate max-w-[200px]">
                          {name.split(' ').slice(0, 4).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Reallocation Suggestions ── */}
          {analysis.reallocationSuggestions.length > 0 && (
            <div className="glass-card p-6 border-gold-500/10">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4 flex items-center gap-1.5">
                <ArrowRight size={14} className="text-gold-400" /> Reallocation Suggestions
              </h3>
              <div className="space-y-3">
                {analysis.reallocationSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-dark-900/40 p-3 rounded-lg border border-white/5">
                    <Sparkles size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-300 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Ranked Fund Results ── */}
          <div>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4 flex items-center gap-1.5">
              <Activity size={14} className="text-gold-400" /> Fund Rankings (Best to Worst)
            </h3>
            <div className="space-y-4">
              {analysis.results.map((result, idx) => (
                <FundResultCard
                  key={result.fund.schemeCode}
                  result={result}
                  rank={idx + 1}
                  onRemove={handleRemoveFund}
                />
              ))}
            </div>
          </div>

          {/* ── Exit Candidates Highlight ── */}
          {analysis.exitCandidates.length > 0 && (
            <div className="glass-card p-6 border-red-500/20 bg-red-500/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <LogOut className="text-red-400" size={18} />
                <h3 className="text-lg font-semibold text-red-400">Exit Candidates</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">These funds are underperforming and dragging your portfolio down. Consider redeeming and reallocating.</p>

              <div className="space-y-3">
                {analysis.exitCandidates.map(ec => (
                  <div key={ec.fund.schemeCode} className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 flex items-center gap-4">
                    <ScoreRing score={ec.compositeScore} size={48} strokeWidth={3} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{ec.fund.schemeName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{ec.verdictReason}</p>
                      {ec.fund.monthlySIP > 0 && (
                        <p className="text-xs text-red-400 mt-1 font-medium">
                          💸 Stop SIP of ₹{ec.fund.monthlySIP.toLocaleString('en-IN')}/month and redirect to a top-ranked fund.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FundAnalyzer;
