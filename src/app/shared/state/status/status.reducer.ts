import { Action }         from '@ngrx/store';
import { Status }         from './status.model';
import { StatusActions }  from './status.actions';

const initialState: Status = {
  netStatus: false,
  isLogin: false,
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case StatusActions.LOAD_STATUS: {
      return action.payload ? action.payload : state;
    }

    case StatusActions.UPDATE_NET_STATUS: {
      // copied whole of state of status because it may change in future and have more properties
      return Object.assign({}, state , { netStatus: action.payload});
    }

    case StatusActions.UPDATE_IS_LOGIN: {
      // copied whole of state of status because it may change in future and have more properties
      return Object.assign({}, state , { isLogin: action.payload});
    }

    case StatusActions.CLEAR_STATUS: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
