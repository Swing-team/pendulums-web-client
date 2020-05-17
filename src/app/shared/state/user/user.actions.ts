import { Injectable }           from '@angular/core';
import { Action }               from '@ngrx/store';
import { User, Settings }                 from './user.model';
import { ActionWithPayload }    from '../action-with-payload';
import { Project } from '../project/project.model';

@Injectable()
export class UserActions {
  static LOAD_USER = 'LOAD_USER';
  static CLEAR_USER = 'CLEAR_USER';
  static UPDATE_USER_NAME = 'UPDATE_USER_NAME';
  static UPDATE_USER_IMAGE = 'UPDATE_USER_IMAGE';
  static UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS';
  static UPDATE_USER_PENDING_INVITATIONS = 'UPDATE_USER_PENDING_INVITATIONS';

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

  updateUserSettings(userSettings: Settings): ActionWithPayload<any> {
    return {
      type: UserActions.UPDATE_USER_SETTINGS,
      payload: userSettings
    };
  }

  updateUserInvitations(userInvitations: Array<Project>):ActionWithPayload<Array<Project>> {
    return {
      type: UserActions.UPDATE_USER_PENDING_INVITATIONS,
      payload: userInvitations
    };
  }

  clearUser(): Action {
    return {
      type: UserActions.CLEAR_USER
    };
  }
}
