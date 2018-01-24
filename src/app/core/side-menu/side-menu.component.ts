import {
  Component, ElementRef, EventEmitter, HostListener, Inject,
  Input, OnInit, Output, ViewChild
}                                        from '@angular/core';
import { User }                          from '../../shared/state/user/user.model';
import { APP_CONFIG }                    from '../../app.config';
import { Md5 }                           from 'ts-md5/dist/md5';
import { Router }                        from '@angular/router';
import { ErrorService }                  from '../error/error.service';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})

export class SideMenuComponent implements OnInit {
  @Output() onSignoutClicked = new EventEmitter();
  @Output() clickedOutsideOfMenu = new EventEmitter();
  @Output() clickedToCloseMenu = new EventEmitter();
  @Input() user: User;
  @Input() netConnected: boolean;
  @ViewChild('notifications') notifications;
  emailHash: any;
  pendulumNotification: boolean;
  notificationIsActive = false;
  activeItemNumber = 0;

  constructor (@Inject(APP_CONFIG) private config,
               private router: Router,
               private errorService: ErrorService,
               private eRef: ElementRef) {}

  ngOnInit() {
    this.emailHash = Md5.hashStr(this.user.email);
    this.pendulumNotification = false;

    // initial active item in side menu by router
    if (this.router.url === '/dashboard') {
      this.activeItemNumber = 3;
    }
    if (this.router.url === '/profile') {
      this.activeItemNumber = 1;
    }
  }

  signout() {
    if (this.netConnected) {
      this.onSignoutClicked.emit();
      this.activeItemNumber = 4;
    } else {
      this.showError('This feature is not available in offline mode' );
    }
  }

  updateIndex(number) {
    this.activeItemNumber = number;
    this.pendulumNotification = false;
    this.clickedToCloseMenu.emit();
  }

  toggleNotifications() {
    this.activeItemNumber = 2;
    this.pendulumNotification = false;
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

  togglePendulumNotifications() {
    this.activeItemNumber = 5;
    this.pendulumNotification = !this.pendulumNotification;
    if (!this.pendulumNotification) {
      if (this.router.url === '/dashboard') {
        this.activeItemNumber = 3;
      }
      if (this.router.url === '/profile') {
        this.activeItemNumber = 1;
      }
    }
  }

  clickedOutSideOfNotification(event) {
    if (this.notifications.nativeElement.contains(event.target)) {
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

  @HostListener('document:click', ['$event'])
  clickOutOfMenu(event) {
    if (this.eRef.nativeElement.contains(event.target)) {
      console.log('clicked inside menu of sideMenu.');
    } else {
      this.clickedOutsideOfMenu.emit(event);
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
