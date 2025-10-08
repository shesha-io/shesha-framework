import { FormInstance } from 'antd';
import { IModelMetadata, IToolboxComponentGroup } from '@/interfaces';
import {
  DEFAULT_FORM_SETTINGS,
  FormMode,
  IConfigurableFormComponent,
  IFormSettings,
} from './models';
import { createNamedContext } from '@/utils/react';
import { IShaFormInstance } from './store/interfaces';

export interface IHasComponentGroups {
  toolboxComponentGroups: IToolboxComponentGroup[];
}

export interface IFormStateInternalContext {
  name?: string;
  formSettings: IFormSettings;
  formMode: FormMode;
  form?: FormInstance<any>;

  // runtime props
  initialValues?: any;
  formData?: any;

  // TODO: review and remove
  modelMetadata?: IModelMetadata;
  shaForm?: IShaFormInstance;
}

export type IFormStateContext = IFormStateInternalContext;

export interface ISetFormDataPayload {
  /** form field values */
  values: any;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface IFormActionsContext {
  setFormMode: (formMode: FormMode) => void;
  setFormData: (payload: ISetFormDataPayload) => void;

  isComponentFiltered: (component: IConfigurableFormComponent) => boolean;
}

/** Form initial state */
export const FORM_CONTEXT_INITIAL_STATE: IFormStateContext = {
  formMode: 'designer',
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
