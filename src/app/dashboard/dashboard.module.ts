import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { ActivitiesComponent }                from './activities/list-activities/activities.component';
import { ActivityItemComponent }              from './activities/list-activities/activity-item/activity-item.component';
import { AddManuallyActivityComponent }       from './activities/activity-add-edit-manually/activity-add-edit-manually.component';
import { DashboardComponent }                 from './dashboard.component';
import { ProfileSettingComponent }            from '../profile-setting/profile-setting.component';
import { BrowserModule }                      from '@angular/platform-browser';
import { BrowserAnimationsModule }            from '@angular/platform-browser/animations';
import { ChartComponent }                     from './activities/list-activities/chart-statistics/chart.component';
import { NgxChartsModule }                    from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxChartsModule,
  ],
  declarations: [
    ActivitiesComponent,
    ActivityItemComponent,
    ChartComponent,
    AddManuallyActivityComponent,
    DashboardComponent,
    ProfileSettingComponent
  ],
  providers: [],
  entryComponents: [
    AddManuallyActivityComponent
  ]
})

export class DashboardModule { }
