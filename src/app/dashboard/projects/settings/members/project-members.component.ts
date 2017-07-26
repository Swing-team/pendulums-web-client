import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';
import {ProjectService} from '../../../shared/projects.service';
import {userRoleInProject} from '../../../shared/utils';
import {cloneDeep} from 'lodash';
import {User} from '../../../../shared/state/user/user.model';
import {Md5} from 'ts-md5/dist/md5';
import {TeamMember} from '../../../../shared/state/team-member/team-member.model';
import {log} from 'util';
import {AppState} from '../../../../shared/state/appState';
import {Store} from '@ngrx/store';
import {ProjectsActions} from '../../../../shared/state/project/projects.actions';

@Component({
  selector: 'project-members',
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.sass']
})

export class ProjectMembersComponent implements OnInit {
  @Input() project: Project;
  @Input() user: User;
  members: Array<TeamMember> = [];

  constructor(private projectServices: ProjectService,
              private store: Store<AppState>,
              private projectsAction: ProjectsActions) {
  }

  ngOnInit(): void {
    console.log(this.project);
    let userIndexInMembersList = null;
    const projectMembers = cloneDeep(this.project.teamMembers);
    console.log('deep copy', projectMembers);
    const adminIds = [];
    projectMembers.map((teamMember, index) => {
      if (teamMember.id === this.user.id) {
        userIndexInMembersList = index;
      }
    });
    if (userIndexInMembersList !== null) {
      projectMembers.splice(userIndexInMembersList, 1);
    }
    if (this.project.admins) {
      this.project.admins.map(admin => {
        if (admin.id !== this.user.id) {
          this.members.push({...admin, role: 'admin'});
          adminIds.push(admin.id);
        }
      });
    }

    projectMembers.map(member => {
      if (this.project.admins) {
        if (adminIds.indexOf(member.id) === -1) {
          this.members.push({...member, role: 'team member'});
        }
      } else {
        this.members.push({...member, role: 'team member'});
      }
    });
    console.log(this.members);
  }

  userEmailHash(email) {
    return Md5.hashStr(email);
  }

  getUserRole() {
    return userRoleInProject(this.project, this.user.id);
  }

  removeMember(id) {
    console.log(id);
    // TODO: arminghm 22 Jul 2017 Show a popup menu to accept the delete process
    this.projectServices.removeMember(this.project.id, id)
      .then(response => {
        // TODO: arminghm 22 Jul 2017 Remove the deleted members from state
      })
      .catch(error => {
        console.log('error is: ', error);
      });
  }

  changeTeamMemberRole(memberId, event) {
    console.log(event);
    this.projectServices.changeTeamMemberRole(this.project.id, memberId, event.selectedItem)
      .then(response => {
        this.store.dispatch(this.projectsAction.changeMemberRole(this.project.id, memberId, event.selectedItem));
      })
      .catch(error => {
      });
  }
}
