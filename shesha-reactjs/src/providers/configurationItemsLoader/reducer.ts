import { handleActions } from 'redux-actions';
import { ConfigurationItemsLoaderActionEnums } from './actions';
import { CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE, IConfigurationItemsLoaderStateContext } from './contexts';

const reducer = handleActions<IConfigurationItemsLoaderStateContext, any>(
  {
    [ConfigurationItemsLoaderActionEnums.ActivateProvider]: (
      state: IConfigurationItemsLoaderStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        activeProvider: payload,
      };
    },
  },

  CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE
);

export default reducer;
