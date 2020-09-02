import { NgModule }                           from '@angular/core';
import { AppRoutingModule }                   from '../app-routing.module';
import { SharedModule }                       from '../shared/shared.module';
import { ProjectService }                     from './shared/projects.service';
import { ProjectItemComponent }               from './projects/list-project/project-item/project-item.component';
import { ActivitiesComponent }                from './activities/list-activities/activities.component';
import { ActivityItemComponent }              from './activities/list-activities/activity-item/activity-item.component';
import { AddManuallyActivityComponent }       from './activities/activity-add-edit-manually/activity-add-edit-manually.component';
import { CreateProjectComponent }             from './projects/create-project/create-project.component';
import { ProjectDetailsComponent }            from './projects/settings/details/project-details.component';
import { ProjectMembersComponent }            from './projects/settings/members/project-members.component';
import { ProjectPendingInvitationsComponent } from './projects/settings/pending-invitations/project-pending-invitations.component';
import { DangerousActionsComponent }          from './projects/settings/dangerous-actions/project-dangerous-actions.component';
import { ListOfProjectComponent }             from './projects/list-project/list-of-project.component';
import { DashboardComponent }                 from './dashboard.component';
import { ProjectSettingsModalComponent }      from './projects/settings/modal/project-settings-modal.component';
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
    CreateProjectComponent,
    ProjectSettingsModalComponent,
    ProjectDetailsComponent,
    ProjectMembersComponent,
    ProjectPendingInvitationsComponent,
    DangerousActionsComponent,
    ListOfProjectComponent,
    ProjectItemComponent,
    ActivitiesComponent,
    ActivityItemComponent,
    ChartComponent,
    AddManuallyActivityComponent,
    DashboardComponent,
    ProfileSettingComponent
  ],
  providers: [
    ProjectService
  ],
  entryComponents: [
    ProjectSettingsModalComponent,
    CreateProjectComponent,
    AddManuallyActivityComponent
  ]
})

export class DashboardModule { }
