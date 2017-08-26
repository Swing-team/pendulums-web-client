import { Action } from '@ngrx/store';
import {Activity} from './activity.model';
import {ActivityActions} from './activity.actions';

const initialState: Activity = {
  id: null,
  name: null,
  startedAt: null,
  stoppedAt: null,
  project: null,
  user: null,
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case ActivityActions.LOAD_ACTIVITY: {
      return action.payload ? action.payload : state;
    }

    case ActivityActions.CLEAR_ACTIVITY: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
