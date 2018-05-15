import { Component }          from '@angular/core';
import { Observable }         from 'rxjs/Observable';
import { Store }              from '@ngrx/store';
import { AppState }           from '../shared/state/appState';
import { AppStateSelectors }  from '../shared/state/app-state.selectors';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent {
  projects: Observable<any>;
  user: Observable<any>;
  currentActivity: Observable<any>;
  status: Observable<any>;

  constructor (private store: Store<AppState>,
               appStateSelectors: AppStateSelectors) {
    this.currentActivity = store.select('currentActivity');
    this.user = store.select('user');
    this.status = store.select('status');
    this.projects = store.select(appStateSelectors.getProjectsArray);
  }
}


