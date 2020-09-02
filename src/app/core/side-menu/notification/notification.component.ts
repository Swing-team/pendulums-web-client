import {
  Component, ElementRef, HostListener,
  Input, OnInit, Output, EventEmitter
}                                        from '@angular/core';
import { User }                          from '../../../shared/state/user/user.model';
import { AppService }                    from '../../services/app.service';
import { VERSION }                       from 'environments/version';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
})
export class NotificationComponent implements OnInit {
  @Input() user: User;
  @Output() clickedOutSideOfNotification = new EventEmitter();
  isUpdateAvailable: boolean;

  constructor (private ref: ElementRef,
               private appService: AppService) {}
  ngOnInit() {
    this.appService.getAppVersion().then((version) => {
      this.isUpdateAvailable = version > VERSION;
    })
  }

  @HostListener('document:click', ['$event'])
  clickOutOfNotification(event) {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.clickedOutSideOfNotification.emit(event);
    }
  }
}
