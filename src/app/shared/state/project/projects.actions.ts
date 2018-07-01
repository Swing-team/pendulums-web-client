import { Injectable }         from '@angular/core';
import { Action }             from '@ngrx/store';
import { Projects }           from './projects.model';
import { Project }            from './project.model';
import { Activity }           from '../current-activity/current-activity.model';
import { ActionWithPayload }  from '../action-with-payload';

@Injectable()
export class ProjectsActions {
  static LOAD_PROJECTS = 'LOAD_PROJECTS';
  static LOAD_DB_PROJECTS = 'LOAD_DB_PROJECTS';
  static CLEAR_PROJECTS = 'CLEAR_PROJECTS';
  static ADD_PROJECT = 'ADD_PROJECT';
  static REMOVE_PROJECT = 'REMOVE_PROJECT';
  static ADD_INVITED_USER = 'ADD_INVITED_USER';
  static UPDATE_PROJECT = 'UPDATE_PROJECT';
  static REMOVE_INVITED_USER = 'REMOVE_INVITED_USER';
  static REMOVE_MEMBER = 'REMOVE_MEMBER';
  static CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE';
  static UPDATE_PROJECT_ACTIVITIES = 'UPDATE_PROJECT_ACTIVITIES';
  static ADD_ACTIVITY_TO_PROJECT = 'ADD_ACTIVITY_TO_PROJECT';
  static REMOVE_PROJECT_ACTIVITIES = 'REMOVE_PROJECT_ACTIVITIES';

  loadProjects(projects: Projects):  ActionWithPayload<Projects> {
    return {
      type: ProjectsActions.LOAD_PROJECTS,
      payload: projects
    };
  }

  loadDbProjects(projects: Projects): ActionWithPayload<Projects> {
    return {
      type: ProjectsActions.LOAD_DB_PROJECTS,
      payload: projects
    };
  }

  clearProjects(): Action {
    return {
      type: ProjectsActions.CLEAR_PROJECTS
    };
  }

  addProject(project: Project): ActionWithPayload<Project> {
    return {
      type: ProjectsActions.ADD_PROJECT,
      payload: project
    };
  }

  removeProject(project: Project): ActionWithPayload<Project> {
    return {
      type: ProjectsActions.REMOVE_PROJECT,
      payload: project
    };
  }

  updateProject(project: Project): ActionWithPayload<Project> {
    return {
      type: ProjectsActions.UPDATE_PROJECT,
      payload: project
    };
  }

  addInvitedUser(projectId: String, invitedUser: {email, role}): ActionWithPayload<any> {
    return {
      type: ProjectsActions.ADD_INVITED_USER,
      payload: {
        projectId,
        invitedUser
      }
    };
  }

  removeInvitedUser(projectId: String, invitedUser: {email, role}): ActionWithPayload<any> {
    return {
      type: ProjectsActions.REMOVE_INVITED_USER,
      payload: {
        projectId,
        invitedUser
      }
    };
  }

  removeMember(projectId: String, memberId: String): ActionWithPayload<any> {
    return {
      type: ProjectsActions.REMOVE_MEMBER,
      payload: {
        projectId,
        memberId
      }
    };
  }

  changeMemberRole(projectId: String, userId: String, updatedRole: String) {
    return {
      type: ProjectsActions.CHANGE_MEMBER_ROLE,
      payload: {
        projectId,
        userId,
        updatedRole
      }
    };
  }

  addActivityToProject(projectId: string, activity: Activity): ActionWithPayload<any> {
    return {
      type: ProjectsActions.ADD_ACTIVITY_TO_PROJECT,
      payload: {
        projectId,
        activity: activity
      }
    };
  }

  updateProjectActivities(projectId: string, activity: Activity): ActionWithPayload<any> {
    return {
      type: ProjectsActions.UPDATE_PROJECT_ACTIVITIES,
      payload: {
        projectId,
        activity: activity
      }
    };
  }

  removeProjectActivities(projectId: string): ActionWithPayload<any> {
    return {
      type: ProjectsActions.REMOVE_PROJECT_ACTIVITIES,
      payload: {
        projectId
      }
    };
  }
}
