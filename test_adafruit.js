// Test script for Adafruit IO integration
const AdafruitIO = require('adafruit-io');

// Adafruit IO Configuration
const username = 'albinma';
const key = 'aio_zKxp16y50AnTzGPxYv2zc5QYc0iT';

console.log('Testing Adafruit IO connection...');

// This is a simple test to verify the library can be imported
// In a real implementation, you would use the Adafruit IO REST API
// or MQTT to send and receive data

console.log('Adafruit IO credentials:');
console.log('- Username:', username);
console.log('- Key:', key);

console.log('\nTo use Adafruit IO in your ESP32 project:');
console.log('1. Install the Adafruit MQTT library in Arduino IDE');
console.log('2. Use the following code pattern:');
console.log(`
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>

#define IO_SERVER         "io.adafruit.com"
#define IO_SERVERPORT     1883
#define IO_USERNAME       "${username}"
#define IO_KEY            "${key}"

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, IO_SERVER, IO_SERVERPORT, IO_USERNAME, IO_KEY);

Adafruit_MQTT_Publish medicineStatus = Adafruit_MQTT_Publish(&mqtt, IO_USERNAME "/feeds/medicine-status");

// In your loop or function:
if (!medicineStatus.publish("COMPLIANCE")) {
  Serial.println("Failed to send status");
} else {
  Serial.println("Status sent successfully");
}
`);

console.log('\nFor the Node.js server, you can use the REST API:');
console.log(`
const axios = require('axios');

async function sendToAdafruitIO(feedName, value) {
  try {
    const response = await axios.post(
      \`https://io.adafruit.com/api/v2/\${username}/feeds/\${feedName}/data\`,
      { value: value },
      {
        headers: {
          'X-AIO-Key': '${key}',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Data sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending data:', error.response?.data || error.message);
  }
}

// Usage:
// sendToAdafruitIO('medicine-status', 'COMPLIANCE');
`);