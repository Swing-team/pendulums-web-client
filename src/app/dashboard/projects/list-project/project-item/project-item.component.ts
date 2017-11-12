import { Component, Inject, Input,
         OnInit, ViewContainerRef }           from '@angular/core';
import { APP_CONFIG }                         from '../../../../app.config';
import { Project }                            from '../../../../shared/state/project/project.model';
import { ActivityService }                    from '../../../shared/activity.service';
import { Store }                              from '@ngrx/store';
import { AppState }                           from '../../../../shared/state/appState';
import { Observable }                         from 'rxjs/Observable';
import { Activity }                           from '../../../../shared/state/current-activity/current-activity.model';
import { CurrentActivityActions }             from '../../../../shared/state/current-activity/current-activity.actions';
import { ProjectsActions }                    from '../../../../shared/state/project/projects.actions';
import { ModalService }                       from '../../../../core/modal/modal.service';
import { ProjectSettingsModalComponent }      from 'app/dashboard/projects/settings/modal/project-settings-modal.component';
import { User }                               from '../../../../shared/state/user/user.model';
import { Router }                             from '@angular/router';
import { ErrorService }                       from '../../../../core/error/error.service';
import { UnSyncedActivityActions }            from '../../../../shared/state/unsynced-activities/unsynced-activities.actions';
import { Status }                             from '../../../../shared/state/status/status.model';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})
export class ProjectItemComponent implements OnInit {
  @Input() project: Project;
  @Input() user: User;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;
  private currentActivityCopy: Activity;
  private activityStarted = false;
  private taskName: string;
  private activity: Activity;
  private activities: any;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private CurrentActivityActions: CurrentActivityActions,
               private projectsActions: ProjectsActions,
               private router: Router,
               private modalService: ModalService,
               private viewContainerRef: ViewContainerRef,
               private errorService: ErrorService,
               private UnSyncedActivityActions: UnSyncedActivityActions) {
    this.taskName = 'Untitled task';
    this.activities = [];
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        if (currentActivity.project === this.project.id) {
          this.activityStarted = true;
          this.taskName = currentActivity.name;
        } else {
          this.activityStarted = false;
        }
        this.currentActivityCopy = currentActivity;
      });
    }
    if (this.project.activities) {
      this.project.activities.map((activity) => {
        this.calculateActivityDuration(activity);
      });
    }
  }

  startActivity() {
    if (this.currentActivityCopy.startedAt) {
      this.stopActivity();
      this.startActivityAtServer();
    } else {
      this.startActivityAtServer();
    }
  }

  startActivityAtServer() {
    this.activity = new Activity();
    this.activity.name = this.taskName;
    this.activity.startedAt = Date.now().toString();
    this.activityService.create(this.project.id, this.activity).then((activity) => {
      this.showError('Activity started successfully!');
      delete activity.createdAt;
      delete activity.updatedAt;
      this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
    })
      .catch(error => {
        // we need two below fields for offline logic
        this.activity.project = this.project.id;
        this.activity.user = this.user.id;
        console.log('server error happened and it is: ', error);
        this.showError('Server communication error.');
        this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(this.activity));
      });
  }

  stopActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
          this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
          this.store.dispatch(this.projectsActions.updateProjectActivities(this.project.id, activity));
          this.taskName = 'Untitled task';
          this.showError('Activity stopped successfully!');
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('current Activity will store as offline');
            this.showError('Server communication error.');
            this.store.dispatch(this.UnSyncedActivityActions.addUnSyncedActivity(this.currentActivityCopy));
            this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));
            this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
            this.taskName = null;
            this.showError('Activity stopped successfully!');
          });
      } else {
        console.log('activity has no id so it should go through the sync way');
        this.activityService.createManually(this.project.id, this.currentActivityCopy).then((activity) => {
          this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
          this.store.dispatch(this.projectsActions.updateProjectActivities(this.project.id, activity));
          this.taskName = 'Untitled task';
          this.showError('Activity stopped successfully!');
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('current Activity will store as offline ');
            this.showError('Server communication error.');
            this.store.dispatch(this.UnSyncedActivityActions.addUnSyncedActivity(this.currentActivityCopy));
            this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));
            this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
            this.taskName = null;
            this.showError('Activity stopped successfully!');
          });
        }
      }
  }

  nameActivity($event) {
    // just for blur out the input
    const target = $event.target;
    target.blur();

    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(this.currentActivityCopy));
          });
      } else {
        console.log('activity has no id so it should go through the sync way');
        this.activityService.create(this.project.id, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('your edit will store at db');
            this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(this.currentActivityCopy));
          });
      }
    }
  }

  calculateActivityDuration (activity) {
    const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
    let result: any;
    result = {
      name: activity.name,
      hour: 0
    };
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    if (hours !== 0) {
      result.hour = hours + ':' + minutes ;
    }

    if (minutes !== 0 && hours === 0) {
      result.hour = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result.hour = seconds + ' sec';
    }
    this.activities.push(result);
  };

  showSettings() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: ProjectSettingsModalComponent,
        containerRef: this.viewContainerRef,
        inputs: {
          project: this.project,
          user: this.user
        }
      });
    } else {
      this.showError('You cant edit project in offline mod!');
    }
  }

  goToActivities(): void {
    if (this.status.netStatus) {
      this.router.navigate(['/activities', this.project.id]);
    } else {
      this.showError('You cant get activities in offline mod!');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
