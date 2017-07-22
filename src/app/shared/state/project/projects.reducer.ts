import {Action}           from '@ngrx/store';

import {ProjectsActions}  from './projects.actions';
import {Projects}         from './projects.model';

const initialState: Projects = {
  entities: {}
};

export default function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case ProjectsActions.LOAD_PROJECTS: {
      return {
        entities: action.payload.reduce((entities, project) => {
          entities[project.id] = project;
          return entities;
        }, {})
      };
    }

    case ProjectsActions.CLEAR_PROJECTS: {
      return initialState;
    }

    case ProjectsActions.ADD_PROJECT: {
      /*const projectState = {};
       projectState[action.payload.id] = action.payload;
       return {
       entities: Object.assign({}, state.entities, projectState)
       };*/
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities[action.payload.id] = action.payload;
      return newState;
    }

    case ProjectsActions.REMOVE_PROJECT: {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState.entities[action.payload.id];
      return newState;
    }

    case ProjectsActions.ADD_INVITED_USER: {
      const newState = JSON.parse(JSON.stringify(state));
      const updateProject = newState.entities[action.payload.projectId];
      updateProject.invitedUsers.push(action.payload.invitedUser);
      return newState;
    }
    case ProjectsActions.UPDATE_PROJECT: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities[action.payload.id] = action.payload;
      return newState;
    }
    case ProjectsActions.REMOVE_INVITED_USER: {
      const newState = JSON.parse(JSON.stringify(state));
      let invitedUserIndexToRemove;
      newState.entities[action.payload.projectId].invitedUsers.map((invitedUser, index) => {
        if (invitedUser.email === action.payload.invitedUser.email) {
          invitedUserIndexToRemove = index;
        }
      });
      newState.entities[action.payload.projectId].invitedUsers.splice(invitedUserIndexToRemove, 1);
      return newState;
    }

    default: {
      return state;
    }
  }
}
