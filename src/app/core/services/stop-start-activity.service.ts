import { Injectable } from '@angular/core';
import { Activity } from '../../shared/state/current-activity/current-activity.model';
import { UnSyncedActivityActions } from '../../shared/state/unsynced-activities/unsynced-activities.actions';
import { CurrentActivityActions } from '../../shared/state/current-activity/current-activity.actions';
import { ActivityService } from './activity.service';
import { Store } from '@ngrx/store';
import { ProjectsActions } from '../../shared/state/project/projects.actions';
import { AppState } from '../../shared/state/appState';
import { Status } from '../../shared/state/status/status.model';
import { Project } from '../../shared/state/project/project.model';
import { User } from '../../shared/state/user/user.model';
import { cloneDeep }                      from 'lodash';
import { userRoleInProject } from '../../dashboard/shared/utils';
import * as moment from 'moment';
import { NativeNotificationService } from './native-notification.service';

@Injectable()
export class StopStartActivityService {
  private currentActivityCopy: Activity;
  private status: Status;
  private user: User;
  showNotifInterval: any;

  constructor( private activityService: ActivityService,
              private store: Store<AppState>,
              private currentActivityActions: CurrentActivityActions,
              private unSyncedActivityActions: UnSyncedActivityActions,
              private nativeNotificationService: NativeNotificationService,
              private projectsActions: ProjectsActions) {
    store.select('currentActivity').subscribe((currentActivity: Activity) => {
      this.currentActivityCopy = cloneDeep(currentActivity);
    });
    store.select('status').subscribe((status: Status) => {
      this.status = cloneDeep(status);
    });
    store.select('user').subscribe((user: User) => {
      this.user = cloneDeep(user);
    });
  }

  startActivity(activity: Activity, project: Project): Promise<any> {
    // first of all we set user id of activity from state because electron app doesn't have this id so this service do it by itself
    activity.user = this.user.id;
    return new Promise((resolve, reject) => {
      if (this.currentActivityCopy.startedAt) {
        this.stopActivity(project).then(() => {
          this.startActivityAtServer(activity, project).then(() => {
            console.log('activity started');
            resolve();
          });
        });
      } else {
        this.startActivityAtServer(activity, project).then(() => {
          console.log('activity started');
          resolve();
        });
      }
    })
  }

  startActivityAtServer(activity: Activity, project: Project): Promise<any> {
    return new Promise((resolve, reject) => {
      // we decided to put all data in db by default and then send it to server
      this.store.dispatch(this.currentActivityActions.loadCurrentActivity(activity));
      this.store.dispatch(this.projectsActions.updateSelectedProject(activity.project));
      // update project recent activities
      this.manageProjectRecentActivitiesInState(activity, project);

      if (this.status.netStatus) {
        delete activity.stoppedAt;

        this.activityService.create(activity.project, activity).then((resActivity) => {
          delete resActivity.createdAt;
          delete resActivity.updatedAt;

          // if we get ok response from server so we have id for currentActivity and it has to been set
          this.store.dispatch(this.currentActivityActions.loadCurrentActivity(resActivity));
          this.checkRestTimeSet(activity);
          resolve();
        })
          .catch(error => {
            // todo: check errors
            if (error.status === 404) {
              console.log('The project has been deleted before.');
              this.store.dispatch(this.projectsActions.removeProject(activity.project));

              // if we have current activity on deleted project we should clear it
              if (activity.project === this.currentActivityCopy.project) {
                this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
              }
            } else if (error.status === 400) {
              // todo: this section will handle with socket message
              console.log('You have current activity on server please refresh your browser.');
              // we have to clear current activity
              this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
            } else {
              console.log('Server communication error.');
            }
            resolve();
            console.log('server error happened', error);
          });
      } else {
        this.checkRestTimeSet(activity);
        resolve();
      }
  })
  }

  checkRestTimeSet(activity: Activity) {
    const settings = this.user.settings;
    if (settings.relaxationTime.isEnabled) {
      const workTime = Math.floor(settings.relaxationTime.workingTime / 1000);
      const restTime = Math.floor(settings.relaxationTime.restTime / 1000);

      let nextWorkTime = workTime;
      let duration;

      this.showNotifInterval = setInterval(() => {
        duration = Math.floor((Date.now() - Number(activity.startedAt)) / 1000);
        if (duration === nextWorkTime) {
          this.nativeNotificationService.showNotification(`Take a rest and be relaxed for ${restTime / 60} minutes!`);
        }
        if (duration === (nextWorkTime + restTime)) {
          this.nativeNotificationService.showNotification(`Ok! It's time to work for next ${workTime / 60} minutes!`);
          nextWorkTime += (workTime + restTime);
        }
      }, 1000)
    }

  }

  manageProjectRecentActivitiesInState(activity: Activity, project: Project) {
    const userRoll = userRoleInProject(project, activity.user);

    // HACK: fixed bug for changing the sent state.
    activity = cloneDeep(activity);

    // activityPushType field used to manage the procedure we should update project recent activities in state
    // if it be "push" means that user is team member or project has just 1 team member and we just need to push activity to recent activities
    // if it be "edit" means that user is admin/owner and project members are more that 1 so we should update recent activities
    let activityPushType = 'edit';
    if (userRoll === 'team member') {
      activityPushType = 'push';

    } else if (project.teamMembers.length === 1) {
      activityPushType = 'push';
    }
    if (activityPushType === 'push') {
      this.store.dispatch(this.projectsActions.addActivityToProject(activity.project, activity));
    } else if (activityPushType === 'edit') {
      this.store.dispatch(this.projectsActions.updateProjectActivities(activity.project, activity));
    }
  }

  stopActivity(project: Project): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.currentActivityCopy.startedAt) {
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
        this.pushDividedActivitiesToDb(dividedActivitiesArray, project);

        if (this.status.netStatus) {
          // now we will try to store all data at server
          if (this.currentActivityCopy.id) {
            this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
              this.updateStateInSuccess(dividedActivitiesArray);
              clearInterval(this.showNotifInterval);
              resolve();
            })
              .catch(error => {
                this.updateStateInCatch(error);
                clearInterval(this.showNotifInterval);
                resolve();
              });
          } else {
            this.activityService.createManually(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
              this.updateStateInSuccess(dividedActivitiesArray);
              clearInterval(this.showNotifInterval);
              resolve();
            })
              .catch((error) => {
                this.updateStateInCatch(error);
                clearInterval(this.showNotifInterval);
                resolve();
              });
          }
        } else {
          this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
          clearInterval(this.showNotifInterval);
          resolve();
        }
      } else {
        clearInterval(this.showNotifInterval);
        resolve();
      }
    });
  }

  pushDividedActivitiesToDb (dividedActivitiesResult, project) {
    // store an original activity
    this.store.dispatch(this.unSyncedActivityActions.addUnSyncedActivity(this.currentActivityCopy));
    this.manageProjectRecentActivitiesInState(this.currentActivityCopy, project);
    // store all divided activities
    dividedActivitiesResult.map((item) => {
      this.store.dispatch(this.unSyncedActivityActions.addUnSyncedActivity(item));
      this.manageProjectRecentActivitiesInState(item, project);
    });
  }

  pushDividedActivitiesToServer (dividedActivitiesResult) {
    const responseResult = [];
    dividedActivitiesResult.map((item) => {
      responseResult.push(this.activityService.createManually(item.project, item).then((activity) => {
        this.store.dispatch(this.unSyncedActivityActions.removeUnSyncedActivityByFields(item))
      })
        .catch(error => {
          console.log('server error happened', error);
        }));
    });
    Promise.all(responseResult).then(() => {
      // todo: handle procedure be sure all of this loop is resolved
    })
  }

  updateStateInCatch (error) {
    console.log('server error happened', error);
    this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
  }

  updateStateInSuccess (dividedActivitiesArray) {
    this.store.dispatch(this.unSyncedActivityActions.removeUnSyncedActivityByFields(this.currentActivityCopy));
    // we send divided activities to server after original activity because
    // The stop time of activity cannot be older than start time in current activity!
    this.pushDividedActivitiesToServer(dividedActivitiesArray);
    this.store.dispatch(this.currentActivityActions.clearCurrentActivity());
  }

  nameActivity(activityName, project) {
    if (this.currentActivityCopy.startedAt) {
      this.currentActivityCopy.name = activityName.trim() ? activityName : 'Untitled Activity';
      this.store.dispatch(this.currentActivityActions.renameCurrentActivity(this.currentActivityCopy.name));
      this.manageProjectRecentActivitiesInState(this.currentActivityCopy, project);
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
  }
}
