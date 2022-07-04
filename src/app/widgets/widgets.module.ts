import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RecentProjectsComponent } from './recent-projects/recent-projects.component';
import { AppRoutingModule } from 'app/app-routing.module';
import { StatChartComponent } from './stat-chart/stat-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RecentNotesComponent } from './recent-notes/recent-notes.component';

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule,
    NgxChartsModule,
  ],
  declarations: [
    RecentProjectsComponent,
    StatChartComponent,
    RecentNotesComponent,
  ],
  exports: [
    RecentProjectsComponent,
    StatChartComponent,
    RecentNotesComponent,
  ],
  providers: [],
})
export class WidgetsModule { }
