import { Injectable } from '@angular/core';
import { Action }     from '@ngrx/store';
import { Projects }   from './projects.model';
import { Project }    from './project.model';
import {Activity}     from '../activity/activity.model';
import {User}         from '../user/user.model';

@Injectable()
export class ProjectsActions {
  static LOAD_PROJECTS = 'LOAD_PROJECTS';
  static CLEAR_PROJECTS = 'CLEAR_PROJECTS';
  static ADD_PROJECT = 'ADD_PROJECT';
  static REMOVE_PROJECT = 'REMOVE_PROJECT';
  static ADD_INVITED_USER = 'ADD_INVITED_USER';
  static UPDATE_PROJECT = 'UPDATE_PROJECT';
  static REMOVE_INVITED_USER = 'REMOVE_INVITED_USER';
  static REMOVE_MEMBER = 'REMOVE_MEMBER';
  static CHANGE_MEMBER_ROLE = 'CHANGE_MEMBER_ROLE';
  static UPDATE_PROJECT_ACTIVITIES = 'UPDATE_PROJECT_ACTIVITIES';

  loadProjects(projects: Projects): Action {
    return {
      type: ProjectsActions.LOAD_PROJECTS,
      payload: projects
    };
  }

  clearProjects(): Action {
    return {
      type: ProjectsActions.CLEAR_PROJECTS
    };
  }

  addProject(project: Project): Action {
    return {
      type: ProjectsActions.ADD_PROJECT,
      payload: project
    };
  }

  removeProject(project: Project): Action {
    return {
      type: ProjectsActions.REMOVE_PROJECT,
      payload: project
    };
  }

  updateProject(project: Project): Action {
    return {
      type: ProjectsActions.UPDATE_PROJECT,
      payload: project
    };
  }

  addInvitedUser(projectId: String, invitedUser: {email, role}): Action {
    return {
      type: ProjectsActions.ADD_INVITED_USER,
      payload: {
        projectId,
        invitedUser
      }
    };
  }

  removeInvitedUser(projectId: String, invitedUser: {email, role}): Action {
    return {
      type: ProjectsActions.REMOVE_INVITED_USER,
      payload: {
        projectId,
        invitedUser
      }
    };
  }

  removeMember(projectId: String, memberId: String): Action {
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

  updateProjectActivity(projectId: string, activity: Activity): Action {
    return {
      type: ProjectsActions.UPDATE_PROJECT_ACTIVITIES,
      payload: {
        projectId,
        activity
      }
    };
  }
}
