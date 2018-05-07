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

    case UnSyncedActivityActions.REMOVE_UNSYNCED_ACTIVITY_BY_FIELDS: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities.map((unSyncedData , index) => {
        if (unSyncedData.startedAt === action.payload.startedAt &&
            unSyncedData.stoppedAt === action.payload.stoppedAt &&
            unSyncedData.name === action.payload.name  &&
            unSyncedData.project === action.payload.project &&
            unSyncedData.user === action.payload.user) {
          newState.entities.splice(index, 1);
        }
      });
      return newState;
    }

    default: {
      return state;
    }
  }
}
