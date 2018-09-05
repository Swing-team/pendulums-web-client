import 'rxjs/add/operator/debounceTime';
import {
  Component, ElementRef, OnInit, ViewChild,
  ViewContainerRef
}                                                 from '@angular/core';
import { Router }                                 from '@angular/router';
import { Observable }                             from 'rxjs/Observable';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from './shared/state/appState';
import { UserActions }                            from './shared/state/user/user.actions';
import { AuthenticationService }                  from './core/services/authentication.service';
import { ProjectsActions }                        from './shared/state/project/projects.actions';
import { StatusActions }                          from './shared/state/status/status.actions';
import { CurrentActivityActions }                 from './shared/state/current-activity/current-activity.actions';
import { SyncService }                            from './core/services/sync.service';
import { Status }                                 from './shared/state/status/status.model';
import { PageLoaderService }                      from './core/services/page-loader.service';
import { AppService }                             from './core/services/app.service';
import { UnSyncedActivityActions }                from './shared/state/unsynced-activities/unsynced-activities.actions';
import { AppStateSelectors }                      from './shared/state/app-state.selectors';
import { VERSION }                                from 'environments/version';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  user: Observable<any>;
  status: Observable<any>;
  private projects: Observable<any>;
  private selectedProject: Observable<string>;
  private currentActivity: Observable<any>;
  private previousLoginStatus = null;
  SideMenuIsActive = false;
  netConnected: boolean;
  notifNum = 0;

  @ViewChild('sideMenu', { read: ElementRef }) sideMenu: ElementRef;
  @ViewChild('menuIcon', { read: ElementRef }) menuIcon: ElementRef;

  constructor(
    private authService: AuthenticationService,
    private store: Store<AppState>,
    private userActions: UserActions,
    private projectsActions: ProjectsActions,
    private currentActivityActions: CurrentActivityActions,
    private statusActions: StatusActions,
    private router: Router,
    private syncService: SyncService,
    private pageLoaderService: PageLoaderService,
    private appService: AppService,
    private unSyncedActivityActions: UnSyncedActivityActions,
    private appStateSelectors: AppStateSelectors,
    private errorMessage: string,
    // needed for dynamically loaded components
    public viewContainerRef: ViewContainerRef
  ) {
    // to initialize state
    this.user = store.select('user');
    this.projects = store.select(appStateSelectors.getProjectsArray);
    this.selectedProject = store.select(appStateSelectors.getSelectedProject);
    this.currentActivity = store.select('currentActivity');
    this.status = store.select('status');
  }

  ngOnInit(): void {
    // to initialize webSocket connection
    const responseResults = this.syncService.init();

    this.appService.getAppVersion().then((version) => {
      this.store.dispatch(this.statusActions.updateStatus({updateNeeded: version > VERSION}));
      if (version > VERSION) {
        this.notifNum = 1;
      }
    });
    // to handle 403 interceptor by isLogin that has been handle in signOut and authInterceptor
    this.status.subscribe((status: Status) => {
      if ((status.isLogin === false) && status.isLogin !== this.previousLoginStatus) {
        this.store.dispatch(this.userActions.clearUser());
        this.store.dispatch(this.projectsActions.clearProjects());
        this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        this.store.dispatch(this.statusActions.updateStatus({netStatus: true, isLogin: null}));
        // we think we don't need to keep unSynced data any more after user sign out or get 403
        this.store.dispatch(this.unSyncedActivityActions.clearUnSyncedActivity());
        this.syncService.closeConnection();
        this.router.navigate(['signIn']);
      }
      this.previousLoginStatus = status.isLogin;

      // To handle connection indicator
      if (status.netStatus === false) {
        this.netConnected = false;
      } else {
        this.netConnected = true;
      }
    });

    // to handle loading
    Promise.all(responseResults).then(() => {
      setTimeout(() => {
        this.pageLoaderService.hideLoading();
      }, 1000)
    })
  }

  signOut() {
    this.authService.signOut()
      .then(() => {})
      .catch((error) => {
        if (error.status === 503) {
          // Not sure about this code below. please check!
          this.errorMessage = 'You have reached the authentication limits, please try in a few minutes!'
        }
      });
  }

  clickedOutSideOfMenu(event) {
    if (this.sideMenu.nativeElement.contains(event.target)) {
    } else {
      if (this.menuIcon) {
        if (event.target.contains(this.menuIcon)) {
        } else {
          this.SideMenuIsActive = false;
        }
        this.menuIcon = null;
      } else {
        this.SideMenuIsActive = false;
      }
    }
  }

  showSideMenu(event) {
    this.menuIcon = event.target;
    this.SideMenuIsActive = !this.SideMenuIsActive;
  }

  closeMenu() {
    this.SideMenuIsActive = false;
  }
}


