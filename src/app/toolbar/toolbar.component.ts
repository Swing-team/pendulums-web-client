import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {APP_CONFIG} from '../app.config';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent {
  @Input() user: Observable<any>;
  @Output() onSignOutClicked = new EventEmitter();

  constructor (
    @Inject(APP_CONFIG) private config
  ) {}

  signOut() {
    this.onSignOutClicked.emit();
  }
}
