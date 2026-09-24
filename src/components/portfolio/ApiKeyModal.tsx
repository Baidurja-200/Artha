import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';
import { ApiSettings, getApiSettings, saveApiSettings } from '../../services/stockPriceService';
import { testGeminiKey } from '../../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState<ApiSettings>(getApiSettings());
  const [showKey, setShowKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'llm' | 'market'>('llm');

  const handleTestGemini = async () => {
    if (!settings.geminiApiKey) {
      setGeminiStatus({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setTestingGemini(true);
    setGeminiStatus(null);
    try {
      const res = await testGeminiKey(settings.geminiApiKey);
      setGeminiStatus(res);
    } catch (e: any) {
      setGeminiStatus({ success: false, message: e.message || 'Verification failed.' });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleSave = () => {
    saveApiSettings(settings);
    onSaved();
    onClose();
  };

  const handleResetDefaults = () => {
    const defaults: ApiSettings = {
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      dataProvider: 'free-direct',
      alphaVantageKey: '',
      rapidApiKey: '',
      brokerApiKey: '',
      nseApiKey: '',
      bseApiKey: '',
      preferredExchange: 'NSE',
      autoRefresh: true,
      refreshIntervalSeconds: 60,
    };
    setSettings(defaults);
    setGeminiStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-gold-500/30 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-dark-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-400">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                API & Intelligence Configuration
              </h2>
              <p className="text-xs text-gray-400">Configure real-time BSE & NSE data feeds and Gemini LLM analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-dark-950/40">
          <button
            onClick={() => setActiveTab('llm')}
            className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-all ${
              activeTab === 'llm'
                ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles size={16} /> Free Gemini LLM Key
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-all ${
              activeTab === 'market'
                ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database size={16} /> NSE & BSE Market Data Feed
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          
          {/* TAB 1: LLM KEY */}
          {activeTab === 'llm' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-gold-400 text-sm font-semibold">
                    <ShieldCheck size={16} /> OpenRouter Free-Tier AI Active
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Minimal Token Mode (&le; 350 Tokens)
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  FinSight AI is optimized for free OpenRouter tier keys with internal reasoning tokens disabled to strictly conserve your token limit while providing institutional-grade portfolio analysis.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
                  <span>OpenRouter API Key (Free Tier)</span>
                  <button 
                    type="button" 
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-gold-400 hover:underline"
                  >
                    {showKey ? 'Hide Key' : 'Show Key'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.openRouterApiKey || ''}
                    onChange={(e) => {
                      setSettings({ ...settings, openRouterApiKey: e.target.value });
                      setGeminiStatus(null);
                    }}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span>Fallback Google Gemini API Key (Optional)</span>
                </label>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => {
                    setSettings({ ...settings, geminiApiKey: e.target.value });
                    setGeminiStatus(null);
                  }}
                  placeholder="AIzaSy..."
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-gold-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    const keyToTest = settings.openRouterApiKey || settings.geminiApiKey;
                    if (!keyToTest) {
                      setGeminiStatus({ success: false, message: 'Please enter an API Key first.' });
                      return;
                    }
                    setTestingGemini(true);
                    setGeminiStatus(null);
                    try {
                      const res = await testGeminiKey(keyToTest);
                      setGeminiStatus(res);
                    } catch (e: any) {
                      setGeminiStatus({ success: false, message: e.message || 'Verification failed.' });
                    } finally {
                      setTestingGemini(false);
                    }
                  }}
                  disabled={testingGemini}
                  className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2"
                >
                  {testingGemini ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
                  {testingGemini ? 'Verifying Key...' : 'Test Active AI Connection'}
                </button>

                {geminiStatus && (
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${geminiStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                    {geminiStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {geminiStatus.message}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-400 bg-dark-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                <p className="font-semibold text-gray-300">Token-Saving Architecture</p>
                <p>Prompt payloads are condensed to ~120 tokens, and reasoning tokens are bypassed so you can safely use OpenRouter free-tier keys without exhaustion.</p>
              </div>
            </div>
          )}

          {/* TAB 2: MARKET DATA / NSE & BSE */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Market Data Provider
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Provider 1 */}
                  <div 
                    onClick={() => setSettings({ ...settings, dataProvider: 'free-direct' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.dataProvider === 'free-direct'
                        ? 'bg-gold-500/10 border-gold-500 text-white'
                        : 'bg-dark-950/50 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-gold-400">Direct Live Feed</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">FREE</span>
                    </div>
                    <p className="text-xs text-gray-300">Real-time quotes directly from NSE & BSE. No API key required.</p>
                  </div>

                  {/* Provider 2 */}
                  <div 
                    onClick={() => setSettings({ ...settings, dataProvider: 'alpha-vantage' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.dataProvider === 'alpha-vantage'
                        ? 'bg-gold-500/10 border-gold-500 text-white'
                        : 'bg-dark-950/50 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-gold-400">Alpha Vantage</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">API KEY</span>
                    </div>
                    <p className="text-xs text-gray-300">Official provider supporting .NSE and .BSE ticker quotes.</p>
                  </div>

                  {/* Provider 3 */}
                  <div 
                    onClick={() => setSettings({ ...settings, dataProvider: 'broker' })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.dataProvider === 'broker'
                        ? 'bg-gold-500/10 border-gold-500 text-white'
                        : 'bg-dark-950/50 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-gold-400">Broker / RapidAPI</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">CUSTOM</span>
                    </div>
                    <p className="text-xs text-gray-300">Angel One, Upstox, Dhan, or RapidAPI Indian Stock Exchange.</p>
                  </div>

                </div>
              </div>

              {/* Conditional Inputs */}
              {settings.dataProvider === 'alpha-vantage' && (
                <div className="p-4 bg-dark-950/80 rounded-2xl border border-white/5 space-y-3">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Alpha Vantage API Key
                  </label>
                  <input
                    type="text"
                    value={settings.alphaVantageKey || ''}
                    onChange={(e) => setSettings({ ...settings, alphaVantageKey: e.target.value })}
                    placeholder="Enter your Alpha Vantage key (e.g. AB12CD34EF56)"
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-gold-500/50"
                  />
                  <p className="text-xs text-gray-400">
                    Get a free key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noreferrer" className="text-gold-400 underline">alphavantage.co</a>.
                  </p>
                </div>
              )}

              {settings.dataProvider === 'broker' && (
                <div className="p-4 bg-dark-950/80 rounded-2xl border border-white/5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      NSE Official / Broker API Key
                    </label>
                    <input
                      type="text"
                      value={settings.nseApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, nseApiKey: e.target.value })}
                      placeholder="Optional NSE feed / broker key"
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-gold-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      BSE Official / Broker API Key
                    </label>
                    <input
                      type="text"
                      value={settings.bseApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, bseApiKey: e.target.value })}
                      placeholder="Optional BSE feed / broker key"
                      className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-gold-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Preferred Exchange Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Valuation Exchange
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                    <input
                      type="radio"
                      name="preferredExchange"
                      checked={settings.preferredExchange === 'NSE'}
                      onChange={() => setSettings({ ...settings, preferredExchange: 'NSE' })}
                      className="accent-gold-500"
                    />
                    <span>NSE (National Stock Exchange) — Recommended</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                    <input
                      type="radio"
                      name="preferredExchange"
                      checked={settings.preferredExchange === 'BSE'}
                      onChange={() => setSettings({ ...settings, preferredExchange: 'BSE' })}
                      className="accent-gold-500"
                    />
                    <span>BSE (Bombay Stock Exchange)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Artha displays both NSE and BSE prices side-by-side and calculates arbitrage spreads automatically.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-dark-950/80">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Reset Defaults
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary py-2.5 px-6 text-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
