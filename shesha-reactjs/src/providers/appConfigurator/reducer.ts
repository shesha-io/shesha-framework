import { APP_CONTEXT_INITIAL_STATE, IAppStateContext } from './contexts';
import { ApplicationMode, ConfigurationItemsViewMode } from './models';
import { AppConfiguratorActionEnums } from './actions';
import { handleActions } from 'redux-actions';

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
    [AppConfiguratorActionEnums.SwitchConfigurationItemsMode]: (
      state: IAppStateContext,
      action: ReduxActions.Action<ConfigurationItemsViewMode>
    ) => {
      const { payload } = action;

      return {
        ...state,
        configurationItemMode: payload,
      };
    },
    [AppConfiguratorActionEnums.ToggleFormInfoBlock]: (
      state: IAppStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formInfoBlockVisible: payload,
      };
    },    
  },

  APP_CONTEXT_INITIAL_STATE
);
