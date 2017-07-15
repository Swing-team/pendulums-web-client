import {Component} from '@angular/core';
import * as _ from 'lodash';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'project-pending-invitations',
  templateUrl: './project-pending-invitations.component.html',
  styleUrls: ['./project-pending-invitations.component.sass']
})

export class ProjectPendingInvitationsComponent {
  roles = ['team member', 'admin'];
  private user = {email: null, role: this.roles[0], hash: null};
  private project: Project = new Project();

  constructor() {
  }

  invite() {
    this.project.invitedUsers.push(_.cloneDeep(this.user));
    this.user = {email: null, role: this.roles[0], hash: null};
  }

  delete(invitedUserId) {
    this.project.invitedUsers.splice(invitedUserId, 1);
  }
}
