import { NotesActions }    from './notes.actions';
import { Notes }           from './notes.model';
import { ActionWithPayload }  from '../action-with-payload';
import { values }             from 'lodash';
import { Note } from './Note.model';
import { findIndex }             from 'lodash';


const initialState: Notes = {
  entities: {},
};

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case NotesActions.LOAD_NOTES: {
      return {
        entities: action.payload
      };
    }

    case NotesActions.LOAD_DB_NOTES: {
      let selectedNote = null;
      if (action.payload.selectedNote) {
        selectedNote = action.payload.selectedNote;
      } else if (Object.keys(action.payload.entities).length > 0) {
        selectedNote = Object.keys(action.payload.entities)[0];

      }
      return {
        entities: action.payload.entities,
        selectedNote: selectedNote,
      };
    }

    case NotesActions.ADD_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities[newState.entities.length] = action.payload;
      newState.entities = values<Note>(newState.entities)
      return newState;
    }
    case NotesActions.UPDATE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      const index = findIndex(newState.entities, {id: action.payload.id});
      newState.entities.splice(index, 1, action.payload);
      return newState;
    }
    case NotesActions.REMOVE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      const index = findIndex(newState.entities, {id: action.payload});
      newState.entities.splice(index, 1);
      return newState;
    }

    default: {
      return state;
    }
  }
}
