import React, { useMemo } from 'react';
import { ChartGroupConfig, ProcessedSample } from '../types/sensor';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';

interface SensorChartProps {
  config: ChartGroupConfig;
  samples: ProcessedSample[];
  timeWindowSec: number;
}

export const SensorChart: React.FC<SensorChartProps> = ({
  config,
  samples,
  timeWindowSec,
}) => {
  // Filter samples to requested time window
  const chartData = useMemo(() => {
    if (!samples.length) return [];
    const latestTime = samples[samples.length - 1].timestamp;
    const windowStart = latestTime - timeWindowSec * 1000;
    return samples.filter((s) => s.timestamp >= windowStart);
  }, [samples, timeWindowSec]);

  // Current values readout
  const latest = samples[samples.length - 1];

  return (
    <div className="bg-[#141b34] rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-lg shadow-black/20 flex flex-col justify-between h-[340px]">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#e8ecf8]">
              {config.title}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-[#8a94b8] border border-slate-700/50">
              {config.yAxisUnit}
            </span>
          </div>
          <p className="text-xs text-[#8a94b8]">{config.subtitle}</p>
        </div>

        {/* Live Channel Values in Header */}
        <div className="flex items-center gap-2.5">
          {config.channels.map((ch) => {
            const val = latest ? (latest[ch.key] as number) : undefined;
            return (
              <div
                key={ch.key}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ch.color }}
                />
                <span className="text-[11px] font-medium text-slate-300">
                  {ch.label}:
                </span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: ch.color }}
                >
                  {val !== undefined ? val.toFixed(ch.formatPrecision) : '--'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="flex-1 w-full relative min-h-[220px]">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="relTimeSec"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(sec) => `${sec.toFixed(0)}s`}
                domain={['auto', 'auto']}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                unit={` ${config.yAxisUnit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1020',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#8a94b8', marginBottom: '4px' }}
                labelFormatter={(value) => `Elapsed: ${Number(value).toFixed(2)}s`}
                formatter={(val: any, name: any) => [
                  `${Number(val).toFixed(2)} ${config.yAxisUnit}`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={24}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '11px',
                  paddingTop: '6px',
                  color: '#8a94b8',
                }}
              />
              {config.channels.map((ch) => (
                <Line
                  key={ch.key}
                  type="monotone"
                  dataKey={ch.key}
                  name={ch.label}
                  stroke={ch.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false} // Crucial for zero-lag streaming
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-[#0b1020]/40 border border-dashed border-slate-800">
            <Activity className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
            <p className="text-xs font-medium text-slate-500">
              Waiting for data stream...
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Connect device via Web Serial or toggle Demo Mode
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
