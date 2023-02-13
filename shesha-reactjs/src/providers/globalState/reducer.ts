import {
  GLOBAL_STATE_CONTEXT_INITIAL_STATE,
  IGlobalStateStateContext,
  ISetPubSubPayload,
  ISetStatePayload,
} from './contexts';
import { GlobalStateActionEnums } from './actions';
import { handleActions } from 'redux-actions';

const reducer = handleActions<IGlobalStateStateContext, any>(
  {
    [GlobalStateActionEnums.SetState]: (
      state: IGlobalStateStateContext,
      action: ReduxActions.Action<ISetStatePayload>
    ): IGlobalStateStateContext => {
      const { payload } = action;
      const { globalState } = state;

      const { data, key } = payload;

      const incomingGlobalState = { ...(globalState || {}) };

      incomingGlobalState[key] = data;

      return {
        ...state,
        globalState: incomingGlobalState,
      };
    },
    [GlobalStateActionEnums.ClearState]: (
      state: IGlobalStateStateContext,
      action: ReduxActions.Action<string>
    ): IGlobalStateStateContext => {
      const { payload } = action;
      const { globalState } = state;

      const clonedState = { ...(globalState || {}) };
      delete clonedState[payload];

      return {
        ...state,
        globalState: clonedState,
      };
    },
    [GlobalStateActionEnums.SetPubSub]: (
      state: IGlobalStateStateContext,
      action: ReduxActions.Action<ISetPubSubPayload>
    ): IGlobalStateStateContext => {
      const { payload } = action;

      return {
        ...state,
        ...payload,
      };
    },
  },
  GLOBAL_STATE_CONTEXT_INITIAL_STATE
);

export default reducer;
