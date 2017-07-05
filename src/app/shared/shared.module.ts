import { NgModule }               from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpModule }             from '@angular/http';

import { IdenticonHashDirective } from './identicon-hash.directive';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [ IdenticonHashDirective ],
  exports:      [
    IdenticonHashDirective,
    CommonModule,
    FormsModule,
    HttpModule
  ]
})
export class SharedModule { }
