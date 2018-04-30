import {
  Component, ElementRef, HostListener,
  Inject, Input, OnInit, Output, EventEmitter
}                                        from '@angular/core';
import { APP_CONFIG }                    from '../../../app.config';
import { NotificationService }           from './notification.service';
import { Store }                         from '@ngrx/store';
import { UserActions }                   from '../../../shared/state/user/user.actions';
import { AppState }                      from '../../../shared/state/appState';
import { User }                          from '../../../shared/state/user/user.model';
import { ProjectsActions }               from '../../../shared/state/project/projects.actions';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
})
export class NotificationComponent implements OnInit {
  pendingInvitations: Array<object>;
  @Input() user: User;
  @Output() clickedOutSideOfNotification = new EventEmitter();
  denyDisabledIndex = -1;
  acceptDisabledIndex = -1;

  constructor (@Inject(APP_CONFIG) private config,
               private NotificationService: NotificationService,
               private store: Store<AppState>,
               private userActions: UserActions,
               private projectsActions: ProjectsActions,
               private ref: ElementRef) {}

  ngOnInit() {
    this.pendingInvitations = this.user.pendingInvitations;
  }

  accept(projectId, i) {
    if (this.acceptDisabledIndex < 0 && this.denyDisabledIndex < 0) {
      this.acceptDisabledIndex = i;
      this.NotificationService.accept(projectId).then((project) => {
        this.store.dispatch(this.projectsActions.addProject(project));
        this.user.pendingInvitations.map((obj, index) => {
          if (obj.id === projectId) {
            this.user.pendingInvitations.splice(index, 1);
          }
        });
        this.store.dispatch(this.userActions.loadUser(this.user));
        this.acceptDisabledIndex = -1;
      })
        .catch(error => {
          console.log('error is: ', error);
          this.acceptDisabledIndex = -1;
        });
    }
  }

  deny(projectId, i) {
    if (this.denyDisabledIndex < 0 && this.acceptDisabledIndex < 0) {
      this.denyDisabledIndex = i;
      this.NotificationService.deny(projectId).then((Id) => {
        this.user.pendingInvitations.map((obj, index) => {
          if (obj.id === projectId) {
            this.user.pendingInvitations.splice(index, 1);
          }
        });
        this.store.dispatch(this.userActions.loadUser(this.user));
        this.denyDisabledIndex = -1;
      })
        .catch(error => {
          console.log('error is: ', error);
          this.denyDisabledIndex = -1;
        });
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutOfNotification(event) {
    if (!this.ref.nativeElement.contains(event.target)) {
      this.clickedOutSideOfNotification.emit(event);
    }
  }
}
