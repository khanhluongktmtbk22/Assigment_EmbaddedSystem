# BÁO CÁO THIẾT KẾ HỆ THỐNG SMART CLASSROOM IOT

> **Hệ thống giám sát và điều khiển lớp học thông minh**  
> Tích hợp ESP32, MQTT Gateway, Backend API, và Web Dashboard

------------------------------------------------------------------------

## 3. Thiết Kế Hệ Thống

### 3.1. Sơ Đồ Khối Tổng Thể

Hệ thống Smart Classroom bao gồm 4 thành phần chính:

``` mermaid
graph TB
    subgraph ESP32["🔧 ESP32 YoloUNO"]
        direction TB
        SENSORS["📊 Sensors
DHT20 Temperature/Humidity
GL5528 Light Sensor
PIR AS312 Motion"]
        DEVICES["⚙️ Actuators
Fan (PWM GPIO2)
Light (PWM GPIO3)"]
        TASKS["🔄 FreeRTOS Tasks
temp_humi_monitor
light_sensor_monitor
pir_sensor_monitor
gateway_task
main_server_task
device_control"]
        
        SENSORS --> TASKS
        TASKS --> DEVICES
    end
    
    subgraph GATEWAY["🌉 Python MQTT Gateway"]
        BROKER["📡 MQTT Broker
Port: 1883
hbmqtt"]
        SUB["📥 MQTT Subscriber
Topic: yolouno/sensor"]
        PUB["📤 MQTT Publisher
Topics: yolouno/command
yolouno/wifi"]
        SSE_CLIENT["🔌 Backend SSE Client
Receives commands"]
        
        BROKER --> SUB
        BROKER --> PUB
    end
    
    subgraph BACKEND["🖥️ Backend Server "]
        API["🔗 Express API
Port: 3000"]
        DB["💾 MongoDB"]
        SSE_STREAM["📡 SSE Streaming
commandStream
sensorStream"]
        
        API --> DB
        API --> SSE_STREAM
    end
    
    subgraph FRONTEND["🌐 Web Frontend"]
        DASHBOARD["📊 Dashboard
Real-time Charts"]
        CONTROL["🎛️ Device Control Panel"]
        CONFIG["⚙️ Configuration
WiFi, Interval"]
        
        DASHBOARD --- CONTROL
        CONTROL --- CONFIG
    end
    
    ESP32 -->|"MQTT Publish
yolouno/sensor
(JSON)"| BROKER
    BROKER -->|Subscribe| SUB
    SUB -->|"HTTP POST
/api/iot/sensor"| API
    
    API -->|"SSE Stream
/api/iot/commandStream"| SSE_CLIENT
    SSE_CLIENT -->|"MQTT Publish
yolouno/command"| PUB
    PUB -->|Subscribe| ESP32
    
    FRONTEND -->|"HTTP GET/POST
REST API"| API
    API -->|"SSE Stream
/api/stream/sensor"| FRONTEND
    
    style ESP32 fill:#e1f5ff
    style GATEWAY fill:#fff3e0
    style BACKEND fill:#f3e5f5
    style FRONTEND fill:#e8f5e9
```

### 3.2. Sơ Đồ Kết Nối Phần Cứng

#### 3.2.1. ESP32 YoloUNO Board

``` mermaid
graph LR
    subgraph ESP32["ESP32-S3 YoloUNO Board"]
        MCU["ESP32-S3
Dual Core
WiFi Built-in"]
    end
    
    subgraph SENSORS["📊 Sensors"]
        DHT20["DHT20
I2C Temperature
and Humidity"]
        LIGHT["GL5528
Analog Light
Sensor"]
        PIR["PIR AS312
Digital Motion
Sensor"]
    end
    
    subgraph ACTUATORS["⚙️ Actuators"]
        FAN["Fan Motor
PWM Control"]
        LIGHTS["LED Lights
PWM Control"]
    end
    
    MCU -->|"I2C SDA/SCL"| DHT20
    MCU -->|"Analog Pin"| LIGHT
    MCU -->|"Digital Pin"| PIR
    MCU -->|"GPIO2 (PWM Ch0)"| FAN
    MCU -->|"GPIO3 (PWM Ch1)"| LIGHTS
    
    MCU -.->|"WiFi 802.11 b/g/n"| WIFI["📶 WiFi Network"]
    
    style ESP32 fill:#bbdefb
    style SENSORS fill:#c8e6c9
    style ACTUATORS fill:#ffccbc
```

#### 3.2.2. Chi Tiết Kết Nối

| **Thiết bị** | **Loại** | **Giao tiếp** | **Pin/Channel** | **Thư viện** |
|----|----|----|----|----|
| DHT20 | Temperature/Humidity | I2C | SDA, SCL | DHT20 |
| GL5528 | Light Sensor | Analog | ADC Pin | lightSensor |
| PIR AS312 | Motion Sensor | Digital GPIO | Digital Pin | GPIO |
| Fan Motor | Actuator | PWM | GPIO 2 (PWM Ch 0) | ledcSetup/ledcWrite |
| LED Light | Actuator | PWM | GPIO 3 (PWM Ch 1) | ledcSetup/ledcWrite |

**PWM Configuration:**

- Frequency: 5000 Hz (5 KHz)
- Resolution: 8-bit (0-255)
- Levels: 0 (OFF), 1 (33%), 2 (66%), 3 (100%)

### 3.3. Thiết Kế Phần Mềm

#### 3.3.1. Luồng Chương Trình (Flowchart)

``` mermaid
flowchart TD
    START([Start ESP32]) --> INIT[Initialize Serial
and Device Control]
    INIT --> CREATE_TASKS[Create FreeRTOS Tasks]
    
    CREATE_TASKS --> TASK1[temp_humi_monitor]
    CREATE_TASKS --> TASK2[light_sensor_monitor]
    CREATE_TASKS --> TASK3[pir_sensor_monitor]
    CREATE_TASKS --> TASK4[main_server_task]
    CREATE_TASKS --> TASK5[gateway_task]
    
    TASK1 --> T1_READ[Read DHT20
Temp and Humidity]
    T1_READ --> T1_UPDATE[Update Global Variables
glob_temperature
glob_humidity]
    T1_UPDATE --> T1_AUTO{Auto Mode
Enabled?}
    T1_AUTO -->|Yes| T1_CHECK[Check Thresholds]
    T1_CHECK --> T1_CONTROL[Update Fan Level]
    T1_AUTO -->|No| T1_DELAY[Delay]
    T1_CONTROL --> T1_DELAY
    T1_DELAY --> T1_READ
    
    TASK2 --> T2_READ[Read GL5528
Light Sensor]
    T2_READ --> T2_UPDATE[Update glob_light_lux]
    T2_UPDATE --> T2_AUTO{Auto Mode
Enabled?}
    T2_AUTO -->|Yes| T2_CHECK[Check Light Threshold]
    T2_CHECK --> T2_CONTROL[Update Light Level]
    T2_AUTO -->|No| T2_DELAY[Delay]
    T2_CONTROL --> T2_DELAY
    T2_DELAY --> T2_READ
    
    TASK3 --> T3_READ[Read PIR AS312
Motion Sensor]
    T3_READ --> T3_UPDATE[Update glob_pir_detected]
    T3_UPDATE --> T3_DELAY[Delay]
    T3_DELAY --> T3_READ
    
    TASK4 --> T4_WIFI{WiFi
Connected?}
    T4_WIFI -->|No| T4_CONNECT[Connect WiFi]
    T4_CONNECT --> T4_WIFI
    T4_WIFI -->|Yes| T4_WAIT[Wait for Interval]
    T4_WAIT --> T4_READ[Read All Sensor Data]
    T4_READ --> T4_MQTT[Send via MQTT]
    T4_MQTT --> T4_WAIT
    
    TASK5 --> T5_WIFI{WiFi
Connected?}
    T5_WIFI -->|No| T5_DELAY_NO[Delay and Retry]
    T5_DELAY_NO --> T5_WIFI
    T5_WIFI -->|Yes| T5_CONNECT[Connect to
MQTT Broker]
    T5_CONNECT --> T5_SUB[Subscribe to
yolouno/command
yolouno/wifi]
    T5_SUB --> T5_LISTEN[Listen for Commands]
    T5_LISTEN --> T5_MSG{Message
Received?}
    T5_MSG -->|Yes| T5_PARSE[Parse JSON]
    T5_PARSE --> T5_CMD{Command
Type?}
    T5_CMD -->|FAN| T5_FAN[Set Fan Level]
    T5_CMD -->|LIGHT| T5_LIGHT[Set Light Level]
    T5_CMD -->|INTERVAL| T5_INT[Update Send Interval]
    T5_CMD -->|WIFI| T5_WIFI_CFG[Update WiFi Config]
    T5_FAN --> T5_LISTEN
    T5_LIGHT --> T5_LISTEN
    T5_INT --> T5_LISTEN
    T5_WIFI_CFG --> T5_RECONNECT[Reconnect WiFi]
    T5_RECONNECT --> T5_WIFI
    T5_MSG -->|No| T5_LISTEN
    
    style START fill:#4caf50
    style CREATE_TASKS fill:#2196f3
    style T1_READ fill:#ff9800
    style T2_READ fill:#ff9800
    style T3_READ fill:#ff9800
    style T4_READ fill:#ff9800
    style T1_CONTROL fill:#9c27b0
    style T2_CONTROL fill:#9c27b0
```

#### 3.3.2. State Diagram - Gateway MQTT Bridge

``` mermaid
stateDiagram-v2
    [*] --> Starting
    Starting --> BrokerStarting: Start MQTT Broker Thread
    BrokerStarting --> SubscriberConnecting: Broker Ready (5s delay)
    SubscriberConnecting --> PublisherConnecting: Subscriber Connected
    PublisherConnecting --> SSEConnecting: Publisher Connected
    SSEConnecting --> Running: SSE Stream Connected
    
    state Running {
        [*] --> Listening
        Listening --> SensorReceived: MQTT topic sensor
        SensorReceived --> ForwardingToBackend: Parse JSON
        ForwardingToBackend --> Listening: HTTP POST sensor data
        
        Listening --> CommandReceived: SSE command event
        CommandReceived --> PublishingCommand: Parse Command
        PublishingCommand --> Listening: MQTT Publish command
        
        Listening --> WiFiReceived: SSE wifi event
        WiFiReceived --> PublishingWiFi: Parse WiFi Config
        PublishingWiFi --> Listening: MQTT Publish wifi config
    }
    
    Running --> Error: Connection Lost
    Error --> Reconnecting: Retry Connection
    Reconnecting --> Running: Connected
    Reconnecting --> Error: Failed (retry in 5s)
```

### 3.4. Mô Tả Chức Năng Từng Module

#### 3.4.1. ESP32 Firmware Modules

| **Module** | **File** | **Chức năng** | **FreeRTOS Task** |
|----|----|----|----|
| **Temperature and Humidity Monitor** | `temp_humi_monitor.cpp` | Đọc dữ liệu từ cảm biến DHT20 qua I2C, cập nhật biến toàn cục `glob_temperature` và `glob_humidity`. Kiểm tra auto mode để tự động điều khiển quạt. | `temp_humi_monitor` |
| **Light Sensor Monitor** | `light_sensor.cpp` | Đọc cường độ ánh sáng từ GL5528 (analog), chuyển đổi sang lux, cập nhật `glob_light_lux`. Kiểm tra auto mode để tự động điều khiển đèn. | `light_sensor_monitor` |
| **PIR Motion Sensor** | `pir_sensor.cpp` | Đọc tín hiệu chuyển động từ PIR AS312 (digital), cập nhật `glob_pir_detected` để phát hiện có người trong phòng. | `pir_sensor_monitor` |
| **Device Control** | `device_control.cpp` | Điều khiển quạt và đèn qua PWM (GPIO 2 và 3). Hỗ trợ 4 mức: OFF (0), Low (1), Medium (2), High (3). Quản lý chế độ Auto/Manual. | N/A (called by other tasks) |
| **Main Server Task** | `mainserver.cpp` | Kết nối WiFi, định kỳ gửi dữ liệu cảm biến qua MQTT theo interval (mặc định 5s). | `main_server_task` |
| **Gateway Task** | `gateway.cpp` | Kết nối MQTT broker (Python Gateway), subscribe các topic nhận lệnh (`yolouno/command`, `yolouno/wifi`), xử lý lệnh điều khiển từ backend. | `gateway_task` |

#### 3.4.2. Python MQTT Gateway

| **Component** | **Chức năng** |
|----|----|
| **MQTT Broker** | Chạy embedded MQTT broker (hbmqtt) trên port 1883, cho phép ESP32 và các client kết nối. |
| **MQTT Subscriber** | Subscribe topic `yolouno/sensor`, nhận dữ liệu cảm biến từ ESP32, forward đến Backend qua HTTP POST `/api/iot/sensor`. |
| **MQTT Publisher** | Publish lệnh điều khiển đến ESP32 qua topics `yolouno/command` (FAN/LIGHT/INTERVAL) và `yolouno/wifi` (WiFi config). |
| **Backend SSE Listener** | Kết nối SSE stream `/api/iot/commandStream` từ Backend, nhận lệnh từ Web UI, chuyển thành MQTT message gửi ESP32. |

#### 3.4.3. Backend Server (Node.js)

| **Module** | **File** | **Chức năng** |
|----|----|----|
| **Server** | `server.js` | Khởi tạo Express server, kết nối MongoDB, cấu hình CORS và middleware. |
| **Router** | `router.js` | Định nghĩa các API routes cho sensor data, device control, action history, SSE streaming. |
| **Controller** | `controller.js` | Xử lý logic nghiệp vụ: quản lý thiết bị (fan, light), auto mode, lưu sensor data vào DB, xử lý action history, streaming SSE. |
| **Database** | MongoDB | Collections: `users`, `sensorData`, `actionHistory`. Lưu trữ dữ liệu lịch sử cảm biến, hành động điều khiển. |

**Key Functions:**

- `updateSensorData`: Nhận dữ liệu từ Gateway, broadcast qua SSE, lưu vào DB, kiểm tra auto mode để điều khiển thiết bị.
- `commandStream`: SSE endpoint để Gateway subscribe, nhận lệnh điều khiển từ Web UI.
- `streamSensor`: SSE endpoint để Frontend nhận real-time sensor data.
- `configureWifi`, `configureInterval`: API để cấu hình WiFi và interval gửi dữ liệu từ Web UI.

#### 3.4.4. Web Frontend (React)

| **Component** | **Chức năng** |
|----|----|
| **Dashboard** | Hiển thị real-time charts (temperature, humidity, light) sử dụng Chart.js. Kết nối SSE `/api/stream/sensor` để nhận dữ liệu real-time. |
| **Device Control Panel** | Điều khiển quạt và đèn (ON/OFF, level 1-3), bật/tắt auto mode, gửi lệnh qua API. |
| **Configuration** | Cấu hình WiFi (SSID, password), data send interval, gửi lệnh qua API `/api/config/wifi` và `/api/config/interval`. |
| **Action History** | Xem lịch sử hành động điều khiển với phân trang, lọc theo thời gian. |

**Technology Stack:**

- React 19.1 với React Router 7.7
- Chart.js + react-chartjs-2 cho visualization
- Tailwind CSS 4.1 cho styling
- Lucide React icons
- SSE client để nhận real-time updates

### 3.5. Giao Thức Truyền Dữ Liệu

#### 3.5.1. MQTT Protocol

``` mermaid
sequenceDiagram
    participant ESP32
    participant Gateway as MQTT Gateway (Python)
    participant Backend as Backend Server (Node.js)
    
    Note over ESP32,Gateway: MQTT Communication (Port 1883)
    
    ESP32->>Gateway: CONNECT (MQTT v3.11)
    Gateway-->>ESP32: CONNACK
    
    ESP32->>Gateway: SUBSCRIBE yolouno/command
    ESP32->>Gateway: SUBSCRIBE yolouno/wifi
    Gateway-->>ESP32: SUBACK
    
    loop Every Interval (default 5s)
        ESP32->>Gateway: PUBLISH yolouno/sensor {"TEMP":25.5,"HUMI":60,"LIGHT":450,"PRES":1}
        Gateway->>Backend: HTTP POST /api/iot/sensor {"TEMP":25.5,"HUMI":60,"LIGHT":450,"PRES":1}
        Backend-->>Gateway: 200 OK
    end
    
    Note over Gateway,Backend: SSE Stream for Commands
    Gateway->>Backend: GET /api/iot/commandStream (SSE Connection)
    
    Backend-->>Gateway: event: command data: {"device":"FAN","value":"MANUAL2"}
    Gateway->>ESP32: PUBLISH yolouno/command {"device":"FAN","value":"MANUAL2"}
    
    Backend-->>Gateway: event: wifi data: {"device":"MySSID","value":"password123"}
    Gateway->>ESP32: PUBLISH yolouno/wifi {"ssid":"MySSID","password":"password123"}
```

**MQTT Topics:**

| **Topic** | **Direction** | **QoS** | **Payload Format** | **Purpose** |
|----|----|----|----|----|
| `yolouno/sensor` | ESP32 → Gateway | 0 | `{"TEMP":float,"HUMI":float,"LIGHT":float,"PRES":int}` | Sensor data publishing |
| `yolouno/command` | Gateway → ESP32 | 0 | `{"device":"FAN\|LIGHT\|INTERVAL","value":"MANUAL0\|MANUAL1\|MANUAL2\|MANUAL3\|AUTO"}` | Device control commands |
| `yolouno/wifi` | Gateway → ESP32 | 0 | `{"ssid":"string","password":"string"}` | WiFi configuration |

#### 3.5.2. HTTP/REST API

**Backend API Endpoints:**

| **Method** | **Endpoint** | **Payload** | **Response** | **Purpose** |
|----|----|----|----|----|
| POST | `/api/iot/sensor` | `{"TEMP":25.5,"HUMI":60,"LIGHT":450,"PRES":1}` | `200 OK` | Gateway forwards sensor data |
| GET | `/api/iot/commandStream` | N/A | SSE Stream | Gateway subscribes for commands |
| GET | `/api/stream/sensor` | N/A | SSE Stream | Frontend subscribes for real-time sensor data |
| POST | `/api/config/wifi` | `{"ssid":"MyWiFi","password":"pass123"}` | `{"message":"WiFi configuration sent"}` | Configure ESP32 WiFi |
| POST | `/api/config/interval` | `{"interval":5}` | `{"message":"Interval configuration sent"}` | Set sensor data send interval (seconds) |
| POST | `/api/device/:name/toggle` | N/A | Device status JSON | Toggle device ON/OFF |
| POST | `/api/device/:name/auto` | N/A | Device status JSON | Toggle auto mode |
| POST | `/api/device/:name/level` | `{"level":1-3}` | Device status JSON | Set device level |
| GET | `/api/sensor/temperature?duration=5` | N/A | `{"temperatures":[...]}` | Get temperature history |
| GET | `/api/sensor/humidity?duration=5` | N/A | `{"humidities":[...]}` | Get humidity history |
| GET | `/api/sensor/light?duration=5` | N/A | `{"lightLevels":[...]}` | Get light level history |
| GET | `/api/history/action?page=1&limit=20` | N/A | `{"totalPages":N,"actions":[...]}` | Get action history with pagination |

#### 3.5.3. Server-Sent Events (SSE)

**SSE Streams:**

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr>
<th><strong>Endpoint</strong></th>
<th><strong>Event Types</strong></th>
<th><strong>Data Format</strong></th>
<th><strong>Client</strong></th>
<th><strong>Purpose</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/api/stream/sensor</code></td>
<td><code>event: sensor</code></td>
<td><code>{"TEMP":25.5,"HUMI":60,"LIGHT":450,"PRES":1}</code></td>
<td>Frontend</td>
<td>Real-time sensor data for dashboard charts</td>
</tr>
<tr>
<td><code>/api/stream/status</code></td>
<td><code>event: status</code></td>
<td><code>{"fan":true,"light":false}</code></td>
<td>Frontend</td>
<td>Real-time device status updates</td>
</tr>
<tr>
<td><code>/api/iot/commandStream</code></td>
<td><code>event: command</code><br />
<code>event: wifi</code><br />
<code>event: interval</code></td>
<td><code>{"device":"FAN","value":"MANUAL2"}</code><br />
<code>{"device":"SSID","value":"password"}</code><br />
<code>{"type":"interval","value":"5"}</code></td>
<td>Gateway</td>
<td>Commands from Backend to Gateway for ESP32</td>
</tr>
</tbody>
</table>

**SSE Connection Flow:**

``` hljs
// Frontend SSE Client (JavaScript)
const eventSource = new EventSource('http://localhost:3000/api/stream/sensor');
eventSource.addEventListener('sensor', (event) => {
  const data = JSON.parse(event.data);
  updateChart(data);
});
```

``` hljs
# Gateway SSE Client (Python)
from sseclient import SSEClient
response = requests.get('http://localhost:3000/api/iot/commandStream', stream=True)
client = SSEClient(response)
for event in client.events():
    if event.event == 'command':
        data = json.loads(event.data)
        publish_command_to_esp32(data)
```

### 3.6. Thiết Kế Giao Diện (Web Dashboard)

#### 3.6.1. Dashboard Layout

``` mermaid
graph LR
    subgraph DASHBOARD["📊 DASHBOARD"]
        HEADER["🎯 Header"]
        
        subgraph ROW1["Real-time Sensors"]
            TEMP["🌡️ Temp: 25.5°C"]
            HUMI["💧 Humi: 60%"]
            LIGHT["💡 Light: 450lux"]
            PIR["👤 Motion"]
        end
        
        subgraph ROW2["Device Control"]
            FAN["🌀 Fan
Level 0-3
Auto"]
            LIGHT_C["💡 Light
Level 0-3
Auto"]
        end
        
        subgraph ROW3["Configuration and History"]
            WIFI["📶 WiFi"]
            INTERVAL["⏱️ Interval"]
            HISTORY["📜 History"]
        end
        
        HEADER --> ROW1
        ROW1 --> ROW2
        ROW2 --> ROW3
    end
    
    style DASHBOARD fill:#e3f2fd
    style ROW1 fill:#c8e6c9
    style ROW2 fill:#fff9c4
    style ROW3 fill:#ffe0b2
```
