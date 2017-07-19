import {Component, Input} from '@angular/core';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'project-members',
  templateUrl: './project-members.component.html',
  styleUrls: ['./project-members.component.sass']
})

export class ProjectMembersComponent {
  @Input() project: Project;

  constructor() {
  }
}
