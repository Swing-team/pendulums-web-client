import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {User} from './user.model';

@Injectable()
export class UserActions {
  static LOAD_USER = 'LOAD_USER';
  static CLEAR_USER = 'CLEAR_USER';

  loadUser(user: User): Action {
    return {
      type: UserActions.LOAD_USER,
      payload: user
    };
  }

  clearUser(): Action {
    return {
      type: UserActions.CLEAR_USER
    };
  }
}
