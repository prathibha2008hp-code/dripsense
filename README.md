# MPU6050 Live Motion Dashboard (ESP32 · 6-Axis IMU)

A professional, modern, scalable real-time web & mobile dashboard for the **ESP32 + MPU6050** 6-axis Inertial Measurement Unit (IMU).

---

## 🚀 How to Connect the ESP32

### 1. Hardware I2C Wiring

Connect the MPU-6050 breakout board to your ESP32 board using 4 jumper wires:

| MPU-6050 Pin | ESP32 Pin | Description |
| :--- | :--- | :--- |
| **VCC** | **3.3V** (or 5V if module has onboard 3.3V LDO) | Power supply |
| **GND** | **GND** | Ground reference |
| **SDA** | **GPIO 21** | I2C Serial Data line |
| **SCL** | **GPIO 22** | I2C Serial Clock line |

*(Note: On ESP32-S3 or ESP32-C3 boards, check the default I2C pins or set custom pins in `Wire.begin(sda, scl)`).*

---

### 2. Flash the ESP32 Firmware

Install the **Adafruit MPU6050** and **Adafruit Unified Sensor** libraries via the Arduino IDE Library Manager (`Ctrl+Shift+I` or `Cmd+Shift+I`).

Upload the following sketch:

```cpp
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

  // Sensor ranges
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
```

---

### 3. Connect in Browser via Web Serial API

1. Connect your ESP32 to your computer with a standard USB data cable.
2. Ensure the Arduino IDE Serial Monitor is **closed** (a serial port can only be opened by one program at a time).
3. Open this dashboard in Google Chrome, Microsoft Edge, or Opera.
4. Click **Connect Device** in the top navigation bar.
5. Select your ESP32 COM port (e.g., `CP2102 USB to UART` or `CH340` / `/dev/ttyUSB0`) and click **Connect**.
6. Live motion telemetry will immediately stream into the 3D cube, KPI cards, and live charts!

---

## 🎮 Demo Mode

Don't have hardware on hand? Click **Demo Mode** in the header to activate a realistic dynamic simulation that models Euler tilt dynamics, gravitational vector projections, angular velocity noise, and thermal drift.

---

## 📊 Features

- **Header**: Live sample rate (Hz), status badge, demo toggle, calibration modal, wiring guide.
- **KPI Cards**: Real-time Roll (°), Pitch (°), Acceleration magnitude $|a|$ ($m/s^2$), and Temperature (°C) with live SVG sparklines.
- **3D Orientation Cube**: Pure CSS 3D gimbal transform that rotates continuously to reflect physical sensor attitude.
- **Live Charts**: 4 synchronized zero-lag streaming charts:
  - Accelerometer ($X, Y, Z$)
  - Gyroscope ($X, Y, Z$)
  - Orientation ($Roll, Pitch$)
  - Die Temperature ($°C$)
- **Controls**: Pause/Resume, Clear buffer, 10s/30s/60s time-window selector, and CSV Export.
- **Alerts System**: Real-time shake ($|a| > 18 m/s^2$) and free-fall ($|a| < 3 m/s^2$) detection with toast notifications and event log.
- **Zero Calibration**: One-click bias zeroing to level the sensor against desk offsets.
- **Architecture**: Modular channel config (`config/sensors.ts`), ring buffer (`lib/math.ts`), and strict validation parser (`lib/parser.ts`).
