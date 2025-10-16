import { handleActions } from 'redux-actions';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { CrudActionEnums, ISwitchModeActionPayload } from './actions';
import { CRUD_CONTEXT_INITIAL_STATE, ICrudStateContext } from './contexts';

const reducer = handleActions<ICrudStateContext, any>(
  {
    [CrudActionEnums.SwitchMode]: (state: ICrudStateContext, action: ReduxActions.Action<ISwitchModeActionPayload>) => {
      const { payload } = action;

      return {
        ...state,
        mode: payload.mode,
        allowChangeMode: payload.allowChangeMode,
      };
    },

    [CrudActionEnums.SetInitialValuesLoading]: (state: ICrudStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        initialValuesLoading: payload,
      };
    },

    [CrudActionEnums.SetInitialValues]: (state: ICrudStateContext, action: ReduxActions.Action<object>) => {
      const { payload } = action;

      return {
        ...state,
        initialValuesLoading: false,
        initialValues: payload,
      };
    },

    [CrudActionEnums.SetAllowEdit]: (state: ICrudStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        allowEdit: payload,
      };
    },

    [CrudActionEnums.SetAutoSave]: (state: ICrudStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        autoSave: payload,
      };
    },

    [CrudActionEnums.SetAllowDelete]: (state: ICrudStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        allowDelete: payload,
      };
    },

    [CrudActionEnums.ResetErrors]: (state: ICrudStateContext) => {
      return {
        ...state,
        saveError: null,
        deletingError: null,
      };
    },

    [CrudActionEnums.SaveStarted]: (state: ICrudStateContext) => {
      return {
        ...state,
        isSaving: true,
        saveError: null,
      };
    },

    [CrudActionEnums.SaveFailed]: (state: ICrudStateContext, action: ReduxActions.Action<IErrorInfo>) => {
      const { payload } = action;

      return {
        ...state,
        saveError: payload,
        isSaving: false,
      };
    },

    [CrudActionEnums.SaveSuccess]: (state: ICrudStateContext) => {
      return {
        ...state,
        isSaving: false,
        saveError: null,
      };
    },

    [CrudActionEnums.DeleteStarted]: (state: ICrudStateContext) => {
      return {
        ...state,
        isDeleting: true,
        deletingError: null,
      };
    },

    [CrudActionEnums.DeleteFailed]: (state: ICrudStateContext, action: ReduxActions.Action<IErrorInfo>) => {
      const { payload } = action;

      return {
        ...state,
        deletingError: payload,
        isDeleting: false,
      };
    },

    [CrudActionEnums.DeleteSuccess]: (state: ICrudStateContext) => {
      return {
        ...state,
        isDeleting: false,
        deletingError: null,
      };
    },
  },

  CRUD_CONTEXT_INITIAL_STATE,
);

export default reducer;
