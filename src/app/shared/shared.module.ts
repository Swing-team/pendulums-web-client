import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { IdenticonHashDirective } from './identicon-hash.directive';
import {ObjectKeysPipe}           from './object-keys.pipe';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
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
    ObjectKeysPipe
  ]
})
export class SharedModule { }
