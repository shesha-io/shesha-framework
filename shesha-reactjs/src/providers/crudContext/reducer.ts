import {
    CRUD_CONTEXT_INITIAL_STATE,
    ICrudStateContext,
  } from './contexts';
  import { handleActions } from 'redux-actions';
  import { CrudActionEnums } from './actions';
import { CrudMode } from './models';
import { IErrorInfo } from 'interfaces/errorInfo';
  
  const reducer = handleActions<ICrudStateContext, any>(
    {
      [CrudActionEnums.SwitchMode]: (state: ICrudStateContext, action: ReduxActions.Action<CrudMode>) => {
        const { payload } = action;
        
        return {
          ...state,
          mode: payload,
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

      [CrudActionEnums.SetAllowDelete]: (state: ICrudStateContext, action: ReduxActions.Action<boolean>) => {
        const { payload } = action;
        
        return {
          ...state,
          allowDelete: payload,
        };
      },

      [CrudActionEnums.SetLastError]: (state: ICrudStateContext, action: ReduxActions.Action<IErrorInfo>) => {
        const { payload } = action;
        
        return {
          ...state,
          lastError: payload,
        };
      },
    },

    CRUD_CONTEXT_INITIAL_STATE
  );
  
  export default reducer;
  