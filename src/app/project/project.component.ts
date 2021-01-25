import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/shared/state/appState';
import { AppStateSelectors } from 'app/shared/state/app-state.selectors';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { User } from 'app/shared/state/user/user.model';
import { Status } from 'app/shared/state/status/status.model';
import { Project } from 'app/shared/state/project/project.model';

@Component({
  selector: 'project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.sass']
})

export class ProjectComponent {
  currentActivity$: Observable<Activity>;
  user$: Observable<User>;
  status$: Observable<Status>;
  projects$: Observable<Project[]>;
  sortBy$: Observable<string>;

  constructor(
    private readonly store: Store<AppState>,
    private readonly appStateSelectors: AppStateSelectors,
    private readonly http: HttpClient,
  ) {
    this.currentActivity$ = store.select('currentActivity');
    this.user$ = store.select('user');
    this.status$ = store.select('status');
    this.projects$ = store.select(appStateSelectors.getProjectsArray);
    this.sortBy$ = store.select(appStateSelectors.getProjectsSortBy);
  }
}
