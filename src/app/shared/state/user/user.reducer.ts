import { Action } from '@ngrx/store';

import { User } from './user.model';
import { UserActions } from './user.actions';

const initialState: User = {
  id: null,
  email: null,
  name: null,
  profileImage: null
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case UserActions.LOAD_USER: {
      return action.payload;
    }

    case UserActions.CLEAR_USER: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
