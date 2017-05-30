import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import reducers from './shared/state/appState';
import {AppRoutingModule} from './app-routing.module';
import {StoreModule} from '@ngrx/store';

import { APP_CONFIG, CONFIG } from './app.config';
import {AuthenticationService} from "./shared/authentication.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    StoreModule.provideStore(reducers),
  ],
  providers: [
    { provide: APP_CONFIG, useValue: CONFIG },
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
