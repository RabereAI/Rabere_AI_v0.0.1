#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Pin definitions
#define CAMERA_POWER_PIN D2
#define IR_LED_PIN D4
#define STATUS_LED_PIN D5

// Network configuration
const char* ssid = "RABIES_DETECTION_NETWORK";
const char* password = "NETWORK_PASSWORD";
const char* serverUrl = "http://control-server:8080/video";

// Global variables
bool cameraActive = false;
bool nightVisionActive = false;
String currentVideoReference = "";

// Initialize objects
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

void setup() {
    Serial.begin(115200);
    
    // Initialize pins
    pinMode(CAMERA_POWER_PIN, OUTPUT);
    pinMode(IR_LED_PIN, OUTPUT);
    pinMode(STATUS_LED_PIN, OUTPUT);
    
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
    
    // Start camera
    startCamera();
}

void loop() {
    static unsigned long lastUpdate = 0;
    unsigned long currentMillis = millis();
    
    // Update camera status
    updateCameraStatus();
    
    // Check night vision
    checkNightVision();
    
    // Send telemetry
    if (currentMillis - lastUpdate >= 30000) {
        sendTelemetry();
        lastUpdate = currentMillis;
    }
    
    delay(1000);
}

void startCamera() {
    digitalWrite(CAMERA_POWER_PIN, HIGH);
    cameraActive = true;
    digitalWrite(STATUS_LED_PIN, HIGH);
}

void checkNightVision() {
    // Add logic for IR LED control based on light levels
}

void updateCameraStatus() {
    if (!cameraActive) {
        startCamera();
    }
}

void sendTelemetry() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        StaticJsonDocument<200> doc;
        doc["cameraActive"] = cameraActive;
        doc["nightVisionActive"] = nightVisionActive;
        doc["videoReference"] = currentVideoReference;
        doc["timestamp"] = timeClient.getEpochTime();
        
        String jsonString;
        serializeJson(doc, jsonString);
        
        int httpCode = http.POST(jsonString);
        http.end();
    }
} 