import { handleActions } from 'redux-actions';
import { IReferenceListDispatcherStateContext, REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE } from './contexts';

const reducer = handleActions<IReferenceListDispatcherStateContext, any>(
  {
    /*
    [ReferenceListDispatcherActionEnums.ActivateProvider]: (state: IReferenceListDispatcherStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        activeProvider: payload,
      };
    },
    */
  },

  REFERENCELIST_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
