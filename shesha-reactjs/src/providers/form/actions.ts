import { createAction } from 'redux-actions';
import { IFormValidationErrors } from '@/interfaces';
import {
  IRegisterActionsPayload,
  ISetFormDataPayload,
} from './contexts';
import { FormMode, IFlatComponentsStructure } from './models';

export enum FormActionEnums {
  SetFlatComponentsAction = 'SET_FLAT_COMPONENTS',
  SetFormMode = 'SET_FORM_MODE',
  SetFormData = 'SET_FORM_DATA',
  SetInitialValues = 'SET_INITIAL_VALUES',
  SetValidationErrors = 'SET_VALIDATION_ERRORS',
  RegisterActions = 'REGISTER_ACTIONS',
}

export const setFlatComponentsAction = createAction<IFlatComponentsStructure, IFlatComponentsStructure>(
  FormActionEnums.SetFlatComponentsAction,
  (p) => p
);

export const setFormModeAction = createAction<FormMode, FormMode>(FormActionEnums.SetFormMode, (p) => p);

export const setFormDataAction = createAction<ISetFormDataPayload, ISetFormDataPayload>(
  FormActionEnums.SetFormData,
  (p) => p
);

export const setInitialValuesAction = createAction<any, any>(FormActionEnums.SetInitialValues, (p) => p);

export const setValidationErrorsAction = createAction<IFormValidationErrors, IFormValidationErrors>(
  FormActionEnums.SetValidationErrors,
  (p) => p
);

export const registerComponentActionsAction = createAction<IRegisterActionsPayload, IRegisterActionsPayload>(
  FormActionEnums.RegisterActions,
  (p) => p
);
