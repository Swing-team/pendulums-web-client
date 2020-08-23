import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AddManuallyActivityComponent } from './activity-add-edit-manually/activity-add-edit-manually.component';
import { ActivitiesComponent } from './list-activities/activities.component';
import { ActivityItemComponent } from './list-activities/activity-item/activity-item.component';
import { ChartComponent } from './list-activities/chart-statistics/chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  imports: [
    SharedModule,
    NgxChartsModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    ActivitiesComponent,
    ActivityItemComponent,
    ChartComponent,
    AddManuallyActivityComponent,
  ],
  providers: [],
  entryComponents: [
    AddManuallyActivityComponent,
  ],
})
export class ActivityModule { }
