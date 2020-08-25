import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RecentProjectsComponent } from './recent-projects/recent-projects.component';
import { AppRoutingModule } from 'app/app-routing.module';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule
  ],
  declarations: [
    RecentProjectsComponent,
  ],
  exports: [
    RecentProjectsComponent,
  ],
  providers: [],
})
export class WidgetsModule { }
