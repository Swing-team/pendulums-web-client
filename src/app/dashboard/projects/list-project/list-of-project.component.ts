import {Component, Inject, Input}        from '@angular/core';
import {Observable}                      from 'rxjs/Observable';
import {APP_CONFIG}                      from '../../../app.config';
import {Project} from '../../../shared/state/project/project.model';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent {
  @Input() projects: Observable<Project>;

  constructor (
    private store: Store<AppState>,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.projects = store.select('projects');
  }

  openCreateProjectModal() {
    this.modalService.show({
      component: CreateProjectComponent,
      containerRef: this.viewContainerRef
    });
  }
}
