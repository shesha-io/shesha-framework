import { IGlobalConfigManagerStateContext } from './contexts';
import { GlobalConfigManagerActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';

export function globalConfigManagerReducer(
  incomingState: IGlobalConfigManagerStateContext,
  action: ReduxActions.Action<IGlobalConfigManagerStateContext>
): IGlobalConfigManagerStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case GlobalConfigManagerActionEnums.DefaultAction:
      /* NEW_ACTION_ENUM_GOES_HERE */
      return {
        ...state,
        ...payload,
      };

    default: {
      return state;
    }
  }
}
