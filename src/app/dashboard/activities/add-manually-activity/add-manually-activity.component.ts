import * as _ from 'lodash';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { APP_CONFIG }                       from '../../../app.config';
import { Activity }                         from '../../../shared/state/activity/activity.model';

@Component({
  selector: 'create-activity',
  templateUrl: './add-manually-activity.component.html',
  styleUrls: ['./add-manually-activity.component.sass']
})
export class AddManuallyActivityComponent implements OnInit {
  @Input() activity: Activity;
  private activityModel: Activity;
  private activityName: string;
  private toCalanderShow = false;
  private toDate: string;
  private toTime: string;
  private fromCalanderShow = false;
  private fromDate: string;
  private fromTime: string;

  constructor (@Inject(APP_CONFIG) private config) {}

  ngOnInit() {
    if (this.activity) {
      this.activityModel = _.cloneDeep(this.activity);
    } else {
      this.activityModel = new Activity();
      this.activityModel.name = 'untiled name';
    }
  }

  showFromCalender() {
    this.fromCalanderShow = true;
  }

  closeFromCalender() {
    this.fromCalanderShow = false;
  }

  showToCalender() {
    this.toCalanderShow = true;
  }

  updateTo(event) {
    this.toDate = event.format('YYYY-MM-DD');
    this.toCalanderShow = false;
    console.log(event);
  }

  updateFrom(event) {
    this.fromDate = event.format('YYYY-MM-DD');
    this.fromCalanderShow = false;
    console.log(event);
  }
}


