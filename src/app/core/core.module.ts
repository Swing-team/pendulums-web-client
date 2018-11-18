import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule }                 from '@angular/router';
import { HTTP_INTERCEPTORS }            from '@angular/common/http';

import { StoreModule }                  from '@ngrx/store';

import { reducerToken, reducers }       from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';
import { ProjectsActions }              from '../shared/state/project/projects.actions';
import { NotesActions }                 from '../shared/state/note/notes.actions';
import { CurrentActivityActions }       from '../shared/state/current-activity/current-activity.actions';
import { UnSyncedActivityActions }      from '../shared/state/unsynced-activities/unsynced-activities.actions';

import { UserService }                  from './services/user.service';
import { AuthenticationService }        from './services/authentication.service';
import { ModalService }                 from './modal/modal.service';

import { ToolbarComponent }             from './toolbar/toolbar.component';
import { SharedModule }                 from '../shared/shared.module';
import { SideMenuComponent }            from './side-menu/side-menu.component';
import { ModalComponent }               from './modal/modal.component';
import { NotificationComponent }        from './side-menu/notification/notification.component';
import { NotificationService }          from './side-menu/notification/notification.service';
import { AppInfoComponent }             from './side-menu/app-info/app-info.component';
import { ImgCropperComponent }          from '../profile-setting/image-cropper/image-cropper.component';
import { ImageCropperModule }           from 'ng2-img-cropper';
import { ErrorComponent }               from './error/error.component';
import { ErrorService }                 from './error/error.service';
import { DatabaseService }              from './services/database/database.service';
import { StopStartActivityService }     from './services/stop-start-activity.service';
import { DexieService }                 from './services/database/dexie.service';
import { StatusActions }                from '../shared/state/status/status.actions';
import { SyncService }                  from './services/sync.service';
import { AuthInterceptor }              from './auth.interceptor';
import { AuthGuardService }             from './services/router-guards/auth-guard.service';
import { AnonymousGuardService }        from './services/router-guards/anonymous-guard.service';
import { ModalRouterGuardService }      from './services/router-guards/modal-router-guard.service'
import { PageLoaderService }            from './services/page-loader.service';
import { AppService }                   from './services/app.service';
import { AppStateSelectors }            from '../shared/state/app-state.selectors';
import { ProjectsSelectors }            from '../shared/state/project/projects.selectors';
import { NotesSelectors }               from '../shared/state/note/notes.selectors';
import { RouterChangeListenerService }  from './services/router-change-listener.service';
import { InviteNotifComponent }         from './side-menu/notification/invite-notif/invite-notif.component';
import { DonationComponent }            from './side-menu/donation/donation.component';
import { ActivityService } from './services/activity.service';

@NgModule({
  imports:      [
    SharedModule,
    StoreModule.forRoot(reducerToken),
    RouterModule,
    ImageCropperModule
  ],
  declarations: [
    ToolbarComponent,
    SideMenuComponent,
    ErrorComponent,
    ModalComponent,
    NotificationComponent,
    ImgCropperComponent,
    AppInfoComponent,
    InviteNotifComponent,
    DonationComponent
  ],
  exports:      [
    ToolbarComponent,
    SideMenuComponent
  ],
  providers:    [
    RouterModule,
    { provide: reducerToken, useValue: reducers },
    AuthGuardService,
    AnonymousGuardService,
    ModalRouterGuardService,
    ErrorService,
    PageLoaderService,
    ModalService,
    UserService,
    NotificationService,
    AuthenticationService,
    UserActions,
    StatusActions,
    ProjectsActions,
    NotesActions,
    CurrentActivityActions,
    UnSyncedActivityActions,
    AppStateSelectors,
    ProjectsSelectors,
    NotesSelectors,
    DexieService,
    DatabaseService,
    SyncService,
    StopStartActivityService,
    AppService,
    RouterChangeListenerService,
    ActivityService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  entryComponents: [
    ModalComponent,
    ErrorComponent,
    ImgCropperComponent,
    AppInfoComponent,
    DonationComponent
  ]
})
export class CoreModule {

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
