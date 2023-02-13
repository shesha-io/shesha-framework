import {
  FORM_CONTEXT_INITIAL_STATE,
  IFormStateContext,
  ISetVisibleComponentsPayload,
  ISetFormDataPayload,
  IRegisterActionsPayload,
  ISetEnabledComponentsPayload,
} from './contexts';
import {
  FormMode,
  IFlatComponentsStructure,
  IFormSettings,
} from './models';
import { FormActionEnums } from './actions';
import { handleActions } from 'redux-actions';
import {
  convertActions,
  filterFormData,
} from './utils';
import { IFormValidationErrors } from '../../interfaces';

const reducer = handleActions<IFormStateContext, any>(
  {
    [FormActionEnums.SetFlatComponentsAction]: (state: IFormStateContext, action: ReduxActions.Action<IFlatComponentsStructure>) => {
      const { payload } = action;
      
      //console.log('LOG: SetFlatComponentsAction', payload);

      return {
        ...state,
        allComponents: payload.allComponents,
        componentRelations: payload.componentRelations,
      };
    },

    [FormActionEnums.SetSettingsAction]: (state: IFormStateContext, action: ReduxActions.Action<IFormSettings>) => {
      const { payload } = action;
      
      return {
        ...state,
        formSettings: payload,
      };
    },    

    [FormActionEnums.SetFormMode]: (state: IFormStateContext, action: ReduxActions.Action<FormMode>) => {
      const { payload } = action;

      return {
        ...state,
        formMode: payload,
      };
    },

    [FormActionEnums.SetVisibleComponents]: (
      state: IFormStateContext,
      action: ReduxActions.Action<ISetVisibleComponentsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        visibleComponentIds: payload.componentIds,
      };
    },

    [FormActionEnums.SetEnabledComponents]: (
      state: IFormStateContext,
      action: ReduxActions.Action<ISetEnabledComponentsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        enabledComponentIds: payload.componentIds,
      };
    },

    [FormActionEnums.SetFormData]: (state: IFormStateContext, action: ReduxActions.Action<ISetFormDataPayload>) => {
      const { payload } = action;

      // note: merge is used to keep initial values of fields which have no corresponding components on the form (e.g. id, parentId)
      const newData = payload.mergeValues && state.formData ? { ...state.formData, ...payload.values } : payload.values;

      return {
        ...state,
        formData: filterFormData(newData),
      };
    },

    [FormActionEnums.SetValidationErrors]: (
      state: IFormStateContext,
      action: ReduxActions.Action<IFormValidationErrors>
    ) => {
      const { payload } = action;

      return {
        ...state,
        validationErrors: payload ? { ...payload } : null,
      };
    },

    [FormActionEnums.RegisterActions]: (
      state: IFormStateContext,
      action: ReduxActions.Action<IRegisterActionsPayload>
    ) => {
      const {
        payload: { id, actions: actionsToRegister },
      } = action;

      const componentActions = convertActions(id, actionsToRegister);
      const otherActions = state.actions.filter(a => a.owner !== id || !componentActions.find(ca => ca.name == a.name));

      return {
        ...state,
        actions: [...otherActions, ...componentActions],
      };
    },
  },

  FORM_CONTEXT_INITIAL_STATE
);

export default reducer;
