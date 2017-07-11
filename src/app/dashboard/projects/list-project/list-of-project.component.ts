import {Component}        from '@angular/core';
import {Store}            from '@ngrx/store';
import {Observable}       from 'rxjs/Observable';
import {AppState}         from '../../../shared/state/appState';

@Component({
  selector: 'list-of-project',
  templateUrl: './list-of-project.component.html',
  styleUrls: ['./list-of-project.component.sass'],
})

export class ListOfProjectComponent {
  private projects: Observable<any>;

  constructor (private store: Store<AppState>) {
    this.projects = store.select('projects');
  }

}
