import {
  Component, EventEmitter, Inject,
  Input, OnInit, Output, ViewChild }                      from '@angular/core';
import { User }                                           from '../../shared/state/user/user.model';
import { APP_CONFIG }                                     from '../../app.config';
import { Md5 }                                            from 'ts-md5/dist/md5';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent implements OnInit {
  @Output() onSignoutClicked = new EventEmitter();
  @Input() user: User;
  @ViewChild('notifications') notifications;
  emailHash: any;
  private profileIsActive = false;
  private notificationIsActive = false;

  constructor (@Inject(APP_CONFIG) private config) {}

  ngOnInit() {
    this.emailHash = Md5.hashStr(this.user.email);
  }

  signout() {
    this.onSignoutClicked.emit();
  }

  toggleProfile() {
    this.profileIsActive = !this.profileIsActive;
    this.notificationIsActive = false;
  }

  toggleNotifications() {
    this.notificationIsActive = !this.notificationIsActive;
    this.profileIsActive = false;
  }

  clickedOutside(event) {
    if (this.notifications.nativeElement.contains(event.target)) {
      console.log('clicked inside2');
    } else {
      this.notificationIsActive = false;
    }
  }
}
