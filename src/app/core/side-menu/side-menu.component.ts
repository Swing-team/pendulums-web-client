import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {User}                                           from '../../shared/state/user/user.model';
import {APP_CONFIG}                                     from '../../app.config';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent {
  @Output() onSignoutClicked = new EventEmitter();
  @Input() user: User;
  private profileActive = false;

  constructor (@Inject(APP_CONFIG) private config) {}

  signout() {
    this.onSignoutClicked.emit();
  }

  toggleProfile() {
    this.profileActive = !this.profileActive;
  }
}
