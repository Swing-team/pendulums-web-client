import 'rxjs/add/operator/switchMap';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { APP_CONFIG }                       from '../../app.config';
import { ActivityService }                  from '../../shared/activity/activity.service';
import { Activity }                         from '../../shared/state/activity/activity.model';
import {ActivatedRoute, ParamMap}           from '@angular/router';

@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.sass']
})
export class ActivitiesComponent implements OnInit {
  private projectActivities: Activity[];

  constructor (@Inject(APP_CONFIG) private config,
               private route: ActivatedRoute,
               private activityService: ActivityService) {}

  ngOnInit() {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.activityService.getActivities(params.get('projectId')))
      .subscribe((activities) => {
        this.projectActivities = activities;
        console.log(this.projectActivities);
      });
  }

}


