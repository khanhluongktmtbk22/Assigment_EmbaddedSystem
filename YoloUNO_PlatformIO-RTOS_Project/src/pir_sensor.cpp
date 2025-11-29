#include "pir_sensor.h"

void pir_sensor_monitor(void *pvParameters) {
    Serial.begin(115200);
    
    // Initialize PIR sensor pin as INPUT
    pinMode(PIR_SENSOR_PIN, INPUT);
    
    Serial.println(" AS312 PIR Sensor initialized on GPIO 6");
    
    while (1) {
        // Read digital signal from PIR sensor
        int pirState = digitalRead(PIR_SENSOR_PIN);
        
        // Update global variable
        glob_pir_detected = (pirState == HIGH);
        
        // Print sensor status
        // if (glob_pir_detected) {
        //     Serial.println(" Motion detected!");
        // } else {
        //     Serial.println(" No motion");
        // }
        
        // Delay for 500ms (faster response than other sensors)
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
