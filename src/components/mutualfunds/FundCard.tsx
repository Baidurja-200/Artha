import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldAlert, ChevronRight, HelpCircle, Calendar, Shield } from 'lucide-react';
import { useMutualFunds } from '../../hooks/useMutualFunds';
import { getFundInsights } from '../../fund-engine/fundInsights';

const FundCard = ({ fund }) => {
  const { getFundDetails } = useMutualFunds();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch detailed info to show 3Y CAGR and current NAV
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      const data = await getFundDetails(fund.schemeCode);
      if (isMounted && data) {
        setDetails(data);
      }
      if (isMounted) setLoading(false);
    };
    fetchDetails();
    return () => { isMounted = false; };
  }, [fund.schemeCode, getFundDetails]);

  const insights = getFundInsights(fund.schemeCode, fund.schemeName);

  const riskColors = {
    'Low': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Moderate': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'High': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    'Very High': 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const riskStyle = riskColors[fund.risk] || riskColors['High'];

  return (
    <Link to={`/mutual-funds/${fund.schemeCode}`} className="block h-full">
      <div className="glass-card p-5 hover:bg-dark-800/80 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] group h-full flex flex-col justify-between border-t-2 border-t-transparent hover:border-t-gold-500">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-dark-700 text-gray-300">
              {fund.category}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${riskStyle}`}>
              {fund.risk} Risk
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-1 line-clamp-2 leading-snug group-hover:text-gold-400 transition-colors">
              {fund.schemeName}
            </h3>
            <p className="text-xs text-gray-500 truncate">{fund.type} • {fund.aum} AUM</p>
          </div>

          {/* Explainable Decision Intelligence Layer */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2 text-xs">
            <div className="text-gray-300 leading-relaxed font-medium">
              🎯 <span className="text-white">Best For:</span> {insights.bestFor}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-white/5 pt-2">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-gold-400" /> Horizon: <strong>{insights.idealHorizon}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Shield size={12} className="text-gold-400" /> Volatility: <strong>{insights.expectedVolatility}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-end justify-between mt-4">
          {loading ? (
            <div className="animate-pulse flex gap-4 w-full">
              <div className="h-8 w-16 bg-dark-700 rounded"></div>
              <div className="h-8 w-16 bg-dark-700 rounded"></div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">3Y CAGR</p>
                <div className={`text-lg font-bold flex items-center gap-1 ${details?.cagr3Y > 0 ? 'text-green-400' : 'text-gray-300'}`}>
                  {details?.cagr3Y !== 'N/A' ? `${details?.cagr3Y}%` : 'N/A'}
                  {details?.cagr3Y > 0 && <TrendingUp size={14} />}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">NAV</p>
                <div className="text-lg font-bold text-white">
                  ₹{parseFloat(details?.currentNav || 0).toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FundCard;
