import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { RecentActivityWithMeta } from './model/recent-activities-with-project.model';
import { ErrorService } from 'app/core/error/error.service';
import { ModalService } from 'app/core/modal/modal.service';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'app/shared/state/appState';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';
import { environment } from 'environments/environment';
import { AddManuallyActivityComponent } from 'app/activity/activity-add-edit-manually/activity-add-edit-manually.component';
import { ActivityService } from 'app/core/services/activity.service';
import { AppStateSelectors } from 'app/shared/state/app-state.selectors';
import { Project } from 'app/shared/state/project/project.model';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.sass'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)', opacity: 0}),
        animate('200ms ease-out', style({transform: 'translateY(0%)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({transform: 'translateY(-100%)', opacity: 0}))
      ])
    ])
  ],
})
export class RecentActivitiesComponent implements OnInit, OnDestroy {
  recentActivitiesWithMeta: RecentActivityWithMeta[] = [];
  activityTimeInterval: any;
  currentActivity$: Observable<Activity>;
  currentActivity: Activity;
  projects$: Observable<Project[]>;
  projects: Project[] = [];
  page = 0;
  environment = environment;
  deleteButtonDisabled: boolean;
  deleteConfirmationIndex: number = -1;
  subscriptions: Subscription[] = [];
  @Output() recentActivitiesChanged = new EventEmitter();

  constructor(
    private errorService: ErrorService,
    private modalService: ModalService,
    private appStateSelectors: AppStateSelectors,
    private store: Store<AppState>,
    private activityService: ActivityService,
  ) {
    this.currentActivity$ = this.store.select('currentActivity');
    this.projects$ = this.store.select(this.appStateSelectors.getProjectsArray);
  }

  ngOnInit() {
    this.getRecentActivities();
    this.subscriptions.push(this.projects$.subscribe(projects => this.projects = projects));
    this.subscriptions.push(this.currentActivity$.subscribe(currentActivity => this.refreshCurrentActivity(currentActivity)));
  }

  async getRecentActivities() {
    try {
      this.recentActivitiesWithMeta  = await this.activityService.getUserRecentActivities();
      this.initialize();
    } catch (e) {
      this.showMessage("Couldn't fetch recent activities");
    }
  }

  refreshCurrentActivity(currentActivity: Activity) {
    if (!this.currentActivity && currentActivity.startedAt) {
      // Started
      this.currentActivity = currentActivity;
      const project = this.projects.find(p => p.id === this.currentActivity.project);
      this.recentActivitiesWithMeta.unshift({activity: {...this.currentActivity}, project});
      this.initialize();
    } else if (this.currentActivity && currentActivity.startedAt) {
      // Edited
      this.currentActivity = currentActivity;
      this.recentActivitiesWithMeta[0].activity = {...this.currentActivity};
      this.initialize();
    } else if (this.currentActivity && !currentActivity.startedAt) {
      // Stopped
      const project = this.projects.find(p => p.id === this.currentActivity.project);
      this.recentActivitiesWithMeta[0].activity = {...project.activities[0]};
      this.currentActivity = null;
      this.initialize();
    }
  }

  prevPage() {
    this.page--;
    this.deleteConfirmationIndex = -1;
  }

  nextPage() {
    this.page++;
    this.deleteConfirmationIndex = -1;
  }

  private initialize() {
    this.recentActivitiesWithMeta = this.recentActivitiesWithMeta.slice(0, 9);
    this.recentActivitiesWithMeta.sort((awm1, awm2) => {
      if (!awm1.activity.stoppedAt) {
        return -1;
      }
      if (!awm2.activity.stoppedAt) {
        return 1;
      }
      if (Number(awm1.activity.stoppedAt) > Number(awm2.activity.stoppedAt)) {
        return -1;
      } else {
        return 1;
      }
    });
    for (let activityWithMeta of this.recentActivitiesWithMeta) {
      if (activityWithMeta.activity.stoppedAt) {
        const fromDate = new Date(Number(activityWithMeta.activity.startedAt));
        activityWithMeta.humanReadableFrom = ('0' + fromDate.getHours()).slice(-2)   + ':' + ('0' + fromDate.getMinutes()).slice(-2);
        const toDate = new Date(Number(activityWithMeta.activity.stoppedAt));
        activityWithMeta.humanReadableTo = ('0' + toDate.getHours()).slice(-2)   + ':' + ('0' + toDate.getMinutes()).slice(-2);
        const tempDuration = Number(activityWithMeta.activity.stoppedAt) - Number(activityWithMeta.activity.startedAt);
        activityWithMeta.humanReadableDuration = this.calculateActivityDuration(tempDuration);
      } else {
        const fromDate = new Date(Number(activityWithMeta.activity.startedAt));
        activityWithMeta.humanReadableFrom = ('0' + fromDate.getHours()).slice(-2)   + ':' + ('0' + fromDate.getMinutes()).slice(-2);
        activityWithMeta.humanReadableTo = '...';
        if (this.activityTimeInterval) {
          clearInterval(this.activityTimeInterval);
        }
        this.activityTimeInterval = setInterval(() => {
          let startedAt = Number(activityWithMeta.activity.startedAt);
          let now = Date.now();
          let duration = now - startedAt;
          activityWithMeta.humanReadableDuration = this.calculateActivityDuration(duration);
        }, 1000);
      }
    }
  }

  deleteItem(index: number) {
    this.deleteConfirmationIndex = index;
  }

  confirmDelete(activity: Activity) {
    if (!this.deleteButtonDisabled) {
      this.deleteButtonDisabled = true;
      this.activityService.delete(activity.project, activity.id).then(async () => {
        await this.getRecentActivities();
        // TODO: Mohammad 07-05-2022: Notify chart?
        // Now re-render chart component
        this.deleteButtonDisabled = false;
        this.deleteConfirmationIndex = -1;
        this.showMessage('The activity was deleted successfully');
        this.recentActivitiesChanged.emit();
      }).catch(error => {
        this.deleteButtonDisabled = false;
        this.showMessage('Server communication error');
        console.log('error is: ', error);
      });
    }
  }

  cancelDelete() {
    if (!this.deleteButtonDisabled) {
      this.deleteConfirmationIndex = -1;
    }
  }

  openEditActivity(activityWithMeta: RecentActivityWithMeta) {
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      inputs: {
        activity: activityWithMeta.activity,
        projectId: activityWithMeta.project.id,
        currentActivity: this.currentActivity,
      },
      outputs: {
        responseActivity: (params) => {
          this.recentActivitiesChanged.emit();
          activityWithMeta.activity = params[0];
          this.initialize();
        }
      },
      customStyles: {'max-width': '400px', 'overflow': 'initial'}
    });
  }

  calculateActivityDuration (duration) {
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
      result = hours + 'h ' + minutes + 'min';
    }

    if (minutes !== 0 && hours === 0) {
      result = minutes + ' min' ;
    }

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  }

  showMessage(error) {
    this.errorService.show({
      input: error
    });
  }

  ngOnDestroy(): void {
    if (this.activityTimeInterval) {
      clearInterval(this.activityTimeInterval);
    }

    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
