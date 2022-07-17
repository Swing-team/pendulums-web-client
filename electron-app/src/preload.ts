import { contextBridge, ipcRenderer } from 'electron';
import { Activity } from "../../src/app/shared/state/current-activity/current-activity.model";
import { Project } from "../../src/app/shared/state/project/project.model";
import { User } from "../../src/app/shared/state/user/user.model";
import { RenameActivityDto, StartActivityDto, StopActivityDto } from './electron-bridge.interface';

contextBridge.exposeInMainWorld('electronBridge', {
  projectsReady: (projects: Project[]) => {
    ipcRenderer.send('projects-ready', projects);
  },
  selectedProjectReady: (id: string) => {
    ipcRenderer.send('selected-project-ready', id);
  },
  currencyActivityReady: (currentActivity: Activity) => {
    ipcRenderer.send('currentActivity-ready', currentActivity);
  },
  userReady: (user: User) => {
    ipcRenderer.send('user-ready', user);
  },
  updateAvailable(): void {
    ipcRenderer.send('update-available');
  },
  onStartActivity(callback: (startActivityDto: StartActivityDto) => void): void {
    ipcRenderer.on('start-activity', (e, message) => callback(message));
  },
  onStopActivity(callback: (stopActivityDto: StopActivityDto) => void): void {
    ipcRenderer.on('stop-activity', (e, message) => callback(message));
  },
  onRenameActivity(callback: (renameActivityDto: RenameActivityDto) => void): void {
    ipcRenderer.on('rename-activity', (e, message) => callback(message));
  }
});