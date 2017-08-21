import { Component, Inject, Input } from '@angular/core';
import { APP_CONFIG }               from '../../../app.config';
import { ActivityService }          from '../../../shared/activity/activity.service';
import { Activity }                 from '../../../shared/state/activity/activity.model';

@Component({
  selector: 'activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.sass']
})
export class ActivityItemComponent {
  @Input() activity: Activity;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,) {}

  delete() {
    this.activityService.delete(this.activity.project, this.activity.id).then((activity) => {

    })
      .catch(error => {
        console.log('error is: ', error);
      });
  }
}


