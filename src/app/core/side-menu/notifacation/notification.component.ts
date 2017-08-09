import {Component, Inject, Input, OnInit} from '@angular/core';
import {APP_CONFIG}               from '../../../app.config';
import {NotificationService} from './notification.service';
import {Store} from '@ngrx/store';
import {UserActions} from '../../../shared/state/user/user.actions';
import {AppState} from '../../../shared/state/appState';
import {Project} from '../../../shared/state/project/project.model';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
})
export class NotificationComponent implements OnInit {
  @Input() pendingInvitations: Project[] = [];

  constructor (@Inject(APP_CONFIG) private config,
               private NotificationService: NotificationService,
               private store: Store<AppState>,
               private userActions: UserActions) {}

  ngOnInit() {}

  accept(projectId) {
    this.NotificationService.accept(projectId).then(
      // todo: update user state and list
      // todo: add project to state
      
    )
      .catch(error => {
        console.log('error is: ', error);
      });
  }

  deny(projectId) {
    this.NotificationService.deny(projectId).then(
      // todo: update user state and list
    )
      .catch(error => {
        console.log('error is: ', error);
      });
  }
}
