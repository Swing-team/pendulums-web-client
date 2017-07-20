import {Component, Inject, Input}        from '@angular/core';
import {Store}                    from '@ngrx/store';
import {Observable}               from 'rxjs/Observable';
import {AppState}                 from '../../../shared/state/appState';
import {APP_CONFIG}               from '../../../app.config';
import {Project} from '../../../shared/state/project/project.model';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent {
  @Input() projects: Observable<Project>;

  constructor (@Inject(APP_CONFIG) private config) {}
}
