import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { StoreModule }                  from '@ngrx/store';

import { APP_CONFIG, CONFIG }           from '../app.config';

import reducers                         from '../shared/state/appState';
import { UserActions }                  from '../shared/state/user/user.actions';

import { UserService }                  from './user.service';
import { AuthenticationService }        from './authentication.service';

import { ToolbarComponent }             from './toolbar/toolbar.component';
import {ProjectsActions}                from '../shared/state/project/projects.actions';

@NgModule({
  imports:      [
    CommonModule,
    StoreModule.provideStore(reducers),
  ],
  declarations: [ ToolbarComponent ],
  exports:      [ ToolbarComponent ],
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
