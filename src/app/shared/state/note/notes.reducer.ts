import { NotesActions }    from './notes.actions';
import { Notes }           from './notes.model';
import { ActionWithPayload }  from '../action-with-payload';
import { values }             from 'lodash';
import { Note } from './Note.model';

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
      newState.entities[action.payload.id] = action.payload;
      newState.entities = values<Note>(newState.entities)
        .sort((p1, p2) => p1.id > p2.id ? 1 : -1)
        .reduce((entities, note) => {
          entities[note.id] = note;
          return entities;
        }, {});
      if (!newState.selectedNote) {
        newState.selectedNote = Object.keys(newState.entities)[0];
      }
      return newState;
    }
    case NotesActions.UPDATE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities[action.payload.id] = action.payload;
      return newState;
    }
    case NotesActions.REMOVE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState.entities[action.payload];
      if (newState.selectedNote === action.payload) {
        if (Object.keys(newState.entities).length > 0) {
          newState.selectedNote = Object.keys(newState.entities)[0];
        } else {
          newState.selectedNote = null;
        }
      }
      return newState;
    }

    default: {
      return state;
    }
  }
}
