import { Injectable } from '@angular/core';
import { Action }     from '@ngrx/store';
import { Status }     from './status.model';

@Injectable()
export class StatusActions {
  static LOAD_STATUS = 'LOAD_STATUS';
  static UPDATE_NET_STATUS = 'UPDATE_NET_STATUS';
  static UPDATE_IS_LOGIN  = 'UPDATE_IS_LOGIN ';
  static CLEAR_STATUS = 'CLEAR_STATUS';

  loadStatus(netStatus: Status): Action {
    return {
      type: StatusActions.LOAD_STATUS,
      payload: netStatus
    };
  }

  updateNetStatus(netStatus: boolean): Action {
    return {
      type: StatusActions.UPDATE_NET_STATUS,
      payload: netStatus
    };
  }

  updateIsLogin(isLogin: boolean): Action {
    return {
      type: StatusActions.UPDATE_IS_LOGIN,
      payload: isLogin
    };
  }

  clearStatus(): Action {
    return {
      type: StatusActions.CLEAR_STATUS
    };
  }
}
