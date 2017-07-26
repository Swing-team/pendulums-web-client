import {Component, Inject, Input, ViewContainerRef} from '@angular/core';
import {APP_CONFIG} from '../../../../app.config';
import {Project} from '../../../../shared/state/project/project.model';
import {ModalService} from '../../../../core/modal/modal.service';
import {ProjectSettingsModalComponent} from 'app/dashboard/projects/settings/modal/project-settings-modal.component';
import {User} from '../../../../shared/state/user/user.model';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})
export class ProjectItemComponent {
  @Input() project: Project;
  @Input() user: User;
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

  constructor(@Inject(APP_CONFIG) private config,
              private modalService: ModalService,
              private viewContainerRef: ViewContainerRef) {
    this.startTask = false;
    this.taskName = 'Untitled task';
  }

  toggleTimer() {
    this.startTask = !this.startTask;
  }

  showSettings() {
    this.modalService.show({
      component: ProjectSettingsModalComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        project: this.project,
        user: this.user
      }
    });
  }
}
