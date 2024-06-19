import { FormInstance } from 'antd';
import { IFormValidationErrors, IToolboxComponent, IToolboxComponentGroup } from '@/interfaces';
import {
  DEFAULT_FORM_SETTINGS,
  FormAction,
  FormMode,
  FormSection,
  IConfigurableFormComponent,
  IFormAction,
  IFormActions,
  IFormSection,
  IFormSettings,
} from './models';
import { createNamedContext } from '@/utils/react';

export interface IHasComponentGroups {
  toolboxComponentGroups: IToolboxComponentGroup[];
}

export interface IFormStateInternalContext {
  name?: string;
  formSettings: IFormSettings;
  formMode: FormMode;
  form?: FormInstance<any>;
  actions: IFormAction[];
  sections: IFormSection[];

  // runtime props
  formData?: any;
  validationErrors?: IFormValidationErrors;
}

export interface IFormStateContext extends IFormStateInternalContext {
  
}

export interface ISetFormDataPayload {
  /** form field values */
  values: any;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface IRegisterActionsPayload {
  id: string /** component id */;
  actions: IFormActions /** component actions */;
}

export interface IFormActionsContext {
  setFormMode: (formMode: FormMode) => void;
  updateStateFormData: (payload: ISetFormDataPayload) => void;
  setFormData: (payload: ISetFormDataPayload) => void;
  setValidationErrors: (payload: IFormValidationErrors) => void;
  registerActions: (id: string, actions: IFormActions) => void;
  /**
   * Get closest form action by name
   *
   * @param id: id of the current component
   * @param name: name of the action
   */
  getAction: (id: string, name: string) => FormAction;
  getSection: (id: string, name: string) => FormSection;

  getToolboxComponent: (type: string) => IToolboxComponent;

  isComponentFiltered: (component: IConfigurableFormComponent) => boolean;
  prepareDataForSubmit: () => Promise<object>;
  executeExpression: <TResult = any>(expression: string, exposedData?: any) => Promise<TResult>;
}

/** Form initial state */
export const FORM_CONTEXT_INITIAL_STATE: IFormStateContext = {
  formMode: 'designer',
  actions: [],
  sections: [],
  formSettings: DEFAULT_FORM_SETTINGS,
};

export interface FieldData {
  name: string | number | (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

export interface IFormDataStateContext {
  fields: FieldData[];
}

export interface IFormDataActionsContext {
  setFields: (fields: FieldData[]) => void;
}

export const FormDataStateContext = createNamedContext<IFormDataStateContext>(undefined, "FormDataStateContext");
export const FormDataActionsContext = createNamedContext<IFormDataActionsContext>(undefined, "FormDataActionsContext");

export interface ConfigurableFormInstance extends IFormActionsContext, IFormStateContext { }

export const FormStateContext = createNamedContext<IFormStateContext>(FORM_CONTEXT_INITIAL_STATE, "FormStateContext");

export const FormActionsContext = createNamedContext<IFormActionsContext>(undefined, "FormActionsContext");
