import { Component } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Store} from '@ngrx/store';
import {AppState} from '../shared/state/appState';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent {
  private projects: Observable<any>;
  private user: Observable<any>;
  private currentActivity: Observable<any>;

  constructor (private store: Store<AppState>) {
    this.projects = store.select('projects');
    this.currentActivity = store.select('activity');
    this.user = store.select('user');
  }
}


