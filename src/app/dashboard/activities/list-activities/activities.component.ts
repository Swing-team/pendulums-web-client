import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import {
  Component, HostListener, Inject,
  OnInit, ViewContainerRef
}                                           from '@angular/core';
import { Observable }                       from 'rxjs/Observable';
import { APP_CONFIG }                       from '../../../app.config';
import { ActivityService }                  from '../../shared/activity.service';
import { Activity }                         from '../../../shared/state/current-activity/current-activity.model';
import { ActivatedRoute, ParamMap }         from '@angular/router';
import { Location }                         from '@angular/common';
import { ModalService }                     from '../../../core/modal/modal.service';
import { AddManuallyActivityComponent }     from '../activity-add-edit-manually/activity-add-edit-manually.component';
import { ErrorService }                     from '../../../core/error/error.service';
import { Store }                            from '@ngrx/store';
import { AppState }                         from '../../../shared/state/appState';
import { Project }                          from '../../../shared/state/project/project.model';
import { ProjectService }                   from 'app/dashboard/shared/projects.service';
import { User }                             from '../../../shared/state/user/user.model';

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass']
})
export class ActivitiesComponent implements OnInit {
  private projectId: string;
  private project: Project;
  private pageNumber = 0;
  private scrollEnable = true;
  private tempArray: Array<Activity>;
  private currentActivity: Observable<Activity>;
  private user: Observable<User>;
  currentActivityCopy: Activity;
  projectActivities: {
    date: any
    activities: any
    duration: any
  }[];

  constructor (@Inject(APP_CONFIG) private config,
               private store: Store<AppState>,
               private route: ActivatedRoute,
               private activityService: ActivityService,
               private projectServices: ProjectService,
               private location: Location,
               private modalService: ModalService,
               private errorService: ErrorService,
               private viewContainerRef: ViewContainerRef) {
    this.currentActivity = store.select('currentActivity');
    this.user = store.select('user');
  }

  ngOnInit() {
    this.tempArray = [];
    this.route.paramMap
      .switchMap((params: ParamMap) => {
      this.projectId = params.get('projectId');
      return this.activityService.getActivities(params.get('projectId'));
    })
      .subscribe((activities) => {
      activities.map((activity) => {
        if (activity.stoppedAt) {
          this.tempArray.push(activity);
        }
      });
        this.groupByActivities();
    });
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
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
      });
    }

    this.store.select('projects').subscribe((projects: any) => {
      if (projects) {
        this.project = projects.entities[this.projectId];
      }
      if (!this.project) {
        this.projectServices.getProject(this.projectId).then((project) => {
          this.project = project;
        })
          .catch(error => {
            console.log('error is: ', error);
          });
      }
    });
  }

  deleteActivity(activity , index1, index2) {
    this.activityService.delete(activity.project, activity.id).then(() => {
      this.projectActivities[index1].activities.splice(index2, 1);
      this.calculateTotalDurationPerDay();
      const Removed = this.tempArray .filter(function(el) {
        return el.id !== activity.id ;
      });
      this.tempArray = Removed;
      this.showError('activity deleted successfully');
      console.log('activity deleted successfully');
    })
      .catch(error => {
        this.showError(error);
        console.log('error is: ', error);
      });
  }

  goBack() {
    this.location.back();
  }

  updateActivities(param) {
    this.tempArray.push(param);
    this.sortArrayByDate();
    this.groupByActivities();
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
      this.currentActivity.subscribe(currentActivity => {
        tempCurrentActivity = currentActivity;
      });
    }
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        projectId: this.projectId,
        currentActivity: tempCurrentActivity ? tempCurrentActivity : null,
      },
      outputs: {
        responseActivity: (param) => {
          this.updateActivities(param);
        }
      },
      customStyles: {'width': '400px'}
    });
  }

  openEditManuallyModal(activity) {
    let tempCurrentActivity: any;
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        tempCurrentActivity = currentActivity;
      });
    }
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        activity: activity,
        projectId: this.projectId,
        currentActivity: tempCurrentActivity ? tempCurrentActivity : null,
      },
      outputs: {
        responseActivity: (param) => {
          // Maybe by editing an activity date's change so we should delete previous activity and push
          // new activity to tempArray and sort it again
          const Removed = this.tempArray .filter(function(el) {
            return el.id !== activity.id ;
          });
          this.tempArray = Removed;
          this.updateActivities(param);
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
    const listLength = this.tempArray.length * 40;
    if ($event.pageY > listLength && this.scrollEnable) {
      this.scrollEnable = false;
      this.pageNumber++;
      console.log('page number:', this.pageNumber);
      this.route.paramMap
        .switchMap((params: ParamMap) => {
          this.projectId = params.get('projectId');
          return this.activityService.getActivities(params.get('projectId'), this.pageNumber);
        })
        .subscribe((activities) => {
        console.log('activities', activities)
        if (activities.length > 0) {
          this.scrollEnable = true;
        }
          activities.map((activity) => {
            if (activity.stoppedAt) {
              this.tempArray.push(activity);
            }
          });
          this.groupByActivities();
        });
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
  };
}


