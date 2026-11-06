import React from 'react';
import { CalibrationOffsets } from '../types/sensor';
import { Crosshair, RotateCcw, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  offsets: CalibrationOffsets;
  onCalibrateZero: () => void;
  onResetCalibration: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  offsets,
  onCalibrateZero,
  onResetCalibration,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141b34] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Crosshair className="w-5 h-5 text-[#4cc9f0]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#e8ecf8]">Sensor Zero & Bias Calibration</h2>
            <p className="text-xs text-[#8a94b8]">Eliminate stationary accelerometer and gyro drift</p>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 mb-4 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            Place your <strong>MPU6050</strong> perfectly flat and still on a level desk with the Z-axis facing upwards. Clicking <strong>Calibrate Level</strong> will store current biases and zero the tilt readings.
          </p>
        </div>

        {/* Current Bias Offsets Table */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Active Baseline Offsets
          </h4>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ ax</span>
              <span className="text-slate-200 font-bold">{offsets.ax.toFixed(3)} m/s²</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ ay</span>
              <span className="text-slate-200 font-bold">{offsets.ay.toFixed(3)} m/s²</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ az</span>
              <span className="text-slate-200 font-bold">{offsets.az.toFixed(3)} m/s²</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ gx</span>
              <span className="text-slate-200 font-bold">{offsets.gx.toFixed(4)} rad/s</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ gy</span>
              <span className="text-slate-200 font-bold">{offsets.gy.toFixed(4)} rad/s</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Δ gz</span>
              <span className="text-slate-200 font-bold">{offsets.gz.toFixed(4)} rad/s</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              onResetCalibration();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Offsets</span>
          </button>
          <button
            onClick={() => {
              onCalibrateZero();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] text-[#0b1020] font-bold shadow-md shadow-cyan-500/20 transition hover:opacity-95"
          >
            <CheckCircle2 className="w-4 h-4 text-[#0b1020]" />
            <span>Calibrate Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
