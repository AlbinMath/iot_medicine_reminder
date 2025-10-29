# IoT Medicine Reminder - Connection Guide

## Hardware Components

1. ESP32 Developer Module
2. DS3231 RTC Module
3. 16x2 LCD Display (JHD162A, HD44780 compatible)
4. PCB Buzzer (5V DC)
5. Micro Switches (4x)
6. Resistors: 10k (4x) - for button pull-ups
7. 10k Potentiometer
8. Breadboard and jumper wires

## Pin Connections

### ESP32 to DS3231 RTC Module
```
ESP32    RTC DS3231
3V3  ─── VCC
GND  ─── GND
P21  ─── SDA
P22  ─── SCL
```

### ESP32 to 16x2 LCD Display
```
ESP32    LCD (JHD162A)
5V   ─── VCC (Pin 2)
GND  ─── VSS (Pin 1)
P2   ─── RS (Pin 4)
P0   ─── E (Pin 6)
P16  ─── DB4 (Pin 11)
P17  ─── DB5 (Pin 12)
P18  ─── DB6 (Pin 13)
P19  ─── DB7 (Pin 14)
5V   ─── LED+ (Pin 15)
GND  ─── LED- (Pin 16)
```

Note: Connect the 10k Potentiometer to VEE (Pin 3) of the LCD for contrast control.

### ESP32 to PCB Buzzer
```
ESP32    Buzzer
P23  ─── Positive (+)
GND  ─── Negative (-)
```

### ESP32 to Micro Switches
```
ESP32    Buttons
P15  ─── Button 1 (Acknowledge)
P13  ─── Button 2 (Snooze)
P12  ─── Button 3 (Menu)
P14  ─── Button 4 (Select)
GND  ─── All Buttons Common
```

Note: Use internal pull-up resistors (INPUT_PULLUP) for buttons, so external resistors are optional.

## System Working Principle

### 1. Initialization & Setup Phase (Boot-up)
When you power on the system:
- ESP32 boots up and runs the programmed code
- RTC Module (DS3231) provides the current date and time
- LCD Display shows startup message: "System Booting..." then "Connecting WiFi..."
- WiFi Connection is established by ESP32 to enable IoT features
- Once connected, display shows: "Ready! Time: 09:00:00"

### 2. Medicine Schedule Monitoring
The core operation involves continuous time checking:
- Current time is read from the RTC module every second
- The system compares current time with scheduled medicine times
- When a match is found, an alert is triggered

### 3. Alert Triggering Sequence
When scheduled time matches current time:
- LCD Display shows: "MEDICINE ALERT!" and medicine details
- PCB Buzzer produces audible beeps (beep-beep-pause pattern)

### 4. User Response Handling
The system waits for user interaction:
- **Option A: Medicine Taken (Proper Compliance)**
  - User presses Acknowledge Button (Button 1)
  - System immediately stops buzzer
  - Shows confirmation: "Medicine Taken! ✓" on LCD
  - Sends IoT data to Adafruit IO: "Medicine A taken on time at 09:00 AM"

- **Option B: Snooze Function**
  - User presses Snooze Button (Button 2)
  - System silences buzzer temporarily
  - Displays: "Snoozed 5 min..."
  - Resumes alert after 5 minutes

- **Option C: Missed Dose (No Response)**
  - If no button pressed within 15 minutes:
  - System stops audible alert (buzzer off)
  - Display shows: "MISSED: Medicine A!"
  - Sends urgent alert to Adafruit IO: "ALERT: Medicine A missed at 09:15 AM"

### 5. IoT Monitoring & Data Logging
Real-time Cloud Updates:
- On-time intake: "COMPLIANCE: Medicine A - 09:00 AM"
- Late intake: "LATE: Medicine A taken at 09:07 AM"
- Missed dose: "MISSED: Medicine A - 09:15 AM"

Remote Access:
Caregivers can monitor via the web dashboard.

### 6. Manual Override & Configuration
Using the additional Micro Switches (3 & 4):
- Button 3: Cycle through menus
- Button 4: Select/Set parameters
- Allows setting new alarm times without reprogramming

## WiFi Configuration
- SSID: "NARZO 70 Pro 5G"
- Password: "1234567890"

## Adafruit IO Configuration
- Username: "albinma"
- Active Key: "aio_zKxp16y50AnTzGPxYv2zc5QYc0iT"