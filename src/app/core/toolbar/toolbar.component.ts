import {
  Component, EventEmitter, Inject,
  Input, Output, OnInit, OnDestroy, ViewChild,
} from '@angular/core';
import { Observable }                       from 'rxjs/Observable';
import { APP_CONFIG }                       from '../../app.config';
import { Activity }                         from '../../shared/state/current-activity/current-activity.model';
import { Project }                          from '../../shared/state/project/project.model';
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
import { Status }                           from '../../shared/state/status/status.model';
import * as moment from 'moment';
import {userRoleInProject} from "../../dashboard/shared/utils";

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit, OnDestroy  {
  @Input() user: User;
  @Input() status: Status;
  @Input() projects: Array<Project>;
  @Input() currentActivity: Observable<Activity>;
  @Output() onMenuItemClicked = new EventEmitter();
  @ViewChild('activityNameElm') activityNameElm;
  currentActivityCopy: Activity;
  showTimeDuration = false;
  stopStartButtonDisabled = false;
  selectedProjectIndex: any;
  private selectedProject: Project;
  private taskName: string;
  private timeDuration: string;
  private activityStarted = false;
  private subscriptions: Array<Subscription> = [];

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private currentActivityActions: CurrentActivityActions,
               private unSyncedActivityActions: UnSyncedActivityActions,
               private projectsActions: ProjectsActions,
               private errorService: ErrorService,
               private statusActions: StatusActions) {
    this.selectedProject = new Project();
    this.currentActivityCopy = new Activity();
  }

  ngOnInit() {
    this.selectedProjectIndex = 0;

    if (this.projects.length > 0) {
      this.selectedProject = this.projects[0];
      this.taskName = this.projects[0].recentActivityName;
    }

    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        this.currentActivityCopy = currentActivity;

        // this part of code is to handel situation that we have slow connection and activityName is editing
        const activityNameElm = document.getElementById('activityNameElm');
        if (activityNameElm && document.activeElement === activityNameElm) {
          // do nothing
        } else {
          if (currentActivity.name) {
            this.taskName = currentActivity.name;
          }
        }

        this.projects.map((project, index) => {
          if (project.id === currentActivity.project) {
            this.selectedProject = project;
            this.selectedProjectIndex = index;
          }
        });

        if (this.currentActivityCopy.startedAt) {
          this.activityStarted = true;
          let startedAt;
          let now;
          let duration;
          setInterval(() => {
            if (this.currentActivityCopy.startedAt) {
              startedAt = Number(this.currentActivityCopy.startedAt);
              now = Date.now();
              duration = now - startedAt;
              this.timeDuration = this.getTime(duration);
            } else {
              this.timeDuration = '0';
            }
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
    this.selectedProjectIndex = event.index;
    this.selectedProject = event.selectedItem;
    this.taskName = this.selectedProject.recentActivityName;
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
    if (this.selectedProject.id) {
      this.activityStarted = true;
      if (!this.taskName) {
        this.taskName = 'untitled activity';
      }
      const activity = new Activity();
      activity.project = this.selectedProject.id;
      activity.user = this.user.id;
      activity.name = this.taskName;
      activity.startedAt = Date.now().toString();

      // we decided to put all data in db by default and then send it to server
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(activity));

      // update project recent activities
      this.manageProjectRecentActivitiesInState(this.selectedProject, activity);

      if (this.status.netStatus) {
        delete activity.stoppedAt;

        this.activityService.create(this.selectedProject.id, activity).then((resActivity) => {
          this.showError('The activity started');
          delete resActivity.createdAt;
          delete resActivity.updatedAt;

          // if we get ok response from server so we have id for currentActivity and it has to been set
          this.store.dispatch(this.currentActivityActions.loadCurrentActivity(resActivity));
          this.stopStartButtonDisabled = false;
        })
          .catch(error => {
            this.showError('Server communication error');
            console.log('server error happened', error);
            this.stopStartButtonDisabled = false;
          });
      } else {
        this.showError('The activity started');
        this.stopStartButtonDisabled = false;
      }

      // This timeout use to handle focus on input
      setTimeout(() => {
        const element: HTMLElement = document.getElementById('activityNameElm') as HTMLElement;
        if (element) {
          // We have to work with view child because select() doesn't exist on HTMLElement
          this.activityNameElm.nativeElement.focus();
          this.activityNameElm.nativeElement.select();
        }
      }, 300)
    } else {
      this.stopStartButtonDisabled = false;
      this.showError('Select a project');
    }
  }

  manageProjectRecentActivitiesInState(project, activity) {
    const userRoll = userRoleInProject(project, this.user.id);
    let activityPushType = 'edit';
    if (userRoll === 'team member') {
      activityPushType = 'push';

    } else if (project.teamMembers.length === 1) {
      activityPushType = 'push';
    }

    if (activityPushType === 'push') {
      this.store.dispatch(this.projectsActions.addActivityToProject(project.id, activity));
    } else if (activityPushType === 'edit') {
      this.store.dispatch(this.projectsActions.updateProjectActivities(project.id, activity));
    }
  }

  stopActivity() {
    if (this.currentActivity) {
      this.activityStarted = false;

      // first we need divide time to separated days
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

      // we must save divided activities and original activity in db
      this.pushDividedActivitiesToDb(dividedActivitiesArray);

      if (this.status.netStatus) {
        // now we will try to store all data at server
        if (this.currentActivityCopy.id) {
          this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
            this.updateStateInSuccess(dividedActivitiesArray);
          })
            .catch(error => {
              this.updateStateInCatch (error);
            });
        } else {
          this.activityService.createManually(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
            this.updateStateInSuccess(dividedActivitiesArray);
          })
            .catch(error => {
              this.updateStateInCatch (error);
            });
        }
      } else {
        this.showError('The activity stopped');
        this.stopStartButtonDisabled = false;
        this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
      }
    }
  }

  pushDividedActivitiesToServer (dividedActivitiesResult) {
    const result = [];
    dividedActivitiesResult.map((item) => {
      result.push(this.activityService.createManually(item.project, item).then((activity) => {
        this.store.dispatch(this.unSyncedActivityActions.removeUnSyncedActivityByFields(item))
      })
        .catch(error => {
          console.log('server error happened', error);
        }));
    });
    Promise.all(result).then(() => {
      this.stopStartButtonDisabled = false;
    })
  }

  pushDividedActivitiesToDb (dividedActivitiesResult) {
    // store an original activity
    this.store.dispatch(this.unSyncedActivityActions.addUnSyncedActivity(this.currentActivityCopy));
    this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));
    // store all divided activities
    dividedActivitiesResult.map((item) => {
      this.store.dispatch(this.unSyncedActivityActions.addUnSyncedActivity(item));
      this.store.dispatch(this.projectsActions.updateProjectActivities(item.project, item));
    });
  }

  updateStateInCatch (error) {
    console.log('server error happened', error);
    this.showError('Server communication error.');
    this.showError('The activity stopped');
    this.stopStartButtonDisabled = false;
    this.store.dispatch(this.currentActivityActions.clearCurrentActivity());

  }

  updateStateInSuccess (dividedActivitiesArray) {
    this.store.dispatch(this.unSyncedActivityActions.removeUnSyncedActivityByFields(this.currentActivityCopy));
    // we send divided activities to server after original activity because
    // The stop time of activity cannot be older than start time in current activity!
    this.pushDividedActivitiesToServer(dividedActivitiesArray);
    this.showError('The activity stopped');
    this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
  }

  showSideMenu(event) {
    this.onMenuItemClicked.emit(event);
  }

  nameActivity($event) {
    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      this.store.dispatch(this.currentActivityActions.renameCurrentActivity(this.currentActivityCopy.name));
      this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));

      if (this.status.netStatus) {
        delete this.currentActivityCopy.stoppedAt;

        if (this.currentActivityCopy.id) {
          this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
          })
            .catch(error => {
              console.log('server error happened', error);
            });
        } else {
          this.activityService.create(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
            // we reload currentActivity because it will get id and we will need it
            this.store.dispatch(this.currentActivityActions.loadCurrentActivity(activity));
          })
            .catch(error => {
              console.log('server error happened', error);
            });
        }
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
