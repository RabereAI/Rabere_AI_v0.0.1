#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <PID_v1.h>
#include <EEPROM.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Pin definitions
#define DHT_PIN D2
#define HEATER_PIN D4
#define HUMIDIFIER_PIN D5
#define FAN_PIN D12
#define LED_PIN D13
#define PIR_PIN D14

// Constants
#define DHT_TYPE DHT22
#define EEPROM_SIZE 512
#define UPDATE_INTERVAL 30000
#define SAFETY_TEMP_MAX 35.0
#define SAFETY_TEMP_MIN 15.0
#define SAFETY_HUMIDITY_MAX 85.0
#define SAFETY_HUMIDITY_MIN 40.0

// Network configuration
const char* ssid = "RABERE_NETWORK";
const char* password = "NETWORK_PASSWORD";
const char* serverUrl = "http://control-server:8080/telemetry";

// Global variables
float temperature = 0.0;
float humidity = 0.0;
float heatIndex = 0.0;
bool motionDetected = false;

// PID variables
double tempSetpoint, tempInput, tempOutput;
double humSetpoint, humInput, humOutput;

// PID tuning parameters
double tempKp = 2.0, tempKi = 5.0, tempKd = 1.0;
double humKp = 3.0, humKi = 4.0, humKd = 1.0;

// Initialize objects
DHT dht(DHT_PIN, DHT_TYPE);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

PID tempPID(&tempInput, &tempOutput, &tempSetpoint, tempKp, tempKi, tempKd, DIRECT);
PID humPID(&humInput, &humOutput, &humSetpoint, humKp, humKi, humKd, DIRECT);

// System state
struct SystemState {
  float targetTemp;
  float targetHum;
  bool autoMode;
  bool dayMode;
} state;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(HEATER_PIN, OUTPUT);
  pinMode(HUMIDIFIER_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  
  // Initialize sensors
  dht.begin();
  
  // Load configuration from EEPROM
  EEPROM.begin(EEPROM_SIZE);
  loadConfig();
  
  // Initialize PID controllers
  tempPID.SetMode(AUTOMATIC);
  humPID.SetMode(AUTOMATIC);
  tempPID.SetOutputLimits(0, 255);
  humPID.SetOutputLimits(0, 255);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  
  // Initialize NTP
  timeClient.begin();
  timeClient.setTimeOffset(0);
}

void loop() {
  static unsigned long lastUpdate = 0;
  unsigned long currentMillis = millis();
  
  // Update sensor readings
  updateSensors();
  
  // Check safety limits
  if (!checkSafetyLimits()) {
    emergencyMode();
    return;
  }
  
  // Update PID calculations
  updatePIDControls();
  
  // Apply control outputs
  applyControls();
  
  // Send telemetry data
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    sendTelemetry();
    lastUpdate = currentMillis;
  }
  
  // Update time and day/night mode
  timeClient.update();
  updateDayNightMode();
  
  delay(1000);
}

void updateSensors() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  if (!isnan(temperature) && !isnan(humidity)) {
    heatIndex = dht.computeHeatIndex(temperature, humidity, false);
  }
  
  motionDetected = digitalRead(PIR_PIN);
}

bool checkSafetyLimits() {
  if (isnan(temperature) || isnan(humidity)) {
    return false;
  }
  
  return temperature > SAFETY_TEMP_MIN && 
         temperature < SAFETY_TEMP_MAX && 
         humidity > SAFETY_HUMIDITY_MIN && 
         humidity < SAFETY_HUMIDITY_MAX;
}

void emergencyMode() {
  digitalWrite(HEATER_PIN, LOW);
  digitalWrite(HUMIDIFIER_PIN, LOW);
  analogWrite(FAN_PIN, 255);
  digitalWrite(LED_PIN, LOW);
  
  // Send emergency notification
  sendEmergencyAlert();
  delay(5000);
}

void updatePIDControls() {
  tempInput = temperature;
  humInput = humidity;
  
  tempSetpoint = state.targetTemp;
  humSetpoint = state.targetHum;
  
  tempPID.Compute();
  humPID.Compute();
}

void applyControls() {
  if (state.autoMode) {
    analogWrite(HEATER_PIN, tempOutput);
    analogWrite(HUMIDIFIER_PIN, humOutput);
    
    // Fan control based on heat index
    int fanSpeed = map(heatIndex, 20, 30, 0, 255);
    fanSpeed = constrain(fanSpeed, 0, 255);
    analogWrite(FAN_PIN, fanSpeed);
  }
  
  // LED control based on day/night mode
  digitalWrite(LED_PIN, state.dayMode);
}

void updateDayNightMode() {
  int currentHour = timeClient.getHours();
  state.dayMode = (currentHour >= 6 && currentHour < 20);
}

void sendTelemetry() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["heatIndex"] = heatIndex;
    doc["motion"] = motionDetected;
    doc["heaterPower"] = tempOutput;
    doc["humidifierPower"] = humOutput;
    doc["dayMode"] = state.dayMode;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpCode = http.POST(jsonString);
    http.end();
  }
}

void sendEmergencyAlert() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverUrl) + "/emergency");
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["error"] = "Safety limits exceeded";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpCode = http.POST(jsonString);
    http.end();
  }
}

void loadConfig() {
  EEPROM.get(0, state);
  
  // Set defaults if values are invalid
  if (isnan(state.targetTemp) || state.targetTemp < 0) {
    state.targetTemp = 25.0;
  }
  if (isnan(state.targetHum) || state.targetHum < 0) {
    state.targetHum = 65.0;
  }
  state.autoMode = true;
  state.dayMode = true;
}

void saveConfig() {
  EEPROM.put(0, state);
  EEPROM.commit();
} 