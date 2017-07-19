import {Component, Input} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'dangerous-actions',
  templateUrl: './project-dangerous-actions.component.html',
  styleUrls: ['./project-dangerous-actions.component.sass']
})

export class DangerousActionsComponent {
  @Input() project: Project;

  constructor() {
  }
}

