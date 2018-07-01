import {
  Component, Inject, Input,
  OnDestroy, OnInit, ViewChild
} from '@angular/core';
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
import { Md5 }                                from 'ts-md5/dist/md5';
import { Subscription }                       from 'rxjs/Subscription';
import { userInProject, userRoleInProject }   from '../../../shared/utils';
import * as moment from 'moment';


@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass']
})
export class ProjectItemComponent implements OnInit, OnDestroy {
  @Input() project: Project;
  @Input() user: User;
  @Input() status: Status;
  @Input() currentActivity: Observable<Activity>;
  @ViewChild('activityNameElm') activityNameElm;
  activityStarted = false;
  activityButtonDisabled = false;
  showMore = false;
  showMoreStart: number;
  showMoreEnd: number;

  // activityPushType field used to manage the procedure we should update project recent activities in state
  // if it be "push" means that user is team member or project has just 1 team member and we just need to push activity to recent activities
  // if it be "edit" means that user is admin/owner and project members are more that 1 so we should update recent activities
  private activityPushType: string;
  private currentActivityCopy: Activity;
  private taskName: string;
  private activity: Activity;
  private subscriptions: Array<Subscription> = [];

  constructor (@Inject(APP_CONFIG) public config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private currentActivityActions: CurrentActivityActions,
               private projectsActions: ProjectsActions,
               private router: Router,
               private modalService: ModalService,
               private errorService: ErrorService,
               private unSyncedActivityActions: UnSyncedActivityActions) {
  }

  ngOnInit() {
    this.taskName = this.project.recentActivityName;
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe((currentActivity) => {
        if (currentActivity.project === this.project.id) {
          this.activityStarted = true;

          // this part of code is to handel situation that we have slow connection and activityName is editing
          if (this.activityNameElm && document.activeElement === this.activityNameElm.nativeElement) {
            // do nothing
          } else {
            this.taskName = currentActivity.name;
          }
        } else {
          this.activityStarted = false;
        }
        this.currentActivityCopy = currentActivity;
      }));
    }

    this.initializeActivityPushType();
    this.initializePointers();
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  initializeActivityPushType() {
    const userRoll = userRoleInProject(this.project, this.user.id);

    this.activityPushType = 'edit';

    if (userRoll === 'team member') {
      this.activityPushType = 'push';

    } else if (this.project.teamMembers.length === 1) {
      this.activityPushType = 'push';
    }
  }

  toggleStopStart() {
    if (!this.activityButtonDisabled) {
      this.activityButtonDisabled = true;
      if (this.activityStarted) {
        this.stopActivity();
      } else {
        this.startActivity();
      }
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
    if (!this.taskName) {
      this.taskName = 'untitled activity';
    }
    this.activity = new Activity();
    this.activity.name = this.taskName;
    this.activity.startedAt = Date.now().toString();
    // we need two below fields for offline logic
    this.activity.project = this.project.id;
    this.activity.user = this.user.id;

    // we decided to put all data in db by default and then send it to server
    this.store.dispatch(this.currentActivityActions.loadCurrentActivity(this.activity));

    // update project recent activities
    this.manageProjectRecentActivitiesInState(this.activity.project, this.activity);

    if (this.status.netStatus) {
      delete this.activity.stoppedAt;

      this.activityService.create(this.project.id, this.activity).then((activity) => {
        this.showError('The activity started');
        delete activity.createdAt;
        delete activity.updatedAt;

        // if we get ok response from server so we have id for currentActivity and it has to been set
        this.store.dispatch(this.currentActivityActions.loadCurrentActivity(activity));
        this.activityButtonDisabled = false;
      })
        .catch(error => {
          // todo: check errors
          console.log('server error happened', error);
          this.showError('Server communication error.');
          this.activityButtonDisabled = false;
        });
    } else {
      this.showError('The activity started');
      this.activityButtonDisabled = false;
    }

    // This timeout use to handle focus on input
    setTimeout(() => {
      if (this.activityNameElm) {
        this.activityNameElm.nativeElement.focus();
        this.activityNameElm.nativeElement.select();
      }
    }, 500)
  }

  manageProjectRecentActivitiesInState(projectId, activity) {
    if (this.activityPushType === 'push') {
      this.store.dispatch(this.projectsActions.addActivityToProject(projectId, activity));
    } else if (this.activityPushType === 'edit') {
      this.store.dispatch(this.projectsActions.updateProjectActivities(projectId, activity));
    }
  }

  stopActivity() {
    if (this.currentActivity) {
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
          this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
            this.updateStateInSuccess(dividedActivitiesArray);
          })
            .catch(error => {
              this.updateStateInCatch(error);
            });
        } else {
          this.activityService.createManually(this.project.id, this.currentActivityCopy).then((activity) => {
            this.updateStateInSuccess(dividedActivitiesArray);
          })
            .catch((error) => {
              this.updateStateInCatch(error);
            });
        }
      } else {
        this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
        this.activityButtonDisabled = false;
        this.showError('The activity stopped');
      }
    }
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

  pushDividedActivitiesToServer (dividedActivitiesResult) {
    const responseResult = [];
    dividedActivitiesResult.map((item) => {
      responseResult.push(this.activityService.createManually(this.project.id, item).then((activity) => {
        this.store.dispatch(this.unSyncedActivityActions.removeUnSyncedActivityByFields(item))
      })
        .catch(error => {
          console.log('server error happened', error);
        }));
    });
    Promise.all(responseResult).then(() => {
      this.activityButtonDisabled = false;
    })
  }

  updateStateInCatch (error) {
    console.log('server error happened', error);
    this.showError('Server communication error.');
    this.showError('The activity stopped');
    this.activityButtonDisabled = false;
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

  nameActivity($event) {
    // just for blur out the input
    const target = $event.target;
    target.blur();

    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      this.store.dispatch(this.currentActivityActions.renameCurrentActivity(this.currentActivityCopy.name));
      this.store.dispatch(this.projectsActions.updateProjectActivities(this.currentActivityCopy.project, this.currentActivityCopy));
      if (this.status.netStatus) {
        delete this.currentActivityCopy.stoppedAt;

        if (this.currentActivityCopy.id) {
          this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
          })
            .catch(error => {
              console.log('server error happened', error);
            });
        } else {
          this.activityService.create(this.project.id, this.currentActivityCopy).then((activity) => {
            // we reload currentActivity because it will get id and we will need it
            this.store.dispatch(this.currentActivityActions.loadCurrentActivity(activity));
          })
            .catch(error => {
              console.log('server error happened', error);
            });
        }
      }
    }
  }

  calculateActivityDuration (activity) {
    let hour = 'Due';
    if (activity.stoppedAt) {
      const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
      let x = duration / 1000;
      const seconds = Math.floor(x % 60);
      // minutes
      x /= 60;
      const minutes = Math.floor(x % 60);
      // hours
      x /= 60;
      const hours = Math.floor(x);

      if (hours !== 0) {
        hour = hours + 'h ' + minutes + 'm';
      }

      if (minutes !== 0 && hours === 0) {
        hour = minutes + ' min' ;
      }

      if (minutes === 0 && hours === 0) {
        hour = seconds + ' sec';
      }
    } else if (!activity.startedAt) {
      hour = '- -'
    }
    return hour;
  };

  findUserInProject(userId) {
    const user = userInProject(this.project, userId);
    return user;
  }

  findUserName(userId) {
    const user = this.findUserInProject(userId);
    const userName = user.name ? user.name : user.email;
    return userName;
  }

  findUserImage(userId) {
    const user = this.findUserInProject(userId);
    const imgUrl = user.profileImage ? this.config.imagesEndpoint + '/profile/' + user.profileImage : '';
    return imgUrl;
  }

  getUserEmailHash(userId): any {
    const user = this.findUserInProject(userId);
    return Md5.hashStr(user.email);
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.initializePointers();
  }

  initializePointers() {
    this.showMoreStart = 2;
    this.showMoreEnd = 2 + 5;
    if (this.project.activities.length > 7) {
      this.showMoreEnd = 2 + 5;
    } else {
      this.showMoreEnd = this.project.activities.length;
    }
  }

  increasePointer() {
    this.showMoreStart = this.showMoreStart + 5;
    this.showMoreEnd = this.showMoreEnd + 5;
  }

  decreasePointer() {
    this.showMoreStart = this.showMoreStart - 5;
    this.showMoreEnd = this.showMoreEnd - 5;
  }

  showSettings() {
    if (this.status.netStatus) {
      this.modalService.show({
        component: ProjectSettingsModalComponent,
        inputs: {
          project: this.project,
          user: this.user
        }
      });
    } else {
      this.showError('This feature is not available in offline mode');
    }
  }

  goToActivities(): void {
    if (this.status.netStatus) {
      this.router.navigate(['/activities', this.project.id]);
    } else {
      this.showError('This feature is not available in offline mode');
    }
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
