import { ChannelConfig, ChartGroupConfig, KpiCardConfig } from '../types/sensor';

/**
 * MPU6050 Sensor Channels Configuration.
 * The charts and KPI cards are generated dynamically from this configuration.
 * Adding or tweaking channels requires modifying only this file.
 */

export const SENSOR_CHANNELS: ChannelConfig[] = [
  // Accelerometer channels (m/s²)
  {
    key: 'ax',
    label: 'Accel X',
    unit: 'm/s²',
    color: '#4cc9f0', // Cyan
    chartGroup: 'accel',
    formatPrecision: 2,
  },
  {
    key: 'ay',
    label: 'Accel Y',
    unit: 'm/s²',
    color: '#f72585', // Pink
    chartGroup: 'accel',
    formatPrecision: 2,
  },
  {
    key: 'az',
    label: 'Accel Z',
    unit: 'm/s²',
    color: '#b8f34c', // Lime
    chartGroup: 'accel',
    formatPrecision: 2,
  },

  // Gyroscope channels (rad/s)
  {
    key: 'gx',
    label: 'Gyro X',
    unit: 'rad/s',
    color: '#4cc9f0',
    chartGroup: 'gyro',
    formatPrecision: 3,
  },
  {
    key: 'gy',
    label: 'Gyro Y',
    unit: 'rad/s',
    color: '#f72585',
    chartGroup: 'gyro',
    formatPrecision: 3,
  },
  {
    key: 'gz',
    label: 'Gyro Z',
    unit: 'rad/s',
    color: '#b8f34c',
    chartGroup: 'gyro',
    formatPrecision: 3,
  },

  // Orientation channels (degrees)
  {
    key: 'roll',
    label: 'Roll (φ)',
    unit: '°',
    color: '#4cc9f0',
    chartGroup: 'orientation',
    formatPrecision: 1,
  },
  {
    key: 'pitch',
    label: 'Pitch (θ)',
    unit: '°',
    color: '#f72585',
    chartGroup: 'orientation',
    formatPrecision: 1,
  },

  // Temperature channel (°C)
  {
    key: 'temp',
    label: 'Die Temp',
    unit: '°C',
    color: '#ffbe0b', // Amber/gold
    chartGroup: 'temp',
    formatPrecision: 1,
  },
];

export const CHART_GROUPS: ChartGroupConfig[] = [
  {
    id: 'accel',
    title: 'Accelerometer',
    subtitle: 'Tri-axis dynamic acceleration',
    channels: SENSOR_CHANNELS.filter((c) => c.chartGroup === 'accel'),
    yAxisUnit: 'm/s²',
  },
  {
    id: 'gyro',
    title: 'Gyroscope',
    subtitle: 'Angular velocity rates',
    channels: SENSOR_CHANNELS.filter((c) => c.chartGroup === 'gyro'),
    yAxisUnit: 'rad/s',
  },
  {
    id: 'orientation',
    title: 'Orientation',
    subtitle: 'Calculated Euler tilt angles',
    channels: SENSOR_CHANNELS.filter((c) => c.chartGroup === 'orientation'),
    yAxisUnit: '°',
  },
  {
    id: 'temp',
    title: 'MPU6050 Temperature',
    subtitle: 'On-chip thermal sensor',
    channels: SENSOR_CHANNELS.filter((c) => c.chartGroup === 'temp'),
    yAxisUnit: '°C',
  },
];

export const KPI_CARDS: KpiCardConfig[] = [
  {
    id: 'roll',
    key: 'roll',
    label: 'Roll Angle',
    unit: '°',
    color: '#4cc9f0',
    iconName: 'RotateCw',
    description: 'Lateral bank tilt',
    precision: 1,
  },
  {
    id: 'pitch',
    key: 'pitch',
    label: 'Pitch Angle',
    unit: '°',
    color: '#f72585',
    iconName: 'ArrowUpDown',
    description: 'Longitudinal elevation',
    precision: 1,
  },
  {
    id: 'accelMagnitude',
    key: 'accelMagnitude',
    label: 'Total Acceleration |a|',
    unit: 'm/s²',
    color: '#b8f34c',
    iconName: 'Activity',
    description: 'Gravity vector (1G ≈ 9.81)',
    precision: 2,
  },
  {
    id: 'temp',
    key: 'temp',
    label: 'Die Temperature',
    unit: '°C',
    color: '#ffbe0b',
    iconName: 'Thermometer',
    description: 'Internal temperature',
    precision: 1,
  },
];

export const DASHBOARD_CONFIG = {
  defaultBaudRate: 115200,
  ringBufferSize: 1000,
  uiThrottleFps: 20, // 20 UI renders per second max
  defaultTimeWindowSec: 30,
  alertThresholds: {
    shakeAccel: 18.0, // m/s² (about 1.8G)
    freefallAccel: 3.0, // m/s² (near-zero gravity)
    highTemp: 45.0, // °C
  },
};
