import 'rxjs/add/operator/debounceTime';
import {
  Component, ElementRef, OnInit, ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Router }                                 from '@angular/router';
import { Observable }                             from 'rxjs/Observable';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from './shared/state/appState';
import { AuthenticationService }                  from './core/services/authentication.service';
import { ErrorService }                           from './core/error/error.service';
import { SyncService }                            from './core/services/sync.service';
import { Status }                                 from './shared/state/status/status.model';
import {User} from './shared/state/user/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  user: User;
  private projects: Observable<any>;
  private currentActivity: Observable<any>;
  private status: Observable<any>;
  private previousLoginStatus = null;
  userIdForHtml: string = null;
  SideMenuIsActive = true;
  netConnected: boolean;

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
    private viewContainerRef: ViewContainerRef,
    private errorService: ErrorService,
    private syncService: SyncService
  ) {
    // to initialize state
    store.select('user').subscribe((user: User) => {
      if (user) {
        this.user = user;
        this.userIdForHtml = user.id;
      }
    });
    this.projects = store.select('projects');
    this.currentActivity = store.select('currentActivity');
    this.status = store.select('status');
  }

  ngOnInit(): void {
    this.errorService.setViewContainerRef(this.viewContainerRef);
    // to initialize webSocket connection
    this.syncService.init();

    // to handle 403 interceptor by isLogin that has been handle in signOut and authInterceptor
    this.status.subscribe((status: Status) => {
      if (status) {
        if ((status.isLogin === false) && status.isLogin !== this.previousLoginStatus) {
          this.store.dispatch(this.userActions.clearUser());
          this.store.dispatch(this.projectsActions.clearProjects());
          this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
          this.store.dispatch(this.statusActions.loadStatus({netStatus: true, isLogin: null, stateChanged: false}));
          this.syncService.closeConnection();
          this.router.navigate(['signIn']);
        }
        this.previousLoginStatus = status.isLogin;

        // To handle connection indicator
        if (status.netStatus === false) {
          console.log('net is not connected!');
          this.netConnected = false;
        } else {
          console.log('net is connected!');
          this.netConnected = true;
        }
      }
    });
  }

  signOut() {
    this.authService.signOut()
      .then(() => {});
  }

  clickedOutSideOfMenu(event) {
    if (this.sideMenu.nativeElement.contains(event.target)) {
      console.log('clicked inside menu in app component.');
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
}


