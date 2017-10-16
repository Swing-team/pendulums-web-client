import 'rxjs/add/operator/debounceTime';
import { Component, OnInit, ViewContainerRef }    from '@angular/core';
import { Router }                                 from '@angular/router';
import { Observable }                             from 'rxjs/Observable';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from './shared/state/appState';
import { UserActions }                            from './shared/state/user/user.actions';
import { AuthenticationService }                  from './core/servises/authentication.service';
import { UserService }                            from './core/servises/user.service';
import { ProjectsActions }                        from './shared/state/project/projects.actions';
import { CurrentActivityActions }                 from './shared/state/current-activity/current-activity.actions';
import { UnSyncedActivityActions }                from './shared/state/unsynced-activities/unsynced-activities.actions';
import { ErrorService }                           from './core/error/error.service';
import { DatabaseService }                        from './core/servises/database/database.service';
import { SyncService }                            from './core/servises/sync.service';

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
  private tempState: any;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private userActions: UserActions,
    private projectsActions: ProjectsActions,
    private currentActivityActions: CurrentActivityActions,
    private unSyncedActivityActions: UnSyncedActivityActions,
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

    // todo: It can be better later
    store.debounceTime(2000).subscribe((state) => {
      let uId: string;
      this.user.subscribe((user) => {
        uId = user.id;
        if (uId) {
          this.dBService
            .createOrUpdate('userData', {data: state, userId: uId })
            .then((data) => {});
        }
      });
    });
    this.errorService.setViewContainerRef(this.viewContainerRef);
  }

  ngOnInit(): void {
    // todo: handle connection
    let isLogin = true;
    this.status.subscribe((status) => {
      isLogin = status.isLogin;
      if (isLogin) {
        console.log('isLogin:', isLogin);
        this.getSummaryOnline();
      } else {
        this.initialAppOffline();
      }
    });

    let uId: string;
    this.dBService
      .getAll('activeUser')
      .then((data) => {
        if (data[0]) {
          uId = data[0].data;
          this.dBService
            .get('userData', uId)
            .then((userData) => {
              if (userData) {
                this.tempState = userData;
                const syncData = {
                  currentActivity: null,
                  activities: null
                };
                if (this.tempState.data.unSyncedActivity.entities.length > 0) {
                  syncData.activities = this.tempState.data.unSyncedActivity.entities;
                }
                if (this.tempState.data.currentActivity.startedAt !== null) {
                  syncData.currentActivity = this.tempState.data.currentActivity;
                }
                if (syncData.currentActivity || syncData.activities) {
                  console.log('sync call');
                  console.log('syncData', syncData);
                  this.syncService.syncData(syncData)
                    .then(() => {
                      this.getSummaryOnline();
                    })
                    .catch(error => {
                      // todo: handle sync errors based on corrupted data
                      console.log('error is: ', error);
                      if (error.status === 403) {
                        this.router.navigate(['signIn']);
                      } else {
                        this.initialAppOffline();
                      }
                    });
                } else {
                  this.getSummaryOnline();
                }
              } else {
                this.getSummaryOnline();
              }
            });
        } else {
          this.getSummaryOnline();
        }
      });
  }

  getSummaryOnline() {
    this.userService.getSummary()
      .then((user) => {
        this.store.dispatch(this.userActions.loadUser(user));
        this.store.dispatch(this.projectsActions.loadProjects(user.projects));
        this.store.dispatch(this.currentActivityActions.loadCurrentActivity(user.currentActivity));
        this.dBService
          .removeAll('activeUser')
          .then(() => {
            this.dBService
              .createOrUpdate('activeUser', {data: user.id})
              .then(() => {});
          });
        if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
          this.router.navigate(['dashboard']);
        }
      })
      .catch(error => {
        if (error.status !== 403) {
          this.initialAppOffline();
        } else {
          console.log('error is: ', error);
          this.router.navigate(['signIn']);
        }
      });
  }

  initialAppOffline() {
    if (this.tempState) {
      console.log('loaded from index db');
      this.store.dispatch(this.userActions.loadUser(this.tempState.data.user));
      this.store.dispatch(this.projectsActions.loadDbProjects(this.tempState.data.projects.entities));
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(this.tempState.data.currentActivity));
      this.store.dispatch(this.unSyncedActivityActions.loadUnSyncedActivity(this.tempState.data.unSyncedActivity));
      if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate(['signIn']);
    }
  }

  signOut() {
    this.authService.signOut()
      .then(() => {
        this.store.dispatch(this.userActions.clearUser());
        this.store.dispatch(this.projectsActions.clearProjects());
        this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
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


