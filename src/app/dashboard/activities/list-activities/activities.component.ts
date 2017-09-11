import 'rxjs/add/operator/switchMap';
import * as _ from 'lodash';
import {
  Component, HostListener, Inject, OnInit,
  ViewContainerRef
} from '@angular/core';
import { APP_CONFIG }                       from '../../../app.config';
import { ActivityService }                  from '../../../shared/activity/activity.service';
import { Activity }                         from '../../../shared/state/activity/activity.model';
import { ActivatedRoute, ParamMap }         from '@angular/router';
import { Location }                         from '@angular/common';
import { ModalService }                     from '../../../core/modal/modal.service';
import { AddManuallyActivityComponent }     from '../add-manually-activity/add-manually-activity.component';

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass']
})
export class ActivitiesComponent implements OnInit {
  private projectId: string;
  private pageNumber = 0;
  private scrolEnable = true;
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
               private viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
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
      console.log('activity deleted successfully');
    })
      .catch(error => {
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

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    const listLength = this.tempArray.length * 100;
    console.log(listLength);
    console.log('page number:', this.pageNumber);
    if ($event.pageY > listLength && this.scrolEnable) {
      this.scrolEnable = false;
      console.log($event.pageY);
      this.pageNumber++;
      this.route.paramMap
        .switchMap((params: ParamMap) => {
          this.projectId = params.get('projectId');
          return this.activityService.getActivities(params.get('projectId'), this.pageNumber);
        })
        .subscribe((activities) => {
        if (activities.length > 0) {
          this.scrolEnable = true;
        }
          activities.map((activity) => {
            this.tempArray.push(activity);
          })
          this.groupByActivities();
        });
    }
  }
}


