import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AddManuallyActivityComponent } from './activity-add-edit-manually/activity-add-edit-manually.component';
import { ActivitiesComponent } from './list-activities/activities.component';
import { ChartComponent } from './list-activities/chart-statistics/chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WidgetsModule } from 'app/widgets/widgets.module';



@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    WidgetsModule,
  ],
  declarations: [
    ActivitiesComponent,
    ChartComponent,
    AddManuallyActivityComponent,
  ],
  providers: [],
  entryComponents: [
    AddManuallyActivityComponent,
  ],
})
export class ActivityModule { }
