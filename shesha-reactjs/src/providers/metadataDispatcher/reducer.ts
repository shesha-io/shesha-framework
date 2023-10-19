import { handleActions } from 'redux-actions';
import { MetadataDispatcherActionEnums } from './actions';
import { IMetadataDispatcherStateContext, METADATA_DISPATCHER_CONTEXT_INITIAL_STATE } from './contexts';

const reducer = handleActions<IMetadataDispatcherStateContext, any>(
  {
    [MetadataDispatcherActionEnums.ActivateProvider]: (
      state: IMetadataDispatcherStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        activeProvider: payload,
      };
    },
  },

  METADATA_DISPATCHER_CONTEXT_INITIAL_STATE
);

export default reducer;
