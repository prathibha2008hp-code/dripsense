import React from 'react';
import { ConnectionStatus } from '../types/sensor';
import {
  Usb,
  Radio,
  Play,
  RotateCcw,
  Unplug,
  BookOpen,
  Activity,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  status: ConnectionStatus;
  statusMessage: string;
  isSupported: boolean;
  sampleRateHz: number;
  isDemoMode: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onToggleDemo: () => void;
  onOpenGuide: () => void;
  onOpenCalibration: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  statusMessage,
  isSupported,
  sampleRateHz,
  isDemoMode,
  onConnect,
  onDisconnect,
  onReconnect,
  onToggleDemo,
  onOpenGuide,
  onOpenCalibration,
}) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'demo':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'connecting':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse';
      case 'error':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'demo':
        return 'Demo Mode';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Port Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <header className="w-full bg-[#141b34]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: App Title and Subtitle */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4cc9f0] via-[#7209b7] to-[#f72585] p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b1020] rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#4cc9f0] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#e8ecf8]">
                  MPU6050 Live Motion
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-[#4cc9f0] border border-cyan-800/40">
                  Telemetry
                </span>
              </div>
              <p className="text-xs text-[#8a94b8] font-medium flex items-center gap-1.5">
                <span>ESP32 · 6-axis IMU</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span>115200 Baud</span>
              </p>
            </div>
          </div>

          {/* Mobile Status Badge */}
          <div className="md:hidden flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass()}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {getStatusLabel()}
            </span>
          </div>
        </div>

        {/* Center / Right: Status badges and action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          {/* Desktop Status Badge */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${getBadgeClass()}`}
              title={statusMessage}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {getStatusLabel()}
            </span>

            {/* Live Sample Rate */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-slate-900/60 border border-slate-800 text-[#b8f34c]"
              title="Incoming sensor frequency (Hz)"
            >
              <Activity className="w-3.5 h-3.5 text-[#b8f34c]" />
              <span>{sampleRateHz} Hz</span>
            </div>
          </div>

          {/* Quick Guides & Calibration buttons */}
          <button
            onClick={onOpenCalibration}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1a2344] hover:bg-[#232f5c] text-[#e8ecf8] border border-slate-700/60 transition shadow-sm"
            title="Configure Sensor Offsets & Zero Level"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4cc9f0]" />
            <span className="hidden sm:inline">Calibrate</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1a2344] hover:bg-[#232f5c] text-[#e8ecf8] border border-slate-700/60 transition shadow-sm"
            title="ESP32 Wiring and Arduino Firmware Sketch"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ffbe0b]" />
            <span className="hidden sm:inline">ESP32 Guide</span>
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemo}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#1a2344] text-[#8a94b8] border-slate-700 hover:text-white hover:bg-[#222e5a]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>{isDemoMode ? 'Stop Demo' : 'Demo Mode'}</span>
          </button>

          {/* Connection buttons */}
          {status === 'connected' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onReconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1a2344] hover:bg-[#222e5a] text-[#8a94b8] hover:text-white border border-slate-700 transition"
                title="Reconnect Port"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reconnect</span>
              </button>
              <button
                onClick={onDisconnect}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition shadow-sm"
              >
                <Unplug className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={status === 'connecting'}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#4cc9f0] to-[#4361ee] hover:opacity-95 text-[#0b1020] font-bold shadow-md shadow-cyan-500/25 transition disabled:opacity-50"
            >
              <Usb className="w-4 h-4 text-[#0b1020]" />
              <span>{status === 'connecting' ? 'Opening Port...' : 'Connect Device'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Browser compatibility warning banner */}
      {!isSupported && (
        <div className="mt-2.5 max-w-7xl mx-auto py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Web Serial API is unavailable:</strong> Direct USB COM port streaming requires
              Chrome, Edge, or Opera on desktop. You can use <strong>Demo Mode</strong> to test all
              visualizations and metrics right now!
            </span>
          </div>
          <button
            onClick={onToggleDemo}
            className="ml-3 underline font-semibold text-amber-300 hover:text-white whitespace-nowrap"
          >
            Launch Demo Mode
          </button>
        </div>
      )}
    </header>
  );
};
