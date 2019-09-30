import { Injectable }           from '@angular/core';
import { Action }               from '@ngrx/store';
import { ActionWithPayload }    from '../action-with-payload';
import { Theme }                from './theme.model';

@Injectable()
export class ThemeActions {
  static LOAD_THEME = 'LOAD_THEME';
  static CLEAR_THEME = 'CLEAR_THEME';

  loadTheme(theme: Theme): ActionWithPayload<Theme> {
    return {
      type: ThemeActions.LOAD_THEME,
      payload: theme
    };
  }

  clearTheme(): Action {
    return {
      type: ThemeActions.CLEAR_THEME
    };
  }
}
