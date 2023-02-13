import {
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  IConfigurableActionDispatcherStateContext,
} from './contexts';
import { handleActions } from 'redux-actions';

const reducer = handleActions<IConfigurableActionDispatcherStateContext, any>(
  {
    /*
    [ConfigurableActionDispatcherActionEnums.ActivateProvider]: (state: IConfigurableActionDispatcherStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        activeProvider: payload,
      };
    },
    */
  },

  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
