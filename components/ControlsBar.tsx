import React from 'react';
import {
  Play,
  Pause,
  Trash2,
  Download,
  Crosshair,
  Clock,
  Database,
  Sliders,
} from 'lucide-react';
import { CalibrationOffsets } from '../types/sensor';

interface ControlsBarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onClearData: () => void;
  timeWindowSec: number;
  onChangeTimeWindow: (sec: number) => void;
  onExportCsv: () => void;
  onCalibrateZero: () => void;
  onOpenCalibrationModal: () => void;
  sampleCount: number;
  offsets: CalibrationOffsets;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPaused,
  onTogglePause,
  onClearData,
  timeWindowSec,
  onChangeTimeWindow,
  onExportCsv,
  onCalibrateZero,
  onOpenCalibrationModal,
  sampleCount,
  offsets,
}) => {
  const isCalibrated =
    offsets.ax !== 0 ||
    offsets.ay !== 0 ||
    offsets.az !== 0 ||
    offsets.gx !== 0 ||
    offsets.gy !== 0 ||
    offsets.gz !== 0;

  return (
    <div className="bg-[#141b34] rounded-2xl p-3 sm:p-4 border border-slate-800/80 shadow-md flex flex-wrap items-center justify-between gap-3 w-full">
      {/* Left: Stream Flow Controls */}
      <div className="flex items-center gap-2">
        {/* Pause / Resume */}
        <button
          onClick={onTogglePause}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title={isPaused ? 'Resume stream' : 'Pause stream'}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Resume Stream</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-slate-400" />
              <span>Pause Stream</span>
            </>
          )}
        </button>

        {/* Clear Data */}
        <button
          onClick={onClearData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
          title="Clear buffer memory"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Clear Data</span>
        </button>

        {/* Buffer Count Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>{sampleCount} samples</span>
        </div>
      </div>

      {/* Center: Time-window selector (10s / 30s / 60s) */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#4cc9f0]" />
          <span>Window:</span>
        </span>
        {[10, 30, 60].map((sec) => (
          <button
            key={sec}
            onClick={() => onChangeTimeWindow(sec)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              timeWindowSec === sec
                ? 'bg-[#4cc9f0] text-[#0b1020] shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Right: Calibration and Export */}
      <div className="flex items-center gap-2">
        {/* Zero / Calibrate Button */}
        <button
          onClick={onCalibrateZero}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isCalibrated
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Zero sensor readings to current orientation"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#4cc9f0]" />
          <span>{isCalibrated ? 'Zeroed (Active)' : 'Zero / Calibrate'}</span>
        </button>

        {/* Calibration Settings */}
        <button
          onClick={onOpenCalibrationModal}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition"
          title="Fine-tune sensor offsets"
        >
          <Sliders className="w-4 h-4 text-slate-300" />
        </button>

        {/* Export CSV Button */}
        <button
          onClick={onExportCsv}
          disabled={sampleCount === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#b8f34c]/15 hover:bg-[#b8f34c]/25 text-[#b8f34c] border border-[#b8f34c]/40 transition disabled:opacity-40"
          title="Export buffered records to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
};
