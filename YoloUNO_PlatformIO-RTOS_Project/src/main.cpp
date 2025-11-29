#include "global.h"
#include "led_blinky.h"
#include "neo_blinky.h"
#include "temp_humi_monitor.h"
#include "mainserver.h"
#include "tinyml.h"
// #include "coreiot.h"
#include "light_sensor.h"
#include "gateway.h"
#include "device_control.h"
#include "pir_sensor.h"





void setup() {
  Serial.begin(115200);
  
  // Initialize device control (Fan & Light)
  initDeviceControl();
  
  // xTaskCreate(startSSE, "Task SSE" ,32768  ,NULL  ,2 , NULL);
  // xTaskCreate(led_blinky, "Task LED Blink" ,2048  ,NULL  ,2 , NULL);
  //xTaskCreate(neo_blinky, "Task NEO Blink" ,2048  ,NULL  ,2 , NULL);
    xTaskCreate(temp_humi_monitor, "Task TEMP HUMI Monitor" ,2048  ,NULL  ,2 , NULL);
  xTaskCreate(light_sensor_monitor, "Task GL5528 Monitor" ,4096  ,NULL  ,2 , NULL);
  xTaskCreate(pir_sensor_monitor, "Task PIR AS312 Monitor" ,2048  ,NULL  ,2 , NULL);
   xTaskCreate(main_server_task, "Task Main Server" ,32768  ,NULL  ,2 , NULL);
   xTaskCreate(gateway_task, "Task Gateway Command Handler" ,4096  ,NULL  ,2 , NULL);
  //xTaskCreate( tiny_ml_task, "Tiny ML Task" ,2048  ,NULL  ,2 , NULL);
  //xTaskCreate(coreiot_task, "CoreIOT Task" ,4096  ,NULL  ,2 , NULL);
}

void loop() {
  
}