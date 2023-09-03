import { handleActions } from 'redux-actions';
import { IToolboxComponentGroup } from '../../interfaces';
import IRequestHeaders from '../../interfaces/requestHeaders';
import { SheshaApplicationActionEnums } from './actions';
import { ISheshaApplicationStateContext, SHESHA_APPLICATION_CONTEXT_INITIAL_STATE } from './contexts';
import { FRONT_END_APP_HEADER_NAME } from './models';

export default handleActions<ISheshaApplicationStateContext, any>(
  {
    [SheshaApplicationActionEnums.SetRequestHeaders]: (
      state: ISheshaApplicationStateContext,
      action: ReduxActions.Action<IRequestHeaders>
    ) => {
      const { payload } = action;
      const { httpHeaders } = state;

      const newHeaders = { ...httpHeaders, ...payload };
      if (state.applicationKey) newHeaders[FRONT_END_APP_HEADER_NAME] = state.applicationKey;

      return {
        ...state,
        httpHeaders: newHeaders,
      };
    },

    [SheshaApplicationActionEnums.SetBackendUrl]: (
      state: ISheshaApplicationStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        backendUrl: payload,
      };
    },
    [SheshaApplicationActionEnums.SetGlobalVariables]: (
      state: ISheshaApplicationStateContext,
      action: ReduxActions.Action<{ [x: string]: any }>
    ) => {
      const { payload } = action;

      return {
        ...state,
        globalVariables: { ...(state.globalVariables || {}), ...payload },
      };
    },
    [SheshaApplicationActionEnums.UpdateToolboxComponentGroups]: (
      state: ISheshaApplicationStateContext,
      action: ReduxActions.Action<IToolboxComponentGroup[]>
    ) => {
      const { payload } = action;

      return {
        ...state,
        toolboxComponentGroups: payload,
      };
    },
  },

  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE
);
