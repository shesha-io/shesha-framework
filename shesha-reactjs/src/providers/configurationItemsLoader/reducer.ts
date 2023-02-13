import {
  CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE,
  IConfigurationItemsLoaderStateContext,
} from './contexts';
import { ConfigurationItemsLoaderActionEnums } from './actions';
import { handleActions } from 'redux-actions';

const reducer = handleActions<IConfigurationItemsLoaderStateContext, any>(
  {
    [ConfigurationItemsLoaderActionEnums.ActivateProvider]: (state: IConfigurationItemsLoaderStateContext, action: ReduxActions.Action<string>) => {
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
