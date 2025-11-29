#ifndef __DEVICE_CONTROL_H__
#define __DEVICE_CONTROL_H__

#include <Arduino.h>

// ============================================
// GPIO Pin Definitions
// ============================================
#define FAN_PIN     2  // GPIO 2 for Fan control
#define LIGHT_PIN   3  // GPIO 3 for Light control

// ============================================
// PWM Configuration
// ============================================
#define PWM_FREQ        5000    // 5 KHz
#define PWM_RESOLUTION  8       // 8-bit (0-255)
#define FAN_PWM_CHANNEL    0    // PWM channel for fan
#define LIGHT_PWM_CHANNEL  1    // PWM channel for light

// ============================================
// Device Control Functions
// ============================================

/**
 * Initialize device control - setup GPIO pins and PWM
 */
void initDeviceControl();

/**
 * Set fan level (0-3)
 * 0 = OFF, 1 = Low (33%), 2 = Medium (66%), 3 = High (100%)
 */
void setFanLevel(int level);

/**
 * Set light level (0-3)
 * 0 = OFF, 1 = Low (33%), 2 = Medium (66%), 3 = High (100%)
 */
void setLightLevel(int level);

/**
 * Enable/disable fan auto mode
 * Auto mode adjusts fan based on temperature
 */
void setFanAuto(bool enabled);

/**
 * Enable/disable light auto mode
 * Auto mode adjusts light based on ambient light sensor
 */
void setLightAuto(bool enabled);

/**
 * Update auto mode logic - call periodically
 * Adjusts fan and light based on sensor readings if in auto mode
 */
void updateAutoControl();

#endif
