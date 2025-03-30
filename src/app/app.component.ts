import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  alarmStatus$!: Observable<boolean>;  // Koristimo "!" da označimo da će biti inicijalizirano kasnije
  logMessages$!: Observable<any[]>;  // Isto kao i za alarmStatus$

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.alarmStatus$ = this.firebaseService.getAlarmStatus();
    this.logMessages$ = this.firebaseService.getLogMessages().pipe(
      map((logMessages) => {
        return Object.values(logMessages).map((log: string) => {
          const match = log.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) - (.*) - Prostorija: (.*)/);
          if (match) {
            return {
              date: match[1],
              message: match[2],
              room: match[3],
            };
          }
          return null; // Ako poruka ne odgovara formatu, preskoči je
        }).filter(log => log !== null);
      })
    );
  }

  triggerAlarm() {
    this.firebaseService.triggerAlarm();
  }

  resetAlarm() {
    this.firebaseService.resetAlarm();
  }
}
