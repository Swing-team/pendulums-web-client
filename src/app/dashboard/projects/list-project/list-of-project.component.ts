import {Component, Inject}        from '@angular/core';
import {Store}                    from '@ngrx/store';
import {Observable}               from 'rxjs/Observable';
import {AppState}                 from '../../../shared/state/appState';
import {APP_CONFIG}               from '../../../app.config';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent {
  private projects: Observable<any>;

  constructor (private store: Store<AppState>,
               @Inject(APP_CONFIG) private config) {
    this.projects = store.select('projects');
  }


}
