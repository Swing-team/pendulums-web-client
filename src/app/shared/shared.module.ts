import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpClientModule }       from '@angular/common/http';

import { SwingSelectComponent }   from './swing-select/swing-select.component';
import { SwingSwitchComponent }   from './swing-switch/swing-switch.component';
import { IdenticonHashDirective } from './identicon-hash.directive';
import { ActivityService }        from '../dashboard/shared/activity.service';
import { SwingCalendarComponent } from './swing-calendar/swing-calendar.component';
import { RestrictInputDirective } from './restrict-input.directive';
import { SwingTagInputComponent }  from './swing-tag-input/swing-tag-input.component';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    RestrictInputDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
    SwingCalendarComponent,
    SwingTagInputComponent
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IdenticonHashDirective,
    RestrictInputDirective,
    SwingCalendarComponent,
    SwingSelectComponent,
    SwingSwitchComponent,
    SwingTagInputComponent
  ],
  providers:    [
    ActivityService
  ],
})
export class SharedModule { }
