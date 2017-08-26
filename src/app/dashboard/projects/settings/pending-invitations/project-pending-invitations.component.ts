import {Component, Input} from '@angular/core';
import {ProjectService} from '../../../shared/projects.service';
import {Project} from '../../../../shared/state/project/project.model';
import {AppState} from '../../../../shared/state/appState';
import {Store} from '@ngrx/store';
import {ProjectsActions} from '../../../../shared/state/project/projects.actions';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'project-pending-invitations',
  templateUrl: './project-pending-invitations.component.html',
  styleUrls: ['./project-pending-invitations.component.sass']
})

export class ProjectPendingInvitationsComponent {
  @Input() project: Project;
  roles = ['team member', 'admin'];
  private user = {email: null, role: this.roles[0]};

  constructor(private projectService: ProjectService,
              private store: Store<AppState>,
              private projectsActions: ProjectsActions) {
  }

  invite() {
    const invitedUser = {
      email: this.user.email,
      role: this.user.role
    };
    this.projectService.inviteMember(this.project.id,
      {
        invitedUser
      }
    )
      .then(response => {
        this.store.dispatch(this.projectsActions.addInvitedUser(this.project.id, this.user));
        this.user = {email: null, role: this.roles[0]};
      }).catch(error => {
    });
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  cancelInvitation(invitedUser) {
    console.log('invited user:', invitedUser);
    this.projectService.cancelInvitation(this.project.id, {invitedUser})
      .then(response => {
        this.store.dispatch(this.projectsActions.removeInvitedUser(this.project.id, invitedUser));
      }).catch(error => {
    });
  }
}
