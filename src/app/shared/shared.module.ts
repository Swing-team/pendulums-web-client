import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { IdenticonHashDirective } from './identicon-hash.directive';

import { SwingSelectComponent }   from './swing-select/swing-select.component';

import { ObjectKeysPipe }         from './object-keys.pipe';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    SwingSelectComponent,
    ObjectKeysPipe
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpModule,
    IdenticonHashDirective,
    ObjectKeysPipe,
    SwingSelectComponent
  ]
})
export class SharedModule { }
