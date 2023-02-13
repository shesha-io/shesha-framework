import {
  METADATA_DISPATCHER_CONTEXT_INITIAL_STATE,
  IMetadataDispatcherStateContext,
} from './contexts';
import { MetadataDispatcherActionEnums } from './actions';
import { handleActions } from 'redux-actions';

const reducer = handleActions<IMetadataDispatcherStateContext, any>(
  {
    [MetadataDispatcherActionEnums.ActivateProvider]: (state: IMetadataDispatcherStateContext, action: ReduxActions.Action<string>) => {
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
