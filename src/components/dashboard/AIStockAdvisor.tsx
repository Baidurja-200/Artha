import React from 'react';
import { Bot, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

const AIStockAdvisor = () => {
  return (
    <div className="glass-card p-6 h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-dark-900 to-gold-900/10 border-gold-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div>
        <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-6">
          <Bot className="text-gold-400 w-6 h-6" />
        </div>
        
        <h3 className="heading-3 mb-2 flex items-center gap-2">
          Ask Artha AI <Sparkles size={16} className="text-gold-400" />
        </h3>
        
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          Wondering which stocks to invest in? Chat with your personalized financial AI to get fundamental analysis, sector trends, and long-term investment ideas based on the Indian market.
        </p>

        <div className="space-y-3 mb-8">
          <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5 text-xs text-gray-300 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-400" /> "What are the best blue-chip stocks right now?"
          </div>
          <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5 text-xs text-gray-300 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-400" /> "Analyze ITC vs Reliance for long-term."
          </div>
        </div>
      </div>

      <a 
        href="https://chatgpt.com/g/g-h3p4eYl9e-artha" 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center gap-2 group"
      >
        Chat with Artha AI <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default AIStockAdvisor;
