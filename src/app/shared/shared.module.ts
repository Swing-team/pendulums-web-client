import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { IdenticonHashDirective } from './identicon-hash.directive';

import { SwingSelectComponent }   from './swing-select/swing-select.component';
import { SwingSwitchComponent } from './swing-switch/swing-switch.component';

import { ObjectKeysPipe }         from './object-keys.pipe';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    SwingSwitchComponent,
    SwingSelectComponent,
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
    SwingSelectComponent,
    SwingSwitchComponent
  ]
})
export class SharedModule { }
