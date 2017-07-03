import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import reducers from './shared/state/appState';
import {AppRoutingModule} from './app-routing.module';
import {StoreModule} from '@ngrx/store';

import { APP_CONFIG, CONFIG } from './app.config';
import {AuthenticationService} from './shared/authentication.service';
import {AuthenticationModule} from './authentication/authentication.module';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {UserActions} from './shared/state/user/user.actions';
import {UserService} from './shared/user.service';
import {DashboardModule} from './dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    StoreModule.provideStore(reducers),
    AuthenticationModule,
    DashboardModule
  ],
  providers: [
    { provide: APP_CONFIG, useValue: CONFIG },
    AuthenticationService,
    UserActions,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
