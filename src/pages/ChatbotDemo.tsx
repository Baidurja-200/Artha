import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ShieldAlert, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import { generateDemoResponse, ChatbotDemoResponse } from '../services/chatbotDemoEngine';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  metrics?: ChatbotDemoResponse['metrics'];
}

const ChatbotDemo = () => {
  const [mode, setMode] = useState<'general' | 'dashboard'>('general');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Hello! I am **Artha AI** (Isolated Demo Mode), your personal financial assistant. I have been pre-loaded with a comprehensive knowledge base to answer all types of personal finance queries!\n\nHere are some sample topics you can ask me about:\n\n1. **Financial Rules**: *"What is the Rule of 72?"*, *"How does compound interest work?"*, or *"Explain the 50/30/20 budget rule"*.\n2. **Investing & Funds**: *"Direct vs Regular plans"*, *"What is an index fund?"*, or *"Analyze my portfolio"*.\n3. **Tax Planning**: *"Section 80C list"*, *"Explain ELSS funds"*, or *"New vs Old tax slabs"*.\n4. **Credit Mechanics**: *"Brackets for credit scores"*, *"List active EMIs"*, or *"Check my credit health"*.\n\nType any query below to begin testing!`,
      timestamp: new Date(),
      metrics: [
        { label: 'Feature State', value: 'Isolated Demo', status: 'warning' },
        { label: 'Scope', value: 'General Finance', status: 'info' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generalChips = [
    'What is the Rule of 72?',
    'Explain the 50/30/20 budget rule',
    'Direct vs Regular plans',
    'Section 80C list',
    'New vs Old tax slabs'
  ];

  const dashboardChips = [
    'Analyze my portfolio',
    'Show my budget breakdown',
    'Check my credit score',
    'Show my active goals',
    'Scan for reward leakage'
  ];

  const activeChips = mode === 'general' ? generalChips : dashboardChips;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateDemoResponse(text, mode);
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date(),
        metrics: response.metrics
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 750);
  };

  const handleModeChange = (newMode: 'general' | 'dashboard') => {
    if (newMode === mode) return;
    setMode(newMode);

    const systemMsg: Message = {
      id: `system-${Date.now()}`,
      sender: 'assistant',
      text: newMode === 'general'
        ? `🔄 Switched to **General Finance AI Mode**.\n\nAsk me about standard financial rules (Rule of 72, 50/30/20), compounding math, Direct vs Regular mutual funds, or tax slabs.`
        : `🔄 Switched to **Local Dashboard AI Mode**.\n\nAsk me to review your personal investments, calculate your direct savings rate, or check your credit health score details.`,
      timestamp: new Date(),
      metrics: newMode === 'general'
        ? [
            { label: 'Feature State', value: 'Isolated Demo', status: 'warning' },
            { label: 'Scope', value: 'General Finance', status: 'info' }
          ]
        : [
            { label: 'Feature State', value: 'Isolated Demo', status: 'warning' },
            { label: 'Scope', value: 'Local Dashboard', status: 'success' }
          ]
    };

    setMessages((prev) => [...prev, systemMsg]);
  };

  const handleReset = () => {
    if (window.confirm('Do you want to clear your current conversation?')) {
      setMessages([
        {
          id: 'init',
          sender: 'assistant',
          text: `Hello! I am **Artha AI** (Isolated Demo Mode), your personal financial assistant. I have been pre-loaded with a comprehensive knowledge base to answer all types of personal finance queries!\n\nHere are some sample topics you can ask me about:\n\n1. **Financial Rules**: *"What is the Rule of 72?"*, *"How does compound interest work?"*, or *"Explain the 50/30/20 budget rule"*.\n2. **Investing & Funds**: *"Direct vs Regular plans"*, *"What is an index fund?"*, or *"Analyze my portfolio"*.\n3. **Tax Planning**: *"Section 80C list"*, *"Explain ELSS funds"*, or *"New vs Old tax slabs"*.\n4. **Credit Mechanics**: *"Brackets for credit scores"*, *"List active EMIs"*, or *"Check my credit health"*.\n\nType any query below to begin testing!`,
          timestamp: new Date(),
          metrics: [
            { label: 'Feature State', value: 'Isolated Demo', status: 'warning' },
            { label: 'Scope', value: 'General Finance', status: 'info' }
          ]
        }
      ]);
    }
  };

  // Basic client-side formatter for markdown bold, lists, and headers
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let content: React.ReactNode = line;

      // Match headers (e.g. ### Header)
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-gold-400 font-semibold text-base mt-4 mb-2 first:mt-0 font-display">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-white font-bold text-lg mt-5 mb-2 first:mt-0 font-display">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Match lists (e.g. - list or * list)
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.substring(2);
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-1 text-sm text-gray-300">
            <span className="text-gold-500 mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-gold-500" />
            <span className="leading-relaxed">{parseBoldText(itemText)}</span>
          </div>
        );
      }

      // Match numbered lists (e.g. 1. list)
      const numListRegex = /^\d+\.\s(.*)/;
      if (numListRegex.test(line)) {
        const match = line.match(numListRegex);
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-1 text-sm text-gray-300">
            <span className="text-gold-400 font-semibold shrink-0 mt-0.5">{line.split('.')[0]}.</span>
            <span className="leading-relaxed">{parseBoldText(match ? match[1] : '')}</span>
          </div>
        );
      }

      return (
        <p key={i} className="leading-relaxed text-sm text-gray-300 my-1.5 min-h-[1rem]">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white pb-12 pt-[40px] flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Warning Banner */}
        <div className="glass-card mb-4 border-amber-500/20 bg-amber-500/5 px-6 py-3.5 flex items-center gap-3.5 rounded-2xl">
          <ShieldAlert className="text-amber-400 shrink-0" size={20} />
          <div className="text-xs text-gray-300 leading-normal">
            <span className="font-semibold text-white block">Demo Preview Mode</span>
            This route is isolated and not linked in standard menus. You can safely test general financial and local context queries here.
          </div>
        </div>

        {/* Chat Interface Container */}
        <div className="glass-panel overflow-hidden flex flex-col h-[78vh] border-white/10 shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-4 bg-dark-900/80 border-b border-white/5 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <Sparkles size={20} className="text-dark-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-white">Artha AI Assistant</h2>
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Prototype
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Select a mode below to customize how Artha AI processes your queries
                </p>
              </div>
            </div>

            <button 
              onClick={handleReset} 
              title="Reset Chat"
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Interactive Mode Toggle Selector */}
          <div className="px-6 py-3.5 bg-dark-950/60 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Assistant Focus:</span>
            <div className="flex bg-dark-900/90 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => handleModeChange('general')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 select-none ${
                  mode === 'general'
                    ? 'bg-gradient-gold text-dark-900 font-semibold shadow-gold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle size={14} /> General Finance AI
              </button>
              <button
                onClick={() => handleModeChange('dashboard')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 select-none ${
                  mode === 'dashboard'
                    ? 'bg-gradient-gold text-dark-900 font-semibold shadow-gold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bot size={14} /> Local Dashboard AI
              </button>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.sender === 'user' 
                    ? 'bg-dark-700 border border-white/10 text-gold-400' 
                    : 'bg-gold-500/10 border border-gold-500/20 text-gold-400'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-dark-800/60 border-white/10 rounded-tr-none text-gray-200'
                      : 'bg-dark-900/60 border-gold-500/10 rounded-tl-none shadow-gold/5'
                  }`}>
                    {formatMessageText(msg.text)}
                  </div>

                  {/* Inline Metrics */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1.5">
                      {msg.metrics.map((metric, mIdx) => (
                        <div key={mIdx} className="glass-card px-3.5 py-2.5 border-white/5">
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-500">{metric.label}</span>
                          <span className={`text-sm font-semibold mt-0.5 block ${
                            metric.status === 'success' ? 'text-emerald-400' :
                            metric.status === 'warning' ? 'text-amber-400' :
                            metric.status === 'error' ? 'text-red-400' : 'text-gold-400'
                          }`}>
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-gold-500/10 border border-gold-500/20 text-gold-400">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-dark-900/60 border border-gold-500/10 rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-6 py-2 bg-dark-950/40 border-t border-white/5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1.5 whitespace-nowrap">
              {activeChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/5 bg-white/5 text-gray-300 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all duration-300 flex items-center gap-1"
                >
                  {chip} <ArrowRight size={10} />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-4 bg-dark-900/60 border-t border-white/5 z-10">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-3 items-center relative"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  mode === 'general'
                    ? "Ask about Rule of 72, compounding, direct mutual funds, index funds, 80C deductions..."
                    : "Ask to analyze your investments, check credit score details, or audit savings rate..."
                }
                className="input-field pr-12 text-sm py-3.5 bg-dark-950/60"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-2.5 rounded-lg bg-gradient-gold text-dark-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center hover:scale-105"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatbotDemo;
