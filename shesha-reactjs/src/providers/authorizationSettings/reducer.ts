import { IAuthorizationSettingsStateContext } from './contexts';
import { AuthorizationSettingsActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';

export function authorizationSettingsReducer(
  incomingState: IAuthorizationSettingsStateContext,
  action: ReduxActions.Action<IAuthorizationSettingsStateContext>
): IAuthorizationSettingsStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case AuthorizationSettingsActionEnums.FetchAuthSettingsRequest:
    case AuthorizationSettingsActionEnums.FetchAuthSettingsSuccess:
    case AuthorizationSettingsActionEnums.FetchAuthSettingsError:
    case AuthorizationSettingsActionEnums.UpdateAuthSettingsRequest:
    case AuthorizationSettingsActionEnums.UpdateAuthSettingsSuccess:
    case AuthorizationSettingsActionEnums.UpdateAuthSettingsError:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    default: {
      return state;
    }
  }
}
