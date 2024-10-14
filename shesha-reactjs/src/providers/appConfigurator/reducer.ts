import { handleActions } from 'redux-actions';
import { AppConfiguratorActionEnums } from './actions';
import { APP_CONTEXT_INITIAL_STATE, IAppStateContext } from './contexts';
import { ApplicationMode } from './models';

export default handleActions<IAppStateContext, any>(
  {
    [AppConfiguratorActionEnums.SwitchMode]: (
      state: IAppStateContext,
      action: ReduxActions.Action<ApplicationMode>
    ) => {
      const { payload } = action;

      return {
        ...state,
        mode: payload,
        editModeConfirmationVisible: false,
        closeEditModeConfirmationVisible: false,
      };
    },
    [AppConfiguratorActionEnums.ToggleEditModeConfirmation]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        editModeConfirmationVisible: payload,
        closeEditModeConfirmationVisible: !payload,
      };
    },
    [AppConfiguratorActionEnums.ToggleCloseEditModeConfirmation]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        closeEditModeConfirmationVisible: payload,
        editModeConfirmationVisible: !payload,
      };
    },
  },

  APP_CONTEXT_INITIAL_STATE
);
