import { createContext } from 'react';
import { IFlagsSetters, IFlagsState } from '../../interfaces';
import { AuthorizationSettingsDto } from '../../apis/authorizationSettings';

export type IFlagProgressFlags = 'fetchAuthSettings' | 'updateAuthSettings' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'fetchAuthSettings' | 'updateAuthSettings' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'fetchAuthSettings' | 'updateAuthSettings' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface IAuthorizationSettingsStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  settings?: AuthorizationSettingsDto;
  authorizationSettingsPayload?: AuthorizationSettingsDto;
}

export interface IAuthorizationSettingsActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  fetchAuthSettings: () => void;
  updateAuthSettings: (authorizationSettingsPayload?: AuthorizationSettingsDto) => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const AUTHORIZATION_SETTINGS_CONTEXT_INITIAL_STATE: IAuthorizationSettingsStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
};

export const AuthorizationSettingsStateContext = createContext<IAuthorizationSettingsStateContext>(
  AUTHORIZATION_SETTINGS_CONTEXT_INITIAL_STATE
);

export const AuthorizationSettingsActionsContext = createContext<IAuthorizationSettingsActionsContext>(undefined);
