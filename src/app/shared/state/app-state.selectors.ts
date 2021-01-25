import { createSelector }                             from '@ngrx/store';
import { Injectable }                                 from '@angular/core';
import { AppState }                                   from './appState';
import { ProjectsSelectors }                          from './project/projects.selectors';
import { NotesSelectors }                          from './note/notes.selectors';

/**
 * Because the data structure is defined within the reducer it is optimal to
 * locate our selector functions at this level. If store is to be thought of
 * as a database, and reducers the tables, selectors can be considered the
 * queries into said database. Remember to keep selectors small and
 * focused so they can be combined and composed to fit each particular
 * use-case.
 */

@Injectable()
export class AppStateSelectors {
  constructor(private projectsSelectors: ProjectsSelectors, private notesSelectors: NotesSelectors) { }
  getProjectsState = (state: AppState) => state.projects;
  getNotesState = (state: AppState) => state.notes;
  getUserState = (state: AppState) => state.user;
  // tslint:disable-next-line: member-ordering
  getProjectsArray = createSelector(this.getProjectsState, this.getUserState, this.projectsSelectors.getAllArray);
  // tslint:disable-next-line: member-ordering
  getProjectsArrayWithCustomSort = createSelector(this.getProjectsState, this.getUserState, this.projectsSelectors.getAllArrayWithCustomSort);
  // tslint:disable-next-line: member-ordering
  getSelectedProject = createSelector(this.getProjectsState, this.projectsSelectors.getSelectedProject);
  // tslint:disable-next-line: member-ordering
  getProjectsSortBy = createSelector(this.getProjectsState, this.projectsSelectors.getSortBy);
  // tslint:disable-next-line: member-ordering
  getNotesArray = createSelector(this.getNotesState, this.notesSelectors.getAllArray);
  // tslint:disable-next-line: member-ordering
  getNotesSortBy = createSelector(this.getNotesState, this.notesSelectors.getSortBy);

  getActiveNotesSortedBy = createSelector(this.getNotesState, this.notesSelectors.getActiveNotesSortedBy);
}
