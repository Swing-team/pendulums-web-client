import { NgModule } from '@angular/core';
import { ProjectComponent } from './project.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { ProjectSettingsModalComponent } from './settings/modal/project-settings-modal.component';
import { ProjectDetailsComponent } from './settings/details/project-details.component';
import { ProjectMembersComponent } from './settings/members/project-members.component';
import { ProjectPendingInvitationsComponent } from './settings/pending-invitations/project-pending-invitations.component';
import { DangerousActionsComponent } from './settings/dangerous-actions/project-dangerous-actions.component';
import { ListOfProjectComponent } from './list-project/list-of-project.component';
import { ProjectItemComponent } from './list-project/project-item/project-item.component';
import { ProjectService } from './project.service';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
  ],
  exports: [],
  declarations: [
    ProjectComponent,
    CreateProjectComponent,
    ProjectSettingsModalComponent,
    ProjectDetailsComponent,
    ProjectMembersComponent,
    ProjectPendingInvitationsComponent,
    DangerousActionsComponent,
    ListOfProjectComponent,
    ProjectItemComponent,

  ],
  providers: [
    ProjectService,
  ],
  entryComponents: [
    ProjectSettingsModalComponent,
    CreateProjectComponent,
  ],
})
export class ProjectModule { }
