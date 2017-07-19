import {Component, Inject, Input}        from '@angular/core';
import {APP_CONFIG} from '../../../../app.config';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})

export class ProjectItemComponent {
  @Input() project: any;
  @Input() index: any;
  private activities = [
    {
      name: 'first activity',
      hour: '1',
    },
    {
      name: 'second activity',
      hour: '2',
    },
    {
      name: 'third activity',
      hour: '12',
    },
  ];
  constructor (@Inject(APP_CONFIG) private config) {
  }
}
