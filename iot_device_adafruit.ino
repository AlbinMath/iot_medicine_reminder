/*
 * IoT-Based Smart Medicine Reminder & Monitoring System
 * ESP32 + DS3231 RTC + 16x2 LCD + Buzzer + Buttons
 * ADAFRUIT IO VERSION
 * 
 * Hardware Components:
 * - ESP32 Developer Module
 * - DS3231 RTC Module
 * - 16x2 LCD Display (JHD162A, HD44780 compatible)
 * - PCB Buzzer (5V DC)
 * - Micro Switches (4x)
 * - Resistors: 10k (4x) - for button pull-ups (optional, ESP32 has internal pull-ups)
 * - 10k Potentiometer
 */

#include <WiFi.h>
#include <Wire.h>
#include <LiquidCrystal.h>
#include <RTClib.h>
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>
#include <ArduinoJson.h>

// WiFi Credentials
#define WLAN_SSID       "NARZO 70 Pro 5G"
#define WLAN_PASS       "1234567890"

// Adafruit.io Setup
#define IO_SERVER         "io.adafruit.com"
#define IO_SERVERPORT     1883
#define IO_USERNAME       "albinma"
#define IO_KEY            "aio_zKxp16y50AnTzGPxYv2zc5QYc0iT"

// Pin Definitions
// LCD Pins (16x2 Display - JHD162A, HD44780 compatible)
const int rs = 2;    // RS pin (P2)
const int en = 0;    // Enable pin (P0)
const int d4 = 16;   // Data pin 4 (P16)
const int d5 = 17;   // Data pin 5 (P17)
const int d6 = 18;   // Data pin 6 (P18)
const int d7 = 19;   // Data pin 7 (P19)

// RTC Module (DS3231) - I2C pins
// SDA -> P21
// SCL -> P22

// Other Components
const int buzzerPin = 23;        // PCB Buzzer Mini 5V DC (P23)
const int button1Pin = 15;       // Acknowledge Button (P15)
const int button2Pin = 13;       // Snooze Button (P13)
const int button3Pin = 12;       // Menu Button (P12)
const int button4Pin = 14;       // Select Button (P14)

// Initialize Components
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);
RTC_DS3231 rtc;

// WiFi and MQTT client
WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, IO_SERVER, IO_SERVERPORT, IO_USERNAME, IO_KEY);

// Adafruit IO Feeds
Adafruit_MQTT_Publish medicineStatus = Adafruit_MQTT_Publish(&mqtt, IO_USERNAME "/feeds/medicine-status");
Adafruit_MQTT_Publish medicineName = Adafruit_MQTT_Publish(&mqtt, IO_USERNAME "/feeds/medicine-name");
Adafruit_MQTT_Publish medicineTime = Adafruit_MQTT_Publish(&mqtt, IO_USERNAME "/feeds/medicine-time");

// Medicine Schedule Structure
struct MedicineSchedule {
  String name;
  int hour;
  int minute;
  int dosage;
  bool taken;
  bool snoozed;
};

// Medicine Schedules
MedicineSchedule medicines[] = {
  {"MedA", 9, 0, 2, false, false},   // 9:00 AM - 2 pills
  {"MedB", 14, 30, 1, false, false}, // 2:30 PM - 1 pill
  {"MedC", 21, 0, 1, false, false}   // 9:00 PM - 1 pill
};

const int numMedicines = sizeof(medicines) / sizeof(medicines[0]);

// System Variables
bool wifiConnected = false;
bool alertActive = false;
int currentAlertIndex = -1;
unsigned long alertStartTime = 0;
unsigned long snoozeTime = 0;
bool snoozeActive = false;
int menuMode = 0; // 0: Normal, 1: Set Time, 2: Add Medicine

// Button States
bool button1Pressed = false;
bool button2Pressed = false;
bool button3Pressed = false;
bool button4Pressed = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize LCD
  lcd.begin(16, 2);
  lcd.clear();
  lcd.print("Booting...");
  
  // Initialize RTC
  if (!rtc.begin()) {
    lcd.clear();
    lcd.print("RTC Error!");
    while (1);
  }
  
  // Initialize Pins
  pinMode(buzzerPin, OUTPUT);
  pinMode(button1Pin, INPUT_PULLUP);
  pinMode(button2Pin, INPUT_PULLUP);
  pinMode(button3Pin, INPUT_PULLUP);
  pinMode(button4Pin, INPUT_PULLUP);
  
  digitalWrite(buzzerPin, LOW);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Connect to Adafruit IO
  connectToAdafruitIO();
  
  lcd.clear();
  lcd.print("Ready!");
  displayCurrentTime();
  
  Serial.println("System Ready!");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    wifiConnected = false;
    lcd.clear();
    lcd.print("WiFi Disconnected");
    delay(2000);
    connectToWiFi();
  }
  
  // Ensure MQTT connection
  MQTT_connect();
  
  // Read Button States
  readButtons();
  
  // Handle Menu Navigation
  if (menuMode > 0) {
    handleMenuMode();
    return;
  }
  
  // Check Medicine Schedules
  checkMedicineSchedules();
  
  // Handle Active Alerts
  if (alertActive) {
    handleActiveAlert();
  }
  
  // Handle Snooze
  if (snoozeActive && millis() - snoozeTime >= 300000) { // 5 minutes
    snoozeActive = false;
    triggerAlert(currentAlertIndex);
  }
  
  // Update Display
  updateDisplay();
  
  delay(100);
}

void connectToWiFi() {
  lcd.clear();
  lcd.print("WiFi...");
  
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    attempts++;
    lcd.setCursor(0, 1);
    lcd.print(attempts);
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    lcd.clear();
    lcd.print("WiFi OK!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(1500);
    Serial.println("WiFi Connected!");
  } else {
    lcd.clear();
    lcd.print("WiFi Failed!");
    delay(1500);
  }
}

void connectToAdafruitIO() {
  lcd.clear();
  lcd.print("Adafruit IO...");
  
  int retries = 3;
  while ((retries--) && !mqtt.connect()) {
    Serial.println("Failed to connect to Adafruit IO");
    delay(5000);
  }
  
  if (mqtt.connected()) {
    lcd.clear();
    lcd.print("IO Connected!");
    Serial.println("Connected to Adafruit IO!");
    delay(1500);
  } else {
    lcd.clear();
    lcd.print("IO Failed!");
    Serial.println("Failed to connect to Adafruit IO");
    delay(1500);
  }
}

void MQTT_connect() {
  int8_t ret;
  
  // Stop if already connected
  if (mqtt.connected()) {
    return;
  }
  
  Serial.print("Connecting to MQTT... ");
  
  uint8_t retries = 3;
  while ((ret = mqtt.connect()) != 0) {
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);
    retries--;
    if (retries == 0) {
      // basically die and wait for WDT to reset me
      while (1);
    }
  }
  
  Serial.println("MQTT Connected!");
}

void readButtons() {
  button1Pressed = (digitalRead(button1Pin) == LOW);
  button2Pressed = (digitalRead(button2Pin) == LOW);
  button3Pressed = (digitalRead(button3Pin) == LOW);
  button4Pressed = (digitalRead(button4Pin) == LOW);
}

void checkMedicineSchedules() {
  DateTime now = rtc.now();
  
  for (int i = 0; i < numMedicines; i++) {
    if (!medicines[i].taken && !medicines[i].snoozed) {
      if (now.hour() == medicines[i].hour && now.minute() == medicines[i].minute) {
        triggerAlert(i);
        break;
      }
    }
  }
}

void triggerAlert(int medicineIndex) {
  currentAlertIndex = medicineIndex;
  alertActive = true;
  alertStartTime = millis();
  
  // Visual Alert
  lcd.clear();
  lcd.print("MEDICINE ALERT!");
  lcd.setCursor(0, 1);
  lcd.print(medicines[medicineIndex].name);
  lcd.print(" - ");
  lcd.print(medicines[medicineIndex].dosage);
  lcd.print(" Pills");
  
  // Audio Alert
  startBuzzerPattern();
  
  Serial.print("Alert: ");
  Serial.println(medicines[medicineIndex].name);
}

void handleActiveAlert() {
  // Check for button presses
  if (button1Pressed) {
    // Medicine Taken
    acknowledgeMedicine();
  } else if (button2Pressed) {
    // Snooze
    snoozeMedicine();
  }
  
  // Auto-stop after 15 minutes if no response
  if (millis() - alertStartTime >= 900000) { // 15 minutes
    missedMedicine();
  }
}

void acknowledgeMedicine() {
  medicines[currentAlertIndex].taken = true;
  alertActive = false;
  
  digitalWrite(buzzerPin, LOW);
  
  lcd.clear();
  lcd.print("Medicine Taken!");
  lcd.setCursor(0, 1);
  lcd.print("Thank you!");
  
  sendToAdafruitIO("COMPLIANCE", medicines[currentAlertIndex].name, rtc.now());
  
  Serial.print("Acknowledged: ");
  Serial.println(medicines[currentAlertIndex].name);
  delay(3000);
}

void snoozeMedicine() {
  snoozeActive = true;
  snoozeTime = millis();
  alertActive = false;
  
  digitalWrite(buzzerPin, LOW);
  
  lcd.clear();
  lcd.print("Snoozed 5 min...");
  
  Serial.print("Snoozed: ");
  Serial.println(medicines[currentAlertIndex].name);
  delay(2000);
}

void missedMedicine() {
  alertActive = false;
  
  digitalWrite(buzzerPin, LOW);
  
  lcd.clear();
  lcd.print("MISSED: ");
  lcd.print(medicines[currentAlertIndex].name);
  lcd.print("!");
  
  sendToAdafruitIO("MISSED", medicines[currentAlertIndex].name, rtc.now());
  
  Serial.print("Missed: ");
  Serial.println(medicines[currentAlertIndex].name);
  delay(5000);
}

void startBuzzerPattern() {
  // Beep-beep-pause pattern
  for (int i = 0; i < 3; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(200);
    digitalWrite(buzzerPin, LOW);
    delay(200);
  }
  delay(1000);
}

void sendToAdafruitIO(const String& status, const String& medicineNameStr, DateTime timestamp) {
  if (!mqtt.connect()) {
    Serial.println("Not connected to Adafruit IO");
    return;
  }
  
  Serial.println("Sending to Adafruit IO...");
  
  // Send status
  if (!medicineStatus.publish(status.c_str())) {
    Serial.println("Failed to send status");
  } else {
    Serial.println("Status sent: " + status);
  }
  
  // Send medicine name
  if (!medicineName.publish(medicineNameStr.c_str())) {
    Serial.println("Failed to send medicine name");
  } else {
    Serial.println("Medicine name sent: " + medicineNameStr);
  }
  
  // Send time
  String timeStr = String(timestamp.hour()) + ":" + 
                   String(timestamp.minute()) + ":" + 
                   String(timestamp.second());
  if (!medicineTime.publish(timeStr.c_str())) {
    Serial.println("Failed to send time");
  } else {
    Serial.println("Time sent: " + timeStr);
  }
}

void handleMenuMode() {
  switch (menuMode) {
    case 1: // Set Time
      lcd.clear();
      lcd.print("Set Time Mode");
      lcd.setCursor(0, 1);
      lcd.print("Press Btn4 to exit");
      if (button4Pressed) {
        menuMode = 0;
        delay(500);
      }
      break;
      
    case 2: // Add Medicine
      lcd.clear();
      lcd.print("Add Medicine Mode");
      lcd.setCursor(0, 1);
      lcd.print("Press Btn4 to exit");
      if (button4Pressed) {
        menuMode = 0;
        delay(500);
      }
      break;
  }
}

void updateDisplay() {
  static unsigned long lastUpdate = 0;
  
  if (millis() - lastUpdate >= 1000) { // Update every second
    if (!alertActive && menuMode == 0) {
      displayCurrentTime();
    }
    lastUpdate = millis();
  }
  
  // Check for menu button
  if (button3Pressed && menuMode == 0) {
    menuMode = 1;
    delay(500);
  }
}

void displayCurrentTime() {
  DateTime now = rtc.now();
  lcd.setCursor(0, 1);
  
  if (now.hour() < 10) lcd.print("0");
  lcd.print(now.hour());
  lcd.print(":");
  if (now.minute() < 10) lcd.print("0");
  lcd.print(now.minute());
  lcd.print(":");
  if (now.second() < 10) lcd.print("0");
  lcd.print(now.second());
  
  // Show next medicine
  lcd.setCursor(8, 1);
  lcd.print("N:");
  for (int i = 0; i < numMedicines; i++) {
    if (!medicines[i].taken) {
      lcd.print(medicines[i].name);
      break;
    }
  }
}

// Reset all medicines (call this daily or as needed)
void resetDailyMedicines() {
  for (int i = 0; i < numMedicines; i++) {
    medicines[i].taken = false;
    medicines[i].snoozed = false;
  }
  Serial.println("Daily reset complete");
}