import {Component} from '@angular/core';
import {Project} from '../../../shared/project.model';

@Component({
  selector: 'project-settings-modal',
  templateUrl: './project-settings-modal.component.html',
  styleUrls: ['./project-settings-modal.component.sass']
})

export class ProjectSettingsModalComponent {
  private project: Project = new Project();
  modalIsActive = false;
  formSubmitted = false;
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

  settingsModalActivation() {
    this.modalIsActive = true;
  }

  closeSettingsModal() {
    this.modalIsActive = false;
  }
}
