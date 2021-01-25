import { values } from 'lodash';
import { Injectable } from '@angular/core';
import { Project } from './project.model';
import { Projects } from './projects.model';
import { User } from '../user/user.model';

/**
 *  Because the data structure is defined within the reducer it is optimal to
 *  locate our selector functions at this level. If store is to be thought of
 *  as a database, and reducers the tables, selectors can be considered the
 *  queries into said database. Remember to keep selectors small and
 *  focused so they can be combined and composed to fit each particular
 *  use-case.
 */

@Injectable()
export class ProjectsSelectors {
  getEntities = (state: Projects) => state.entities;
  getSelectedProject = (state: Projects) => state.selectedProject;
  getSortBy = (state: Projects) => state.sortBy;
  // tslint:disable-next-line: member-ordering
  getAllArray = (projects: Projects, user: User) => this.getAllArrayWithCustomSort(projects, user, projects.sortBy);
  // tslint:disable-next-line: member-ordering
  getAllArrayWithCustomSort = (projects: Projects, user: User, sortBy: string) => {
    return values<Project>(projects.entities).sort((p1, p2) => {
      switch (sortBy) {
        case '+date': {
          return p1.id > p2.id ? 1 : -1;
        }
        case '-date': {
          return p1.id < p2.id ? 1 : -1;
        }
        case '+name': {
          return p1.name.toLowerCase() >= p2.name.toLowerCase() ? 1 : -1;
        }
        case '-name': {
          return p1.name.toLowerCase() < p2.name.toLowerCase() ? 1 : -1;
        }
        case '+activity': {
          const a1 = p1.activities.find(a => a.user === user.id);
          const a2 = p2.activities.find(a => a.user === user.id);
          if (!a1) {
            return -1;
          }
          if (!a2) {
            return 1;
          }
          if (!a1.stoppedAt) {
            return 1;
          }
          if (!a2.stoppedAt) {
            return -1;
          }
          return a1.stoppedAt >= a2.stoppedAt ? 1 : -1;
        }
        case '-activity': {
          const a1 = p1.activities.find(a => a.user === user.id);
          const a2 = p2.activities.find(a => a.user === user.id);
          if (!a1) {
            return 1;
          }
          if (!a2) {
            return -1;
          }
          if (!a1.stoppedAt) {
            return -1;
          }
          if (!a2.stoppedAt) {
            return 1;
          }
          return a1.stoppedAt < a2.stoppedAt ? 1 : -1;
        }
      }
    });
  };
}
