import { handleActions } from 'redux-actions';
import {
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  IConfigurableActionDispatcherStateContext,
} from './contexts';

const reducer = handleActions<IConfigurableActionDispatcherStateContext, any>(
  {
  },

  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
