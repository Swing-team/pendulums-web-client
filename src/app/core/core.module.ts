import { NgModule, Optional, SkipSelf } from '@angular/core';
import { StoreModule }                  from '@ngrx/store';

import { APP_CONFIG, CONFIG }           from '../app.config';

import reducers                         from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';
import { ProjectsActions }              from '../shared/state/project/projects.actions';

import { UserService }                  from './user.service';
import { AuthenticationService }        from './authentication.service';

import { ToolbarComponent }             from './toolbar/toolbar.component';
import { SharedModule }                 from '../shared/shared.module';
import {SideMenuComponent}              from './side-menu/side-menu.component';

@NgModule({
  imports:      [
    SharedModule,
    StoreModule.provideStore(reducers),
  ],
  declarations: [
    ToolbarComponent,
    SideMenuComponent
  ],
  exports:      [
    ToolbarComponent,
    SideMenuComponent
  ],
  providers:    [
    { provide: APP_CONFIG, useValue: CONFIG },
    UserService,
    AuthenticationService,
    UserActions,
    ProjectsActions
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
