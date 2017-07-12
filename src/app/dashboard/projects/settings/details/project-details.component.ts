import {Component, Input} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.sass']
})

export class ProjectDetailsComponent {
  @Input() project: Project;
  constructor() {}

}
