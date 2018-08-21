import {
  Component, ElementRef, HostListener,
  Inject, Input, OnInit, Output, EventEmitter
}                                        from '@angular/core';
import { APP_CONFIG }                    from '../../../app.config';
import { User }                          from '../../../shared/state/user/user.model';
import { AppService }                    from '../../services/app.service';
import { VERSION }                       from 'environments/version';

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

  constructor (@Inject(APP_CONFIG) private config,
               private ref: ElementRef,
               private appService: AppService) {}
  ngOnInit() {
    this.pendingInvitations = this.user.pendingInvitations;
    this.appService.getAppVersion().then((version) => {
      this.isUpdateAvalable = version > VERSION;
    })
  }

  @HostListener('document:click', ['$event'])
  clickOutOfNotification(event) {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.clickedOutSideOfNotification.emit(event);
    }
  }
}
