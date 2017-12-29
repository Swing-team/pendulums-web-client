import { Status }            from './status.model';
import { StatusActions }     from './status.actions';
import { ActionWithPayload } from '../action-with-payload';

const initialState: Status = {
  netStatus: null,
  isLogin: null,
  stateChanged: false,
};

export default function reducer(state = initialState, action:  ActionWithPayload<any>) {
  switch (action.type) {
    case StatusActions.LOAD_STATUS: {
      return action.payload ? action.payload : state;
    }

    case StatusActions.UPDATE_NET_STATUS: {
      // copied whole of state of status because it may change in future and have more properties
      return Object.assign({}, state , { netStatus: action.payload});
    }

    case StatusActions.UPDATE_STATE_CHANGED: {
      // copied whole of state of status because it may change in future and have more properties
      return Object.assign({}, state , { stateChanged: action.payload});
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
