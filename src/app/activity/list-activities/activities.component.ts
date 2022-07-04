import * as _ from 'lodash';
import * as json2csv  from 'json2csv';
import {
  Component, HostListener,
  OnDestroy, OnInit, ViewChild,
}                                           from '@angular/core';
import { Observable ,  Subscription }                       from 'rxjs';
import { ActivatedRoute, Params }           from '@angular/router';
import { Location }                         from '@angular/common';
import { AddManuallyActivityComponent }     from '../activity-add-edit-manually/activity-add-edit-manually.component';
import { Store }                            from '@ngrx/store';
import { cloneDeep, uniqBy }                from 'lodash';
import { ChartComponent }                   from './chart-statistics/chart.component';
import { userInProject }                    from 'app/utils/project.util';
import { Status }                           from 'app/shared/state/status/status.model';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { Project } from 'app/shared/state/project/project.model';
import { User } from 'app/shared/state/user/user.model';
import { AppState } from 'app/shared/state/appState';
import { ActivityService } from 'app/core/services/activity.service';
import { ModalService } from 'app/core/modal/modal.service';
import { ErrorService } from 'app/core/error/error.service';
import { PageLoaderService } from 'app/core/services/page-loader.service';
import * as moment from 'moment';

type ActivityWithIsActive = Activity & {isActive?: boolean};

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass'],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  projectId: string;
  project: Project;
  user: User;
  status: Status;
  private pageNumber = 0;
  private scrollEnable = true;
  private activitiesLoaded = false;
  private chartLoaded = false;
  // we need this boolean to handle projects subscribe to run just one time
  private FirstProjectsSubscribe = true;
  private subscriptions: Array<Subscription> = [];
  // we need currentActivity itself in add/edit component to check added/edited activity has
  // no conflict with currentActivity
  private currentActivity: Observable<Activity>;
  // we need copy of currentActivity to show it in list of activities if it is belong to current project
  currentActivityCopy: ActivityWithIsActive;
  currentActivities: Array<ActivityWithIsActive> = [];
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
  isExporting = false;
  isImporting = false;
  dataFile: any;
  toDate: number;
  fromDate: number;
  dateString: string;
  calendarUpdateEvent: any;
  calenderShow: boolean = false;
  @ViewChild(ChartComponent)
  private ChartComponent: ChartComponent;

  constructor (private store: Store<AppState>,
               private route: ActivatedRoute,
               private activityService: ActivityService,
               private location: Location,
               private modalService: ModalService,
               private errorService: ErrorService,
               private pageLoaderService: PageLoaderService) {
    this.currentActivity = store.select('currentActivity');
    this.subscriptions.push(store.select('user').subscribe((user: any) => {
      this.user = cloneDeep(user);
    }));
    this.subscriptions.push(this.store.select('status').subscribe((status) => this.status = status));
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
            this.getCurrentActivitiesFromServer();
          }
        }
      }
    }));
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        if (currentActivity.project === this.projectId) {
          this.currentActivityCopy = _.cloneDeep(currentActivity);
          this.currentActivityCopy.isActive = true;
          for (let i = 0; i < this.currentActivities.length; i++) {
            if (this.currentActivities[i].user === this.currentActivityCopy.user) {
              this.currentActivities.splice(i, 1);
            }
          }
          this.currentActivities.push(this.currentActivityCopy);
        }

        if (!currentActivity.startedAt && this.currentActivityCopy) {
          if (this.currentActivityCopy.startedAt) {
            this.tempArray = [];
            this.pageNumber = 0;
            this.getActivitiesFromServer();
            // this.getCurrentActivitiesFromServer();
            for (let i = 0; i < this.currentActivities.length; i++) {
              if (this.currentActivities[i].user === this.currentActivityCopy.user) {
                this.currentActivities.splice(i, 1);
                // Now re-render chart component
                this.ChartComponent.getStatAndPrepareData();
              }
            }
          }
          this.currentActivityCopy = null;
        }
      }));
    };

    this.calendarInit();
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
      const removed = this.tempArray.filter(function(el) {
        return el.id !== activity.id ;
      });
      // Now re-render chart component
      this.ChartComponent.getStatAndPrepareData();
      this.tempArray = removed;
      this.deleteButtonDisabled = false;
      this.showError('The activity was deleted successfully');
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
    this.groupByActivities();
    // Now re-render chart component
    if (this.ChartComponent) {
      this.ChartComponent.getStatAndPrepareData();
    }
  }

  groupByActivities() {
    // we sort tempArray list here because list sort maybe destroyed by add or edit functionality
    this.sortArrayByDate();
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
          const removed = this.tempArray.filter(function(el) {
            return el.id !== activity.id ;
          });
          this.tempArray = removed;
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

  getCurrentActivitiesFromServer() {
    this.activityService.getCurrentActivities(this.projectId).then((currentActivities) => {
      this.currentActivities = currentActivities.map((userCurrentActivity: any) => {
        userCurrentActivity.isActive = true;
        return userCurrentActivity;
      });
    });
  }

  getActivitiesFromServer() {
    if (this.selectedUsers.length > 0) {
      this.activityService.getActivities(this.projectId, this.selectedUsers, this.pageNumber).then((activities) => {
        if (activities.length > 0) {
          this.scrollEnable = true;
        }
        activities.map((activity) => {
          if (activity.stoppedAt) {
            this.tempArray.push(activity);
            this.tempArray = uniqBy(this.tempArray, 'id');
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

  UpdatePageLoader(chartLoaded?) {
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

    this.currentActivities.map((userCurrentActivity) => {
      if (this.selectedUsers.indexOf(userCurrentActivity.user) > -1) {
        userCurrentActivity.isActive = true;
      } else {
        this.currentActivities.splice(this.currentActivities.indexOf(userCurrentActivity), 1);
      }
    });
    this.tempArray = [];
    this.pageNumber = 0;
    this.getActivitiesFromServer();
    // Now re-render chart component
    this.ChartComponent.selectedUsers = this.selectedUsers;
    this.ChartComponent.getStatAndPrepareData();
  }

  exportActivitiesAsJson() {
    if (this.selectedUsers.length > 0) {
      this.isExporting = true;
      this.activityService.getActivitiesForExport(this.projectId, this.selectedUsers).then((activities) => {
        const sJson = JSON.stringify(activities);
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson));
        element.setAttribute('download', `${this.project.name}-export.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        this.isExporting = false;
      });
    }
  }

  exportActivitiesAsCSV() {
    if (this.selectedUsers.length > 0) {
      this.isExporting = true;
      this.activityService.getActivitiesForExport(this.projectId, this.selectedUsers).then((activities) => {
        const exportActivities = [];
        activities.forEach((activity) => {
          const userDetail = userInProject(this.project, activity.user);
          exportActivities.push({
            name: activity.name,
            member: userDetail ? (userDetail.name ? userDetail.name : userDetail.email) : 'Someone who has left this project',
            startedAt: (new Date(Number(activity.startedAt))).toLocaleString(),
            stoppedAt: (new Date(Number(activity.stoppedAt))).toLocaleString(),
          });
        });
        const result = json2csv.parse(exportActivities);
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(result));
        element.setAttribute('download', `${this.project.name}-export.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        this.isExporting = false;
      });
    }
  }

  importActivities() {
    const input = document.getElementById('uploadInput');
    input.click();

  }

  fileUpload($event) {
    this.isImporting = true;

    const file: File = $event.target.files[0];

    if (file.type !== 'application/json') {
      this.showError('Wrong file for import.');
      this.isImporting = false;
    }

    if (file.size >= 10000000) {
      this.showError('The File size exceeds the 10MB limit.');
      this.isImporting = false;
    }

    if (this.isImporting) {
      const formData = new FormData();
      formData.append('data', file);
      this.activityService.importActivities(this.projectId, formData).then((activities) => {
        this.showError(`Successfully imported ${activities.length} activities`);
        this.getActivitiesFromServer();
        this.isImporting = false;
      })
      .catch(error => {
        this.showError('Something went wrong when importing your activities');
        console.log('error is: ', error);
        this.isImporting = false;
      });
    }
  }

  calendarInit() {
    // configure date range for first api call
    this.fromDate = moment().subtract(7, 'days').startOf('day').valueOf();
    this.toDate = moment().add(1, 'days').startOf('day').valueOf();
    this.dateString = moment().subtract(7, 'days').format('MMM Do');
    const firstIdsMonth =  moment().subtract(7, 'days').month();
    const secondIdsMonth =  moment().month();
    let temp = '';
    if (firstIdsMonth === secondIdsMonth) {
      temp = moment().format('Do');
    } else {
      temp = moment().format('MMM Do');
    }
    this.dateString = this.dateString + ' - ' + temp;
  }

  showCalender() {
    this.calenderShow = true;
  }

  closeCalender() {
    this.calenderShow = false;
  }

  updateDates(event) {
    this.calendarUpdateEvent = event;

    this.dateString = event.start.format('MMM Do');
    const firstIdsMonth =  event.start.month();
    const secondIdsMonth =  event.end.month();
    let temp = '';
    if (firstIdsMonth === secondIdsMonth) {
      temp = event.end.format('Do');
    } else {
      temp = event.end.format('MMM Do');
    }
    this.dateString = this.dateString + ' - ' + temp;

    this.fromDate = event.start.startOf('day').valueOf();
    this.toDate = (event.end.add(1, 'days')).startOf('day').valueOf();
    this.calenderShow = false;
  }
}


