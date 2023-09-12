import { ThemeActionEnums } from './actions';
import { IThemeStateContext } from './contexts';

export function uiReducer(
  state: IThemeStateContext,
  action: ReduxActions.Action<IThemeStateContext>
): IThemeStateContext {
  //#region Register flags reducer

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case ThemeActionEnums.SetTheme:
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
