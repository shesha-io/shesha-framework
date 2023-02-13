import { createContext } from 'react';
import {
  ResetPasswordVerifyOtpInput,
  ResetPasswordVerifyOtpResponse,
  ResetPasswordUsingTokenInput,
  AjaxResponseBase,
  UserResetPasswordSendOtpQueryParams,
} from '../../apis/user';
import { UserLoginInfoDto } from '../../apis/session';
import { IErrorInfo } from '../../interfaces/errorInfo';
import { AuthenticateModel } from '../../apis/tokenAuth';
import IRequestHeaders from '../../interfaces/requestHeaders';
import { IFlagsSetters, IFlagsState } from '../../interfaces';
import { EMPTY_FLAGS_STATE } from '../../interfaces/flagsState';

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

export interface ILoginForm extends AuthenticateModel {
  rememberMe?: boolean;
}

export interface IAuthStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  isCheckingAuth?: boolean;
  isFetchingUserInfo?: boolean;
  loginInfo?: UserLoginInfoDto;
  requireChangePassword?: boolean;
  loginUserSuccessful?: boolean | null;
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
  resetPasswordUsingTokenResPayload?: AjaxResponseBase;
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
};

export const AuthStateContext = createContext<IAuthStateContext>(AUTH_CONTEXT_INITIAL_STATE);

export const AuthActionsContext = createContext<IAuthActionsContext | undefined>(undefined);
