import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ShieldCheck, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import { generateAssistantResponse, AssistantResponse } from '../services/assistantEngine';
import SubNav from '../components/common/SubNav';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  metrics?: AssistantResponse['metrics'];
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: `Hello! I am **Artha AI**, your local-first personal financial assistant. I analyze your profile data directly in the browser to give you safe, private, and actionable advisory tips.\n\nHere are some things you can ask me about:\n\n1. **Credit Health**: *"How is my credit score?"*, *"List my EMIs"*, or *"Analyze credit card utilization"*.\n2. **Investment & Portfolio**: *"Audit my investments"*, *"Am I saving enough?"*, or *"Check my goals status"*.\n3. **Budget & Cash Flow**: *"How much did I spend this month?"*, *"What is my savings rate?"*, or *"Scan my subscriptions"*.\n4. **Tax Planner**: *"How to save tax?"*, *"What is my tax slab?"*, or *"Calculate remaining 80C limits"*.\n5. **Reward Audit**: *"Scan for reward leakage"* or *"How to optimize my points"*.\n\nWhat would you like to review first?`,
      timestamp: new Date(),
      metrics: [
        { label: 'Privacy Protocol', value: 'Local-Only', status: 'success' },
        { label: 'Advisory Level', value: 'Advisor-Grade', status: 'info' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    'Analyze my credit health',
    'Audit my investments',
    'Am I spending too much?',
    'Scan for reward leakage',
    'How can I save tax?'
  ];

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

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAssistantResponse(text);
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date(),
        metrics: response.metrics
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 850);
  };

  const handleReset = () => {
    if (window.confirm('Do you want to clear your current conversation?')) {
      setMessages([
        {
          id: 'init',
          sender: 'assistant',
          text: `Hello! I am **Artha AI**, your local-first personal financial assistant. I analyze your profile data directly in the browser to give you safe, private, and actionable advisory tips.\n\nHere are some things you can ask me about:\n\n1. **Credit Health**: *"How is my credit score?"*, *"List my EMIs"*, or *"Analyze credit card utilization"*.\n2. **Investment & Portfolio**: *"Audit my investments"*, *"Am I saving enough?"*, or *"Check my goals status"*.\n3. **Budget & Cash Flow**: *"How much did I spend this month?"*, *"What is my savings rate?"*, or *"Scan my subscriptions"*.\n4. **Tax Planner**: *"How to save tax?"*, *"What is my tax slab?"*, or *"Calculate remaining 80C limits"*.\n5. **Reward Audit**: *"Scan for reward leakage"* or *"How to optimize my points"*.\n\nWhat would you like to review first?`,
          timestamp: new Date(),
          metrics: [
            { label: 'Privacy Protocol', value: 'Local-Only', status: 'success' },
            { label: 'Advisory Level', value: 'Advisor-Grade', status: 'info' }
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

  // Helper to parse bold text **like this**
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
    <div className="min-h-screen bg-dark-950 text-white pb-12 pt-[72px]">
      <SubNav />
      
      <div className="container mx-auto px-6 max-w-5xl mt-6">
        {/* Assistant Panel */}
        <div className="glass-panel overflow-hidden flex flex-col h-[75vh] border-white/10 shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-4 bg-dark-900/80 border-b border-white/5 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <Sparkles size={20} className="text-dark-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-white">Artha AI Advisor</h2>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-gold-500" /> Fully Encrypted Browser Session
                </p>
              </div>
            </div>

            <button 
              onClick={handleReset} 
              title="Clear Conversation"
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Messages Feed */}
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

                {/* Bubble Wrapper */}
                <div className="space-y-2">
                  <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? 'bg-dark-800/60 border-white/10 rounded-tr-none text-gray-200'
                      : 'bg-dark-900/60 border-gold-500/10 rounded-tl-none shadow-gold/5'
                  }`}>
                    {formatMessageText(msg.text)}
                  </div>

                  {/* Inline Metrics Grid */}
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

            {/* AI Typing Indicator */}
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

          {/* Quick suggestions area */}
          <div className="px-6 py-2 bg-dark-950/40 border-t border-white/5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1.5 whitespace-nowrap">
              {suggestionChips.map((chip, idx) => (
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

          {/* Footer Input Area */}
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
                placeholder="Ask about your credit cards, asset allocation, monthly budget, or Section 80C..."
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

export default Assistant;
