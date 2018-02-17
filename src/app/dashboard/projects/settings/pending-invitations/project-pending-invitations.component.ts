import { Component, Input }         from '@angular/core';
import { ProjectService }           from '../../../shared/projects.service';
import { Project }                  from '../../../../shared/state/project/project.model';
import { AppState }                 from '../../../../shared/state/appState';
import { Store }                    from '@ngrx/store';
import { ProjectsActions }          from '../../../../shared/state/project/projects.actions';
import { Md5 }                      from 'ts-md5/dist/md5';
import { ErrorService }             from '../../../../core/error/error.service';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;


@Component({
  selector: 'project-pending-invitations',
  templateUrl: './project-pending-invitations.component.html',
  styleUrls: ['./project-pending-invitations.component.sass']
})

export class ProjectPendingInvitationsComponent {
  @Input() project: Project;
  roles = ['team member', 'admin'];
  cancelInvitationConfirmationViewIndex: Number = -1;
  user = {email: null, role: this.roles[0]};

  constructor(private projectService: ProjectService,
              private store: Store<AppState>,
              private projectsActions: ProjectsActions,
              private errorService: ErrorService) {
  }

  invite() {
    const invitedUser = {
      email: this.user.email,
      role: this.user.role
    };

    if (this.validateInvitedUser()) {
      this.projectService.inviteMember(this.project.id,
        {
          invitedUser
        }
      )
        .then(response => {
          this.store.dispatch(this.projectsActions.addInvitedUser(this.project.id, this.user));
          this.project.invitedUsers.push(invitedUser);
          this.user = {email: null, role: this.roles[0]};
          this.showError('User is invited');
        }).catch(error => {
        this.showError('Server Communication error.');
      });
    }
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  cancelInvitation(invitedUser) {
    this.projectService.cancelInvitation(this.project.id, {invitedUser})
      .then(response => {
        this.store.dispatch(this.projectsActions.removeInvitedUser(this.project.id, invitedUser));
        this.showError('Invitation was cancelled successfully');
      }).catch(error => {
      this.showError('Server Communication error.');
    });
  }

  validateInvitedUser() {
    if (!EMAIL_REGEX.test(this.user.email)) {
      this.showError('Invalid email address');
      return false;
    }
    for (let i = 0; i < this.project.invitedUsers.length; i++) {
      if (this.project.invitedUsers[i].email === this.user.email) {
        this.showError('You have already entered this email address');
        return false;
      }
    }
    return true;
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
