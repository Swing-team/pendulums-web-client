import {Component, Input} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';
import {ProjectService} from '../../../shared/projects.service';
import {errorHandler} from '@angular/platform-browser/src/browser';

@Component({
  selector: 'dangerous-actions',
  templateUrl: './project-dangerous-actions.component.html',
  styleUrls: ['./project-dangerous-actions.component.sass']
})

export class DangerousActionsComponent {
  @Input() project: Project;
  projectNameInput: String;

  constructor(private projectService: ProjectService) {
  }

  confirm() {
    if (this.projectNameInput === this.project.name) {
      console.log('deletion confirmed');
      this.projectService.delete(this.project._id)
        .then(response => {
        })
        .catch(errorHandler => {
        });
    } else {
      console.log('deletion ignored');
    }
  }
}

