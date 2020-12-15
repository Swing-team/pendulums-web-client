import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { User }                                 from '../../shared/state/user/user.model';
import { AppService }                           from '../services/app.service';
import { VERSION }                              from 'environments/version';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
})
export class NotificationComponent implements OnInit {
  @Input() user: User;
  isUpdateAvailable: boolean;

  constructor (private ref: ElementRef,
               private appService: AppService) {}
  ngOnInit() {
    this.appService.getAppVersion().then((version) => {
      this.isUpdateAvailable = version > VERSION;
    })
  }
}
