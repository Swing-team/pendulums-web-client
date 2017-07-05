// ng and 3rd party modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';

// app modules
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DashboardModule } from './dashboard/dashboard.module';

// state store things
import reducers from './shared/state/appState';
import { UserActions } from './shared/state/user/user.actions';

// configs
import { APP_CONFIG, CONFIG } from './app.config';

// components
import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

// services
import { AuthenticationService } from './shared/authentication.service';
import { UserService } from './shared/user.service';

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
