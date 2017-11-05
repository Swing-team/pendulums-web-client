import { UnSyncedActivityActions }  from './unsynced-activities.actions';
import { UnSyncedActivities }       from './unsynced-activities.model';
import { ActionWithPayload }        from '../action-with-payload';

const initialState: UnSyncedActivities = {
  entities: []
};

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case UnSyncedActivityActions.LOAD_UNSYNCED_ACTIVITY: {
      return action.payload ? action.payload : state;
    }

    case UnSyncedActivityActions.ADD_UNSYNCED_ACTIVITY: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities.push(action.payload);
      return newState;
    }

    case UnSyncedActivityActions.CLEAR_UNSYNCED_ACTIVITY: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
