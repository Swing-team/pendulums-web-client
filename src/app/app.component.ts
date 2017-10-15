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
import { CurrentActivityActions }                        from './shared/state/current-activity/current-activity.actions';
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
  private SideMenuIsActive = false;
  private status: Observable<any>;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private userService: UserService,
    private userActions: UserActions,
    private projectsActions: ProjectsActions,
    private CurrentActivityActions: CurrentActivityActions,
    private store: Store<AppState>,
    private viewContainerRef: ViewContainerRef,
    private errorService: ErrorService,
    private dBService: DatabaseService,
    private syncService: SyncService
  ) {
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
    let isLogin = true;
    this.status.subscribe((status) => {
      isLogin = status.isLogin;
      if (isLogin) {
        console.log('login value1:', isLogin);
        this.initialApp();
      } else {
        this.initialApp();
      }
    });
  }

  initialApp() {
    this.userService.getSummary()
      .then((user) => {
        this.store.dispatch(this.userActions.loadUser(user));
        this.store.dispatch(this.projectsActions.loadProjects(user.projects));
        this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(user.currentActivity));
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
          let uId: string;
          this.dBService
            .getAll('activeUser')
            .then((data) => {
              uId = data[0].data;
              if (uId) {
                this.dBService
                  .get('userData', uId)
                  .then((userData) => {
                    if (userData) {
                      console.log('loaded from index db');
                      this.store.dispatch(this.userActions.loadUser(userData.data.user));
                      this.store.dispatch(this.projectsActions.loadDbProjects(userData.data.projects.entities));
                      this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(userData.data.currentActivity));
                      if (this.router.url === '/dashboard' || this.router.url === '/signIn') {
                        this.router.navigate(['dashboard']);
                      }
                    } else {
                      this.router.navigate(['signIn']);
                    }
                  });
              }
            });
        } else {
          console.log('error is: ', error);
        }
      });
  }

  signOut() {
    this.authService.signOut()
      .then(() => {
        this.store.dispatch(this.userActions.clearUser());
        this.store.dispatch(this.projectsActions.clearProjects());
        this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
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


