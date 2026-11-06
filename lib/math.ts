import { CalibrationOffsets, ProcessedSample, RawSensorData } from '../types/sensor';

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Calculates Roll Euler angle (in degrees).
 * Roll = atan2(ay, az) * (180 / PI)
 */
export function calculateRoll(ay: number, az: number): number {
  return Math.atan2(ay, az) * RAD_TO_DEG;
}

/**
 * Calculates Pitch Euler angle (in degrees).
 * Pitch = atan2(-ax, sqrt(ay^2 + az^2)) * (180 / PI)
 */
export function calculatePitch(ax: number, ay: number, az: number): number {
  const normY = Math.sqrt(ay * ay + az * az);
  return Math.atan2(-ax, normY) * RAD_TO_DEG;
}

/**
 * Calculates total 3D acceleration vector magnitude: |a| = sqrt(ax^2 + ay^2 + az^2).
 */
export function calculateMagnitude(ax: number, ay: number, az: number): number {
  return Math.sqrt(ax * ax + ay * ay + az * az);
}

/**
 * Subtracts calibration offsets from raw readings.
 */
export function applyCalibration(
  raw: RawSensorData,
  offsets: CalibrationOffsets
): RawSensorData {
  return {
    ax: raw.ax - offsets.ax,
    ay: raw.ay - offsets.ay,
    az: raw.az - offsets.az,
    gx: raw.gx - offsets.gx,
    gy: raw.gy - offsets.gy,
    gz: raw.gz - offsets.gz,
    temp: raw.temp - offsets.temp,
  };
}

/**
 * Builds a full ProcessedSample from calibrated raw telemetry.
 */
export function processRawSample(
  calibrated: RawSensorData,
  timestamp: number = Date.now(),
  startTime: number = timestamp
): ProcessedSample {
  const roll = calculateRoll(calibrated.ay, calibrated.az);
  const pitch = calculatePitch(calibrated.ax, calibrated.ay, calibrated.az);
  const accelMagnitude = calculateMagnitude(calibrated.ax, calibrated.ay, calibrated.az);

  const date = new Date(timestamp);
  const timeFormatted = date.toTimeString().split(' ')[0] + '.' + String(date.getMilliseconds()).padStart(3, '0');
  const relTimeSec = (timestamp - startTime) / 1000;

  return {
    ...calibrated,
    timestamp,
    timeFormatted,
    relTimeSec,
    roll: Number(roll.toFixed(2)),
    pitch: Number(pitch.toFixed(2)),
    accelMagnitude: Number(accelMagnitude.toFixed(2)),
  };
}

/**
 * Fixed-size Ring Buffer implementation for high-throughput sensor telemetry.
 * Avoids array reallocation and memory growth.
 */
export class RingBuffer<T> {
  private buffer: Array<T | undefined>;
  private capacity: number;
  private head: number = 0;
  private size: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  public push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    }
  }

  public toArray(): T[] {
    const result: T[] = [];
    result.length = this.size;
    const start = (this.head - this.size + this.capacity) % this.capacity;
    for (let i = 0; i < this.size; i++) {
      const idx = (start + i) % this.capacity;
      result[i] = this.buffer[idx] as T;
    }
    return result;
  }

  public clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.size = 0;
  }

  public getSize(): number {
    return this.size;
  }

  public getCapacity(): number {
    return this.capacity;
  }
}
