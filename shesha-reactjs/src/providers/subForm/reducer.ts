import { IFetchDataErrorPayload, ISubFormStateContext } from './contexts';
import { SubFormActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import { SUB_FORM_CONTEXT_INITIAL_STATE } from './contexts';

export const subFormReducer = handleActions<ISubFormStateContext, any>(
  {
    [SubFormActionEnums.SetMarkupWithSettings]: (state: ISubFormStateContext, action: ReduxActions.Action<ISubFormStateContext>) => {
      const { payload } = action;
      const { 
        components, 
        formSettings, 
        versionNo, 
        versionStatus, 
        description, 
        hasFetchedConfig, 
        id, 
        module,
        name,
        allComponents,
        componentRelations,
      } = payload || {};

      return {
        ...state,
        id,
        module,
        name,
        hasFetchedConfig,
        components,
        formSettings,
        versionNo,
        versionStatus,
        description,
        allComponents,
        componentRelations,
      };

    },

    [SubFormActionEnums.FetchDataRequest]: (state: ISubFormStateContext) => {
      const { errors, loading } = state;
      return {
        ...state, 
        errors: { ...errors, getData: null },
        loading: { ...loading, getData: true },
      };
    },

    [SubFormActionEnums.FetchDataSuccess]: (state: ISubFormStateContext) => {
      const { errors, loading } = state;
      return {
        ...state, 
        errors: { ...errors, getData: null },
        loading: { ...loading, getData: false },
      };
    },

    [SubFormActionEnums.FetchDataError]: (state: ISubFormStateContext, action: ReduxActions.Action<IFetchDataErrorPayload>) => {
      const { errors, loading } = state;
      const { payload } = action;
      return {
        ...state, 
        errors: { ...errors, getData: payload.error },
        loading: { ...loading, getData: false },
      };
    },
  },
  SUB_FORM_CONTEXT_INITIAL_STATE
);