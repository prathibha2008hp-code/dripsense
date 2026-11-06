import React from 'react';
import { AlertEvent } from '../types/sensor';
import { Zap, ArrowDownCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  alerts: AlertEvent[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ alerts, onDismiss }) => {
  // Only display the 3 most recent alerts within the last 6 seconds
  const recentAlerts = alerts.slice(0, 3);

  if (!recentAlerts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {recentAlerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-[#141b34]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl flex items-start gap-3 transform transition-all duration-300 animate-slide-up"
        >
          <div className="shrink-0 mt-0.5">
            {alert.type === 'shake' ? (
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
            ) : alert.type === 'free-fall' ? (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4 text-cyan-400" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Info className="w-4 h-4 text-amber-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100">{alert.title}</span>
              <span className="text-[10px] font-mono text-slate-500">{alert.timeString}</span>
            </div>
            <p className="text-xs text-[#8a94b8] mt-0.5">{alert.message}</p>
          </div>

          <button
            onClick={() => onDismiss(alert.id)}
            className="text-slate-500 hover:text-slate-300 transition p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
