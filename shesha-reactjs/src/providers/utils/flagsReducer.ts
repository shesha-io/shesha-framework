import camelcase from 'camelcase';
import { FlagsActionTypes } from '@/enums';
import { IFlagsState, isHasErrorInfo } from '@/interfaces';

//#region Flags
export const IS_IN_PROGRESS_FLAG = '_REQUEST';

export const SUCCESS_FLAG = '_SUCCESS';

export const ERROR_FLAG = '_ERROR';

export const ACTIONED_FLAG = '_ACTION';
//#endregion


export const FLAGS_INITIAL_STATE: IFlagsState<string, string, string, string> = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
};

const isThisFlagInAction = (type: string, flag: string): boolean => new RegExp(flag, 'i').test(type);

const flagsReducer = <T extends IFlagsState<string, string, string, string>>(
  state: T = FLAGS_INITIAL_STATE as T,
  { type, payload }: ReduxActions.Action<IFlagsState<string, string, string, string>>,
): T => {
  const flaggable = /(.*)_(REQUEST|SUCCESS|ERROR|ACTION)/.test(type);

  if (flaggable) {
    // ["FETCH_USER_SUCCESS", "FETCH_USER", "SUCCESS", index: 0, input: "FETCH_USER_SUCCESS__F__SA", groups: undefined]
    const actionMatch = /(.*)_(REQUEST|SUCCESS|ERROR|ACTION)/.exec(type);

    const FLAG_ACTION_KEY = camelcase(actionMatch != null && actionMatch.length > 1 ? actionMatch[0] : ''); //  "FETCH_USER" => fetchUser

    const { isInProgress, succeeded, error, actioned } = state;

    let currentState = { ...state };

    if (isThisFlagInAction(type, IS_IN_PROGRESS_FLAG)) {
      currentState = {
        ...state,
        isInProgress: { ...isInProgress, [FLAG_ACTION_KEY]: true },
        succeeded: { ...succeeded, [FLAG_ACTION_KEY]: false },
        error: { ...error, [FLAG_ACTION_KEY]: false },
      };
    }

    if (isThisFlagInAction(type, SUCCESS_FLAG)) {
      currentState = {
        ...state,
        succeeded: { ...succeeded, [FLAG_ACTION_KEY]: true },
        isInProgress: { ...isInProgress, [FLAG_ACTION_KEY]: false },
      };
    }

    if (isThisFlagInAction(type, ERROR_FLAG)) {
      currentState = {
        ...state,
        error: {
          ...error,
          [FLAG_ACTION_KEY]: isHasErrorInfo(payload) ? payload.errorInfo : true,
        },
        isInProgress: { ...isInProgress, [FLAG_ACTION_KEY]: false },
      };
    }

    if (isThisFlagInAction(type, ACTIONED_FLAG)) {
      currentState = {
        ...state,
        actioned: { ...actioned, [FLAG_ACTION_KEY]: true },
      };
    }

    return currentState;
  }

  switch (type) {
    case FlagsActionTypes.SetIsInProgressFlag: {
      return {
        ...state,
        isInProgress: { ...state.isInProgress, ...payload.isInProgress },
      };
    }
    case FlagsActionTypes.SetSucceededFlag: {
      return {
        ...state,
        succeeded: { ...state.succeeded, ...payload.succeeded },
      };
    }
    case FlagsActionTypes.SetErrorFlag: {
      return {
        ...state,
        error: { ...state.error, ...payload.error },
      };
    }
    case FlagsActionTypes.SetActionedFlag: {
      return {
        ...state,
        actioned: { ...state.actioned, ...payload.actioned },
      };
    }
    case FlagsActionTypes.ResetIsInProgressFlags:
      return {
        ...state,
        isInProgress: {},
      };
    case FlagsActionTypes.ResetSucceededFlags:
      return {
        ...state,
        succeeded: {},
      };
    case FlagsActionTypes.ResetErrorFlags:
      return {
        ...state,
        error: {},
      };
    case FlagsActionTypes.ResetActionedFlags:
      return {
        ...state,
        actioned: {},
      };
    case FlagsActionTypes.ResetAllFlags:
      return {
        ...state,
        isInProgress: {},
        succeeded: {},
        error: {},
        actioned: {},
      };
    default:
      return state;
  }
};

export default flagsReducer;
