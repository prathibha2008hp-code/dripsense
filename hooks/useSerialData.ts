import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProcessedSample,
  RawSensorData,
  CalibrationOffsets,
  ConnectionStatus,
  AlertEvent,
} from '../types/sensor';
import { DASHBOARD_CONFIG } from '../config/sensors';
import {
  applyCalibration,
  processRawSample,
  RingBuffer,
  calculateMagnitude,
} from '../lib/math';
import { parseCsvLine, createLineBreakTransformer } from '../lib/parser';

export interface UseSerialDataReturn {
  status: ConnectionStatus;
  statusMessage: string;
  isSupported: boolean;
  sampleRateHz: number;
  latestSample: ProcessedSample | null;
  samples: ProcessedSample[];
  alerts: AlertEvent[];
  offsets: CalibrationOffsets;
  isPaused: boolean;
  isDemoMode: boolean;
  shakeThreshold: number;
  freefallThreshold: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  toggleDemoMode: () => void;
  togglePause: () => void;
  clearData: () => void;
  calibrateZero: () => void;
  resetCalibration: () => void;
  setShakeThreshold: (val: number) => void;
  setFreefallThreshold: (val: number) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
}

const DEFAULT_OFFSETS: CalibrationOffsets = {
  ax: 0,
  ay: 0,
  az: 0,
  gx: 0,
  gy: 0,
  gz: 0,
  temp: 0,
};

export function useSerialData(): UseSerialDataReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to connect');
  const [sampleRateHz, setSampleRateHz] = useState<number>(0);
  const [latestSample, setLatestSample] = useState<ProcessedSample | null>(null);
  const [samples, setSamples] = useState<ProcessedSample[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [offsets, setOffsets] = useState<CalibrationOffsets>(DEFAULT_OFFSETS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [shakeThreshold, setShakeThreshold] = useState<number>(
    DASHBOARD_CONFIG.alertThresholds.shakeAccel
  );
  const [freefallThreshold, setFreefallThreshold] = useState<number>(
    DASHBOARD_CONFIG.alertThresholds.freefallAccel
  );

  const isSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  // Refs for high-throughput buffering without triggering re-renders
  const ringBufferRef = useRef<RingBuffer<ProcessedSample>>(
    new RingBuffer<ProcessedSample>(DASHBOARD_CONFIG.ringBufferSize)
  );
  const startTimeRef = useRef<number>(Date.now());
  const offsetsRef = useRef<CalibrationOffsets>(DEFAULT_OFFSETS);
  const isPausedRef = useRef<boolean>(false);
  const shakeThresholdRef = useRef<number>(shakeThreshold);
  const freefallThresholdRef = useRef<number>(freefallThreshold);

  // Serial port connection handles
  const portRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const keepReadingRef = useRef<boolean>(false);

  // Rates and throttling
  const sampleCounterRef = useRef<number>(0);
  const lastSampleTimeRef = useRef<number>(Date.now());
  const pendingLatestRef = useRef<ProcessedSample | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const demoIntervalRef = useRef<any>(null);

  // Sync refs with state
  useEffect(() => {
    offsetsRef.current = offsets;
  }, [offsets]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    shakeThresholdRef.current = shakeThreshold;
  }, [shakeThreshold]);

  useEffect(() => {
    freefallThresholdRef.current = freefallThreshold;
  }, [freefallThreshold]);

  // Alert generation helper
  const addAlert = useCallback(
    (
      type: AlertEvent['type'],
      title: string,
      message: string,
      severity: AlertEvent['severity'] = 'warning',
      value?: number
    ) => {
      const now = Date.now();
      const timeString = new Date(now).toTimeString().split(' ')[0];
      const newAlert: AlertEvent = {
        id: `${now}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: now,
        timeString,
        type,
        severity,
        title,
        message,
        value,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 49)]); // keep max 50 alerts
    },
    []
  );

  // Core ingestion of parsed raw data
  const handleIncomingRawData = useCallback(
    (raw: RawSensorData) => {
      if (isPausedRef.current) return;

      sampleCounterRef.current++;
      const now = Date.now();
      const calibrated = applyCalibration(raw, offsetsRef.current);
      const processed = processRawSample(calibrated, now, startTimeRef.current);

      // Check alerts
      const mag = processed.accelMagnitude;
      if (mag >= shakeThresholdRef.current) {
        addAlert(
          'shake',
          'Vibration / Shake Detected',
          `Acceleration spiked to ${mag.toFixed(1)} m/s²`,
          'critical',
          mag
        );
      } else if (mag <= freefallThresholdRef.current) {
        addAlert(
          'free-fall',
          'Free-Fall Detected',
          `Low-G event detected: ${mag.toFixed(2)} m/s²`,
          'warning',
          mag
        );
      }

      ringBufferRef.current.push(processed);
      pendingLatestRef.current = processed;
    },
    [addAlert]
  );

  // UI Throttle: update React state at ~20 FPS via requestAnimationFrame
  useEffect(() => {
    let lastRenderTime = 0;
    const intervalMs = 1000 / DASHBOARD_CONFIG.uiThrottleFps;

    const tick = (time: number) => {
      if (time - lastRenderTime >= intervalMs) {
        lastRenderTime = time;
        if (pendingLatestRef.current) {
          setLatestSample(pendingLatestRef.current);
          setSamples(ringBufferRef.current.toArray());
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Sample Rate (Hz) calculator every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSec = (now - lastSampleTimeRef.current) / 1000;
      if (elapsedSec > 0) {
        const hz = Math.round(sampleCounterRef.current / elapsedSec);
        setSampleRateHz(hz);
      }
      sampleCounterRef.current = 0;
      lastSampleTimeRef.current = now;
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Web Serial: Connect
  const connect = useCallback(async () => {
    if (!isSupported) {
      setStatus('error');
      setStatusMessage('Web Serial API is not supported in this browser. Please use Google Chrome, Edge, or Opera on desktop.');
      return;
    }

    try {
      setStatus('connecting');
      setStatusMessage('Requesting serial port authorization...');

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: DASHBOARD_CONFIG.defaultBaudRate });

      portRef.current = port;
      keepReadingRef.current = true;
      setStatus('connected');
      setStatusMessage(`Connected at ${DASHBOARD_CONFIG.defaultBaudRate} baud`);
      startTimeRef.current = Date.now();

      addAlert('connection', 'Device Connected', 'ESP32 serial connection established', 'info');

      // Setup TextDecoder and Line transformer streams
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const lineTransformer = createLineBreakTransformer();
      const linesStream = textDecoder.readable.pipeThrough(lineTransformer);

      const reader = linesStream.getReader();
      readerRef.current = reader;

      // Read loop
      (async () => {
        try {
          while (keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              const parsed = parseCsvLine(value);
              if (parsed) {
                handleIncomingRawData(parsed);
              }
            }
          }
        } catch (err: any) {
          if (keepReadingRef.current) {
            console.error('Serial read error:', err);
            setStatus('error');
            setStatusMessage(`Stream read error: ${err.message || 'Device disconnected'}`);
            addAlert('connection', 'Device Disconnected', 'Serial port stream interrupted', 'critical');
          }
        } finally {
          reader.releaseLock();
        }
      })();
    } catch (err: any) {
      console.warn('Port connection failed:', err);
      setStatus('disconnected');
      if (err.name === 'NotFoundError') {
        setStatusMessage('Port selection cancelled by user');
      } else if (err.name === 'SecurityError') {
        setStatusMessage('Serial access denied by browser security policy');
      } else if (err.name === 'InvalidStateError') {
        setStatusMessage('Port is already open or in use by another application');
      } else {
        setStatusMessage(`Connection failed: ${err.message || 'Unknown error'}`);
      }
    }
  }, [isSupported, handleIncomingRawData, addAlert]);

  // Web Serial: Disconnect
  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (err) {
      console.warn('Error during disconnect:', err);
    } finally {
      setStatus('disconnected');
      setStatusMessage('Device disconnected');
      setSampleRateHz(0);
      addAlert('connection', 'Disconnected', 'Serial port closed', 'info');
    }
  }, [addAlert]);

  // Reconnect
  const reconnect = useCallback(async () => {
    await disconnect();
    await new Promise((r) => setTimeout(r, 300));
    await connect();
  }, [disconnect, connect]);

  // Demo Simulation Mode (smooth tilting motion + noise, |a| around 9.8)
  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      if (next) {
        // Disconnect serial if active
        if (portRef.current) {
          disconnect();
        }
        setStatus('demo');
        setStatusMessage('Demo Mode: Simulating ESP32 + MPU6050 motion');
        startTimeRef.current = Date.now();
        addAlert('connection', 'Demo Mode Active', 'Synthesizing realistic 6-axis IMU telemetry', 'info');

        let t = 0;
        demoIntervalRef.current = setInterval(() => {
          t += 0.05;
          // Smooth compound sinusoidal angles
          const rollRad = Math.sin(t * 1.2) * 0.45 + Math.cos(t * 0.7) * 0.15;
          const pitchRad = Math.cos(t * 0.9) * 0.35 + Math.sin(t * 1.5) * 0.1;

          // Accelerometer with gravity vector projection:
          // ax = -g * sin(pitch)
          // ay = g * sin(roll) * cos(pitch)
          // az = g * cos(roll) * cos(pitch)
          const g = 9.806;
          const noise = () => (Math.random() - 0.5) * 0.08;

          const ax = -g * Math.sin(pitchRad) + noise();
          const ay = g * Math.sin(rollRad) * Math.cos(pitchRad) + noise();
          const az = g * Math.cos(rollRad) * Math.cos(pitchRad) + noise();

          // Gyroscope angular rates (derivatives plus vibration noise)
          const gx = Math.cos(t * 1.2) * 0.54 + (Math.random() - 0.5) * 0.02;
          const gy = -Math.sin(t * 0.9) * 0.315 + (Math.random() - 0.5) * 0.02;
          const gz = Math.sin(t * 0.5) * 0.12 + (Math.random() - 0.5) * 0.01;

          // Realistic chip temperature with gentle slow thermal drift around 28.5°C
          const temp = 28.5 + Math.sin(t * 0.05) * 1.2 + (Math.random() - 0.5) * 0.05;

          handleIncomingRawData({ ax, ay, az, gx, gy, gz, temp });
        }, 50); // 20 Hz generation (every 50 ms as requested)
      } else {
        if (demoIntervalRef.current) {
          clearInterval(demoIntervalRef.current);
          demoIntervalRef.current = null;
        }
        setStatus('disconnected');
        setStatusMessage('Demo Mode stopped');
        setSampleRateHz(0);
      }
      return next;
    });
  }, [disconnect, handleIncomingRawData, addAlert]);

  // Clean up demo timer on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  // Controls
  const togglePause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const clearData = useCallback(() => {
    ringBufferRef.current.clear();
    setSamples([]);
    setLatestSample(null);
  }, []);

  // Calibration: Zero offsets
  const calibrateZero = useCallback(() => {
    if (!latestSample) {
      alert('Cannot calibrate: No sensor data received yet.');
      return;
    }
    // Expected at level rest: ax=0, ay=0, az=9.80665 m/s², gx=0, gy=0, gz=0
    // We calibrate ax, ay, gx, gy, gz to 0, and az offset so az becomes ~9.81
    const newOffsets: CalibrationOffsets = {
      ax: (offsetsRef.current.ax || 0) + latestSample.ax,
      ay: (offsetsRef.current.ay || 0) + latestSample.ay,
      az: (offsetsRef.current.az || 0) + (latestSample.az - 9.80665),
      gx: (offsetsRef.current.gx || 0) + latestSample.gx,
      gy: (offsetsRef.current.gy || 0) + latestSample.gy,
      gz: (offsetsRef.current.gz || 0) + latestSample.gz,
      temp: 0,
    };
    setOffsets(newOffsets);
    addAlert(
      'calibration',
      'Zero Calibration Applied',
      'Current sensor bias stored and subtracted from live feed',
      'info'
    );
  }, [latestSample, addAlert]);

  const resetCalibration = useCallback(() => {
    setOffsets(DEFAULT_OFFSETS);
    addAlert(
      'calibration',
      'Calibration Reset',
      'Sensor offsets restored to factory raw baseline',
      'info'
    );
  }, [addAlert]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
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
  };
}
