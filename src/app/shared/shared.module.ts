import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { SwingSelectComponent }   from './swing-select/swing-select.component';
import { SwingSwitchComponent }   from './swing-switch/swing-switch.component';
import { IdenticonHashDirective } from './identicon-hash.directive';
import { ObjectKeysPipe }         from './object-keys.pipe';
import {ActivityService}          from './activity/activity.service';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
    ObjectKeysPipe
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpModule,
    IdenticonHashDirective,
    ObjectKeysPipe,
    SwingSelectComponent,
    SwingSwitchComponent
  ],
  providers:    [
    ActivityService
  ],
})
export class SharedModule { }
