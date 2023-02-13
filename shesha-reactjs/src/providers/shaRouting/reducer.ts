import { IShaRoutingStateContext } from './contexts';
import { RouteActionEnums } from './actions';

export function shaRoutingReducer(
  incomingState: IShaRoutingStateContext,
  action: ReduxActions.Action<IShaRoutingStateContext>
): IShaRoutingStateContext {
  //#region Register flags reducer
  // const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case RouteActionEnums.GoingToRoute:
      /* NEW_ACTION_ENUM_GOES_HERE */
      return {
        ...incomingState,
        ...payload,
      };

    default: {
      return incomingState;
    }
  }
}
