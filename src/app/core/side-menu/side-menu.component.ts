import {
  Component, EventEmitter, Inject,
  Input, OnInit, Output, ViewChild }     from '@angular/core';
import { User }                          from '../../shared/state/user/user.model';
import { APP_CONFIG }                    from '../../app.config';
import { Md5 }                           from 'ts-md5/dist/md5';
import { Router }                        from '@angular/router';

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
  private notificationIsActive = false;
  private activeItemNumber = 0;

  constructor (@Inject(APP_CONFIG) private config,
               private router: Router) {}

  ngOnInit() {
    this.emailHash = Md5.hashStr(this.user.email);
  }

  signout() {
    this.onSignoutClicked.emit();
    this.activeItemNumber = 4;
  }

  updateIndex(number) {
    this.activeItemNumber = number;
  }

  toggleNotifications() {
    this.activeItemNumber = 2;
    this.notificationIsActive = !this.notificationIsActive;
    if (!this.notificationIsActive) {
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }

  clickedOutside(event) {
    if (this.notifications.nativeElement.contains(event.target)) {
      console.log('clicked inside');
    } else {
      this.notificationIsActive = false;
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }
}
