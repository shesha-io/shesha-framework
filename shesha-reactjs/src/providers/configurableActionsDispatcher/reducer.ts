import { handleActions } from 'redux-actions';
import {
  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE,
  IConfigurableActionDispatcherStateContext,
} from './contexts';
import { ConfigurableComponentActionEnums } from './actions';
import { IActiveButton } from '@/interfaces/configurableAction';

const reducer = handleActions<IConfigurableActionDispatcherStateContext, any>(
  {

    [ConfigurableComponentActionEnums.registerActiveButton]: (state: IConfigurableActionDispatcherStateContext, action: ReduxActions.Action<IActiveButton>) => {
      const { payload } = action;

      let loadingStack: IActiveButton[] = [];

      if (payload?.activeButtonActionName.includes('Show')) {

        loadingStack = [...state.activeButton, payload];

      } else {

        loadingStack = [payload, ...state.activeButton];
      }

      return {
        ...state,
        activeButton: loadingStack,
      };
    },
    [ConfigurableComponentActionEnums.unRegisterActiveButton]: (state: IConfigurableActionDispatcherStateContext, action: ReduxActions.Action<IActiveButton>) => {
      const { payload } = action;

      if (payload?.activeButtonActionName == 'Close Dialog') {

        const loadingStack = state.activeButton.slice(0, -1);

        return {
          ...state,
          activeButton: loadingStack
        };
      }

      return {
        ...state,
        activeButton: state.activeButton.filter((b) => b?.activeButtonId !== payload?.activeButtonId),
      };
    }

  },

  CONFIGURABLE_ACTION_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
