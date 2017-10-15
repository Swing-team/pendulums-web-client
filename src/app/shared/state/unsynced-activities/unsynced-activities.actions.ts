import { Injectable }     from '@angular/core';
import { Action }         from '@ngrx/store';
import { Activity }       from './../current-activity/current-activity.model';

@Injectable()
export class UnsyncedActivityActions {
  static LOAD_UNSYNCED_ACTIVITY = 'LOAD_UNSYNCED_ACTIVITY';
  static CLEAR_UNSYNCED_ACTIVITY = 'CLEAR_UNCYNCED_ACTIVITY';
  static ADD_UNSYNCED_ACTIVITY = 'ADD_UNCYNCED_ACTIVITY';

  loadUnsyncedActivity(activity: Activity): Action {
    return {
      type: UnsyncedActivityActions.LOAD_UNSYNCED_ACTIVITY,
      payload: activity
    };
  }

  clearUnsyncedActivity(): Action {
    return {
      type: UnsyncedActivityActions.CLEAR_UNSYNCED_ACTIVITY
    };
  }

  addUnsyncedActivity(activity: Activity): Action {
    return {
      type: UnsyncedActivityActions.ADD_UNSYNCED_ACTIVITY,
      payload: activity
    };
  }
}
