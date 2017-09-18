import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule }                 from '@angular/router';

import { StoreModule }                  from '@ngrx/store';

import { APP_CONFIG, CONFIG }           from '../app.config';

import reducers                         from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';
import { ProjectsActions }              from '../shared/state/project/projects.actions';
import { ActivityActions }              from '../shared/state/activity/activity.actions';

import { UserService }                  from './user.service';
import { AuthenticationService }        from './authentication.service';
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

@NgModule({
  imports:      [
    SharedModule,
    StoreModule.provideStore(reducers),
    RouterModule
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
    { provide: APP_CONFIG, useValue: CONFIG },
    RouterModule,
    ErrorService,
    ModalService,
    UserService,
    NotificationService,
    AuthenticationService,
    UserActions,
    ProjectsActions,
    ActivityActions
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
