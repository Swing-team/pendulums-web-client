import { Injectable }                 from '@angular/core';
import { StopStartActivityService }   from '../core/services/stop-start-activity.service';
import { Store }                      from '@ngrx/store';
import { AppState }                   from '../shared/state/appState';
import { AppStateSelectors }          from '../shared/state/app-state.selectors';
import { ProjectsActions }            from '../shared/state/project/projects.actions';
const { ipcRenderer } = (<any>window).require('electron');

@Injectable()
export class ElectronService {
  constructor(
    private stopStartActivityService: StopStartActivityService,
    private store: Store<AppState>,
    private appStateSelectors: AppStateSelectors,
    private projectsActions: ProjectsActions
  ) {
    ipcRenderer.on('win-start-or-stop', (event, message) => {
      if (message.activity) {
        this.stopStartActivityService.startActivity(message.activity, message.project).then(() => {
        })
      } else {
        this.stopStartActivityService.stopActivity(message.project).then(() => {
        })
      }
    });

    ipcRenderer.on('win-rename-activity', (event, message) => {
      if (message) {
        this.stopStartActivityService.nameActivity(message)
      }
    });

    ipcRenderer.on('win-project-selected', (event, message) => {
      if (message) {
        this.store.dispatch(this.projectsActions.updateSelectedProject(message));
      }
    });

    store.select(appStateSelectors.getProjectsArray).subscribe((projects) => {
      ipcRenderer.send('win-projects-ready', projects);
    });

    store.select(appStateSelectors.getSelectedProject).subscribe((selectedProject) => {
      ipcRenderer.send('win-selected-project-ready', selectedProject);
    });

    store.select('currentActivity').subscribe((currentActivity) => {
      ipcRenderer.send('win-currentActivity-ready', currentActivity);
    });

    store.select('user').subscribe((user) => {
      ipcRenderer.send('win-user-ready', user);
    });
  }
}
