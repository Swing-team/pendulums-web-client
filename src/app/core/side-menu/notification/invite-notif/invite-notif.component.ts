import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../shared/state/appState';
import { UserActions } from '../../../../shared/state/user/user.actions';
import { ProjectsActions } from '../../../../shared/state/project/projects.actions';
import { NotificationService } from '../notification.service';
import { Project } from '../../../../shared/state/project/project.model';
import { ErrorService } from 'app/core/error/error.service';

@Component({
  selector: 'app-invite-notif',
  templateUrl: './invite-notif.component.html',
  styleUrls: ['./invite-notif.component.sass']
})
export class InviteNotifComponent implements OnInit {
  @Input() project: Project
  @Input() pendingInvitations: Array<Project>;
  denyDisabledIndex = false;
  acceptDisabledIndex = false;
  user: any;

  constructor(private userActions: UserActions,
              private projectsActions: ProjectsActions,
              private notificationService: NotificationService,
              private store: Store<AppState>,
              private errorService: ErrorService) { }

  ngOnInit() {
  }

  accept(projectId) {
    if (!this.acceptDisabledIndex) {
      this.acceptDisabledIndex = true;
      this.notificationService.accept(projectId).then((project) => {
        project.activities = [];
        this.store.dispatch(this.projectsActions.addProject(project));
        this.store.dispatch(this.userActions.updateUserInvitations(projectId));
        this.acceptDisabledIndex = false;
      })
        .catch(error => {
          this.acceptDisabledIndex = false;
          if (error.status === 404) {
            this.store.dispatch(this.userActions.updateUserInvitations(projectId));
            this.showError('The project not found!');
          } else {
            console.log('error is: ', error);
            this.showError('No internet connection!');
          }
        });
    }
  }

  deny(projectId) {
    if (!this.denyDisabledIndex ) {
      this.denyDisabledIndex = true;
      this.notificationService.deny(projectId).then((Id) => {
        this.store.dispatch(this.userActions.updateUserInvitations(projectId));
        this.denyDisabledIndex = false;
      })
        .catch(error => {
          this.denyDisabledIndex = false;
          if (error.status === 404) {
            this.store.dispatch(this.userActions.updateUserInvitations(projectId));
          } else {
            console.log('error is: ', error);
            this.showError('No internet connection!');
          }
        });
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
