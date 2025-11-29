#!/usr/bin/env python3
"""
MQTT Gateway Bridge
===================
Bridges communication between ESP32 (via MQTT) and Web Backend (via HTTP/SSE).

Architecture:
- Runs local MQTT broker on 0.0.0.0:1883
- Subscribes to ESP32 sensor data (yolouno/sensor)
- Forwards sensor data to backend HTTP endpoint
- Receives commands from backend SSE stream
- Publishes commands to ESP32 via MQTT topics

Author: Gateway Bridge System
Date: 2025-11-27
"""

import asyncio
import json
import threading
import time
import requests
from hbmqtt.broker import Broker
import paho.mqtt.client as mqtt
from sseclient import SSEClient

# ============================================================================
# Configuration
# ============================================================================

# MQTT Broker Configuration
MQTT_BROKER_HOST = "0.0.0.0"
MQTT_BROKER_PORT = 1883

# MQTT Topics
TOPIC_SENSOR = "yolouno/sensor"      # ESP32 publishes sensor data here
TOPIC_COMMAND = "yolouno/command"    # Gateway publishes device commands here
TOPIC_WIFI = "yolouno/wifi"          # Gateway publishes WiFi config here

# Backend Server Configuration
BACKEND_HOST = "localhost:3000"
BACKEND_SENSOR_URL = f"http://{BACKEND_HOST}/api/iot/sensor"
BACKEND_COMMAND_STREAM_URL = f"http://{BACKEND_HOST}/api/iot/commandStream"

# MQTT Client for publishing commands to ESP32
mqtt_publisher = None

# ============================================================================
# MQTT Broker
# ============================================================================

broker_config = {
    'listeners': {
        'default': {
            'type': 'tcp',
            'bind': f'{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}'
        }
    },
    'sys_interval': 10,
    'auth': {
        'allow-anonymous': True,
    },
    'topic-check': {
        'enabled': True,
        'plugins': ['topic_taboo']
    }
}

def start_mqtt_broker():
    """Start the embedded MQTT broker in an asyncio event loop."""
    async def broker_coro():
        broker = Broker(broker_config)
        await broker.start()
        print(f" MQTT Broker started on {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
    
    # Get or create event loop for this thread
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    loop.run_until_complete(broker_coro())
    loop.run_forever()

# ============================================================================
# MQTT Subscriber - Listens to ESP32 sensor data
# ============================================================================

def on_message_sensor(client, userdata, msg):
    """Callback when sensor data is received from ESP32."""
    try:
        topic = msg.topic
        payload = msg.payload.decode("utf-8")
        
        print(f" MQTT message from [{topic}]: {payload}")
        
        if topic == TOPIC_SENSOR:
            try:
                # Parse JSON sensor data
                sensor_data = json.loads(payload)
                
                # Forward to backend
                forward_sensor_data_to_backend(sensor_data)
            except json.JSONDecodeError as e:
                print(f"⚠ Message is not JSON, skipping forward to backend: {e}")
                print(f"   Raw payload: {payload}")
            
    except Exception as e:
        print(f" Error processing message: {e}")

def forward_sensor_data_to_backend(sensor_data):
    """Forward sensor data to backend via HTTP POST."""
    try:
        response = requests.post(BACKEND_SENSOR_URL, json=sensor_data, timeout=5)
        if response.status_code == 200:
            print(f" Forwarded sensor data to backend: {sensor_data}")
        else:
            print(f" Backend responded with status {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f" Failed to forward sensor data to backend: {e}")

def on_subscribe_sensor(client, userdata, mid, granted_qos):
    """Callback when subscription is confirmed."""
    print(f" Subscription confirmed with QoS {granted_qos}")

def on_connect_subscriber(client, userdata, flags, rc):
    """Callback when subscriber connects to MQTT broker."""
    if rc == 0:
        print(" MQTT Subscriber connected to broker")
        # Subscribe to sensor topic
        result, mid = client.subscribe(TOPIC_SENSOR, qos=0)
        if result == mqtt.MQTT_ERR_SUCCESS:
            print(f" Subscribing to: {TOPIC_SENSOR} (message_id={mid})")
        else:
            print(f" Subscribe failed with result code {result}")
    else:
        print(f" MQTT Subscriber connection failed with code {rc}")

def run_mqtt_subscriber():
    """Run MQTT subscriber to listen for ESP32 sensor data."""
    client = mqtt.Client("Gateway_Subscriber", protocol=mqtt.MQTTv311)
    client.on_message = on_message_sensor
    client.on_connect = on_connect_subscriber
    client.on_subscribe = on_subscribe_sensor
    
    # Wait for broker to fully start
    time.sleep(5)
    
    print(" Connecting MQTT subscriber to broker...")
    try:
        client.connect("127.0.0.1", MQTT_BROKER_PORT, keepalive=60)
        client.loop_forever()
    except Exception as e:
        print(f" Failed to connect subscriber: {e}")

# ============================================================================
# MQTT Publisher - Sends commands to ESP32
# ============================================================================

def on_connect_publisher(client, userdata, flags, rc):
    """Callback when publisher connects to MQTT broker."""
    if rc == 0:
        print(" MQTT Publisher connected to broker")
    else:
        print(f" MQTT Publisher connection failed with code {rc}")

def setup_mqtt_publisher():
    """Setup MQTT publisher for sending commands to ESP32."""
    global mqtt_publisher
    
    mqtt_publisher = mqtt.Client("Gateway_Publisher", protocol=mqtt.MQTTv311)
    mqtt_publisher.on_connect = on_connect_publisher
    
    # Wait for broker to fully start
    time.sleep(5)
    
    print(" Connecting MQTT publisher to broker...")
    try:
        mqtt_publisher.connect("127.0.0.1", MQTT_BROKER_PORT, keepalive=60)
        mqtt_publisher.loop_start()  # Start loop in background thread
    except Exception as e:
        print(f" Failed to connect publisher: {e}")

def publish_command_to_esp32(command_data):
    """Publish device command to ESP32."""
    try:
        payload = json.dumps(command_data)
        mqtt_publisher.publish(TOPIC_COMMAND, payload, qos=0)
        print(f" Published to {TOPIC_COMMAND}: {payload}")
    except Exception as e:
        print(f" Failed to publish command: {e}")

def publish_wifi_config_to_esp32(ssid, password):
    """Publish WiFi configuration to ESP32."""
    try:
        wifi_config = {
            "ssid": ssid,
            "password": password
        }
        payload = json.dumps(wifi_config)
        mqtt_publisher.publish(TOPIC_WIFI, payload, qos=0)
        print(f" Published WiFi config to {TOPIC_WIFI}: SSID={ssid}")
    except Exception as e:
        print(f" Failed to publish WiFi config: {e}")

# ============================================================================
# Backend SSE Stream - Listens to commands from backend
# ============================================================================

def process_backend_command(event_type, event_data):
    """Process command received from backend SSE stream."""
    try:
        # Parse the SSE event data
        data = json.loads(event_data)
        
        print(f" Backend SSE event [{event_type}]: {data}")
        
        if event_type == "command":
            # Device command (FAN, LIGHT, INTERVAL)
            # Format: {"type": "command", "device": "FAN", "value": "MANUAL2"}
            publish_command_to_esp32(data)
            
        elif event_type == "wifi":
            # WiFi configuration
            # Format: {"type": "wifi", "device": "SSID", "value": "password"}
            ssid = data.get("device")
            password = data.get("value")
            if ssid and password:
                publish_wifi_config_to_esp32(ssid, password)
            else:
                print(" WiFi config missing ssid or password")
                
        elif event_type == "interval":
            # Interval configuration - send as INTERVAL command
            # Format: {"type": "command", "device": "INTERVAL", "value": "5"}
            # Ensure value is string for ESP32's atoi()
            if "value" in data and isinstance(data["value"], int):
                data["value"] = str(data["value"])
            publish_command_to_esp32(data)
            
        else:
            print(f" Unknown event type: {event_type}")
            
    except json.JSONDecodeError as e:
        print(f" Failed to parse backend SSE data: {e}")
    except Exception as e:
        print(f" Error processing backend command: {e}")

def run_backend_sse_listener():
    """Connect to backend SSE stream and listen for commands."""
    retry_delay = 5
    
    while True:
        try:
            print(f" Connecting to backend SSE stream: {BACKEND_COMMAND_STREAM_URL}")
            response = requests.get(BACKEND_COMMAND_STREAM_URL, stream=True, timeout=None)
            
            if response.status_code != 200:
                print(f" Backend SSE connection failed with status {response.status_code}")
                time.sleep(retry_delay)
                continue
            
            print(" Connected to backend SSE stream")
            
            # Process SSE events
            client = SSEClient(response)
            for event in client.events():
                # event.event = event type (e.g., "command", "wifi", "interval")
                # event.data = JSON data
                event_type = event.event if event.event else "message"
                process_backend_command(event_type, event.data)
                
        except requests.exceptions.RequestException as e:
            print(f" Backend SSE connection error: {e}")
            print(f" Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        except Exception as e:
            print(f" Unexpected error in SSE listener: {e}")
            print(f" Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)

# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """Main entry point - starts all components."""
    print("=" * 70)
    print(" MQTT Gateway Bridge Starting...")
    print("=" * 70)
    print(f" MQTT Broker: {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
    print(f" Backend Server: {BACKEND_HOST}")
    print(f" Topics: {TOPIC_SENSOR} (sub), {TOPIC_COMMAND} (pub), {TOPIC_WIFI} (pub)")
    print("=" * 70)
    
    # Start MQTT broker in separate thread
    broker_thread = threading.Thread(target=start_mqtt_broker, daemon=True)
    broker_thread.start()
    print(" MQTT Broker thread started")
    
    # Wait for broker to fully initialize
    time.sleep(4)
    
    # Setup MQTT publisher
    setup_mqtt_publisher()
    
    # Start MQTT subscriber in separate thread
    subscriber_thread = threading.Thread(target=run_mqtt_subscriber, daemon=True)
    subscriber_thread.start()
    print(" MQTT Subscriber thread started")
    
    # Start backend SSE listener in separate thread
    sse_thread = threading.Thread(target=run_backend_sse_listener, daemon=True)
    sse_thread.start()
    print(" Backend SSE listener thread started")
    
    print("\n Gateway Bridge is running. Press Ctrl+C to stop.\n")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n Shutting down Gateway Bridge...")
        print(" Goodbye!")

if __name__ == "__main__":
    main()
