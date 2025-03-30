import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "feeder-for-iot-2025", appId: "1:536353640001:web:06ab50b80933d100d640c0", databaseURL: "https://feeder-for-iot-2025-default-rtdb.europe-west1.firebasedatabase.app", storageBucket: "feeder-for-iot-2025.firebasestorage.app", apiKey: "AIzaSyAgMsk9Rjqov_8pAcd6U0vhp9a3LlC3A68", authDomain: "feeder-for-iot-2025.firebaseapp.com", messagingSenderId: "536353640001", measurementId: "G-F77W86B3DN" })), provideAuth(() => getAuth()), provideDatabase(() => getDatabase())]
};
