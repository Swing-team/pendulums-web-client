import { Component, Input }                     from '@angular/core';
import { trigger, style, transition, animate }  from '@angular/animations';
import { ProjectService }                       from '../../../shared/projects.service';
import { Project }                              from '../../../../shared/state/project/project.model';
import { AppState }                             from '../../../../shared/state/appState';
import { Store }                                from '@ngrx/store';
import { ProjectsActions }                      from '../../../../shared/state/project/projects.actions';
import { Md5 }                                  from 'ts-md5/dist/md5';
import { ErrorService }                         from '../../../../core/error/error.service';

const EMAIL_REGEX = /^(?=.{8,64}$)[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/;


@Component({
  selector: 'project-pending-invitations',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)', opacity: 0}),
        animate('200ms ease-out', style({transform: 'translateY(0%)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({transform: 'translateY(-100%)', opacity: 0}))
      ])
    ])
  ],
  templateUrl: './project-pending-invitations.component.html',
  styleUrls: ['./project-pending-invitations.component.sass']
})

export class ProjectPendingInvitationsComponent {
  @Input() project: Project;
  roles = ['team member', 'admin'];
  cancelInvitationConfirmationViewIndex: Number = -1;
  user = {email: null, role: this.roles[0]};
  cancelButtonDisabled = false;
  inviteButtonDisabled = false;

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
      if (!this.inviteButtonDisabled) {
        this.inviteButtonDisabled = true;
        this.projectService.inviteMember(this.project.id,
          {
            invitedUser
          }
        )
          .then(response => {
            this.store.dispatch(this.projectsActions.addInvitedUser(this.project.id, this.user));
            this.inviteButtonDisabled = false;
            this.project.invitedUsers.push(invitedUser);
            this.user = {email: null, role: this.roles[0]};
            this.showError('User is invited');
          }).catch(error => {
          this.inviteButtonDisabled = false;
          this.showError('Server Communication error.');
        });
      }
    }
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  cancelInvitation(invitedUser, index) {
    if (!this.cancelButtonDisabled) {
      this.cancelButtonDisabled = true;
      this.projectService.cancelInvitation(this.project.id, {invitedUser})
        .then(response => {
          this.store.dispatch(this.projectsActions.removeInvitedUser(this.project.id, invitedUser));
          this.project.invitedUsers.splice(index, 1)
          this.showError('Invitation was cancelled successfully');
          this.cancelButtonDisabled = false;
          this.cancelInvitationConfirmationViewIndex = -1
        }).catch(error => {
          this.showError('Server Communication error.');
          this.cancelButtonDisabled = false;
          this.cancelInvitationConfirmationViewIndex = -1
      });
    }
  }

  cancelInvitationConfirmation() {
    if (!this.cancelButtonDisabled) {
      this.cancelInvitationConfirmationViewIndex = -1;
    }
  }

  confirmCancelInvitation(index) {
    if (!this.cancelButtonDisabled) {
      this.cancelInvitationConfirmationViewIndex = index;
    }
  }

  validateInvitedUser() {
    if (!EMAIL_REGEX.test(this.user.email)) {
      this.showError('Invalid email address');
      return false;
    }
    for (let i = 0; i < this.project.invitedUsers.length; i++) {
      if (this.project.invitedUsers[i].email === this.user.email) {
        this.showError('This user has been invited to the project previously');
        return false;
      }
    }
    for (let i = 0; i < this.project.teamMembers.length; i++) {
      if (this.project.teamMembers[i].email === this.user.email) {
        this.showError('This user is already a member of this project');
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
