import flagsReducer from '../utils/flagsReducer';
import { IndexViewActionEnums } from './actions';
import { IIndexViewStateContext } from './contexts';

export function indexViewReducer(
  incomingState: IIndexViewStateContext,
  action: ReduxActions.Action<IIndexViewStateContext>
): IIndexViewStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case IndexViewActionEnums.ToggleIsSelectingColumns:
    case IndexViewActionEnums.ToggleIsFiltering:
      /* NEW_ACTION_ENUM_GOES_HERE */
      return {
        ...state,
        ...payload,
      };

    default:
      return state;
  }
}
