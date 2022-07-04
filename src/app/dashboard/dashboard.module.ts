import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { DashboardComponent }                 from './dashboard.component';
import { WidgetsModule }                      from 'app/widgets/widgets.module';
import { DashboardService } from './dashboard.service';
import { RecentActivitiesComponent } from './recent-activities/recent-activities.component';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    WidgetsModule,
  ],
  declarations: [
    DashboardComponent,
    RecentActivitiesComponent,
  ],
  providers: [
    DashboardService,
  ],
})
export class DashboardModule { }
