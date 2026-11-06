import React, { useState } from 'react';
import { X, Copy, Check, Cpu, Terminal, HelpCircle } from 'lucide-react';

interface Esp32GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARDUINO_SKETCH = `// ESP32 + MPU6050 Telemetry Firmware for MPU6050 Live Motion Dashboard
// Format: ax,ay,az,gx,gy,gz,temp (Units: m/s^2, rad/s, °C)
// Baud rate: 115200, Delay: ~50ms (20 Hz)

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("MPU6050 DETECTED!"); // Text is safely ignored by parser

  // ESP32 default I2C pins: SDA = 21, SCL = 22
  Wire.begin(21, 22);

  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(100); }
  }

  // Configure sensor ranges
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  delay(100);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Send single CSV line: ax,ay,az,gx,gy,gz,temp
  Serial.print(a.acceleration.x, 3); Serial.print(",");
  Serial.print(a.acceleration.y, 3); Serial.print(",");
  Serial.print(a.acceleration.z, 3); Serial.print(",");
  Serial.print(g.gyro.x, 4);         Serial.print(",");
  Serial.print(g.gyro.y, 4);         Serial.print(",");
  Serial.print(g.gyro.z, 4);         Serial.print(",");
  Serial.println(temp.temperature, 2);

  delay(50); // ~20 Hz streaming
}
`;

export const Esp32GuideModal: React.FC<Esp32GuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_SKETCH);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#141b34] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#ffbe0b]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e8ecf8]">
              ESP32 + MPU6050 Connection Guide
            </h2>
            <p className="text-xs text-[#8a94b8]">Hardware wiring and Arduino firmware sketch</p>
          </div>
        </div>

        {/* Wiring Table */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>I2C Hardware Wiring</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MPU6050 VCC</span>
              <span className="text-[#b8f34c] font-bold">ESP32 3.3V</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MPU6050 GND</span>
              <span className="text-slate-200 font-bold">ESP32 GND</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MPU6050 SDA</span>
              <span className="text-[#4cc9f0] font-bold">ESP32 GPIO 21</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MPU6050 SCL</span>
              <span className="text-[#f72585] font-bold">ESP32 GPIO 22</span>
            </div>
          </div>
        </div>

        {/* Connection Steps */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 mb-4 space-y-1.5">
          <p>
            <strong>1. Upload Sketch:</strong> Flash the Arduino sketch below to your ESP32 board using Arduino IDE or PlatformIO.
          </p>
          <p>
            <strong>2. Plug in USB:</strong> Connect the ESP32 to your computer via USB.
          </p>
          <p>
            <strong>3. Close Serial Monitor:</strong> Ensure the Arduino IDE Serial Monitor is closed so the COM port is free.
          </p>
          <p>
            <strong>4. Connect:</strong> Click the <strong>Connect Device</strong> button in this dashboard and select the ESP32 COM port!
          </p>
        </div>

        {/* Arduino Firmware Sketch */}
        <div className="relative">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-400">Arduino Sketch (.ino)</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-[#0b1020] border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 scrollbar-thin scrollbar-thumb-slate-700">
            {ARDUINO_SKETCH}
          </pre>
        </div>
      </div>
    </div>
  );
};
