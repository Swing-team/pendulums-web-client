import {Component, Inject, Input, OnInit} from '@angular/core';
import {Observable}               from 'rxjs/Observable';
import {APP_CONFIG}               from '../../app.config';
import {Activity} from '../../shared/state/activity/activity.model';
import {Project} from '../../shared/state/project/project.model';
import {Projects} from '../../shared/state/project/projects.model';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit {
  @Input() projects: Projects;
  @Input() currentActivity: Observable<Activity>;
  private currentActivityCopy: Activity;
  private selectedProject: Project;
  private timeDuration: string;


  constructor (@Inject(APP_CONFIG) private config) {
    this.selectedProject = new Project();
    setInterval(() => {
      const startedAt = +this.currentActivityCopy.startedAt;
      const now = Date.now();
      const duration = now - startedAt;
      console.log(startedAt);
      console.log(now);
      console.log(duration);
      this.timeDuration = this.getTime(duration);

    }, 1000);
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        this.currentActivityCopy = currentActivity;
        this.selectedProject = this.projects.entities[currentActivity.project];
      });
    }
  }

  getTime (duration) {
    const seconds = (duration / 1000).toFixed(1);
    const minutes = (duration / (1000 * 60)).toFixed(1);
    const hours = (duration / (1000 * 60 * 60)).toFixed(1);

    return hours + ':' + minutes + ':' + seconds;
  };

  projectSelected(event) {
    console.log(event.index);
    console.log(event.selectedItem);
  }
}
