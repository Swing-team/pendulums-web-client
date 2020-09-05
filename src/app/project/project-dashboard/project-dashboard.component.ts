import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Project } from 'app/shared/state/project/project.model';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectService } from '../project.service';

@Component({
  selector: 'project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.sass'],
})

export class ProjectDashboardComponent implements OnInit, OnDestroy {
  project: Project;
  projectId: string;
  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.projectId = params['projectId'];
      this.projectService.getProject(this.projectId).then((project) => {
        this.project = project;
      });
    }));
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }
  
}