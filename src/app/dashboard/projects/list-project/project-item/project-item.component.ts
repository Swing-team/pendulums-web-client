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
import { DatabaseService }                    from '../../../../core/servises/database/database.service';

@Component({
  selector: 'project-item',
  templateUrl: './project-item.component.html',
  styleUrls: ['./project-item.component.sass'],
})
export class ProjectItemComponent implements OnInit {
  @Input() project: Project;
  @Input() user: User;
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
               private router: Router,
               private modalService: ModalService,
               private viewContainerRef: ViewContainerRef,
               private dBService: DatabaseService) {
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
      this.stopActivity();
      this.startActivityAtServer();
    } else {
      this.startActivityAtServer();
    }
  }

  startActivityAtServer() {
    this.activity = new Activity();
    this.activity.name = this.taskName;
    this.activity.startedAt = Date.now().toString();
    this.activityService.create(this.project.id, this.activity).then((activity) => {
      delete activity.createdAt;
      delete activity.updatedAt;
      this.store.dispatch(this.activityActions.loadActivity(activity));
      this.dBService
        .createOrUpdate('currentActivity', {data: activity, userId: this.user.id})
        .then((dbActivity) => {
          console.log('activity stored in db: ', dbActivity);
        });
    })
      .catch(error => {
        // we need two below fields for offline logic
        this.activity.project = this.project.id;
        this.activity.user = this.user.id;
        console.log('server error happened and it is: ', error);
        this.store.dispatch(this.activityActions.loadActivity(this.activity));
        this.dBService
          .createOrUpdate('currentActivity', {data: this.activity, userId: this.user.id})
          .then((dbActivity) => {
            console.log('activity stored in db: ', dbActivity);
          });
      });
  }

  stopActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
          this.store.dispatch(this.activityActions.clearActivity());
          this.dBService
            .removeAll('currentActivity')
            .then(() => {});
          this.store.dispatch(this.projectsActions.updateProjectActivities(this.project.id, activity));
          this.taskName = 'Untitled task';
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('current Activity loaded from db ');
            this.stopActivityAtDb();
          });
      } else {
        console.log('activity has no id so id should go through the sync way');
        this.activityService.create(this.project.id, this.currentActivityCopy).then((activity) => {
          this.store.dispatch(this.activityActions.clearActivity());
          this.dBService
            .removeAll('currentActivity')
            .then(() => {});
          this.store.dispatch(this.projectsActions.updateProjectActivities(this.project.id, activity));
          this.taskName = 'Untitled task';
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('current Activity will store at db ');
            this.stopActivityAtDb();
          });
      }
    }
  }

  stopActivityAtDb() {
    this.dBService
      .get('activities', this.user.id)
      .then((activities) => {
        let ActivitiesArray = [];
        if (activities) {
          ActivitiesArray = activities.data;
        }
        ActivitiesArray.push(this.currentActivityCopy);
        this.dBService
          .createOrUpdate('activities', {data: ActivitiesArray, userId: this.user.id})
          .then((activity) => {
            this.store.dispatch(this.projectsActions.updateProjectActivities(this.project.id, this.currentActivityCopy));
            this.store.dispatch(this.activityActions.clearActivity());
            this.dBService
              .removeAll('currentActivity')
              .then(() => {});
            this.taskName = 'Untitled task';
          });
      });
  }

  nameActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.name = this.taskName;
      if (this.currentActivityCopy.id) {
        this.activityService.editCurrentActivity(this.project.id, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.activityActions.loadActivity(activity));
          this.dBService
            .createOrUpdate('currentActivity', {data: activity, userId: this.user.id})
            .then((dbActivity) => {
              console.log('activity stored in db: ', dbActivity);
            });
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('this.currentActivityCopy', this.currentActivityCopy)
            this.store.dispatch(this.activityActions.loadActivity(this.currentActivityCopy));
            this.dBService
              .createOrUpdate('currentActivity', {data: this.currentActivityCopy, userId: this.user.id})
              .then((dbActivity) => {
                console.log('activity stored in db: ', dbActivity);
              });
          });
      } else {
        console.log('activity has no id so id should go through the sync way');
        this.activityService.create(this.project.id, this.currentActivityCopy).then((activity) => {
          delete activity.createdAt;
          delete activity.updatedAt;
          this.store.dispatch(this.activityActions.loadActivity(activity));
          this.dBService
            .createOrUpdate('currentActivity', {data: activity, userId: this.user.id})
            .then((dbActivity) => {
              console.log('activity stored in db: ', dbActivity);
            });
        })
          .catch(error => {
            console.log('server error happened and it is: ', error);
            console.log('your edit will store at db ');
            this.store.dispatch(this.activityActions.loadActivity(this.currentActivityCopy));
            this.dBService
              .createOrUpdate('currentActivity', {data: this.currentActivityCopy, userId: this.user.id})
              .then((dbActivity) => {
                console.log('activity stored in db: ', dbActivity);
              });
          });
      }
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
