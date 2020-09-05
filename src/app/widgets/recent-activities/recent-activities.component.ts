import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { RecentActivityWithProject } from './model/recent-activities-with-project.model';
import { User } from 'app/shared/state/user/user.model';
import { ErrorService } from 'app/core/error/error.service';

@Component({
  selector: 'recent-activities',
  templateUrl: './recent-activities.component.html',
  styleUrls: ['./recent-activities.component.sass'],
})
export class RecentActivitiesComponent implements OnInit {
  @Input() recentActivitiesWithProject: RecentActivityWithProject[];
  @Input() currentUser: User;
  @Input() matchHeightWithParent: boolean;
  @Input() matchWidthWithParent: boolean;
  @Input() emptyPlaceHolder: string;

  activitiesPagination: Array<Array<RecentActivityWithProject>> = [];
  activitiesPaginationIndex = 0;

  private ITEMS_IN_PAGE = 3;

  constructor(
    private errorService: ErrorService,
  ) { }

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

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}