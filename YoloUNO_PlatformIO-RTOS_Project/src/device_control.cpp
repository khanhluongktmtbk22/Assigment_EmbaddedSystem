#include "device_control.h"
#include "global.h"

/*
 * Device Control Module
 * ---------------------
 * Controls Fan (GPIO 2) and Light (GPIO 3) using PWM
 * Supports 4 levels: 0=OFF, 1=Low, 2=Medium, 3=High
 * Supports Auto mode based on sensor readings
 */

// ============================================
// PWM Duty Cycle Mapping
// ============================================
const int PWM_LEVELS[4] = {
    0,      // Level 0: OFF (0%)
    85,     // Level 1: Low (33%)
    170,    // Level 2: Medium (66%)
    255     // Level 3: High (100%)
};

// ============================================
// Initialization
// ============================================
void initDeviceControl() {
    Serial.println(" Initializing Device Control...");
    
    // Configure PWM for Fan
    ledcSetup(FAN_PWM_CHANNEL, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(FAN_PIN, FAN_PWM_CHANNEL);
    ledcWrite(FAN_PWM_CHANNEL, 0); // Start with OFF
    
    // Configure PWM for Light
    ledcSetup(LIGHT_PWM_CHANNEL, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(LIGHT_PIN, LIGHT_PWM_CHANNEL);
    ledcWrite(LIGHT_PWM_CHANNEL, 0); // Start with OFF
    
    Serial.println(" Device Control initialized");
    Serial.print("   Fan Pin: GPIO ");
    Serial.println(FAN_PIN);
    Serial.print("   Light Pin: GPIO ");
    Serial.println(LIGHT_PIN);
}

// ============================================
// Fan Control
// ============================================
void setFanLevel(int level) {
    // Validate level
    if (level < 0) level = 0;
    if (level > 3) level = 3;
    
    // Update global state
    fan_level = level;
    fan_auto_mode = false; // Manual control disables auto mode
    
    // Set PWM duty cycle
    int duty = PWM_LEVELS[level];
    ledcWrite(FAN_PWM_CHANNEL, duty);
    
    Serial.print(" Fan set to level ");
    Serial.print(level);
    Serial.print(" (duty: ");
    Serial.print((duty * 100) / 255);
    Serial.println("%)");
}

// ============================================
// Light Control
// ============================================
void setLightLevel(int level) {
    // Validate level
    if (level < 0) level = 0;
    if (level > 3) level = 3;
    
    // Update global state
    light_level = level;
    light_auto_mode = false; // Manual control disables auto mode
    
    // Set PWM duty cycle
    int duty = PWM_LEVELS[level];
    ledcWrite(LIGHT_PWM_CHANNEL, duty);
    
    Serial.print(" Light set to level ");
    Serial.print(level);
    Serial.print(" (duty: ");
    Serial.print((duty * 100) / 255);
    Serial.println("%)");
}

// ============================================
// Auto Mode Control
// ============================================
void setFanAuto(bool enabled) {
    fan_auto_mode = enabled;
    
    if (enabled) {
        Serial.println(" Fan AUTO mode enabled");
    } else {
        Serial.println(" Fan MANUAL mode");
    }
}

void setLightAuto(bool enabled) {
    light_auto_mode = enabled;
    
    if (enabled) {
        Serial.println(" Light AUTO mode enabled");
    } else {
        Serial.println(" Light MANUAL mode");
    }
}

// ============================================
// Auto Mode Logic
// ============================================
void updateAutoControl() {
    // Fan Auto Mode - Based on Temperature OR Humidity
    if (fan_auto_mode) {
        int new_level;
        
        // Thresholds (matching backend defaults)
        const float TEMP_THRESHOLD = 35.0;      // 35°C
        const float HUMIDITY_THRESHOLD = 60.0;  // 60%
        
        // Turn ON if temp >= threshold OR humidity >= threshold
        if (glob_temperature >= TEMP_THRESHOLD || glob_humidity >= HUMIDITY_THRESHOLD) {
            new_level = fan_level > 0 ? fan_level : 2; // Use current level or default to Medium
        } else {
            new_level = 0; // OFF if both are below thresholds
        }
        
        // Only update if level changed
        if (new_level != fan_level) {
            fan_level = new_level;
            int duty = PWM_LEVELS[new_level];
            ledcWrite(FAN_PWM_CHANNEL, duty);
            
            Serial.print(" Fan AUTO adjusted to level ");
            Serial.print(new_level);
            Serial.print(" (temp: ");
            Serial.print(glob_temperature);
            Serial.print("°C, humi: ");
            Serial.print(glob_humidity);
            Serial.println("%)");
        }
    }
    
    // Light Auto Mode - Based on Ambient Light Threshold
    if (light_auto_mode) {
        int new_level;
        
        // Threshold (matching backend default)
        const float LIGHT_THRESHOLD = 300.0;  // 300 lux (can be configured from web)
        
        // Turn ON if light <= threshold (dark), OFF if > threshold (bright)
        if (glob_light_lux <= LIGHT_THRESHOLD) {
            new_level = light_level > 0 ? light_level : 2; // Use current level or default to Medium
        } else {
            new_level = 0; // OFF if bright enough
        }
        
        // Only update if level changed
        if (new_level != light_level) {
            light_level = new_level;
            int duty = PWM_LEVELS[new_level];
            ledcWrite(LIGHT_PWM_CHANNEL, duty);
            
            Serial.print(" Light AUTO adjusted to level ");
            Serial.print(new_level);
            Serial.print(" (ambient: ");
            Serial.print(glob_light_lux);
            Serial.println(" lux)");
        }
    }
}
