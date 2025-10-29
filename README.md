# IoT-Based Smart Medicine Reminder & Monitoring System

This project is an IoT-based smart medicine reminder system that uses ESP32, DS3231 RTC, 16x2 LCD, buzzer, and buttons to remind users to take their medication on time. The system now uses Adafruit IO for data storage instead of MongoDB.

## Features

- Real-time medicine reminders with visual and audio alerts
- WiFi connectivity for IoT functionality
- Adafruit IO integration for data storage and monitoring
- Web dashboard for remote monitoring
- Compliance tracking and statistics

## Hardware Components

1. ESP32 Developer Module
2. DS3231 RTC Module
3. 16x2 LCD Display (JHD162A, HD44780 compatible)
4. PCB Buzzer (5V DC)
5. Micro Switches (4x)
6. Resistors: 10k (4x) - for button pull-ups
7. 10k Potentiometer

## Software Components

1. Arduino IDE for ESP32 programming
2. Node.js server for web dashboard
3. Adafruit IO for data storage

## Setup Instructions

### ESP32 Device Setup

1. Install the following libraries in Arduino IDE:
   - WiFi.h
   - Wire.h
   - LiquidCrystal.h
   - RTClib.h
   - Adafruit_MQTT.h
   - ArduinoJson.h

2. Update WiFi credentials in the Arduino code:
   ```cpp
   #define WLAN_SSID       "Your_WiFi_SSID"
   #define WLAN_PASS       "Your_WiFi_Password"
   ```

3. Update Adafruit IO credentials in the Arduino code:
   ```cpp
   #define IO_USERNAME       "Your_Adafruit_IO_Username"
   #define IO_KEY            "Your_Adafruit_IO_Key"
   ```

4. Connect the hardware components according to the provided schematics.

5. Upload the code to the ESP32.

### Web Dashboard Setup

1. Install Node.js (version 14 or higher)

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Access the dashboard at `http://localhost:3000`

## Adafruit IO Configuration

1. Create an account at [Adafruit IO](https://io.adafruit.com/)

2. Create the following feeds:
   - medicine-status
   - medicine-name
   - medicine-time

3. Update the credentials in both the ESP32 code and server.js file.

## Usage

1. The device will connect to WiFi and Adafruit IO on startup.

2. The LCD will display the current time and the next scheduled medicine.

3. When it's time for medicine, the device will trigger an alert with:
   - Visual indication on the LCD
   - Audio alert using the buzzer

4. User can:
   - Press Button 1 to acknowledge taking the medicine
   - Press Button 2 to snooze the alert for 5 minutes

5. Data is sent to Adafruit IO and can be viewed on the web dashboard.

## Code Structure

- `iot_device_adafruit.ino`: Arduino code for the ESP32 device
- `server.js`: Node.js server for the web dashboard
- `public/index.html`: Web dashboard frontend
- `package.json`: Project dependencies and scripts

## No MongoDB Required

This version of the project uses Adafruit IO for data storage instead of MongoDB, making it easier to deploy without database management.