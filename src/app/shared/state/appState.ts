import {ActionReducerMap} from '@ngrx/store';
import {InjectionToken} from '@angular/core';

import userReducer                 from './user/user.reducer';
import projectsReducer             from './project/projects.reducer';
import activityReducer             from './current-activity/current-activity.reducer';
import statusReducer               from './status/status.reducer';
import unSyncedActivitiesReducer   from './unsynced-activities/unsynced-activities.reducer';
import { User }                    from './user/user.model';
import { Projects }                from './project/projects.model';
import { Activity }                from './current-activity/current-activity.model';
import { Status }                  from './status/status.model';
import { UnSyncedActivities }      from './unsynced-activities/unsynced-activities.model';

export interface AppState {
  user: User;
  projects: Projects;
  currentActivity: Activity;
  unSyncedActivity: UnSyncedActivities;
  status: Status;
}

// uncomment the storeLogger import and this line
// and comment out the other export default line to turn on
// the store logger to see the actions as they flow through the store
// turned this off by default as i found the logger kinda noisy

// export default compose(storeLogger(), combineReducers)({

export const reducerToken = new InjectionToken<ActionReducerMap<AppState>>('Registered Reducers');

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
  projects: projectsReducer,
  currentActivity: activityReducer,
  unSyncedActivity: unSyncedActivitiesReducer,
  status: statusReducer
};
