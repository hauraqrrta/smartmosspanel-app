#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "Esteh";          
const char* password = "estehduabelas";    

// =================== VERCEL URL ===================
const char* vercelURL = "https://smartmosspanel.vercel.app";

const char* panelId = "panel01"; 


#define DHTPIN 5
#define DHTTYPE DHT22
#define SOIL_PIN 17
#define MQ_PIN 34
#define RELAY_PUMP 25
#define RELAY_FAN 26


// optimal 18-24°C)
#define TEMP_OPTIMAL_LOW 18     
#define TEMP_OPTIMAL_HIGH 24    
#define TEMP_CRITICAL_HIGH 30   

// Humidity Thresholds (optimal 70-90%)
#define HUMIDITY_OPTIMAL_LOW 70
#define HUMIDITY_OPTIMAL_HIGH 90
#define HUMIDITY_CRITICAL_LOW 60

// Air Quality Thresholds (MQ-135 sensor)
#define MQ_SAFE 400            
#define MQ_ACCEPTABLE 800      
#define MQ_WARNING 1000        
#define MQ_DANGER 2000         

// =================== RELAY LOGIC ===================
#define RELAY_ON LOW
#define RELAY_OFF HIGH

// =================== TIMING ===================
#define SENSOR_UPDATE_INTERVAL 2000
#define SEND_DATA_INTERVAL 5000      
#define GET_CONTROL_INTERVAL 3000    
#define LCD_TOGGLE_INTERVAL 4000
#define ALERT_CHECK_INTERVAL 10000   


LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);


// Sensor data
float temperature = 0;
float humidity = 0;
bool soilMoisture = false;
int mqValue = 0;

// Control modes
bool manualMode = false;
bool manualPump = false;
bool manualFan = false;


unsigned long lastUpdate = 0;
unsigned long lastSendData = 0;
unsigned long lastGetControl = 0;
unsigned long lastDisplayToggle = 0;
unsigned long lastAlertCheck = 0;
int displayMode = 0;

// Status flags
bool wifiConnected = false;
bool criticalAlert = false;

// Environment status tracking
String tempStatus = "OK";
String humidityStatus = "OK";
String airQualityStatus = "OK";

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n==========================================");
  Serial.println("   Smart Moss Panel   ");
  Serial.printf("   Panel ID: %s\n", panelId);
  Serial.println("   Optimal Parameters: 18-24°C, 70-90%RH");
  Serial.println("==========================================\n");

  // Initialize LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Smart Moss Panel");
  lcd.setCursor(0, 1);
  lcd.printf("ID: %s", panelId);
  delay(2000);

  // Initialize relays (OFF by default)
  pinMode(RELAY_PUMP, OUTPUT);
  pinMode(RELAY_FAN, OUTPUT);
  digitalWrite(RELAY_PUMP, RELAY_OFF);
  digitalWrite(RELAY_FAN, RELAY_OFF);
  Serial.println("[OK] Relay initialized - ALL OFF");

  // Initialize sensors
  dht.begin();
  delay(2000);
  pinMode(SOIL_PIN, INPUT);
  pinMode(MQ_PIN, INPUT);
  Serial.println("[OK] Sensors ready");

  // Connect to WiFi
  connectWiFi();

  // Display ready message
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Ready!");
  lcd.setCursor(0, 1);
  lcd.print("Monitoring...");
  delay(2000);
  
  Serial.println("\n[SYSTEM READY - MONITORING STARTED]\n");
}

void connectWiFi() {
  Serial.println("\n[WiFi] Connecting...");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(attempts % 16, 1);
    lcd.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n[WiFi] Connected!");
    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());
    Serial.printf("[WiFi] Signal: %d dBm\n", WiFi.RSSI());
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    delay(2000);
  } else {
    wifiConnected = false;
    Serial.println("\n[WiFi] Failed to connect!");
    Serial.println("[WiFi] Running in OFFLINE mode");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed!");
    lcd.setCursor(0, 1);
    lcd.print("Offline Mode");
    delay(2000);
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    wifiConnected = false;
    Serial.println("[WiFi] Connection lost! Reconnecting...");
    connectWiFi();
  }

  // Update sensor readings
  if (millis() - lastUpdate >= SENSOR_UPDATE_INTERVAL) {
    lastUpdate = millis();
    readSensors();
    
    // Control relays based on mode
    if (manualMode) {
      controlRelayManual();
    } else {
      controlRelayAuto();
    }
    
    printStatus();
  }

  // Check for critical conditions
  if (millis() - lastAlertCheck >= ALERT_CHECK_INTERVAL) {
    lastAlertCheck = millis();
    checkEnvironmentStatus();
  }

  // Send data to cloud
  if (wifiConnected && millis() - lastSendData >= SEND_DATA_INTERVAL) {
    lastSendData = millis();
    sendDataToVercel();
  }

  // Get control commands from cloud
  if (wifiConnected && millis() - lastGetControl >= GET_CONTROL_INTERVAL) {
    lastGetControl = millis();
    getControlFromVercel();
  }

  // Update LCD display
  if (millis() - lastDisplayToggle >= LCD_TOGGLE_INTERVAL) {
    lastDisplayToggle = millis();
    displayMode = (displayMode + 1) % 5;  // 5 display modes now
    updateDisplay();
  }
}

void readSensors() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  soilMoisture = digitalRead(SOIL_PIN);
  mqValue = analogRead(MQ_PIN);
  
  // Error handling for DHT sensor
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("[ERROR] DHT read failed! Using fallback values.");
    temperature = 22.0;  
    humidity = 75.0;    
  }
}

void controlRelayAuto() {
  // ===== PUMP CONTROL (Soil Moisture) =====
  if (soilMoisture == HIGH) {  // Soil is DRY
    digitalWrite(RELAY_PUMP, RELAY_ON);
    Serial.println("[AUTO] Pump ON - Soil is DRY");
  } else {  // Soil is WET
    digitalWrite(RELAY_PUMP, RELAY_OFF);
  }
  
  // ===== FAN CONTROL (Temperature + Air Quality) =====
  bool fanNeeded = false;
  
  // Turn on fan if temperature too high
  if (temperature > TEMP_OPTIMAL_HIGH) {
    fanNeeded = true;
    Serial.printf("[AUTO] Fan ON - Temp too high: %.1f°C\n", temperature);
  }
  
  // Turn on fan if air quality poor
  if (mqValue > MQ_WARNING) {
    fanNeeded = true;
    Serial.printf("[AUTO] Fan ON - Air quality poor: %d ppm\n", mqValue);
  }
  
  // Turn off fan if temperature optimal and air quality good
  if (temperature < TEMP_OPTIMAL_LOW && mqValue < MQ_ACCEPTABLE) {
    fanNeeded = false;
  }
  
  digitalWrite(RELAY_FAN, fanNeeded ? RELAY_ON : RELAY_OFF);
}

void controlRelayManual() {
  digitalWrite(RELAY_PUMP, manualPump ? RELAY_ON : RELAY_OFF);
  digitalWrite(RELAY_FAN, manualFan ? RELAY_ON : RELAY_OFF);
}

void checkEnvironmentStatus() {
  criticalAlert = false;
  
  // ===== CHECK TEMPERATURE =====
  if (temperature >= TEMP_CRITICAL_HIGH) {
    tempStatus = "CRITICAL";
    criticalAlert = true;
    Serial.printf("[ALERT] 🔴 CRITICAL TEMPERATURE: %.1f°C (Max: %d°C)\n", 
                  temperature, TEMP_CRITICAL_HIGH);
  } else if (temperature > TEMP_OPTIMAL_HIGH) {
    tempStatus = "HIGH";
    Serial.printf("[WARNING] ⚠️ Temperature HIGH: %.1f°C (Optimal: %d-%d°C)\n", 
                  temperature, TEMP_OPTIMAL_LOW, TEMP_OPTIMAL_HIGH);
  } else if (temperature < TEMP_OPTIMAL_LOW) {
    tempStatus = "LOW";
    Serial.printf("[WARNING] ⚠️ Temperature LOW: %.1f°C (Optimal: %d-%d°C)\n", 
                  temperature, TEMP_OPTIMAL_LOW, TEMP_OPTIMAL_HIGH);
  } else {
    tempStatus = "OK";
  }
  
  // ===== CHECK HUMIDITY =====
  if (humidity < HUMIDITY_CRITICAL_LOW) {
    humidityStatus = "CRITICAL";
    criticalAlert = true;
    Serial.printf("[ALERT] 🔴 CRITICAL HUMIDITY: %.1f%% (Min: %d%%)\n", 
                  humidity, HUMIDITY_CRITICAL_LOW);
  } else if (humidity < HUMIDITY_OPTIMAL_LOW) {
    humidityStatus = "LOW";
    Serial.printf("[WARNING] ⚠️ Humidity LOW: %.1f%% (Optimal: %d-%d%%)\n", 
                  humidity, HUMIDITY_OPTIMAL_LOW, HUMIDITY_OPTIMAL_HIGH);
  } else if (humidity > HUMIDITY_OPTIMAL_HIGH) {
    humidityStatus = "HIGH";
    Serial.printf("[WARNING] ⚠️ Humidity HIGH: %.1f%% (Optimal: %d-%d%%)\n", 
                  humidity, HUMIDITY_OPTIMAL_LOW, HUMIDITY_OPTIMAL_HIGH);
  } else {
    humidityStatus = "OK";
  }
  
  // ===== CHECK AIR QUALITY =====
  if (mqValue >= MQ_DANGER) {
    airQualityStatus = "DANGER";
    criticalAlert = true;
    Serial.printf("[ALERT] 🔴 DANGEROUS AIR QUALITY: %d ppm (Toxic level!)\n", mqValue/5
    );
    // Force fan ON in critical air quality
    if (!manualMode) {
      digitalWrite(RELAY_FAN, RELAY_ON);
    }
  } else if (mqValue >= MQ_WARNING) {
    airQualityStatus = "POOR";
    Serial.printf("[WARNING] ⚠️ Air Quality POOR: %d ppm (Increase ventilation)\n", mqValue/5);
  } else if (mqValue >= MQ_ACCEPTABLE) {
    airQualityStatus = "MODERATE";
  } else {
    airQualityStatus = "EXCELLENT";
  }
  
  // ===== SUMMARY =====
  if (criticalAlert) {
    Serial.println("\n[ALERT SUMMARY] ⚠️ CRITICAL CONDITIONS DETECTED!");
    Serial.printf("  → Temperature: %s\n", tempStatus.c_str());
    Serial.printf("  → Humidity: %s\n", humidityStatus.c_str());
    Serial.printf("  → Air Quality: %s\n", airQualityStatus.c_str());
    Serial.println();
  }
}

void printStatus() {
  Serial.println("\n========== SENSOR DATA ==========");
  Serial.printf("Panel ID    : %s\n", panelId);
  Serial.printf("Temperature : %.1f °C [%s]\n", temperature, tempStatus.c_str());
  Serial.printf("Humidity    : %.1f %% [%s]\n", humidity, humidityStatus.c_str());
  Serial.printf("Soil        : %s\n", soilMoisture == LOW ? "WET" : "DRY");
  Serial.printf("Air Quality : %d ppm [%s]\n", mqValue/5, airQualityStatus.c_str());
  Serial.println("----------------------------------");
  Serial.printf("Mode        : %s\n", manualMode ? "MANUAL" : "AUTO");
  Serial.printf("Pump        : %s\n", digitalRead(RELAY_PUMP) == RELAY_ON ? "ON" : "OFF");
  Serial.printf("Fan         : %s\n", digitalRead(RELAY_FAN) == RELAY_ON ? "ON" : "OFF");
  Serial.println("==================================\n");
}

void sendDataToVercel() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(vercelURL) + "/api/receive-data";
  
  Serial.println("[HTTP] Sending data to Vercel...");
  
  // Prepare JSON payload
  StaticJsonDocument<768> doc;
  doc["panelId"] = panelId;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = soilMoisture == LOW ? "WET" : "DRY";
  doc["pollution"] = mqValue/5;
  doc["pumpStatus"] = digitalRead(RELAY_PUMP) == RELAY_ON ? "ON" : "OFF";
  doc["fanStatus"] = digitalRead(RELAY_FAN) == RELAY_ON ? "ON" : "OFF";
  
  // Add status indicators
  doc["tempStatus"] = tempStatus;
  doc["humidityStatus"] = humidityStatus;
  doc["airQualityStatus"] = airQualityStatus;
  doc["criticalAlert"] = criticalAlert;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    String response = http.getString();
    
    if (httpCode == 200) {
      Serial.println("[HTTP] ✅ Data sent successfully!");
    } else {
      Serial.printf("[HTTP] ⚠️ Response code: %d\n", httpCode);
      Serial.printf("[HTTP] Response: %s\n", response.c_str());
    }
  } else {
    Serial.printf("[HTTP] ❌ Error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}

void getControlFromVercel() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  String url = String(vercelURL) + "/api/control";
  
  http.begin(url);
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      // Get mode
      String newMode = doc["mode"] | "AUTO";
      bool newModeManual = (newMode == "MANUAL");
      
      if (newModeManual != manualMode) {
        manualMode = newModeManual;
        Serial.printf("[CONTROL] ✅ Mode changed to: %s\n", manualMode ? "MANUAL" : "AUTO");
      }
      
      // Get manual controls (only if in manual mode)
      if (manualMode) {
        String pumpStr = doc["pump"] | "OFF";
        String fanStr = doc["fan"] | "OFF";
        
        bool newPump = (pumpStr == "ON");
        bool newFan = (fanStr == "ON");
        
        if (newPump != manualPump) {
          manualPump = newPump;
          Serial.printf("[CONTROL] ✅ Manual Pump: %s\n", manualPump ? "ON" : "OFF");
        }
        
        if (newFan != manualFan) {
          manualFan = newFan;
          Serial.printf("[CONTROL] ✅ Manual Fan: %s\n", manualFan ? "ON" : "OFF");
        }
      }
    } else {
      Serial.printf("[CONTROL] ❌ JSON parse error: %s\n", error.c_str());
    }
  } else if (httpCode > 0) {
    Serial.printf("[CONTROL] ⚠️ HTTP error: %d\n", httpCode);
  }
  
  http.end();
}

void updateDisplay() {
  lcd.clear();

  if (displayMode == 0) {
    // ===== MODE 1: Temperature & Humidity =====
    lcd.setCursor(0, 0);
    lcd.print("T:");
    lcd.print(temperature, 1);
    lcd.print((char)223);
    lcd.print("C ");
    
    // Show status indicator
    if (tempStatus == "OK") {
      lcd.print("OK");
    } else if (tempStatus == "CRITICAL") {
      lcd.print("!!");
    } else {
      lcd.print(tempStatus.substring(0, 2));
    }

    lcd.setCursor(0, 1);
    lcd.print("H:");
    lcd.print(humidity, 1);
    lcd.print("% ");
    
    if (humidityStatus == "OK") {
      lcd.print("OK");
    } else if (humidityStatus == "CRITICAL") {
      lcd.print("!!");
    } else {
      lcd.print(humidityStatus.substring(0, 2));
    }
    
  } else if (displayMode == 1) {
    // ===== MODE 2: Soil & Actuators =====
    lcd.setCursor(0, 0);
    lcd.print("Soil: ");
    lcd.print(soilMoisture == LOW ? "WET " : "DRY ");

    lcd.setCursor(0, 1);
    lcd.print("P:");
    lcd.print(digitalRead(RELAY_PUMP) == RELAY_ON ? "ON " : "OFF");
    lcd.print(" F:");
    lcd.print(digitalRead(RELAY_FAN) == RELAY_ON ? "ON " : "OFF");
    
  } else if (displayMode == 2) {
    // ===== MODE 3: Air Quality =====
    lcd.setCursor(0, 0);
    lcd.print("AirQ: ");
    lcd.print(mqValue/5);
    lcd.print("ppm");

    lcd.setCursor(0, 1);
    if (airQualityStatus == "EXCELLENT") {
      lcd.print("Status: Excel ");
    } else if (airQualityStatus == "MODERATE") {
      lcd.print("Status: Moder ");
    } else if (airQualityStatus == "POOR") {
      lcd.print("Status: Poor! ");
    } else {
      lcd.print("Status: DANGER");
    }
    
  } else if (displayMode == 3) {
    // ===== MODE 4: Control Mode & WiFi =====
    lcd.setCursor(0, 0);
    lcd.print("Mode: ");
    lcd.print(manualMode ? "MANUAL" : "AUTO  ");

    lcd.setCursor(0, 1);
    lcd.print("WiFi: ");
    if (wifiConnected) {
      lcd.print("OK ");
      lcd.print(WiFi.RSSI());
      lcd.print("dB");
    } else {
      lcd.print("X OFFLINE");
    }
    
  } else {
    // ===== MODE 5: Status Summary =====
    lcd.setCursor(0, 0);
    if (criticalAlert) {
      lcd.print("! ALERT !");
    } else {
      lcd.print("All Systems OK");
    }

    lcd.setCursor(0, 1);
    lcd.printf("T:%s H:%s A:%s", 
               tempStatus.substring(0,1).c_str(),
               humidityStatus.substring(0,1).c_str(),
               airQualityStatus.substring(0,1).c_str());
  }
}
