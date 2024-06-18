import { UserLoginInfoDto } from '@/apis/session';
import {
  ResetPasswordUsingTokenInput,
  ResetPasswordVerifyOtpInput,
  ResetPasswordVerifyOtpResponse,
  UserResetPasswordSendOtpQueryParams,
} from '@/apis/user';
import { IFlagsSetters, IFlagsState } from '@/interfaces';
import { IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { EMPTY_FLAGS_STATE } from '@/interfaces/flagsState';
import IRequestHeaders from '@/interfaces/requestHeaders';
import { createNamedContext } from '@/utils/react';

export type IFlagProgressFlags =
  | 'isIdle'
  | 'isVerifyOtpModalVisible'
  | 'loginUser'
  | 'fetchUserData'
  | 'verifyOtp'
  | 'resetPassword'
  | 'sendOtp' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags =
  | 'isVerifyOtpModalVisible'
  | 'loginUser'
  | 'fetchUserData'
  | 'verifyOtp'
  | 'resetPassword'
  | 'sendOtp' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags =
  | 'isVerifyOtpModalVisible'
  | 'loginUser'
  | 'fetchUserData'
  | 'verifyOtp'
  | 'resetPassword'
  | 'sendOtp' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = 'hasCheckedAuth' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface ILoginForm {
  userNameOrEmailAddress: string;
  password: string;
  /**
   * Optional IMEI number. Is used for mobile applications
   */
  imei?: string | null;
  rememberMe?: boolean;
}

export interface IAuthStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  isCheckingAuth?: boolean;
  isFetchingUserInfo?: boolean;
  loginInfo?: UserLoginInfoDto;
  requireChangePassword?: boolean;
  isLoggedIn: boolean;
  token?: string;
  headers?: IRequestHeaders;
  // The below field is just a placeholder for an `IFlagErrorFlags`. Whenever an error occurs, we'd like to pass errorInfo so that we can render ValidationErrors properly
  errorInfo?: IErrorInfo;

  //#region Forgot password
  mobileNo?: string; // Reset password sendOtp mobile number
  selectedMobileNumber?: string;
  verifyOtpReqPayload?: ResetPasswordVerifyOtpInput;
  verifyOtpResPayload?: ResetPasswordVerifyOtpResponse;
  isResettingPasswordUsingToken?: boolean;
  isResetPasswordUsingTokenSuccessful?: boolean;
  resetPasswordUsingTokenError?: string;
  resetPasswordUsingTokenReqPayload?: ResetPasswordUsingTokenInput;
  resetPasswordUsingTokenResPayload?: IAjaxResponseBase;
  resetPasswordVerifyOtpPayload?: UserResetPasswordSendOtpQueryParams;
  //#endregion
}

export interface IAuthActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  loginUser?: (loginFormData: ILoginForm) => void;

  logoutUser?: () => Promise<unknown>;

  /** Returns true if any of specified permissions granted to the current user */
  anyOfPermissionsGranted: (permissions: string[]) => boolean;

  verifyOtpSuccess: (verifyOtpResPayload: ResetPasswordVerifyOtpResponse) => void;

  resetPasswordSuccess?: () => void;

  getAccessToken: () => string;

  checkAuth?: () => void;

  fireHttpHeadersChanged?: (state?: IAuthStateContext) => void;

  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export const AUTH_CONTEXT_INITIAL_STATE: IAuthStateContext = {
  ...EMPTY_FLAGS_STATE,
  isCheckingAuth: false,
  isFetchingUserInfo: false,
  isLoggedIn: false,
};

export const AuthStateContext = createNamedContext<IAuthStateContext>(AUTH_CONTEXT_INITIAL_STATE, "AuthStateContext");

export const AuthActionsContext = createNamedContext<IAuthActionsContext | undefined>(undefined, "AuthActionsContext");
