import { Activity }               from './current-activity.model';
import { CurrentActivityActions } from './current-activity.actions';
import { ActionWithPayload }      from '../action-with-payload';

const initialState: Activity = {
  id: null,
  name: null,
  startedAt: null,
  stoppedAt: null,
  project: null,
  user: null,
};

export default function reducer(state = initialState, action: ActionWithPayload<Activity>) {
  switch (action.type) {
    case CurrentActivityActions.LOAD_CURRENT_ACTIVITY: {
      return action.payload ? action.payload : state;
    }

    case CurrentActivityActions.CLEAR_CURRENT_ACTIVITY: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
