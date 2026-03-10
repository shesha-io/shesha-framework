import { StackedNavigationActionEnums } from './actions';
import { IStackedNavigationStateContext } from './contexts';

export function stakedNavigationReducer(
  state: IStackedNavigationStateContext,
  action: ReduxActions.Action<IStackedNavigationStateContext>,
): IStackedNavigationStateContext {
  const { type, payload } = action;
  //#endregion

  switch (type) {
    case StackedNavigationActionEnums.SetCurrentNavigator:
      return {
        ...state,
        ...payload,
      };

    default: {
      return state;
    }
  }
}
