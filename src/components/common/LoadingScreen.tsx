import React from 'react';

const LoadingScreen = () => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-950/80 backdrop-blur-xl animate-fade-in"
      role="progressbar"
      aria-label="Loading wealth dashboard"
      aria-live="polite"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gold-500/10 blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-[100px] animate-pulse-slow pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated Custom Ring Spinner */}
        <div className="relative w-20 h-20">
          {/* Static gold gradient outer track */}
          <div className="absolute inset-0 rounded-full border-2 border-white/5" />
          {/* Spinning segment */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-400 border-r-gold-500/80 animate-spin" />
          
          {/* Small inner gold glowing particle */}
          <div className="absolute inset-2 rounded-full bg-dark-900 border border-gold-500/10 flex items-center justify-center shadow-gold">
            <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">Artha</span>
          </div>
        </div>

        {/* Shimmer Text */}
        <div className="text-center space-y-1">
          <h2 className="font-display text-lg font-semibold text-white tracking-wide">
            Syncing Financial Engine
          </h2>
          <p className="text-xs text-gray-500 tracking-wider">
            Optimizing your wealth experience...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
