import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { DashboardComponent }                 from './dashboard.component';
import { BrowserModule }                      from '@angular/platform-browser';
import { WidgetsModule }                      from 'app/widgets/widgets.module';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    BrowserModule,
    WidgetsModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [],
})

export class DashboardModule { }
