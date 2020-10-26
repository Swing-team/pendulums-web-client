import { Component, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { RecentActivityWithProject } from './model/recent-activities-with-project.model';
import { User } from 'app/shared/state/user/user.model';
import { ErrorService } from 'app/core/error/error.service';
import { ModalService } from 'app/core/modal/modal.service';
import { AddManuallyActivityComponent } from 'app/activity/activity-add-edit-manually/activity-add-edit-manually.component';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'app/shared/state/appState';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';

@Component({
  selector: 'recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.sass'],
})
export class RecentActivitiesComponent implements OnInit, OnDestroy {
  @Input() recentActivitiesWithProject: RecentActivityWithProject[];
  @Input() currentUser: User;
  @Input() matchHeightWithParent: boolean;
  @Input() matchWidthWithParent: boolean;
  @Input() emptyPlaceHolder: string;
  @Input() showFooterPagination: boolean
  @Input() projectId: string;

  subscriptions: Subscription[] = [];
  currentActivity: Observable<Activity>;
  activitiesPagination: Array<Array<RecentActivityWithProject>> = [];
  activitiesPaginationIndex = 0;

  private ITEMS_IN_PAGE = 3;

  constructor(
    private errorService: ErrorService,
    private modalService: ModalService,
    private store: Store<AppState>,
  ) {
    this.currentActivity = store.select('currentActivity');
  }

  ngOnInit() {
    if (this.recentActivitiesWithProject) {
      this.paginateRecentActivities();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.recentActivitiesWithProject) {
      this.paginateRecentActivities();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  paginateRecentActivities() {
    this.activitiesPagination = [];
    this.activitiesPaginationIndex = 0;
    let tempPageIndex = 0
    for (let index = 0; index < this.recentActivitiesWithProject.length; index++) {
      const item = this.recentActivitiesWithProject[index];
      if (index !== 0 && index % this.ITEMS_IN_PAGE === 0) {
        tempPageIndex++;
      }
      if (!this.activitiesPagination[tempPageIndex]) {
        this.activitiesPagination[tempPageIndex] = new Array<RecentActivityWithProject>();
      }
      this.activitiesPagination[tempPageIndex].push(item);
    }
  }

  prevRecentActivitiesPage() {
    this.activitiesPaginationIndex--;
  }

  nextRecentActivitiesPage() {
    const nextActivity = this.activitiesPagination[this.activitiesPaginationIndex + 1];
    if (nextActivity && nextActivity[0] && nextActivity[0].activity && nextActivity[0].activity.id) {
      this.activitiesPaginationIndex++;
    } else {
      this.showError('There are no more current activities');
    }
  }

  openAddManuallyModal() {
    let tempCurrentActivity: any;
    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        tempCurrentActivity = currentActivity;
      }));
    }
    this.modalService.show({
      component:  AddManuallyActivityComponent,
      inputs: {
        projectId: this.projectId,
        currentActivity: tempCurrentActivity ? tempCurrentActivity : null,
      },
      // there is output if needed
      // outputs: {
      //   responseActivity: (params) => {

      //   }
      // },
      customStyles: {'width': '400px'}
    });
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
