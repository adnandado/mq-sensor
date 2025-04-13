#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

const int mq2Pin = A0;
const int ledPin = D1;
const int buzzerPin = D2;

const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600, 60000);

bool alarmActive = false;
unsigned long alarmStartTime = 0;
bool alarmFromApp = false;

int sosStep = 0;
unsigned long sosLastTime = 0;
bool ledState = false;

void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Povezivanje na WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nPovezano na WiFi!");

  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  timeClient.begin();
  timeClient.update();

  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  Serial.println("Firebase povezan!");
}

String getFormattedDate() {
  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime((time_t *)&epochTime);

  int year = ptm->tm_year + 1900;
  int month = ptm->tm_mon + 1;
  int day = ptm->tm_mday;

  char buffer[11];
  sprintf(buffer, "%04d-%02d-%02d", year, month, day);
  return String(buffer);
}

void sosSignalStep() {
  const int pattern[] = {
    300, 300, 300, 300, 300, 300, 
    600, 300, 600, 300, 600, 300,
    300, 300, 300, 300, 300, 300  
  };
  const int patternLength = sizeof(pattern) / sizeof(pattern[0]);

  unsigned long currentTime = millis();
  if (currentTime - sosLastTime >= pattern[sosStep]) {
    sosLastTime = currentTime;
    if (sosStep % 2 == 0) {
      digitalWrite(ledPin, HIGH);
      tone(buzzerPin, sosStep < 6 || sosStep >= 12 ? 1000 : 3000);
    } else {
      digitalWrite(ledPin, LOW);
      noTone(buzzerPin);
    }
    sosStep = (sosStep + 1) % patternLength;
  }
}

void loop() {
  int sensorValue = analogRead(mq2Pin);
  Serial.print("Analogna vrijednost: ");
  Serial.println(sensorValue);

  if (alarmActive) {
  sosSignalStep();
    if (alarmFromApp && millis() - alarmStartTime > 5000) {
      if (Firebase.getBool(firebaseData, "/Alarm/Aktivan") && !firebaseData.boolData()) {
        alarmActive = false;
        alarmFromApp = false;
        noTone(buzzerPin);
        digitalWrite(ledPin, LOW);
        Serial.println("Alarm isključen (putem aplikacije)");
      }
    }
  }

  if (Firebase.getBool(firebaseData, "/Alarm/Aktivan")) {
    bool alarmState = firebaseData.boolData();
    if (alarmState && !alarmActive) {
      alarmActive = true;
      alarmFromApp = true;
      alarmStartTime = millis();
      Serial.println("Alarm aktiviran putem aplikacije!");
    }
  }

  if (sensorValue > 450 && !alarmActive) {
    alarmActive = true;
    alarmFromApp = false;
    alarmStartTime = millis();

    timeClient.update();
    String formattedTime = timeClient.getFormattedTime();
    String formattedDate = getFormattedDate();

    if (Firebase.setBool(firebaseData, "/Alarm/Aktivan", true)) {
      Serial.println("Alarm aktiviran u Firebase!");
    } else {
      Serial.println("Greška pri aktiviranju alarma u Firebase");
    }

    String prostorija = "AMF3";
    String logMessage = formattedDate + " " + formattedTime + " - Plin detektovan - Prostorija: " + prostorija;

    String path = "/Alarm/Log";
    if (Firebase.pushString(firebaseData, path, logMessage)) {
      Serial.println("Log je dodat u Firebase!");
    } else {
      Serial.println("Greška pri dodavanju loga u Firebase!");
    }
  }

  if (alarmActive && sensorValue <= 450 && !alarmFromApp) {
    alarmActive = false;
    noTone(buzzerPin);
    digitalWrite(ledPin, LOW);
    Firebase.setBool(firebaseData, "/Alarm/Aktivan", false);
    Serial.println("Alarm isključen (MQ-2)");
  }

  delay(100); 
}
