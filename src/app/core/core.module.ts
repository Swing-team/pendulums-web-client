import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule }                 from '@angular/router';
import { HTTP_INTERCEPTORS }            from '@angular/common/http';

import { StoreModule }                  from '@ngrx/store';

import { AppConfigModule }              from '../app.config';

import { reducers }                     from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';
import { ProjectsActions }              from '../shared/state/project/projects.actions';
import { CurrentActivityActions }       from '../shared/state/current-activity/current-activity.actions';
import { UnSyncedActivityActions }      from '../shared/state/unsynced-activities/unsynced-activities.actions';

import { UserService }                  from './services/user.service';
import { AuthenticationService }        from './services/authentication.service';
import { ModalService }                 from './modal/modal.service';

import { ToolbarComponent }             from './toolbar/toolbar.component';
import { SharedModule }                 from '../shared/shared.module';
import { SideMenuComponent }            from './side-menu/side-menu.component';
import { ModalComponent }               from './modal/modal.component';
import { NotificationComponent }        from './side-menu/notifacation/notification.component';
import { NotificationService }          from './side-menu/notifacation/notification.service';
import { ImgCropperComponent }          from '../profile-setting/image-cropper/image-cropper.component';
import { ImageCropperComponent }        from 'ng2-img-cropper';
import { ErrorComponent }               from './error/error.component';
import { ErrorService }                 from './error/error.service';
import { DatabaseService }              from './services/database/database.service';
import { DexieService }                 from './services/database/dexie.service';
import { StatusActions }                from '../shared/state/status/status.actions';
import { SyncService }                  from './services/sync.service';
import { AuthInterceptor }              from './auth.interceptor';

@NgModule({
  imports:      [
    SharedModule,
    StoreModule.forRoot(reducers),
    RouterModule,
    AppConfigModule
  ],
  declarations: [
    ToolbarComponent,
    SideMenuComponent,
    ErrorComponent,
    ModalComponent,
    NotificationComponent,
    ImgCropperComponent,
    ImageCropperComponent
  ],
  exports:      [
    ToolbarComponent,
    SideMenuComponent
  ],
  providers:    [
    RouterModule,
    ErrorService,
    ModalService,
    UserService,
    NotificationService,
    AuthenticationService,
    UserActions,
    StatusActions,
    ProjectsActions,
    CurrentActivityActions,
    UnSyncedActivityActions,
    DexieService,
    DatabaseService,
    SyncService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  entryComponents: [
    ModalComponent,
    ErrorComponent,
    ImgCropperComponent
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
