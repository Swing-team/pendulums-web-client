import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { DashboardComponent }                 from './dashboard.component';
import { WidgetsModule }                      from 'app/widgets/widgets.module';
import { UserStatsService } from './user-stats.service';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    WidgetsModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers: [
    UserStatsService,
  ],
})
export class DashboardModule { }
