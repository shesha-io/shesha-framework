import { createAction } from 'redux-actions';
import { AuthorizationSettingsDto } from '../../apis/authorizationSettings';
import { IAuthorizationSettingsStateContext } from './contexts';

export enum AuthorizationSettingsActionEnums {
  FetchAuthSettingsRequest = 'FETCH_AUTH_SETTINGS_REQUEST',
  FetchAuthSettingsSuccess = 'FETCH_AUTH_SETTINGS_SUCCESS',
  FetchAuthSettingsError = 'FETCH_AUTH_SETTINGS_ERROR',
  UpdateAuthSettingsRequest = 'UPDATE_AUTH_SETTINGS_REQUEST',
  UpdateAuthSettingsSuccess = 'UPDATE_AUTH_SETTINGS_SUCCESS',
  UpdateAuthSettingsError = 'UPDATE_AUTH_SETTINGS_ERROR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const fetchAuthSettingsRequestAction = createAction<IAuthorizationSettingsStateContext>(
  AuthorizationSettingsActionEnums.FetchAuthSettingsRequest,
  () => ({})
);

export const fetchAuthSettingsSuccessAction = createAction<
  IAuthorizationSettingsStateContext,
  AuthorizationSettingsDto
>(AuthorizationSettingsActionEnums.FetchAuthSettingsSuccess, settings => ({
  settings,
}));

export const fetchAuthSettingsErrorAction = createAction<IAuthorizationSettingsStateContext>(
  AuthorizationSettingsActionEnums.FetchAuthSettingsError,
  () => ({})
);

export const updateAuthSettingsRequestAction = createAction<
  IAuthorizationSettingsStateContext,
  AuthorizationSettingsDto
>(AuthorizationSettingsActionEnums.UpdateAuthSettingsRequest, authorizationSettingsPayload => ({
  authorizationSettingsPayload,
}));

export const updateAuthSettingsSuccessAction = createAction<
  IAuthorizationSettingsStateContext,
  AuthorizationSettingsDto
>(AuthorizationSettingsActionEnums.UpdateAuthSettingsSuccess, settings => ({
  settings,
}));

export const updateAuthSettingsErrorAction = createAction<IAuthorizationSettingsStateContext>(
  AuthorizationSettingsActionEnums.UpdateAuthSettingsError,
  () => ({})
);
/* NEW_ACTION_GOES_HERE */
