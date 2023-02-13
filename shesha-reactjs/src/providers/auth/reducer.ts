import { handleActions } from 'redux-actions';
import { UserLoginInfoDto } from '../../apis/session';
import { ResetPasswordVerifyOtpResponse } from '../../apis/user';
import { IErrorInfo } from '../../interfaces/errorInfo';
import { AuthActionEnums } from './actions';
import { AUTH_CONTEXT_INITIAL_STATE, IAuthStateContext } from './contexts';
import flagsReducer from '../utils/flagsReducer';
import { getHttpHeaders } from '../../utils/auth';

const baseAuthReducer = handleActions<IAuthStateContext, any>(
  {
    [AuthActionEnums.LoginUserRequest]: (
      state: IAuthStateContext,
    ) => {
      return {
        ...state,
        errorInfo: null,
      };
    },

    [AuthActionEnums.LoginUserSuccess]: (
      state: IAuthStateContext,
    ) => {
      return {
        ...state,
        isCheckingAuth: false,
        errorInfo: null,
      };
    },

    [AuthActionEnums.LoginUserError]: (
      state: IAuthStateContext,
      action: ReduxActions.Action<IErrorInfo>
    ) => {
      const { payload } = action;
      return { ...state, errorInfo: payload, isCheckingAuth: false };
    },

    [AuthActionEnums.LogoutUser]: () => {
      return { ...AUTH_CONTEXT_INITIAL_STATE };
    },

    [AuthActionEnums.CheckAuthAction]: (
      state: IAuthStateContext,
    ) => {
      return {
        ...state,
        isCheckingAuth: true,
        errorInfo: null,
      };
    },

    [AuthActionEnums.FetchUserDataRequest]: (
      state: IAuthStateContext
    ) => {
      return { ...state, isFetchingUserInfo: true };
    },

    [AuthActionEnums.FetchUserDataSuccess]: (
      state: IAuthStateContext,
      action: ReduxActions.Action<UserLoginInfoDto>
    ) => {
      const { payload } = action;

      return {
        ...state,
        loginInfo: payload,
        isFetchingUserInfo: false,
        errorInfo: null,
      };
    },

    [AuthActionEnums.FetchUserDataError]: (
      state: IAuthStateContext,
      action: ReduxActions.Action<IErrorInfo>
    ) => {
      const { payload } = action;

      return {
        ...state,
        errorInfo: payload,
        isFetchingUserInfo: false,
      };
    },


    [AuthActionEnums.VerifyOtpSuccess]: (
      state: IAuthStateContext,
      action: ReduxActions.Action<ResetPasswordVerifyOtpResponse>
    ) => {
      const { payload } = action;

      return { ...state, verifyOtpResPayload: payload };
    },

    [AuthActionEnums.ResetPasswordSuccess]: (
      state: IAuthStateContext,
    ) => {
      return {
        ...state,
        verifyOtpResPayload: null,
      };
    },

    [AuthActionEnums.SetToken]: (
      state: IAuthStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload: token } = action;

      return { 
        ...state, 
        token,
      };
    },
  },
  AUTH_CONTEXT_INITIAL_STATE
);

export function authReducer(
  incomingState: IAuthStateContext,
  action: ReduxActions.Action<any>
): IAuthStateContext {
  const state = flagsReducer(incomingState, action);
  
  // temporary solution, headers will be reviewed
  state.headers = getHttpHeaders(state.token);

  return baseAuthReducer(state, action);
}