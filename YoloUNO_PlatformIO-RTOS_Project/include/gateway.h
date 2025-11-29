#ifndef __GATEWAY_H__
#define __GATEWAY_H__

#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

// Gateway task - handles MQTT communication with Python gateway over WiFi
void gateway_task(void *pvParameters);

// Send sensor data via MQTT
void sendSensorDataMQTT(float temp, float hum, float light, float pres);

#endif