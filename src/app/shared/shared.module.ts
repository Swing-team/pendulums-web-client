import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { SwingSelectComponent }   from './swing-select/swing-select.component';
import { SwingSwitchComponent }   from './swing-switch/swing-switch.component';
import { IdenticonHashDirective } from './identicon-hash.directive';
import { ObjectKeysPipe }         from './object-keys.pipe';
import { ActivityService }        from './activity/activity.service';
import { SwingCalendarComponent } from './swing-calendar/swing-calendar.component';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
    SwingCalendarComponent,
    ObjectKeysPipe
  ],
  exports:      [
    IdenticonHashDirective,
    SwingSelectComponent
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpModule,
    IdenticonHashDirective,
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
