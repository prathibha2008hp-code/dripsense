import { ProcessedSample } from '../types/sensor';

/**
 * Exports an array of ProcessedSample records to a downloadable CSV file.
 */
export function exportSamplesToCsv(
  samples: ProcessedSample[],
  filenamePrefix: string = 'mpu6050_telemetry'
): void {
  if (!samples.length) {
    alert('No telemetry data available to export.');
    return;
  }

  const headers = [
    'Timestamp_Unix_ms',
    'Time_ISO',
    'Relative_Seconds',
    'Accel_X_mps2',
    'Accel_Y_mps2',
    'Accel_Z_mps2',
    'Gyro_X_radps',
    'Gyro_Y_radps',
    'Gyro_Z_radps',
    'Roll_deg',
    'Pitch_deg',
    'Accel_Magnitude_mps2',
    'Temp_Celsius',
  ];

  const rows = samples.map((s) => [
    s.timestamp,
    new Date(s.timestamp).toISOString(),
    s.relTimeSec.toFixed(3),
    s.ax.toFixed(4),
    s.ay.toFixed(4),
    s.az.toFixed(4),
    s.gx.toFixed(5),
    s.gy.toFixed(5),
    s.gz.toFixed(5),
    s.roll.toFixed(2),
    s.pitch.toFixed(2),
    s.accelMagnitude.toFixed(3),
    s.temp.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
