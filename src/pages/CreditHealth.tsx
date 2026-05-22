import React, { useState, useRef } from 'react';
import useFinanceStore from '../store/useFinanceStore';
import SubNav from '../components/common/SubNav';
import SEO from '../components/common/SEO';
import { 
  CreditCard as CardIcon, 
  TrendingUp, 
  Info, 
  HelpCircle, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Calendar, 
  IndianRupee, 
  BookOpen, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  Clock,
  Briefcase
} from 'lucide-react';

import { computeCreditHealth } from '../credit-health/engine';
import { analyzeCreditUtilization } from '../utilization-engine/utilization';
import { analyzeRepayments } from '../repayment-engine/repayment';
import { analyzeCreditSpending } from '../spending-intelligence/spending';
import { auditRewards } from '../reward-analysis/rewards';
import { generateCreditInsights } from '../credit-insights/insights';
import { CreditCard, CreditEMI, CreditRepayment } from '../types/finance';

const CreditHealth = () => {
  const {
    profile,
    expenses,
    creditCards,
    creditEMIs,
    creditRepayments,
    addCreditCard,
    deleteCreditCard,
    updateCreditCard,
    addCreditEMI,
    deleteCreditEMI,
    addCreditRepayment,
    uploadExpenses
  } = useFinanceStore();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'health' | 'utilization' | 'repayments' | 'spending' | 'rewards'>('health');

  // Input states for adding new Credit Card
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '',
    bank: '',
    limit: 100000,
    currentBalance: 0,
    dueDate: '15',
    statementDate: '25',
    rewardType: 'cashback' as 'cashback' | 'points' | 'miles',
    rewardRate: 1.5,
    cardType: 'visa' as 'visa' | 'mastercard' | 'rupay' | 'amex'
  });

  // Input states for adding new EMI
  const [showAddEMI, setShowAddEMI] = useState(false);
  const [newEMI, setNewEMI] = useState({
    cardId: '',
    description: '',
    monthlyAmount: 2000,
    remainingMonths: 12,
    totalAmount: 24000
  });

  // Input states for logging repayment
  const [showLogRepayment, setShowLogRepayment] = useState(false);
  const [newRepayment, setNewRepayment] = useState({
    cardId: '',
    billingMonth: new Date().toISOString().substring(0, 7), // "YYYY-MM"
    amountDue: 5000,
    amountPaid: 5000,
    paidDate: new Date().toISOString().substring(0, 10), // "YYYY-MM-DD"
    status: 'ontime' as 'ontime' | 'late' | 'partial' | 'unpaid'
  });

  // CSV statement parsing state
  const [dragActive, setDragActive] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [targetCardForImport, setTargetCardForImport] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run Calculations via Engines
  const healthReport = computeCreditHealth(creditCards, creditEMIs, creditRepayments, profile, expenses);
  const utilizationMetrics = analyzeCreditUtilization(creditCards);
  const repaymentMetrics = analyzeRepayments(creditRepayments);
  const spendingIntelligence = analyzeCreditSpending(expenses);
  const rewardsAudit = auditRewards(creditCards, expenses);
  const insights = generateCreditInsights(creditCards, creditEMIs, creditRepayments, profile);

  // SVG Radial score offset logic
  // Score spans 300 to 900. Total range = 600.
  // Percentage = (score - 300) / 600.
  const scorePercent = (healthReport.creditScore - 300) / 600;
  const scoreOffset = 440 - (440 * scorePercent);

  // Handlers
  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name.trim() || !newCard.bank.trim()) return;
    addCreditCard(newCard);
    setNewCard({
      name: '',
      bank: '',
      limit: 100000,
      currentBalance: 0,
      dueDate: '15',
      statementDate: '25',
      rewardType: 'cashback',
      rewardRate: 1.5,
      cardType: 'visa'
    });
    setShowAddCard(false);
  };

  const handleAddEMISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEMI.cardId || !newEMI.description.trim()) return;
    addCreditEMI(newEMI);
    setNewEMI({
      cardId: '',
      description: '',
      monthlyAmount: 2000,
      remainingMonths: 12,
      totalAmount: 24000
    });
    setShowAddEMI(false);
  };

  const handleLogRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepayment.cardId) return;
    addCreditRepayment(newRepayment);
    setNewRepayment({
      cardId: '',
      billingMonth: new Date().toISOString().substring(0, 7),
      amountDue: 5000,
      amountPaid: 5000,
      paidDate: new Date().toISOString().substring(0, 10),
      status: 'ontime'
    });
    setShowLogRepayment(false);
  };

  const handleUpdateBalance = (cardId: string, balance: number) => {
    updateCreditCard(cardId, { currentBalance: balance });
  };

  // CSV Drag and Drop Parsers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseCSVFile(e.target.files[0]);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          setCsvError("Statement CSV file is empty or does not contain enough records.");
          return;
        }

        // Detect column indices based on headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dateIdx = headers.findIndex(h => h.includes('date'));
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narrative') || h.includes('particulars'));
        const amountIdx = headers.findIndex(h => h.includes('amt') || h.includes('amount') || h.includes('value'));
        const categoryIdx = headers.findIndex(h => h.includes('cat'));

        if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
          setCsvError("Failed to map columns. CSV must contain columns for 'Date', 'Description', and 'Amount'.");
          return;
        }

        const parsedTransactions: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Basic CSV quote escape parser
          const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (row.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;
          
          const rawDate = row[dateIdx];
          const desc = row[descIdx];
          const rawAmount = parseFloat(row[amountIdx].replace(/[^\d.-]/g, ''));
          
          if (!rawDate || isNaN(rawAmount) || rawAmount <= 0) continue;

          // Format Date to YYYY-MM-DD
          let formattedDate = rawDate;
          if (rawDate.includes('/')) {
            // Assume DD/MM/YYYY or MM/DD/YYYY, convert to YYYY-MM-DD
            const parts = rawDate.split('/');
            if (parts[2]?.length === 4) {
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          // Local Keyword-based auto categorization
          let category = 'shopping';
          const lowerDesc = desc.toLowerCase();
          if (lowerDesc.includes('zomato') || lowerDesc.includes('swiggy') || lowerDesc.includes('restaurant') || lowerDesc.includes('food') || lowerDesc.includes('dine')) {
            category = 'food';
          } else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('youtube') || lowerDesc.includes('prime') || lowerDesc.includes('sub')) {
            category = 'subscriptions';
          } else if (lowerDesc.includes('uber') || lowerDesc.includes('ola') || lowerDesc.includes('fuel') || lowerDesc.includes('petrol') || lowerDesc.includes('rail') || lowerDesc.includes('flight')) {
            category = 'travel';
          } else if (lowerDesc.includes('electricity') || lowerDesc.includes('wifi') || lowerDesc.includes('water') || lowerDesc.includes('bsnl') || lowerDesc.includes('jio') || lowerDesc.includes('recharge')) {
            category = 'utilities';
          } else if (lowerDesc.includes('apollo') || lowerDesc.includes('pharmacy') || lowerDesc.includes('hospital') || lowerDesc.includes('clinic')) {
            category = 'healthcare';
          } else if (lowerDesc.includes('pvr') || lowerDesc.includes('movie') || lowerDesc.includes('bookmyshow') || lowerDesc.includes('play')) {
            category = 'entertainment';
          }

          parsedTransactions.push({
            date: formattedDate,
            description: desc,
            amount: rawAmount,
            category,
            paymentMethod: 'credit-card'
          });
        }

        if (parsedTransactions.length === 0) {
          setCsvError("No valid expenses found. Verify dates and positive transaction amount fields.");
        } else {
          setCsvPreview(parsedTransactions);
          setCsvError(null);
        }
      } catch (err) {
        setCsvError("An error occurred while parsing the CSV. Ensure it is a valid CSV statement.");
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!targetCardForImport) {
      alert("Please select a target Credit Card for these transactions.");
      return;
    }

    const expensesToUpload = csvPreview.map(tx => ({
      ...tx,
      cardId: targetCardForImport
    }));

    // Calculate total balance update
    const totalNewBalance = expensesToUpload.reduce((sum, tx) => sum + tx.amount, 0);
    const selectedCard = creditCards.find(c => c.id === targetCardForImport);
    if (selectedCard) {
      updateCreditCard(targetCardForImport, {
        currentBalance: selectedCard.currentBalance + totalNewBalance
      });
    }

    uploadExpenses(expensesToUpload);
    setCsvPreview([]);
    setTargetCardForImport('');
    alert(`Successfully imported ${expensesToUpload.length} transactions and updated card balance.`);
  };

  // Interpret Credit Scores
  const getScoreRatingColor = (s: number) => {
    if (s >= 800) return { label: 'Excellent', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' };
    if (s >= 740) return { label: 'Very Good', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    if (s >= 670) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (s >= 580) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    return { label: 'Poor', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const ratingObj = getScoreRatingColor(healthReport.creditScore);

  return (
    <main className="min-h-screen bg-dark-950 text-white pb-20">
      <SEO 
        title="Credit Health & Spending Intelligence"
        description="Local-first credit evaluation system to analyze card utilization, repayment streaks, subscription leaks, and simulated credit scores in Artha."
        keywords="credit health score, credit card manager, spending intelligence, credit card rewards optimization, Indian personal finance"
      />
      
      <SubNav />

      <div className="container mx-auto px-6 max-w-7xl pt-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="heading-2">Credit Health & Spending Intelligence</h1>
            <p className="text-gray-400">Optimize utilization, auditing reward leakages, and managing repayments privately.</p>
          </div>
          <div 
            className={`px-4 py-2 rounded-xl border ${ratingObj.bg} flex items-center gap-2`}
            role="status"
            aria-live="polite"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-300">
              Simulated Index: <span className={ratingObj.color}>{healthReport.creditScore}</span> ({healthReport.creditRating})
            </span>
          </div>
        </header>

        {/* Top Radial Score & Critical Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Radial score gauge dial (left) */}
          <article className="lg:col-span-5 glass-card p-6 flex flex-col items-center justify-center border-gold-500/10 text-center space-y-6">
            <h2 className="text-lg font-bold text-gray-200">Local Credit Health Index</h2>
            
            <div className="relative w-48 h-48 flex-shrink-0" aria-label={`Score meter representing ${healthReport.creditScore} out of 900`}>
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                <circle cx="80" cy="80" r="70" className="stroke-dark-800" strokeWidth="10" fill="none" />
                <circle 
                  cx="80" cy="80" r="70" 
                  className="stroke-gold-500 transition-all duration-700 ease-out" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeLinecap="round"
                  style={{ 
                    strokeDasharray: 440,
                    strokeDashoffset: scoreOffset
                  }} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-white">{healthReport.creditScore}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 ${ratingObj.color} bg-white/5`}>
                  {healthReport.creditRating}
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-1">Range: 300-900</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="text-left">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Credit Stress Load</span>
                <p className="text-lg font-bold text-white mt-0.5">{healthReport.creditStressScore}/100</p>
                <span className={`text-[10px] font-medium ${healthReport.creditStressScore > 45 ? 'text-red-400' : 'text-green-400'}`}>
                  {healthReport.stressRating} Stress
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Credit Limit</span>
                <p className="text-lg font-bold text-white mt-0.5">₹{utilizationMetrics.totalLimit.toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-gray-400 font-medium">
                  {creditCards.length} Active Cards
                </span>
              </div>
            </div>
          </article>

          {/* Actionable explainers and metrics cards (right) */}
          <section className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-gold-400" /> Human-Like Credit Diagnostics
            </h2>
            
            {insights.length === 0 ? (
              <div className="glass-card p-6 border-white/5 text-center text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-2" />
                <p className="font-semibold text-white">Your credit profile looks pristine!</p>
                <p className="text-xs text-gray-400 mt-1">No upcoming bills, high utilization, or missed repayments detected.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                {insights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 text-sm ${
                      insight.type === 'warning' 
                        ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                        : insight.type === 'positive'
                        ? 'bg-green-500/5 border-green-500/20 text-green-400'
                        : insight.type === 'tip'
                        ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                    }`}
                  >
                    <div className="space-y-1 md:max-w-[70%]">
                      <span className="font-bold flex items-center gap-1.5">
                        {insight.type === 'warning' ? <ShieldAlert size={16} /> : <Info size={16} />} {insight.title}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed"><span className="font-semibold text-gray-400">Status:</span> {insight.what}</p>
                      <p className="text-xs text-gray-300 leading-relaxed"><span className="font-semibold text-gray-400">Context:</span> {insight.why}</p>
                    </div>
                    <div className="bg-dark-950/40 p-3 rounded-lg border border-white/5 text-xs text-white h-fit my-auto">
                      <span className="font-semibold text-gold-400 block mb-0.5">Action Plan:</span>
                      {insight.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Credit factors score progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthReport.factors.map((factor) => {
                const statusColors = {
                  excellent: 'text-green-400 bg-green-500/10',
                  good: 'text-blue-400 bg-blue-500/10',
                  fair: 'text-yellow-400 bg-yellow-500/10',
                  critical: 'text-red-400 bg-red-500/10'
                };

                return (
                  <article key={factor.name} className="glass-card p-4 border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{factor.name}</h3>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded mt-1.5 inline-block ${statusColors[factor.status]}`}>
                          {factor.status}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-white">{factor.score}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          factor.score >= 90 ? 'bg-green-400' : factor.score >= 75 ? 'bg-blue-400' : factor.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{factor.description}</p>
                  </article>
                );
              })}
            </div>

          </section>
        </div>

        {/* Interactive Modules Tabs */}
        <div className="pt-6 border-t border-white/5 space-y-6">
          
          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto scrollbar-hide">
            {(['health', 'utilization', 'repayments', 'spending', 'rewards'] as const).map((tab) => {
              const tabLabels = {
                health: 'Credit Cards List',
                utilization: 'Utilization Metrics',
                repayments: 'Repayments & EMIs',
                spending: 'Spending Intelligence',
                rewards: 'Reward Audit'
              };

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab 
                      ? 'border-gold-500 text-gold-400' 
                      : 'border-transparent text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Health & Credit Card Management */}
          {activeTab === 'health' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="heading-3">My Credit Cards</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Manage details of credit limits, balances, and reward rates locally.</p>
                </div>
                <button 
                  onClick={() => setShowAddCard(!showAddCard)}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>

              {/* Add Card Form */}
              {showAddCard && (
                <form onSubmit={handleAddCardSubmit} className="glass-card p-6 border-gold-500/20 max-w-3xl animate-fade-in space-y-4">
                  <h4 className="font-bold text-white">Register a Credit Card</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="card-name" className="text-xs text-gray-400 block mb-1">Card Name</label>
                      <input 
                        id="card-name"
                        type="text" 
                        placeholder="e.g. Regalia Gold" 
                        value={newCard.name}
                        onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-bank" className="text-xs text-gray-400 block mb-1">Bank Name</label>
                      <input 
                        id="card-bank"
                        type="text" 
                        placeholder="e.g. HDFC Bank" 
                        value={newCard.bank}
                        onChange={(e) => setNewCard({...newCard, bank: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-limit" className="text-xs text-gray-400 block mb-1">Total Limit (₹)</label>
                      <input 
                        id="card-limit"
                        type="number" 
                        value={newCard.limit}
                        onChange={(e) => setNewCard({...newCard, limit: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="5000"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-bal" className="text-xs text-gray-400 block mb-1">Current Balance (₹)</label>
                      <input 
                        id="card-bal"
                        type="number" 
                        value={newCard.currentBalance}
                        onChange={(e) => setNewCard({...newCard, currentBalance: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-due" className="text-xs text-gray-400 block mb-1">Due Day of Month (1-31)</label>
                      <input 
                        id="card-due"
                        type="text" 
                        placeholder="e.g. 15" 
                        value={newCard.dueDate}
                        onChange={(e) => setNewCard({...newCard, dueDate: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-stat" className="text-xs text-gray-400 block mb-1">Statement Day (1-31)</label>
                      <input 
                        id="card-stat"
                        type="text" 
                        placeholder="e.g. 25" 
                        value={newCard.statementDate}
                        onChange={(e) => setNewCard({...newCard, statementDate: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-reward-type" className="text-xs text-gray-400 block mb-1">Reward Type</label>
                      <select 
                        id="card-reward-type"
                        value={newCard.rewardType}
                        onChange={(e) => setNewCard({...newCard, rewardType: e.target.value as any})}
                        className="input-field py-2 text-sm animate-fade-in"
                      >
                        <option value="cashback">Cashback (%)</option>
                        <option value="points">Reward Points</option>
                        <option value="miles">Aviation Miles</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="card-reward-rate" className="text-xs text-gray-400 block mb-1">Base Reward Yield (%)</label>
                      <input 
                        id="card-reward-rate"
                        type="number" 
                        step="0.1"
                        value={newCard.rewardRate}
                        onChange={(e) => setNewCard({...newCard, rewardRate: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="card-network" className="text-xs text-gray-400 block mb-1">Card Network</label>
                      <select 
                        id="card-network"
                        value={newCard.cardType}
                        onChange={(e) => setNewCard({...newCard, cardType: e.target.value as any})}
                        className="input-field py-2 text-sm animate-fade-in"
                      >
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="rupay">RuPay (UPI Compatible)</option>
                        <option value="amex">American Express</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                    <button type="button" onClick={() => setShowAddCard(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                    <button type="submit" className="btn-primary text-xs py-1.5 px-4">Register Card</button>
                  </div>
                </form>
              )}

              {/* Cards Grid list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creditCards.map((card) => {
                  const utilPercent = card.limit > 0 ? (card.currentBalance / card.limit) * 100 : 0;
                  const utilColor = utilPercent > 50 ? 'text-red-400' : utilPercent > 30 ? 'text-yellow-400' : 'text-green-400';

                  return (
                    <article key={card.id} className="relative bg-gradient-to-br from-dark-900 to-dark-950 p-6 rounded-2xl border border-white/5 space-y-4 hover:border-gold-500/20 transition-all shadow-xl group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{card.bank}</p>
                          <h4 className="text-base font-bold text-white mt-0.5">{card.name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => deleteCreditCard(card.id)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Card"
                            aria-label={`Remove ${card.name} card`}
                          >
                            <Trash2 size={14} />
                          </button>
                          <span className="text-[10px] uppercase font-bold text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20 h-fit">
                            {card.cardType}
                          </span>
                        </div>
                      </div>

                      {/* Display Balance update inline input */}
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400">Current Balance:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white">₹</span>
                          <input 
                            type="number"
                            value={card.currentBalance}
                            onChange={(e) => handleUpdateBalance(card.id, Number(e.target.value))}
                            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-gold-500 font-bold text-xl text-white outline-none w-32 py-px transition-colors"
                            title="Edit card balance"
                            aria-label={`Modify balance for ${card.name}`}
                          />
                        </div>
                      </div>

                      {/* Card Info stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                        <div>
                          <span className="text-gray-500">Credit Limit:</span>
                          <p className="font-semibold text-white">₹{card.limit.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Utilization:</span>
                          <p className={`font-semibold ${utilColor}`}>{utilPercent.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Statement Date:</span>
                          <p className="font-semibold text-white">{card.statementDate}th monthly</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <p className="font-semibold text-white">{card.dueDate}th monthly</p>
                        </div>
                      </div>

                      {/* Reward badge details */}
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Award size={12} className="text-gold-400" />
                          Yield: {card.rewardRate}% ({card.rewardType})
                        </span>
                        <span className="text-gold-400 font-semibold">
                          ₹{card.rewardEarned.toLocaleString('en-IN')} Earned
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Utilization Analytics */}
          {activeTab === 'utilization' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="heading-3">Credit Utilization Analytics</h3>
                <p className="text-xs text-gray-400 mt-0.5">Understand your debt utilization ratio and optimize balances to secure pristine ratings.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left panel: Breakdown */}
                <div className="lg:col-span-7 glass-card p-6 border-white/5 space-y-6">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-gold-400" /> Utilization Status: <span className="text-gold-400 capitalize">{utilizationMetrics.status}</span>
                  </h4>
                  
                  {utilizationMetrics.warningMessage && (
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="flex-shrink-0 mt-0.5" size={14} />
                      {utilizationMetrics.warningMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {utilizationMetrics.cardMetrics.map((card) => {
                      const progressColor = card.utilization > 50 ? 'bg-red-400' : card.utilization > 30 ? 'bg-yellow-400' : 'bg-green-400';
                      return (
                        <div key={card.cardId} className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-white">{card.bank} {card.cardName}</span>
                            <span className="text-gray-400">
                              ₹{card.balance.toLocaleString('en-IN')} / ₹{card.limit.toLocaleString('en-IN')} 
                              <span className={`font-bold ml-2 ${card.utilization > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                                ({card.utilization.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full ${progressColor}`}
                              style={{ width: `${Math.min(100, card.utilization)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right panel: Static guidelines & impact */}
                <div className="lg:col-span-5 glass-card p-6 border-white/5 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Info className="text-gold-400" /> Optimal Utilization Guidelines
                  </h4>
                  <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                    <p>
                      <strong className="text-white block mb-0.5">Keep utilization below 30%</strong>
                      Credit rating agencies (CIBIL/Experian) analyze how heavily you depend on unsecured debt. Utilizing over 30% of your total credit limit indicates potential cash-flow stress, depressing your credit rating.
                    </p>
                    <p>
                      <strong className="text-white block mb-0.5">Individual card limits matter</strong>
                      Even if your overall utilization is 10%, maxing out one specific card (e.g. utilizing 80% of its individual limit) flag risk systems. Prioritize distributing charges across cards or prepaying balances mid-cycle.
                    </p>
                    <p>
                      <strong className="text-white block mb-0.5">Prepay before statement dates</strong>
                      If you make massive purchases, clear your balances online 3-4 days before your **Statement Date** rather than waiting for the payment due date. This forces the bank to report a low credit balance to the bureau.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Repayments & EMIs */}
          {activeTab === 'repayments' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="heading-3">Repayment Logs & EMI Schedule</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Monitor active purchase tenures, log repayments, and build an on-time payment streak.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowLogRepayment(!showLogRepayment)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} /> Log Repayment
                  </button>
                  <button 
                    onClick={() => setShowAddEMI(!showAddEMI)}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Active EMI
                  </button>
                </div>
              </div>

              {/* Log Repayment Form */}
              {showLogRepayment && (
                <form onSubmit={handleLogRepaymentSubmit} className="glass-card p-6 border-gold-500/20 max-w-3xl animate-fade-in space-y-4">
                  <h4 className="font-bold text-white">Log a Card Repayment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="repay-card" className="text-xs text-gray-400 block mb-1">Select Card</label>
                      <select 
                        id="repay-card"
                        value={newRepayment.cardId}
                        onChange={(e) => setNewRepayment({...newRepayment, cardId: e.target.value})}
                        className="input-field py-2 text-sm animate-fade-in"
                        required
                      >
                        <option value="">Select a registered card</option>
                        {creditCards.map(c => (
                          <option key={c.id} value={c.id}>{c.bank} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="repay-month" className="text-xs text-gray-400 block mb-1">Billing Month</label>
                      <input 
                        id="repay-month"
                        type="month" 
                        value={newRepayment.billingMonth}
                        onChange={(e) => setNewRepayment({...newRepayment, billingMonth: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="repay-due" className="text-xs text-gray-400 block mb-1">Amount Due (₹)</label>
                      <input 
                        id="repay-due"
                        type="number" 
                        value={newRepayment.amountDue}
                        onChange={(e) => setNewRepayment({...newRepayment, amountDue: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="repay-paid" className="text-xs text-gray-400 block mb-1">Amount Paid (₹)</label>
                      <input 
                        id="repay-paid"
                        type="number" 
                        value={newRepayment.amountPaid}
                        onChange={(e) => setNewRepayment({...newRepayment, amountPaid: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="repay-date" className="text-xs text-gray-400 block mb-1">Payment Date</label>
                      <input 
                        id="repay-date"
                        type="date" 
                        value={newRepayment.paidDate}
                        onChange={(e) => setNewRepayment({...newRepayment, paidDate: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="repay-status" className="text-xs text-gray-400 block mb-1">Repayment Status</label>
                      <select 
                        id="repay-status"
                        value={newRepayment.status}
                        onChange={(e) => setNewRepayment({...newRepayment, status: e.target.value as any})}
                        className="input-field py-2 text-sm animate-fade-in"
                      >
                        <option value="ontime">On Time</option>
                        <option value="late">Late Payment</option>
                        <option value="partial">Partial Payment</option>
                        <option value="unpaid">Unpaid / Lapsed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                    <button type="button" onClick={() => setShowLogRepayment(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                    <button type="submit" className="btn-primary text-xs py-1.5 px-4">Log Payment</button>
                  </div>
                </form>
              )}

              {/* Add Active EMI Form */}
              {showAddEMI && (
                <form onSubmit={handleAddEMISubmit} className="glass-card p-6 border-gold-500/20 max-w-3xl animate-fade-in space-y-4">
                  <h4 className="font-bold text-white">Add Card-based EMI Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="emi-card" className="text-xs text-gray-400 block mb-1">Select Card</label>
                      <select 
                        id="emi-card"
                        value={newEMI.cardId}
                        onChange={(e) => setNewEMI({...newEMI, cardId: e.target.value})}
                        className="input-field py-2 text-sm animate-fade-in"
                        required
                      >
                        <option value="">Select a registered card</option>
                        {creditCards.map(c => (
                          <option key={c.id} value={c.id}>{c.bank} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="emi-desc" className="text-xs text-gray-400 block mb-1">Purchase Description</label>
                      <input 
                        id="emi-desc"
                        type="text" 
                        placeholder="e.g. MacBook Pro Purchase" 
                        value={newEMI.description}
                        onChange={(e) => setNewEMI({...newEMI, description: e.target.value})}
                        className="input-field py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="emi-monthly" className="text-xs text-gray-400 block mb-1">Monthly EMI Amount (₹)</label>
                      <input 
                        id="emi-monthly"
                        type="number" 
                        value={newEMI.monthlyAmount}
                        onChange={(e) => setNewEMI({...newEMI, monthlyAmount: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="emi-tenure" className="text-xs text-gray-400 block mb-1">Remaining Tenure (Months)</label>
                      <input 
                        id="emi-tenure"
                        type="number" 
                        value={newEMI.remainingMonths}
                        onChange={(e) => setNewEMI({...newEMI, remainingMonths: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="1"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="emi-total" className="text-xs text-gray-400 block mb-1">Total Loan Amount (₹)</label>
                      <input 
                        id="emi-total"
                        type="number" 
                        value={newEMI.totalAmount}
                        onChange={(e) => setNewEMI({...newEMI, totalAmount: Number(e.target.value)})}
                        className="input-field py-2 text-sm"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                    <button type="button" onClick={() => setShowAddEMI(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                    <button type="submit" className="btn-primary text-xs py-1.5 px-4">Register EMI</button>
                  </div>
                </form>
              )}

              {/* Active EMIs & Streaks display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left panel: Active EMIs */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="text-gold-400" /> Active Card EMIs
                  </h4>

                  {creditEMIs.length === 0 ? (
                    <div className="glass-card p-6 border-white/5 text-center text-gray-500">
                      No active card EMIs found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {creditEMIs.map((emi) => {
                        const card = creditCards.find(c => c.id === emi.cardId);
                        const progressPercent = ((emi.totalAmount - (emi.monthlyAmount * emi.remainingMonths)) / emi.totalAmount) * 100;
                        return (
                          <article key={emi.id} className="glass-card p-5 border-white/5 space-y-3 hover:border-gold-500/10 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-white text-sm">{emi.description}</h5>
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                  Card: {card ? `${card.bank} ${card.name}` : 'Credit Card'}
                                </span>
                              </div>
                              <button 
                                onClick={() => deleteCreditEMI(emi.id)}
                                className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                title="Remove EMI"
                                aria-label={`Delete ${emi.description} EMI`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                              <div>
                                <span className="text-gray-500">Monthly amount:</span>
                                <p className="font-bold text-white">₹{emi.monthlyAmount.toLocaleString('en-IN')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Remaining Tenure:</span>
                                <p className="font-bold text-white">{emi.remainingMonths} Months</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Borrowed:</span>
                                <p className="font-bold text-white">₹{emi.totalAmount.toLocaleString('en-IN')}</p>
                              </div>
                            </div>

                            <div className="space-y-1 pt-2">
                              <div className="flex justify-between text-[10px] text-gray-500">
                                <span>EMI Principal Payoff Progress:</span>
                                <span className="font-semibold text-gray-300">{Math.max(0, Math.round(progressPercent))}% Paid</span>
                              </div>
                              <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}></div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right panel: Repayments History */}
                <div className="lg:col-span-5 glass-card p-6 border-white/5 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 className="text-green-400" /> Repayment History</span>
                    <span className="text-xs text-gold-400 font-semibold bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                      Streak: {repaymentMetrics.streakMonths} Months
                    </span>
                  </h4>

                  <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
                    {creditRepayments.slice().sort((a,b) => b.billingMonth.localeCompare(a.billingMonth)).map((rep) => {
                      const card = creditCards.find(c => c.id === rep.cardId);
                      const statusConfig = {
                        ontime: { label: 'On Time', color: 'text-green-400 bg-green-500/5 border-green-500/10' },
                        late: { label: 'Late', color: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/10' },
                        partial: { label: 'Partial', color: 'text-orange-400 bg-orange-500/5 border-orange-500/10' },
                        unpaid: { label: 'Lapsed', color: 'text-red-400 bg-red-500/5 border-red-500/10' }
                      };
                      const status = statusConfig[rep.status];

                      return (
                        <div key={rep.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white block">{card ? card.name : 'Unknown Card'}</span>
                            <span className="text-[10px] text-gray-500">{rep.billingMonth} | Paid: ₹{rep.amountPaid.toLocaleString('en-IN')} of ₹{rep.amountDue.toLocaleString('en-IN')}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Spending & Subscriptions */}
          {activeTab === 'spending' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="heading-3">Card Spending Intelligence</h3>
                <p className="text-xs text-gray-400 mt-0.5">Audit transaction categories, recurring dependencies, and upload statement logs.</p>
              </div>

              {/* Statement Uploader Drag/Drop Section */}
              <div 
                className={`glass-card p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  dragActive ? 'border-gold-500 bg-gold-500/5' : 'border-white/10 hover:border-gold-500/30'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file"
                  id="csv-file-picker"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                
                <Upload className="w-12 h-12 text-gold-400 opacity-60 mb-3 animate-pulse" />
                <h4 className="font-semibold text-white text-sm">Drag and drop statement CSV here</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Upload card statement files directly. All parsers process completely inside the browser window. We never upload your data.
                </p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-xs py-2 px-4 mt-4"
                >
                  Choose CSV File
                </button>

                {csvError && (
                  <p className="text-red-400 text-xs mt-3 bg-red-500/5 border border-red-500/20 px-3 py-1.5 rounded-xl">
                    {csvError}
                  </p>
                )}
              </div>

              {/* CSV Import Preview Modal/Grid */}
              {csvPreview.length > 0 && (
                <div className="glass-card p-6 border-gold-500/20 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">Preview Imported Transactions ({csvPreview.length})</h4>
                      <p className="text-xs text-gray-400">Map these transactions to an active card to compute limits and logs.</p>
                    </div>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <select 
                        value={targetCardForImport}
                        onChange={(e) => setTargetCardForImport(e.target.value)}
                        className="input-field py-1.5 px-3 text-xs w-full sm:w-48 animate-fade-in"
                        required
                      >
                        <option value="">Select Target Card</option>
                        {creditCards.map(c => (
                          <option key={c.id} value={c.id}>{c.bank} {c.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleConfirmImport}
                        disabled={!targetCardForImport}
                        className="btn-primary text-xs py-2 px-4 whitespace-nowrap disabled:opacity-50"
                      >
                        Import Logs
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-white/5 rounded-xl scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-dark-900 text-gray-400 border-b border-white/5">
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Category</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 10).map((tx, idx) => (
                          <tr key={idx} className="border-b border-white/5 text-gray-300">
                            <td className="p-3">{tx.date}</td>
                            <td className="p-3 font-medium text-white">{tx.description}</td>
                            <td className="p-3 capitalize">{tx.category}</td>
                            <td className="p-3 text-right font-bold text-gold-400">₹{tx.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        {csvPreview.length > 10 && (
                          <tr className="text-gray-500 italic">
                            <td colSpan={4} className="p-3 text-center">... and {csvPreview.length - 10} more transactions</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Category-wise Spending & Spikes Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left panel: Category chart list */}
                <div className="lg:col-span-6 glass-card p-6 border-white/5 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <CardIcon className="text-gold-400" /> Spending By Category
                  </h4>
                  <div className="space-y-3">
                    {spendingIntelligence.categories.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-300">
                          <span className="capitalize font-semibold">{cat.category}</span>
                          <span className="text-gray-400">
                            ₹{cat.amount.toLocaleString('en-IN')} 
                            <span className="text-[10px] ml-1 text-gold-500">({cat.percentage.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gold-500" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel: Subscriptions & Spikes warnings */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Subscriptions Card */}
                  <article className="glass-card p-6 border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase className="text-blue-400" /> Card Subscriptions ({spendingIntelligence.subscriptions.length})
                    </h4>
                    <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                      {spendingIntelligence.subscriptions.map((sub) => {
                        const card = creditCards.find(c => c.id === sub.cardId);
                        return (
                          <div key={sub.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-white block">{sub.description}</span>
                              <span className="text-[10px] text-gray-500">Card: {card ? card.name : 'Credit Card'}</span>
                            </div>
                            <span className="font-bold text-gold-400">₹{sub.amount.toLocaleString('en-IN')}/mo</span>
                          </div>
                        );
                      })}
                    </div>
                  </article>

                  {/* Spending Spikes Warnings */}
                  {spendingIntelligence.spendingSpikes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Spending Spikes Detected</h4>
                      {spendingIntelligence.spendingSpikes.slice(0, 2).map((spike, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 space-y-1">
                          <span className="font-bold block text-sm">🚨 Discretionary Spike: {spike.description}</span>
                          <p className="text-gray-300">
                            Transaction size was ₹{spike.amount.toLocaleString('en-IN')}, which exceeds the typical category baseline of ₹{spike.avgForCategory.toLocaleString('en-IN')} by <span className="font-bold text-red-400">+{spike.excessPercentage.toFixed(1)}%</span>.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: Reward Auditing */}
          {activeTab === 'rewards' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="heading-3">Reward Audit & Optimization</h3>
                <p className="text-xs text-gray-400 mt-0.5">Analyze points yield rate, capture category-specific reward leakage, and maximize cashbacks.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left panel: Reward Leakage */}
                <div className="lg:col-span-7 glass-card p-6 border-white/5 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2"><Award className="text-gold-400" /> Reward Leakage Log</span>
                    <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      Est. Lost Yield: ₹{rewardsAudit.totalLeakageAmount.toFixed(1)}
                    </span>
                  </h4>

                  {rewardsAudit.leakages.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto opacity-70" />
                      <p className="font-semibold text-white text-sm">Perfect alignment! No leakages found.</p>
                      <p className="text-xs text-gray-400">Every category transaction used the highest reward card available in your list.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                      {rewardsAudit.leakages.map((leak, idx) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <span className="font-bold text-white text-sm block">{leak.description}</span>
                            <span className="text-[10px] text-gray-500">
                              Amount: ₹{leak.amount.toLocaleString('en-IN')} | Category: <span className="capitalize">{leak.category}</span>
                            </span>
                            <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-2">
                              <span>Used: {leak.usedCardName} ({leak.usedRate}%)</span>
                              <span className="text-gold-400 font-medium">Optimal: {leak.betterCardName} ({leak.betterRate}%)</span>
                            </div>
                          </div>
                          <div className="text-right sm:my-auto">
                            <span className="text-[10px] text-red-400 block">Reward Lost</span>
                            <span className="font-bold text-red-400">₹{leak.leakageAmount.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right panel: Optimized Card Distribution */}
                <div className="lg:col-span-5 glass-card p-6 border-white/5 space-y-4">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-gold-400" /> Optimal Card Routing Plan
                  </h4>
                  <div className="space-y-3">
                    {rewardsAudit.optimizedDistribution.map((dist) => (
                      <div key={dist.category} className="p-3 bg-dark-900/50 rounded-xl border border-white/5 text-xs flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold-400 mt-1.5"></div>
                        <div className="space-y-0.5">
                          <span className="capitalize font-semibold text-white text-xs">{dist.category} Router:</span>
                          <p className="font-bold text-gold-400">{dist.recommendedCardName}</p>
                          <p className="text-[10px] text-gray-400">{dist.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Static Educational Information */}
        <section className="pt-10 border-t border-white/5 space-y-6" aria-label="Credit Health Guidelines">
          <h2 className="heading-3 flex items-center gap-2">
            <BookOpen className="text-gold-400" /> Credit Health Education Hub
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">1. Grace Periods & Revolving Credit</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Credit cards offer a **20 to 50-day interest-free grace period**. However, if you clear only the Minimum Amount Due (or partial amounts), the grace period is dissolved. Interest charges (~3.5% monthly or 42% APR) compound immediately on the entire balance, starting from the original transaction dates.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">2. Card EMIs and Reward Cancellation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Converting purchases into EMIs usually voids any base reward points or cashbacks. Additionally, banks levy standard processing fees and 13-16% interest on card loans. Always weigh interest cost against the convenience of deferred payments before choosing EMIs.
              </p>
            </article>
            <article className="bg-dark-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">3. UPI on Credit (RuPay Cards)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Linking credit cards to UPI (supported by RuPay networks) allows you to use your credit limit for daily retail QR scanner transactions. To maintain a stellar profile, keep transactions consolidated and ensure you do not exceed 30% of your RuPay card limits on small daily purchases.
              </p>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};

export default CreditHealth;
