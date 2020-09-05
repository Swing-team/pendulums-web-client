import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Project } from 'app/shared/state/project/project.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { ProjectService } from '../project.service';
import { User } from 'app/shared/state/user/user.model';
import { Store } from '@ngrx/store';
import { AppState } from 'app/shared/state/appState';
import { Status } from 'app/shared/state/status/status.model';
import { ActivityService } from 'app/core/services/activity.service';
import { Activity } from 'app/shared/state/current-activity/current-activity.model';

@Component({
  selector: 'project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.sass'],
})

export class ProjectDashboardComponent implements OnInit, OnDestroy {
  project: Project;
  projectId: string;
  subscriptions: Subscription[] = [];
  user$: Observable<User>;
  status$: Observable<Status>;
  currentActivities: Activity[] = [];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private activityService: ActivityService,
    private store: Store<AppState>,
  ) {
    this.user$ = this.store.select('user');
    this.status$ = this.store.select('status');
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.projectId = params['projectId'];
      this.projectService.getProject(this.projectId).then((project) => {
        this.project = project;
      });
      this.activityService.getCurrentActivities(this.projectId).then((currentActivities) => {
        this.currentActivities = currentActivities;
      });
    }));
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }
  
}