import { Injectable } from '@angular/core';
import { StopStartActivityService } from '../core/services/stop-start-activity.service';
import {Store} from '@ngrx/store';
import {AppState} from '../shared/state/appState';
import {AppStateSelectors} from '../shared/state/app-state.selectors';
const { ipcRenderer } = (<any>window).require('electron');

@Injectable()
export class ElectronService {
  constructor(
    private stopStartActivityService: StopStartActivityService,
    private store: Store<AppState>,
    private appStateSelectors: AppStateSelectors,
  ) {
    ipcRenderer.on('startOrStop', (event, message) => {
      if (message) {
        this.stopStartActivityService.startActivity(message.activity, message.project).then(() => {
        })
      } else {
        this.stopStartActivityService.stopActivity().then(() => {
        })
      }
    })

    store.select(appStateSelectors.getProjectsArray).subscribe((projects) => {
      ipcRenderer.send('projects_ready', projects);
    });
  }
}
