// ng and 3rd party modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// app modules
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { AuthenticationModule } from './authentication/authentication.module';

// components
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    AuthenticationModule,
    DashboardModule
  ],
  providers: [  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
