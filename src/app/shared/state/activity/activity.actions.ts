import { Injectable }     from '@angular/core';
import { Action }         from '@ngrx/store';
import { Activity }       from './activity.model';

@Injectable()
export class ActivityActions {
  static LOAD_ACTIVITY = 'LOAD_ACTIVITY';
  static CLEAR_ACTIVITY = 'CLEAR_ACTIVITY';

  loadActivity(activity: Activity): Action {
    return {
      type: ActivityActions.LOAD_ACTIVITY,
      payload: activity
    };
  }

  clearActivity(): Action {
    return {
      type: ActivityActions.CLEAR_ACTIVITY
    };
  }
}
