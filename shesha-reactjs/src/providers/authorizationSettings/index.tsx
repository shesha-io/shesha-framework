import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { authorizationSettingsReducer } from './reducer';
import {
  AuthorizationSettingsActionsContext,
  AuthorizationSettingsStateContext,
  AUTHORIZATION_SETTINGS_CONTEXT_INITIAL_STATE,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  fetchAuthSettingsRequestAction,
  fetchAuthSettingsSuccessAction,
  fetchAuthSettingsErrorAction,
  updateAuthSettingsRequestAction,
  updateAuthSettingsSuccessAction,
  updateAuthSettingsErrorAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import {
  useAuthorizationSettingsGetSettings,
  useAuthorizationSettingsUpdateSettings,
  AuthorizationSettingsDto,
} from '../../apis/authorizationSettings';
import { IShaHttpResponse } from '../../interfaces/shaHttpResponse';

const AuthorizationSettingsProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(authorizationSettingsReducer, AUTHORIZATION_SETTINGS_CONTEXT_INITIAL_STATE);

  //#region Fetch Auth Settings
  const { loading: isFetchingAuthSettings, data: authorizationSettings } = useAuthorizationSettingsGetSettings({});

  useEffect(() => {
    if (!isFetchingAuthSettings && authorizationSettings) {
      const { result, error } = authorizationSettings;

      if (error) {
        fetchAuthSettingsError();
        return;
      }

      if (result) {
        dispatch(fetchAuthSettingsSuccessAction(result));
      } else {
        fetchAuthSettingsError();
      }
    }
  }, [isFetchingAuthSettings]);

  const fetchAuthSettings = () => {
    dispatch(fetchAuthSettingsRequestAction());
  };
  //#endregion

  //#region Update auth settings
  const { mutate: updateAuthSettingsHttp } = useAuthorizationSettingsUpdateSettings({});

  const fetchAuthSettingsError = () => {
    dispatch(fetchAuthSettingsErrorAction());
  };

  const updateAuthSettings = (payload?: AuthorizationSettingsDto) => {
    dispatch(updateAuthSettingsRequestAction(payload));

    updateAuthSettingsHttp(payload)
      .then(data => {
        const { result } = (data as unknown) as IShaHttpResponse<AuthorizationSettingsDto>;
        console.log('payload :>> ', data);

        if (result) {
          dispatch(updateAuthSettingsSuccessAction(result));
        } else {
          updateAuthSettingsError();
        }
      })
      .catch(error => {
        console.log('error :>> ', error);
        updateAuthSettingsError();
      });
  };

  const updateAuthSettingsError = () => {
    dispatch(updateAuthSettingsErrorAction());
  };
  //#endregion
  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <AuthorizationSettingsStateContext.Provider value={state}>
      <AuthorizationSettingsActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          fetchAuthSettings,
          updateAuthSettings,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </AuthorizationSettingsActionsContext.Provider>
    </AuthorizationSettingsStateContext.Provider>
  );
};

function useAuthorizationSettingsState() {
  const context = useContext(AuthorizationSettingsStateContext);

  if (context === undefined) {
    throw new Error('useAuthorizationSettingsState must be used within a AuthorizationSettingsProvider');
  }

  return context;
}

function useAuthorizationSettingsActions() {
  const context = useContext(AuthorizationSettingsActionsContext);

  if (context === undefined) {
    throw new Error('useAuthorizationSettingsActions must be used within a AuthorizationSettingsProvider');
  }

  return context;
}

function useAuthorizationSettings() {
  return { ...useAuthorizationSettingsState(), ...useAuthorizationSettingsActions() };
}

export default AuthorizationSettingsProvider;

export {
  AuthorizationSettingsProvider,
  useAuthorizationSettingsState,
  useAuthorizationSettingsActions,
  useAuthorizationSettings,
};
