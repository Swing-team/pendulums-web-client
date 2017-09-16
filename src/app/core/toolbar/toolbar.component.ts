import {Component, EventEmitter, Inject,
        Input, Output, OnInit}            from '@angular/core';
import {Observable}                       from 'rxjs/Observable';
import {APP_CONFIG}                       from '../../app.config';
import {Activity}                         from '../../shared/state/activity/activity.model';
import {Project}                          from '../../shared/state/project/project.model';
import {Projects}                         from '../../shared/state/project/projects.model';
import {ActivityService}                  from 'app/shared/activity/activity.service';
import {Store}                            from '@ngrx/store';
import {ActivityActions}                  from 'app/shared/state/activity/activity.actions';
import {AppState}                         from 'app/shared/state/appState';
import {ProjectsActions}                  from '../../shared/state/project/projects.actions';
import {ErrorService}                     from '../error/error.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit {
  @Input() projects: Projects;
  @Input() currentActivity: Observable<Activity>;
  @Output() onMenuItemClicked = new EventEmitter();
  private currentActivityCopy: Activity;
  private selectedProject: Project;
  private taskName: string;
  private timeDuration: string;

  constructor (@Inject(APP_CONFIG) private config,
               private activityService: ActivityService,
               private store: Store<AppState>,
               private activityActions: ActivityActions,
               private projectsActions: ProjectsActions,
               private errorService: ErrorService) {
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
    this.selectedProject = event.selectedItem;
    console.log(event.selectedItem);
  }

  startActivity() {
    if (this.selectedProject) {
      if (!this.taskName) {
        this.taskName = 'Untiteld name';
      }
      const activity = new Activity();
      activity.project = this.selectedProject.id;
      activity.name = this.taskName;
      activity.startedAt = Date.now().toString();
      this.activityService.create(this.selectedProject.id, activity).then((activity) => {
        this.showError('Activity started successfully!');
        this.store.dispatch(this.activityActions.loadactivity(activity));
      })
        .catch(error => {
          this.showError('Server communication error.');
          console.log('error is: ', error);
        });
    } else {
      this.showError('Select a distinct project.');
      console.log('error is: ', 'task should run on the distinct project');
    }
  }

  stopActivity() {
    if (this.currentActivity) {
      this.currentActivityCopy.stoppedAt = Date.now().toString();
      this.activityService.editCurrentActivity(this.currentActivityCopy.project, this.currentActivityCopy).then((activity) => {
        this.store.dispatch(this.activityActions.clearActivity());
        this.store.dispatch(this.projectsActions.updateProjectActivity(activity.project, activity));
        this.taskName = null;
        this.showError('Activity stopped successfully!');
      })
        .catch(error => {
          this.showError('Server communication error.');
          console.log('error is: ', error);
        });
    }
  }

  showSideMenu() {
    this.onMenuItemClicked.emit();
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
