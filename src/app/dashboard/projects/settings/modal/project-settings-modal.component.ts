import {Component, Input} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';
import {User} from '../../../../shared/state/user/user.model';

@Component({
  selector: 'project-settings-modal',
  templateUrl: './project-settings-modal.component.html',
  styleUrls: ['./project-settings-modal.component.sass']
})

export class ProjectSettingsModalComponent {
  @Input() project: Project;
  @Input() user: User;
  tabs = ['is-active', '', ''];
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
