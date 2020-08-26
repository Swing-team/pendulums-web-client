import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RecentProjectsComponent } from './recent-projects/recent-projects.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { StatChartComponent } from './stat-chart/stat-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    NgxChartsModule,
  ],
  declarations: [
    RecentProjectsComponent,
    StatChartComponent,
  ],
  exports: [
    RecentProjectsComponent,
    StatChartComponent,
  ],
  providers: [],
})
export class WidgetsModule { }
