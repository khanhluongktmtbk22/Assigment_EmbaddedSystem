#ifndef __GLOBAL_H__
#define __GLOBAL_H__

#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"


extern float glob_temperature;
extern float glob_humidity;
extern float glob_light_lux;
extern bool glob_pir_detected;  // PIR motion detection status


extern String ssid;
extern String password;
extern String wifi_ssid;
extern String wifi_password;
extern boolean isWifiConnected;
extern SemaphoreHandle_t xBinarySemaphoreInternet;
extern const char* serverBase;
extern bool led1_state;
extern bool led2_state;
extern unsigned long connect_start_ms;
extern bool connecting;

// Device Control States
extern int fan_level;        // 0-3: OFF, Low, Medium, High
extern int light_level;      // 0-3: OFF, Low, Medium, High
extern bool fan_auto_mode;   // true = auto mode, false = manual
extern bool light_auto_mode; // true = auto mode, false = manual

// Gateway Configuration
extern unsigned long send_interval_ms; // Sensor data send interval in milliseconds
#endif