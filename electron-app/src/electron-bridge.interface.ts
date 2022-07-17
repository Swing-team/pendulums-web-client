import { Activity } from "../../src/app/shared/state/current-activity/current-activity.model";
import { Project } from "../../src/app/shared/state/project/project.model";
import { User } from "../../src/app/shared/state/user/user.model";

export class StartActivityDto {
  activity: Activity;
  project: Project;
}
export class StopActivityDto {
  project: Project;
}
export class RenameActivityDto {
  taskName: string;
  project: Project;
}

export interface IElectronBridge {
  projectsReady(projects: Project[]): void;
  selectedProjectReady(id: string): void;
  currencyActivityReady(currentActivity: Activity): void;
  userReady(user: User): void;
  updateAvailable(): void;
  onStartActivity(callback: (startActivityDto: StartActivityDto) => void): void;
  onStopActivity(callback: (stopActivityDto: StopActivityDto ) => void): void;
  onRenameActivity(callback: (renameActivityDto: RenameActivityDto) => void): void;
}
