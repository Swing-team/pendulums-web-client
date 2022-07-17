import { Injectable } from "@angular/core";
import { StopStartActivityService } from "../core/services/stop-start-activity.service";
import { Store } from "@ngrx/store";
import { AppState } from "../shared/state/appState";
import { AppStateSelectors } from "../shared/state/app-state.selectors";
import {
  RenameActivityDto,
  StartActivityDto,
  StopActivityDto,
} from "../../../electron-app/src/electron-bridge.interface";
import { IElectronBridge } from "../../../electron-app/src/electron-bridge.interface";
declare global {
  interface Window {
    electronBridge: IElectronBridge;
  }
}

@Injectable()
export class ElectronService {
  constructor(
    private stopStartActivityService: StopStartActivityService,
    private store: Store<AppState>,
    private appStateSelectors: AppStateSelectors
  ) {

    window.electronBridge.onStartActivity((message: StartActivityDto) => {
      this.stopStartActivityService
        .startActivity(message.activity, message.project)
        .then(() => {});
    });

    window.electronBridge.onStopActivity((message: StopActivityDto) => {
      this.stopStartActivityService
        .stopActivity(message.project)
        .then(() => {});
    });

    window.electronBridge.onRenameActivity((message: RenameActivityDto) => {
      this.stopStartActivityService.nameActivity(
        message.taskName,
        message.project
      );
    });

    this.store
      .select(appStateSelectors.getProjectsArray)
      .subscribe((projects) => {
        window.electronBridge.projectsReady(projects);
      });

    this.store
      .select(appStateSelectors.getSelectedProject)
      .subscribe((selectedProject) => {
        window.electronBridge.selectedProjectReady(selectedProject);
      });

    this.store.select("currentActivity").subscribe((currentActivity) => {
      window.electronBridge.currencyActivityReady(currentActivity);
    });

    this.store.select("user").subscribe((user) => {
      window.electronBridge.userReady(user);
    });

    this.store.select("status").subscribe((status) => {
      if (status.updateNeeded) {
        window.electronBridge.updateAvailable();
      }
    });
  }
}
