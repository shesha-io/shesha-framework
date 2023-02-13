import React, { FC, useContext, useEffect, PropsWithChildren, useMemo, MutableRefObject } from 'react';
import { authReducer } from './reducer';
import useThunkReducer from 'react-hook-thunk-reducer';
import {
  AuthStateContext,
  AuthActionsContext,
  AUTH_CONTEXT_INITIAL_STATE,
  ILoginForm,
  IAuthStateContext,
} from './contexts';
import {
  loginUserAction,
  loginUserErrorAction,
  logoutUserAction,
  verifyOtpSuccessAction,
  resetPasswordSuccessAction,
  setAccessTokenAction,
  checkAuthAction,
  fetchUserDataAction,
  fetchUserDataActionSuccessAction,
  fetchUserDataActionErrorAction,
  loginUserSuccessAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { URL_LOGIN_PAGE, URL_HOME_PAGE, URL_CHANGE_PASSWORD, HOME_CACHE_URL } from '../../constants';
import IdleTimer from 'react-idle-timer';
import { IAccessToken } from '../../interfaces';
import { OverlayLoader } from '../../components/overlayLoader';
import { sessionGetCurrentLoginInformations } from '../../apis/session';
import { ResetPasswordVerifyOtpResponse } from '../../apis/user';
import {
  removeAccessToken as removeTokenFromStorage,
  saveUserToken as saveUserTokenToStorage,
  getAccessToken as getAccessTokenFromStorage,
  getHttpHeaders as getHttpHeadersFromToken,
  AUTHORIZATION_HEADER_NAME,
} from '../../utils/auth';
import {
  useTokenAuthAuthenticate,
  AuthenticateResultModelAjaxResponse,
  useTokenAuthSignOff,
} from '../../apis/tokenAuth';
import { getLocalizationOrDefault } from '../../utils/localization';
import { getCustomHeaders, getTenantId } from '../../utils/multitenancy';
import { useShaRouting } from '../shaRouting';
import IRequestHeaders from '../../interfaces/requestHeaders';
import { IHttpHeaders } from '../../interfaces/accessToken';
import { useSheshaApplication } from '../sheshaApplication';
import { getCurrentUrl, getLoginUrlWithReturn, getQueryParam, isSameUrls } from '../../utils/url';
import { getFlagSetters } from '../utils/flagsSetters';
import { IErrorInfo } from '../../interfaces/errorInfo';

const DEFAULT_HOME_PAGE = '/';

export interface IAuthProviderRefProps {
  anyOfPermissionsGranted?: (permissions: string[]) => boolean;
  headers?: any;
}

interface IAuthProviderProps {
  /**
   * What the token name should be
   *
   * TODO: The whole authorization and storing of token needs to be reviewed
   */
  tokenName: string;

  /**
   * A callback for when the request headers are changed
   */
  onSetRequestHeaders?: (headers: IRequestHeaders) => void;

  /**
   * URL that that the user should be redirected to if they're not authorized. Default is /login
   */
  unauthorizedRedirectUrl?: string;

  /**
   * URL that that the user should be redirected to change the password. Default is /account/change-password
   */
  changePasswordUrl?: string;

  /**
   * Home page url. Default is `/`
   */
  homePageUrl?: string;

  /**
   * @deprecated - use `withAuth` instead. Any page that doesn't require Auth will be rendered without being wrapped inside `withAuth`
   */
  whitelistUrls?: string[];

  authRef?: MutableRefObject<IAuthProviderRefProps>;
}

const ASPNET_CORE_CULTURE = '.AspNetCore.Culture';

const AuthProvider: FC<PropsWithChildren<IAuthProviderProps>> = ({
  children,
  tokenName = '',
  onSetRequestHeaders,
  unauthorizedRedirectUrl = URL_LOGIN_PAGE,
  changePasswordUrl = URL_CHANGE_PASSWORD,
  homePageUrl = URL_HOME_PAGE,
  whitelistUrls,
  authRef,
}) => {
  const { router } = useShaRouting();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const storedToken = getAccessTokenFromStorage(tokenName);

  const { [AUTHORIZATION_HEADER_NAME]: _auth = null, ...headersWithoutAuth } = { ...(httpHeaders ?? {}) };

  const initialHeaders = { ...headersWithoutAuth, ...getHttpHeadersFromToken(storedToken?.accessToken) };

  const [state, dispatch] = useThunkReducer(authReducer, {
    ...AUTH_CONTEXT_INITIAL_STATE,
    token: storedToken?.accessToken,
    headers: initialHeaders,
  });

  const setters = getFlagSetters(dispatch);

  //#region Fetch user login info`1

  const fetchUserInfo = (headers: IHttpHeaders) => {
    if (state.isFetchingUserInfo || Boolean(state.loginInfo)) return;

    if (Boolean(state.loginInfo)) return;

    dispatch(fetchUserDataAction());
    sessionGetCurrentLoginInformations({ base: backendUrl, headers })
      .then(response => {
        if (response.result.user) {
          dispatch(fetchUserDataActionSuccessAction(response.result.user));

          if (state.requireChangePassword && Boolean(changePasswordUrl)) {
            redirect(changePasswordUrl);
          } else {
            const currentUrl = getCurrentUrl();

            // if we are on the login page - redirect to the returnUrl or home page
            if (isSameUrls(currentUrl, unauthorizedRedirectUrl)) {
              const returnUrl = getQueryParam('returnUrl')?.toString();

              cacheHomeUrl(response.result?.user?.homeUrl || homePageUrl);

              redirect(returnUrl ?? response.result?.user?.homeUrl ?? homePageUrl ?? DEFAULT_HOME_PAGE);
            }
          }
        } else {
          // user may be null in some cases
          clearAccessToken();

          dispatch(fetchUserDataActionErrorAction({ message: 'Not authorized' }));
          redirectToUnauthorized();
        }
      })
      .catch(e => {
        console.log('failed to fetch user profile', e);
        dispatch(fetchUserDataActionErrorAction({ message: 'Oops, something went wrong' }));
        redirectToUnauthorized();
      });
  };

  const cacheHomeUrl = (url: string) => {
    if (url && url !== URL_HOME_PAGE) localStorage.setItem(HOME_CACHE_URL, url);
  };

  const redirect = (url: string) => {
    router?.push(url);
  };

  const redirectToUnauthorized = () => {
    const redirectUrl = getLoginUrlWithReturn(homePageUrl, unauthorizedRedirectUrl);
    redirect(redirectUrl);
  };

  //#region `checkAuth`
  const checkAuth = () => {
    dispatch(checkAuthAction());

    const headers = getHttpHeaders();

    if (headers && !state.loginInfo) {
      if (!state.isFetchingUserInfo) {
        fetchUserInfo(headers);
      }
    } else {
      dispatch(loginUserErrorAction({ message: 'Oops, something went wrong' }));
      redirectToUnauthorized();
    }
  };
  //#endregion

  const getHttpHeadersFromState = (providedState: IAuthStateContext): IHttpHeaders => {
    const headers: IHttpHeaders = { ...httpHeaders };

    if (providedState.token) headers['Authorization'] = `Bearer ${providedState.token}`;

    // todo: move culture and tenant to state and restore from localStorage on start
    headers[ASPNET_CORE_CULTURE] = getLocalizationOrDefault();

    const tenantId = getTenantId();

    if (tenantId) {
      headers['Abp.TenantId'] = getTenantId().toString();
    }

    const additionalHeaders = getCustomHeaders();

    additionalHeaders.forEach(([key, value]) => {
      if (key && value) {
        headers[key] = value?.toString();
      }
    });

    return headers;
  };

  const getCleanedInitHeaders = <T,>(headers: T) => {
    const propName = Object.getOwnPropertyNames(headers || {});
    if (propName.length === 1 && propName[0] === ASPNET_CORE_CULTURE) {
      return null;
    }

    return headers;
  };

  const getHttpHeaders = (): IHttpHeaders => {
    return getHttpHeadersFromState(state);
  };

  const fireHttpHeadersChanged = (providedState: IAuthStateContext = state) => {
    if (onSetRequestHeaders) {
      const headers = getHttpHeadersFromState(providedState);
      onSetRequestHeaders(headers);
    }
  };

  const clearAccessToken = () => {
    removeTokenFromStorage(tokenName);

    dispatch((dispatchThunk, getState) => {
      dispatchThunk(setAccessTokenAction(null));
      fireHttpHeadersChanged(getState());
    });
  };

  useEffect(() => {
    const httpHeaders = getCleanedInitHeaders(getHttpHeaders());

    const currentUrl = getCurrentUrl();

    if (!httpHeaders) {
      if (currentUrl !== unauthorizedRedirectUrl && !whitelistUrls?.includes(currentUrl)) {
        redirectToUnauthorized();
      }
    } else {
      fireHttpHeadersChanged(state);
      if (!state.isCheckingAuth && !state.isFetchingUserInfo) {
        fetchUserInfo(httpHeaders);
      }
    }
  }, []);

  //#region  Login
  const { mutate: loginUserHttp } = useTokenAuthAuthenticate({});

  const loginUser = (loginFormData: ILoginForm) => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(loginUserAction()); // We just want to let the user know we're logging in

      const loginSuccessHandler = (data: AuthenticateResultModelAjaxResponse) => {
        dispatchThunk(loginUserSuccessAction());
        if (data) {
          const token = data.success && data.result ? (data.result as IAccessToken) : null;
          if (token && token.accessToken) {
            // save token to the localStorage
            saveUserTokenToStorage(token, tokenName);

            // save token to the state
            dispatchThunk(setAccessTokenAction(token.accessToken));

            // get updated state and notify subscribers
            const newState = getState();
            fireHttpHeadersChanged(newState);

            // get new headers and fetch the user info
            const headers = getHttpHeadersFromState(newState);
            fetchUserInfo(headers);
          } else dispatchThunk(loginUserErrorAction(data?.error as IErrorInfo));
        }
      };

      loginUserHttp(loginFormData)
        .then(loginSuccessHandler)
        .catch(err => {
          dispatchThunk(loginUserErrorAction(err?.data));
        });
    });
  };
  //#endregion

  //#region Logout user
  const { mutate: signOffRequest } = useTokenAuthSignOff({});

  /**
   * Logout success
   */
  const logoutSuccess = resolve => {
    clearAccessToken();
    dispatch(logoutUserAction());
    redirect(unauthorizedRedirectUrl);
    resolve(null);
  };

  /**
   * Log the user
   */
  const logoutUser = () =>
    new Promise((resolve, reject) =>
      signOffRequest(null)
        .then(() => logoutSuccess(resolve))
        .catch(() => reject())
    );

  //#endregion

  const anyOfPermissionsGranted = (permissions: string[]) => {
    const { loginInfo } = state;
    if (!loginInfo) return false;

    if (!permissions || permissions.length === 0) return true;

    const granted = loginInfo.grantedPermissions || [];

    return permissions.some(p => granted.includes(p));
  };

  if (authRef) authRef.current = { anyOfPermissionsGranted, headers: state?.headers };

  const anyOfPermissionsGrantedWrapper = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const granted = anyOfPermissionsGranted(permissions);

    return granted;
  };

  //#region Reset password
  /**
   * @param verifyOtpResPayload - the payload for resetting the password
   */
  const verifyOtpSuccess = (verifyOtpResPayload: ResetPasswordVerifyOtpResponse) => {
    // Redirect to the reset password page

    // redirect(URL_RESET_PASSWORD);
    dispatch(verifyOtpSuccessAction(verifyOtpResPayload));
  };

  // This action will simply clear state.verifyOtpResPayload
  const resetPasswordSuccess = () => {
    dispatch(resetPasswordSuccessAction());
  };

  const showLoader = useMemo(() => {
    return !!(
      (state.isFetchingUserInfo || (!state.isFetchingUserInfo && !state.loginInfo && state.token)) // Done fetching user info but the state is not yet updated
    );
  }, [state.isFetchingUserInfo, state]);

  //#endregion

  const getAccessToken = () => {
    return state.token;
  };

  if (showLoader) {
    return <OverlayLoader loading={true} loadingText="Initializing..." />;
  }

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    // @ts-ignore
    <IdleTimer>
      <AuthStateContext.Provider value={state}>
        <AuthActionsContext.Provider
          value={{
            ...setters,
            checkAuth,
            loginUser,
            getAccessToken,
            logoutUser,
            anyOfPermissionsGranted: anyOfPermissionsGrantedWrapper,
            verifyOtpSuccess,
            resetPasswordSuccess,
            fireHttpHeadersChanged,

            /* NEW_ACTION_GOES_HERE */
          }}
        >
          {children}
        </AuthActionsContext.Provider>
      </AuthStateContext.Provider>
    </IdleTimer>
  );
};

function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within a AuthProvider');
  }
  return context;
}

function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within a AuthProvider');
  }
  return context;
}

function useAuth() {
  return { ...useAuthActions(), ...useAuthState() };
}

export default AuthProvider;

export { AuthProvider, useAuthState, useAuthActions, useAuth };
