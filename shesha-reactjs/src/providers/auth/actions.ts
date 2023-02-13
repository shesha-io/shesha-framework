import { createAction } from 'redux-actions';
import { UserLoginInfoDto } from '../../apis/session';
import { ResetPasswordVerifyOtpResponse } from '../../apis/user';
import { IErrorInfo, IHasErrorInfo } from '../../interfaces/errorInfo';
//import IRequestHeaders from '../../interfaces/requestHeaders';
export enum AuthActionEnums {
  CheckAuthAction = 'CHECK_AUTH_ACTION',
  SetToken = 'SET_TOKEN',
  //SetHeaders = 'SET_HEADERS',
  LoginUserRequest = 'LOGIN_USER_REQUEST',
  LoginUserSuccess = 'LOGIN_USER_SUCCESS',
  LoginUserError = 'LOGIN_USER_ERROR',
  LogoutUser = 'LOGOUT_USER',
  FetchUserDataRequest = 'FETCH_USER_DATA_REQUEST',
  FetchUserDataSuccess = 'FETCH_USER_DATA_SUCCESS',
  FetchUserDataError = 'FETCH_USER_DATA_ERROR',

  //#region Rest Password
  VerifyOtpSuccess = 'VERIFY_OTP_SUCCESS',
  //#endregion

  ResetPasswordSuccess = 'RESET_PASSWORD_SUCCESS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const checkAuthAction = createAction(AuthActionEnums.CheckAuthAction);

//#region  Login user
export const loginUserAction = createAction(AuthActionEnums.LoginUserRequest);

export const loginUserSuccessAction = createAction(
  AuthActionEnums.LoginUserSuccess
);

export const loginUserErrorAction = createAction<IHasErrorInfo, IErrorInfo>(
  AuthActionEnums.LoginUserError,
  p => ({ errorInfo: p })
);

//#endregion

//#region Fetch user data

export const fetchUserDataAction = createAction(AuthActionEnums.FetchUserDataRequest);

export const fetchUserDataActionSuccessAction = createAction<UserLoginInfoDto, UserLoginInfoDto>(
  AuthActionEnums.FetchUserDataSuccess,
  p => p
);

export const fetchUserDataActionErrorAction = createAction<IHasErrorInfo, IErrorInfo>(
  AuthActionEnums.FetchUserDataError,
  p => ({ errorInfo: p })
);

//#endregion

export const logoutUserAction = createAction(AuthActionEnums.LogoutUser);

export const verifyOtpSuccessAction = createAction<ResetPasswordVerifyOtpResponse, ResetPasswordVerifyOtpResponse>(
  AuthActionEnums.VerifyOtpSuccess,
  p => p
);

export const resetPasswordSuccessAction = createAction(AuthActionEnums.ResetPasswordSuccess);
/* NEW_ACTION_GOES_HERE */

export const setAccessTokenAction = createAction<string, string>(AuthActionEnums.SetToken, p => p);
