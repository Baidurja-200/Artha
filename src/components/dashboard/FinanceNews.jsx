import React from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useFinanceNews } from '../../services/marketApi';

const FinanceNews = () => {
  const { data: newsArticles = [], isLoading: loading, error, refetch, isFetching } = useFinanceNews();

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="heading-3 flex items-center gap-2">
          <Newspaper className="text-blue-400" /> Live Finance News
        </h3>
        <button 
          onClick={() => refetch()} 
          className={`text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 ${isFetching ? 'animate-spin text-gold-400' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading && newsArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gold-500 gap-3 py-10">
            <RefreshCw className="animate-spin w-8 h-8" />
            <p className="text-sm font-medium">Fetching latest market updates...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 gap-3 py-10">
            <AlertTriangle className="w-8 h-8" />
            <p className="text-sm font-medium">Could not load news feed.</p>
          </div>
        ) : (
          newsArticles.map((article) => (
            <a 
              key={article.id} 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex gap-4 p-3 rounded-xl hover:bg-dark-800/80 transition-all border border-transparent hover:border-white/5 group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800 relative">
                <img 
                  src={article.image} 
                  alt="News thumbnail" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80";
                  }}
                />
              </div>
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                        {article.category}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {article.time}
                      </span>
                    </div>
                    <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                </div>
                <span className="text-xs text-gray-500 font-medium">{article.source}</span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default FinanceNews;
