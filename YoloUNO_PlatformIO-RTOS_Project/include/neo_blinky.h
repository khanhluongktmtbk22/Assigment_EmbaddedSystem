#ifndef __NEO_BLINKY__
#define __NEO_BLINKY__
#include <Arduino.h>
#include <Adafruit_NeoPixel.h>



#define NEO_PIN 45
#define LED_COUNT 1 

void neo_blinky(void *pvParameters);

// Safe API for other modules to control NeoPixel without accessing strip directly.
void neo_set_on(bool on);
void neo_set_color(uint8_t r, uint8_t g, uint8_t b);


#endif