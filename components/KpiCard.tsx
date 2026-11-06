import React from 'react';
import { KpiCardConfig, ProcessedSample } from '../types/sensor';
import { RotateCw, ArrowUpDown, Activity, Thermometer, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  config: KpiCardConfig;
  value: number | undefined;
  history: ProcessedSample[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  RotateCw,
  ArrowUpDown,
  Activity,
  Thermometer,
};

export const KpiCard: React.FC<KpiCardProps> = ({ config, value, history }) => {
  const IconComponent = ICON_MAP[config.iconName] || Activity;
  const displayVal = value !== undefined ? value.toFixed(config.precision) : '--';

  // Compute sparkline points from history (last 30 samples)
  const sparklineData = history.slice(-30).map((s) => {
    const rawVal = s[config.key];
    return typeof rawVal === 'number' ? rawVal : 0;
  });

  const min = sparklineData.length ? Math.min(...sparklineData) : 0;
  const max = sparklineData.length ? Math.max(...sparklineData) : 1;
  const range = max - min || 1;

  // SVG dimensions
  const width = 110;
  const height = 36;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / Math.max(sparklineData.length - 1, 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="relative overflow-hidden bg-[#141b34] rounded-2xl p-4 sm:p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-lg shadow-black/20 flex flex-col justify-between">
      {/* Glow accent top highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
        }}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8a94b8]">
          {config.label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <IconComponent className="w-4 h-4" style={{ color: config.color }} />
        </div>
      </div>

      {/* Primary Value and Unit Row */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#e8ecf8] font-mono">
          {displayVal}
        </span>
        <span className="text-sm font-semibold text-[#8a94b8]">{config.unit}</span>
      </div>

      {/* Bottom Sparkline and Subtitle */}
      <div className="flex items-end justify-between pt-2 border-t border-slate-800/50">
        <span className="text-[11px] text-[#8a94b8] truncate max-w-[120px]">
          {config.description}
        </span>

        {/* Real-time SVG sparkline */}
        <div className="w-[110px] h-[36px] flex items-center justify-end">
          {sparklineData.length > 2 ? (
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                fill="none"
                stroke={config.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          ) : (
            <div className="text-[10px] font-mono text-slate-600">waiting...</div>
          )}
        </div>
      </div>
    </div>
  );
};
