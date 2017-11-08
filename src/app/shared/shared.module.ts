import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpClientModule }       from '@angular/common/http';

import { SwingSelectComponent }   from './swing-select/swing-select.component';
import { SwingSwitchComponent }   from './swing-switch/swing-switch.component';
import { IdenticonHashDirective } from './identicon-hash.directive';
import { ObjectKeysPipe }         from './object-keys.pipe';
import { ActivityService }        from '../dashboard/shared/activity.service';
import { SwingCalendarComponent } from './swing-calendar/swing-calendar.component';
import { RestrictInputDirective } from './restrict-input.directive';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    RestrictInputDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
    SwingCalendarComponent,
    ObjectKeysPipe
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IdenticonHashDirective,
    RestrictInputDirective,
    ObjectKeysPipe,
    SwingCalendarComponent,
    SwingSelectComponent,
    SwingSwitchComponent
  ],
  providers:    [
    ActivityService
  ],
})
export class SharedModule { }
