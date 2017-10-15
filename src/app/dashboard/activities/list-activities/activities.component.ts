import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import {
  Component, HostListener, Inject, OnInit,
  ViewContainerRef
} from '@angular/core';
import { APP_CONFIG }                       from '../../../app.config';
import { ActivityService }                  from '../../../shared/activity/activity.service';
import { Activity }                         from '../../../shared/state/current-activity/current-activity.model';
import { ActivatedRoute, ParamMap }         from '@angular/router';
import { Location }                         from '@angular/common';
import { ModalService }                     from '../../../core/modal/modal.service';
import { AddManuallyActivityComponent }     from '../activity-add-edit-manually/activity-add-edit-manually.component';
import { ErrorService }                     from '../../../core/error/error.service';

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass']
})
export class ActivitiesComponent implements OnInit {
  private projectId: string;
  private pageNumber = 0;
  private scrollEnable = true;
  private tempArray: Array<Activity>;
  private projectActivities: {
    date: any
    activities: any
  }[];

  constructor (@Inject(APP_CONFIG) private config,
               private route: ActivatedRoute,
               private activityService: ActivityService,
               private location: Location,
               private modalService: ModalService,
               private errorService: ErrorService,
               private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit() {
    this.tempArray = [];
    this.route.paramMap
      .switchMap((params: ParamMap) => {
      this.projectId = params.get('projectId');
      return this.activityService.getActivities(params.get('projectId'));
    })
      .subscribe((activities) => {
        this.tempArray = activities;
        this.groupByActivities();
    });
  }

  deleteActivity(activity , index1, index2) {
    this.activityService.delete(activity.project, activity.id).then(() => {
      this.projectActivities[index1].activities.splice(index2, 1);
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
    this.groupByActivities();
  }

  groupByActivities() {
    this.projectActivities = _.chain(this.tempArray)
      .groupBy((activity: Activity) => {
        return new Date(Number(activity.stoppedAt)).toDateString();
      })
      .map((value, key) => {
        return {date: key, activities: value};
      })
      .value();
  }

  openAddManuallyModal() {
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        projectId: this.projectId,
      },
      outputs: {
        responseActivity: (param) => {
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
    const listLength = this.tempArray.length * 90;
    console.log(listLength);
    console.log('page number:', this.pageNumber);
    console.log($event.pageY);
    if ($event.pageY > listLength && this.scrollEnable) {
      this.scrollEnable = false;
      console.log($event.pageY);
      this.pageNumber++;
      this.route.paramMap
        .switchMap((params: ParamMap) => {
          this.projectId = params.get('projectId');
          return this.activityService.getActivities(params.get('projectId'), this.pageNumber);
        })
        .subscribe((activities) => {
        if (activities.length > 0) {
          this.scrollEnable = true;
        }
          activities.map((activity) => {
            this.tempArray.push(activity);
          })
          this.groupByActivities();
        });
    }
  }
}


