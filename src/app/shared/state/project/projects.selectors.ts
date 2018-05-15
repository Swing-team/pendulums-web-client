import { createSelector }             from '@ngrx/store';
import { values }                     from 'lodash';
import { Injectable }                 from '@angular/core';
import { Project }                    from './project.model';
import { Projects }                   from './projects.model';

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
  getAllArray = createSelector(this.getEntities, entities => { return values<Project>(entities); });
}
