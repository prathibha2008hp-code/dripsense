/**
 * Sensor and telemetry types for MPU6050 6-axis IMU Dashboard
 */

export interface RawSensorData {
  ax: number; // m/s^2
  ay: number; // m/s^2
  az: number; // m/s^2
  gx: number; // rad/s
  gy: number; // rad/s
  gz: number; // rad/s
  temp: number; // °C
}

export interface ProcessedSample extends RawSensorData {
  timestamp: number; // Unix timestamp in ms
  timeFormatted: string; // HH:mm:ss.SSS
  relTimeSec: number; // Relative seconds from start or buffer start
  roll: number; // Degrees (-180 to 180)
  pitch: number; // Degrees (-90 to 90)
  accelMagnitude: number; // |a| in m/s^2
}

export interface CalibrationOffsets {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  temp: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'demo' | 'error';

export interface AlertEvent {
  id: string;
  timestamp: number;
  timeString: string;
  type: 'shake' | 'free-fall' | 'high-temp' | 'connection' | 'calibration';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  value?: number;
}

export type ChartGroupKey = 'accel' | 'gyro' | 'orientation' | 'temp';

export interface ChannelConfig {
  key: keyof ProcessedSample;
  label: string;
  unit: string;
  color: string;
  chartGroup: ChartGroupKey;
  formatPrecision: number;
  minRange?: number;
  maxRange?: number;
}

export interface ChartGroupConfig {
  id: ChartGroupKey;
  title: string;
  subtitle: string;
  channels: ChannelConfig[];
  yAxisUnit: string;
  domain?: [number, number] | ['auto', 'auto'];
}

export interface KpiCardConfig {
  id: string;
  key: keyof ProcessedSample;
  label: string;
  unit: string;
  color: string;
  iconName: string;
  description: string;
  precision: number;
}
