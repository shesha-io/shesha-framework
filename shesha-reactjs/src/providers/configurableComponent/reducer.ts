import {
  IConfigurableComponentStateContext,
  IComponentLoadPayload,
  IComponentLoadErrorPayload,
  IComponentLoadSuccessPayload,
  IComponentSaveErrorPayload,
  IComponentSaveSuccessPayload,
  IComponentSavePayload,
} from './contexts';
import { ConfigurableComponentActionEnums } from './actions';
import { handleActions, ReduxCompatibleReducer } from 'redux-actions';

const reducerFactory = <TSettings extends any>(
  initialState: IConfigurableComponentStateContext<TSettings>
): ReduxCompatibleReducer<IConfigurableComponentStateContext<TSettings>, any> =>
  handleActions<IConfigurableComponentStateContext<TSettings>, any>(
    {
      [ConfigurableComponentActionEnums.LoadRequest]: (
        state: IConfigurableComponentStateContext<TSettings>,
        _action: ReduxActions.Action<IComponentLoadPayload>
      ) => {

        return {
          ...state,
          isInProgress: { ...state.isInProgress, loading: true },
        };
      },

      [ConfigurableComponentActionEnums.LoadSuccess]: (
        state: IConfigurableComponentStateContext<TSettings>,
        action: ReduxActions.Action<IComponentLoadSuccessPayload>
      ) => {
        const { payload } = action;

        const settings = payload?.settings as TSettings;

        const typedPayload = { ...payload, settings };

        return {
          ...state,
          ...typedPayload,
          isInProgress: { ...state.isInProgress, loading: false },
          error: { ...state.error, loading: null },
        };
      },

      [ConfigurableComponentActionEnums.LoadError]: (
        state: IConfigurableComponentStateContext<TSettings>,
        action: ReduxActions.Action<IComponentLoadErrorPayload>
      ) => {
        const { payload } = action;

        return {
          ...state,
          isInProgress: { ...state.isInProgress, loading: false },
          error: { ...state.error, loading: payload.error },
        };
      },

      [ConfigurableComponentActionEnums.SaveRequest]: (
        state: IConfigurableComponentStateContext<TSettings>,
        _action: ReduxActions.Action<IComponentSavePayload>
      ) => {
        return {
          ...state,
          isInProgress: { ...state.isInProgress, save: true },
          error: { ...state.error, save: null },
        };
      },

      [ConfigurableComponentActionEnums.SaveSuccess]: (
        state: IConfigurableComponentStateContext<TSettings>,
        action: ReduxActions.Action<IComponentSaveSuccessPayload>
      ) => {
        const { payload } = action;

        const settings = payload.settings as TSettings;
        
        return {
          ...state,
          settings,
          isInProgress: { ...state.isInProgress, save: false },
          error: { ...state.error, save: null },
        };
      },

      [ConfigurableComponentActionEnums.SaveError]: (
        state: IConfigurableComponentStateContext<TSettings>,
        action: ReduxActions.Action<IComponentSaveErrorPayload>
      ) => {
        const { payload } = action;

        return {
          ...state,
          isInProgress: { ...state.isInProgress, save: false },
          error: { ...state.error, save: payload.error },
        };
      },
    },
    initialState
  );

export default reducerFactory;
