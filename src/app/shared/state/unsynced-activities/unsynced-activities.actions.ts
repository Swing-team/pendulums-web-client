import { Injectable }     from '@angular/core';
import { Action }         from '@ngrx/store';
import { Activity }       from './../current-activity/current-activity.model';

@Injectable()
export class UnSyncedActivityActions {
  static LOAD_UNSYNCED_ACTIVITY = 'LOAD_UNSYNCED_ACTIVITY';
  static CLEAR_UNSYNCED_ACTIVITY = 'CLEAR_UNSYNCED_ACTIVITY';
  static ADD_UNSYNCED_ACTIVITY = 'ADD_UNSYNCED_ACTIVITY';

  loadUnSyncedActivity(activity: Activity): Action {
    return {
      type: UnSyncedActivityActions.LOAD_UNSYNCED_ACTIVITY,
      payload: activity
    };
  }

  clearUnSyncedActivity(): Action {
    return {
      type: UnSyncedActivityActions.CLEAR_UNSYNCED_ACTIVITY
    };
  }

  addUnSyncedActivity(activity: Activity): Action {
    return {
      type: UnSyncedActivityActions.ADD_UNSYNCED_ACTIVITY,
      payload: activity
    };
  }
}
