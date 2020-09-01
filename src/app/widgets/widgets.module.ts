import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RecentProjectsComponent } from './recent-projects/recent-projects.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { StatChartComponent } from './stat-chart/stat-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RecentActivitiesComponent } from './recent-activities/recent-activities.component';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    NgxChartsModule,
  ],
  declarations: [
    RecentProjectsComponent,
    StatChartComponent,
    RecentActivitiesComponent,
  ],
  exports: [
    RecentProjectsComponent,
    StatChartComponent,
    RecentActivitiesComponent,
  ],
  providers: [],
})
export class WidgetsModule { }
