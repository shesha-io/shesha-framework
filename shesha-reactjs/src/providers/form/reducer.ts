import { handleActions } from 'redux-actions';
import { IFormValidationErrors } from '@/interfaces';
import { FormActionEnums } from './actions';
import {
  FORM_CONTEXT_INITIAL_STATE,
  IFormStateInternalContext,
  IRegisterActionsPayload,
  ISetEnabledComponentsPayload,
  ISetFormControlsDataPayload,
  ISetFormDataPayload,
  ISetVisibleComponentsPayload,
} from './contexts';
import { FormMode, IFormSettings } from './models';
import { convertActions, filterFormData } from './utils';

const reducer = handleActions<IFormStateInternalContext, any>(
  {
    [FormActionEnums.SetSettingsAction]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<IFormSettings>
    ) => {
      const { payload } = action;

      return {
        ...state,
        formSettings: payload,
      };
    },
 
    [FormActionEnums.SetFormMode]: (state: IFormStateInternalContext, action: ReduxActions.Action<FormMode>) => {
      const { payload } = action;

      return {
        ...state,
        formMode: payload,
      };
    },
    [FormActionEnums.SetVisibleComponents]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<ISetVisibleComponentsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        visibleComponentIds: payload.componentIds,
        visibleComponentIdsIsSet: true,
      };
    },

    [FormActionEnums.SetEnabledComponents]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<ISetEnabledComponentsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        enabledComponentIds: payload.componentIds,
      };
    },

    [FormActionEnums.SetFormControlsData]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<ISetFormControlsDataPayload>
    ) => {
      return { ...state, formControlsData: { ...state.formControlsData, ...action.payload?.values } };
    },

    [FormActionEnums.SetFormData]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<ISetFormDataPayload>
    ) => {
      const { payload } = action;

      // note: merge is used to keep initial values of fields which have no corresponding components on the form (e.g. id, parentId)
      const newData = payload.mergeValues && state.formData ? { ...state.formData, ...payload.values } : payload.values;

      return {
        ...state,
        formData: filterFormData(newData),
      };
    },

    [FormActionEnums.SetValidationErrors]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<IFormValidationErrors>
    ) => {
      const { payload } = action;

      return {
        ...state,
        validationErrors: payload ? { ...payload } : null,
      };
    },

    [FormActionEnums.RegisterActions]: (
      state: IFormStateInternalContext,
      action: ReduxActions.Action<IRegisterActionsPayload>
    ) => {
      const {
        payload: { id, actions: actionsToRegister },
      } = action;

      const componentActions = convertActions(id, actionsToRegister);
      const otherActions = state.actions.filter(
        (a) => a.owner !== id || !componentActions.find((ca) => ca.name === a.name)
      );

      return {
        ...state,
        actions: [...otherActions, ...componentActions],
      };
    },
  },

  FORM_CONTEXT_INITIAL_STATE
);

export default reducer;
