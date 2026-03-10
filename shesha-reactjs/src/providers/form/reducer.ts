import { handleActions } from 'redux-actions';
import {
  FORM_CONTEXT_INITIAL_STATE,
  IFormStateInternalContext,
} from './contexts';

const reducer = handleActions<IFormStateInternalContext, any>(
  {

  },

  FORM_CONTEXT_INITIAL_STATE,
);

export default reducer;
