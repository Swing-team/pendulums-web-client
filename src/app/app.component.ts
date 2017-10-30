import 'rxjs/add/operator/debounceTime';
import { Component, OnInit, ViewContainerRef }    from '@angular/core';
import { Router }                                 from '@angular/router';
import { Observable }                             from 'rxjs/Observable';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from './shared/state/appState';
import { UserActions }                            from './shared/state/user/user.actions';
import { AuthenticationService }                  from './core/services/authentication.service';
import { ProjectsActions }                        from './shared/state/project/projects.actions';
import { StatusActions }                          from './shared/state/status/status.actions';
import { CurrentActivityActions }                 from './shared/state/current-activity/current-activity.actions';
import { ErrorService }                           from './core/error/error.service';
import { DatabaseService }                        from './core/services/database/database.service';
import { SyncService }                            from './core/services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  private user: Observable<any>;
  private projects: Observable<any>;
  private currentActivity: Observable<any>;
  private status: Observable<any>;
  private SideMenuIsActive = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private userActions: UserActions,
    private projectsActions: ProjectsActions,
    private StatusActions: StatusActions,
    private currentActivityActions: CurrentActivityActions,
    private store: Store<AppState>,
    private viewContainerRef: ViewContainerRef,
    private errorService: ErrorService,
    private dBService: DatabaseService,
    private syncService: SyncService
  ) {
    // to initialize state
    this.user = store.select('user');
    this.projects = store.select('projects');
    this.currentActivity = store.select('currentActivity');
    this.status = store.select('status');

    errorService.setViewContainerRef(this.viewContainerRef);

    // to initialize webSocket connection
    syncService.init();
  }

  ngOnInit(): void {
  }

  signOut() {
    this.authService.signOut()
      .then(() => {
        this.store.dispatch(this.userActions.clearUser());
        this.store.dispatch(this.projectsActions.clearProjects());
        this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        this.store.dispatch(this.StatusActions.clearStatus());
        this.syncService.closeConnection();
        this.dBService
          .removeAll('activeUser')
          .then(() => {});
        this.router.navigate(['signIn']);
      });
  }

  showSideMenu() {
    this.SideMenuIsActive = !this.SideMenuIsActive;
  }
}


