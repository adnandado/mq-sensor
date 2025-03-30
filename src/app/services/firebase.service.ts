import { Injectable } from '@angular/core';
import {Database, push, ref, set, update} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { objectVal } from 'rxfire/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private db: Database) {}

  getAlarmStatus(): Observable<boolean> {
    const alarmRef = ref(this.db, '/Alarm/Aktivan');
    return objectVal<boolean>(alarmRef);
  }

  getLogMessages(): Observable<any[]> {
    const logRef = ref(this.db, '/Alarm/Log');
    return objectVal<any[]>(logRef);
  }

  triggerAlarm(): void {
    const alarmRef = ref(this.db, '/Alarm');
    update(alarmRef, { Aktivan: true })
      .then(() => console.log('Alarm!'))
      .catch((error) => console.error( error));
  }
  addLogToFirebase(logMessage: string) {
    const logsRef = ref(this.db, '/Alarm/Log');
    const newLogRef = push(logsRef);
    set(newLogRef, logMessage)
      .then(() => console.log('Loged!'))
      .catch((error) => console.error(error));
  }

  resetAlarm(): void {
    console.log('Resetiranje alarma...');
    const alarmRef = ref(this.db, '/Alarm');
    update(alarmRef, { Aktivan: false })
      .then(() => console.log('Alarm resetiran!'))
      .catch((error) => console.error('Greška pri resetiranju alarma:', error));
  }
}
