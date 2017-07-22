import {Component, Inject, Input, ViewContainerRef} from '@angular/core';
import {Store}                                      from '@ngrx/store';
import {Observable}                                 from 'rxjs/Observable';
import {AppState}                                   from '../../../shared/state/appState';
import {ModalService}                               from '../../../core/modal/modal.service';
import {CreateProjectComponent}                     from '../create-project/create-project.component';
import {Project}                                    from '../../../shared/state/project/project.model';

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
