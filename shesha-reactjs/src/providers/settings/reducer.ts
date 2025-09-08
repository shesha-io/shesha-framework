import { SETTINGS_CONTEXT_INITIAL_STATE, ISettingsStateContext, ILoadSettingPayload } from './contexts';
import { handleActions } from 'redux-actions';
import { SettingsActionEnums } from './actions';

const reducer = handleActions<ISettingsStateContext, any>(
  {
    [SettingsActionEnums.LoadSettingRequest]: (
      state: ISettingsStateContext,
      _action: ReduxActions.Action<ILoadSettingPayload>
    ) => {
      // const { payload } = action;

      return {
        ...state,
      };
    },
  },

  SETTINGS_CONTEXT_INITIAL_STATE
);

export default reducer;
