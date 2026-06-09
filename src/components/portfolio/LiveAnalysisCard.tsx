import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Target, ArrowDownCircle, Minus } from 'lucide-react';
import { HoldingWithLiveData } from '../../types/finance';

interface LiveAnalysisCardProps {
  holdings: HoldingWithLiveData[];
  totalCurrentValue: number;
  totalInvestedValue: number;
}

type Signal = 'accumulate' | 'hold-caution' | 'trim' | 'average-down' | 'hold';

interface StockRecommendation {
  symbol: string;
  signal: Signal;
  label: string;
  reason: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

function getSignalConfig(signal: Signal) {
  switch (signal) {
    case 'accumulate':
      return {
        label: 'Accumulate',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        icon: <TrendingUp size={16} className="text-emerald-400" />,
      };
    case 'hold-caution':
      return {
        label: 'Hold with Caution',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        icon: <AlertTriangle size={16} className="text-amber-400" />,
      };
    case 'trim':
      return {
        label: 'Consider Trimming',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: <TrendingDown size={16} className="text-red-400" />,
      };
    case 'average-down':
      return {
        label: 'Averaging Opportunity',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        icon: <ArrowDownCircle size={16} className="text-blue-400" />,
      };
    case 'hold':
    default:
      return {
        label: 'Hold',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        icon: <Minus size={16} className="text-gray-400" />,
      };
  }
}

function analyzeHolding(
  holding: HoldingWithLiveData,
  totalCurrentValue: number,
  sectorAllocations: Record<string, number>
): StockRecommendation {
  const pnlPercent = holding.pnlPercent ?? 0;
  const currentValue = holding.currentValue ?? holding.investedValue;
  const allocationPercent = totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0;
  const sectorPercent = sectorAllocations[holding.sector] ?? 0;

  let signal: Signal = 'hold';
  let reason = '';

  // Priority 1: Single stock risk — too much in one stock
  if (allocationPercent > 20) {
    signal = 'trim';
    reason = `${holding.symbol} is ${allocationPercent.toFixed(1)}% of your portfolio — exceeds the 20% single-stock safety limit. Trim to reduce company-specific risk.`;
  }
  // Priority 2: Sector over-concentration with profit
  else if (sectorPercent > 40 && pnlPercent > 0) {
    signal = 'hold-caution';
    reason = `In profit (+${pnlPercent.toFixed(1)}%), but the ${holding.sector} sector is over-concentrated at ${sectorPercent.toFixed(0)}%. Consider rebalancing towards underweight sectors.`;
  }
  // Priority 3: Significant loss — averaging opportunity
  else if (pnlPercent < -10) {
    signal = 'average-down';
    reason = `Down ${pnlPercent.toFixed(1)}% from your cost basis. If fundamentals remain strong, this could be a DCA (Dollar Cost Averaging) opportunity to reduce average cost.`;
  }
  // Priority 4: Healthy profit, healthy allocation
  else if (pnlPercent > 5 && sectorPercent <= 40 && allocationPercent <= 20) {
    signal = 'accumulate';
    reason = `Performing well (+${pnlPercent.toFixed(1)}%) with healthy allocation (${allocationPercent.toFixed(1)}%). Safe to accumulate more if sector thesis holds.`;
  }
  // Default: hold
  else {
    signal = 'hold';
    reason = `Allocation of ${allocationPercent.toFixed(1)}% is balanced. P&L is ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%. No immediate action needed.`;
  }

  const config = getSignalConfig(signal);
  return {
    symbol: holding.symbol,
    signal,
    ...config,
    reason,
  };
}

function computeDiversificationScore(
  sectorAllocations: Record<string, number>,
  holdingAllocations: Record<string, number>
): number {
  const sectorCount = Object.keys(sectorAllocations).length;
  const maxSectorAlloc = Math.max(...Object.values(sectorAllocations), 0);
  const maxStockAlloc = Math.max(...Object.values(holdingAllocations), 0);

  // Score from 0-100
  let score = 100;

  // Penalize low sector count (want 4+ sectors)
  if (sectorCount < 2) score -= 40;
  else if (sectorCount < 3) score -= 25;
  else if (sectorCount < 4) score -= 10;

  // Penalize high sector concentration
  if (maxSectorAlloc > 50) score -= 30;
  else if (maxSectorAlloc > 40) score -= 15;
  else if (maxSectorAlloc > 30) score -= 5;

  // Penalize high single-stock concentration
  if (maxStockAlloc > 30) score -= 25;
  else if (maxStockAlloc > 20) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function getRiskLabel(score: number): { text: string; color: string } {
  if (score >= 75) return { text: 'Conservative', color: 'text-emerald-400' };
  if (score >= 50) return { text: 'Moderate', color: 'text-amber-400' };
  return { text: 'Aggressive', color: 'text-red-400' };
}

const LiveAnalysisCard: React.FC<LiveAnalysisCardProps> = ({
  holdings,
  totalCurrentValue,
  totalInvestedValue,
}) => {
  // Compute sector allocations
  const sectorAllocations: Record<string, number> = {};
  const holdingAllocations: Record<string, number> = {};

  holdings.forEach((h) => {
    const value = h.currentValue ?? h.investedValue;
    const pct = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
    sectorAllocations[h.sector] = (sectorAllocations[h.sector] || 0) + pct;
    holdingAllocations[h.symbol] = pct;
  });

  // Analyze each holding
  const recommendations = holdings.map((h) =>
    analyzeHolding(h, totalCurrentValue, sectorAllocations)
  );

  // Overall metrics
  const diversificationScore = computeDiversificationScore(sectorAllocations, holdingAllocations);
  const riskLabel = getRiskLabel(diversificationScore);
  const overallPnlPercent =
    totalInvestedValue > 0
      ? ((totalCurrentValue - totalInvestedValue) / totalInvestedValue) * 100
      : 0;

  // Top 3 action items (prioritize trims, then cautions, then averaging)
  const priorityOrder: Signal[] = ['trim', 'hold-caution', 'average-down', 'accumulate', 'hold'];
  const actionItems = [...recommendations]
    .sort((a, b) => priorityOrder.indexOf(a.signal) - priorityOrder.indexOf(b.signal))
    .filter((r) => r.signal !== 'hold')
    .slice(0, 3);

  // Arc gauge path for diversification score
  const arcAngle = (diversificationScore / 100) * 180;
  const arcRad = (arcAngle * Math.PI) / 180;
  const arcRadius = 56;
  const arcX = 64 + arcRadius * Math.cos(Math.PI - arcRad);
  const arcY = 68 - arcRadius * Math.sin(Math.PI - arcRad);
  const largeArc = arcAngle > 90 ? 1 : 0;

  const arcColor =
    diversificationScore >= 75
      ? '#10b981'
      : diversificationScore >= 50
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Portfolio Health Overview */}
      <article
        className="glass-panel p-6 border-gold-500/20 relative overflow-hidden"
        aria-label="Portfolio health overview"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl" aria-hidden="true" />
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          <Target className="text-gold-400" aria-hidden="true" />
          Portfolio Health & Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Diversification Gauge */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Diversification
            </span>
            <svg viewBox="0 0 128 80" className="w-32 h-20">
              {/* Background arc */}
              <path
                d="M 8 68 A 56 56 0 0 1 120 68"
                fill="none"
                stroke="#ffffff08"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Active arc */}
              <path
                d={`M 8 68 A 56 56 0 ${largeArc} 1 ${arcX.toFixed(1)} ${arcY.toFixed(1)}`}
                fill="none"
                stroke={arcColor}
                strokeWidth="10"
                strokeLinecap="round"
                style={{
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
              <text
                x="64"
                y="62"
                textAnchor="middle"
                className="fill-white text-2xl font-bold"
                style={{ fontSize: '22px' }}
              >
                {diversificationScore}
              </text>
              <text
                x="64"
                y="76"
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: '8px' }}
              >
                out of 100
              </text>
            </svg>
          </div>

          {/* Risk Assessment */}
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Risk Profile
            </span>
            <span className={`text-2xl font-bold ${riskLabel.color}`}>{riskLabel.text}</span>
            <span className="text-xs text-gray-500">
              {Object.keys(sectorAllocations).length} sectors ·{' '}
              {holdings.length} stocks
            </span>
          </div>

          {/* Overall P&L */}
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Overall Return
            </span>
            <span
              className={`text-2xl font-bold ${overallPnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {overallPnlPercent >= 0 ? '+' : ''}
              {overallPnlPercent.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">
              {overallPnlPercent >= 0 ? 'Profitable portfolio' : 'Currently at a loss'}
            </span>
          </div>
        </div>
      </article>

      {/* Priority Action Items */}
      {actionItems.length > 0 && (
        <article
          className="glass-panel p-6"
          aria-label="Priority action items"
        >
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <ShieldCheck className="text-gold-400" size={20} aria-hidden="true" />
            Priority Actions
          </h3>
          <div className="space-y-3">
            {actionItems.map((item, idx) => (
              <div
                key={item.symbol}
                className={`flex items-start gap-3 p-4 rounded-xl border ${item.bgColor} ${item.borderColor}`}
              >
                <span className="mt-0.5 flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                    <span className={`font-semibold ${item.color}`}>
                      {item.symbol}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${item.bgColor} ${item.color} border ${item.borderColor}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* Per-Stock Signals */}
      <article
        className="glass-panel p-6"
        aria-label="Per stock recommendation signals"
      >
        <h3 className="text-lg font-semibold mb-4 text-white">
          Stock-Level Signals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.map((rec) => {
            const config = getSignalConfig(rec.signal);
            return (
              <div
                key={rec.symbol}
                className={`p-3 rounded-xl border ${config.bgColor} ${config.borderColor} flex items-center gap-3 transition-all hover:scale-[1.02]`}
              >
                <span className="flex-shrink-0">{config.icon}</span>
                <div className="min-w-0">
                  <span className="font-semibold text-white text-sm block">
                    {rec.symbol}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
};

export default LiveAnalysisCard;
