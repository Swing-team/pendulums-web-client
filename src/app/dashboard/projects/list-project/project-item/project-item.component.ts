import {Component, DoCheck, Inject, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {APP_CONFIG} from '../../../../app.config';
import {Project} from '../../../../shared/state/project/project.model';
import {ActivityService} from '../../../../shared/activity/activity.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../../../shared/state/appState';
import {Observable, } from 'rxjs/Observable';
import {Activity} from '../../../../shared/state/activity/activity.model';
import {ActivityActions} from '../../../../shared/state/activity/activity.actions';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})
export class ProjectItemComponent implements OnInit {
  @Input() project: Project;
  @Input() currentActivity: Observable<Activity>;
  private currentActivityCopy: Activity;
  private activityStarted = false;
  private taskName: string;
  private activity: Activity;
  private activities = [
    {
      name: 'first activity',
      hour: '1',
    },
    {
      name: 'second activity second activity',
      hour: '2',
    },
    {
      name: 'third activity',
      hour: '12',
    },
  ];
  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private activityActions: ActivityActions) {
    this.taskName = 'Untitled task';
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        if (currentActivity.project === this.project.id) {
          this.activityStarted = true;
        } else {
          this.activityStarted = false;
        }
        this.currentActivityCopy = currentActivity;
      });
    }
  }

  startActivity() {
    if (this.currentActivityCopy.startedAt) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      this.activityService.edit(this.project.id, this.currentActivityCopy).then(() => {
        this.store.dispatch(this.activityActions.clearActivity());
        this.activity = new Activity();
        this.activity.name = this.taskName;
        this.activity.startedAt = Date.now().toString();
        this.activityService.create(this.project.id, JSON.stringify({activity: this.activity})).then((activity) => {
          this.store.dispatch(this.activityActions.loadactivity(activity));
        })
          .catch(error => {
            console.log('error is: ', error);
          });
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    } else {
      this.activity = new Activity();
      this.activity.name = this.taskName;
      this.activity.startedAt = Date.now().toString();
      this.activityService.create(this.project.id, JSON.stringify({activity: this.activity})).then((activity) => {
        this.store.dispatch(this.activityActions.loadactivity(activity));
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  stopActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      this.activityService.edit(this.project.id, this.currentActivityCopy).then((activity) => {
        this.store.dispatch(this.activityActions.clearActivity());
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  nameActivity() {

  }
}
