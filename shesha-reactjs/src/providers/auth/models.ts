import { IEntityReferenceDto, IErrorInfo, ILoginForm } from '@/interfaces';
import { GetCurrentLoginInfoOutput, UserLoginInfoDto } from '@/apis/session';

export type AuthenticationStatus = 'waiting' | 'inprogress' | 'ready' | 'failed';
export interface AuthenticationState {
  status: AuthenticationStatus;
  hint?: string;
  error?: IErrorInfo;
}

export interface LoginUserResponse {
  userProfile: GetCurrentLoginInfoOutput;
  url: string;
}

export const ASPNET_CORE_CULTURE = '.AspNetCore.Culture';
export const DEFAULT_HOME_PAGE = '/';

export const URLS = {
  LOGIN: '/api/TokenAuth/Authenticate',
  LOGOFF: '/api/TokenAuth/SignOff',
  GET_CURRENT_LOGIN_INFO: '/api/services/app/Session/GetCurrentLoginInfo',
};

export const ERROR_MESSAGES = {
  GENERIC: 'Oops, something went wrong',
  LOGIN: 'Failed to login',
  USER_PROFILE_LOADING: 'Failed to load user profile',
};

export interface IAuthenticator {
  loginInfo: UserLoginInfoDto;
  isLoggedIn: boolean;

  loginUserAsync: (loginFormData: ILoginForm) => Promise<LoginUserResponse>;
  logoutUser: () => Promise<void>;
  checkAuthAsync: (notAuthorizedRedirectUrl: string) => Promise<void>;

  anyOfPermissionsGranted: (permissions: string[], permissionedEntities?: IEntityReferenceDto[]) => boolean;

  state: AuthenticationState;
}
