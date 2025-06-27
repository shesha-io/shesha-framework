import { getAccessToken, removeAccessToken, saveUserToken } from '@/utils/auth';
import { DEFAULT_ACCESS_TOKEN_NAME } from '../sheshaApplication/contexts';
import { URL_HOME_PAGE, URL_LOGIN_PAGE } from '@/shesha-constants';
import { IEntityReferenceDto, IErrorInfo, ILoginForm } from '@/interfaces';
import { HttpClientApi } from '@/publicJsApis/httpClient';
import { AuthenticateModel, AuthenticateResultModelAjaxResponse } from '@/apis/tokenAuth';
import { GetCurrentLoginInfoOutput, GetCurrentLoginInfoOutputAjaxResponse, UserLoginInfoDto } from '@/apis/session';
import { getQueryParam, isSameUrls, removeURLParameter } from '@/utils/url';
import { IRouter } from '../shaRouting';
import React from 'react';
import { IAccessToken, IHttpHeaders } from '@/interfaces/accessToken';
import { getLocalizationOrDefault } from '@/utils/localization';
import { getTenantId } from '@/utils/multitenancy';
import { HttpResponse } from '@/publicJsApis/httpClient';
import {
  ASPNET_CORE_CULTURE,
  AuthenticationState,
  AuthenticationStatus,
  DEFAULT_HOME_PAGE,
  ERROR_MESSAGES,
  IAuthenticator,
  LoginUserResponse,
  URLS,
} from './models';
import { ISettingsActionsContext } from '../settings/contexts';

type RerenderTrigger = () => void;

const RETURN_URL_KEY = 'returnUrl';

export interface AuthenticatorArgs {
  httpClient: HttpClientApi;
  router: IRouter;
  settings: ISettingsActionsContext;
  tokenName?: string;
  unauthorizedRedirectUrl?: string;
  homePageUrl?: string;
  /**
   * A callback for when the request headers are changed
   */
  onSetRequestHeaders?: (headers: IHttpHeaders) => void;
}

export class Authenticator implements IAuthenticator {
  #httpClient: HttpClientApi;
  #settings: ISettingsActionsContext;
  #router: IRouter;
  #rerender: RerenderTrigger;
  #onSetRequestHeaders: (headers: IHttpHeaders) => void;

  #tokenName: string;
  #unauthorizedRedirectUrl: string;
  #homePageUrl: string;
  #loginInfo: GetCurrentLoginInfoOutput;

  state: AuthenticationState;

  get loginInfo() {
    return this.#loginInfo?.user;
  }
  get isLoggedIn() {
    return this.state.status === 'ready' && this.#loginInfo?.user !== null;
  }

  constructor(args: AuthenticatorArgs, forceRootUpdate: RerenderTrigger) {
    this.#httpClient = args.httpClient;
    this.#settings = args.settings;
    this.#router = args.router;
    this.#rerender = forceRootUpdate;
    this.state = { status: 'waiting' };

    this.#tokenName = args.tokenName || DEFAULT_ACCESS_TOKEN_NAME;
    this.#unauthorizedRedirectUrl = args.unauthorizedRedirectUrl || URL_LOGIN_PAGE;
    this.#homePageUrl = args.homePageUrl || URL_HOME_PAGE;
    this.#onSetRequestHeaders = args.onSetRequestHeaders;
  }

  applyRouter = (router: IRouter) => {
    this.#router = router;
  };

  #redirect = (url: string) => {
    this.#router.push(url);
  };

  #getHttpHeaders = (): IHttpHeaders => {
    const headers: IHttpHeaders = {};

    const token = this.#getToken();
    if (token && token.accessToken) headers['Authorization'] = `Bearer ${token.accessToken}`;

    headers[ASPNET_CORE_CULTURE] = getLocalizationOrDefault();

    const tenantId = getTenantId();
    if (tenantId) {
      headers['Abp.TenantId'] = getTenantId().toString();
    }

    return headers;
  };

  #getToken = (): IAccessToken | null => {
    return getAccessToken(this.#tokenName);
  };
  #saveUserToken = (token: IAccessToken) => {
    saveUserToken(token, this.#tokenName);
  };
  #clearAccessToken = () => {
    removeAccessToken(this.#tokenName);
  };

  #checkRegistrationCompletion = (
    response: AuthenticateResultModelAjaxResponse
  ): Promise<AuthenticateResultModelAjaxResponse> => {
    return new Promise((resolve, reject) => {
      if (response?.result?.resultType === 2) {
        if (Boolean(response?.result?.redirectUrl)) {
          this.#redirect(`/no-auth/${response.result.url}`);
          reject(new Error('Redirecting to another page.'));
        }
        if (Boolean(response?.result?.redirectModule) && Boolean(response?.result?.redirectForm)) {
          this.#redirect(
            `/no-auth/${response.result.redirectModule}/${response.result.redirectForm}?user=${response.result.userId}`
          );
          reject(new Error('Redirecting to another form.'));
        }
      } else if (response?.result?.resultType === 1) {
        if (Boolean(response?.result?.redirectUrl)) {
          this.#redirect(response.result.redirectUrl);
          reject(new Error('Redirecting to another page.'));
        }
        if (Boolean(response?.result?.redirectModule) && Boolean(response?.result?.redirectForm)) {
          this.#redirect(`/dynamic/${response.result.redirectModule}/${response.result.redirectForm}`);
          reject(new Error('Redirecting to another form.'));
        }
      } else {
        resolve(response);
      }
    });
  };

  #loginUserHttp = async (loginFormData: ILoginForm): Promise<void> => {
    const httpResponse = await this.#httpClient.post<
      AuthenticateModel,
      HttpResponse<AuthenticateResultModelAjaxResponse>
    >(URLS.LOGIN, loginFormData);
    const { data: response } = httpResponse;

    await this.#checkRegistrationCompletion(response); // Check if registration completion redirect is needed

    const token = response.success && response.result ? (response.result as IAccessToken) : null;
    if (token && token.accessToken) {
      // save token to the localStorage
      this.#saveUserToken(token);
      // update http headers
    } else {
      throw new Error(ERROR_MESSAGES.GENERIC);
    }
  };

  #fetchUserInfoHttp = async (): Promise<GetCurrentLoginInfoOutput> => {
    const headers = this.#getHttpHeaders();
    const httpResponse = await this.#httpClient.get<void, HttpResponse<GetCurrentLoginInfoOutputAjaxResponse>>(
      URLS.GET_CURRENT_LOGIN_INFO,
      { headers: headers }
    );
    const { data: response } = httpResponse;
    if (!response.success || !response.result) throw new Error('Failed to get user profile', { cause: response.error });

    this.#onSetRequestHeaders?.(headers);

    return response.result;
  };

  #updateState = (status: AuthenticationStatus, hint?: string, error?: IErrorInfo) => {
    this.state = { status, hint, error };
    this.#rerender();
  };

  #stripReturnUrl = (url: string): string => {
    return url ? removeURLParameter(url, RETURN_URL_KEY) : url;
  };

  #getRedirectUrl = (currentPath: string, userLogin: UserLoginInfoDto): string => {
    const currentUrlWithoutReturn = this.#stripReturnUrl(currentPath);

    if (isSameUrls(currentUrlWithoutReturn, this.#unauthorizedRedirectUrl)) {
      const returnUrlParam = this.#router.query[RETURN_URL_KEY];
      const returnUrl = returnUrlParam ? decodeURIComponent(returnUrlParam.toString()) : undefined;

      const redirects: string[] = [returnUrl, userLogin.homeUrl, this.#homePageUrl, DEFAULT_HOME_PAGE];
      const redirectUrl = redirects.find((r) => Boolean(r?.trim())); // skip all null/undefined and empty strings
      return redirectUrl;
    } else return undefined;
  };

  loginUserAsync = async (loginFormData: ILoginForm): Promise<LoginUserResponse> => {
    this.#updateState('inprogress', 'Logging in...', null);

    try {
      // call login endpoint
      await this.#loginUserHttp(loginFormData);
    } catch (error) {
      this.#updateState('failed', ERROR_MESSAGES.LOGIN, error);
      throw error;
    }

    this.#updateState('inprogress', 'User profile loading...');
    try {
      // fetch user profile
      const userProfile = await this.#fetchUserInfoHttp();
      this.#loginInfo = userProfile;

      this.#updateState('ready', null, null);

      const redirectUrl = this.#getRedirectUrl(this.#router.fullPath, userProfile.user);

      return {
        userProfile: userProfile,
        url: redirectUrl ?? this.#router.fullPath,
      };
    } catch (error) {
      this.#updateState('failed', ERROR_MESSAGES.USER_PROFILE_LOADING, error);
      throw error;
    }
  };

  #logoutUserHttp = async (): Promise<void> => {
    await this.#httpClient.post<void, void>(URLS.LOGOFF, {});
  };

  logoutUser = async (): Promise<void> => {
    await this.#logoutUserHttp();
    this.#clearAccessToken();

    this.#updateState('waiting', null, null);

    this.#redirect(this.#unauthorizedRedirectUrl);
  };

  checkAuthAsync = async (notAuthorizedRedirectUrl: string): Promise<void> => {
    if (this.loginInfo) return;

    const getRedirectUrlAsync = async (): Promise<string> => {
      const currentPath = this.#router.path;
      const fullPath = this.#router.fullPath;
      if (currentPath === '/' || currentPath === '') {
        const defaultUrl = await this.#settings.getSetting({ module: 'Shesha', name: 'Shesha.DefaultUrl' });
        if (typeof defaultUrl === 'string' && Boolean(defaultUrl.trim())) return defaultUrl;
      }

      const existingReturnUrl = notAuthorizedRedirectUrl
        ? getQueryParam(RETURN_URL_KEY, notAuthorizedRedirectUrl)
        : undefined;
      const redirectUrl =
        existingReturnUrl ||
        isSameUrls(currentPath, this.#homePageUrl) ||
        isSameUrls(currentPath, notAuthorizedRedirectUrl)
          ? ''
          : `/?${RETURN_URL_KEY}=${encodeURIComponent(fullPath)}`;

      return `${notAuthorizedRedirectUrl}${redirectUrl}`;
    };

    const token = this.#getToken();
    if (token) {
      this.#updateState('inprogress', 'User profile loading...');
      try {
        // fetch user profile
        const userProfile = await this.#fetchUserInfoHttp();
        if (userProfile.user) {
          this.#loginInfo = userProfile;
          this.#updateState('ready', null, null);
        } else {
          this.#updateState('waiting', null, null);
          this.#router.push(await getRedirectUrlAsync());
        }
      } catch (error) {
        this.#updateState('failed', ERROR_MESSAGES.USER_PROFILE_LOADING, error);
        this.#router.push(await getRedirectUrlAsync());
      }
    } else this.#router.push(await getRedirectUrlAsync());
  };

  anyOfPermissionsGranted = (permissions: string[], permissionedEntities?: IEntityReferenceDto[]): boolean => {
    const loginInfo = this.loginInfo;
    if (!loginInfo) return false;

    if (!permissions || permissions.length === 0) return true;

    const granted = loginInfo.grantedPermissions || [];

    return permissions.some((p) =>
      granted.some(
        (gp) =>
          gp.permission === p &&
          (!gp.permissionedEntity ||
            gp.permissionedEntity.length === 0 ||
            gp.permissionedEntity.some((pe) =>
              permissionedEntities?.some((ppe) => pe?.id === ppe?.id && ppe?._className === pe?._className)
            ))
      )
    );
  };
}

export const useAuthenticatorInstance = (args: AuthenticatorArgs): IAuthenticator[] => {
  const authenticatorRef = React.useRef<Authenticator>();
  const [, forceUpdate] = React.useState({});

  if (!authenticatorRef.current) {
    const forceReRender = () => {
      forceUpdate({});
    };

    const instance = new Authenticator(args, forceReRender);

    authenticatorRef.current = instance;
  } else {
    authenticatorRef.current.applyRouter(args.router);
  }

  return [authenticatorRef.current];
};
