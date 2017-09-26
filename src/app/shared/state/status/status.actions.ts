import { Injectable } from '@angular/core';
import { Action }     from '@ngrx/store';
import { Status }     from './status.model';

@Injectable()
export class StatusActions {
  static LOAD_STATUS = 'LOAD_STATUS';
  static CLEAR_STATUS = 'CLEAR_STATUS';
  static UPDATE_NET_STATUS = 'UPDATE_NET_STATUS';

  loadStatus(status: Status): Action {
    return {
      type: StatusActions.LOAD_STATUS,
      payload: status
    };
  }

  updateNetStatus(status: boolean): Action {
    return {
      type: StatusActions.UPDATE_NET_STATUS,
      payload: status
    };
  }

  clearStatus(): Action {
    return {
      type: StatusActions.CLEAR_STATUS
    };
  }
}
