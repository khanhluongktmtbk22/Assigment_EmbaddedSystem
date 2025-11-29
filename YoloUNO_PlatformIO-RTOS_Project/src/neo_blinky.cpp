#include "neo_blinky.h"
// Keep strip private to this file
static Adafruit_NeoPixel strip(LED_COUNT, NEO_PIN, NEO_GRB + NEO_KHZ800);

static void _write_color(uint8_t r, uint8_t g, uint8_t b){
    strip.setPixelColor(0, strip.Color(r, g, b));
    strip.show();
}

void neo_set_on(bool on){
    if (on) _write_color(0, 200, 120);
    else _write_color(0, 0, 0);
}

void neo_set_color(uint8_t r, uint8_t g, uint8_t b){
    _write_color(r,g,b);
}

void neo_blinky(void *pvParameters){
    strip.begin();
    strip.clear();
    strip.show();

    // Keep task alive; actual control happens via neo_set_on/neo_set_color
    while(1){
        vTaskDelay(500);
    }
}