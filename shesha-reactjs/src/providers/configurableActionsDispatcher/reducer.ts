import { handleActions } from 'redux-actions';
import {
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  IConfigurableActionDispatcherStateContext,
} from './contexts';
import { ConfigurableComponentActionEnums } from './actions';

const reducer = handleActions<IConfigurableActionDispatcherStateContext, any>(
  {
    [ConfigurableComponentActionEnums.addCaller]: (state: IConfigurableActionDispatcherStateContext, action: ReduxActions.Action<string>) => {
      return { ...state, callers: [...state.callers, action.payload] };
    },

    [ConfigurableComponentActionEnums.removeCaller]: (state: IConfigurableActionDispatcherStateContext, action: ReduxActions.Action<string>) => {
      return { ...state, callers: state.callers.filter((c) => c !== action.payload) };
    },
  },

  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
