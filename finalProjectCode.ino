#include <ArduinoJson.h>

int a0Val = 0;  // Photoreistor value
int joyStickX = 0;  // Joystick X value
int joyStickY = 0;  // Joystick Y value

void sendData() {
  StaticJsonDocument<200> resJson;
  JsonObject data = resJson.createNestedObject("data");

  data["a0Val"] = a0Val;
  data["joyStickX"] = joyStickX;
  data["joyStickY"] = joyStickY;

  String resTxt = "";
  serializeJson(resJson, resTxt);

  Serial.println(resTxt);
}

void setup() {
  Serial.begin(9600);
  while (!Serial) {}
}

void loop() {
  a0Val = analogRead(A0);  // Read data from A0 (photoreistor)
  joyStickX = analogRead(A1);  // Read data from A1 (joystick X)
  joyStickY = analogRead(A2);  // Read data from A2 (joystick Y)

  if (Serial.available() > 0) {
    int byteIn = Serial.read();
    if (byteIn == 0xAB) {
      Serial.flush();
      sendData();
    }
  }

  delay(2);
}