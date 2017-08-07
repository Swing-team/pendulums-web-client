import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {User}                                           from '../../shared/state/user/user.model';
import {APP_CONFIG}                                     from '../../app.config';
import {Md5}                                            from 'ts-md5/dist/md5';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent implements OnInit {
  @Output() onSignoutClicked = new EventEmitter();
  @Input() user: User;
  emailHash: any;
  private profileActive = false;

  constructor (@Inject(APP_CONFIG) private config) {}

  ngOnInit(){
    this.emailHash = Md5.hashStr(this.user.email);
  }

  signout() {
    this.onSignoutClicked.emit();
  }

  toggleProfile() {
    this.profileActive = !this.profileActive;
  }
}
