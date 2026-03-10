import { handleActions } from 'redux-actions';
import { QueryBuilderActionEnums } from './actions';
import { IQueryBuilderStateContext, QUERY_BUILDER_CONTEXT_INITIAL_STATE } from './contexts';
import { IProperty } from './models';

export default handleActions<IQueryBuilderStateContext, any>(
  {
    [QueryBuilderActionEnums.SetFields]: (
      state: IQueryBuilderStateContext,
      action: ReduxActions.Action<IProperty[]>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        fields: [...payload],
      };
    },
  },

  QUERY_BUILDER_CONTEXT_INITIAL_STATE,
);
