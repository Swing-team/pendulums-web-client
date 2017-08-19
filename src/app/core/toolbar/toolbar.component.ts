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
  }

  ngOnInit() {
    if (this.currentActivity) {
      this.currentActivity.subscribe(currentActivity => {
        this.currentActivityCopy = currentActivity;
        this.selectedProject = this.projects.entities[currentActivity.project];
        if (this.currentActivityCopy.startedAt) {
          let startedAt;
          let now;
          let duration;
          setInterval(() => {
            startedAt = Number(this.currentActivityCopy.startedAt);
            now = Date.now();
            duration = now - startedAt;
            this.timeDuration = this.getTime(duration);
          }, 1000);
        }
      });
    }
  }

  getTime (duration) {
    let result: string;
    let x = duration / 1000;
    const seconds = Math.floor(x % 60);
    // minutes
    x /= 60;
    const minutes = Math.floor(x % 60);
    // hours
    x /= 60;
    const hours = Math.floor(x);

    result = hours + ' : ' + minutes + ' : ' + seconds ;

    if (minutes !== 0 && hours === 0) {
      result = minutes + ' : ' + seconds ;
    }

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  };

  projectSelected(event) {
    console.log(event.index);
    console.log(event.selectedItem);
  }
}
