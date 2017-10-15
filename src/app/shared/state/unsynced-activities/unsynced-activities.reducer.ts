import { Action }                   from '@ngrx/store';
import { UnsyncedActivityActions }  from './unsynced-activities.actions';
import { UncyncedActivities }       from './uncynced-activities.model';

const initialState: UncyncedActivities = {
  entities: []
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case UnsyncedActivityActions.LOAD_UNSYNCED_ACTIVITY: {
      return action.payload ? action.payload : state;
    }

    case UnsyncedActivityActions.ADD_UNSYNCED_ACTIVITY: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities.push(action.payload);
      return newState;
    }

    case UnsyncedActivityActions.CLEAR_UNSYNCED_ACTIVITY: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
