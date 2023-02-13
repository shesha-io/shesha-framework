import { QUERY_BUILDER_CONTEXT_INITIAL_STATE, IQueryBuilderStateContext } from './contexts';
import { IProperty } from './models';
import { QueryBuilderActionEnums } from './actions';
import { handleActions } from 'redux-actions';

export default handleActions<IQueryBuilderStateContext, any>(
  {
    [QueryBuilderActionEnums.SetFields]: (
      state: IQueryBuilderStateContext,
      action: ReduxActions.Action<IProperty[]>
    ) => {
      const { payload } = action;

      return {
        ...state,
        fields: [...payload],
      };
    },
  },

  QUERY_BUILDER_CONTEXT_INITIAL_STATE
);
