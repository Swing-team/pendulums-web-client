import { Activity } from "app/shared/state/current-activity/current-activity.model";
import { Project } from "app/shared/state/project/project.model";

export interface RecentActivityWithMeta {
  activity: Activity;
  project: Project;
  humanReadableFrom?: string;
  humanReadableTo?: string;
  humanReadableDuration?: string;
}
