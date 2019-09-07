import { NotesActions }    from './notes.actions';
import { Notes }           from './notes.model';
import { ActionWithPayload }  from '../action-with-payload';
import { values }             from 'lodash';
import { Note } from './note.model';
import { findIndex, reduce }             from 'lodash';
import  showdown from 'showdown';

const initialState: Notes = {
  entities: {},
  sortBy: '+date'
};

const taskListEnablerExtension = function() {
  return [{
      type: 'output',
      regex: /<input type="checkbox" disabled(="")?/g,
      replace: '<input type="checkbox"'
  }];
};

const converter = new showdown.Converter({
  tasklists: true,
  parseImgDimensions: true,
  openLinksInNewWindow: true,
  strikethrough: true,
  extensions: [taskListEnablerExtension]
});

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case NotesActions.LOAD_NOTES: {
      reduce(action.payload, function (result, note) {
        note.content = converter.makeHtml(note.content)
        return action.payload;
      }, {});
      return {
        entities: action.payload,
        sortBy: state.sortBy ? state.sortBy : '+date'
      };
    }

    case NotesActions.LOAD_DB_NOTES: {
      return {
        entities: action.payload.entities,
        sortBy: action.payload.sortBy ? action.payload.sortBy : '+date'
      };
    }

    case NotesActions.ADD_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      action.payload.content = converter.makeHtml(action.payload.content)
      newState.entities[newState.entities.length] = action.payload;
      newState.entities = values<Note>(newState.entities)
      return newState;
    }

    case NotesActions.UPDATE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      const index = findIndex(newState.entities, {id: action.payload.id});
      action.payload.content = converter.makeHtml(action.payload.content)
      newState.entities.splice(index, 1, action.payload);
      return newState;
    }

    case NotesActions.REMOVE_NOTE: {
      const newState = JSON.parse(JSON.stringify(state));
      const index = findIndex(newState.entities, {id: action.payload});
      newState.entities.splice(index, 1);
      return newState;
    }

    case NotesActions.UPDATE_NOTES_SORT_BY: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.sortBy = action.payload;
      return newState;
    }

    default: {
      return state;
    }
  }
}
