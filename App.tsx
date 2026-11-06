import React, { useState, useEffect } from 'react';
import { useSerialData } from './hooks/useSerialData';
import { Header } from './components/Header';
import { KpiGrid } from './components/KpiGrid';
import { OrientationCube } from './components/OrientationCube';
import { ChartsGrid } from './components/ChartsGrid';
import { ControlsBar } from './components/ControlsBar';
import { AlertsPanel } from './components/AlertsPanel';
import { ToastContainer } from './components/ToastContainer';
import { CalibrationModal } from './components/CalibrationModal';
import { Esp32GuideModal } from './components/Esp32GuideModal';
import { exportSamplesToCsv } from './lib/exportCsv';
import { DASHBOARD_CONFIG } from './config/sensors';

export const App: React.FC = () => {
  const {
    status,
    statusMessage,
    isSupported,
    sampleRateHz,
    latestSample,
    samples,
    alerts,
    offsets,
    isPaused,
    isDemoMode,
    shakeThreshold,
    freefallThreshold,
    connect,
    disconnect,
    reconnect,
    toggleDemoMode,
    togglePause,
    clearData,
    calibrateZero,
    resetCalibration,
    setShakeThreshold,
    setFreefallThreshold,
    dismissAlert,
    clearAlerts,
  } = useSerialData();

  const [timeWindowSec, setTimeWindowSec] = useState<number>(
    DASHBOARD_CONFIG.defaultTimeWindowSec
  );
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Auto-launch demo mode on first load if Web Serial is not active
  // so the dashboard immediately renders live dynamic motion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'disconnected') {
        toggleDemoMode();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleExportCsv = () => {
    exportSamplesToCsv(samples);
  };

  const roll = latestSample?.roll ?? 0;
  const pitch = latestSample?.pitch ?? 0;

  return (
    <div className="min-h-screen bg-[#0b1020] text-[#e8ecf8] flex flex-col font-sans selection:bg-[#4cc9f0]/30 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        status={status}
        statusMessage={statusMessage}
        isSupported={isSupported}
        sampleRateHz={sampleRateHz}
        isDemoMode={isDemoMode}
        onConnect={connect}
        onDisconnect={disconnect}
        onReconnect={reconnect}
        onToggleDemo={toggleDemoMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* KPI Cards Row (4 Columns on Desktop) */}
        <KpiGrid latestSample={latestSample} history={samples} />

        {/* Global Controls & Actions Bar */}
        <ControlsBar
          isPaused={isPaused}
          onTogglePause={togglePause}
          onClearData={clearData}
          timeWindowSec={timeWindowSec}
          onChangeTimeWindow={setTimeWindowSec}
          onExportCsv={handleExportCsv}
          onCalibrateZero={calibrateZero}
          onOpenCalibrationModal={() => setIsCalibrationOpen(true)}
          sampleCount={samples.length}
          offsets={offsets}
        />

        {/* Middle Section: 3D Orientation Cube + Alerts & Events Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 3D Orientation Cube (5 cols) */}
          <div className="lg:col-span-5">
            <OrientationCube roll={roll} pitch={pitch} />
          </div>

          {/* Real-time Alerts and Events Panel (7 cols) */}
          <div className="lg:col-span-7">
            <AlertsPanel
              alerts={alerts}
              shakeThreshold={shakeThreshold}
              freefallThreshold={freefallThreshold}
              onChangeShakeThreshold={setShakeThreshold}
              onChangeFreefallThreshold={setFreefallThreshold}
              onClearAlerts={clearAlerts}
            />
          </div>
        </div>

        {/* Lower Section: 4 Live Telemetry Charts (2x2 Grid) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#e8ecf8]">
                Real-Time Sensor Telemetry
              </h2>
              <p className="text-xs text-[#8a94b8]">
                Displaying last {timeWindowSec} seconds of streaming data
              </p>
            </div>
          </div>

          <ChartsGrid samples={samples} timeWindowSec={timeWindowSec} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-4 px-6 text-center text-xs text-[#8a94b8] bg-[#0b1020]/90">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MPU6050 Live Motion Dashboard · ESP32 Hardware Integration</span>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-[#4cc9f0] hover:underline"
            >
              ESP32 Firmware Sketch
            </button>
            <span className="text-slate-700">•</span>
            <span>Baud: 115200</span>
            <span className="text-slate-700">•</span>
            <span>Zero-Lag WebGL / CSS 3D</span>
          </div>
        </div>
      </footer>

      {/* Floating Alerts Toasts */}
      <ToastContainer alerts={alerts} onDismiss={dismissAlert} />

      {/* Modals */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        offsets={offsets}
        onCalibrateZero={calibrateZero}
        onResetCalibration={resetCalibration}
      />

      <Esp32GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export default App;
