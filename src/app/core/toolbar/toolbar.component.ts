import {
  Component, EventEmitter,
  Input, Output, OnInit, OnDestroy, ViewChild
} from '@angular/core';
import { Observable ,  Subscription }                       from 'rxjs';
import { Activity }                         from '../../shared/state/current-activity/current-activity.model';
import { Project }                          from '../../shared/state/project/project.model';
import { Store }                            from '@ngrx/store';
import { AppState }                         from 'app/shared/state/appState';
import { ProjectsActions }                  from '../../shared/state/project/projects.actions';
import { ErrorService }                     from '../error/error.service';
import { StopStartActivityService }         from '../services/stop-start-activity.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit, OnDestroy  {
  projects: Array<Project>;
  @Input() projects$: Observable<Project[]>;
  @Input() selectedProjectInput: Observable<string>;
  @Input() currentActivity: Observable<Activity>;
  @Output() onMenuItemClicked = new EventEmitter();
  @ViewChild('activityNameElm') activityNameElm;
  currentActivityCopy: Activity;
  showTimeDuration = false;
  stopStartButtonDisabled = false;
  hasNotification = false;
  timeDuration: string = '0 sec';
  selectedProject: Project; // the actual project object instance we are working with
  taskName: string;
  private activityStarted = false;
  private intervalInstance: any = null;
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>,
               private projectsActions: ProjectsActions,
               private errorService: ErrorService,
               private stopStartActivityService: StopStartActivityService,) {
    this.selectedProject = new Project();
    this.currentActivityCopy = {} as Activity;
  }

  ngOnInit() {
    this.subscriptions.push(this.projects$.subscribe((projects) => {
      this.projects = projects;
      this.projects.forEach((project) => {
        if (project.id === this.selectedProject.id) {
          // update selected project instance
          this.selectedProject = project;
        }
      });
    }));

    if (this.projects.length > 0) {
      this.selectedProject = this.projects[0];
      this.taskName = this.projects[0].recentActivityName;
    }

    this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
      this.currentActivityCopy = currentActivity;

      // this part of code is to handle situation that we have slow connection and activityName is editing
      const activityNameElm = document.getElementById('activityNameElm');
      if (activityNameElm && document.activeElement === activityNameElm) {
        // do nothing
      } else {
        if (currentActivity.name) {
          this.taskName = currentActivity.name;
        }
      }

      // to make sure the correct project is selected, selectedProjectInput is not reliable here,
      // maybe the user has started this activity from another device so selectedProjectInput won't work here.
      // TODO: Mohammad 01-25-2021: try the above case, also maybe it's better to only do this when we start an activity not on all updates
      this.projects.forEach((project) => {
        if (project.id === currentActivity.project) {
          this.selectedProject = project;
        }
      });

      if (this.currentActivityCopy.startedAt) {
        if (!this.intervalInstance) {
          this.activityStarted = true;
          let startedAt;
          let now;
          let duration;
          this.intervalInstance = setInterval(() => {
            if (this.currentActivityCopy.startedAt) {
              startedAt = Number(this.currentActivityCopy.startedAt);
              now = Date.now();
              duration = now - startedAt;
              this.timeDuration = this.getTime(duration);
            } else {
              this.timeDuration = '0 sec';
            }
          }, 1000);
        }
      } else {
        this.activityStarted = false;
        this.timeDuration = '0 sec';
        if (this.intervalInstance) {
          this.clearInterval();
        }
      }
    }));

    this.subscriptions.push(this.selectedProjectInput.subscribe(selectedProjectInput => {
      if (selectedProjectInput !== this.selectedProject.id) {
        this.findSelectedProject(selectedProjectInput);
      }
    }));
  }

  private clearInterval() {
    if (this.intervalInstance) {
      clearInterval(this.intervalInstance);
      this.intervalInstance = null;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscribe) => subscribe.unsubscribe());
    this.clearInterval();
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

    let tempMinutes: string ;
    let tempSeconds: string ;
    let tempHours: string ;
    if (minutes < 10) {
      tempMinutes = '0' + minutes;
    } else {
      tempMinutes = '' + minutes;
    }
    if (seconds < 10) {
      tempSeconds = '0' + seconds;
    } else {
      tempSeconds = '' + seconds;
    }
    if (hours < 10) {
      tempHours = '0' + hours;
    } else {
      tempHours = '' + hours;
    }

    result = tempHours + ':' + tempMinutes + ':' + tempSeconds;

    if (minutes === 0 && hours === 0) {
      result = seconds + ' sec';
    }
    return result;
  };

  projectSelected(project: Project) {
    this.store.dispatch(this.projectsActions.updateSelectedProject(project.id));
  }

  findSelectedProject(selectedProjectInput: string) {
    if (selectedProjectInput) {
      this.projects.forEach((project) => {
        if (project.id === selectedProjectInput) {
          this.selectedProject = project;
          this.taskName = this.selectedProject.recentActivityName;
        }
      });
    } else {
      this.selectedProject = null;
      this.taskName = '';
    }
  }

  toggleShowTimeDuration() {
    this.showTimeDuration = !this.showTimeDuration;
  }

  toggleStopStart() {
    if (this.projects.length > 0) {
      if (!this.stopStartButtonDisabled) {
        this.stopStartButtonDisabled = true;
        if (this.activityStarted) {
          this.stopActivity();
        } else {
          this.startActivity();
        }
      }
    } else {
      document.getElementsByTagName('swing-select')[0].setAttribute('label', 'Select a project');
      this.showError('Please create a project first!');
    }
  }

  startActivity() {
    if (this.selectedProject && this.selectedProject.id) {
      if (!this.taskName) {
        this.taskName = 'Untitled Activity';
      }
      const activity: Activity = {} as Activity;
      activity.project = this.selectedProject.id;
      activity.name = this.taskName;
      activity.startedAt = Date.now().toString();

      this.stopStartActivityService.startActivity(activity, this.selectedProject).then(() => {
        this.stopStartButtonDisabled = false;
        this.showError('The activity was started');

        // This timeout use to handle focus on input
        setTimeout(() => {
          const element: HTMLElement = document.getElementById('activityNameElm') as HTMLElement;
          if (element) {
            // We have to work with view child because select() doesn't exist on HTMLElement
            this.activityNameElm.nativeElement.focus();
            this.activityNameElm.nativeElement.select();
          }
        }, 300)
      });
    } else {
      this.stopStartButtonDisabled = false;
      this.showError('Select a project');
    }
  }

  stopActivity() {
    this.stopStartActivityService.stopActivity(this.selectedProject).then(() => {
      this.stopStartButtonDisabled = false;
      this.showError('The activity was stopped');
    });
  }

  nameActivity($event) {
    this.taskName = this.taskName.trim();
    this.stopStartActivityService.nameActivity(this.taskName, this.selectedProject);
    // just for blur out the input
    const target = $event.target;
    target.blur();
  }

  projectCompareFunction(p1: Project, p2: Project) {
    return p1 && p2 && (p1.id === p2.id);
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
