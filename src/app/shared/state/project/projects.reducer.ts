import { ProjectsActions }    from './projects.actions';
import { Projects }           from './projects.model';
import { ActionWithPayload }  from '../action-with-payload';
import { values }             from 'lodash';
import { Project } from './project.model';

const initialState: Projects = {
  entities: {},
  selectedProject: null
};

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case ProjectsActions.LOAD_PROJECTS: {
      let selectedProject = null;
      if (state.selectedProject) {
        selectedProject = state.selectedProject;
      } else if (action.payload.length > 0) {
        selectedProject = action.payload[0].id
      }
      return {
        selectedProject: selectedProject ,
        entities: action.payload.reduce((entities, project) => {
          entities[project.id] = project;
          return entities;
        }, {})
      };
    }

    case ProjectsActions.LOAD_DB_PROJECTS: {
      let selectedProject = null;
      if (action.payload.selectedProject) {
        selectedProject = action.payload.selectedProject;
      } else if (Object.keys(action.payload.entities).length > 0) {
         selectedProject = Object.keys(action.payload.entities)[0];

      }
      return {
        entities: action.payload.entities,
        selectedProject: selectedProject,
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
      newState.entities = values<Project>(newState.entities)
        .sort((p1, p2) => p1.id > p2.id ? 1 : -1)
        .reduce((entities, project) => {
          entities[project.id] = project;
          return entities;
        }, {});
      if (!newState.selectedProject) {
        newState.selectedProject = Object.keys(newState.entities)[0];
      }
      return newState;
    }

    case ProjectsActions.REMOVE_PROJECT: {
      const newState = JSON.parse(JSON.stringify(state));
      delete newState.entities[action.payload];
      if (newState.selectedProject === action.payload) {
        if (Object.keys(newState.entities).length > 0) {
          newState.selectedProject = Object.keys(newState.entities)[0];
        } else {
          newState.selectedProject = null;
        }
      }
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

    case ProjectsActions.UPDATE_SELECTED_PROJECT: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.selectedProject = action.payload;
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

    case ProjectsActions.REMOVE_MEMBER: {
      const newState = JSON.parse(JSON.stringify(state));
      let removedMemberIndex;
      newState.entities[action.payload.projectId].teamMembers.map((member, index) => {
        if (member.id === action.payload.memberId) {
          removedMemberIndex = index;
        }
      });
      newState.entities[action.payload.projectId].teamMembers.splice(removedMemberIndex, 1);
      return newState;
    }

    case ProjectsActions.CHANGE_MEMBER_ROLE: {
      const newState = JSON.parse(JSON.stringify(state));
      const updatedProject = newState.entities[action.payload.projectId];
      if (action.payload.updatedRole === 'admin') {
        // This means that a team-member becomes an admin.
        updatedProject.teamMembers.map(member => {
          if (member.id === action.payload.userId) {
            if (updatedProject.admins) {
              updatedProject.admins.push(member);
            } else {
              updatedProject.admins = [];
              updatedProject.admins.push(member);
            }
          }
        });
      } else {
        // This means that an admin becomes a team-member.
        let updatedMemberIndex = null;
        updatedProject.admins.map((admin, index) => {
          if (admin.id === action.payload.userId) {
            updatedMemberIndex = index;
          }
        });
        if (updatedMemberIndex !== null) {
          updatedProject.admins.splice(updatedMemberIndex, 1);
        }
      }

      return newState;
    }

    case ProjectsActions.ADD_ACTIVITY_TO_PROJECT: {
      const newState = JSON.parse(JSON.stringify(state));
      newState.entities[action.payload.projectId].activities.map((activity, index) => {
        if (activity.user === action.payload.activity.user && activity.startedAt === action.payload.activity.startedAt) {
          newState.entities[action.payload.projectId].activities.splice(index, 1);
        }
      });
      newState.entities[action.payload.projectId].activities.unshift(action.payload.activity);

      newState.entities[action.payload.projectId].recentActivityName = action.payload.activity.name;
      return newState;
    }

    case ProjectsActions.UPDATE_PROJECT_ACTIVITIES: {
      const newState = JSON.parse(JSON.stringify(state));

      const dueActivities = [];
      const doneActivities = [];
      const noActivities = [];

      newState.entities[action.payload.projectId].activities.map((activity) => {
        if (activity.user !== action.payload.activity.user) {
          if (activity.stoppedAt) {
            doneActivities.push(activity);
          } else if (activity.startedAt) {
            dueActivities.push(activity);
          } else {
            noActivities.push(activity);
          }
        }
      });

      if (action.payload.activity.stoppedAt) {
        doneActivities.unshift(action.payload.activity);
      } else {
        dueActivities.unshift(action.payload.activity);
      }
      newState.entities[action.payload.projectId].activities = (dueActivities.concat(doneActivities)).concat(noActivities);

      newState.entities[action.payload.projectId].recentActivityName = action.payload.activity.name;
      return newState;
    }

    case ProjectsActions.REMOVE_PROJECT_ACTIVITIES: {
      const newState = JSON.parse(JSON.stringify(state));

      newState.entities[action.payload.projectId].activities = [];

      newState.entities[action.payload.projectId].recentActivityName = null;
      return newState;
    }

    default: {
      return state;
    }
  }
}
