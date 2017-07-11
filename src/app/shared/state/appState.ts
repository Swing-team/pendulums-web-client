import '@ngrx/core/add/operator/select';
import {compose} from '@ngrx/core/compose';
// import {storeLogger} from 'ngrx-store-logger';
import { combineReducers } from '@ngrx/store';

import userReducer from './user/user.reducer';
import projectsReducer from './project/projects.reducer';
import {User} from './user/user.model';
import {Projects} from './project/projects.model';

export interface AppState {
  user: User;
  projects: Projects;
}

// uncomment the storeLogger import and this line
// and comment out the other export default line to turn on
// the store logger to see the actions as they flow through the store
// turned this off by default as i found the logger kinda noisy

// export default compose(storeLogger(), combineReducers)({

export default compose(combineReducers)({
  user: userReducer,
  projects: projectsReducer
});
