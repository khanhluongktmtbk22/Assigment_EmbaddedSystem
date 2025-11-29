#include "mainserver.h"
#include <WiFi.h>
#include <WebServer.h>


// const char* serverBase = "http://10.255.194.234:3000"; 

// bool led1_state = false;
// bool led2_state = false;
bool isAPMode = true;

WebServer server(80);



// unsigned long connect_start_ms = 0;
// bool connecting = false;

void sendSensorToServer(float temp, float hum, float light) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverBase) + "/api/update";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"temperature\":" + String(temp, 1) + 
                   ",\"humidity\":" + String(hum, 1) + 
                   ",\"light\":" + String(light, 1) + "}";

  int code = http.POST(payload);
  if (code > 0) {
    Serial.printf("POST /api/update => HTTP %d\n", code);
  } else {
    Serial.printf("POST failed, error: %s\n", http.errorToString(code).c_str());
  }

  http.end();
}

// Send sensor data to Python Gateway via Serial
// Format: !TEMP:HUMI:LIGHT:PRES#
void sendSensorToGateway(float temp, float hum, float light, float pres) {
  String message = "!" + String(temp, 1) + ":" + 
                         String(hum, 1) + ":" + 
                         String(light, 0) + ":" + 
                         String(pres, 0) + "#";
  Serial.print(message);
  // Note: Don't use Serial.println as it adds \r\n which interferes with parsing
}

// void startSSE(void *pvParameters) {
//   while (true)
//   {
//     if (isWifiConnected) {Serial.println("SSE event heollo");

//     HTTPClient http;
//     String url = String(serverBase) + "/api/sse";

//     Serial.println("Connecting SSE...");
//     if (!http.begin(url)) {
//       Serial.println("SSE begin failed");
//       return;
//     }

//     int code = http.GET();
//     if (code != HTTP_CODE_OK) {
//       Serial.printf("SSE GET failed: %d\n", code);
//       return;
//     }

//     WiFiClient *stream = http.getStreamPtr();
//     while (stream->connected()) {
//       while (stream->available()) {        
//         String line = stream->readStringUntil('\n');

//         if (line.startsWith("data:")) {
//           String json = line.substring(5);
//           Serial.println("SSE event: " + json);

//           bool newLed1 = json.indexOf("\"led1\":true") > 0;
//           bool newLed2 = json.indexOf("\"led2\":true") > 0;

//           if (newLed1 != led1_state) {
//             led1_state = newLed1;
//             digitalWrite(LED1_PIN, led1_state ? HIGH : LOW);
//           }
//           if (newLed2 != led2_state) {
//             led2_state = newLed2;
//             neo_set_on(led2_state);
//           }
//         }
//       }
//       vTaskDelay(20);
//     }
//     Serial.println("SSE disconnected");
//   }
// }
// }


// void fetchLedStateFromServer() {
//   if (WiFi.status() != WL_CONNECTED) return;

//   HTTPClient http;
//   String url = String(serverBase) + "/api/led_state";
//   http.begin(url);
//   int code = http.GET();

//   if (code == 200) {
//     String payload = http.getString();
//     Serial.println("LED state from server: " + payload);

//     // Parse JSON đơn giản
//     bool newLed1 = payload.indexOf("\"led1\":true") > 0;
//     bool newLed2 = payload.indexOf("\"led2\":true") > 0;

//     if (newLed1 != led1_state) {
//       led1_state = newLed1;
//       digitalWrite(LED1_PIN, led1_state ? HIGH : LOW);
//       Serial.printf("LED1 updated from server: %s\n", led1_state ? "ON" : "OFF");
//     }

//     if (newLed2 != led2_state) {
//       led2_state = newLed2;
//       neo_set_on(led2_state);
//       Serial.printf("LED2 updated from server: %s\n", led2_state ? "ON" : "OFF");
//     }
//   } else {
//     Serial.printf("GET /api/led_state failed, code %d\n", code);
//   }

//   http.end();
// }


String mainPage() {
  float temperature = glob_temperature;
  float humidity = glob_humidity;
  float light = glob_light_lux;
  String led1 = led1_state ? "ON" : "OFF";
  String led2 = led2_state ? "ON" : "OFF";
  return R"rawliteral(
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <meta charset='utf-8'>
      <title>ESP32 Dashboard</title>
      <style>
        :root{--muted:#6b7280}
        html,body{height:100%;margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:#fff}
        /* animated gradient background */
        body{background:linear-gradient(120deg,#0f172a,#3b82f6,#7c3aed);background-size:600% 600%;animation:grad 12s ease infinite}
        @keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

        .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
        .card{width:100%;max-width:480px;background:rgba(255,255,255,0.06);backdrop-filter: blur(6px);border-radius:14px;box-shadow:0 10px 30px rgba(2,6,23,0.4);padding:20px;border:1px solid rgba(255,255,255,0.06)}
        .header{display:flex;align-items:center;justify-content:space-between}
        .title{font-size:20px;font-weight:700}
        .subtitle{font-size:12px;color:rgba(255,255,255,0.8)}
        .sensors{display:flex;gap:12px;margin-top:14px}
        .sensor{flex:1;background:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03));padding:12px;border-radius:10px;text-align:center}
  .sensor .value{display:flex;align-items:baseline;justify-content:center;gap:8px;font-size:20px;font-weight:800;color:#fff}
  .sensor .unit{font-size:12px;color:var(--muted);font-weight:700}
        .controls{display:flex;gap:10px;justify-content:center;margin-top:16px}
        .btn{padding:10px 16px;border-radius:12px;border:none;background:linear-gradient(90deg,#ffffff22,#ffffff11);cursor:pointer;font-weight:700;color:#fff;box-shadow:0 6px 18px rgba(2,6,23,0.35);transition:transform .12s ease, box-shadow .12s ease}
        .btn:active{transform:scale(.98)}
  /* button state colors: off = red, on = green */
  .btn.off{background:linear-gradient(90deg,#ff6b6b,#c92a2a);box-shadow:0 8px 20px rgba(201,42,42,0.28)}
  .btn.on{background:linear-gradient(90deg,#00c176,#2e9e4a);box-shadow:0 8px 20px rgba(46,158,74,0.28)}
        .led-indicator{display:inline-block;width:12px;height:12px;border-radius:50%;margin-left:8px;vertical-align:middle;box-shadow:0 2px 6px rgba(0,0,0,0.4)}
        .footer{display:flex;justify-content:space-between;align-items:center;margin-top:16px;color:rgba(255,255,255,0.8);font-size:13px}
        a.settings{color:rgba(255,255,255,0.9);text-decoration:none;font-size:14px}
        @media (max-width:480px){.card{padding:16px}}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="header">
            <div>
              <div class="title">YoloUNO</div>
              <div class="subtitle">ESP32 Dashboard</div>
            </div>
            <a class="settings" href="/settings">⚙️ Settings</a>
          </div>

          <div class="sensors">
            <div class="sensor">
              <div class="label">🌡️ Temperature</div>
              <div class="value"><span id="temp">)rawliteral" + String(temperature) + R"rawliteral(</span><span class="unit"><strong>&deg;C</strong></span></div>
            </div>
            <div class="sensor">
              <div class="label">💧 Humidity</div>
              <div class="value"><span id="hum">)rawliteral" + String(humidity) + R"rawliteral(</span><span class="unit"><strong>%</strong></span></div>
            </div>
            <div class="sensor">
              <div class="label">💡 Light</div>
              <div class="value"><span id="light">)rawliteral" + String(light) + R"rawliteral(</span><span class="unit"><strong>%</strong></span></div>
            </div>
          </div>

          <div class="controls">
            <button id="btn1" class="btn )rawliteral" + (led1_state ? "on" : "off") + R"rawliteral(" onclick="toggleLED(1)">LED1: <span id="l1">)rawliteral" + led1 + R"rawliteral(</span><span id="ind1" class="led-indicator" style="background:)")rawliteral" + (led1_state ? "rgb(0,200,120)" : "rgb(255,80,80)") + R"rawliteral("></span></button>
            <button id="btn2" class="btn )rawliteral" + (led2_state ? "on" : "off") + R"rawliteral(" onclick="toggleLED(2)">LED2: <span id="l2">)rawliteral" + led2 + R"rawliteral(</span><span id="ind2" class="led-indicator" style="background:)")rawliteral" + (led2_state ? "rgb(0,200,120)" : "rgb(255,80,80)") + R"rawliteral("></span></button>
          </div>



      <script>
        function setBtnState(json){
          document.getElementById('l1').innerText = json.led1;
          document.getElementById('l2').innerText = json.led2;
          // update button classes (ON = green, OFF = red)
          var b1 = document.getElementById('btn1');
          var b2 = document.getElementById('btn2');
          b1.className = 'btn ' + (json.led1==='ON' ? 'on' : 'off');
          b2.className = 'btn ' + (json.led2==='ON' ? 'on' : 'off');
          // indicator colors: ON = green, OFF = red
          document.getElementById('ind1').style.background = json.led1==='ON' ? 'rgb(0,200,120)' : 'rgb(255,80,80)';
          document.getElementById('ind2').style.background = json.led2==='ON' ? 'rgb(0,200,120)' : 'rgb(255,80,80)';
        }

        function toggleLED(id){
          fetch('/toggle?led='+id)
            .then(r=>r.json())
            .then(setBtnState)
            .catch(e=>console.error(e));
        }

        function updateSensors(){
          fetch('/sensors')
            .then(r=>r.json())
            .then(d=>{
              document.getElementById('temp').innerText = d.temp;
              document.getElementById('hum').innerText = d.hum;
              document.getElementById('light').innerText = d.light;
            })
            .catch(e=>console.error(e));
          // also update LED state
          fetch('/toggle?led=0')
            .then(r=>r.json())
            .then(setBtnState)
            .catch(()=>{});
        }

        setInterval(updateSensors,3000);
      </script>
    </body>
    </html>
  )rawliteral";
}

String settingsPage() {
  return R"rawliteral(
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <meta charset='utf-8'>
      <title>Settings - YoloUNO</title>
      <style>
        :root{--bg:#f6f8fb;--card:#fff;--accent:#4b8cff}
        body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:var(--bg);color:#111}
        .wrap{display:flex;align-items:center;justify-content:center;height:100vh;padding:20px}
        .card{width:100%;max-width:420px;background:var(--card);padding:18px;border-radius:12px;box-shadow:0 6px 20px rgba(16,24,40,0.08)}
        h2{margin:0 0 8px 0}
        .row{display:flex;flex-direction:column;gap:8px;margin-top:10px}
        input{padding:10px;border-radius:8px;border:1px solid #e6eefc;width:100%}
        .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
        .btn{padding:8px 12px;border-radius:8px;border:none;background:var(--accent);color:#fff;cursor:pointer}
        .btn.secondary{background:#eef3ff;color:#1f2937}
        .note{font-size:13px;color:#6b7280;margin-top:8px}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <h2>Wi‑Fi Settings</h2>
          <div class="row">
            <input id="ssid" name="ssid" placeholder="SSID">
            <input id="pass" name="password" type="password" placeholder="Password">
          </div>
          <div class="actions">
            <button class="btn secondary" onclick="window.location='/'">Back</button>
            <button class="btn" id="connectBtn">Connect</button>
          </div>
          <div id="msg" class="note"></div>
        </div>
      </div>

      <script>
        document.getElementById('connectBtn').addEventListener('click', function(){
          const btn = document.getElementById('connectBtn');
          let ssid = document.getElementById('ssid').value;
          let pass = document.getElementById('pass').value;
          if(!ssid){ document.getElementById('msg').innerText='Please enter SSID'; return; }
          btn.disabled = true;
          btn.innerText = 'Connecting...';
          document.getElementById('msg').innerText='Connecting...';

          // Start connection (non-blocking) and then poll status
          fetch('/connect?ssid='+encodeURIComponent(ssid)+'&pass='+encodeURIComponent(pass))
            .then(()=>{
              // Poll status every 1s
              let attempts = 0;
              const maxAttempts = 12; // 12s
              const poll = setInterval(()=>{
                fetch('/connect_status')
                  .then(r=>r.text())
                  .then(status=>{
                    document.getElementById('msg').innerText = status;
                    if (status === 'CONNECTED'){
                      clearInterval(poll);
                      setTimeout(()=>{ window.location='/' }, 800);
                    } else if (status === 'FAILED'){
                      clearInterval(poll);
                      btn.disabled = false; btn.innerText = 'Connect';
                    }
                  })
                  .catch(()=>{
                    // ignore transient errors
                  });
                attempts++;
                if (attempts > maxAttempts){
                  clearInterval(poll);
                  document.getElementById('msg').innerText = 'Connection timeout';
                  btn.disabled = false; btn.innerText = 'Connect';
                }
              }, 1000);
            })
            .catch(e=>{ document.getElementById('msg').innerText='Connection request failed'; btn.disabled=false; btn.innerText='Connect'; });
        });
      </script>
    </body>
    </html>
  )rawliteral";
}

// ========== Handlers ==========
void handleRoot() { server.send(200, "text/html", mainPage()); }

void handleToggle() {
  int led = server.arg("led").toInt();
  if (led == 1) {
    led1_state = !led1_state;
    // Control GPIO pin for LED1
    digitalWrite(LED1_PIN, led1_state ? HIGH : LOW);
    Serial.print("LED1 (GPIO"); Serial.print(LED1_PIN); Serial.print(") -> "); Serial.println(led1_state ? "ON" : "OFF");
  }
   else if (led == 2) {
    // Toggle LED2 and use neo API to update strip (strip is private to neo_blinky.cpp)
    led2_state = !led2_state;
    neo_set_on(led2_state);
    Serial.print("LED2 (NeoPin "); Serial.print(LED2_PIN); Serial.print(") -> "); Serial.println(led2_state ? "ON" : "OFF");
  }
  server.send(200, "application/json",
    "{\"led1\":\"" + String(led1_state ? "ON":"OFF") +
    "\",\"led2\":\"" + String(led2_state ? "ON":"OFF") + "\"}");
}

void handleSensors() {
  float t = glob_temperature;
  float h = glob_humidity;
  float l = glob_light_lux;
  String json = "{\"temp\":"+String(t)+",\"hum\":"+String(h)+",\"light\":"+String(l)+"}";
  server.send(200, "application/json", json);
}

void handleSettings() { server.send(200, "text/html", settingsPage()); }

void handleConnect() {
  // Start a non-blocking connection attempt and return immediately.
  wifi_ssid = server.arg("ssid");
  wifi_password = server.arg("pass");

  Serial.print("Connect request for SSID: "); Serial.println(wifi_ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());

  connect_start_ms = millis();
  connecting = true;
  isAPMode = false; // we attempt STA

  server.send(200, "text/plain", "CONNECTING");
}

void handleConnectStatus() {
  if (WiFi.status() == WL_CONNECTED) {
    server.send(200, "text/plain", "CONNECTED");
  } else if (connecting) {
    // if it's been too long, treat as FAILED
    if (millis() - connect_start_ms > 15000) {
      server.send(200, "text/plain", "FAILED");
    } else {
      server.send(200, "text/plain", "CONNECTING");
    }
  } else {
    server.send(200, "text/plain", isWifiConnected ? "CONNECTED" : "FAILED");
  }
}

// ========== WiFi ==========
void setupServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/toggle", HTTP_GET, handleToggle);
  server.on("/sensors", HTTP_GET, handleSensors);
  server.on("/settings", HTTP_GET, handleSettings);
  server.on("/connect", HTTP_GET, handleConnect);
  server.on("/connect_status", HTTP_GET, handleConnectStatus);
  server.begin();
}

void startAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid.c_str(), password.c_str());
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  isAPMode = true;
  connecting = false;
}

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
  Serial.print("Connecting to: ");
  Serial.print(wifi_ssid.c_str());

  Serial.print(" Password: ");
  Serial.print(wifi_password.c_str());
}

// ========== Main task ==========
void main_server_task(void *pvParameters){
  pinMode(BOOT_PIN, INPUT_PULLUP);
  // LED1 is a simple GPIO output on LED1_PIN
  pinMode(LED1_PIN, OUTPUT);
  digitalWrite(LED1_PIN, led1_state ? HIGH : LOW);

  startAP();
  setupServer();

  while(1){
    server.handleClient();

    // BOOT Button to switch to AP Mode
    if (digitalRead(BOOT_PIN) == LOW) {
      vTaskDelay(100);
      if (digitalRead(BOOT_PIN) == LOW) {
        if (!isAPMode) {
          startAP();
          setupServer();
        }
      }
    }

    // STA Mode
    if (connecting) {
      if (WiFi.status() == WL_CONNECTED) {
        Serial.print("STA IP address: ");
        Serial.println(WiFi.localIP());
        isWifiConnected = true; //Internet access

        xSemaphoreGive(xBinarySemaphoreInternet);

        isAPMode = false;
        connecting = false;
         
      } else if (millis() - connect_start_ms > 10000) { // timeout 10s
        Serial.println("WiFi connect failed! Back to AP.");
        startAP();
        setupServer();
        connecting = false;
        isWifiConnected = false;
      }
    }
    // if (isWifiConnected) {
    // static unsigned long lastSend = 0;
    //   static unsigned long lastServerSend = 0;
    //   if (millis() - lastServerSend > 10000) {
    //     sendSensorToServer(glob_temperature, glob_humidity, glob_light_lux);
    //     lastServerSend = millis();
    //   }
    // }

    vTaskDelay(20); // avoid watchdog reset
  }
}