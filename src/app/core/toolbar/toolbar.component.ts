import {Component, Inject, Input} from '@angular/core';
import {Observable}               from 'rxjs/Observable';
import {APP_CONFIG}               from '../../app.config';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent {
  @Input() projects: Observable<any>;

  constructor (
    @Inject(APP_CONFIG) private config
  ) {}

  projectSelected(event) {
    console.log(event.index);
    console.log(event.selectedItem);
  }
}
