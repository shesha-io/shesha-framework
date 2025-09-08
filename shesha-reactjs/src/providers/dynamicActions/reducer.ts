import {
  DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
  IDynamicActionsStateContext,
  ITestActionPayload,
} from './contexts';
import { handleActions } from 'redux-actions';
import { DynamicActionsActionEnums } from './actions';

const reducer = handleActions<IDynamicActionsStateContext, any>(
  {
    [DynamicActionsActionEnums.TestAction]: (state: IDynamicActionsStateContext, action: ReduxActions.Action<ITestActionPayload>) => {
      const { payload } = action;

      return {
        ...state,
        ...payload,
      };
    },
  },

  DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE
);

export default reducer;
