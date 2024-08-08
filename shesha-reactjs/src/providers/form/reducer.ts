import { handleActions } from 'redux-actions';
import { IFormValidationErrors } from '@/interfaces';
import { FormActionEnums } from './actions';
import {
  FORM_CONTEXT_INITIAL_STATE,
  IFormStateInternalContext,
  IRegisterActionsPayload,
  ISetFormDataPayload,
} from './contexts';
import { FormMode } from './models';
import { convertActions, filterFormData } from './utils';

const reducer = handleActions<IFormStateInternalContext, any>(
  {
    [FormActionEnums.SetFormMode]: (state: IFormStateInternalContext, action: ReduxActions.Action<FormMode>) => {
      const { payload } = action;

      return {
        ...state,
        formMode: payload,
      };
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

    [FormActionEnums.SetInitialValues]: (state: IFormStateInternalContext, action: ReduxActions.Action<any>) => {
      return {...state, initialValues: action.payload};
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