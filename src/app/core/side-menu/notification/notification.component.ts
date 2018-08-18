import {
  Component, ElementRef, HostListener,
  Inject, Input, OnInit, Output, EventEmitter
}                                        from '@angular/core';
import { APP_CONFIG }                    from '../../../app.config';
import { User }                          from '../../../shared/state/user/user.model';
import { AppService }                    from '../../services/app.service';
import { VERSION }                              from 'environments/version';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
})
export class NotificationComponent implements OnInit {
  pendingInvitations: Array<object>;
  @Input() user: User;
  @Output() clickedOutSideOfNotification = new EventEmitter();
  isUpdateAvalable: boolean;
  Version: string

  constructor (@Inject(APP_CONFIG) private config,
               private ref: ElementRef,
               private appService: AppService) {}
  ngOnInit() {
    this.Version = VERSION;
    this.pendingInvitations = this.user.pendingInvitations;
    if (this.appService.getAppVersion()) {
      this.isUpdateAvalable = true;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutOfNotification(event) {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.clickedOutSideOfNotification.emit(event);
    }
  }
}
