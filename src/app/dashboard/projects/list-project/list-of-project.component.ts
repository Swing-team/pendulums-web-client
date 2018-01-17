import {Component, Input, ViewContainerRef}           from '@angular/core';
import { Observable }                                 from 'rxjs/Observable';
import { ModalService }                               from '../../../core/modal/modal.service';
import { CreateProjectComponent }                     from '../create-project/create-project.component';
import { Project }                                    from '../../../shared/state/project/project.model';
import { Activity }                                   from '../../../shared/state/current-activity/current-activity.model';
import { Status }                                     from '../../../shared/state/status/status.model';
import { User }                                       from '../../../shared/state/user/user.model';
import { ErrorService }                               from '../../../core/error/error.service';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent {
  @Input() projects: Observable<Project>;
  @Input() user: Observable<User>;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;

  constructor (
    private store: Store<AppState>,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef,
    private errorService: ErrorService,
  ) {}

  openCreateProjectModal() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: CreateProjectComponent,
        containerRef: this.viewContainerRef
      });
    } else {
      this.showError('You cant create project in offline mode!');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
