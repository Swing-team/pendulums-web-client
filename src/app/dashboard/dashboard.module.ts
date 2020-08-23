import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { DashboardComponent }                 from './dashboard.component';
import { BrowserModule }                      from '@angular/platform-browser';
import { BrowserAnimationsModule }            from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [],
})

export class DashboardModule { }
