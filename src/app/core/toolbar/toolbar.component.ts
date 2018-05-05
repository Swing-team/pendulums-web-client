import {
  Component, EventEmitter, Inject,
  Input, Output, OnInit, OnDestroy,
}                                           from '@angular/core';
import { Observable }                       from 'rxjs/Observable';
import { APP_CONFIG }                       from '../../app.config';
import { Activity }                         from '../../shared/state/current-activity/current-activity.model';
import { Project }                          from '../../shared/state/project/project.model';
import { Projects }                         from '../../shared/state/project/projects.model';
import { ActivityService }                  from 'app/dashboard/shared/activity.service';
import { Store }                            from '@ngrx/store';
import { CurrentActivityActions }           from 'app/shared/state/current-activity/current-activity.actions';
import { AppState }                         from 'app/shared/state/appState';
import { ProjectsActions }                  from '../../shared/state/project/projects.actions';
import { ErrorService }                     from '../error/error.service';
import { User }                             from '../../shared/state/user/user.model';
import { UnSyncedActivityActions }          from '../../shared/state/unsynced-activities/unsynced-activities.actions';
import { StatusActions }                    from '../../shared/state/status/status.actions';
import { Subscription }                     from 'rxjs/Subscription';
import * as moment from 'moment';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit, OnDestroy  {
  @Input() user: User;
  @Input() projects: Projects;
  @Input() currentActivity: Observable<Activity>;
  @Output() onMenuItemClicked = new EventEmitter();
  currentActivityCopy: Activity;
  showTimeDuration = false;
  stopStartButtonDisabled = false;
  private selectedProject: Project;
  private taskName: string;
  private timeDuration: string;
  private activityStarted = false;
  private subscriptions: Array<Subscription> = [];

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private CurrentActivityActions: CurrentActivityActions,
               private UnsyncedActivityActions: UnSyncedActivityActions,
               private projectsActions: ProjectsActions,
               private errorService: ErrorService,
               private StatusActions: StatusActions) {
    this.selectedProject = new Project();
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        this.currentActivityCopy = currentActivity;
        this.taskName = currentActivity.name;
        this.selectedProject = this.projects.entities[currentActivity.project];
        if (this.currentActivityCopy.startedAt) {
          this.activityStarted = true;
          let startedAt;
          let now;
          let duration;
          setInterval(() => {
            startedAt = Number(this.currentActivityCopy.startedAt);
            now = Date.now();
            duration = now - startedAt;
            this.timeDuration = this.getTime(duration);
          }, 1000);
        } else {
          this.activityStarted = false;
        }
      }));
    }
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  getTime (duration) {
    let result: string;
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    let tempMinutes: string ;
    let tempSeconds: string ;
    let tempHours: string ;
    if (minutes < 10) {
      tempMinutes = '0' + minutes;
    } else {
      tempMinutes = '' + minutes;
    }
    if (seconds < 10) {
      tempSeconds = '0' + seconds;
    } else {
      tempSeconds = '' + seconds;
    }
    if (hours < 10) {
      tempHours = '0' + hours;
    } else {
      tempHours = '' + hours;
    }

    result = tempHours + ':' + tempMinutes + ':' + tempSeconds;



    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  };

  projectSelected(event) {
    console.log(event.index);
    this.selectedProject = event.selectedItem;
    this.taskName = this.selectedProject.recentActivityName;
    console.log(event.selectedItem);
  }

  toggleShowTimeDuration() {
    this.showTimeDuration = !this.showTimeDuration;
  }

  toggleStopStart() {
    if (!this.stopStartButtonDisabled) {
      this.stopStartButtonDisabled = true;
      if (this.activityStarted) {
        this.stopActivity();
      } else {
        this.startActivity();
      }
    }
  }

  startActivity() {
    if (this.selectedProject) {
      this.activityStarted = true;
      if (!this.taskName) {
        this.taskName = 'untitled activity';
      }
      const activity = new Activity();
      activity.project = this.selectedProject.id;
      activity.user = this.user.id;
      activity.name = this.taskName;
      activity.startedAt = Date.now().toString();
      this.activityService.create(this.selectedProject.id, activity).then((resActivity) => {
        this.showError('The activity was started');
        delete resActivity.createdAt;
        delete resActivity.updatedAt;
        this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(resActivity));
        this.stopStartButtonDisabled = false;
      })
        .catch(error => {
          this.showError('Server communication error');
          console.log('server error happened', error);
          this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
          this.store.dispatch(this.StatusActions.updateUnsyncedDataChanged(true));
          this.stopStartButtonDisabled = false;
        });
    } else {
      this.stopStartButtonDisabled = false;
      this.showError('Select a project');
    }
  }

  stopActivity() {
    if (this.currentActivity) {
      this.activityStarted = false;
      const dividedActivitiesArray = [];
      const stoppedAtDay = moment().startOf('day');
      const startedAtDay = moment(Number(this.currentActivityCopy.startedAt)).startOf('day');
      if (stoppedAtDay.isSame(startedAtDay)) {
        this.currentActivityCopy.stoppedAt = moment().valueOf().toString();
      } else {
        const diff = stoppedAtDay.diff(startedAtDay, 'days');
        let startedAt = this.currentActivityCopy.startedAt;
        let stoppedAt = moment(Number(this.currentActivityCopy.startedAt)).endOf('day').valueOf();
        this.currentActivityCopy.stoppedAt = stoppedAt.toString();
        for (let i = 0; i < diff; i++) {
          startedAt = (stoppedAt + 1).toString();
          if ( i < diff - 1) {
            stoppedAt = moment(stoppedAt + 1).endOf('day').valueOf();
          } else if (i === diff - 1) {
            stoppedAt = moment().valueOf();
          }
          const tempResult = {
            name: this.currentActivityCopy.name,
            user: this.currentActivityCopy.user,
            project: this.currentActivityCopy.project,
            startedAt: startedAt,
            stoppedAt: stoppedAt.toString(),
          };
          dividedActivitiesArray.push(tempResult);
        }
      }

      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
          this.updateStateInSuccess(activity, dividedActivitiesArray);
        })
          .catch(error => {
            this.updateStateInCatch (error, dividedActivitiesArray);
          });
      } else {
        this.activityService.createManually(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
          this.updateStateInSuccess(activity, dividedActivitiesArray);
        })
          .catch(error => {
            this.updateStateInCatch (error, dividedActivitiesArray);
          });
      }
    }
  }

  pushDividedActivitiesToServer (dividedActivitiesResult) {
    const result = [];
    result.push(dividedActivitiesResult.map((item) => {
      this.activityService.createManually(this.currentActivityCopy.project, item).then((activity) => {
        this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, activity));
      })
        .catch(error => {
          console.log('server error happened', error);
          this.store.dispatch(this.UnsyncedActivityActions.addUnSyncedActivity(item));
          this.store.dispatch(this.StatusActions.updateUnsyncedDataChanged(true));
          this.store.dispatch(this.projectsActions.updateProjectActivities(item.project, item));
        });
    }));
    Promise.all(result).then(() => {
      this.stopStartButtonDisabled = false;
    })
  }

  pushDividedActivitiesToDb (dividedActivitiesResult) {
    const result = [];
    result.push(dividedActivitiesResult.map((item) => {
      this.store.dispatch(this.UnsyncedActivityActions.addUnSyncedActivity(item));
      this.store.dispatch(this.projectsActions.updateProjectActivities(item.project, item));
    }));
    Promise.all(result).then(() => {
      this.stopStartButtonDisabled = false;
    })
  }

  updateStateInCatch (error, dividedActivitiesResult) {
    console.log('server error happened', error);
    this.showError('Server communication error.');
    this.store.dispatch(this.UnsyncedActivityActions.addUnSyncedActivity(this.currentActivityCopy));
    this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));
    // we must save divided activities in db
    this.pushDividedActivitiesToDb(dividedActivitiesResult);
    this.store.dispatch(this.StatusActions.updateUnsyncedDataChanged(true));
    this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
    this.showError('The activity was stopped');
  }

  updateStateInSuccess (activity, dividedActivitiesArray) {
    this.store.dispatch(this.CurrentActivityActions.clearCurrentActivity());
    this.store.dispatch(this.projectsActions.updateProjectActivities(activity.project, activity));
    // we send divided activities to server after original activity because
    // The stop time of activity cannot be older than start time in current activity!
    this.pushDividedActivitiesToServer(dividedActivitiesArray);
    this.showError('The activity was stopped');
  }

  showSideMenu(event) {
    this.onMenuItemClicked.emit(event);
  }

  nameActivity($event) {
    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
        })
          .catch(error => {
            console.log('server error happened', error);
            this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(this.currentActivityCopy));
            this.store.dispatch(this.StatusActions.updateUnsyncedDataChanged(true));
          });
      } else {
        this.activityService.create(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(activity));
        })
          .catch(error => {
            console.log('server error happened', error);
            this.store.dispatch(this.CurrentActivityActions.loadCurrentActivity(this.currentActivityCopy));
            this.store.dispatch(this.StatusActions.updateUnsyncedDataChanged(true));
          });
      }
    }
    // just for blur out the input
    const target = $event.target;
    target.blur();
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
