import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent {
  @Output() onSignoutClicked = new EventEmitter();

  signout() {
    this.onSignoutClicked.emit();
  }
}
