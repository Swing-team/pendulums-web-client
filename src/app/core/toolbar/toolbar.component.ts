import {
  Component, EventEmitter, Inject,
  Input, Output, OnInit, OnDestroy, ViewChild, DoCheck, KeyValueDiffers
} from '@angular/core';
import { Observable ,  Subscription }                       from 'rxjs';
import { Activity }                         from '../../shared/state/current-activity/current-activity.model';
import { Project }                          from '../../shared/state/project/project.model';
import { Store }                            from '@ngrx/store';
import { AppState }                         from 'app/shared/state/appState';
import { ProjectsActions }                  from '../../shared/state/project/projects.actions';
import { ErrorService }                     from '../error/error.service';
import { User }                   from '../../shared/state/user/user.model';
import { StopStartActivityService }         from '../services/stop-start-activity.service';
import { Status }                           from '../../shared/state/status/status.model';
import { cloneDeep }                        from 'lodash';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})

export class ToolbarComponent implements OnInit, OnDestroy, DoCheck  {
  @Input() user: User;
  @Input() status: Status;
  projects: Array<Project>;
  @Input() projects$: Observable<Project[]>;
  @Input() selectedProjectInput: Observable<string>;
  @Input() currentActivity: Observable<Activity>;
  @Output() onMenuItemClicked = new EventEmitter();
  @ViewChild('activityNameElm') activityNameElm;
  differ: any;
  currentActivityCopy: Activity;
  showTimeDuration = false;
  stopStartButtonDisabled = false;
  selectedProjectIndex: any;
  hasNotification = false;
  private selectedProject: Project;
  private taskName: string;
  private timeDuration: string;
  private activityStarted = false;
  private subscriptions: Array<Subscription> = [];

  constructor (private store: Store<AppState>,
               private projectsActions: ProjectsActions,
               private errorService: ErrorService,
               private stopStartActivityService: StopStartActivityService,
               private differs: KeyValueDiffers) {
    this.selectedProject = new Project();
    this.currentActivityCopy = {} as Activity;
    this.differ = this.differs.find({}).create();
  }

  ngOnInit() {
    this.subscriptions.push(this.projects$.subscribe((projects) => {
      this.projects = projects;
    }));

    if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
      this.hasNotification = true;
    }

    this.selectedProjectIndex = 0;

    if (this.projects.length > 0) {
      this.selectedProject = this.projects[0];
      this.taskName = this.projects[0].recentActivityName;
    }

    if (this.currentActivity) {
      this.subscriptions.push(this.currentActivity.subscribe(currentActivity => {
        this.currentActivityCopy = currentActivity;

        // this part of code is to handel situation that we have slow connection and activityName is editing
        const activityNameElm = document.getElementById('activityNameElm');
        if (activityNameElm && document.activeElement === activityNameElm) {
          // do nothing
        } else {
          if (currentActivity.name) {
            this.taskName = currentActivity.name;
          }
        }

        this.projects.map((project, index) => {
          if (project.id === currentActivity.project) {
            this.selectedProject = project;
            this.selectedProjectIndex = index;
          }
        });

        if (this.currentActivityCopy.startedAt) {
          this.activityStarted = true;
          let startedAt;
          let now;
          let duration;
          setInterval(() => {
            if (this.currentActivityCopy.startedAt) {
              startedAt = Number(this.currentActivityCopy.startedAt);
              now = Date.now();
              duration = now - startedAt;
              this.timeDuration = this.getTime(duration);
            } else {
              this.timeDuration = '0';
            }
          }, 1000);
        } else {
          this.activityStarted = false;
        }
      }));
    }
    this.subscriptions.push(this.selectedProjectInput.subscribe(selectedProjectInput => {
      this.findSelectedProject(selectedProjectInput);
    }));
  }

  ngDoCheck() {
    const change = this.differ.diff(this.user.pendingInvitations);
    if (change) {
      if (this.user.pendingInvitations.length > 0 || this.status.updateNeeded) {
        this.hasNotification = true;
      } else {
        this.hasNotification = false;
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.map((subscribe) => {
      subscribe.unsubscribe()
    });
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

  projectSelected(event) {
    this.store.dispatch(this.projectsActions.updateSelectedProject(event.selectedItem.id));
  }

  findSelectedProject(selectedProjectInput) {
    if (selectedProjectInput) {
      this.projects.map((project, index) => {
        if (project.id === selectedProjectInput) {
          this.selectedProject = project;
          this.selectedProjectIndex = [index];
          this.taskName = this.selectedProject.recentActivityName;
        }
      });
    } else {
      this.selectedProject = null;
      this.selectedProjectIndex = null;
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

  showSideMenu(event) {
    this.onMenuItemClicked.emit(event);
  }

  nameActivity($event) {
    this.taskName = this.taskName.trim();
    this.stopStartActivityService.nameActivity(this.taskName, this.selectedProject);
    // just for blur out the input
    const target = $event.target;
    target.blur();
  }

  showError(error) {
    this.errorService.show({
      input: error
    });
  }
}
