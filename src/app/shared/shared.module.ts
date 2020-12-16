import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpClientModule }       from '@angular/common/http';

import { SwingSelectComponent }    from './swing-select/swing-select.component';
import { SwingSwitchComponent }    from './swing-switch/swing-switch.component';
import { IdenticonHashDirective }  from './identicon-hash.directive';
import { SwingCalendarComponent }  from './swing-calendar/swing-calendar.component';
import { SwingTagInputComponent }  from './swing-tag-input/swing-tag-input.component';
import { TabComponent } from './tab/tab.component';
import { SafeHtmlPipe } from '../shared/pipes/sanitizeHtmlPipe.pipe';
import { ProjectItemComponent } from './project-item/project-item.component';
import { ActivityItemComponent } from './activity-item/activity-item.component';
import { NoteItemComponent } from './note-item/note-item.component';

@NgModule({
  imports:      [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    IdenticonHashDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
    SwingCalendarComponent,
    SwingTagInputComponent,
    TabComponent,
    ProjectItemComponent,
    ActivityItemComponent,
    NoteItemComponent,
    SafeHtmlPipe
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IdenticonHashDirective,
    SwingCalendarComponent,
    SwingSelectComponent,
    SwingSwitchComponent,
    SwingTagInputComponent,
    TabComponent,
    ProjectItemComponent,
    ActivityItemComponent,
    NoteItemComponent,
    SafeHtmlPipe
  ],
  providers:    [  ],
})
export class SharedModule { }
