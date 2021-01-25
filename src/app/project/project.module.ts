import { NgModule } from '@angular/core';
import { CreateProjectComponent } from './create-project/create-project.component';
import { ProjectSettingsModalComponent } from './settings/modal/project-settings-modal.component';
import { ProjectDetailsComponent } from './settings/details/project-details.component';
import { ProjectMembersComponent } from './settings/members/project-members.component';
import { ProjectPendingInvitationsComponent } from './settings/pending-invitations/project-pending-invitations.component';
import { DangerousActionsComponent } from './settings/dangerous-actions/project-dangerous-actions.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectService } from './project.service';
import { SharedModule } from 'app/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { WidgetsModule } from 'app/widgets/widgets.module';

@NgModule({
  imports: [
    SharedModule,
    BrowserAnimationsModule,
    WidgetsModule,
  ],
  exports: [],
  declarations: [
    CreateProjectComponent,
    ProjectSettingsModalComponent,
    ProjectDetailsComponent,
    ProjectMembersComponent,
    ProjectPendingInvitationsComponent,
    DangerousActionsComponent,
    ProjectsComponent,
    ProjectDashboardComponent,
  ],
  providers: [
    ProjectService,
  ]
})
export class ProjectModule { }
