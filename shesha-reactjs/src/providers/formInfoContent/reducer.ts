import { handleActions } from 'redux-actions';
import { FormInfoContentStateActionEnums } from './actions';
import { FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE, IFormInfoContentStateStateContext } from './contexts';
import { IFormDesignerActionFlag } from './models';

const reducer = handleActions<IFormInfoContentStateStateContext, any>(
  {
    [FormInfoContentStateActionEnums.SetActionFlag]: (
      state: IFormInfoContentStateStateContext,
      action: ReduxActions.Action<IFormDesignerActionFlag>
    ) => {
      const { payload } = action;

      if (!payload) return { ...state, actionFlag: {} };

      return {
        ...state,
        actionFlag: { ...state.actionFlag, ...{ [payload]: true } },
      };
    },

    [FormInfoContentStateActionEnums.SetToolbarRightButton]: (
      state: IFormInfoContentStateStateContext,
      action: ReduxActions.Action<IFormDesignerActionFlag>
    ) => {
      const { payload } = action;

      if (!payload) return { ...state, renderToolbarRightButtons: [] };

      return {
        ...state,
        renderToolbarRightButtons: [...(state.renderToolbarRightButtons || []), payload],
      };
    },
  },
  FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE
);

export default reducer;
