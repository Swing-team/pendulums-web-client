import {Component, Inject, Input, OnInit}       from '@angular/core';
import { trigger, style, transition, animate }  from '@angular/animations';
import { Project }                              from '../../../../shared/state/project/project.model';
import { ProjectService }                       from '../../../shared/projects.service';
import { userRoleInProject }                    from '../../../shared/utils';
import { cloneDeep }                            from 'lodash';
import { User }                                 from '../../../../shared/state/user/user.model';
import { Md5 }                                  from 'ts-md5/dist/md5';
import { TeamMember }                           from '../../../../shared/state/team-member/team-member.model';
import { AppState }                             from '../../../../shared/state/appState';
import { Store }                                from '@ngrx/store';
import { ProjectsActions }                      from '../../../../shared/state/project/projects.actions';
import { ErrorService }                         from '../../../../core/error/error.service';
import { environment }                          from '../../../../../environments/environment';

@Component({
  selector: 'project-members',
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
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.sass']
})

export class ProjectMembersComponent implements OnInit {
  @Input() project: Project;
  @Input() user: User;
  @Input() readOnly: boolean;
  items = ['team member', 'admin'];
  members: Array<TeamMember> = [];
  removeMemberConfirmationViewIndex: Number = -1;
  removeButtonDisabled = false;
  teamMemberRoleChanged = false;
  environment = environment;

  constructor(private projectServices: ProjectService,
              private store: Store<AppState>,
              private projectsAction: ProjectsActions,
              private errorService: ErrorService) {
  }

  ngOnInit(): void {
    let userIndexInMembersList = null;
    const projectMembers = cloneDeep(this.project.teamMembers);
    const adminsAndOwnerIds = [];
    projectMembers.map((teamMember, index) => {
      if (teamMember.id === this.user.id) {
        userIndexInMembersList = index;
      }
    });

    if (userIndexInMembersList !== null) {
      projectMembers.splice(userIndexInMembersList, 1);
    }

    // here we specify admins from team members
    if (this.project.admins) {
      this.project.admins.map(admin => {
        if (admin.id !== this.user.id) {
          this.members.push({...admin, role: 'admin'});
          adminsAndOwnerIds.push(admin.id);
        }
      });
    }

    // here we specify owner from team members
    if (this.project.owner) {
      if (this.project.owner.id !== this.user.id) {
        this.members.push({...this.project.owner, role: 'owner'});
        adminsAndOwnerIds.push(this.project.owner.id);
      }
    }

    projectMembers.map(member => {
      if (this.project.admins) {
        if (adminsAndOwnerIds.indexOf(member.id) === -1) {
          this.members.push({...member, role: 'team member'});
        }
      } else {
        this.members.push({...member, role: 'team member'});
      }
    });
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  getUserRole() {
    return userRoleInProject(this.project, this.user.id);
  }

  removeMember(member, index) {
    if (!this.removeButtonDisabled && member.role !== 'owner') {
      this.removeButtonDisabled = true;
      this.projectServices.removeMember(this.project.id, member.id)
        .then(response => {
          this.store.dispatch(this.projectsAction.removeMember(this.project.id, member.id));
          this.members.splice(index, 1);
          this.removeButtonDisabled = false;
          this.removeMemberConfirmationViewIndex = -1
        })
        .catch(error => {
          console.log('error is: ', error);
          this.showError('Server communication error.');
          this.removeButtonDisabled = false;
          this.removeMemberConfirmationViewIndex = -1
        });
    }
  }

  confirmRemoveMember(index) {
    if (!this.removeButtonDisabled) {
      this.removeMemberConfirmationViewIndex = index;
    }
  }

  cancelRemoveConfirmation() {
    if (!this.removeButtonDisabled) {
      this.removeMemberConfirmationViewIndex = -1;
    }
  }

  changeTeamMemberRole(memberId, index, event) {
    console.log(event);
    if (!this.teamMemberRoleChanged) {
      this.teamMemberRoleChanged = true;
      this.projectServices.changeTeamMemberRole(this.project.id, memberId, event.selectedItem)
        .then(response => {
          this.store.dispatch(this.projectsAction.changeMemberRole(this.project.id, memberId, event.selectedItem));
          this.members[index].role = event.selectedItem;
          this.teamMemberRoleChanged = false;
        })
        .catch(error => {
          console.log('error is: ', error);
          this.teamMemberRoleChanged = false;
          this.showError('Server communication error.');
        });
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
