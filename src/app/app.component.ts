import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  alarmStatus$!: Observable<boolean>;
  logMessages$!: Observable<any[]>;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.alarmStatus$ = this.firebaseService.getAlarmStatus();
    this.logMessages$ = this.firebaseService.getLogMessages().pipe(
      map((logMessages) => {
        return Object.values(logMessages).map((log: string) => {
          let match = log.match(
            /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) - (.*) - Prostorija: (.*)/
          );

          if (!match) {
            match = log.match(
              /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (.*) - Prostorija: (.*)/
            );
          }

          if (match) {
            return {
              date: match[1],
              message: match[2],
              room: match[3],
            };
          }

          return null;
        }).filter(log => log !== null).reverse();
      })
    );
  }

  triggerAlarm() {
    this.firebaseService.triggerAlarm();

    const currentDate = new Date().toISOString();
    const logMessage = `${currentDate} - Plin detektovan - Prostorija: Alarm aktiviran putem aplikacije`;

    this.firebaseService.addLogToFirebase(logMessage);
  }

  resetAlarm() {
    this.firebaseService.resetAlarm();
  }
}
