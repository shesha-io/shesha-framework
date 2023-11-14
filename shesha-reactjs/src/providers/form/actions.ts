import { createAction } from 'redux-actions';
import { IFormValidationErrors } from '../../interfaces';
import {
  IRegisterActionsPayload,
  ISetEnabledComponentsPayload,
  ISetFormControlsDataPayload,
  ISetFormDataPayload,
  ISetVisibleComponentsPayload,
} from './contexts';
import { FormMode, IFlatComponentsStructure, IFormDesignerActionFlag, IFormSettings } from './models';
import { ReactNode } from 'react';

export enum FormActionEnums {
  SetFlatComponentsAction = 'SET_FLAT_COMPONENTS',
  SetSettingsAction = 'SET_SETTINGS',
  SetFormMode = 'SET_FORM_MODE',
  SetVisibleComponents = 'SET_VISIBLE_COMPONENTS',
  SetEnabledComponents = 'SET_ENABLED_COMPONENTS',
  SetFormControlsData = 'SET_FORM_CONTROLS_DATA',
  SetFormData = 'SET_FORM_DATA',
  SetValidationErrors = 'SET_VALIDATION_ERRORS',
  RegisterActions = 'REGISTER_ACTIONS',
  SetActionFlag = 'SET_ACTION_FLAG',
  SetToolbarRightButton = 'SET_TOOLBAR_RIGHT_BUTTON',
}

export const setFlatComponentsAction = createAction<IFlatComponentsStructure, IFlatComponentsStructure>(
  FormActionEnums.SetFlatComponentsAction,
  (p) => p
);

export const setSettingsAction = createAction<IFormSettings, IFormSettings>(
  FormActionEnums.SetSettingsAction,
  (p) => p
);

export const setFormModeAction = createAction<FormMode, FormMode>(FormActionEnums.SetFormMode, (p) => p);

export const setVisibleComponentsAction = createAction<ISetVisibleComponentsPayload, ISetVisibleComponentsPayload>(
  FormActionEnums.SetVisibleComponents,
  (p) => p
);

export const setEnabledComponentsAction = createAction<ISetEnabledComponentsPayload, ISetEnabledComponentsPayload>(
  FormActionEnums.SetEnabledComponents,
  (p) => p
);

export const setFormControlsDataAction = createAction<ISetFormControlsDataPayload, ISetFormControlsDataPayload>(
  FormActionEnums.SetFormControlsData,
  (p) => p
);

export const setFormDataAction = createAction<ISetFormDataPayload, ISetFormDataPayload>(
  FormActionEnums.SetFormData,
  (p) => p
);

export const setValidationErrorsAction = createAction<IFormValidationErrors, IFormValidationErrors>(
  FormActionEnums.SetValidationErrors,
  (p) => p
);

export const registerComponentActionsAction = createAction<IRegisterActionsPayload, IRegisterActionsPayload>(
  FormActionEnums.RegisterActions,
  (p) => p
);

export const setActionFlagAction = createAction<IFormDesignerActionFlag, IFormDesignerActionFlag>(
  FormActionEnums.SetActionFlag,
  (p) => p
);

export const setToolbarRightButtonAction = createAction<ReactNode, ReactNode>(
  FormActionEnums.SetToolbarRightButton,
  (p) => p
);
