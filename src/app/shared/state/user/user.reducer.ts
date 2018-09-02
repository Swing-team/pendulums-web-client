import { User }                 from './user.model';
import { UserActions }          from './user.actions';
import { ActionWithPayload }    from '../action-with-payload';

const initialState: User = {
  id: null,
  email: null,
  name: null,
  profileImage: null,
  pendingInvitations: [],
  settings: {
    receiveForgottenActivityEmail: null,
    relaxationTime: {
      isEnabled: null,
      workTime: 0,
      restTime: 0
    }
  }
};

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case UserActions.LOAD_USER: {
      return action.payload;
    }

    case UserActions.UPDATE_USER_NAME: {
      return Object.assign({}, state , { name: action.payload});
    }

    case UserActions.UPDATE_USER_IMAGE: {
      return Object.assign({}, state , { profileImage: action.payload});
    }

    case UserActions.UPDATE_USER_SETTINGS: {
      return Object.assign({}, state, {settings: action.payload});
    }

    case UserActions.CLEAR_USER: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
