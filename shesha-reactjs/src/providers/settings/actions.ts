import { createAction } from 'redux-actions';
import { ILoadSettingPayload } from './contexts';

export enum SettingsActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  LoadSettingRequest = 'LOAD_SETTING_REQUEST',
  LoadSettingSuccess = 'LOAD_SETTING_SUCCESS',
  LoadSettingFailed = 'LOAD_SETTING_FAILED',
  // SetMetadata = 'SET_METADATA',
}

/* NEW_ACTION_GOES_HERE */

export const loadSettingAction = createAction<ILoadSettingPayload, ILoadSettingPayload>(
  SettingsActionEnums.LoadSettingRequest,
  (p) => p,
);
