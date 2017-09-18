import { Component, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { APP_CONFIG }                         from '../../../../app.config';
import { Project }                            from '../../../../shared/state/project/project.model';
import { ActivityService }                    from '../../../../shared/activity/activity.service';
import { Store }                              from '@ngrx/store';
import { AppState }                           from '../../../../shared/state/appState';
import { Observable }                         from 'rxjs/Observable';
import { Activity }                           from '../../../../shared/state/activity/activity.model';
import { ActivityActions }                    from '../../../../shared/state/activity/activity.actions';
import { ProjectsActions }                    from '../../../../shared/state/project/projects.actions';
import { ModalService }                       from '../../../../core/modal/modal.service';
import { ProjectSettingsModalComponent }      from 'app/dashboard/projects/settings/modal/project-settings-modal.component';
import { User }                               from '../../../../shared/state/user/user.model';
import { Router }                             from '@angular/router';

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
  private activities: any;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private activityActions: ActivityActions,
               private projectsActions: ProjectsActions,
               private router: Router) {
    this.taskName = 'Untitled task';
    this.activities = [];
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        if (currentActivity.project === this.project.id) {
          this.activityStarted = true;
          this.taskName = currentActivity.name;
        } else {
          this.activityStarted = false;
        }
        this.currentActivityCopy = currentActivity;
      });
    }
    if (this.project.activities) {
      this.project.activities.map((activity) => {
        this.calculateActivityDuration(activity);
      });
    }
  }

  startActivity() {
    if (this.currentActivityCopy.startedAt) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then(() => {
        this.store.dispatch(this.activityActions.clearActivity());
        this.activity = new Activity();
        this.activity.name = this.taskName;
        this.activity.startedAt = Date.now().toString();
        this.activityService.create(this.project.id, this.activity).then((activity) => {
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
      this.activityService.create(this.project.id, this.activity).then((activity) => {
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
      this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
        this.store.dispatch(this.activityActions.clearActivity());
        this.store.dispatch(this.projectsActions.updateProjectActivity(this.project.id, activity));
        this.taskName = 'Untitled task';
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  nameActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
        this.store.dispatch(this.activityActions.loadactivity(activity));
      })
        .catch(error => {
          console.log('error is: ', error);
        });
    }
  }

  calculateActivityDuration (activity) {
    const duration = Number(activity.stoppedAt) - Number(activity.startedAt);
    let result: any;
    result = {
      name: activity.name,
      hour: 0
    };
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    if (hours !== 0) {
      result.hour = hours + ':' + minutes ;
    }

    if (minutes !== 0 && hours === 0) {
      result.hour = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result.hour = seconds + ' sec';
    }
    this.activities.push(result);
  };

  showSettings() {
    this.modalService.show({
      component: ProjectSettingsModalComponent,
      containerRef: this.viewContainerRef,
      inputs: {
        project: this.project,
        user: this.user
      }
    });
  }

  goToActivities(): void {
    this.router.navigate(['/activities', this.project.id]);
  }
}
