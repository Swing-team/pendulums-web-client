// ng and 3rd party modules
import { BrowserModule, HammerModule }          from '@angular/platform-browser';

// app modules
import { AppRoutingModule }       from './app-routing.module';
import { CoreModule }             from './core/core.module';
import { AuthenticationModule }   from './authentication/authentication.module';
import { DashboardModule }        from './dashboard/dashboard.module';
import { NoteModule }             from './note/note.module';

// components
import { AppComponent }           from './app.component';
import { NotFoundComponent }      from './not-found/not-found.component';
import { CookieService } from 'ngx-cookie-service';
import { ProjectModule } from './project/project.module';

export const AppModuleConfig = {
    declarations: [
        AppComponent,
        NotFoundComponent
    ],
    imports: [
        BrowserModule,
        HammerModule,
        AppRoutingModule,
        CoreModule,
        AuthenticationModule,
        DashboardModule,
        ProjectModule,
        NoteModule
    ],
    providers: [CookieService],
    bootstrap: [AppComponent]
}
