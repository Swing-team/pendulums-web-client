import {
  Component, EventEmitter,
  Inject, Input, OnInit, Output
}                                   from '@angular/core';
import { APP_CONFIG }               from '../../../app.config';
import { ActivityService }          from '../../../shared/activity/activity.service';
import { Activity }                 from '../../../shared/state/activity/activity.model';

@Component({
  selector: 'activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.sass']
})
export class ActivityItemComponent implements OnInit {
  @Input() activity: Activity;
  @Output() onDeleteClicked = new EventEmitter();
  private from: string;
  private to: string;
  private duration: string;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService) {}

  ngOnInit() {
    const fromDate = new Date(Number(this.activity.startedAt));
    this.from = fromDate.getHours() + ':' + fromDate.getMinutes();
    const toDate = new Date(Number(this.activity.stoppedAt));
    this.to = toDate.getHours() + ':' + toDate.getMinutes();
    this.duration = this.calculateActivityDuration(this.activity);
  }

  delete() {
    this.onDeleteClicked.emit();
  }

  calculateActivityDuration (activity) {
    const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
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


