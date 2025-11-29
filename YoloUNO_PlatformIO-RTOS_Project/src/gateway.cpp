#include "gateway.h"
#include "global.h"
#include "device_control.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

/*
 * Gateway Task - MQTT Client
 * ---------------------------
 * Connects to Python Gateway MQTT Broker via WiFi
 * 
 * MQTT Topics:
 *   Publish:   yolouno/sensor  -> Send sensor data
 *   Subscribe: yolouno/command -> Receive device commands
 *   Subscribe: yolouno/wifi    -> Receive WiFi config
 * 
 * Message Format (JSON):
 *   Sensor: {"TEMP":25.5, "HUMI":60.2, "LIGHT":450, "PRES":1013}
 *   Command: {"type":"command", "device":"FAN", "value":"MANUAL2"}
 *   WiFi: {"ssid":"MySSID", "password":"MyPassword"}
 */

// MQTT Configuration
const char* mqtt_server = "192.168.137.1";  // Python Gateway IP
const int mqtt_port = 1883;
const char* mqtt_client_id = "YoloUNO_ESP32";

// MQTT Topics
const char* TOPIC_SENSOR = "yolouno/sensor";
const char* TOPIC_COMMAND = "yolouno/command";
const char* TOPIC_WIFI = "yolouno/wifi";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Last data send time
unsigned long lastMqttSend = 0;
// SEND_INTERVAL is now in global.h as send_interval_ms (configurable via MQTT)

// Forward declarations
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void processCommandMessage(String jsonStr);
void processWifiMessage(String jsonStr);

void setup_gateway_mqtt() {
    // Wait for WiFi connection
    Serial.println(" Gateway MQTT Setup");
    
    // Wait for WiFi from mainserver task
    while (!isWifiConnected) {
        Serial.println(" Waiting for WiFi connection...");
        delay(10000);
    }
    
    Serial.println(" WiFi connected, setting up MQTT...");
    
    // Setup MQTT client
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
    
    reconnectMQTT();
}

void reconnectMQTT() {
    // Loop until we're reconnected
    while (!mqttClient.connected()) {
        Serial.print(" Attempting MQTT connection to ");
        Serial.print(mqtt_server);
        Serial.print(":");
        Serial.print(mqtt_port);
        Serial.println("...");
        
        // Attempt to connect
        if (mqttClient.connect(mqtt_client_id)) {
            Serial.println(" Connected to MQTT Broker");
            
            // Subscribe to command topics
            mqttClient.subscribe(TOPIC_COMMAND);
            Serial.print(" Subscribed to: ");
            Serial.println(TOPIC_COMMAND);
            
            mqttClient.subscribe(TOPIC_WIFI);
            Serial.print(" Subscribed to: ");
            Serial.println(TOPIC_WIFI);
        } else {
            Serial.print(" Failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" retrying in 5 seconds");
            delay(5000);
        }
    }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Convert payload to string
    String message = "";
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    
    Serial.print(" MQTT message from [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(message);
    
    // Route to appropriate handler
    if (strcmp(topic, TOPIC_COMMAND) == 0) {
        processCommandMessage(message);
    } else if (strcmp(topic, TOPIC_WIFI) == 0) {
        processWifiMessage(message);
    }
}

void processCommandMessage(String jsonStr) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, jsonStr);
    
    if (error) {
        Serial.print(" JSON parse error: ");
        Serial.println(error.c_str());
        return;
    }
    
    const char* type = doc["type"];
    const char* device = doc["device"];
    const char* value = doc["value"];
    
    Serial.print(" Command: type=");
    Serial.print(type);
    Serial.print(", device=");
    Serial.print(device);
    Serial.print(", value=");
    Serial.println(value);
    
    // Process device commands
    if (strcmp(device, "FAN") == 0) {
        if (strcmp(value, "AUTO") == 0) {
            Serial.println("→ Fan: AUTO mode");
            setFanAuto(true);
        } else if (strncmp(value, "MANUAL", 6) == 0) {
            int level = atoi(value + 6); // Extract number after "MANUAL"
            Serial.print("→ Fan level: ");
            Serial.println(level);
            setFanLevel(level);
        }
    } 
    else if (strcmp(device, "LIGHT") == 0) {
        if (strcmp(value, "AUTO") == 0) {
            Serial.println(" Light: AUTO mode");
            setLightAuto(true);
        } else if (strncmp(value, "MANUAL", 6) == 0) {
            int level = atoi(value + 6);
            Serial.print(" Light level: ");
            Serial.println(level);
            setLightLevel(level);
        }
    }
    else if (strcmp(device, "INTERVAL") == 0) {
        int interval = atoi(value);
        Serial.print("→ Send interval: ");
        Serial.print(interval);
        Serial.println(" seconds");
        // Update global send interval (convert seconds to milliseconds)
        send_interval_ms = interval * 1000;
        Serial.print(" Send interval updated to ");
        Serial.print(send_interval_ms);
        Serial.println(" ms");
    }
}

void processWifiMessage(String jsonStr) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, jsonStr);
    
    if (error) {
        Serial.print(" JSON parse error: ");
        Serial.println(error.c_str());
        return;
    }
    
    const char* ssid = doc["ssid"];
    const char* password = doc["password"];
    
    Serial.print(" WiFi Config: SSID=");
    Serial.print(ssid);
    Serial.print(", Password=");
    Serial.println(password);
    
    // Update WiFi credentials
    wifi_ssid = String(ssid);
    wifi_password = String(password);
    
    // Reconnect to new WiFi
    Serial.println(" Reconnecting to new WiFi...");
    WiFi.disconnect();
    delay(100);
    WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n WiFi connected!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
        isWifiConnected = true;
        xSemaphoreGive(xBinarySemaphoreInternet);
    } else {
        Serial.println("\n WiFi connection failed!");
        isWifiConnected = false;
    }
}

void sendSensorDataMQTT(float temp, float hum, float light, float pres) {
    // Check connection status
    if (!mqttClient.connected()) {
        Serial.println(" MQTT not connected, cannot publish!");
        return;
    }
    
    Serial.print(" MQTT Connected: ");
    Serial.println(mqttClient.connected() ? "YES" : "NO");
    
    // Create JSON document
    StaticJsonDocument<256> doc;
    doc["TEMP"] = round(temp * 100.0) / 100.0;;
    doc["HUMI"] = round(hum * 100.0) / 100.0;;
    doc["LIGHT"] = round(light * 100.0) / 100.0;  // Round to 2 decimal places
    doc["PRES"] = glob_pir_detected;
    // doc["PIR"] = glob_pir_detected;  // Add PIR motion detection status

    
    // Serialize to string
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Publish to MQTT
    bool published = mqttClient.publish(TOPIC_SENSOR, jsonString.c_str());
    Serial.print(" Publish result: ");
    Serial.println(published ? "SUCCESS" : "FAILED");
    
    if (published) {
        Serial.print(" Sensor data published to '");
        Serial.print(TOPIC_SENSOR);
        Serial.print("': ");
        Serial.println(jsonString);
    } else {
        Serial.println(" Failed to publish sensor data");
        Serial.print("   MQTT State: ");
        Serial.println(mqttClient.state());
    }
}

void gateway_task(void *pvParameters) {
    Serial.println(" Gateway MQTT Task Started");
    
    // Setup MQTT
    setup_gateway_mqtt();
    
    while(1) {
        // Maintain MQTT connection
        if (!mqttClient.connected()) {
            reconnectMQTT();
        }
        mqttClient.loop();
        
        // Update auto control logic
        updateAutoControl();
        
        // Send sensor data periodically (using configurable interval)
        if (millis() - lastMqttSend >= send_interval_ms) {
            sendSensorDataMQTT(glob_temperature, glob_humidity, glob_light_lux, 1013.0);
            lastMqttSend = millis();
        }
        
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
