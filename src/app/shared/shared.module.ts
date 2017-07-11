import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { IdenticonHashDirective } from './identicon-hash.directive';
import { SwingSelectComponent }     from './swing-select/swing-select.component';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    IdenticonHashDirective,
    SwingSelectComponent
  ],
  exports:      [
    CommonModule,
    FormsModule,
    HttpModule,
    IdenticonHashDirective,
    SwingSelectComponent
  ]
})
export class SharedModule { }
