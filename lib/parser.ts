import { RawSensorData } from '../types/sensor';

/**
 * Parses a single CSV line from ESP32 MPU6050 output.
 * Expected format: ax,ay,az,gx,gy,gz,temp
 * Example: "0.112,-0.054,9.781,0.001,-0.003,0.002,27.45"
 *
 * Rejects any lines that do not have exactly 7 valid finite numbers
 * (e.g. boot messages like "MPU6050 DETECTED!", empty lines, corrupted tokens).
 */
export function parseCsvLine(line: string): RawSensorData | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Split by comma
  const parts = trimmed.split(',');
  if (parts.length !== 7) return null;

  const numbers: number[] = [];
  for (let i = 0; i < 7; i++) {
    const val = Number(parts[i].trim());
    if (isNaN(val) || !isFinite(val)) {
      return null;
    }
    numbers.push(val);
  }

  return {
    ax: numbers[0],
    ay: numbers[1],
    az: numbers[2],
    gx: numbers[3],
    gy: numbers[4],
    gz: numbers[5],
    temp: numbers[6],
  };
}

/**
 * Creates a WHATWG TransformStream that accumulates incoming chunks and splits by newline '\n'.
 * Handles variable-length chunk boundaries and carriage returns safely.
 */
export function createLineBreakTransformer(): TransformStream<string, string> {
  let remainder = '';

  return new TransformStream<string, string>({
    transform(chunk, controller) {
      remainder += chunk;
      const lines = remainder.split(/\r?\n/);
      // Keep incomplete trailing token in remainder
      remainder = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim()) {
          controller.enqueue(line);
        }
      }
    },
    flush(controller) {
      if (remainder.trim()) {
        controller.enqueue(remainder);
      }
    },
  });
}
