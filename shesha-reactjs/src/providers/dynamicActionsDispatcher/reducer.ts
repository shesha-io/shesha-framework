import {
  DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
  IDynamicActionsDispatcherStateContext,
} from './contexts';
import { DynamicActionsDispatcherActionEnums } from './actions';
import { handleActions } from 'redux-actions';

const reducer = handleActions<IDynamicActionsDispatcherStateContext, any>(
  {
    [DynamicActionsDispatcherActionEnums.ActivateProvider]: (state: IDynamicActionsDispatcherStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        activeProvider: payload,
      };
    },
  },

  DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
);

export default reducer;
