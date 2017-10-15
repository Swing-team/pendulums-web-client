import { Injectable }     from '@angular/core';
import { Action }         from '@ngrx/store';
import { Activity }       from './current-activity.model';

@Injectable()
export class CurrentActivityActions {
  static LOAD_CURRENT_ACTIVITY = 'LOAD_CURRENT_ACTIVITY';
  static CLEAR_CURRENT_ACTIVITY = 'CLEAR_ACTIVITY';

  loadCurrentActivity(activity: Activity): Action {
    return {
      type: CurrentActivityActions.LOAD_CURRENT_ACTIVITY,
      payload: activity
    };
  }

  clearCurrentActivity(): Action {
    return {
      type: CurrentActivityActions.CLEAR_CURRENT_ACTIVITY
    };
  }
}
