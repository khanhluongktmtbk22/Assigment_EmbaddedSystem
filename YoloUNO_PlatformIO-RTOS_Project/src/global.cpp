#include "global.h"
float glob_temperature = 0;
float glob_humidity = 0;
float glob_light_lux = 0;
bool glob_pir_detected = false;  // PIR starts with no motion detected


const char* serverBase = "http://10.255.194.234:3000"; 
String ssid = "ESP32-YOUR NETWORK HERE!!!";
String password = "12345678";
String wifi_ssid = "COOLER";
String wifi_password = "11111111";
boolean isWifiConnected = false;
SemaphoreHandle_t xBinarySemaphoreInternet = xSemaphoreCreateBinary();
bool led1_state = false;
bool led2_state = false;

unsigned long connect_start_ms = 0;
bool connecting = false;

// Device Control States
int fan_level = 0;              // Start with OFF
int light_level = 0;            // Start with OFF
bool fan_auto_mode = false;     // Start in manual mode
bool light_auto_mode = false;   // Start in manual mode

// Gateway Configuration
unsigned long send_interval_ms = 5000; // Default 5 seconds