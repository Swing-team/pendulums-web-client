import 'rxjs/add/operator/debounceTime';
import { Component, ViewContainerRef }            from '@angular/core';
import { Observable }                             from 'rxjs/Observable';
import { Store }                                  from '@ngrx/store';
import { AppState }                               from './shared/state/appState';
import { AuthenticationService }                  from './core/services/authentication.service';
import { ErrorService }                           from './core/error/error.service';
import { SyncService }                            from './core/services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  private user: Observable<any>;
  private projects: Observable<any>;
  private currentActivity: Observable<any>;
  private status: Observable<any>;
  private SideMenuIsActive = false;
  private netConnectionString: boolean;

  constructor(
    private authService: AuthenticationService,
    private store: Store<AppState>,
    private viewContainerRef: ViewContainerRef,
    private errorService: ErrorService,
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

  signOut() {
    this.authService.signOut()
      .then(() => {});
  }

  showSideMenu() {
    this.SideMenuIsActive = !this.SideMenuIsActive;
  }
}


