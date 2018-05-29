import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import {
  Component, HostListener,
  Inject, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { Observable }                       from 'rxjs/Observable';
import { APP_CONFIG }                       from '../../../app.config';
import { ActivityService }                  from '../../shared/activity.service';
import { Activity }                         from '../../../shared/state/current-activity/current-activity.model';
import { ActivatedRoute, Params }           from '@angular/router';
import { Location }                         from '@angular/common';
import { ModalService }                     from '../../../core/modal/modal.service';
import { AddManuallyActivityComponent }     from '../activity-add-edit-manually/activity-add-edit-manually.component';
import { ErrorService }                     from '../../../core/error/error.service';
import { Store }                            from '@ngrx/store';
import { AppState }                         from '../../../shared/state/appState';
import { Project }                          from '../../../shared/state/project/project.model';
import { User }                             from '../../../shared/state/user/user.model';
import { cloneDeep }                        from 'lodash';
import { PageLoaderService }                from '../../../core/services/page-loader.service';
import { Subscription }                     from 'rxjs/Subscription';
import { ProjectsActions }                  from '../../../shared/state/project/projects.actions';
import { ChartComponent }                   from './chart-statistics/chart.component';

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass'],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  projectId: string;
  project: Project;
  private pageNumber = 0;
  private scrollEnable = true;
  private user: User;
  private activitiesLoaded = false;
  private chartLoaded = false;
  // we need this boolean to handle projects subscribe to run just one time
  private FirstProjectsSubscribe = true;
  private subscriptions: Array<Subscription> = [];
  // we need currentActivity itself in add/edit component to check added/edited activity has
  // no conflict with currentActivity
  private currentActivity: Observable<Activity>;
  // we need copy of currentActivity to show it in list of activities if it is belong to current project
  currentActivityCopy: Activity;
  userAccess = false;
  selectedUsers = [];
  selectedItemIndex = [];
  tempArray: Array<Activity> = [];
  projectActivities: {
    date: any
    activities: any
    duration: any
  }[] = [];
  deleteButtonDisabled = false;
  pageLoaded = false;
  @ViewChild(ChartComponent)
  private ChartComponent: ChartComponent;

  constructor (@Inject(APP_CONFIG) private config,
               private store: Store<AppState>,
               private route: ActivatedRoute,
               private activityService: ActivityService,
               private projectsActions: ProjectsActions,
               private location: Location,
               private modalService: ModalService,
               private errorService: ErrorService,
               private pageLoaderService: PageLoaderService) {
    this.currentActivity = store.select('currentActivity');
    this.subscriptions.push(store.select('user').subscribe((user: any) => {
      this.user = cloneDeep(user);
    }));
  }

  ngOnInit() {
    this.pageLoaderService.showLoading();
    this.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.projectId = params['projectId'];
    }));
    this.subscriptions.push(this.store.select('projects').subscribe((projects: any) => {
      if (projects) {
        this.project = projects.entities[this.projectId];
        if (this.user.id && this.project) {
          this.userAccess = this.userRoleInProject(this.project, this.user.id);
          if (this.userAccess) {
            this.selectedUsers = [];
            this.project.teamMembers.map((member, index) => {
              this.selectedUsers.push(member.id);
              this.selectedItemIndex.push(index);
            })
          } else {
            if (this.user.id && this.selectedUsers.length === 0) {
              this.selectedUsers = [];
              this.selectedUsers.push(this.user.id);
            }
          }
          // making sure that this subscribe and getting data just run 1 time
          // and just in beginning of page loading by FirstProjectsSubscribe
          if ( this.selectedUsers.length > 0 && this.FirstProjectsSubscribe) {
            this.FirstProjectsSubscribe = false;
            this.tempArray = [];
            this.getActivitiesFromServer();
          }
        }
      }
    }));
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        if (currentActivity.project === this.projectId) {
          this.currentActivityCopy = currentActivity;
        }
        if (!currentActivity.startedAt && this.currentActivityCopy) {
          if (this.currentActivityCopy.startedAt) {
            const newActivity = this.currentActivityCopy;
            newActivity.stoppedAt = Date.now().toString();
            this.updateActivities(newActivity);
          }
          this.currentActivityCopy = null;
        }
      }));
    };
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
  }

  userRoleInProject(project, userId)  {
    let role = false;
    if (project.owner.id === userId) {
      role = true;
    } else {
      project.admins.map(user => {
        if (user.id === userId) {
          role = true;
        }
      });
    }
    return role;
  };

  deleteActivity(activity , index1, index2) {
    this.deleteButtonDisabled = true;
    this.activityService.delete(activity.project, activity.id).then(() => {
      this.projectActivities[index1].activities.splice(index2, 1);
      this.calculateTotalDurationPerDay();
      const Removed = this.tempArray .filter(function(el) {
        return el.id !== activity.id ;
      });
      // Now re-render chart component
      this.ChartComponent.getStatAndPrepareData();
      this.tempArray = Removed;
      this.deleteButtonDisabled = false;
      this.showError('Activity was deleted successfully');
      this.updateProjectRecentActivitiesInState();
    })
      .catch(error => {
        this.deleteButtonDisabled = false;
        this.showError('Server communication error');
        console.log('error is: ', error);
      });
  }

  goBack() {
    this.location.back();
  }

  updateActivities(params) {
    this.tempArray = this.tempArray.concat(params);
    this.sortArrayByDate();
    this.groupByActivities();
    this.updateProjectRecentActivitiesInState();
    // Now re-render chart component
    if (this.ChartComponent) {
      this.ChartComponent.getStatAndPrepareData();
    }
  }

  groupByActivities() {
    this.projectActivities = [];
    this.projectActivities = _.chain(this.tempArray)
      .groupBy((activity: Activity) => {
        return new Date(Number(activity.stoppedAt)).toDateString();
      })
      .map((value, key) => {
        return {date: key, activities: value, duration: 0};
      })
      .value();
    this.calculateTotalDurationPerDay();
  }

  calculateTotalDurationPerDay() {
    this.projectActivities.map((group) => {
      let totalDurationPerDay = 0 ;
      group.activities.map((activity) => {
        const activityDuration = activity.stoppedAt - activity.startedAt ;
        totalDurationPerDay += activityDuration;
      });
      group.duration = this.calculateTimeDuration(totalDurationPerDay);
    });
  }

  sortArrayByDate(): void {
    this.tempArray.sort((a: Activity, b: Activity) => {
      return +b.stoppedAt - +a.stoppedAt;
    });
  }

  openAddManuallyModal() {
    let tempCurrentActivity: any;
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        tempCurrentActivity = currentActivity;
      }));
    }
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      inputs: {
        projectId: this.projectId,
        currentActivity: tempCurrentActivity ? tempCurrentActivity : null,
      },
      outputs: {
        responseActivity: (params) => {
          this.updateActivities(params);
        }
      },
      customStyles: {'width': '400px'}
    });
  }

  openEditManuallyModal(activity) {
    let tempCurrentActivity: any;
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        tempCurrentActivity = currentActivity;
      }));
    }
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      inputs: {
        activity: activity,
        projectId: this.projectId,
        currentActivity: tempCurrentActivity ? tempCurrentActivity : null,
      },
      outputs: {
        responseActivity: (params) => {
          // Maybe by editing an activity date's change so we should delete previous activity and push
          // new activity to tempArray and sort it again
          const Removed = this.tempArray .filter(function(el) {
            return el.id !== activity.id ;
          });
          this.tempArray = Removed;
          this.updateActivities(params);
        }
      },
      customStyles: {'width': '400px', 'overflow': 'initial'}
    });
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
      if ((window.scrollY + window.screen.height) / document.body.offsetHeight >= 0.90 && this.scrollEnable) {
      this.scrollEnable = false;
      this.pageNumber++;
      console.log('page number:', this.pageNumber);
      this.getActivitiesFromServer();
    }
  }

  getActivitiesFromServer() {
    if (this.selectedUsers.length > 0) {
      this.activityService.getActivities(this.projectId, this.selectedUsers, this.pageNumber).then((activities) => {
        console.log('activities', activities);
        if (activities.length > 0) {
          this.scrollEnable = true;
        }
        activities.map((activity) => {
          if (activity.stoppedAt) {
            this.tempArray.push(activity);
          }
        });
        this.groupByActivities();
        this.activitiesLoaded = true;
        this.UpdatePageLoader();
        if (this.tempArray.length < 0) {
          this.ChartComponent.parentHasActivity = false;
        }
      });
    } else {
      this.tempArray = [];
      this.groupByActivities();
      this.ChartComponent.parentHasActivity = false;
    }
  }

  updateProjectRecentActivitiesInState() {
    // we will update project recent activities in state here
    // but because of reference calls in js we need to take deep copy from activities
    const tempArrayCopy = this.tempArray;
    this.store.dispatch(this.projectsActions.removeProjectActivities(this.projectId));
    if (tempArrayCopy[1]) {
      this.store.dispatch(this.projectsActions.editProjectActivities(this.projectId, tempArrayCopy[1]));
    }
    if (tempArrayCopy[0]) {
      this.store.dispatch(this.projectsActions.editProjectActivities(this.projectId, tempArrayCopy[0]));
    }
  }

  UpdatePageLoader (chartLoaded?) {
    if (chartLoaded) {
      this.chartLoaded = chartLoaded;
    } else if (this.projectActivities.length === 0) {
      this.chartLoaded = true;
    }
    this.pageLoaded = this.chartLoaded && this.activitiesLoaded;

    if (this.pageLoaded) {
      this.pageLoaderService.hideLoading();
    }
  }

  calculateTimeDuration (duration) {
    let result: string;
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    if (hours !== 0) {
      if (minutes < 10) {
        result = hours + ':0' + minutes ;
      } else {
        result = hours + ':' + minutes ;
      }
    }

    if (minutes !== 0 && hours === 0) {
      result = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  }

  getSelectedUsers (event) {
    this.selectedUsers = [];
    event.map((user) => {
      this.selectedUsers.push(user.item.id);
    });
    this.tempArray = [];
    this.pageNumber = 0;
    this.getActivitiesFromServer();
    // Now re-render chart component
    this.ChartComponent.selectedUsers = this.selectedUsers;
    this.ChartComponent.getStatAndPrepareData();
  }
}


