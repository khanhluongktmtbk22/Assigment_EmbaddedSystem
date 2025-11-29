
#include "light_sensor.h"

void light_sensor_monitor(void *pvParameters) {
    
    Serial.begin(115200);
    
    LMV358Light lightSensor(LIGHT_SENSOR_PIN, 3.3, 1.0);
    lightSensor.begin();

    Serial.println("GL5528 Light Sensor initialized");

    while (1) {
        // Read light sensor percentage
        float light_percent = lightSensor.readPercent();
        
        // Update global variable
        glob_light_lux = light_percent;
        
        // Print sensor data
        // printf("Light Level: %.2f %% (Voltage: %.2f V, Raw: %d)\n", 
        //        light_percent, 
        //        lightSensor.readVoltage(), 
        //        lightSensor.readRaw());
        
        // Delay for 5 seconds
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}
