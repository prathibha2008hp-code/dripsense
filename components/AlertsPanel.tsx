import React, { useState } from 'react';
import { AlertEvent } from '../types/sensor';
import {
  Bell,
  Zap,
  ArrowDownCircle,
  AlertTriangle,
  Info,
  Trash2,
  Sliders,
} from 'lucide-react';

interface AlertsPanelProps {
  alerts: AlertEvent[];
  shakeThreshold: number;
  freefallThreshold: number;
  onChangeShakeThreshold: (val: number) => void;
  onChangeFreefallThreshold: (val: number) => void;
  onClearAlerts: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  shakeThreshold,
  freefallThreshold,
  onChangeShakeThreshold,
  onChangeFreefallThreshold,
  onClearAlerts,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const getAlertIcon = (type: AlertEvent['type'], severity: AlertEvent['severity']) => {
    switch (type) {
      case 'shake':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'free-fall':
        return <ArrowDownCircle className="w-4 h-4 text-cyan-400" />;
      case 'high-temp':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: AlertEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-[#141b34] rounded-2xl p-5 border border-slate-800/80 shadow-lg shadow-black/20 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#f72585]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#e8ecf8]">Motion Event Log</h3>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f72585]/20 text-[#f72585] border border-[#f72585]/30">
                  {alerts.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8a94b8]">Shake, drop & threshold telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
              showConfig
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
            title="Configure Thresholds"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Thresholds</span>
          </button>

          {alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition"
              title="Clear Event Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Threshold Configuration Drawer */}
      {showConfig && (
        <div className="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Shake Threshold (|a|):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="12"
                max="30"
                step="0.5"
                value={shakeThreshold}
                onChange={(e) => onChangeShakeThreshold(Number(e.target.value))}
                className="w-24 accent-[#f72585]"
              />
              <span className="font-mono text-[#f72585] font-bold w-12 text-right">
                {shakeThreshold.toFixed(1)} m/s²
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Free-Fall Threshold (|a|):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="6"
                step="0.2"
                value={freefallThreshold}
                onChange={(e) => onChangeFreefallThreshold(Number(e.target.value))}
                className="w-24 accent-[#4cc9f0]"
              />
              <span className="font-mono text-[#4cc9f0] font-bold w-12 text-right">
                {freefallThreshold.toFixed(1)} m/s²
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Scrollable Feed */}
      <div className="h-[210px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 hover:bg-slate-900/90 transition"
            >
              <div className="mt-0.5 shrink-0">
                {getAlertIcon(alert.type, alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {alert.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {alert.timeString}
                  </span>
                </div>
                <p className="text-[11px] text-[#8a94b8] mt-0.5 leading-snug">
                  {alert.message}
                </p>
              </div>
              <span
                className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 rounded-xl bg-slate-900/20 border border-dashed border-slate-800">
            <Bell className="w-6 h-6 text-slate-700 mb-1" />
            <p className="text-xs text-slate-500 font-medium">No alerts recorded</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Shake the sensor or tilt rapidly to trigger alarms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
