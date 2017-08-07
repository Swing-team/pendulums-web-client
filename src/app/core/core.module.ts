import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule }                 from '@angular/router';

import { StoreModule }                  from '@ngrx/store';

import { APP_CONFIG, CONFIG }           from '../app.config';

import reducers                         from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';

import { UserService }                  from './user.service';
import { AuthenticationService }        from './authentication.service';
import { ModalService }                 from './modal/modal.service';

import { ToolbarComponent }             from './toolbar/toolbar.component';
import { SharedModule }                 from '../shared/shared.module';
import { SideMenuComponent }            from './side-menu/side-menu.component';
import { ModalComponent }               from './modal/modal.component';
import {UserProfileComponent}           from './side-menu/user-profile/user-profile.component';
import {ImgCropperComponent} from './side-menu/user-profile/image-cropper/image-cropper.component';
import {ImageCropperComponent} from 'ng2-img-cropper';

@NgModule({
  imports:      [
    SharedModule,
    StoreModule.provideStore(reducers),
    RouterModule
  ],
  declarations: [
    ToolbarComponent,
    SideMenuComponent,
    ModalComponent,
    UserProfileComponent,
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
    ModalService,
    UserService,
    AuthenticationService,
    UserActions,
    ProjectsActions,
  ],
  entryComponents: [
    ModalComponent,
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
