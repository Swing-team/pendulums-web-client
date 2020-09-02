import { Theme }                from './theme.model';
import { ThemeActions }         from './theme.actions';
import { ActionWithPayload }    from '../action-with-payload';
import { cloneDeep }            from 'lodash';

const initialState: Theme = {
  isLightTheme: false,
};

export default function reducer(state = initialState, action: ActionWithPayload<any>) {
  switch (action.type) {
    case ThemeActions.LOAD_THEME: {
      const newState = cloneDeep(state);
      newState.isLightTheme = action.payload.isLightTheme;
      return newState;
    }

    case ThemeActions.CLEAR_THEME: {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
