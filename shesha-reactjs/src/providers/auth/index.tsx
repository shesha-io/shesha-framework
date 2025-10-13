import React, { FC, MutableRefObject, PropsWithChildren, useContext } from 'react';
import { URL_HOME_PAGE, URL_LOGIN_PAGE } from '@/shesha-constants';
import { useShaRouting } from '@/providers/shaRouting';
import { useAuthenticatorInstance } from './authenticator';
import { IAuthenticator } from './models';
import { useHttpClient } from '../sheshaApplication/publicApi/http/hooks';
import { useSheshaApplication } from '../sheshaApplication';
import { useSettings } from '../settings';

export interface IAuthProviderRefProps {
  anyOfPermissionsGranted?: (permissions: string[]) => boolean;
  getIsLoggedIn: () => boolean;
}

interface IAuthProviderProps {
  /**
   * What the token name should be
   *
   * TODO: The whole authorization and storing of token needs to be reviewed
   */
  tokenName: string;

  /**
   * URL that that the user should be redirected to if they're not authorized. Default is /login
   */
  unauthorizedRedirectUrl?: string;

  /**
   * Home page url. Default is `/`
   */
  homePageUrl?: string;

  authRef?: MutableRefObject<IAuthProviderRefProps>;
}

const AuthenticatorContext = React.createContext<IAuthenticator | undefined>(undefined);

const AuthProvider: FC<PropsWithChildren<IAuthProviderProps>> = ({
  children,
  tokenName = '',
  unauthorizedRedirectUrl = URL_LOGIN_PAGE,
  homePageUrl = URL_HOME_PAGE,
  authRef,
}) => {
  const httpClient = useHttpClient();
  const { router } = useShaRouting();
  const app = useSheshaApplication();
  const settings = useSettings();

  const [authenticator] = useAuthenticatorInstance({
    httpClient,
    settings,
    router,
    tokenName,
    homePageUrl,
    unauthorizedRedirectUrl,
    onSetRequestHeaders: (headers) => {
      // set application headers
      app.setRequestHeaders(headers);
    },
  });

  if (authRef)
    authRef.current = {
      anyOfPermissionsGranted: authenticator.anyOfPermissionsGranted,
      getIsLoggedIn: () => authenticator.isLoggedIn,
    };

  return (
    <AuthenticatorContext.Provider value={authenticator}>
      {children}
    </AuthenticatorContext.Provider>
  );
};

const useAuthOrUndefined = (): IAuthenticator | undefined => {
  return useContext(AuthenticatorContext);
};

const useAuth = (): IAuthenticator => {
  const context = useAuthOrUndefined();
  if (context === undefined)
    throw new Error('useAuth must be used within a AuthProvider');

  return context;
};

/**
 * @deprecated use useAuth instead
 */
const useAuthActions = useAuth;
/**
 * @deprecated use useAuth instead
 */
const useAuthState = useAuth;

export default AuthProvider;

export { AuthProvider, useAuth, useAuthOrUndefined, useAuthActions, useAuthState, type IAuthenticator };
