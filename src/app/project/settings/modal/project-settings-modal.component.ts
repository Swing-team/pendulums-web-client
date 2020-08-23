import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../../shared/state/project/project.model';
import { User } from '../../../shared/state/user/user.model';
import { userRoleInProject } from '../../../utils/project.util';

@Component({
  selector: 'project-settings-modal',
  templateUrl: './project-settings-modal.component.html',
  styleUrls: ['./project-settings-modal.component.sass']
})

export class ProjectSettingsModalComponent implements OnInit {
  @Input() project: Project;
  @Input() user: User;
  @Input() projectIdInCurrentActivity: string;
  tabs = ['is-active', '', ''];
  readOnly = false;
  isOwner = false;
  isAdmin = false;

  ngOnInit(): void {
    switch (userRoleInProject(this.project, this.user.id)) {
      case 'team member':
        this.readOnly = true;
        break;
      case 'owner':
        this.isOwner = true;
        break;
      case 'admin':
        this.isAdmin = true;
        break;
    }
  }

  constructor() {
  }

  setSelectedTab(tabNumber) {
    switch (tabNumber) {
      case 0:
        this.tabs[0] = 'is-active';
        this.tabs[1] = '';
        this.tabs[2] = '';
        this.tabs[3] = '';
        break;
      case 1:
        this.tabs[0] = '';
        this.tabs[1] = 'is-active';
        this.tabs[2] = '';
        this.tabs[3] = '';
        break;
      case 2:
        this.tabs[0] = '';
        this.tabs[1] = '';
        this.tabs[2] = 'is-active';
        this.tabs[3] = '';
        break;
      default:
        this.tabs[0] = '';
        this.tabs[1] = '';
        this.tabs[2] = '';
        this.tabs[3] = 'is-active';
        break;
    }
  }
}
