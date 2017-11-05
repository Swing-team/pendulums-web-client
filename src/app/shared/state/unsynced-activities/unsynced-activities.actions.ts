import { Injectable }         from '@angular/core';
import { Action }             from '@ngrx/store';
import { Activity }           from './../current-activity/current-activity.model';
import { ActionWithPayload }  from '../action-with-payload';
import { UnSyncedActivities } from './unsynced-activities.model';

@Injectable()
export class UnSyncedActivityActions {
  static LOAD_UNSYNCED_ACTIVITY = 'LOAD_UNSYNCED_ACTIVITY';
  static CLEAR_UNSYNCED_ACTIVITY = 'CLEAR_UNSYNCED_ACTIVITY';
  static ADD_UNSYNCED_ACTIVITY = 'ADD_UNSYNCED_ACTIVITY';

  loadUnSyncedActivity(unSyncedActivities: UnSyncedActivities): ActionWithPayload<UnSyncedActivities> {
    return {
      type: UnSyncedActivityActions.LOAD_UNSYNCED_ACTIVITY,
      payload: unSyncedActivities
    };
  }

  clearUnSyncedActivity(): Action {
    return {
      type: UnSyncedActivityActions.CLEAR_UNSYNCED_ACTIVITY
    };
  }

  addUnSyncedActivity(activity: Activity): ActionWithPayload<Activity> {
    return {
      type: UnSyncedActivityActions.ADD_UNSYNCED_ACTIVITY,
      payload: activity
    };
  }
}
