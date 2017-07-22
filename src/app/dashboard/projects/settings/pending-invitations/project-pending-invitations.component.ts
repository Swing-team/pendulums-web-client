import {Component, Input} from '@angular/core';
import {ProjectService} from '../../../shared/projects.service';
import * as _ from 'lodash';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'project-pending-invitations',
  templateUrl: './project-pending-invitations.component.html',
  styleUrls: ['./project-pending-invitations.component.sass']
})

export class ProjectPendingInvitationsComponent {
  @Input() project: Project;
  roles = ['team member', 'admin'];
  private user = {email: null, role: this.roles[0], hash: null};

  constructor(private projectService: ProjectService) {
  }

  invite() {
    const invitedUser = {
      email: this.user.email,
      role: this.user.role
    };
    this.projectService.inviteMember(this.project._id,
      {
        invitedUser
      }
    )
      .then(response => {
        this.project.invitedUsers.push(_.cloneDeep(this.user));
        this.user = {email: null, role: this.roles[0], hash: null};
      }).catch(error => {
    });
  }

  cancelInvitation(invitedUser) {
    // this.project.invitedUsers.splice(invitedUser, 1);
    console.log('project id:', this.project._id);
    console.log('invited user:', invitedUser);
    this.projectService.cancelInvitation(this.project._id, {invitedUser})
      .then(response => {

      }).catch(error => {
    });
  }
}
