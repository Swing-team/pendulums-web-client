import { Injectable }           from '@angular/core';
import { Action }               from '@ngrx/store';
import { User }                 from './user.model';
import { ActionWithPayload }    from '../action-with-payload';

@Injectable()
export class UserActions {
  static LOAD_USER = 'LOAD_USER';
  static CLEAR_USER = 'CLEAR_USER';
  static UPDATE_USER_NAME = 'UPDATE_USER_NAME';
  static UPDATE_USER_IMAGE = 'UPDATE_USER_IMAGE';
  static UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS';

  loadUser(user: User): ActionWithPayload<User> {
    return {
      type: UserActions.LOAD_USER,
      payload: user
    };
  }

  updateUserName(userName: string): ActionWithPayload<string> {
    return {
      type: UserActions.UPDATE_USER_NAME,
      payload: userName
    };
  }

  updateUserImage(userImage: string): ActionWithPayload<string> {
    return {
      type: UserActions.UPDATE_USER_IMAGE,
      payload: userImage
    };
  }

  updateUserSettings(userSettings: object): ActionWithPayload<any> {
    return {
      type: UserActions.UPDATE_USER_SETTINGS,
      payload: userSettings
    };
  }

  clearUser(): Action {
    return {
      type: UserActions.CLEAR_USER
    };
  }
}
