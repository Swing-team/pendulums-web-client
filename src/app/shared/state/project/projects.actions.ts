import { Injectable } from '@angular/core';
import { Action }     from '@ngrx/store';
import { Projects }   from './projects.model';
import { Project }    from './project.model';

@Injectable()
export class ProjectsActions {
  static LOAD_PROJECTS = 'LOAD_PROJECTS';
  static CLEAR_PROJECTS = 'CLEAR_PROJECTS';
  static ADD_PROJECT = 'ADD_PROJECT';
  static REMOVE_PROJECT = 'REMOVE_PROJECT';

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
}
