import { ISubFormStateContext } from './contexts';
import { SubFormActionEnums } from './actions';

export function uiReducer(
  state: ISubFormStateContext,
  action: ReduxActions.Action<ISubFormStateContext>
): ISubFormStateContext {
  //#region Register flags reducer

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case SubFormActionEnums.SetMarkupWithSettings:
      const { components, formSettings, versionNo, versionStatus, description, hasFetchedConfig, id, module } =
        payload || {};

      return {
        ...state,
        id,
        module,
        hasFetchedConfig,
        components,
        formSettings,
        versionNo,
        versionStatus,
        description,
      };

    default: {
      return state;
    }
  }
}
