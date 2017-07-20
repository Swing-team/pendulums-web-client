import {Component, Inject, Input}        from '@angular/core';
import {APP_CONFIG} from '../../../../app.config';
import {Project} from '../../../../shared/state/project/project.model';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})
export class ProjectItemComponent {
  @Input() project: Project;
  private startTask: boolean;
  private taskName: string;
  private activities = [
    {
      name: 'first activity',
      hour: '1',
    },
    {
      name: 'second activity second activity',
      hour: '2',
    },
    {
      name: 'third activity',
      hour: '12',
    },
  ];
  constructor (@Inject(APP_CONFIG) private config) {
    this.startTask = false;
    this.taskName = 'Untitled task';
  }

  toggleTimer() {
    this.startTask = !this.startTask;
  }
}
